/**
 * DIMJ-form Proxy: Airtable → Frontend
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

const ALLOWED_METHODS = ['GET', 'OPTIONS'];

// 한글/영문/숫자만 남기고, 이모지·기타 특수문자 제거
// (공백 제거: UI에서 "접수일시", "주요서비스" 등은 공백 없이도 키 매칭됨)
function cleanFieldNames(fields = {}) {
  const cleaned = {};
  for (const rawKey in fields) {
    if (!Object.prototype.hasOwnProperty.call(fields, rawKey)) continue;
    const newKey = rawKey.replace(/[^\w가-힣0-9]/g, ''); // 이모지/특수문자/공백 제거
    cleaned[newKey] = fields[rawKey];
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

    // 필요시: 서버 시간도 함께 내려 디버깅 용이
    return res.status(200).json({
      success: true,
      now: new Date().toISOString(),
      count: sorted.length,
      records: sorted,
    });
  } catch (err) {
    console.error('[Airtable Proxy Error]', err);
    return res.status(500).json({ success: false, error: err.message || 'Unknown error' });
  }
};