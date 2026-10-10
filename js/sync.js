/**
 * RCCI 智財與技術成果專區 - Google Sheet 同步引擎
 * Research Center for Critical Issues | Academia Sinica
 */

class GoogleSheetSync {
  constructor(config = APP_CONFIG) {
    this.config = config;
    this.status = 'idle'; // idle | syncing | synced | fallback | error
    this.lastSyncTime = null;
    this.onStatusChange = null;
    this.onDataUpdated = null;
  }

  // 取得 CSV 下載網址
  getCsvUrl(gid) {
    return 'https://docs.google.com/spreadsheets/d/' + this.config.spreadsheetId + '/export?format=csv&gid=' + gid + '&_t=' + Date.now();
  }

  // 標準 CSV 解析器（支援引號逗號、多行換行、雙引號跳脫）
  parseCsv(text) {
    if (!text || typeof text !== 'string') return [];
    
    // 移除 UTF-8 BOM
    if (text.charCodeAt(0) === 0xFEFF) {
      text = text.slice(1);
    }

    const rows = [];
    let currentRow = [];
    let currentCell = '';
    let insideQuotes = false;
    let i = 0;
    const len = text.length;

    while (i < len) {
      const char = text[i];
      const nextChar = i + 1 < len ? text[i + 1] : '';

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentCell += '"';
          i += 2;
          continue;
        } else {
          insideQuotes = !insideQuotes;
          i++;
          continue;
        }
      }

      if (char === ',' && !insideQuotes) {
        currentRow.push(currentCell.trim());
        currentCell = '';
        i++;
        continue;
      }

      if ((char === '\r' || char === '\n') && !insideQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++; // 跳過 \r\n 的 \r
        }
        currentRow.push(currentCell.trim());
        // 忽略空行
        if (currentRow.some(val => val.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
        i++;
        continue;
      }

      currentCell += char;
      i++;
    }

    if (currentCell.length > 0 || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      if (currentRow.some(val => val.length > 0)) {
        rows.push(currentRow);
      }
    }

    if (rows.length < 2) return [];

