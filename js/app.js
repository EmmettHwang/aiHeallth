/* HealthShorts AI — Main Application Logic */

// =====================================================
// CONFIG & STATE
// =====================================================
const API_BASE = 'tables';
let currentUser = null;
let currentPage = 'dashboard';
let generatedShorts = null;
let currentShortId = null;
let charts = {};

// AI Coach messages pool based on health data
const coachMessages = [
  { text: "지난 7일간 수분 섭취 분석 결과, 목표의 평균 82%를 달성했습니다. 아침 기상 직후 500ml 물 마시기 루틴을 추가하면 목표 달성률을 92%까지 올릴 수 있어요! 💧", category: "hydration" },
  { text: "이번 주 수면 데이터를 보니 평균 25분 부족합니다. 취침 전 5분 스트레칭과 디지털 디톡스를 실천하면 수면 질이 40% 개선될 수 있어요. 오늘 밤부터 시작해볼까요? 🌙", category: "sleep" },
  { text: "기분 점수가 스트레스가 높은 날 평균 4.8점으로 떨어지는 패턴이 발견됐어요. 4-7-8 호흡법을 하루 3번 실천하면 코르티솔 수치를 낮출 수 있습니다. 🧘‍♀️", category: "stress" },
  { text: "지난 주 운동 데이터 훌륭해요! 조깅 3회, 요가 1회로 총 110분 운동했습니다. 주 5회 30분 목표까지 조금만 더 힘내세요! 오늘 20분 산책 어때요? 🏃‍♀️", category: "exercise" },
  { text: "체중 트렌드를 분석하면 지난 7일간 0.4kg 감소 추세입니다. 이 속도를 유지하면 목표 체중까지 약 14일 남았어요. 단백질 섭취를 늘리면 더 효과적입니다! 💪", category: "nutrition" }
];

const categoryColors = {
  hydration: { bg: '#0891b2', light: 'rgba(8,145,178,0.15)', emoji: '💧', label: '수분' },
  sleep: { bg: '#7c3aed', light: 'rgba(124,58,237,0.15)', emoji: '🌙', label: '수면' },
  stress: { bg: '#dc2626', light: 'rgba(220,38,38,0.15)', emoji: '🧘', label: '스트레스' },
  exercise: { bg: '#059669', light: 'rgba(5,150,105,0.15)', emoji: '💪', label: '운동' },
  nutrition: { bg: '#d97706', light: 'rgba(217,119,6,0.15)', emoji: '🥗', label: '영양' },
  mindset: { bg: '#7c3aed', light: 'rgba(124,58,237,0.15)', emoji: '💭', label: '마인드셋' },
  general: { bg: '#6366f1', light: 'rgba(99,102,241,0.15)', emoji: '⭐', label: '종합' }
};

// AI Shorts Generation Templates
const shortsTemplates = {
  hydration: {
    hooks: ["오늘 물 얼마나 마셨어요?", "탈수가 살을 찌게 만든다?!", "물만 잘 마셔도 피부가 달라져요"],
    scripts: [
      "많은 분들이 모르는 사실, 목이 마르다는 건 이미 탈수 상태예요.\n\n{user_name}님의 지난 주 평균 수분 섭취 {water_avg}ml — 목표보다 부족합니다.\n\n지금 바로 실천할 3가지:\n1. 아침 기상 즉시 500ml\n2. 식사 30분 전 한 잔\n3. 잠들기 1시간 전 200ml\n\n작은 습관이 건강을 바꿉니다!",
      "수분 섭취가 부족하면 에너지가 20% 감소합니다.\n\n{user_name}님 데이터 기반 맞춤 솔루션:\n목표 {water_goal}ml / 현재 {water_avg}ml\n\n부족한 {water_diff}ml를 채우는 방법:\n1. 스마트폰에 수분 알림 설정\n2. 텀블러를 항상 책상 위에\n3. 카페인 1잔 = 추가 물 500ml"
    ],
    ctas: ["지금 물 한 잔 마시고 인증해요! 💧", "오늘 목표량 꼭 채워봐요!"]
  },
  sleep: {
    hooks: ["자도 자도 피곤하다면?", "수면 25분의 기적", "잠 못 자는 진짜 이유"],
    scripts: [
      "잠의 양보다 질이 더 중요합니다.\n\n{user_name}님의 지난 주 평균 수면: {sleep_avg}시간\n목표까지 {sleep_diff} 부족해요.\n\nREM 수면을 늘리는 3가지 방법:\n1. 취침 1시간 전 스마트폰 끄기\n2. 실내 온도 18-20도 유지\n3. 잠들기 전 4-7-8 호흡법\n\n오늘 밤부터 시작해봐요!",
    ],
    ctas: ["오늘 밤 취침 시간 지켜봐요! 🌙"]
  },
  stress: {
    hooks: ["스트레스가 체중을 늘린다고?", "코르티솔 잡는 5분", "지금 당장 스트레스 해소하는 법"],
    scripts: [
      "스트레스 호르몬 코르티솔은 복부 지방을 쌓습니다.\n\n{user_name}님의 이번 주 기분 점수 평균 {mood_avg}/10\n스트레스 고위험 상태입니다.\n\n즉각적인 스트레스 해소법:\n1. 4-7-8 호흡법 (4초 들숨, 7초 참기, 8초 날숨)\n2. 5분 햇빛 아래 산책\n3. 감사 일기 3줄 쓰기\n\n지금 당장 실천해요!",
    ],
    ctas: ["지금 4-7-8 호흡법 따라해요! 🧘"]
  },
  exercise: {
    hooks: ["운동 30분의 진짜 효과", "이 운동만으로 체중 변화!", "운동을 못 하는 날을 위한 팁"],
    scripts: [
      "운동은 양보다 꾸준함이 핵심입니다.\n\n{user_name}님의 이번 주 운동 현황:\n총 {exercise_total}분, 목표의 {exercise_pct}% 달성\n\n목표 달성을 위한 전략:\n1. 엘리베이터 대신 계단 이용\n2. 점심 후 10분 산책\n3. TV 시청 중 스쿼트 10회\n\n작은 움직임도 운동입니다!",
    ],
    ctas: ["지금 당장 5분 스트레칭 시작! 💪"]
  },
  nutrition: {
    hooks: ["다이어트 실패의 진짜 원인", "단백질 부족이 살을 찌게 한다", "아침 식사로 하루를 바꿔라"],
    scripts: [
      "체중 감량의 핵심은 칼로리 계산이 아닌 영양 균형입니다.\n\n{user_name}님의 목표: {health_goals}\n\n오늘부터 시작하는 영양 최적화:\n1. 아침 단백질 30g 이상 섭취\n2. 식사 전 물 한 잔으로 과식 예방\n3. 식후 30분 가벼운 산책\n\n영양이 바뀌면 몸이 바뀝니다!",
    ],
    ctas: ["다음 식사에서 단백질 체크해봐요! 🥗"]
  },
  mindset: {
    hooks: ["성공하는 사람들의 아침 루틴", "5분으로 하루를 바꾸는 방법", "마인드셋이 건강을 결정한다"],
    scripts: [
      "건강한 몸은 건강한 마음에서 시작됩니다.\n\n{user_name}님, 오늘 하루 어떠셨나요?\n\n멘탈 웰니스를 위한 5분 루틴:\n1. 오늘 감사한 것 3가지 쓰기\n2. 5분 명상 또는 복식 호흡\n3. 오늘 나를 위한 한 가지 칭찬\n\n자신을 사랑하는 것이 최고의 건강법입니다!",
    ],
    ctas: ["지금 감사 일기 써봐요! 💭"]
  },
  general: {
    hooks: ["건강의 4대 기둥을 아세요?", "오늘 건강 점수는 몇 점?", "지금 당장 건강해지는 법"],
    scripts: [
      "건강은 수면, 영양, 운동, 마인드셋의 균형입니다.\n\n{user_name}님의 오늘 건강 현황:\n💧 수분: {water_pct}% 달성\n🌙 수면: {sleep_pct}% 달성\n💪 운동: {exercise_pct}% 달성\n😊 기분: {mood_score}/10\n\n오늘의 우선 과제:\n가장 부족한 항목 하나를 선택하고 10분만 투자해보세요!\n\n작은 변화가 큰 결과를 만듭니다!",
    ],
    ctas: ["오늘의 건강 목표 하나 정해봐요! ⭐"]
  }
};

