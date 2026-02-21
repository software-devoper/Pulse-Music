import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { createPlaylist, fetchPlaylists, removeTrackFromPlaylist } from '../services/playlists';
import api from '../services/api';

export default function LibraryPage() {
  const { session } = useAuth();
  const { playTrack } = usePlayer();
  const [name, setName] = useState('');
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPlaylists = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const data = await fetchPlaylists(session.access_token);
      setPlaylists(data || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Could not load playlists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylists();
  }, [session?.access_token]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim() || !session?.access_token) return;

    try {
      await createPlaylist(session.access_token, name.trim());
      setName('');
      await loadPlaylists();
    } catch (err) {
      setError(err.message || 'Could not create playlist');
    }
  };

  const handleRemoveTrack = async (playlistId, trackId) => {
    try {
      await removeTrackFromPlaylist(session.access_token, playlistId, trackId);
      await loadPlaylists();
    } catch (err) {
      setError(err.message || 'Could not remove track');
    }
  };

  const loadTrack = async (trackId) => {
    try {
      const { data } = await api.get('/jamendo/track', { params: { id: trackId } });
      if (data?.result) playTrack(data.result);
    } catch (err) {
      setError(err.message || 'Could not play track');
    }
  };

  return (
    <AppLayout
      title="Your Library"
      subtitle="Create playlists and manage your saved tracks"
      actions={
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New playlist name"
            className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-rose-400"
          />
          <button type="submit" className="rounded-xl bg-rose-500 px-3 py-2 text-sm text-white hover:bg-rose-400">
            Create
          </button>
        </form>
      }
    >
      {error ? <p className="mb-4 text-sm text-rose-300">{error}</p> : null}
      {loading ? <Loader label="Loading playlists..." /> : null}

      {!loading ? (
        <div className="space-y-4">
          {playlists.map((playlist) => (
            <section key={playlist.id} className="rounded-2xl border border-white/10 bg-card/70 p-4">
              <h2 className="text-lg font-semibold text-white">{playlist.name}</h2>
              <p className="mb-3 text-xs text-gray-400">{playlist.playlist_tracks?.length || 0} tracks</p>

              <div className="space-y-2">
                {(playlist.playlist_tracks || []).map((entry) => (
                  <article
                    key={entry.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm text-gray-200">{entry.track_name}</p>
                      <p className="text-xs text-gray-400">{entry.artist_name}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadTrack(entry.track_id)}
                        className="rounded-md border border-white/20 px-2 py-1 text-xs text-gray-200 hover:bg-white/10"
                      >
                        Play
                      </button>
                      <button
                        onClick={() => handleRemoveTrack(playlist.id, entry.track_id)}
                        className="rounded-md border border-rose-300/30 px-2 py-1 text-xs text-rose-200 hover:bg-rose-500/20"
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
                {(!playlist.playlist_tracks || playlist.playlist_tracks.length === 0) && (
                  <p className="text-sm text-gray-400">No tracks yet. Add tracks from Search or Browse.</p>
                )}
              </div>
            </section>
          ))}

          {playlists.length === 0 ? <p className="text-sm text-gray-400">No playlists found.</p> : null}
        </div>
      ) : null}
    </AppLayout>
  );
}
