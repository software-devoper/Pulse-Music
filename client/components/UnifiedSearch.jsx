import { Check, Download, Music2, Pause, Play, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import useDebounce from '../hooks/useDebounce';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { getPopularTracks, searchTracks } from '../services/jamendo';
import { saveTrackForOffline } from '../services/offlineDownloads';
import { searchYouTubeVideos } from '../services/youtube';

function mixResults(youtubeItems, jamendoItems) {
  const ytMapped = (youtubeItems || []).map((item) => ({
    id: `yt-${item.videoId}`,
    source: 'youtube',
    name: item.title,
    artist_name: item.channelTitle,
    image: item.thumbnail,
    videoId: item.videoId,
    duration: 0,
  }));

  const jamendoMapped = (jamendoItems || []).map((track) => ({
    id: `jm-${track.id}`,
    source: 'jamendo',
    name: track.name,
    artist_name: track.artist_name,
    image: track.image,
    audio: track.audio,
    duration: track.duration,
    rawId: track.id,
  }));

  const mixed = [];
  const maxLen = Math.max(ytMapped.length, jamendoMapped.length);
  for (let i = 0; i < maxLen; i += 1) {
    if (jamendoMapped[i]) mixed.push(jamendoMapped[i]);
    if (ytMapped[i]) mixed.push(ytMapped[i]);
  }
  return mixed;
}

export default function UnifiedSearch() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  const [results, setResults] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [downloadingId, setDownloadingId] = useState('');
  const { user } = useAuth();
  const { playTrack, currentTrack, isPlaying, setIsPlaying } = usePlayer();

  useEffect(() => {
    const loadPopular = async () => {
      try {
        const [yt, jamendoPopular] = await Promise.all([
          searchYouTubeVideos('today top music songs'),
          getPopularTracks(),
        ]);
        setPopular(mixResults(yt, jamendoPopular).slice(0, 16));
      } catch {
        setPopular([]);
      }
    };

    loadPopular();
  }, []);

  useEffect(() => {
    if (!debouncedQuery?.trim()) {
      setResults([]);
      setError('');
      return;
    }

    const loadResults = async () => {
      setLoading(true);
      setError('');
      try {
        const [yt, jm] = await Promise.all([searchYouTubeVideos(debouncedQuery), searchTracks(debouncedQuery)]);
        setResults(mixResults(yt, jm));
      } catch (err) {
        setError(err.message || 'Search failed');
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [debouncedQuery]);

  const activeList = useMemo(() => (debouncedQuery?.trim() ? results : popular), [debouncedQuery, popular, results]);

  const togglePlay = (item) => {
    const sameTrack = String(currentTrack?.id) === String(item.id);
    if (sameTrack) {
      setIsPlaying((v) => !v);
      return;
    }
    playTrack(item, activeList);
  };

  const downloadJamendoTrack = async (track) => {
    if (!user || !track.audio) return;
    setDownloadingId(track.id);
    setNotice('');
    try {
      await saveTrackForOffline({
        id: track.rawId || track.id,
        name: track.name,
        artist_name: track.artist_name,
        image: track.image,
        duration: track.duration,
        audio: track.audio,
      });
      setNotice(`Saved ${track.name}`);
      setTimeout(() => setNotice(''), 1800);
    } catch (err) {
      setError(err.message || 'Download failed');
    } finally {
      setDownloadingId('');
    }
  };

  return (
    <div>
      <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
        <div className="flex items-center gap-2 text-gray-300">
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs, artists..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
          />
        </div>
      </div>

      {error ? <p className="mb-4 text-sm text-rose-300">{error}</p> : null}
      {notice ? <p className="mb-4 text-sm text-emerald-300">{notice}</p> : null}

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
          <Music2 size={18} className="text-rose-300" />
          {debouncedQuery?.trim() ? 'Search Results' : "Today's Popular Songs"}
        </h2>
        {loading ? <p className="mb-4 text-sm text-gray-300">Searching...</p> : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {activeList.map((item) => {
            const active = String(currentTrack?.id) === String(item.id);
            const paused = active && !isPlaying;
            return (
              <article key={item.id} className="group rounded-2xl border border-white/10 bg-card/95 p-3">
                <button onClick={() => togglePlay(item)} className="relative block w-full overflow-hidden rounded-xl">
                  <img
                    src={item.image || 'https://placehold.co/600x600/171925/f3f4f6?text=Track'}
                    alt={item.name}
                    className="h-36 w-full object-cover"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition group-hover:opacity-100">
                    <span className="rounded-full bg-rose-500 p-2 text-white">
                      {active && isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
                    </span>
                  </span>
                </button>

                <div className="mt-3">
                  <p className="truncate text-sm font-semibold text-gray-100">{item.name}</p>
                  <p className="truncate text-xs text-gray-400">{item.artist_name}</p>
                </div>

                <div className="mt-3 flex items-center justify-end">
                  <div className="flex items-center gap-2">
                    {item.source === 'jamendo' ? (
                      <button
                        onClick={() => downloadJamendoTrack(item)}
                        disabled={!user || downloadingId === item.id}
                        className="rounded-md border border-white/20 p-1.5 text-gray-200 hover:bg-white/10 disabled:opacity-40"
                        title={user ? 'Save offline' : 'Login required'}
                      >
                        {downloadingId === item.id ? <Check size={14} /> : <Download size={14} />}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="rounded-md border border-white/20 p-1.5 text-gray-500"
                        title="YouTube download unavailable"
                      >
                        <Download size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => togglePlay(item)}
                      className="rounded-md border border-white/20 p-1.5 text-gray-200 hover:bg-white/10"
                      title={paused ? 'Resume' : active && isPlaying ? 'Pause' : 'Play'}
                    >
                      {active && isPlaying ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
          {!loading && activeList.length === 0 ? <p className="text-sm text-gray-400">No results found.</p> : null}
        </div>
      </section>
    </div>
  );
}
