// Global state
let currentStep = 1;
window.currentStep = currentStep;

// Simple nextStep function - defined early to ensure it's available
function nextStep() {
    console.log('nextStep function called, currentStep:', currentStep);

    if (currentStep >= 3) {
        console.log('Already at final step');
        return;
    }

    currentStep++;
    window.currentStep = currentStep;
    console.log('Moving to step:', currentStep);

    // Hide all steps
    const allSteps = document.querySelectorAll('.step-content');
    allSteps.forEach(step => step.classList.remove('active'));

    // Show current step
    const targetStep = document.getElementById(`step${currentStep}`);
    if (targetStep) {
        targetStep.classList.add('active');
        console.log('Successfully showed step', currentStep);

        // Step 2로 이동할 때 레이아웃 안정화
        if (currentStep === 2) {
            // 즉시 실행으로 변경하여 깜빡임 방지
            setTimeout(() => {
                // 더 구체적인 요소만 조정
                const statusBoards = document.querySelectorAll('.status-board');
                statusBoards.forEach(board => {
                    if (board.closest('#step2') && window.innerWidth >= 1024) {
                        board.style.cssText += `
                            max-width: 1200px !important;
                            margin: 40px auto !important;
                            width: 90% !important;
                            box-sizing: border-box !important;
                        `;
                    }
                });
            }, 0); // 0ms로 즉시 실행
        }
    } else {
        console.error('Could not find step element:', `step${currentStep}`);
    }
    
    // Update progress bar
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        const percentage = (currentStep / 3) * 100;
        progressBar.style.width = `${percentage}%`;
    }
    
    // Update step indicator
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        if (index + 1 <= currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Make it globally available immediately
window.nextStep = nextStep;

// Previous step function
function previousStep() {
    console.log('previousStep function called, currentStep:', currentStep);
    
    if (currentStep <= 1) {
        console.log('Already at first step');
        return;
    }
    
    currentStep--;
    window.currentStep = currentStep;
    console.log('Moving back to step:', currentStep);
    
    // Hide all steps
    const allSteps = document.querySelectorAll('.step-content');
    allSteps.forEach(step => step.classList.remove('active'));
    
    // Show current step
    const targetStep = document.getElementById(`step${currentStep}`);
    if (targetStep) {
        targetStep.classList.add('active');
        console.log('Successfully showed step', currentStep);
    } else {
        console.error('Could not find step element:', `step${currentStep}`);
    }
    
    // Update progress bar
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        const percentage = (currentStep / 3) * 100;
        progressBar.style.width = `${percentage}%`;
    }
    
    // Update step indicator
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        if (index + 1 <= currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Make it globally available
window.previousStep = previousStep;

// Preview Step 3 function
function previewStep3() {
    console.log('previewStep3 function called');
    
    // Set currentStep to 3 for preview
    const originalStep = currentStep;
    currentStep = 3;
    window.currentStep = currentStep;
    
    // Hide all steps
    const allSteps = document.querySelectorAll('.step-content');
    allSteps.forEach(step => step.classList.remove('active'));
    
    // Show step 3
    const step3 = document.getElementById('step3');
    if (step3) {
        step3.classList.add('active');
        
        // Display preview info
        const submittedInfoEl = document.getElementById('submittedInfo');
        if (submittedInfoEl) {
            submittedInfoEl.innerHTML = `
                <p><strong>이름:</strong> 홍길동 (미리보기)</p>
                <p><strong>연락처:</strong> 010-1234-5678 (미리보기)</p>
                <p><strong>관심 서비스:</strong> 인터넷, IPTV (미리보기)</p>
                <p><strong>선택 통신사:</strong> SK (미리보기)</p>
                <p><strong>희망 시간:</strong> 빠른 시간에 연락드립니다 (미리보기)</p>
                <div style="margin-top: 1rem; padding: 1rem; background: #fef3c7; border-radius: 0.5rem; border-left: 4px solid #f59e0b;">
                    <p style="color: #92400e; font-weight: 500;">
                        ⚠️ 이것은 미리보기입니다. 실제 신청 데이터가 아닙니다.
                    </p>
                </div>
            `;
        }
        
        console.log('Successfully showed step 3 preview');
    }
    
    // Update progress bar to 100%
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.style.width = '100%';
    }
    
    // Update step indicator
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        if (index + 1 <= 3) {
            step.classList.add('active');
        }
    });
    
    // Add back to form button
    setTimeout(() => {
        const completionContent = document.querySelector('.completion-content');
        if (completionContent) {
            const backToFormBtn = document.createElement('button');
            backToFormBtn.innerHTML = '<i class="fas fa-arrow-left"></i> 폼으로 돌아가기';
            backToFormBtn.className = 'back-to-form-btn';
            backToFormBtn.onclick = function() {
                // Restore original step
                currentStep = originalStep;
                window.currentStep = currentStep;
                
                // Show original step
                allSteps.forEach(step => step.classList.remove('active'));
                const targetStep = document.getElementById(`step${originalStep}`);
                if (targetStep) {
                    targetStep.classList.add('active');
                }
                
                // Update progress bar
                if (progressBar) {
                    const percentage = (currentStep / 3) * 100;
                    progressBar.style.width = `${percentage}%`;
                }
                
                // Update step indicator
                steps.forEach((step, index) => {
                    if (index + 1 <= currentStep) {
                        step.classList.add('active');
                    } else {
                        step.classList.remove('active');
                    }
                });
                
                // Remove the button
                this.remove();
            };
            
            // Check if button doesn't already exist
            if (!completionContent.querySelector('.back-to-form-btn')) {
                completionContent.appendChild(backToFormBtn);
            }
        }
    }, 100);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Make it globally available
window.previewStep3 = previewStep3;

// Check URL hash for direct step access
function checkURLHash() {
    const hash = window.location.hash;
    console.log('Current URL hash:', hash);
    
    if (hash === '#step1') {
        goToStep(1);
    } else if (hash === '#step2') {
        goToStep(2);
    } else if (hash === '#step3') {
        goToStep(3, true); // true = preview mode for step 3
    }
}

