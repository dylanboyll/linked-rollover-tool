const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const METABASE_BASE = 'https://fieldguide.metabaseapp.com';

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Proxy: Metabase login
app.post('/api/mb/session', async (req, res) => {
  try {
    const r = await fetch(`${METABASE_BASE}/api/session`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(req.body)
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(500).json({message: err.message});
  }
});

// Proxy: Metabase SQL queries
app.post('/api/mb/dataset', async (req, res) => {
  const session = req.headers['x-metabase-session'];
  if (!session) return res.status(401).json({message: 'No session token provided.'});
  try {
    const r = await fetch(`${METABASE_BASE}/api/dataset`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'X-Metabase-Session': session},
      body: JSON.stringify(req.body)
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(500).json({message: err.message});
  }
});

app.listen(PORT, () => console.log(`Linked Rollover Tool running on port ${PORT}`));
