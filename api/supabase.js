import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, cache-control');

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  try {
    console.log('=== API 호출 시작 ===');
    console.log('Method:', req.method);
    console.log('Headers:', req.headers);
    console.log('받은 데이터:', req.body);

    if (req.method === 'GET') {
      console.log('GET 요청 처리 중...');

      // table 쿼리 파라미터 지원 (기본값: consultations)
      const tableName = req.query.table || 'consultations';
      const key = req.query.key;
      console.log('테이블:', tableName);
      console.log('키 필터:', key);

      // 쿼리 빌더 시작
      let query = supabase.from(tableName).select('*');

      // admin_settings에서 특정 키 조회
      if (tableName === 'admin_settings' && key) {
        query = query.eq('setting_key', key);
      }

      // created_at 기준으로 최신순 정렬하여 조회
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      console.log('Supabase 응답:', data);
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

      const { table, data, ...otherFields } = req.body;

      // table 파라미터 지원 (유연성 확장)
      const tableName = table || req.query.table || 'consultations';
      // data가 있으면 data 사용, 없으면 table 제외한 나머지 필드 사용
      const requestData = data || (table ? otherFields : req.body);

      console.log('테이블:', tableName);
      console.log('처리할 데이터:', requestData);

      let insertData;

      // 테이블별 한글 -> 영문 컬럼명 매핑
      if (tableName === 'admin_settings') {
        insertData = {
          setting_key: requestData.설정키 || requestData.setting_key,
          setting_value: requestData.설정값 || requestData.setting_value,
          setting_type: requestData.설정타입 || requestData.setting_type || 'image',
          created_at: new Date().toISOString()
        };
      } else if (tableName === 'consultations') {
        insertData = {
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
      } else {
        // 기타 테이블은 그대로 전달
        insertData = requestData;
      }

      console.log('영문 컬럼명으로 변환된 데이터:', JSON.stringify(insertData, null, 2));
      console.log('사용할 테이블:', tableName);

      const { data: result, error } = await supabase
        .from(tableName)
        .insert([insertData])
        .select();

      console.log('Supabase 응답:', result);
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