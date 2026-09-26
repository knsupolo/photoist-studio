/**
 * 포토이스트 (Photoist) Studio Pro v17.3 Pro [1편 / 전반부]
 * 
 * [탑재 핵심 엔진]
 * 1. 최신 구글 웹앱 배포 URL 연동
 * 2. 뷰포트 고정으로 2x2 세로모드 촬영 시 화면 축소 버그 원천 차단
 * 3. 카메라 회전 오버레이 반투명화 & 우측 상단 닫기(X) 처리
 * 4. 사진 배치(screenPick): 포토이스트 매트블랙(#111111) 통일 & 초기 슬롯 완전 비우기
 * 5. 4컷 / 5컷(화보형: 상2-중1대형-하2) / 6컷(2x3 그리드 & 1x6 스트립) 가변 선택 엔진
 * 6. 4자리 PIN 로그인 완전 삭제 (아이디/비밀번호 단일 체계)
 * 7. 회원가입 유효성: 이름 + 생년월일 6자리 동일인 중복 가입 방지 & 비밀번호 확인 검증
 * 8. 마이페이지 (내 정보): 10종 앱 전체 UI 테마 선택기 탑재
 */

const GOOGLE_DB_URL = "https://script.google.com/macros/s/AKfycbw1fjoUYoKQOHNNatPY_8q8X-1ogUV7iaFsIMpYioStlVX1SZK9hYiY32P-bGv7GUVoBw/exec";
const APP_VERSION = "v17.3 Pro";
const MAX_GALLERY_SLOTS = 10;

function getFormattedTodayDate() {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function extractPureBase64(dataUrl) {
  if (!dataUrl) return "";
  const commaIdx = dataUrl.indexOf(',');
  return commaIdx !== -1 ? dataUrl.slice(commaIdx + 1) : dataUrl;
}

const POSE_SUGGESTIONS_24 = [
  { emoji: "🫂", text: "어깨동무하고 다정하게 찰칵!" },
  { emoji: "✌️", text: "다같이 볼 옆에 브이~" },
  { emoji: "🫶", text: "손하트 뿅뿅 날리기!" },
  { emoji: "😜", text: "장난꾸러기처럼 익살스러운 표정" },
  { emoji: "😎", text: "시크하고 도도한 모델 워킹 포즈" },
  { emoji: "🌸", text: "두 손 모아 꽃받침하고 방긋" },
  { emoji: "🐹", text: "양볼 빵빵 귀요미 볼 찌르기" },
  { emoji: "🤙", text: "스웨그 넘치는 힙합 바이브" },
  { emoji: "🥰", text: "서로 머리 맞대고 꿀 떨어지는 눈빛" },
  { emoji: "🤫", text: "입술에 손가락 대고 쉿!" },
  { emoji: "🙆", text: "머리 위로 커다란 하트 만들기" },
  { emoji: "🥳", text: "환호하며 양손 활짝 벌리기" },
  { emoji: "👀", text: "옆 사람 힐끔 쳐다보며 장난치기" },
  { emoji: "😉", text: "카메라를 향해 치명적인 윙크" },
  { emoji: "🙌", text: "하이파이브 준비하며 활짝 웃기" },
  { emoji: "👓", text: "안경 고쳐 쓰는 척 지적인 무드" },
  { emoji: "💫", text: "손잡고 빙그르르 춤추듯" },
  { emoji: "🐱", text: "손을 오므려 야옹이 고양이 펀치" },
  { emoji: "💖", text: "얼굴 반쪽씩 합쳐서 하트 완성" },
  { emoji: "🤭", text: "입 틀어막고 깜짝 놀란 표정" },
  { emoji: "🕺", text: "자유로운 댄스 멈춤 프리즈 동작" },
  { emoji: "🧸", text: "인형처럼 귀엽게 정면 응시" },
  { emoji: "✨", text: "손가락으로 턱선 받치고 미소" },
  { emoji: "🎉", text: "마지막 컷! 가장 행복한 표정으로!" }
];

const FILTER_PRESETS = {
  normal:       { bright: 100, contrast: 100, saturate: 100, name: '원본' },
  harublue:     { bright: 110, contrast: 105, saturate: 105, name: '하루블루' },
  deepmono:     { bright: 102, contrast: 138, saturate: 0,   name: '딥모노' },
  y2kcyber:     { bright: 108, contrast: 92,  saturate: 85,  name: 'Y2K' },
  peachglow:    { bright: 114, contrast: 108, saturate: 118, name: '피치' },
  naturalgloss: { bright: 116, contrast: 110, saturate: 108, name: '클리어' },
  bright:       { bright: 115, contrast: 105, saturate: 108, name: '뽀샤시' },
  radiant:      { bright: 112, contrast: 115, saturate: 125, name: '화사한' },
  warm:         { bright: 108, contrast: 105, saturate: 120, name: '따뜻한' },
  cool:         { bright: 106, contrast: 112, saturate: 95,  name: '차가운' },
  mood:         { bright: 105, contrast: 95,  saturate: 85,  name: '감성' },
  retro:        { bright: 108, contrast: 90,  saturate: 80,  name: '레트로' },
  mono:         { bright: 105, contrast: 130, saturate: 0,   name: '흑백' },
  sunset:       { bright: 110, contrast: 110, saturate: 135, name: '노을빛' },
  pink:         { bright: 112, contrast: 108, saturate: 120, name: '로맨틱' }
};

const PALETTE_COLORS = [
  '#000000', '#111827', '#FFFFFF', '#E2E8F0', '#FECDD3', 
  '#FFEDD5', '#FEF9C3', '#D1FAE5', '#BAE6FD', '#EDE9FE', 
  '#881337', '#1E1B4B', '#064E3B'
];

const SIMPLE_PALETTE = ['#000000', '#18181B', '#FFFFFF', '#F4F4F5', '#E4E4E7', '#FEF3C7', '#E0F2FE'];

const APP_THEMES = {
  rose:   { color: '#f43f5e', hover: '#e11d48', light: '#fff1f2', name: '로즈 핑크' },
  black:  { color: '#0f172a', hover: '#020617', light: '#f1f5f9', name: '모던 블랙' },
  blue:   { color: '#0284c7', hover: '#0369a1', light: '#e0f2fe', name: '오션 블루' },
  purple: { color: '#9333ea', hover: '#7e22ce', light: '#f3e8ff', name: '라벤더 퍼플' },
  green:  { color: '#059669', hover: '#047857', light: '#d1fae5', name: '포레스트 그린' },
  orange: { color: '#f97316', hover: '#ea580c', light: '#fff7ed', name: '선셋 오렌지' },
  yellow: { color: '#eab308', hover: '#ca8a04', light: '#fefce8', name: '선샤인 옐로우' },
  navy:   { color: '#1e1b4b', hover: '#0f172a', light: '#eef2ff', name: '미드나잇 네이비' },
  coral:  { color: '#fb7185', hover: '#f43f5e', light: '#fff1f2', name: '벚꽃 코랄' },
  mint:   { color: '#14b8a6', hover: '#0d9488', light: '#f0fdfa', name: '민트 브리즈' }
};

let historyStack = [];
let redoStack = [];

let appState = {
  isAdmin: false,
  currentUser: null,
  isRegisteredUser: false,
  
  stream: null,
  facingMode: 'user',
  timerSec: 6,
  currentCount: 6,
  countdownTimer: null,
  isShootingPaused: false,
  orientationWarningDismissed: false,
  selectedFormat: 'strip',
  viewfinderRatio: 'full',
  currentShotIndex: 0,
  
  cutMode: 4,
  shotImages: [],
  selectedImages: [],
  selectedIndices: [null, null, null, null],
  activeSlotIndex: 0,
  shotVideoBlobs: [],
  currentMediaRecorder: null,
  currentShotVideoChunks: [],

  themeCategory: 'basic',
  frameStyle: 'middle',
  frameColor: '#000000',
  frameThickness: 60,
  layout: 'strip',
  customEngraveText: '',

  activeFilter: 'normal',
  filters: { bright: 100, contrast: 100, saturate: 100 },
  showDate: true,
  isCurrentFavorite: false,
  currentPhotoId: null,
  typography: {
    fontFamily: 'Pretendard',
    fontSize: 54,
    fontColor: '#FFFFFF',
    isBold: true,
    date: getFormattedTodayDate()
  },

  stickers: [],
  selectedStickerIdx: -1,
  dragTarget: null,
  dragStartPos: { x: 0, y: 0 },
  isDraggingSticker: false,
  resetInterval: null
};

let currentCarouselIdx = 0;
let carouselTouchStartX = 0;
let carouselTouchStartY = 0;
let currentGeneratedVideoBlob = null;
let currentGeneratedVideoFileName = "";
let galleryAccumulator = [];
let canvasZoom = 1.0;
let canvasPanX = 0;
let canvasPanY = 0;
let isPanning = false;
let panStartX = 0;
let panStartY = 0;
let currentRatingValue = 5.0;
let userLocationCache = { location: "수원시 (GPS 정밀)", isGps: true };

let activeGalleryTab = 'history';
let cachedUserGalleryPhotos = [];
let hourlyChartInstance = null;
let deviceChartInstance = null;

// ========================================================
// 1. 오디오 & 실감형 햅틱 피드백 엔진
// ========================================================
let audioCtx = null;
function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playBeep(freq = 700) {
  try {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  } catch (e) {}
}

function playRealisticShutter() {
  try {
    initAudio();
    const now = audioCtx.currentTime;
    const shutBuf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.08, audioCtx.sampleRate);
    const shutData = shutBuf.getChannelData(0);
    for (let i = 0; i < shutData.length; i++) shutData[i] = Math.random() * 2 - 1;
    const shut = audioCtx.createBufferSource();
    shut.buffer = shutBuf;
    const shutGain = audioCtx.createGain();
    shutGain.gain.setValueAtTime(0.45, now);
    shutGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    shut.connect(shutGain);
    shutGain.connect(audioCtx.destination);
    shut.start(now);
  } catch (e) {}
}

function playMotorPrintSound() {
  try {
    initAudio();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.35);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  } catch (e) {}
}

function triggerHaptic(type = 'light') {
  if (!navigator.vibrate) return;
  try {
    if (type === 'light') navigator.vibrate(25);
    else if (type === 'medium') navigator.vibrate(50);
    else if (type === 'shutter') navigator.vibrate([40, 30, 80]);
  } catch (e) {}
}

// ========================================================
// 2. 동적 뷰포트 & 텔레메트리
// ========================================================
function updateDynamicViewportHeight() {
  document.documentElement.style.setProperty('--app-vh', `${window.innerHeight}px`);
}

async function initUserLocationEngine() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userLocationCache = {
          location: "수원시 (GPS 정밀)",
          isGps: true,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        };
        sendVisitTelemetry();
      },
      () => {
        userLocationCache = { location: "성남시 (통신사 기지국 IDC)", isGps: false };
        sendVisitTelemetry();
      },
      { timeout: 4000, maximumAge: 60000 }
    );
  } else {
    userLocationCache = { location: "수원시 (기본값)", isGps: false };
    sendVisitTelemetry();
  }
}

async function sendVisitTelemetry() {
  try {
    const telemetry = await collectDeviceTelemetry();
    const res = await fetch(GOOGLE_DB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'VISIT',
        device: telemetry.device,
        os: telemetry.os,
        browser: telemetry.browser,
        screen: telemetry.screen,
        location: userLocationCache.location,
        isGps: userLocationCache.isGps,
        referrer: telemetry.referrer
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.visits) {
        const elToday = document.getElementById('statTodayCount');
        const elTotal = document.getElementById('statTotalCount');
        if (elToday) elToday.textContent = data.visits.today;
        if (elTotal) elTotal.textContent = data.visits.total;
      }
    }
  } catch (e) {}
}

// ========================================================
// 3. 회원 인증 (PIN 삭제, 이름+생년월일 중복 검증)
// ========================================================
function openAuthModal(tab = 'login') {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.style.removeProperty('display');
  modal.style.setProperty('display', 'flex', 'important');
  switchAuthTab(tab);
  if (window.lucide) lucide.createIcons();
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.setProperty('display', 'none', 'important');
  }
}

function switchAuthTab(tab) {
  const loginForm = document.getElementById('authFormLogin');
  const regForm = document.getElementById('authFormRegister');
  const findForm = document.getElementById('authFormFind');
  const tabLogin = document.getElementById('tabModalLogin');
  const tabReg = document.getElementById('tabModalRegister');
  const tabFind = document.getElementById('tabModalFind');

  if (loginForm) loginForm.classList.add('hidden');
  if (regForm) regForm.classList.add('hidden');
  if (findForm) findForm.classList.add('hidden');

  const inactiveClass = "px-3 py-1 rounded-lg text-slate-500 hover:text-slate-900";
  const activeClass = "px-3 py-1 rounded-lg bg-white text-slate-900 shadow-xs font-black";

  if (tabLogin) tabLogin.className = inactiveClass;
  if (tabReg) tabReg.className = inactiveClass;
  if (tabFind) tabFind.className = inactiveClass;

  if (tab === 'login') {
    if (loginForm) loginForm.classList.remove('hidden');
    if (tabLogin) tabLogin.className = activeClass;
  } else if (tab === 'register') {
    if (regForm) regForm.classList.remove('hidden');
    if (tabReg) tabReg.className = activeClass;
  } else if (tab === 'find') {
    if (findForm) findForm.classList.remove('hidden');
    if (tabFind) tabFind.className = activeClass;
  }
}

async function checkUserIdDuplicate() {
  const idInput = document.getElementById('regUserId');
  const val = (idInput ? idInput.value : "").trim().toLowerCase();
  if (!val || val.length < 4 || val.length > 12) {
    alert("아이디는 4~12자리 영문/숫자여야 합니다.");
    return;
  }
  if (val === 'knsupolo') {
    alert("이미 사용 중인 최고 관리자 아이디입니다.");
    idInput.setAttribute('data-valid', 'false');
    return;
  }
  try {
    const res = await fetch(`${GOOGLE_DB_URL}?action=CHECK_ID&userId=${encodeURIComponent(val)}&_t=${Date.now()}`);
    const data = await res.json();
    if (data.available) {
      alert("사용 가능한 아이디입니다! ✨");
      idInput.setAttribute('data-valid', 'true');
    } else {
      alert("이미 사용 중인 아이디입니다. 다른 아이디를 입력해 주세요.");
      idInput.setAttribute('data-valid', 'false');
    }
  } catch (e) {
    alert("중복 확인 통신 오류가 발생했습니다.");
  }
}

async function processRegister() {
  const name = (document.getElementById('regUserName').value || "").trim();
  const dob = (document.getElementById('regUserDob').value || "").trim();
  const id = (document.getElementById('regUserId').value || "").trim().toLowerCase();
  const pw = document.getElementById('regUserPw').value;
  const pwConfirm = document.getElementById('regUserPwConfirm').value;
  const email = (document.getElementById('regUserEmail').value || "").trim().toLowerCase();

  if (!name || name.length < 2) { alert("이름을 2자 이상 입력해주세요."); return; }
  if (!dob || dob.length !== 6 || isNaN(dob)) { alert("생년월일은 앞자리 6자리 숫자(예: 980521)로 입력해주세요."); return; }
  if (!id || id.length < 4 || id.length > 12) { alert("아이디는 4~12자리 영문 또는 숫자여야 합니다."); return; }
  if (!pw || pw.length < 6 || !/(?=.*[A-Za-z])(?=.*\d)/.test(pw)) { alert("비밀번호는 6자리 이상 영문과 숫자를 혼합해야 합니다."); return; }
  if (pw !== pwConfirm) { alert("비밀번호와 비밀번호 확인이 일치하지 않습니다."); return; }
  if (!email || !email.includes('@')) { alert("올바른 이메일 주소를 입력해주세요."); return; }

  try {
    const res = await fetch(GOOGLE_DB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'REGISTER', name: name, userId: id, userPw: pw, dob: dob, email: email })
    });
    const data = await res.json();
    if (data.success) {
      alert(`🎉 회원가입이 완료되었습니다!\n환영합니다, ${name}님. 로그인 후 이용해 주세요.`);
      switchAuthTab('login');
      const loginIdInput = document.getElementById('loginUserId');
      if (loginIdInput) loginIdInput.value = id;
    } else {
      alert("가입 실패: " + data.message);
    }
  } catch (err) {
    alert("회원가입 통신 중 오류가 발생했습니다: " + err.message);
  }
}

async function processLogin() {
  const idInput = document.getElementById('loginUserId');
  const pwInput = document.getElementById('loginUserPw');
  const id = (idInput ? idInput.value : '').trim().toLowerCase();
  const pw = pwInput ? pwInput.value : '';
  if (!id || !pw) { alert("아이디와 비밀번호를 입력해주세요."); return; }

  if (id === 'knsupolo' && pw === '12345678') {
    appState.isAdmin = true;
    const adminUser = {
      name: "관리자",
      userId: 'knsupolo',
      dob: '830413',
      email: 'admin@chueok.com',
      isAdmin: true,
      totalShots: 999
    };
    applyUserLoginSuccess(adminUser, 'master-admin-token-' + Date.now());
    closeAuthModal();
    alert("👑 최고 관리자(knsupolo) 계정으로 로그인되었습니다!\n관리자 센터 및 모든 프리미엄 기능이 개방되었습니다.");
    openAdminDashboard();
    return;
  }

  try {
    const res = await fetch(GOOGLE_DB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'LOGIN', userId: id, userPw: pw })
    });
    const data = await res.json();
    if (data.success) {
      applyUserLoginSuccess(data.user, data.sessionToken);
      closeAuthModal();
      alert(`환영합니다, ${data.user.name || data.user.userId}님! 프리미엄 혜택이 활성화되었습니다. 💖`);
      loadUserSavedTheme();
    } else {
      alert(data.message || "아이디 또는 비밀번호가 일치하지 않습니다.");
    }
  } catch (err) {
    alert("로그인 통신 중 오류가 발생했습니다.");
  }
}

function applyUserLoginSuccess(user, token) {
  appState.currentUser = user;
  appState.isRegisteredUser = true;

  const authPayload = {
    user: user,
    token: token,
    expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000)
  };
  localStorage.setItem('chueok_auth_session', JSON.stringify(authPayload));
  updateUserHeaderUI();
}

function checkAutoLoginSession() {
  const saved = localStorage.getItem('chueok_auth_session');
  if (!saved) return;
  try {
    const payload = JSON.parse(saved);
    if (payload.expiresAt && Date.now() < payload.expiresAt && payload.user) {
      appState.currentUser = payload.user;
      appState.isRegisteredUser = true;
      if (payload.user.userId === 'knsupolo') appState.isAdmin = true;
      updateUserHeaderUI();
      loadUserSavedTheme();
    } else {
      localStorage.removeItem('chueok_auth_session');
    }
  } catch (e) {
    localStorage.removeItem('chueok_auth_session');
  }
}

function updateUserHeaderUI() {
  const loginBtn = document.getElementById('btnHeaderLogin');
  const regBtn = document.getElementById('btnHeaderRegister');
  const badge = document.getElementById('userProfileBadge');
  const nameEl = document.getElementById('userProfileName');

  if (appState.isRegisteredUser && appState.currentUser) {
    if (loginBtn) loginBtn.classList.add('hidden');
    if (regBtn) regBtn.classList.add('hidden');
    if (badge) {
      badge.classList.remove('hidden');
      badge.style.display = 'flex';
    }
    if (nameEl) nameEl.textContent = appState.currentUser.name || appState.currentUser.userId;
  } else {
    if (loginBtn) loginBtn.classList.remove('hidden');
    if (regBtn) regBtn.classList.remove('hidden');
    if (badge) {
      badge.classList.add('hidden');
      badge.style.display = 'none';
    }
  }
}

function processLogout() {
  if (!confirm("로그아웃 하시겠습니까?")) return;
  appState.currentUser = null;
  appState.isRegisteredUser = false;
  appState.isAdmin = false;
  localStorage.removeItem('chueok_auth_session');
  updateUserHeaderUI();
  alert("정상적으로 로그아웃되었습니다.");
}

