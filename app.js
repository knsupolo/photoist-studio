/**
 * 추억의 네컷 Studio Pro v17.3 Pro [1편 / 전반부]
 * 
 * [v17.3 Pro 주요 엔진 및 수정 반영]
 * 1. 최신 구글 웹앱 배포 URL 연동 (2026.09 배포본)
 * 2. 🌟 카메라 회전 안내 오버레이 개선: 반투명 카메라 비침 유지 & 우측 상단 닫기(X) 추가
 * 3. 🌟 2x2 세로모드 촬영 시작 시 화면 축소 버그 원천 해결 (뷰포트 fixed 및 뷰파인더 고정)
 * 4. 🌟 사진 배치(screenPick) 화면: 포토이스트(photoist) 매트 블랙(#111111) 통일
 * 5. 🌟 초기 슬롯 비우기(Empty Slots): 사용자가 직접 탭/드래그하여 원하는 위치에 담는 방식 복원
 * 6. 🌟 4컷 / 5컷(화보형: 상2-중1대형-하2) / 6컷(2x3 그리드 & 1x6 스트립) 가변 선택 엔진
 * 7. 🌟 4자리 PIN 로그인 완전 삭제 (아이디/비밀번호 단일 체계로 간소화)
 * 8. 🌟 회원가입 유효성 강화: 이름 + 생년월일 6자리 중복 가입 방지 & 비밀번호 확인 일치 검증
 * 9. 🌟 마이페이지 (내 정보 관리): 10종 앱 전체 UI 테마 선택기 탑재 (시그니처 색상 제거)
 * 10. 상단 딤드 그라데이션 제거 & iOS/아이패드 뷰포트 높이(--app-vh) 동적 보정
 */