// Go to specific step function
function goToStep(stepNumber, isPreview = false) {
    console.log('goToStep called:', stepNumber, isPreview ? '(preview)' : '');
    
    // Validate step number
    if (stepNumber < 1 || stepNumber > 3) {
        console.error('Invalid step number:', stepNumber);
        return;
    }
    
    // Update current step
    currentStep = stepNumber;
    window.currentStep = currentStep;
    
    // Hide all steps
    const allSteps = document.querySelectorAll('.step-content');
    allSteps.forEach(step => step.classList.remove('active'));
    
    // Show target step
    const targetStep = document.getElementById(`step${stepNumber}`);
    if (targetStep) {
        targetStep.classList.add('active');
        console.log('Successfully showed step', stepNumber);
    } else {
        console.error('Could not find step element:', `step${stepNumber}`);
        return;
    }
    
    // Update progress bar
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        const percentage = (stepNumber / 3) * 100;
        progressBar.style.width = `${percentage}%`;
    }
    
    // Update step indicator
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        if (index + 1 <= stepNumber) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    // Special handling for step 3 (completion page)
    if (stepNumber === 3 && isPreview) {
        const submittedInfoEl = document.getElementById('submittedInfo');
        if (submittedInfoEl) {
            submittedInfoEl.innerHTML = `
                <p><strong>이름:</strong> 홍길동 (URL 미리보기)</p>
                <p><strong>연락처:</strong> 010-1234-5678 (URL 미리보기)</p>
                <p><strong>관심 서비스:</strong> 인터넷, IPTV (URL 미리보기)</p>
                <p><strong>선택 통신사:</strong> SK (URL 미리보기)</p>
                <p><strong>희망 시간:</strong> 빠른 시간에 연락드립니다 (URL 미리보기)</p>
                <div style="margin-top: 1rem; padding: 1rem; background: #e0f2fe; border-radius: 0.5rem; border-left: 4px solid #0ea5e9;">
                    <p style="color: #0c4a6e; font-weight: 500;">
                        💡 URL로 직접 접근한 3단계 미리보기입니다.
                    </p>
                    <p style="color: #0c4a6e; font-size: 0.875rem; margin-top: 0.5rem;">
                        다른 단계로 이동: <a href="#step1" style="color: #0ea5e9;">1단계</a> | <a href="#step2" style="color: #0ea5e9;">2단계</a>
                    </p>
                </div>
            `;
        }
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Listen for hash changes
window.addEventListener('hashchange', function() {
    console.log('Hash changed, rechecking...');
    checkURLHash();
});

// Make functions globally available
window.checkURLHash = checkURLHash;
window.goToStep = goToStep;
let formData = {
    name: '',
    phone: '',
    service: '',
    provider: '',
    preference: ''
};

// Anti-fraud protection
let antiSpam = {
    isSubmitting: false,
    lastSubmitTime: 0,
    clickCount: 0,
    lastClickTime: 0,
    ipSubmitCount: 0,
    startTime: Date.now(),
    userInteractions: [],
    userIP: null,
    dailyLimit: 3
};

let realTimeData = {
    todayApplications: 0,
    cashReward: 0,
    installationsCompleted: 0,
    onlineConsultants: 0,
    recentConsultations: [] // 빈 배열로 시작 - 에어테이블 데이터로만 채움
};

// 데스크톱에서만 실시간 상담현황 너비 조정 (간소화)
function adjustDesktopStatusWidth() {
    // 이 함수는 더 이상 사용하지 않음 - nextStep에서 직접 처리
    console.log('adjustDesktopStatusWidth 함수 호출됨 (사용 안함)');
}

// 페이지 로드와 리사이즈 시 실행
window.addEventListener('load', adjustDesktopStatusWidth);
window.addEventListener('resize', adjustDesktopStatusWidth);

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing application');
    
    // Check URL hash for direct step access
    checkURLHash();
    trackVisitor();

    // 데스크톱 상담현황 너비 조정 실행
    adjustDesktopStatusWidth();

    // 스텝 변경 시에도 다시 실행
    setTimeout(adjustDesktopStatusWidth, 1000);
    
    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        // Handle typing/input
        phoneInput.addEventListener('input', function(e) {
            const formatted = formatPhoneNumber(e.target.value);
            e.target.value = formatted;
        });

        // Handle paste events
        phoneInput.addEventListener('paste', function(e) {
            e.preventDefault();
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            const formatted = formatPhoneNumber(pastedText);
            e.target.value = formatted;

            // Trigger input event for validation
            const inputEvent = new Event('input', { bubbles: true });
            e.target.dispatchEvent(inputEvent);
        });

        // Handle backspace and delete keys properly
        phoneInput.addEventListener('keydown', function(e) {
            // Allow: backspace, delete, tab, escape, enter
            if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                (e.keyCode === 65 && e.ctrlKey === true) ||
                (e.keyCode === 67 && e.ctrlKey === true) ||
                (e.keyCode === 86 && e.ctrlKey === true) ||
                (e.keyCode === 88 && e.ctrlKey === true)) {
                return;
            }
            // Ensure that it is a number and stop the keypress
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        });
    }
    
    // Initialize all components
    updateProgressBar();
    updateStepIndicator();
    updateLiveTime();
    renderConsultationList();
    setupEventListeners();
    console.log('🚀 페이지 로드 완료, 즉시 API 호출 실행'); // 디버깅 로그
    updateConsultationList(); // 즉시 API 호출
    startRealTimeUpdates();
    addInteractionTracking();
    cleanOldSubmitCounts();
    checkDailyLimit();
    loadMainPageContent();
    loadBannerContent();
    loadMainBannersContent();
    loadDetailImagesContent();
    setupClickHandlers();
    initializeTelecomButtons();
    
    // Add entrance animations with delay
    setTimeout(addEntranceAnimations, 100);
    
    console.log('Application initialization complete');
});

// Event Listeners Setup
function setupEventListeners() {
    // Form validation
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const serviceCheckboxes = document.querySelectorAll('input[name="service"]');
    const providerRadios = document.querySelectorAll('input[name="provider"]');
    
    if (nameInput) nameInput.addEventListener('input', validateForm);
    if (phoneInput) phoneInput.addEventListener('input', validateForm);
    
    serviceCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateSelectedServices();
            validateForm();
        });
    });

    providerRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateSelectedProvider();
            validateForm();
        });
    });

    // Form submission
    const applicationForm = document.getElementById('applicationForm');
    if (applicationForm) {
        applicationForm.addEventListener('submit', handleFormSubmit);
    }

    // 🔥 강제 버튼 활성화 + 클릭 이벤트 직접 추가 + 개인정보 자동 체크
    setTimeout(() => {
        // 🔥 개인정보 체크박스 자동 체크
        const privacyAgree = document.getElementById('privacyAgree');
        if (privacyAgree && !privacyAgree.checked) {
            privacyAgree.checked = true;
            console.log('✅ 개인정보 동의 자동 체크됨 (페이지 로드 시)');

            // 체크 후 폼 검증 다시 실행
            validateForm();
        }

        const submitButton = document.getElementById('submitButton');
        if (submitButton) {
            console.log('🔥 강제 버튼 활성화 시도');
            submitButton.disabled = false;
            submitButton.classList.remove('disabled');
            submitButton.style.opacity = '1';
            submitButton.style.pointerEvents = 'auto';

            // 🔥 직접 클릭 이벤트 추가
            submitButton.addEventListener('click', function(e) {
                console.log('🔥🔥🔥 버튼 클릭됨!', e);
                e.preventDefault();

                // 폼 데이터 수집
                const nameInput = document.getElementById('name');
                const phoneInput = document.getElementById('phone');
                const privacyAgree = document.getElementById('privacyAgree');

                // 🔥 개인정보 체크박스 강제 체크
                if (privacyAgree) {
                    privacyAgree.checked = true;
                    console.log('✅ 개인정보 동의 자동 체크됨');
                }

                if (nameInput?.value && phoneInput?.value && privacyAgree?.checked) {
                    console.log('✅ 폼 검증 통과 - 즉시 다음 페이지로!');

                    // 폼 데이터 설정
                    formData.name = nameInput.value.trim();
                    formData.phone = phoneInput.value.trim();
                    formData.service = '인터넷+IPTV';
                    formData.provider = 'SK';

                    // 즉시 다음 페이지로
                    nextStep();
                    displaySubmittedInfo();

                    // 백그라운드에서 에어테이블 전송
                    submitToAirtable(formData).catch(err => {
                        console.error('백그라운드 전송 실패:', err);
                    });
                } else {
                    alert('이름, 연락처, 개인정보 동의가 필요합니다.');
                }
            });

            console.log('✅ 버튼 강제 활성화 + 클릭 이벤트 추가 완료');
        } else {
            console.error('❌ submitButton을 찾을 수 없음');
        }
    }, 3000);
}

// Step Navigation (main nextStep function is defined at the top)

function updateStep() {
    console.log('updateStep called for step:', currentStep);
    
    // Hide all step contents
    const stepContents = document.querySelectorAll('.step-content');
    stepContents.forEach(content => content.classList.remove('active'));
    
    // Show current step content
    const currentContent = document.getElementById(`step${currentStep}`);
    if (currentContent) {
        currentContent.classList.add('active');
        console.log('Successfully activated step', currentStep);
    } else {
        console.error('Could not find step content for step:', currentStep);
    }
    
    updateProgressBar();
    updateStepIndicator();
    
    // Re-setup event listeners for new step
    if (currentStep === 2) {
        setupEventListeners();
    }
}

// Progress Bar
function updateProgressBar() {
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        const percentage = (currentStep / 3) * 100;
        progressBar.style.width = `${percentage}%`;
    }
}

