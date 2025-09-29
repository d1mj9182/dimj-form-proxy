import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // 완전한 CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Max-Age', '3600');

  // OPTIONS 요청 완전 처리
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*');
    return res.status(204).end();
  }

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

      // created_at 기준으로 최신순 정렬하여 조회
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('GET 결과:', { data, error });

      if (error) {
        console.error('GET 에러 상세:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        return res.status(400).json({ success: false, error: error.message });
      }

      // 직접 배열로 반환 (어드민 페이지 호환성)
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      console.log('POST 요청 처리 중...');
      console.log('받은 원본 데이터:', JSON.stringify(req.body, null, 2));

      const { table, data } = req.body;

      // table 파라미터 지원 (유연성 확장)
      const tableName = table || 'consultations';
      const requestData = data || req.body;

      // 한글 -> 영문 컬럼명 매핑
      const insertData = {
        name: requestData.이름 || requestData.name,
        phone: requestData.연락처 || requestData.phone,
        carrier: requestData.통신사 || requestData.carrier,
        main_service: requestData.주요서비스 || requestData.main_service,
        other_service: requestData.기타서비스 || requestData.other_service || '',
        preferred_time: requestData.상담희망시간 || requestData.preferred_time,
        privacy_agreed: requestData.개인정보동의 || requestData.privacy_agreed || false,
        status: requestData.상태 || requestData.status,
        gift_amount: requestData.사은품금액 || requestData.gift_amount || 0,
        ip_address: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown',
        created_at: new Date().toISOString()
      };

      // 신규 접수는 무조건 상담대기
      if (!insertData.status) {
        insertData.status = '상담대기';
      }

      console.log('영문 컬럼명으로 변환된 데이터:', JSON.stringify(insertData, null, 2));
      console.log('사용할 테이블:', tableName);

      const { data: result, error } = await supabase
        .from(tableName)
        .insert([insertData])
        .select();

      console.log('POST 결과:', { data: result, error });

      if (error) {
        console.error('Supabase INSERT 에러 상세:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      return res.json({ success: !error, data: result });
    }

    if (req.method === 'DELETE') {
      console.log('DELETE 요청 처리 중...');
      console.log('삭제 요청 데이터:', JSON.stringify(req.body, null, 2));

      const { id } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: '삭제할 레코드의 ID가 필요합니다.'
        });
      }

      const { data, error } = await supabase
        .from('consultations')
        .delete()
        .eq('id', id)
        .select(); // 삭제된 레코드 정보 반환

      console.log('DELETE 결과:', { data, error });

      if (error) {
        console.error('Supabase DELETE 에러 상세:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      if (!data || data.length === 0) {
        return res.status(404).json({
          success: false,
          error: '삭제할 레코드를 찾을 수 없습니다.'
        });
      }

      return res.status(200).json({
        success: true,
        message: '삭제 완료',
        deletedRecord: data[0]
      });
    }

    if (req.method === 'PATCH') {
      console.log('PATCH 요청 처리 중...');
      console.log('업데이트 요청 데이터:', JSON.stringify(req.body, null, 2));

      const { id, status, gift_amount, table } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: '업데이트할 레코드의 ID가 필요합니다.'
        });
      }

      const updateData = {};
      if (status) updateData.status = status;
      if (gift_amount !== undefined) updateData.gift_amount = gift_amount;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: '업데이트할 필드가 없습니다.'
        });
      }

      console.log('업데이트할 필드들:', updateData);

      const { data, error } = await supabase
        .from(table || 'consultations')
        .update(updateData)
        .eq('id', id)
        .select(); // 업데이트된 레코드 반환

      console.log('PATCH 결과:', { data, error });

      if (error) {
        console.error('Supabase UPDATE 에러 상세:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      if (!data || data.length === 0) {
        return res.status(404).json({
          success: false,
          error: '업데이트할 레코드를 찾을 수 없습니다.'
        });
      }

      return res.json({ success: !error, data });
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