# DIMJ-form Proxy Server

DIMJ-form 전용 에어테이블 프록시 서버입니다.

## 환경변수 설정 (Vercel에서)

Vercel 배포 시 다음 환경변수를 설정해야 합니다:

- `AIRTABLE_API_KEY`: 에어테이블 Personal Access Token
- `AIRTABLE_BASE_ID`: 에어테이블 베이스 ID (app으로 시작)
- `AIRTABLE_TABLE_NAME`: 테이블 이름 (예: "신청접수")

## API 엔드포인트

- `POST /api/airtable`: 신청 데이터 저장
- `GET /api/airtable`: 데이터 조회 (사은품 금액 합계용)

## 허용된 도메인

- https://dimj-form.vercel.app
- https://d1mj9182.github.io
- http://localhost:3000 (개발용)
- http://127.0.0.1:5500 (개발용)