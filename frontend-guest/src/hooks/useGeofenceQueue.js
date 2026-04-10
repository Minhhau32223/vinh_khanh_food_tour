import { useEffect, useRef, useCallback } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { useSession } from '../contexts/SessionContext';
import api from '../api/client';

const COOLDOWN_MS = 30_000;
const LOCATION_LOG_INTERVAL = 10_000;

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useGeofenceQueue({ pois, onNearby, enabled = true }) {
  const { enqueue } = useAudio();
  const { sessionId, language, showToast } = useSession();
  const cooldowns = useRef({});
  const watchId = useRef(null);
  const lastLocationLog = useRef(0);
  const contentCache = useRef({});

  const fetchContent = useCallback(async poi => {
    const key = `${poi.id}-${language}`;
    if (contentCache.current[key]) return contentCache.current[key];

    try {
      const { data } = await api.get(`/pois/${poi.id}/content/${language}`);
      contentCache.current[key] = data;
      return data;
    } catch {
      if (language !== 'vi') {
        try {
          const { data } = await api.get(`/pois/${poi.id}/content/vi`);
          contentCache.current[key] = data;
          return data;
        } catch {
          return null;
        }
      }
      return null;
    }
  }, [language]);

  const handlePosition = useCallback(async pos => {
    const { latitude: userLat, longitude: userLng } = pos.coords;
    const now = Date.now();

    if (sessionId && now - lastLocationLog.current > LOCATION_LOG_INTERVAL) {
      lastLocationLog.current = now;
      api.post('/analytics/location', { sessionId, latitude: userLat, longitude: userLng }).catch(() => {});
    }

    if (!pois?.length) return;

    const candidates = pois
      .filter(poi => poi.isActive !== false)
      .map(poi => ({
        poi,
        dist: haversineKm(userLat, userLng, Number(poi.latitude), Number(poi.longitude)),
      }))
      .filter(({ poi, dist }) => dist <= (poi.triggerRadius || 100) / 1000)
      .sort((a, b) => (
        (Number(b.poi.priority ?? 0) - Number(a.poi.priority ?? 0)) ||
        (a.dist - b.dist)
      ));

    if (candidates.length === 0) return;

    const eligibleCandidates = candidates.filter(({ poi }) => {
      const lastPlayed = cooldowns.current[poi.id] || 0;
      return now - lastPlayed > COOLDOWN_MS;
    });

    if (eligibleCandidates.length === 0) return;

    if (onNearby) onNearby(eligibleCandidates[0].poi, eligibleCandidates[0].dist);

    for (const { poi, dist } of eligibleCandidates) {
      cooldowns.current[poi.id] = now;

      const content = await fetchContent(poi);
      if (!content?.audioFileUrl) {
        showToast(`Ban dang o: ${poi.name}`);
        continue;
      }

      const result = await enqueue({
        poiId: poi.id,
        poiName: content.title || poi.name,
        audioUrl: content.audioFileUrl,
        sessionId,
        language,
        triggerType: 'GEOFENCE',
        priority: Number(poi.priority ?? 0),
        distanceKm: dist,
      });

      if (result?.status === 'playing') {
        showToast(`Dang phat thuyet minh: ${content.title || poi.name}`);
      } else if (result?.status === 'queued') {
        showToast(`Da xep hang: ${content.title || poi.name}`);
      } else if (result?.status === 'blocked') {
        showToast('Cham man hinh 1 lan de bat thuyet minh tu dong');
      }
    }
  }, [pois, enqueue, sessionId, language, fetchContent, onNearby, showToast]);

  useEffect(() => {
    if (!enabled || !navigator.geolocation) return;

    watchId.current = navigator.geolocation.watchPosition(
      handlePosition,
      err => console.warn('GPS error:', err.message),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 },
    );

    return () => {
      if (watchId.current != null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [enabled, handlePosition]);

  return { haversineKm };
}