async function processFindAccount() {
  const name = (document.getElementById('findUserName').value || "").trim();
  const dob = (document.getElementById('findUserDob').value || "").trim();
  const email = (document.getElementById('findUserEmail').value || "").trim().toLowerCase();

  if (!name || !dob || !email) {
    alert("이름, 생년월일 6자리, 이메일을 모두 입력해주세요.");
    return;
  }

  try {
    const res = await fetch(GOOGLE_DB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'FIND_ACCOUNT', name: name, dob: dob, email: email })
    });
    const data = await res.json();
    alert(data.message || (data.success ? "계정 정보가 발송되었습니다!" : "일치하는 계정을 찾을 수 없습니다."));
    if (data.success) switchAuthTab('login');
  } catch (e) {
    alert("계정 찾기 통신 중 오류가 발생했습니다.");
  }
}

// ========================================================
// 4. 마이페이지 (내 정보 관리 센터)
// ========================================================
function openMyProfileModal() {
  if (!appState.isRegisteredUser || !appState.currentUser) {
    openAuthModal('login');
    return;
  }
  const modal = document.getElementById('myProfileModal');
  if (!modal) return;

  const idEl = document.getElementById('profileModalUserId');
  const countEl = document.getElementById('profileModalShotCount');
  const currentThemeLabel = document.getElementById('profileCurrentThemeName');

  if (idEl) idEl.textContent = `${appState.currentUser.name || '회원'} (${appState.currentUser.userId})`;
  if (countEl) countEl.textContent = `${appState.currentUser.totalShots || 0}회`;
  
  const savedKey = localStorage.getItem('chueok_ui_theme') || 'rose';
  if (currentThemeLabel && APP_THEMES[savedKey]) {
    currentThemeLabel.textContent = APP_THEMES[savedKey].name;
  }

  modal.classList.remove('hidden');
  modal.style.removeProperty('display');
  modal.style.setProperty('display', 'flex', 'important');
  if (window.lucide) lucide.createIcons();
}

function closeMyProfileModal() {
  const modal = document.getElementById('myProfileModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.setProperty('display', 'none', 'important');
  }
}

function applyAppTheme(themeKey) {
  const t = APP_THEMES[themeKey] || APP_THEMES.rose;
  document.documentElement.style.setProperty('--theme-color', t.color);
  document.documentElement.style.setProperty('--theme-primary', t.color);
  document.documentElement.style.setProperty('--theme-primary-hover', t.hover);
  document.documentElement.style.setProperty('--theme-color-hover', t.hover);
  document.documentElement.style.setProperty('--theme-color-light', t.light);
  localStorage.setItem('chueok_ui_theme', themeKey);

  const currentThemeLabel = document.getElementById('profileCurrentThemeName');
  if (currentThemeLabel) currentThemeLabel.textContent = t.name;

  if (appState.isRegisteredUser && appState.currentUser) {
    fetch(GOOGLE_DB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'SAVE_UI_THEME', userId: appState.currentUser.userId, themeKey: themeKey })
    }).catch(() => {});
  }
}

async function loadUserSavedTheme() {
  const localTheme = localStorage.getItem('chueok_ui_theme');
  if (localTheme) {
    applyAppTheme(localTheme);
    return;
  }
  if (!appState.isRegisteredUser || !appState.currentUser) return;

  try {
    const res = await fetch(`${GOOGLE_DB_URL}?action=GET_UI_THEME&userId=${encodeURIComponent(appState.currentUser.userId)}&_t=${Date.now()}`);
    const data = await res.json();
    if (data && data.success && data.themeKey) {
      applyAppTheme(data.themeKey);
    }
  } catch (e) {}
}

// ========================================================
// 5. 초기화면 멀티 공유 센터
// ========================================================
function openMainShareModal() {
  const modal = document.getElementById('mainShareModal');
  const qrBox = document.getElementById('homeShareQrBox');
  if (!modal || !qrBox) return;

  const currentAppUrl = window.location.href.split('?')[0];
  qrBox.innerHTML = '';
  try {
    new QRCode(qrBox, {
      text: currentAppUrl,
      width: 180,
      height: 180,
      correctLevel: QRCode.CorrectLevel.M
    });
  } catch (err) {}

  modal.classList.remove('hidden');
  modal.style.removeProperty('display');
  modal.style.setProperty('display', 'flex', 'important');
  if (window.lucide) lucide.createIcons();
}

function closeMainShareModal() {
  const modal = document.getElementById('mainShareModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.setProperty('display', 'none', 'important');
  }
}

async function triggerNativeShareAction() {
  const currentAppUrl = window.location.href.split('?')[0];
  const sharePayload = {
    title: '포토이스트 (Photoist) Studio Pro',
    text: '지금 친구들과 함께 모바일로 포토이스트 네컷 사진을 촬영해 보세요! 📸✨',
    url: currentAppUrl
  };

  if (navigator.share && navigator.canShare && navigator.canShare(sharePayload)) {
    try {
      await navigator.share(sharePayload);
      closeMainShareModal();
      return;
    } catch (e) {
      if (e.name === 'AbortError') return;
    }
  }
  copyWebAppShareUrl();
}

function copyWebAppShareUrl() {
  const currentAppUrl = window.location.href.split('?')[0];
  navigator.clipboard.writeText(currentAppUrl).then(() => {
    alert("스튜디오 접속 링크가 클립보드에 복사되었습니다! 📋\n카카오톡이나 메시지 창에 붙여넣어 공유하세요.");
    closeMainShareModal();
  }).catch(() => {
    prompt("아래 웹 주소를 복사하여 공유하세요:", currentAppUrl);
  });
}

// ========================================================
// 6. 마이 갤러리 아카이브 제어
// ========================================================
async function openMyGalleryModal() {
  const modal = document.getElementById('myGalleryModal');
  const grid = document.getElementById('myGalleryGrid');
  if (!modal || !grid) return;

  modal.classList.remove('hidden');
  modal.style.removeProperty('display');
  modal.style.setProperty('display', 'flex', 'important');
  if (window.lucide) lucide.createIcons();

  const localArchive = JSON.parse(localStorage.getItem('chueok_local_gallery') || '[]');
  cachedUserGalleryPhotos = localArchive;
  renderFilteredGalleryGrid();

  if (appState.isRegisteredUser && appState.currentUser) {
    try {
      const res = await fetch(`${GOOGLE_DB_URL}?action=GET_USER_GALLERY&userId=${encodeURIComponent(appState.currentUser.userId)}&_t=${Date.now()}`);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.photos)) {
        cachedUserGalleryPhotos = data.photos;
        const statsText = document.getElementById('memberArchiveStatsText');
        if (statsText) {
          statsText.textContent = `총 ${data.totalShots || data.photos.length}회 촬영 완료 • 찜한 사진 ${data.favoriteCount || 0}장`;
        }
        renderFilteredGalleryGrid();
      }
    } catch (e) {}
  }
}

function closeMyGalleryModal() {
  const modal = document.getElementById('myGalleryModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.setProperty('display', 'none', 'important');
  }
}

function switchGalleryTab(tabKey) {
  activeGalleryTab = tabKey;
  const tabHist = document.getElementById('tabGalleryHistory');
  const tabFav = document.getElementById('tabGalleryFavorites');
  if (tabKey === 'history') {
    if (tabHist) tabHist.className = "py-1.5 rounded-lg bg-white text-slate-900 shadow-xs font-black";
    if (tabFav) tabFav.className = "py-1.5 rounded-lg text-slate-600 hover:text-slate-900";
  } else {
    if (tabHist) tabHist.className = "py-1.5 rounded-lg text-slate-600 hover:text-slate-900";
    if (tabFav) tabFav.className = "py-1.5 rounded-lg bg-white text-slate-900 shadow-xs font-black";
  }
  renderFilteredGalleryGrid();
}

function renderFilteredGalleryGrid() {
  const grid = document.getElementById('myGalleryGrid');
  if (!grid) return;

  let displayPhotos = [...cachedUserGalleryPhotos];
  if (activeGalleryTab === 'favorites') {
    displayPhotos = displayPhotos.filter(p => p.isFavorite === true);
  }

  if (displayPhotos.length === 0) {
    grid.innerHTML = activeGalleryTab === 'favorites'
      ? `<div class="text-center py-12 text-xs text-slate-400"><i data-lucide="star" class="w-8 h-8 text-amber-300 mx-auto mb-2 opacity-50"></i>아직 찜한 추억네컷이 없습니다.<br>에디터에서 [⭐ 추억네컷 찜]을 눌러보세요!</div>`
      : `<p class="text-xs text-slate-400 text-center py-10">보관함에 저장된 촬영 기록이 없습니다.</p>`;
    if (window.lucide) lucide.createIcons();
    return;
  }

  grid.innerHTML = `
    <div class="grid grid-cols-2 gap-3">
      ${displayPhotos.map((p, idx) => `
        <div class="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 flex flex-col justify-between space-y-2 shadow-xs">
          <div class="aspect-[3/4] bg-slate-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center relative">
            <span class="absolute top-1.5 left-1.5 bg-black/75 text-white text-[9px] font-black px-1.5 py-0.5 rounded">#${idx + 1}</span>${p.isFavorite ? `<span class="absolute top-1.5 right-1.5 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow">⭐ 찜</span>` : ''}
            <img src="${p.fileUrl || ('https://drive.google.com/thumbnail?id=' + p.fileId + '&sz=w600')}" class="w-full h-full object-cover" onerror="this.src='https://placehold.co/400x600?text=Photo';">
          </div>
          <div class="flex items-center justify-between pt-1">
            <span class="text-[9px] text-slate-400">${p.date ? p.date.slice(0, 10) : ''}</span>
            <div class="flex space-x-1">
              <button onclick="togglePhotoFavoriteStatus('${p.id}')" class="p-1 rounded-lg border text-xs active:scale-90 ${p.isFavorite ? 'bg-amber-50 border-amber-300 text-amber-500' : 'bg-white border-slate-200 text-slate-400'}" title="찜 토글">
                ★
              </button>
              <a href="${p.fileUrl}" target="_blank" download="photo.png" class="p-1 bg-white border border-slate-200 rounded-lg text-slate-700 hover:text-theme active:scale-90" title="보기/다운">
                <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
              </a>
              <button onclick="deleteGalleryPhotoItem('${p.id}')" class="p-1 bg-rose-50 border border-rose-200 rounded-lg text-rose-600 active:scale-90" title="삭제">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  if (window.lucide) lucide.createIcons();
}

async function togglePhotoFavoriteStatus(photoId) {
  let localArchive = JSON.parse(localStorage.getItem('chueok_local_gallery') || '[]');
  const localTarget = localArchive.find(p => p.id === photoId);
  if (localTarget) {
    localTarget.isFavorite = !localTarget.isFavorite;
    localStorage.setItem('chueok_local_gallery', JSON.stringify(localArchive));
  }
  const cachedTarget = cachedUserGalleryPhotos.find(p => p.id === photoId);
  if (cachedTarget) cachedTarget.isFavorite = !cachedTarget.isFavorite;
  renderFilteredGalleryGrid();

  if (appState.isRegisteredUser && appState.currentUser) {
    try {
      fetch(GOOGLE_DB_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'TOGGLE_FAVORITE', photoId: photoId, userId: appState.currentUser.userId })
      });
    } catch (e) {}
  }
}

async function deleteGalleryPhotoItem(photoId) {
  if (!confirm("이 사진을 보관함에서 영구 삭제하시겠습니까?")) return;
  let localArchive = JSON.parse(localStorage.getItem('chueok_local_gallery') || '[]');
  localArchive = localArchive.filter(p => p.id !== photoId);
  localStorage.setItem('chueok_local_gallery', JSON.stringify(localArchive));

  cachedUserGalleryPhotos = cachedUserGalleryPhotos.filter(p => p.id !== photoId);
  renderFilteredGalleryGrid();

  if (appState.isRegisteredUser && appState.currentUser) {
    try {
      fetch(GOOGLE_DB_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'DELETE_GALLERY_PHOTO', photoId: photoId, userId: appState.currentUser.userId })
      });
    } catch (e) {}
  }
}

// ========================================================
// 7. 카메라 회전 감지 & 닫기(X) 처리
// ========================================================
function dismissOrientationWarning() {
  appState.orientationWarningDismissed = true;
  const overlay = document.getElementById('orientationWarningOverlay');
  if (overlay) overlay.classList.add('hidden');
  resumeCountdown();
}

function checkDeviceOrientation() {
  const overlay = document.getElementById('orientationWarningOverlay');
  const title = document.getElementById('orientationTitle');
  const desc = document.getElementById('orientationDesc');
  const icon = document.getElementById('orientationIcon');
  if (!overlay) return;

  const shootScreen = document.getElementById('screenLiveShoot');
  if (!shootScreen || shootScreen.classList.contains('hidden') || appState.orientationWarningDismissed) {
    overlay.classList.add('hidden');
    return;
  }

  const isPortraitDevice = window.innerHeight > window.innerWidth;

  if (appState.selectedFormat === 'strip') {
    if (isPortraitDevice) {
      overlay.classList.remove('hidden');
      if (title) title.textContent = "카메라를 가로로 돌려주세요!";
      if (desc) desc.textContent = "1×4 스트립 규격은 가로 파지 전용입니다. 기기를 가로로 회전하시면 카운트다운이 재개됩니다.";
      if (icon) icon.className = "w-8 h-8 text-theme rotate-90";
      pauseCountdown();
    } else {
      overlay.classList.add('hidden');
      resumeCountdown();
    }
  } else if (appState.selectedFormat === 'grid') {
    if (!isPortraitDevice) {
      overlay.classList.remove('hidden');
      if (title) title.textContent = "카메라를 세로로 돌려주세요!";
      if (desc) desc.textContent = "2×2 엽서형 규격은 세로 파지 전용입니다. 기기를 세로로 회전하시면 카운트다운이 재개됩니다.";
      if (icon) icon.className = "w-8 h-8 text-theme";
      pauseCountdown();
    } else {
      overlay.classList.add('hidden');
      resumeCountdown();
    }
  }
}

function pauseCountdown() {
  appState.isShootingPaused = true;
}

function resumeCountdown() {
  appState.isShootingPaused = false;
}

// ========================================================
// 8. 🌟 카메라 대기실 (2x2 풀화면 축소 버그 완벽 수정)
// ========================================================
function startSession(format) {
  appState.selectedFormat = format || 'strip';
  appState.layout = format || 'strip';
  appState.currentShotIndex = 0;
  appState.shotImages = [];
  appState.selectedImages = [];
  appState.orientationWarningDismissed = false;
  appState.isCurrentFavorite = false;
  appState.currentPhotoId = null;

  initEmptySlots(appState.cutMode || 4);

  const liveBadge = document.getElementById('liveFormatBadge');
  if (liveBadge) liveBadge.textContent = (format === 'strip') ? "1×4 스트립 (가로)" : "2×2 엽서형 (세로)";
  const editBadge = document.getElementById('editorFormatBadge');
  if (editBadge) editBadge.textContent = (format === 'strip') ? "1×4 스트립" : "2×2 엽서형";
  const progressBadge = document.getElementById('liveProgressBadge');
  if (progressBadge) progressBadge.textContent = "구도 대기실";

  showScreen('screenLiveShoot');

  const waitCtrl = document.getElementById('waitingRoomControls');
  const shootLayer = document.getElementById('activeShootingLayer');
  const bottomBar = document.getElementById('shootingBottomBar');

  if (waitCtrl) waitCtrl.classList.remove('hidden');
  if (shootLayer) shootLayer.classList.add('hidden');
  if (bottomBar) bottomBar.classList.add('hidden');

  setViewfinderRatio('full', null);
  startCameraStream();
  setTimeout(checkDeviceOrientation, 300);
}

