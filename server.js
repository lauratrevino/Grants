const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Proxy endpoint — keeps API key hidden on the server
app.post('/api/claude', async (req, res) => {
  const key = process.env.ANTHROPIC_KEY;

  if (!key) {
    return res.status(500).json({
      error: { message: 'ANTHROPIC_KEY environment variable is not set on the server.' }
    });
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
    res.status(500).json({ error: { message: err.message } });
  }
});

// All other routes serve the app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`I Am Redemption Grant Platform running on port ${PORT}`);
});
