import { Play, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import Loader from '../components/Loader';
import { usePlayer } from '../context/PlayerContext';
import { getOfflineDownloads, removeOfflineDownload } from '../services/offlineDownloads';

export default function DownloadsPage() {
  const { playTrack } = usePlayer();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDownloads = async () => {
    setLoading(true);
    setError('');
    try {
      const results = await getOfflineDownloads();
      setItems(results);
    } catch (err) {
      setError(err.message || 'Failed to load downloads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDownloads();
  }, []);

  const playOffline = (entry) => {
    const blobUrl = URL.createObjectURL(entry.audioBlob);
    playTrack({
      id: `offline-${entry.trackId}`,
      source: 'offline',
      name: entry.name,
      artist_name: entry.artist_name,
      image: entry.image,
      audio: blobUrl,
      duration: entry.duration,
    });
  };

  const removeItem = async (id) => {
    try {
      await removeOfflineDownload(id);
      await loadDownloads();
    } catch (err) {
      setError(err.message || 'Failed to remove download');
    }
  };

  return (
    <AppLayout title="Downloads" subtitle="Offline-ready tracks available anytime">
      {error ? <p className="mb-4 text-sm text-rose-300">{error}</p> : null}
      {loading ? <Loader label="Loading downloaded tracks..." /> : null}

      {!loading ? (
        <div className="space-y-3">
          {items.map((entry) => (
            <article key={entry.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-card/80 p-3">
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src={entry.image || 'https://placehold.co/100x100/171925/f3f4f6?text=Track'}
                  alt={entry.name}
                  className="h-12 w-12 rounded-lg object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{entry.name}</p>
                  <p className="truncate text-xs text-gray-400">{entry.artist_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => playOffline(entry)}
                  className="rounded-md border border-white/20 p-2 text-gray-200 hover:bg-white/10"
                  title="Play"
                >
                  <Play size={14} />
                </button>
                <button
                  onClick={() => removeItem(entry.id)}
                  className="rounded-md border border-rose-300/30 p-2 text-rose-200 hover:bg-rose-500/20"
                  title="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </article>
          ))}
          {items.length === 0 ? <p className="text-sm text-gray-400">No downloaded songs yet.</p> : null}
        </div>
      ) : null}
    </AppLayout>
  );
}
