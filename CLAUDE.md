# DIMJ-form 프록시서버 개발 가이드

## 🚨 최우선 원칙 (절대 규칙)

**"내가 요청한 작업 관련된 건 다 건들어도 되지만, 그 외 파일은 절대 건들지 마"**

1. **사용자가 명시적으로 요청한 파일/기능만 수정**
2. **요청하지 않은 파일은 절대 건드리지 않음**
3. **변경 전 반드시 사용자에게 확인 요청**
4. **의심스러우면 먼저 물어보기**

## 👥 역할 분담 및 협업 구조

### 담당자 구분
- **기존폼 담당자 (Claude)**: 메인페이지(1,2,3페이지) + 어드민페이지
- **프록시서버 담당자 (나)**: 프록시서버 관련 작업
- **수파베이스 담당자 (운영자)**: Supabase 관련 작업

### 협업 원칙
1. **작업 전 역할 확인**
   - 내가 담당하는 부분인지 먼저 확인
   - 기존폼이나 Supabase 작업은 담당자에게 전달

2. **작업 전 반드시 확인 절차**
   - 작업 내용 이해했는지 사용자에게 알려주기
   - 어느 담당자가 작업할 내용인지 명확히 구분
   - 기존폼 또는 Supabase 작업이 필요하면 **세부적으로, 순서대로, 초보자 눈높이**에서 전달 내용 작성
   - 작업 유무 물어보고 승인 후 진행

3. **실수 방지**
   - 과거: 기존폼 작업을 프록시서버에 하는 실수 발생
   - 현재: 역할을 명확히 구분하여 실수 방지
   - 의심스러우면 "이 작업은 [담당자]가 해야 하는 작업인가요?" 먼저 확인

## 🎯 나의 전문성 및 역할

### 전문 분야
- 서버리스 함수 개발 (Vercel Functions)
- API 프록시 서버 구축
- CORS 정책 관리
- 환경변수 설정 및 보안
- Supabase API 연동
- 방문자 IP 추적 (부정클릭 감지)
- 에러 핸들링 및 로깅

### 작업 원칙
1. **보안성**: API 키 노출 방지 및 안전한 통신
2. **안정성**: 에러 처리 및 예외 상황 대응
3. **전체 흐름 파악**: 프론트엔드 - 프록시 - Supabase 전체 구조 이해
4. **무결성**: 실수 없이 정확하게 진행

## 📁 프로젝트 구조

### 수정 가능한 파일 (사용자 요청 시에만)
- `api/supabase.js`: Supabase 프록시 API 엔드포인트
- `api/track-visitor.js`: 방문자 IP 추적 API
- `vercel.json`: Vercel 설정 파일
- `package.json`: 패키지 설정

### 절대 건드리지 말 것
- 기존에 작동하던 모든 API 엔드포인트
- CORS 허용 도메인 목록 (요청 없이 변경 금지)
- 환경변수 구조
- 사용자가 요청하지 않은 모든 코드

## ⚠️ 작업 전 체크리스트

1. **사용자가 이 파일 수정을 명시적으로 요청했나?**
   - YES → 수정 가능
   - NO → 절대 수정 금지

2. **이 변경이 다른 API에 영향을 줄 수 있나?**
   - YES → 사용자에게 먼저 확인
   - NO → 신중하게 진행

3. **환경변수 변경이 필요한가?**
   - Vercel 대시보드에서 변경 필요
   - 사용자에게 알려주기

## 🎯 현재 프로젝트 상태

### 작동 중인 API (건드리지 마!)

#### `/api/supabase` - Supabase 프록시
- **GET**: 데이터 조회
  - `?table=admin_settings&key=main_banner_1` - 특정 설정 조회
  - `?table=consultations` - 상담 신청 목록 조회
- **POST**: 데이터 저장 (UPSERT)
  - `admin_settings`: 콘텐츠 관리 (메인페이지, 히어로섹션, 부정클릭경고)
  - `consultations`: 상담 신청 저장
- **PATCH**: 데이터 수정 (UPSERT)
  - `admin_settings`: 비밀번호 변경 등
  - `consultations`: 상담 상태 업데이트
- **DELETE**: 데이터 삭제
  - `admin_settings`: 이미지 삭제 (setting_key 기반)
  - `consultations`: 상담 신청 삭제 (id 기반)

