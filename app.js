/**
 * 포토이스트 (Photoist) Studio Pro v17.4 Pro [1편 / 전반부]
 */

const GOOGLE_DB_URL = "https://script.google.com/macros/s/AKfycbw1fjoUYoKQOHNNatPY_8q8X-1ogUV7iaFsIMpYioStlVX1SZK9hYiY32P-bGv7GUVoBw/exec";
const APP_VERSION = "v17.4 Pro";
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

// 24종 포즈 가이드
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

// 15종 감성 필터 프리셋
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

// 24종 확장 프레임 컬러 팔레트
const EXTENDED_PALETTE_COLORS = [
  '#000000', '#111111', '#1E293B', '#64748B', '#E2E8F0', '#FFFFFF',
  '#1E1B4B', '#0F172A', '#064E3B', '#451A03', '#881337', '#78350F',
  '#FECDD3', '#BAE6FD', '#D1FAE5', '#FEF9C3', '#EDE9FE', '#FFEDD5',
  '#F43F5E', '#0284C7', '#059669', '#F97316', '#EAB308', '#9333EA'
];

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
  fullSessionVideoChunks: [],
  fullSessionMediaRecorder: null,
  fullSessionVideoBlob: null,

  frameColor: '#000000',
  frameThickness: 60,
  layout: 'strip',
  
  slotEngraveTexts: ["keep your memory", "photoist", "keep your memory", "photoist", "keep your memory", "photoist"],
  engraveFontFamily: 'Playfair Display',

  showDate: true,
  showQrSticker: true,
  qrCachedDataUrl: null,

  activeFilter: 'normal',
  filters: { bright: 100, contrast: 100, saturate: 100 },
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
// 1. 오디오 & 햅틱 피드백 엔진
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
// 3. 회원 인증 & 계정 복구
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
  const findIdForm = document.getElementById('authFormFindId');
  const resetPwForm = document.getElementById('authFormResetPw');
  
  const tabLogin = document.getElementById('tabModalLogin');
  const tabReg = document.getElementById('tabModalRegister');
  const tabFindId = document.getElementById('tabModalFindId');
  const tabResetPw = document.getElementById('tabModalResetPw');

  if (loginForm) loginForm.classList.add('hidden');
  if (regForm) regForm.classList.add('hidden');
  if (findIdForm) findIdForm.classList.add('hidden');
  if (resetPwForm) resetPwForm.classList.add('hidden');

  const inactiveClass = "px-2.5 py-1 rounded-lg text-slate-500 hover:text-slate-900";
  const activeClass = "px-2.5 py-1 rounded-lg bg-white text-slate-900 shadow-xs font-black";

  if (tabLogin) tabLogin.className = inactiveClass;
  if (tabReg) tabReg.className = inactiveClass;
  if (tabFindId) tabFindId.className = inactiveClass;
  if (tabResetPw) tabResetPw.className = inactiveClass;

  if (tab === 'login') {
    if (loginForm) loginForm.classList.remove('hidden');
    if (tabLogin) tabLogin.className = activeClass;
  } else if (tab === 'register') {
    if (regForm) regForm.classList.remove('hidden');
    if (tabReg) tabReg.className = activeClass;
  } else if (tab === 'find_id') {
    if (findIdForm) findIdForm.classList.remove('hidden');
    if (tabFindId) tabFindId.className = activeClass;
  } else if (tab === 'reset_pw') {
    if (resetPwForm) resetPwForm.classList.remove('hidden');
    if (tabResetPw) tabResetPw.className = activeClass;
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
    alert("이미 사용 중인 관리자 아이디입니다.");
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
  const gender = (document.getElementById('regUserGender').value || "M");
  const id = (document.getElementById('regUserId').value || "").trim().toLowerCase();
  const pw = document.getElementById('regUserPw').value;
  const pwConfirm = document.getElementById('regUserPwConfirm').value;
  const email = (document.getElementById('regUserEmail').value || "").trim().toLowerCase();

  if (!name || name.length < 2) { alert("이름(실명)을 2자 이상 입력해주세요."); return; }
  if (!dob || dob.length !== 6 || isNaN(dob)) { alert("생년월일은 6자리 숫자(YYMMDD)로 입력해주세요."); return; }
  if (!id || id.length < 4 || id.length > 12) { alert("아이디는 4~12자리 영문 또는 숫자여야 합니다."); return; }
  if (!pw || pw.length < 6 || !/(?=.*[A-Za-z])(?=.*\d)/.test(pw)) { alert("비밀번호는 6자리 이상 영문과 숫자를 혼합해야 합니다."); return; }
  if (pw !== pwConfirm) { alert("비밀번호와 비밀번호 확인 입력값이 일치하지 않습니다."); return; }
  if (!email || !email.includes('@')) { alert("올바른 이메일 주소를 입력해주세요."); return; }

  try {
    const res = await fetch(GOOGLE_DB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'REGISTER', name: name, userId: id, userPw: pw, dob: dob, gender: gender, email: email })
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
    alert("회원가입 통신 오류: " + err.message);
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
      name: "최고관리자",
      userId: 'knsupolo',
      dob: '830413',
      gender: 'M',
      email: 'admin@chueok.com',
      isAdmin: true,
      totalShots: 999
    };
    applyUserLoginSuccess(adminUser, 'master-admin-token-' + Date.now());
    closeAuthModal();
    alert("👑 최고 관리자(knsupolo) 계정으로 로그인되었습니다!");
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
      alert(`환영합니다, ${data.user.name || data.user.userId}님! 💖`);
      loadUserSavedTheme();
    } else {
      alert(data.message || "아이디 또는 비밀번호가 일치하지 않습니다.");
    }
  } catch (err) {
    alert("로그인 통신 오류가 발생했습니다.");
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

async function processFindId() {
  const name = (document.getElementById('findIdName').value || "").trim();
  const dob = (document.getElementById('findIdDob').value || "").trim();
  const email = (document.getElementById('findIdEmail').value || "").trim().toLowerCase();

  if (!name || !dob || !email) {
    alert("이름, 생년월일 6자리, 이메일을 모두 입력해주세요.");
    return;
  }

  try {
    const res = await fetch(GOOGLE_DB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'FIND_ID', name: name, dob: dob, email: email })
    });
    const data = await res.json();
    alert(data.message || (data.success ? `회원님의 아이디는 [${data.userId}] 입니다.` : "일치하는 계정을 찾을 수 없습니다."));
    if (data.success) {
      switchAuthTab('login');
      const loginIdInput = document.getElementById('loginUserId');
      if (loginIdInput) loginIdInput.value = data.userId;
    }
  } catch (e) {
    alert("아이디 찾기 통신 오류가 발생했습니다.");
  }
}

async function processResetPasswordDirect() {
  const userId = (document.getElementById('resetPwUserId').value || "").trim().toLowerCase();
  const name = (document.getElementById('resetPwName').value || "").trim();
  const dob = (document.getElementById('resetPwDob').value || "").trim();
  const email = (document.getElementById('resetPwEmail').value || "").trim().toLowerCase();
  const newPw = document.getElementById('resetPwNew').value;
  const newPwConfirm = document.getElementById('resetPwNewConfirm').value;

  if (!userId || !name || !dob || !email || !newPw) {
    alert("모든 항목을 입력해주세요.");
    return;
  }
  if (newPw.length < 6 || !/(?=.*[A-Za-z])(?=.*\d)/.test(newPw)) {
    alert("새 비밀번호는 6자리 이상 영문과 숫자를 혼합해야 합니다.");
    return;
  }
  if (newPw !== newPwConfirm) {
    alert("새 비밀번호와 확인 입력값이 일치하지 않습니다.");
    return;
  }

  try {
    const res = await fetch(GOOGLE_DB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ 
        action: 'RESET_PW_DIRECT', 
        userId: userId, 
        name: name, 
        dob: dob, 
        email: email, 
        newPw: newPw 
      })
    });
    const data = await res.json();
    alert(data.message || (data.success ? "비밀번호가 성공적으로 변경되었습니다!" : "비밀번호 변경 실패"));
    if (data.success) {
      switchAuthTab('login');
      const loginIdInput = document.getElementById('loginUserId');
      if (loginIdInput) loginIdInput.value = userId;
    }
  } catch (e) {
    alert("비밀번호 재설정 통신 오류가 발생했습니다.");
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
// 5. 공유 센터
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
    alert("스튜디오 접속 링크가 복사되었습니다! 📋");
    closeMainShareModal();
  }).catch(() => {
    prompt("아래 웹 주소를 복사하여 공유하세요:", currentAppUrl);
  });
}