// =====================================================
// INIT
// =====================================================
document.addEventListener('DOMContentLoaded', async () => {
  initEventListeners();
  
  const hasUser = localStorage.getItem('hs_user_id');
  if (hasUser) {
    await loadUserProfile(hasUser);
    showApp();
  } else {
    showSplash();
  }
});

function showSplash() {
  document.getElementById('splash-screen').classList.remove('hidden');
  document.getElementById('onboarding-screen').classList.add('hidden');
  document.getElementById('app').classList.add('hidden');
}

function showOnboarding() {
  document.getElementById('splash-screen').classList.add('hidden');
  document.getElementById('onboarding-screen').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
  initOnboarding();
}

function showApp() {
  document.getElementById('splash-screen').classList.add('hidden');
  document.getElementById('onboarding-screen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  initApp();
}

// =====================================================
// ONBOARDING
// =====================================================
let obStep = 1;
let obData = { goals: [], activity_level: 'moderate', sleep_goal: 480, water_goal: 2000 };

function initOnboarding() {
  obStep = 1;
  updateObProgress();

  // Goal chips
  document.querySelectorAll('#ob-goals-grid .goal-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('selected');
      const val = chip.dataset.value;
      if (chip.classList.contains('selected')) {
        obData.goals.push(val);
      } else {
        obData.goals = obData.goals.filter(g => g !== val);
      }
    });
  });

  // Activity options
  document.querySelectorAll('#ob-activity-options .activity-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('#ob-activity-options .activity-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      obData.activity_level = opt.dataset.value;
    });
  });
  // Default select moderate
  document.querySelector('[data-value="moderate"]')?.classList.add('selected');

  // Range inputs
  const sleepRange = document.getElementById('ob-sleep');
  const waterRange = document.getElementById('ob-water');
  sleepRange.addEventListener('input', () => {
    const mins = parseInt(sleepRange.value);
    obData.sleep_goal = mins;
    const h = Math.floor(mins / 60), m = mins % 60;
    document.getElementById('ob-sleep-val').textContent = `${h}시간 ${m}분`;
  });
  waterRange.addEventListener('input', () => {
    obData.water_goal = parseInt(waterRange.value);
    document.getElementById('ob-water-val').textContent = `${parseInt(waterRange.value).toLocaleString()}ml`;
  });
}

function updateObProgress() {
  const pct = ((obStep - 1) / 3) * 100;
  document.getElementById('ob-progress-fill').style.width = pct + '%';
  document.getElementById('ob-progress-label').textContent = `${obStep} / 4`;
  document.getElementById('ob-back-btn').style.visibility = obStep > 1 ? 'visible' : 'hidden';
  document.getElementById('ob-next-btn').innerHTML = obStep === 4
    ? '<i class="fas fa-check"></i> 시작하기!'
    : '다음 <i class="fas fa-arrow-right"></i>';
}

function goToObStep(step) {
  document.getElementById(`ob-step-${obStep}`).classList.add('hidden');
  obStep = step;
  document.getElementById(`ob-step-${obStep}`).classList.remove('hidden');
  updateObProgress();
}

async function finishOnboarding() {
  const name = document.getElementById('ob-name').value.trim() || '사용자';
  const age = parseInt(document.getElementById('ob-age').value) || 30;
  const gender = document.getElementById('ob-gender').value || 'other';
  const height = parseFloat(document.getElementById('ob-height').value) || 165;
  const weight = parseFloat(document.getElementById('ob-weight').value) || 60;

  const userData = {
    name, age, gender, height, weight,
    health_goals: obData.goals.length > 0 ? obData.goals : ['건강 유지'],
    conditions: [],
    activity_level: obData.activity_level,
    sleep_goal: obData.sleep_goal,
    water_goal: obData.water_goal,
    onboarding_done: true
  };

  try {
    showToast('프로필 저장 중...', 'info');
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const user = await res.json();
    currentUser = user;
    localStorage.setItem('hs_user_id', user.id);
    showToast('🎉 환영합니다! 첫 숏츠를 만들어볼게요!');
    showApp();
  } catch (e) {
    // Fallback: use demo user
    currentUser = { id: 'user_demo_001', name, ...userData };
    localStorage.setItem('hs_user_id', 'user_demo_001');
    showApp();
  }
}

// =====================================================
// LOAD USER PROFILE
// =====================================================
async function loadUserProfile(userId) {
  try {
    const res = await fetch(`${API_BASE}/users?limit=100`);
    const data = await res.json();
    const users = data.data || [];
    
    // Try to find user by id or use demo
    let user = users.find(u => u.id === userId);
    if (!user && users.length > 0) user = users[0];
    
    if (user) {
      currentUser = user;
    } else {
      currentUser = {
        id: 'user_demo_001', name: '김지현', age: 32, gender: 'female',
        height: 165, weight: 58,
        health_goals: ['체중 감량', '스트레스 감소', '수면 개선'],
        activity_level: 'moderate', sleep_goal: 480, water_goal: 2000,
        onboarding_done: true
      };
    }
  } catch (e) {
    currentUser = {
      id: 'user_demo_001', name: '김지현', age: 32, gender: 'female',
      height: 165, weight: 58,
      health_goals: ['체중 감량', '스트레스 감소', '수면 개선'],
      activity_level: 'moderate', sleep_goal: 480, water_goal: 2000,
      onboarding_done: true
    };
  }
}

// =====================================================
// INIT APP
// =====================================================
function initApp() {
  updateSidebarUser();
  setGreeting();
  navigateTo('dashboard');
  loadDashboard();
}

function updateSidebarUser() {
  if (!currentUser) return;
  document.getElementById('sidebar-name').textContent = currentUser.name;
  document.getElementById('sidebar-avatar').textContent = currentUser.name[0];
  document.getElementById('sidebar-goal').textContent = 
    (currentUser.health_goals || []).slice(0, 2).join(' · ');
  document.getElementById('profile-avatar-large').textContent = currentUser.name[0];
  document.getElementById('profile-name-display').textContent = currentUser.name;
  
  // BMI calculation
  if (currentUser.height && currentUser.weight) {
    const bmi = (currentUser.weight / ((currentUser.height/100) ** 2)).toFixed(1);
    let bmiLabel = bmi < 18.5 ? '저체중' : bmi < 25 ? '정상' : bmi < 30 ? '과체중' : '비만';
    document.getElementById('profile-bmi-display').textContent = `BMI: ${bmi} (${bmiLabel})`;
  }
  
  // Fill profile form
  document.getElementById('profile-name').value = currentUser.name || '';
  document.getElementById('profile-age').value = currentUser.age || '';
  document.getElementById('profile-gender').value = currentUser.gender || 'other';
  document.getElementById('profile-height').value = currentUser.height || '';
  document.getElementById('profile-weight').value = currentUser.weight || '';
  document.getElementById('profile-activity').value = currentUser.activity_level || 'moderate';
  document.getElementById('profile-sleep').value = currentUser.sleep_goal || 480;
  document.getElementById('profile-water').value = currentUser.water_goal || 2000;
  
  // Highlight goals
  const goals = currentUser.health_goals || [];
  document.querySelectorAll('#profile-goals-grid .goal-chip').forEach(chip => {
    if (goals.includes(chip.dataset.value)) chip.classList.add('selected');
    else chip.classList.remove('selected');
  });
}

