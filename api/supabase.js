const { createClient } = require('@supabase/supabase-js');

function createSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('환경변수가 설정되지 않았습니다');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const supabase = createSupabaseClient();

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.status(200).json({ success: true, records: data });
    }

    if (req.method === 'POST') {
      const { data, error } = await supabase
        .from('consultations')
        .insert([req.body])
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({ success: true, record: data });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};