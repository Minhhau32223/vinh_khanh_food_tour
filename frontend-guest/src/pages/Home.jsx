import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api/client';
import { useAudio } from '../contexts/AudioContext';
import { useGeofenceQueue } from '../hooks/useGeofenceQueue';
import { loadOfflinePackage } from '../utils/offlinePackage';
// update
import { useSession } from '../contexts/SessionContext';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// ─── Leaflet DivIcon – avoids all _getIconUrl / createIcon issues ────────────
// Using DivIcon (SVG-based) instead of L.Icon so there's no image loading
// involved, which is the root cause of the Vite bundler crash.
function makeDivIcon(color = '#c0392b', label = '') {
  return L.divIcon({
    className: '',
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -40],
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
      <path fill="${color}" stroke="white" stroke-width="1.5"
        d="M14 0C6.27 0 0 6.27 0 14c0 9.63 14 26 14 26S28 23.63 28 14C28 6.27 21.73 0 14 0z"/>
      <circle cx="14" cy="14" r="6" fill="white" opacity="0.9"/>
      ${label ? `<text x="14" y="18" text-anchor="middle" font-size="8" fill="${color}" font-weight="bold">${label}</text>` : ''}
    </svg>`,
  });
}

import { useMap } from 'react-leaflet';

function Routing({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length < 2) return;

    const routing = L.Routing.control({
      waypoints: points.map(p => L.latLng(p[0], p[1])),

      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1"
      }),

      lineOptions: {
        styles: [{ color: '#3abfe0', weight: 5 }],
        interactive: false
      },

      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,

      createMarker: () => null  
    }).addTo(map);

    return () => map.removeControl(routing);
  }, [points, map]);

  return null;
}

// Icon instances (created once at module scope)
const defaultPoiIcon = makeDivIcon('#c0392b');
const activePoiIcon = makeDivIcon('#7d3c98');
const userPosIcon = makeDivIcon('#2980b9', '📍');

const VN_CENTER = [10.7800, 106.7000];

function distStr(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export default function Home() {
  const [pois, setPois] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPos, setUserPos] = useState(null);
  const [view, setView] = useState('map');
  const [nearbyPoi, setNearbyPoi] = useState(null);
  const [offlineMode, setOfflineMode] = useState(false);
  const navigate = useNavigate();
  const { playing } = useAudio();
  const { haversineKm } = useGeofenceQueue({ pois, onNearby: setNearbyPoi });

  // update
  const { currentTourId } = useSession();
  const [tourPois, setTourPois] = useState([]);

  // update
  useEffect(() => {
    if (!currentTourId) {
      setTourPois([]);
      return;
    }
    api.get(`/tours/${currentTourId}`)
      .then(r => {
        // Sắp xếp theo order_index rồi lấy tọa độ
        const sorted = (r.data.pois || [])
          .sort((a, b) => a.orderIndex - b.orderIndex);
        setTourPois(sorted);
      })
      .catch(() => { });
  }, [currentTourId]);

  // update
  const tourRoute = tourPois
    .map(tp => {
      const poi = pois.find(p => p.id === tp.poiId);
      return poi ? [Number(poi.latitude), Number(poi.longitude)] : null;
    })
    .filter(Boolean);

  useEffect(() => {
    api.get('/pois')
      .then(r => {
        setPois(r.data.filter(p => p.isActive !== false));
        setOfflineMode(false);
      })
      .catch(() => {
        const offlinePackage = loadOfflinePackage();
        if (offlinePackage?.items?.length) {
          setPois(offlinePackage.items.map(item => item.poi).filter(Boolean));
          setOfflineMode(true);
        }
      })
      .finally(() => setLoading(false));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserPos([pos.coords.latitude, pos.coords.longitude]),
        () => { }
      );
    }
  }, []);

  const distances = useMemo(() => {
    if (!userPos || !pois.length) return {};
    const d = {};
    pois.forEach(poi => {
      d[poi.id] = haversineKm(userPos[0], userPos[1], Number(poi.latitude), Number(poi.longitude));
    });
    return d;
  }, [userPos, pois, haversineKm]);

  const sortedPois = [...pois].sort((a, b) => {
    const da = distances[a.id] ?? 999;
    const db = distances[b.id] ?? 999;
    return da - db;
  });

  const mapCenter = userPos || VN_CENTER;
  const activePoiId = playing?.poiId;

  return (
    <div>
      {offlineMode && (
        <div style={{
          margin: '0 var(--sp-4) 0.75rem', borderRadius: 14,
          padding: '0.8rem 1rem', background: 'rgba(52, 152, 219, 0.12)',
          color: '#1f618d', border: '1px solid rgba(52, 152, 219, 0.25)',
        }}>
          Đang hiển thị dữ liệu offline đã tải trước đó.
        </div>
      )}

      {/* View Toggle Wrapper */}
      <div style={{ position: 'relative', height: view === 'map' ? 'calc(100dvh - 130px)' : 'auto' }}>
        {view === 'map' && (
          <div className="map-container">
            <MapContainer center={mapCenter} zoom={16} style={{ height: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* User position */}
              {userPos && (
                <Marker position={userPos} icon={userPosIcon}>
                  <Popup>📍 Vị trí của bạn</Popup>
                </Marker>
              )}

              {/* POI markers */}
              {pois.map(poi => (
                <Marker
                  key={`marker-${poi.id}`}
                  position={[Number(poi.latitude), Number(poi.longitude)]}
                  icon={activePoiId === poi.id ? activePoiIcon : defaultPoiIcon}
                  eventHandlers={{ click: () => navigate(`/poi/${poi.id}`) }}
                >
                  <Popup>
                    <div style={{ minWidth: 140 }}>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>{poi.name}</div>
                      {activePoiId === poi.id && (
                        <div style={{ fontSize: '0.8rem', color: '#7d3c98', fontWeight: 700 }}>
                          🎙️ Đang phát thuyết minh
                        </div>
                      )}
                      {distances[poi.id] != null && (
                        <div style={{ fontSize: '0.8rem', color: '#667' }}>
                          📏 {distStr(distances[poi.id])}
                        </div>
                      )}
                      <button
                        onClick={() => navigate(`/poi/${poi.id}`)}
                        style={{
                          marginTop: 8, background: '#c0392b', color: '#fff',
                          border: 'none', borderRadius: 8, padding: '4px 12px',
                          cursor: 'pointer', width: '100%',
                        }}
                      >
                        Xem chi tiết →
                      </button>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${Number(poi.latitude)},${Number(poi.longitude)}${userPos ? `&origin=${userPos[0]},${userPos[1]}` : ''}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: 'inline-block', marginTop: 8, fontSize: '0.8rem' }}
                      >
                        Mở chỉ đường ↗
                      </a>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Geofence circles */}
              {pois.map(poi => (
                <Circle
                  key={`circle-${poi.id}`}
                  center={[Number(poi.latitude), Number(poi.longitude)]}
                  radius={poi.triggerRadius || 100}
                  pathOptions={{
                    color: activePoiId === poi.id ? '#7d3c98' : '#c0392b',
                    fillColor: activePoiId === poi.id ? '#7d3c98' : '#c0392b',
                    fillOpacity: activePoiId === poi.id ? 0.16 : 0.05,
                    weight: activePoiId === poi.id ? 2 : 1,
                    dashArray: activePoiId === poi.id ? undefined : '4',
                  }}
                />
              ))}


              {/* Tour route - UPDATE */}
              {tourRoute.length > 1 && (
                <>
                  {/* <Polyline
                    positions={tourRoute}
                    pathOptions={{
                      color: '#e67e22',
                      weight: 4,
                      opacity: 0.8,
                      dashArray: '10, 6',
                    }}
                  /> */}
                  {tourRoute.length > 1 && (
                    <Routing points={tourRoute} />
                  )}

                  console.log("tourRoute", tourRoute);
                  {/* Đánh số thứ tự các điểm trong tour */}
                  {tourPois.map((tp, i) => {
                    const poi = pois.find(p => p.id === tp.poiId);
                    if (!poi) return null;
                    return (
                      <Marker
                        key={`tour-marker-${tp.poiId}`}
                        position={[Number(poi.latitude), Number(poi.longitude)]}
                        icon={makeDivIcon('#e67e22', String(i + 1))}
                        eventHandlers={{ click: () => navigate(`/poi/${poi.id}`) }}
                      />
                    );
                  })}
                </>
              )}
            </MapContainer>

            {/* Floating map/list toggle */}
            <div className="view-toggle">
              <button className="view-toggle-btn active" onClick={() => setView('map')}>
                🗺️ Bản đồ
              </button>
              <button className="view-toggle-btn" onClick={() => setView('list')}>
                📋 Danh sách
              </button>
            </div>
          </div>
        )}
      </div>

      {/* List View */}
      {view === 'list' && (
        <div>
          <div style={{ position: 'relative' }}>
            <div className="view-toggle" style={{ position: 'relative', top: 0, right: 0, margin: '1rem 1rem 0 auto', width: 'fit-content' }}>
              <button className="view-toggle-btn" onClick={() => setView('map')}>🗺️ Bản đồ</button>
              <button className="view-toggle-btn active" onClick={() => setView('list')}>📋 Danh sách</button>
            </div>
          </div>

          <div className="poi-list">
            <div className="section-title">
              {userPos
                ? `📍 ${sortedPois.length} địa điểm gần bạn`
                : `🍜 ${pois.length} địa điểm ẩm thực`}
            </div>

            {loading ? (
              <div className="page-loading">
                <div className="spinner" />
                <span>Đang tải…</span>
              </div>
            ) : sortedPois.length === 0 ? (
              <div className="empty-page">
                <div className="empty-page-icon">📍</div>
                <div className="empty-page-title">Không có địa điểm</div>
              </div>
            ) : (
              sortedPois.map(poi => (
                <a
                  key={poi.id}
                  className="poi-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/poi/${poi.id}`)}
                >
                  <div
                    className="poi-card-inner"
                    style={activePoiId === poi.id ? {
                      border: '1px solid rgba(125,60,152,0.35)',
                      borderRadius: 16,
                      boxShadow: '0 0 0 2px rgba(125,60,152,0.08)',
                    } : undefined}
                  >
                    <div className="poi-card-icon">🍜</div>
                    <div className="poi-card-info">
                      <div className="poi-card-name">{poi.name}</div>
                      <div className="poi-card-dist">
                        {distances[poi.id] != null
                          ? `📏 ${distStr(distances[poi.id])}`
                          : '📍 Dia diem am thuc'}
                        {poi.triggerRadius && ` · Geofence ${poi.triggerRadius}m`}
                      </div>
                    </div>
                    <div className="poi-card-priority">
                      <span className="badge badge-orange">{'★'.repeat(poi.priority || 0)}</span>
                      {activePoiId === poi.id && (
                        <span className="badge badge-info">Đang phát</span>
                      )}
                      {nearbyPoi?.id === poi.id && (
                        <span className="badge badge-red">📍 Gần bạn</span>
                      )}
                    </div>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      )}

      {/* Below-map horizontal POI strip */}
      {view === 'map' && (
        <div className="poi-list" style={{ paddingTop: '0.5rem' }}>
          <div className="section-title">Địa điểm gần đây</div>
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: 8 }}>
            {loading ? (
              <div style={{ color: 'var(--clr-muted)', fontSize: '0.85rem', padding: '0.5rem' }}>
                Đang tải...
              </div>
            ) : (
              sortedPois.slice(0, 6).map(poi => (
                <div
                  key={poi.id}
                  onClick={() => navigate(`/poi/${poi.id}`)}
                  style={{
                    flexShrink: 0, width: 140,
                    background: 'var(--clr-surface)',
                    borderRadius: 12, padding: 10,
                    border: `1px solid ${activePoiId === poi.id ? 'rgba(125,60,152,0.4)' : 'var(--clr-border)'}`,
                    cursor: 'pointer',
                    boxShadow: 'var(--sh-sm)',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>🍜</div>
                  <div style={{
                    fontSize: '0.8rem', fontWeight: 700, marginBottom: 2,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {poi.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--clr-muted)' }}>
                    {distances[poi.id] != null ? distStr(distances[poi.id]) : '—'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