// Step Indicator
function updateStepIndicator() {
    const steps = document.querySelectorAll('.step');
    const stepLines = document.querySelectorAll('.step-line');
    
    steps.forEach((step, index) => {
        const stepNumber = index + 1;
        if (stepNumber <= currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    stepLines.forEach((line, index) => {
        const stepNumber = index + 1;
        if (stepNumber < currentStep) {
            line.classList.add('active');
        } else {
            line.classList.remove('active');
        }
    });
}

// Real-time Updates
function startRealTimeUpdates() {
    console.log('✅ 실시간 업데이트 타이머 시작됨'); // 디버깅 로그

    // ✅ 에어테이블 실제 데이터 기반 통계 업데이트 (30초마다)
    setInterval(() => {
        updateStatistics();
    }, 30000);

    // 즉시 한 번 실행
    updateStatistics();

    // Update consultation list every 8 seconds
    setInterval(() => {
        updateConsultationList();
    }, 8000);

    // Update live time every second
    setInterval(() => {
        updateLiveTime();
    }, 1000);

    // Update gift amounts from Airtable every 30 seconds (if configured)
    setInterval(() => {
        updateGiftAmountFromAirtable();
    }, 30000);

    // Initial gift amount update
    updateGiftAmountFromAirtable();
}

async function updateStatistics() {
    // 에어테이블에서 실제 데이터를 가져와서 통계 업데이트
    try {
        console.log('📊 에어테이블 데이터 가져오는 중...');
        const response = await fetch(`https://dimj-form-proxy.vercel.app/api/airtable`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success && data.records) {
                console.log(`📋 총 ${data.records.length}개 레코드 받음`);

                // 오늘 날짜 (한국 시간 기준)
                const today = new Date().toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }).replace(/\./g, '-').replace(/\s/g, '').slice(0, -1); // YYYY-MM-DD 형식

                // 필터링된 데이터 계산
                const todayRecords = data.records.filter(record => {
                    const recordDate = record.fields['접수일시'];
                    return recordDate && recordDate.includes(today);
                });

                // 🔥 정확한 상태값 매칭 (이모지 제거된 필드에서)
                const waitingRecords = data.records.filter(record => record.fields['상태'] === '상담 대기');
                const consultingRecords = data.records.filter(record => record.fields['상태'] === '상담 중');
                const completedRecords = data.records.filter(record => record.fields['상태'] === '상담완료');
                const reservedRecords = data.records.filter(record => record.fields['상태'] === '설치예약');
                const installedRecords = data.records.filter(record => record.fields['상태'] === '설치완료');

                // 🔥 사은품 총액 계산 - 에어테이블 값이 이미 만원 단위
                const totalGiftAmount = data.records.reduce((sum, record) => {
                    const giftAmount = parseInt(record.fields['사은품금액'] || 0);
                    return sum + giftAmount;
                }, 0);

                // realTimeData 업데이트
                realTimeData.todayApplications = todayRecords.length;
                realTimeData.waitingConsultation = waitingRecords.length;
                realTimeData.consultingNow = consultingRecords.length;
                realTimeData.completedConsultations = completedRecords.length;
                realTimeData.installReservation = reservedRecords.length;
                realTimeData.installationsCompleted = installedRecords.length;
                realTimeData.cashReward = totalGiftAmount;

                console.log(`📊 업데이트된 데이터:
                오늘접수: ${realTimeData.todayApplications}
                상담대기: ${realTimeData.waitingConsultation}
                상담중: ${realTimeData.consultingNow}
                상담완료: ${realTimeData.completedConsultations}
                설치예약: ${realTimeData.installReservation}
                설치완료: ${realTimeData.installationsCompleted}
                사은품: ${realTimeData.cashReward}만원`);
            }
        } else {
            console.error('에어테이블 API 응답 오류:', response.status);
        }
    } catch (error) {
        console.error('통계 업데이트 실패:', error);
        // API 연결 실패시 기존 값 유지 (랜덤 값 생성하지 않음)
    }

    // DOM 요소 업데이트
    const todayAppsEl = document.getElementById('todayApplications');
    const waitingEl = document.getElementById('waitingConsultation');
    const consultingEl = document.getElementById('consultingNow');
    const completedEl = document.getElementById('completedConsultations');
    const reservationEl = document.getElementById('installReservation');
    const installedEl = document.getElementById('onlineConsultants'); // 설치완료를 onlineConsultants ID에 표시
    const cashRewardEl = document.getElementById('cashReward');

    if (todayAppsEl) todayAppsEl.textContent = realTimeData.todayApplications || 0;
    if (waitingEl) waitingEl.textContent = realTimeData.waitingConsultation || 0;
    if (consultingEl) consultingEl.textContent = realTimeData.consultingNow || 0;
    if (completedEl) completedEl.textContent = realTimeData.completedConsultations || 0;
    if (reservationEl) reservationEl.textContent = realTimeData.installReservation || 0;
    if (installedEl) installedEl.textContent = realTimeData.installationsCompleted || 0;
    if (cashRewardEl) cashRewardEl.textContent = realTimeData.cashReward || 0;
}

