// 에어테이블 설정 파일
// 실제 사용 시 아래 값들을 변경하세요

const AIRTABLE_CONFIG = {
    // 에어테이블 베이스 ID (예: appXXXXXXXXXXXXXX)
    baseId: 'appC57cOVf66tahSp',

    // 테이블 이름 (예: 'Table 1' 또는 '신청접수')
    tableName: '당일민족',

    // Personal Access Token 또는 API Key
    // 새로운 방식: Personal Access Token 권장
    apiKey: 'PROXY_SERVER_USED',

    // 컬럼 매핑 (에어테이블의 실제 필드명과 일치해야 함)
    fields: {
        name: '이름',
        phone: '연락처',
        mainService: '주요서비스',
        provider: '통신사',
        additionalServices: '기타서비스',
        preferredTime: '상담희망시간',
        submissionTime: '접수일시',
        ipAddress: 'IP주소',
        status: '상태',
        giftAmount: '사은품금액',
        id: 'ID'
    }
};

// 에어테이블 설정 가이드
const SETUP_GUIDE = {
    steps: [
        '1. 에어테이블(airtable.com)에 로그인',
        '2. 새 베이스 생성 또는 기존 베이스 선택',
        '3. 테이블에 다음 필드들 생성:',
        '   - 이름 (Single line text)',
        '   - 연락처 (Phone number)',
        '   - 주요서비스 (Single line text)',
        '   - 통신사 (Single select)',
        '   - 기타서비스 (Multiple select)',
        '   - 상담희망시간 (Single line text)',
        '   - 접수일시 (Date & time)',
        '   - IP주소 (Single line text)',
        '   - 상태 (Single select: 상담 대기, 상담 중, 상담 완료, 설치 예약, 설치 완료)',
        '   - 사은품금액 (Number)',
        '   - ID (Single line text)',
        '4. Developer Hub(airtable.com/developers)에서 Personal Access Token 생성',
        '5. 베이스 ID 복사 (URL에서 app으로 시작하는 부분)',
        '6. 이 파일의 설정값들을 실제 값으로 변경'
    ]
};

// 설정 검증 함수
function validateConfig() {
    const errors = [];

    if (!AIRTABLE_CONFIG.baseId || AIRTABLE_CONFIG.baseId === 'YOUR_BASE_ID') {
        errors.push('베이스 ID가 설정되지 않았습니다.');
    }

    if (!AIRTABLE_CONFIG.tableName || AIRTABLE_CONFIG.tableName === 'YOUR_TABLE_NAME') {
        errors.push('테이블 이름이 설정되지 않았습니다.');
    }

    if (!AIRTABLE_CONFIG.apiKey || AIRTABLE_CONFIG.apiKey === 'YOUR_PERSONAL_ACCESS_TOKEN') {
        errors.push('API 키가 설정되지 않았습니다.');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// 전역으로 내보내기
window.AIRTABLE_CONFIG = AIRTABLE_CONFIG;
window.AIRTABLE_SETUP_GUIDE = SETUP_GUIDE;
window.validateAirtableConfig = validateConfig;