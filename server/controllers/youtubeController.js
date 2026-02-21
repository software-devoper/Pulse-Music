import axios from 'axios';

const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

export async function searchYouTube(req, res) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Missing YOUTUBE_API_KEY' });

    const q = req.query.q?.trim();
    if (!q) return res.status(400).json({ error: 'Missing search query' });

    const { data } = await axios.get(YOUTUBE_SEARCH_URL, {
      params: {
        key: apiKey,
        part: 'snippet',
        q,
        type: 'video',
        maxResults: 12,
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

    res.json({ results });
  } catch (err) {
    const fallback = err.response?.data?.error?.message || err.message || 'YouTube search failed';
    res.status(500).json({ error: fallback });
  }
}
