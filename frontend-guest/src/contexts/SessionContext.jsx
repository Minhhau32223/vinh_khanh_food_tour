/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/client';

const SessionContext = createContext(null);

const LANG_LABELS = {
  vi: 'Tiếng Việt',
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
  ar: 'Arabic',
  tr: 'Turkish',
  id: 'Indonesian',
};

export function SessionProvider({ children }) {
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('guest_session'));
  const [language, setLanguage] = useState(() => localStorage.getItem('guest_lang') || 'vi');
  const [currentTourId, setCurrentTourId] = useState(null);
  const [activeToast, setActiveToast] = useState(null);
  const toastTimer = useRef(null);
  const isCreatingSession = useRef(false);

  // Create session on mount if none exists — only depends on sessionId
  useEffect(() => {
    if (sessionId || isCreatingSession.current) return;

    isCreatingSession.current = true;
    const deviceId = 'web-' + Math.random().toString(36).slice(2);
    const preferredLanguage = localStorage.getItem('guest_lang') || 'vi';

    api.post('/sessions', { deviceId, preferredLanguage })
      .then(({ data }) => {
        const id = data.id ?? data.sessionId ?? data;
        if (id) {
          setSessionId(String(id));
          localStorage.setItem('guest_session', String(id));
        }
      })
      .catch(() => {
        // Session creation failed – app still works without a session ID
      })
      .finally(() => {
        isCreatingSession.current = false;
      });
  }, [sessionId]);

  const updateLanguage = useCallback(async (lang) => {
    setLanguage(lang);
    localStorage.setItem('guest_lang', lang);
    if (sessionId) {
      await api.patch(`/sessions/${sessionId}`, { preferredLanguage: lang }).catch(() => {});
    }
  }, [sessionId]);

  const joinTour = useCallback(async (tourId) => {
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

  return (
    <SessionContext.Provider value={{
      sessionId, language, currentTourId,
      updateLanguage, joinTour, leaveTour,
      langLabel: LANG_LABELS[language],
      activeToast, showToast,
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
