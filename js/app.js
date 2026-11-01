// 作文元資料：由 Hermes 寫入 essays/index.json
let essays = [];

// 載入作文列表
async function loadEssays() {
  try {
    const res = await fetch('essays/index.json');
    essays = await res.json();
  } catch (e) {
    essays = [];
  }
  renderList(essays);
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

// 搜尋
document.getElementById('searchInput').addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  if (!q) { renderList(essays); return; }
  const filtered = essays.filter(essay =>
    essay.title.toLowerCase().includes(q) ||
    (essay.body && essay.body.toLowerCase().includes(q)) ||
    (essay.preview && essay.preview.toLowerCase().includes(q))
  );
  renderList(filtered);
});

// 初始化
loadEssays();
