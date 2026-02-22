import axios from 'axios';

const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const CACHE_TTL_MS = 10 * 60 * 1000;
const searchCache = new Map();

function getCacheKey(query) {
  return query.trim().toLowerCase();
}

export async function searchYouTube(req, res) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Missing YOUTUBE_API_KEY' });

    const q = req.query.q?.trim();
    if (!q) return res.status(400).json({ error: 'Missing search query' });
    const cacheKey = getCacheKey(q);
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return res.json({ results: cached.results, cached: true });
    }

    const { data } = await axios.get(YOUTUBE_SEARCH_URL, {
      params: {
        key: apiKey,
        part: 'snippet',
        q,
        type: 'video',
        maxResults: 5,
      },
      timeout: 15000,
    });

    const results = (data.items || []).map((item) => ({
      videoId: item.id?.videoId,
      title: item.snippet?.title || 'Untitled',
      thumbnail:
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.default?.url ||
        null,
      channelTitle: item.snippet?.channelTitle || 'Unknown channel',
    }));

    searchCache.set(cacheKey, { results, timestamp: Date.now() });
    res.json({ results, cached: false });
  } catch (err) {
    const status = Number(err.response?.status) || 500;
    const reason = err.response?.data?.error?.errors?.[0]?.reason || '';
    const rawMessage = err.response?.data?.error?.message || err.message || 'YouTube search failed';

    if (reason === 'quotaExceeded' || /quota/i.test(rawMessage)) {
      return res.status(429).json({
        error: 'YouTube is temporarily unavailable due to daily API limit. Showing available music sources.',
        code: 'YOUTUBE_QUOTA_EXCEEDED',
      });
    }

    res.status(status).json({ error: 'YouTube search is temporarily unavailable.', code: 'YOUTUBE_API_ERROR' });
  }
}
