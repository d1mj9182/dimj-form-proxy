import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// SMS 발송 함수
async function sendSMS(formData) {
  const timestamp = Date.now().toString();
  const accessKey = process.env.NCLOUD_ACCESS_KEY;
  const secretKey = process.env.NCLOUD_SECRET_KEY;
  const serviceId = process.env.NCLOUD_SERVICE_ID;
  const space = " ";
  const newLine = "\n";
  const method = "POST";
  const url = `/sms/v2/services/${serviceId}/messages`;

  // HMAC 서명 생성
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(method);
  hmac.update(space);
  hmac.update(url);
  hmac.update(newLine);
  hmac.update(timestamp);
  hmac.update(newLine);
  hmac.update(accessKey);
  const signature = hmac.digest('base64');

  // SMS 메시지 내용
  const message = `[당일민족] 신규 상담신청
고객: ${formData.name}
연락처: ${formData.phone}
통신사: ${formData.carrier}
서비스: ${formData.main_service}
추가: ${formData.other_service || '없음'}`;

  // SENS API 호출
  try {
    const response = await fetch(
      `https://sens.apigw.ntruss.com/sms/v2/services/${serviceId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'x-ncp-apigw-timestamp': timestamp,
          'x-ncp-iam-access-key': accessKey,
          'x-ncp-apigw-signature-v2': signature
        },
        body: JSON.stringify({
          type: 'SMS',
          contentType: 'COMM',
          countryCode: '82',
          from: process.env.NCLOUD_FROM_PHONE,
          content: message,
          messages: [{
            to: process.env.ADMIN_PHONE
          }]
        })
      }
    );

    if (!response.ok) {
      console.error('SMS 발송 실패:', await response.text());
    } else {
      console.log('SMS 발송 성공');
    }
  } catch (error) {
    console.error('SMS 발송 에러:', error);
  }
}

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
        query = query.eq('setting_key', key)
                     .order('created_at', { ascending: false })
                     .limit(1);  // 최신 1개만 반환
      } else {
        // created_at 기준으로 최신순 정렬하여 조회
        query = query.order('created_at', { ascending: false });
      }

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
        console.log('🔍 requestData 키들:', Object.keys(requestData));
        console.log('🔍 설정키 값:', requestData['설정키'], requestData.설정키);
        insertData = {
          setting_key: requestData['설정키'] || requestData.설정키 || requestData.setting_key,
          setting_value: requestData['설정값'] || requestData.설정값 || requestData.setting_value,
          setting_type: requestData['설정타입'] || requestData.설정타입 || requestData.setting_type || 'image',
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

      // SMS 발송 (consultations 테이블만)
      if (tableName === 'consultations') {
        try {
          console.log('SMS 발송 시도:', insertData.name);
          await sendSMS(insertData);
        } catch (smsError) {
          console.error('SMS 알림 실패:', smsError);
          // SMS 실패해도 계속 진행
        }
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

      const { id, status, gift_amount, created_at, table, setting_key, setting_value } = req.body;
      const tableName = table || 'consultations';

      // admin_settings 테이블 처리
      if (tableName === 'admin_settings') {
        if (!setting_key) {
          return res.status(400).json({
            success: false,
            error: 'admin_settings 업데이트에는 setting_key가 필요합니다.'
          });
        }

        if (!setting_value) {
          return res.status(400).json({
            success: false,
            error: '업데이트할 setting_value가 필요합니다.'
          });
        }

        console.log('admin_settings 업데이트:', { setting_key, setting_value });

        // 방법 1: 기존 데이터 삭제 후 새로 INSERT
        // 먼저 기존 setting_key 삭제
        await supabase
          .from('admin_settings')
          .delete()
          .eq('setting_key', setting_key);

        // 새 값으로 INSERT
        const { data, error } = await supabase
          .from('admin_settings')
          .insert({
            setting_key,
            setting_value,
            setting_type: 'text',
            created_at: new Date().toISOString()
          })
          .select();

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
            error: 'setting_key를 찾을 수 없습니다.'
          });
        }

        return res.json({ success: true, data });
      }

      // consultations 테이블 처리 (기존 로직)
      if (!id) {
        return res.status(400).json({
          success: false,
          error: '업데이트할 레코드의 ID가 필요합니다.'
        });
      }

      const updateData = {};
      if (status) updateData.status = status;
      if (gift_amount !== undefined) updateData.gift_amount = gift_amount;
      if (created_at) updateData.created_at = created_at;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: '업데이트할 필드가 없습니다.'
        });
      }

      console.log('업데이트할 필드들:', updateData);

      const { data, error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', id)
        .select();

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