// 🌟 제공해주신 최신 구글 웹앱 배포 URL
const GOOGLE_DB_URL = "https://script.google.com/macros/s/AKfycbxrzyzjxdSmUPUNDX2w2IL7TWmSFvsa_z4WgmRORtgtiiLCEKRZ2uyMLTRGp9uo96YYWQ/exec";
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
  
  // 🌟 4·5·6컷 가변 프레임 상태
  cutMode: 4, // 4 | 5 | 6
  shotImages: [],
  selectedImages: [],
  selectedIndices: [null, null, null, null], // 🌟 초기 슬롯은 완전히 비워둠
  activeSlotIndex: 0,
  shotVideoBlobs: [],
  currentMediaRecorder: null,
  currentShotVideoChunks: [],

  themeCategory: 'basic',
  frameStyle: 'middle',
  frameColor: '#000000',
  frameThickness: 60,
  layout: 'strip',
  customEngraveText: '', // 🌟 측면 커스텀 각인 문구

  activeFilter: 'normal',
  filters: { bright: 100, contrast: 100, saturate: 100 },
  showDate: true,
  isCurrentFavorite: false, // 🌟 [추억네컷 찜] 상태
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
// 2. 동적 뷰포트(--app-vh) & 하이브리드 위치 텔레메트리
// ========================================================
function updateDynamicViewportHeight() {
  const vh = window.innerHeight * 0.01;
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
  const telemetry = await collectDeviceTelemetry();
  try {
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
// 3. 🌟 회원 인증 (PIN 완전 삭제, 이름+생년월일 6자리 중복 방지)
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

// 🌟 회원가입 처리 (비밀번호 확인 + 이름 + 생년월일 6자리 검증)
async function processRegister() {
  const name = (document.getElementById('regUserName').value || "").trim();
  const dob = (document.getElementById('regUserDob').value || "").trim();
  const id = (document.getElementById('regUserId').value || "").trim().toLowerCase();
  const pw = document.getElementById('regUserPw').value;
  const pwConfirm = document.getElementById('regUserPwConfirm').value;
  const email = (document.getElementById('regUserEmail').value || "").trim().toLowerCase();

  if (!name || name.length < 2) {
    alert("이름을 2자 이상 올바르게 입력해주세요.");
    return;
  }
  if (!dob || dob.length !== 6 || isNaN(dob)) {
    alert("생년월일은 앞자리 6자리 숫자(예: 980521)로 입력해주세요.");
    return;
  }
  if (!id || id.length < 4 || id.length > 12) {
    alert("아이디는 4~12자리 영문 또는 숫자여야 합니다.");
    return;
  }
  if (!pw || pw.length < 6 || !/(?=.*[A-Za-z])(?=.*\d)/.test(pw)) {
    alert("비밀번호는 6자리 이상 영문과 숫자를 혼합해야 합니다.");
    return;
  }
  if (pw !== pwConfirm) {
    alert("비밀번호와 비밀번호 확인 입력값이 일치하지 않습니다.");
    return;
  }
  if (!email || !email.includes('@')) {
    alert("올바른 이메일 주소를 입력해주세요.");
    return;
  }

  try {
    const res = await fetch(GOOGLE_DB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'REGISTER', name: name, userId: id, userPw: pw, dob: dob, email: email })
    });
    const data = await res.json();
    if (data.success) {
      alert(`🎉 회원가입이 완료되었습니다!\n환영합니다, ${name}님. 로그인 후 스튜디오를 이용해 보세요.`);
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

// 🌟 로그인 처리 (knsupolo 마스터 직통 인증)
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

// 🌟 계정 복구 센터: 이름 + 생년월일 6자리 + 이메일 대조
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
// 4. 🌟 마이페이지 (PIN 삭제 & 프로그램 전체 UI 10종 테마 선택)
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

// 🌟 UI 테마 클라우드 및 로컬 동기화
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
// 5. 초기화면 멀티 공유 센터 (대형 QR & 에어드롭/카카오톡)
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
    title: '추억의 네컷 Studio Pro v17.3 Pro',
    text: '지금 친구들과 함께 모바일로 추억의 네컷 사진을 촬영해 보세요! 📸✨',
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

  // 1차: 브라우저 로컬 저장소 즉시 렌더링 (통신 지연 0초)
  const localArchive = JSON.parse(localStorage.getItem('chueok_local_gallery') || '[]');
  cachedUserGalleryPhotos = localArchive;
  renderFilteredGalleryGrid();

  // 2차: 로그인 상태일 경우 구글 클라우드와 백그라운드 동기화
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
  // 로컬 상태 즉시 토글
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
// 7. 🌟 카메라 회전 감지 & 오버레이 X 닫기 예외 처리
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
// 8. 🌟 카메라 구도 대기실 (2x2 세로모드 풀화면 고정 & 축소 방지)
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

  // 컷수에 맞춘 초기 슬롯 빈 배열 생성 (기본 4컷)
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

  // 풀화면 비율 강제 지정
  setViewfinderRatio('full', null);

  startCameraStream();
  setTimeout(checkDeviceOrientation, 300);
}

window.startSession = startSession;

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
// 9. 🌟 6컷 연속 촬영 (풀화면 유지 & 축소 차단)
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

  // 🌟 화면 축소 방지: 풀화면 뷰파인더 유지
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
      videoBitsPerSecond: 15000000 // 🌟 15Mbps 초고화질 녹화
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
// 10. 🌟 사진 선택 (포토이스트 매트블랙 통일, 초기 빈 슬롯, 4·5·6컷 가변 지원)
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

// 🌟 포토이스트(#111111) 매트블랙 통일 & 4·5·6컷 레이아웃 빌더
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
  } 
  // 🌟 5컷 모드 (화보형: 상단 2컷, 가운데 와이드 1컷, 하단 2컷)
  else if (cuts === 5) {
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
  }
  // 🌟 6컷 모드 (2x3 그리드)
  else if (cuts === 6) {
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
  // 빈 슬롯이 있으면 순서대로 채워줌
  for (let i = 0; i < cuts; i++) {
    if (appState.selectedIndices[i] === null || !appState.shotImages[appState.selectedIndices[i]]) {
      appState.selectedIndices[i] = (i < appState.shotImages.length) ? i : 0;
    }
  }

  playMotorPrintSound(); // 아날로그 필름 모터 인화음 재생
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

// 앨범 업로드 (4~6장 지원)
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
// 11. 테마 컨트롤러 & 프레임 스타일 제어 (Theme & Frame Styles)
// ========================================================
function setFrameThemeCategory(categoryKey, btn) {
  appState.themeCategory = categoryKey;
  document.querySelectorAll('.theme-tab-btn').forEach(b => {
    b.className = "theme-tab-btn flex-1 py-1.5 text-slate-400 font-bold text-xs rounded-lg transition";
  });
  if (btn) btn.className = "theme-tab-btn flex-1 py-1.5 bg-[#222222] text-white font-black text-xs rounded-lg shadow-sm transition";

  const basicPanel = document.getElementById('themeGroupBasic');
  const simplePanel = document.getElementById('themeGroupSimple');
  const premiumPanel = document.getElementById('themeGroupPremium');

  if (basicPanel) basicPanel.classList.toggle('hidden', categoryKey !== 'basic');
  if (simplePanel) simplePanel.classList.toggle('hidden', categoryKey !== 'simple');
  if (premiumPanel) premiumPanel.classList.toggle('hidden', categoryKey !== 'premium');
}

function setFrameStyle(styleKey, btn) {
  saveStateForUndo();
  appState.frameStyle = styleKey;

  document.querySelectorAll('.style-btn').forEach(b => {
    b.className = "style-btn bg-[#1a1a1a] text-slate-300 font-bold py-2 px-3 rounded-xl border border-white/10 text-xs hover:border-white/30 transition";
  });
  if (btn) {
    btn.className = "style-btn bg-white text-black font-black py-2 px-3 rounded-xl border border-white shadow-md text-xs transition";
  }

  const label = document.getElementById('labelCustomText');
  const sigInput = document.getElementById('frameSignatureInput');
  const colorPickerContainer = document.getElementById('frameColorPickerWrapper');

  // 기본 테마 계열
  if (styleKey === 'basic_top') {
    if (label) label.textContent = "상단 문구 설정";
    if (sigInput) sigInput.value = "photoist Studio";
    if (colorPickerContainer) colorPickerContainer.classList.remove('hidden');
  } else if (styleKey === 'basic_middle') {
    if (label) label.textContent = "중간 문구 설정";
    if (sigInput) sigInput.value = "추억의 네컷";
    if (colorPickerContainer) colorPickerContainer.classList.remove('hidden');
  } else if (styleKey === 'basic_bottom') {
    if (label) label.textContent = "하단 문구 설정";
    if (sigInput) sigInput.value = "MEMORIES OF TODAY";
    if (colorPickerContainer) colorPickerContainer.classList.remove('hidden');
  } else if (styleKey === 'basic_stepped') {
    if (label) label.textContent = "계단형 Safe Zone 문구";
    if (sigInput) sigInput.value = "STEP BY STEP";
    if (colorPickerContainer) colorPickerContainer.classList.remove('hidden');
  } else if (styleKey === 'basic_clean') {
    if (label) label.textContent = "클린 무각인 (여백 유지)";
    if (sigInput) sigInput.value = "";
    if (colorPickerContainer) colorPickerContainer.classList.remove('hidden');
  }
  // 심플 테마 계열
  else if (styleKey === 'simple_minimal_line') {
    if (label) label.textContent = "미니멀 라인 문구";
    if (sigInput) sigInput.value = "M I N I M A L";
    if (colorPickerContainer) colorPickerContainer.classList.remove('hidden');
  } else if (styleKey === 'simple_polaroid_wide') {
    if (label) label.textContent = "폴라로이드 와이드 서명";
    if (sigInput) sigInput.value = "Our Precious Time";
    if (colorPickerContainer) colorPickerContainer.classList.remove('hidden');
  } else if (styleKey === 'simple_inset_magazine') {
    if (label) label.textContent = "인셋 매거진 타이틀";
    if (sigInput) sigInput.value = "PHOTOIST MAGAZINE ISSUE #01";
    if (colorPickerContainer) colorPickerContainer.classList.remove('hidden');
  }
  // 프리미엄 스페셜 테마 계열
  else if (styleKey === 'photoist') {
    if (label) label.textContent = "포토이스트 시그니처";
    if (sigInput) sigInput.value = "photoist";
    appState.frameColor = '#0a0a0a';
  } else if (styleKey === 'birthday') {
    if (label) label.textContent = "생일 축하 문구";
    if (sigInput) sigInput.value = "Happy Birthday to You 🎉";
  } else if (styleKey === 'baseball') {
    if (label) label.textContent = "베이스볼 타이틀";
    if (sigInput) sigInput.value = "Play Ball! Home Run ⚾";
  }

  renderStrip();
}

function toggleSideEngraving(enabled) {
  saveStateForUndo();
  appState.sideEngravingEnabled = enabled;
  const panel = document.getElementById('sideEngravingConfigPanel');
  if (panel) panel.classList.toggle('hidden', !enabled);
  renderStrip();
}

function setSideEngravingText(text) {
  appState.sideEngravingText = text;
  renderStrip();
}

function applyDefaultSideEngraving() {
  saveStateForUndo();
  appState.sideEngravingEnabled = true;
  appState.sideEngravingText = "PHOTOIST STUDIO • KEEP YOUR MOMENT";
  const inp = document.getElementById('sideEngravingInput');
  if (inp) inp.value = appState.sideEngravingText;
  const toggle = document.getElementById('sideEngravingToggle');
  if (toggle) toggle.checked = true;
  const panel = document.getElementById('sideEngravingConfigPanel');
  if (panel) panel.classList.remove('hidden');
  renderStrip();
}

function removeSideEngraving() {
  saveStateForUndo();
  appState.sideEngravingEnabled = false;
  appState.sideEngravingText = "";
  const inp = document.getElementById('sideEngravingInput');
  if (inp) inp.value = "";
  const toggle = document.getElementById('sideEngravingToggle');
  if (toggle) toggle.checked = false;
  const panel = document.getElementById('sideEngravingConfigPanel');
  if (panel) panel.classList.add('hidden');
  renderStrip();
}

function onThicknessChange(val) {
  appState.frameThickness = parseInt(val, 10);
  const valLabel = document.getElementById('valThickness');
  if (valLabel) valLabel.textContent = `${appState.frameThickness}px`;
  renderStrip();
}

function changeFrameColor(color, btn) {
  saveStateForUndo();
  appState.frameColor = color;
  document.querySelectorAll('.color-btn').forEach(b => {
    b.classList.remove('ring-2', 'ring-white', 'scale-110');
  });
  if (btn) btn.classList.add('ring-2', 'ring-white', 'scale-110');

  const lightColors = ['#FFFFFF', '#F8FAFC', '#E2E8F0', '#FECDD3', '#BAE6FD', '#FAF7EE', '#FDFBF7'];
  if (lightColors.includes(color.toUpperCase())) {
    appState.typography.fontColor = '#111111';
  } else {
    appState.typography.fontColor = '#FFFFFF';
  }
  const picker = document.getElementById('fontColorPicker');
  if (picker) picker.value = appState.typography.fontColor;
  renderStrip();
}

function setFontFamily(fontName, btn) {
  saveStateForUndo();
  appState.typography.fontFamily = fontName;
  document.querySelectorAll('.font-btn').forEach(b => {
    b.classList.remove('border-rose-500', 'bg-white/20', 'text-white');
    b.classList.add('border-white/10', 'text-slate-400');
  });
  if (btn) {
    btn.classList.add('border-rose-500', 'bg-white/20', 'text-white');
    btn.classList.remove('border-white/10', 'text-slate-400');
  }
  renderStrip();
}

function toggleFontBold() {
  saveStateForUndo();
  appState.typography.isBold = !appState.typography.isBold;
  const btn = document.getElementById('btnFontBold');
  if (btn) {
    btn.className = appState.typography.isBold
      ? "px-2.5 py-1 rounded-lg text-xs font-black bg-white text-black transition"
      : "px-2.5 py-1 rounded-lg text-xs font-normal bg-white/10 text-white border border-white/20 transition";
  }
  renderStrip();
}

function onFontColorChange(color) {
  appState.typography.fontColor = color;
  renderStrip();
}

function onFontSizeChange(size) {
  appState.typography.fontSize = parseInt(size, 10);
  const lbl = document.getElementById('valFontSize');
  if (lbl) lbl.textContent = `${size}px`;
  renderStrip();
}

function toggleShowDate(checked) {
  saveStateForUndo();
  appState.showDate = checked;
  renderStrip();
}

// ========================================================
// 12. 감성 필터 및 화질 보정 엔진 (Filters & Color Adjustments)
// ========================================================
function handleFilterClick(filterKey, btn) {
  const isAlreadyActive = (appState.activeFilter === filterKey);
  if (!isAlreadyActive) {
    saveStateForUndo();
    appState.activeFilter = filterKey;
    const p = FILTER_PRESETS[filterKey] || FILTER_PRESETS.normal;
    appState.filters = { bright: p.bright, contrast: p.contrast, saturate: p.saturate };

    document.querySelectorAll('.filter-btn').forEach(b => {
      b.className = "filter-btn bg-[#181818] text-slate-300 font-bold py-1.5 rounded-lg border border-white/10 text-xs transition";
    });
    if (btn) {
      btn.className = "filter-btn bg-white text-black font-black py-1.5 rounded-lg border border-white text-xs shadow-md transition";
    }

    const badge = document.getElementById('filterStateBadge');
    if (badge) badge.textContent = p.name;
    const sb = document.getElementById('sliderBright');
    const sc = document.getElementById('sliderContrast');
    const ss = document.getElementById('sliderSaturate');
    if (sb) sb.value = p.bright;
    if (sc) sc.value = p.contrast;
    if (ss) ss.value = p.saturate;
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
  if (sb) appState.filters.bright = parseInt(sb.value, 10);
  if (sc) appState.filters.contrast = parseInt(sc.value, 10);
  if (ss) appState.filters.saturate = parseInt(ss.value, 10);
  renderStrip();
}

function applyPixelFilterMath(imageData, filterKey, customAdjust) {
  const d = imageData.data;
  const len = d.length;
  const bMul = (customAdjust.bright || 100) / 100;
  const cFactor = (((customAdjust.contrast || 100) - 100) * 2.55) / 255 + 1;
  const sMul = (customAdjust.saturate || 100) / 100;

  for (let i = 0; i < len; i += 4) {
    let r = d[i], g = d[i + 1], b = d[i + 2];

    if (filterKey === 'bright') { r = r * 1.1 + 10; g = g * 1.08 + 8; b = b * 1.05 + 6; }
    else if (filterKey === 'radiant') { r = r * 1.12 + 15; g = g * 1.1 + 12; b = b * 1.15 + 15; }
    else if (filterKey === 'warm') { r = r * 1.12 + 12; g = g * 1.05 + 6; b = b * 0.92; }
    else if (filterKey === 'cool') { r = r * 0.92; g = g * 1.02 + 4; b = b * 1.15 + 12; }
    else if (filterKey === 'mood') { r = r * 1.06 + 8; g = g * 0.98; b = b * 0.92 + 5; }
    else if (filterKey === 'retro') { r = r * 1.08 + 15; g = g * 0.95 + 8; b = b * 0.82 + 12; }
    else if (filterKey === 'mono') { const gray = 0.299 * r + 0.587 * g + 0.114 * b; r = g = b = gray; }
    else if (filterKey === 'sunset') { r = r * 1.18 + 15; g = g * 1.02 + 5; b = b * 0.85; }
    else if (filterKey === 'cyan') { r = r * 0.88; g = g * 1.08 + 8; b = b * 1.2 + 15; }
    else if (filterKey === 'green') { r = r * 0.95; g = g * 1.12 + 10; b = b * 0.95; }
    else if (filterKey === 'pink') { r = r * 1.15 + 12; g = g * 0.95; b = b * 1.1 + 10; }

    r *= bMul; g *= bMul; b *= bMul;
    r = ((r / 255 - 0.5) * cFactor + 0.5) * 255;
    g = ((g / 255 - 0.5) * cFactor + 0.5) * 255;
    b = ((b / 255 - 0.5) * cFactor + 0.5) * 255;

    if (sMul !== 1 && filterKey !== 'mono') {
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      r = lum + (r - lum) * sMul;
      g = lum + (g - lum) * sMul;
      b = lum + (b - lum) * sMul;
    }

    d[i] = Math.min(255, Math.max(0, r));
    d[i + 1] = Math.min(255, Math.max(0, g));
    d[i + 2] = Math.min(255, Math.max(0, b));
  }
}

// ========================================================
// 13. 착용형 소품 스탬프 & 마그네틱 자석 스냅 가이드
// ========================================================
const WEARABLE_PROPS = {
  rabbit_ears: { name: '토끼귀', emoji: '🐰', defaultSize: 130, offsetY: -70 },
  headband: { name: '머리띠', emoji: '🎀', defaultSize: 120, offsetY: -60 },
  cat_whiskers: { name: '고양이수염', emoji: '🐱', defaultSize: 110, offsetY: 0 },
  hipster_sunglasses: { name: '힙스터선글라스', emoji: '🕶️', defaultSize: 125, offsetY: -10 },
  geek_chic_glasses: { name: '긱시크안경', emoji: '👓', defaultSize: 115, offsetY: -10 },
  crown: { name: '왕관', emoji: '👑', defaultSize: 120, offsetY: -75 },
  heart_overlay: { name: '반투명하트', emoji: '💖', defaultSize: 140, offsetY: 0, opacity: 0.75 }
};

let magneticSnapLines = { x: null, y: null };

function addWearableProp(propKey) {
  const prop = WEARABLE_PROPS[propKey];
  if (!prop) return;
  saveStateForUndo();

  const canvas = document.getElementById('photoCanvas');
  const targetX = canvas ? canvas.width / 2 : 600;
  const targetY = canvas ? canvas.height / 2 + prop.offsetY : 1200;

  const newSticker = {
    id: Date.now(),
    type: 'prop',
    propKey: propKey,
    text: prop.emoji,
    x: targetX,
    y: targetY,
    size: prop.defaultSize,
    rotation: 0,
    opacity: prop.opacity || 1.0
  };

  appState.stickers.push(newSticker);
  appState.selectedStickerIdx = appState.stickers.length - 1;
  showStickerControls(newSticker);
  renderStrip();
}

function checkMagneticSnap(stX, stY, snapThreshold = 18) {
  magneticSnapLines = { x: null, y: null };
  let finalX = stX;
  let finalY = stY;

  if (!appState.slotRects || appState.slotRects.length === 0) {
    return { x: finalX, y: finalY };
  }

  for (let rect of appState.slotRects) {
    const slotCenterX = rect.x + rect.w / 2;
    const slotFaceY = rect.y + rect.h * 0.35;
    const slotCenterY = rect.y + rect.h / 2;

    if (Math.abs(stX - slotCenterX) <= snapThreshold) {
      finalX = slotCenterX;
      magneticSnapLines.x = slotCenterX;
    }
    if (Math.abs(stY - slotFaceY) <= snapThreshold) {
      finalY = slotFaceY;
      magneticSnapLines.y = slotFaceY;
    } else if (Math.abs(stY - slotCenterY) <= snapThreshold) {
      finalY = slotCenterY;
      magneticSnapLines.y = slotCenterY;
    }
  }

  const canvas = document.getElementById('photoCanvas');
  if (canvas && Math.abs(stX - canvas.width / 2) <= snapThreshold) {
    finalX = canvas.width / 2;
    magneticSnapLines.x = canvas.width / 2;
  }

  return { x: finalX, y: finalY };
}

function addDirectTextSticker() {
  const input = document.getElementById('directTextInput');
  if (!input) return;
  const val = input.value.trim();
  if (!val) { alert("추가할 텍스트를 입력해주세요!"); return; }
  addTextSticker(val);
  input.value = '';
}

function addTextSticker(text) {
  saveStateForUndo();
  pushRecentSticker('text', text);
  const canvas = document.getElementById('photoCanvas');
  const newSticker = {
    id: Date.now(),
    type: 'text',
    text: text,
    x: canvas ? canvas.width / 2 : 600,
    y: canvas ? canvas.height / 2 : 1200,
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

function addEmojiSticker(emoji) {
  saveStateForUndo();
  pushRecentSticker('emoji', emoji);
  const canvas = document.getElementById('photoCanvas');
  const newSticker = {
    id: Date.now(),
    type: 'emoji',
    text: emoji,
    x: canvas ? canvas.width / 2 : 600,
    y: canvas ? canvas.height / 2 : 1200,
    size: 85,
    rotation: 0
  };
  appState.stickers.push(newSticker);
  appState.selectedStickerIdx = appState.stickers.length - 1;
  showStickerControls(newSticker);
  renderStrip();
}

function clearAllStickers() {
  if (appState.stickers.length === 0) return;
  if (!confirm("화면의 모든 스티커와 소품을 삭제하시겠습니까?")) return;
  saveStateForUndo();
  appState.stickers = [];
  appState.selectedStickerIdx = -1;
  const bar = document.getElementById('stickerControlBar');
  if (bar) bar.classList.add('hidden');
  renderStrip();
}

function showStickerControls(st) {
  const bar = document.getElementById('stickerControlBar');
  if (!bar) return;
  bar.classList.remove('hidden');

  const sizeS = document.getElementById('stickerSizeSlider');
  if (sizeS) sizeS.value = st.size;
  const rotS = document.getElementById('stickerRotateSlider');
  if (rotS) rotS.value = st.rotation || 0;
  const rotText = document.getElementById('stickerRotateValText');
  if (rotText) rotText.textContent = `${st.rotation || 0}°`;

  const customRow = document.getElementById('stickerTextCustomRow');
  if (st.type === 'text') {
    if (customRow) customRow.classList.remove('hidden');
    const cp = document.getElementById('stickerColorPicker');
    if (cp) cp.value = st.color || '#FFFFFF';
    const fs = document.getElementById('stickerFontSelect');
    if (fs) fs.value = st.fontFamily || 'Pretendard';
  } else {
    if (customRow) customRow.classList.add('hidden');
  }
}

function onSelectedStickerResize(size) {
  if (appState.selectedStickerIdx >= 0 && appState.selectedStickerIdx < appState.stickers.length) {
    appState.stickers[appState.selectedStickerIdx].size = parseInt(size, 10);
    renderStrip();
  }
}

function onSelectedStickerRotate(deg) {
  if (appState.selectedStickerIdx >= 0 && appState.selectedStickerIdx < appState.stickers.length) {
    const val = parseInt(deg, 10);
    appState.stickers[appState.selectedStickerIdx].rotation = val;
    const rotText = document.getElementById('stickerRotateValText');
    if (rotText) rotText.textContent = `${val}°`;
    renderStrip();
  }
}

function resetSelectedStickerRotation() {
  onSelectedStickerRotate(0);
  const rotS = document.getElementById('stickerRotateSlider');
  if (rotS) rotS.value = 0;
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
    const bar = document.getElementById('stickerControlBar');
    if (bar) bar.classList.add('hidden');
    renderStrip();
  }
}

// ========================================================
// 14. 캔버스 뷰포트 인터랙션 & 핀치 줌 / 한 손가락 패닝 (Pan & Zoom)
// ========================================================
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
  if (label) label.textContent = `${Math.round(canvasZoom * 100)}%`;
}

function setupCanvasPinchZoom() {
  const viewport = document.getElementById('canvasViewport');
  if (!viewport) return;

  let initialPinchDist = 0;
  let initialZoom = 1.0;
  let lastTap = 0;

  viewport.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      initialPinchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialZoom = canvasZoom;
    }
  }, { passive: false });

  viewport.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && initialPinchDist > 0) {
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
    if (e.touches.length === 0) {
      const now = Date.now();
      if (now - lastTap < 300) {
        resetCanvasZoom();
      }
      lastTap = now;
    }
  });
}

