import { Pause, Play } from 'lucide-react';

export default function AlbumCard({ item, onPlay, active, isPlaying }) {
  return (
    <article className="group min-w-[190px] animate-fadeInUp rounded-2xl bg-card/80 p-3 transition hover:bg-card">
      <div className="relative overflow-hidden rounded-xl">
        <img
          src={item.image || item.album_image || 'https://placehold.co/600x600/171925/f3f4f6?text=Album'}
          alt={item.name}
          className="h-44 w-full object-cover"
        />
        <button
          onClick={() => onPlay(item)}
          className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition group-hover:opacity-100"
        >
          <span className="rounded-full bg-rose-500 p-3 text-white">
            {active && isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
          </span>
        </button>
      </div>
      <div className="mt-3">
        <h3 className="truncate text-sm font-semibold text-gray-100">{item.name}</h3>
        <p className="truncate text-xs text-gray-400">{item.artist_name || item.shortname || item.album_name}</p>
      </div>
    </article>
  );
}
