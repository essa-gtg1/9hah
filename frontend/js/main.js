// Global utilities

// API helper
const API = {
  async post(url, data) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async get(url) {
    const res = await fetch(url);
    return res.json();
  },
  async put(url, data) {
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async delete(url) {
    const res = await fetch(url, { method: 'DELETE' });
    return res.json();
  }
};

// Notifications
function notify(msg, type = 'success', duration = 3500) {
  let container = document.querySelector('.notification-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'notification-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', danger: '❌', warning: '⚠️', info: 'ℹ️' };
  const notif = document.createElement('div');
  notif.className = `notification ${type}`;
  notif.innerHTML = `<span>${icons[type] || '✅'}</span><span>${msg}</span>`;
  container.appendChild(notif);
  setTimeout(() => {
    notif.style.opacity = '0';
    notif.style.transform = 'translateX(-20px)';
    notif.style.transition = '0.3s ease';
    setTimeout(() => notif.remove(), 300);
  }, duration);
}

// Hamburger menu
function initNav() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }
  // Highlight active nav link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === currentPage) link.classList.add('active');
  });
}

// Tabs
function initTabs() {
  document.querySelectorAll('.tabs').forEach(tabsEl => {
    tabsEl.querySelectorAll('.tab').forEach((tab, i) => {
      tab.addEventListener('click', () => {
        const group = tab.dataset.group || '';
        const allTabs = tabsEl.querySelectorAll('.tab');
        const container = tabsEl.closest('[data-tabs]') || document;
        const allContents = container.querySelectorAll(`.tab-content${group ? '[data-group="'+group+'"]' : ''}`);
        allTabs.forEach(t => t.classList.remove('active'));
        allContents.forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const target = container.querySelector(`#${tab.dataset.target}`);
        if (target) target.classList.add('active');
      });
    });
  });
}

// Modals
function openModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) overlay.classList.add('show');
}

function closeModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) overlay.classList.remove('show');
}

function initModals() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('show');
    });
  });
  document.querySelectorAll('[data-modal-open]').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.modalOpen));
  });
  document.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.modalClose));
  });
}

// Smooth scroll
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });
}

// Intersection observer for animations
function initAnimations() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.card, .stat-card, .hospital-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
}

// Auth state check
async function checkAuth(redirect = true) {
  try {
    const data = await API.get('/api/me');
    if (data.success) return data.user;
    if (redirect) window.location.href = 'login.html';
    return null;
  } catch {
    if (redirect) window.location.href = 'login.html';
    return null;
  }
}

