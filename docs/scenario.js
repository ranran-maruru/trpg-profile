
// グローバル変数
let scenarios = [];
let editingId = null;
let systemInfo = [];
let activeSystemFilter = 'all'; // アクティブなシステムフィルタ

// 初期化
document.addEventListener('DOMContentLoaded', async () => {
  await loadScenarios();
  document.getElementById('searchInput').addEventListener('input', filterScenarios);

  // フィルタータグのクリックハンドラ
  const filterTags = document.querySelectorAll('.filter-tag');
  filterTags.forEach(tag => {
    tag.addEventListener('click', () => {
      // 選択状態を更新
      filterTags.forEach(t => t.classList.remove('selected'));
      tag.classList.add('selected');

      // アクティブなフィルタを更新
      activeSystemFilter = tag.dataset.filter;
      filterScenarios();
    });
  });

  // タブ切り替えの処理
  const tabContainer = document.querySelector('.tabs');
  const tabMenuItems = tabContainer.querySelectorAll('ul li');
  const slideIndicator = tabContainer.querySelector('.slide-indicator');

  tabMenuItems.forEach((tabMenuItem, index) => {
    tabMenuItem.addEventListener('click', () => {
      // クリック時に毎回タブコンテンツを取得
      const tabContents = document.querySelector('.tab-container').querySelectorAll('.tab-content');

      tabMenuItems.forEach(item => {
        item.classList.remove('selected');
      });
      tabMenuItem.classList.add('selected');

      tabContents.forEach(tabContent => {
        tabContent.classList.remove('selected');
      });
      document.getElementById(tabMenuItem.dataset.id).classList.add('selected');

      // スライドインジケーターの位置を更新
      slideIndicator.style.transform = `translateX(${index * 100}%)`;
    });
  });
});

// 表示データ読み込み
async function loadScenarios() {
  try {
    // システムカラーのデータを読み込む
    systemInfo = await fetch('./data/system_info.json').then(res => res.json());

    // 6版のシナリオデータを読み込む
    const coc6th_response = await fetch('./data/coc6th.json');
    const coc6th_data = await coc6th_response.json();
    coc6th_data.forEach(scenario => {
      scenario.system = 'coc6th';
    });

    // 7版のシナリオデータを読み込む
    const coc7th_response = await fetch('./data/coc7th.json');
    const coc7th_data = await coc7th_response.json();
    coc7th_data.forEach(scenario => {
      scenario.system = 'coc7th';
    });

    // エモクロアのシナリオデータを読み込む
    const emoklore_response = await fetch('./data/emoklore.json');
    const emoklore_data = await emoklore_response.json();
    emoklore_data.forEach(scenario => {
      scenario.system = 'emoklore';
    });

    // マダミスのシナリオデータを読み込む
    console.log('システム情報:', systemInfo);
    const madamis_response = await fetch('./data/madamis.json');
    const madamis_data = await madamis_response.json();
    madamis_data.forEach(scenario => {
      scenario.system = 'madamis';
    });

    // DX3rdのシナリオデータを読み込む
    const dx3rd_response = await fetch('./data/dx3rd.json');
    const dx3rd_data = await dx3rd_response.json();
    dx3rd_data.forEach(scenario => {
      scenario.system = 'dx3rd';
    });

    // インセインのシナリオデータを読み込む
    const insane_response = await fetch('./data/insane.json');
    const insane_data = await insane_response.json();
    insane_data.forEach(scenario => {
      scenario.system = 'insane';
    });

    // フタリソウサのシナリオデータを読み込む
    const futarisousa_response = await fetch('./data/futarisousa.json');
    const futarisousa_data = await futarisousa_response.json();
    futarisousa_data.forEach(scenario => {
      scenario.system = 'futarisousa';
    });

    // その他のシナリオデータも同様に読み込む...
    const other_response = await fetch('./data/other.json');
    const other_data = await other_response.json();
    other_data.forEach(scenario => {
      scenario.system = 'other';
    });

    // シナリオデータを統合して表示
    scenarios = [...coc6th_data, ...coc7th_data, ...emoklore_data, ...madamis_data, ...dx3rd_data, ...insane_data, ...futarisousa_data, ...other_data];
    renderScenarios();
  } catch (error) {
    console.error('エラー:', error);
    alert('シナリオ一覧の読み込みに失敗しました');
  }
}

