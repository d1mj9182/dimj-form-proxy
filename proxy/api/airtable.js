export default async function handler(req, res) {
  // CORS 설정 - DIMJ-form 전용
  const allowedOrigins = [
    "https://dimj-form.vercel.app",         // 메인 배포 도메인
    "https://dimj9182.github.io",           // GitHub Pages
    "https://dimj9182.github.io/DIMJ-form", // GitHub Pages
    "https://d1mj9182.github.io",          // GitHub Pages (루트)
    "http://localhost:3000",               // 로컬 개발용
    "http://localhost:8000",               // Python HTTP Server
    "http://127.0.0.1:8000",              // Python HTTP Server
    "http://127.0.0.1:5500",              // Live Server 개발용
    "http://localhost:5500"                // Live Server 로컬
  ];

  const requestOrigin = req.headers.origin;
  if (allowedOrigins.includes(requestOrigin)) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigins[0]); // fallback
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 환경변수에서 에어테이블 설정 가져오기
  const API_KEY = process.env.AIRTABLE_API_KEY;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;
  const TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;

  if (!API_KEY || !BASE_ID || !TABLE_NAME) {
    return res.status(500).json({
      error: "Airtable 환경변수 설정 필요 (AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME)",
      code: "NO_ENV",
    });
  }

  const AIRTABLE_API_URL = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;

  // POST 요청 - 데이터 생성
  if (req.method === "POST") {
    try {
      // 이모지를 제거하는 헬퍼 함수
      function removeEmojis(str) {
        return str.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
      }

      // 먼저 에어테이블에서 실제 필드 구조를 가져오기
      let actualFields = [];
      try {
        const schemaResponse = await fetch(AIRTABLE_API_URL, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
        });

        if (schemaResponse.ok) {
          const schemaData = await schemaResponse.json();
          if (schemaData.records && schemaData.records.length > 0) {
            actualFields = Object.keys(schemaData.records[0].fields || {});
            console.log('실제 에어테이블 필드명들:', actualFields);
          }
        }
      } catch (schemaError) {
        console.log('스키마 조회 실패, 기본 필드명 사용:', schemaError.message);
      }

      // DIMJ-form에서 사용하는 기본 필드명들
      const baseFields = [
        "접수일시", "이름", "연락처", "통신사", "주요서비스", "기타서비스",
        "상담희망시간", "개인정보동의", "상태", "사은품금액", "IP주소", "IP"
      ];

      const body = req.body;
      let fieldsToSend = {};

      // 프록시 서버를 통한 요청인지 확인
      if (body.baseId && body.tableName && body.apiKey && body.data) {
        fieldsToSend = body.data.fields;
      } else {
        // 기본 필드명으로 데이터 매핑
        for (const baseField of baseFields) {
          if (body[baseField] !== undefined) {
            // 이모지가 포함된 실제 필드명 찾기
            let matchedField = baseField;

            if (actualFields.length > 0) {
              const found = actualFields.find(actualField =>
                removeEmojis(actualField) === removeEmojis(baseField)
              );
              if (found) {
                matchedField = found;
                console.log(`필드 매칭: ${baseField} → ${matchedField}`);
              }
            }

            fieldsToSend[matchedField] = body[baseField];
          }
        }
      }

      const airtableRes = await fetch(AIRTABLE_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields: fieldsToSend })
      });

      const data = await airtableRes.json();

      if (!airtableRes.ok) {
        throw {
          message: data.error?.message || "에어테이블 API 오류",
          code: data.error?.type || "AIRTABLE_ERROR",
          status: airtableRes.status
        };
      }

      return res.status(200).json({
        success: true,
        data: data,
        message: "데이터가 성공적으로 저장되었습니다."
      });

    } catch (error) {
      console.error("POST /api/airtable 오류:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "알 수 없는 오류가 발생했습니다.",
        code: error.code || "INTERNAL_ERROR"
      });
    }
  }

  // GET 요청 - 데이터 조회 (사은품 금액 합계용)
  if (req.method === "GET") {
    try {
      console.log("🔍 에어테이블 API 호출 시도:", AIRTABLE_API_URL);
      console.log("🔑 API_KEY 존재:", !!API_KEY);
      console.log("📊 BASE_ID:", BASE_ID);
      console.log("📋 TABLE_NAME:", TABLE_NAME);

      const airtableRes = await fetch(AIRTABLE_API_URL, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      });

      console.log("📡 에어테이블 응답 상태:", airtableRes.status);

      const data = await airtableRes.json();
      console.log("📄 에어테이블 응답 데이터:", JSON.stringify(data, null, 2));

      if (!airtableRes.ok) {
        throw {
          message: data.error?.message || "에어테이블 조회 오류",
          code: data.error?.type || "AIRTABLE_ERROR",
          status: airtableRes.status,
          fullError: data
        };
      }

      return res.status(200).json({
        success: true,
        records: data.records || [],
        message: "데이터 조회 성공"
      });

    } catch (error) {
      console.error("GET /api/airtable 오류:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "데이터 조회 중 오류가 발생했습니다.",
        code: error.code || "INTERNAL_ERROR",
        debug: {
          hasApiKey: !!API_KEY,
          baseId: BASE_ID,
          tableName: TABLE_NAME,
          url: AIRTABLE_API_URL,
          fullError: error.fullError || error
        }
      });
    }
  }

  return res.status(405).json({
    success: false,
    error: "허용되지 않는 HTTP 메서드입니다.",
    code: "METHOD_NOT_ALLOWED"
  });
}