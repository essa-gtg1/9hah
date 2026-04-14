// Dashboard logic

let currentUser = null;
let glucoseLogs = [];
let weightLogs = [];
let reminders = [];

document.addEventListener('DOMContentLoaded', async () => {
  currentUser = await checkAuth();
  if (!currentUser) return;

  updateUserInfo();
  await loadAllData();
  initDashboardTabs();
  initReminderCheck();
  initGlucoseForm();
  initWeightForm();
  initReminderForm();
  initLogout();
  initWaterReminder();
  initChatbot();

  // Reload reminders every minute for notifications
  setInterval(async () => {
    const data = await API.get('/api/get-reminders');
    if (data.success) { reminders = data.reminders; checkReminders(reminders); }
  }, 60000);
});

function updateUserInfo() {
  document.querySelectorAll('.user-name').forEach(el => el.textContent = currentUser.name);
  document.querySelectorAll('.user-email').forEach(el => el.textContent = currentUser.email);
  document.querySelectorAll('.user-points').forEach(el => el.textContent = currentUser.points || 0);
  document.querySelectorAll('.user-level').forEach(el => el.textContent = currentUser.level || 'مبتدئ');

  const bmi = currentUser.weight && currentUser.height
    ? calcBMI(currentUser.weight, currentUser.height)
    : '—';
  document.querySelectorAll('.user-bmi').forEach(el => {
    el.textContent = bmi;
    if (bmi !== '—') {
      const cat = getBMICategory(parseFloat(bmi));
      const badge = el.nextElementSibling;
      if (badge && badge.classList.contains('badge')) {
        badge.textContent = cat.label;
        badge.style.color = cat.color;
      }
    }
  });
}

async function loadAllData() {
  const [logsData, weightData, remindersData] = await Promise.all([
    API.get('/api/get-logs'),
    API.get('/api/get-weight-logs'),
    API.get('/api/get-reminders')
  ]);

  if (logsData.success) {
    glucoseLogs = logsData.logs;
    renderGlucoseLogs();
    updateGlucoseStats();
    drawGlucoseChart();
  }

  if (weightData.success) {
    weightLogs = weightData.logs;
    drawWeightChart();
  }

  if (remindersData.success) {
    reminders = remindersData.reminders;
    renderReminders();
    checkReminders(reminders);
  }
}

function renderGlucoseLogs() {
  const tbody = document.getElementById('glucoseTableBody');
  const empty = document.getElementById('glucoseEmpty');
  if (!tbody) return;

  if (!glucoseLogs.length) {
    tbody.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }

  if (empty) empty.style.display = 'none';
  tbody.innerHTML = glucoseLogs.slice(0, 10).map(log => {
    const status = glucoseStatus(log.glucose);
    return `<tr>
      <td>${formatDate(log.timestamp)}</td>
      <td><strong>${log.glucose}</strong> mg/dL</td>
      <td>${log.type}</td>
      <td><span class="badge badge-${status.color}">${status.label}</span></td>
      <td style="color:var(--text-muted);font-size:0.82rem">${log.notes || '—'}</td>
    </tr>`;
  }).join('');
}

function updateGlucoseStats() {
  if (!glucoseLogs.length) return;
  const values = glucoseLogs.map(l => l.glucose);
  const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(0);
  const latest = values[0];
  const status = glucoseStatus(latest);

  const elAvg = document.getElementById('avgGlucose');
  const elLatest = document.getElementById('latestGlucose');
  const elStatus = document.getElementById('glucoseStatusBadge');

  if (elAvg) elAvg.textContent = avg;
  if (elLatest) elLatest.textContent = latest;
  if (elStatus) {
    elStatus.textContent = status.label;
    elStatus.className = `badge badge-${status.color}`;
  }

  // Alert if dangerous
  if (status.alert) {
    notify(`⚠️ مستوى السكر ${latest} mg/dL - ${status.label}`, latest < 70 ? 'warning' : 'danger', 6000);
  }
}

function drawGlucoseChart() {
  const logs = [...glucoseLogs].reverse().slice(-15);
  const labels = logs.map(l => new Date(l.timestamp).toLocaleDateString('ar', { month: 'short', day: 'numeric' }));
  const data = logs.map(l => l.glucose);
  drawLineChart('glucoseChart', labels, data, 'السكر', '#1a9bbf');
}

function drawWeightChart() {
  const labels = weightLogs.map(l => new Date(l.timestamp).toLocaleDateString('ar', { month: 'short', day: 'numeric' }));
  const data = weightLogs.map(l => l.weight);
  drawLineChart('weightChart', labels, data, 'الوزن', '#1db88a');
}