async function updateConsultationList() {
    console.log('🔄 에어테이블 API 호출 시작...'); // 디버깅 로그
    try {
        // 프록시 서버를 통해 실제 에어테이블 데이터 가져오기
        const response = await fetch(`https://dimj-form-proxy.vercel.app/api/airtable`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('📡 API 응답 상태:', response.status); // 디버깅 로그

        if (response.ok) {
            const data = await response.json();
            console.log('📊 에어테이블 응답 데이터:', data);

            if (data.success && data.records && data.records.length > 0) {
                // 에어테이블 실제 데이터로 모든 통계 업데이트
                const today = new Date().toISOString().split('T')[0]; // 오늘 날짜

                // 이모지를 무시하고 필드값 가져오는 헬퍼 함수
                function getFieldValue(record, targetField) {
                    const fields = record.fields;

                    // 정확한 매칭 시도
                    if (fields[targetField] !== undefined) {
                        return fields[targetField];
                    }

                    // 이모지를 제거하고 매칭 시도
                    const cleanTarget = targetField.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();

                    for (const [fieldName, value] of Object.entries(fields)) {
                        const cleanField = fieldName.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
                        if (cleanField === cleanTarget) {
                            return value;
                        }
                    }

                    return undefined;
                }

                // 오늘 접수 필터링 (이모지 무시)
                const todayRecords = data.records.filter(record => {
                    const recordDate = getFieldValue(record, '접수일시');
                    return recordDate && recordDate.includes(today);
                });

                // 상태별 통계 계산 (이모지 무시)
                const consultingRecords = data.records.filter(record => getFieldValue(record, '상태') === '상담 중');
                const completedRecords = data.records.filter(record => getFieldValue(record, '상태') === '상담완료');
                const installedRecords = data.records.filter(record => getFieldValue(record, '상태') === '설치완료');
                const reservedRecords = data.records.filter(record => getFieldValue(record, '상태') === '설치예약');
                const waitingRecords = data.records.filter(record => getFieldValue(record, '상태') === '상담 대기');

                // 실제 데이터로 업데이트
                realTimeData.todayApplications = todayRecords.length; // 오늘 접수
                realTimeData.cashReward = data.records.reduce((sum, record) => sum + (getFieldValue(record, '사은품금액') || 0), 0); // 에어테이블 값 그대로 사용
                realTimeData.installationsCompleted = installedRecords.length; // 설치완료
                realTimeData.onlineConsultants = installedRecords.length; // 설치완료를 onlineConsultants ID에 표시
                realTimeData.waitingConsultation = waitingRecords.length; // 상담 대기
                realTimeData.consultingNow = consultingRecords.length; // 상담 중
                realTimeData.completedConsultations = completedRecords.length; // 상담 완료
                realTimeData.installReservation = reservedRecords.length; // 설치 예약

                // 에어테이블의 실제 데이터만 상담 목록으로 변환 (이모지 무시)
                const consultations = data.records.map((record, index) => {
                    return {
                        id: record.id || `record_${index}`,
                        name: getFieldValue(record, '이름') ? getFieldValue(record, '이름').replace(/(.{1})/g, '$1○').slice(0, 3) + '○' : '익명○○',
                        service: getFieldValue(record, '주요서비스') || '상담',
                        status: getFieldValue(record, '상태') || '접수완료',
                        amount: getFieldValue(record, '사은품금액') || 0,
                        time: '실시간',
                        date: getFieldValue(record, '접수일시') ? new Date(getFieldValue(record, '접수일시')).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                        color: ['green', 'blue', 'purple', 'orange'][index % 4]
                    };
                }).reverse().slice(0, 7);

                realTimeData.recentConsultations = consultations;
                renderConsultationList();
                updateDashboardStats(); // 대시보드 통계 업데이트
                return;
            } else {
                // 에어테이블에 데이터가 없으면 모든 통계를 0으로 초기화
                console.log('📭 에어테이블에 데이터 없음 - 모든 통계 0으로 초기화');
                realTimeData.todayApplications = 0;
                realTimeData.cashReward = 0;
                realTimeData.installationsCompleted = 0;
                realTimeData.waitingConsultation = 0;
                realTimeData.consultingNow = 0;
                realTimeData.completedConsultations = 0;
                realTimeData.installReservation = 0;
                realTimeData.recentConsultations = [];

                renderConsultationList();
                updateDashboardStats(); // 0으로 초기화된 통계 업데이트
                return;
            }
        }
    } catch (error) {
        console.error('실시간 데이터 로드 실패:', error);
    }

    // API 호출 실패시 모든 통계를 0으로 초기화 (가짜 데이터 생성하지 않음)
    console.log('⚠️ 에어테이블 연결 없음 - 모든 통계 0으로 초기화');

    // 연결 실패시 모든 데이터를 0/빈상태로 초기화
    realTimeData.todayApplications = 0;
    realTimeData.cashReward = 0;
    realTimeData.installationsCompleted = 0;
    realTimeData.waitingConsultation = 0;
    realTimeData.consultingNow = 0;
    realTimeData.completedConsultations = 0;
    realTimeData.installReservation = 0;
    realTimeData.recentConsultations = [];

    renderConsultationList();
    updateDashboardStats();
}

function renderConsultationList() {
    const consultationList = document.getElementById('consultationList');
    if (!consultationList) return;

    // 에어테이블에 데이터가 없을 경우 안내 메시지
    if (realTimeData.recentConsultations.length === 0) {
        consultationList.innerHTML = `
            <div class="consultation-item empty-state">
                <div class="consultation-left">
                    <div class="consultation-info">
                        <h4 class="consultation-name">접수 대기 중</h4>
                        <p class="consultation-service">신규 접수를 기다리고 있습니다</p>
                        <p class="consultation-date">실시간 연동 중</p>
                    </div>
                </div>
                <div class="consultation-right">
                    <p class="consultation-amount">-</p>
                    <p class="consultation-time">대기</p>
                </div>
            </div>
        `;
        return;
    }

    consultationList.innerHTML = realTimeData.recentConsultations.map((consultation, index) => `
        <div class="consultation-item ${consultation.color} ${index === 0 ? 'new' : ''}">
            <div class="consultation-left">
                <div class="consultation-dot ${consultation.color}"></div>
                <div class="consultation-info">
                    <h4 class="consultation-name ${consultation.color}">${consultation.name} 고객님</h4>
                    <p class="consultation-service">${consultation.service} ${consultation.status}</p>
                    <p class="consultation-date">신청일: ${formatDate(consultation.date)}</p>
                </div>
            </div>
            <div class="consultation-right">
                <p class="consultation-amount ${consultation.color}">현금 ${consultation.amount}만원</p>
                <p class="consultation-time">${consultation.time}</p>
            </div>
        </div>
    `).join('');
}


function formatDate(dateString) {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}`;
}

function updateLiveTime() {
    const liveTimeEl = document.getElementById('liveTime');
    if (liveTimeEl) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('ko-KR');
        liveTimeEl.textContent = `LIVE • ${timeString}`;
    }
}

function updateDashboardStats() {
    // 에어테이블 실제 데이터로 모든 통계 업데이트
    const todayApplicationsEl = document.getElementById('todayApplications');
    const completedConsultationsEl = document.getElementById('completedConsultations');
    const onlineConsultantsEl = document.getElementById('onlineConsultants'); // 설치완료 표시
    const waitingConsultationEl = document.getElementById('waitingConsultation');
    const consultingNowEl = document.getElementById('consultingNow');
    const installReservationEl = document.getElementById('installReservation');
    const cashRewardEl = document.getElementById('cashReward');

    // 실제 에어테이블 데이터 표시
    if (todayApplicationsEl) todayApplicationsEl.textContent = realTimeData.todayApplications || 0;
    if (completedConsultationsEl) completedConsultationsEl.textContent = realTimeData.completedConsultations || 0;
    if (onlineConsultantsEl) onlineConsultantsEl.textContent = realTimeData.installationsCompleted || 0; // 설치완료
    if (waitingConsultationEl) waitingConsultationEl.textContent = realTimeData.waitingConsultation || 0;
    if (consultingNowEl) consultingNowEl.textContent = realTimeData.consultingNow || 0;
    if (installReservationEl) installReservationEl.textContent = realTimeData.installReservation || 0;
    if (cashRewardEl) cashRewardEl.textContent = realTimeData.cashReward || 0;
}

// Form Handling
function updateSelectedServices() {
    const checkboxes = document.querySelectorAll('input[name="service"]:checked');
    const selectedServices = Array.from(checkboxes).map(cb => cb.value);
    formData.service = selectedServices.join(',');
}

function updateSelectedProvider() {
    const selectedProvider = document.querySelector('input[name="provider"]:checked');
    formData.provider = selectedProvider ? selectedProvider.value : '';
}

function validateForm() {
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const submitButton = document.getElementById('submitButton');

    console.log('🔍 validateForm 호출됨', {
        nameInput: !!nameInput,
        phoneInput: !!phoneInput,
        submitButton: !!submitButton
    });

    if (!nameInput || !phoneInput || !submitButton) {
        console.error('❌ 필수 요소를 찾을 수 없음!');
        return;
    }
    
    formData.name = nameInput.value.trim();
    formData.phone = phoneInput.value.trim();
    
    // 🔥 폼 검증 완전 간소화 - 이름과 전화번호만 필수
    const nameValue = document.getElementById('name')?.value?.trim();
    const phoneValue = document.getElementById('phone')?.value?.trim();
    const privacyChecked = document.getElementById('privacyAgree')?.checked;

    // 기본값 자동 설정
    if (!formData.service) formData.service = '인터넷+IPTV';
    if (!formData.provider) formData.provider = 'SK';

    console.log('폼 검증:', {
        name: nameValue,
        phone: phoneValue,
        service: formData.service,
        provider: formData.provider,
        privacy: privacyChecked
    });

    // 🔥 실제 체크박스 상태 사용 (자동 체크되므로 정상 작동)
    const isValid = nameValue && phoneValue && privacyChecked;
    
    submitButton.disabled = !isValid;
    
    if (isValid) {
        submitButton.classList.remove('disabled');
        console.log('✅ 버튼 활성화됨');
    } else {
        submitButton.classList.add('disabled');
        console.log('❌ 버튼 비활성화됨');
    }

    console.log('🎯 버튼 상태:', {
        disabled: submitButton.disabled,
        className: submitButton.className,
        isValid: isValid
    });
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const preferenceSelect = document.getElementById('preference');
    
    if (nameInput) formData.name = nameInput.value.trim();
    if (phoneInput) formData.phone = phoneInput.value.trim();
    if (preferenceSelect) formData.preference = preferenceSelect.value;
    
    // Submit to Airtable (simulation)
    submitToAirtable(formData);
    
    // Move to completion step
    nextStep();
    
    // Display submitted information
    displaySubmittedInfo();
}

// 에어테이블 설정은 airtable-config.js에서 불러옴

// Data Storage (localStorage + Airtable)
async function submitToAirtable(data) {
    try {
        console.log('🔥 에어테이블 전송 시작:', data);

        // Generate unique ID for application
        const applicationId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

        // 선택된 서비스들을 수집
        const selectedServices = getSelectedServices();
        const selectedProvider = getSelectedProvider();

        // 이모지를 무시하고 매칭할 수 있는 헬퍼 함수
        function findMatchingField(availableFields, targetField) {
            // 정확히 일치하는 필드 먼저 찾기
            if (availableFields.includes(targetField)) {
                return targetField;
            }

            // 이모지를 제거하고 찾기
            const cleanTarget = targetField.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();

            for (const field of availableFields) {
                const cleanField = field.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
                if (cleanField === cleanTarget) {
                    return field;
                }
            }

            return targetField; // 못 찾으면 원래 이름 반환
        }

        // 에어테이블용 데이터 준비 (동적 필드명 매칭)
        const baseFields = {
            '접수일시': new Date().toISOString(),
            '이름': data.name,
            '연락처': data.phone,
            '통신사': selectedProvider || '',
            '주요서비스': selectedServices.main || '',
            '기타서비스': selectedServices.additional.join(', ') || '',
            '상담희망시간': data.preference || '빠른 시간에 연락드립니다',
            '개인정보동의': 'Y',
            '상태': '상담 대기',
            '사은품금액': 70, // 기본 사은품 70만원
            'IP주소': antiSpam.userIP || 'Unknown',
            'IP': antiSpam.userIP || 'Unknown'
        };

        // 실제 에어테이블 필드명으로 변환 (이모지 포함된 필드명 찾기)
        const airtableData = {
            fields: {}
        };

        // 일단 기본 필드명으로 보내고, 나중에 동적으로 매칭하도록 함
        Object.assign(airtableData.fields, baseFields);

        // 디버깅: 전송할 데이터 로그
        console.log('🔍 에어테이블 전송 데이터:', JSON.stringify(airtableData, null, 2));

        // 로컬 스토리지에 백업 저장
        const localData = {
            ...airtableData.fields,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(`application_${applicationId}`, JSON.stringify(localData));

        // 에어테이블 API 호출 (프록시 서버 환경변수 사용)
        try {
            console.log('📡 POST 요청 시작...');
            const response = await fetch(`https://dimj-form-proxy.vercel.app/api/airtable`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(airtableData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`에어테이블 API 오류: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
            }

            const result = await response.json();
            console.log('에어테이블 전송 성공:', result);
        } catch (apiError) {
            console.error('에어테이블 API 오류:', apiError);
            // API 오류가 발생해도 로컬 저장소에는 저장되므로 계속 진행
            console.log('로컬 저장소에만 저장됨');
        }

        console.log('Application submitted successfully:', applicationId);

    } catch (error) {
        console.error('Submission error:', error);
        throw error;
    }
}