function setGreeting() {
  const hour = new Date().getHours();
  let greeting = hour < 6 ? '좋은 밤이에요' : hour < 12 ? '좋은 아침이에요' : hour < 17 ? '안녕하세요' : '좋은 저녁이에요';
  const name = currentUser?.name || '사용자';
  document.getElementById('dashboard-greeting').textContent = `${greeting}, ${name}님! 👋`;
  
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const now = new Date();
  document.getElementById('dashboard-date').textContent = 
    `${now.getFullYear()}년 ${now.getMonth()+1}월 ${now.getDate()}일 ${days[now.getDay()]}요일`;
}

// =====================================================
// NAVIGATION
// =====================================================
function navigateTo(page) {
  currentPage = page;
  
  // Update sidebar
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });
  
  // Update bottom nav
  document.querySelectorAll('.bottom-nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });
  
  // Show page
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) { pageEl.classList.remove('hidden'); }
  
  // Load page content
  switch(page) {
    case 'dashboard': loadDashboard(); break;
    case 'log': loadLogPage(); break;
    case 'library': loadLibrary(); break;
    case 'analytics': loadAnalytics(); break;
    case 'profile': break;
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =====================================================
// DASHBOARD
// =====================================================
async function loadDashboard() {
  try {
    const logsRes = await fetch(`${API_BASE}/health_logs?limit=7&sort=log_date`);
    const logsData = await logsRes.json();
    const logs = (logsData.data || []).sort((a,b) => b.log_date?.localeCompare(a.log_date));
    
    // Update today's stats
    if (logs.length > 0) {
      const today = logs[0];
      updateTodayStats(today);
    }
    
    // Load AI coach message
    loadCoachMessage(logs);
    
    // Load shorts for dashboard
    loadDashboardShorts();
    
    // Weekly chart
    renderWeeklyChart(logs);
    
  } catch (e) {
    console.error('Dashboard load error:', e);
    loadCoachMessage([]);
    loadDashboardShorts();
  }
}

function updateTodayStats(log) {
  const waterGoal = currentUser?.water_goal || 2000;
  const sleepGoal = currentUser?.sleep_goal || 480;
  
  if (log.water_intake) {
    const waterPct = Math.min(100, Math.round((log.water_intake / waterGoal) * 100));
    document.getElementById('today-water').textContent = `${log.water_intake.toLocaleString()}ml`;
    document.getElementById('water-bar').style.width = waterPct + '%';
    document.getElementById('water-sub').textContent = `목표의 ${waterPct}%`;
  }
  
  if (log.sleep_hours) {
    const sleepPct = Math.min(100, Math.round((log.sleep_hours / sleepGoal) * 100));
    const h = Math.floor(log.sleep_hours / 60), m = log.sleep_hours % 60;
    document.getElementById('today-sleep').textContent = `${h}시간 ${m > 0 ? m+'분' : ''}`;
    document.getElementById('sleep-bar').style.width = sleepPct + '%';
    document.getElementById('sleep-sub').textContent = `목표의 ${sleepPct}%`;
  }
  
  if (log.exercise_minutes !== undefined) {
    document.getElementById('today-exercise').textContent = `${log.exercise_minutes}분`;
    const exercisePct = Math.min(100, Math.round((log.exercise_minutes / 50) * 100));
    document.getElementById('exercise-bar').style.width = exercisePct + '%';
  }
  
  if (log.mood_score) {
    document.getElementById('today-mood').textContent = `${log.mood_score} / 10`;
    document.getElementById('mood-bar').style.width = (log.mood_score * 10) + '%';
  }
}

function loadCoachMessage(logs) {
  const typingEl = document.getElementById('coach-typing');
  const textEl = document.getElementById('coach-text');
  const actionsEl = document.getElementById('coach-actions');
  
  typingEl.classList.remove('hidden');
  textEl.classList.add('hidden');
  actionsEl.style.display = 'none';
  
  // Calculate insights from logs
  const idx = Math.floor(Math.random() * coachMessages.length);
  let msg = coachMessages[idx];
  
  if (logs.length > 0) {
    const avgWater = Math.round(logs.reduce((s,l) => s + (l.water_intake || 0), 0) / logs.length);
    const avgSleep = Math.round(logs.reduce((s,l) => s + (l.sleep_hours || 0), 0) / logs.length);
    const avgMood = (logs.reduce((s,l) => s + (l.mood_score || 0), 0) / logs.length).toFixed(1);
    
    // Pick most relevant message
    const waterGoal = currentUser?.water_goal || 2000;
    const sleepGoal = currentUser?.sleep_goal || 480;
    
    if (avgWater < waterGoal * 0.85) msg = coachMessages[0];
    else if (avgSleep < sleepGoal * 0.85) msg = coachMessages[1];
    else if (parseFloat(avgMood) < 6) msg = coachMessages[2];
    else msg = coachMessages[Math.floor(Math.random() * coachMessages.length)];
  }
  
  setTimeout(() => {
    typingEl.classList.add('hidden');
    textEl.classList.remove('hidden');
    textEl.textContent = msg.text;
    actionsEl.style.display = 'block';
    actionsEl.querySelector('#generate-from-coach-btn').dataset.category = msg.category;
  }, 2000);
}

async function loadDashboardShorts() {
  try {
    const res = await fetch(`${API_BASE}/shorts_content?limit=3`);
    const data = await res.json();
    const shorts = (data.data || []).filter(s => s.status === 'published').slice(0, 3);
    
    const container = document.getElementById('dashboard-shorts-list');
    if (shorts.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:20px; color:var(--text-muted); font-size:0.85rem">
          <i class="fas fa-film" style="font-size:1.5rem; margin-bottom:8px; display:block; opacity:0.3"></i>
          아직 숏츠가 없어요. AI로 첫 숏츠를 만들어보세요!
        </div>`;
      return;
    }
    
    container.innerHTML = shorts.map(s => {
      const cat = categoryColors[s.category] || categoryColors.general;
      return `
        <div class="shorts-preview-item" onclick="openShortsDetail('${s.id}')">
          <div class="shorts-preview-thumb" style="background:${cat.light}; color:${cat.bg}">
            ${cat.emoji}
          </div>
          <div class="shorts-preview-info">
            <strong>${s.title}</strong>
            <span>${s.hook_line || ''}</span>
          </div>
          <div class="shorts-preview-stat">
            <i class="fas fa-eye"></i> ${(s.views||0).toLocaleString()}
          </div>
        </div>`;
    }).join('');
  } catch (e) {
    document.getElementById('dashboard-shorts-list').innerHTML = '<div class="loading-skeleton"></div>';
  }
}

function renderWeeklyChart(logs) {
  const ctx = document.getElementById('weeklyChart');
  if (!ctx) return;
  if (charts.weekly) { charts.weekly.destroy(); }
  
  const days = ['월', '화', '수', '목', '금', '토', '일'];
  const waterGoal = currentUser?.water_goal || 2000;
  const sleepGoal = currentUser?.sleep_goal || 480;
  
  const sortedLogs = [...logs].sort((a,b) => a.log_date?.localeCompare(b.log_date)).slice(-7);
  const labels = sortedLogs.map(l => {
    const d = new Date(l.log_date);
    return `${d.getMonth()+1}/${d.getDate()}`;
  });
  
  const scores = sortedLogs.map(l => {
    let score = 0;
    if (l.water_intake) score += (l.water_intake / waterGoal) * 25;
    if (l.sleep_hours) score += (l.sleep_hours / sleepGoal) * 25;
    if (l.exercise_minutes) score += Math.min(25, (l.exercise_minutes / 50) * 25);
    if (l.mood_score) score += (l.mood_score / 10) * 25;
    return Math.round(Math.min(100, score));
  });

  charts.weekly = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: '건강 점수',
        data: scores,
        backgroundColor: 'rgba(99,102,241,0.7)',
        borderRadius: 6,
        borderColor: '#6366f1',
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 11 } } },
        y: { 
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#64748b', font: { size: 11 } },
          min: 0, max: 100
        }
      }
    }
  });
}

// =====================================================
// HEALTH LOG PAGE
// =====================================================
async function loadLogPage() {
  renderCalendarStrip();
  
  try {
    const res = await fetch(`${API_BASE}/health_logs?limit=30&sort=log_date`);
    const data = await res.json();
    const logs = (data.data || []).sort((a,b) => b.log_date?.localeCompare(a.log_date));
    renderLogList(logs);
  } catch (e) {
    document.getElementById('log-list').innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:20px">로그를 불러올 수 없습니다</p>';
  }
}

function renderCalendarStrip() {
  const strip = document.getElementById('log-calendar-strip');
  const today = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const html = [];
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const isToday = i === 0;
    const dateStr = d.toISOString().split('T')[0];
    html.push(`
      <div class="log-day-chip ${isToday ? 'today' : ''}" data-date="${dateStr}">
        <span class="day-name">${days[d.getDay()]}</span>
        <span class="day-num">${d.getDate()}</span>
        <div class="day-dot"></div>
      </div>`);
  }
  strip.innerHTML = html.join('');
  
  // Click handlers
  strip.querySelectorAll('.log-day-chip').forEach(chip => {
    chip.addEventListener('click', () => openLogModal(chip.dataset.date));
  });
}

function renderLogList(logs) {
  const container = document.getElementById('log-list');
  
  if (logs.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px; color:var(--text-muted)">
        <i class="fas fa-clipboard" style="font-size:2rem; opacity:0.3; display:block; margin-bottom:12px"></i>
        <p>아직 기록이 없어요</p>
        <p style="font-size:0.85rem; margin-top:8px">오늘의 건강 상태를 기록해보세요!</p>
      </div>`;
    return;
  }
  
  const moodEmoji = score => {
    if (score <= 3) return '😞';
    if (score <= 5) return '😐';
    if (score <= 7) return '😊';
    if (score <= 9) return '😄';
    return '🤩';
  };
  
  container.innerHTML = logs.map(log => {
    const dateObj = new Date(log.log_date);
    const dateStr = `${dateObj.getMonth()+1}월 ${dateObj.getDate()}일`;
    const h = Math.floor((log.sleep_hours || 0) / 60);
    const m = (log.sleep_hours || 0) % 60;
    
    return `
      <div class="log-card" onclick="openLogModal('${log.log_date}')">
        <div class="log-card-header">
          <div class="log-date-badge">${dateStr}</div>
          <div class="log-mood-badge">${moodEmoji(log.mood_score || 5)} 기분 ${log.mood_score || '-'}/10</div>
        </div>
        <div class="log-metrics">
          <div class="log-metric-item">
            <div class="log-metric-icon">💧</div>
            <span class="log-metric-value">${(log.water_intake || 0).toLocaleString()}ml</span>
            <span class="log-metric-label">수분</span>
          </div>
          <div class="log-metric-item">
            <div class="log-metric-icon">🌙</div>
            <span class="log-metric-value">${h}h ${m}m</span>
            <span class="log-metric-label">수면</span>
          </div>
          <div class="log-metric-item">
            <div class="log-metric-icon">💪</div>
            <span class="log-metric-value">${log.exercise_minutes || 0}분</span>
            <span class="log-metric-label">${log.exercise_type || '운동'}</span>
          </div>
          <div class="log-metric-item">
            <div class="log-metric-icon">❤️</div>
            <span class="log-metric-value">${log.blood_pressure_sys || '-'}/${log.blood_pressure_dia || '-'}</span>
            <span class="log-metric-label">혈압</span>
          </div>
          <div class="log-metric-item">
            <div class="log-metric-icon">⚖️</div>
            <span class="log-metric-value">${log.weight || '-'}kg</span>
            <span class="log-metric-label">체중</span>
          </div>
          ${log.daily_note ? `
          <div class="log-metric-item" style="grid-column: span 2">
            <span class="log-metric-value" style="font-size:0.78rem; font-weight:400; color:var(--text-muted)">"${log.daily_note}"</span>
          </div>` : ''}
        </div>
      </div>`;
  }).join('');
}

// =====================================================
// LOG MODAL
// =====================================================
function openLogModal(date) {
  const d = new Date(date);
  document.getElementById('log-modal-date').textContent = 
    `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일`;
  document.getElementById('log-modal-overlay').classList.remove('hidden');
}

async function saveLog() {
  const logData = {
    user_id: currentUser?.id || 'user_demo_001',
    log_date: new Date().toISOString().split('T')[0],
    weight: parseFloat(document.getElementById('log-weight').value) || null,
    heart_rate: parseInt(document.getElementById('log-heart').value) || null,
    blood_pressure_sys: parseInt(document.getElementById('log-bp-sys').value) || null,
    blood_pressure_dia: parseInt(document.getElementById('log-bp-dia').value) || null,
    sleep_hours: parseInt(document.getElementById('log-sleep').value) || null,
    water_intake: parseInt(document.getElementById('log-water').value) || null,
    exercise_type: document.getElementById('log-exercise-type').value.trim(),
    exercise_minutes: parseInt(document.getElementById('log-exercise-min').value) || 0,
    mood_score: parseInt(document.getElementById('log-mood').value) || 5,
    daily_note: document.getElementById('log-note').value.trim()
  };
  
  // Remove null values
  Object.keys(logData).forEach(k => { if (logData[k] === null) delete logData[k]; });
  
  try {
    const res = await fetch(`${API_BASE}/health_logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData)
    });
    
    if (res.ok) {
      showToast('✅ 건강 기록이 저장되었습니다!');
      document.getElementById('log-modal-overlay').classList.add('hidden');
      clearLogForm();
      
      if (currentPage === 'log') loadLogPage();
      else if (currentPage === 'dashboard') loadDashboard();
    }
  } catch (e) {
    showToast('저장 중 오류가 발생했습니다', 'error');
  }
}

function clearLogForm() {
  ['log-weight', 'log-heart', 'log-bp-sys', 'log-bp-dia', 'log-sleep',
   'log-water', 'log-exercise-type', 'log-exercise-min', 'log-note'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('log-mood').value = 7;
  document.getElementById('mood-label-val').textContent = '7';
}

// =====================================================
// AI SHORTS GENERATION
// =====================================================
async function generateShorts() {
  const category = document.querySelector('#gen-category-chips .cat-chip.active')?.dataset.value || 'general';
  const tone = document.getElementById('gen-tone').value;
  const useMyData = document.getElementById('use-my-data').checked;
  const customReq = document.getElementById('gen-custom').value.trim();
  
  // Show generating state
  document.getElementById('phone-empty').classList.add('hidden');
  document.getElementById('phone-content').classList.add('hidden');
  document.getElementById('phone-generating').classList.remove('hidden');
  document.getElementById('preview-actions-bar').style.display = 'none';
  
  const statusMessages = [
    '건강 데이터 분석 중...',
    'AI가 맞춤 스크립트 작성 중...',
    '개인화 콘텐츠 최적화 중...',
    '최종 검토 중...'
  ];
  
  let statusIdx = 0;
  const statusEl = document.getElementById('gen-status');
  const statusInterval = setInterval(() => {
    statusEl.textContent = statusMessages[statusIdx % statusMessages.length];
    statusIdx++;
  }, 800);
  
  // Get health data for personalization
  let healthData = {};
  if (useMyData) {
    try {
      const res = await fetch(`${API_BASE}/health_logs?limit=7`);
      const data = await res.json();
      const logs = data.data || [];
      if (logs.length > 0) {
        healthData.water_avg = Math.round(logs.reduce((s,l) => s + (l.water_intake || 0), 0) / logs.length);
        healthData.sleep_avg = Math.round(logs.reduce((s,l) => s + (l.sleep_hours || 0), 0) / logs.length);
        healthData.mood_avg = (logs.reduce((s,l) => s + (l.mood_score || 0), 0) / logs.length).toFixed(1);
        healthData.exercise_total = logs.reduce((s,l) => s + (l.exercise_minutes || 0), 0);
        healthData.exercise_pct = Math.round((healthData.exercise_total / (7 * 50)) * 100);
        healthData.water_goal = currentUser?.water_goal || 2000;
        healthData.water_diff = healthData.water_goal - healthData.water_avg;
        healthData.sleep_goal = currentUser?.sleep_goal || 480;
        const sd = healthData.sleep_goal - healthData.sleep_avg;
        healthData.sleep_diff = sd > 0 ? `${Math.floor(sd/60)}시간 ${sd%60}분` : '달성';
        healthData.water_pct = Math.round((healthData.water_avg / healthData.water_goal) * 100);
        healthData.sleep_pct = Math.round((healthData.sleep_avg / healthData.sleep_goal) * 100);
        healthData.exercise_pct = healthData.exercise_pct;
        healthData.mood_score = healthData.mood_avg;
        healthData.health_goals = (currentUser?.health_goals || []).join(', ');
        healthData.user_name = currentUser?.name || '사용자';
      }
    } catch (e) {}
  }
  
  // Set defaults
  healthData.user_name = healthData.user_name || currentUser?.name || '사용자';
  healthData.water_avg = healthData.water_avg || 1700;
  healthData.sleep_avg = healthData.sleep_avg || 420;
  healthData.mood_avg = healthData.mood_avg || '6.5';
  healthData.exercise_total = healthData.exercise_total || 90;
  healthData.exercise_pct = healthData.exercise_pct || 70;
  healthData.water_goal = healthData.water_goal || 2000;
  healthData.water_diff = healthData.water_diff || 300;
  healthData.sleep_diff = healthData.sleep_diff || '1시간';
  healthData.water_pct = healthData.water_pct || 85;
  healthData.sleep_pct = healthData.sleep_pct || 82;
  healthData.mood_score = healthData.mood_score || '7.0';
  healthData.health_goals = healthData.health_goals || '건강 유지';
  
  // Simulate AI generation (2.5 seconds)
  await new Promise(r => setTimeout(r, 2800));
  
  clearInterval(statusInterval);
  
  // Generate content
  const template = shortsTemplates[category] || shortsTemplates.general;
  const hookIdx = Math.floor(Math.random() * template.hooks.length);
  const scriptIdx = Math.floor(Math.random() * template.scripts.length);
  const ctaIdx = Math.floor(Math.random() * template.ctas.length);
  
  let script = template.scripts[scriptIdx];
  if (customReq) script += `\n\n💬 코치 메모: ${customReq}`;
  
  // Replace template variables
  Object.entries(healthData).forEach(([key, val]) => {
    script = script.replace(new RegExp(`{${key}}`, 'g'), val);
  });
  
  const catColors = categoryColors[category] || categoryColors.general;
  
  generatedShorts = {
    title: `${catColors.emoji} ${getShortTitle(category, tone)}`,
    category,
    hook_line: template.hooks[hookIdx],
    script,
    key_message: `${catColors.label} 관련 맞춤 코칭 메시지`,
    action_items: getActionItems(category),
    cta: template.ctas[ctaIdx],
    generation_type: 'ai_generated',
    status: 'draft',
    views: 0,
    likes: 0
  };
  
  // Show preview
  document.getElementById('phone-generating').classList.add('hidden');
  document.getElementById('phone-content').classList.remove('hidden');
  
  const catBadge = document.getElementById('preview-category-badge');
  catBadge.textContent = `${catColors.emoji} ${catColors.label}`;
  catBadge.style.background = catColors.light;
  catBadge.style.borderColor = catColors.bg;
  catBadge.style.color = catColors.bg;
  
  document.getElementById('preview-hook').textContent = generatedShorts.hook_line;
  document.getElementById('preview-script').textContent = generatedShorts.script;
  
  const actionsContainer = document.getElementById('preview-actions');
  actionsContainer.innerHTML = generatedShorts.action_items.slice(0,3).map(a =>
    `<div class="shorts-action-item">✓ ${a}</div>`
  ).join('');
  document.getElementById('preview-cta').textContent = generatedShorts.cta;
  
  document.getElementById('preview-actions-bar').style.display = 'flex';
  showToast('🎉 AI 숏츠가 생성되었습니다!');
}

function getShortTitle(category, tone) {
  const titles = {
    hydration: { motivational: '수분으로 하루를 바꿔라!', educational: '수분 섭취의 과학', challenge: '수분 챌린지 7일', calm: '물 한 잔의 명상' },
    sleep: { motivational: '수면이 최고의 약이다', educational: '수면 과학 완벽 가이드', challenge: '수면 개선 챌린지', calm: '깊은 수면으로의 여행' },
    stress: { motivational: '스트레스 없이 살아가기', educational: '코르티솔의 비밀', challenge: '스트레스 제로 챌린지', calm: '마음의 평화 찾기' },
    exercise: { motivational: '운동이 인생을 바꾼다', educational: '운동 효과의 과학', challenge: '30일 운동 챌린지', calm: '몸과 마음의 조화' },
    nutrition: { motivational: '영양으로 몸을 최적화하라', educational: '영양학 완전 정복', challenge: '영양 식단 챌린지', calm: '음식과의 평화로운 관계' },
    mindset: { motivational: '마인드셋이 결과를 만든다', educational: '심리학이 알려주는 건강', challenge: '마인드셋 변화 챌린지', calm: '내면의 목소리 듣기' },
    general: { motivational: '건강한 하루 만들기', educational: '건강의 4가지 기둥', challenge: '건강 습관 챌린지', calm: '균형 잡힌 삶' }
  };
  return (titles[category] || titles.general)[tone] || '건강 코칭';
}

function getActionItems(category) {
  const items = {
    hydration: ['아침 기상 즉시 500ml 물 마시기', '스마트폰 수분 알림 설정', '식사 전 물 한 잔 마시기', '커피 1잔 = 물 500ml 추가'],
    sleep: ['취침 1시간 전 스마트폰 끄기', '실내 온도 18-20도 유지', '4-7-8 호흡법 실천', '취침/기상 시간 일정하게 유지'],
    stress: ['10분 디지털 디톡스', '감사 일기 3가지 쓰기', '4-7-8 호흡법 하루 3회', '5분 햇빛 아래 산책'],
    exercise: ['엘리베이터 대신 계단 이용', '점심 후 10분 산책', 'TV 시청 중 스쿼트 10회', '출근 전 5분 스트레칭'],
    nutrition: ['아침 단백질 30g 이상 섭취', '식사 전 물 한 잔', '식후 30분 가벼운 산책', '가공식품 줄이기'],
    mindset: ['오늘 감사한 것 3가지 쓰기', '5분 명상', '자신에게 칭찬 한마디', '긍정적인 확언 반복'],
    general: ['오늘 목표 하나 선택하기', '10분 몸 움직이기', '물 한 잔 마시기', '5분 명상']
  };
  return items[category] || items.general;
}

async function saveGeneratedShorts() {
  if (!generatedShorts) return;
  
  try {
    const res = await fetch(`${API_BASE}/shorts_content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...generatedShorts, user_id: currentUser?.id || 'user_demo_001' })
    });
    
    if (res.ok) {
      showToast('✅ 숏츠가 라이브러리에 저장되었습니다!');
      generatedShorts = null;
      document.getElementById('preview-actions-bar').style.display = 'none';
      document.getElementById('phone-content').classList.add('hidden');
      document.getElementById('phone-empty').classList.remove('hidden');
    }
  } catch (e) {
    showToast('저장 중 오류가 발생했습니다', 'error');
  }
}

