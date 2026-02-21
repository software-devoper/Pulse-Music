import { createContext, useContext, useMemo, useRef, useState } from 'react';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const playTrack = (track, nextQueue = []) => {
    setCurrentTrack(track);
    setQueue(nextQueue);
    setIsPlaying(true);
    setIsBuffering(true);
    setProgress(0);
  };

  const nextTrack = () => {
    if (!currentTrack || queue.length === 0) return;
    const index = queue.findIndex((t) => String(t.id) === String(currentTrack.id));
    const next = queue[index + 1] || queue[0];
    setCurrentTrack(next);
    setIsPlaying(true);
    setIsBuffering(true);
    setProgress(0);
  };

  const prevTrack = () => {
    if (!currentTrack || queue.length === 0) return;
    const index = queue.findIndex((t) => String(t.id) === String(currentTrack.id));
    const prev = queue[index - 1] || queue[queue.length - 1];
    setCurrentTrack(prev);
    setIsPlaying(true);
    setIsBuffering(true);
    setProgress(0);
  };

  const clearPlayer = () => {
    setIsPlaying(false);
    setCurrentTrack(null);
    setQueue([]);
    setProgress(0);
    setDuration(0);
    setIsBuffering(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  };

  const value = useMemo(
    () => ({
      currentTrack,
      queue,
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
      playTrack,
      nextTrack,
      prevTrack,
      clearPlayer,
    }),
    [currentTrack, queue, isPlaying, isBuffering, volume, progress, duration]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used inside PlayerProvider');
  return context;
}
