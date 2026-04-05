import { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../api/client';

const SessionContext = createContext(null);

const LANG_LABELS = { vi: '🇻🇳 Tiếng Việt', en: '🇺🇸 English', zh: '🇨🇳 中文' };

export function SessionProvider({ children }) {
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('guest_session'));
  const [language, setLanguage] = useState(() => localStorage.getItem('guest_lang') || 'vi');
  const [currentTourId, setCurrentTourId] = useState(null);
  const [activeToast, setActiveToast] = useState(null);
  const toastTimer = useRef(null);

  // Create session on mount if none exists
  useEffect(() => {
    if (!sessionId) {
      const deviceId = 'web-' + Math.random().toString(36).slice(2);
      api.post('/sessions', { deviceId, preferredLanguage: language })
        .then(({ data }) => {
          setSessionId(data.id);
          localStorage.setItem('guest_session', data.id);
        })
        .catch(() => {});
    }
  }, []);

  const updateLanguage = async lang => {
    setLanguage(lang);
    localStorage.setItem('guest_lang', lang);
    if (sessionId) {
      await api.patch(`/sessions/${sessionId}`, { preferredLanguage: lang }).catch(() => {});
    }
  };

  const joinTour = async tourId => {
    setCurrentTourId(tourId);
    if (sessionId) {
      await api.patch(`/sessions/${sessionId}`, { currentTourId: tourId }).catch(() => {});
    }
  };

  const leaveTour = async () => {
    setCurrentTourId(null);
    if (sessionId) {
      await api.patch(`/sessions/${sessionId}`, { currentTourId: null }).catch(() => {});
    }
  };

  const showToast = (message, duration = 4000) => {
    setActiveToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setActiveToast(null), duration);
  };

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
