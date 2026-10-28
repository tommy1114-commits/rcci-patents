/**
 * RCCI 智財與技術成果專區 - 前端核心應用控制器
 * 整合官方網站 (https://rcci.test.sinica.edu.tw/) 內頁共用版型標準
 * Research Center for Critical Issues | Academia Sinica
 */

(function () {
  'use strict';

  const VIEW_MODE_STORAGE_KEY = 'rcci_outcome_view_mode';

  // 讀取最後儲存的檢視模式（預設為 list 條列式）
  let initialViewMode = 'list';
  try {
    const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (saved === 'card' || saved === 'list') {
      initialViewMode = saved;
    }
  } catch (e) {}

  // 應用程式核心狀態
  const state = {
    activeSection: 'patents',
    outcomes: [],
    allApplications: [],
    currentCategory: '全部',
    searchQuery: '',
    viewMode: initialViewMode, // 'list' (條列式) | 'card' (3D 弧線滑動卡片)
    card3dIndex: 0,
    savedScrollPos: 0,
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
    outcomesContainer: document.getElementById('outcomes-container') || document.getElementById('card-grid'),
    cardGrid: document.getElementById('outcomes-container') || document.getElementById('card-grid'),
    filterContainer: document.getElementById('filter-container'),
    searchInput: document.getElementById('search-input'),
    searchClear: document.getElementById('search-clear'),
    btnViewList: document.getElementById('btn-view-list'),
    btnViewCard: document.getElementById('btn-view-card'),
    btnViewGrid: document.getElementById('btn-view-card'),
    btnViewTable: document.getElementById('btn-view-list'),
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
          state.card3dIndex = 0;
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
        state.card3dIndex = 0;
        renderCurrentView();
        if (elements.searchInput) elements.searchInput.focus();
      });
    }

    // 檢視模式切換（條列式 vs 薄霧玻璃卡片式）
    if (elements.btnViewList) {
      elements.btnViewList.addEventListener('click', () => setViewMode('list'));
    }
    if (elements.btnViewCard) {
      elements.btnViewCard.addEventListener('click', () => setViewMode('card'));
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
      window.location.hash = '#patents';
      return;
    }

    if (state.selectedOutcomeId) {
      closeDetail(false);
    } else {
      renderCurrentView();
    }
  }

  // 領域類別對應 CSS Class 與主題變數
  function getDomainClass(domain = '') {
    if (domain.includes('量子')) return 'domain-quantum';
    if (domain.includes('太陽能')) return 'domain-solar';
    if (domain.includes('去碳') || domain.includes('燃氫')) return 'domain-hydrogen';
    if (domain.includes('海藻') || domain.includes('藍碳')) return 'domain-bluecarbon';
    return 'domain-default';
  }

  // 領域標準標籤與代表色
  function getDomainMeta(domain = '') {
    if (domain.includes('量子')) return { label: '量子科技', color: '#6B46C1', bgTint: 'rgba(107, 70, 193, 0.045)' };
    if (domain.includes('太陽能')) return { label: '太陽能', color: '#B45309', bgTint: 'rgba(180, 83, 9, 0.045)' };
    if (domain.includes('去碳') || domain.includes('燃氫')) return { label: '去碳燃氫', color: '#276749', bgTint: 'rgba(39, 103, 73, 0.045)' };
    if (domain.includes('海藻') || domain.includes('藍碳')) return { label: '海藻藍碳', color: '#0F766E', bgTint: 'rgba(15, 118, 110, 0.045)' };
    return { label: domain || '其他', color: '#496B56', bgTint: 'rgba(73, 107, 86, 0.045)' };
  }

  // 領域類別對應優先層級（量子科技 → 太陽能 → 去碳燃氫 → 海藻藍碳 → 其他）
  function getDomainPriority(domain = '') {
    if (domain.includes('量子')) return 1;
    if (domain.includes('太陽能')) return 2;
    if (domain.includes('去碳') || domain.includes('燃氫')) return 3;
    if (domain.includes('海藻') || domain.includes('藍碳')) return 4;
    if (!domain || domain.trim() === '') return 999;
    return 100;
  }

  // 成果公告日期解析
  function parsePublishDate(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d.getTime();
  }

  // 成果連續分組與同領域日期排序（條列式與 3D 卡片使用同一份排序結果）
  function sortOutcomes(items) {
    return [...items].sort((a, b) => {
      // 1. 固定分組順序：量子科技 → 太陽能 → 去碳燃氫 → 海藻藍碳
      const pA = getDomainPriority(a.domain);
      const pB = getDomainPriority(b.domain);
      if (pA !== pB) return pA - pB;

      // 若非四大領域，確保同領域連續
      if (pA === 100 && pB === 100) {
        const dCompare = (a.domain || '').localeCompare(b.domain || '', 'zh-Hant');
        if (dCompare !== 0) return dCompare;
      }

      // 2. 同領域內，依成果公告日期 (publishDate) 由新到舊排序
      const dateA = parsePublishDate(a.publishDate);
      const dateB = parsePublishDate(b.publishDate);
      if (dateA !== null && dateB !== null) {
        if (dateA !== dateB) return dateB - dateA;
      } else if (dateA !== null && dateB === null) {
        return -1;
      } else if (dateA === null && dateB !== null) {
        return 1;
      }

      // 3. 日期缺漏或相同時，依案件編號穩定排序
      const caseA = a.caseId || a.id || '';
      const caseB = b.caseId || b.id || '';
      return caseA.localeCompare(caseB, 'zh-Hant');
    });
  }

  // 切換檢視模式 (list 條列式 / card 3D 卡片式)
  function setViewMode(mode) {
    if (mode !== 'list' && mode !== 'card') {
      mode = 'list';
    }
    state.viewMode = mode;
    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    } catch (e) {}

    if (elements.btnViewList) {
      elements.btnViewList.classList.toggle('active', mode === 'list');
      elements.btnViewList.setAttribute('aria-pressed', mode === 'list' ? 'true' : 'false');
    }
    if (elements.btnViewCard) {
      elements.btnViewCard.classList.toggle('active', mode === 'card');
      elements.btnViewCard.setAttribute('aria-pressed', mode === 'card' ? 'true' : 'false');
    }

    renderCurrentView();
  }

  // 篩選成果（支援關鍵字、分類標籤，兩種檢視通用，且保證同領域連續排序）
  function getFilteredOutcomes() {
    const rawFiltered = state.outcomes.filter(item => {
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

    return sortOutcomes(rawFiltered);
  }

  // 渲染分類標籤按鈕（維持固定領域順序）
  function renderCategories() {
    const counts = { '全部': state.outcomes.length };
    
    state.outcomes.forEach(item => {
      counts[item.domain] = (counts[item.domain] || 0) + 1;
    });

    const domainOrder = ['量子電腦', '太陽能', '去碳燃氫', '海藻藍碳'];
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
        state.card3dIndex = 0;
        renderCategories();
        renderCurrentView();
      });
      elements.filterContainer.appendChild(btn);
    });
  }

  // 渲染目前檢視（條列式 vs 3D 弧線滑動卡片式）
  function renderCurrentView() {
    if (state.selectedOutcomeId) return;

    const container = elements.outcomesContainer || elements.cardGrid;
    if (!container) return;

    // 同步更新切換按鈕狀態
    if (elements.btnViewList) {
      elements.btnViewList.classList.toggle('active', state.viewMode === 'list');
      elements.btnViewList.setAttribute('aria-pressed', state.viewMode === 'list' ? 'true' : 'false');
    }
    if (elements.btnViewCard) {
      elements.btnViewCard.classList.toggle('active', state.viewMode === 'card');
      elements.btnViewCard.setAttribute('aria-pressed', state.viewMode === 'card' ? 'true' : 'false');
    }

    const filtered = getFilteredOutcomes();

    if (state.viewMode === 'list') {
      container.className = 'outcomes-container view-list';
      renderListView(filtered, container);
    } else {
      container.className = 'outcomes-container view-card3d';
      render3DCardView(filtered, container);
    }
  }

  // 1. 渲染彩色領域條列式 (List View)
  function renderListView(filtered, container) {
    container.innerHTML = '';

    if (filtered.length === 0) {
      renderEmptyState(container);
      return;
    }

    const listWrap = document.createElement('div');
    listWrap.className = 'outcome-list-wrap';

    filtered.forEach(item => {
      const itemEl = document.createElement('div');
      const domainClass = getDomainClass(item.domain);
      itemEl.className = `outcome-list-item ${domainClass}`;
      itemEl.setAttribute('role', 'button');
      itemEl.setAttribute('tabindex', '0');
      itemEl.setAttribute('aria-label', `${item.domain}：${item.title}`);

      let domainLabel = item.domain || '';
      if (domainLabel === '量子電腦') domainLabel = '量子科技';

      const cleanAbstract = (item.abstract || '').replace(/\r?\n|\r/g, ' ').trim();
      const abstractHtml = cleanAbstract
        ? `<p class="list-item-abstract">${cleanAbstract}</p>`
        : '';

      itemEl.innerHTML = `
        <div class="list-item-content">
          <span class="list-item-domain">${domainLabel}</span>
          <h3 class="list-item-title">${item.title}</h3>
          ${abstractHtml}
        </div>
        <div class="list-item-action" aria-hidden="true">
          <i class="fas fa-chevron-right"></i>
        </div>
      `;

      itemEl.addEventListener('click', () => {
        window.location.hash = `#patent/${encodeURIComponent(item.id)}`;
      });

      itemEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.location.hash = `#patent/${encodeURIComponent(item.id)}`;
        }
      });

      listWrap.appendChild(itemEl);
    });

    container.appendChild(listWrap);
  }

  // 2. 渲染 3D 弧線滑動式玻璃卡片 (3D Curved Glass Cards Carousel)
  function render3DCardView(filtered, container) {
    container.innerHTML = '';

    if (filtered.length === 0) {
      renderEmptyState(container);
      return;
    }

    const total = filtered.length;
    if (state.card3dIndex >= total) {
      state.card3dIndex = Math.max(0, total - 1);
    } else if (state.card3dIndex < 0) {
      state.card3dIndex = 0;
    }

    const stage = document.createElement('div');
    stage.className = 'card3d-stage';

    const carousel = document.createElement('div');
    carousel.className = 'card3d-carousel';
    carousel.setAttribute('role', 'region');
    carousel.setAttribute('aria-roledescription', 'carousel');
    carousel.setAttribute('tabindex', '0');
    carousel.setAttribute('aria-label', '3D 卡片技術成果輪播');

    const track = document.createElement('div');
    track.className = 'card3d-track';

    const cardElements = [];

    filtered.forEach((item, index) => {
      const card = document.createElement('div');
      const domainClass = getDomainClass(item.domain);
      card.className = `card3d-item ${domainClass}`;
      card.setAttribute('data-index', String(index));
      card.setAttribute('role', 'group');
      card.setAttribute('aria-roledescription', 'slide');
      card.setAttribute('aria-label', `${index + 1} of ${total}：${item.domain} - ${item.title}`);
      card.setAttribute('tabindex', '0');

      const domainMeta = getDomainMeta(item.domain);

      const cleanAbstract = (item.abstract || '').replace(/\r?\n|\r/g, ' ').trim();
      const abstractHtml = cleanAbstract
        ? `<p class="card3d-abstract">${cleanAbstract}</p>`
        : '';

      const caseNumber = item.caseId || item.id || '';

      card.innerHTML = `
        <div class="card3d-inner">
          <div class="card3d-body">
            <span class="card3d-domain">${domainMeta.label}</span>
            <span class="card3d-sub">RCCI TECHNOLOGY</span>
            <h3 class="card3d-title">${item.title}</h3>
            <div class="card3d-line"></div>
            ${abstractHtml}
          </div>
          <div class="card3d-footer">
            <span class="card3d-case-id">${caseNumber}</span>
            <span class="card3d-action" role="button" tabindex="-1">
              查看技術 <i class="fas fa-arrow-right" aria-hidden="true"></i>
            </span>
          </div>
        </div>
      `;

      // 光暈跟隨滑鼠位置互動（僅在中央卡片時生效）
      card.addEventListener('mousemove', (e) => {
        if (index !== state.card3dIndex) return;
        const inner = card.querySelector('.card3d-inner');
        if (!inner) return;
        const rect = inner.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        inner.style.setProperty('--mouse-x', `${x.toFixed(1)}%`);
        inner.style.setProperty('--mouse-y', `${y.toFixed(1)}%`);
      });

      card.addEventListener('mouseleave', () => {
        const inner = card.querySelector('.card3d-inner');
        if (inner) {
          inner.style.removeProperty('--mouse-x');
          inner.style.removeProperty('--mouse-y');
        }
      });

      track.appendChild(card);
      cardElements.push(card);
    });

    carousel.appendChild(track);
    stage.appendChild(carousel);

    // 建立下方控制列
    const controls = document.createElement('div');
    controls.className = 'card3d-controls';
    controls.innerHTML = `
      <div class="card3d-nav-row">
        <button type="button" class="card3d-arrow-btn prev" aria-label="上一項技術成果" title="上一項">
          <i class="fas fa-arrow-left" aria-hidden="true"></i>
        </button>
        <div class="card3d-counter">
          <span class="card3d-counter-current">01</span>
          <span class="card3d-counter-sep">/</span>
          <span class="card3d-counter-total">${String(total).padStart(2, '0')}</span>
        </div>
        <button type="button" class="card3d-arrow-btn next" aria-label="下一項技術成果" title="下一項">
          <i class="fas fa-arrow-right" aria-hidden="true"></i>
        </button>
      </div>
      <div class="card3d-info-row">
        <div class="card3d-current-domain">
          <span class="card3d-domain-dot"></span>
          <span class="card3d-domain-name">領域名稱</span>
        </div>
        <div class="card3d-hint">左右拖曳瀏覽技術，點擊查看詳情</div>
      </div>
    `;

    stage.appendChild(controls);
    container.appendChild(stage);

    const prevBtn = controls.querySelector('.card3d-arrow-btn.prev');
    const nextBtn = controls.querySelector('.card3d-arrow-btn.next');
    const counterCurrent = controls.querySelector('.card3d-counter-current');
    const domainDot = controls.querySelector('.card3d-domain-dot');
    const domainName = controls.querySelector('.card3d-domain-name');

    // 計算各卡片 3D 弧線位置
    function updateCardTransforms() {
      const w = window.innerWidth;
      const isMobile = w <= 768;
      const isTablet = w > 768 && w <= 1024;

      cardElements.forEach((card, idx) => {
        const delta = idx - state.card3dIndex;
        const abs = Math.abs(delta);
        const sign = delta > 0 ? 1 : (delta < 0 ? -1 : 0);

        if (delta === 0) {
          card.classList.add('is-active');
          card.setAttribute('aria-hidden', 'false');
          card.style.transform = 'translateX(0px) translateZ(0px) rotateY(0deg) scale(1)';
          card.style.opacity = '1';
          card.style.zIndex = '50';
          card.style.filter = 'blur(0px)';
          card.style.pointerEvents = 'auto';
        } else {
          card.classList.remove('is-active');
          card.setAttribute('aria-hidden', 'true');

          let tx, tz, ry, sc, op, zi, fl;

          if (isMobile) {
            if (abs === 1) {
              tx = sign * 125;
              tz = -65;
              ry = -sign * 22;
              sc = 0.82;
              op = 0.42;
              zi = 40;
              fl = 'blur(0.5px)';
            } else {
              tx = sign * (125 + (abs - 1) * 60);
              tz = -150;
              ry = -sign * 35;
              sc = 0.65;
              op = 0;
              zi = Math.max(1, 20 - abs);
              fl = 'blur(2px)';
            }
          } else if (isTablet) {
            if (abs === 1) {
              tx = sign * 185;
              tz = -80;
              ry = -sign * 22;
              sc = 0.86;
              op = 0.88;
              zi = 40;
              fl = 'blur(0px)';
            } else if (abs === 2) {
              tx = sign * 320;
              tz = -160;
              ry = -sign * 32;
              sc = 0.72;
              op = 0.55;
              zi = 30;
              fl = 'blur(0.5px)';
            } else {
              tx = sign * (320 + (abs - 2) * 60);
              tz = -240;
              ry = -sign * 38;
              sc = 0.6;
              op = 0;
              zi = Math.max(1, 20 - abs);
              fl = 'blur(2px)';
            }
          } else {
            // 桌機 (3～5 張清楚辨識，外側部分露出提示)
            if (abs === 1) {
              tx = sign * 225;
              tz = -85;
              ry = -sign * 22;
              sc = 0.88;
              op = 0.92;
              zi = 40;
              fl = 'blur(0px)';
            } else if (abs === 2) {
              tx = sign * 395;
              tz = -170;
              ry = -sign * 32;
              sc = 0.76;
              op = 0.72;
              zi = 30;
              fl = 'blur(0px)';
            } else if (abs === 3) {
              tx = sign * 525;
              tz = -250;
              ry = -sign * 38;
              sc = 0.66;
              op = 0.45;
              zi = 20;
              fl = 'blur(0.5px)';
            } else {
              tx = sign * (525 + (abs - 3) * 65);
              tz = -320;
              ry = -sign * 42;
              sc = 0.58;
              op = 0;
              zi = Math.max(1, 15 - abs);
              fl = 'blur(2px)';
            }
          }

          card.style.transform = `translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg) scale(${sc})`;
          card.style.opacity = String(op);
          card.style.zIndex = String(zi);
          card.style.filter = fl;
          card.style.pointerEvents = op > 0.1 ? 'auto' : 'none';
        }
      });

      // 更新計數器與按鈕狀態
      if (counterCurrent) {
        counterCurrent.textContent = String(state.card3dIndex + 1).padStart(2, '0');
      }
      if (prevBtn) {
        prevBtn.disabled = (state.card3dIndex <= 0);
      }
      if (nextBtn) {
        nextBtn.disabled = (state.card3dIndex >= total - 1);
      }

      // 更新目前領域名稱與顏色圓點
      const currentItem = filtered[state.card3dIndex];
      if (currentItem && domainDot && domainName) {
        const meta = getDomainMeta(currentItem.domain);
        domainDot.style.backgroundColor = meta.color;
        domainName.textContent = meta.label;
      }
    }

    // 初次定位
    updateCardTransforms();

    // 視窗大小改變時重算卡片弧線
    let resizeTimer = null;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateCardTransforms, 100);
    };
    window.addEventListener('resize', onResize);

    // 切換至指定索引
    function goToIndex(idx) {
      if (idx < 0) idx = 0;
      if (idx >= total) idx = total - 1;
      if (idx === state.card3dIndex) return;
      state.card3dIndex = idx;
      updateCardTransforms();
    }

    // 箭頭按鈕監聽
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        goToIndex(state.card3dIndex - 1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        goToIndex(state.card3dIndex + 1);
      });
    }

    // 卡片點擊互動
    let justDragged = false;
    let dragSuppressTimeout = null;

    cardElements.forEach((card, idx) => {
      card.addEventListener('click', (e) => {
        if (justDragged) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        if (idx !== state.card3dIndex) {
          // 點擊側邊卡片：移至中央
          e.preventDefault();
          e.stopPropagation();
          goToIndex(idx);
        } else {
          // 點擊中央卡片或其查看技術：進入詳情頁
          const item = filtered[idx];
          if (item) {
            window.location.hash = `#patent/${encodeURIComponent(item.id)}`;
          }
        }
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (idx !== state.card3dIndex) {
            goToIndex(idx);
          } else {
            const item = filtered[idx];
            if (item) {
              window.location.hash = `#patent/${encodeURIComponent(item.id)}`;
            }
          }
        }
      });
    });

    // 鍵盤左右箭頭操作輪播
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToIndex(state.card3dIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToIndex(state.card3dIndex + 1);
      }
    });

    // 滑鼠拖曳與手機觸控滑動 (Pointer Events 統一處理)
    let isPointerDown = false;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let hasMoved = false;

    carousel.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      isPointerDown = true;
      startX = e.clientX;
      startY = e.clientY;
      currentX = e.clientX;
      hasMoved = false;
      carousel.classList.add('is-dragging');
    });

    window.addEventListener('pointermove', (e) => {
      if (!isPointerDown) return;
      currentX = e.clientX;
      const dx = currentX - startX;
      const dy = e.clientY - startY;

      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
        hasMoved = true;
      }
    });

    const onPointerEnd = (e) => {
      if (!isPointerDown) return;
      isPointerDown = false;
      carousel.classList.remove('is-dragging');

      const dx = currentX - startX;
      if (hasMoved && Math.abs(dx) > 40) {
        justDragged = true;
        clearTimeout(dragSuppressTimeout);
        dragSuppressTimeout = setTimeout(() => {
          justDragged = false;
        }, 150);

        if (dx < -40 && state.card3dIndex < total - 1) {
          goToIndex(state.card3dIndex + 1);
        } else if (dx > 40 && state.card3dIndex > 0) {
          goToIndex(state.card3dIndex - 1);
        }
      }
      hasMoved = false;
    };

    window.addEventListener('pointerup', onPointerEnd);
    window.addEventListener('pointercancel', onPointerEnd);
  }

  // 3. 渲染查無結果空狀態
  function renderEmptyState(container) {
    container.innerHTML = `
      <div class="empty-search-state">
        <i class="fas fa-search" aria-hidden="true"></i>
        <h3>查無符合條件的研發成果</h3>
        <p>請嘗試其他關鍵字或切換技術領域分類</p>
      </div>
    `;
  }

  // 成果詳情檢視
  function showDetail(outcomeId, updateHash = true) {
    const outcome = state.outcomes.find(o => o.id === outcomeId || o.caseId === outcomeId);
    if (!outcome) return;

    // 記錄清單捲動位置與卡片索引
    state.savedScrollPos = window.scrollY || window.pageYOffset || 0;
    state.selectedOutcomeId = outcome.id;

    const filtered = getFilteredOutcomes();
    const fIndex = filtered.findIndex(o => o.id === outcome.id || o.caseId === outcome.id);
    if (fIndex >= 0) {
      state.card3dIndex = fIndex;
    }

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
    else if (outcome.domain.includes('海藻') || outcome.domain.includes('藍碳')) badgeClass = 'badge-bluecarbon';

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

    const validApps = (applications || []).filter(a => (a.country || a.appNo || a.patentNo || a.type));

    if (validApps.length === 0) {
      elements.detailApplicationsTbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">
            本項技術為技術秘密／Know-how，無個別專利申請案
          </td>
        </tr>
      `;
      return;
    }

    validApps.forEach(app => {
      const tr = document.createElement('tr');
      const countryCode = (app.country || '').toUpperCase();
      const countryInfo = COUNTRY_NAMES[countryCode] || { name: app.country, flag: '🌐' };

      let statusBadge = '<span class="badge-status pending">申請中</span>';
      if (app.patentNo && app.patentNo !== '—') {
        statusBadge = '<span class="badge-status granted">已獲證</span>';
      } else if (app.legalStatus && app.legalStatus.includes('獲證')) {
        statusBadge = '<span class="badge-status granted">已獲證</span>';
      }

      const patentType = app.type || app.appType || '發明專利';

      tr.innerHTML = `
        <td><span class="country-name">${countryInfo.name || app.country}</span></td>
        <td>${patentType}</td>
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

    if (elements.pageTitleDisplay) elements.pageTitleDisplay.textContent = '智財與技術成果';
    if (elements.pageSubtitleDisplay) elements.pageSubtitleDisplay.textContent = '從技術領域或關鍵字快速找到可合作的研發成果';

    if (updateHash) {
      window.location.hash = '#patents';
    }

    renderCurrentView();

    // 恢復列表捲動位置
    if (typeof state.savedScrollPos === 'number') {
      window.scrollTo({ top: state.savedScrollPos, behavior: 'auto' });
    }
  }

  // DOM 載入後執行初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
