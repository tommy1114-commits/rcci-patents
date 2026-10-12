/**
 * RCCI 智財與技術成果專區 - 前端核心應用控制器
 * 整合官方網站 (https://rcci.sinica.edu.tw/) 完整內容與智財技術成果專區
 * Research Center for Critical Issues | Academia Sinica
 */

(function () {
  'use strict';

  // 應用程式核心狀態
  const state = {
    // 導覽狀態
    activeSection: 'patents', // 'news' | 'about' | 'projects' | 'patents' | 'facilities' | 'careers'
    
    // 智財成果與申請案資料
    outcomes: [],
    allApplications: [],
    currentCategory: '全部',
    searchQuery: '',
    viewMode: 'grid', // 'grid' | 'table'
    selectedOutcomeId: null,
    syncEngine: null,

    // 官網內容篩選狀態
    newsCategory: '全部',
    projectCategory: '全部',
    careerCategory: '全部',
    aboutSubtab: 'about-intro'
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
    // 導覽列項目
    navItems: {
      news: document.getElementById('nav-news'),
      about: document.getElementById('nav-about'),
      projects: document.getElementById('nav-projects'),
      patents: document.getElementById('nav-patents'),
      facilities: document.getElementById('nav-facilities'),
      careers: document.getElementById('nav-careers')
    },
    sections: {
      news: document.getElementById('section-news'),
      about: document.getElementById('section-about'),
      projects: document.getElementById('section-projects'),
      patents: document.getElementById('section-patents'),
      facilities: document.getElementById('section-facilities'),
      careers: document.getElementById('section-careers')
    },

    // 手機導覽元件
    mobileToggle: document.getElementById('mobile-nav-toggle'),
    navMenu: document.getElementById('nav-menu'),

    // 同步與通知
    syncDot: document.getElementById('sync-dot'),
    syncText: document.getElementById('sync-text'),
    syncStatusWrapper: document.getElementById('sync-status-wrapper'),
    btnRefresh: document.getElementById('btn-refresh'),
    csvFileInput: document.getElementById('csv-file-input'),
    
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

    // 智財成果 - 詳情視圖 (PDF Pages 3-8)
    detailView: document.getElementById('detail-view'),
    breadcrumbCategory: document.getElementById('breadcrumb-category'),
    breadcrumbCaseId: document.getElementById('breadcrumb-case-id'),
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

    // 最新消息專區
    newsFilterGroup: document.getElementById('news-filter-group'),
    newsContainer: document.getElementById('news-container'),

    // 關於中心專區
    aboutTasksGrid: document.getElementById('about-tasks-grid'),
    aboutTimeline: document.getElementById('about-timeline'),
    aboutLeadershipContainer: document.getElementById('about-leadership-container'),
    aboutCommitteeGrid: document.getElementById('about-committee-grid'),

    // 研究計畫專區
    projectFilterGroup: document.getElementById('project-filter-group'),
    projectsContainer: document.getElementById('projects-container'),

    // 設施服務專區
    facilitiesContainer: document.getElementById('facilities-container'),

    // 人才招募專區
    careerFilterGroup: document.getElementById('career-filter-group'),
    careersContainer: document.getElementById('careers-container')
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
      renderAllRcciSections();
    } catch (err) {
      console.error('renderAllRcciSections error:', err);
    }

    try {
      handleHashRouting();
    } catch (err) {
      console.error('handleHashRouting error:', err);
    }
  }

  // 設定同步引擎與立即初始渲染
  function setupSyncEngine() {
    state.syncEngine = new GoogleSheetSync(APP_CONFIG);

    state.syncEngine.onStatusChange = (status, message) => {
      if (elements.syncDot) elements.syncDot.className = `status-dot ${status}`;
      if (elements.syncText) elements.syncText.textContent = message;
      if (elements.btnRefresh) {
        if (status === 'syncing') elements.btnRefresh.classList.add('spinning');
        else elements.btnRefresh.classList.remove('spinning');
      }
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

    // 立即初始渲染（優先使用 LocalStorage 快取，其次使用內建快照）
    try {
      const cached = state.syncEngine.loadFromStorage();
      if (cached && cached.data && cached.data.outcomes && cached.data.outcomes.length > 0) {
        state.outcomes = cached.data.outcomes;
        state.allApplications = cached.data.allApplications || [];
        if (elements.syncDot) elements.syncDot.className = 'status-dot fallback';
        if (elements.syncText) elements.syncText.textContent = '資料已更新 (' + state.syncEngine.formatTime(new Date(cached.syncTime)) + ')';
      } else {
        const initialSnapshot = state.syncEngine.processAndMergeData(SNAPSHOT_APPLICATIONS, SNAPSHOT_FAMILIES);
        state.outcomes = initialSnapshot.outcomes;
        state.allApplications = initialSnapshot.allApplications;
        if (elements.syncDot) elements.syncDot.className = 'status-dot fallback';
        if (elements.syncText) elements.syncText.textContent = '資料已更新 (' + state.syncEngine.formatTime(new Date()) + ')';
      }
    } catch (e) {
      console.warn('初始快顯渲染例外:', e);
      const initialSnapshot = state.syncEngine.processAndMergeData(SNAPSHOT_APPLICATIONS, SNAPSHOT_FAMILIES);
      state.outcomes = initialSnapshot.outcomes;
      state.allApplications = initialSnapshot.allApplications;
    }

    renderCategories();
    renderCurrentView();

    // 背景發動即時連線同步
    state.syncEngine.sync();

    // 週期性檢查
    setInterval(() => {
      state.syncEngine.sync();
    }, APP_CONFIG.autoSyncIntervalMs);
  }

  // 事件綁定
  function setupEventListeners() {
    // 頂部導覽列點擊切換（主動綁定確保立即響應）
    Object.keys(elements.navItems).forEach(key => {
      const navEl = elements.navItems[key];
      if (navEl) {
        navEl.addEventListener('click', (e) => {
          // 若點擊內部 a 標籤由 hashchange 處理，此處做補充保險
          switchSection(key);
        });
      }
    });

    // 手機版導覽選單開關互動
    if (elements.mobileToggle && elements.navMenu) {
      elements.mobileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = elements.navMenu.classList.toggle('open');
        elements.mobileToggle.classList.toggle('active', isOpen);
        elements.mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      // 點選任意選單連結後自動關閉手機選單
      elements.navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          elements.navMenu.classList.remove('open');
          elements.mobileToggle.classList.remove('active');
          elements.mobileToggle.setAttribute('aria-expanded', 'false');
        });
      });

      // 點選選單外任意區域自動收合
      document.addEventListener('click', (e) => {
        if (!elements.navMenu.contains(e.target) && !elements.mobileToggle.contains(e.target)) {
          elements.navMenu.classList.remove('open');
          elements.mobileToggle.classList.remove('active');
          elements.mobileToggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // 點擊頂部狀態列或刷新按鈕手動更新
    if (elements.syncStatusWrapper) {
      elements.syncStatusWrapper.addEventListener('click', () => {
        if (state.syncEngine) state.syncEngine.sync();
      });
    }
    if (elements.btnRefresh) {
      elements.btnRefresh.addEventListener('click', () => {
        if (state.syncEngine) state.syncEngine.sync();
      });
    }

    // 載入本機 CSV 檔案變更監聽
    if (elements.csvFileInput) {
      elements.csvFileInput.addEventListener('change', async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        try {
          await state.syncEngine.importLocalCsvFiles(files);
        } catch (err) {
          alert('載入資料檔案失敗：' + err.message);
        }
        elements.csvFileInput.value = '';
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
        }, 200);
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

    // 智財檢視模式切換：卡片
    if (elements.btnViewGrid) {
      elements.btnViewGrid.addEventListener('click', () => {
        state.viewMode = 'grid';
        elements.btnViewGrid.classList.add('active');
        if (elements.btnViewTable) elements.btnViewTable.classList.remove('active');
        renderCurrentView();
      });
    }

    // 智財檢視模式切換：明細總表
    if (elements.btnViewTable) {
      elements.btnViewTable.addEventListener('click', () => {
        state.viewMode = 'table';
        elements.btnViewTable.classList.add('active');
        if (elements.btnViewGrid) elements.btnViewGrid.classList.remove('active');
        renderCurrentView();
      });
    }

    // 麵包屑回到成果列表
    if (elements.breadcrumbBack) {
      elements.breadcrumbBack.addEventListener('click', (e) => {
        e.preventDefault();
        closeDetail();
      });
    }

    // 關於中心子分頁點擊切換
    document.querySelectorAll('.subtab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetId = e.currentTarget.getAttribute('data-subtab');
        document.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.subpage-panel').forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const panel = document.getElementById(targetId);
        if (panel) panel.classList.add('active');
      });
    });

    // 監聽 Hash 變更
    window.addEventListener('hashchange', handleHashRouting);
  }

  // 處理 URL Hash 路由切換
  function handleHashRouting() {
    const rawHash = window.location.hash || '#patents';
    const hash = rawHash.replace(/^#/, '');

    if (hash.startsWith('patent/')) {
      // 專利成果詳情頁
      const id = decodeURIComponent(hash.replace('patent/', ''));
      switchSection('patents');
      showDetail(id, false);
      return;
    }

    // 主專區路由切換
    if (['news', 'about', 'projects', 'patents', 'facilities', 'careers'].includes(hash)) {
      switchSection(hash);
      if (hash === 'patents' && state.selectedOutcomeId) {
        closeDetail(false);
      }
    } else {
      switchSection('patents');
    }
  }

  // 切換大導覽專區
  function switchSection(sectionKey) {
    state.activeSection = sectionKey;

    // 更新導覽列焦點
    Object.keys(elements.navItems).forEach(key => {
      if (elements.navItems[key]) {
        elements.navItems[key].classList.toggle('active', key === sectionKey);
      }
    });

    // 切換頁面專區顯示
    Object.keys(elements.sections).forEach(key => {
      if (elements.sections[key]) {
        elements.sections[key].classList.toggle('active', key === sectionKey);
      }
    });

    // 切換專區時收合手機版導覽選單
    if (elements.mobileToggle && elements.navMenu) {
      elements.navMenu.classList.remove('open');
      elements.mobileToggle.classList.remove('active');
      elements.mobileToggle.setAttribute('aria-expanded', 'false');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ========================================================
  // 渲染官網完整內容（最新消息、關於、計畫、設施、人才）
  // ========================================================
  function renderAllRcciSections() {
    if (typeof RCCI_WEBSITE_DATA === 'undefined') return;
    renderNews();
    renderAbout();
    renderProjects();
    renderFacilities();
    renderCareers();
  }

  // 1. 最新消息渲染
  function renderNews() {
    const data = RCCI_WEBSITE_DATA.news || [];
    
    // 計算類別數量
    const categories = ['全部'];
    data.forEach(item => {
      if (!categories.includes(item.category)) categories.push(item.category);
    });

    // 渲染分類按鈕
    elements.newsFilterGroup.innerHTML = '';
    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `filter-btn ${state.newsCategory === cat ? 'active' : ''}`;
      const count = cat === '全部' ? data.length : data.filter(d => d.category === cat).length;
      btn.innerHTML = `<span>${cat}</span> <span class="filter-count">${count}</span>`;
      btn.addEventListener('click', () => {
        state.newsCategory = cat;
        renderNews();
      });
      elements.newsFilterGroup.appendChild(btn);
    });

    // 渲染新聞卡片
    const filtered = data.filter(item => state.newsCategory === '全部' || item.category === state.newsCategory);
    elements.newsContainer.innerHTML = '';

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'news-card';
      const tagsHtml = (item.tags || []).map(t => `<span class="news-tag">#${t}</span>`).join('');

      card.innerHTML = `
        <div>
          <div class="news-header">
            <span class="badge ${item.badgeClass}">${item.category}</span>
            <span class="news-date">${item.date}</span>
          </div>
          <h3 class="news-title">${item.title}</h3>
          <div class="news-location">📍 ${item.location}</div>
          <p class="news-summary">${item.summary}</p>
        </div>
        <div class="news-tags">${tagsHtml}</div>
      `;
      elements.newsContainer.appendChild(card);
    });
  }

  // 2. 關於中心渲染
  function renderAbout() {
    const aboutData = RCCI_WEBSITE_DATA.about;
    if (!aboutData) return;

    // 四大任務
    elements.aboutTasksGrid.innerHTML = '';
    (aboutData.intro.tasks || []).forEach(task => {
      const div = document.createElement('div');
      div.className = 'mission-card';
      div.innerHTML = `
        <h4 class="mission-card-title">${task.title}</h4>
        <p class="mission-card-desc">${task.desc}</p>
      `;
      elements.aboutTasksGrid.appendChild(div);
    });

    // 沿革時間軸
    elements.aboutTimeline.innerHTML = '';
    (aboutData.history.milestones || []).forEach(m => {
      const item = document.createElement('div');
      item.className = 'timeline-item';
      item.innerHTML = `
        <div class="timeline-dot"></div>
        <div class="timeline-year">${m.year} 年</div>
        <div class="timeline-desc">${m.event}</div>
      `;
      elements.aboutTimeline.appendChild(item);
    });

    // 首長個人簡歷與智財窗口
    const lead = aboutData.leadership;
    elements.aboutLeadershipContainer.innerHTML = `
      <div class="profile-card">
        <div class="profile-header">
          <div class="profile-avatar">李</div>
          <div>
            <h3 class="profile-name">${lead.director.name}</h3>
            <div class="profile-title">${lead.director.title}</div>
            <div class="profile-email">✉ <a href="mailto:${lead.director.email}" style="color:var(--primary);">${lead.director.email}</a> · ${lead.director.degree}</div>
          </div>
        </div>
        <div style="font-size: 14px; color: #475569; line-height: 1.7;">
          <p><strong>專長領域：</strong>${lead.director.expertise.join('、')}</p>
          <p style="margin-top: 6px;"><strong>主要經歷：</strong>${lead.director.experiences.join(' ｜ ')}</p>
        </div>
      </div>

      <div class="profile-card">
        <div class="profile-header">
          <div class="profile-avatar" style="background: linear-gradient(135deg, #10b981, #065f46);">夏</div>
          <div>
            <h3 class="profile-name">${lead.deputyDirector.name}</h3>
            <div class="profile-title">${lead.deputyDirector.title}</div>
            <div class="profile-email">✉ <a href="mailto:${lead.deputyDirector.email}" style="color:var(--primary);">${lead.deputyDirector.email}</a> · ${lead.deputyDirector.degree}</div>
          </div>
        </div>
        <div style="font-size: 14px; color: #475569; line-height: 1.7;">
          <p><strong>專長領域：</strong>${lead.deputyDirector.expertise.join('、')}</p>
          <p style="margin-top: 6px;"><strong>主要經歷：</strong>${lead.deputyDirector.experiences.join(' ｜ ')}</p>
      </div>
    `;

    // 學術諮詢委員會
    elements.aboutCommitteeGrid.innerHTML = '';
    (aboutData.committee || []).forEach(comm => {
      const card = document.createElement('div');
      card.className = 'committee-card';
      card.innerHTML = `
        <div class="committee-name">${comm.name} <span style="font-size:13px; font-weight:normal; color:#64748b;">${comm.title}</span></div>
        <div class="committee-role">${comm.role}</div>
        <div class="committee-affil">${comm.affil}</div>
      `;
      elements.aboutCommitteeGrid.appendChild(card);
    });
  }

  // 3. 研究計畫渲染
  function renderProjects() {
    const projects = RCCI_WEBSITE_DATA.projects || [];
    
    // 分類過濾按鈕
    const domains = ['全部', '淨零科技', '量子科技', '海洋科技', '數位人文'];
    elements.projectFilterGroup.innerHTML = '';
    domains.forEach(d => {
      const btn = document.createElement('button');
      btn.className = `filter-btn ${state.projectCategory === d ? 'active' : ''}`;
      
      const count = d === '全部' ? projects.length : projects.filter(p => {
        if (d === '淨零科技') return ['太陽能', '去碳燃氫', '海洋能', '海洋生態'].includes(p.domain);
        if (d === '量子科技') return p.domain === '量子科技';
        if (d === '海洋科技') return ['海洋能', '海洋科技', '海洋生態'].includes(p.domain);
        if (d === '數位人文') return p.domain === '數位人文';
        return false;
      }).length;

      btn.innerHTML = `<span>${d}</span> <span class="filter-count">${count}</span>`;
      btn.addEventListener('click', () => {
        state.projectCategory = d;
        renderProjects();
      });
      elements.projectFilterGroup.appendChild(btn);
    });

    // 計畫清單過濾
    const filtered = projects.filter(p => {
      if (state.projectCategory === '全部') return true;
      if (state.projectCategory === '淨零科技') return ['太陽能', '去碳燃氫', '海洋能', '海洋生態'].includes(p.domain);
      if (state.projectCategory === '量子科技') return p.domain === '量子科技';
      if (state.projectCategory === '海洋科技') return ['海洋能', '海洋科技', '海洋生態'].includes(p.domain);
      if (state.projectCategory === '數位人文') return p.domain === '數位人文';
      return true;
    });

    elements.projectsContainer.innerHTML = '';
    filtered.forEach(p => {
      const card = document.createElement('div');
      card.className = 'project-card';
      const milestonesHtml = (p.milestones || []).map(m => `<li>${m}</li>`).join('');

      card.innerHTML = `
        <div>
          <div class="project-tags">
            <span class="badge ${p.badgeClass}">${p.domain}</span>
            <span class="badge badge-default">${p.type}</span>
          </div>
          <h3 class="project-title">${p.title}</h3>
          <div class="project-meta">
            <strong>主持人：</strong>${p.leader}<br>
            <strong>連絡電話：</strong>${p.phone} ｜ <strong>實驗室：</strong>${p.location}
          </div>
          <p class="project-summary">${p.summary}</p>
          <div class="milestone-box">
            <div class="milestone-title">🎯 計畫重大里程碑</div>
            <ul class="milestone-list">${milestonesHtml}</ul>
          </div>
        </div>
        <div>
          ${p.relatedPatents && p.relatedPatents.length > 0 ? `
            <button class="btn-view-ip" data-domain="${p.domain}">
              🔍 查看本計畫智財專利成果 (${p.relatedPatents.length} 家族) ➔
            </button>
          ` : `
            <div style="font-size:12.5px; color:#64748b; text-align:center; padding:8px;">
              ${p.ipConnectionNote}
            </div>
          `}
        </div>
      `;

      // 串聯智財專利點擊事件
      const ipBtn = card.querySelector('.btn-view-ip');
      if (ipBtn) {
        ipBtn.addEventListener('click', () => {
          const targetDomain = p.domain === '量子科技' ? '量子科技' : p.domain;
          state.currentCategory = targetDomain;
          window.location.hash = '#patents';
          renderCategories();
          renderCurrentView();
        });
      }

      elements.projectsContainer.appendChild(card);
    });
  }

  // 4. 設施服務渲染
  function renderFacilities() {
    const facilities = RCCI_WEBSITE_DATA.facilities || [];
    elements.facilitiesContainer.innerHTML = '';

    facilities.forEach(f => {
      const card = document.createElement('div');
      card.className = 'facility-card';
      const eqHtml = (f.equipment || []).map(eq => `<li>${eq}</li>`).join('');

      card.innerHTML = `
        <h3 class="facility-name">${f.name}</h3>
        <div class="facility-loc">📍 ${f.location} ｜ 管理團隊：${f.manager}</div>
        <p class="facility-intro">${f.intro}</p>
        <div style="background: #f8fafc; border-radius: var(--radius-sm); padding: 14px; border: 1px solid var(--border-color);">
          <div class="equipment-heading">🔬 配備核心儀器與設備：</div>
          <ul class="equipment-list">${eqHtml}</ul>
          <div style="font-size: 12.5px; color: #64748b; margin-top: 10px; border-top: 1px solid #e2e8f0; padding-top: 8px;">
            <strong>服務對象：</strong>${f.serviceTarget}
          </div>
        </div>
      `;
      elements.facilitiesContainer.appendChild(card);
    });
  }

  // 5. 人才招募渲染
  function renderCareers() {
    const recruitments = RCCI_WEBSITE_DATA.recruitments || [];
    
    // 分類標籤
    const filters = ['全部', '南部院區', '北部院區', '研究技術人員', '專案研究/博士後', '研究助理', '行政助理'];
    elements.careerFilterGroup.innerHTML = '';

    filters.forEach(f => {
      const btn = document.createElement('button');
      btn.className = `filter-btn ${state.careerCategory === f ? 'active' : ''}`;
      
      const count = f === '全部' ? recruitments.length : recruitments.filter(r => {
        if (f === '南部院區') return r.campus.includes('南部');
        if (f === '北部院區') return r.campus.includes('北部');
        if (f === '研究技術人員') return r.position.includes('研究技術人員');
        if (f === '專案研究/博士後') return r.position.includes('博士後') || r.position.includes('專案研究');
        if (f === '研究助理') return r.position.includes('研究助理') && !r.position.includes('行政');
        if (f === '行政助理') return r.position.includes('行政助理');
        return false;
      }).length;

      btn.innerHTML = `<span>${f}</span> <span class="filter-count">${count}</span>`;
      btn.addEventListener('click', () => {
        state.careerCategory = f;
        renderCareers();
      });
      elements.careerFilterGroup.appendChild(btn);
    });

    // 職缺列表過濾
    const filtered = recruitments.filter(r => {
      if (state.careerCategory === '全部') return true;
      if (state.careerCategory === '南部院區') return r.campus.includes('南部');
      if (state.careerCategory === '北部院區') return r.campus.includes('北部');
      if (state.careerCategory === '研究技術人員') return r.position.includes('研究技術人員');
      if (state.careerCategory === '專案研究/博士後') return r.position.includes('博士後') || r.position.includes('專案研究');
      if (state.careerCategory === '研究助理') return r.position.includes('研究助理') && !r.position.includes('行政');
      if (state.careerCategory === '行政助理') return r.position.includes('行政助理');
      return true;
    });

    elements.careersContainer.innerHTML = '';
    filtered.forEach(r => {
      const card = document.createElement('div');
      card.className = 'career-card';
      const detailUrl = r.url || `https://rcci.sinica.edu.tw/recruitment.php?id=${r.id}`;

      card.innerHTML = `
        <div>
          <div class="career-unit">${r.campus} ｜ ${r.unit}</div>
          <h3 class="career-title">
            <a href="${detailUrl}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: none;" title="前往官方網站查看詳細內容">
              ${r.position}
            </a>
          </h3>
          <div class="career-period">📅 徵才期間：${r.period}</div>
          <p class="career-desc">${r.description}</p>
          <div class="career-req"><strong>資格條件：</strong>${r.requirements}</div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 14px;">
          <span style="font-size: 13px; color: var(--text-muted);">
            聯絡信箱：<a href="mailto:${r.contact}?subject=應徵關鍵中心職缺：${encodeURIComponent(r.position)}" style="color: inherit; text-decoration: underline;">${r.contact}</a>
          </span>
          <a href="${detailUrl}" target="_blank" rel="noopener noreferrer" class="btn-apply" title="前往官方網站查看詳細內容">
            詳細內容 ➔
          </a>
        </div>
      `;
      elements.careersContainer.appendChild(card);
    });
  }

  // ========================================================
  // 智財成果邏輯 (卡片、詳情視圖)
  // ========================================================
  function getFilteredOutcomes() {
    return state.outcomes.filter(item => {
      // 分類篩選
      const matchesCategory = state.currentCategory === '全部' || 
        item.domain === state.currentCategory ||
        (state.currentCategory === '量子科技' && (item.domain === '量子電腦' || item.domain === '量子科技'));

      if (!matchesCategory) return false;

      // 關鍵字搜尋
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

  // 渲染智財分類篩選鈕 (PDF Page 2 樣式: 全部 6/9, 太陽能 5, 量子科技 1, 去碳燃氫 3)
  function renderCategories() {
    const counts = { '全部': state.outcomes.length };
    
    state.outcomes.forEach(item => {
      counts[item.domain] = (counts[item.domain] || 0) + 1;
    });

    const domainOrder = ['太陽能', '量子電腦', '去碳燃氫'];
    const otherDomains = Object.keys(counts).filter(k => k !== '全部' && !domainOrder.includes(k));
    const allCategories = ['全部', ...domainOrder.filter(d => counts[d] > 0), ...otherDomains];

    elements.filterContainer.innerHTML = '';
    allCategories.forEach(cat => {
      const btn = document.createElement('button');
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

  // 渲染智財當前檢視
  function renderCurrentView() {
    if (state.selectedOutcomeId) return;

    if (state.viewMode === 'grid') {
      elements.cardGrid.style.display = 'grid';
      elements.tableContainer.classList.remove('active');
      renderCardGrid();
    } else {
      elements.cardGrid.style.display = 'none';
      elements.tableContainer.classList.add('active');
      renderAllApplicationsTable();
    }
  }

  // 渲染成果卡片網格 (PDF Page 2)
  function renderCardGrid() {
    const filtered = getFilteredOutcomes();
    elements.cardGrid.innerHTML = '';

    if (filtered.length === 0) {
      elements.cardGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🔍</div>
          <h3>查無符合條件的研發成果</h3>
          <p style="margin-top: 6px;">請嘗試更換關鍵字或點選「全部」分類標籤。</p>
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

      const countryPills = item.countries.slice(0, 4).map(c => {
        const flag = COUNTRY_NAMES[c]?.flag || '🌐';
        return `<span class="country-pill">${flag} ${c}</span>`;
      }).join('');
      const moreCount = item.countries.length > 4 ? `<span class="country-pill">+${item.countries.length - 4}</span>` : '';

      card.innerHTML = `
        <div class="card-top">
          <span class="badge ${badgeClass}">${item.domain}</span>
          <span class="card-case-id">${item.caseId}</span>
        </div>
        <h3 class="card-title">${item.title}</h3>
        <div class="card-bottom">
          <div class="card-countries">
            ${countryPills} ${moreCount}
          </div>
          <span class="card-action-text">詳情與專利家族 ➔</span>
        </div>
      `;

      card.addEventListener('click', () => {
        window.location.hash = `#patent/${encodeURIComponent(item.id)}`;
      });

      elements.cardGrid.appendChild(card);
    });
  }

  // 渲染各國申請案總表
  function renderAllApplicationsTable() {
    elements.allAppsTableBody.innerHTML = '';
    const query = (state.searchQuery || '').toLowerCase();

    const filtered = state.allApplications.filter(app => {
      const domainMatches = state.currentCategory === '全部' || 
        (app['單位'] || '').includes(state.currentCategory);
      if (!domainMatches) return false;

      if (!query) return true;
      return Object.values(app).some(val => (val || '').toLowerCase().includes(query));
    });

    if (filtered.length === 0) {
      elements.allAppsTableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 40px; color: #64748b;">
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

      let statusBadge = '<span class="status-badge pending">申請中</span>';
      if (app['專利號'] || (app['備註'] && app['備註'].includes('已獲證'))) {
        statusBadge = '<span class="status-badge granted">已獲證</span>';
      } else if (app['備註'] && app['備註'].includes('審閱中')) {
        statusBadge = '<span class="status-badge reviewing">審閱中</span>';
      }

      tr.innerHTML = `
        <td style="font-family: ui-monospace, monospace; font-weight: 600;">${app['家族編號'] || '-'}</td>
        <td style="font-family: ui-monospace, monospace;">${app['院內案件編號'] || '-'}</td>
        <td><span class="country-flag-badge">${countryInfo.flag} ${countryCode || '-'}</span></td>
        <td>${app['申請類型'] || '-'}</td>
        <td style="font-weight: 600;">${app['專利名稱'] || '-'}</td>
        <td style="font-family: ui-monospace, monospace;">${app['申請號'] || '-'}</td>
        <td style="font-family: ui-monospace, monospace;">${app['專利號'] || '-'}</td>
        <td>${statusBadge}</td>
      `;

      tr.style.cursor = 'pointer';
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

  // 成果詳情檢視 (PDF Pages 3-8 架構)
  function showDetail(outcomeId, updateHash = true) {
    const outcome = state.outcomes.find(o => o.id === outcomeId || o.caseId === outcomeId);
    if (!outcome) return;

    state.selectedOutcomeId = outcome.id;

    if (updateHash) {
      window.location.hash = `#patent/${encodeURIComponent(outcome.id)}`;
    }

    elements.breadcrumbCategory.textContent = outcome.domain;
    elements.breadcrumbCaseId.textContent = outcome.caseId;

    let badgeClass = 'badge-default';
    if (outcome.domain.includes('太陽能')) badgeClass = 'badge-solar';
    else if (outcome.domain.includes('量子')) badgeClass = 'badge-quantum';
    else if (outcome.domain.includes('去碳') || outcome.domain.includes('燃氫')) badgeClass = 'badge-hydrogen';

    elements.detailCategoryBadge.className = `badge ${badgeClass}`;
    elements.detailCategoryBadge.textContent = outcome.domain;

    elements.detailTitle.textContent = outcome.title || '—';
    elements.detailAbstract.textContent = outcome.abstract || '—';

    elements.detailCaseId.textContent = outcome.caseId || '—';
    elements.detailPublishDate.textContent = outcome.publishDate || '—';
    elements.detailInventors.textContent = outcome.inventors || '—';
    elements.detailLegalStatus.textContent = outcome.legalStatus || '—';
    elements.detailFamilyId.textContent = outcome.familyId || outcome.caseId || '—';
    elements.detailProject.textContent = outcome.project || '—';
    elements.detailLicenseStatus.textContent = outcome.licenseStatus || '—';

    // 設定智財技轉處官方技術資料超連結 (各案件專屬)
    if (elements.btnTechLink) {
      if (outcome.techUrl) {
        elements.btnTechLink.href = outcome.techUrl;
        elements.btnTechLink.style.display = 'inline-flex';
      } else {
        elements.btnTechLink.style.display = 'none';
      }
    }

    renderDetailApplications(outcome.applications);

    elements.listView.style.display = 'none';
    elements.detailView.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 渲染成果各國申請案
  function renderDetailApplications(applications) {
    elements.detailApplicationsTbody.innerHTML = '';

    if (!applications || applications.length === 0) {
      elements.detailApplicationsTbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: #64748b; padding: 24px;">
            本項技術尚無各國提申明細紀錄
          </td>
        </tr>
      `;
      return;
    }

    applications.forEach(app => {
      const tr = document.createElement('tr');
      const countryCode = app.country || '';
      const countryInfo = COUNTRY_NAMES[countryCode] || { name: countryCode, flag: '🌐' };

      let statusBadge = '<span class="status-badge pending">申請中</span>';
      if (app.patentNo || (app.remarks && app.remarks.includes('已獲證'))) {
        statusBadge = '<span class="status-badge granted">已獲證</span>';
      } else if (app.remarks && app.remarks.includes('審閱中')) {
        statusBadge = '<span class="status-badge reviewing">審閱中</span>';
      }

      tr.innerHTML = `
        <td><span class="country-flag-badge">${countryInfo.flag} ${countryCode || '-'}</span></td>
        <td>${app.appType || '-'}</td>
        <td style="font-family: ui-monospace, monospace;">${app.appNo || '-'}</td>
        <td>${app.appDate || '-'}</td>
        <td style="font-family: ui-monospace, monospace; font-weight: 600; color: #0284c7;">${app.patentNo || '-'}</td>
        <td>${statusBadge}</td>
      `;

      elements.detailApplicationsTbody.appendChild(tr);
    });
  }

  // 關閉詳情回到列表
  function closeDetail(updateHash = true) {
    state.selectedOutcomeId = null;
    if (updateHash) {
      window.location.hash = '#patents';
    }
    elements.detailView.classList.remove('active');
    elements.listView.style.display = 'block';
    renderCurrentView();
  }


  // 程式啟動（支援 DOMContentLoaded 及非同步載入情境）
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
