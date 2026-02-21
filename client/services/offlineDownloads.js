const DB_NAME = 'pulse_music_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'downloads';
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB open failed'));
  });
}

function runTransaction(mode, executor) {
  return openDatabase().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const store = tx.objectStore(STORE_NAME);
        executor(store, resolve, reject);
        tx.oncomplete = () => db.close();
        tx.onerror = () => reject(tx.error || new Error('IndexedDB transaction failed'));
      })
  );
}

export async function saveTrackForOffline(track) {
  if (!track?.audio) throw new Error('No audio URL available for offline download');

  const response = await fetch(`${API_BASE}/jamendo/download?audioUrl=${encodeURIComponent(track.audio)}`);
  if (!response.ok) throw new Error('Failed to fetch audio file');
  const audioBlob = await response.blob();

  const id = `jamendo-${track.id}`;
  const record = {
    id,
    trackId: track.id,
    name: track.name,
    artist_name: track.artist_name || 'Unknown artist',
    image: track.image || track.album_image || null,
    duration: Number(track.duration) || 0,
    source: 'jamendo',
    downloadedAt: new Date().toISOString(),
    audioBlob,
  };

  return runTransaction('readwrite', (store, resolve, reject) => {
    const request = store.put(record);
    request.onsuccess = () => resolve(record);
    request.onerror = () => reject(request.error || new Error('Failed to save offline track'));
  });
}

export async function getOfflineDownloads() {
  const items = await runTransaction('readonly', (store, resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error || new Error('Failed to read offline downloads'));
  });

  return items.sort((a, b) => new Date(b.downloadedAt) - new Date(a.downloadedAt));
}

export async function removeOfflineDownload(id) {
  return runTransaction('readwrite', (store, resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error || new Error('Failed to remove offline track'));
  });
}
