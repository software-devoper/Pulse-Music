import axios from 'axios';

const JAMENDO_BASE_URL = 'https://api.jamendo.com/v3.0';

function jamendoRequest(endpoint, params = {}) {
  const clientId = process.env.JAMENDO_CLIENT_ID;
  if (!clientId) throw new Error('Missing JAMENDO_CLIENT_ID');

  return axios.get(`${JAMENDO_BASE_URL}${endpoint}`, {
    params: {
      client_id: clientId,
      format: 'json',
      ...params,
    },
    timeout: 15000,
  });
}

export async function searchTracks(req, res) {
  try {
    const q = req.query.q?.trim();
    if (!q) return res.status(400).json({ error: 'Missing search query' });

    const { data } = await jamendoRequest('/tracks', {
      namesearch: q,
      limit: 30,
      include: 'musicinfo',
      audioformat: 'mp31',
      order: 'popularity_total',
    });

    const results = (data.results || []).map((track) => ({
      id: track.id,
      name: track.name,
      artist_name: track.artist_name,
      audio: track.audio,
      image: track.image || track.album_image || null,
      duration: track.duration,
    }));

    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.headers?.error_message || err.message });
  }
}

export async function popularTracks(req, res) {
  try {
    const { data } = await jamendoRequest('/tracks', {
      limit: 20,
      include: 'musicinfo',
      audioformat: 'mp31',
      order: 'popularity_total',
    });

    res.json({ results: data.results || [] });
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.headers?.error_message || err.message });
  }
}

export async function bestArtists(req, res) {
  try {
    const { data } = await jamendoRequest('/artists', {
      limit: 15,
      order: 'popularity_total',
      imagesize: 600,
    });

    res.json({ results: data.results || [] });
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.headers?.error_message || err.message });
  }
}

export async function getTrackById(req, res) {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: 'Missing track id' });

    const { data } = await jamendoRequest('/tracks', {
      id,
      include: 'musicinfo',
      audioformat: 'mp31',
      limit: 1,
    });

    res.json({ result: data.results?.[0] || null });
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.headers?.error_message || err.message });
  }
}

export async function proxyDownload(req, res) {
  try {
    const audioUrl = req.query.audioUrl;
    if (!audioUrl) return res.status(400).json({ error: 'Missing audio URL' });

    const parsed = new URL(audioUrl);
    const host = parsed.hostname.toLowerCase();
    if (!host.includes('jamendo.com') && !host.includes('jamen.do')) {
      return res.status(400).json({ error: 'Invalid download source' });
    }

    const response = await axios.get(audioUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
      maxRedirects: 5,
    });

    const contentType = response.headers['content-type'] || 'audio/mpeg';
    const contentLength = response.headers['content-length'];

    res.setHeader('Content-Type', contentType);
    if (contentLength) res.setHeader('Content-Length', contentLength);
    res.send(Buffer.from(response.data));
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to download track' });
  }
}