    const headers = rows[0].map(h => h.trim());
    const dataObjects = [];

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] !== undefined ? row[index].trim() : '';
      });
      dataObjects.push(obj);
    }

    return dataObjects;
  }

  // 嘗試從網路非同步同步 Google 試算表
  async sync() {
    this.updateStatus('syncing', '正在連線 Google 試算表同步資料...');
    try {
      const fetchWithTimeout = (url, timeoutMs = 8000) => {
        return Promise.race([
          fetch(url, { cache: 'no-cache' }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('連線逾時')), timeoutMs))
        ]);
      };

      // 同時取得「各國申請案件」與「專利家族」兩個分頁
      const [appsResp, famsResp] = await Promise.all([
        fetchWithTimeout(this.getCsvUrl(this.config.gidApplications)),
        fetchWithTimeout(this.getCsvUrl(this.config.gidFamilies))
      ]);

      if (!appsResp.ok) throw new Error('各國申請案件讀取失敗 (HTTP ' + appsResp.status + ')');
      if (!famsResp.ok) throw new Error('專利家族讀取失敗 (HTTP ' + famsResp.status + ')');

      const appsCsvText = await appsResp.text();
      const famsCsvText = await famsResp.text();

      const appsData = this.parseCsv(appsCsvText);
      const famsData = this.parseCsv(famsCsvText);

      if (!appsData || appsData.length === 0) {
        throw new Error('試算表解析無有效資料行');
      }

      const mergedData = this.processAndMergeData(appsData, famsData);
      
      // 成功同步，儲存至本地快顯
      this.lastSyncTime = new Date();
      this.saveToStorage(mergedData, this.lastSyncTime);
      this.updateStatus('synced', `已連線同步至 Google Sheet (${this.formatTime(this.lastSyncTime)})`);
      
      if (typeof this.onDataUpdated === 'function') {
        this.onDataUpdated(mergedData, true);
      }

      return mergedData;
    } catch (err) {
      console.warn('Google Sheet 即時同步遭遇阻礙，載入快取/預設快照資料:', err.message);
      
      const cached = this.loadFromStorage();
      if (cached) {
        this.updateStatus('fallback', `使用本地快顯資料 (最後更新: ${this.formatTime(new Date(cached.syncTime))})`);
        if (typeof this.onDataUpdated === 'function') {
          this.onDataUpdated(cached.data, false);
        }
        return cached.data;
      }

      // 若無快顯，使用內建 snapshot
      const snapshotMerged = this.processAndMergeData(SNAPSHOT_APPLICATIONS, SNAPSHOT_FAMILIES);
      this.updateStatus('fallback', '目前顯示內建快照展示資料（點擊可重試連線）');
      if (typeof this.onDataUpdated === 'function') {
        this.onDataUpdated(snapshotMerged, false);
      }
      return snapshotMerged;
    }
  }

  // 整理與聚合各國申請案件與專利家族
  processAndMergeData(rawApplications, rawFamilies) {
    // 建立家族對照表 (Key: 家族編號 或 院內案件編號)
    const familiesMap = new Map();
    (rawFamilies || []).forEach(f => {
      const famId = (f['家族編號'] || '').trim();
      const caseId = (f['院內案件編號'] || '').trim();
      if (famId) familiesMap.set(famId, f);
      if (caseId) familiesMap.set(caseId, f);
    });

    // 依家族或院內核心覽號聚合各國申請案件
    // 目標：每筆研發成果（對應 PDF 卡片）聚合該項成果下各國的所有申請案件（US, TW, CN, PCT...）
    const outcomeMap = new Map();

    (rawApplications || []).forEach(app => {
      const familyId = (app['家族編號'] || '').trim();
      const caseId = (app['院內案件編號'] || '').trim();
      const cleanCaseId = caseId.replace(/[a-zA-Z]+$/, ''); // 去除如 34A-1131114b 後綴
      const groupKey = familyId || cleanCaseId || caseId;

      if (!groupKey) return;

      if (!outcomeMap.has(groupKey)) {
        // 查找是否有家族紀錄
        const famMeta = familiesMap.get(familyId) || familiesMap.get(caseId) || familiesMap.get(cleanCaseId) || {};
        
        // 查找是否有預設的詳細摘要（優先比對 cleanCaseId 或 caseId 或 familyId）
        const preset = PRESET_ABSTRACTS[caseId] || PRESET_ABSTRACTS[cleanCaseId] || PRESET_ABSTRACTS[familyId] || {};

        const domain = (preset.category || famMeta['單位'] || app['單位'] || '其他領域').trim();
        const mainTitle = (preset.title || famMeta['院內技術名稱'] || app['專利名稱'] || '').trim();
        const mainCaseId = preset.mainCaseId || famMeta['院內案件編號'] || cleanCaseId || caseId;
        const inventors = (preset.inventors || famMeta['發明人'] || '').trim();
        const project = (famMeta['相關計畫'] || '').trim();
        const publishDate = preset.publishDate || app['領證／公告日'] || app['公開日'] || app['申請日'] || '';
        const abstract = preset.abstract || app['備註'] || famMeta['備註'] || '本項關鍵研發技術已進入智慧財產布局程序，具備高度產業應用潛力與技術創新性。詳細技術細節與授權合作方案，請逕洽中央研究院關鍵議題研究中心智財技轉專責窗口。';
        const techUrl = preset.techUrl || app['電子檔連結'] || famMeta['文件連結'] || (mainCaseId && mainCaseId !== '?' ? ('https://ticket.apps.sinica.edu.tw/tech/' + mainCaseId) : 'https://ticket.apps.sinica.edu.tw/');

        outcomeMap.set(groupKey, {
          id: groupKey,
          familyId: familyId,
          caseId: mainCaseId,
          domain: domain,
          title: mainTitle,
          inventors: inventors,
          project: project,
          publishDate: publishDate,
          abstract: abstract,
          techUrl: techUrl,
          licenseStatus: famMeta['授權／合作狀態'] || '可授權合作',
          teamNickname: famMeta['團隊稱呼'] || '',
          applications: []
        });
      }

      // 加入該國申請案明細
      const record = outcomeMap.get(groupKey);
      
      // 補充發明人資訊
      if (!record.inventors && app['發明人']) {
        record.inventors = app['發明人'];
      }

      record.applications.push({
        familyId: app['家族編號'] || '',
        caseId: app['院內案件編號'] || '',
        domain: app['單位'] || record.domain,
        title: app['專利名稱'] || record.title,
        country: (app['國家／地區'] || '').toUpperCase().trim(),
        appType: (app['申請類型'] || '').trim(),
        appDate: (app['申請日'] || '').trim(),
        appNo: (app['申請號'] || '').trim(),
        pubDate: (app['公開日'] || '').trim(),
        pubNo: (app['公開號'] || '').trim(),
        patentNo: (app['專利號'] || '').trim(),
        relation: (app['案件關係'] || '').trim(),
        latestDocDate: (app['最新官方來文日'] || '').trim(),
        nextDeadline: (app['下一期限'] || '').trim(),
        finalDisposition: (app['最終處分'] || '').trim(),
        grantDate: (app['領證／公告日'] || '').trim(),
        remarks: (app['備註'] || '').trim(),
        docLink: (app['電子檔連結'] || '').trim()
      });
    });

    // 彙總各項成果的法律狀態與國家清單
    const outcomes = Array.from(outcomeMap.values()).map(item => {
      // 國家代碼集合
      const countries = [...new Set(item.applications.map(a => a.country).filter(Boolean))];
      
      // 判斷整體法律狀態
      let legalStatus = '專利申請中';
      const hasGranted = item.applications.some(a => Boolean(a.patentNo) || (a.remarks && a.remarks.includes('已獲證')));
      const isReviewing = item.applications.some(a => a.remarks && a.remarks.includes('審閱中'));

      if (hasGranted) {
        legalStatus = countries.length > 1 ? '已獲證（多國）' : '已獲證';
      } else if (isReviewing && item.applications.every(a => !a.appNo)) {
        legalStatus = '智財處審閱中';
      } else if (PRESET_ABSTRACTS[item.caseId]?.legalStatus) {
        legalStatus = PRESET_ABSTRACTS[item.caseId].legalStatus;
      }

      return {
        ...item,
        countries: countries,
        legalStatus: legalStatus,
        totalApplications: item.applications.length
      };
    });

    // 依照 PDF 中的順序與案件編號優雅排序 (PF-001 ~ PF-006 在前)
    outcomes.sort((a, b) => {
      const getNum = str => {
        const match = (str || '').match(/PF-(\d+)/);
        return match ? parseInt(match[1], 10) : 999;
      };
      return getNum(a.familyId) - getNum(b.familyId);
    });

    return {
      outcomes: outcomes,
      allApplications: rawApplications,
      rawFamilies: rawFamilies
    };
  }

  // 儲存至 LocalStorage
  saveToStorage(data, syncTime) {
    try {
      const payload = {
        syncTime: syncTime.toISOString(),
        data: data
      };
      localStorage.setItem(this.config.localCacheKey, JSON.stringify(payload));
      localStorage.setItem(this.config.lastSyncKey, syncTime.toISOString());
    } catch (e) {
      console.warn('LocalStorage 寫入受限:', e);
    }
  }

  // 從 LocalStorage 載入
  loadFromStorage() {
    try {
      const str = localStorage.getItem(this.config.localCacheKey);
      if (!str) return null;
      return JSON.parse(str);
    } catch (e) {
      return null;
    }
  }

  updateStatus(status, message) {
    this.status = status;
    if (typeof this.onStatusChange === 'function') {
      this.onStatusChange(status, message);
    }
  }

  formatTime(date) {
    if (!date) return '';
    const pad = n => String(n).padStart(2, '0');
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const h = pad(date.getHours());
    const min = pad(date.getMinutes());
    const s = pad(date.getSeconds());
    return `${y}/${m}/${d} ${h}:${min}:${s}`;
  }
}
