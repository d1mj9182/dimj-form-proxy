/**
 * DIMJ-form Frontend v3.0 - FINAL VERSION 2025-09-18
 * 완전 새로운 버전 - 모든 임의 숫자 생성 제거
 * - 단일 타이머(30초) / 중복 방지
 * - 프록시에서 정제된 데이터만 사용 (숫자 임의 변동 제거)
 * - 최신순(내림차순) 리스트 반영
 * - 빈 레코드 무시 (프록시에서 이미 제거되지만 안전망 유지)
 *
 * ⚠️ HTML/CSS/레이아웃/ID는 기존 것 유지.
 * 아래 SELECTORS만 필요에 맞게 맞춰주세요(기본값은 흔히 쓰는 id 예시).
 */

console.log('🚀 DIMJ Frontend v3.0 로드됨 - 모든 임의 숫자 생성 제거됨');

/* =========================
   0) 셀렉터 매핑(실제 HTML ID에 맞춤)
   ========================= */
const SELECTORS = {
  // 숫자 카운터 (실제 HTML ID)
  todayCount:    '#todayApplications',      // 오늘접수
  waitingCount:  '#waitingConsultation',    // 상담대기
  ongoingCount:  '#consultingNow',          // 상담중
  doneCount:     '#completedConsultations', // 상담완료
  reserveCount:  '#installReservation',     // 설치예약
  installedCount:'#onlineConsultants',      // 설치완료
  giftPaidCount: '#cashReward',             // 사은품금액 (만원 단위)

  // 상담 리스트 컨테이너(최신이 맨 위)
  consultList:   '#consultationList',

  // 로딩/에러 표시(선택)
  loadingBar:    '#loading-bar',
  errorBox:      '#error-box',
};

/* =========================
   1) 유틸
   ========================= */

// 안전하게 엘리먼트 찾기
function $(sel) {
  return document.querySelector(sel);
}

// TEXT 업데이트(요소 없으면 무시)
function setText(sel, text) {
  const el = $(sel);
  if (el) el.textContent = String(text ?? '');
}