function renderReminders() {
  const container = document.getElementById('remindersList');
  const empty = document.getElementById('remindersEmpty');
  if (!container) return;

  if (!reminders.length) {
    container.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }

  if (empty) empty.style.display = 'none';
  container.innerHTML = reminders.map(r => `
    <div class="card" style="padding:16px 20px;margin-bottom:12px;">
      <div style="display:flex;align-items:center;gap:14px;">
        <div class="stat-icon" style="background:rgba(240,165,0,0.15);color:var(--accent);font-size:1.3rem;">💊</div>
        <div style="flex:1;">
          <div style="font-weight:700;">${r.medicine}</div>
          <div style="color:var(--text-muted);font-size:0.82rem;">⏰ ${r.time}${r.dose ? ' • ' + r.dose : ''}</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          ${r.taken ? '<span class="badge badge-success">✅ تم</span>' : `<button class="btn btn-success btn-sm" onclick="markTaken('${r.id}')">تم التناول</button>`}
          <button class="btn btn-sm" style="background:rgba(232,69,69,0.1);color:var(--danger);" onclick="deleteReminder('${r.id}')">🗑</button>
        </div>
      </div>
    </div>
  `).join('');
}

async function markTaken(id) {
  const data = await API.put(`/api/reminder/${id}/taken`, {});
  if (data.success) {
    notify('✅ تم تسجيل أخذ الدواء! +10 نقاط 🎉', 'success');
    currentUser.points += 10;
    updateUserInfo();
    const r = reminders.find(r => r.id === id);
    if (r) r.taken = true;
    renderReminders();
  }
}

async function deleteReminder(id) {
  if (!confirm('هل تريد حذف هذا التذكير؟')) return;
  const data = await API.delete(`/api/reminder/${id}`);
  if (data.success) {
    reminders = reminders.filter(r => r.id !== id);
    renderReminders();
    notify('تم حذف التذكير', 'info');
  }
}

function initGlucoseForm() {
  const form = document.getElementById('glucoseForm');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const glucose = document.getElementById('glucoseInput').value;
    const type = document.getElementById('glucoseType').value;
    const notes = document.getElementById('glucoseNotes').value;

    const data = await API.post('/api/add-log', { glucose, type, notes });
    if (data.success) {
      notify('✅ تم تسجيل قراءة السكر! +5 نقاط', 'success');
      currentUser.points += 5;
      updateUserInfo();
      form.reset();
      closeModal('glucoseModal');
      await loadAllData();
    }
  });
}

function initWeightForm() {
  const form = document.getElementById('weightForm');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const weight = document.getElementById('weightInput').value;
    const data = await API.post('/api/add-weight', { weight });
    if (data.success) {
      notify('✅ تم تسجيل الوزن', 'success');
      currentUser.weight = parseFloat(weight);
      updateUserInfo();
      form.reset();
      closeModal('weightModal');
      await loadAllData();
    }
  });
}

function initReminderForm() {
  const form = document.getElementById('reminderForm');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const medicine = document.getElementById('medicineName').value;
    const time = document.getElementById('medicineTime').value;
    const dose = document.getElementById('medicineDose').value;

    const data = await API.post('/api/add-reminder', { medicine, time, dose });
    if (data.success) {
      notify('✅ تم إضافة التذكير', 'success');
      form.reset();
      closeModal('reminderModal');
      reminders.push(data.reminder);
      renderReminders();
    }
  });
}

function initDashboardTabs() {
  document.querySelectorAll('.sidebar-item[data-section]').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll('.dashboard-section').forEach(s => s.style.display = 'none');
      item.classList.add('active');
      const section = document.getElementById(item.dataset.section);
      if (section) section.style.display = 'block';
    });
  });
}

function initReminderCheck() {
  setInterval(() => { if (reminders.length) checkReminders(reminders); }, 30000);
}

function initLogout() {
  const btn = document.getElementById('logoutBtn');
  if (btn) {
    btn.addEventListener('click', async () => {
      await API.post('/api/logout', {});
      window.location.href = 'index.html';
    });
  }
}

function initChatbot() {
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  const messages = document.getElementById('chatMessages');

  if (!form) return;

  function addMessage(text, type) {
    const div = document.createElement('div');
    div.className = `chat-msg ${type}`;
    div.innerHTML = `<div class="chat-bubble">${text}</div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const msg = input.value.trim();
    if (!msg) return;
    addMessage(msg, 'user');
    input.value = '';
    setTimeout(() => {
      const response = getChatResponse(msg);
      addMessage(response, 'bot');
    }, 500);
  });
}
