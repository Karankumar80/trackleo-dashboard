import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import mqtt from 'mqtt';
import { WebSocketServer } from 'ws';

const app = express();
app.use(cors());

const AIO_USER = process.env.AIO_USER;
const AIO_KEY  = process.env.AIO_KEY;
const FEEDS    = (process.env.FEEDS || '').split(',').map(s => s.trim()).filter(Boolean);
const PORT     = process.env.PORT || 3000;

if (!AIO_USER || !AIO_KEY) {
  console.error('Missing AIO_USER or AIO_KEY in .env');
  process.exit(1);
}

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws/aio' });

// Basic health/info route so visiting http://localhost:3000 shows something useful
app.get('/', (req, res) => {
  res.type('text/plain').send(
    [
      'AIO bridge is running.',
      'REST:  GET /api/aio/feed/:feedKey/latest',
      'REST:  GET /api/aio/feed/:feedKey/history?limit=100',
      'WS:    ws://localhost:' + (PORT || 3000) + '/ws/aio',
    ].join('\n')
  );
});

// Broadcast helper
function broadcast(obj) {
  const msg = JSON.stringify(obj);
  wss.clients.forEach(ws => {
    if (ws.readyState === 1) ws.send(msg);
  });
}

// MQTT client → subscribe and forward to WS
const client = mqtt.connect('mqtts://io.adafruit.com', {
  username: AIO_USER,
  password: AIO_KEY,
});

client.on('connect', () => {
  if (FEEDS.length === 0) {
    console.warn('No FEEDS configured; nothing will stream.');
  }
  FEEDS.forEach(key => {
    client.subscribe(`${AIO_USER}/feeds/${key}`);
  });
  console.log('MQTT connected, subscribed to:', FEEDS.join(', '));
});

client.on('message', (topic, payload) => {
  try {
    const parts = topic.split('/');
    const feed = parts[parts.length - 1];
    broadcast({ feed, value: payload.toString(), created_at: new Date().toISOString() });
  } catch (e) {
    console.error('WS broadcast error:', e.message);
  }
});

// REST proxy (fallback + history)
app.get('/api/aio/feed/:feedKey/latest', async (req, res) => {
  try {
    const url = `https://io.adafruit.com/api/v2/${AIO_USER}/feeds/${req.params.feedKey}/data?limit=1`;
    const r = await fetch(url, { headers: { 'X-AIO-Key': AIO_KEY } });
    const body = await r.json();
    if (r.status === 404) {
      return res.status(404).json({
        error: 'feed_not_found',
        message: `Feed "${req.params.feedKey}" was not found for user "${AIO_USER}". Verify the exact feed key (case-sensitive) in Adafruit IO.`,
        aio_response: body,
      });
    }
    res.status(r.status).json(body);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/aio/feed/:feedKey/history', async (req, res) => {
  try {
    const limit = Number(req.query.limit || 100);
    const url = `https://io.adafruit.com/api/v2/${AIO_USER}/feeds/${req.params.feedKey}/data?limit=${limit}`;
    const r = await fetch(url, { headers: { 'X-AIO-Key': AIO_KEY } });
    const body = await r.json();
    res.status(r.status).json(body);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// List feeds helper (to discover exact keys)
app.get('/api/aio/feeds', async (_req, res) => {
  try {
    const url = `https://io.adafruit.com/api/v2/${AIO_USER}/feeds`;
    const r = await fetch(url, { headers: { 'X-AIO-Key': AIO_KEY } });
    const body = await r.json();
    // Return a simplified list with key and name
    if (Array.isArray(body)) {
      return res.json(body.map(f => ({ key: f.key, name: f.name, group: f.group ? f.group.key : null })));
    }
    res.status(r.status).json(body);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

server.listen(PORT, () => {
  console.log(`Server ready on http://localhost:${PORT}`);
  console.log(`WS endpoint: ws://localhost:${PORT}/ws/aio`);
});