// ========================================================
// 6. 마이 갤러리 (무제한 찜 보관함)
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
  const localFavVault = JSON.parse(localStorage.getItem('photoist_favorite_vault') || '[]');
  
  const combined = [...localFavVault, ...localArchive.filter(p => !localFavVault.some(f => f.id === p.id))];
  cachedUserGalleryPhotos = combined;
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
            <span class="absolute top-1.5 left-1.5 bg-black/75 text-white text-[9px] font-black px-1.5 py-0.5 rounded">#${idx + 1}</span>
            ${p.isFavorite ? `<span class="absolute top-1.5 right-1.5 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow">⭐ 찜</span>` : ''}
            <img src="${p.fileUrl || ('https://drive.google.com/thumbnail?id=' + p.fileId + '&sz=w600')}" class="w-full h-full object-cover" onerror="this.src='https://placehold.co/400x600?text=Photo';">
          </div>
          <div class="flex items-center justify-between pt-1">
            <span class="text-[9px] text-slate-400">${p.date ? p.date.slice(0, 10) : ''}</span>
            <div class="flex space-x-1">
              <button onclick="togglePhotoFavoriteStatus('${p.id}')" class="p-1 rounded-lg border text-xs active:scale-90 ${p.isFavorite ? 'bg-amber-50 border-amber-300 text-amber-500' : 'bg-white border-slate-200 text-slate-400'}" title="찜 토글">
                ★
              </button>
              <a href="${p.fileUrl}" target="_blank" download="photoist_photo.png" class="p-1 bg-white border border-slate-200 rounded-lg text-slate-700 hover:text-theme active:scale-90" title="보기/다운">
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
  let favVault = JSON.parse(localStorage.getItem('photoist_favorite_vault') || '[]');
  
  const target = cachedUserGalleryPhotos.find(p => p.id === photoId);
  if (target) {
    target.isFavorite = !target.isFavorite;
    if (target.isFavorite) {
      if (!favVault.some(f => f.id === target.id)) favVault.unshift(target);
    } else {
      favVault = favVault.filter(f => f.id !== target.id);
    }
  }

  localStorage.setItem('photoist_favorite_vault', JSON.stringify(favVault));
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
  let favVault = JSON.parse(localStorage.getItem('photoist_favorite_vault') || '[]');

  localArchive = localArchive.filter(p => p.id !== photoId);
  favVault = favVault.filter(p => p.id !== photoId);

  localStorage.setItem('chueok_local_gallery', JSON.stringify(localArchive));
  localStorage.setItem('photoist_favorite_vault', JSON.stringify(favVault));

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
      if (desc) desc.textContent = "세로 스트립형 규격은 가로 파지 전용입니다. 기기를 회전하시면 카운트다운이 재개됩니다.";
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
      if (desc) desc.textContent = "2×2 엽서형 규격은 세로 파지 전용입니다. 기기를 회전하시면 카운트다운이 재개됩니다.";
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
// 8. 카메라 대기실 (아이패드/모바일 뷰포트 고정 & 축소 방지)
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
  if (liveBadge) liveBadge.textContent = (format === 'strip') ? "세로 스트립형 (가로모드)" : "2×2 엽서형 (세로모드)";
  const editBadge = document.getElementById('editorFormatBadge');
  if (editBadge) editBadge.textContent = (format === 'strip') ? "세로 스트립형" : "2×2 엽서형";
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
    alert("카메라 권한이 없거나 HTTPS 연결이 아닙니다. 앨범 선택 모드로 이동합니다.");
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
// 9. 6컷 연속 촬영 (4x 타임랩스 백그라운드 녹화 탑재)
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

  startFullSessionTimelapseRecording();
  runContinuousLiveShoot(0);
}

function startFullSessionTimelapseRecording() {
  if (!appState.stream) return;
  appState.fullSessionVideoChunks = [];
  try {
    appState.fullSessionMediaRecorder = new MediaRecorder(appState.stream, {
      mimeType: 'video/webm',
      videoBitsPerSecond: 15000000
    });
  } catch (e) {
    try {
      appState.fullSessionMediaRecorder = new MediaRecorder(appState.stream);
    } catch (e2) {
      appState.fullSessionMediaRecorder = null;
    }
  }

  if (appState.fullSessionMediaRecorder) {
    appState.fullSessionMediaRecorder.ondataavailable = e => {
      if (e.data && e.data.size > 0) appState.fullSessionVideoChunks.push(e.data);
    };
    appState.fullSessionMediaRecorder.start();
  }
}

