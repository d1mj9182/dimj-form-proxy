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

    // GET: 방문자 조회
    if (req.method === 'GET') {
      const { list, period = 'today', sort = 'recent', suspicious } = req.query;

      // 날짜 범위 계산
      const now = new Date();
      let startDate = new Date();

      switch (period) {
        case 'yesterday':
          startDate.setDate(now.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'month':
          startDate.setDate(now.getDate() - 30);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'today':
        default:
          startDate.setHours(0, 0, 0, 0);
          break;
      }

      const startDateISO = startDate.toISOString();
      console.log('=== 방문자 조회 ===');
      console.log('기간:', period, '시작:', startDateISO);

      // IP 목록 조회 (상세)
      if (list === 'true') {
        console.log('IP 목록 상세 조회');

        // 모든 방문 기록 조회
        const { data: visitors, error } = await supabase
          .from('visitors')
          .select('*')
          .gte('visited_at', startDateISO)
          .order('visited_at', { ascending: false });

        if (error) {
          console.error('조회 실패:', error);
          return res.status(400).json({
            success: false,
            error: error.message
          });
        }

        // IP별로 그룹화 및 통계 계산
        const ipStats = {};

        visitors.forEach(visit => {
          const ip = visit.ip_address;

          if (!ipStats[ip]) {
            ipStats[ip] = {
              ip_address: ip,
              visit_count: 0,
              first_visit: visit.visited_at,
              last_visit: visit.visited_at,
              referrer: visit.referrer || '',
              user_agent: visit.user_agent || '',
              page_urls: []
            };
          }

          ipStats[ip].visit_count += 1;

          // 최초 방문 시간 업데이트
          if (new Date(visit.visited_at) < new Date(ipStats[ip].first_visit)) {
            ipStats[ip].first_visit = visit.visited_at;
          }

          // 최근 방문 시간 업데이트
          if (new Date(visit.visited_at) > new Date(ipStats[ip].last_visit)) {
            ipStats[ip].last_visit = visit.visited_at;
          }

          // 방문한 페이지 추가
          if (visit.page_url && !ipStats[ip].page_urls.includes(visit.page_url)) {
            ipStats[ip].page_urls.push(visit.page_url);
          }
        });

        // 배열로 변환
        let result = Object.values(ipStats);

        // 부정클릭 의심 IP 필터링 (5회 이상)
        if (suspicious === 'true') {
          result = result.filter(stat => stat.visit_count >= 5);
        }

        // 정렬
        if (sort === 'count') {
          result.sort((a, b) => b.visit_count - a.visit_count);
        } else {
          result.sort((a, b) => new Date(b.last_visit) - new Date(a.last_visit));
        }

        console.log('조회 완료, IP 개수:', result.length);

        return res.status(200).json({
          success: true,
          period,
          count: result.length,
          data: result
        });
      }

      // 단순 방문자 수만 조회
      const { data, error, count } = await supabase
        .from('visitors')
        .select('*', { count: 'exact', head: false })
        .gte('visited_at', startDateISO);

      if (error) {
        console.error('조회 실패:', error);
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      console.log('방문자 수:', count);

      return res.status(200).json({
        success: true,
        period,
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