// =====================================================
// LIBRARY
// =====================================================
let currentFilter = 'all';

async function loadLibrary() {
  try {
    const res = await fetch(`${API_BASE}/shorts_content?limit=50`);
    const data = await res.json();
    const shorts = data.data || [];
    
    // Update stats
    const totalViews = shorts.reduce((s,x) => s + (x.views || 0), 0);
    const totalLikes = shorts.reduce((s,x) => s + (x.likes || 0), 0);
    document.getElementById('lib-total-count').textContent = shorts.length;
    document.getElementById('lib-total-views').textContent = totalViews.toLocaleString();
    document.getElementById('lib-total-likes').textContent = totalLikes.toLocaleString();
    
    renderLibraryGrid(shorts);
  } catch (e) {
    document.getElementById('library-grid').innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:20px">불러올 수 없습니다</p>';
  }
}

function renderLibraryGrid(shorts) {
  const filtered = currentFilter === 'all' ? shorts :
    shorts.filter(s => s.status === currentFilter || s.category === currentFilter);
  
  const grid = document.getElementById('library-grid');
  
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-muted)">
        <i class="fas fa-film" style="font-size:2rem; opacity:0.3; display:block; margin-bottom:12px"></i>
        <p>이 카테고리에 숏츠가 없어요</p>
        <button class="btn-primary btn-sm" style="margin-top:14px" onclick="navigateTo('generate')">
          <i class="fas fa-plus"></i> 새로 만들기
        </button>
      </div>`;
    return;
  }
  
  grid.innerHTML = filtered.map(s => {
    const cat = categoryColors[s.category] || categoryColors.general;
    return `
      <div class="shorts-library-card" onclick="openShortsDetail('${s.id}')">
        <div class="shorts-thumb" style="background: linear-gradient(135deg, ${cat.light}, rgba(0,0,0,0.3))">
          <span style="font-size:2.5rem">${cat.emoji}</span>
          <div class="shorts-thumb-overlay">
            <span class="shorts-status ${s.status}">${s.status === 'published' ? '게시됨' : '초안'}</span>
          </div>
        </div>
        <div class="shorts-card-body">
          <div class="shorts-card-title">${s.title || '제목 없음'}</div>
          <div class="shorts-card-hook">${s.hook_line || s.script?.substring(0, 60) || ''}</div>
          <div class="shorts-card-meta">
            <span><i class="fas fa-eye"></i> ${(s.views||0).toLocaleString()}</span>
            <span><i class="fas fa-heart"></i> ${(s.likes||0).toLocaleString()}</span>
            <span><i class="fas fa-tag"></i> ${cat.label}</span>
          </div>
        </div>
      </div>`;
  }).join('');
}

async function openShortsDetail(shortId) {
  currentShortId = shortId;
  try {
    const res = await fetch(`${API_BASE}/shorts_content/${shortId}`);
    const s = await res.json();
    
    const cat = categoryColors[s.category] || categoryColors.general;
    
    // Fill modal
    document.getElementById('shorts-modal-title').textContent = s.title || '숏츠 상세';
    document.getElementById('sm-category').textContent = `${cat.emoji} ${cat.label}`;
    document.getElementById('sm-hook').textContent = s.hook_line || '';
    document.getElementById('sm-script').textContent = s.script || '';
    document.getElementById('sm-views').textContent = (s.views || 0).toLocaleString();
    document.getElementById('sm-likes').textContent = (s.likes || 0).toLocaleString();
    document.getElementById('sm-full-script').textContent = s.script || '';
    
    const dateStr = s.created_at ? new Date(s.created_at).toLocaleDateString('ko-KR') : '-';
    document.getElementById('sm-date').textContent = dateStr;
    
    const statusBadge = document.getElementById('sm-status-badge');
    statusBadge.textContent = s.status === 'published' ? '게시됨' : '초안';
    statusBadge.className = `status-badge ${s.status}`;
    
    const actionsList = document.getElementById('sm-action-items');
    const actions = Array.isArray(s.action_items) ? s.action_items : [];
    actionsList.innerHTML = actions.map(a => `<li>${a}</li>`).join('');
    
    // Fill phone preview
    document.getElementById('sm-actions').innerHTML = actions.slice(0,3).map(a =>
      `<div class="shorts-action-item">✓ ${a}</div>`
    ).join('');
    
    const publishBtn = document.getElementById('sm-publish-btn');
    publishBtn.innerHTML = s.status === 'published' 
      ? '<i class="fas fa-times"></i> 게시 취소' 
      : '<i class="fas fa-paper-plane"></i> 게시하기';
    publishBtn.onclick = () => togglePublish(shortId, s.status);
    
    document.getElementById('shorts-modal-overlay').classList.remove('hidden');
  } catch (e) {
    showToast('숏츠를 불러올 수 없습니다', 'error');
  }
}

async function togglePublish(shortId, currentStatus) {
  const newStatus = currentStatus === 'published' ? 'draft' : 'published';
  try {
    await fetch(`${API_BASE}/shorts_content/${shortId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, views: newStatus === 'published' ? Math.floor(Math.random() * 500) : 0 })
    });
    showToast(newStatus === 'published' ? '✅ 숏츠가 게시되었습니다!' : '📝 초안으로 변경되었습니다');
    document.getElementById('shorts-modal-overlay').classList.add('hidden');
    if (currentPage === 'library') loadLibrary();
    if (currentPage === 'dashboard') loadDashboard();
  } catch (e) {
    showToast('오류가 발생했습니다', 'error');
  }
}

