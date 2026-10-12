/**
 * RCCI 智財與技術成果專區 - Google Apps Script 控制器 & Drive CSV API 端點
 * 中央研究院 關鍵議題研究中心 (Research Center for Critical Issues)
 */

function doGet(e) {
  // 1. 若前端請求讀取 Google Drive 資料夾中的 CSV 檔案
  if (e && e.parameter && e.parameter.action === 'getCsv') {
    return handleGetDriveCsv(e);
  }

  // 2. 預設返回 Web App HTML
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('中央研究院 關鍵議題研究中心 - 智財與技術成果專區')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

/**
 * 讀取指定 Google Drive 資料夾中的 CSV 檔案並以 JSON 回傳 (支援跨域 CORS)
 * 預設資料夾: https://drive.google.com/drive/u/0/folders/1HpQXZPQeb-KTMQWGT3gU8u6ucDyGqM-j
 * 預設檔案: RCCI-IP.csv (或 RCCI-IP)
 */
function handleGetDriveCsv(e) {
  try {
    var folderId = (e && e.parameter && e.parameter.folderId) ? e.parameter.folderId : '1HpQXZPQeb-KTMQWGT3gU8u6ucDyGqM-j';
    var targetName = (e && e.parameter && e.parameter.target) ? e.parameter.target : 'RCCI-IP';
    var folder = DriveApp.getFolderById(folderId);
    var files = folder.getFiles();
    
    // 收集所有 CSV 檔案並依最後修改時間排序（確保抓取最新上傳的版本）
    var fileList = [];
    while (files.hasNext()) {
      var file = files.next();
      var name = file.getName();
      if (name.toLowerCase().endsWith('.csv') || file.getMimeType() === 'text/csv' || file.getMimeType() === 'text/comma-separated-values' || name.indexOf(targetName) !== -1) {
        fileList.push({
          file: file,
          name: name,
          updated: file.getLastUpdated().getTime()
        });
      }
    }
    
    // 依更新時間新到舊排序
    fileList.sort(function(a, b) {
      return b.updated - a.updated;
    });
    
    var appsCsv = '';
    var famsCsv = '';
    var matchedAppsName = '';
    var matchedFamsName = '';
    var allFileNames = [];
    
    for (var i = 0; i < fileList.length; i++) {
      var item = fileList[i];
      allFileNames.push(item.name);
      
      // 1. 優先匹配指定檔案：RCCI-IP
      if (!appsCsv && item.name.indexOf(targetName) !== -1) {
        appsCsv = item.file.getBlob().getDataAsString('UTF-8');
        matchedAppsName = item.name;
        continue;
      }

      // 2. 匹配「專利家族」CSV
      if (!famsCsv && (item.name.indexOf('家族') !== -1 || item.name.indexOf('families') !== -1 || item.name.indexOf('patent_families') !== -1)) {
        famsCsv = item.file.getBlob().getDataAsString('UTF-8');
        matchedFamsName = item.name;
        continue;
      }
      
      // 3. 匹配備用「各國申請案件」CSV
      if (!appsCsv && (item.name.indexOf('各國申請') !== -1 || item.name.indexOf('sheet_data') !== -1 || item.name.indexOf('applications') !== -1 || item.name.indexOf('案件') !== -1)) {
        appsCsv = item.file.getBlob().getDataAsString('UTF-8');
        matchedAppsName = item.name;
        continue;
      }
    }

    // 若尚未匹配到申請案，且非家族檔，則作為備選申請案
    if (!appsCsv && fileList.length > 0) {
      appsCsv = fileList[0].file.getBlob().getDataAsString('UTF-8');
      matchedAppsName = fileList[0].name;
    }
    
    var output = {
      status: 'success',
      filesInFolder: allFileNames,
      matchedAppsFile: matchedAppsName,
      matchedFamsFile: matchedFamsName,
      appsCsv: appsCsv,
      famsCsv: famsCsv,
      updatedAt: new Date().toISOString()
    };
    
    return ContentService.createTextOutput(JSON.stringify(output))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 測試函式：您可以在 Apps Script 編輯器上方選擇此函式並按「執行」，
 * 用來直接觸發「Google 雲端硬碟存取權限授權」，並在記錄中查看是否成功讀取到資料夾！
 */
function testDriveFolderAccess() {
  var folderId = '1DmEhARSr0kUhi4fKTfSaDpFVitdk39-t';
  try {
    var folder = DriveApp.getFolderById(folderId);
    Logger.log('✓ 成功找到資料夾：' + folder.getName());
    var files = folder.getFiles();
    var count = 0;
    while (files.hasNext()) {
      var f = files.next();
      count++;
      Logger.log('  檔案 ' + count + ': ' + f.getName() + ' (' + f.getSize() + ' bytes, 更新時間: ' + f.getLastUpdated() + ')');
    }
    if (count === 0) {
      Logger.log('⚠️ 資料夾內目前尚未放置任何檔案，請將下載的 CSV 檔案放入該雲端硬碟資料夾中！');
    }
  } catch (e) {
    Logger.log('❌ 存取失敗：' + e.toString());
  }
}

/**
 * 試算表開啟時自動觸發：在 Google 試算表最上方主選單列新增自訂按鈕
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🏛️ RCCI 智財專區')
    .addItem('🚀 開啟智財與技術成果網頁', 'openRcciWebPage')
    .addToUi();
}

/**
 * 點擊自訂選單時，開啟前往網頁對話框 (導向 GitHub Pages 正式網址)
 */
function openRcciWebPage() {
  var targetUrl = "https://tommy1114-commits.github.io/rcci-patents/";

  var html = HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html>
      <head>
        <base target="_blank">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin: 0; padding: 20px; text-align: center; background: #f8fafc;
          }
          .title { font-size: 15px; font-weight: 700; color: #008fa0; margin-bottom: 6px; }
          .desc { font-size: 13px; color: #64748b; margin-bottom: 18px; }
          .btn-open {
            display: inline-block;
            background: linear-gradient(135deg, #008fa0, #00707e);
            color: #ffffff !important;
            padding: 11px 24px;
            font-size: 14px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 143, 160, 0.25);
            transition: all 0.2s;
          }
          .btn-open:hover { opacity: 0.92; }
        </style>
      </head>
      <body>
        <div class="title">🏛️ 中央研究院 RCCI 智財專區</div>
        <div class="desc">點擊下方按鈕將於新分頁開啟 GitHub 官方成果網頁</div>
        <a href="${targetUrl}" class="btn-open" target="_blank" onclick="setTimeout(function(){google.script.host.close();}, 500);">
          🚀 立即開啟智財網頁 ↗
        </a>
      </body>
    </html>
  `).setWidth(360).setHeight(160);

  SpreadsheetApp.getUi().showModalDialog(html, '前往 RCCI 智財成果專區');
}
