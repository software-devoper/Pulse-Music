import { Download, Pause, Play } from 'lucide-react';

const formatDuration = (seconds) => {
  const mins = Math.floor(Number(seconds || 0) / 60);
  const secs = Math.floor(Number(seconds || 0) % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
};

export default function TrackCard({ track, onPlay, isActive, isPlaying, onDownload, canDownload, onAddToPlaylist }) {
  return (
    <article className="group rounded-2xl bg-card/95 p-4 shadow-glow transition hover:-translate-y-0.5">
      <div className="relative overflow-hidden rounded-xl">
        <img
          src={track.image || track.album_image || 'https://placehold.co/600x600/171925/f3f4f6?text=Track'}
          alt={track.name}
          className="h-40 w-full object-cover"
          loading="lazy"
        />
        <button
          onClick={() => onPlay(track)}
          className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition group-hover:opacity-100"
        >
          <span className="rounded-full bg-rose-500 p-3 text-white">
            {isActive && isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
          </span>
        </button>
      </div>

      <div className="mt-3">
        <h3 className="truncate text-sm font-semibold text-gray-100">{track.name}</h3>
        <p className="truncate text-xs text-gray-400">{track.artist_name || 'Unknown artist'}</p>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
        <span>{formatDuration(track.duration)}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAddToPlaylist(track)}
            className="rounded-md border border-white/15 px-2 py-1 text-[11px] hover:bg-white/10"
          >
            + Playlist
          </button>
          <button
            disabled={!canDownload}
            onClick={() => onDownload(track)}
            className="rounded-md border border-white/15 p-1.5 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45"
            title={canDownload ? 'Download track' : 'Log in to download'}
          >
            <Download size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}