async function deleteShorts(shortId) {
  if (!confirm('이 숏츠를 삭제할까요?')) return;
  try {
    await fetch(`${API_BASE}/shorts_content/${shortId}`, { method: 'DELETE' });
    showToast('🗑 숏츠가 삭제되었습니다');
    document.getElementById('shorts-modal-overlay').classList.add('hidden');
    if (currentPage === 'library') loadLibrary();
  } catch (e) {
    showToast('삭제 중 오류가 발생했습니다', 'error');
  }
}

// =====================================================
// ANALYTICS
// =====================================================
async function loadAnalytics() {
  try {
    const res = await fetch(`${API_BASE}/health_logs?limit=30`);
    const data = await res.json();
    const logs = (data.data || []).sort((a,b) => a.log_date?.localeCompare(b.log_date));
    
    renderAnalyticsCharts(logs);
    renderInsights(logs);
    calculateHealthScore(logs);
  } catch (e) {
    console.error('Analytics error:', e);
  }
}

function calculateHealthScore(logs) {
  if (logs.length === 0) return;
  const waterGoal = currentUser?.water_goal || 2000;
  const sleepGoal = currentUser?.sleep_goal || 480;
  
  const recent = logs.slice(-7);
  const avgWater = recent.reduce((s,l) => s + (l.water_intake || 0), 0) / recent.length;
  const avgSleep = recent.reduce((s,l) => s + (l.sleep_hours || 0), 0) / recent.length;
  const avgExercise = recent.reduce((s,l) => s + (l.exercise_minutes || 0), 0) / recent.length;
  const avgMood = recent.reduce((s,l) => s + (l.mood_score || 0), 0) / recent.length;
  
  const waterScore = Math.min(100, (avgWater / waterGoal) * 100);
  const sleepScore = Math.min(100, (avgSleep / sleepGoal) * 100);
  const exerciseScore = Math.min(100, (avgExercise / 50) * 100);
  const moodScore = (avgMood / 10) * 100;
  const totalScore = Math.round((waterScore + sleepScore + exerciseScore + moodScore) / 4);
  
  // Update score arc
  const arc = document.getElementById('score-arc');
  const circumference = 264;
  const offset = circumference - (totalScore / 100) * circumference;
  if (arc) arc.setAttribute('stroke-dashoffset', offset);
  
  document.getElementById('score-number').textContent = totalScore;
  
  // Update mini bars
  const bars = document.querySelectorAll('.mini-fill');
  const scores = [waterScore, sleepScore, exerciseScore, moodScore];
  bars.forEach((bar, i) => {
    bar.style.width = `${Math.round(scores[i])}%`;
  });
  document.querySelectorAll('.score-pct').forEach((el, i) => {
    el.textContent = `${Math.round(scores[i])}%`;
  });
}