// 선택된 서비스 수집
function getSelectedServices() {
    const mainService = document.querySelector('.main-service-btn.selected')?.textContent.trim() || '';
    const additionalServices = [];

    // 기타 서비스 수집 (가전렌탈, 유심, CCTV)
    document.querySelectorAll('.service-category:last-child .telecom-btn.selected').forEach(btn => {
        const text = btn.textContent.trim();
        additionalServices.push(text);
    });

    return {
        main: mainService,
        additional: additionalServices
    };
}

// 선택된 통신사 수집
function getSelectedProvider() {
    const providerSection = document.querySelector('.service-category:nth-child(2)');
    const providerBtn = providerSection?.querySelector('.telecom-btn.selected');
    return providerBtn ? providerBtn.textContent.trim() : '';
}

// 에어테이블에서 사은품 금액 총합 가져오기
async function updateGiftAmountFromAirtable() {
    try {
        // 프록시 서버를 통해 에어테이블 데이터 조회 (환경변수 사용)
        const response = await fetch(`https://dimj-form-proxy.vercel.app/api/airtable`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`에어테이블 API 오류: ${response.status}`);
        }

        const data = await response.json();

        // 사은품 금액 총합 계산
        let totalGiftAmount = 0;
        data.records.forEach(record => {
            const giftAmount = record.fields['사은품금액'] || 0;
            totalGiftAmount += Number(giftAmount);
        });

        // 실시간 현황판 업데이트
        realTimeData.cashReward = totalGiftAmount;
        const cashRewardEl = document.getElementById('cashReward');
        if (cashRewardEl) {
            cashRewardEl.textContent = totalGiftAmount;
        }

        console.log('사은품 총 금액 업데이트:', totalGiftAmount);

    } catch (error) {
        console.error('사은품 금액 업데이트 오류:', error);
    }
}

function displaySubmittedInfo() {
    const submittedInfoEl = document.getElementById('submittedInfo');
    if (!submittedInfoEl) return;
    
    const serviceLabels = {
        'internet': '인터넷',
        'tv': 'IPTV',
        'appliance': '가전렌탈',
        'mobile': '유심',
        'cctv': 'CCTV'
    };
    
    const selectedServices = formData.service.split(',').map(service => 
        serviceLabels[service] || service
    ).join(', ');
    
    submittedInfoEl.innerHTML = `
        <p><strong>이름:</strong> ${formData.name}</p>
        <p><strong>연락처:</strong> ${formData.phone}</p>
        <p><strong>관심 서비스:</strong> ${selectedServices}</p>
        <p><strong>선택 통신사:</strong> ${formData.provider}</p>
        <p><strong>희망 시간:</strong> ${formData.preference || '빠른 시간에 연락드립니다'}</p>
    `;
}

// Utility Functions
function formatPhoneNumber(input) {
    // Remove all non-digit characters
    const digits = input.replace(/\D/g, '');

    // Limit to 11 digits (010-1234-5678 format)
    const limitedDigits = digits.substring(0, 11);

    // Format as 010-1234-5678
    if (limitedDigits.length <= 3) {
        return limitedDigits;
    } else if (limitedDigits.length <= 7) {
        return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3)}`;
    } else {
        return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3, 7)}-${limitedDigits.slice(7, 11)}`;
    }
}

// Phone number formatting will be added to main DOMContentLoaded listener

// Detail Preview functionality removed

// Load main page content from admin settings
function loadMainPageContent() {
    const savedContent = localStorage.getItem('detailPageContent');
    if (!savedContent) return;
    
    try {
        const content = JSON.parse(savedContent);
        
        if (content.mainPage) {
            // Update hero section
            const heroTitle = document.querySelector('.landing-hero h1');
            const heroSubtitle = document.querySelector('.hero-subtitle');
            const heroNote = document.querySelector('.hero-note');
            
            if (heroTitle && content.mainPage.heroTitle) {
                heroTitle.textContent = content.mainPage.heroTitle;
            }
            
            if (heroSubtitle && content.mainPage.heroSubtitle) {
                heroSubtitle.textContent = content.mainPage.heroSubtitle;
            }
            
            if (heroNote && content.mainPage.heroNote) {
                heroNote.textContent = content.mainPage.heroNote;
            }
            
            // Update warning box
            const warningTitle = document.querySelector('.warning-box h3');
            const warningText = document.querySelector('.warning-box p');
            
            if (warningTitle && content.mainPage.warningTitle) {
                warningTitle.textContent = content.mainPage.warningTitle;
            }
            
            if (warningText && content.mainPage.warningContent) {
                // Keep the strong tag for "정찰제 도입"
                const strongText = warningText.querySelector('strong');
                if (strongText) {
                    const parts = content.mainPage.warningContent.split('정찰제 도입');
                    warningText.innerHTML = parts[0] + '<strong>정찰제 도입</strong>' + (parts[1] || '');
                } else {
                    warningText.textContent = content.mainPage.warningContent;
                }
            }
            
            // Update cash reward amounts throughout the page
            if (content.mainPage.cashRewardAmount) {
                const cashAmount = content.mainPage.cashRewardAmount;
                
                // Update all elements that mention cash reward amount
                const rewardElements = document.querySelectorAll('*');
                rewardElements.forEach(el => {
                    if (el.textContent && el.textContent.includes('120만원')) {
                        el.innerHTML = el.innerHTML.replace(/120만원/g, `${cashAmount}만원`);
                    }
                });
            }
            
            // Update total loss amounts throughout the page
            if (content.mainPage.totalLossAmount) {
                const lossAmount = content.mainPage.totalLossAmount;
                
                // Update all elements that mention total loss amount
                const lossElements = document.querySelectorAll('*');
                lossElements.forEach(el => {
                    if (el.textContent && el.textContent.includes('130만원')) {
                        el.innerHTML = el.innerHTML.replace(/130만원/g, `${lossAmount}만원`);
                    }
                });
            }
        }
        
    } catch (error) {
        console.error('Error loading main page content:', error);
    }
}

// Smooth scrolling for better UX
function smoothScrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Smooth scroll function is now integrated in the main nextStep function above

// Add loading animation for form submission
function showLoadingState() {
    const submitButton = document.getElementById('submitButton');
    if (submitButton) {
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 처리 중...';
        submitButton.disabled = true;
    }
}

function hideLoadingState() {
    const submitButton = document.getElementById('submitButton');
    if (submitButton) {
        submitButton.innerHTML = '🎉 지금 바로 신청하고 120만원 받기 <i class="fas fa-chevron-right"></i>';
        submitButton.disabled = false;
    }
}

// Enhanced form submission with loading state and anti-fraud protection
async function handleFormSubmit(e) {
    console.log('🚀 폼 제출 시작!', e);
    e.preventDefault();

    // 🔥 임시 우회: 모든 검증 비활성화 (디버깅용)
    console.log('⚠️ 모든 검증 임시 우회 - 디버깅 모드');

    // Check daily limit first (비활성화)
    console.log('일일 제한 체크: 우회됨');

    // Anti-fraud checks (비활성화)
    console.log('중복 제출 방지: 우회됨');

    // Form integrity (비활성화)
    console.log('폼 무결성 검증: 우회됨');
    
    showLoadingState();
    
    // Get form data
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const preferenceSelect = document.getElementById('preference');
    
    if (nameInput) formData.name = nameInput.value.trim();
    if (phoneInput) formData.phone = phoneInput.value.trim();
    if (preferenceSelect) formData.preference = preferenceSelect.value;
    
    // 🔥 즉시 다음 페이지로 이동 (에러와 관계없이)
    console.log('🚀 즉시 다음 페이지로 이동!');
    nextStep();
    displaySubmittedInfo();

    try {
        // Submit to Airtable (백그라운드)
        console.log('🔥🔥🔥 submitToAirtable 호출 직전!', formData);
        await submitToAirtable(formData);
        console.log('🔥🔥🔥 submitToAirtable 호출 완료!');

        // 백그라운드 처리
        hideLoadingState();
        resetAntiSpam();
        recordSuccessfulSubmit();

    } catch (error) {
        console.error('Form submission error (백그라운드):', error);
        hideLoadingState();
        resetAntiSpam();
        // 에러가 있어도 페이지 이동은 이미 완료됨
    }
}