function runContinuousLiveShoot(shotIndex) {
  appState.currentShotIndex = shotIndex;
  if (shotIndex >= 6) { 
    stopCameraAndAudio(); 
    if (appState.fullSessionMediaRecorder && appState.fullSessionMediaRecorder.state !== 'inactive') {
      appState.fullSessionMediaRecorder.onstop = () => {
        appState.fullSessionVideoBlob = new Blob(appState.fullSessionVideoChunks, { type: 'video/webm' });
      };
      appState.fullSessionMediaRecorder.stop();
    }
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
// 10. 사진 선택 (포토이스트 매트블랙 & 초기 빈 슬롯)
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

  if (isGrid) {
    if (cuts === 4) {
      container.className = "w-72 sm:w-80 aspect-[2/3] p-3.5 shadow-2xl flex flex-col justify-between border border-slate-700 rounded-2xl transition-all";
      slotsHtml = `
        <div class="grid grid-cols-2 gap-2 flex-1 my-1.5">
          <div onclick="selectSlotForAssignment(0)" data-slot="0" id="previewSlot0" class="drop-slot aspect-[4/5] bg-zinc-900 border-2 border-theme ring-2 ring-rose-400 flex items-center justify-center text-slate-400 text-xs font-bold cursor-pointer overflow-hidden rounded-xl">1번 슬롯</div>
          <div onclick="selectSlotForAssignment(1)" data-slot="1" id="previewSlot1" class="drop-slot aspect-[4/5] bg-zinc-900 border-2 border-transparent flex items-center justify-center text-slate-400 text-xs font-bold cursor-pointer overflow-hidden rounded-xl">2번 슬롯</div>
          <div onclick="selectSlotForAssignment(2)" data-slot="2" id="previewSlot2" class="drop-slot aspect-[4/5] bg-zinc-900 border-2 border-transparent flex items-center justify-center text-slate-400 text-xs font-bold cursor-pointer overflow-hidden rounded-xl">3번 슬롯</div>
          <div onclick="selectSlotForAssignment(3)" data-slot="3" id="previewSlot3" class="drop-slot aspect-[4/5] bg-zinc-900 border-2 border-transparent flex items-center justify-center text-slate-400 text-xs font-bold cursor-pointer overflow-hidden rounded-xl">4번 슬롯</div>
        </div>
      `;
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
  } else {
    if (cuts === 4) {
      container.className = "w-52 aspect-[1/3] p-2.5 shadow-2xl flex flex-col space-y-1.5 border border-slate-700 rounded-2xl transition-all";
      slotsHtml = `
        <div class="flex flex-col space-y-1 flex-1 my-1">
          <div onclick="selectSlotForAssignment(0)" data-slot="0" id="previewSlot0" class="drop-slot aspect-[3/2] bg-zinc-900 border-2 border-theme ring-2 ring-rose-400 flex items-center justify-center text-slate-400 text-[10px] font-bold cursor-pointer overflow-hidden rounded-lg">1번 슬롯</div>
          <div onclick="selectSlotForAssignment(1)" data-slot="1" id="previewSlot1" class="drop-slot aspect-[3/2] bg-zinc-900 border-2 border-transparent flex items-center justify-center text-slate-400 text-[10px] font-bold cursor-pointer overflow-hidden rounded-lg">2번 슬롯</div>
          <div onclick="selectSlotForAssignment(2)" data-slot="2" id="previewSlot2" class="drop-slot aspect-[3/2] bg-zinc-900 border-2 border-transparent flex items-center justify-center text-slate-400 text-[10px] font-bold cursor-pointer overflow-hidden rounded-lg">3번 슬롯</div>
          <div onclick="selectSlotForAssignment(3)" data-slot="3" id="previewSlot3" class="drop-slot aspect-[3/2] bg-zinc-900 border-2 border-transparent flex items-center justify-center text-slate-400 text-[10px] font-bold cursor-pointer overflow-hidden rounded-lg">4번 슬롯</div>
        </div>
      `;
    } else if (cuts === 5) {
      container.className = "w-48 aspect-[1/3.6] p-2 shadow-2xl flex flex-col space-y-1 border border-slate-700 rounded-2xl transition-all";
      slotsHtml = `
        <div class="flex flex-col space-y-1 flex-1 my-0.5">
          <div onclick="selectSlotForAssignment(0)" data-slot="0" id="previewSlot0" class="drop-slot aspect-[3/2] bg-zinc-900 border-2 border-theme ring-2 ring-rose-400 flex items-center justify-center text-slate-400 text-[9px] font-bold cursor-pointer overflow-hidden rounded">1번 슬롯</div>
          <div onclick="selectSlotForAssignment(1)" data-slot="1" id="previewSlot1" class="drop-slot aspect-[3/2] bg-zinc-900 border-2 border-transparent flex items-center justify-center text-slate-400 text-[9px] font-bold cursor-pointer overflow-hidden rounded">2번 슬롯</div>
          <div onclick="selectSlotForAssignment(2)" data-slot="2" id="previewSlot2" class="drop-slot aspect-[3/2] bg-zinc-900 border-2 border-transparent flex items-center justify-center text-slate-400 text-[9px] font-bold cursor-pointer overflow-hidden rounded">3번 슬롯</div>
          <div onclick="selectSlotForAssignment(3)" data-slot="3" id="previewSlot3" class="drop-slot aspect-[3/2] bg-zinc-900 border-2 border-transparent flex items-center justify-center text-slate-400 text-[9px] font-bold cursor-pointer overflow-hidden rounded">4번 슬롯</div>
          <div onclick="selectSlotForAssignment(4)" data-slot="4" id="previewSlot4" class="drop-slot aspect-[3/2] bg-zinc-900 border-2 border-transparent flex items-center justify-center text-slate-400 text-[9px] font-bold cursor-pointer overflow-hidden rounded">5번 슬롯</div>
        </div>
      `;
    } else if (cuts === 6) {
      container.className = "w-44 aspect-[1/4.2] p-1.5 shadow-2xl flex flex-col space-y-1 border border-slate-700 rounded-2xl transition-all";
      slotsHtml = `
        <div class="flex flex-col space-y-0.5 flex-1 my-0.5">
          <div onclick="selectSlotForAssignment(0)" data-slot="0" id="previewSlot0" class="drop-slot aspect-[3/2] bg-zinc-900 border-2 border-theme ring-2 ring-rose-400 flex items-center justify-center text-slate-400 text-[8px] font-bold cursor-pointer overflow-hidden rounded">1번 슬롯</div>
          <div onclick="selectSlotForAssignment(1)" data-slot="1" id="previewSlot1" class="drop-slot aspect-[3/2] bg-zinc-900 border-2 border-transparent flex items-center justify-center text-slate-400 text-[8px] font-bold cursor-pointer overflow-hidden rounded">2번 슬롯</div>
          <div onclick="selectSlotForAssignment(2)" data-slot="2" id="previewSlot2" class="drop-slot aspect-[3/2] bg-zinc-900 border-2 border-transparent flex items-center justify-center text-slate-400 text-[8px] font-bold cursor-pointer overflow-hidden rounded">3번 슬롯</div>
          <div onclick="selectSlotForAssignment(3)" data-slot="3" id="previewSlot3" class="drop-slot aspect-[3/2] bg-zinc-900 border-2 border-transparent flex items-center justify-center text-slate-400 text-[8px] font-bold cursor-pointer overflow-hidden rounded">4번 슬롯</div>
          <div onclick="selectSlotForAssignment(4)" data-slot="4" id="previewSlot4" class="drop-slot aspect-[3/2] bg-zinc-900 border-2 border-transparent flex items-center justify-center text-slate-400 text-[8px] font-bold cursor-pointer overflow-hidden rounded">5번 슬롯</div>
          <div onclick="selectSlotForAssignment(5)" data-slot="5" id="previewSlot5" class="drop-slot aspect-[3/2] bg-zinc-900 border-2 border-transparent flex items-center justify-center text-slate-400 text-[8px] font-bold cursor-pointer overflow-hidden rounded">6번 슬롯</div>
        </div>
      `;
    }
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

// 🌟 사진 선택 완료 후 에디터 진입 (안전한 선행 화면 전환 적용)
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

  // 1. 화면 전환을 최우선 실행하여 DOM 구조를 노출
  showScreen('screenEdit');

  // 2. 에디터 초기화
  if (!appState.stickers || appState.stickers.length === 0) {
    resetEditorToDefault();
  }

  // 3. 슬롯별 각인 입력창 렌더링
  if (typeof renderSlotEngraveInputs === 'function') {
    renderSlotEngraveInputs();
  }

  // 4. Twin 레이아웃 선택 바 노출 제어 (세로 스트립형만 노출)
  const layoutRow = document.getElementById('layoutSelectionRow');
  if (layoutRow) {
    if (appState.selectedFormat === 'strip') layoutRow.classList.remove('hidden');
    else layoutRow.classList.add('hidden');
  }

  // 5. 프레임 렌더링
  requestAnimationFrame(() => {
    renderStrip();
  });

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
  appState.engraveFontFamily = 'Playfair Display';

  appState.showDate = true;
  appState.showQrSticker = true;

  const slThick = document.getElementById('sliderThickness'); if (slThick) slThick.value = 60;
  const fineTune = document.getElementById('filterFineTunePanel'); if (fineTune) fineTune.classList.add('hidden');
  const stBar = document.getElementById('stickerControlBar'); if (stBar) stBar.classList.add('hidden');
  const qrCheck = document.getElementById('checkShowQr'); if (qrCheck) qrCheck.checked = true;
  const dateCheck = document.getElementById('checkShowDate'); if (dateCheck) dateCheck.checked = true;
  
  resetCanvasZoom();
  historyStack = []; 
  redoStack = [];

  initOrUpdateDateSticker(true);
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
// 11. 프레임 테두리 & 1:1 측면/좌측 각인 시스템
// ========================================================
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

function onEngraveFontChange(fontName) {
  appState.engraveFontFamily = fontName;
  renderStrip();
}

function onSlotEngraveTextChange(index, val) {
  appState.slotEngraveTexts[index] = val;
  renderStrip();
}

function applyDefaultSideEngrave() {
  const defaults = ["keep your memory", "photoist", "keep your memory", "photoist", "keep your memory", "photoist"];
  for (let i = 0; i < 6; i++) {
    appState.slotEngraveTexts[i] = defaults[i];
  }
  renderSlotEngraveInputs();
  renderStrip();
}

function clearSideEngrave() {
  appState.slotEngraveTexts = [" ", " ", " ", " ", " ", " "];
  renderSlotEngraveInputs();
  renderStrip();
}

function renderSlotEngraveInputs() {
  const container = document.getElementById('sideEngraveInputsContainer');
  if (!container) return;
  const cuts = appState.cutMode || 4;

  const defaultValues = ["keep your memory", "photoist", "keep your memory", "photoist", "keep your memory", "photoist"];

  container.innerHTML = Array.from({ length: cuts }, (_, i) => `
    <div class="flex items-center space-x-1.5">
      <span class="text-[9px] font-bold text-slate-400 w-11 shrink-0">#${i + 1} 각인:</span>
      <input type="text" value="${escapeHtml(appState.slotEngraveTexts[i] || defaultValues[i])}" oninput="onSlotEngraveTextChange(${i}, this.value)" class="flex-1 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs outline-none focus:border-theme">
    </div>
  `).join('');
}

// ========================================================
// 12. QR코드 프레임 각인 독립 토글 시스템
// ========================================================
function toggleQrSticker(checked) {
  saveStateForUndo();
  appState.showQrSticker = checked;

  if (checked && !appState.qrCachedDataUrl) {
    generatePreloadQrImage();
  } else {
    renderStrip();
  }
}

function generatePreloadQrImage() {
  const tempDiv = document.createElement('div');
  const fallbackUrl = window.location.href.split('?')[0];

  new QRCode(tempDiv, {
    text: fallbackUrl,
    width: 200,
    height: 200,
    correctLevel: QRCode.CorrectLevel.M
  });

  setTimeout(() => {
    const qrImg = tempDiv.querySelector('img');
    const qrCanvas = tempDiv.querySelector('canvas');
    const dataUri = qrImg && qrImg.src ? qrImg.src : (qrCanvas ? qrCanvas.toDataURL('image/png') : null);

    if (dataUri) {
      const img = new Image();
      img.onload = () => {
        appState.qrCachedDataUrl = img;
        renderStrip();
      };
      img.src = dataUri;
    }
  }, 100);
}

// ========================================================
// 13. 메인 캔버스 렌더러 (포토이스트 시그니처 단일 프레임)
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
  const isDark = (appState.frameColor === '#000000' || appState.frameColor === '#111111' || appState.frameColor === '#1E293B' || appState.frameColor === '#18181B');

  if (layout === 'strip') {
    if (cuts === 4) { canvas.width = 1200; canvas.height = 3600; }
    else if (cuts === 5) { canvas.width = 1200; canvas.height = 4200; }
    else if (cuts === 6) { canvas.width = 1200; canvas.height = 4800; }
  } else {
    canvas.width = 1800; 
    canvas.height = 2700;
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // [레이어 1: 프레임 배경색]
  ctx.fillStyle = appState.frameColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // [레이어 2: 컷수별 슬롯 렌더링 & 슬롯별 중심 좌표 수집]
  let slotCenters = [];
  if (layout === 'strip') {
    slotCenters = renderSingleStripSlots(ctx, canvas, pad, gap, cuts);
  } else if (layout === 'twin') {
    slotCenters = renderTwinStripSlots(ctx, canvas, pad, gap, cuts);
  } else {
    slotCenters = renderGridSlots(ctx, canvas, pad, gap, cuts);
  }

  // [레이어 3: 포토이스트 시그니처 각인 & 좌하단 날짜 & 우하단 QR]
  renderPhotoistEngravings(ctx, canvas, pad, isDark, layout, slotCenters, cuts);

  // [레이어 4: 감성 문구 스티커]
  renderStickersAndMirrors(ctx, canvas, layout);
}

// 1줄 세로 롱 스트립 (1x4, 1x5, 1x6)
function renderSingleStripSlots(ctx, canvas, pad, gap, cuts) {
  const topH = 170; 
  const bottomH = 220; 
  const imgW = canvas.width - (pad * 2);
  const imgH = (canvas.height - topH - bottomH - (gap * (cuts - 1))) / cuts;
  const centers = [];

  for (let i = 0; i < cuts; i++) {
    const y = topH + (i * (imgH + gap));
    drawFilteredSlotPhoto(ctx, appState.selectedImages[i], pad, y, imgW, imgH);
    centers.push({ 
      leftX: pad / 2, 
      rightX: canvas.width - (pad / 2), 
      topY: y,
      centerY: y + (imgH / 2),
      bottomY: y + imgH,
      h: imgH 
    });
  }
  return centers;
}

// 2줄 인쇄용 (Twin 1:1 대칭 절취 복제)
function renderTwinStripSlots(ctx, canvas, pad, gap, cuts) {
  const stripW = (canvas.width / 2) - 24;
  const padX = pad * 0.65;
  const imgW = stripW - (padX * 2);
  const topH = 160; 
  const bottomH = 210;
  const imgH = (canvas.height - topH - bottomH - (gap * (cuts - 1))) / cuts;
  const centers = [];

  [12, (canvas.width / 2) + 12].forEach((baseX, stripIdx) => {
    for (let i = 0; i < cuts; i++) {
      const y = topH + (i * (imgH + gap));
      drawFilteredSlotPhoto(ctx, appState.selectedImages[i], baseX + padX, y, imgW, imgH);
      centers.push({ 
        stripIdx: stripIdx,
        baseX: baseX,
        stripW: stripW,
        padX: padX,
        leftX: baseX + (padX / 2), 
        rightX: baseX + stripW - (padX / 2), 
        topY: y,
        centerY: y + (imgH / 2),
        bottomY: y + imgH,
        h: imgH,
        slotIdx: i
      });
    }
  });

  // 중앙 절취 가이드 점선
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
  ctx.textBaseline = 'middle';
  ctx.fillText('✂️', canvas.width / 2, 80);
  ctx.fillText('✂️', canvas.width / 2, canvas.height / 2);
  ctx.fillText('✂️', canvas.width / 2, canvas.height - 80);
  ctx.restore();

  return centers;
}

// 2x2 엽서형 그리드
function renderGridSlots(ctx, canvas, pad, gap, cuts) {
  const topH = 160; 
  const bottomH = 220;
  const centers = [];

  if (cuts === 4) {
    const imgW = (canvas.width - (pad * 2) - gap) / 2;
    const imgH = (canvas.height - topH - bottomH - gap) / 2;
    const coords = [
      { x: pad, y: topH },
      { x: pad + imgW + gap, y: topH },
      { x: pad, y: topH + imgH + gap },
      { x: pad + imgW + gap, y: topH + imgH + gap }
    ];

    for (let i = 0; i < 4; i++) {
      drawFilteredSlotPhoto(ctx, appState.selectedImages[i], coords[i].x, coords[i].y, imgW, imgH);
      centers.push({ 
        leftX: pad / 2, 
        rightX: canvas.width - (pad / 2), 
        topY: coords[i].y,
        centerY: coords[i].y + (imgH / 2),
        bottomY: coords[i].y + imgH,
        h: imgH 
      });
    }
  } else if (cuts === 5) {
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

    centers.push({ leftX: pad / 2, rightX: canvas.width - (pad / 2), centerY: topH + (smallH / 2) });
    centers.push({ leftX: pad / 2, rightX: canvas.width - (pad / 2), centerY: topH + (smallH / 2) });
    centers.push({ leftX: pad / 2, rightX: canvas.width - (pad / 2), centerY: midY + (bigH / 2) });
    centers.push({ leftX: pad / 2, rightX: canvas.width - (pad / 2), centerY: botY + (smallH / 2) });
    centers.push({ leftX: pad / 2, rightX: canvas.width - (pad / 2), centerY: botY + (smallH / 2) });
  } else if (cuts === 6) {
    const imgW = (canvas.width - (pad * 2) - gap) / 2;
    const imgH = (canvas.height - topH - bottomH - (gap * 2)) / 3;
    for (let row = 0; row < 3; row++) {
      const y = topH + (row * (imgH + gap));
      drawFilteredSlotPhoto(ctx, appState.selectedImages[row * 2], pad, y, imgW, imgH);
      drawFilteredSlotPhoto(ctx, appState.selectedImages[row * 2 + 1], pad + imgW + gap, y, imgW, imgH);
      centers.push({ leftX: pad / 2, rightX: canvas.width - (pad / 2), centerY: y + (imgH / 2) });
      centers.push({ leftX: pad / 2, rightX: canvas.width - (pad / 2), centerY: y + (imgH / 2) });
    }
  }

  return centers;
}

// 🌟 포토이스트 시그니처 각인 렌더러 (우측 고정 문구 / 좌측 심볼 / 좌하단 날짜 / 우하단 QR)
function renderPhotoistEngravings(ctx, canvas, pad, isDark, layout, slotCenters, cuts) {
  ctx.save();
  const textColor = isDark ? 'rgba(255,255,255,0.92)' : 'rgba(15,23,42,0.92)';
  const fontFam = appState.engraveFontFamily || 'Playfair Display';
  const adaptiveFontSize = Math.max(26, Math.min(48, Math.round(pad * 0.58)));

  // 상단 photoist 시그니처 로고
  ctx.fillStyle = textColor;
  ctx.font = "700 52px 'Playfair Display', serif";
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  if (layout === 'twin') {
    const stripW = (canvas.width / 2) - 24;
    const padX = pad * 0.65;
    ctx.fillText("photoist", 12 + padX, 90);
    ctx.fillText("photoist", (canvas.width / 2) + 12 + padX, 90);
  } else {
    ctx.fillText("photoist", pad, 95);
  }

  // 1. 우측 측면 고정 각인 (1: keep your memory, 2: photoist, 3: keep your memory, 4: photoist)
  const defaultSideWords = ["keep your memory", "photoist", "keep your memory", "photoist", "keep your memory", "photoist"];
  
  if (layout === 'twin') {
    slotCenters.forEach(slot => {
      const idx = slot.slotIdx;
      const text = (appState.slotEngraveTexts[idx] || defaultSideWords[idx % defaultSideWords.length]).trim();
      ctx.save();
      ctx.translate(slot.rightX, slot.centerY);
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = textColor;
      ctx.font = `bold ${Math.round(adaptiveFontSize * 0.85)}px '${fontFam}', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = "2px";
      ctx.fillText(text, 0, 0);
      ctx.restore();
    });
  } else {
    const totalSlots = Math.min(cuts, slotCenters.length);
    for (let i = 0; i < totalSlots; i++) {
      const text = (appState.slotEngraveTexts[i] || defaultSideWords[i % defaultSideWords.length]).trim();
      if (slotCenters[i] && text) {
        ctx.save();
        ctx.translate(slotCenters[i].rightX, slotCenters[i].centerY);
        ctx.rotate(Math.PI / 2);
        ctx.fillStyle = textColor;
        ctx.font = `bold ${adaptiveFontSize}px '${fontFam}', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.letterSpacing = "2px";
        ctx.fillText(text, 0, 0);
        ctx.restore();
      }
    }
  }

  // 2. 좌측 각인 (1번 시작: ㅁ>>, 2번 중간: <<  >>, 3번 중간: ||, 4번 바닥: FRAME >>  8. cut)
  if (layout === 'twin') {
    [0, 1].forEach(stripIdx => {
      const slots = slotCenters.filter(s => s.stripIdx === stripIdx);
      if (slots.length >= 4) {
        drawLeftFilmSymbols(ctx, slots[0].leftX, slots[0].topY + 30, slots[1].centerY, slots[2].centerY, slots[3].bottomY - 15, textColor);
      }
    });
  } else if (slotCenters.length >= 4) {
    const leftX = slotCenters[0].leftX;
    const y1 = slotCenters[0].topY + 40;
    const y2 = slotCenters[1].centerY;
    const y3 = slotCenters[2].centerY;
    const lastIdx = Math.min(cuts - 1, slotCenters.length - 1);
    const y4 = slotCenters[lastIdx].bottomY - 20;
    drawLeftFilmSymbols(ctx, leftX, y1, y2, y3, y4, textColor);
  }

  // 3. 날짜 표시 (왼쪽 하단 고정)
  if (appState.showDate) {
    ctx.save();
    ctx.fillStyle = textColor;
    ctx.font = "bold 28px 'Pretendard', sans-serif";
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    if (layout === 'twin') {
      const padX = pad * 0.65;
      const stripW = (canvas.width / 2) - 24;
      ctx.fillText(appState.typography.date, 12 + padX, canvas.height - 75);
      ctx.fillText(appState.typography.date, (canvas.width / 2) + 12 + padX, canvas.height - 75);
    } else {
      ctx.fillText(appState.typography.date, pad + 10, canvas.height - 80);
    }
    ctx.restore();
  }

  // 4. QR코드 자동 인쇄 (오른쪽 하단 고정)
  if (appState.showQrSticker && appState.qrCachedDataUrl) {
    const qrSize = Math.max(76, Math.min(100, Math.round(pad * 1.45)));

    if (layout === 'twin') {
      const padX = pad * 0.65;
      const stripW = (canvas.width / 2) - 24;
      [12, (canvas.width / 2) + 12].forEach(baseX => {
        const qrX = baseX + stripW - padX - qrSize;
        const qrY = canvas.height - 130;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8);
        ctx.drawImage(appState.qrCachedDataUrl, qrX, qrY, qrSize, qrSize);
      });
    } else {
      const qrX = canvas.width - pad - qrSize - 10;
      const qrY = canvas.height - 135;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8);
      ctx.drawImage(appState.qrCachedDataUrl, qrX, qrY, qrSize, qrSize);
    }
  }

  ctx.restore();
}

function drawLeftFilmSymbols(ctx, leftX, y1, y2, y3, y4, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 1번 사진 시작: ㅁ>>
  ctx.font = "bold 24px monospace";
  ctx.fillText("ㅁ>>", leftX, y1);

  // 2번 사진 중간: << >>
  ctx.font = "bold 22px monospace";
  ctx.fillText("<< >>", leftX, y2);

  // 3번 사진 중간: || (일시정지)
  ctx.font = "900 24px monospace";
  ctx.fillText("||", leftX, y3);

  // 4번 사진 바닥: FRAME >> 8. cut (세로 회전)
  ctx.save();
  ctx.translate(leftX, y4);
  ctx.rotate(Math.PI / 2);
  ctx.font = "bold 20px monospace";
  ctx.letterSpacing = "1.5px";
  ctx.fillText("FRAME >>  8. cut", 0, 0);
  ctx.restore();

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
    ctx.fillText('사진 로딩 중...', targetX + targetW / 2, targetY + targetH / 2);
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
      r = lum + (r - lum)*sMul; g = lum + (g - lum)*sMul; b = lum + (b - lum)*sMul; 
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

  const fontName = st.fontFamily || 'Pretendard'; 
  ctx.font = `900 ${st.size}px '${fontName}', sans-serif`; 
  ctx.fillStyle = st.color || '#FFFFFF'; 
  ctx.shadowColor = 'rgba(0,0,0,0.85)'; 
  ctx.shadowBlur = 10; 
  ctx.textAlign = 'center'; 
  ctx.textBaseline = 'middle'; 
  ctx.fillText(st.text, 0, 0);
  ctx.restore();
}

// ========================================================
// 14. 날짜 오브젝트 시스템
// ========================================================
function toggleDateObject(checked) {
  saveStateForUndo();
  appState.showDate = checked;
  renderStrip();
}

function initOrUpdateDateSticker(show) {
  appState.showDate = show;
  renderStrip();
}

// ========================================================
// 15. 2단계 돋보기 & 자석 스냅 인터랙션
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
    let approxWidth = Math.max(st.size, (st.text ? st.text.length : 1) * (st.size * 0.65));
    const maxBound = Math.max(approxWidth, st.size);
    const autoScale = safeZoneSize / Math.max(safeZoneSize, maxBound);

    lCtx.save();
    lCtx.translate(70, 70);
    lCtx.rotate(((st.rotation || 0) * Math.PI) / 180);
    lCtx.scale(autoScale, autoScale);
    lCtx.font = `900 ${st.size}px '${st.fontFamily || 'Pretendard'}', sans-serif`;
    lCtx.fillStyle = st.color || '#1E293B';
    lCtx.textAlign = 'center';
    lCtx.textBaseline = 'middle';
    lCtx.fillText(st.text, 0, 0);
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
  let baseStickerSize = 70;
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

function addTextSticker(text) {
  saveStateForUndo(); 
  const canvas = document.getElementById('photoCanvas');
  const newSticker = { 
    id: Date.now(), 
    type: 'text', 
    text: text, 
    x: canvas ? canvas.width / 2 : 600, 
    y: canvas ? canvas.height / 2 : 1800, 
    size: 70, 
    rotation: 0, 
    color: '#FFFFFF', 
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

  const cp = document.getElementById('stickerColorPicker'); 
  if (cp) cp.value = st.color || '#FFFFFF'; 
  const fs = document.getElementById('stickerFontSelect'); 
  if (fs) fs.value = st.fontFamily || 'Pretendard'; 
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
// 16. 가변 스플릿 리사이저 바 (Pointer Events API 탑재)
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
    resizer.setPointerCapture(e.pointerId);
    document.body.style.cursor = window.innerWidth >= 640 ? 'col-resize' : 'row-resize';
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!isResizing) return;
    const isLandscape = window.innerWidth >= 640 && window.innerWidth > window.innerHeight;
    
    if (isLandscape) {
      const containerRect = container.getBoundingClientRect();
      const offset = e.clientX - containerRect.left;
      const pct = Math.max(35, Math.min(75, (offset / containerRect.width) * 100));
      canvasPane.style.width = `${pct}%`;
      controlPane.style.width = `${100 - pct}%`;
    } else {
      const containerRect = container.getBoundingClientRect();
      const offset = e.clientY - containerRect.top;
      const pct = Math.max(35, Math.min(75, (offset / containerRect.height) * 100));
      canvasPane.style.height = `${pct}%`;
      controlPane.style.height = `${100 - pct}%`;
    }
  }

  function onPointerUp(e) {
    if (isResizing) {
      isResizing = false;
      try { resizer.releasePointerCapture(e.pointerId); } catch(err){}
      document.body.style.cursor = '';
    }
  }

  resizer.addEventListener('pointerdown', onPointerDown);
  resizer.addEventListener('pointermove', onPointerMove);
  resizer.addEventListener('pointerup', onPointerUp);
  resizer.addEventListener('pointercancel', onPointerUp);
}

// ========================================================
// 17. 2중 큐 무소음 자동 아카이빙 & [⭐ 추억네컷 찜] 영구 보존
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
    let favVault = JSON.parse(localStorage.getItem('photoist_favorite_vault') || '[]');

    if (isFav) {
      favVault.unshift(localEntry);
      localStorage.setItem('photoist_favorite_vault', JSON.stringify(favVault));
    } else {
      if (localArchive.length >= MAX_GALLERY_SLOTS) {
        localArchive.pop();
      }
      localArchive.unshift(localEntry);
      localStorage.setItem('chueok_local_gallery', JSON.stringify(localArchive));
    }

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
      let favVault = JSON.parse(localStorage.getItem('photoist_favorite_vault') || '[]');
      favVault = favVault.filter(p => p.id !== appState.currentPhotoId);
      localStorage.setItem('photoist_favorite_vault', JSON.stringify(favVault));
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
// 18. PIXX 연동 4대 미디어 엔진 (타임랩스, 모션컷, 루프, 사진)
// ========================================================

// ① 프레임 합성 모션컷 생성 (15Mbps)
async function generateMotionCutVideo() {
  const cuts = appState.cutMode || 4;
  const hasValidVideo = appState.selectedIndices.every(idx => idx !== null && appState.shotVideoBlobs[idx]);
  if (!hasValidVideo) {
    alert("촬영 영상 데이터가 부족합니다. 부스에서 연속 촬영을 완료했을 때 가능합니다.");
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
    if (appState.layout === 'strip') {
      vCanvas.width = 1080; 
      vCanvas.height = 3240;
    } else {
      vCanvas.width = 1440; 
      vCanvas.height = 2160;
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
      currentGeneratedVideoFileName = `Photoist_MotionCut_${Date.now()}.${ext}`;

      const modalTitle = document.getElementById('videoModalTitle');
      if (modalTitle) modalTitle.innerHTML = `<i data-lucide="video" class="w-4 h-4 text-theme mr-1"></i> 모션컷 렌더링 완료 (15Mbps)`;

      openVideoResultModal(blob);

      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i data-lucide="video" class="w-3.5 h-3.5"></i><span>모션컷</span>`;
      }
      if (window.lucide) lucide.createIcons();
    };
    recorder.start();

    const posterCanvas = document.getElementById('photoCanvas');
    const startTime = performance.now(); 
    const totalDuration = 6000;
    const isGrid = (appState.layout !== 'strip');
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

        let slotCenters = [];
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
            slotCenters.push({ leftX: pad / 2, rightX: vCanvas.width - (pad / 2), centerY: coords[i].y + (halfH / 2) });
          }
        } else {
          const slotW = vCanvas.width - (pad * 2);
          const slotH = (vCanvas.height - topH - bottomH - (gap * (cuts - 1))) / cuts;
          for (let i = 0; i < cuts; i++) {
            const vy = topH + (i * (slotH + gap));
            drawVideoSlot(vCtx, videoElements[i], pad, vy, slotW, slotH);
            slotCenters.push({ leftX: pad / 2, rightX: vCanvas.width - (pad / 2), centerY: vy + (slotH / 2) });
          }
        }

        renderPhotoistEngravings(vCtx, vCanvas, pad, (appState.frameColor === '#000000' || appState.frameColor === '#111111'), appState.layout, slotCenters, cuts);
        renderStickersAndMirrors(vCtx, vCanvas, appState.layout);
      }

      if (elapsed < totalDuration) requestAnimationFrame(renderVideoLoop); 
      else recorder.stop();
    }
    requestAnimationFrame(renderVideoLoop);
  } catch (err) { 
    alert("모션컷 생성 실패: " + err.message); 
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i data-lucide="video" class="w-3.5 h-3.5"></i><span>모션컷</span>`; 
    }
    if (window.lucide) lucide.createIcons(); 
  }
}

// ② 4.0배속 타임랩스 비디오 생성
async function generateTimelapseFullVideo() {
  if (!appState.fullSessionVideoBlob) {
    alert("촬영 전 과정 녹화 데이터가 준비되지 않았습니다. 부스에서 6컷 촬영을 완료해 주세요.");
    return;
  }

  const btn = document.getElementById('btnTimelapseVideo');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i><span>4x 가속 중</span>`;
  }
  if (window.lucide) lucide.createIcons();

  try {
    const v = document.createElement('video');
    v.src = URL.createObjectURL(appState.fullSessionVideoBlob);
    v.muted = true;
    v.playsInline = true;

    await new Promise((res) => {
      v.onloadedmetadata = () => {
        v.playbackRate = 4.0;
        v.play().then(res).catch(res);
      };
    });

    const tCanvas = document.createElement('canvas');
    tCanvas.width = v.videoWidth || 1280;
    tCanvas.height = v.videoHeight || 720;
    const tCtx = tCanvas.getContext('2d');
    tCtx.imageSmoothingEnabled = true;

    let mimeType = 'video/mp4';
    if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported('video/mp4')) {
      mimeType = (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) ? 'video/webm;codecs=vp8' : 'video/webm';
    }

    const stream = tCanvas.captureStream(60);
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 15000000
    });
    const chunks = [];
    recorder.ondataavailable = e => { if (e.data && e.data.size > 0) chunks.push(e.data); };

    recorder.onstop = () => {
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(chunks, { type: mimeType });
      currentGeneratedVideoBlob = blob;
      currentGeneratedVideoFileName = `Photoist_Timelapse_4x_${Date.now()}.${ext}`;

      const modalTitle = document.getElementById('videoModalTitle');
      if (modalTitle) modalTitle.innerHTML = `<i data-lucide="zap" class="w-4 h-4 text-amber-500 mr-1"></i> 4x 타임랩스 렌더링 완료`;

      openVideoResultModal(blob);

      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i data-lucide="zap" class="w-3.5 h-3.5"></i><span>4x타임랩스</span>`;
      }
      if (window.lucide) lucide.createIcons();
    };

    recorder.start();

    function renderTimelapseLoop() {
      if (v.ended || v.paused) {
        recorder.stop();
        return;
      }
      tCtx.drawImage(v, 0, 0, tCanvas.width, tCanvas.height);
      requestAnimationFrame(renderTimelapseLoop);
    }
    requestAnimationFrame(renderTimelapseLoop);

  } catch (err) {
    alert("타임랩스 생성 실패: " + err.message);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i data-lucide="zap" class="w-3.5 h-3.5"></i><span>4x타임랩스</span>`;
    }
    if (window.lucide) lucide.createIcons();
  }
}

// ③ 부메랑 반복 루프 생성 (앞으로 재생 + 뒤로 재생)
async function generateLoopBoomerangBlob() {
  const cuts = appState.cutMode || 4;
  const hasValidVideo = appState.selectedIndices.every(idx => idx !== null && appState.shotVideoBlobs[idx]);
  if (!hasValidVideo) return null;

  try {
    const v = document.createElement('video');
    v.src = URL.createObjectURL(appState.shotVideoBlobs[appState.selectedIndices[0]]);
    v.muted = true;
    v.playsInline = true;

    await new Promise((res) => { v.onloadedmetadata = () => res(); });

    const bCanvas = document.createElement('canvas');
    bCanvas.width = v.videoWidth || 1280;
    bCanvas.height = v.videoHeight || 720;
    const bCtx = bCanvas.getContext('2d');

    const stream = bCanvas.captureStream(60);
    const mimeType = (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/mp4')) ? 'video/mp4' : 'video/webm';
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 12000000 });
    const chunks = [];
    recorder.ondataavailable = e => { if (e.data && e.data.size > 0) chunks.push(e.data); };

    return new Promise(async (resolve) => {
      recorder.onstop = () => {
        resolve(new Blob(chunks, { type: mimeType }));
      };
      recorder.start();

      v.currentTime = 0;
      await v.play().catch(()=>{});
      const drawForward = () => {
        if (v.currentTime < (v.duration || 2.5) && !v.paused) {
          bCtx.drawImage(v, 0, 0, bCanvas.width, bCanvas.height);
          requestAnimationFrame(drawForward);
        } else {
          let revTime = v.duration || 2.5;
          const drawBackward = () => {
            revTime -= 0.05;
            if (revTime > 0) {
              v.currentTime = revTime;
              bCtx.drawImage(v, 0, 0, bCanvas.width, bCanvas.height);
              setTimeout(drawBackward, 33);
            } else {
              recorder.stop();
            }
          };
          drawBackward();
        }
      };
      drawForward();
    });
  } catch (e) {
    return null;
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

// ========================================================
// 19. PIXX 스타일 디지털 뷰어 QR 발급 및 세션 번들 업로드
// ========================================================
async function generateImageQRCode() {
  const btn = document.getElementById('btnSaveQR'); 
  if (btn) { 
    btn.disabled = true; 
    btn.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i><span>뷰어 생성 중</span>`; 
  }
  if (window.lucide) lucide.createIcons();

  renderStrip(true); 
  const canvas = document.getElementById('photoCanvas'); 
  if (!canvas) return;

  autoArchiveToCloudQuietly(canvas, appState.isCurrentFavorite);

  // 스마트 듀얼 리샘플러: 해상도 1200x2400 축소 + JPEG 0.90 압축 (500KB 경량화)
  const uploadOffCanvas = document.createElement('canvas');
  const targetMaxW = 1200;
  const scale = targetMaxW / canvas.width;
  uploadOffCanvas.width = targetMaxW;
  uploadOffCanvas.height = Math.round(canvas.height * scale);
  const uCtx = uploadOffCanvas.getContext('2d');
  uCtx.imageSmoothingEnabled = true;
  uCtx.imageSmoothingQuality = 'high';
  uCtx.drawImage(canvas, 0, 0, uploadOffCanvas.width, uploadOffCanvas.height);

  const base64Img = uploadOffCanvas.toDataURL('image/jpeg', 0.90);
  const sessionId = "session_" + Date.now();

  try {
    // 1차: 사진 파일 세션 업로드
    const photoRes = await uploadSessionMedia(sessionId, 'photo', extractPureBase64(base64Img), 'image/jpeg');
    const photoFileId = photoRes && photoRes.fileId ? photoRes.fileId : '';

    // 2차: 타임랩스 녹화본 백그라운드 세션 업로드
    if (appState.fullSessionVideoBlob) {
      blobToBase64(appState.fullSessionVideoBlob).then(b64 => {
        uploadSessionMedia(sessionId, 'timelapse', extractPureBase64(b64), 'video/webm').catch(()=>{});
      });
    }

    // PIXX 스타일 전용 디지털 뷰어 직결 링크 생성
    const basePath = window.location.href.split('?')[0].replace('index.html', '');
    const viewerUrl = `${basePath}viewer.html?id=${sessionId}&photo=${photoFileId}`;

    if (btn) { 
      btn.disabled = false; 
      btn.innerHTML = `<i data-lucide="qr-code" class="w-3.5 h-3.5"></i><span>QR 뷰어</span>`; 
    }
    if (window.lucide) lucide.createIcons();

    displayResultWithQR(viewerUrl);

  } catch (err) {
    if (btn) { 
      btn.disabled = false; 
      btn.innerHTML = `<i data-lucide="qr-code" class="w-3.5 h-3.5"></i><span>QR 뷰어</span>`; 
    }
    if (window.lucide) lucide.createIcons();
    alert("디지털 뷰어 생성 중 오류가 발생했습니다: " + err.message);
  }
}