function renderAnalyticsCharts(logs) {
  const labels = logs.map(l => {
    const d = new Date(l.log_date);
    return `${d.getMonth()+1}/${d.getDate()}`;
  });
  
  const chartConfig = (label, data, color, type = 'line') => ({
    type,
    data: {
      labels,
      datasets: [{
        label,
        data,
        borderColor: color,
        backgroundColor: color.replace('1)', '0.1)').replace(')', ', 0.1)'),
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: color,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 }, maxTicksLimit: 7 } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 10 } } }
      }
    }
  });
  
  // Weight
  const weightCtx = document.getElementById('weightChart');
  if (weightCtx) {
    if (charts.weight) charts.weight.destroy();
    charts.weight = new Chart(weightCtx, chartConfig(
      '체중(kg)', logs.map(l => l.weight || null), 'rgba(99,102,241,1)'
    ));
  }
  
  // Water
  const waterCtx = document.getElementById('waterChart');
  if (waterCtx) {
    if (charts.water) charts.water.destroy();
    charts.water = new Chart(waterCtx, chartConfig(
      '수분(ml)', logs.map(l => l.water_intake || 0), 'rgba(6,182,212,1)', 'bar'
    ));
    charts.water.data.datasets[0].borderRadius = 4;
  }
  
  // Sleep
  const sleepCtx = document.getElementById('sleepChart');
  if (sleepCtx) {
    if (charts.sleep) charts.sleep.destroy();
    charts.sleep = new Chart(sleepCtx, chartConfig(
      '수면(분)', logs.map(l => l.sleep_hours || 0), 'rgba(139,92,246,1)'
    ));
  }
  
  // Mood
  const moodCtx = document.getElementById('moodChart');
  if (moodCtx) {
    if (charts.mood) charts.mood.destroy();
    charts.mood = new Chart(moodCtx, chartConfig(
      '기분(1-10)', logs.map(l => l.mood_score || 0), 'rgba(245,158,11,1)'
    ));
  }
}