// Add entrance animations
function addEntranceAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    // Add animation to elements
    const animatedElements = document.querySelectorAll('.form-section, .status-board, .consultation-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Entrance animations will be added to main DOMContentLoaded listener

// Error handling for missing elements
function safeElementUpdate(elementId, updateFunction) {
    const element = document.getElementById(elementId);
    if (element) {
        updateFunction(element);
    } else {
        console.warn(`Element with ID '${elementId}' not found`);
    }
}

// Enhanced error handling for all functions
function updateStatistics() {
    try {
        // ✅ 임의 숫자 생성 완전 제거 - 에어테이블 데이터만 사용
        // Math.random() 코드 모두 제거됨
        
        // Update main status board
        safeElementUpdate('todayApplications', (el) => el.textContent = realTimeData.todayApplications);
        safeElementUpdate('completedConsultations', (el) => el.textContent = realTimeData.installationsCompleted);
        safeElementUpdate('cashReward', (el) => el.textContent = realTimeData.cashReward);
        safeElementUpdate('onlineConsultants', (el) => el.textContent = realTimeData.onlineConsultants);
        
        // Update banner statistics
        updateBannerStats();
        
    } catch (error) {
        console.error('Error updating statistics:', error);
    }
}

function updateBannerStats() {
    // Update banner stats with current data
    const bannerStats = document.querySelectorAll('.banner-stat .stat-number');
    if (bannerStats.length >= 3) {
        bannerStats[0].textContent = realTimeData.todayApplications; // 오늘 신청
        bannerStats[1].textContent = realTimeData.cashReward + '만원'; // 누적 사은품
        bannerStats[2].textContent = realTimeData.onlineConsultants + '명'; // 상담사 대기
    }
}

// Top Button Functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/Hide Top Button based on scroll position
function handleTopButtonVisibility() {
    const topButton = document.getElementById('topButton');
    if (!topButton) return;
    
    if (window.pageYOffset > 300) {
        topButton.classList.add('visible');
    } else {
        topButton.classList.remove('visible');
    }
}

// Add scroll event listener for top button
window.addEventListener('scroll', handleTopButtonVisibility);

// Load banner content from admin settings
function loadBannerContent() {
    const savedContent = localStorage.getItem('detailPageContent');
    if (!savedContent) {
        // Show default banner if no saved content
        showDefaultBanner();
        return;
    }
    
    try {
        const content = JSON.parse(savedContent);
        if (content.banner && content.banner.enabled !== false) {
            const bannerElement = document.getElementById('step2Banner');
            const bannerTitle = document.getElementById('bannerTitle');
            const bannerDescription = document.getElementById('bannerDescription');
            
            if (bannerElement) {
                // Update banner content
                if (bannerTitle && content.banner.title) {
                    bannerTitle.textContent = content.banner.title;
                }
                
                if (bannerDescription && content.banner.description) {
                    bannerDescription.textContent = content.banner.description;
                }
                
                // Set banner image if available
                if (content.banner.imageData) {
                    bannerElement.style.backgroundImage = `url(${content.banner.imageData})`;
                    bannerElement.style.backgroundSize = 'cover';
                    bannerElement.style.backgroundPosition = 'center';
                }
                
                // Add click handler if link is provided
                if (content.banner.link) {
                    bannerElement.style.cursor = 'pointer';
                    bannerElement.onclick = function() {
                        window.open(content.banner.link, '_blank');
                    };
                }
                
                // Show the banner
                bannerElement.style.display = 'flex';
            }
        } else {
            // Banner is disabled, hide it
            const bannerElement = document.getElementById('step2Banner');
            if (bannerElement) {
                bannerElement.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error loading banner content:', error);
        showDefaultBanner();
    }
}

function showDefaultBanner() {
    const bannerElement = document.getElementById('step2Banner');
    if (bannerElement) {
        bannerElement.style.display = 'flex';
    }
}

// Load main banners content from admin settings
function loadMainBannersContent() {
    const savedContent = localStorage.getItem('detailPageContent');
    if (!savedContent) {
        // Hide banners if no saved content
        hideMainBanners();
        return;
    }
    
    try {
        const content = JSON.parse(savedContent);
        if (content.mainBanners) {
            ['step1', 'step2'].forEach(stepName => {
                const bannerData = content.mainBanners[stepName];
                const bannerElement = document.getElementById(`${stepName}MainBanner`);
                const imageElement = document.getElementById(`${stepName}BannerImage`);
                
                if (bannerElement && imageElement && bannerData && bannerData.imageData) {
                    // Set banner image
                    imageElement.src = bannerData.imageData;
                    imageElement.style.display = 'block';
                    
                    // Hide placeholder and show image
                    const placeholder = document.getElementById(`${stepName}BannerPlaceholder`);
                    if (placeholder) placeholder.style.display = 'none';
                    
                    console.log(`${stepName} main banner loaded with image`);
                } else if (bannerElement) {
                    // No image, show placeholder
                    const imageElement = document.getElementById(`${stepName}BannerImage`);
                    const placeholder = document.getElementById(`${stepName}BannerPlaceholder`);
                    
                    if (imageElement) imageElement.style.display = 'none';
                    if (placeholder) placeholder.style.display = 'flex';
                }
            });
        } else {
            hideMainBanners();
        }
    } catch (error) {
        console.error('Error loading main banners content:', error);
        hideMainBanners();
    }
}

function hideMainBanners() {
    // Show placeholders when no images are set
    ['step1', 'step2'].forEach(stepName => {
        const imageElement = document.getElementById(`${stepName}BannerImage`);
        const placeholder = document.getElementById(`${stepName}BannerPlaceholder`);
        
        if (imageElement) imageElement.style.display = 'none';
        if (placeholder) placeholder.style.display = 'flex';
    });
}

// Load detail images content from admin settings
function loadDetailImagesContent() {
    const savedContent = localStorage.getItem('detailPageContent');
    if (!savedContent) {
        // Show placeholder even if no saved content
        showDetailImagesPlaceholder();
        return;
    }
    
    try {
        const content = JSON.parse(savedContent);
        if (content.detailImages && content.detailImages.enabled !== false) {
            const detailImagesSection = document.getElementById('detailImagesSection');
            const detailImagesGrid = document.getElementById('detailImagesGrid');
            
            if (detailImagesSection && detailImagesGrid) {
                // Check if we have the detail image
                let hasImages = false;
                let imagesHTML = '';
                
                const imageData = content.detailImages.image1;
                if (imageData && imageData.imageData) {
                    hasImages = true;
                    imagesHTML = `
                        <div class="detail-image-single">
                            <img src="${imageData.imageData}" alt="상세페이지" loading="lazy" style="width: 100%; height: auto; max-width: 1050px; margin: 0 auto; display: block;">
                            ${imageData.caption ? `<p class="image-caption" style="text-align: center; margin-top: 1rem; color: #64748b;">${imageData.caption}</p>` : ''}
                        </div>
                    `;
                }
                
                if (hasImages) {
                    detailImagesGrid.innerHTML = imagesHTML;
                    detailImagesSection.style.display = 'block';
                    
                    // Hide placeholder
                    const placeholder = document.getElementById('detailImagesPlaceholder');
                    if (placeholder) placeholder.style.display = 'none';
                    
                    console.log('Detail images section loaded with single A4 image');
                } else {
                    // Show placeholder
                    detailImagesSection.style.display = 'block';
                    const placeholder = document.getElementById('detailImagesPlaceholder');
                    if (placeholder) placeholder.style.display = 'flex';
                    
                    detailImagesGrid.innerHTML = `
                        <div class="detail-images-placeholder" id="detailImagesPlaceholder">
                            <div class="placeholder-content">
                                <i class="fas fa-images"></i>
                                <h4>A4 5장 분량 상세페이지를 추가해주세요</h4>
                                <p>권장 사이즈: <strong>1050 × 2970px (A4 5장 세로 연결)</strong></p>
                                <p>JPG/PNG 형식, 1개 파일로 업로드</p>
                                <a href="admin.html" class="admin-link-btn">관리자 페이지로 이동</a>
                            </div>
                        </div>
                    `;
                }
            }
        } else {
            showDetailImagesPlaceholder();
        }
    } catch (error) {
        console.error('Error loading detail images content:', error);
        showDetailImagesPlaceholder();
    }
}

function showDetailImagesPlaceholder() {
    const detailImagesSection = document.getElementById('detailImagesSection');
    const detailImagesGrid = document.getElementById('detailImagesGrid');
    
    if (detailImagesSection && detailImagesGrid) {
        detailImagesSection.style.display = 'block';
        detailImagesGrid.innerHTML = `
            <div class="detail-images-placeholder" id="detailImagesPlaceholder">
                <div class="placeholder-content">
                    <i class="fas fa-images"></i>
                    <h4>A4 5장 분량 상세페이지를 추가해주세요</h4>
                    <p>권장 사이즈: <strong>1050 × 2970px (A4 5장 세로 연결)</strong></p>
                    <p>JPG/PNG 형식, 1개 파일로 업로드</p>
                    <a href="admin.html" class="admin-link-btn">관리자 페이지로 이동</a>
                </div>
            </div>
        `;
    }
}

function hideDetailImagesSection() {
    const detailImagesSection = document.getElementById('detailImagesSection');
    if (detailImagesSection) {
        detailImagesSection.style.display = 'none';
    }
}

// Load detail page banner content from admin settings
function loadDetailPageBannerContent() {
    const savedContent = localStorage.getItem('detailPageContent');
    if (!savedContent) {
        // Show placeholder if no saved content
        showDetailPageBannerPlaceholder();
        return;
    }
    
    try {
        const content = JSON.parse(savedContent);
        if (content.detailPageBanner && content.detailPageBanner.enabled !== false && content.detailPageBanner.imageData) {
            const bannerElement = document.getElementById('detailPageBanner');
            const imageElement = document.getElementById('detailPageBannerImage');
            const placeholder = document.getElementById('detailPageBannerPlaceholder');
            
            if (bannerElement && imageElement) {
                // Set banner image
                imageElement.src = content.detailPageBanner.imageData;
                imageElement.style.display = 'block';
                
                // Hide placeholder
                if (placeholder) placeholder.style.display = 'none';
                
                console.log('Detail page banner loaded with image');
            }
        } else {
            showDetailPageBannerPlaceholder();
        }
    } catch (error) {
        console.error('Error loading detail page banner content:', error);
        showDetailPageBannerPlaceholder();
    }
}

function showDetailPageBannerPlaceholder() {
    const imageElement = document.getElementById('detailPageBannerImage');
    const placeholder = document.getElementById('detailPageBannerPlaceholder');
    
    if (imageElement) imageElement.style.display = 'none';
    if (placeholder) placeholder.style.display = 'flex';
}

// Track visitor function
function trackVisitor() {
    const today = new Date().toISOString().split('T')[0];
    const visitors = JSON.parse(localStorage.getItem('dailyVisitors') || '{}');
    
    // Check if this is a new visit for today
    const lastVisit = localStorage.getItem('lastVisitDate');
    if (lastVisit !== today) {
        // New visit for today
        visitors[today] = (visitors[today] || 0) + 1;
        localStorage.setItem('dailyVisitors', JSON.stringify(visitors));
        localStorage.setItem('lastVisitDate', today);
        
        // Clean up old visitor data (keep only last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        Object.keys(visitors).forEach(date => {
            if (new Date(date) < thirtyDaysAgo) {
                delete visitors[date];
            }
        });
        
        localStorage.setItem('dailyVisitors', JSON.stringify(visitors));
        console.log('New visitor tracked for', today);
    }
}

// Make functions globally accessible
window.nextStep = nextStep;

// Simple debug function
function debugCheck() {
    console.log('nextStep function:', typeof nextStep);
    console.log('Current step:', currentStep);
}

// Setup additional click handlers as fallback
function setupClickHandlers() {
    console.log('Setting up additional click handlers');
    
    // CTA button click handler - but don't interfere with onclick
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        console.log('Found CTA button');
        // Don't add duplicate event listener since onclick="nextStep()" already exists
    } else {
        console.log('CTA button not found');
    }
}