async function startCameraStream(preserveState = false) {
  const video = document.getElementById('liveWebcamVideo');
  if (video) {
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('muted', '');
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("카메라 권한이 없거나 HTTPS 보안 연결이 아닙니다. 앨범 선택 모드로 이동합니다.");
    triggerGalleryUpload();
    return;
  }
  initAudio();

  if (!preserveState) {
    stopCameraAndAudio();
  } else if (appState.stream) {
    appState.stream.getTracks().forEach(t => t.stop());
    appState.stream = null;
  }

  const constraintsList = [
    { video: { facingMode: appState.facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false },
    { video: { facingMode: appState.facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
    { video: { facingMode: appState.facingMode }, audio: false },
    { video: true, audio: false }
  ];

  let stream = null;
  for (const c of constraintsList) {
    try {
      stream = await navigator.mediaDevices.getUserMedia(c);
      if (stream) break;
    } catch (err) {}
  }

  if (!stream) {
    alert("카메라 장치 연결에 실패했습니다.");
    triggerGalleryUpload();
    return;
  }

  appState.stream = stream;
  if (video) {
    video.srcObject = stream;
    if (appState.facingMode === 'user') video.classList.add('mirror');
    else video.classList.remove('mirror');
    video.play().catch(() => {});
  }
}

async function flipCameraFacing() {
  playBeep(850);
  triggerHaptic('light');
  appState.facingMode = (appState.facingMode === 'user') ? 'environment' : 'user'; 
  await startCameraStream(true); 
}

function setViewfinderRatio(ratio, btn) {
  appState.viewfinderRatio = ratio;
  document.querySelectorAll('.ratio-btn').forEach(b => {
    b.className = "ratio-btn px-2.5 py-1 rounded-lg text-slate-300";
  });
  if (btn) btn.className = "ratio-btn px-2.5 py-1 rounded-lg bg-theme text-white shadow";

  const box = document.getElementById('dynamicViewfinderBox');
  const badge = document.getElementById('viewfinderRatioBadge');
  if (!box) return;

  if (ratio === 'full') {
    box.className = "border-2 border-white/40 w-full h-full relative flex items-center justify-center transition-all duration-300 rounded-2xl";
    if (badge) badge.textContent = "UHD 풀 화면";
  } else if (ratio === '3:2') {
    box.className = "border-2 border-white/70 w-full max-w-2xl aspect-[3/2] relative flex items-center justify-center transition-all duration-300 rounded-2xl shadow-2xl";
    if (badge) badge.textContent = "3:2 단체 가이드";
  } else if (ratio === '4:5') {
    box.className = "border-2 border-white/70 h-[88vh] max-w-[95vw] aspect-[4/5] relative flex items-center justify-center transition-all duration-300 rounded-2xl shadow-2xl";
    if (badge) badge.textContent = "4:5 인물 가이드";
  }
}

// ========================================================
// 9. 6컷 연속 촬영 (풀화면 고정 & 축소 방지)
// ========================================================
function startActualCountdownSession() {
  playBeep(900);
  triggerHaptic('medium');

  const waitCtrl = document.getElementById('waitingRoomControls');
  const shootLayer = document.getElementById('activeShootingLayer');
  const bottomBar = document.getElementById('shootingBottomBar');
  if (waitCtrl) waitCtrl.classList.add('hidden');
  if (shootLayer) shootLayer.classList.remove('hidden');
  if (bottomBar) bottomBar.classList.remove('hidden');

  const box = document.getElementById('dynamicViewfinderBox');
  if (box && appState.viewfinderRatio === 'full') {
    box.className = "border-2 border-white/40 w-full h-full relative flex items-center justify-center transition-all duration-300 rounded-2xl";
  }

  for (let i = 0; i < 6; i++) { 
    const t = document.getElementById(`liveThumb${i}`); 
    if (t) { 
      t.innerHTML = (i + 1).toString(); 
      t.className = "w-11 h-8 bg-black/50 backdrop-blur border border-white/30 flex items-center justify-center text-[10px] text-white/50 font-bold rounded"; 
    } 
  }

  runContinuousLiveShoot(0);
}

function runContinuousLiveShoot(shotIndex) {
  appState.currentShotIndex = shotIndex;
  if (shotIndex >= 6) { 
    stopCameraAndAudio(); 
    setTimeout(() => { renderPickScreen(); }, 400); 
    return; 
  }

  const badge = document.getElementById('liveProgressBadge');
  if (badge) badge.textContent = `${shotIndex + 1} / 6 컷`;

  const poseItem = POSE_SUGGESTIONS_24[shotIndex % POSE_SUGGESTIONS_24.length];
  const poseGuide = document.getElementById('poseGuideText');
  const poseEmoji = document.getElementById('poseGuideEmoji');
  if (poseGuide) poseGuide.textContent = poseItem.text;
  if (poseEmoji) poseEmoji.textContent = poseItem.emoji;

  appState.currentCount = appState.timerSec;
  const countEl = document.getElementById('liveCountdownText'); 
  if (countEl) countEl.textContent = appState.currentCount;
  
  playBeep(600); 
  startSingleCutVideoRecording();

  if (appState.countdownTimer) clearInterval(appState.countdownTimer);
  appState.countdownTimer = setInterval(() => {
    if (appState.isShootingPaused) return;

    appState.currentCount--;
    if (appState.currentCount > 0) { 
      if (countEl) countEl.textContent = appState.currentCount; 
      playBeep(600);
      if (appState.currentCount <= 3) triggerHaptic('light');
    } else { 
      clearInterval(appState.countdownTimer); 
      stopSingleCutVideoRecording(shotIndex); 
      captureWebcamFrame(shotIndex, () => { 
        setTimeout(() => { runContinuousLiveShoot(shotIndex + 1); }, 1800); 
      }); 
    }
  }, 1000);
}

function triggerInstantOneSec() {
  if (appState.countdownTimer) clearInterval(appState.countdownTimer);
  appState.currentCount = 1; 
  const countEl = document.getElementById('liveCountdownText');
  if (countEl) countEl.textContent = "1";
  playBeep(700);
  triggerHaptic('light');

  setTimeout(() => {
    const shotIndex = appState.shotImages.length; 
    stopSingleCutVideoRecording(shotIndex); 
    captureWebcamFrame(shotIndex, () => { 
      setTimeout(() => { runContinuousLiveShoot(shotIndex + 1); }, 1800); 
    }); 
  }, 1000);
}

function captureWebcamFrame(shotIndex, onDone) {
  playRealisticShutter(); 
  triggerHaptic('shutter');
  flashScreen();

  const video = document.getElementById('liveWebcamVideo');
  const canvas = document.getElementById('hiddenSnapCanvas');
  if (!video || !canvas) return;

  const vw = video.videoWidth || 1920;
  const vh = video.videoHeight || 1080;
  canvas.width = vw;
  canvas.height = vh;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.save();
  if (appState.facingMode === 'user') {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  ctx.restore();

  const img = new Image();
  img.onload = () => {
    appState.shotImages.push(img);
    const thumb = document.getElementById(`liveThumb${shotIndex}`);
    if (thumb) { 
      thumb.innerHTML = `<img src="${img.src}" class="w-full h-full object-cover">`; 
      thumb.className = "w-11 h-8 border-2 border-theme overflow-hidden shadow-lg rounded"; 
    }
    if (onDone) onDone();
  };
  img.src = canvas.toDataURL('image/jpeg', 0.99);
}

function flashScreen() { 
  const f = document.getElementById('flashOverlay'); 
  if (f) { 
    f.classList.remove('hidden'); 
    f.classList.add('flash-effect'); 
    setTimeout(() => { 
      f.classList.remove('flash-effect'); 
      f.classList.add('hidden'); 
    }, 350); 
  } 
}

function startSingleCutVideoRecording() {
  if (!appState.stream) return;
  appState.currentShotVideoChunks = [];
  try { 
    appState.currentMediaRecorder = new MediaRecorder(appState.stream, { 
      mimeType: 'video/webm',
      videoBitsPerSecond: 15000000
    }); 
  } catch (e) { 
    try { 
      appState.currentMediaRecorder = new MediaRecorder(appState.stream, { mimeType: 'video/mp4', videoBitsPerSecond: 15000000 }); 
    } catch (e2) { 
      try { appState.currentMediaRecorder = new MediaRecorder(appState.stream); } 
      catch (e3) { appState.currentMediaRecorder = null; } 
    } 
  }
  if (appState.currentMediaRecorder) { 
    appState.currentMediaRecorder.ondataavailable = e => { 
      if (e.data && e.data.size > 0) appState.currentShotVideoChunks.push(e.data); 
    }; 
    appState.currentMediaRecorder.start(); 
  }
}

function stopSingleCutVideoRecording(shotIndex) {
  if (appState.currentMediaRecorder && appState.currentMediaRecorder.state !== 'inactive') {
    appState.currentMediaRecorder.onstop = () => { 
      appState.shotVideoBlobs[shotIndex] = new Blob(appState.currentShotVideoChunks, { type: 'video/webm' }); 
    };
    appState.currentMediaRecorder.stop();
  }
}

function stopCameraAndAudio() { 
  if (appState.countdownTimer) { clearInterval(appState.countdownTimer); appState.countdownTimer = null; } 
  if (appState.currentMediaRecorder && appState.currentMediaRecorder.state !== 'inactive') { try { appState.currentMediaRecorder.stop(); } catch(e){} } 
  if (appState.stream) { appState.stream.getTracks().forEach(t => t.stop()); appState.stream = null; } 
  if (audioCtx && audioCtx.state !== 'closed') { try { audioCtx.suspend(); } catch (e) {} } 
}

// ========================================================
// 10. 🌟 사진 선택 (포토이스트 매트블랙 통일, 초기 빈 슬롯, 4·5·6컷)
// ========================================================
function initEmptySlots(cuts) {
  appState.cutMode = cuts;
  appState.selectedIndices = Array(cuts).fill(null);
  appState.activeSlotIndex = 0;
}

function changeFrameCutMode(cuts) {
  playBeep(850);
  triggerHaptic('light');
  initEmptySlots(cuts);

  [4, 5, 6].forEach(c => {
    const btn = document.getElementById(`btnCutMode${c}`);
    if (btn) {
      if (c === cuts) {
        btn.className = "px-3 py-1 rounded-xl text-xs font-black bg-white text-slate-900 shadow-xs";
      } else {
        btn.className = "px-3 py-1 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900";
      }
    }
  });

  buildPickMiniPreviewStructure();
  setupSlotDragAndDrop();
  updatePreviewSlots();
  updateCarouselView();
  refreshPickUI();
}

function renderPickScreen() {
  showScreen('screenPick');
  
  if (!appState.selectedIndices || appState.selectedIndices.length !== appState.cutMode) {
    initEmptySlots(appState.cutMode || 4);
  }
  appState.activeSlotIndex = 0; 
  currentCarouselIdx = 0;

  const imgEl = document.getElementById('carouselCurrentImg');
  if (imgEl && appState.shotImages.length > 0) {
    imgEl.src = appState.shotImages[0].src;
  }

  buildPickMiniPreviewStructure();
  setupCarouselViewer();
  setupSlotDragAndDrop();
  updatePreviewSlots();
  updateCarouselView();
  refreshPickUI();
}

function returnToPickScreen() {
  playBeep(750);
  triggerHaptic('light');
  renderPickScreen();
}

function buildPickMiniPreviewStructure() {
  const container = document.getElementById('pickMiniFramePreview');
  if (!container) return;
  const cuts = appState.cutMode || 4;
  const isGrid = (appState.selectedFormat === 'grid');
  
  container.style.backgroundColor = '#111111';

  let slotsHtml = "";

  if (cuts === 4) {
    if (isGrid) {
      container.className = "w-72 sm:w-80 aspect-[2/3] p-3.5 shadow-2xl flex flex-col justify-between border border-slate-700 rounded-2xl transition-all";
      slotsHtml = `
        <div class="grid grid-cols-2 gap-2 flex-1 my-1.5">
          <div onclick="selectSlotForAssignment(0)" data-slot="0" id="previewSlot0" class="drop-slot aspect-[4/5] bg-zinc-900 border-2 border-theme ring-2 ring-rose-400 flex items-center justify-center text-slate-400 text-xs font-bold cursor-pointer overflow-hidden rounded-xl">1번 슬롯</div>
          <div onclick="selectSlotForAssignment(1)" data-slot="1" id="previewSlot1" class="drop-slot aspect-[4/5] bg-zinc-900 border-2 border-transparent flex items-center justify-center text-slate-400 text-xs font-bold cursor-pointer overflow-hidden rounded-xl">2번 슬롯</div>
          <div onclick="selectSlotForAssignment(2)" data-slot="2" id="previewSlot2" class="drop-slot aspect-[4/5] bg-zinc-900 border-2 border-transparent flex items-center justify-center text-slate-400 text-xs font-bold cursor-pointer overflow-hidden rounded-xl">3번 슬롯</div>
          <div onclick="selectSlotForAssignment(3)" data-slot="3" id="previewSlot3" class="drop-slot aspect-[4/5] bg-zinc-900 border-2 border-transparent flex items-center justify-center text-slate-400 text-xs font-bold cursor-pointer overflow-hidden rounded-xl">4번 슬롯</div>
        </div>
      `;
    } else {
      container.className = "w-56 sm:w-60 p-3 shadow-2xl flex flex-col space-y-1.5 border border-slate-700 rounded-2xl transition-all";
      slotsHtml = `
        <div class="flex flex-col space-y-1.5 flex-1 my-1">
          <div onclick="selectSlotForAssignment(0)" data-slot="0" id="previewSlot0" class="drop-slot aspect-[3/2] bg-zinc-900 border-2 border-theme ring-2 ring-rose-400 flex items-center justify-center text-slate-400 text-xs font-bold cursor-pointer overflow-hidden rounded-xl">1번 슬롯</div>
          <div onclick="selectSlotForAssignment(1)" data-slot="1" id="previewSlot1" class="drop-slot aspect-[3/2] bg-zinc-900 border-2 border-transparent flex items-center justify-center text-slate-400 text-xs font-bold cursor-pointer overflow-hidden rounded-xl">2번 슬롯</div>
          <div onclick="selectSlotForAssignment(2)" data-slot="2" id="previewSlot2" class="drop-slot aspect-[3/2] bg-zinc-900 border-2 border-transparent flex items-center justify-center text-slate-400 text-xs font-bold cursor-pointer overflow-hidden rounded-xl">3번 슬롯</div>
          <div onclick="selectSlotForAssignment(3)" data-slot="3" id="previewSlot3" class="drop-slot aspect-[3/2] bg-zinc-900 border-2 border-transparent flex items-center justify-center text-slate-400 text-xs font-bold cursor-pointer overflow-hidden rounded-xl">4번 슬롯</div>
        </div>
      `;
    }
  } else if (cuts === 5) {
    container.className = "w-72 sm:w-80 aspect-[2/3] p-3 shadow-2xl flex flex-col justify-between border border-slate-700 rounded-2xl transition-all";
    slotsHtml = `
      <div class="flex flex-col gap-1.5 flex-1 my-1">
        <div class="grid grid-cols-2 gap-1.5 h-[30%]">
          <div onclick="selectSlotForAssignment(0)" data-slot="0" id="previewSlot0" class="drop-slot bg-zinc-900 border-2 border-theme ring-2 ring-rose-400 flex items-center justify-center text-slate-400 text-[10px] font-bold cursor-pointer overflow-hidden rounded-lg">1번 슬롯</div>
          <div onclick="selectSlotForAssignment(1)" data-slot="1" id="previewSlot1" class="drop-slot bg-zinc-900 border-2 border-transparent flex items-center justify-center text-slate-400 text-[10px] font-bold cursor-pointer overflow-hidden rounded-lg">2번 슬롯</div>
        </div>
        <div onclick="selectSlotForAssignment(2)" data-slot="2" id="previewSlot2" class="drop-slot h-[36%] bg-zinc-900 border-2 border-transparent flex items-center justify-center text-slate-300 text-xs font-black cursor-pointer overflow-hidden rounded-lg">★ 3번 메인 대형 슬롯</div>
        <div class="grid grid-cols-2 gap-1.5 h-[30%]">
          <div onclick="selectSlotForAssignment(3)" data-slot="3" id="previewSlot3" class="drop-slot bg-zinc-900 border-2 border-transparent flex items-center justify-center text-slate-400 text-[10px] font-bold cursor-pointer overflow-hidden rounded-lg">4번 슬롯</div>
          <div onclick="selectSlotForAssignment(4)" data-slot="4" id="previewSlot4" class="drop-slot bg-zinc-900 border-2 border-transparent flex items-center justify-center text-slate-400 text-[10px] font-bold cursor-pointer overflow-hidden rounded-lg">5번 슬롯</div>
        </div>
      </div>
    `;
  } else if (cuts === 6) {
    container.className = "w-72 sm:w-80 aspect-[2/3] p-3 shadow-2xl flex flex-col justify-between border border-slate-700 rounded-2xl transition-all";
    slotsHtml = `
      <div class="grid grid-cols-2 gap-1.5 flex-1 my-1">
        <div onclick="selectSlotForAssignment(0)" data-slot="0" id="previewSlot0" class="drop-slot bg-zinc-900 border-2 border-theme ring-2 ring-rose-400 flex items-center justify-center text-slate-400 text-[10px] font-bold cursor-pointer overflow-hidden rounded-lg">1번 슬롯</div>
        <div onclick="selectSlotForAssignment(1)" data-slot="1" id="previewSlot1" class="drop-slot bg-zinc-900 border-2 border-transparent flex items-center justify-center text-slate-400 text-[10px] font-bold cursor-pointer overflow-hidden rounded-lg">2번 슬롯</div>
        <div onclick="selectSlotForAssignment(2)" data-slot="2" id="previewSlot2" class="drop-slot bg-zinc-900 border-2 border-transparent flex items-center justify-center text-slate-400 text-[10px] font-bold cursor-pointer overflow-hidden rounded-lg">3번 슬롯</div>
        <div onclick="selectSlotForAssignment(3)" data-slot="3" id="previewSlot3" class="drop-slot bg-zinc-900 border-2 border-transparent flex items-center justify-center text-slate-400 text-[10px] font-bold cursor-pointer overflow-hidden rounded-lg">4번 슬롯</div>
        <div onclick="selectSlotForAssignment(4)" data-slot="4" id="previewSlot4" class="drop-slot bg-zinc-900 border-2 border-transparent flex items-center justify-center text-slate-400 text-[10px] font-bold cursor-pointer overflow-hidden rounded-lg">5번 슬롯</div>
        <div onclick="selectSlotForAssignment(5)" data-slot="5" id="previewSlot5" class="drop-slot bg-zinc-900 border-2 border-transparent flex items-center justify-center text-slate-400 text-[10px] font-bold cursor-pointer overflow-hidden rounded-lg">6번 슬롯</div>
      </div>
    `;
  }

  container.innerHTML = `
    <div id="pickPreviewHeader" class="text-left text-white text-xs font-bold font-serif px-1 py-0.5 tracking-wider">photoist</div>
    ${slotsHtml}
    <div id="pickPreviewFooter" class="text-right text-white/50 text-[9px] font-mono px-1 py-0.5">STUDIO PRO</div>
  `;
}

function setupSlotDragAndDrop() {
  const currentImg = document.getElementById('carouselCurrentImg');
  if (currentImg) {
    currentImg.ondragstart = (e) => {
      e.dataTransfer.setData('text/plain', currentCarouselIdx.toString());
    };
  }

  document.querySelectorAll('.drop-slot').forEach(slot => {
    slot.ondragover = (e) => {
      e.preventDefault();
      slot.classList.add('slot-dragover');
    };
    slot.ondragleave = () => {
      slot.classList.remove('slot-dragover');
    };
    slot.ondrop = (e) => {
      e.preventDefault();
      slot.classList.remove('slot-dragover');
      const draggedShotIdx = parseInt(e.dataTransfer.getData('text/plain'));
      const targetSlotIdx = parseInt(slot.getAttribute('data-slot'));
      if (!isNaN(draggedShotIdx) && !isNaN(targetSlotIdx)) {
        appState.activeSlotIndex = targetSlotIdx;
        assignPhotoToCurrentSlot(draggedShotIdx);
      }
    };
  });
}

function setupCarouselViewer() {
  const wrapper = document.getElementById('carouselImageWrapper');
  if (!wrapper) return;

  wrapper.onpointerdown = (e) => {
    carouselTouchStartX = e.clientX;
    carouselTouchStartY = e.clientY;
  };

  wrapper.onpointerup = (e) => {
    const diffX = carouselTouchStartX - e.clientX;
    const diffY = carouselTouchStartY - e.clientY;
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 35) {
      if (diffX > 0) nextCarouselPhoto();
      else prevCarouselPhoto();
    }
  };
}

function prevCarouselPhoto() {
  if (appState.shotImages.length === 0) return;
  triggerHaptic('light');
  currentCarouselIdx = (currentCarouselIdx - 1 + appState.shotImages.length) % appState.shotImages.length;
  updateCarouselView();
}

function nextCarouselPhoto() {
  if (appState.shotImages.length === 0) return;
  triggerHaptic('light');
  currentCarouselIdx = (currentCarouselIdx + 1) % appState.shotImages.length;
  updateCarouselView();
}

function goToCarouselPhoto(idx) {
  triggerHaptic('light');
  currentCarouselIdx = idx;
  updateCarouselView();
}

function updateCarouselView() {
  if (appState.shotImages.length === 0) return;

  const imgEl = document.getElementById('carouselCurrentImg');
  const badgeEl = document.getElementById('carouselCutBadge');
  const btnText = document.getElementById('btnAssignText');
  const strip = document.getElementById('carouselIndicatorStrip');

  if (imgEl && appState.shotImages[currentCarouselIdx]) {
    imgEl.src = appState.shotImages[currentCarouselIdx].src;
  }
  if (badgeEl) badgeEl.textContent = `#${currentCarouselIdx + 1}번 컷`;
  if (btnText) btnText.textContent = `${appState.activeSlotIndex + 1}번 슬롯에 넣기`;

  if (strip) {
    strip.innerHTML = appState.shotImages.map((img, idx) => {
      const isCurrent = (idx === currentCarouselIdx);
      const isAssigned = appState.selectedIndices.includes(idx);
      const assignedSlot = appState.selectedIndices.indexOf(idx);

      return `
        <button onclick="goToCarouselPhoto(${idx})" class="w-10 h-8 rounded-lg overflow-hidden border-2 relative transition ${isCurrent ? 'border-theme scale-110 shadow-md ring-2 ring-rose-400' : 'border-slate-300 opacity-60'}">
          <img src="${img.src}" class="w-full h-full object-cover pointer-events-none">
          ${isAssigned ? `<div class="absolute inset-0 bg-theme/85 flex items-center justify-center text-white text-[9px] font-black">${assignedSlot + 1}번</div>` : ''}
        </button>
      `;
    }).join('');
  }
}

function assignCurrentCarouselPhoto() {
  if (appState.shotImages.length === 0) return;
  assignPhotoToCurrentSlot(currentCarouselIdx);
}

function selectSlotForAssignment(slotIdx) {
  playBeep(800);
  triggerHaptic('light');
  appState.activeSlotIndex = slotIdx;
  const badge = document.getElementById('currentActiveSlotBadge'); 
  if (badge) badge.textContent = `${slotIdx + 1}번 슬롯 채우는 중`;
  
  const cuts = appState.cutMode || 4;
  for (let i = 0; i < cuts; i++) {
    const el = document.getElementById(`previewSlot${i}`);
    if (el) { 
      if (i === slotIdx) {
        el.className = el.className.replace('border-transparent', 'border-theme ring-2 ring-rose-400');
      } else {
        el.className = el.className.replace('border-theme ring-2 ring-rose-400', 'border-transparent');
      }
    }
  }
  updateCarouselView();
}

function assignPhotoToCurrentSlot(shotIdx) {
  playBeep(950);
  triggerHaptic('medium');
  appState.selectedIndices[appState.activeSlotIndex] = shotIdx; 
  updatePreviewSlots();
  
  const cuts = appState.cutMode || 4;
  const nextEmpty = appState.selectedIndices.indexOf(null);
  if (nextEmpty !== -1) {
    selectSlotForAssignment(nextEmpty);
  } else {
    selectSlotForAssignment((appState.activeSlotIndex + 1) % cuts);
  }

  const nextUnselectedIdx = appState.shotImages.findIndex((_, idx) => !appState.selectedIndices.includes(idx));
  if (nextUnselectedIdx !== -1) {
    currentCarouselIdx = nextUnselectedIdx;
  } else {
    currentCarouselIdx = (currentCarouselIdx + 1) % appState.shotImages.length;
  }

  updateCarouselView();
  refreshPickUI();
}

function updatePreviewSlots() {
  const cuts = appState.cutMode || 4;
  for (let i = 0; i < cuts; i++) {
    const shotIdx = appState.selectedIndices[i]; 
    const slotEl = document.getElementById(`previewSlot${i}`);
    if (slotEl) { 
      if (shotIdx !== null && appState.shotImages[shotIdx]) { 
        slotEl.innerHTML = `<img src="${appState.shotImages[shotIdx].src}" class="w-full h-full object-cover pointer-events-none">`; 
      } else { 
        slotEl.innerHTML = `<span class="text-slate-400 text-xs font-bold">[+] ${i + 1}번</span>`; 
      } 
    }
  }
}

function refreshPickUI() {
  const cuts = appState.cutMode || 4;
  const chosenCount = appState.selectedIndices.filter(idx => idx !== null).length;
  const btn = document.getElementById('btnConfirmPick');
  if (btn) btn.textContent = chosenCount === cuts ? "스튜디오 꾸미기 ➔" : `스튜디오 꾸미기 (${chosenCount}/${cuts})`;
}

function confirmSelectedFour() {
  const cuts = appState.cutMode || 4;
  for (let i = 0; i < cuts; i++) {
    if (appState.selectedIndices[i] === null || !appState.shotImages[appState.selectedIndices[i]]) {
      appState.selectedIndices[i] = (i < appState.shotImages.length) ? i : 0;
    }
  }

  playMotorPrintSound();
  triggerHaptic('medium');

  appState.selectedImages = appState.selectedIndices.map(idx => appState.shotImages[idx]);

  if (!appState.stickers || appState.stickers.length === 0) {
    resetEditorToDefault();
  }
  showScreen('screenEdit');

  requestAnimationFrame(() => {
    renderStrip();
  });

  const layoutRow = document.getElementById('layoutSelectionRow');
  if (layoutRow) {
    if (appState.selectedFormat === 'strip' && cuts === 4) layoutRow.classList.remove('hidden');
    else layoutRow.classList.add('hidden');
  }

  saveSessionStateToStorage();
}

function resetEditorToDefault() {
  appState.stickers = []; 
  appState.selectedStickerIdx = -1; 
  appState.layout = appState.selectedFormat || 'strip'; 
  appState.frameThickness = 60; 
  appState.activeFilter = 'normal';
  appState.filters = { bright: 100, contrast: 100, saturate: 100 };
  appState.typography.fontFamily = 'Pretendard';
  appState.typography.fontColor = (appState.frameColor === '#FFFFFF' || appState.frameColor === '#E2E8F0') ? '#1E293B' : '#FFFFFF';
  appState.typography.fontSize = 54;
  appState.customEngraveText = '';

  const slThick = document.getElementById('sliderThickness'); if (slThick) slThick.value = 60;
  const fineTune = document.getElementById('filterFineTunePanel'); if (fineTune) fineTune.classList.add('hidden');
  const stBar = document.getElementById('stickerControlBar'); if (stBar) stBar.classList.add('hidden');
  const engraveInput = document.getElementById('customEngraveInput'); if (engraveInput) engraveInput.value = '';
  resetCanvasZoom();
  historyStack = []; 
  redoStack = [];

  const dateCheck = document.getElementById('checkShowDate');
  if (dateCheck) {
    dateCheck.checked = true;
    appState.showDate = true;
    initOrUpdateDateSticker(true);
  }
}

function triggerGalleryUpload() { const input = document.getElementById('galleryInput'); if (input) { input.value = ''; input.click(); } }

function compressAndLoadImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 2560;
        let w = img.width, h = img.height;
        if (w > maxDim || h > maxDim) { 
          if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; } 
          else { w = Math.round((w * maxDim) / h); h = maxDim; } 
        }
        const c = document.createElement('canvas'); 
        c.width = w; c.height = h; 
        const ctx = c.getContext('2d'); 
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);
        const downscaledImg = new Image(); 
        downscaledImg.onload = () => resolve(downscaledImg); 
        downscaledImg.src = c.toDataURL('image/jpeg', 0.99);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

async function handleGalleryUpload(e) {
  const files = Array.from(e.target.files); if (files.length === 0) return;
  const loadedImages = await Promise.all(files.map(file => compressAndLoadImage(file)));
  galleryAccumulator.push(...loadedImages);
  if (galleryAccumulator.length >= (appState.cutMode || 4)) {
    document.getElementById('galleryCollectModal').classList.add('hidden');
    appState.shotImages = [...galleryAccumulator]; 
    galleryAccumulator = []; 
    renderPickScreen();
  } else { 
    updateGalleryCollectModal(); 
  }
}

function updateGalleryCollectModal() {
  const modal = document.getElementById('galleryCollectModal'); 
  const title = document.getElementById('collectModalTitle'); 
  const grid = document.getElementById('collectThumbGrid');
  if (!modal || !title || !grid) return;
  title.textContent = `사진 수집 중 ( ${galleryAccumulator.length} / ${appState.cutMode || 4} )`;
  grid.innerHTML = galleryAccumulator.map(img => `<div class="w-12 h-14 rounded-lg overflow-hidden border-2 border-theme shadow-sm"><img src="${img.src}" class="w-full h-full object-cover"></div>`).join('');
  modal.classList.remove('hidden'); 
  modal.style.removeProperty('display');
  modal.style.setProperty('display', 'flex', 'important');
  if (window.lucide) lucide.createIcons();
}

function cancelGalleryCollect() { 
  galleryAccumulator = []; 
  const m = document.getElementById('galleryCollectModal'); 
  if (m) {
    m.classList.add('hidden');
    m.style.setProperty('display', 'none', 'important');
  }
}
// ========================================================
// 11. 🌟 테마 컨트롤러 & B-3 측면 각인 툴바
// ========================================================
function switchThemeCategory(category) {
  if (category !== 'basic' && (!appState.isRegisteredUser || !appState.currentUser)) {
    alert("심플 및 프리미엄 테마는 [정회원 전용] 기능입니다.\n간편 회원가입 또는 로그인 후 이용해 주세요! 🔒");
    openAuthModal('login');
    return;
  }

  appState.themeCategory = category;
  
  ['Basic', 'Simple', 'Premium'].forEach(cat => {
    const tab = document.getElementById('tabTheme' + cat);
    const panel = document.getElementById('themeSubPanel' + cat);
    const isTarget = (cat.toLowerCase() === category);
    if (tab) {
      tab.className = isTarget 
        ? "px-2 py-0.5 rounded-md bg-white text-theme shadow-2xs font-black"
        : "px-2 py-0.5 rounded-md text-slate-500 font-bold";
    }
    if (panel) {
      if (isTarget) panel.classList.remove('hidden');
      else panel.classList.add('hidden');
    }
  });

  if (category === 'basic') {
    setBasicTextPosition('middle', null);
  } else if (category === 'simple') {
    setSimpleOffsetLayout('minimal_line', null);
  } else if (category === 'premium') {
    setPremiumSubTheme('photoist', null);
  }
}

function setBasicTextPosition(pos, btn) {
  appState.frameStyle = pos; 
  document.querySelectorAll('.basic-pos-btn').forEach(b => {
    b.className = "basic-pos-btn p-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-bold";
  });
  if (btn) btn.className = "basic-pos-btn p-1.5 bg-theme text-white border border-theme rounded-lg font-black shadow-2xs text-[9px]";
  renderStrip();
}

function setSimpleOffsetLayout(key, btn) {
  if (!appState.isRegisteredUser) { openAuthModal('login'); return; }
  appState.frameStyle = key; 
  document.querySelectorAll('.simple-theme-btn').forEach(b => {
    b.className = "simple-theme-btn p-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold truncate";
  });
  if (btn) btn.className = "simple-theme-btn p-1.5 bg-theme text-white border border-theme rounded-lg font-black shadow-2xs text-[10px] truncate";
  renderStrip();
}

function setPremiumSubTheme(key, btn) {
  if (!appState.isRegisteredUser) { openAuthModal('login'); return; }
  appState.frameStyle = key; 
  document.querySelectorAll('.premium-theme-btn').forEach(b => {
    b.className = "premium-theme-btn p-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold truncate";
  });
  if (btn) btn.className = "premium-theme-btn p-1.5 bg-theme text-white border border-theme rounded-lg font-black shadow-2xs text-[10px] truncate";
  renderStrip();
}

function onCustomEngraveChange(val) {
  appState.customEngraveText = val;
  renderStrip();
}

function applyDefaultSideEngrave() {
  appState.customEngraveText = "Photography      PhotoBooth      PhotoIst      Studio";
  const input = document.getElementById('customEngraveInput');
  if (input) input.value = appState.customEngraveText;
  renderStrip();
}

function clearSideEngrave() {
  appState.customEngraveText = " ";
  const input = document.getElementById('customEngraveInput');
  if (input) input.value = "";
  renderStrip();
}

function addPropSticker(emoji, size = 100, opacity = 1.0) {
  saveStateForUndo(); 
  const canvas = document.getElementById('photoCanvas');
  const newSticker = { 
    id: Date.now(), 
    type: 'emoji', 
    text: emoji, 
    x: canvas ? canvas.width / 2 : 600, 
    y: canvas ? canvas.height / 2 : 1800, 
    size: size, 
    rotation: 0,
    opacity: opacity
  };
  appState.stickers.push(newSticker); 
  appState.selectedStickerIdx = appState.stickers.length - 1;
  showStickerControls(newSticker); 
  renderStrip();
}

// ========================================================
// 12. 🌟 메인 캔버스 렌더러 (포토이스트 & 하단 각인 삭제)
// ========================================================
function renderStrip(isFinalExport = false) {
  const canvas = document.getElementById('photoCanvas'); 
  if (!canvas) return; 
  const ctx = canvas.getContext('2d');
  
  const cuts = appState.cutMode || 4;

  if (!appState.selectedImages || appState.selectedImages.length < cuts) {
    if (appState.shotImages && appState.shotImages.length >= cuts) {
      appState.selectedImages = appState.shotImages.slice(0, cuts);
    } else if (appState.shotImages && appState.shotImages.length > 0) {
      appState.selectedImages = Array(cuts).fill(null).map((_, i) => appState.shotImages[i % appState.shotImages.length]);
    } else {
      return;
    }
  }

  const layout = appState.layout || 'strip'; 
  const pad = appState.frameThickness || 60; 
  const gap = Math.round(pad * 0.45);
  const fStyle = appState.frameStyle;
  const isDark = (appState.frameColor === '#000000' || appState.frameColor === '#111827' || appState.frameColor === '#18181B' || appState.frameColor === '#111111');

  if (cuts === 4) {
    if (layout === 'strip') { canvas.width = 1200; canvas.height = 3600; }
    else { canvas.width = 1800; canvas.height = 2700; }
  } else if (cuts === 5) {
    if (layout === 'strip') { canvas.width = 1200; canvas.height = 4200; }
    else { canvas.width = 1800; canvas.height = 2700; }
  } else if (cuts === 6) {
    if (layout === 'strip') { canvas.width = 1200; canvas.height = 4800; }
    else { canvas.width = 1800; canvas.height = 2700; }
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (fStyle === 'birthday') ctx.fillStyle = '#FAF7EE';
  else ctx.fillStyle = appState.frameColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (cuts === 4) {
    if (layout === 'strip') renderStrip4Slots(ctx, canvas, pad, gap, fStyle);
    else if (layout === 'twin') renderTwin4Slots(ctx, canvas, pad, gap, fStyle);
    else renderGrid4Slots(ctx, canvas, pad, gap, fStyle);
  } else if (cuts === 5) {
    if (layout === 'strip') renderStrip5Slots(ctx, canvas, pad, gap, fStyle);
    else renderMagazine5Slots(ctx, canvas, pad, gap, fStyle);
  } else if (cuts === 6) {
    if (layout === 'strip') renderStrip6Slots(ctx, canvas, pad, gap, fStyle);
    else renderGrid6Slots(ctx, canvas, pad, gap, fStyle);
  }

  renderThemeOverlayGraphics(ctx, canvas, pad, fStyle, isDark, layout);
  renderStickersAndMirrors(ctx, canvas, layout);
}

function renderStrip4Slots(ctx, canvas, pad, gap, fStyle) {
  let topH = pad; 
  let bottomH = pad; 
  let bannerH = 0;

  if (fStyle === 'top') { topH = 280; bottomH = pad; }
  else if (fStyle === 'bottom') { topH = pad; bottomH = 300; }
  else if (fStyle === 'middle') { bannerH = 260; }
  else if (fStyle === 'dual') { topH = 220; bottomH = 240; }
  else if (fStyle === 'stair') { topH = 160; bottomH = 180; }
  else if (fStyle === 'photoist') { topH = 180; bottomH = pad; }

  const imgW = canvas.width - (pad * 2);
  const imgH = (canvas.height - topH - bottomH - bannerH - (gap * 3)) / 4;

  if (fStyle === 'middle') {
    drawFilteredSlotPhoto(ctx, appState.selectedImages[0], pad, pad, imgW, imgH);
    drawFilteredSlotPhoto(ctx, appState.selectedImages[1], pad, pad + imgH + gap, imgW, imgH);
    const lowerY = pad + (imgH * 2) + (gap * 2) + bannerH + gap;
    drawFilteredSlotPhoto(ctx, appState.selectedImages[2], pad, lowerY, imgW, imgH);
    drawFilteredSlotPhoto(ctx, appState.selectedImages[3], pad, lowerY + imgH + gap, imgW, imgH);
  } else if (fStyle === 'stair') {
    for (let i = 0; i < 4; i++) {
      const offsetX = (i % 2 === 0) ? -35 : 35;
      const slotW = imgW - 70;
      const x = (canvas.width - slotW) / 2 + offsetX;
      const y = topH + (i * (imgH + gap));
      drawFilteredSlotPhoto(ctx, appState.selectedImages[i], x, y, slotW, imgH);
    }
  } else {
    for (let i = 0; i < 4; i++) {
      drawFilteredSlotPhoto(ctx, appState.selectedImages[i], pad, topH + (i * (imgH + gap)), imgW, imgH);
    }
  }
}

function renderGrid4Slots(ctx, canvas, pad, gap, fStyle) {
  let topH = pad; 
  let bottomH = pad; 
  let bannerH = 0;

  if (fStyle === 'top') { topH = 260; bottomH = pad; }
  else if (fStyle === 'bottom') { topH = pad; bottomH = 260; }
  else if (fStyle === 'middle') { bannerH = 200; }
  else if (fStyle === 'dual') { topH = 200; bottomH = 220; }
  else if (fStyle === 'polaroid_wide') { topH = pad * 0.5; bottomH = 340; }
  else if (fStyle === 'minimal_line') { gap = 2; }
  else if (fStyle === 'photoist') { topH = 180; bottomH = pad; }

  const imgW = (canvas.width - (pad * 2) - gap) / 2;
  const imgH = (canvas.height - topH - bottomH - bannerH - gap) / 2;

  if (fStyle === 'middle') {
    drawFilteredSlotPhoto(ctx, appState.selectedImages[0], pad, pad, imgW, imgH);
    drawFilteredSlotPhoto(ctx, appState.selectedImages[1], pad + imgW + gap, pad, imgW, imgH);
    const lowerY = pad + imgH + bannerH;
    drawFilteredSlotPhoto(ctx, appState.selectedImages[2], pad, lowerY, imgW, imgH);
    drawFilteredSlotPhoto(ctx, appState.selectedImages[3], pad + imgW + gap, lowerY, imgW, imgH);
  } else {
    drawFilteredSlotPhoto(ctx, appState.selectedImages[0], pad, topH, imgW, imgH);
    drawFilteredSlotPhoto(ctx, appState.selectedImages[1], pad + imgW + gap, topH, imgW, imgH);
    drawFilteredSlotPhoto(ctx, appState.selectedImages[2], pad, topH + imgH + gap, imgW, imgH);
    drawFilteredSlotPhoto(ctx, appState.selectedImages[3], pad + imgW + gap, topH + imgH + gap, imgW, imgH);
  }
}

function renderTwin4Slots(ctx, canvas, pad, gap, fStyle) {
  const stripW = (canvas.width / 2) - 30;
  const padX = pad * 0.65;
  const imgW = stripW - (padX * 2);
  const topH = 160; const bottomH = 200;
  const imgH = (canvas.height - topH - bottomH - (gap * 3)) / 4;

  [15, canvas.width / 2 + 15].forEach(baseX => {
    for (let i = 0; i < 4; i++) {
      drawFilteredSlotPhoto(ctx, appState.selectedImages[i], baseX + padX, topH + (i * (imgH + gap)), imgW, imgH);
    }
  });

  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 3;
  ctx.setLineDash([12, 12]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 30);
  ctx.lineTo(canvas.width / 2, canvas.height - 30);
  ctx.stroke();
  ctx.font = '28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('✂️', canvas.width / 2, 90);
  ctx.fillText('✂️', canvas.width / 2, canvas.height / 2);
  ctx.fillText('✂️', canvas.width / 2, canvas.height - 90);
  ctx.restore();
}

function renderMagazine5Slots(ctx, canvas, pad, gap, fStyle) {
  const topH = 180;
  const bottomH = 200;
  const availH = canvas.height - topH - bottomH - (gap * 2);
  const smallH = availH * 0.28;
  const bigH = availH * 0.44;
  const halfW = (canvas.width - (pad * 2) - gap) / 2;
  const fullW = canvas.width - (pad * 2);

  drawFilteredSlotPhoto(ctx, appState.selectedImages[0], pad, topH, halfW, smallH);
  drawFilteredSlotPhoto(ctx, appState.selectedImages[1], pad + halfW + gap, topH, halfW, smallH);

  const midY = topH + smallH + gap;
  drawFilteredSlotPhoto(ctx, appState.selectedImages[2], pad, midY, fullW, bigH);

  const botY = midY + bigH + gap;
  drawFilteredSlotPhoto(ctx, appState.selectedImages[3], pad, botY, halfW, smallH);
  drawFilteredSlotPhoto(ctx, appState.selectedImages[4], pad + halfW + gap, botY, halfW, smallH);
}

function renderStrip5Slots(ctx, canvas, pad, gap, fStyle) {
  const topH = 180; const bottomH = 220;
  const imgW = canvas.width - (pad * 2);
  const imgH = (canvas.height - topH - bottomH - (gap * 4)) / 5;
  for (let i = 0; i < 5; i++) {
    drawFilteredSlotPhoto(ctx, appState.selectedImages[i], pad, topH + (i * (imgH + gap)), imgW, imgH);
  }
}

function renderGrid6Slots(ctx, canvas, pad, gap, fStyle) {
  const topH = 180; const bottomH = 200;
  const imgW = (canvas.width - (pad * 2) - gap) / 2;
  const imgH = (canvas.height - topH - bottomH - (gap * 2)) / 3;

  for (let row = 0; row < 3; row++) {
    const y = topH + (row * (imgH + gap));
    drawFilteredSlotPhoto(ctx, appState.selectedImages[row * 2], pad, y, imgW, imgH);
    drawFilteredSlotPhoto(ctx, appState.selectedImages[row * 2 + 1], pad + imgW + gap, y, imgW, imgH);
  }
}

function renderStrip6Slots(ctx, canvas, pad, gap, fStyle) {
  const topH = 180; const bottomH = 220;
  const imgW = canvas.width - (pad * 2);
  const imgH = (canvas.height - topH - bottomH - (gap * 5)) / 6;
  for (let i = 0; i < 6; i++) {
    drawFilteredSlotPhoto(ctx, appState.selectedImages[i], pad, topH + (i * (imgH + gap)), imgW, imgH);
  }
}

function renderThemeOverlayGraphics(ctx, canvas, pad, fStyle, isDark, layout) {
  ctx.save();

  const adaptiveFontSize = Math.max(32, Math.min(64, Math.round(pad * 0.65)));
  const sideEngraveText = (appState.customEngraveText !== undefined && appState.customEngraveText !== "")
    ? appState.customEngraveText
    : "Photography      PhotoBooth      PhotoIst      Studio";

  const textColor = isDark ? '#FFFFFF' : '#0F172A';

  if (fStyle === 'photoist') {
    ctx.fillStyle = textColor;
    ctx.font = "700 58px 'Playfair Display', serif";
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText("photoist", pad, 95);

    const cuts = appState.cutMode || 4;
    const topH = 180; const bottomH = pad;
    const stepH = (canvas.height - topH - bottomH) / cuts;

    for (let i = 0; i < cuts; i++) {
      const centerY = topH + (i * stepH) + (stepH / 2);
      ctx.fillStyle = textColor;
      ctx.font = `bold ${Math.round(adaptiveFontSize * 1.1)}px monospace`; 
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("▲", pad / 2, centerY);
    }
  }
  else if (fStyle === 'birthday') {
    ctx.fillStyle = '#E11D48';
    ctx.font = "900 68px 'Playfair Display', serif";
    ctx.textAlign = 'left';
    ctx.fillText("Happy Birthday ♡", pad, 95);

    ctx.fillStyle = '#9F1239';
    ctx.font = "bold 22px 'Pretendard', sans-serif";
    ctx.fillText("오늘은 너라는 기적이 태어난 날! 🎂", pad, 142);

    ctx.font = "36px sans-serif";
    ctx.fillText("🎀", canvas.width - pad - 60, 105);
  }
  else if (fStyle === 'baseball') {
    ctx.fillStyle = '#1E3A8A';
    ctx.font = "900 64px 'Black Han Sans', sans-serif";
    ctx.textAlign = 'left';
    ctx.fillText("⚾ PLAY BASEBALL!", pad, 95);

    ctx.fillStyle = '#DC2626';
    ctx.font = "bold 22px 'Pretendard', sans-serif";
    ctx.fillText("오늘도, 우리는 야구를 한다! ★", pad, 142);

    ctx.font = "38px sans-serif";
    ctx.fillText("⚾", canvas.width - pad - 60, 100);
  }

  if (sideEngraveText.trim().length > 0 && fStyle !== 'birthday') {
    ctx.save();
    ctx.translate(canvas.width - (pad / 2), canvas.height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)';
    ctx.font = `bold ${adaptiveFontSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = "3px";
    ctx.fillText(sideEngraveText, 0, 0);
    ctx.restore();
  }

  ctx.restore();
}

function drawFilteredSlotPhoto(ctx, img, targetX, targetY, targetW, targetH) {
  ctx.save();
  ctx.fillStyle = '#E2E8F0';
  ctx.fillRect(targetX, targetY, targetW, targetH);

  if (!img || !img.src) {
    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('사진 불러오는 중...', targetX + targetW / 2, targetY + targetH / 2);
    ctx.restore();
    return;
  }

  ctx.beginPath(); 
  ctx.rect(targetX, targetY, targetW, targetH); 
  ctx.clip();

  const srcRatio = (img.width || 1920) / (img.height || 1080); 
  const targetRatio = targetW / targetH; 
  let renderW, renderH;

  if (srcRatio > targetRatio) { renderH = targetH; renderW = targetH * srcRatio; } 
  else { renderW = targetW; renderH = targetW / srcRatio; }

  const drawX = targetX + (targetW - renderW) / 2; 
  const drawY = targetY + (targetH - renderH) / 2;
  const isNormal = appState.activeFilter === 'normal' && appState.filters.bright === 100 && appState.filters.contrast === 100 && appState.filters.saturate === 100;

  if (isNormal) { 
    ctx.drawImage(img, drawX, drawY, renderW, renderH); 
  } else {
    try {
      const off = document.createElement('canvas'); 
      const cw = Math.max(1, Math.round(renderW)); 
      const ch = Math.max(1, Math.round(renderH)); 
      off.width = cw; off.height = ch;
      const offCtx = off.getContext('2d'); 
      offCtx.imageSmoothingEnabled = true;
      offCtx.imageSmoothingQuality = 'high';
      offCtx.drawImage(img, 0, 0, cw, ch); 
      const imgData = offCtx.getImageData(0, 0, cw, ch); 
      applyPixelFilterMath(imgData, appState.activeFilter, appState.filters); 
      offCtx.putImageData(imgData, 0, 0); 
      ctx.drawImage(off, drawX, drawY, renderW, renderH); 
    } catch (err) { 
      ctx.drawImage(img, drawX, drawY, renderW, renderH); 
    }
  }
  ctx.restore();
}

function applyPixelFilterMath(imageData, filterKey, customAdjust) {
  const d = imageData.data; 
  const len = d.length; 
  const bMul = customAdjust.bright / 100; 
  const cFactor = ((customAdjust.contrast - 100) * 2.55) / 255 + 1; 
  const sMul = customAdjust.saturate / 100;

  for (let i = 0; i < len; i += 4) {
    let r = d[i], g = d[i+1], b = d[i+2];

    if (filterKey === 'harublue') { r = r * 0.94; g = g * 1.05 + 6; b = b * 1.20 + 16; }
    else if (filterKey === 'deepmono') { const gray = 0.299 * r + 0.587 * g + 0.114 * b; r = g = b = gray; }
    else if (filterKey === 'y2kcyber') { r = r * 0.90; g = g * 1.08 + 10; b = b * 1.02 + 5; }
    else if (filterKey === 'peachglow') { r = r * 1.15 + 14; g = g * 1.04 + 6; b = b * 0.92; }
    else if (filterKey === 'naturalgloss') { r = r * 1.12 + 10; g = g * 1.10 + 8; b = b * 1.12 + 10; }
    else if (filterKey === 'bright') { r = r*1.1+10; g = g*1.08+8; b = b*1.05+6; }
    else if (filterKey === 'radiant') { r = r*1.12+15; g = g*1.1+12; b = b*1.15+15; }
    else if (filterKey === 'warm') { r = r*1.12+12; g = g*1.05+6; b = b*0.92; }
    else if (filterKey === 'cool') { r = r*0.92; g = g*1.02+4; b = b*1.15+12; }
    else if (filterKey === 'mood') { r = r*1.06+8; g = g*0.98; b = b*0.92+5; }
    else if (filterKey === 'retro') { r = r*1.08+15; g = g*0.95+8; b = b*0.82+12; }
    else if (filterKey === 'mono') { const gray = 0.299*r + 0.587*g + 0.114*b; r = g = b = gray; }
    else if (filterKey === 'sunset') { r = r*1.18+15; g = g*1.02+5; b = b*0.85; }
    else if (filterKey === 'pink') { r = r*1.15+12; g = g*0.95; b = b*1.1+10; }

    r *= bMul; g *= bMul; b *= bMul; 
    r = ((r / 255 - 0.5) * cFactor + 0.5) * 255; 
    g = ((g / 255 - 0.5) * cFactor + 0.5) * 255; 
    b = ((b / 255 - 0.5) * cFactor + 0.5) * 255;

    if (sMul !== 1 && filterKey !== 'mono' && filterKey !== 'deepmono') { 
      const lum = 0.299*r + 0.587*g + 0.114*b; 
      r = lum + (r - lum)*sMul; g = lum + (g - lum)*sMul; b = lum + (g - lum)*sMul; 
    }
    d[i] = Math.min(255, Math.max(0, r)); 
    d[i+1] = Math.min(255, Math.max(0, g)); 
    d[i+2] = Math.min(255, Math.max(0, b));
  }
}

function renderStickersAndMirrors(ctx, canvas, layout) {
  const isTwin = (layout === 'twin');
  const mirrorOffsetX = canvas.width / 2;

  appState.stickers.forEach((st) => {
    drawSingleSticker(ctx, st);
    if (isTwin) {
      const mirrored = { ...st, x: st.x + mirrorOffsetX };
      drawSingleSticker(ctx, mirrored);
    }
  });
}

function drawSingleSticker(ctx, st) {
  ctx.save();
  ctx.translate(st.x, st.y);
  ctx.rotate(((st.rotation || 0) * Math.PI) / 180);
  if (st.opacity !== undefined) {
    ctx.globalAlpha = st.opacity;
  }

  if (st.type === 'text') {
    const fontName = st.fontFamily || 'Pretendard'; 
    ctx.font = `900 ${st.size}px '${fontName}', sans-serif`; 
    ctx.fillStyle = st.color || '#FFFFFF'; 
    ctx.shadowColor = 'rgba(0,0,0,0.85)'; 
    ctx.shadowBlur = 10; 
    ctx.textAlign = 'center'; 
    ctx.textBaseline = 'middle'; 
    ctx.fillText(st.text, 0, 0);
  } else {
    ctx.font = `${st.size}px sans-serif`; 
    ctx.textAlign = 'center'; 
    ctx.textBaseline = 'middle'; 
    ctx.fillText(st.text, 0, 0);
  }
  ctx.restore();
}

// ========================================================
// 13. 날짜 오브젝트 시스템
// ========================================================
function toggleDateObject(checked) {
  saveStateForUndo();
  appState.showDate = checked;
  initOrUpdateDateSticker(checked);
  renderStrip();
}

function initOrUpdateDateSticker(show) {
  const canvas = document.getElementById('photoCanvas');
  const existingIdx = appState.stickers.findIndex(s => s.isDate === true);

  if (show) {
    if (existingIdx === -1) {
      const newDateSticker = {
        id: 'date_obj_' + Date.now(),
        type: 'text',
        isDate: true,
        text: appState.typography.date,
        x: canvas && canvas.width ? canvas.width / 2 : 600,
        y: canvas && canvas.height ? (appState.selectedFormat === 'strip' ? canvas.height - 120 : canvas.height - 100) : 3480,
        size: 38,
        rotation: 0,
        color: (appState.frameColor === '#FFFFFF' || appState.frameColor === '#E2E8F0') ? '#1E293B' : '#FFFFFF',
        fontFamily: 'Pretendard'
      };
      appState.stickers.push(newDateSticker);
    }
  } else if (existingIdx !== -1) {
    appState.stickers.splice(existingIdx, 1);
    if (appState.selectedStickerIdx === existingIdx) {
      appState.selectedStickerIdx = -1;
      const bar = document.getElementById('stickerControlBar');
      if (bar) bar.classList.add('hidden');
    }
  }
}

// ========================================================
// 14. 2단계 돋보기 & 자석 스냅 인터랙션
// ========================================================
function updateFloatingLoupe(touchX, touchY, canvasCoordX, canvasCoordY, isDragging) {
  const loupe = document.getElementById('floatingLoupe');
  const lCanvas = document.getElementById('loupeCanvas');
  const mainCanvas = document.getElementById('photoCanvas');
  if (!loupe || !lCanvas || !mainCanvas) return;

  loupe.style.left = `${touchX}px`;
  loupe.style.top = `${touchY}px`;
  loupe.classList.remove('hidden');

  const loupeW = 140; const loupeH = 140;
  lCanvas.width = loupeW;
  lCanvas.height = loupeH;
  const lCtx = lCanvas.getContext('2d');
  lCtx.imageSmoothingEnabled = true;
  lCtx.imageSmoothingQuality = 'high';
  lCtx.clearRect(0, 0, loupeW, loupeH);

  if (!isDragging) {
    const cropSize = 80;
    lCtx.drawImage(
      mainCanvas,
      canvasCoordX - cropSize / 2,
      canvasCoordY - cropSize / 2,
      cropSize,
      cropSize,
      0,
      0,
      loupeW,
      loupeH
    );
    lCtx.strokeStyle = 'rgba(244, 63, 94, 0.85)';
    lCtx.lineWidth = 1.5;
    lCtx.beginPath();
    lCtx.moveTo(70, 50); lCtx.lineTo(70, 90);
    lCtx.moveTo(50, 70); lCtx.lineTo(90, 70);
    lCtx.stroke();
  } 
  else if (appState.selectedStickerIdx >= 0) {
    const st = appState.stickers[appState.selectedStickerIdx];
    lCtx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    lCtx.fillRect(0, 0, loupeW, loupeH);

    const safeZoneSize = 100;
    let approxWidth = st.size;
    if (st.type === 'text') {
      approxWidth = Math.max(st.size, (st.text ? st.text.length : 1) * (st.size * 0.65));
    }
    const maxBound = Math.max(approxWidth, st.size);
    const autoScale = safeZoneSize / Math.max(safeZoneSize, maxBound);

    lCtx.save();
    lCtx.translate(70, 70);
    lCtx.rotate(((st.rotation || 0) * Math.PI) / 180);
    lCtx.scale(autoScale, autoScale);

    if (st.type === 'text') {
      lCtx.font = `900 ${st.size}px '${st.fontFamily || 'Pretendard'}', sans-serif`;
      lCtx.fillStyle = st.color || '#1E293B';
      lCtx.textAlign = 'center';
      lCtx.textBaseline = 'middle';
      lCtx.fillText(st.text, 0, 0);
    } else {
      lCtx.font = `${st.size}px sans-serif`;
      lCtx.textAlign = 'center';
      lCtx.textBaseline = 'middle';
      lCtx.fillText(st.text, 0, 0);
    }
    lCtx.restore();
  }
}

function hideFloatingLoupe() {
  const loupe = document.getElementById('floatingLoupe');
  if (loupe) loupe.classList.add('hidden');
}

function initCanvasInteractions() {
  const canvas = document.getElementById('photoCanvas');
  const viewport = document.getElementById('canvasViewport');
  const guideX = document.getElementById('magneticGuideX');
  const guideY = document.getElementById('magneticGuideY');
  if (!canvas || !viewport) return;

  let initialStickerDist = 0;
  let initialStickerAngle = 0;
  let baseStickerSize = 65;
  let baseStickerRotation = 0;
  let dragStartCoord = { x: 0, y: 0 };

  function getCoords(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      clientX, clientY,
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function handleStart(e) {
    if (e.touches && e.touches.length === 2 && appState.selectedStickerIdx !== -1) {
      e.preventDefault();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      initialStickerDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      initialStickerAngle = Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * 180 / Math.PI;
      const st = appState.stickers[appState.selectedStickerIdx];
      baseStickerSize = st.size;
      baseStickerRotation = st.rotation || 0;
      return;
    }

    const touch = e.touches ? e.touches[0] : e;
    const c = getCoords(touch.clientX, touch.clientY);
    let hitSticker = false;

    for (let i = appState.stickers.length - 1; i >= 0; i--) {
      const st = appState.stickers[i];
      const dist = Math.hypot(c.x - st.x, c.y - st.y);
      if (dist <= Math.max(90, st.size * 1.2)) {
        appState.selectedStickerIdx = i;
        appState.dragTarget = i;
        appState.dragStartPos = { x: c.x - st.x, y: c.y - st.y };
        dragStartCoord = { x: touch.clientX, y: touch.clientY };
        appState.isDraggingSticker = false;

        showStickerControls(st);
        renderStrip();
        hitSticker = true;
        updateFloatingLoupe(touch.clientX, touch.clientY, c.x, c.y, false);
        break;
      }
    }

    if (!hitSticker) {
      isPanning = true;
      panStartX = touch.clientX - canvasPanX;
      panStartY = touch.clientY - canvasPanY;
      appState.selectedStickerIdx = -1;
      appState.dragTarget = null;
      hideFloatingLoupe();
      if (guideX) guideX.classList.add('hidden');
      if (guideY) guideY.classList.add('hidden');
      const bar = document.getElementById('stickerControlBar'); 
      if (bar) bar.classList.add('hidden');
      renderStrip();
    }
  }

  function handleMove(e) {
    if (e.touches && e.touches.length === 2 && appState.selectedStickerIdx !== -1 && initialStickerDist > 0) {
      e.preventDefault();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const curDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const curAngle = Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * 180 / Math.PI;

      const scaleFactor = curDist / initialStickerDist;
      const angleDiff = curAngle - initialStickerAngle;
      const st = appState.stickers[appState.selectedStickerIdx];
      st.size = Math.max(25, Math.min(320, Math.round(baseStickerSize * scaleFactor)));
      
      let newRot = Math.round((baseStickerRotation + angleDiff) % 180);
      st.rotation = newRot;
      
      showStickerControls(st);
      renderStrip();
      return;
    }

    const touch = e.touches ? e.touches[0] : e;
    const c = getCoords(touch.clientX, touch.clientY);

    if (appState.dragTarget !== null) {
      if (e.cancelable) e.preventDefault();
      const st = appState.stickers[appState.dragTarget];
      
      let targetX = c.x - appState.dragStartPos.x;
      let targetY = c.y - appState.dragStartPos.y;

      const snapThreshold = 35;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      if (Math.abs(targetX - centerX) < snapThreshold) {
        targetX = centerX;
        if (guideY) {
          guideY.classList.remove('hidden');
          guideY.style.left = '50%';
        }
        triggerHaptic('light');
      } else {
        if (guideY) guideY.classList.add('hidden');
      }

      if (Math.abs(targetY - centerY) < snapThreshold) {
        targetY = centerY;
        if (guideX) {
          guideX.classList.remove('hidden');
          guideX.style.top = '50%';
        }
        triggerHaptic('light');
      } else {
        if (guideX) guideX.classList.add('hidden');
      }

      st.x = targetX;
      st.y = targetY;

      const moveDist = Math.hypot(touch.clientX - dragStartCoord.x, touch.clientY - dragStartCoord.y);
      if (moveDist > 6) {
        appState.isDraggingSticker = true;
      }

      renderStrip();
      updateFloatingLoupe(touch.clientX, touch.clientY, st.x, st.y, appState.isDraggingSticker);
    } else if (isPanning) {
      if (e.cancelable) e.preventDefault();
      canvasPanX = touch.clientX - panStartX;
      canvasPanY = touch.clientY - panStartY;
      applyZoomTransform();
    }
  }

  function handleEnd() { 
    if (appState.dragTarget !== null) saveStateForUndo(); 
    appState.dragTarget = null; 
    isPanning = false;
    initialStickerDist = 0;
    appState.isDraggingSticker = false;
    hideFloatingLoupe();
    if (guideX) guideX.classList.add('hidden');
    if (guideY) guideY.classList.add('hidden');
  }

  viewport.addEventListener('mousedown', handleStart); 
  window.addEventListener('mousemove', handleMove); 
  window.addEventListener('mouseup', handleEnd);
  viewport.addEventListener('touchstart', handleStart, { passive: false }); 
  window.addEventListener('touchmove', handleMove, { passive: false }); 
  window.addEventListener('touchend', handleEnd);
}

function onSelectedStickerRotate(deg) {
  if (appState.selectedStickerIdx >= 0 && appState.selectedStickerIdx < appState.stickers.length) {
    const val = parseInt(deg);
    appState.stickers[appState.selectedStickerIdx].rotation = val;
    const lbl = document.getElementById('stickerRotateValueLabel');
    if (lbl) lbl.textContent = `${val}°`;
    renderStrip();
  }
}

function onSelectedStickerResize(size) {
  if (appState.selectedStickerIdx >= 0 && appState.selectedStickerIdx < appState.stickers.length) {
    appState.stickers[appState.selectedStickerIdx].size = Math.round(parseInt(size) * 1.5);
    renderStrip();
  }
}

function onSelectedStickerColorChange(color) {
  if (appState.selectedStickerIdx >= 0 && appState.selectedStickerIdx < appState.stickers.length) {
    saveStateForUndo();
    appState.stickers[appState.selectedStickerIdx].color = color;
    renderStrip();
  }
}

function onSelectedStickerFontChange(fontName) {
  if (appState.selectedStickerIdx >= 0 && appState.selectedStickerIdx < appState.stickers.length) {
    saveStateForUndo();
    appState.stickers[appState.selectedStickerIdx].fontFamily = fontName;
    renderStrip();
  }
}

function deleteSelectedSticker() {
  if (appState.selectedStickerIdx >= 0) {
    saveStateForUndo();
    appState.stickers.splice(appState.selectedStickerIdx, 1);
    appState.selectedStickerIdx = -1;
    hideFloatingLoupe();
    const bar = document.getElementById('stickerControlBar');
    if (bar) bar.classList.add('hidden');
    renderStrip();
  }
}

function addDirectTextSticker() {
  const input = document.getElementById('directTextInput');
  if (!input) return;
  const val = input.value.trim();
  if (!val) { alert("추가할 문구를 입력해주세요!"); return; }
  addTextSticker(val);
  input.value = '';
}

function addTextSticker(text) {
  saveStateForUndo(); 
  const canvas = document.getElementById('photoCanvas');
  const newSticker = { 
    id: Date.now(), type: 'text', text, 
    x: canvas ? canvas.width / 2 : 600, 
    y: canvas ? canvas.height / 2 : 1800, 
    size: 70, rotation: 0, color: '#FFFFFF', 
    fontFamily: appState.typography.fontFamily || 'Pretendard' 
  };
  appState.stickers.push(newSticker); 
  appState.selectedStickerIdx = appState.stickers.length - 1;
  showStickerControls(newSticker); 
  renderStrip();
}

function clearAllStickers() { 
  saveStateForUndo(); 
  appState.stickers = []; 
  appState.selectedStickerIdx = -1; 
  hideFloatingLoupe();
  const bar = document.getElementById('stickerControlBar'); 
  if (bar) bar.classList.add('hidden'); 
  renderStrip(); 
}

function showStickerControls(st) {
  const bar = document.getElementById('stickerControlBar'); 
  if (!bar) return;
  bar.classList.remove('hidden');
  const sizeS = document.getElementById('stickerSizeSlider'); 
  if (sizeS) sizeS.value = Math.round(st.size / 1.5);
  
  const rotS = document.getElementById('stickerRotateSlider'); 
  const rotLbl = document.getElementById('stickerRotateValueLabel');
  if (rotS) rotS.value = st.rotation || 0;
  if (rotLbl) rotLbl.textContent = `${st.rotation || 0}°`;

  const customRow = document.getElementById('stickerTextCustomRow');
  if (st.type === 'text') { 
    if (customRow) customRow.classList.remove('hidden'); 
    const cp = document.getElementById('stickerColorPicker'); if (cp) cp.value = st.color || '#FFFFFF'; 
    const fs = document.getElementById('stickerFontSelect'); if (fs) fs.value = st.fontFamily || 'Pretendard'; 
  } else { 
    if (customRow) customRow.classList.add('hidden'); 
  }
}

function zoomCanvas(amount) {
  canvasZoom = Math.max(0.4, Math.min(3.0, canvasZoom + amount));
  applyZoomTransform();
}

function resetCanvasZoom() {
  canvasZoom = 1.0;
  canvasPanX = 0;
  canvasPanY = 0;
  applyZoomTransform();
}

function applyZoomTransform() {
  const wrapper = document.getElementById('canvasScaleWrapper');
  if (wrapper) {
    wrapper.style.transform = `translate(${canvasPanX}px, ${canvasPanY}px) scale(${canvasZoom})`;
  }
  const label = document.getElementById('canvasZoomLabel');
  if (label) label.textContent = Math.round(canvasZoom * 100) + '%';
}

function setupCanvasPinchZoom() {
  const viewport = document.getElementById('canvasViewport');
  if (!viewport) return;

  let initialPinchDist = 0;
  let initialZoom = 1.0;

  viewport.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2 && appState.selectedStickerIdx === -1) {
      e.preventDefault();
      initialPinchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialZoom = canvasZoom;
    }
  }, { passive: false });

  viewport.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && appState.selectedStickerIdx === -1 && initialPinchDist > 0) {
      e.preventDefault();
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = currentDist / initialPinchDist;
      canvasZoom = Math.max(0.4, Math.min(3.0, initialZoom * factor));
      applyZoomTransform();
    }
  }, { passive: false });

  viewport.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) initialPinchDist = 0;
  });
}

// ========================================================
// 15. 가변 스플릿 리사이저 바
// ========================================================
function initSplitResizer() {
  const resizer = document.getElementById('editorSplitResizer');
  const canvasPane = document.getElementById('editorCanvasPane');
  const controlPane = document.getElementById('editorControlPane');
  const container = document.getElementById('screenEdit');
  if (!resizer || !canvasPane || !controlPane || !container) return;

  let isResizing = false;

  function onPointerDown(e) {
    isResizing = true;
    document.body.style.cursor = window.innerWidth >= 640 ? 'col-resize' : 'row-resize';
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!isResizing) return;
    const isLandscape = window.innerWidth >= 640 && window.innerWidth > window.innerHeight;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    if (isLandscape) {
      const containerRect = container.getBoundingClientRect();
      const offset = clientX - containerRect.left;
      const pct = Math.max(35, Math.min(75, (offset / containerRect.width) * 100));
      canvasPane.style.width = `${pct}%`;
      controlPane.style.width = `${100 - pct}%`;
    } else {
      const containerRect = container.getBoundingClientRect();
      const offset = clientY - containerRect.top;
      const pct = Math.max(35, Math.min(75, (offset / containerRect.height) * 100));
      canvasPane.style.height = `${pct}%`;
      controlPane.style.height = `${100 - pct}%`;
    }
  }

  function onPointerUp() {
    if (isResizing) {
      isResizing = false;
      document.body.style.cursor = '';
    }
  }

  resizer.addEventListener('mousedown', onPointerDown);
  resizer.addEventListener('touchstart', onPointerDown, { passive: false });
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('touchmove', onPointerMove, { passive: false });
  window.addEventListener('mouseup', onPointerUp);
  window.addEventListener('touchend', onPointerUp);
}

// ========================================================
// 16. 2중 큐 무소음 자동 아카이빙 & [⭐ 추억네컷 찜] 영구 보존
// ========================================================
async function autoArchiveToCloudQuietly(canvas, isFav = false) {
  if (!canvas) return;

  try {
    const base64Img = canvas.toDataURL('image/png', 0.92);
    const photoId = "photo_" + Date.now();
    appState.currentPhotoId = photoId;

    const localEntry = {
      id: photoId,
      fileUrl: base64Img,
      date: getFormattedTodayDate(),
      isFavorite: isFav
    };

    let localArchive = JSON.parse(localStorage.getItem('chueok_local_gallery') || '[]');
    if (!isFav) {
      const normalPhotos = localArchive.filter(p => !p.isFavorite);
      if (normalPhotos.length >= MAX_GALLERY_SLOTS) {
        const oldestNormal = normalPhotos[normalPhotos.length - 1];
        localArchive = localArchive.filter(p => p.id !== oldestNormal.id);
      }
    }
    localArchive.unshift(localEntry);
    localStorage.setItem('chueok_local_gallery', JSON.stringify(localArchive));

    if (appState.isRegisteredUser && appState.currentUser) {
      fetch(GOOGLE_DB_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'SAVE_TO_GALLERY',
          userId: appState.currentUser.userId,
          base64Data: extractPureBase64(base64Img),
          isFavorite: isFav
        })
      }).catch(() => {});
    }
  } catch (e) {}
}

async function toggleFavoriteStrip() {
  playBeep(950);
  triggerHaptic('medium');

  appState.isCurrentFavorite = !appState.isCurrentFavorite;
  updateFavoriteButtonUI();

  renderStrip(true);
  const canvas = document.getElementById('photoCanvas');
  if (!canvas) return;

  if (appState.isCurrentFavorite) {
    alert("⭐ 이 사진이 [추억네컷 찜]에 등록되었습니다!\n최근 히스토리 10장 FIFO 자동 삭제에서 영구 제외되어 안전하게 보관됩니다.");
    autoArchiveToCloudQuietly(canvas, true);
  } else {
    alert("찜이 해제되었습니다. (일반 최근 히스토리 목록으로 관리됩니다)");
    if (appState.currentPhotoId) {
      let localArchive = JSON.parse(localStorage.getItem('chueok_local_gallery') || '[]');
      const target = localArchive.find(p => p.id === appState.currentPhotoId);
      if (target) {
        target.isFavorite = false;
        localStorage.setItem('chueok_local_gallery', JSON.stringify(localArchive));
      }
    }
  }
}

function updateFavoriteButtonUI() {
  const btn = document.getElementById('btnFavoriteStrip');
  const label = document.getElementById('btnFavoriteText');
  if (!btn || !label) return;

  if (appState.isCurrentFavorite) {
    btn.className = "bg-amber-500 hover:bg-amber-600 text-white font-black py-2.5 rounded-xl text-[9px] flex flex-col items-center justify-center space-y-0.5 shadow active:scale-95 transition ring-2 ring-white";
    label.textContent = "⭐ 찜 완료";
  } else {
    btn.className = "bg-rose-500 hover:bg-rose-600 text-white font-black py-2.5 rounded-xl text-[9px] flex flex-col items-center justify-center space-y-0.5 shadow active:scale-95 transition";
    label.textContent = "추억네컷 찜";
  }
}

// ========================================================
// 17. 15Mbps 무빙 비디오 & QR 다운로드
// ========================================================
async function generateFourCutVideo() {
  if (!appState.isRegisteredUser) {
    alert("15Mbps 초고화질 무빙 비디오 생성은 [정회원 전용] 기능입니다. 로그인 후 이용해 주세요! 🎬");
    openAuthModal('login');
    return;
  }

  const cuts = appState.cutMode || 4;
  const hasValidVideo = appState.selectedIndices.every(idx => idx !== null && appState.shotVideoBlobs[idx]);
  if (!hasValidVideo) {
    alert("촬영 영상 데이터가 부족합니다. 부스에서 컷들을 연속 촬영했을 때 가능합니다.");
    return;
  }

  const btn = document.getElementById('btnAutoVideo'); 
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i><span>합성 중</span>`;
  }
  if (window.lucide) lucide.createIcons();

  try {
    const videoElements = await Promise.all(appState.selectedIndices.map(shotIdx => {
      return new Promise((resolve) => {
        const blob = appState.shotVideoBlobs[shotIdx]; 
        const v = document.createElement('video'); 
        v.src = URL.createObjectURL(blob); 
        v.muted = true; v.loop = true; v.setAttribute('playsinline', ''); 
        v.onloadedmetadata = () => { v.play().then(() => resolve(v)).catch(() => resolve(v)); };
      });
    }));

    const vCanvas = document.createElement('canvas'); 
    if (appState.selectedFormat === 'grid') {
      vCanvas.width = 1440; 
      vCanvas.height = 2160;
    } else {
      vCanvas.width = 1080; 
      vCanvas.height = 3240;
    }

    const vCtx = vCanvas.getContext('2d');
    vCtx.imageSmoothingEnabled = true;
    vCtx.imageSmoothingQuality = 'high';

    let mimeType = 'video/mp4'; 
    if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported('video/mp4')) { 
      mimeType = (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) ? 'video/webm;codecs=vp8' : 'video/webm'; 
    }

    const stream = vCanvas.captureStream(60); 
    const recorder = new MediaRecorder(stream, { 
      mimeType,
      videoBitsPerSecond: 15000000
    }); 
    const chunks = []; 
    recorder.ondataavailable = e => { if (e.data && e.data.size > 0) chunks.push(e.data); };

    recorder.onstop = async () => {
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm'; 
      const blob = new Blob(chunks, { type: mimeType }); 
      currentGeneratedVideoBlob = blob;
      currentGeneratedVideoFileName = `[포토이스트]_Video_${Date.now()}.${ext}`;

      openVideoResultModal(blob);

      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i data-lucide="video" class="w-3.5 h-3.5"></i><span>4컷 비디오</span>`;
      }
      if (window.lucide) lucide.createIcons();

      const reader = new FileReader();
      reader.onloadend = () => {
        const pureBase64 = extractPureBase64(reader.result);
        uploadMediaToGoogleDrive(pureBase64, 'video', currentGeneratedVideoFileName, mimeType).catch(() => {});
      };
      reader.readAsDataURL(blob);
    };
    recorder.start();

    const posterCanvas = document.getElementById('photoCanvas');
    const startTime = performance.now(); 
    const totalDuration = 6000;
    const isGrid = (appState.selectedFormat === 'grid');
    const pad = Math.round(appState.frameThickness * 0.9);
    const gap = Math.round(pad * 0.45);
    const topH = 160; const bottomH = 180;

    function renderVideoLoop(time) {
      const elapsed = time - startTime; 

      if (elapsed < 180 && posterCanvas) {
        vCtx.drawImage(posterCanvas, 0, 0, vCanvas.width, vCanvas.height);
      } else {
        vCtx.fillStyle = appState.frameColor; 
        vCtx.fillRect(0, 0, vCanvas.width, vCanvas.height); 

        if (isGrid && cuts === 4) {
          const halfW = (vCanvas.width - (pad * 2) - gap) / 2;
          const halfH = (vCanvas.height - topH - bottomH - gap) / 2;
          const coords = [
            { x: pad, y: topH },
            { x: pad + halfW + gap, y: topH },
            { x: pad, y: topH + halfH + gap },
            { x: pad + halfW + gap, y: topH + halfH + gap }
          ];

          for (let i = 0; i < 4; i++) {
            drawVideoSlot(vCtx, videoElements[i], coords[i].x, coords[i].y, halfW, halfH);
          }
        } else {
          const slotW = vCanvas.width - (pad * 2);
          const slotH = (vCanvas.height - topH - bottomH - (gap * (cuts - 1))) / cuts;
          for (let i = 0; i < cuts; i++) {
            const vy = topH + (i * (slotH + gap));
            drawVideoSlot(vCtx, videoElements[i], pad, vy, slotW, slotH);
          }
        }

        renderThemeOverlayGraphics(vCtx, vCanvas, pad, appState.frameStyle, false, appState.layout);
        renderStickersAndMirrors(vCtx, vCanvas, appState.layout);
      }

      if (elapsed < totalDuration) requestAnimationFrame(renderVideoLoop); 
      else recorder.stop();
    }
    requestAnimationFrame(renderVideoLoop);
  } catch (err) { 
    alert("비디오 생성 실패: " + err.message); 
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i data-lucide="video" class="w-3.5 h-3.5"></i><span>4컷 비디오</span>`; 
    }
    if (window.lucide) lucide.createIcons(); 
  }
}

function drawVideoSlot(ctx, v, x, y, w, h) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  const vW = v.videoWidth || 1280; 
  const vH = v.videoHeight || 720; 
  const vRatio = vW / vH; 
  const targetRatio = w / h; 
  let rw, rh;
  if (vRatio > targetRatio) { rh = h; rw = h * vRatio; } 
  else { rw = w; rh = w / vRatio; }

  const drawX = x + (w - rw) / 2;
  const drawY = y + (h - rh) / 2;

  if (appState.facingMode === 'user') {
    ctx.translate(drawX + rw, drawY);
    ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0, rw, rh);
  } else {
    ctx.drawImage(v, drawX, drawY, rw, rh);
  }
  ctx.restore();
}

