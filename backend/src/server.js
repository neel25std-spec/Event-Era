import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import eventRoutes from './routes/eventRoutes.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

// ── Middleware ────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  FRONTEND_ORIGIN
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Serve uploaded files (profile pictures, etc.)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ── Health check ─────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/comments', commentRoutes);

// Geocoding Proxy Route (nominatim)
app.get('/api/geocode', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query parameter q is required' });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`,
      {
        headers: {
          'User-Agent': 'EventEra/1.0 (contact@eventera.dev)'
        }
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Geocoding proxy error:', err);
    res.status(500).json({ error: 'Failed to fetch coordinates' });
  }
});

// Reverse Geocoding Proxy Route (nominatim)
app.get('/api/reverse-geocode', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'Parameters lat and lng are required' });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      {
        headers: {
          'User-Agent': 'EventEra/1.0 (contact@eventera.dev)'
        }
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Reverse geocoding proxy error:', err);
    res.status(500).json({ error: 'Failed to fetch address' });
  }
});

// ── 404 fallback ─────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Start ────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  EventEra API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Events: http://localhost:${PORT}/api/events\n`);
});
