/**
 * DIMJ-form Proxy Server v2.0 - UPDATED 2025-09-18
 * 완전 새로운 버전 - 4가지 핵심 문제 해결
 * - 이모지/특수문자 제거(필드키 정규화)
 * - 빈 레코드 필터링 (fields: {} 제거)
 * - createdTime 기준 최신순(내림차순) 정렬
 * - 캐시 무효화 헤더로 Vercel/CDN 캐시 영향 제거
 *
 * 필요 ENV (Vercel → Project Settings → Environment Variables)
 *  - AIRTABLE_API_KEY
 *  - AIRTABLE_BASE_ID
 *  - AIRTABLE_TABLE_NAME
 */

const ALLOWED_METHODS = ['GET', 'POST', 'PATCH', 'OPTIONS'];

// 🔥 강력한 이모지 제거 - 에어테이블 컬럼명 정규화
// 에어테이블: "📅 접수일시" → 코드: "접수일시"
function cleanFieldNames(fields = {}) {
  const cleaned = {};
  for (const rawKey in fields) {
    if (!Object.prototype.hasOwnProperty.call(fields, rawKey)) continue;

    // 1단계: 이모지 완전 제거 (유니코드 이모지 범위)
    let cleanKey = rawKey.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]/gu, '');

    // 2단계: 공백 제거 및 특수문자 제거
    cleanKey = cleanKey.replace(/^\s+|\s+$/g, '').replace(/[^\w가-힣0-9]/g, '');

    // 3단계: 표준 필드명으로 매핑
    const fieldMapping = {
      '접수일시': '접수일시',
      '이름': '이름',
      '연락처': '연락처',
      '통신사': '통신사',
      '주요서비스': '주요서비스',
      '기타서비스': '기타서비스',
      '상담희망시간': '상담희망시간',
      '개인정보동의': '개인정보동의',
      '상태': '상태',
      '사은품금액': '사은품금액',
      'IP주소': 'IP주소',
      'IP': 'IP'
    };

    const finalKey = fieldMapping[cleanKey] || cleanKey;
    cleaned[finalKey] = fields[rawKey];
  }
  return cleaned;
}

function isNonEmptyFields(fields) {
  return fields && typeof fields === 'object' && Object.keys(fields).length > 0;
}

function sortByCreatedTimeDesc(records) {
  return records.slice().sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));
}

async function fetchAirtablePage({ apiKey, baseId, tableName, offset = undefined }) {
  const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`);
  // 필요시 select, filterByFormula 등을 추가 가능. 지금은 풀페치 + 백엔드에서 정제
  if (offset) url.searchParams.set('offset', offset);

  const resp = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Airtable API ${resp.status}: ${text || 'Unknown error'}`);
  }

  return resp.json();
}

async function fetchAllAirtableRecords({ apiKey, baseId, tableName }) {
  let all = [];
  let offset;
  // Airtable pagination 대응
  do {
    const page = await fetchAirtablePage({ apiKey, baseId, tableName, offset });
    all = all.concat(page.records || []);
    offset = page.offset;
  } while (offset);
  return all;
}

module.exports = async function handler(req, res) {
  // CORS(필요시 도메인 제한)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', ALLOWED_METHODS.join(', '));
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // CDN/브라우저 캐시 무효화 (임의 숫자 변동 제거에 중요)
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!ALLOWED_METHODS.includes(req.method)) return res.status(405).json({ success: false, error: 'Method Not Allowed' });

  try {
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = process.env.AIRTABLE_TABLE_NAME;

    if (!apiKey || !baseId || !tableName) {
      return res.status(500).json({
        success: false,
        error: 'Missing environment variables: AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME',
      });
    }

    // GET: 데이터 조회
    if (req.method === 'GET') {
      const rawRecords = await fetchAllAirtableRecords({ apiKey, baseId, tableName });

      // 1) 빈 레코드 제거
      const nonEmpty = rawRecords.filter(r => isNonEmptyFields(r.fields));

      // 2) 필드 키 클린업(이모지/특수문자 제거)
      const cleanedRecords = nonEmpty.map(r => ({
        id: r.id,
        createdTime: r.createdTime,
        fields: cleanFieldNames(r.fields),
      }));

      // 3) 최신순 정렬 (createdTime 내림차순)
      const sorted = sortByCreatedTimeDesc(cleanedRecords);

      console.log(`[PROXY v2.0] GET 처리 완료: ${sorted.length}개 유효 레코드`);
      return res.status(200).json({
        success: true,
        version: "2.0-UPDATED",
        timestamp: new Date().toISOString(),
        totalRecords: rawRecords.length,
        validRecords: sorted.length,
        records: sorted,
        message: "v2.0 프록시에서 정제된 데이터"
      });
    }

    // PATCH: 레코드 업데이트 (관리자 상태 변경용)
    if (req.method === 'PATCH') {
      const { recordId, fields } = req.body;

      if (!recordId || !fields) {
        return res.status(400).json({
          success: false,
          error: 'recordId와 fields가 필요합니다'
        });
      }

      const updateUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}/${recordId}`;
      const updateResp = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields })
      });

      if (!updateResp.ok) {
        const errorText = await updateResp.text().catch(() => '');
        throw new Error(`Airtable PATCH ${updateResp.status}: ${errorText}`);
      }

      const updatedRecord = await updateResp.json();
      console.log(`[PROXY v2.0] PATCH 완료: ${recordId} 업데이트`);

      return res.status(200).json({
        success: true,
        message: '레코드 업데이트 완료',
        record: updatedRecord
      });
    }

    // POST: 새 레코드 생성 (폼 제출용)
    if (req.method === 'POST') {
      const { fields } = req.body;

      if (!fields) {
        return res.status(400).json({
          success: false,
          error: 'fields가 필요합니다'
        });
      }

      const createUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
      const createResp = await fetch(createUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields })
      });

      if (!createResp.ok) {
        const errorText = await createResp.text().catch(() => '');
        throw new Error(`Airtable POST ${createResp.status}: ${errorText}`);
      }

      const newRecord = await createResp.json();
      console.log(`[PROXY v2.0] POST 완료: 새 레코드 생성`);

      return res.status(201).json({
        success: true,
        message: '새 레코드 생성 완료',
        record: newRecord
      });
    }

  } catch (err) {
    console.error('[Airtable Proxy Error]', err);
    return res.status(500).json({ success: false, error: err.message || 'Unknown error' });
  }
};// Force redeploy 1758153367
