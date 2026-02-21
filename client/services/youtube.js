import api from './api';

export const searchYouTubeVideos = async (query) => {
  const { data } = await api.get('/youtube/search', { params: { q: query } });
  return data.results;
};