#### `/api/track-visitor` - 방문자 추적 (부정클릭 감지)
- **POST**: 방문자 IP 자동 기록
- **GET**: 방문자 통계 조회
  - `?list=true&period=today&sort=count` - IP별 상세 통계
  - `?suspicious=true` - 부정클릭 의심 IP (5회 이상)

### CORS 허용 도메인
- `*` (모든 도메인 허용)

### 환경변수 (Vercel 설정)
- `SUPABASE_URL`: Supabase 프로젝트 URL
- `SUPABASE_ANON_KEY`: Supabase 익명 키
- `NCLOUD_ACCESS_KEY`: NCloud SMS API 키
- `NCLOUD_SECRET_KEY`: NCloud SMS 시크릿 키
- `NCLOUD_SERVICE_ID`: NCloud SMS 서비스 ID
- `NCLOUD_FROM_PHONE`: SMS 발신 번호
- `ADMIN_PHONE`: 관리자 전화번호

## 💻 개발 명령어

```bash
# 로컬 개발 서버 실행
vercel dev

# 프로덕션 배포
vercel --prod

# 환경변수 설정 (Vercel CLI)
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
```

## 🔒 보안 원칙

### API 키 보호
- 환경변수로만 관리
- 절대 코드에 하드코딩 금지
- Git에 커밋 금지

### CORS 정책
- 현재 모든 도메인 허용 (`*`)
- 새 도메인 추가 시 사용자 승인 필요

### 에러 처리
- 민감한 정보 노출 금지
- 적절한 HTTP 상태 코드 반환

## 🔥 과거 실수 사례 (다시는 하지 말 것!)

❌ **기존폼 작업을 프록시서버에서 처리 시도** → 역할 혼동
❌ **UI 코드 수정** → 프록시 서버는 API만 담당
❌ **비밀번호 테이블 건드림** → 요청하지 않은 테이블 수정
❌ **요청하지 않은 파일 수정** → 기존 작동하던 코드 망가뜨림

## 📝 작업 시 원칙

1. **한 번에 한 가지만 수정**
2. **로컬 테스트 후 배포** (가능한 경우)
3. **문제 생기면 즉시 이전 버전으로 롤백**
4. **의심스러우면 사용자에게 물어보기**
5. **작업 전 반드시 사용자에게 확인 요청**

## 🔄 프론트엔드 연동 구조

```
[기존폼 index.html/admin.html]
    ↓ (fetch 요청)
[프록시서버 /api/supabase] ← **내가 관리하는 부분**
    ↓ (Supabase API 호출)
[Supabase 데이터베이스]

[기존폼 index.html]
    ↓ (방문 시 자동 호출)
[프록시서버 /api/track-visitor] ← **내가 관리하는 부분**
    ↓ (IP 자동 수집 및 저장)
[Supabase visitors 테이블]
```

## 📞 담당자 연락 구조

- **프론트엔드 수정 필요**: 기존폼 담당자(Claude)에게 요청
- **데이터베이스 구조 변경**: 수파베이스 담당자에게 요청
- **프록시 API 수정**: 내가 직접 처리

## 🎯 중요한 UPSERT 로직

### admin_settings 테이블
- POST/PATCH 요청 시 **DELETE 후 INSERT** 방식으로 UPSERT 구현
- 같은 `setting_key`는 항상 1개만 존재
- 중복 걱정 없음

### 예시
```javascript
// 1. 기존 데이터 삭제
await supabase.from('admin_settings').delete().eq('setting_key', 'main_banner_1');

// 2. 새 데이터 INSERT
await supabase.from('admin_settings').insert([{ setting_key: 'main_banner_1', ... }]);
```

## 📊 방문자 추적 (부정클릭 감지)

### visitors 테이블
- 페이지 방문 시마다 자동 기록
- IP 주소, 방문 시간, referrer, user_agent 저장
- IP별 방문 횟수 통계 제공
- 5회 이상 방문 시 부정클릭 의심

### 사용 예시
```javascript
// 방문자 기록
POST /api/track-visitor
{ referrer, page_url, user_agent }

// IP 목록 조회
GET /api/track-visitor?list=true&period=today&sort=count

// 부정클릭 의심 IP
GET /api/track-visitor?list=true&suspicious=true
```

---

**기억하세요: "내가 요청한 것만 건드려!"**