// Asia/Seoul 기준 "YYYY-MM-DD" 반환
function todayKST() {
  const now = new Date();
  // 브라우저가 한국이 아닐 수 있으므로, 한국 로캘 날짜만 추출
  const kst = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const yyyy = kst.getFullYear();
  const mm = String(kst.getMonth() + 1).padStart(2, '0');
  const dd = String(kst.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// 문자열/숫자 등 안전접근
const safe = (v, def = '') => (v === null || v === undefined ? def : v);

/* =========================
   2) 렌더링: 통계
   ========================= */
function updateStatisticsFromRecords(records) {
  // 상태 값 기준 카운트
  let waiting = 0;     // 상담 대기
  let ongoing = 0;     // 상담 중
  let done = 0;        // 상담완료
  let reserve = 0;     // 설치예약
  let installed = 0;   // 설치완료
  let totalGift = 0;   // 사은품 총액

  // 오늘 접수(접수일시가 있으면 그걸 우선, 없으면 createdTime 사용)
  const today = todayKST();
  let todayCount = 0;

  for (const r of records) {
    if (!r || !r.fields) continue;

    const f = r.fields;
    const status = safe(f['상태']).trim(); // Proxy에서 이모지 제거되어 한글키 매칭 가능

    // 오늘 접수 판별
    const dateStr = safe(f['접수일시']); // "YYYY-MM-DD" 가정
    let isToday = false;
    if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      isToday = (dateStr === today);
    } else if (r.createdTime) {
      // createdTime 기준 보정
      const kstCreated = new Date(new Date(r.createdTime).toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
      const yyyy = kstCreated.getFullYear();
      const mm = String(kstCreated.getMonth() + 1).padStart(2, '0');
      const dd = String(kstCreated.getDate()).padStart(2, '0');
      isToday = (`${yyyy}-${mm}-${dd}` === today);
    }
    if (isToday) todayCount++;

    // 상태 카운트
    switch (status) {
      case '상담 대기':
      case '상담대기':
        waiting++;
        break;
      case '상담 중':
      case '상담중':
        ongoing++;
        break;
      case '상담완료':
      case '상담 완료':
        done++;
        break;
      case '설치예약':
      case '설치 예약':
        reserve++;
        break;
      case '설치완료':
      case '설치 완료':
        installed++;
        break;
      default:
        break;
    }

    // 사은품 금액 합계
    const giftAmount = parseInt(safe(f['사은품금액'], '0')) || 0;
    totalGift += giftAmount;
  }

  // 숫자 DOM 반영
  setText(SELECTORS.todayCount, todayCount);
  setText(SELECTORS.waitingCount, waiting);
  setText(SELECTORS.ongoingCount, ongoing);
  setText(SELECTORS.doneCount, done);
  setText(SELECTORS.reserveCount, reserve);
  setText(SELECTORS.installedCount, installed);
  setText(SELECTORS.giftPaidCount, Math.floor(totalGift / 10000)); // 만원 단위

  console.log(`📊 통계 업데이트: 오늘${todayCount}, 대기${waiting}, 중${ongoing}, 완료${done}, 예약${reserve}, 설치${installed}, 사은품${Math.floor(totalGift / 10000)}만원`);
}

/* =========================
   3) 렌더링: 상담 리스트(최신순)
   ========================= */
function renderConsultationList(records) {
  const wrap = $(SELECTORS.consultList);
  if (!wrap) return;

  // 최신이 위로 오도록: Proxy에서 이미 정렬되어 옴(내림차순)
  // 여기서는 안전하게 한 번 더 정렬(중복 정렬 OK, 비용 미미)
  const sorted = records.slice().sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));

  // 상위 7개만 표시
  const displayRecords = sorted.slice(0, 7);

  // 기존 리스트 비우고 다시 그리기
  wrap.innerHTML = '';

  if (displayRecords.length === 0) {
    wrap.innerHTML = `
      <div class="consultation-item empty-state">
        <div class="consultation-left">
          <div class="consultation-dot blue"></div>
          <div class="consultation-info">
            <h4 class="consultation-name blue">접수 대기 중</h4>
            <p class="consultation-service">신규 접수를 기다리고 있습니다</p>
            <p class="consultation-date">실시간 연동 중</p>
          </div>
        </div>
        <div class="consultation-right">
          <p class="consultation-amount blue">-</p>
          <p class="consultation-time">대기</p>
        </div>
      </div>
    `;
    return;
  }

  // 레코드 → DOM
  const frag = document.createDocumentFragment();
  for (let i = 0; i < displayRecords.length; i++) {
    const r = displayRecords[i];
    if (!r || !r.fields) continue;

    const f = r.fields;
    const name = safe(f['이름'], '익명');
    const service = safe(f['주요서비스'], '상담');
    const status = safe(f['상태'], '접수완료');
    const amount = parseInt(safe(f['사은품금액'], '0')) || 0;

    // 이름 마스킹
    const displayName = name ? name.replace(/(.{1})/g, '$1○').slice(0, 3) + '○' : '익명○○';

    // 상태별 색상
    const getStatusColor = (status) => {
      const colorMap = {
        '상담 대기': 'orange',
        '상담대기': 'orange',
        '상담 중': 'green',
        '상담중': 'green',
        '상담완료': 'blue',
        '상담 완료': 'blue',
        '설치예약': 'purple',
        '설치 예약': 'purple',
        '설치완료': 'teal',
        '설치 완료': 'teal'
      };
      return colorMap[status] || 'blue';
    };

    const statusColor = getStatusColor(status);

    // createdTime KST 표시
    const createdKST = new Date(new Date(r.createdTime).toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const timeStr = `${String(createdKST.getHours()).padStart(2, '0')}:${String(createdKST.getMinutes()).padStart(2, '0')}`;

    // 기존 HTML 구조 유지
    const item = document.createElement('div');
    item.className = `consultation-item ${statusColor} ${i === 0 ? 'new' : ''}`;

    item.innerHTML = `
      <div class="consultation-left">
        <div class="consultation-dot ${statusColor}"></div>
        <div class="consultation-info">
          <h4 class="consultation-name ${statusColor}">${displayName} 고객님</h4>
          <p class="consultation-service">${service} ${status}</p>
          <p class="consultation-date">${timeStr}</p>
        </div>
      </div>
      <div class="consultation-right">
        <p class="consultation-amount ${statusColor}">현금 ${amount}만원</p>
        <p class="consultation-time">실시간</p>
      </div>
    `;

    frag.appendChild(item);
  }

  wrap.appendChild(frag);
  console.log(`📋 리스트 업데이트 완료: ${displayRecords.length}개 항목 (최신순)`);
}

/* =========================
   4) 단일 fetch → 숫자/리스트 동시 업데이트
   ========================= */
const AIRTABLE_PROXY_ENDPOINT = 'https://dimj-form-proxy.vercel.app/api/airtable'; // 실제 프록시 URL

let DIMJ_FETCH_LOCK = false; // 중복 호출 방지

function setLoading(on) {
  const el = $(SELECTORS.loadingBar);
  if (el) el.style.display = on ? 'block' : 'none';
}

function showError(msg) {
  const el = $(SELECTORS.errorBox);
  if (el) {
    el.textContent = msg || '';
    el.style.display = msg ? 'block' : 'none';
  }
  if (msg) {
    console.error('❌ 에러:', msg);
  }
}

async function refreshAll() {
  if (DIMJ_FETCH_LOCK) {
    console.log('⚡ 중복 호출 방지');
    return;
  }

  DIMJ_FETCH_LOCK = true;
  setLoading(true);
  showError('');

  try {
    console.log('🔄 단일 API 호출 시작...');

    const resp = await fetch(AIRTABLE_PROXY_ENDPOINT, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json'
      },
    });

    if (!resp.ok) throw new Error(`Proxy ${resp.status}`);

    const data = await resp.json();
    if (!data.success) throw new Error(data.error || 'Unknown proxy error');

    // 안전망: 빈 fields 제거 (프록시에서 이미 처리되지만 이중 안전장치)
    const records = (data.records || []).filter(r => r && r.fields && Object.keys(r.fields).length > 0);

    console.log(`📊 받은 유효 레코드: ${records.length}개`);
    if (records.length > 0) {
      const latest = records[0];
      const latestName = latest.fields['이름'] || '익명';
      const latestTime = new Date(latest.createdTime).toLocaleTimeString();
      console.log(`🎯 최신 레코드: ${latestName} (${latestTime})`);
    }

    updateStatisticsFromRecords(records);
    renderConsultationList(records);

    console.log('✅ 데이터 업데이트 완료');

  } catch (err) {
    console.error('[refreshAll]', err);
    showError('데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
  } finally {
    setLoading(false);
    DIMJ_FETCH_LOCK = false;
  }
}

