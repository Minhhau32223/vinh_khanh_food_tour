import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api/client';
import { useGeofence } from '../hooks/useGeofence';
import { useSession } from '../contexts/SessionContext';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom red icon for active POI
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const VN_CENTER = [10.7800, 106.7000]; // Vĩnh Khánh default

function distStr(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export default function Home() {
  const [pois, setPois] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPos, setUserPos] = useState(null);
  const [view, setView] = useState('map'); // 'map' | 'list'
  const [nearbyPoi, setNearbyPoi] = useState(null);
  const [distances, setDistances] = useState({});
  const navigate = useNavigate();
  const { haversineKm } = useGeofence({ pois, onNearby: setNearbyPoi });

  useEffect(() => {
    api.get('/pois')
      .then(r => setPois(r.data.filter(p => p.isActive !== false)))
      .catch(() => {})
      .finally(() => setLoading(false));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
      }, () => {});
    }
  }, []);

  // Calculate distances when userPos changes
  useEffect(() => {
    if (!userPos || !pois.length) return;
    const d = {};
    pois.forEach(poi => {
      d[poi.id] = haversineKm(userPos[0], userPos[1], Number(poi.latitude), Number(poi.longitude));
    });
    setDistances(d);
  }, [userPos, pois]);

  const sortedPois = [...pois].sort((a, b) => {
    const da = distances[a.id] ?? 999, db = distances[b.id] ?? 999;
    return da - db;
  });

  const mapCenter = userPos || VN_CENTER;

  return (
    <div>
      {/* View Toggle */}
      <div style={{ position: 'relative', height: view === 'map' ? 'calc(100dvh - 130px)' : 'auto' }}>
        {view === 'map' ? (
          <div className="map-container">
            <MapContainer center={mapCenter} zoom={16} style={{ height: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {/* User location marker */}
              {userPos && (
                <Marker position={userPos} icon={redIcon}>
                  <Popup>📍 Vị trí của bạn</Popup>
                </Marker>
              )}
              {/* POI markers with geofence circles */}
              {pois.map(poi => (
                <span key={poi.id}>
                  <Marker
                    position={[Number(poi.latitude), Number(poi.longitude)]}
                    eventHandlers={{ click: () => navigate(`/poi/${poi.id}`) }}
                  >
                    <Popup>
                      <div style={{ minWidth: 140 }}>
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>{poi.name}</div>
                        {distances[poi.id] != null && (
                          <div style={{ fontSize: '0.8rem', color: '#667' }}>
                            📏 {distStr(distances[poi.id])}
                          </div>
                        )}
                        <button
                          onClick={() => navigate(`/poi/${poi.id}`)}
                          style={{ marginTop: 8, background: '#c0392b', color: '#fff', border: 'none', borderRadius: 8, padding: '4px 12px', cursor: 'pointer', width: '100%' }}
                        >
                          Xem chi tiết →
                        </button>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${Number(poi.latitude)},${Number(poi.longitude)}${userPos ? `&origin=${userPos[0]},${userPos[1]}` : ''}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ display: 'inline-block', marginTop: 8, fontSize: '0.8rem' }}
                        >
                          Mở chỉ đường
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                  <Circle
                    center={[Number(poi.latitude), Number(poi.longitude)]}
                    radius={poi.triggerRadius || 100}
                    pathOptions={{ color: '#c0392b', fillColor: '#c0392b', fillOpacity: 0.05, weight: 1, dashArray: '4' }}
                  />
                </span>
              ))}
            </MapContainer>
            {/* Floating toggle */}
            <div className="view-toggle">
              <button className="view-toggle-btn active" onClick={() => setView('map')}>🗺️ Bản đồ</button>
              <button className="view-toggle-btn" onClick={() => setView('list')}>📋 Danh sách</button>
            </div>
          </div>
        ) : null}
      </div>

      {/* List View */}
      {view === 'list' || view === 'map' ? (
        <div>
          {view === 'list' && (
            <div style={{ position: 'relative' }}>
              <div className="view-toggle" style={{ position: 'relative', top: 0, right: 0, margin: '1rem 1rem 0 auto', width: 'fit-content' }}>
                <button className="view-toggle-btn" onClick={() => setView('map')}>🗺️ Bản đồ</button>
                <button className="view-toggle-btn active" onClick={() => setView('list')}>📋 Danh sách</button>
              </div>
            </div>
          )}

          {view === 'list' && (
            <div className="poi-list">
              <div className="section-title">
                {userPos ? `📍 ${sortedPois.length} địa điểm gần bạn` : `🍜 ${pois.length} địa điểm ẩm thực`}
              </div>

              {loading ? (
                <div className="page-loading"><div className="spinner" /><span>Đang tải…</span></div>
              ) : sortedPois.length === 0 ? (
                <div className="empty-page">
                  <div className="empty-page-icon">📍</div>
                  <div className="empty-page-title">Không có địa điểm</div>
                </div>
              ) : sortedPois.map(poi => (
                <a key={poi.id} className="poi-card" onClick={() => navigate(`/poi/${poi.id}`)}>
                  <div className="poi-card-inner">
                    <div className="poi-card-icon">🍜</div>
                    <div className="poi-card-info">
                      <div className="poi-card-name">{poi.name}</div>
                      <div className="poi-card-dist">
                        {distances[poi.id] != null ? `📏 ${distStr(distances[poi.id])}` : '📍 Địa điểm ẩm thực'}
                        {poi.triggerRadius && ` · Geofence ${poi.triggerRadius}m`}
                      </div>
                    </div>
                    <div className="poi-card-priority">
                      <span className="badge badge-orange">{'★'.repeat(poi.priority)}</span>
                      {nearbyPoi?.id === poi.id && (
                        <span className="badge badge-red">📍 Gần bạn</span>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Below map POI list strip */}
      {view === 'map' && (
        <div className="poi-list" style={{ paddingTop: '0.5rem' }}>
          <div className="section-title">Địa điểm gần đây</div>
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: 8 }}>
            {sortedPois.slice(0, 6).map(poi => (
              <div key={poi.id}
                onClick={() => navigate(`/poi/${poi.id}`)}
                style={{
                  flexShrink: 0, width: 140,
                  background: 'var(--clr-surface)',
                  borderRadius: 12, padding: 10,
                  border: '1px solid var(--clr-border)',
                  cursor: 'pointer',
                  boxShadow: 'var(--sh-sm)',
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>🍜</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {poi.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--clr-muted)' }}>
                  {distances[poi.id] != null ? distStr(distances[poi.id]) : '—'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