// Format date
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('ar-OM', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// BMI calculation
function calcBMI(weight, height) {
  const h = height / 100;
  return (weight / (h * h)).toFixed(1);
}

function getBMICategory(bmi) {
  if (bmi < 18.5) return { label: 'نحيف', color: '#3498db', level: 0 };
  if (bmi < 25) return { label: 'طبيعي', color: '#2ecc71', level: 1 };
  if (bmi < 30) return { label: 'زيادة وزن', color: '#f39c12', level: 2 };
  return { label: 'سمنة', color: '#e74c3c', level: 3 };
}

// Glucose status
function glucoseStatus(value) {
  if (value < 70) return { label: 'منخفض خطر ⚠️', color: 'warning', alert: true };
  if (value <= 100) return { label: 'طبيعي ✅', color: 'success', alert: false };
  if (value <= 140) return { label: 'مرتفع قليلاً', color: 'warning', alert: false };
  return { label: 'مرتفع خطر 🚨', color: 'danger', alert: true };
}

// Smart Chat responses
const chatResponses = {
  'ماذا آكل': 'يُنصح بتناول الخضروات الورقية، البروتينات الخالية من الدهون، والكربوهيدرات المعقدة مثل الشوفان والبقوليات. تجنب السكريات البسيطة والمعلبات.',
  'سكري مرتفع': 'إذا كان السكر مرتفعاً: اشرب الماء، امشِ لمدة 15 دقيقة، تناول دواءك. إذا تجاوز 300 اتصل بالطبيب فوراً.',
  'نصيحة': 'قس مستوى السكر يومياً صباحاً، التزم بوجباتك المنتظمة، احرص على ممارسة الرياضة 30 دقيقة يومياً.',
  'ماء': 'اشرب 8-10 أكواب ماء يومياً. الماء يساعد الكلى على إخراج السكر الزائد.',
  'تمرين': 'المشي السريع 30 دقيقة يومياً يخفض السكر بشكل فعّال. تجنب التمرين الشديد عند انخفاض السكر.',
  'سمنة': 'لمكافحة السمنة: قلل الكربوهيدرات المكررة، تناول وجبات صغيرة منتظمة، زد النشاط البدني التدريجي.',
  'دهون': 'قلل الدهون المشبعة والمتحولة، وزد الدهون الصحية كزيت الزيتون والأفوكادو.',
  'ضغط': 'السيطرة على ضغط الدم مهمة لمريض السكري. قلل الملح، ومارس الرياضة وتناول الفواكه والخضار.',
  'default': 'مرحباً! أنا مساعدك الصحي 🤖 يمكنني مساعدتك في أسئلة حول السكري والسمنة والتغذية والرياضة. اسألني!'
};

function getChatResponse(msg) {
  const lower = msg.toLowerCase();
  for (const [key, val] of Object.entries(chatResponses)) {
    if (key !== 'default' && lower.includes(key)) return val;
  }
  return chatResponses.default;
}

// Reminder notification check
function checkReminders(reminders) {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  reminders.forEach(r => {
    if (r.time === currentTime && !r.taken) {
      notify(`⏰ تذكير: حان وقت تناول ${r.medicine}`, 'warning', 8000);
    }
  });
}

// Water reminder
let waterCount = 0;
function initWaterReminder() {
  const savedCount = parseInt(localStorage.getItem('waterCount') || '0');
  const savedDate = localStorage.getItem('waterDate');
  const today = new Date().toDateString();
  if (savedDate !== today) {
    waterCount = 0;
    localStorage.setItem('waterDate', today);
  } else {
    waterCount = savedCount;
  }
  updateWaterDisplay();
}

function addWater() {
  waterCount = Math.min(waterCount + 1, 10);
  localStorage.setItem('waterCount', waterCount);
  localStorage.setItem('waterDate', new Date().toDateString());
  updateWaterDisplay();
  notify(`شربت ${waterCount} كوب ماء اليوم 💧`, 'info');
}

function updateWaterDisplay() {
  const el = document.getElementById('waterCount');
  const progress = document.getElementById('waterProgress');
  if (el) el.textContent = waterCount;
  if (progress) progress.style.width = `${(waterCount / 10) * 100}%`;
}

// Draw a simple line chart using Canvas
function drawLineChart(canvasId, labels, data, label, color = '#1a9bbf') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const pad = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  ctx.clearRect(0, 0, W, H);

  if (!data.length) {
    ctx.fillStyle = '#4a7a8a';
    ctx.font = '14px Cairo';
    ctx.textAlign = 'center';
    ctx.fillText('لا توجد بيانات بعد', W / 2, H / 2);
    return;
  }

  const min = Math.min(...data) * 0.9;
  const max = Math.max(...data) * 1.1;
  const range = max - min || 1;

  const toX = i => pad.left + (i / (data.length - 1 || 1)) * chartW;
  const toY = v => pad.top + chartH - ((v - min) / range) * chartH;

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (chartH / 4) * i;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + chartW, y); ctx.stroke();
  }

  // Gradient fill
  const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
  grad.addColorStop(0, color + '55');
  grad.addColorStop(1, color + '00');
  ctx.beginPath();
  ctx.moveTo(toX(0), toY(data[0]));
  data.forEach((v, i) => { if (i > 0) ctx.lineTo(toX(i), toY(v)); });
  ctx.lineTo(toX(data.length - 1), pad.top + chartH);
  ctx.lineTo(toX(0), pad.top + chartH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.moveTo(toX(0), toY(data[0]));
  data.forEach((v, i) => { if (i > 0) ctx.lineTo(toX(i), toY(v)); });
  ctx.stroke();

  // Points
  data.forEach((v, i) => {
    ctx.beginPath();
    ctx.arc(toX(i), toY(v), 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#0c2535';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Labels
  ctx.fillStyle = '#4a7a8a';
  ctx.font = '11px Cairo';
  ctx.textAlign = 'center';
  const step = Math.ceil(data.length / 7);
  labels.forEach((l, i) => {
    if (i % step === 0) ctx.fillText(l, toX(i), H - 8);
  });

  // Y labels
  ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const v = min + (range / 4) * (4 - i);
    ctx.fillText(Math.round(v), pad.left - 6, pad.top + (chartH / 4) * i + 4);
  }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initTabs();
  initModals();
  initSmoothScroll();
  setTimeout(initAnimations, 100);
  initWaterReminder();
});
