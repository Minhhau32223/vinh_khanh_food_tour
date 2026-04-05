import { createContext, useContext, useState, useRef, useCallback } from 'react';
import api from '../api/client';

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const [playing, setPlaying] = useState(null); // { poiId, poiName, url, historyId }
  const [progress, setProgress] = useState(0);   // 0-100
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const queueRef = useRef([]);

  const playNextFromQueue = useCallback(() => {
    if (audioRef.current || queueRef.current.length === 0) return;
    const next = queueRef.current.shift();
    if (next) {
      play(next);
    }
  }, []);

  const play = useCallback(async ({ poiId, poiName, audioUrl, sessionId, language, triggerType = 'GEOFENCE' }) => {
    if (!audioUrl) return;

    // Stop current
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    let historyId = null;
    // Log play event
    try {
      const { data } = await api.post('/analytics/play-event', {
        sessionId, poiId, triggerType, language, playedAt: new Date().toISOString()
      });
      historyId = data.id;
    } catch {}

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    });

    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));

    audio.addEventListener('ended', () => {
      setPlaying(null);
      setProgress(0);
      setCurrentTime(0);
      // Update duration
      if (historyId) {
        api.patch(`/analytics/play-event/${historyId}`, {
          durationSeconds: Math.round(audio.currentTime)
        }).catch(() => {});
      }
      setTimeout(() => playNextFromQueue(), 0);
    });

    setPlaying({ poiId, poiName, url: audioUrl, historyId });
    setProgress(0); setCurrentTime(0);

    try { await audio.play(); }
    catch { setPlaying(null); }
  }, []);

  const enqueue = useCallback(payload => {
    // If nothing is playing, start immediately.
    if (!audioRef.current) {
      play(payload);
      return;
    }
    // Avoid duplicate queue entries for the same POI.
    const exists = queueRef.current.some(item => item.poiId === payload.poiId);
    if (!exists) {
      queueRef.current.push(payload);
    }
  }, [play]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      const dur = Math.round(audioRef.current.currentTime);
      audioRef.current.pause();
      audioRef.current = null;
      if (playing?.historyId) {
        api.patch(`/analytics/play-event/${playing.historyId}`, { durationSeconds: dur }).catch(() => {});
      }
    }
    setPlaying(null); setProgress(0); setCurrentTime(0);
    queueRef.current = [];
  }, [playing]);

  const toggle = useCallback(() => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) audioRef.current.play();
    else audioRef.current.pause();
  }, []);

  const isPaused = audioRef.current?.paused ?? true;

  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return (
    <AudioContext.Provider value={{ playing, play, enqueue, stop, toggle, progress, currentTime, duration, fmt, isPaused }}>
      {children}
    </AudioContext.Provider>
  );
}

export const useAudio = () => useContext(AudioContext);