async function generateImageQRCode() {
  const btn = document.getElementById('btnSaveQR'); 
  if (btn) { 
    btn.disabled = true; 
    btn.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i><span>QR 생성 중</span>`; 
  }
  if (window.lucide) lucide.createIcons();

  renderStrip(true); 
  const canvas = document.getElementById('photoCanvas'); 
  if (!canvas) return;

  autoArchiveToCloudQuietly(canvas, appState.isCurrentFavorite);

  const base64Img = canvas.toDataURL('image/png');
  const fileName = `[포토이스트]_${appState.selectedFormat || 'photo'}_${Date.now()}.png`;

  try {
    const res = await uploadMediaToGoogleDrive(extractPureBase64(base64Img), 'image', fileName, 'image/png');

    if (btn) { 
      btn.disabled = false; 
      btn.innerHTML = `<i data-lucide="qr-code" class="w-3.5 h-3.5"></i><span>QR 다운</span>`; 
    }
    if (window.lucide) lucide.createIcons();

    if (res && res.success && res.fileId) {
      const driveDirectUrl = `https://drive.google.com/file/d/${res.fileId}/view?usp=sharing`;
      displayResultWithQR(driveDirectUrl);
    } else {
      alert("구글 드라이브 업로드 지연 중입니다. 잠시 후 다시 시도해 주세요.");
    }
  } catch (err) {
    if (btn) { 
      btn.disabled = false; 
      btn.innerHTML = `<i data-lucide="qr-code" class="w-3.5 h-3.5"></i><span>QR 다운</span>`; 
    }
    if (window.lucide) lucide.createIcons();
    alert("QR 생성 중 오류가 발생했습니다: " + err.message);
  }
}