async function uploadSessionMedia(sessionId, mediaType, pureBase64, mimeType) {
  try {
    const res = await fetch(GOOGLE_DB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'UPLOAD_SESSION_MEDIA',
        sessionId: sessionId,
        mediaType: mediaType,
        base64Data: pureBase64,
        mimeType: mimeType
      })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

function sharePhotoDirectly() {
  renderStrip(true); 
  const canvas = document.getElementById('photoCanvas'); 
  if (!canvas) return;

  autoArchiveToCloudQuietly(canvas, appState.isCurrentFavorite);

  canvas.toBlob(async (blob) => {
    if (!blob) return; 
    const file = new File([blob], `Photoist_Photo_${Date.now()}.png`, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { 
      try { await navigator.share({ files: [file], title: '포토이스트', text: '포토이스트 네컷 사진입니다!' }); } catch (err) {} 
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
  a.download = currentGeneratedVideoFileName || `Photoist_Video_${Date.now()}.mp4`;
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
        text: '포토이스트 영상입니다! 🎬'
      });
      return;
    } catch (e) {
      if (e.name === 'AbortError') return;
    }
  }
  downloadCurrentVideoFile();
}

// ========================================================
// 20. 이용후기, 고객소리함 & 관리자 모드
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
      id: 'v17_4_init', 
      date: getFormattedTodayDate(), 
      version: APP_VERSION, 
      content: 'v17.4 Pro: PIXX 스타일 디지털 뷰어, 4x 타임랩스, 시그니처 각인 & QR 인쇄 업데이트 완료!' 
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
      <span class="bg-theme text-white text-[9px] font-black px-1.5 py-0.5 rounded shrink-0">v17.4 Pro</span>
      <p class="text-[11px] font-bold text-slate-800 truncate ml-2">PIXX 스타일 디지털 뷰어, 4x 타임랩스, 시그니처 각인 업데이트!</p>
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
// 21. 화면 전환 & 라이프사이클 관리
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
      frameColor: appState.frameColor,
      frameThickness: appState.frameThickness,
      activeFilter: appState.activeFilter,
      filters: appState.filters,
      typography: appState.typography,
      stickers: appState.stickers,
      slotEngraveTexts: appState.slotEngraveTexts,
      engraveFontFamily: appState.engraveFontFamily,
      showQrSticker: appState.showQrSticker,
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
    appState.frameColor = data.frameColor;
    appState.frameThickness = data.frameThickness;
    appState.activeFilter = data.activeFilter;
    appState.filters = data.filters;
    appState.typography = data.typography;
    appState.stickers = data.stickers || [];
    appState.slotEngraveTexts = data.slotEngraveTexts || ["", "", "", "", "", ""];
    appState.engraveFontFamily = data.engraveFontFamily || 'Playfair Display';
    appState.showQrSticker = data.showQrSticker !== undefined ? data.showQrSticker : true;

    const imgPromises = data.images.map(src => new Promise(res => {
      if (!src) return res(null);
      const img = new Image();
      img.onload = () => res(img);
      img.src = src;
    }));

    Promise.all(imgPromises).then(imgs => {
      appState.selectedImages = imgs.filter(Boolean);
      showScreen('screenEdit');
      renderSlotEngraveInputs();

      const qrCheck = document.getElementById('checkShowQr');
      if (qrCheck) qrCheck.checked = appState.showQrSticker;
      if (appState.showQrSticker) generatePreloadQrImage();

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
    cutMode: appState.cutMode, stickers: appState.stickers, layout: appState.layout,
    frameThickness: appState.frameThickness, frameColor: appState.frameColor, activeFilter: appState.activeFilter,
    filters: appState.filters, typography: appState.typography, showDate: appState.showDate,
    showQrSticker: appState.showQrSticker, isCurrentFavorite: appState.isCurrentFavorite, 
    slotEngraveTexts: appState.slotEngraveTexts, engraveFontFamily: appState.engraveFontFamily
  });
  historyStack.push(snapshot); 
  if (historyStack.length > 25) historyStack.shift(); 
  redoStack = [];
}

