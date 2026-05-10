/* === 软工2502 抽号机 — Application Logic === */

// ---- Student Data ----
const STUDENTS = [
  { id:  1, sid: "8002125052", name: "邱世豪" },
  { id:  2, sid: "8002125048", name: "罗梓洋" },
  { id:  3, sid: "8002125050", name: "毛昊辰" },
  { id:  4, sid: "8002125051", name: "彭友浩" },
  { id:  5, sid: "8002125053", name: "王薪博" },
  { id:  6, sid: "8002125036", name: "胡惠柯" },
  { id:  7, sid: "8002125042", name: "刘芳荣" },
  { id:  8, sid: "8002125038", name: "李婧妍" },
  { id:  9, sid: "8002125044", name: "刘倩"   },
  { id: 10, sid: "8002125064", name: "祖健铭" },
  { id: 11, sid: "8002125054", name: "王仪蒙" },
  { id: 12, sid: "8002125056", name: "徐业彤" },
  { id: 13, sid: "8002125049", name: "吕文燕" },
  { id: 14, sid: "8002125062", name: "赵张琪" },
  { id: 15, sid: "8002125061", name: "赵勇镔" },
  { id: 16, sid: "8002125037", name: "赖旻锐" },
  { id: 17, sid: "8002125033", name: "陈仲文" },
  { id: 18, sid: "8002125034", name: "邓雨轩" },
  { id: 19, sid: "8002125040", name: "梁文球" },
  { id: 20, sid: "8002125035", name: "龚启钊" },
  { id: 21, sid: "8002125046", name: "卢健稳" },
  { id: 22, sid: "8002125045", name: "刘书鹏" },
  { id: 23, sid: "8002125047", name: "陆文涛" },
  { id: 24, sid: "8002125041", name: "凌宇晨" },
  { id: 25, sid: "8002125043", name: "刘昊轩" },
  { id: 26, sid: "8002125057", name: "杨博轩" },
  { id: 27, sid: "8002125058", name: "杨振东" },
  { id: 28, sid: "8002125059", name: "张博航" },
  { id: 29, sid: "8002125060", name: "张艺宸" },
  { id: 30, sid: "8002125063", name: "郑立涛" }
];

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
  $grid.innerHTML = STUDENTS.map(s =>
    `<div class="student-tag" id="tag-${s.id}" title="${s.sid}">${s.name}</div>`
  ).join('');
}

function highlightStudents(picks) {
  document.querySelectorAll('.student-tag.selected').forEach(el => el.classList.remove('selected'));
  picks.forEach(s => {
    const el = document.getElementById('tag-' + s.id);
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
      let name = pool[idx].name;
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

      // Auto-reset highlights after 8 seconds
      setTimeout(() => {
        // Only clear if no new draw happened
        const currentCards = $result.children.length;
        if (currentCards > 0) {
          // keep results, dim after a while
        }
      }, 15000);
    }
  }, 55);
}

// ---- Render Results ----
function renderResults(picks) {
  $result.innerHTML = picks.map((s, i) =>
    `<div class="result-card" style="animation-delay:${i * 0.08}s">
      <div class="card-name">${s.name}</div>
      <div class="card-id">${s.sid}</div>
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
    names: picks.map(s => s.name).join('、')
  };
  drawHistory.unshift(entry);
  if (drawHistory.length > 50) drawHistory.pop();
  renderHistory();
}

function renderHistory() {
  if (drawHistory.length === 0) {
    $historyList.innerHTML = '<div class="history-empty">暂无抽取记录</div>';
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
