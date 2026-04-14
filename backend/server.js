const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const session = require('express-session');

const app = express();
const PORT = 3000;

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');
const REMINDERS_FILE = path.join(DATA_DIR, 'reminders.json');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(session({
  secret: 'madar-health-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Helper functions
function readJSON(file) {
  try {
    if (!fs.existsSync(file)) fs.writeFileSync(file, '[]');
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch { return []; }
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'madar_salt').digest('hex');
}

// Auth middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  res.status(401).json({ success: false, message: 'غير مصرح' });
}

// ROUTES

// Register
app.post('/api/register', (req, res) => {
  const { name, email, password, age, weight, height } = req.body;
  if (!name || !email || !password) return res.json({ success: false, message: 'جميع الحقول مطلوبة' });

  const users = readJSON(USERS_FILE);
  if (users.find(u => u.email === email)) return res.json({ success: false, message: 'البريد الإلكتروني مستخدم بالفعل' });

  const newUser = {
    id: Date.now().toString(),
    name, email,
    password: hashPassword(password),
    age: parseInt(age) || 0,
    weight: parseFloat(weight) || 0,
    height: parseFloat(height) || 0,
    points: 0,
    level: 'مبتدئ',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeJSON(USERS_FILE, users);

  req.session.userId = newUser.id;
  req.session.userName = newUser.name;

  const { password: _, ...safeUser } = newUser;
  res.json({ success: true, user: safeUser });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.email === email && u.password === hashPassword(password));

  if (!user) return res.json({ success: false, message: 'بريد إلكتروني أو كلمة مرور خاطئة' });

  req.session.userId = user.id;
  req.session.userName = user.name;

  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Get current user
app.get('/api/me', requireAuth, (req, res) => {
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.id === req.session.userId);
  if (!user) return res.json({ success: false });
  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

// Update user profile
app.put('/api/me', requireAuth, (req, res) => {
  const users = readJSON(USERS_FILE);
  const idx = users.findIndex(u => u.id === req.session.userId);
  if (idx === -1) return res.json({ success: false });

  const { name, age, weight, height } = req.body;
  if (name) users[idx].name = name;
  if (age) users[idx].age = parseInt(age);
  if (weight) users[idx].weight = parseFloat(weight);
  if (height) users[idx].height = parseFloat(height);

  writeJSON(USERS_FILE, users);
  const { password: _, ...safeUser } = users[idx];
  res.json({ success: true, user: safeUser });
});

// Add glucose log
app.post('/api/add-log', requireAuth, (req, res) => {
  const { glucose, notes, type } = req.body;
  const logs = readJSON(LOGS_FILE);

  const newLog = {
    id: Date.now().toString(),
    userId: req.session.userId,
    glucose: parseFloat(glucose),
    notes: notes || '',
    type: type || 'فاطر',
    timestamp: new Date().toISOString()
  };

  logs.push(newLog);
  writeJSON(LOGS_FILE, logs);

  // Add points
  const users = readJSON(USERS_FILE);
  const idx = users.findIndex(u => u.id === req.session.userId);
  if (idx !== -1) {
    users[idx].points = (users[idx].points || 0) + 5;
    users[idx].level = getLevel(users[idx].points);
    writeJSON(USERS_FILE, users);
  }

  res.json({ success: true, log: newLog });
});

// Get logs
app.get('/api/get-logs', requireAuth, (req, res) => {
  const logs = readJSON(LOGS_FILE);
  const userLogs = logs.filter(l => l.userId === req.session.userId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 30);
  res.json({ success: true, logs: userLogs });
});

// Add weight log
app.post('/api/add-weight', requireAuth, (req, res) => {
  const { weight } = req.body;
  const logs = readJSON(LOGS_FILE);

  const newLog = {
    id: Date.now().toString(),
    userId: req.session.userId,
    weight: parseFloat(weight),
    logType: 'weight',
    timestamp: new Date().toISOString()
  };

  logs.push(newLog);
  writeJSON(LOGS_FILE, logs);

  // Update user weight
  const users = readJSON(USERS_FILE);
  const idx = users.findIndex(u => u.id === req.session.userId);
  if (idx !== -1) {
    users[idx].weight = parseFloat(weight);
    writeJSON(USERS_FILE, users);
  }

  res.json({ success: true, log: newLog });
});

// Get weight logs
app.get('/api/get-weight-logs', requireAuth, (req, res) => {
  const logs = readJSON(LOGS_FILE);
  const weightLogs = logs.filter(l => l.userId === req.session.userId && l.logType === 'weight')
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .slice(-20);
  res.json({ success: true, logs: weightLogs });
});

// Add reminder
app.post('/api/add-reminder', requireAuth, (req, res) => {
  const { medicine, time, dose } = req.body;
  const reminders = readJSON(REMINDERS_FILE);

  const newReminder = {
    id: Date.now().toString(),
    userId: req.session.userId,
    medicine, time, dose: dose || '',
    active: true,
    taken: false,
    createdAt: new Date().toISOString()
  };

  reminders.push(newReminder);
  writeJSON(REMINDERS_FILE, reminders);
  res.json({ success: true, reminder: newReminder });
});

// Get reminders
app.get('/api/get-reminders', requireAuth, (req, res) => {
  const reminders = readJSON(REMINDERS_FILE);
  const userReminders = reminders.filter(r => r.userId === req.session.userId && r.active);
  res.json({ success: true, reminders: userReminders });
});

// Mark reminder taken
app.put('/api/reminder/:id/taken', requireAuth, (req, res) => {
  const reminders = readJSON(REMINDERS_FILE);
  const idx = reminders.findIndex(r => r.id === req.params.id && r.userId === req.session.userId);
  if (idx === -1) return res.json({ success: false });

  reminders[idx].taken = true;
  writeJSON(REMINDERS_FILE, reminders);

  // Add points
  const users = readJSON(USERS_FILE);
  const uidx = users.findIndex(u => u.id === req.session.userId);
  if (uidx !== -1) {
    users[uidx].points = (users[uidx].points || 0) + 10;
    users[uidx].level = getLevel(users[uidx].points);
    writeJSON(USERS_FILE, users);
  }

  res.json({ success: true });
});

// Delete reminder
app.delete('/api/reminder/:id', requireAuth, (req, res) => {
  const reminders = readJSON(REMINDERS_FILE);
  const idx = reminders.findIndex(r => r.id === req.params.id && r.userId === req.session.userId);
  if (idx === -1) return res.json({ success: false });
  reminders[idx].active = false;
  writeJSON(REMINDERS_FILE, reminders);
  res.json({ success: true });
});

function getLevel(points) {
  if (points >= 500) return 'خبير';
  if (points >= 200) return 'متقدم';
  if (points >= 50) return 'متوسط';
  return 'مبتدئ';
}

// Init data files
[USERS_FILE, LOGS_FILE, REMINDERS_FILE].forEach(f => { if (!fs.existsSync(f)) writeJSON(f, []); });

app.listen(PORT, () => console.log(`مدار الصحة يعمل على http://localhost:${PORT}`));