function undo() {
  if (historyStack.length === 0) return;
  const currentSnap = JSON.stringify({
    cutMode: appState.cutMode, stickers: appState.stickers, layout: appState.layout,
    frameThickness: appState.frameThickness, frameColor: appState.frameColor, activeFilter: appState.activeFilter,
    filters: appState.filters, typography: appState.typography, showDate: appState.showDate,
    showQrSticker: appState.showQrSticker, isCurrentFavorite: appState.isCurrentFavorite, 
    slotEngraveTexts: appState.slotEngraveTexts, engraveFontFamily: appState.engraveFontFamily
  });
  redoStack.push(currentSnap);
  applySnapshot(JSON.parse(historyStack.pop()));
}

function redo() {
  if (redoStack.length === 0) return;
  const currentSnap = JSON.stringify({
    cutMode: appState.cutMode, stickers: appState.stickers, layout: appState.layout,
    frameThickness: appState.frameThickness, frameColor: appState.frameColor, activeFilter: appState.activeFilter,
    filters: appState.filters, typography: appState.typography, showDate: appState.showDate,
    showQrSticker: appState.showQrSticker, isCurrentFavorite: appState.isCurrentFavorite, 
    slotEngraveTexts: appState.slotEngraveTexts, engraveFontFamily: appState.engraveFontFamily
  });
  historyStack.push(currentSnap);
  applySnapshot(JSON.parse(redoStack.pop()));
}

