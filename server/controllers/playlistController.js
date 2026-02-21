import { supabaseAdmin } from '../lib/supabaseAdmin.js';

export async function getPlaylists(req, res) {
  try {
    const { data, error } = await supabaseAdmin
      .from('playlists')
      .select('id, name, created_at, playlist_tracks(id, track_id, track_name, artist_name, track_image, audio_url, duration)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ results: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch playlists' });
  }
}

export async function createPlaylist(req, res) {
  try {
    const name = req.body.name?.trim();
    if (!name) return res.status(400).json({ error: 'Playlist name is required' });

    const { data, error } = await supabaseAdmin
      .from('playlists')
      .insert({ user_id: req.user.id, name })
      .select('id, name, created_at')
      .single();

    if (error) throw error;
    res.status(201).json({ result: data });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to create playlist' });
  }
}

export async function addTrack(req, res) {
  try {
    const playlistId = req.params.playlistId;
    const track = req.body.track;
    if (!track?.id) return res.status(400).json({ error: 'Valid track payload required' });

    const { data: playlist, error: playlistError } = await supabaseAdmin
      .from('playlists')
      .select('id')
      .eq('id', playlistId)
      .eq('user_id', req.user.id)
      .single();

    if (playlistError || !playlist) return res.status(404).json({ error: 'Playlist not found' });

    const payload = {
      playlist_id: playlistId,
      track_id: String(track.id),
      track_name: track.name,
      artist_name: track.artist_name,
      track_image: track.image || track.album_image || null,
      audio_url: track.audio || null,
      duration: Number(track.duration) || 0,
    };

    const { data, error } = await supabaseAdmin
      .from('playlist_tracks')
      .upsert(payload, { onConflict: 'playlist_id,track_id' })
      .select('*')
      .single();

    if (error) throw error;
    res.status(201).json({ result: data });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to add track' });
  }
}

export async function removeTrack(req, res) {
  try {
    const { playlistId, trackId } = req.params;

    const { data: playlist, error: playlistError } = await supabaseAdmin
      .from('playlists')
      .select('id')
      .eq('id', playlistId)
      .eq('user_id', req.user.id)
      .single();

    if (playlistError || !playlist) return res.status(404).json({ error: 'Playlist not found' });

    const { error } = await supabaseAdmin
      .from('playlist_tracks')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('track_id', trackId);

    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to remove track' });
  }
}