async function uploadMediaToGoogleDrive(base64Data, fileType, fileName, mimeType) {
  try {
    const res = await fetch(GOOGLE_DB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'UPLOAD_MEDIA',
        base64Data: base64Data,
        fileType: fileType,
        fileName: fileName,
        mimeType: mimeType
      })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function autoSavePDF() {
  renderStrip(true); 
  const canvas = document.getElementById('photoCanvas'); 
  if (!canvas) return; 

  autoArchiveToCloudQuietly(canvas, appState.isCurrentFavorite);

  const imgData = canvas.toDataURL('image/jpeg', 0.98); 
  const { jsPDF } = window.jspdf; 

  const orientation = (canvas.width > canvas.height) ? 'landscape' : 'portrait'; 
  const pdf = new jsPDF({ orientation, unit: 'mm', format: [102, 152] }); 

  const pdfW = pdf.internal.pageSize.getWidth(), pdfH = pdf.internal.pageSize.getHeight(); 
  const margin = 2; 
  const maxW = pdfW - (margin * 2), maxH = pdfH - (margin * 2); 
  const imgRatio = canvas.width / canvas.height; 
  let printW = maxW, printH = printW / imgRatio; 
  if (printH > maxH) { printH = maxH; printW = printH * imgRatio; }
  pdf.addImage(imgData, 'JPEG', (pdfW - printW) / 2, (pdfH - printH) / 2, printW, printH); 
  pdf.save(`[포토이스트]_Print_${appState.selectedFormat}_${Date.now()}.pdf`);
}

function sharePhotoDirectly() {
  renderStrip(true); 
  const canvas = document.getElementById('photoCanvas'); 
  if (!canvas) return;

  autoArchiveToCloudQuietly(canvas, appState.isCurrentFavorite);

  canvas.toBlob(async (blob) => {
    if (!blob) return; 
    const file = new File([blob], `[포토이스트]_Photo_${Date.now()}.png`, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { 
      try { await navigator.share({ files: [file], title: '포토이스트', text: '포토이스트 사진입니다!' }); } catch (err) {} 
    } else { 
      const url = URL.createObjectURL(blob); 
      const a = document.createElement('a'); a.href = url; a.download = file.name; 
      document.body.appendChild(a); a.click(); document.body.removeChild(a); 
    }
  }, 'image/png');
}

function displayResultWithQR(url) {
  const qrBox = document.getElementById('qrcodeArea'); 
  if (!qrBox) return; 
  qrBox.innerHTML = ''; 
  new QRCode(qrBox, { text: url, width: 160, height: 160, correctLevel: QRCode.CorrectLevel.M });
  showScreen('screenResult'); 
  startAutoReset();
}

function returnToEditor() { 
  if (appState.resetInterval) { clearInterval(appState.resetInterval); appState.resetInterval = null; } 
  showScreen('screenEdit'); 
  renderStrip(); 
}

function openVideoResultModal(blob) {
  const modal = document.getElementById('videoResultModal');
  const player = document.getElementById('videoResultPlayer');
  if (!modal || !player) return;
  player.src = URL.createObjectURL(blob);
  modal.classList.remove('hidden');
  modal.style.removeProperty('display');
  modal.style.setProperty('display', 'flex', 'important');
  if (window.lucide) lucide.createIcons();
}

function closeVideoResultModal() {
  const modal = document.getElementById('videoResultModal');
  const player = document.getElementById('videoResultPlayer');
  if (player) player.pause();
  if (modal) {
    modal.classList.add('hidden');
    modal.style.setProperty('display', 'none', 'important');
  }
}

function downloadCurrentVideoFile() {
  if (!currentGeneratedVideoBlob) return;
  const url = URL.createObjectURL(currentGeneratedVideoBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = currentGeneratedVideoFileName || `[포토이스트]_Video_${Date.now()}.mp4`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

async function shareCurrentVideoFile() {
  if (!currentGeneratedVideoBlob) return;
  const ext = currentGeneratedVideoFileName.endsWith('.mp4') ? 'mp4' : 'webm';
  const file = new File([currentGeneratedVideoBlob], currentGeneratedVideoFileName, { type: `video/${ext}` });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: '포토이스트 비디오',
        text: '포토이스트 무빙 비디오입니다! 🎬'
      });
      return;
    } catch (e) {
      if (e.name === 'AbortError') return;
    }
  }
  downloadCurrentVideoFile();
}