function renderInsights(logs) {
  const waterGoal = currentUser?.water_goal || 2000;
  const sleepGoal = currentUser?.sleep_goal || 480;
  const recent = logs.slice(-7);
  
  const avgWater = recent.length ? recent.reduce((s,l) => s + (l.water_intake || 0), 0) / recent.length : 0;
  const avgSleep = recent.length ? recent.reduce((s,l) => s + (l.sleep_hours || 0), 0) / recent.length : 0;
  const totalExercise = recent.reduce((s,l) => s + (l.exercise_minutes || 0), 0);
  const avgMood = recent.length ? recent.reduce((s,l) => s + (l.mood_score || 0), 0) / recent.length : 5;
  
  const weightLogs = logs.filter(l => l.weight).slice(-7);
  const weightTrend = weightLogs.length >= 2 
    ? (weightLogs[weightLogs.length-1].weight - weightLogs[0].weight).toFixed(1) 
    : null;
  
  const insights = [];
  
  if (avgWater > waterGoal * 0.9) {
    insights.push({ icon: '💧', type: 'good', title: '수분 섭취 우수!', desc: `주간 평균 ${Math.round(avgWater)}ml로 목표의 ${Math.round(avgWater/waterGoal*100)}% 달성했습니다.` });
  } else if (avgWater < waterGoal * 0.7) {
    insights.push({ icon: '⚠️', type: 'bad', title: '수분 부족 경고', desc: `주간 평균 ${Math.round(avgWater)}ml로 목표보다 ${Math.round(waterGoal-avgWater)}ml 부족합니다.` });
  } else {
    insights.push({ icon: '💧', type: 'warn', title: '수분 조금 더!', desc: `목표까지 하루 평균 ${Math.round(waterGoal-avgWater)}ml 더 마시면 됩니다.` });
  }
  
  if (avgSleep >= sleepGoal * 0.9) {
    insights.push({ icon: '🌙', type: 'good', title: '수면 패턴 안정', desc: `평균 수면 ${Math.floor(avgSleep/60)}시간 ${Math.round(avgSleep%60)}분으로 목표를 잘 지키고 있습니다.` });
  } else {
    const deficit = Math.round(sleepGoal - avgSleep);
    insights.push({ icon: '😴', type: 'warn', title: '수면 부족', desc: `주간 평균 ${deficit}분 수면이 부족합니다. 취침 30분 전 루틴을 만들어보세요.` });
  }
  
  if (totalExercise >= 150) {
    insights.push({ icon: '💪', type: 'good', title: '운동 목표 달성!', desc: `이번 주 총 ${totalExercise}분 운동하여 WHO 권장량을 달성했습니다.` });
  } else {
    insights.push({ icon: '🏃', type: 'warn', title: '운동 늘리기', desc: `이번 주 총 ${totalExercise}분 운동했습니다. WHO 권장량 150분까지 ${150-totalExercise}분 더 필요합니다.` });
  }
  
  if (avgMood >= 7) {
    insights.push({ icon: '😊', type: 'good', title: '기분 상태 양호', desc: `평균 기분 점수 ${avgMood.toFixed(1)}/10으로 긍정적인 상태를 유지하고 있습니다.` });
  } else if (avgMood < 5) {
    insights.push({ icon: '😞', type: 'bad', title: '스트레스 주의', desc: `평균 기분 점수 ${avgMood.toFixed(1)}/10입니다. 스트레스 관리에 집중이 필요합니다.` });
  }
  
  if (weightTrend !== null) {
    const trend = parseFloat(weightTrend);
    if (trend < 0) {
      insights.push({ icon: '📉', type: 'good', title: '체중 감소 추세', desc: `지난 7일간 ${Math.abs(trend)}kg 감소했습니다. 이 페이스를 유지해보세요!` });
    } else if (trend > 0.5) {
      insights.push({ icon: '📈', type: 'warn', title: '체중 증가 추세', desc: `지난 7일간 ${trend}kg 증가했습니다. 식단과 운동을 점검해보세요.` });
    }
  }
  
  const container = document.getElementById('insights-list');
  container.innerHTML = insights.map(i => `
    <div class="insight-item">
      <div class="insight-icon ${i.type}"><span style="font-size:1rem">${i.icon}</span></div>
      <div class="insight-text">
        <strong>${i.title}</strong>
        <span>${i.desc}</span>
      </div>
    </div>`).join('');
}

