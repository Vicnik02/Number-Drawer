/* === 软工2502 抽号机 — Application Logic === */

// 学生名单从 js/students.js 加载（已脱敏：只保留姓名，不包含学号）
const STUDENTS = window.STUDENTS || [];

const TOTAL = STUDENTS.length;

// ---- State ----
let isRolling = false;
let rollTimer = null;
let drawHistory = [];

// ---- DOM Refs ----
const $count    = document.getElementById('countInput');
const $drawBtn  = document.getElementById('drawBtn');
const $resetBtn = document.getElementById('resetBtn');
const $rolling  = document.getElementById('rollingDisplay');
const $result   = document.getElementById('resultArea');
const $grid     = document.getElementById('studentGrid');
const $historyList   = document.getElementById('historyList');
const $historyPanel = document.getElementById('historyPanel');
const $historyBtn   = document.getElementById('historyBtn');

// ---- Init ----
function init() {
  renderStudentGrid();
  bindEvents();
}

function bindEvents() {
  $drawBtn.addEventListener('click', draw);
  $resetBtn.addEventListener('click', reset);
  $historyBtn.addEventListener('click', toggleHistory);

  // Clamp count input
  $count.addEventListener('change', () => {
    let v = parseInt($count.value);
    if (isNaN(v) || v < 1) $count.value = 1;
    else if (v > TOTAL) $count.value = TOTAL;
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isRolling) draw();
    }
    if (e.key === 'Escape' || e.key === 'r' || e.key === 'R') {
      reset();
    }
    if (e.key === 'h' || e.key === 'H') {
      toggleHistory();
    }
  });
}

// ---- Student Grid ----
function renderStudentGrid() {
  $grid.innerHTML = STUDENTS.map((name, i) =>
    `<div class="student-tag" id="tag-${i}">${name}</div>`
  ).join('');
}

function highlightStudents(picks) {
  document.querySelectorAll('.student-tag.selected').forEach(el => el.classList.remove('selected'));
  picks.forEach(s => {
    const el = document.getElementById('tag-' + s);
    if (el) el.classList.add('selected');
  });
}

function clearHighlights() {
  document.querySelectorAll('.student-tag.selected').forEach(el => el.classList.remove('selected'));
}

// ---- Shuffle ----
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---- Draw ----
function draw() {
  if (isRolling) return;

  const count = Math.min(Math.max(parseInt($count.value) || 1, 1), TOTAL);
  $count.value = count;

  $result.innerHTML = '';
  clearHighlights();

  isRolling = true;
  $drawBtn.disabled = true;
  $rolling.classList.add('scrambling');

  // Rolling phase — digital scramble effect
  let frame = 0;
  const totalFrames = 30;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const pool = shuffle(STUDENTS);

  rollTimer = setInterval(() => {
    const displayNames = [];
    for (let i = 0; i < count; i++) {
      const idx = (frame + i * 7) % pool.length;
      let name = pool[idx];
      // Partial scramble: replace random characters
      if (frame < totalFrames - 5) {
        const scrambleRatio = 1 - (frame / totalFrames);
        name = name.split('').map(ch => {
          if (Math.random() < scrambleRatio * 0.6) {
            return chars[Math.floor(Math.random() * chars.length)];
          }
          return ch;
        }).join('');
      }
      displayNames.push(name);
    }
    $rolling.textContent = displayNames.join('  ');
    frame++;

    if (frame >= totalFrames) {
      clearInterval(rollTimer);

      // Final selection
      const finalPicks = shuffle(STUDENTS).slice(0, count);
      $rolling.textContent = '';
      $rolling.classList.remove('scrambling');

      renderResults(finalPicks);
      highlightStudents(finalPicks);
      addHistory(finalPicks);

      isRolling = false;
      $drawBtn.disabled = false;
    }
  }, 55);
}

// ---- Render Results ----
function renderResults(picks) {
  $result.innerHTML = picks.map((name, i) =>
    `<div class="result-card" style="animation-delay:${i * 0.08}s">
      <div class="card-name">${name}</div>
    </div>`
  ).join('');
}

// ---- Reset ----
function reset() {
  if (isRolling) {
    clearInterval(rollTimer);
    isRolling = false;
    $drawBtn.disabled = false;
  }
  $rolling.textContent = '';
  $rolling.classList.remove('scrambling');
  $result.innerHTML = '';
  clearHighlights();
}

// ---- History ----
function addHistory(picks) {
  const entry = {
    time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
    count: picks.length,
    names: picks.join('、')
  };
  drawHistory.unshift(entry);
  if (drawHistory.length > 50) drawHistory.pop();
  renderHistory();
}

function renderHistory() {
  if (drawHistory.length === 0) {
    $historyList.innerHTML = '<li class="history-empty">暂无抽取记录</li>';
    return;
  }
  $historyList.innerHTML = drawHistory.map(h =>
    `<li class="history-item">
      <span class="hi-count">${h.count}人</span>
      ${h.names}
      <div style="font-size:10px;opacity:0.4;margin-top:4px;">${h.time}</div>
    </li>`
  ).join('');
}

function toggleHistory() {
  $historyPanel.classList.toggle('open');
}

// ---- Particle Background ----
function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  const maxParticles = 60;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() {
      this.reset();
      this.y = Math.random() * canvas.height;
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = -10;
      this.size = Math.random() * 1.5 + 0.5;
      this.speedY = Math.random() * 0.4 + 0.15;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.fadeSpeed = Math.random() * 0.003 + 0.001;
    }
    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.opacity -= this.fadeSpeed;
      if (this.y > canvas.height + 10 || this.opacity <= 0) {
        this.reset();
      }
    }
    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 240, 255, ${Math.max(0, this.opacity)})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < maxParticles; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 240, 255, ${0.04 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => {
      p.update();
      p.draw(ctx);
    });

    requestAnimationFrame(animate);
  }

  animate();
}

// ---- Boot ----
document.addEventListener('DOMContentLoaded', () => {
  init();
  initParticles();
});
