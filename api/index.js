import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  // 환경변수 체크
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let envStatus = '✅ 정상';
  let envDetails = '';

  if (!supabaseUrl) {
    envStatus = '❌ 실패';
    envDetails += 'SUPABASE_URL 누락<br>';
  }
  if (!supabaseKey) {
    envStatus = '❌ 실패';
    envDetails += 'SUPABASE_SERVICE_ROLE_KEY 누락<br>';
  }

  // Supabase 연결 테스트
  let dbStatus = '❌ 실패';
  let dbDetails = '';
  let recordCount = 0;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        db: {
          schema: 'public'
        }
      });

      console.log('=== 상태 페이지 DB 테스트 ===');
      const { data, error, count } = await supabase
        .from('consultations')
        .select('*', { count: 'exact' })
        .limit(5);

      console.log('DB 테스트 결과:', { data, error, count });

      if (error) {
        dbStatus = '❌ 실패';
        dbDetails = `DB 에러: ${error.message}<br>코드: ${error.code || 'unknown'}`;
        console.error('DB 테스트 에러:', error);
      } else {
        dbStatus = '✅ 정상 작동 중';
        dbDetails = 'consultations 테이블 연결 성공';
        recordCount = count || 0;
      }
    } catch (err) {
      dbStatus = '❌ 실패';
      dbDetails = `연결 에러: ${err.message}`;
      console.error('DB 연결 에러:', err);
    }
  } else {
    dbDetails = '환경변수 누락으로 테스트 불가';
  }

  const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DIMJ 프록시 서버 상태</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
            font-size: 24px;
        }
        .status-card {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
            margin: 15px 0;
        }
        .status-title {
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 10px;
            color: #495057;
        }
        .status-ok {
            border-left: 4px solid #28a745;
        }
        .status-error {
            border-left: 4px solid #dc3545;
        }
        .details {
            font-size: 14px;
            color: #6c757d;
            margin-top: 8px;
        }
        .api-info {
            background: #e3f2fd;
            border: 1px solid #bbdefb;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
        }
        .test-button {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            margin: 10px 5px;
        }
        .test-button:hover {
            background: #0056b3;
        }
        code {
            background: #f1f3f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        .timestamp {
            text-align: center;
            color: #6c757d;
            font-size: 12px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 DIMJ 프록시 서버 상태</h1>

        <div class="status-card ${envStatus.includes('✅') ? 'status-ok' : 'status-error'}">
            <div class="status-title">환경변수 상태: ${envStatus}</div>
            <div class="details">
                ${envStatus.includes('✅') ?
                  'SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 정상 설정됨' :
                  envDetails
                }
            </div>
        </div>

        <div class="status-card ${dbStatus.includes('✅') ? 'status-ok' : 'status-error'}">
            <div class="status-title">데이터베이스 연결: ${dbStatus}</div>
            <div class="details">
                ${dbDetails}
                ${dbStatus.includes('✅') ? `<br>총 상담 레코드: ${recordCount}개` : ''}
            </div>
        </div>

        <div class="api-info">
            <div class="status-title">📡 API 엔드포인트</div>
            <div style="margin: 10px 0;">
                <strong>GET:</strong> <code>https://dimj-form-proxy.vercel.app/api/supabase</code><br>
                <small>상담 목록 조회</small>
            </div>
            <div style="margin: 10px 0;">
                <strong>POST:</strong> <code>https://dimj-form-proxy.vercel.app/api/supabase</code><br>
                <small>새 상담 등록</small>
            </div>

            <button class="test-button" onclick="testGet()">GET 테스트</button>
            <button class="test-button" onclick="testPost()">POST 테스트</button>
        </div>

        <div class="timestamp">
            마지막 확인: ${new Date().toLocaleString('ko-KR')}
        </div>
    </div>

    <script>
        async function testGet() {
            try {
                const response = await fetch('/api/supabase');
                const data = await response.json();
                alert('GET 테스트 결과:\\n' + JSON.stringify(data, null, 2));
            } catch (err) {
                alert('GET 테스트 실패:\\n' + err.message);
            }
        }

        async function testPost() {
            const testData = {
                이름: '테스트',
                연락처: '010-1234-5678',
                통신사: 'SKT',
                주요서비스: '인터넷',
                기타서비스: '',
                상담희망시간: '오후',
                개인정보동의: true,
                IP주소: 'test'
            };

            try {
                const response = await fetch('/api/supabase', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(testData)
                });
                const data = await response.json();
                alert('POST 테스트 결과:\\n' + JSON.stringify(data, null, 2));
            } catch (err) {
                alert('POST 테스트 실패:\\n' + err.message);
            }
        }

        // 5분마다 자동 새로고침
        setTimeout(() => {
            location.reload();
        }, 5 * 60 * 1000);
    </script>
</body>
</html>`;

  res.status(200).send(html);
};