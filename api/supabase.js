const { createClient } = require('@supabase/supabase-js');

function createSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL이 설정되지 않았습니다');
  }

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY 또는 SUPABASE_ANON_KEY가 설정되지 않았습니다');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

function mapToFrontendFormat(record) {
  return {
    id: record.id,
    createdTime: record.created_at,
    fields: {
      '이름': record.name || '',
      '연락처': record.phone || '',
      '주요서비스': record.main_service || '',
      '통신사': record.provider || '',
      '기타서비스': record.additional_services || '',
      '상담희망시간': record.preferred_time || '',
      '접수일시': record.created_at,
      'IP주소': record.ip_address || '',
      '상태': record.status || '상담 대기',
      '사은품금액': record.gift_amount || 0
    }
  };
}

function mapFromFrontendFormat(fields) {
  return {
    name: fields['이름'] || fields.name,
    phone: fields['연락처'] || fields.phone,
    main_service: fields['주요서비스'] || fields.mainService,
    provider: fields['통신사'] || fields.provider,
    additional_services: fields['기타서비스'] || fields.additionalServices,
    preferred_time: fields['상담희망시간'] || fields.preferredTime,
    ip_address: fields['IP주소'] || fields.ipAddress,
    status: fields['상태'] || fields.status || '상담 대기',
    gift_amount: fields['사은품금액'] || fields.giftAmount || 0
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const supabase = createSupabaseClient();
    const tableName = 'consultations';

    if (req.method === 'GET') {
      const { data: records, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`데이터 조회 실패: ${error.message}`);
      }

      const validRecords = (records || []).filter(record =>
        record.name && record.name.trim() &&
        record.phone && record.phone.trim()
      );

      const mappedRecords = validRecords.map(mapToFrontendFormat);

      return res.status(200).json({
        success: true,
        records: mappedRecords
      });
    }

    if (req.method === 'POST') {
      const requestData = req.body;
      let insertData;

      if (requestData.fields) {
        insertData = mapFromFrontendFormat(requestData.fields);
      } else {
        insertData = mapFromFrontendFormat(requestData);
      }

      const { data: newRecord, error } = await supabase
        .from(tableName)
        .insert([insertData])
        .select()
        .single();

      if (error) {
        throw new Error(`데이터 생성 실패: ${error.message}`);
      }

      return res.status(201).json({
        success: true,
        record: mapToFrontendFormat(newRecord)
      });
    }

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};// 강제 배포 트리거 2025년 09월 26일 금 오전  1:56:20