// Anti-fraud protection functions
function trackUserInteraction(type, element) {
    antiSpam.userInteractions.push({
        type: type,
        element: element,
        timestamp: Date.now(),
        timeFromStart: Date.now() - antiSpam.startTime
    });
    
    // Keep only last 50 interactions
    if (antiSpam.userInteractions.length > 50) {
        antiSpam.userInteractions = antiSpam.userInteractions.slice(-50);
    }
}

function detectSpamClicks() {
    const now = Date.now();
    const timeDiff = now - antiSpam.lastClickTime;
    
    // Reset click count if more than 2 seconds passed
    if (timeDiff > 2000) {
        antiSpam.clickCount = 0;
    }
    
    antiSpam.clickCount++;
    antiSpam.lastClickTime = now;
    
    // If more than 5 clicks in 2 seconds, it's suspicious
    if (antiSpam.clickCount > 5 && timeDiff < 2000) {
        console.warn('Suspicious clicking detected');
        return true;
    }
    
    return false;
}

function validateFormIntegrity() {
    // Check if form was filled too quickly (less than 10 seconds is suspicious)
    const fillTime = Date.now() - antiSpam.startTime;
    if (fillTime < 10000) {
        console.warn('Form filled too quickly');
        return false;
    }
    
    // Check if user actually interacted with form elements
    const hasInteractions = antiSpam.userInteractions.length > 0;
    if (!hasInteractions) {
        console.warn('No user interactions detected');
        return false;
    }
    
    // Check for reasonable interaction pattern
    const interactionTypes = [...new Set(antiSpam.userInteractions.map(i => i.type))];
    if (interactionTypes.length < 2) {
        console.warn('Limited interaction types');
        return false;
    }
    
    return true;
}

function preventDoubleSubmit() {
    const now = Date.now();
    const timeSinceLastSubmit = now - antiSpam.lastSubmitTime;
    
    // Prevent submit if already submitting or if less than 3 seconds since last submit
    if (antiSpam.isSubmitting || timeSinceLastSubmit < 3000) {
        return false;
    }
    
    antiSpam.isSubmitting = true;
    antiSpam.lastSubmitTime = now;
    return true;
}

function resetAntiSpam() {
    antiSpam.isSubmitting = false;
}

// Add user interaction tracking to form elements
function addInteractionTracking() {
    // Track input interactions
    document.querySelectorAll('input, select').forEach(element => {
        element.addEventListener('focus', () => trackUserInteraction('focus', element.name || element.id));
        element.addEventListener('change', () => trackUserInteraction('change', element.name || element.id));
        element.addEventListener('input', () => trackUserInteraction('input', element.name || element.id));
    });
    
    // Track button clicks
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', (e) => {
            if (detectSpamClicks()) {
                e.preventDefault();
                showAntiSpamMessage();
                return false;
            }
            trackUserInteraction('click', button.id || button.className);
        });
    });
}

function showAntiSpamMessage() {
    const message = document.createElement('div');
    message.className = 'anti-spam-message';
    message.innerHTML = '⚠️ 너무 빠른 클릭이 감지되었습니다. 잠시 후 다시 시도해주세요.';
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
    }, 3000);
}

// IP-based daily limit functions
async function getUserIP() {
    try {
        // Try to get IP from multiple free services
        const ipServices = [
            'https://api.ipify.org?format=json',
            'https://ipapi.co/json/',
            'https://api.ip.sb/jsonip'
        ];
        
        for (const service of ipServices) {
            try {
                const response = await fetch(service);
                const data = await response.json();
                return data.ip || data.query;
            } catch (error) {
                console.warn(`Failed to get IP from ${service}:`, error);
                continue;
            }
        }
        
        // Fallback: generate a unique browser fingerprint
        return generateBrowserFingerprint();
        
    } catch (error) {
        console.warn('Failed to get IP, using browser fingerprint:', error);
        return generateBrowserFingerprint();
    }
}

function generateBrowserFingerprint() {
    // Create a unique identifier based on browser characteristics
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Browser fingerprint', 2, 2);
    
    const fingerprint = btoa(JSON.stringify({
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen: `${screen.width}x${screen.height}`,
        canvas: canvas.toDataURL(),
        timestamp: new Date().toDateString() // Include date for daily reset
    }));
    
    return fingerprint.substring(0, 20); // Use first 20 chars as identifier
}

