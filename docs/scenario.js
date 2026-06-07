
// グローバル変数
let scenarios = [];
let editingId = null;
let systemInfo = [];

// 初期化
document.addEventListener('DOMContentLoaded', async () => {
  await loadScenarios();
  document.getElementById('searchInput').addEventListener('input', filterScenarios);

  // タブ切り替えの処理
  const tabContainer = document.querySelector('.tab-container');
  const tabMenuItems = tabContainer.querySelectorAll('ul li');
  const tabContents = tabContainer.querySelectorAll('.tab-content');
  const slideIndicator = tabContainer.querySelector('.slide-indicator');

  tabMenuItems.forEach((tabMenuItem, index) => {
    tabMenuItem.addEventListener('click', () => {
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
    const response = await fetch('./data/coc6th.json');
    const coc6th_data = await response.json();
    coc6th_data.forEach(scenario => {
      scenario.system = 'coc6th';
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

    // シナリオデータを統合して表示
    scenarios = [...coc6th_data, ...madamis_data, ...dx3rd_data, ...insane_data];
    renderScenarios();
  } catch (error) {
    console.error('エラー:', error);
    alert('シナリオ一覧の読み込みに失敗しました');
  }
}

// フィルタリングと表示
function filterScenarios() {
  let filtered = [...scenarios];

  // 検索フィルタ
  const searchText = document.getElementById('searchInput').value.toLowerCase();
  if (searchText) {
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(searchText)
    );
  }

  // ソート
  const sortBy = document.getElementById('sortBy').value;
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
  const systems = ["coc6th", "madamis", "dx3rd", "insane"];
  systems.forEach(systems => {
    const systemScenarios = filtered.filter(s => s.system === systems);
    if (systemScenarios.length === 0) return;

    const systemColor = systemInfo[systems].color || '#ccc';
    const systemName = systemInfo[systems].name || '';
    const systemHeader = document.createElement('div');
    systemHeader.className = 'system-header';
    // systemHeader.style.color = systemColor;
    systemHeader.textContent = systemName;
    grid.appendChild(systemHeader);

    systemScenarios.forEach(scenario => {
      const card = document.createElement('div');
      card.className = 'scenario-card';
      card.innerHTML = `
                <div class="scenario-name">${escapeHtml(scenario.name)}</div>
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