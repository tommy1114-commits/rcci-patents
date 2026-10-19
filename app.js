/**
 * RCCI 智財與技術成果專區 - 前端核心應用控制器
 * 整合官方網站 (https://rcci.test.sinica.edu.tw/) 內頁共用版型標準
 * Research Center for Critical Issues | Academia Sinica
 */

(function () {
  'use strict';

  // 應用程式核心狀態
  const state = {
    activeSection: 'patents',
    outcomes: [],
    allApplications: [],
    currentCategory: '全部',
    searchQuery: '',
    viewMode: 'grid', // 'grid' | 'table'
    selectedOutcomeId: null,
    syncEngine: null
  };

  // 國別圖示與全稱對照表
  const COUNTRY_NAMES = {
    'US': { name: '美國', flag: '🇺🇸' },
    'TW': { name: '台灣', flag: '🇹🇼' },
    'CN': { name: '中國', flag: '🇨🇳' },
    'JP': { name: '日本', flag: '🇯🇵' },
    'KR': { name: '韓國', flag: '🇰🇷' },
    'EP': { name: '歐洲', flag: '🇪🇺' },
    'AU': { name: '澳洲', flag: '🇦🇺' },
    'CA': { name: '加拿大', flag: '🇨🇦' },
    'PCT': { name: 'PCT國際申請', flag: '🌐' },
    'PCT-US': { name: '美國 (PCT進入國家階段)', flag: '🇺🇸' },
    'PCT-CN': { name: '中國 (PCT進入國家階段)', flag: '🇨🇳' },
    'PCT-EP': { name: '歐洲 (PCT進入國家階段)', flag: '🇪🇺' },
    'PCT-KR': { name: '韓國 (PCT進入國家階段)', flag: '🇰🇷' },
    'PCT-AU': { name: '澳洲 (PCT進入國家階段)', flag: '🇦🇺' },
    'PCT-JP': { name: '日本 (PCT進入國家階段)', flag: '🇯🇵' },
    'PCT-CA': { name: '加拿大 (PCT進入國家階段)', flag: '🇨🇦' }
  };

  // DOM 元素快取
  const elements = {
    // 麵包屑
    officialBreadcrumb: document.getElementById('official-breadcrumb'),
    breadcrumbPatentsRoot: document.getElementById('breadcrumb-patents-root'),
    breadcrumbDetailItem: document.getElementById('breadcrumb-detail-item'),
    breadcrumbDetailTitle: document.getElementById('breadcrumb-detail-title'),

    // 側邊選單
    sidebarToggleBtn: document.getElementById('sidebar-toggle-btn'),
    sidebarMenuWrapper: document.getElementById('sidebar-menu-wrapper'),
    sidebarItemGrid: document.getElementById('sidebar-item-grid'),
    sidebarItemTable: document.getElementById('sidebar-item-table'),
    sidebarLinkGrid: document.getElementById('sidebar-link-grid'),
    sidebarLinkTable: document.getElementById('sidebar-link-table'),

    // 內頁標題
    pageTitleDisplay: document.getElementById('page-title-display'),
    pageSubtitleDisplay: document.getElementById('page-subtitle-display'),

    // 手機版主導覽列
    btnMobileNavToggle: document.getElementById('btn-mobile-nav-toggle'),
    btnMobileNavClose: document.getElementById('btn-mobile-nav-close'),
    mainNavCollapse: document.getElementById('main-nav-collapse'),

    // 字體縮放按鈕
    btnFontMinus: document.getElementById('btn-font-minus'),
    btnFontPlus: document.getElementById('btn-font-plus'),

    // 智財成果 - 列表視圖
    listView: document.getElementById('list-view'),
    cardGrid: document.getElementById('card-grid'),
    filterContainer: document.getElementById('filter-container'),
    searchInput: document.getElementById('search-input'),
    searchClear: document.getElementById('search-clear'),
    btnViewGrid: document.getElementById('btn-view-grid'),
    btnViewTable: document.getElementById('btn-view-table'),
    tableContainer: document.getElementById('all-table-view'),
    allAppsTableBody: document.getElementById('all-apps-tbody'),
    tableTotalCount: document.getElementById('table-total-count'),

    // 智財成果 - 詳情視圖
    detailView: document.getElementById('detail-view'),
    breadcrumbBack: document.getElementById('breadcrumb-back'),
    detailCategoryBadge: document.getElementById('detail-category-badge'),
    detailTitle: document.getElementById('detail-title'),
    detailAbstract: document.getElementById('detail-abstract'),
    detailCaseId: document.getElementById('detail-case-id'),
    detailPublishDate: document.getElementById('detail-publish-date'),
    detailInventors: document.getElementById('detail-inventors'),
    detailLegalStatus: document.getElementById('detail-legal-status'),
    detailFamilyId: document.getElementById('detail-family-id'),
    detailProject: document.getElementById('detail-project'),
    detailLicenseStatus: document.getElementById('detail-license-status'),
    detailApplicationsTbody: document.getElementById('detail-applications-tbody'),
    btnTechLink: document.getElementById('btn-tech-link'),

    // 隱藏相容元件
    syncDot: document.getElementById('sync-dot'),
    syncText: document.getElementById('sync-text'),
    btnRefresh: document.getElementById('btn-refresh'),
    csvFileInput: document.getElementById('csv-file-input')
  };

  // 初始化程式
  function init() {
    try {
      setupEventListeners();
    } catch (err) {
      console.error('setupEventListeners error:', err);
    }

    try {
      setupSyncEngine();
    } catch (err) {
      console.error('setupSyncEngine error:', err);
    }

    try {
      handleHashRouting();
    } catch (err) {
      console.error('handleHashRouting error:', err);
    }
  }

  // 設定同步引擎與初始渲染（保證資料絕對不為空）
  function setupSyncEngine() {
    state.syncEngine = new GoogleSheetSync(APP_CONFIG);

    state.syncEngine.onStatusChange = (status, message) => {
      if (elements.syncDot) elements.syncDot.className = `status-dot ${status}`;
      if (elements.syncText) elements.syncText.textContent = message;
    };

    state.syncEngine.onDataUpdated = (data, isLive) => {
      state.outcomes = data.outcomes || [];
      state.allApplications = data.allApplications || [];
      renderCategories();
      renderCurrentView();

      if (state.selectedOutcomeId) {
        showDetail(state.selectedOutcomeId, false);
      }
    };

    // 優先讀取 LocalStorage 快取，無快取時讀取 SNAPSHOT
    try {
      const cached = state.syncEngine.loadFromStorage();
      if (cached && cached.data && cached.data.outcomes && cached.data.outcomes.length > 0) {
        state.outcomes = cached.data.outcomes;
        state.allApplications = cached.data.allApplications || [];
      } else {
        const initialSnapshot = state.syncEngine.processAndMergeData(SNAPSHOT_APPLICATIONS, SNAPSHOT_FAMILIES);
        state.outcomes = initialSnapshot.outcomes;
        state.allApplications = initialSnapshot.allApplications;
      }
    } catch (e) {
      console.warn('快顯渲染例外:', e);
      const initialSnapshot = state.syncEngine.processAndMergeData(SNAPSHOT_APPLICATIONS, SNAPSHOT_FAMILIES);
      state.outcomes = initialSnapshot.outcomes;
      state.allApplications = initialSnapshot.allApplications;
    }

    renderCategories();
    renderCurrentView();

    // 觸發一次同步（若啟用）
    state.syncEngine.sync();
  }

  // 事件綁定
  function setupEventListeners() {
    // 側邊選單切換檢視（技術成果 vs 專利申請案明細）
    if (elements.sidebarLinkGrid) {
      elements.sidebarLinkGrid.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = '#patents';
      });
    }

    if (elements.sidebarLinkTable) {
      elements.sidebarLinkTable.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = '#patents-table';
      });
    }

    // 手機版側邊選單折疊開關
    if (elements.sidebarToggleBtn && elements.sidebarMenuWrapper) {
      elements.sidebarToggleBtn.addEventListener('click', () => {
        const isCollapsed = elements.sidebarMenuWrapper.classList.toggle('collapsed');
        elements.sidebarToggleBtn.classList.toggle('collapsed', isCollapsed);
      });
    }

    // 手機版主導覽漢堡開關
    if (elements.btnMobileNavToggle && elements.mainNavCollapse) {
      elements.btnMobileNavToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        elements.mainNavCollapse.classList.toggle('show');
      });
    }

    if (elements.btnMobileNavClose && elements.mainNavCollapse) {
      elements.btnMobileNavClose.addEventListener('click', () => {
        elements.mainNavCollapse.classList.remove('show');
      });
    }

    // 點擊選單外部收合手機主導覽
    document.addEventListener('click', (e) => {
      if (elements.mainNavCollapse && elements.mainNavCollapse.classList.contains('show')) {
        if (!elements.mainNavCollapse.contains(e.target) && !elements.btnMobileNavToggle.contains(e.target)) {
          elements.mainNavCollapse.classList.remove('show');
        }
      }
    });

    // 字體大小 A- / A+ 縮放互動
    let currentFontSize = 16;
    if (elements.btnFontMinus) {
      elements.btnFontMinus.addEventListener('click', () => {
        if (currentFontSize > 13) {
          currentFontSize -= 1;
          document.documentElement.style.fontSize = currentFontSize + 'px';
        }
      });
    }
    if (elements.btnFontPlus) {
      elements.btnFontPlus.addEventListener('click', () => {
        if (currentFontSize < 21) {
          currentFontSize += 1;
          document.documentElement.style.fontSize = currentFontSize + 'px';
        }
      });
    }

    // 智財搜尋輸入（防抖）
    let debounceTimer = null;
    if (elements.searchInput) {
      elements.searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value.trim();
        if (elements.searchClear) {
          elements.searchClear.classList.toggle('visible', query.length > 0);
        }
        debounceTimer = setTimeout(() => {
          state.searchQuery = query;
          renderCurrentView();
        }, 180);
      });
    }

    // 清除搜尋
    if (elements.searchClear) {
      elements.searchClear.addEventListener('click', () => {
        if (elements.searchInput) elements.searchInput.value = '';
        elements.searchClear.classList.remove('visible');
        state.searchQuery = '';
        renderCurrentView();
        if (elements.searchInput) elements.searchInput.focus();
      });
    }

    // 視圖切換：卡片成果
    if (elements.btnViewGrid) {
      elements.btnViewGrid.addEventListener('click', () => {
        window.location.hash = '#patents';
      });
    }

    // 視圖切換：明細總表
    if (elements.btnViewTable) {
      elements.btnViewTable.addEventListener('click', () => {
        window.location.hash = '#patents-table';
      });
    }

    // 麵包屑／返回按鈕回到列表
    if (elements.breadcrumbBack) {
      elements.breadcrumbBack.addEventListener('click', (e) => {
        e.preventDefault();
        closeDetail(true);
      });
    }

    if (elements.breadcrumbPatentsRoot) {
      elements.breadcrumbPatentsRoot.addEventListener('click', (e) => {
        if (state.selectedOutcomeId) {
          e.preventDefault();
          closeDetail(true);
        }
      });
    }

    // 監聽 URL Hash 變更
    window.addEventListener('hashchange', handleHashRouting);
  }

  // 處理 URL Hash 路由切換
  function handleHashRouting() {
    const rawHash = window.location.hash || '#patents';
    const hash = rawHash.replace(/^#/, '');

    if (hash.startsWith('patent/')) {
      const id = decodeURIComponent(hash.replace('patent/', ''));
      showDetail(id, false);
      return;
    }

    if (hash === 'patents-table') {
      setViewMode('table');
      if (state.selectedOutcomeId) {
        closeDetail(false);
      }
      return;
    }

    // 預設為卡片檢視
    setViewMode('grid');
    if (state.selectedOutcomeId) {
      closeDetail(false);
    }
  }

  // 切換檢視模式 (grid / table) 同步側邊選單與按鈕狀態
  function setViewMode(mode) {
    state.viewMode = mode;

    if (mode === 'grid') {
      if (elements.btnViewGrid) elements.btnViewGrid.classList.add('active');
      if (elements.btnViewTable) elements.btnViewTable.classList.remove('active');
      if (elements.sidebarItemGrid) elements.sidebarItemGrid.classList.add('active');
      if (elements.sidebarItemTable) elements.sidebarItemTable.classList.remove('active');
      if (elements.pageTitleDisplay) elements.pageTitleDisplay.textContent = '智財與技術成果';
      if (elements.pageSubtitleDisplay) elements.pageSubtitleDisplay.textContent = '從技術領域或關鍵字快速找到可合作的研發成果';
    } else {
      if (elements.btnViewTable) elements.btnViewTable.classList.add('active');
      if (elements.btnViewGrid) elements.btnViewGrid.classList.remove('active');
      if (elements.sidebarItemTable) elements.sidebarItemTable.classList.add('active');
      if (elements.sidebarItemGrid) elements.sidebarItemGrid.classList.remove('active');
      if (elements.pageTitleDisplay) elements.pageTitleDisplay.textContent = '專利申請案明細';
      if (elements.pageSubtitleDisplay) elements.pageSubtitleDisplay.textContent = '檢視本中心所有專利申請案之各國提申編號與法律狀態';
    }

    renderCurrentView();
  }

  // 篩選成果
  function getFilteredOutcomes() {
    return state.outcomes.filter(item => {
      const matchesCategory = state.currentCategory === '全部' || 
        (item.domain === state.currentCategory) ||
        (item.domain.includes(state.currentCategory)) ||
        (state.currentCategory === '量子科技' && item.domain.includes('量子'));

      if (!matchesCategory) return false;

      if (!state.searchQuery) return true;
      const q = state.searchQuery.toLowerCase();
      
      const inTitle = (item.title || '').toLowerCase().includes(q);
      const inCaseId = (item.caseId || '').toLowerCase().includes(q);
      const inFamilyId = (item.familyId || '').toLowerCase().includes(q);
      const inInventors = (item.inventors || '').toLowerCase().includes(q);
      const inAbstract = (item.abstract || '').toLowerCase().includes(q);
      const inApps = item.applications.some(a => 
        (a.appNo || '').toLowerCase().includes(q) ||
        (a.patentNo || '').toLowerCase().includes(q) ||
        (a.country || '').toLowerCase().includes(q)
      );

      return inTitle || inCaseId || inFamilyId || inInventors || inAbstract || inApps;
    });
  }

  // 渲染分類標籤按鈕
  function renderCategories() {
    const counts = { '全部': state.outcomes.length };
    
    state.outcomes.forEach(item => {
      counts[item.domain] = (counts[item.domain] || 0) + 1;
    });

    const domainOrder = ['太陽能', '量子電腦', '去碳燃氫'];
    const otherDomains = Object.keys(counts).filter(k => k !== '全部' && !domainOrder.includes(k));
    const allCategories = ['全部', ...domainOrder.filter(d => counts[d] > 0), ...otherDomains];

    if (!elements.filterContainer) return;
    elements.filterContainer.innerHTML = '';

    allCategories.forEach(cat => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `filter-btn ${state.currentCategory === cat ? 'active' : ''}`;
      
      let displayLabel = cat;
      if (cat === '量子電腦') displayLabel = '量子科技';

      btn.innerHTML = `<span>${displayLabel}</span> <span class="filter-count">${counts[cat] || 0}</span>`;
      btn.addEventListener('click', () => {
        state.currentCategory = cat;
        renderCategories();
        renderCurrentView();
      });
      elements.filterContainer.appendChild(btn);
    });
  }

  // 渲染目前檢視
  function renderCurrentView() {
    if (state.selectedOutcomeId) return;

    if (state.viewMode === 'grid') {
      if (elements.cardGrid) elements.cardGrid.style.display = 'grid';
      if (elements.tableContainer) elements.tableContainer.classList.remove('active');
      renderCardGrid();
    } else {
      if (elements.cardGrid) elements.cardGrid.style.display = 'none';
      if (elements.tableContainer) elements.tableContainer.classList.add('active');
      renderAllApplicationsTable();
    }
  }

  // 渲染成果卡片網格
  function renderCardGrid() {
    if (!elements.cardGrid) return;
    const filtered = getFilteredOutcomes();
    elements.cardGrid.innerHTML = '';

    if (filtered.length === 0) {
      elements.cardGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: var(--rcci-bg); border-radius: 8px; border: 1px dashed var(--border-color);">
          <i class="fas fa-search" style="font-size: 2rem; color: var(--text-light); margin-bottom: 12px; display: block;"></i>
          <h3 style="font-size: 1.15rem; color: var(--text-main); font-weight: 600;">查無符合條件的研發成果</h3>
          <p style="margin-top: 6px; font-size: 0.925rem; color: var(--text-muted);">請嘗試更換關鍵字或點選「全部」分類標籤。</p>
        </div>
      `;
      return;
    }

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'patent-card';
      
      let badgeClass = 'badge-default';
      if (item.domain.includes('太陽能')) badgeClass = 'badge-solar';
      else if (item.domain.includes('量子')) badgeClass = 'badge-quantum';
      else if (item.domain.includes('去碳') || item.domain.includes('燃氫')) badgeClass = 'badge-hydrogen';

      const cleanAbstract = (item.abstract || '')
        .replace(/\r?\n|\r/g, ' ')
        .trim();

      card.innerHTML = `
        <div class="card-top">
          <div class="card-header-tags">
            <span class="card-badge ${badgeClass}">${item.domain}</span>
            <span class="card-case-id">${item.caseId}</span>
          </div>
          <h3 class="card-title">${item.title}</h3>
          <p class="card-abstract">${cleanAbstract || '—'}</p>
        </div>
        <div class="card-footer">
          <span class="card-inventor"><i class="fas fa-user-circle"></i> ${item.inventors || '—'}</span>
          <span class="card-status-tag">${item.legalStatus || '專利申請中'}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        window.location.hash = `#patent/${encodeURIComponent(item.id)}`;
      });

      elements.cardGrid.appendChild(card);
    });
  }

  // 渲染申請案總表
  function renderAllApplicationsTable() {
    if (!elements.allAppsTableBody) return;
    elements.allAppsTableBody.innerHTML = '';
    const query = (state.searchQuery || '').toLowerCase();

    const filtered = state.allApplications.filter(app => {
      const domainMatches = state.currentCategory === '全部' || 
        (app['單位'] || '').includes(state.currentCategory) ||
        (state.currentCategory === '量子科技' && (app['單位'] || '').includes('量子'));
      if (!domainMatches) return false;

      if (!query) return true;
      return Object.values(app).some(val => (val || '').toLowerCase().includes(query));
    });

    if (elements.tableTotalCount) {
      elements.tableTotalCount.textContent = `共 ${filtered.length} 筆申請紀錄`;
    }

    if (filtered.length === 0) {
      elements.allAppsTableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-muted);">
            查無符合的申請案資料
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(app => {
      const tr = document.createElement('tr');
      const countryCode = (app['國家／地區'] || '').toUpperCase();
      const countryInfo = COUNTRY_NAMES[countryCode] || { name: countryCode, flag: '🌐' };

      let statusBadge = '<span class="badge-status pending">申請中</span>';
      if (app['專利號'] || (app['備註'] && app['備註'].includes('已獲證'))) {
        statusBadge = '<span class="badge-status granted">已獲證</span>';
      } else if (app['備註'] && app['備註'].includes('審閱中')) {
        statusBadge = '<span class="badge-status">審閱中</span>';
      }

      tr.innerHTML = `
        <td style="font-family: var(--font-mono); font-weight: 600; color: var(--rcci-green);">${app['家族編號'] || '-'}</td>
        <td style="font-family: var(--font-mono);">${app['院內案件編號'] || '-'}</td>
        <td><span class="country-name">${countryInfo.name || countryCode || '-'}</span></td>
        <td>${app['申請類型'] || '-'}</td>
        <td style="font-weight: 600; max-width: 280px; overflow-wrap: anywhere;">${app['專利名稱'] || '-'}</td>
        <td style="font-family: var(--font-mono);">${app['申請號'] || '-'}</td>
        <td style="font-family: var(--font-mono);">${app['專利號'] || '-'}</td>
        <td>${statusBadge}</td>
      `;

      tr.addEventListener('click', () => {
        const familyId = app['家族編號'];
        const outcome = state.outcomes.find(o => o.familyId === familyId || o.caseId === app['院內案件編號']);
        if (outcome) {
          window.location.hash = `#patent/${encodeURIComponent(outcome.id)}`;
        }
      });

      elements.allAppsTableBody.appendChild(tr);
    });
  }

  // 成果詳情檢視
  function showDetail(outcomeId, updateHash = true) {
    const outcome = state.outcomes.find(o => o.id === outcomeId || o.caseId === outcomeId);
    if (!outcome) return;

    state.selectedOutcomeId = outcome.id;

    if (updateHash) {
      window.location.hash = `#patent/${encodeURIComponent(outcome.id)}`;
    }

    // 更新官網標準麵包屑
    if (elements.breadcrumbDetailItem && elements.breadcrumbDetailTitle) {
      elements.breadcrumbDetailTitle.textContent = outcome.title;
      elements.breadcrumbDetailItem.classList.remove('d-none');
    }
    if (elements.breadcrumbPatentsRoot) {
      elements.breadcrumbPatentsRoot.classList.remove('active');
    }

    // 更新頁面大標題
    if (elements.pageTitleDisplay) elements.pageTitleDisplay.textContent = '智財與技術成果';
    if (elements.pageSubtitleDisplay) elements.pageSubtitleDisplay.textContent = outcome.title;

    // 設定領域標籤
    let badgeClass = 'badge-default';
    if (outcome.domain.includes('太陽能')) badgeClass = 'badge-solar';
    else if (outcome.domain.includes('量子')) badgeClass = 'badge-quantum';
    else if (outcome.domain.includes('去碳') || outcome.domain.includes('燃氫')) badgeClass = 'badge-hydrogen';

    if (elements.detailCategoryBadge) {
      elements.detailCategoryBadge.className = `badge ${badgeClass}`;
      elements.detailCategoryBadge.textContent = outcome.domain;
    }

    if (elements.detailTitle) elements.detailTitle.textContent = outcome.title || '—';
    if (elements.detailAbstract) elements.detailAbstract.textContent = outcome.abstract || '—';

    if (elements.detailCaseId) elements.detailCaseId.textContent = outcome.caseId || '—';
    if (elements.detailPublishDate) elements.detailPublishDate.textContent = outcome.publishDate || '—';
    if (elements.detailInventors) elements.detailInventors.textContent = outcome.inventors || '—';
    if (elements.detailLegalStatus) elements.detailLegalStatus.textContent = outcome.legalStatus || '—';
    if (elements.detailFamilyId) elements.detailFamilyId.textContent = outcome.familyId || outcome.caseId || '—';
    if (elements.detailProject) elements.detailProject.textContent = outcome.project || '—';
    if (elements.detailLicenseStatus) elements.detailLicenseStatus.textContent = outcome.licenseStatus || '—';

    // 智財技轉處官方技術資料超連結
    if (elements.btnTechLink) {
      if (outcome.techUrl) {
        elements.btnTechLink.href = outcome.techUrl;
        elements.btnTechLink.style.display = 'inline-flex';
      } else {
        elements.btnTechLink.style.display = 'none';
      }
    }

    renderDetailApplications(outcome.applications);

    if (elements.listView) elements.listView.style.display = 'none';
    if (elements.detailView) elements.detailView.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 渲染成果之各國申請案佈局
  function renderDetailApplications(applications) {
    if (!elements.detailApplicationsTbody) return;
    elements.detailApplicationsTbody.innerHTML = '';

    if (!applications || applications.length === 0) {
      elements.detailApplicationsTbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">
            本項技術尚無各國提申明細紀錄
          </td>
        </tr>
      `;
      return;
    }

    applications.forEach(app => {
      const tr = document.createElement('tr');
      const countryCode = (app.country || '').toUpperCase();
      const countryInfo = COUNTRY_NAMES[countryCode] || { name: app.country, flag: '🌐' };

      let statusBadge = '<span class="badge-status pending">申請中</span>';
      if (app.patentNo && app.patentNo !== '—') {
        statusBadge = '<span class="badge-status granted">已獲證</span>';
      } else if (app.legalStatus && app.legalStatus.includes('獲證')) {
        statusBadge = '<span class="badge-status granted">已獲證</span>';
      }

      tr.innerHTML = `
        <td><span class="country-name">${countryInfo.name || app.country}</span></td>
        <td>${app.type || '發明專利'}</td>
        <td style="font-family: var(--font-mono);">${app.appNo || '—'}</td>
        <td>${app.appDate || '—'}</td>
        <td style="font-family: var(--font-mono);">${app.patentNo || '—'}</td>
        <td>${statusBadge}</td>
      `;

      elements.detailApplicationsTbody.appendChild(tr);
    });
  }

  // 關閉詳情檢視並返回列表
  function closeDetail(updateHash = true) {
    state.selectedOutcomeId = null;

    if (elements.breadcrumbDetailItem) {
      elements.breadcrumbDetailItem.classList.add('d-none');
    }
    if (elements.breadcrumbPatentsRoot) {
      elements.breadcrumbPatentsRoot.classList.add('active');
    }

    if (elements.detailView) {
      elements.detailView.classList.remove('active');
    }
    if (elements.listView) {
      elements.listView.style.display = 'block';
    }

    if (updateHash) {
      window.location.hash = state.viewMode === 'table' ? '#patents-table' : '#patents';
    }

    setViewMode(state.viewMode);
  }

  // DOM 載入後執行初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