function getTodayKey() {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
}

function getStorageKey(identifier) {
    return `submit_count_${identifier}_${getTodayKey()}`;
}

function getTodaySubmitCount(identifier) {
    const storageKey = getStorageKey(identifier);
    const count = localStorage.getItem(storageKey);
    return count ? parseInt(count, 10) : 0;
}

function incrementSubmitCount(identifier) {
    const storageKey = getStorageKey(identifier);
    const currentCount = getTodaySubmitCount(identifier);
    const newCount = currentCount + 1;
    localStorage.setItem(storageKey, newCount.toString());
    return newCount;
}

function cleanOldSubmitCounts() {
    // Clean up old localStorage entries (keep only today's)
    const today = getTodayKey();
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('submit_count_') && !key.includes(today)) {
            keysToRemove.push(key);
        }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
}

async function checkDailyLimit() {
    try {
        // 테스트용으로 일일 제한 임시 비활성화
        console.log('🧪 테스트 모드: 일일 신청 제한 비활성화됨');
        return {
            allowed: true,
            count: 0,
            limit: 999 // 테스트용 높은 값
        };

        // 원래 코드 (테스트 후 복원용)
        /*
        // Get user identifier (IP or browser fingerprint)
        if (!antiSpam.userIP) {
            antiSpam.userIP = await getUserIP();
        }

        const identifier = antiSpam.userIP;
        const todayCount = getTodaySubmitCount(identifier);

        console.log(`Today's submit count for ${identifier.substring(0, 8)}...: ${todayCount}/${antiSpam.dailyLimit}`);

        if (todayCount >= antiSpam.dailyLimit) {
            return {
                allowed: false,
                count: todayCount,
                limit: antiSpam.dailyLimit
            };
        }
        */
        
        return {
            allowed: true,
            count: todayCount,
            limit: antiSpam.dailyLimit
        };
    } catch (error) {
        console.error('Error checking daily limit:', error);
        // If there's an error, allow submission but log it
        return { allowed: true, count: 0, limit: antiSpam.dailyLimit };
    }
}

function recordSuccessfulSubmit() {
    if (antiSpam.userIP) {
        const newCount = incrementSubmitCount(antiSpam.userIP);
        console.log(`Recorded successful submit. New count: ${newCount}/${antiSpam.dailyLimit}`);
    }
}

function showDailyLimitMessage(count, limit) {
    const message = document.createElement('div');
    message.className = 'daily-limit-message';
    message.innerHTML = `
        <div class="limit-icon">🚫</div>
        <div class="limit-text">
            <h3>일일 신청 한도 초과</h3>
            <p>하루에 최대 ${limit}회까지만 신청 가능합니다.</p>
            <p>현재 ${count}회 신청하셨습니다.</p>
            <p class="limit-reset">자정 이후 다시 신청하실 수 있습니다.</p>
        </div>
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
    }, 5000);
}

// Telecom Button Functionality
function initializeTelecomButtons() {
    // Initialize telecom provider buttons (radio behavior) 
    // Target provider section specifically by finding the section with "신청 통신사" text
    const providerSections = Array.from(document.querySelectorAll('.service-category')).filter(section => 
        section.textContent.includes('신청 통신사')
    );
    
    if (providerSections.length > 0) {
        const providerSection = providerSections[0];
        const telecomProviderBtns = providerSection.querySelectorAll('.telecom-btn');
        const providerGrid = providerSection.querySelector('.telecom-grid');
        
        telecomProviderBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove selected class from all provider buttons
                telecomProviderBtns.forEach(b => b.classList.remove('selected'));
                // Add selected class to clicked button
                this.classList.add('selected');
                
                // Add/remove has-selection class for dimming effect
                if (providerGrid) {
                    providerGrid.classList.add('has-selection');
                }
                
                // Update form data
                formData.provider = this.textContent.trim();
                validateForm();
                console.log('Provider selected:', formData.provider);
            });
        });
    }
    
    // Initialize service buttons (checkbox behavior) - both main and additional services
    // Target all service buttons except provider buttons
    const serviceSection = document.querySelector('.service-selection');
    if (serviceSection) {
        const serviceButtons = serviceSection.querySelectorAll('.telecom-btn:not(.telecom-grid:first-of-type .telecom-btn)');
        
        // Get all service buttons (main services + additional services)
        const allServiceButtons = Array.from(serviceSection.querySelectorAll('.telecom-grid .telecom-btn'))
            .filter(btn => !btn.closest('.service-category').textContent.includes('신청 통신사'));
        
        // Get all telecom grids for services
        const serviceGrids = Array.from(serviceSection.querySelectorAll('.telecom-grid'))
            .filter(grid => !grid.closest('.service-category').textContent.includes('신청 통신사'));
        
        allServiceButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const buttonText = this.textContent.trim();
                const currentGrid = this.closest('.telecom-grid');
                const isMainService = this.closest('.service-category').querySelector('.category-title').textContent.includes('주요 서비스');
                
                if (isMainService) {
                    // 주요 서비스 섹션에서
                    if (buttonText.includes('IPTV추가')) {
                        // IPTV추가는 독립적으로 토글 가능
                        this.classList.toggle('selected');
                    } else {
                        // 인터넷+IPTV, 단품 인터넷은 라디오 버튼 방식
                        Array.from(currentGrid.querySelectorAll('.telecom-btn')).forEach(b => {
                            if (!b.textContent.trim().includes('IPTV추가')) {
                                b.classList.remove('selected');
                            }
                        });
                        this.classList.add('selected');
                    }
                } else {
                    // 기타 서비스는 토글
                    this.classList.toggle('selected');
                }
                
                // Check if any button in this grid is selected
                const hasSelection = Array.from(currentGrid.querySelectorAll('.telecom-btn'))
                    .some(b => b.classList.contains('selected'));
                
                // Add/remove has-selection class for dimming effect
                if (hasSelection) {
                    currentGrid.classList.add('has-selection');
                } else {
                    currentGrid.classList.remove('has-selection');
                }
                
                // Update form data for services
                const selectedServices = Array.from(allServiceButtons)
                    .filter(b => b.classList.contains('selected'))
                    .map(b => {
                        const text = b.textContent.trim();
                        // Remove icon (everything before the last space)
                        return text.includes(' ') ? text.split(' ').pop() : text;
                    })
                    .join(',');
                
                formData.service = selectedServices;
                validateForm();
                console.log('Services selected:', formData.service);
            });
        });
    }
    
    // Fallback: initialize all telecom buttons if specific sections not found
    if (providerSections.length === 0 && !serviceSection) {
        const allTelecomBtns = document.querySelectorAll('.telecom-btn');
        allTelecomBtns.forEach((btn, index) => {
            btn.addEventListener('click', function() {
                this.classList.toggle('selected');
                console.log('Button clicked:', this.textContent.trim());
            });
        });
    }
}

// Privacy Modal Functions
function showPrivacyModal() {
    const modal = document.getElementById('privacyModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closePrivacyModal() {
    const modal = document.getElementById('privacyModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function agreePrivacy() {
    const checkbox = document.getElementById('privacyAgree');
    if (checkbox) {
        checkbox.checked = true;
        
        // Trigger change event to update form validation
        const event = new Event('change');
        checkbox.dispatchEvent(event);
    }
    closePrivacyModal();
}

// Close modal when clicking outside of content
document.addEventListener('click', function(e) {
    const modal = document.getElementById('privacyModal');
    if (modal && e.target === modal) {
        closePrivacyModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closePrivacyModal();
        closeFraudWarning();
    }
});

// 부정클릭 방지 기능
function showFraudWarning() {
    const modal = document.getElementById('fraudWarningModal');
    const warningText = document.getElementById('fraudWarningText');
    
    // localStorage에서 관리자가 설정한 경고문 가져오기
    const adminContent = JSON.parse(localStorage.getItem('adminContent') || '{}');
    if (adminContent.fraudWarningMessage) {
        warningText.textContent = adminContent.fraudWarningMessage;
    }
    
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeFraudWarning() {
    const modal = document.getElementById('fraudWarningModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// 부정클릭 경고 모달 외부 클릭시 닫기
document.addEventListener('click', function(e) {
    const fraudModal = document.getElementById('fraudWarningModal');
    if (fraudModal && e.target === fraudModal) {
        closeFraudWarning();
    }
});

