import { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';

export default function Analytics() {
  const { isAdmin } = useAuth();
  const [topPois, setTopPois] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashError, setDashError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setDashError('');
    const requests = [
      api.get('/analytics/top-pois').then(r => ({ top: r.data })),
    ];
    if (isAdmin) {
      requests.push(
        api.get('/analytics/dashboard').then(r => ({ dash: r.data })).catch(err => {
          const msg = err.response?.status === 403
            ? 'Không có quyền xem tổng quan.'
            : 'Không tải được tổng quan.';
          return { dashErr: msg };
        })
      );
    }
    Promise.all(requests)
      .then(parts => {
        if (cancelled) return;
        let top = [];
        let dash = null;
        let dErr = '';
        for (const p of parts) {
          if (p.top) top = p.top;
          if (p.dash) dash = p.dash;
          if (p.dashErr) dErr = p.dashErr;
        }
        setTopPois(top);
        setDashboard(dash);
        setDashError(dErr);
      })
      .catch(() => {
        if (!cancelled) setTopPois([]);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isAdmin]);

  const maxPlays = topPois[0]?.playCount || 1;
  const topWithAvg = topPois.filter(p => p.avgDurationSeconds != null && !Number.isNaN(p.avgDurationSeconds));
  const avgTopListenSec = topWithAvg.length
    ? Math.round(topWithAvg.reduce((s, p) => s + p.avgDurationSeconds, 0) / topWithAvg.length)
    : null;

  const fmtDur = s => (s == null || Number.isNaN(s) ? '—' : `${Math.round(s)}s`);
  const fmtMin = sec => {
    if (sec == null || sec <= 0) return '—';
    const m = Math.floor(sec / 60);
    const r = Math.round(sec % 60);
    return m > 0 ? `${m}p ${r}s` : `${r}s`;
  };

  return (
    <Layout
      title="Phân tích & Thống kê"
      subtitle={isAdmin ? 'Tổng quan hệ thống và lượt nghe thuyết minh' : 'Top địa điểm được nghe nhiều'}
    >
      {isAdmin && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="card-header">
            <span className="card-title">🏢 Tổng quan (Admin)</span>
          </div>
          {dashError && <div className="alert alert-danger" style={{ margin: '1rem' }}>{dashError}</div>}
          {!loading && dashboard && (
            <div className="card-body">
              <div className="stats-grid" style={{ marginBottom: '1rem' }}>
                <div className="stat-card">
                  <div className="stat-icon blue">📍</div>
                  <div className="stat-info">
                    <div className="stat-label">Tổng POI</div>
                    <div className="stat-value">{dashboard.totalPois}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon orange">⏳</div>
                  <div className="stat-info">
                    <div className="stat-label">Chờ duyệt</div>
                    <div className="stat-value">{dashboard.pendingPois}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon green">✅</div>
                  <div className="stat-info">
                    <div className="stat-label">Đã duyệt</div>
                    <div className="stat-value">{dashboard.approvedPois}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon blue">🟢</div>
                  <div className="stat-info">
                    <div className="stat-label">Đã duyệt &amp; bật</div>
                    <div className="stat-value">{dashboard.approvedActivePois}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon blue">🗺️</div>
                  <div className="stat-info">
                    <div className="stat-label">Tour (hoạt động / tổng)</div>
                    <div className="stat-value">{dashboard.activeTours} / {dashboard.totalTours}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon green">👤</div>
                  <div className="stat-info">
                    <div className="stat-label">Phiên du khách</div>
                    <div className="stat-value">{dashboard.totalSessions}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon green">▶️</div>
                  <div className="stat-info">
                    <div className="stat-label">Lượt phát (log)</div>
                    <div className="stat-value">{dashboard.totalPlayEvents}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon orange">⏱️</div>
                  <div className="stat-info">
                    <div className="stat-label">Tổng giây đã ghi</div>
                    <div className="stat-value">{fmtMin(dashboard.totalListeningSecondsRecorded)}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon orange">📈</div>
                  <div className="stat-info">
                    <div className="stat-label">TB giây/lượt (có duration)</div>
                    <div className="stat-value">
                      {dashboard.avgListeningSecondsPerPlayWithDuration != null
                        ? `${Math.round(dashboard.avgListeningSecondsPerPlayWithDuration)}s`
                        : '—'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="section-header" style={{ marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                Lượt phát theo loại kích hoạt
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Trigger</th>
                      <th style={{ textAlign: 'right' }}>Số lượt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dashboard.playsByTriggerType || []).length === 0 ? (
                      <tr><td colSpan={2} style={{ color: 'var(--clr-text-muted)' }}>Chưa có dữ liệu</td></tr>
                    ) : (
                      dashboard.playsByTriggerType.map(row => (
                        <tr key={row.triggerType}>
                          <td><code>{row.triggerType}</code></td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>{row.count}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {!isAdmin && (
        <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
          Bạn đang xem thống kê lượt nghe theo POI. Tổng quan hệ thống chỉ dành cho Admin.
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">🏆</div>
          <div className="stat-info">
            <div className="stat-label">Số POI trong Top</div>
            <div className="stat-value">{topPois.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">▶️</div>
          <div className="stat-info">
            <div className="stat-label">Tổng lượt (Top)</div>
            <div className="stat-value">{topPois.reduce((s, p) => s + (p.playCount || 0), 0)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">⏱️</div>
          <div className="stat-info">
            <div className="stat-label">TB giây nghe (Top)</div>
            <div className="stat-value">
              {avgTopListenSec != null ? `${avgTopListenSec}s` : '—'}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">🏆 Top POI theo lượt phát</span>
          <span className="badge badge-info">Top 10</span>
        </div>
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : topPois.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <div className="empty-state-title">Chưa có dữ liệu thống kê</div>
            <div className="empty-state-desc">Dữ liệu hiển thị khi du khách bắt đầu nghe thuyết minh</div>
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
                      <span style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: i < 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][i] : 'var(--clr-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 700, color: i < 3 ? '#fff' : 'var(--clr-text-muted)',
                        flexShrink: 0
                      }}>
                        {i + 1}
                      </span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
                          TB nghe {fmtDur(avg)} · {poi.playCount} lượt
                        </div>
                      </div>
                    </div>
                    <span className="badge badge-info">{poi.playCount} lượt</span>
                  </div>
                  <div style={{ background: 'var(--clr-border)', borderRadius: 99, height: 8 }}>
                    <div style={{
                      width: `${Math.round((poi.playCount / maxPlays) * 100)}%`,
                      background: 'linear-gradient(90deg, var(--clr-accent), #6366f1)',
                      height: '100%', borderRadius: 99,
                      transition: 'width 0.6s ease'
                    }} />
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
