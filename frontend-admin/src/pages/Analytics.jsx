import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout/Layout';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';

function normalizeOnlineDevice(device, index = 0) {
  if (typeof device === 'string') {
    const temporary = device.startsWith('ws_');
    return {
      id: `${device}-${index}`,
      deviceId: device,
      deviceName: temporary ? 'Dang ket noi...' : device,
      sessionId: null,
      browser: null,
      platform: null,
      currentPath: null,
      language: null,
      temporary,
      status: temporary ? 'CONNECTING' : 'ONLINE',
    };
  }

  const deviceId = device?.deviceId || device?.id || `unknown-${index}`;
  const temporary = Boolean(device?.temporary);
  return {
    id: `${deviceId}-${index}`,
    deviceId,
    deviceName: device?.deviceName || deviceId,
    sessionId: device?.sessionId || null,
    browser: device?.browser || null,
    platform: device?.platform || null,
    currentPath: device?.currentPath || null,
    language: device?.language || null,
    temporary,
    status: device?.status || (temporary ? 'CONNECTING' : 'ONLINE'),
  };
}

function StatCard({ icon, iconClass, label, value, onClick, highlight, badge }) {
  return (
    <div
      className="stat-card"
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        border: highlight ? '2px solid var(--clr-accent)' : undefined,
        background: highlight ? 'linear-gradient(135deg, #ebf4ff 0%, #f0f4ff 100%)' : undefined,
        position: 'relative',
      }}
      title={onClick ? 'Click de xem chi tiet' : undefined}
    >
      {onClick && (
        <span
          style={{
            position: 'absolute',
            top: 8,
            right: 10,
            fontSize: '0.65rem',
            color: 'var(--clr-text-muted)',
            fontWeight: 600,
            letterSpacing: '0.04em',
          }}
        >
          CHI TIET
        </span>
      )}
      {icon && <div className={`stat-icon ${iconClass || 'blue'}`}>{icon}</div>}
      <div className="stat-info">
        <div className="stat-label" style={highlight ? { color: 'var(--clr-accent)', fontWeight: 700 } : {}}>
          {label}
        </div>
        <div className="stat-value" style={highlight ? { color: 'var(--clr-accent)' } : {}}>
          {value}
        </div>
        {badge && <div style={{ marginTop: 4 }}>{badge}</div>}
      </div>
    </div>
  );
}

function DeviceRow({ device, tone = 'success' }) {
  return (
    <div style={{ display: 'grid', gap: 4 }}>
      <strong>{device.deviceName}</strong>
      <code
        style={{
          fontSize: '0.73rem',
          background: tone === 'warning' ? 'var(--clr-warning-light)' : '#f0fff4',
          padding: '3px 8px',
          borderRadius: 5,
          display: 'inline-block',
          maxWidth: 360,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {device.deviceId}
      </code>
      <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
        {[device.platform, device.browser, device.language && `Ngon ngu ${device.language}`].filter(Boolean).join(' · ') || 'Khong co metadata'}
      </div>
      {device.sessionId && (
        <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)' }}>
          Session: <code>{device.sessionId}</code>
        </div>
      )}
      {device.currentPath && (
        <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)' }}>
          Man hinh: <code>{device.currentPath}</code>
        </div>
      )}
    </div>
  );
}

