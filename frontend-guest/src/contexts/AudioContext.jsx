/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import api from '../api/client';

const AudioContext = createContext(null);
const DISTANCE_EPSILON_KM = 0.00001;

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
    return audioUrl;
  }
}

function compareQueueItems(a, b) {
  const priorityDiff = Number(b.priority ?? 0) - Number(a.priority ?? 0);
  if (priorityDiff !== 0) return priorityDiff;

  const distanceDiff = Number(a.distanceKm ?? Number.MAX_SAFE_INTEGER) - Number(b.distanceKm ?? Number.MAX_SAFE_INTEGER);
  if (Math.abs(distanceDiff) > DISTANCE_EPSILON_KM) return distanceDiff;

  const poiIdDiff = Number(a.poiId ?? Number.MAX_SAFE_INTEGER) - Number(b.poiId ?? Number.MAX_SAFE_INTEGER);
  if (poiIdDiff !== 0) return poiIdDiff;

  return Number(a.queuedAt ?? 0) - Number(b.queuedAt ?? 0);
}

function sortQueue(queue) {
  return queue.sort(compareQueueItems);
}

export function AudioProvider({ children }) {
  const [playing, setPlaying] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [queueItems, setQueueItems] = useState([]);
  const audioRef = useRef(null);
  const queueRef = useRef([]);
  const playRef = useRef(null);
  const hasUserInteractionRef = useRef(false);
  const pendingAutoPlayRef = useRef(null);

  const syncQueueState = useCallback(() => {
    setQueueItems([
      ...(pendingAutoPlayRef.current ? [pendingAutoPlayRef.current] : []),
      ...queueRef.current,
    ]);
  }, []);

  const playNextFromQueue = useCallback(() => {
    if (audioRef.current) return;

    if (pendingAutoPlayRef.current && !hasUserInteractionRef.current) {
      syncQueueState();
      return;
    }

    const next = pendingAutoPlayRef.current || queueRef.current.shift();
    pendingAutoPlayRef.current = null;
    syncQueueState();
    if (next && playRef.current) {
      playRef.current(next);
    }
  }, [syncQueueState]);

  const play = useCallback(async ({
    poiId,
    poiName,
    audioUrl,
    poiContentId = null,
    sessionId,
    language,
    triggerType = 'GEOFENCE',
    priority = 0,
    distanceKm = Number.MAX_SAFE_INTEGER,
  }) => {
    if (!audioUrl) return { status: 'failed' };

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
      setDuration(0);
      setIsPaused(true);
      audioRef.current = null;
      if (historyId) {
        api.patch(`/analytics/play-event/${historyId}`, {
          durationSeconds: Math.round(audio.currentTime),
        }).catch(() => {});
      }
      setTimeout(() => playNextFromQueue(), 0);
    });

    audio.addEventListener('error', () => {
      audioRef.current = null;
      setPlaying(null);
      setProgress(0);
      setCurrentTime(0);
      setDuration(0);
      setIsPaused(true);
      setTimeout(() => playNextFromQueue(), 0);
    });

    setPlaying({
      poiId,
      poiName,
      poiContentId,
      url: resolvedAudioUrl,
      historyId,
      priority,
      distanceKm,
    });
    setProgress(0);
    setCurrentTime(0);
    setIsPaused(false);

    try {
      await audio.play();
      setAutoplayBlocked(false);
      pendingAutoPlayRef.current = null;
      syncQueueState();

      try {
        const requestPayload = {
          sessionId,
          poiId,
          poiContentId,
          triggerType,
          language,
          playedAt: new Date().toISOString(),
        };
        let data;
        try {
          ({ data } = await api.post('/analytics/play-event', requestPayload));
        } catch {
          ({ data } = await api.post('/analytics/play-event', {
            ...requestPayload,
            sessionId: null,
          }));
        }
        historyId = data.id;
        setPlaying(current => (current ? { ...current, historyId } : current));
      } catch {
        // Analytics failure should not block playback.
      }

      return { status: 'playing' };
    } catch {
      audio.pause();
      audioRef.current = null;
      setPlaying(null);
      setProgress(0);
      setCurrentTime(0);
      setDuration(0);
      setIsPaused(true);

      if (triggerType === 'GEOFENCE' && !hasUserInteractionRef.current) {
        pendingAutoPlayRef.current = {
          poiId,
          poiName,
          poiContentId,
          audioUrl: resolvedAudioUrl,
          sessionId,
          language,
          triggerType,
          priority,
          distanceKm,
          queuedAt: Date.now(),
        };
        setAutoplayBlocked(true);
        syncQueueState();
        return { status: 'blocked' };
      }

      return { status: 'failed' };
    }
  }, [playNextFromQueue, syncQueueState]);

  useEffect(() => {
    playRef.current = play;
  }, [play]);

  useEffect(() => {
    const unlockAudio = () => {
      hasUserInteractionRef.current = true;
      if (!audioRef.current) {
        playNextFromQueue();
      }
    };

    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio);
    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, [playNextFromQueue]);

  const enqueue = useCallback(async payload => {
    const normalizedPayload = {
      ...payload,
      priority: payload.priority ?? 0,
      distanceKm: payload.distanceKm ?? Number.MAX_SAFE_INTEGER,
      queuedAt: payload.queuedAt ?? Date.now(),
    };

    if (!audioRef.current && !pendingAutoPlayRef.current && hasUserInteractionRef.current) {
      return play(normalizedPayload);
    }

    const pendingSamePoi = pendingAutoPlayRef.current?.poiId === normalizedPayload.poiId;
    const queuedSamePoi = queueRef.current.some(item => item.poiId === normalizedPayload.poiId);
    if (pendingSamePoi || queuedSamePoi || playing?.poiId === normalizedPayload.poiId) {
      return { status: 'ignored' };
    }

    if (normalizedPayload.triggerType === 'GEOFENCE' && !hasUserInteractionRef.current && !pendingAutoPlayRef.current && !audioRef.current) {
      pendingAutoPlayRef.current = normalizedPayload;
      setAutoplayBlocked(true);
      syncQueueState();
      return { status: 'blocked' };
    }

    queueRef.current.push(normalizedPayload);
    sortQueue(queueRef.current);
    syncQueueState();
    return { status: 'queued' };
  }, [play, playing?.poiId, syncQueueState]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      const dur = Math.round(audioRef.current.currentTime);
      audioRef.current.pause();
      audioRef.current = null;
      if (playing?.historyId) {
        api.patch(`/analytics/play-event/${playing.historyId}`, { durationSeconds: dur }).catch(() => {});
      }
    }

    pendingAutoPlayRef.current = null;
    queueRef.current = [];
    setPlaying(null);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setIsPaused(true);
    setAutoplayBlocked(false);
    syncQueueState();
  }, [playing, syncQueueState]);

  const toggle = useCallback(() => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) audioRef.current.play();
    else audioRef.current.pause();
  }, []);

  const fmt = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

  return (
    <AudioContext.Provider
      value={{
        playing,
        play,
        enqueue,
        stop,
        toggle,
        progress,
        currentTime,
        duration,
        fmt,
        isPaused,
        autoplayBlocked,
        queueItems,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export const useAudio = () => useContext(AudioContext);
