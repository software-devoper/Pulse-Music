import { useEffect, useMemo, useState } from 'react';
import AlbumCard from '../components/AlbumCard';
import AppLayout from '../components/AppLayout';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { getBestArtists, getPopularTracks } from '../services/jamendo';
import { addTrackToPlaylist, fetchPlaylists } from '../services/playlists';

export default function DashboardPage() {
  const { session } = useAuth();
  const { playTrack, currentTrack, isPlaying, isBuffering, setIsPlaying } = usePlayer();
  const [popular, setPopular] = useState([]);
  const [artists, setArtists] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [popularTracks, bestArtists, userPlaylists] = await Promise.all([
          getPopularTracks(),
          getBestArtists(),
          session?.access_token ? fetchPlaylists(session.access_token) : Promise.resolve([]),
        ]);
        setPopular(popularTracks || []);
        setArtists(bestArtists || []);
        setPlaylists(userPlaylists || []);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [session?.access_token]);

  const playlistHint = useMemo(
    () => playlists.map((p) => `${p.id}: ${p.name}`).join(' | '),
    [playlists]
  );

  const handleAddToPlaylist = async (track) => {
    if (!session?.access_token) return;
    if (playlists.length === 0) {
      alert('Create a playlist in Your Library first.');
      return;
    }
    const choice = window.prompt(`Select playlist id:\n${playlistHint}`);
    if (!choice) return;
    const exists = playlists.find((p) => String(p.id) === String(choice));
    if (!exists) return alert('Invalid playlist id');

    try {
      await addTrackToPlaylist(session.access_token, choice, track);
      alert('Track added to playlist.');
    } catch (err) {
      alert(err.message || 'Could not add track.');
    }
  };

  const togglePlayFromBrowse = (track) => {
    const sameTrack = String(currentTrack?.id) === String(track.id);
    if (sameTrack) {
      setIsPlaying((v) => !v);
      return;
    }
    playTrack(track, popular);
  };

  if (loading) {
    return (
      <AppLayout title="Browse" subtitle="Your music dashboard">
        <Loader label="Loading music dashboard..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Browse" subtitle="Popular albums and best of artists curated for you">
      {error ? <p className="mb-4 text-sm text-rose-300">{error}</p> : null}

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-white">Popular Albums</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {popular.map((track) => (
            <AlbumCard
              key={track.id}
              item={track}
              onPlay={() => togglePlayFromBrowse(track)}
              active={String(currentTrack?.id) === String(track.id)}
              isPlaying={isPlaying}
              isBuffering={isBuffering}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">Best of Artists</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {artists.map((artist) => (
            <AlbumCard
              key={artist.id}
              item={artist}
              onPlay={() => {
                const match = popular.find((t) => t.artist_name === artist.name || t.artist_name === artist.shortname);
                if (match) togglePlayFromBrowse(match);
              }}
              active={false}
              isPlaying={false}
              isBuffering={false}
            />
          ))}
        </div>
      </section>

      {popular.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-white">Quick add to playlist</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {popular.slice(0, 6).map((t) => (
              <button
                key={`quick-${t.id}`}
                onClick={() => handleAddToPlaylist(t)}
                className="truncate rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-left text-sm text-gray-200 hover:bg-white/10"
              >
                {t.name} - {t.artist_name}
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </AppLayout>
  );
}
