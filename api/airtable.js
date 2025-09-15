export default async function handler(req, res) {
  const allowedOrigins = [
    'https://dimj-form.vercel.app',
    'https://dimj9182.github.io',
    'http://localhost:3000',
    'http://127.0.0.1:5500'
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { baseId, tableId, records } = req.body;

    if (!baseId || !tableId || !records) {
      res.status(400).json({ error: 'Missing required fields: baseId, tableId, records' });
      return;
    }

    const airtableApiKey = process.env.AIRTABLE_API_KEY;
    if (!airtableApiKey) {
      res.status(500).json({ error: 'Airtable API key not configured' });
      return;
    }

    const airtableUrl = `https://api.airtable.com/v0/${baseId}/${tableId}`;

    const response = await fetch(airtableUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${airtableApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ records })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Airtable API error:', data);
      res.status(response.status).json({
        error: 'Airtable API error',
        details: data
      });
      return;
    }

    res.status(200).json(data);

  } catch (error) {
    console.error('Proxy server error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}