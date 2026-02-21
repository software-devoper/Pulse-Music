import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import jamendoRoutes from './routes/jamendoRoutes.js';
import playlistRoutes from './routes/playlistRoutes.js';
import youtubeRoutes from './routes/youtubeRoutes.js';

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(',') || ['http://localhost:5173'],
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/jamendo', jamendoRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/playlists', playlistRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

export default app;
