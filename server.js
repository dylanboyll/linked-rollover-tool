const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const METABASE_BASE = 'https://fieldguide.metabaseapp.com';

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Serve the tool at both / and /linked_rollover_tool
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'linked_rollover_tool.html'), err => {
    if (err) res.status(500).send('File not found. __dirname=' + __dirname + ' err=' + err.message);
  });
});
app.get('/linked_rollover_tool', (req, res) => {
  res.sendFile(path.join(__dirname, 'linked_rollover_tool.html'), err => {
    if (err) res.status(500).send('File not found. __dirname=' + __dirname + ' err=' + err.message);
  });
});

// Proxy: Metabase login
app.post('/api/mb/session', async (req, res) => {
  try {
    const r = await fetch(`${METABASE_BASE}/api/session`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(req.body)
    });
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch(e) { data = {message: text}; }
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
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch(e) { data = {message: text}; }
    res.status(r.status).json(data);
  } catch (err) {
    res.status(500).json({message: err.message});
  }
});

app.listen(PORT, () => console.log(`Linked Rollover Tool running on port ${PORT}`));
