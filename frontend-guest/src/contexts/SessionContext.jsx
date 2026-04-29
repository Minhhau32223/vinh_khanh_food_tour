/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/client';

const SessionContext = createContext(null);

const LANG_LABELS = {
  vi: 'Tieng Viet',
  en: 'English',
  fr: 'Francais',
  de: 'Deutsch',
  ja: 'Japanese',
  ko: 'Korean',
  'zh-CN': 'Chinese',
  es: 'Spanish',
  ru: 'Russian',
  it: 'Italian',
  pt: 'Portuguese',
  th: 'Thai',
};

const DEVICE_STORAGE_KEY = 'guest_device_id';

function getBrowserName() {
  const ua = navigator.userAgent || '';
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('Chrome/')) return 'Chrome';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('OPR/')) return 'Opera';
  return 'Unknown Browser';
}

function getPlatformName() {
  const ua = navigator.userAgent || '';
  const platform = navigator.userAgentData?.platform || navigator.platform || '';
  const source = `${platform} ${ua}`;
  if (/Android/i.test(source)) return 'Android';
  if (/iPhone|iPad|iPod/i.test(source)) return 'iOS';
  if (/Windows/i.test(source)) return 'Windows';
  if (/Mac/i.test(source)) return 'macOS';
  if (/Linux/i.test(source)) return 'Linux';
  return platform || 'Unknown OS';
}

function getOrCreateDeviceId() {
  const existing = localStorage.getItem(DEVICE_STORAGE_KEY);
  if (existing) return existing;
  const created = `device-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`;
  localStorage.setItem(DEVICE_STORAGE_KEY, created);
  return created;
}

function buildDeviceMeta(sessionId, language, deviceId) {
  const browser = getBrowserName();
  const platform = getPlatformName();
  return {
    type: 'heartbeat',
    sessionId,
    deviceId,
    deviceName: `${platform} - ${browser}`,
    browser,
    platform,
    currentPath: window.location.pathname,
    language,
  };
}

export function SessionProvider({ children }) {
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('guest_session'));
  const [language, setLanguage] = useState(() => localStorage.getItem('guest_lang') || 'vi');
  const [currentTourId, setCurrentTourId] = useState(null);
  const [activeToast, setActiveToast] = useState(null);
  const toastTimer = useRef(null);
  const isCreatingSession = useRef(false);

  const createSession = useCallback(async () => {
    if (isCreatingSession.current) return null;

    isCreatingSession.current = true;
    try {
      const deviceId = getOrCreateDeviceId();
      const preferredLanguage = localStorage.getItem('guest_lang') || 'vi';
      const { data } = await api.post('/sessions', { deviceId, preferredLanguage });
      const id = data.id ?? data.sessionId ?? data;
      if (!id) return null;

      const normalizedId = String(id);
      setSessionId(normalizedId);
      localStorage.setItem('guest_session', normalizedId);
      return normalizedId;
    } catch {
      return null;
    } finally {
      isCreatingSession.current = false;
    }
  }, []);

  useEffect(() => {
    if (sessionId || isCreatingSession.current) return;
    createSession();
  }, [createSession, sessionId]);

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;
    api.get(`/sessions/${sessionId}`).catch(async () => {
      if (cancelled) return;
      localStorage.removeItem('guest_session');
      setSessionId(null);
      await createSession();
    });

    return () => {
      cancelled = true;
    };
  }, [createSession, sessionId]);

  const updateLanguage = useCallback(async lang => {
    setLanguage(lang);
    localStorage.setItem('guest_lang', lang);
    if (sessionId) {
      await api.patch(`/sessions/${sessionId}`, { preferredLanguage: lang }).catch(() => {});
    }
  }, [sessionId]);

  const joinTour = useCallback(async tourId => {
    setCurrentTourId(tourId);
    if (sessionId) {
      await api.patch(`/sessions/${sessionId}`, { currentTourId: tourId }).catch(() => {});
    }
  }, [sessionId]);

  const leaveTour = useCallback(async () => {
    setCurrentTourId(null);
    if (sessionId) {
      await api.patch(`/sessions/${sessionId}`, { currentTourId: null }).catch(() => {});
    }
  }, [sessionId]);

  const showToast = useCallback((message, duration = 4000) => {
    setActiveToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setActiveToast(null), duration);
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    let ws = null;
    let heartbeatInterval = null;
    let reconnectTimeout = null;
    let isMounted = true;

    const connectWS = () => {
      if (!isMounted) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/guest`;
      const deviceId = getOrCreateDeviceId();

      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          ws.send(JSON.stringify(buildDeviceMeta(sessionId, language, deviceId)));

          heartbeatInterval = setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify(buildDeviceMeta(sessionId, language, deviceId)));
            }
          }, 30000);
        };

        ws.onclose = () => {
          if (isMounted) {
            reconnectTimeout = setTimeout(connectWS, 5000);
          }
        };
      } catch {
        // Ignore connection errors.
      }
    };

    connectWS();

    return () => {
      isMounted = false;
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
    };
  }, [language, sessionId]);

  return (
    <SessionContext.Provider
      value={{
        sessionId,
        language,
        currentTourId,
        updateLanguage,
        joinTour,
        leaveTour,
        langLabel: LANG_LABELS[language],
        activeToast,
        showToast,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
