# 당일민족 - 인터넷·TV·가전렌탈 신청 웹사이트

한국의 통신 서비스 신청을 위한 반응형 웹 애플리케이션입니다.

## ✨ 주요 기능

### 🎯 사용자 기능
- **3단계 신청 프로세스**: 직관적이고 간단한 단계별 신청 시스템
- **실시간 유효성 검사**: 입력 데이터의 즉시 검증 및 피드백
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 최적화
- **서비스별 맞춤 옵션**: 인터넷, TV, 가전렌탈 등 다양한 서비스 제공
- **통신사별 혜택**: KT, SK텔레콤, LG U+ 각 통신사별 특별 혜택 안내
- **사은품 선택**: 다양한 사은품 옵션 및 실시간 금액 계산

### 🛠 관리자 기능
- **관리자 대시보드**: 신청 현황 통계 및 모니터링
- **실시간 데이터 조회**: 에어테이블 연동을 통한 실시간 데이터 관리
- **통계 대시보드**: 일별/월별 신청 통계 및 사은품 금액 합계
- **데이터 필터링**: 기간별, 서비스별, 통신사별 세부 필터링
- **접수 관리**: 신청 상태 관리 및 처리 현황 추적

## 🏗 기술 스택

### Frontend
- **HTML5/CSS3**: 시맨틱 마크업 및 모던 스타일링
- **Vanilla JavaScript**: 순수 자바스크립트 기반 인터랙션
- **Responsive Design**: CSS Grid, Flexbox 활용
- **Progressive Enhancement**: 점진적 기능 향상

### Backend & Database
- **Airtable API**: 클라우드 데이터베이스 및 API 서비스
- **Vercel Functions**: 서버리스 백엔드 (프록시 서버)
- **RESTful API**: 표준 REST API 구조

### DevOps & Deployment
- **Vercel**: 프론트엔드 배포 및 호스팅
- **GitHub Pages**: 정적 사이트 배포 (백업)
- **Git**: 버전 관리
- **환경변수 관리**: 보안 설정 및 API 키 관리

## 📱 화면 구성

### 메인 신청 페이지 (`index.html`)
1. **랜딩 섹션**: 서비스 소개 및 주요 혜택
2. **신청 폼**: 3단계 프로세스
   - 1단계: 개인정보 입력
   - 2단계: 서비스 선택
   - 3단계: 사은품 선택 및 확인
3. **혜택 안내**: 통신사별 특별 혜택
4. **푸터**: 회사 정보 및 연락처

### 관리자 페이지 (`admin.html`)
1. **로그인 섹션**: 관리자 인증
2. **통계 대시보드**: 실시간 신청 현황
3. **데이터 테이블**: 신청 내역 목록
4. **필터 기능**: 조건별 데이터 조회

## 🔧 설치 및 실행

### 로컬 개발 환경
```bash
# 저장소 클론
git clone [repository-url]

# 프로젝트 디렉토리 이동
cd dimj-form

# Live Server 실행 (VS Code Extension 권장)
# 또는 로컬 서버 실행
npx serve .
```

### 프록시 서버 배포 (Vercel)
```bash
# 프록시 서버 디렉토리 이동
cd dimj-form-proxy

# Vercel CLI 설치 (전역)
npm install -g vercel

# Vercel 배포
vercel --prod
```

### 환경변수 설정
Vercel 대시보드에서 다음 환경변수 설정:
- `AIRTABLE_API_KEY`: 에어테이블 Personal Access Token
- `AIRTABLE_BASE_ID`: 에어테이블 베이스 ID
- `AIRTABLE_TABLE_NAME`: 테이블 이름

## 📊 데이터 구조

### 에어테이블 필드 구조
- **이름**: 신청자 이름
- **연락처**: 전화번호
- **주요서비스**: 선택한 주요 서비스
- **통신사**: 선택한 통신사
- **기타서비스**: 추가 선택 서비스
- **상담희망시간**: 연락 가능 시간
- **접수일시**: 신청 접수 일시
- **IP주소**: 신청자 IP (보안/분석용)
- **상태**: 처리 상태
- **사은품금액**: 선택한 사은품 총 금액
- **ID**: 고유 식별자
- **개인정보동의**: 개인정보 처리 동의 여부

## 🔒 보안 및 개인정보 보호

- **CORS 정책**: 허용된 도메인에서만 API 접근 가능
- **데이터 암호화**: HTTPS 통신으로 데이터 전송 보안
- **개인정보 동의**: 명시적 개인정보 처리 동의 절차
- **IP 로깅**: 보안 모니터링을 위한 접속 IP 기록

## 🚀 배포 URL

- **메인 사이트**: [https://dimj-form.vercel.app](https://dimj-form.vercel.app)
- **GitHub Pages**: [https://d1mj9182.github.io](https://d1mj9182.github.io)
- **프록시 API**: [https://dimj-form-proxy.vercel.app](https://dimj-form-proxy.vercel.app)

---

## 🔧 프록시 서버 정보

DIMJ-form 전용 에어테이블 프록시 서버입니다.

### 환경변수 설정 (Vercel에서)

Vercel 배포 시 다음 환경변수를 설정해야 합니다:

- `AIRTABLE_API_KEY`: 에어테이블 Personal Access Token
- `AIRTABLE_BASE_ID`: 에어테이블 베이스 ID (app으로 시작)
- `AIRTABLE_TABLE_NAME`: 테이블 이름 (예: "신청접수")

### API 엔드포인트

- `POST /api/airtable`: 신청 데이터 저장
- `GET /api/airtable`: 데이터 조회 (사은품 금액 합계용)

### 허용된 도메인

- https://dimj-form.vercel.app
- https://dimj9182.github.io
- https://d1mj9182.github.io
- http://localhost:3000 (개발용)
- http://127.0.0.1:5500 (개발용)

## 📞 연락처 및 지원

- **회사**: 당일민족
- **대표자**: 이진호
- **연락처**: 1661-9182
- **이메일**: skfdms10044@gmail.com

---

© 2025 당일민족. All rights reserved.# 실시간 현황판 업데이트: 2025년 09월 16일 화 오전  5:19:29
