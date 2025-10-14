import { createClient } from '@supabase/supabase-js';

// Body Parser 설정
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

export default async function handler(req, res) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  try {
    // POST: 방문자 IP 기록
    if (req.method === 'POST') {
      console.log('=== 방문자 추적 시작 ===');
      console.log('받은 데이터:', req.body);

      // IP 주소 추출 (Vercel에서 자동 수집)
      const ip_address = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
                      || req.headers['x-real-ip']
                      || 'unknown';

      const { referrer, page_url, user_agent } = req.body;

      const visitorData = {
        ip_address,
        user_agent: user_agent || req.headers['user-agent'] || '',
        referrer: referrer || '',
        page_url: page_url || '/',
        visited_at: new Date().toISOString()
      };

      console.log('저장할 데이터:', visitorData);

      const { data, error } = await supabase
        .from('visitors')
        .insert([visitorData])
        .select();

      if (error) {
        console.error('방문자 기록 실패:', error);
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      console.log('방문자 기록 성공:', data);

      return res.status(200).json({
        success: true,
        message: '방문 기록 완료',
        data: data[0]
      });
    }

    // GET: 오늘 방문자 수 조회
    if (req.method === 'GET') {
      console.log('=== 오늘 방문자 수 조회 ===');

      // 오늘 날짜 (한국 시간 기준)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStart = today.toISOString();

      console.log('조회 시작 시간:', todayStart);

      const { data, error, count } = await supabase
        .from('visitors')
        .select('*', { count: 'exact', head: false })
        .gte('visited_at', todayStart);

      if (error) {
        console.error('조회 실패:', error);
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      console.log('오늘 방문자 수:', count);

      return res.status(200).json({
        success: true,
        count: count || 0,
        data: data || []
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('=== 에러 발생 ===');
    console.error('에러 메시지:', error.message);
    console.error('에러 스택:', error.stack);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
