// Obesity & Health Calculators

document.addEventListener('DOMContentLoaded', () => {
  initBMICalc();
  initCalorieCalc();
  initDietPlan();
  initWorkoutPlan();
  initRiskTest();
});

// BMI CALCULATOR
function initBMICalc() {
  const form = document.getElementById('bmiForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const weight = parseFloat(document.getElementById('bmiWeight').value);
    const height = parseFloat(document.getElementById('bmiHeight').value);
    const bmi = parseFloat(calcBMI(weight, height));
    const cat = getBMICategory(bmi);

    const result = document.getElementById('bmiResult');
    if (!result) return;
    result.innerHTML = `
      <div style="text-align:center;padding:24px;">
        <div class="bmi-result" style="color:${cat.color}">${bmi}</div>
        <div class="bmi-label" style="color:${cat.color}">${cat.label}</div>
        <div style="margin-top:16px;color:var(--text-muted);font-size:0.88rem;">
          الوزن: ${weight} كغ | الطول: ${height} سم
        </div>
        <div style="margin-top:16px;">
          <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--text-muted);margin-bottom:6px;">
            <span>نحيف &lt;18.5</span><span>طبيعي 18.5-25</span><span>زيادة 25-30</span><span>سمنة &gt;30</span>
          </div>
          <div class="bmi-bar">
            <div class="bmi-segment bmi-seg-1"></div>
            <div class="bmi-segment bmi-seg-2"></div>
            <div class="bmi-segment bmi-seg-3"></div>
            <div class="bmi-segment bmi-seg-4"></div>
          </div>
        </div>
        ${getBMIAdvice(bmi, cat.label)}
      </div>
    `;
    result.style.display = 'block';
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

function getBMIAdvice(bmi, cat) {
  const advices = {
    'نحيف': '<div class="alert alert-info" style="margin-top:16px;text-align:right;">💡 يُنصح بزيادة السعرات الحرارية وتناول وجبات غنية بالبروتين والكربوهيدرات الصحية.</div>',
    'طبيعي': '<div class="alert alert-success" style="margin-top:16px;text-align:right;">✅ وزنك مثالي! حافظ على نمط حياتك الصحي.</div>',
    'زيادة وزن': '<div class="alert alert-warning" style="margin-top:16px;text-align:right;">⚠️ يُنصح بتقليل السعرات 300-500 وزيادة النشاط البدني تدريجياً.</div>',
    'سمنة': '<div class="alert alert-danger" style="margin-top:16px;text-align:right;">🚨 يُنصح بمراجعة الطبيب ووضع خطة غذائية مناسبة. تجنب حمية قاسية مفاجئة.</div>'
  };
  return advices[cat] || '';
}

// CALORIE CALCULATOR
function initCalorieCalc() {
  const form = document.getElementById('calorieForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const age = parseFloat(document.getElementById('calAge').value);
    const weight = parseFloat(document.getElementById('calWeight').value);
    const height = parseFloat(document.getElementById('calHeight').value);
    const gender = document.getElementById('calGender').value;
    const activity = parseFloat(document.getElementById('calActivity').value);

    // Mifflin-St Jeor
    let bmr;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    const tdee = Math.round(bmr * activity);
    const lose = tdee - 500;
    const gain = tdee + 300;

    const result = document.getElementById('calorieResult');
    if (!result) return;
    result.innerHTML = `
      <div class="cards-grid" style="grid-template-columns:repeat(3,1fr);gap:14px;margin-top:16px;">
        <div class="stat-card" style="flex-direction:column;text-align:center;">
          <div class="stat-icon" style="background:rgba(26,155,191,0.15);color:var(--primary-light);margin:0 auto 8px;">🎯</div>
          <div class="stat-value" style="font-size:1.5rem;color:var(--primary-light)">${tdee}</div>
          <div class="stat-label">الاحتياج اليومي</div>
        </div>
        <div class="stat-card" style="flex-direction:column;text-align:center;">
          <div class="stat-icon" style="background:rgba(29,184,138,0.15);color:var(--secondary);margin:0 auto 8px;">📉</div>
          <div class="stat-value" style="font-size:1.5rem;color:var(--secondary)">${lose}</div>
          <div class="stat-label">لخسارة الوزن</div>
        </div>
        <div class="stat-card" style="flex-direction:column;text-align:center;">
          <div class="stat-icon" style="background:rgba(240,165,0,0.15);color:var(--accent);margin:0 auto 8px;">📈</div>
          <div class="stat-value" style="font-size:1.5rem;color:var(--accent)">${gain}</div>
          <div class="stat-label">لزيادة الوزن</div>
        </div>
      </div>
      <div class="alert alert-info" style="margin-top:16px;">
        💡 هذه الأرقام تقديرية. استشر أخصائي تغذية للحصول على خطة مخصصة.
      </div>
    `;
    result.style.display = 'block';
  });
}

// SMART DIET PLAN
function initDietPlan() {
  const btn = document.getElementById('generateDietBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const goal = document.getElementById('dietGoal').value;
    const calories = parseInt(document.getElementById('dietCalories').value) || 2000;
    const plan = generateDietPlan(goal, calories);
    const result = document.getElementById('dietPlanResult');
    if (!result) return;
    result.innerHTML = plan;
    result.style.display = 'block';
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

function generateDietPlan(goal, totalCal) {
  const plans = {
    lose: {
      breakfast: { items: ['شوفان بالحليب قليل الدسم', 'بيضة مسلوقة', 'تفاحة'], protein: '20g', carbs: '45g', fat: '8g', cal: Math.round(totalCal * 0.25) },
      lunch: { items: ['صدر دجاج مشوي 150g', 'أرز بني نصف كوب', 'سلطة خضراء', 'خضار مطبوخة'], protein: '40g', carbs: '50g', fat: '10g', cal: Math.round(totalCal * 0.35) },
      dinner: { items: ['سمك مشوي أو مسلوق', 'خضار على البخار', 'شوربة عدس'], protein: '35g', carbs: '30g', fat: '8g', cal: Math.round(totalCal * 0.25) },
      snacks: { items: ['حفنة لوز', 'يوغرت قليل الدسم'], cal: Math.round(totalCal * 0.15) }
    },
    maintain: {
      breakfast: { items: ['خبز توست بالزبدة وزيت الزيتون', 'بيضتان', 'عصير برتقال طازج'], protein: '22g', carbs: '55g', fat: '15g', cal: Math.round(totalCal * 0.25) },
      lunch: { items: ['دجاج أو لحم 200g', 'أرز أو معكرونة', 'سلطة', 'خضار'], protein: '45g', carbs: '70g', fat: '15g', cal: Math.round(totalCal * 0.35) },
      dinner: { items: ['بروتين خفيف', 'خضار', 'حبة خبز'], protein: '30g', carbs: '45g', fat: '12g', cal: Math.round(totalCal * 0.25) },
      snacks: { items: ['فواكه', 'مكسرات', 'لبن'], cal: Math.round(totalCal * 0.15) }
    },
    gain: {
      breakfast: { items: ['فطور كامل: بيض وجبن وتوست', 'حليب كامل الدسم', 'موز'], protein: '30g', carbs: '75g', fat: '20g', cal: Math.round(totalCal * 0.25) },
      lunch: { items: ['لحم أو دجاج 250g', 'أرز وافر', 'خبز', 'عصير'], protein: '55g', carbs: '90g', fat: '20g', cal: Math.round(totalCal * 0.35) },
      dinner: { items: ['وجبة كاملة البروتين', 'كربوهيدرات', 'خضار متنوعة'], protein: '45g', carbs: '65g', fat: '18g', cal: Math.round(totalCal * 0.25) },
      snacks: { items: ['بروتين شيك', 'تمر ومكسرات', 'زبدة الفول السوداني'], cal: Math.round(totalCal * 0.15) }
    }
  };

  const p = plans[goal] || plans.maintain;
  const mealNames = { breakfast: '🌅 وجبة الإفطار', lunch: '☀️ وجبة الغداء', dinner: '🌙 وجبة العشاء', snacks: '🍎 الوجبات الخفيفة' };

  return Object.entries(p).map(([key, meal]) => `
    <div class="meal-card">
      <div class="meal-name">${mealNames[key]}</div>
      <ul style="color:var(--text-secondary);font-size:0.88rem;margin-bottom:10px;padding-right:18px;">
        ${meal.items ? meal.items.map(item => `<li>${item}</li>`).join('') : ''}
      </ul>
      <div class="macro-row">
        ${meal.protein ? `<span class="macro-pill">🥩 بروتين: ${meal.protein}</span>` : ''}
        ${meal.carbs ? `<span class="macro-pill">🌾 كربوهيدرات: ${meal.carbs}</span>` : ''}
        ${meal.fat ? `<span class="macro-pill">🫒 دهون: ${meal.fat}</span>` : ''}
        <span class="macro-pill" style="color:var(--accent)">🔥 ${meal.cal} سعرة</span>
      </div>
    </div>
  `).join('');
}

// WORKOUT PLAN
function initWorkoutPlan() {
  const btn = document.getElementById('generateWorkoutBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const level = document.getElementById('fitnessLevel').value;
    const goal = document.getElementById('workoutGoal').value;
    const plan = generateWorkoutPlan(level, goal);
    const result = document.getElementById('workoutPlanResult');
    if (!result) return;
    result.innerHTML = plan;
    result.style.display = 'block';
  });
}

function generateWorkoutPlan(level, goal) {
  const plans = {
    beginner: [
      { day: 'الأحد', exercises: [{ name: 'مشي خفيف', sets: '1', reps: '20 دقيقة', emoji: '🚶' }, { name: 'تمطيط عام', sets: '1', reps: '10 دقائق', emoji: '🧘' }] },
      { day: 'الثلاثاء', exercises: [{ name: 'مشي سريع', sets: '1', reps: '25 دقيقة', emoji: '🚶' }, { name: 'تمارين التنفس', sets: '3', reps: '10', emoji: '💨' }] },
      { day: 'الخميس', exercises: [{ name: 'مشي خفيف', sets: '1', reps: '30 دقيقة', emoji: '🚶' }, { name: 'تمطيط', sets: '1', reps: '10 دقائق', emoji: '🤸' }] },
    ],
    intermediate: [
      { day: 'الأحد', exercises: [{ name: 'ركض خفيف (كارديو)', sets: '1', reps: '30 دقيقة', emoji: '🏃' }, { name: 'تمارين البطن', sets: '3', reps: '15', emoji: '💪' }] },
      { day: 'الاثنين', exercises: [{ name: 'تمارين الصدر والذراع', sets: '3', reps: '12', emoji: '💪' }, { name: 'دفع الجسم (Push-ups)', sets: '3', reps: '12', emoji: '🏋️' }] },
      { day: 'الأربعاء', exercises: [{ name: 'تمارين الساق', sets: '3', reps: '15', emoji: '🦵' }, { name: 'القرفصاء', sets: '3', reps: '15', emoji: '🏋️' }] },
      { day: 'الجمعة', exercises: [{ name: 'ركض + مشي', sets: '1', reps: '40 دقيقة', emoji: '🏃' }, { name: 'تمطيط شامل', sets: '1', reps: '15 دقائق', emoji: '🧘' }] },
    ],
    advanced: [
      { day: 'الأحد - صدر/ترايسبس', exercises: [{ name: 'بنش برس', sets: '4', reps: '10', emoji: '🏋️' }, { name: 'دمبل فلاي', sets: '3', reps: '12', emoji: '💪' }, { name: 'دفع الجسم ضيق', sets: '3', reps: '15', emoji: '💪' }] },
      { day: 'الثلاثاء - ظهر/بايسبس', exercises: [{ name: 'سحب بار', sets: '4', reps: '8', emoji: '🏋️' }, { name: 'رفع دمبل', sets: '3', reps: '12', emoji: '💪' }, { name: 'سحب كيبل', sets: '3', reps: '12', emoji: '🔄' }] },
      { day: 'الأربعاء - كارديو', exercises: [{ name: 'HIIT 20 دقيقة', sets: '4', reps: '30 ث عمل / 30 ث راحة', emoji: '🏃' }] },
      { day: 'الخميس - ساق', exercises: [{ name: 'قرفصاء باربل', sets: '4', reps: '10', emoji: '🦵' }, { name: 'ليج برس', sets: '3', reps: '12', emoji: '🏋️' }, { name: 'ليج كيرل', sets: '3', reps: '12', emoji: '💪' }] },
      { day: 'السبت - كتف/بطن', exercises: [{ name: 'رفع أمامي وجانبي', sets: '3', reps: '12', emoji: '🏋️' }, { name: 'تمارين بطن متنوعة', sets: '4', reps: '15', emoji: '💪' }] },
    ]
  };

  const plan = plans[level] || plans.beginner;
  const emojisGoal = { lose: '📉 خسارة الوزن', maintain: '⚖️ الحفاظ على الوزن', strength: '💪 بناء العضلات', cardio: '❤️ تحسين اللياقة' };

  let html = `<div class="alert alert-info" style="margin-bottom:16px;">🎯 الهدف: ${emojisGoal[goal] || goal}</div>`;
  html += plan.map(day => `
    <div class="card" style="margin-bottom:14px;">
      <div style="font-weight:800;font-size:1rem;margin-bottom:14px;color:var(--primary-light);">📅 ${day.day}</div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${day.exercises.map(ex => `
          <div style="display:flex;align-items:center;gap:12px;padding:10px;background:rgba(255,255,255,0.03);border-radius:8px;">
            <span style="font-size:1.3rem;">${ex.emoji}</span>
            <div style="flex:1;">
              <div style="font-weight:600;font-size:0.9rem;">${ex.name}</div>
              <div style="color:var(--text-muted);font-size:0.8rem;">${ex.sets} مجموعة × ${ex.reps}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  return html;
}

// RISK TEST (Diabetes)
function initRiskTest() {
  const form = document.getElementById('riskForm');
  if (!form) return;
  let score = 0;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const answers = {
      age: parseInt(document.getElementById('riskAge').value) || 0,
      family: document.getElementById('riskFamily').value === 'yes' ? 1 : 0,
      bmi: parseFloat(document.getElementById('riskBMI').value) || 0,
      activity: document.getElementById('riskActivity').value === 'low' ? 1 : 0,
      bp: document.getElementById('riskBP').value === 'yes' ? 1 : 0,
      sugar: document.getElementById('riskSugar').value === 'yes' ? 1 : 0,
    };

    score = 0;
    if (answers.age >= 45) score += 2;
    else if (answers.age >= 35) score += 1;
    score += answers.family * 2;
    if (answers.bmi >= 30) score += 3;
    else if (answers.bmi >= 25) score += 1;
    score += answers.activity * 2;
    score += answers.bp * 1;
    score += answers.sugar * 3;

    const result = document.getElementById('riskResult');
    if (!result) return;

    let level, color, advice;
    if (score <= 2) {
      level = 'منخفض'; color = 'var(--secondary)';
      advice = 'خطرك منخفض حالياً. حافظ على نمط حياتك الصحي وفحص دوري كل 3 سنوات.';
    } else if (score <= 5) {
      level = 'متوسط'; color = 'var(--accent)';
      advice = 'هناك بعض عوامل الخطر. يُنصح بتعديل النظام الغذائي وزيادة الرياضة. فحص سنوي مطلوب.';
    } else {
      level = 'مرتفع'; color = 'var(--danger)';
      advice = 'عوامل الخطر مرتفعة. يُنصح بزيارة الطبيب لإجراء فحص السكر والحصول على خطة وقائية.';
    }

    result.innerHTML = `
      <div style="text-align:center;padding:24px;background:var(--bg-card);border-radius:var(--radius);border:1px solid var(--border);margin-top:20px;">
        <div style="font-size:3rem;margin-bottom:8px;">${score <= 2 ? '🟢' : score <= 5 ? '🟡' : '🔴'}</div>
        <div style="font-size:1.8rem;font-weight:900;color:${color}">مستوى الخطر: ${level}</div>
        <div style="color:var(--text-muted);font-size:0.85rem;margin-top:4px;">النقاط: ${score}/12</div>
        <div style="margin-top:16px;">
          <div class="progress" style="height:12px;margin-bottom:8px;">
            <div class="progress-bar" style="width:${Math.min(100, (score/12)*100)}%;background:${color};"></div>
          </div>
        </div>
        <div class="alert" style="margin-top:16px;text-align:right;background:rgba(${score<=2?'29,184,138':score<=5?'240,165,0':'232,69,69'},0.1);border-color:${color};color:${color};">
          💡 ${advice}
        </div>
      </div>
    `;
    result.style.display = 'block';
  });
}
