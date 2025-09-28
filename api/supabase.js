import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  // 환경변수 확인
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: '환경변수 누락' });
  }

  // 중요: service_role_key 사용 시 옵션 추가
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'  // 명시적으로 public 스키마 지정
    }
  });

  try {
    console.log('=== API 호출 시작 ===');
    console.log('Method:', req.method);
    console.log('Headers:', req.headers);
    console.log('받은 데이터:', req.body);

    if (req.method === 'GET') {
      console.log('GET 요청 처리 중...');

      // 먼저 단순 조회부터 시도
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .limit(10);

      console.log('GET 결과:', { data, error });

      if (error) {
        console.error('GET 에러 상세:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      // 성공한 경우 created_at 또는 접수일시로 정렬 시도
      let sortedData = data;
      if (data && data.length > 0) {
        // 첫 번째 레코드의 컬럼명 확인
        console.log('테이블 컬럼들:', Object.keys(data[0]));

        // 시간순 정렬 (created_at 또는 접수일시 컬럼이 있는 경우)
        if (data[0].hasOwnProperty('created_at')) {
          sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else if (data[0].hasOwnProperty('접수일시')) {
          sortedData = data.sort((a, b) => new Date(b.접수일시) - new Date(a.접수일시));
        }
      }

      return res.status(200).json({
        success: true,
        data: sortedData,
        count: sortedData.length
      });
    }

    if (req.method === 'POST') {
      console.log('POST 요청 처리 중...');
      console.log('받은 원본 데이터:', JSON.stringify(req.body, null, 2));

      // 한글 -> 영문 컬럼명 매핑
      const insertData = {
        name: req.body.이름 || req.body.name,
        phone: req.body.연락처 || req.body.phone,
        carrier: req.body.통신사 || req.body.carrier,
        main_service: req.body.주요서비스 || req.body.main_service,
        other_service: req.body.기타서비스 || req.body.other_service || '',
        preferred_time: req.body.상담희망시간 || req.body.preferred_time,
        privacy_agreed: req.body.개인정보동의 || req.body.privacy_agreed || false,
        status: req.body.상태 || req.body.status || '신규',
        gift_amount: req.body.사은품금액 || req.body.gift_amount || 0,
        ip_address: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown',
        created_at: new Date().toISOString()
      };

      console.log('영문 컬럼명으로 변환된 데이터:', JSON.stringify(insertData, null, 2));

      const { data, error } = await supabase
        .from('consultations')
        .insert([insertData])
        .select();

      console.log('POST 결과:', { data, error });

      if (error) {
        console.error('Supabase INSERT 에러 상세:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      return res.status(200).json({
        success: true,
        data: data,
        message: '상담 신청이 접수되었습니다.'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('=== 에러 발생 ===');
    console.error('에러 타입:', error.constructor.name);
    console.error('에러 메시지:', error.message);
    console.error('에러 스택:', error.stack);
    console.error('에러 전체:', JSON.stringify(error, null, 2));

    return res.status(500).json({
      success: false,
      error: error.message,
      errorType: error.constructor.name,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};