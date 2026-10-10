/**
 * RCCI 官方網站完整內容資料庫
 * 自中央研究院關鍵議題研究中心官方網站 (https://rcci.sinica.edu.tw/) 完整萃取並結構化整理
 * 配合智財管理網頁架構與中研院品牌風格進行適配
 */

const RCCI_WEBSITE_DATA = {
  // 1. 最新消息與活動公告 (對齊官網 newsList.php & newsList2.php)
  news: [
    {
      id: 118,
      category: '設施公告',
      badgeClass: 'badge-quantum',
      date: '2026-09-30',
      title: 'QC-Fab「超導金屬薄膜成長」服務正式開放接受委託',
      summary: '關鍵中心量子晶片製程研發平台（QC-Fab）完成超導金屬薄膜設備調校，即日起正式對外開放超導鈮（Nb）、鋁（Al）與鉭（Ta）等高品質薄膜鍍膜委託服務，歡迎產學研團隊申請預約。',
      location: '南部院區 研究大樓Ⅱ QC-Fab',
      tags: ['QC-Fab', '超導薄膜', '設施服務']
    },
    {
      id: 115,
      category: '活動報導',
      badgeClass: 'badge-default',
      date: '2026-09-08',
      title: 'Open Lab 關鍵中心跨領域大專生體驗營圓滿結束',
      summary: '為培育前瞻科技跨領域研發人才，關鍵中心於南部院區舉辦跨領域大專生體驗營，吸引全國數十位優秀青年學子實地參訪量子晶片製程、下世代太陽能電池實驗室與海洋能觀測核心平台。',
      location: '南部院區 沙崙智慧綠能科學城',
      tags: ['人才培育', 'Open Lab', '學術交流']
    },
    {
      id: 114,
      category: '人事動態',
      badgeClass: 'badge-hydrogen',
      date: '2026-09-03',
      title: '恭賀夏復國研究員獲聘為中央研究院特聘研究員',
      summary: '本中心副主任夏復國博士長期致力於海洋生態系統、生地化碳循環與藍碳匯研究，學術貢獻卓越，獲聘為中央研究院特聘研究員。',
      location: '中央研究院 關鍵議題研究中心',
      tags: ['榮譽獎項', '主管動態', '海洋藍碳']
    },
    {
      id: 113,
      category: '活動報導',
      badgeClass: 'badge-hydrogen',
      date: '2026-08-26',
      title: '阿曼國立科技大學參訪去碳燃氫團隊試驗場',
      summary: '阿曼國立科技大學代表團蒞臨本中心參訪去碳燃氫電漿甲烷裂解試驗場，雙方針對中東天然氣產區導入無碳排產氫與固碳材料應用深入交換意見，開拓綠能國際合作契機。',
      location: '南部院區 去碳燃氫試驗場',
      tags: ['去碳燃氫', '國際合作', '淨零碳排']
    },
    {
      id: 112,
      category: '研究成果',
      badgeClass: 'badge-quantum',
      date: '2026-08-14',
      title: '恭喜量子團隊榮獲 2026 未來科技獎！',
      summary: '量子電腦專題中心以「高保真度超導量子位元邏輯閘與可擴展晶片微奈米製程技術」榮獲國科會 2026 未來科技獎殊榮，展現台灣在量子硬體製造的頂尖突破。',
      location: '國家科學及技術委員會',
      tags: ['量子電腦', '未來科技獎', '前瞻硬體']
    },
    {
      id: 111,
      category: '活動報導',
      badgeClass: 'badge-quantum',
      date: '2026-08-07',
      title: '量子與AI：SINICA × NCHC CUDA-Q Agentic Coding Bootcamp 圓滿落幕',
      summary: '本中心與國網中心、NVIDIA 攜手舉辦量子混成運算工作坊，深入探討 CUDA-Q 於超導量子電路模擬與量子機器學習之應用實務。',
      location: '南部院區 階梯演講廳',
      tags: ['CUDA-Q', '量子運算', 'AI跨領域']
    },
    {
      id: 110,
      category: '研究成果',
      badgeClass: 'badge-hydrogen',
      date: '2026-08-06',
      title: '海洋能：使用混合型 AI 預測黑潮發電機場址流速效能',
      summary: '海洋能專題中心結合數值同化模式與深度學習架構，成功將黑潮 3-7 天短期流速預測誤差降至 10% 以內，大幅優化發電機組陣列配置評估效率。',
      location: '台灣東部海域 示範場址',
      tags: ['海洋能', '黑潮發電', 'AI預測']
    },
    {
      id: 105,
      category: '活動報導',
      badgeClass: 'badge-solar',
      date: '2026-07-27',
      title: '第六屆台灣鈣鈦礦技術暨應用論壇盛大登場',
      summary: '下世代太陽能電池團隊展示疊層式鈣鈦礦/矽太陽能電池最新實驗數據，大面積元件轉換效率持續領先國內標準，產業界反應熱烈。',
      location: '台北國際會議中心',
      tags: ['太陽能', '鈣鈦礦', '產學論壇']
    },
    {
      id: 58,
      category: '研究成果',
      badgeClass: 'badge-hydrogen',
      date: '2026-02-10',
      title: '本中心甲烷裂解製氫設備達試量產規模，成果獲頂尖期刊刊登',
      summary: '去碳燃氫計畫團隊成功研發高溫電漿裂解設備，達成穩定連續運轉並成功產出高純度固態碳黑與氫氣，技術專利已於多國提申並獲證。',
      location: '中央研究院 關鍵中心',
      tags: ['去碳燃氫', '專利技術', '國際期刊']
    },
    {
      id: 116,
      category: '活動公告',
      badgeClass: 'badge-default',
      date: '2026-11-14',
      title: '中研院院區開放系列活動 OPEN HOUSE 南院開放日！',
      summary: '中研院南部院區年度最大盛事！關鍵議題研究中心將開放量子實驗室、先進太陽能電池實驗室與海洋觀測展示間，歡迎各界蒞臨參觀。',
      location: '中研院南部院區（台南沙崙）',
      tags: ['院區開放', 'Open House', '科學普及']
    }
  ],

  // 2. 關於中心 (對齊官網 intro.php, histories.php, members.php, committee.php)
  about: {
    intro: {
      title: '成立宗旨與使命',
      establishmentDate: '2024 年 1 月',
      nameZh: '中央研究院 關鍵議題研究中心',
      nameEn: 'Research Center for Critical Issues (RCCI), Academia Sinica',
      description: '中央研究院為協助國家社會因應重大挑戰，以具世界級競爭力之研發成果提出關鍵問題解方，於 2024 年 1 月正式成立「關鍵議題研究中心」（RCCI）。身為中研院最新的研究實體單位，本中心著重於「創新力、實踐力、影響力」，期許打造為中研院的大型「前瞻實驗室」，以全新思維與作法協助國家解決重大社會與科技關鍵問題。',
      tasks: [
        {
          title: '學術行政與高端設施維運',
          desc: '負責關鍵議題前瞻研究計畫之學術行政管考，以及南部院區研究大樓Ⅱ、量子大樓等尖端研究設施的長期營運與對外開放服務。'
        },
        {
          title: '關鍵議題前瞻戰略選題',
          desc: '根據世界科技發展前沿（如量子計算、次世代能源、AI應用）及國家社會迫切需求，挑選關鍵議題並規劃 3-5 年具階段性里程碑之跨領域研究計畫。'
        },
        {
          title: '政府政策建言與預算規劃',
          desc: '整合跨學門科學實證數據，協助中央研究院向政府部會提出前瞻科技建言，並積極爭取規劃適當之國家級科研發展資源。'
        },
        {
          title: '垂直整合研究與成果落地',
          desc: '邀請院內外專家組成垂直整合研發團隊，落實從基礎科學、關鍵專利佈局到實海域/試量產驗證，並深入探究新科技對社會、法規與環境的深遠影響。'
        }
      ],
      selectionPrinciples: [
        '協助解決全球科學及台灣社會迫切關鍵問題。',
        '立足於深厚基礎研究（涵蓋數理科學、生命科學與人文社會科學）。',
        '已有初步解題方向，且在 3 至 5 年內可達成具體驗證之階段性里程碑。',
        '合聘院內外專家跨界組成團隊，推動自上而下的垂直整合研究。',
        '由學術諮詢總會成立推動辦公室，進行動態管考、推動協助與成果獎勵。'
      ]
    },
    history: {
      title: '南部院區發展沿革',
      summary: '中央研究院南部院區座落於台南沙崙智慧綠能科學城，係國家平衡南北學術發展、推動前瞻科研實證的戰略聚落。',
      milestones: [
        { year: '2012', event: '總統府核定中央研究院規劃設立南部院區，選址於台南高鐵沙崙特定區。' },
        { year: '2017', event: '南部院區第一期工程動工，聚焦綠能科技、農業生技與循環經濟。' },
        { year: '2020', event: '南部院區研究大樓Ⅰ落成啟用，農生中心與人文社會研究團隊進駐。' },
        { year: '2024', event: '關鍵議題研究中心（RCCI）正式成立，進駐研究大樓Ⅱ，量子大樓展開建設，成為南台灣前瞻關鍵科技研發重鎮。' },
        { year: '2026', event: '自研 5 位元超導量子電腦雲端上線、下世代太陽能電池效率突破 31%、去碳燃氫試量產設備運轉，跨領域智財與產學成果豐碩。' }
      ]
    },
    leadership: {
      director: {
        name: '李超煌 博士',
        title: '關鍵議題研究中心 主任',
        email: 'clee@as.edu.tw',
        degree: '國立台灣大學 電機工程博士 (1997)',
        expertise: ['光學顯微術與相關科技', '細胞－微環境交互作用', '微流道生醫元件', '前瞻設施營運管理'],
        experiences: [
          '2024-迄今 中央研究院關鍵議題研究中心 主任',
          '2016-迄今 中央研究院學術諮詢總會 副執行秘書',
          '2014-2016 中央研究院應用科學研究中心 副主任',
          '2011-2014 國立陽明大學生醫光電研究所 所長',
          '2010-迄今 中央研究院應用科學研究中心 研究員'
        ]
      },
      deputyDirector: {
        name: '夏復國 博士',
        title: '關鍵議題研究中心 副主任 / 特聘研究員',
        email: 'fkshiah@as.edu.tw',
        degree: '美國馬里蘭大學 海洋、河口與環境科學博士 (1993)',
        expertise: ['海洋生態學', '生地化碳循環', '海藻藍碳碳匯量測', '環境變遷評估'],
        experiences: [
          '2024-迄今 中央研究院關鍵議題研究中心 副主任',
          '2026 獲聘為中央研究院 特聘研究員',
          '中央研究院環境變遷研究中心 研究員'
        ]
      }
    },
    committee: [
      { name: '陳于高', title: '特聘研究員', role: '召集人', affil: '中央研究院地球科學研究所' },
      { name: '江台章', title: '院士', role: '委員', affil: '中央研究院院士 / 物理學領域' },
      { name: '王玉麟', title: '特聘研究員', role: '委員', affil: '中央研究院原子與分子科學研究所' },
      { name: '呂妙芬', title: '研究員', role: '委員', affil: '中央研究院近代史研究所 / 人文社會基地副執秘' },
      { name: '邱繼輝', title: '特聘研究員', role: '委員', affil: '中央研究院生物化學研究所' },
      { name: '彭信坤', title: '特聘研究員', role: '委員', affil: '中央研究院經濟研究所' },
      { name: '廖弘源', title: '特聘研究員', role: '委員', affil: '中央研究院資訊科學研究所' },
      { name: '魏培坤', title: '研究員', role: '委員', affil: '中央研究院應用科學研究中心' }
    ]
  },

  // 3. 專題中心與研究計畫 (對齊官網 thematic.php & project.php)
  projects: [
    {
      id: 'thematic-quantum',
      type: '專題中心',
      domain: '量子科技',
      badgeClass: 'badge-quantum',
      title: '量子電腦專題中心',
      leader: '陳啟東 執行長 (chiidong@as.edu.tw)',
      phone: '(02) 2789-8372',
      location: '南部院區 研究大樓Ⅱ / 北部物理所',
      relatedPatents: ['PF-001', '34A-1131114'],
      summary: '研製具有卓越雙位元邏輯閘保真度的高性能超導量子電腦。標準化超導微奈米製造流程、優化設備設計與微波控制方案，開發 5 位元至更高規模之容錯量子運算系統。',
      milestones: [
        '完成中研院自研自製五位元超導量子電腦，平均相干時間 T1 = 28 μs。',
        '單量子位元邏輯閘保真度達 99.7%、完成雙位元 SWAP 及 CZ 閘操作。',
        '完成 3Q 之 GHZ 態表徵、4Q 及 5Q 糾纏態展示，成功開展雲端運算展示系統。'
      ],
      ipConnectionNote: '核心智財成果：高品質超導金屬材料蝕刻與氧化製程（本院覽號：34A-1131114，已於美提申專利）。'
    },
    {
      id: 'project-solar',
      type: '前瞻關鍵計畫',
      domain: '太陽能',
      badgeClass: 'badge-solar',
      title: '下世代太陽能電池研究計畫',
      leader: '朱治偉 研究員 (gchu@as.edu.tw)、郭宗枋 研究員 (guotf@as.edu.tw)',
      phone: '(06) 216-7809',
      location: '南部院區 高效太陽光電實驗室',
      relatedPatents: ['PF-002', 'PF-003', 'PF-004', 'PF-005', 'PF-006'],
      summary: '以矽基電池為基底，結合高吸收率鈣鈦礦材料發展雙接面疊層電池，突破單層電池 Shockley-Queisser 理論極限，光電轉換效率大幅推升突破 31%，帶動國內綠能核心零組件升級。',
      milestones: [
        '堆疊於客製化 HJT 與商業化 TOPCon 矽基板，轉換效率分別推升至 30.1% 與 27.3%。',
        '研發專利性自組裝分子（SAMs）電洞傳輸層，顯著提升開路電壓 Voc。',
        '開發複合蒸鍍－溶液法共形沉積技術與耐候型外包裝真空盒量測專利。'
      ],
      ipConnectionNote: '核心智財成果：涵蓋 34A-1140709、34A-1150223、34A-1150304、34A-1150305、34A-1150325 等 5 大專利家族，廣泛佈局台、美、中等國。'
    },
    {
      id: 'project-methane-pyrolysis',
      type: '前瞻關鍵計畫',
      domain: '去碳燃氫',
      badgeClass: 'badge-hydrogen',
      title: '去碳燃氫研究計畫 (電漿甲烷裂解)',
      leader: '去碳燃氫研發團隊',
      phone: '(02) 2787-2500',
      location: '南部院區 潔淨能源試驗場',
      relatedPatents: ['PF-007', 'PF-008', 'PF-009'],
      summary: '利用高溫電漿裂解甲烷等碳氫化合物氣體，在無氧環境下將氣體直接裂解為高價值固態碳黑與潔淨氫氣，實現零直接 CO₂ 排放之產氫技術，兼具固碳與分散式發電效益。',
      milestones: [
        '電漿裂解裝置達成試量產連續穩定運轉規模，獲國際權威頂尖期刊刊登。',
        '技術於台灣、日本、韓國已順利獲頒發明專利（TW I905526, JP 7838178, KR 10-2957957）。',
        '開發新一代分離式點火電漿源與反應電漿源系統，大幅提高電極壽命與產氫能效。'
      ],
      ipConnectionNote: '核心智財成果：02A-1110615 多國專利佈局（台美中日韓歐澳加PCT）已多國獲證；34A-1150903 電漿雙源系統審閱中。'
    },
    {
      id: 'thematic-marine-energy',
      type: '專題中心',
      domain: '海洋能',
      badgeClass: 'badge-default',
      title: '海洋能專題中心 (黑潮洋流發電)',
      leader: '吳朝榮 執行長 (chauron@as.edu.tw)',
      phone: '(06) 216-7911',
      location: '南部院區 海洋物理與洋流發電實驗室',
      relatedPatents: [],
      summary: '透過多學科協作研製 100 kW 浮游式黑潮發電機，結合實海域錨繫測試、精細海底地形與擬三維地球物理探勘，建構全台首座黑潮洋流發電示範場域。',
      milestones: [
        '完成 100 kW 洋流發電機船拖發電測試，驗證浮力、平衡與發電性能。',
        '建構高精度數值同化模式與 AI 預測模型，黑潮短期流速預測誤差降至 10% 以內。',
        '規劃 2026-2027 年於東部優選海域執行長期實海域性能測試與多機組陣列佈署。'
      ],
      ipConnectionNote: '與國內海事工程及電力設備產業界緊密合作，智財專案持續籌劃中。'
    },
    {
      id: 'project-quantum-photonics',
      type: '前瞻關鍵計畫',
      domain: '量子科技',
      badgeClass: 'badge-quantum',
      title: '量子光電研究計畫',
      leader: '王明杰 計畫主持人 (mingjye@as.edu.tw)',
      phone: '(06) 216-7707',
      location: '南部院區 量子光電前瞻實驗室',
      relatedPatents: [],
      summary: '聚焦開發應用於光量子運算、通訊與感測之核心材料與元件，研發單光子發射器（SPEs）、超導奈米線單光子偵測器（SNSPDs）及室溫光量子系統。',
      milestones: [
        '開發具備高亮度、高效率與高度不可分辨性之固態單光子光源。',
        '研製超導奈米線單光子偵測器，具極低暗計數率與皮秒級高響應速度。',
        '展示室溫運作之量子光源原型，推動光量子資安通訊實地測試。'
      ],
      ipConnectionNote: '光量子材料與探測器製造工藝陸續提出院內覽號評估。'
    },
    {
      id: 'project-blue-carbon',
      type: '前瞻關鍵計畫',
      domain: '海洋生態',
      badgeClass: 'badge-default',
      title: '海藻藍碳研究計畫',
      leader: '夏復國 副主任兼特聘研究員',
      phone: '(06) 216-7700',
      location: '南部院區 生地化分析實驗室',
      relatedPatents: [],
      summary: '評估大型海藻繁養殖於海洋碳匯之吸碳效益與長期沉降儲存機制，監測近海生地化循環與水體碳酸鹽平衡，建立具科學公信力之台灣藍碳量測與查證方法學。',
      milestones: [
        '建立台灣東部與南部海域海藻養殖碳匯實驗場。',
        '完成近海碳酸鹽系統與沉降通量原位量測標準作業程序。',
        '參與中研院「淨零排放」科研成果展示，提供政府海域碳權政策科學依據。'
      ],
      ipConnectionNote: '發展藍碳監測專屬生地化感測方法與環境分析規範。'
    },
    {
      id: 'project-taimos',
      type: '前瞻關鍵計畫',
      domain: '海洋科技',
      badgeClass: 'badge-default',
      title: '台灣海洋觀測系統核心設施計畫 (Tai-MOS)',
      leader: 'Tai-MOS 計畫團隊',
      phone: '(06) 216-7700',
      location: '南部院區 海洋觀測研究室',
      relatedPatents: [],
      summary: '配合國科會政策於南部院區建置國家級海洋核心觀測設施，運用高頻雷達陣列、深水長時錨碇觀測浮標與無人水下載具（AUV），建構台灣海域水文與環境長期大數據。',
      milestones: [
        '佈放深海錨碇串，即時監控黑潮海流能量熱點。',
        '建置東部海域海洋物理即時回傳與可視化監控中心。',
        '提供洋流發電機選址、氣候變遷模型與海事國防重要環境參數。'
      ],
      ipConnectionNote: '海事觀測專利感測模組與水下探測技術持續累積中。'
    },
    {
      id: 'project-ai-texts',
      type: '前瞻關鍵計畫',
      domain: '數位人文',
      badgeClass: 'badge-default',
      title: '運用人工智慧解鎖歷史文本研究計畫',
      leader: '連玲玲 計畫主持人 (mhllien@as.edu.tw)',
      phone: '(02) 2789-8200',
      location: '中研院近代史所 / 南部院區 人文社會基地',
      relatedPatents: [],
      summary: '針對中文手寫體、多語種與複雜古籍版面開發新一代 AI-OCR 模型，取代傳統高成本人工打字校對，加速明清檔案、近代期刊與戶口調查簿之全文數位化與學術解鎖。',
      milestones: [
        '訓練高辨識率中文手寫與複雜版面深度學習模型。',
        '完成近代婦女期刊、日治時期戶口調查簿等重要史料全文自動辨識。',
        '打造人機協作低人工參與度之古籍全文數位化工作流程。'
      ],
      ipConnectionNote: '核心演算法模組與古籍版面解析流程進行軟體著作權與營業秘密保護。'
    }
  ],

  // 4. 設施服務 (對齊官網 facility.php & charge.php)
  facilities: [
    {
      id: 'fac-solar',
      name: '先進太陽能電池研發與量測設施',
      location: '南部院區 研究大樓Ⅱ 太陽能研發實驗室',
      manager: '高效太陽光電團隊',
      intro: '本設施配備齊全之先進太陽能電池製程設備與精密光電分析儀器，支援大面積薄膜塗佈、熱阻抗量測及標準 AM1.5G 太陽光模擬照射發電測試。',
      equipment: [
        '標準太陽光模擬器 (Class AAA Sun Simulator, AM1.5G)',
        '外量子效率 (EQE / IPCE) 光譜量測系統',
        '高真空多源熱蒸鍍與磁控濺鍍系統',
        '惰性氣體整合型手套箱製程連線系統',
        '電化學阻抗分析儀 (EIS) 與半導體參數分析儀'
      ],
      serviceTarget: '校園研究團隊、產學合作夥伴、綠能科技研發廠商'
    },
    {
      id: 'fac-qcfab',
      name: '量子晶片製程研發平台 (QC-Fab)',
      location: '南部院區 研究大樓Ⅱ 無塵室',
      manager: '量子晶片製程團隊',
      intro: '全台首座專注於超導量子位元晶片開發之微奈米無塵製程平台，提供高純度超導金屬薄膜沈積、電子束微影與約瑟夫森接面製程服務，現已開放接受委託！',
      equipment: [
        '超導金屬電子槍蒸鍍系統 (超導 Nb, Al, Ta 薄膜成長)',
        '超高解析度電子束微影機 (E-beam Lithography, EBL)',
        '感應耦合電漿反應離子蝕刻機 (ICP-RIE)',
        '高真空雙角度斜角蒸鍍接面製備系統',
        '原子級表面輪廓儀與橢圓偏光儀'
      ],
      serviceTarget: '國內外量子科研團隊、半導體晶片設計與製造實驗室'
    },
    {
      id: 'fac-qtest',
      name: '量子計算測試平台',
      location: '南部院區 研究大樓Ⅱ 低溫量子量測室',
      manager: '量子電腦量測團隊',
      intro: '提供毫克耳文（mK）極低溫環境與超低雜訊射頻微波控制通道，專供超導量子位元之相干時間、邏輯閘保真度與量子多位元糾纏特性測試。',
      equipment: [
        '稀釋冷凍機 (Dilution Refrigerator, 基底溫度 < 10 mK)',
        '多通道微波任意波形產生器 (AWG) 與高速數位轉換器',
        '超低雜訊微波低溫放大器 (HEMT & TWPA)',
        '量子位元自動化校準與脈衝控制軟硬體整合系統'
      ],
      serviceTarget: '量子演算法開發團隊、超導電路研究學者'
    },
    {
      id: 'fac-qoptics',
      name: '量子光電前瞻製程與精密分析設施',
      location: '南部院區 研究大樓Ⅱ 光學實驗室',
      manager: '量子光電團隊',
      intro: '致力於單光子發射與高靈敏度光探測之光學特性分析，具備極微弱光信號擷取與時間相關單光子計數技術。',
      equipment: [
        '共焦顯微光致發光 (PL) 光譜儀系統',
        '時間相關單光子計數器 (TCSPC, 支援皮秒解析度)',
        '低溫微區光學低溫恆溫器 (Cryostat, 4K - 300K)',
        '超寬頻紫外/可見/近紅外分光光譜儀 (UV-Vis-NIR)'
      ],
      serviceTarget: '光電半導體團隊、奈米材料研究學者'
    },
    {
      id: 'fac-biochem',
      name: '環境生地化參數測量設施',
      location: '南部院區 研究大樓Ⅱ 生態分析室',
      manager: '海洋環境分析團隊',
      intro: '配合國科會 Tai-MOS 與海藻藍碳計畫，建立高精準度海水養分、碳酸鹽平衡與有機碳氮同位素分析能量。',
      equipment: [
        '連續流動式營養鹽自動分析儀 (Flow Injection Analyzer)',
        '海水總鹼度與溶存無機碳分析儀 (Total Alkalinity / DIC Analyzer)',
        '穩定同位素質譜儀 (EA-IRMS)',
        '高感度水中溶氧分析系統與 TOC 總有機碳分析儀'
      ],
      serviceTarget: '海洋科學家、環境變遷學者、碳匯查驗機構'
    },
    {
      id: 'fac-minflux',
      name: '最小螢光光子通量顯微鏡 (MINFLUX)',
      location: '南部院區 研究大樓Ⅱ 超解析光學室',
      manager: '生醫光電技術團隊',
      intro: '中研院引進之全球頂尖超高解析度光學顯微技術，利用光子通量極小化定位原理，達到 1 至 3 奈米之單分子空間解析度與微秒級分子動態追蹤。',
      equipment: [
        'Abberior MINFLUX 3D 超解析度奈米螢光定位系統',
        '多波長皮秒脈衝雷射激發光源',
        '高靈敏度單光子雪崩二極體 (SPAD) 陣列偵測器'
      ],
      serviceTarget: '生醫分子生物學家、生物物理學者、奈米醫藥研發團隊'
    }
  ],

  // 設施收費流程指引 (對齊官網 charge.php)
  facilityChargeFlow: {
    notice: [
      '繳款前請先向設施管理者確認繳款金額及狀態，以免溢繳或重覆繳款。',
      '為避免現金交易爭議，本中心全數採取非現金金融匯款機制。',
      '款項確認入帳後開立中央研究院統一收據／發票。',
      '匯款完成後，請將匯款單據電子檔寄送至設施負責人信箱以利銷帳。'
    ],
    bankInfo: {
      bank: '台灣土地銀行 南港分行（銀行代碼：0050049）',
      accountName: '中央研究院科學研究基金 401 專戶',
      accountNumber: '004-056-030-625'
    },
    reservationSystemUrl: 'https://reservation.iis.sinica.edu.tw/servlet/SignInHandler'
  },

  // 5. 人才招募列表 (對齊官網 recruitments.php 現正徵才職缺)
  recruitments: [
    {
      id: 54,
      campus: '南部院區',
      unit: '高效太陽光電領域實驗室',
      position: '正編研究技術人員',
      period: '2026/10/07 ~ 2026/12/31',
      description: '負責鈣鈦礦/矽疊層太陽能電池製程開發、鍍膜設備操作與標準 AM1.5G 量測系統維護，協助推動下世代太陽能關鍵技術產學聯盟合作。',
      requirements: '具材料、化學、化工、光電或物理相關領域碩博士學位，具半導體或薄膜製程經驗者佳。',
      contact: 'gchu@as.edu.tw',
      url: 'https://rcci.sinica.edu.tw/recruitment.php?id=54'
    },
    {
      id: 55,
      campus: '南部院區',
      unit: '量子光電實驗室',
      position: '專任行政助理',
      period: '2026/10/07 ~ 2026/12/31',
      description: '協助量子光電研究計畫之經費報銷、儀器採購、學術會議舉辦與訪客接待等日常行政事務。',
      requirements: '國內外大專院校畢業，具良好溝通協調能力與基本英語讀寫能力，熟悉中研院行政流程者優先。',
      contact: 'mingjye@as.edu.tw',
      url: 'https://rcci.sinica.edu.tw/recruitment.php?id=55'
    },
    {
      id: 52,
      campus: '南部院區',
      unit: '中央研究院關鍵議題研究中心',
      position: '正編研究技術人員 (核心設施維運)',
      period: '2026/10/06 ~ 2027/12/31',
      description: '負責南部院區研究大樓Ⅱ共用儀器平台（無塵室、低溫系統、真空設備）之日常營運、安全防護與對外技術服務諮詢。',
      requirements: '理工相關研究所碩博士畢業，具真空技術、極低溫或無塵室設備維運 2 年以上實務經驗。',
      contact: 'rcci@gate.sinica.edu.tw',
      url: 'https://rcci.sinica.edu.tw/recruitment.php?id=52'
    },
    {
      id: 53,
      campus: '南部院區',
      unit: '行政室',
      position: '專任行政助理',
      period: '2026/10/06 ~ 2026/12/31',
      description: '協助中心南部院區總務、出納、財產管理及場地空間租借協調。',
      requirements: '大專以上學歷，細心負責，熟悉 Office 文書處理軟體。',
      contact: 'chunfang@as.edu.tw',
      url: 'https://rcci.sinica.edu.tw/recruitment.php?id=53'
    },
    {
      id: 49,
      campus: '南部院區',
      unit: '量子光電實驗室',
      position: '專任專案研究人員',
      period: '2026/10/01 ~ 2026/12/31',
      description: '執行超導奈米線單光子偵測器（SNSPD）之微影製程與低溫低雜訊量測分析。',
      requirements: '物理、光電或電子工程博士學位，具微波高頻電路或低溫量測經驗者優先考量。',
      contact: 'mingjye@as.edu.tw',
      url: 'https://rcci.sinica.edu.tw/recruitment.php?id=49'
    },
    {
      id: 50,
      campus: '南部院區',
      unit: '量子光電實驗室',
      position: '專任研究助理',
      period: '2026/10/01 ~ 2026/12/31',
      description: '協助單光子光源製備、共焦顯微量測與光譜數據整理。',
      requirements: '理工科系學士或碩士學位，具光學實驗操作經驗者佳。',
      contact: 'mingjye@as.edu.tw',
      url: 'https://rcci.sinica.edu.tw/recruitment.php?id=50'
    },
    {
      id: 51,
      campus: '南部院區',
      unit: '量子光電實驗室',
      position: '專任博士後研究人員',
      period: '2026/10/01 ~ 2026/12/31',
      description: '主導室溫光量子系統與量子感測元件之理論模擬與實驗驗證。',
      requirements: '國內外知名大學物理、光電博士學位，具頂尖期刊發表紀錄者佳。',
      contact: 'mingjye@as.edu.tw',
      url: 'https://rcci.sinica.edu.tw/recruitment.php?id=51'
    },
    {
      id: 47,
      campus: '南部院區',
      unit: '台灣海洋觀測系統核心設施計畫 (Tai-MOS)',
      position: '專任研究助理',
      period: '2026/09/15 ~ 2026/12/31',
      description: '協助黑潮海流錨碇浮標數據分析、雷達站維護及水文觀測資料處理。',
      requirements: '海洋科學、大氣科學、地球物理或水利工程學碩士學位。',
      contact: 'chauron@as.edu.tw',
      url: 'https://rcci.sinica.edu.tw/recruitment.php?id=47'
    },
    {
      id: 45,
      campus: '南部院區',
      unit: '高效太陽光電領域實驗室',
      position: '專任研究助理',
      period: '2026/09/10 ~ 2026/12/31',
      description: '執行鈣鈦礦溶液調配、薄膜旋塗、熱退火與元件封裝測試。',
      requirements: '化學、材料、化工相關科系畢業，具備化學濕式製程操作能力。',
      contact: 'guotf@as.edu.tw',
      url: 'https://rcci.sinica.edu.tw/recruitment.php?id=45'
    },
    {
      id: 31,
      campus: '北部院區',
      unit: '量子科技推動辦公室',
      position: '專任行政助理',
      period: '2026/06/22 ~ 2026/12/31',
      description: '協助全國量子系統推動計畫之公文撰寫、跨部會聯絡、各計畫季報彙整與官網內容維護。',
      requirements: '大專以上學歷，具政府專案或科技計畫執行經驗者優先錄取。',
      contact: 'lmliu@as.edu.tw',
      url: 'https://rcci.sinica.edu.tw/recruitment.php?id=31'
    },
    {
      id: 40,
      campus: '北部/南部院區',
      unit: '去碳燃氫計畫實驗室',
      position: '專案研究人員 / 博士後研究學者 / 研究助理',
      period: '2025/12/11 ~ 2026/12/31',
      description: '從事電漿裂解甲烷固碳產氫反應器設計、熱流場模擬、電漿放電控制及產物碳黑結構分析。',
      requirements: '機械、化工、材料、物理工程背景學碩博士，對新能源與固碳技術具高度熱忱。',
      contact: 'rcci@gate.sinica.edu.tw',
      url: 'https://rcci.sinica.edu.tw/recruitment.php?id=40'
    },
    {
      id: 36,
      campus: '南部院區',
      unit: '量子電腦專題中心',
      position: '專任研究助理 / 博士後研究員 / 專案研究人員',
      period: '2025/10/22 ~ 2026/12/31',
      description: '參與超導量子位元晶片設計、FPGA 脈衝控制電路調適、極低溫稀釋冷凍機測試及量子演算法實作。',
      requirements: '物理、電機、資工、光電相關背景碩博士，具備量子計算基礎知識或 RF 射頻經驗者佳。',
      contact: 'chiidong@as.edu.tw',
      url: 'https://rcci.sinica.edu.tw/recruitment.php?id=36'
    },
    {
      id: 37,
      campus: '南部院區',
      unit: '量子電腦專題中心',
      position: '學習型獎助生 (博/碩/大學部)',
      period: '2025/10/22 ~ 2026/12/31',
      description: '提供對量子科技有興趣之在學學生至南部院區進行專題研究，參與國際級超導量子電腦研發。',
      requirements: '國內各大學理工相關系所學生，每週可固定參與研究 16 小時以上。',
      contact: 'chiidong@as.edu.tw',
      url: 'https://rcci.sinica.edu.tw/recruitment.php?id=37'
    }
  ]
};
