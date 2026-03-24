const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

// Log exactly where the server is running from
const indexPath = path.join(__dirname, 'index.html');
console.log('Server directory:', __dirname);
console.log('index.html path:', indexPath);
console.log('index.html exists:', fs.existsSync(indexPath));
console.log('Files in directory:', fs.readdirSync(__dirname).join(', '));

// Serve static files from same directory as server.js
app.use(express.static(__dirname));

// Proxy endpoint — API key stays on server, never exposed in browser
app.post('/api/claude', async (req, res) => {
  const key = process.env.ANTHROPIC_KEY;
  if (!key) {
    return res.status(500).json({ error: { message: 'ANTHROPIC_KEY not set in environment variables.' } });
  }
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(500).json({ error: { message: err.message } });
  }
});

// Root route — explicitly send index.html
app.get('/', (req, res) => {
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('index.html not found. Files present: ' + fs.readdirSync(__dirname).join(', '));
  }
});

// Catch-all
app.get('*', (req, res) => {
  res.sendFile(indexPath);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`I Am Redemption Grant Platform running on port ${PORT}`);
});