function applySnapshot(snap) {
  appState.cutMode = snap.cutMode || 4;
  appState.stickers = snap.stickers || []; 
  appState.layout = snap.layout; 
  appState.frameThickness = snap.frameThickness; 
  appState.frameColor = snap.frameColor; 
  appState.activeFilter = snap.activeFilter;
  appState.filters = snap.filters; 
  appState.typography = snap.typography;
  appState.showDate = snap.showDate !== undefined ? snap.showDate : true;
  appState.showQrSticker = snap.showQrSticker !== undefined ? snap.showQrSticker : true;
  appState.isCurrentFavorite = snap.isCurrentFavorite || false;
  appState.slotEngraveTexts = snap.slotEngraveTexts || ["", "", "", "", "", ""];
  appState.engraveFontFamily = snap.engraveFontFamily || 'Playfair Display';
  
  const dateCheck = document.getElementById('checkShowDate');
  if (dateCheck) dateCheck.checked = appState.showDate;
  const qrCheck = document.getElementById('checkShowQr');
  if (qrCheck) qrCheck.checked = appState.showQrSticker;
  const fontSel = document.getElementById('engraveFontSelect');
  if (fontSel) fontSel.value = appState.engraveFontFamily;

  renderSlotEngraveInputs();
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

function setTimerSec(sec, btn) { 
  appState.timerSec = sec; 
  document.querySelectorAll('.timer-chip').forEach(b => { 
    b.className = "timer-chip bg-white border border-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded text-[10px]"; 
  }); 
  if (btn) btn.className = "timer-chip bg-theme text-white font-bold px-1.5 py-0.5 rounded text-[10px] shadow-xs"; 
}

function initDynamicUI() {
  const texts = [
    'PHOTOIST', 'BEST MOMENT', 'KEEP YOUR MEMORY', 'YOUTH', 'HAPPY DAY', 
    'VIBE', 'CHILL', 'FOREVER', '완벽한 하루', '오늘의 우리', '기억해 이 순간', 
    '영원한 청춘', 'LUCKY DAY', 'MEMORIES', 'SO CUTE', 'SMILE'
  ];
  const textStickerGrid = document.getElementById('textStickerGrid');
  if (textStickerGrid) {
    textStickerGrid.innerHTML = texts.map(t => `
      <button onclick="addTextSticker('${t}')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-xl border border-slate-300 shrink-0 cursor-pointer active:scale-95 transition shadow-2xs">
        ${t}
      </button>
    `).join('');
  }

  const extGrid = document.getElementById('frameColorGridExtended');
  if (extGrid) {
    extGrid.innerHTML = EXTENDED_PALETTE_COLORS.map(c => `
      <button onclick="changeFrameColor('${c}', this)" class="color-btn w-6 h-6 rounded-full border border-slate-200 shadow-2xs mx-auto hover:scale-110 active:scale-95 transition" style="background-color:${c};" title="${c}"></button>
    `).join('');
  }
}

// ========================================================
// 22. 🌟 window 전역 인터랙션 함수 바인딩 (에러 차단 클린 바인딩)
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

window.changeFrameColor = changeFrameColor;
window.changeLayout = changeLayout;
window.onThicknessChange = onThicknessChange;
window.handleFilterClick = handleFilterClick;
window.onFineTuneSliderChange = onFineTuneSliderChange;
window.toggleDateObject = toggleDateObject;
window.toggleQrSticker = toggleQrSticker;

window.onSlotEngraveTextChange = onSlotEngraveTextChange;
window.onEngraveFontChange = onEngraveFontChange;
window.applyDefaultSideEngrave = applyDefaultSideEngrave;
window.clearSideEngrave = clearSideEngrave;

window.addTextSticker = addTextSticker;
window.clearAllStickers = clearAllStickers;
window.onSelectedStickerRotate = onSelectedStickerRotate;
window.onSelectedStickerResize = onSelectedStickerResize;
window.onSelectedStickerColorChange = onSelectedStickerColorChange;
window.onSelectedStickerFontChange = onSelectedStickerFontChange;
window.deleteSelectedSticker = deleteSelectedSticker;

window.toggleFavoriteStrip = toggleFavoriteStrip;
window.generateMotionCutVideo = generateMotionCutVideo;
window.generateTimelapseFullVideo = generateTimelapseFullVideo;
window.generateLoopBoomerangBlob = generateLoopBoomerangBlob;
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
window.processFindId = processFindId;
window.processResetPasswordDirect = processResetPasswordDirect;

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
// 23. 앱 초기 구동 엔트리포인트 (동적 뷰포트 & 이벤트 바인딩)
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
  generatePreloadQrImage();

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