// ========================================================
// 18. 이용후기, 고객소리함 & 관리자 모드
// ========================================================
function handleStarClick(starNum) {
  currentRatingValue = starNum;
  updateRatingUI(starNum);
}

function updateRatingUI(num) {
  const scoreText = document.getElementById('ratingValueText');
  if (scoreText) scoreText.textContent = num.toFixed(1);

  for (let i = 1; i <= 5; i++) {
    const starEl = document.getElementById('star' + i);
    if (!starEl) continue;
    if (num >= i) {
      starEl.className = 'text-amber-500 transition hover:scale-110 cursor-pointer';
    } else {
      starEl.className = 'text-slate-300 transition hover:scale-110 cursor-pointer';
    }
  }
}

async function fetchCloudBoardPosts() {
  try {
    const res = await fetch(`${GOOGLE_DB_URL}?api=true&_t=${Date.now()}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.reviews)) {
        localStorage.setItem('vibe_posts', JSON.stringify(data.reviews));
        renderBoard();
        renderAdminReviewManageList();
      }
    }
  } catch (e) {
    renderBoard();
  }
}

function renderBoard() {
  const posts = JSON.parse(localStorage.getItem('vibe_posts') || '[]');
  const container = document.getElementById('boardListArea');
  const totalCount = posts.length;
  let totalRating = 0;
  posts.forEach(p => totalRating += (Number(p.rating) || 5.0));
  const avgRating = totalCount > 0 ? (totalRating / totalCount).toFixed(1) : '5.0';

  const avgScoreEl = document.getElementById('boardAvgScore');
  const avgStarsEl = document.getElementById('boardAvgStars');
  const totalCountEl = document.getElementById('boardTotalCount');
  if (avgScoreEl) avgScoreEl.textContent = avgRating;
  if (totalCountEl) totalCountEl.textContent = totalCount;
  if (avgStarsEl) {
    let s = '';
    for (let i = 0; i < Math.floor(parseFloat(avgRating)); i++) s += '⭐';
    avgStarsEl.textContent = s || '⭐';
  }
  if (!container) return;
  if (posts.length === 0) { 
    container.innerHTML = `<p class="text-xs text-slate-400 text-center py-8">등록된 후기가 없습니다. 첫 후기를 남겨보세요! ✨</p>`; 
    return; 
  }

  container.innerHTML = posts.map(p => {
    const ratingNum = Number(p.rating) || 5.0; 
    let starStr = '';
    for (let i = 0; i < Math.floor(ratingNum); i++) starStr += '⭐';

    return `
      <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-1.5">
            <span class="font-bold text-xs text-slate-800">${escapeHtml(p.nickname)}</span>
            <span class="text-[10px] text-amber-500 font-black">${starStr} ${ratingNum.toFixed(1)}</span>
          </div>
          <span class="text-[10px] text-slate-400">${p.date}</span>
        </div>
        <p class="text-xs text-slate-700 break-words leading-relaxed">${escapeHtml(p.content)}</p>
      </div>
    `;
  }).join('');
}

async function submitBoardPost() {
  const nicknameInput = document.getElementById('boardNickname');
  const contentInput = document.getElementById('boardContent');
  const nickname = (nicknameInput ? nicknameInput.value : '').trim() || '익명의 사진작가';
  const content = (contentInput ? contentInput.value : '').trim();
  const rating = currentRatingValue;
  if (!content) { alert("후기 내용을 입력해주세요."); return; }

  const btn = document.getElementById('btnSubmitBoard'); 
  btn.disabled = true; 
  btn.textContent = "등록 중...";

  const tempPost = {
    id: Date.now(),
    nickname: nickname,
    content: content,
    rating: rating,
    date: getFormattedTodayDate()
  };
  let posts = JSON.parse(localStorage.getItem('vibe_posts') || '[]');
  posts.unshift(tempPost);
  localStorage.setItem('vibe_posts', JSON.stringify(posts));
  renderBoard();

  if (contentInput) contentInput.value = ''; 
  if (nicknameInput) nicknameInput.value = '';

  try {
    await fetch(GOOGLE_DB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'ADD_REVIEW', nickname: nickname, rating: rating, content: content })
    });
    setTimeout(fetchCloudBoardPosts, 500);
  } catch (err) {
  } finally {
    btn.disabled = false;
    btn.textContent = "등록";
  }
}

async function deleteReviewPost(id) {
  if (!confirm("이 후기를 영구 삭제하시겠습니까?")) return;

  let posts = JSON.parse(localStorage.getItem('vibe_posts') || '[]');
  posts = posts.filter(p => p.id !== id);
  localStorage.setItem('vibe_posts', JSON.stringify(posts));
  renderBoard();
  renderAdminReviewManageList();

  try {
    await fetch(GOOGLE_DB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'DELETE_REVIEW', id: id })
    });
  } catch (e) {}
}

function renderAdminReviewManageList() {
  const listEl = document.getElementById('adminReviewManageList');
  if (!listEl) return;
  const posts = JSON.parse(localStorage.getItem('vibe_posts') || '[]');
  if (posts.length === 0) { 
    listEl.innerHTML = `<p class="text-xs text-slate-400 py-3 text-center">등록된 후기가 없습니다.</p>`; 
    return; 
  }
  listEl.innerHTML = posts.map(p => `
    <div class="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
      <div class="flex justify-between items-center">
        <span class="font-bold text-slate-800">${escapeHtml(p.nickname)} <b class="text-amber-500 ml-1">★ ${p.rating || 5.0}</b></span>
        <button onclick="deleteReviewPost(${p.id})" class="text-[10px] bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded font-black">삭제</button>
      </div>
      <p class="text-[11px] text-slate-600 break-words">${escapeHtml(p.content)}</p>
    </div>
  `).join('');
}

function openCustomerBotModal() {
  const m = document.getElementById('customerBotModal');
  if (m) {
    m.classList.remove('hidden');
    m.style.removeProperty('display');
    m.style.setProperty('display', 'flex', 'important');
  }
  if (window.lucide) lucide.createIcons();
}

function closeCustomerBotModal() {
  const m = document.getElementById('customerBotModal');
  if (m) {
    m.classList.add('hidden');
    m.style.setProperty('display', 'none', 'important');
  }
}

async function sendCustomerBotMessage() {
  const emailInput = document.getElementById('botContactEmail');
  const chatInput = document.getElementById('botChatInput');
  const email = (emailInput ? emailInput.value : '').trim();
  const userMsg = (chatInput ? chatInput.value : '').trim();

  if (!userMsg) return;

  const chatArea = document.getElementById('chatMessagesArea');
  const userDiv = document.createElement('div');
  userDiv.className = "flex items-start justify-end space-x-2";
  userDiv.innerHTML = `
    <div class="chat-bubble-user p-3 max-w-[80%] leading-relaxed">
      ${email ? `<span class="block text-[9px] opacity-80 mb-1">📩 ${escapeHtml(email)}</span>` : ''}
      ${escapeHtml(userMsg)}
    </div>
  `;
  chatArea.appendChild(userDiv);
  if (chatInput) chatInput.value = '';
  chatArea.scrollTop = chatArea.scrollHeight;

  const btn = document.getElementById('btnSendBot');
  btn.disabled = true;

  const telemetry = await collectDeviceTelemetry();
  const deviceInfoStr = `${telemetry.device} / ${telemetry.os} / ${telemetry.browser} (${telemetry.screen})`;

  setTimeout(async () => {
    let replyComment = email
      ? `소중한 의견이 정상 접수되었습니다! 보내주신 내용을 토대로 서비스 개선에 적극 반영하며, 기재해주신 이메일(<b>${escapeHtml(email)}</b>)로 상세히 답변드리겠습니다. 감사합니다! 💖`
      : `소중한 의견이 정상 접수되었습니다! 보내주신 피드백을 바탕으로 시스템을 지속적으로 개선하겠습니다. (※ 개별 답변이 필요하신 경우 이메일 주소를 함께 남겨주세요.) 😊`;

    const aiDiv = document.createElement('div');
    aiDiv.className = "flex items-start space-x-2";
    aiDiv.innerHTML = `
      <div class="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 text-[10px] font-black">접수</div>
      <div class="chat-bubble-ai p-3 max-w-[85%] leading-relaxed text-slate-800">
        ${replyComment}
      </div>
    `;
    chatArea.appendChild(aiDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
    btn.disabled = false;

    try {
      await fetch(GOOGLE_DB_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'ADD_INQUIRY',
          email: email,
          message: userMsg,
          deviceInfo: deviceInfoStr
        })
      });
    } catch (e) {}
  }, 400);
}

// 🌟 관리자 설정 센터 즉시 진입
function promptAdminMode(e) {
  if (e && e.preventDefault) { e.preventDefault(); e.stopPropagation(); }

  if (appState.isAdmin && appState.currentUser && appState.currentUser.userId === 'knsupolo') {
    openAdminDashboard();
    return;
  }

  const pw = prompt("관리자 비밀번호를 입력하세요:");
  if (pw === "12345678" || pw === "0724" || pw === "1234") {
    appState.isAdmin = true;
    openAdminDashboard();
  } else if (pw !== null) {
    alert("비밀번호가 올바르지 않습니다.");
  }
}

function openAdminDashboard() {
  const modal = document.getElementById('adminDashboardModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.style.removeProperty('display');
  modal.style.setProperty('display', 'flex', 'important');
  try {
    updateAdminDashboardStats();
    renderAdminNoticeManageList();
    renderAdminReviewManageList();
    renderAdminLocationStats();
    switchAdminTab('stats');
    if (window.lucide) lucide.createIcons();
  } catch (err) {}
}

function closeAdminDashboard() {
  const modal = document.getElementById('adminDashboardModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.setProperty('display', 'none', 'important');
  }
}

function switchAdminTab(tabName) {
  ['stats', 'theme', 'notices', 'reviews'].forEach(t => {
    const btn = document.getElementById('tabBtn' + t.charAt(0).toUpperCase() + t.slice(1));
    const content = document.getElementById('adminTab' + t.charAt(0).toUpperCase() + t.slice(1));
    if (t === tabName) {
      if (btn) btn.className = "flex-1 py-3 border-b-2 border-theme text-theme font-black";
      if (content) content.classList.remove('hidden');
    } else {
      if (btn) btn.className = "flex-1 py-3 border-b-2 border-transparent text-slate-400 hover:text-slate-700";
      if (content) content.classList.add('hidden');
    }
  });
  if (tabName === 'stats') setTimeout(renderCharts, 100);
}

function updateAdminDashboardStats() {
  const todayStr = getFormattedTodayDate();
  const logs = JSON.parse(localStorage.getItem('chueok_visitor_logs') || '[]');
  const todayVisits = parseInt(localStorage.getItem('chueok_stat_today_' + todayStr) || '1', 10);
  const totalVisits = parseInt(localStorage.getItem('chueok_stat_total') || '2180', 10);
  const now = new Date();
  const weekAgo = new Date(); weekAgo.setDate(now.getDate() - 7);
  const monthAgo = new Date(); monthAgo.setDate(now.getDate() - 30);
  let weekVisits = 0, monthVisits = 0;

  logs.forEach(l => {
    const logDate = new Date(l.date.replace(/\./g, '-'));
    if (logDate >= weekAgo) weekVisits++;
    if (logDate >= monthAgo) monthVisits++;
  });

  const elToday = document.getElementById('dashToday');
  const elWeek = document.getElementById('dashWeek');
  const elMonth = document.getElementById('dashMonth');
  const elTotal = document.getElementById('dashTotal');
  if (elToday) elToday.textContent = todayVisits;
  if (elWeek) elWeek.textContent = Math.max(todayVisits, weekVisits);
  if (elMonth) elMonth.textContent = Math.max(todayVisits, monthVisits);
  if (elTotal) elTotal.textContent = totalVisits.toLocaleString();
}

function renderCharts() {
  if (typeof Chart === 'undefined') return;
  const logs = JSON.parse(localStorage.getItem('chueok_visitor_logs') || '[]');

  const hourlyCounts = Array(24).fill(0);
  logs.forEach(l => { if (typeof l.hour === 'number' && l.hour >= 0 && l.hour <= 23) hourlyCounts[l.hour]++; });

  const ctxHourly = document.getElementById('chartHourly');
  if (ctxHourly) {
    if (hourlyChartInstance) hourlyChartInstance.destroy();
    hourlyChartInstance = new Chart(ctxHourly.getContext('2d'), {
      type: 'bar',
      data: { labels: Array.from({length: 24}, (_, i) => i + '시'), datasets: [{ label: '방문자수', data: hourlyCounts, backgroundColor: 'rgba(244, 63, 94, 0.75)', borderRadius: 6 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
    });
  }

  const deviceCounts = JSON.parse(localStorage.getItem('chueok_device_stats') || '{}');
  const deviceLabels = ["아이폰", "안드로이드폰", "아이패드", "안드로이드패드", "PC", "기타"];
  const deviceData = deviceLabels.map(k => deviceCounts[k] || 0);

  const ctxDev = document.getElementById('chartDevice');
  if (ctxDev) {
    if (deviceChartInstance) deviceChartInstance.destroy();
    deviceChartInstance = new Chart(ctxDev.getContext('2d'), {
      type: 'doughnut',
      data: { 
        labels: deviceLabels, 
        datasets: [{ 
          data: deviceData.some(v => v > 0) ? deviceData : [1, 0, 0, 0, 0, 0], 
          backgroundColor: ['#f43f5e', '#10b981', '#0284c7', '#8b5cf6', '#f59e0b', '#64748b'] 
        }] 
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
  }
}

function renderAdminLocationStats() {
  const container = document.getElementById('adminLocationStatsList');
  if (!container) return;
  const locMap = JSON.parse(localStorage.getItem('chueok_location_stats') || '{}');
  const entries = Object.entries(locMap);

  if (entries.length === 0) {
    container.innerHTML = `<p class="text-slate-400 text-center py-4">수집된 지역 통계가 없습니다.</p>`;
    return;
  }

  entries.sort((a, b) => b[1] - a[1]);
  container.innerHTML = entries.map(([loc, count]) => `
    <div class="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
      <span class="font-bold text-slate-700 flex items-center"><i data-lucide="map-pin" class="w-3 h-3 text-rose-500 mr-1"></i>${loc}</span>
      <span class="font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">${count}회</span>
    </div>
  `).join('');
  if (window.lucide) lucide.createIcons();
}

function renderAdminNoticeManageList() {
  const listEl = document.getElementById('adminNoticeManageList');
  if (!listEl) return;
  const notices = getStoredNotices();
  listEl.innerHTML = notices.map(n => `
    <div class="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
      <div>
        <span class="font-black text-theme text-[10px] mr-1">[${n.version || APP_VERSION}]</span>
        <span class="font-bold text-slate-800">${n.content}</span>
        <p class="text-[9px] text-slate-400 mt-0.5">${n.date}</p>
      </div>
      <button onclick="deleteNotice('${n.id}')" class="text-[10px] text-rose-600 underline font-bold ml-2 shrink-0">삭제</button>
    </div>
  `).join('');
}

async function writeAdminNotice() {
  const content = prompt("새 공지사항 내용을 입력하세요:");
  if (!content || !content.trim()) return;

  const newNotice = { 
    id: Date.now().toString(), 
    date: getFormattedTodayDate(), 
    version: APP_VERSION, 
    content: content.trim() 
  };
  let list = getStoredNotices();
  list.unshift(newNotice);
  localStorage.setItem('vibe_notices', JSON.stringify(list));
  renderMainNotices(); 
  renderAdminNoticeManageList();

  try {
    await fetch(GOOGLE_DB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'ADD_NOTICE',
        content: newNotice.content,
        version: newNotice.version
      })
    });
  } catch (e) {}
}

async function deleteNotice(id) {
  if (!confirm("이 공지를 영구 삭제하시겠습니까?")) return;
  let list = getStoredNotices().filter(n => String(n.id) !== String(id));
  localStorage.setItem('vibe_notices', JSON.stringify(list));
  renderMainNotices(); 
  renderAdminNoticeManageList();

  try {
    await fetch(GOOGLE_DB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'DELETE_NOTICE', id: id })
    });
  } catch (e) {}
}

function getStoredNotices() {
  const stored = localStorage.getItem('vibe_notices');
  let list = [];
  if (stored) { 
    try { list = JSON.parse(stored); } catch(e) { list = []; } 
  }
  if (!list || list.length === 0) {
    list = [{ 
      id: 'v17_3_init', 
      date: getFormattedTodayDate(), 
      version: APP_VERSION, 
      content: 'v17.3 Pro: 4·5·6컷 가변 프레임, 포토이스트, 착용 소품 팩 & 15Mbps 무빙 비디오 업데이트 완료!' 
    }];
  }
  return list;
}

function renderMainNotices() {
  const container = document.getElementById('noticeListContainer');
  const area = document.getElementById('mainNoticeArea');
  if (!container || !area) return;
  area.classList.remove('hidden');
  container.innerHTML = `
    <div class="bg-white/95 border border-rose-100 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-left">
      <span class="bg-theme text-white text-[9px] font-black px-1.5 py-0.5 rounded shrink-0">v17.3 Pro</span>
      <p class="text-[11px] font-bold text-slate-800 truncate ml-2">4·5·6컷 가변 프레임, 착용 소품 팩 & 포토이스트 업데이트!</p>
    </div>
  `;
}

function detectCurrentDevice() {
  const ua = navigator.userAgent;
  if (/iPhone/i.test(ua)) return "아이폰";
  if (/iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return "아이패드";
  if (/Android/i.test(ua)) {
    if (/Mobile/i.test(ua)) return "안드로이드폰";
    return "안드로이드패드";
  }
  if (/Macintosh|Mac OS X|Windows|Linux|CrOS/i.test(ua)) return "PC";
  return "기타";
}

async function collectDeviceTelemetry() {
  const ua = navigator.userAgent;
  const deviceType = detectCurrentDevice();

  let os = "기타 OS";
  if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Windows/i.test(ua)) os = "Windows";
  else if (/Macintosh|Mac OS X/i.test(ua)) os = "macOS";

  let browser = "기타 브라우저";
  if (/KAKAOTALK/i.test(ua)) browser = "카카오톡 인앱";
  else if (/Instagram/i.test(ua)) browser = "인스타그램 인앱";
  else if (/NAVER/i.test(ua)) browser = "네이버 인앱";
  else if (/Whale/i.test(ua)) browser = "네이버 웨일";
  else if (/Chrome/i.test(ua)) browser = "Chrome";
  else if (/Safari/i.test(ua)) browser = "Safari";

  return {
    device: deviceType,
    os: os,
    browser: browser,
    screen: `${window.screen.width} x ${window.screen.height}`,
    viewport: `${window.innerWidth} x ${window.innerHeight}`,
    referrer: document.referrer || "직접 접속"
  };
}

// ========================================================
// 19. 화면 전환 & 라이프사이클 관리
// ========================================================
function showScreen(id) {
  const screenIds = ['screenHome', 'screenBoard', 'screenLiveShoot', 'screenPick', 'screenEdit', 'screenResult'];
  screenIds.forEach(s => {
    const el = document.getElementById(s);
    if (el) { 
      if (s === id) { 
        el.classList.remove('hidden'); 
        el.style.removeProperty('display');
        el.style.setProperty('display', 'flex', 'important');
      } else { 
        el.classList.add('hidden'); 
        el.style.setProperty('display', 'none', 'important');
      } 
    }
  });
  try { if (window.lucide) lucide.createIcons(); } catch (e) {}
  if (id === 'screenBoard') { renderBoard(); fetchCloudBoardPosts(); }
  else if (id === 'screenHome') { checkPreviousSession(); renderMainNotices(); updateUserHeaderUI(); }
  else if (id === 'screenLiveShoot') { setTimeout(checkDeviceOrientation, 200); }
}

function cancelSession() { stopCameraAndAudio(); resetApp(); }

function resetApp() {
  if (appState.resetInterval) clearInterval(appState.resetInterval); 
  stopCameraAndAudio();
  appState.shotImages = []; 
  appState.selectedImages = []; 
  initEmptySlots(appState.cutMode || 4);
  appState.stickers = []; 
  appState.selectedStickerIdx = -1; 
  appState.isCurrentFavorite = false;
  appState.currentPhotoId = null;
  galleryAccumulator = []; 
  showScreen('screenHome');
}

function startAutoReset() {
  if (appState.resetInterval) clearInterval(appState.resetInterval);
  let sec = 120; 
  const rText = document.getElementById('resetTimerText'); 
  if (rText) rText.textContent = `${sec}초`;
  appState.resetInterval = setInterval(() => { 
    sec--; 
    if (rText) rText.textContent = `${sec}초`; 
    if (sec <= 0) { clearInterval(appState.resetInterval); resetApp(); } 
  }, 1000);
}

function saveSessionStateToStorage() {
  try {
    const backupData = {
      cutMode: appState.cutMode,
      format: appState.selectedFormat,
      layout: appState.layout,
      frameStyle: appState.frameStyle,
      frameColor: appState.frameColor,
      frameThickness: appState.frameThickness,
      activeFilter: appState.activeFilter,
      filters: appState.filters,
      typography: appState.typography,
      stickers: appState.stickers,
      images: appState.selectedImages.map(img => img ? img.src : null)
    };
    sessionStorage.setItem('chueok_active_session', JSON.stringify(backupData));
    checkPreviousSession();
  } catch (e) {}
}

function checkPreviousSession() {
  const banner = document.getElementById('sessionRestoreBanner');
  if (!banner) return;
  const saved = sessionStorage.getItem('chueok_active_session');
  if (saved) banner.classList.remove('hidden');
  else banner.classList.add('hidden');
}

function restorePreviousSession() {
  const saved = sessionStorage.getItem('chueok_active_session');
  if (!saved) return;
  try {
    const data = JSON.parse(saved);
    appState.cutMode = data.cutMode || 4;
    appState.selectedFormat = data.format;
    appState.layout = data.layout;
    appState.frameStyle = data.frameStyle;
    appState.frameColor = data.frameColor;
    appState.frameThickness = data.frameThickness;
    appState.activeFilter = data.activeFilter;
    appState.filters = data.filters;
    appState.typography = data.typography;
    appState.stickers = data.stickers || [];

    const imgPromises = data.images.map(src => new Promise(res => {
      if (!src) return res(null);
      const img = new Image();
      img.onload = () => res(img);
      img.src = src;
    }));

    Promise.all(imgPromises).then(imgs => {
      appState.selectedImages = imgs.filter(Boolean);
      showScreen('screenEdit');
      renderStrip();
    });
  } catch (e) {
    sessionStorage.removeItem('chueok_active_session');
    checkPreviousSession();
  }
}

function changeLayout(mode, btn) {
  saveStateForUndo(); 
  appState.layout = mode;
  document.querySelectorAll('.layout-btn').forEach(b => { 
    b.className = "layout-btn bg-slate-100 text-slate-700 font-bold py-1.5 rounded-xl text-xs truncate"; 
  });
  if (btn) btn.className = "layout-btn bg-theme text-white font-bold py-1.5 rounded-xl text-xs";
  renderStrip();
}

function onThicknessChange(val) {
  appState.frameThickness = parseInt(val);
  renderStrip();
}

function changeFrameColor(color, btn) {
  saveStateForUndo(); 
  appState.frameColor = color;
  document.querySelectorAll('.color-btn').forEach(b => b.classList.replace('border-theme', 'border-transparent'));
  if (btn) btn.classList.replace('border-transparent', 'border-theme');
  renderStrip();
}

function handleFilterClick(filterKey, btn) {
  const isAlreadyActive = (appState.activeFilter === filterKey);
  if (!isAlreadyActive) {
    saveStateForUndo(); 
    appState.activeFilter = filterKey; 
    const p = FILTER_PRESETS[filterKey] || FILTER_PRESETS.normal; 
    appState.filters = { ...p };
    document.querySelectorAll('.filter-btn').forEach(b => { b.className = "filter-btn bg-slate-100 text-slate-700 font-bold py-1 rounded border border-transparent"; });
    btn.className = "filter-btn bg-slate-900 text-white font-bold py-1 rounded border border-theme";
    const badge = document.getElementById('filterStateBadge'); if (badge) badge.textContent = p.name;
    const sb = document.getElementById('sliderBright'); if (sb) sb.value = p.bright;
    const sc = document.getElementById('sliderContrast'); if (sc) sc.value = p.contrast;
    const ss = document.getElementById('sliderSaturate'); if (ss) ss.value = p.saturate;
    renderStrip();
  } else {
    const panel = document.getElementById('filterFineTunePanel'); 
    if (panel) panel.classList.toggle('hidden');
  }
}

function onFineTuneSliderChange() {
  const sb = document.getElementById('sliderBright'); 
  const sc = document.getElementById('sliderContrast'); 
  const ss = document.getElementById('sliderSaturate');
  if (sb) appState.filters.bright = parseInt(sb.value); 
  if (sc) appState.filters.contrast = parseInt(sc.value); 
  if (ss) appState.filters.saturate = parseInt(ss.value);
  renderStrip();
}

function saveStateForUndo() {
  const snapshot = JSON.stringify({
    cutMode: appState.cutMode, stickers: appState.stickers, layout: appState.layout, frameStyle: appState.frameStyle,
    frameThickness: appState.frameThickness, frameColor: appState.frameColor, activeFilter: appState.activeFilter,
    filters: appState.filters, typography: appState.typography, showDate: appState.showDate,
    isCurrentFavorite: appState.isCurrentFavorite, customEngraveText: appState.customEngraveText
  });
  historyStack.push(snapshot); 
  if (historyStack.length > 25) historyStack.shift(); 
  redoStack = [];
}

function undo() {
  if (historyStack.length === 0) return;
  const currentSnap = JSON.stringify({
    cutMode: appState.cutMode, stickers: appState.stickers, layout: appState.layout, frameStyle: appState.frameStyle,
    frameThickness: appState.frameThickness, frameColor: appState.frameColor, activeFilter: appState.activeFilter,
    filters: appState.filters, typography: appState.typography, showDate: appState.showDate,
    isCurrentFavorite: appState.isCurrentFavorite, customEngraveText: appState.customEngraveText
  });
  redoStack.push(currentSnap);
  applySnapshot(JSON.parse(historyStack.pop()));
}

function redo() {
  if (redoStack.length === 0) return;
  const currentSnap = JSON.stringify({
    cutMode: appState.cutMode, stickers: appState.stickers, layout: appState.layout, frameStyle: appState.frameStyle,
    frameThickness: appState.frameThickness, frameColor: appState.frameColor, activeFilter: appState.activeFilter,
    filters: appState.filters, typography: appState.typography, showDate: appState.showDate,
    isCurrentFavorite: appState.isCurrentFavorite, customEngraveText: appState.customEngraveText
  });
  historyStack.push(currentSnap);
  applySnapshot(JSON.parse(redoStack.pop()));
}

function applySnapshot(snap) {
  appState.cutMode = snap.cutMode || 4;
  appState.stickers = snap.stickers || []; 
  appState.layout = snap.layout; 
  appState.frameStyle = snap.frameStyle;
  appState.frameThickness = snap.frameThickness; 
  appState.frameColor = snap.frameColor; 
  appState.activeFilter = snap.activeFilter;
  appState.filters = snap.filters; 
  appState.typography = snap.typography;
  appState.showDate = snap.showDate !== undefined ? snap.showDate : true;
  appState.isCurrentFavorite = snap.isCurrentFavorite || false;
  appState.customEngraveText = snap.customEngraveText || '';
  
  const dateCheck = document.getElementById('checkShowDate');
  if (dateCheck) dateCheck.checked = appState.showDate;
  const engraveInput = document.getElementById('customEngraveInput');
  if (engraveInput) engraveInput.value = appState.customEngraveText;

  updateFavoriteButtonUI();
  renderStrip();
}

function loadSavedTheme() {
  const saved = localStorage.getItem('chueok_ui_theme') || 'rose';
  const t = APP_THEMES[saved] || APP_THEMES.rose;
  document.documentElement.style.setProperty('--theme-color', t.color);
  document.documentElement.style.setProperty('--theme-primary', t.color);
  document.documentElement.style.setProperty('--theme-primary-hover', t.hover);
  document.documentElement.style.setProperty('--theme-color-hover', t.hover);
  document.documentElement.style.setProperty('--theme-color-light', t.light);
}

// 🌟 시간 타이머 버튼 동작 보장
function setTimerSec(sec, btn) { 
  appState.timerSec = sec; 
  document.querySelectorAll('.timer-chip').forEach(b => { 
    b.className = "timer-chip bg-white border border-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded text-[10px]"; 
  }); 
  if (btn) btn.className = "timer-chip bg-theme text-white font-bold px-1.5 py-0.5 rounded text-[10px] shadow-xs"; 
}

function initDynamicUI() {
  const emojis = [
    '😀','😁','😂','😃','😄','😅','😆','😇','😈','😉','😊','😋','😌','😍','😎',
    '😏','😐','😑','😒','😓','😔','😕','😖','😗','😘','😙','😚','😛','😜','😝',
    '😞','😟','😠','😡','😢','😣','😤','😥','😨','😩','😪','😫','😭','😮','🥹',
    '✌️','💖','🎀','🐱','🐶','🐰','✨','🎂','🌸','🍀','🥳','🧸','🔥','💯','🍿'
  ];
  const emojiGrid = document.getElementById('emojiGrid');
  if (emojiGrid) {
    emojiGrid.innerHTML = emojis.map(e => `<button onclick="addPropSticker('${e}', 90)" class="p-0.5 hover:bg-slate-200 rounded cursor-pointer active:scale-90 transition">${e}</button>`).join('');
  }

  const texts = [
    '추억네컷', 'BEST', 'LOVE', 'YOUTH', 'HAPPY', 'VIBE', 'OUR DAY', 'CHILL', 'SMILE', 'FOREVER',
    '포토이스트', '오늘의 우리', '완벽한 하루', '행복만땅', '심쿵주의', '찐친바이브', '영원한 청춘', 'LUCKY DAY', 'MEMORIES', 'SO CUTE'
  ];
  const textStickerGrid = document.getElementById('textStickerGrid');
  if (textStickerGrid) {
    textStickerGrid.innerHTML = texts.map(t => `<button onclick="addTextSticker('${t}')" class="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] rounded border border-slate-300 shrink-0 cursor-pointer active:scale-95 transition">${t}</button>`).join('');
  }

  const basicColorGrid = document.getElementById('frameColorGridBasic');
  if (basicColorGrid) {
    basicColorGrid.innerHTML = PALETTE_COLORS.map(c => `
      <button onclick="changeFrameColor('${c}', this)" class="color-btn w-4 h-4 rounded-full border border-slate-200 shadow-2xs shrink-0" style="background-color:${c};"></button>
    `).join('') + `<label class="w-4 h-4 rounded-full bg-white border border-slate-300 flex items-center justify-center cursor-pointer shadow-2xs shrink-0 relative overflow-hidden"><i data-lucide="pipette" class="w-2.5 h-2.5 text-rose-600"></i><input type="color" value="#000000" onchange="changeFrameColor(this.value, null)" class="opacity-0 absolute inset-0 cursor-pointer"></label>`;
  }

  const simpleColorGrid = document.getElementById('frameColorGridSimple');
  if (simpleColorGrid) {
    simpleColorGrid.innerHTML = SIMPLE_PALETTE.map(c => `
      <button onclick="changeFrameColor('${c}', this)" class="color-btn w-4 h-4 rounded-full border border-slate-200 shadow-2xs shrink-0" style="background-color:${c};"></button>
    `).join('');
  }

  const premiumColorGrid = document.getElementById('frameColorGridPremium');
  if (premiumColorGrid) {
    premiumColorGrid.innerHTML = ['#000000', '#111111', '#18181B', '#FFFFFF', '#FECDD3', '#BAE6FD', '#EDE9FE'].map(c => `
      <button onclick="changeFrameColor('${c}', this)" class="color-btn w-4 h-4 rounded-full border border-slate-200 shadow-2xs shrink-0" style="background-color:${c};"></button>
    `).join('') + `<input type="color" value="#000000" onchange="changeFrameColor(this.value, null)" class="w-4 h-4 rounded-full cursor-pointer p-0 border border-slate-300">`;
  }
}

// ========================================================
// 20. 🌟 [핵심] 모든 인터랙션 함수 window 전역 바인딩 (미반응 원천 차단)
// ========================================================
window.startSession = startSession;
window.startActualCountdownSession = startActualCountdownSession;
window.triggerInstantOneSec = triggerInstantOneSec;
window.flipCameraFacing = flipCameraFacing;
window.cancelSession = cancelSession;
window.setViewfinderRatio = setViewfinderRatio;
window.dismissOrientationWarning = dismissOrientationWarning;

window.changeFrameCutMode = changeFrameCutMode;
window.selectSlotForAssignment = selectSlotForAssignment;
window.assignCurrentCarouselPhoto = assignCurrentCarouselPhoto;
window.confirmSelectedFour = confirmSelectedFour;
window.prevCarouselPhoto = prevCarouselPhoto;
window.nextCarouselPhoto = nextCarouselPhoto;
window.goToCarouselPhoto = goToCarouselPhoto;
window.returnToPickScreen = returnToPickScreen;

window.switchThemeCategory = switchThemeCategory;
window.setBasicTextPosition = setBasicTextPosition;
window.setSimpleOffsetLayout = setSimpleOffsetLayout;
window.setPremiumSubTheme = setPremiumSubTheme;
window.changeFrameColor = changeFrameColor;
window.changeLayout = changeLayout;
window.onThicknessChange = onThicknessChange;
window.handleFilterClick = handleFilterClick;
window.onFineTuneSliderChange = onFineTuneSliderChange;
window.toggleDateObject = toggleDateObject;

window.onCustomEngraveChange = onCustomEngraveChange;
window.applyDefaultSideEngrave = applyDefaultSideEngrave;
window.clearSideEngrave = clearSideEngrave;

window.addPropSticker = addPropSticker;
window.addDirectTextSticker = addDirectTextSticker;
window.addTextSticker = addTextSticker;
window.clearAllStickers = clearAllStickers;
window.onSelectedStickerRotate = onSelectedStickerRotate;
window.onSelectedStickerResize = onSelectedStickerResize;
window.onSelectedStickerColorChange = onSelectedStickerColorChange;
window.onSelectedStickerFontChange = onSelectedStickerFontChange;
window.deleteSelectedSticker = deleteSelectedSticker;

window.toggleFavoriteStrip = toggleFavoriteStrip;
window.generateFourCutVideo = generateFourCutVideo;
window.autoSavePDF = autoSavePDF;
window.sharePhotoDirectly = sharePhotoDirectly;
window.generateImageQRCode = generateImageQRCode;
window.returnToEditor = returnToEditor;
window.closeVideoResultModal = closeVideoResultModal;
window.downloadCurrentVideoFile = downloadCurrentVideoFile;
window.shareCurrentVideoFile = shareCurrentVideoFile;

window.zoomCanvas = zoomCanvas;
window.undo = undo;
window.redo = redo;

window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthTab = switchAuthTab;
window.checkUserIdDuplicate = checkUserIdDuplicate;
window.processRegister = processRegister;
window.processLogin = processLogin;
window.processLogout = processLogout;
window.processFindAccount = processFindAccount;

window.openMyProfileModal = openMyProfileModal;
window.closeMyProfileModal = closeMyProfileModal;
window.applyAppTheme = applyAppTheme;

window.openMainShareModal = openMainShareModal;
window.closeMainShareModal = closeMainShareModal;
window.triggerNativeShareAction = triggerNativeShareAction;
window.copyWebAppShareUrl = copyWebAppShareUrl;

window.openMyGalleryModal = openMyGalleryModal;
window.closeMyGalleryModal = closeMyGalleryModal;
window.switchGalleryTab = switchGalleryTab;
window.togglePhotoFavoriteStatus = togglePhotoFavoriteStatus;
window.deleteGalleryPhotoItem = deleteGalleryPhotoItem;

window.showScreen = showScreen;
window.handleStarClick = handleStarClick;
window.submitBoardPost = submitBoardPost;
window.deleteReviewPost = deleteReviewPost;
window.fetchCloudBoardPosts = fetchCloudBoardPosts;

window.openCustomerBotModal = openCustomerBotModal;
window.closeCustomerBotModal = closeCustomerBotModal;
window.sendCustomerBotMessage = sendCustomerBotMessage;

window.promptAdminMode = promptAdminMode;
window.openAdminDashboard = openAdminDashboard;
window.closeAdminDashboard = closeAdminDashboard;
window.switchAdminTab = switchAdminTab;
window.writeAdminNotice = writeAdminNotice;
window.deleteNotice = deleteNotice;

window.setTimerSec = setTimerSec;
window.triggerGalleryUpload = triggerGalleryUpload;
window.handleGalleryUpload = handleGalleryUpload;
window.cancelGalleryCollect = cancelGalleryCollect;
window.restorePreviousSession = restorePreviousSession;
window.resetApp = resetApp;

// ========================================================
// 21. 앱 초기 구동 엔트리포인트
// ========================================================
window.addEventListener('DOMContentLoaded', () => {
  ['screenLiveShoot', 'screenPick', 'screenEdit', 'screenBoard', 'screenResult', 'videoResultModal', 'galleryCollectModal', 'adminDashboardModal', 'customerBotModal', 'authModal', 'myGalleryModal', 'mainShareModal', 'myProfileModal'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('hidden');
      el.style.setProperty('display', 'none', 'important');
    }
  });

  const home = document.getElementById('screenHome');
  if (home) {
    home.classList.remove('hidden');
    home.style.removeProperty('display');
    home.style.setProperty('display', 'flex', 'important');
  }

  const badge = document.getElementById('appVersionBadge');
  if (badge) badge.textContent = APP_VERSION;

  updateDynamicViewportHeight();
  loadSavedTheme();
  initDynamicUI();
  initCanvasInteractions();
  setupCanvasPinchZoom();
  initSplitResizer();
  checkPreviousSession();
  checkAutoLoginSession();
  initUserLocationEngine();
  renderMainNotices();
  fetchCloudBoardPosts();

  window.addEventListener('resize', () => {
    updateDynamicViewportHeight();
    checkDeviceOrientation();
    if (appState.selectedImages && appState.selectedImages.length > 0) {
      renderStrip();
    }
  });
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      updateDynamicViewportHeight();
      checkDeviceOrientation();
      if (appState.selectedImages && appState.selectedImages.length > 0) {
        renderStrip();
      }
    }, 150);
  });

  try { if (window.lucide) lucide.createIcons(); } catch (e) {}
});
