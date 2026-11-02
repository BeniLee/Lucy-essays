// 歷年會考寫作題目
let examData = [];
let selectedYear = null;

async function loadExamData() {
  try {
    const res = await fetch('exam/index.json');
    examData = await res.json();
  } catch (e) {
    examData = [];
  }
  renderYearNav();
  if (examData.length > 0) {
    selectYear(examData[0].year);
  }
}

function renderYearNav() {
  const nav = document.getElementById('yearNav');
  nav.innerHTML = '';
  examData.forEach(exam => {
    const btn = document.createElement('button');
    btn.className = 'year-btn';
    btn.textContent = `${exam.year} 年`;
    btn.addEventListener('click', () => selectYear(exam.year));
    nav.appendChild(btn);
  });
}

function selectYear(year) {
  selectedYear = year;
  // Update nav active state
  document.querySelectorAll('.year-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.includes(year));
  });
  renderExamDetail();
}

function renderExamDetail() {
  const container = document.getElementById('examDetail');
  const loading = document.getElementById('examLoading');
  const exam = examData.find(e => e.year === selectedYear);
  if (!exam) return;

  loading.classList.add('hidden');
  container.classList.remove('hidden');

  let imagesHtml = '';
  if (exam.sampleImages && exam.sampleImages.length) {
    imagesHtml = `
      <h3>🖼️ 六級分樣卷</h3>
      <div class="sample-essays">
        ${exam.sampleImages.map((img, idx) => `
          <div class="sample-essay">
            <div class="sample-page-label">第 ${idx + 1} 頁</div>
            <img src="${img}" alt="樣卷第${idx+1}頁" loading="lazy" />
          </div>
        `).join('')}
      </div>
    `;
  }

  let inspirationHtml = '';
  if (exam.inspiration && exam.inspiration.length) {
    inspirationHtml = `
      <div class="inspiration-box">
        <h3>✨ 寫作靈感與切入角度</h3>
        <ul>
          ${exam.inspiration.map(i => `<li>${i}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="exam-card">
      <h2>${exam.year} 年會考寫作</h2>
      <div class="meta">${exam.title} ｜ ${exam.type}</div>

      <div class="prompt-box">
        ${exam.prompt.replace(/\n/g, '<br>')}
      </div>

      ${exam.promptImages && exam.promptImages.length ? `
        <h3>📋 題目圖示</h3>
        <div class="prompt-gallery">
          ${exam.promptImages.map((img, idx) => `
            <div class="prompt-item">
              <img src="${img}" alt="題目圖示${idx+1}" loading="lazy" />
            </div>
          `).join('')}
        </div>
      ` : ''}

      <h3>🎯 評分重點</h3>
      <ul>
        ${exam.scoring.map(s => `<li>${s}</li>`).join('')}
      </ul>

      ${imagesHtml}
      ${inspirationHtml}
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', loadExamData);