/* =========================
   5) 단일 타이머(30초) + 중복 방지
   ========================= */
function startSingleTimer() {
  // 기존 타이머 제거(중복 방지)
  if (window.DIMJ_SINGLE_TIMER) {
    clearInterval(window.DIMJ_SINGLE_TIMER);
    window.DIMJ_SINGLE_TIMER = null;
    console.log('🧹 기존 타이머 제거됨');
  }

  // 모든 기존 interval 제거 (강력한 정리)
  for (let i = 1; i < 99999; i++) {
    window.clearInterval(i);
  }
  console.log('🧹 모든 기존 interval 제거됨');

  // 즉시 1회 갱신
  console.log('🚀 즉시 데이터 로드 시작');
  refreshAll();

  // 이후 30초마다 1회 호출
  window.DIMJ_SINGLE_TIMER = setInterval(() => {
    console.log('⏰ 30초 타이머 실행 - 데이터 갱신');
    refreshAll();
  }, 30 * 1000);

  console.log('✅ 단일 타이머 시스템 시작됨 (30초 간격)');
}

/* =========================
   6) 실시간 시간 표시 (기존 기능 유지)
   ========================= */
function updateLiveTime() {
  const liveTimeEl = document.querySelector('#liveTime, .live-time');
  if (liveTimeEl) {
    const now = new Date();
    const timeString = now.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    liveTimeEl.textContent = `LIVE • ${timeString}`;
  }
}

// 시간 표시 타이머 (기존 기능 유지 - 숫자에 영향 없음)
function startTimeDisplay() {
  updateLiveTime();
  setInterval(updateLiveTime, 1000);
}

/* =========================
   7) 폼 관련 기존 기능들 (유지)
   ========================= */

// Step management
let currentStep = 1;
const totalSteps = 3;

function updateProgressBar() {
  const progressBar = document.querySelector('.progress-fill');
  if (progressBar) {
    const progress = (currentStep / totalSteps) * 100;
    progressBar.style.width = `${progress}%`;
  }
}

function updateStepIndicator() {
  const indicators = document.querySelectorAll('.step-indicator .step');
  indicators.forEach((indicator, index) => {
    const stepNumber = index + 1;
    indicator.classList.toggle('active', stepNumber === currentStep);
    indicator.classList.toggle('completed', stepNumber < currentStep);
  });
}

function nextStep() {
  if (currentStep < totalSteps) {
    currentStep++;
    updateProgressBar();
    updateStepIndicator();
    showStep(currentStep);
  }
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    updateProgressBar();
    updateStepIndicator();
    showStep(currentStep);
  }
}

function showStep(step) {
  const formSteps = document.querySelectorAll('.form-step');
  formSteps.forEach((stepEl, index) => {
    stepEl.style.display = (index + 1 === step) ? 'block' : 'none';
  });
}

// 페이지 진입 시 시작
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 DIMJ-form 초기화 시작');

  // 기존 UI 초기화
  updateProgressBar();
  updateStepIndicator();
  showStep(currentStep);

  // 시간 표시 시작
  startTimeDisplay();

  // 핵심: 단일 타이머 시스템 시작
  startSingleTimer();

  console.log('✅ DIMJ-form 초기화 완료');
});

// 페이지 떠날 때 정리
window.addEventListener('beforeunload', () => {
  if (window.DIMJ_SINGLE_TIMER) {
    clearInterval(window.DIMJ_SINGLE_TIMER);
    window.DIMJ_SINGLE_TIMER = null;
  }
  console.log('🧹 페이지 종료 시 타이머 정리 완료');
});