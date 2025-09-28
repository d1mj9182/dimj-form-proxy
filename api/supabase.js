const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
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
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .order('접수일시', { ascending: false });

      if (error) throw error;
      return res.status(200).json({ success: true, data });
    }

    if (req.method === 'POST') {
      const { data, error } = await supabase
        .from('consultations')
        .insert([req.body])
        .select();

      if (error) throw error;
      return res.status(200).json({ success: true, data });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Supabase 에러:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};