function initCanvasInteractions() {
  const canvas = document.getElementById('photoCanvas');
  const viewport = document.getElementById('canvasViewport');
  if (!canvas || !viewport) return;

  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      clientX, clientY,
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function onPointerDown(e) {
    if (e.touches && e.touches.length > 1) return;
    const coords = getCanvasCoords(e);
    let hitSticker = false;

    for (let i = appState.stickers.length - 1; i >= 0; i--) {
      const st = appState.stickers[i];
      const hitRadius = Math.max(70, st.size * 0.9);
      const dist = Math.hypot(coords.x - st.x, coords.y - st.y);
      if (dist <= hitRadius) {
        appState.selectedStickerIdx = i;
        appState.dragTarget = i;
        appState.dragStartPos = { x: coords.x - st.x, y: coords.y - st.y };
        showStickerControls(st);
        renderStrip();
        hitSticker = true;
        break;
      }
    }

    if (!hitSticker) {
      isPanning = true;
      panStartX = coords.clientX - canvasPanX;
      panStartY = coords.clientY - canvasPanY;
      appState.selectedStickerIdx = -1;
      appState.dragTarget = null;
      magneticSnapLines = { x: null, y: null };
      const bar = document.getElementById('stickerControlBar');
      if (bar) bar.classList.add('hidden');
      renderStrip();
    }
  }

  function onPointerMove(e) {
    if (e.touches && e.touches.length > 1) return;
    const coords = getCanvasCoords(e);

    if (appState.dragTarget !== null) {
      if (e.cancelable) e.preventDefault();
      const rawX = coords.x - appState.dragStartPos.x;
      const rawY = coords.y - appState.dragStartPos.y;
      const snapped = checkMagneticSnap(rawX, rawY);

      const st = appState.stickers[appState.dragTarget];
      st.x = snapped.x;
      st.y = snapped.y;
      renderStrip();
    } else if (isPanning) {
      if (e.cancelable) e.preventDefault();
      canvasPanX = coords.clientX - panStartX;
      canvasPanY = coords.clientY - panStartY;
      applyZoomTransform();
    }
  }

  function onPointerUp() {
    if (appState.dragTarget !== null) {
      saveStateForUndo();
      appState.dragTarget = null;
      magneticSnapLines = { x: null, y: null };
      renderStrip();
    }
    isPanning = false;
  }

  viewport.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);

  viewport.addEventListener('touchstart', onPointerDown, { passive: false });
  window.addEventListener('touchmove', onPointerMove, { passive: false });
  window.addEventListener('touchend', onPointerUp);
}

