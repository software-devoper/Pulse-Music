import api from './api';

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const fetchPlaylists = async (token) => {
  const { data } = await api.get('/playlists', authHeader(token));
  return data.results;
};

export const createPlaylist = async (token, name) => {
  const { data } = await api.post('/playlists', { name }, authHeader(token));
  return data.result;
};

export const addTrackToPlaylist = async (token, playlistId, track) => {
  const { data } = await api.post(`/playlists/${playlistId}/tracks`, { track }, authHeader(token));
  return data.result;
};

export const removeTrackFromPlaylist = async (token, playlistId, trackId) => {
  await api.delete(`/playlists/${playlistId}/tracks/${trackId}`, authHeader(token));
};
