'use strict';

/* ── Theme ───────────────────────────────────────── */
const html        = document.documentElement;
const themeToggle = document.getElementById('themeToggle');

const ICONS = { dark: '🌙', light: '☀️' };

function applyTheme(theme) {
  html.dataset.theme        = theme;
  html.style.colorScheme    = theme;
  themeToggle.textContent   = ICONS[theme];
  localStorage.setItem('lotto-theme', theme);
}

const savedTheme = localStorage.getItem('lotto-theme')
  ?? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  applyTheme(html.dataset.theme === 'dark' ? 'light' : 'dark');
});

/* ── Number Generation ───────────────────────────── */
function generateNumbers() {
  const pool = Array.from({ length: 45 }, (_, i) => i + 1);
  for (let i = 0; i < 6; i++) {
    const j = Math.floor(Math.random() * (pool.length - i)) + i;
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 6).sort((a, b) => a - b);
}

function colorClass(n) {
  if (n <= 9)  return 'n1-9';
  if (n <= 19) return 'n10-19';
  if (n <= 29) return 'n20-29';
  if (n <= 39) return 'n30-39';
  return 'n40-45';
}

/* ── DOM Helpers ─────────────────────────────────── */
function createBall(n, delay = 0) {
  const el = document.createElement('div');
  el.className              = `ball ${colorClass(n)}`;
  el.textContent            = n;
  el.role                   = 'listitem';
  el.ariaLabel              = `번호 ${n}`;
  el.style.transitionDelay  = `${delay}s`;
  return el;
}

function renderBalls(container, numbers, delayBase = 0) {
  container.replaceChildren(
    ...numbers.map((n, i) => createBall(n, delayBase + i * 0.07))
  );
}

/* ── Stats ───────────────────────────────────────── */
function showStats(nums) {
  const odd  = nums.filter(n => n % 2 !== 0).length;
  const even = nums.length - odd;
  const low  = nums.filter(n => n <= 22).length;
  const high = nums.length - low;
  const sum  = nums.reduce((a, b) => a + b, 0);

  const statsCard = document.getElementById('statsCard');
  const statsGrid = document.getElementById('statsGrid');

  statsGrid.innerHTML = `
    <div class="stat-item">
      <span class="stat-value">${odd}:${even}</span>
      <span class="stat-label">홀수 : 짝수</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">${low}:${high}</span>
      <span class="stat-label">저 : 고번호</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">${sum}</span>
      <span class="stat-label">번호 합계</span>
    </div>`;

  statsCard.hidden = false;
}

/* ── Draw Single ─────────────────────────────────── */
const mainBalls = document.getElementById('mainBalls');
const multiCard = document.getElementById('multiCard');

function drawMain() {
  const nums = generateNumbers();
  renderBalls(mainBalls, nums);
  showStats(nums);
  multiCard.hidden = true;
}

/* ── Draw 5 Games ────────────────────────────────── */
const multiRows = document.getElementById('multiRows');

function drawMulti() {
  const games = Array.from({ length: 5 }, () => generateNumbers());

  multiRows.replaceChildren(
    ...games.map((nums, g) => {
      const row   = document.createElement('div');
      const label = document.createElement('span');
      const balls = document.createElement('div');

      row.className   = 'multi-row';
      label.className = 'row-label';
      balls.className = 'balls';
      balls.role      = 'list';

      label.textContent = String.fromCharCode(65 + g);

      nums.forEach((n, i) => balls.appendChild(createBall(n, g * 0.08 + i * 0.06)));

      row.append(label, balls);
      return row;
    })
  );

  multiCard.hidden = false;
  showStats(games[0]);
  renderBalls(mainBalls, generateNumbers());
}

/* ── Event Listeners ─────────────────────────────── */
document.getElementById('btnDraw').addEventListener('click', drawMain);
document.getElementById('btnMulti').addEventListener('click', drawMulti);

/* ── Init ────────────────────────────────────────── */
drawMain();