function DeviceListModal({ devices, loading, onRefresh, onClose }) {
  const normalizedDevices = devices.map(normalizeOnlineDevice);
  const realDevices = normalizedDevices.filter(device => !device.temporary);
  const tempDevices = normalizedDevices.filter(device => device.temporary);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="modal-title">Thiet bi dang online</span>
            {!loading && <span className="badge badge-info">{normalizedDevices.length} thiet bi</span>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-sm btn-secondary" onClick={onRefresh} disabled={loading} title="Lam moi">
              {loading ? '...' : 'Refresh'}
            </button>
            <button className="modal-close" onClick={onClose}>x</button>
          </div>
        </div>

        <div className="modal-body" style={{ padding: 0, maxHeight: '70vh', overflowY: 'auto' }}>
          {loading ? (
            <div className="loading-center">
              <div className="spinner" />
              <span>Dang tai danh sach thiet bi...</span>
            </div>
          ) : normalizedDevices.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">Devices</div>
              <div className="empty-state-title">Chua co thiet bi nao online</div>
              <div className="empty-state-desc" style={{ maxWidth: 320, margin: '0 auto' }}>
                Mo guest app tren dien thoai hoac trinh duyet, doi vai giay roi bam refresh.
              </div>
              <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={onRefresh}>
                Thu lai
              </button>
            </div>
          ) : (
            <>
              {realDevices.length > 0 && (
                <>
                  <div
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      color: 'var(--clr-success)',
                      background: 'var(--clr-success-light)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Da xac thuc - {realDevices.length} thiet bi
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th style={{ width: 36 }}>#</th>
                        <th>Thiet bi</th>
                        <th style={{ textAlign: 'right', width: 100 }}>Trang thai</th>
                      </tr>
                    </thead>
                    <tbody>
                      {realDevices.map((device, i) => (
                        <tr key={device.id}>
                          <td style={{ color: 'var(--clr-text-muted)', fontWeight: 600 }}>{i + 1}</td>
                          <td><DeviceRow device={device} /></td>
                          <td style={{ textAlign: 'right' }}>
                            <span className="badge badge-success">Online</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {tempDevices.length > 0 && (
                <>
                  <div
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      color: 'var(--clr-warning)',
                      background: 'var(--clr-warning-light)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Dang ket noi - {tempDevices.length} thiet bi
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th style={{ width: 36 }}>#</th>
                        <th>WS connection</th>
                        <th style={{ textAlign: 'right', width: 100 }}>Trang thai</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tempDevices.map((device, i) => (
                        <tr key={device.id}>
                          <td style={{ color: 'var(--clr-text-muted)', fontWeight: 600 }}>{i + 1}</td>
                          <td><DeviceRow device={device} tone="warning" /></td>
                          <td style={{ textAlign: 'right' }}>
                            <span className="badge badge-warning">Ket noi...</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </>
          )}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)' }}>
            Thiet bi se roi danh sach sau khi mat heartbeat khoang 60-90 giay
          </span>
          <button className="btn btn-secondary" onClick={onClose}>Dong</button>
        </div>
      </div>
    </div>
  );
}

function StatDetailModal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>x</button>
        </div>
        <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
          {children}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Dong</button>
        </div>
      </div>
    </div>
  );
}

export default function Analytics() {
  const { isAdmin } = useAuth();
  const [topPois, setTopPois] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineDevices, setOnlineDevices] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [deviceLoading, setDeviceLoading] = useState(false);
  const [dashError, setDashError] = useState('');

  const openDeviceModal = useCallback(async () => {
    setActiveModal('devices');
    setDeviceLoading(true);
    try {
      const res = await api.get('/analytics/online-devices');
      setOnlineCount(res.data.count ?? 0);
      setOnlineDevices((res.data.devices ?? []).map(normalizeOnlineDevice));
    } catch {
      // Keep latest websocket snapshot when refresh fails.
    } finally {
      setDeviceLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return undefined;

    let ws = null;
    let reconnectTimeout = null;
    let isMounted = true;

    const connectWS = () => {
      if (!isMounted) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/admin`;

      try {
        ws = new WebSocket(wsUrl);
        ws.onmessage = event => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'online_count') {
              setOnlineCount(data.count ?? 0);
              setOnlineDevices((data.devices ?? []).map(normalizeOnlineDevice));
            }
          } catch {
            // Ignore malformed realtime payloads.
          }
        };
        ws.onclose = () => {
          if (isMounted) reconnectTimeout = setTimeout(connectWS, 5000);
        };
      } catch {
        // Ignore websocket bootstrap errors.
      }
    };

    connectWS();
    return () => {
      isMounted = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
    };
  }, [isAdmin]);

  useEffect(() => {
    let cancelled = false;
    const requests = [
      api.get('/analytics/top-pois').then(r => ({ top: r.data })),
    ];

    if (isAdmin) {
      requests.push(
        api.get('/analytics/dashboard')
          .then(r => ({ dash: r.data }))
          .catch(err => ({
            dashErr: err.response?.status === 403 ? 'Khong co quyen xem tong quan.' : 'Khong tai duoc tong quan.',
          })),
      );
    }

    Promise.all(requests)
      .then(parts => {
        if (cancelled) return;
        let top = [];
        let dash = null;
        let dashboardError = '';

        for (const part of parts) {
          if (part.top) top = part.top;
          if (part.dash) dash = part.dash;
          if (part.dashErr) dashboardError = part.dashErr;
        }

        setTopPois(top);
        setDashboard(dash);
        setDashError(dashboardError);
      })
      .catch(() => {
        if (!cancelled) setTopPois([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const maxPlays = topPois[0]?.playCount || 1;
  const topWithAvg = topPois.filter(p => p.avgDurationSeconds != null && !Number.isNaN(p.avgDurationSeconds));
  const avgTopListenSec = topWithAvg.length
    ? Math.round(topWithAvg.reduce((sum, poi) => sum + poi.avgDurationSeconds, 0) / topWithAvg.length)
    : null;

  const fmtDur = seconds => (seconds == null || Number.isNaN(seconds) ? '-' : `${Math.round(seconds)}s`);
  const fmtMin = seconds => {
    if (seconds == null || seconds <= 0) return '-';
    const minutes = Math.floor(seconds / 60);
    const remain = Math.round(seconds % 60);
    return minutes > 0 ? `${minutes}p ${remain}s` : `${remain}s`;
  };

  return (
    <Layout
      title="Phan tich va thong ke"
      subtitle={isAdmin ? 'Tong quan he thong va luot nghe thuyet minh' : 'Top dia diem duoc nghe nhieu'}
    >
      {activeModal === 'devices' && (
        <DeviceListModal
          devices={onlineDevices}
          loading={deviceLoading}
          onRefresh={openDeviceModal}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'poi' && dashboard && (
        <StatDetailModal title="Chi tiet thong ke POI" onClose={() => setActiveModal(null)}>
          <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
            <StatCard icon="POI" iconClass="blue" label="Tong POI" value={dashboard.totalPois} />
            <StatCard icon="..." iconClass="orange" label="Cho duyet" value={dashboard.pendingPois} />
            <StatCard icon="OK" iconClass="green" label="Da duyet" value={dashboard.approvedPois} />
            <StatCard icon="ON" iconClass="green" label="Da duyet va bat" value={dashboard.approvedActivePois} />
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)', padding: '0.5rem 0' }}>
            Ti le duyet: <strong>{dashboard.totalPois > 0 ? Math.round((dashboard.approvedPois / dashboard.totalPois) * 100) : 0}%</strong>
            {' · '}
            Ti le kich hoat: <strong>{dashboard.approvedPois > 0 ? Math.round((dashboard.approvedActivePois / dashboard.approvedPois) * 100) : 0}%</strong>
          </div>
        </StatDetailModal>
      )}

      {activeModal === 'tours' && dashboard && (
        <StatDetailModal title="Chi tiet thong ke Tour" onClose={() => setActiveModal(null)}>
          <div className="stats-grid">
            <StatCard icon="Tour" iconClass="blue" label="Tong Tour" value={dashboard.totalTours} />
            <StatCard icon="OK" iconClass="green" label="Dang hoat dong" value={dashboard.activeTours} />
            <StatCard icon="OFF" iconClass="orange" label="Khong hoat dong" value={dashboard.totalTours - dashboard.activeTours} />
          </div>
        </StatDetailModal>
      )}

      {activeModal === 'plays' && dashboard && (
        <StatDetailModal title="Chi tiet luot phat thuyet minh" onClose={() => setActiveModal(null)}>
          <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
            <StatCard icon="Play" iconClass="green" label="Tong luot phat" value={dashboard.totalPlayEvents} />
            <StatCard icon="Time" iconClass="orange" label="Tong giay da ghi" value={fmtMin(dashboard.totalListeningSecondsRecorded)} />
            <StatCard
              icon="Avg"
              iconClass="orange"
              label="TB giay luot"
              value={dashboard.avgListeningSecondsPerPlayWithDuration != null ? `${Math.round(dashboard.avgListeningSecondsPerPlayWithDuration)}s` : '-'}
            />
          </div>
          {(dashboard.playsByTriggerType || []).length > 0 && (
            <>
              <div style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                Luot phat theo loai kich hoat
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Trigger</th>
                      <th style={{ textAlign: 'right' }}>So luot</th>
                      <th style={{ textAlign: 'right' }}>Ti le</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.playsByTriggerType.map(row => (
                      <tr key={row.triggerType}>
                        <td><code>{row.triggerType}</code></td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{row.count}</td>
                        <td style={{ textAlign: 'right', color: 'var(--clr-text-muted)' }}>
                          {Math.round((row.count / (dashboard.totalPlayEvents || 1)) * 100)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </StatDetailModal>
      )}

      {activeModal === 'sessions' && dashboard && (
        <StatDetailModal title="Chi tiet phien du khach" onClose={() => setActiveModal(null)}>
          <div className="stats-grid">
            <StatCard icon="Users" iconClass="green" label="Tong phien" value={dashboard.totalSessions} />
            <StatCard icon="5m" iconClass="orange" label="Hoat dong 5 phut" value={dashboard.activeSessionsLast5Minutes} />
            <StatCard icon="30m" iconClass="blue" label="Hoat dong 30 phut" value={dashboard.activeSessionsLast30Minutes} />
          </div>
          <div className="alert alert-info" style={{ marginTop: '1rem' }}>
            Phien hoat dong duoc tinh theo session co log vi tri hoac phat audio trong khoang thoi gian do.
          </div>
        </StatDetailModal>
      )}

      {isAdmin && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="card-header">
            <span className="card-title">Tong quan admin</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)' }}>
              Click vao thong ke de xem chi tiet
            </span>
          </div>
          {dashError && <div className="alert alert-danger" style={{ margin: '1rem' }}>{dashError}</div>}
          {!loading && dashboard && (
            <div className="card-body">
              <div className="stats-grid" style={{ marginBottom: '1rem' }}>
                <StatCard
                  icon="POI"
                  iconClass="blue"
                  label="Tong POI"
                  value={dashboard.totalPois}
                  onClick={() => setActiveModal('poi')}
                  badge={<span className="badge badge-success">{dashboard.approvedActivePois} dang bat</span>}
                />

                <StatCard
                  icon="Tour"
                  iconClass="blue"
                  label="Tour (hoat dong / tong)"
                  value={`${dashboard.activeTours} / ${dashboard.totalTours}`}
                  onClick={() => setActiveModal('tours')}
                />

                <StatCard
                  icon="User"
                  iconClass="green"
                  label="Phien du khach"
                  value={dashboard.totalSessions}
                  onClick={() => setActiveModal('sessions')}
                  badge={<span className="badge badge-info">{dashboard.activeSessionsLast5Minutes} active / 5 phut</span>}
                />

                <StatCard
                  icon="Play"
                  iconClass="green"
                  label="Luot phat"
                  value={dashboard.totalPlayEvents}
                  onClick={() => setActiveModal('plays')}
                  badge={<span className="badge badge-gray">Tong nghe {fmtMin(dashboard.totalListeningSecondsRecorded)}</span>}
                />

                <div
                  className="stat-card"
                  onClick={openDeviceModal}
                  style={{
                    cursor: 'pointer',
                    border: '2px solid var(--clr-accent)',
                    background: 'linear-gradient(135deg, #e8f0fe 0%, #f0f4ff 100%)',
                    position: 'relative',
                  }}
                  title="Click de xem danh sach thiet bi"
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 10,
                      fontSize: '0.65rem',
                      color: 'var(--clr-accent)',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                    }}
                  >
                    XEM DANH SACH
                  </span>
                  <div className="stat-info">
                    <div
                      className="stat-label"
                      style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--clr-accent)' }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          background: '#ef4444',
                          borderRadius: '50%',
                          display: 'inline-block',
                          animation: 'pulse 1.5s infinite',
                        }}
                      />
                      Dang Online (Realtime)
                    </div>
                    <div className="stat-value" style={{ color: 'var(--clr-accent)', fontSize: '2rem' }}>
                      {onlineCount}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--clr-accent)', marginTop: 2, opacity: 0.7 }}>
                      thiet bi dang ket noi
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {loading && <div className="loading-center"><div className="spinner" /></div>}
        </div>
      )}

      {!isAdmin && (
        <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
          Ban dang xem thong ke luot nghe theo POI. Tong quan he thong chi danh cho admin.
        </div>
      )}

      <div className="stats-grid">
        <StatCard icon="Top" iconClass="blue" label="So POI trong top" value={topPois.length} />
        <StatCard icon="Play" iconClass="green" label="Tong luot (top)" value={topPois.reduce((sum, poi) => sum + (poi.playCount || 0), 0)} />
        <StatCard icon="Avg" iconClass="orange" label="TB giay nghe (top)" value={avgTopListenSec != null ? `${avgTopListenSec}s` : '-'} />
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Top POI theo luot phat</span>
          <span className="badge badge-info">Top 10</span>
        </div>
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : topPois.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">Stats</div>
            <div className="empty-state-title">Chua co du lieu thong ke</div>
            <div className="empty-state-desc">Du lieu se hien thi khi guest bat dau nghe thuyet minh</div>
          </div>
        ) : (
          <div className="card-body">
            {topPois.map((poi, i) => {
              const name = poi.poiName || poi.poi?.name || `POI #${poi.poiId}`;
              const avg = poi.avgDurationSeconds ?? poi.avgDuration;
              return (
                <div key={poi.poiId || poi.poi?.id || i} style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: i < 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][i] : 'var(--clr-border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: i < 3 ? '#fff' : 'var(--clr-text-muted)',
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
                          TB nghe {fmtDur(avg)} · {poi.playCount} luot
                        </div>
                      </div>
                    </div>
                    <span className="badge badge-info">{poi.playCount} luot</span>
                  </div>
                  <div style={{ background: 'var(--clr-border)', borderRadius: 99, height: 8 }}>
                    <div
                      style={{
                        width: `${Math.round((poi.playCount / maxPlays) * 100)}%`,
                        background: 'linear-gradient(90deg, var(--clr-accent), #6366f1)',
                        height: '100%',
                        borderRadius: 99,
                        transition: 'width 0.6s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
