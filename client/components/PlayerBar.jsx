import { useEffect, useRef, useState } from 'react';
import { Download, Loader2, Pause, Play, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { saveTrackForOffline } from '../services/offlineDownloads';

const formatDuration = (seconds) => {
  const mins = Math.floor((seconds || 0) / 60);
  const secs = Math.floor((seconds || 0) % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
};

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);

  return new Promise((resolve) => {
    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (!existingScript) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }

    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previous === 'function') previous();
      resolve(window.YT);
    };

    const checkReady = setInterval(() => {
      if (window.YT?.Player) {
        clearInterval(checkReady);
        resolve(window.YT);
      }
    }, 200);
  });
}

export default function PlayerBar() {
  const { user } = useAuth();
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    volume,
    progress,
    duration,
    audioRef,
    setIsPlaying,
    setIsBuffering,
    setVolume,
    setProgress,
    setDuration,
    nextTrack,
    prevTrack,
  } = usePlayer();

  const isYouTube = currentTrack?.source === 'youtube';
  const ytContainerRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const ytVideoIdRef = useRef('');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (isYouTube) return;
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [audioRef, volume, isYouTube]);

  useEffect(() => {
    if (isYouTube) return;
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.play().catch(() => setIsPlaying(false));
    else {
      audioRef.current.pause();
      setIsBuffering(false);
    }
  }, [isPlaying, currentTrack, audioRef, setIsPlaying, setIsBuffering, isYouTube]);

  useEffect(() => {
    if (!isYouTube || !currentTrack?.videoId) return;

    let disposed = false;

    const initPlayer = async () => {
      const YT = await loadYouTubeApi();
      if (disposed || !ytContainerRef.current) return;

      if (!ytPlayerRef.current) {
        ytPlayerRef.current = new YT.Player(ytContainerRef.current, {
          videoId: currentTrack.videoId,
          height: '0',
          width: '0',
          playerVars: {
            controls: 0,
            rel: 0,
            modestbranding: 1,
          },
          events: {
            onStateChange: (event) => {
              if (event.data === YT.PlayerState.BUFFERING || event.data === YT.PlayerState.UNSTARTED) {
                setIsBuffering(true);
              }
              if (event.data === YT.PlayerState.PLAYING) {
                setIsBuffering(false);
                setIsPlaying(true);
              }
              if (event.data === YT.PlayerState.PAUSED) {
                setIsPlaying(false);
                setIsBuffering(false);
              }
              if (event.data === YT.PlayerState.ENDED) nextTrack();
            },
          },
        });
        ytVideoIdRef.current = currentTrack.videoId;
      } else if (ytVideoIdRef.current !== currentTrack.videoId) {
        ytPlayerRef.current.loadVideoById(currentTrack.videoId);
        ytVideoIdRef.current = currentTrack.videoId;
        setProgress(0);
      }

      ytPlayerRef.current.setVolume(Math.round(volume * 100));

      if (isPlaying) ytPlayerRef.current.playVideo();
      else ytPlayerRef.current.pauseVideo();
    };

    initPlayer();

    return () => {
      disposed = true;
    };
  }, [isYouTube, currentTrack?.videoId, isPlaying, nextTrack, setProgress, setIsBuffering, setIsPlaying, volume]);

  useEffect(() => {
    if (!isYouTube) return;
    const interval = setInterval(() => {
      const player = ytPlayerRef.current;
      if (!player || typeof player.getCurrentTime !== 'function') return;
      const current = Number(player.getCurrentTime() || 0);
      const total = Number(player.getDuration() || 0);
      if (total > 0) setDuration(total);
      setProgress(current);
    }, 500);

    return () => clearInterval(interval);
  }, [isYouTube, setDuration, setProgress]);

  useEffect(() => {
    if (!isYouTube) {
      const player = ytPlayerRef.current;
      if (player && typeof player.pauseVideo === 'function') player.pauseVideo();
    }
  }, [isYouTube]);

  useEffect(() => {
    if (!isYouTube) return;
    const player = ytPlayerRef.current;
    if (player && typeof player.setVolume === 'function') {
      player.setVolume(Math.round(volume * 100));
    }
  }, [isYouTube, volume]);

  if (!currentTrack) return null;

  const handleDownload = async () => {
    if (!user || !currentTrack.audio) return;
    setIsDownloading(true);
    try {
      await saveTrackForOffline(currentTrack);
      alert('Saved to Downloads for offline playback.');
    } catch (err) {
      alert(err.message || 'Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#0e1019]/95 px-3 py-2 backdrop-blur-xl md:left-72 md:px-6">
      <div ref={ytContainerRef} className="h-0 w-0 overflow-hidden" />

      {!isYouTube ? (
        <audio
          ref={audioRef}
          src={currentTrack.audio}
          onWaiting={() => setIsBuffering(true)}
          onCanPlay={() => setIsBuffering(false)}
          onPlaying={() => setIsBuffering(false)}
          onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
          onEnded={nextTrack}
        />
      ) : null}

      <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={currentTrack.image || currentTrack.album_image || 'https://placehold.co/100x100/171925/f3f4f6?text=Track'}
            alt={currentTrack.name}
            className="h-11 w-11 rounded-md object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{currentTrack.name}</p>
            <p className="truncate text-xs text-gray-400">{currentTrack.artist_name}</p>
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-center gap-3">
            <button onClick={prevTrack} className="text-gray-300 hover:text-white">
              <SkipBack size={16} />
            </button>
            <button
              onClick={() => setIsPlaying((v) => !v)}
              className="rounded-full bg-rose-500 p-2 text-white hover:bg-rose-400"
            >
              {isBuffering ? (
                <Loader2 size={16} className="animate-spin" />
              ) : isPlaying ? (
                <Pause size={16} />
              ) : (
                <Play size={16} fill="currentColor" />
              )}
            </button>
            <button onClick={nextTrack} className="text-gray-300 hover:text-white">
              <SkipForward size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <span>{formatDuration(progress)}</span>
            <div className="relative w-full">
              <div className="h-1 w-full rounded bg-white/20" />
              <div
                className="absolute left-0 top-0 h-1 rounded bg-rose-400 transition-all duration-300 ease-linear"
                style={{
                  width: `${Math.min(((duration ? progress / duration : 0) || 0) * 100, 100)}%`,
                }}
              />
              <input
                type="range"
                min="0"
                max={Math.max(duration, 1)}
                value={Math.min(progress, duration || 0)}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (isYouTube) {
                    const player = ytPlayerRef.current;
                    if (player && typeof player.seekTo === 'function') player.seekTo(value, true);
                  } else if (audioRef.current) {
                    audioRef.current.currentTime = value;
                  }
                  setProgress(value);
                }}
                className="absolute inset-0 h-1 w-full cursor-pointer appearance-none opacity-0"
              />
            </div>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleDownload}
            disabled={!user || isYouTube || isDownloading}
            className="rounded-md border border-white/20 p-2 text-gray-300 hover:bg-white/10 disabled:opacity-40"
            title={isYouTube ? 'Download unavailable for YouTube' : 'Download for offline'}
          >
            {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          </button>
          <div className="flex items-center gap-2 text-gray-300">
            <Volume2 size={14} />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="h-1 w-24 cursor-pointer appearance-none rounded bg-white/20"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
