/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import api from '../api/client';

const AudioContext = createContext(null);

function normalizeAudioUrl(audioUrl) {
  if (!audioUrl) return audioUrl;

  try {
    const parsed = new URL(audioUrl, window.location.origin);
    if (['localhost', '127.0.0.1'].includes(parsed.hostname) && !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
      parsed.protocol = window.location.protocol;
      parsed.hostname = window.location.hostname;
    }
    return parsed.toString();
  } catch {
    // Keep original URL if parsing fails.
    return audioUrl;
  }
}

function sortQueue(queue) {
  return queue.sort((a, b) => (
    (b.priority - a.priority) ||
    (a.distanceKm - b.distanceKm) ||
    (a.queuedAt - b.queuedAt)
  ));
}

export function AudioProvider({ children }) {
  const [playing, setPlaying] = useState(null); // { poiId, poiName, url, historyId }
  const [progress, setProgress] = useState(0);   // 0-100
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const audioRef = useRef(null);
  const queueRef = useRef([]);
  const playRef = useRef(null);
  const hasUserInteractionRef = useRef(false);
  const pendingAutoPlayRef = useRef(null);

  const playNextFromQueue = useCallback(() => {
    if (audioRef.current || queueRef.current.length === 0) return;
    const next = queueRef.current.shift();
    if (next && playRef.current) playRef.current(next);
  }, []);

  const play = useCallback(async ({
    poiId,
    poiName,
    audioUrl,
    sessionId,
    language,
    triggerType = 'GEOFENCE',
  }) => {
    if (!audioUrl) return;

    // Stop current
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const resolvedAudioUrl = normalizeAudioUrl(audioUrl);
    const audio = new Audio(resolvedAudioUrl);
    audioRef.current = audio;
    let historyId = null;

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    });

    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
    audio.addEventListener('play', () => setIsPaused(false));
    audio.addEventListener('pause', () => setIsPaused(true));

    audio.addEventListener('ended', () => {
      setPlaying(null);
      setProgress(0);
      setCurrentTime(0);
      setIsPaused(true);
      // Update duration
      if (historyId) {
        api.patch(`/analytics/play-event/${historyId}`, {
          durationSeconds: Math.round(audio.currentTime)
        }).catch(() => {});
      }
      setTimeout(() => playNextFromQueue(), 0);
    });

    audio.addEventListener('error', () => {
      audioRef.current = null;
      setPlaying(null);
      setProgress(0);
      setCurrentTime(0);
      setIsPaused(true);
      setTimeout(() => playNextFromQueue(), 0);
    });

    setPlaying({ poiId, poiName, url: resolvedAudioUrl, historyId });
    setProgress(0); setCurrentTime(0); setIsPaused(false);

    try {
      await audio.play();
      setAutoplayBlocked(false);
      pendingAutoPlayRef.current = null;
      try {
        const { data } = await api.post('/analytics/play-event', {
          sessionId, poiId, triggerType, language, playedAt: new Date().toISOString()
        });
        historyId = data.id;
        setPlaying(current => current ? { ...current, historyId } : current);
      } catch {
        // Analytics failure should not block playback.
      }
      return { status: 'playing' };
    } catch {
      audio.pause();
      audioRef.current = null;
      setPlaying(null);
      if (triggerType === 'GEOFENCE' && !hasUserInteractionRef.current) {
        pendingAutoPlayRef.current = { poiId, poiName, audioUrl: resolvedAudioUrl, sessionId, language, triggerType };
        setAutoplayBlocked(true);
        return { status: 'blocked' };
      }
      return { status: 'failed' };
    }
  }, [playNextFromQueue]);

  useEffect(() => {
    playRef.current = play;
  }, [play]);

  useEffect(() => {
    const unlockAudio = () => {
      hasUserInteractionRef.current = true;
      if (pendingAutoPlayRef.current && !audioRef.current && playRef.current) {
        const pending = pendingAutoPlayRef.current;
        pendingAutoPlayRef.current = null;
        playRef.current(pending);
      }
    };

    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio);

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  const enqueue = useCallback(async payload => {
    const normalizedPayload = {
      ...payload,
      priority: payload.priority ?? 0,
      distanceKm: payload.distanceKm ?? Number.MAX_SAFE_INTEGER,
      queuedAt: payload.queuedAt ?? Date.now(),
    };

    const isCurrentPending = pendingAutoPlayRef.current?.poiId === normalizedPayload.poiId;

    // If nothing is playing, start immediately.
    if (!audioRef.current) {
      if (normalizedPayload.triggerType === 'GEOFENCE' && !hasUserInteractionRef.current) {
        if (!pendingAutoPlayRef.current) {
          pendingAutoPlayRef.current = normalizedPayload;
          setAutoplayBlocked(true);
          return { status: 'blocked' };
        }
        if (isCurrentPending) return { status: 'ignored' };
        const existsInQueue = queueRef.current.some(item => item.poiId === normalizedPayload.poiId);
        if (!existsInQueue) {
          queueRef.current.push(normalizedPayload);
          sortQueue(queueRef.current);
          setAutoplayBlocked(true);
          return { status: 'queued' };
        }
        return { status: 'ignored' };
      }
      return play(normalizedPayload);
    }
    // Avoid duplicate queue entries for the same POI.
    const exists = queueRef.current.some(item => item.poiId === normalizedPayload.poiId);
    if (!exists) {
      queueRef.current.push(normalizedPayload);
      sortQueue(queueRef.current);
      return { status: 'queued' };
    }
    return { status: 'ignored' };
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
    setIsPaused(true);
    queueRef.current = [];
  }, [playing]);

  const toggle = useCallback(() => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) audioRef.current.play();
    else audioRef.current.pause();
  }, []);

  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return (
    <AudioContext.Provider value={{ playing, play, enqueue, stop, toggle, progress, currentTime, duration, fmt, isPaused, autoplayBlocked }}>
      {children}
    </AudioContext.Provider>
  );
}

export const useAudio = () => useContext(AudioContext);