// フィルタリングと表示
function filterScenarios() {
  let filtered = [...scenarios];

  // システムフィルタ
  if (activeSystemFilter !== 'all') {
    filtered = filtered.filter(s => s.system === activeSystemFilter);
  }

  // 検索フィルタ
  const searchText = document.getElementById('searchInput').value.toLowerCase();
  if (searchText) {
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(searchText)
    );
  }

  // ソート（デフォルト：最新順）
  const sortByElement = document.getElementById('sortBy');
  const sortBy = sortByElement ? sortByElement.value : 'date-desc';
  switch (sortBy) {
    case 'date-desc':
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
    case 'date-asc':
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case 'name':
      filtered.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
      break;
  }

  renderFilteredScenarios(filtered);
}

// シナリオを表示
function renderScenarios() {
  filterScenarios();
  // updateStats();
}

// フィルタされたシナリオを表示
function renderFilteredScenarios(filtered) {
  const grid = document.getElementById('scenariosGrid');

  if (filtered.length === 0) {
    grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <p>該当するシナリオがありません。</p>
            </div>
        `;
    return;
  }
  // システムごとに分けて表示
  grid.innerHTML = '';
  const systems = ["coc6th", "coc7th", "emoklore", "madamis", "dx3rd", "insane", "futarisousa", "other"];
  systems.forEach(systems => {
    const systemScenarios = filtered.filter(s => s.system === systems);
    if (systemScenarios.length === 0) return;

    const systemColor = systemInfo[systems].color || '#ccc';
    const systemBackgroundColor = systemInfo[systems].backgroundColor || '#f0f0f0';
    const systemName = systemInfo[systems].name || '';
    const systemIcon = systemInfo[systems].icon ? `<i class="fas ${systemInfo[systems].icon}"></i>` : '';


    systemScenarios.forEach(scenario => {
      const card = document.createElement('div');
      card.className = 'scenario-card';

      // 役割ごとのバッジを生成
      let roleHtml = '';
      let hoDisplayed = false;
      if (scenario.role && scenario.role.length > 0) {
        roleHtml = scenario.role.map(role => {
          let roleClass = 'badge role-badge';
          let roleText = escapeHtml(role);

          if (role === 'GM') {
            roleClass += ' role-gm';
          } else if (role === 'PL') {
            roleClass += ' role-pl';
            // PL役の場合、HO情報を含める
            if (scenario.HO) {
              roleText = `PL: ${escapeHtml(scenario.HO)}`;
              hoDisplayed = true;
            }
          } else if (role === '視聴済み') {
            roleClass += ' role-viewed';
          }

          return `<span class="${roleClass}">${roleText}</span>`;
        }).join('');
      }

      card.innerHTML = `
                <div class="scenario-name">
                    <span>${escapeHtml(scenario.name)} ${!hoDisplayed && scenario.HO ? ` / <span class="scenario-ho">HO: ${escapeHtml(scenario.HO)}</span>` : ''}</span>
                </div>
                <div class="scenario-meta-badges">
                    <span class="badge system-badge" style="color: ${systemColor}; background-color: ${systemBackgroundColor}; ">${systemIcon} ${systemName}</span>
                    ${roleHtml ? `<div class="scenario-role">${roleHtml}</div>` : ''}
                    ${scenario.date ? `<span class="badge date-badge">${scenario.date}</span>` : ''}
                </div>
            `;
      grid.appendChild(card);
    });
  });
}

// 統計情報を更新
function updateStats() {
  const coc6thCount = scenarios.filter(s => s.system === 'coc6th').length;
  document.getElementById('stats').innerHTML = `\
        <span class="stat-value">CoC6版: ${coc6thCount}</span>
        <span class="stat-value">フタリソウサ: 0</span>
      `;
}



// ユーティリティ関数
function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}