// =====================================================
// PROFILE SAVE
// =====================================================
async function saveProfile() {
  const goals = [];
  document.querySelectorAll('#profile-goals-grid .goal-chip.selected').forEach(chip => {
    goals.push(chip.dataset.value);
  });
  
  const updateData = {
    name: document.getElementById('profile-name').value,
    age: parseInt(document.getElementById('profile-age').value),
    gender: document.getElementById('profile-gender').value,
    height: parseFloat(document.getElementById('profile-height').value),
    weight: parseFloat(document.getElementById('profile-weight').value),
    activity_level: document.getElementById('profile-activity').value,
    sleep_goal: parseInt(document.getElementById('profile-sleep').value),
    water_goal: parseInt(document.getElementById('profile-water').value),
    health_goals: goals
  };
  
  try {
    if (currentUser?.id) {
      const res = await fetch(`${API_BASE}/users/${currentUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (res.ok) {
        currentUser = { ...currentUser, ...updateData };
        updateSidebarUser();
        showToast('✅ 프로필이 저장되었습니다!');
      }
    }
  } catch (e) {
    currentUser = { ...currentUser, ...updateData };
    updateSidebarUser();
    showToast('✅ 프로필이 업데이트되었습니다!');
  }
}

// =====================================================
// TOAST
// =====================================================
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  const icon = toast.querySelector('i');
  document.getElementById('toast-msg').textContent = msg;
  
  toast.style.borderColor = type === 'error' ? '#ef4444' : 
    type === 'info' ? '#6366f1' : '#10b981';
  toast.style.color = type === 'error' ? '#ef4444' :
    type === 'info' ? '#6366f1' : '#10b981';
  icon.className = type === 'error' ? 'fas fa-exclamation-circle' :
    type === 'info' ? 'fas fa-info-circle' : 'fas fa-check-circle';
  
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// =====================================================
// EVENT LISTENERS
// =====================================================
function initEventListeners() {
  // Splash
  document.getElementById('splash-start-btn').addEventListener('click', showOnboarding);
  document.getElementById('splash-login-link').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.setItem('hs_user_id', 'user_demo_001');
    loadUserProfile('user_demo_001').then(showApp);
  });
  
  // Onboarding navigation
  document.getElementById('ob-next-btn').addEventListener('click', () => {
    if (obStep < 4) goToObStep(obStep + 1);
    else finishOnboarding();
  });
  document.getElementById('ob-back-btn').addEventListener('click', () => {
    if (obStep > 1) goToObStep(obStep - 1);
  });
  
  // Sidebar nav
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.page));
  });
  
  // Bottom nav
  document.querySelectorAll('.bottom-nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.page));
  });
  
  // Card links with data-goto
  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(el.dataset.goto);
    });
  });
  
  // Quick Log btn (dashboard)
  document.getElementById('quick-log-btn').addEventListener('click', () => openLogModal(new Date().toISOString().split('T')[0]));
  document.getElementById('add-log-btn').addEventListener('click', () => openLogModal(new Date().toISOString().split('T')[0]));
  
  // Log Modal
  document.getElementById('close-log-modal').addEventListener('click', () => {
    document.getElementById('log-modal-overlay').classList.add('hidden');
  });
  document.getElementById('cancel-log-btn').addEventListener('click', () => {
    document.getElementById('log-modal-overlay').classList.add('hidden');
  });
  document.getElementById('save-log-btn').addEventListener('click', saveLog);
  document.getElementById('log-modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) document.getElementById('log-modal-overlay').classList.add('hidden');
  });
  
  // Mood range
  document.getElementById('log-mood').addEventListener('input', (e) => {
    document.getElementById('mood-label-val').textContent = e.target.value;
  });
  
  // AI Coach refresh
  document.getElementById('refresh-coach-btn').addEventListener('click', () => loadCoachMessage([]));
  
  // Generate from coach
  document.getElementById('generate-from-coach-btn').addEventListener('click', (e) => {
    const category = e.target.dataset.category || 'general';
    navigateTo('generate');
    setTimeout(() => {
      document.querySelectorAll('.cat-chip').forEach(c => {
        c.classList.toggle('active', c.dataset.value === category);
      });
    }, 100);
  });
  
  // Category chips in generate
  document.querySelectorAll('#gen-category-chips .cat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#gen-category-chips .cat-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });
  
  // Generate button
  document.getElementById('generate-btn').addEventListener('click', generateShorts);
  document.getElementById('regenerate-btn')?.addEventListener('click', generateShorts);
  document.getElementById('save-shorts-btn').addEventListener('click', saveGeneratedShorts);
  document.getElementById('share-shorts-btn').addEventListener('click', () => {
    showToast('📋 공유 링크가 복사되었습니다!');
  });
  
  // Library filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      
      const res = await fetch(`${API_BASE}/shorts_content?limit=50`);
      const data = await res.json();
      renderLibraryGrid(data.data || []);
    });
  });
  
  // Shorts modal
  document.getElementById('close-shorts-modal').addEventListener('click', () => {
    document.getElementById('shorts-modal-overlay').classList.add('hidden');
  });
  document.getElementById('shorts-modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) document.getElementById('shorts-modal-overlay').classList.add('hidden');
  });
  document.getElementById('sm-delete-btn').addEventListener('click', () => {
    if (currentShortId) deleteShorts(currentShortId);
  });
  
  // Profile goals
  document.querySelectorAll('#profile-goals-grid .goal-chip').forEach(chip => {
    chip.addEventListener('click', () => chip.classList.toggle('selected'));
  });
  document.getElementById('save-profile-btn').addEventListener('click', saveProfile);
  
  // Analytics period
  document.querySelectorAll('.period-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadAnalytics();
    });
  });
  
  // Reset data
  document.getElementById('reset-data-btn').addEventListener('click', () => {
    if (confirm('데모 데이터를 사용하도록 초기화할까요? (로컬 설정만 초기화됩니다)')) {
      localStorage.removeItem('hs_user_id');
      location.reload();
    }
  });
  
  // Sidebar toggle (mobile collapse)
  document.getElementById('sidebar-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
  });
}