// ========================================================
// 15. 초고화질 캔버스 렌더링 엔진 (4·5·6컷 & 측면 각인 & Clean Safe Zone)
// ========================================================
function renderStrip(isFinalExport = false) {
  const canvas = document.getElementById('photoCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const cutCount = appState.selectedCutMode || 4;
  const layout = appState.layout || 'strip';
  const fStyle = appState.frameStyle || 'basic_middle';
  const pad = appState.frameThickness || 40;
  const gap = Math.round(pad * 0.45);
  const sigInp = document.getElementById('frameSignatureInput');
  const customTitle = sigInp ? sigInp.value : 'photoist';

  // 측면 세로 각인 활성화 시 캔버스 여백 32~64px 자동 비례 확장
  const sideEngravingOffset = appState.sideEngravingEnabled ? Math.max(36, Math.min(64, Math.round(pad * 1.1))) : 0;

  // 1. 규격별 초고해상도 캔버스 치수 산정
  if (cutCount === 4) {
    if (layout === 'strip') {
      canvas.width = 1080 + sideEngravingOffset;
      canvas.height = 3240;
    } else if (layout === 'grid') {
      canvas.width = 1440 + sideEngravingOffset;
      canvas.height = 2160;
    } else if (layout === 'twin') {
      canvas.width = 1800 + sideEngravingOffset;
      canvas.height = 2700;
    }
  } else if (cutCount === 5) {
    // 5컷 화보형: 상2 - 중1대형(와이드) - 하2
    canvas.width = 1440 + sideEngravingOffset;
    canvas.height = 2160;
  } else if (cutCount === 6) {
    if (layout === 'strip') {
      canvas.width = 1080 + sideEngravingOffset;
      canvas.height = 4320;
    } else {
      // 2x3 그리드
      canvas.width = 1440 + sideEngravingOffset;
      canvas.height = 2160;
    }
  }

  // 2. 배경 채우기 (프리미엄 테마 고유색 or 사용자 선택색)
  if (fStyle === 'photoist') ctx.fillStyle = '#0a0a0a';
  else if (fStyle === 'birthday') ctx.fillStyle = '#FDFBF7';
  else if (fStyle === 'baseball') ctx.fillStyle = '#FAF7EE';
  else ctx.fillStyle = appState.frameColor || '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  appState.slotRects = [];
  const baseCanvasW = canvas.width - sideEngravingOffset;

  // 3. 사진 슬롯 계산 및 렌더링
  if (cutCount === 4 && layout === 'strip') {
    renderStrip4Cut(ctx, baseCanvasW, canvas.height, pad, gap, fStyle, customTitle);
  } else if (cutCount === 4 && layout === 'grid') {
    renderGrid4Cut(ctx, baseCanvasW, canvas.height, pad, gap, fStyle, customTitle);
  } else if (cutCount === 4 && layout === 'twin') {
    renderTwin4Cut(ctx, baseCanvasW, canvas.height, pad, gap, fStyle, customTitle);
  } else if (cutCount === 5) {
    renderEditorial5Cut(ctx, baseCanvasW, canvas.height, pad, gap, fStyle, customTitle);
  } else if (cutCount === 6 && layout === 'strip') {
    renderStrip6Cut(ctx, baseCanvasW, canvas.height, pad, gap, fStyle, customTitle);
  } else if (cutCount === 6) {
    renderGrid6Cut(ctx, baseCanvasW, canvas.height, pad, gap, fStyle, customTitle);
  }

  // 4. 측면 세로 각인 렌더링 (활성화된 경우)
  if (appState.sideEngravingEnabled) {
    renderSideEngravingText(ctx, canvas.width, canvas.height, sideEngravingOffset);
  }

  // 5. 스티커 및 소품 렌더링
  appState.stickers.forEach((st, idx) => {
    ctx.save();
    ctx.translate(st.x, st.y);
    ctx.rotate(((st.rotation || 0) * Math.PI) / 180);
    if (st.opacity) ctx.globalAlpha = st.opacity;

    if (st.type === 'text') {
      const font = st.fontFamily || 'Pretendard';
      ctx.font = `900 ${st.size}px '${font}', sans-serif`;
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

    if (!isFinalExport && idx === appState.selectedStickerIdx) {
      ctx.strokeStyle = '#F43F5E';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      const boundW = st.type === 'text' ? st.size * 1.2 : st.size * 0.7;
      ctx.strokeRect(-boundW, -st.size * 0.6, boundW * 2, st.size * 1.2);
    }
    ctx.restore();
  });

  // 6. 마그네틱 자석 스냅 가이드라인 (드래그 시 시각 피드백)
  if (!isFinalExport && (magneticSnapLines.x !== null || magneticSnapLines.y !== null)) {
    ctx.save();
    ctx.strokeStyle = '#F43F5E';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    if (magneticSnapLines.x !== null) {
      ctx.beginPath();
      ctx.moveTo(magneticSnapLines.x, 0);
      ctx.lineTo(magneticSnapLines.x, canvas.height);
      ctx.stroke();
    }
    if (magneticSnapLines.y !== null) {
      ctx.beginPath();
      ctx.moveTo(0, magneticSnapLines.y);
      ctx.lineTo(canvas.width, magneticSnapLines.y);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function renderSideEngravingText(ctx, canvasW, canvasH, sideOffset) {
  const isDark = (appState.frameColor === '#000000' || appState.frameColor === '#0a0a0a' || appState.frameColor === '#111827');
  const textColor = isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.65)';
  const text = appState.sideEngravingText || "PHOTOIST STUDIO • KEEP YOUR MOMENT";

  ctx.save();
  ctx.translate(canvasW - (sideOffset / 2), canvasH / 2);
  ctx.rotate(Math.PI / 2);
  ctx.fillStyle = textColor;
  ctx.font = `bold 16px monospace`;
  ctx.letterSpacing = "4px";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

function renderStrip4Cut(ctx, cW, cH, pad, gap, fStyle, customTitle) {
  const isStepped = (fStyle === 'basic_stepped');
  const safeZone = isStepped ? 280 : 0;
  const isMiddle = (fStyle === 'basic_middle');
  const bannerH = isMiddle ? 190 : 0;
  const topH = (fStyle === 'basic_top' || fStyle === 'photoist') ? 140 : pad;
  const bottomH = (fStyle === 'basic_bottom') ? 220 : pad + safeZone;

  const slotW = cW - (pad * 2);
  const slotH = (cH - topH - bottomH - bannerH - (gap * 3)) / 4;

  if (fStyle === 'basic_top' || fStyle === 'photoist') {
    drawFrameHeader(ctx, cW / 2, topH / 2, customTitle);
  }

  for (let i = 0; i < 4; i++) {
    let sy = topH + (i * (slotH + gap));
    if (isMiddle && i >= 2) sy += bannerH;
    appState.slotRects.push({ x: pad, y: sy, w: slotW, h: slotH });
    drawFilteredSlotPhoto(ctx, appState.selectedImages[i], pad, sy, slotW, slotH);
  }

  if (isMiddle) {
    const bannerY = topH + (slotH * 2) + (gap * 2);
    drawMiddleBanner(ctx, cW / 2, bannerY + (bannerH / 2), customTitle);
  } else if (fStyle === 'basic_bottom') {
    const footerY = (cH - bottomH) + (bottomH / 2);
    drawFrameFooter(ctx, cW / 2, footerY, customTitle);
  }
}

function renderGrid4Cut(ctx, cW, cH, pad, gap, fStyle, customTitle) {
  const isStepped = (fStyle === 'basic_stepped');
  const safeZone = isStepped ? 260 : 0;
  const isMiddle = (fStyle === 'basic_middle');
  const bannerH = isMiddle ? 160 : 0;
  const topH = (fStyle === 'basic_top' || fStyle === 'simple_inset_magazine') ? 130 : pad;
  const bottomH = (fStyle === 'basic_bottom' || fStyle === 'simple_polaroid_wide') ? 220 : pad + safeZone;

  const slotW = (cW - (pad * 2) - gap) / 2;
  const slotH = (cH - topH - bottomH - bannerH - gap) / 2;

  if (fStyle === 'basic_top' || fStyle === 'simple_inset_magazine') {
    drawFrameHeader(ctx, cW / 2, topH / 2, customTitle);
  }

  const coords = [
    { x: pad, y: topH },
    { x: pad + slotW + gap, y: topH },
    { x: pad, y: topH + slotH + gap + bannerH },
    { x: pad + slotW + gap, y: topH + slotH + gap + bannerH }
  ];

  for (let i = 0; i < 4; i++) {
    appState.slotRects.push({ x: coords[i].x, y: coords[i].y, w: slotW, h: slotH });
    drawFilteredSlotPhoto(ctx, appState.selectedImages[i], coords[i].x, coords[i].y, slotW, slotH);
  }

  if (isMiddle) {
    const bannerY = topH + slotH + (gap / 2);
    drawMiddleBanner(ctx, cW / 2, bannerY + (bannerH / 2), customTitle, 36);
  } else if (fStyle === 'basic_bottom' || fStyle === 'simple_polaroid_wide') {
    const footerY = (cH - bottomH) + (bottomH / 2);
    drawFrameFooter(ctx, cW / 2, footerY, customTitle);
  }
}

function renderTwin4Cut(ctx, cW, cH, pad, gap, fStyle, customTitle) {
  const stripW = (cW / 2) - 15;
  const slotW = stripW - (pad * 2);
  const topH = (fStyle === 'basic_top') ? 110 : pad;
  const bottomH = (fStyle === 'basic_bottom') ? 180 : pad;
  const slotH = (cH - topH - bottomH - (gap * 3)) / 4;

  [0, cW / 2 + 15].forEach(offsetX => {
    if (fStyle === 'basic_top') {
      drawFrameHeader(ctx, offsetX + (stripW / 2), topH / 2, customTitle, 30);
    }
    for (let i = 0; i < 4; i++) {
      const sy = topH + (i * (slotH + gap));
      drawFilteredSlotPhoto(ctx, appState.selectedImages[i], offsetX + pad, sy, slotW, slotH);
    }
    if (fStyle === 'basic_bottom') {
      drawFrameFooter(ctx, offsetX + (stripW / 2), (cH - bottomH) + (bottomH / 2), customTitle, 28);
    }
  });

  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(cW / 2, 20);
  ctx.lineTo(cW / 2, cH - 20);
  ctx.stroke();
  ctx.restore();
}

function renderEditorial5Cut(ctx, cW, cH, pad, gap, fStyle, customTitle) {
  const topH = (fStyle === 'basic_top') ? 120 : pad;
  const bottomH = (fStyle === 'basic_bottom') ? 200 : pad;
  const availH = cH - topH - bottomH - (gap * 2);

  const row1H = availH * 0.31;
  const row2H = availH * 0.38;
  const row3H = availH * 0.31;

  const smallW = (cW - (pad * 2) - gap) / 2;
  const heroW = cW - (pad * 2);

  if (fStyle === 'basic_top') drawFrameHeader(ctx, cW / 2, topH / 2, customTitle);

  // 상단 2장
  appState.slotRects.push({ x: pad, y: topH, w: smallW, h: row1H });
  appState.slotRects.push({ x: pad + smallW + gap, y: topH, w: smallW, h: row1H });
  drawFilteredSlotPhoto(ctx, appState.selectedImages[0], pad, topH, smallW, row1H);
  drawFilteredSlotPhoto(ctx, appState.selectedImages[1], pad + smallW + gap, topH, smallW, row1H);

  // 중단 1장 대형 와이드 히어로 컷
  const heroY = topH + row1H + gap;
  appState.slotRects.push({ x: pad, y: heroY, w: heroW, h: row2H });
  drawFilteredSlotPhoto(ctx, appState.selectedImages[2], pad, heroY, heroW, row2H);

  // 하단 2장
  const row3Y = heroY + row2H + gap;
  appState.slotRects.push({ x: pad, y: row3Y, w: smallW, h: row3H });
  appState.slotRects.push({ x: pad + smallW + gap, y: row3Y, w: smallW, h: row3H });
  drawFilteredSlotPhoto(ctx, appState.selectedImages[3], pad, row3Y, smallW, row3H);
  drawFilteredSlotPhoto(ctx, appState.selectedImages[4], pad + smallW + gap, row3Y, smallW, row3H);

  if (fStyle === 'basic_bottom') {
    drawFrameFooter(ctx, cW / 2, (cH - bottomH) + (bottomH / 2), customTitle);
  }
}

function renderStrip6Cut(ctx, cW, cH, pad, gap, fStyle, customTitle) {
  const topH = (fStyle === 'basic_top') ? 130 : pad;
  const bottomH = (fStyle === 'basic_bottom') ? 220 : pad;
  const slotW = cW - (pad * 2);
  const slotH = (cH - topH - bottomH - (gap * 5)) / 6;

  if (fStyle === 'basic_top') drawFrameHeader(ctx, cW / 2, topH / 2, customTitle);

  for (let i = 0; i < 6; i++) {
    const sy = topH + (i * (slotH + gap));
    appState.slotRects.push({ x: pad, y: sy, w: slotW, h: slotH });
    drawFilteredSlotPhoto(ctx, appState.selectedImages[i], pad, sy, slotW, slotH);
  }

  if (fStyle === 'basic_bottom') {
    drawFrameFooter(ctx, cW / 2, (cH - bottomH) + (bottomH / 2), customTitle);
  }
}

function renderGrid6Cut(ctx, cW, cH, pad, gap, fStyle, customTitle) {
  const topH = (fStyle === 'basic_top') ? 120 : pad;
  const bottomH = (fStyle === 'basic_bottom') ? 200 : pad;
  const slotW = (cW - (pad * 2) - gap) / 2;
  const slotH = (cH - topH - bottomH - (gap * 2)) / 3;

  if (fStyle === 'basic_top') drawFrameHeader(ctx, cW / 2, topH / 2, customTitle);

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 2; col++) {
      const idx = row * 2 + col;
      const sx = pad + col * (slotW + gap);
      const sy = topH + row * (slotH + gap);
      appState.slotRects.push({ x: sx, y: sy, w: slotW, h: slotH });
      drawFilteredSlotPhoto(ctx, appState.selectedImages[idx], sx, sy, slotW, slotH);
    }
  }

  if (fStyle === 'basic_bottom') {
    drawFrameFooter(ctx, cW / 2, (cH - bottomH) + (bottomH / 2), customTitle);
  }
}

function drawFilteredSlotPhoto(ctx, img, targetX, targetY, targetW, targetH) {
  if (!img) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(targetX, targetY, targetW, targetH);
  ctx.clip();

  const srcRatio = (img.width || 720) / (img.height || 480);
  const targetRatio = targetW / targetH;
  let renderW, renderH;

  if (srcRatio > targetRatio) {
    renderH = targetH;
    renderW = targetH * srcRatio;
  } else {
    renderW = targetW;
    renderH = targetW / srcRatio;
  }

  const drawX = targetX + (targetW - renderW) / 2;
  const drawY = targetY + (targetH - renderH) / 2;

  const isNormal = appState.activeFilter === 'normal' &&
    appState.filters.bright === 100 &&
    appState.filters.contrast === 100 &&
    appState.filters.saturate === 100;

  if (isNormal) {
    ctx.drawImage(img, drawX, drawY, renderW, renderH);
  } else {
    try {
      const off = document.createElement('canvas');
      const cw = Math.max(1, Math.round(renderW));
      const ch = Math.max(1, Math.round(renderH));
      off.width = cw;
      off.height = ch;
      const offCtx = off.getContext('2d');
      offCtx.drawImage(img, 0, 0, cw, ch);
      const imgData = offCtx.getImageData(0, 0, cw, ch);
      applyPixelFilterMath(imgData, appState.activeFilter, appState.filters);
      offCtx.putImageData(imgData, 0, 0);
      ctx.drawImage(off, drawX, drawY, renderW, renderH);
    } catch (e) {
      ctx.drawImage(img, drawX, drawY, renderW, renderH);
    }
  }
  ctx.restore();
}

function drawFrameHeader(ctx, centerX, centerY, title, customSize = null) {
  const isDark = (appState.frameColor === '#000000' || appState.frameColor === '#0a0a0a' || appState.frameColor === '#111827');
  const textColor = appState.typography.fontColor || (isDark ? '#FFFFFF' : '#111111');
  const size = customSize || appState.typography.fontSize || 42;
  const weight = appState.typography.isBold ? '900' : 'bold';

  ctx.save();
  ctx.fillStyle = textColor;
  ctx.font = `${weight} ${size}px '${appState.typography.fontFamily}', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, centerX, centerY);
  ctx.restore();
}

function drawMiddleBanner(ctx, centerX, centerY, title, customSize = null) {
  const isDark = (appState.frameColor === '#000000' || appState.frameColor === '#0a0a0a' || appState.frameColor === '#111827');
  const textColor = appState.typography.fontColor || (isDark ? '#FFFFFF' : '#111111');
  const size = customSize || appState.typography.fontSize || 40;
  const weight = appState.typography.isBold ? '900' : 'bold';
  const showDate = appState.showDate;
  const dateSize = Math.max(16, Math.round(size * 0.45));
  const gap = Math.max(10, Math.round(size * 0.25));

  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = textColor;

  if (showDate) {
    const totalH = size + gap + dateSize;
    ctx.font = `${weight} ${size}px '${appState.typography.fontFamily}', sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.fillText(title, centerX, centerY - (totalH / 2) + (size / 2));

    ctx.font = `normal ${dateSize}px '${appState.typography.fontFamily}', sans-serif`;
    ctx.globalAlpha = 0.75;
    ctx.fillText(appState.typography.date, centerX, centerY + (totalH / 2) - (dateSize / 2));
  } else {
    ctx.font = `${weight} ${size}px '${appState.typography.fontFamily}', sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.fillText(title, centerX, centerY);
  }
  ctx.restore();
}

function drawFrameFooter(ctx, centerX, centerY, title, customSize = null) {
  drawMiddleBanner(ctx, centerX, centerY, title, customSize);
}

// ========================================================
// 16. 15Mbps 초고화질 무빙 비디오 엔진 (Moving Video Engine)
// ========================================================
async function autoSaveVideo() {
  const hasValidBlobs = appState.selectedIndices.every(idx => idx !== null && appState.shotVideoBlobs[idx]);
  if (!hasValidBlobs) {
    alert("촬영 영상 클립이 부족합니다.\n부스에서 사진을 직접 연속 촬영했을 때 무빙 비디오 생성이 가능합니다.");
    return;
  }

  const btn = document.getElementById('btnAutoVideo');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>15Mbps 비디오 합성 중...</span>`;
    if (window.lucide) lucide.createIcons();
  }

  try {
    const videoElements = await Promise.all(appState.selectedIndices.map(shotIdx => {
      return new Promise((resolve) => {
        const blob = appState.shotVideoBlobs[shotIdx];
        const v = document.createElement('video');
        v.src = URL.createObjectURL(blob);
        v.muted = true;
        v.loop = true;
        v.setAttribute('playsinline', '');
        v.onloadedmetadata = () => {
          v.play().then(() => resolve(v)).catch(() => resolve(v));
        };
      });
    }));

    const vCanvas = document.createElement('canvas');
    const layout = appState.layout || 'strip';
    if (layout === 'grid') {
      vCanvas.width = 1440;
      vCanvas.height = 2160;
    } else {
      vCanvas.width = 1080;
      vCanvas.height = 3240;
    }
    const vCtx = vCanvas.getContext('2d');

    let mimeType = 'video/mp4';
    if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported('video/mp4')) {
      mimeType = (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/webm;codecs=vp9'))
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
    }

    const stream = vCanvas.captureStream(30);
    const recorder = new MediaRecorder(stream, {
      mimeType: mimeType,
      videoBitsPerSecond: 15000000 // 15Mbps 초고화질 비트레이트 보장
    });

    const chunks = [];
    recorder.ondataavailable = e => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = async () => {
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const finalBlob = new Blob(chunks, { type: mimeType });
      const file = new File([finalBlob], `[추억네컷_photoist]_${Date.now()}.${ext}`, { type: mimeType });

      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i data-lucide="video" class="w-4 h-4"></i><span>🎬 15Mbps 무빙 비디오 저장</span>`;
        if (window.lucide) lucide.createIcons();
      }

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: '추억의 네컷 photoist 무빙 비디오',
            text: '초고화질 무빙 비디오입니다!'
          });
          return;
        } catch (err) {
          if (err.name === 'AbortError') return;
        }
      }

      const url = URL.createObjectURL(finalBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    recorder.start();

    const startTime = performance.now();
    const duration = 6500;
    const pad = Math.round(appState.frameThickness * 0.9);
    const gap = Math.round(pad * 0.45);
    const fStyle = appState.frameStyle;
    const sigInp = document.getElementById('frameSignatureInput');
    const title = sigInp ? sigInp.value : 'photoist';

    function renderVideoFrame(now) {
      const elapsed = now - startTime;
      vCtx.fillStyle = appState.frameColor || '#0a0a0a';
      vCtx.fillRect(0, 0, vCanvas.width, vCanvas.height);

      if (layout === 'grid') {
        const topH = 130;
        const bottomH = 200;
        const slotW = (vCanvas.width - (pad * 2) - gap) / 2;
        const slotH = (vCanvas.height - topH - bottomH - gap) / 2;
        const coords = [
          { x: pad, y: topH },
          { x: pad + slotW + gap, y: topH },
          { x: pad, y: topH + slotH + gap },
          { x: pad + slotW + gap, y: topH + slotH + gap }
        ];

        drawFrameHeader(vCtx, vCanvas.width / 2, topH / 2, title, 38);
        for (let i = 0; i < 4; i++) {
          const v = videoElements[i];
          const coord = coords[i];
          vCtx.save();
          vCtx.beginPath();
          vCtx.rect(coord.x, coord.y, slotW, slotH);
          vCtx.clip();

          // 전면 카메라 거울모드 보정
          if (appState.facingMode === 'user') {
            vCtx.translate(coord.x + slotW, coord.y);
            vCtx.scale(-1, 1);
            vCtx.drawImage(v, 0, 0, slotW, slotH);
          } else {
            vCtx.drawImage(v, coord.x, coord.y, slotW, slotH);
          }
          vCtx.restore();
        }
        drawFrameFooter(vCtx, vCanvas.width / 2, (vCanvas.height - bottomH) + (bottomH / 2), title, 36);
      } else {
        const topH = 130;
        const bottomH = 220;
        const slotW = vCanvas.width - (pad * 2);
        const slotH = (vCanvas.height - topH - bottomH - (gap * 3)) / 4;

        drawFrameHeader(vCtx, vCanvas.width / 2, topH / 2, title, 36);
        for (let i = 0; i < 4; i++) {
          const v = videoElements[i];
          const vy = topH + (i * (slotH + gap));
          vCtx.save();
          vCtx.beginPath();
          vCtx.rect(pad, vy, slotW, slotH);
          vCtx.clip();

          if (appState.facingMode === 'user') {
            vCtx.translate(pad + slotW, vy);
            vCtx.scale(-1, 1);
            vCtx.drawImage(v, 0, 0, slotW, slotH);
          } else {
            vCtx.drawImage(v, pad, vy, slotW, slotH);
          }
          vCtx.restore();
        }
        drawFrameFooter(vCtx, vCanvas.width / 2, (vCanvas.height - bottomH) + (bottomH / 2), title, 36);
      }

      if (elapsed < duration) {
        requestAnimationFrame(renderVideoFrame);
      } else {
        recorder.stop();
      }
    }

    requestAnimationFrame(renderVideoFrame);
  } catch (err) {
    alert("비디오 렌더링 중 오류가 발생했습니다: " + err.message);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i data-lucide="video" class="w-4 h-4"></i><span>🎬 15Mbps 무빙 비디오 저장</span>`;
      if (window.lucide) lucide.createIcons();
    }
  }
}

// ========================================================
// 17. 결과물 내보내기 & 2중 큐 자동 아카이빙 & QR 생성
// ========================================================
function sharePhotoDirectly() {
  renderStrip(true);
  const canvas = document.getElementById('photoCanvas');
  if (!canvas) return;

  canvas.toBlob(async (blob) => {
    if (!blob) return;
    const file = new File([blob], `[추억네컷_photoist]_${Date.now()}.png`, { type: 'image/png' });
    archivePhotoResult(canvas.toDataURL('image/jpeg', 0.92), false);

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: '추억의 네컷 Studio Pro',
          text: '포토이스트 스타일 고화질 네컷 사진입니다!'
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, 'image/png');
}

function autoSavePDF() { exportCenteredPDF(); }

function exportCenteredPDF() {
  renderStrip(true);
  const canvas = document.getElementById('photoCanvas');
  if (!canvas || !window.jspdf) return;

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const { jsPDF } = window.jspdf;
  const isLandscape = canvas.width > canvas.height;
  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [102, 152] // 스튜디오 4x6인치 인화 규격
  });

  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = pdf.internal.pageSize.getHeight();
  const margin = 2;
  const maxW = pdfW - (margin * 2);
  const maxH = pdfH - (margin * 2);
  const ratio = canvas.width / canvas.height;

  let printW = maxW;
  let printH = printW / ratio;
  if (printH > maxH) {
    printH = maxH;
    printW = printH * ratio;
  }

  pdf.addImage(imgData, 'JPEG', (pdfW - printW) / 2, (pdfH - printH) / 2, printW, printH);
  pdf.save(`[추억네컷_인쇄용]_${Date.now()}.pdf`);
  archivePhotoResult(imgData, false);
}

async function saveAndGenerateQR() {
  const btn = document.getElementById('btnSaveQR');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>클라우드 업로드 중...</span>`;
    if (window.lucide) lucide.createIcons();
  }

  renderStrip(true);
  const canvas = document.getElementById('photoCanvas');
  if (!canvas) return;

  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  archivePhotoResult(dataUrl, false);

  canvas.toBlob(async (blob) => {
    try {
      const formData = new FormData();
      formData.append('file', blob, `Photoist_${Date.now()}.png`);
      const uploadRes = await fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: formData
      }).then(r => r.json());

      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span>📱 QR코드 생성</span>`;
      }

      if (uploadRes && uploadRes.status === 'success' && uploadRes.data.url) {
        const directUrl = uploadRes.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
        displayResultWithQR(directUrl);
      } else {
        displayResultWithQR(window.location.href);
      }
    } catch (err) {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span>📱 QR코드 생성</span>`;
      }
      displayResultWithQR(window.location.href);
    }
  }, 'image/png');
}

function displayResultWithQR(url) {
  const qrBox = document.getElementById('qrcodeArea');
  if (!qrBox || typeof QRCode === 'undefined') return;
  qrBox.innerHTML = '';
  new QRCode(qrBox, {
    text: url,
    width: 150,
    height: 150,
    correctLevel: QRCode.CorrectLevel.M
  });
  showScreen('screenResult');
  startAutoReset();
}

// 2중 큐(로컬 1차 즉시 저장 + 구글 시트 백엔드 클라우드 무소음 동기화)
function archivePhotoResult(dataUrl, isFavorite = false) {
  const newArchiveItem = {
    id: Date.now(),
    date: getFormattedTodayDate(),
    time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    dataUrl: dataUrl,
    isFavorite: isFavorite,
    userId: appState.currentUser ? appState.currentUser.userId : 'guest'
  };

  // 1차: 로컬 영구 저장
  let archives = JSON.parse(localStorage.getItem('chueok_archives') || '[]');
  archives.unshift(newArchiveItem);
  if (archives.length > 50) archives.pop();
  localStorage.setItem('chueok_archives', JSON.stringify(archives));

  // 2차: 백엔드 무소음 클라우드 동기화
  if (appState.currentUser && GOOGLE_DB_URL) {
    try {
      fetch(GOOGLE_DB_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'SAVE_ARCHIVE',
          userId: appState.currentUser.userId,
          date: newArchiveItem.date,
          archiveId: newArchiveItem.id,
          isFavorite: isFavorite
        })
      }).catch(() => {});
    } catch (e) {}
  }
}

function toggleFavoriteArchive(archiveId) {
  let archives = JSON.parse(localStorage.getItem('chueok_archives') || '[]');
  const item = archives.find(a => a.id === archiveId);
  if (item) {
    item.isFavorite = !item.isFavorite;
    localStorage.setItem('chueok_archives', JSON.stringify(archives));
    renderMyPageArchives();
  }
}

function returnToEditor() {
  if (appState.resetInterval) {
    clearInterval(appState.resetInterval);
    appState.resetInterval = null;
  }
  showScreen('screenEdit');
  renderStrip();
}

function startAutoReset() {
  if (appState.resetInterval) clearInterval(appState.resetInterval);
  let sec = 120;
  const rText = document.getElementById('resetTimerText');
  if (rText) rText.textContent = `${sec}초`;
  appState.resetInterval = setInterval(() => {
    sec--;
    if (rText) rText.textContent = `${sec}초`;
    if (sec <= 0) {
      clearInterval(appState.resetInterval);
      resetApp();
    }
  }, 1000);
}

function cancelSession() {
  stopCameraAndAudio();
  resetApp();
}

function resetApp() {
  if (appState.resetInterval) {
    clearInterval(appState.resetInterval);
    appState.resetInterval = null;
  }
  stopCameraAndAudio();
  appState.shotImages = [];
  appState.selectedImages = [];
  appState.selectedIndices = [null, null, null, null];
  appState.stickers = [];
  appState.selectedStickerIdx = -1;
  galleryAccumulator = [];
  showScreen('screenHome');
}

// ========================================================
// 18. 회원 인증 체계 & 계정 복구 센터 & 보안
// ========================================================
async function handleRegister(event) {
  if (event) event.preventDefault();

  const idInput = document.getElementById('regUserId');
  const pwInput = document.getElementById('regUserPw');
  const pwConfirmInput = document.getElementById('regUserPwConfirm');
  const nameInput = document.getElementById('regUserName');
  const birthInput = document.getElementById('regUserBirth');
  const emailInput = document.getElementById('regUserEmail');

  const userId = idInput ? idInput.value.trim() : '';
  const pw = pwInput ? pwInput.value.trim() : '';
  const pwConfirm = pwConfirmInput ? pwConfirmInput.value.trim() : '';
  const name = nameInput ? nameInput.value.trim() : '';
  const birth = birthInput ? birthInput.value.trim() : '';
  const email = emailInput ? emailInput.value.trim() : '';

  if (!userId || !pw || !name || !birth || !email) {
    alert("모든 필수 가입 항목을 입력해주세요.");
    return;
  }

  if (pw !== pwConfirm) {
    alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
    if (pwConfirmInput) pwConfirmInput.focus();
    return;
  }

  if (!/^\d{6}$/.test(birth)) {
    alert("생년월일은 6자리 숫자로 입력해주세요 (예: 050413).");
    if (birthInput) birthInput.focus();
    return;
  }

  const btn = document.getElementById('btnSubmitRegister');
  if (btn) {
    btn.disabled = true;
    btn.textContent = "가입 처리 중...";
  }

  try {
    const res = await fetch(GOOGLE_DB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'REGISTER',
        userId: userId,
        password: pw,
        name: name,
        birthDate: birth,
        email: email
      })
    });
    const result = await res.json();

    if (result && result.success) {
      alert("회원가입이 완료되었습니다! 로그인해 주세요.");
      closeRegisterModal();
      openLoginModal();
    } else {
      alert(result.message || "동일한 이름 및 생년월일의 계정이 이미 존재하거나 등록에 실패했습니다.");
    }
  } catch (err) {
    alert("서버 연결 실패: 로컬 모드로 가입 처리되었습니다.");
    localStorage.setItem(`chueok_user_${userId}`, JSON.stringify({ userId, pw, name, birth, email }));
    closeRegisterModal();
    openLoginModal();
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "회원가입 완료";
    }
  }
}

async function handleLogin(event) {
  if (event) event.preventDefault();

  const idInput = document.getElementById('loginUserId');
  const pwInput = document.getElementById('loginUserPw');
  const userId = idInput ? idInput.value.trim() : '';
  const pw = pwInput ? pwInput.value.trim() : '';

  if (!userId || !pw) {
    alert("아이디와 비밀번호를 모두 입력해주세요.");
    return;
  }

  // 🌟 마스터 최고 관리자 계정 직접 승인
  if (userId === 'knsupolo' && pw === '12345678') {
    appState.isAdmin = true;
    appState.currentUser = { userId: 'knsupolo', name: '최고관리자', role: 'master' };
    localStorage.setItem('chueok_auth_user', JSON.stringify(appState.currentUser));
    updateAuthUI();
    closeLoginModal();
    alert("마스터 최고 관리자 계정으로 로그인되었습니다.");
    return;
  }

  const btn = document.getElementById('btnSubmitLogin');
  if (btn) {
    btn.disabled = true;
    btn.textContent = "로그인 중...";
  }

  try {
    const res = await fetch(GOOGLE_DB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'LOGIN',
        userId: userId,
        password: pw
      })
    });
    const result = await res.json();

    if (result && result.success && result.user) {
      appState.currentUser = result.user;
      localStorage.setItem('chueok_auth_user', JSON.stringify(result.user));
      updateAuthUI();
      closeLoginModal();
      alert(`${result.user.name || result.user.userId}님, 환영합니다!`);
    } else {
      alert(result.message || "아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  } catch (err) {
    // 로컬 백업 확인
    const local = localStorage.getItem(`chueok_user_${userId}`);
    if (local) {
      const u = JSON.parse(local);
      if (u.pw === pw) {
        appState.currentUser = u;
        localStorage.setItem('chueok_auth_user', JSON.stringify(u));
        updateAuthUI();
        closeLoginModal();
        alert(`${u.name}님 환영합니다 (오프라인 모드).`);
        return;
      }
    }
    alert("로그인에 실패했습니다. 아이디와 비밀번호를 다시 확인해주세요.");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "로그인";
    }
  }
}

function handleLogout() {
  appState.currentUser = null;
  appState.isAdmin = false;
  localStorage.removeItem('chueok_auth_user');
  updateAuthUI();
  alert("로그아웃되었습니다.");
}

function updateAuthUI() {
  const btnLogin = document.getElementById('headerBtnLogin');
  const btnMyPage = document.getElementById('headerBtnMyPage');
  const badge = document.getElementById('headerUserBadge');

  if (appState.currentUser) {
    if (btnLogin) btnLogin.classList.add('hidden');
    if (btnMyPage) btnMyPage.classList.remove('hidden');
    if (badge) {
      badge.textContent = `${appState.currentUser.name || appState.currentUser.userId} 님`;
      badge.classList.remove('hidden');
    }
  } else {
    if (btnLogin) btnLogin.classList.remove('hidden');
    if (btnMyPage) btnMyPage.classList.add('hidden');
    if (badge) badge.classList.add('hidden');
  }
}

// 🌟 계정 복구 센터: 이름 + 생년월일 6자리 + 이메일 대조 ➔ 아이디 확인 및 임시비밀번호 Gmail 발송
async function handleAccountRecovery(event) {
  if (event) event.preventDefault();

  const nameInput = document.getElementById('recovUserName');
  const birthInput = document.getElementById('recovUserBirth');
  const emailInput = document.getElementById('recovUserEmail');

  const name = nameInput ? nameInput.value.trim() : '';
  const birth = birthInput ? birthInput.value.trim() : '';
  const email = emailInput ? emailInput.value.trim() : '';

  if (!name || !birth || !email) {
    alert("이름, 생년월일 6자리, 가입 이메일을 모두 입력해주세요.");
    return;
  }

  const btn = document.getElementById('btnSubmitRecovery');
  if (btn) {
    btn.disabled = true;
    btn.textContent = "계정 확인 및 발송 중...";
  }

  try {
    const res = await fetch(GOOGLE_DB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'RECOVER_ACCOUNT',
        name: name,
        birthDate: birth,
        email: email
      })
    });
    const result = await res.json();

    if (result && result.success) {
      alert(`[계정 확인 완료]\n가입 아이디: ${result.userId}\n\n등록하신 이메일(${email})로 임시 비밀번호가 무료 전송되었습니다.`);
      closeAccountRecoveryModal();
    } else {
      alert(result.message || "일치하는 회원 정보를 찾을 수 없습니다.");
    }
  } catch (err) {
    alert("계정 복구 서버 연결에 실패했습니다. 관리자에게 문의해 주세요.");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "계정 확인 및 임시비밀번호 받기";
    }
  }
}

function openLoginModal() {
  const m = document.getElementById('loginModal');
  if (m) m.classList.remove('hidden');
}

function closeLoginModal() {
  const m = document.getElementById('loginModal');
  if (m) m.classList.add('hidden');
}

function openRegisterModal() {
  closeLoginModal();
  const m = document.getElementById('registerModal');
  if (m) m.classList.remove('hidden');
}

function closeRegisterModal() {
  const m = document.getElementById('registerModal');
  if (m) m.classList.add('hidden');
}

function openAccountRecoveryModal() {
  closeLoginModal();
  const m = document.getElementById('accountRecoveryModal');
  if (m) m.classList.remove('hidden');
}

function closeAccountRecoveryModal() {
  const m = document.getElementById('accountRecoveryModal');
  if (m) m.classList.add('hidden');
}

// ========================================================
// 19. 마이페이지, 10종 테마 색상기, 후기 & 고객소리함
// ========================================================
function openMyPageModal() {
  if (!appState.currentUser) {
    openLoginModal();
    return;
  }
  const m = document.getElementById('myPageModal');
  if (m) m.classList.remove('hidden');

  const nameEl = document.getElementById('myPageUserName');
  const idEl = document.getElementById('myPageUserId');
  if (nameEl) nameEl.textContent = appState.currentUser.name || appState.currentUser.userId;
  if (idEl) idEl.textContent = appState.currentUser.email || appState.currentUser.userId;

  renderMyPageArchives();
}

function closeMyPageModal() {
  const m = document.getElementById('myPageModal');
  if (m) m.classList.add('hidden');
}

function renderMyPageArchives() {
  const container = document.getElementById('myPageArchivesList');
  if (!container) return;

  const archives = JSON.parse(localStorage.getItem('chueok_archives') || '[]');
  if (archives.length === 0) {
    container.innerHTML = `<p class="col-span-full text-center py-8 text-xs text-slate-500">저장된 추억네컷 사진이 없습니다.</p>`;
    return;
  }

  container.innerHTML = archives.map(item => `
    <div class="relative bg-[#181818] border border-white/10 rounded-xl overflow-hidden group">
      <img src="${item.dataUrl}" class="w-full aspect-[2/3] object-cover cursor-pointer" onclick="openArchivePreview('${item.dataUrl}')">
      <button onclick="toggleFavoriteArchive(${item.id})" class="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-sm shadow">
        ${item.isFavorite ? '⭐' : '☆'}
      </button>
      <div class="p-2 flex items-center justify-between text-[10px] text-slate-400">
        <span>${item.date}</span>
        <a href="${item.dataUrl}" download="Photoist_${item.id}.jpg" class="text-rose-400 font-bold hover:underline">다운로드</a>
      </div>
    </div>
  `).join('');
}

function openArchivePreview(url) {
  const w = window.open('');
  if (w) {
    w.document.write(`<body style="margin:0;background:#111;display:flex;justify-content:center;align-items:center;min-height:100vh;"><img src="${url}" style="max-height:95vh;box-shadow:0 0 20px rgba(0,0,0,0.8);border-radius:8px;"></body>`);
  }
}

// ========================================================
// 20. 실행취소(Undo/Redo), 뷰포트 보정 & 초기 구동 엔트리포인트
// ========================================================
function saveStateForUndo() {
  const snapshot = JSON.stringify({
    stickers: appState.stickers,
    layout: appState.layout,
    frameStyle: appState.frameStyle,
    frameThickness: appState.frameThickness,
    frameColor: appState.frameColor,
    activeFilter: appState.activeFilter,
    filters: appState.filters,
    showDate: appState.showDate,
    typography: appState.typography,
    sideEngravingEnabled: appState.sideEngravingEnabled,
    sideEngravingText: appState.sideEngravingText,
    selectedCutMode: appState.selectedCutMode,
    customTitle: document.getElementById('frameSignatureInput') ? document.getElementById('frameSignatureInput').value : ''
  });
  historyStack.push(snapshot);
  if (historyStack.length > 30) historyStack.shift();
  redoStack = [];
}

function undo() {
  if (historyStack.length === 0) return;
  const currentSnap = JSON.stringify({
    stickers: appState.stickers,
    layout: appState.layout,
    frameStyle: appState.frameStyle,
    frameThickness: appState.frameThickness,
    frameColor: appState.frameColor,
    activeFilter: appState.activeFilter,
    filters: appState.filters,
    showDate: appState.showDate,
    typography: appState.typography,
    sideEngravingEnabled: appState.sideEngravingEnabled,
    sideEngravingText: appState.sideEngravingText,
    selectedCutMode: appState.selectedCutMode,
    customTitle: document.getElementById('frameSignatureInput') ? document.getElementById('frameSignatureInput').value : ''
  });
  redoStack.push(currentSnap);
  applySnapshot(JSON.parse(historyStack.pop()));
}

function redo() {
  if (redoStack.length === 0) return;
  const currentSnap = JSON.stringify({
    stickers: appState.stickers,
    layout: appState.layout,
    frameStyle: appState.frameStyle,
    frameThickness: appState.frameThickness,
    frameColor: appState.frameColor,
    activeFilter: appState.activeFilter,
    filters: appState.filters,
    showDate: appState.showDate,
    typography: appState.typography,
    sideEngravingEnabled: appState.sideEngravingEnabled,
    sideEngravingText: appState.sideEngravingText,
    selectedCutMode: appState.selectedCutMode,
    customTitle: document.getElementById('frameSignatureInput') ? document.getElementById('frameSignatureInput').value : ''
  });
  historyStack.push(currentSnap);
  applySnapshot(JSON.parse(redoStack.pop()));
}

function applySnapshot(snap) {
  appState.stickers = snap.stickers || [];
  appState.layout = snap.layout;
  appState.frameStyle = snap.frameStyle;
  appState.frameThickness = snap.frameThickness;
  appState.frameColor = snap.frameColor;
  appState.activeFilter = snap.activeFilter;
  appState.filters = snap.filters;
  appState.showDate = snap.showDate;
  appState.typography = snap.typography;
  appState.sideEngravingEnabled = snap.sideEngravingEnabled || false;
  appState.sideEngravingText = snap.sideEngravingText || "";
  appState.selectedCutMode = snap.selectedCutMode || 4;

  if (document.getElementById('frameSignatureInput')) {
    document.getElementById('frameSignatureInput').value = snap.customTitle || '';
  }
  const sideToggle = document.getElementById('sideEngravingToggle');
  if (sideToggle) sideToggle.checked = appState.sideEngravingEnabled;
  renderStrip();
}

function updateAppVh() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--app-vh', `${vh}px`);

  // 스마트폰 가로모드 5:5 듀얼 스플릿 자동 감지
  const isLandscape = window.innerWidth > window.innerHeight && window.innerWidth < 1024;
  const editSec = document.getElementById('screenEdit');
  if (editSec) {
    if (isLandscape) editSec.classList.add('landscape-split-active');
    else editSec.classList.remove('landscape-split-active');
  }
}

function closeRotationOverlay() {
  const overlay = document.getElementById('cameraRotationOverlay');
  if (overlay) overlay.classList.add('hidden');
}

window.addEventListener('resize', updateAppVh);
window.addEventListener('orientationchange', () => {
  setTimeout(updateAppVh, 150);
});

window.addEventListener('DOMContentLoaded', () => {
  updateAppVh();
  loadSavedTheme();
  initDynamicUI();
  initCanvasInteractions();
  setupCanvasPinchZoom();
  renderMainNotices();
  trackVisitorAccess();
  fetchCloudBoardPosts();
  checkGeoConsent();

  const savedUser = localStorage.getItem('chueok_auth_user');
  if (savedUser) {
    try {
      appState.currentUser = JSON.parse(savedUser);
      if (appState.currentUser && appState.currentUser.userId === 'knsupolo') {
        appState.isAdmin = true;
      }
      updateAuthUI();
    } catch (e) {}
  }

  // 카메라 회전 안내 오버레이 닫기 버튼 이벤트 바인딩
  const btnCloseRot = document.getElementById('btnCloseRotationOverlay');
  if (btnCloseRot) btnCloseRot.onclick = closeRotationOverlay;
});
