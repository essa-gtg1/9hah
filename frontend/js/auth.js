// Auth pages: login & register

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = loginForm.querySelector('[type=submit]');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner" style="width:18px;height:18px;border-width:2px;margin:0;display:inline-block;"></span>';

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const msg = document.getElementById('authMsg');

      try {
        const data = await API.post('/api/login', { email, password });
        if (data.success) {
          notify('مرحباً بعودتك! ' + data.user.name, 'success');
          setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
        } else {
          msg.innerHTML = `<div class="alert alert-danger">❌ ${data.message}</div>`;
          btn.disabled = false;
          btn.textContent = 'تسجيل الدخول';
        }
      } catch {
        msg.innerHTML = `<div class="alert alert-danger">❌ خطأ في الاتصال بالخادم</div>`;
        btn.disabled = false;
        btn.textContent = 'تسجيل الدخول';
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = registerForm.querySelector('[type=submit]');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner" style="width:18px;height:18px;border-width:2px;margin:0;display:inline-block;"></span>';

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirmPass = document.getElementById('confirmPass').value;
      const age = document.getElementById('age').value;
      const weight = document.getElementById('weight').value;
      const height = document.getElementById('height').value;
      const msg = document.getElementById('authMsg');

      if (password !== confirmPass) {
        msg.innerHTML = `<div class="alert alert-danger">❌ كلمتا المرور غير متطابقتين</div>`;
        btn.disabled = false;
        btn.textContent = 'إنشاء حساب';
        return;
      }

      if (password.length < 6) {
        msg.innerHTML = `<div class="alert alert-danger">❌ كلمة المرور يجب أن تكون 6 أحرف على الأقل</div>`;
        btn.disabled = false;
        btn.textContent = 'إنشاء حساب';
        return;
      }

      try {
        const data = await API.post('/api/register', { name, email, password, age, weight, height });
        if (data.success) {
          notify('تم إنشاء حسابك بنجاح! 🎉', 'success');
          setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
        } else {
          msg.innerHTML = `<div class="alert alert-danger">❌ ${data.message}</div>`;
          btn.disabled = false;
          btn.textContent = 'إنشاء حساب';
        }
      } catch {
        msg.innerHTML = `<div class="alert alert-danger">❌ خطأ في الاتصال بالخادم</div>`;
        btn.disabled = false;
        btn.textContent = 'إنشاء حساب';
      }
    });
  }
});
