// 作文元資料：由 Hermes 寫入 essays/index.json
let essays = [];
let currentView = []; // currently displayed essays
let selectedDate = null; // currently selected date filter
let calYear = new Date().getFullYear();
let calMonth = new Date().getMonth(); // 0-indexed

// 載入作文列表
async function loadEssays() {
  try {
    const res = await fetch('essays/index.json');
    essays = await res.json();
  } catch (e) {
    essays = [];
  }
  currentView = [...essays];
  renderCalendar();
  renderList(currentView);
}

// 渲染清單
function renderList(list) {
  const container = document.getElementById('essayList');
  const noResult = document.getElementById('noResult');
  const countEl = document.getElementById('resultCount');
  container.innerHTML = '';

  if (list.length === 0) {
    noResult.classList.remove('hidden');
    countEl.textContent = '';
    return;
  }
  noResult.classList.add('hidden');
  countEl.textContent = `共 ${list.length} 篇`;

  list.forEach(essay => {
    const card = document.createElement('div');
    card.className = 'essay-card';
    card.innerHTML = `
      <div class="date">📅 ${essay.date}</div>
      <h2>${essay.title}</h2>
      <p class="preview">${essay.preview || ''}</p>
      ${essay.hasImage ? '<span class="tag">🖼️ 含圖片</span>' : ''}
    `;
    card.addEventListener('click', () => showEssay(essay));
    container.appendChild(card);
  });
}

// 顯示單篇作文
function showEssay(essay) {
  const container = document.getElementById('essayList');
  const noResult = document.getElementById('noResult');
  const countEl = document.getElementById('resultCount');
  container.innerHTML = '';
  noResult.classList.add('hidden');
  countEl.textContent = '';

  const detail = document.createElement('div');
  detail.className = 'essay-detail';

  let imageHtml = '';
  if (essay.images && essay.images.length) {
    imageHtml = essay.images.map(img =>
      `<div class="image-container"><img src="${img}" alt="${essay.title}" /></div>`
    ).join('');
  }

  detail.innerHTML = `
    <span class="back">← 返回列表</span>
    <div class="date">📅 ${essay.date}</div>
    <h1>${essay.title}</h1>
    ${imageHtml}
    <div class="body">${essay.body}</div>
  `;
  detail.querySelector('.back').addEventListener('click', () => {
    renderList(essays);
  });
  container.appendChild(detail);
}

// Apply both date filter and search filter
function applyFilters() {
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  let filtered = [...essays];

  if (selectedDate) {
    filtered = filtered.filter(e => e.date === selectedDate);
  }

  if (q) {
    filtered = filtered.filter(essay =>
      essay.title.toLowerCase().includes(q) ||
      (essay.body && essay.body.toLowerCase().includes(q)) ||
      (essay.preview && essay.preview.toLowerCase().includes(q))
    );
  }

  currentView = filtered;
  renderList(filtered);
}

// 搜尋
document.getElementById('searchInput').addEventListener('input', () => {
  applyFilters();
});

// ===== 日曆 =====

function getEssayDates() {
  const set = new Set();
  essays.forEach(e => {
    if (e.date) set.add(e.date);
  });
  return set;
}

function renderCalendar() {
  const essayDates = getEssayDates();
  const monthYear = document.getElementById('calMonthYear');
  const grid = document.getElementById('calendarGrid');
  const clearBtn = document.getElementById('calClearFilter');

  const months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
  monthYear.textContent = `${calYear}年 ${months[calMonth]}`;

  grid.innerHTML = '';

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('button');
    empty.className = 'cal-day empty';
    empty.disabled = true;
    grid.appendChild(empty);
  }

  // Days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const btn = document.createElement('button');
    btn.className = 'cal-day';
    btn.textContent = d;

    if (essayDates.has(dateStr)) {
      btn.classList.add('has-essay');
      btn.title = `有作文：${dateStr}`;
    }

    if (dateStr === todayStr) {
      btn.classList.add('today');
    }

    if (selectedDate === dateStr) {
      btn.classList.add('selected');
    }

    btn.addEventListener('click', () => {
      if (selectedDate === dateStr) {
        selectedDate = null;
        clearBtn.classList.add('hidden');
      } else {
        selectedDate = dateStr;
        clearBtn.classList.remove('hidden');
      }
      renderCalendar();
      applyFilters();
    });

    grid.appendChild(btn);
  }
}

document.getElementById('prevMonth').addEventListener('click', () => {
  calMonth--;
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
  calMonth++;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  renderCalendar();
});

document.getElementById('calClearFilter').addEventListener('click', () => {
  selectedDate = null;
  document.getElementById('calClearFilter').classList.add('hidden');
  renderCalendar();
  applyFilters();
});

// 初始化
loadEssays();
