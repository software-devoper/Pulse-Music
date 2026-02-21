import api from './api';

export const getPopularTracks = async () => {
  const { data } = await api.get('/jamendo/popular');
  return data.results;
};

export const getBestArtists = async () => {
  const { data } = await api.get('/jamendo/artists-best');
  return data.results;
};

export const searchTracks = async (query) => {
  const { data } = await api.get('/jamendo/search', { params: { q: query } });
  return data.results;
};
