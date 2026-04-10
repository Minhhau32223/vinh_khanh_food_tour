import { useEffect, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Layout from '../components/Layout/Layout';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';

// ---------- Config ----------
// URL gốc của Guest Web — đổi theo môi trường thực tế
const GUEST_ORIGIN = import.meta.env.VITE_GUEST_ORIGIN || 'http://localhost:5174';

function buildGuestUrl(qrValue) {
  return `${GUEST_ORIGIN}/qr/${encodeURIComponent(qrValue)}`;
}

// ---------- QR Modal ----------
function QRModal({ poi, qr, onClose, onRegenerate, generating, isAdmin }) {
  if (!poi) return null;
  const guestUrl = qr ? buildGuestUrl(qr.qrValue) : null;

  const downloadPng = () => {
    const svgEl = document.getElementById('modal-qr-svg')?.querySelector('svg');
    if (!svgEl) return;
    const size = 400;
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `qr-${poi.name.replace(/\s+/g, '_')}.png`;
      link.click();
    };
    img.src = url;
  };

  const copyLink = async () => {
    if (!guestUrl) return;
    try {
      await navigator.clipboard.writeText(guestUrl);
      alert('✅ Đã copy link Guest!');
    } catch {
      alert('Link: ' + guestUrl);
    }
  };

  const copyValue = async () => {
    if (!qr) return;
    try {
      await navigator.clipboard.writeText(qr.qrValue);
      alert('✅ Đã copy mã QR!');
    } catch {
      alert('Mã QR: ' + qr.qrValue);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal modal-lg" style={{ maxWidth: 520 }}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            📱 QR Code — {poi.name}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ textAlign: 'center' }}>
          {qr ? (
            <>
              {/* QR image lớn */}
              <div
                id="modal-qr-svg"
                style={{
                  display: 'inline-block',
                  background: '#fff',
                  padding: 20,
                  borderRadius: 16,
                  border: '2px solid var(--clr-border)',
                  boxShadow: 'var(--shadow-md)',
                  marginBottom: '1.25rem',
                  lineHeight: 0,
                }}
              >
                <QRCodeSVG
                  value={guestUrl}
                  size={220}
                  level="H"
                  includeMargin={false}
                />
              </div>

              {/* Info chips */}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <span className="badge badge-success">POI #{poi.id}</span>
                <span className="badge badge-info">{poi.status || 'PENDING'}</span>
              </div>

              {/* Guest URL */}
              <div style={{
                background: 'var(--clr-surface-2)',
                border: '1px solid var(--clr-border)',
                borderRadius: 10,
                padding: '0.6rem 1rem',
                marginBottom: '0.75rem',
                fontSize: '0.8rem',
                wordBreak: 'break-all',
                textAlign: 'left',
              }}>
                <div style={{ color: 'var(--clr-text-muted)', fontWeight: 600, marginBottom: 4, fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  URL Guest Web
                </div>
                <a href={guestUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--clr-accent)' }}>
                  {guestUrl}
                </a>
              </div>

              {/* QR Value raw */}
              <div style={{
                background: 'var(--clr-surface-2)',
                border: '1px solid var(--clr-border)',
                borderRadius: 10,
                padding: '0.6rem 1rem',
                fontSize: '0.8rem',
                textAlign: 'left',
                marginBottom: '1rem',
              }}>
                <div style={{ color: 'var(--clr-text-muted)', fontWeight: 600, marginBottom: 4, fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Mã QR (qr_value)
                </div>
                <code style={{ wordBreak: 'break-all' }}>{qr.qrValue}</code>
              </div>
            </>
          ) : (
            <div style={{ padding: '2rem 0', color: 'var(--clr-text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📱</div>
              <div style={{ fontWeight: 600 }}>POI này chưa có QR code</div>
              <div style={{ fontSize: '0.85rem', marginTop: 8 }}>
                Nhấn &quot;Tạo QR&quot; để khởi tạo mã QR cho POI này.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div className="flex gap-2">
            {isAdmin && (
              <button
                className="btn btn-primary"
                onClick={() => onRegenerate(poi)}
                disabled={generating === poi.id || poi.status !== 'APPROVED'}
                title={poi.status !== 'APPROVED' ? 'POI phải được duyệt trước' : ''}
              >
                {generating === poi.id
                  ? <><span className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> Đang tạo…</>
                  : qr ? '🔄 Tạo lại QR' : '✨ Tạo QR'}
              </button>
            )}
          </div>
          {qr && (
            <div className="flex gap-2">
              <button className="btn btn-secondary" onClick={downloadPng}>⬇️ Tải PNG</button>
              <button className="btn btn-secondary" onClick={copyLink}>📋 Copy link</button>
              <button className="btn btn-secondary" onClick={copyValue}>Copy mã</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Main Page ----------
export default function QRManagementPage() {
  const { isAdmin } = useAuth();
  const [pois, setPois] = useState([]);
  const [qrResults, setQrResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);
  const [modalPoi, setModalPoi] = useState(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [{ data: poiData }, { data: qrData }] = await Promise.all([
          api.get('/pois'),
          api.get('/qr/admin'),
        ]);
        if (cancelled) return;
        setPois(poiData);
        setQrResults(Object.fromEntries(qrData.map(item => [item.poiId, item])));
      } catch {
        if (!cancelled) { setPois([]); setQrResults({}); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const visiblePois = useMemo(() => {
    const base = pois.filter(poi => isAdmin || poi.ownerId != null);
    if (!searchText.trim()) return base;
    const q = searchText.toLowerCase();
    return base.filter(p => p.name?.toLowerCase().includes(q) || String(p.id).includes(q));
  }, [isAdmin, pois, searchText]);

  const generateQR = async poi => {
    setGenerating(poi.id);
    try {
      const { data } = await api.post(`/qr/${poi.id}`, { note: 'Generated from dashboard' });
      setQrResults(prev => ({ ...prev, [poi.id]: data }));
      // Refresh modal nếu đang mở cho POI này
      setModalPoi(prev => (prev?.id === poi.id ? poi : prev));
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể tạo QR');
    } finally {
      setGenerating(null);
    }
  };

  const stats = useMemo(() => ({
    total: visiblePois.length,
    hasQR: visiblePois.filter(p => qrResults[p.id]).length,
    approved: visiblePois.filter(p => p.status === 'APPROVED').length,
  }), [visiblePois, qrResults]);

  return (
    <Layout
      title="Quản lý QR Code"
      subtitle={isAdmin ? 'Tạo và quản lý QR cho tất cả POI' : 'Xem QR của POI bạn quản lý'}
    >
      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon blue">📍</div>
          <div className="stat-info">
            <div className="stat-label">Tổng POI</div>
            <div className="stat-value">{stats.total}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-info">
            <div className="stat-label">Đã có QR</div>
            <div className="stat-value">{stats.hasQR}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">⏳</div>
          <div className="stat-info">
            <div className="stat-label">Chưa có QR</div>
            <div className="stat-value">{stats.total - stats.hasQR}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">🏆</div>
          <div className="stat-info">
            <div className="stat-label">Đã duyệt</div>
            <div className="stat-value">{stats.approved}</div>
          </div>
        </div>
      </div>

      <div className="alert alert-info">
        💡 Mỗi QR code nhúng URL Guest Web. Du khách scan QR → mở trang POI với nội dung đa ngôn ngữ và audio thuyết minh, không cần GPS.
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Danh sách QR theo POI</span>
          <input
            className="form-input"
            style={{ maxWidth: 240 }}
            placeholder="🔍 Tìm POI theo tên..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>POI</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'center' }}>QR Preview</th>
                  <th>Guest URL</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {visiblePois.map(poi => {
                  const qr = qrResults[poi.id];
                  const guestUrl = qr ? buildGuestUrl(qr.qrValue) : null;
                  return (
                    <tr key={poi.id}>
                      {/* POI info */}
                      <td>
                        <div style={{ fontWeight: 600 }}>{poi.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
                          POI #{poi.id}{poi.ownerId ? ` · Owner #${poi.ownerId}` : ''}
                        </div>
                      </td>

                      {/* Status badges */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                          <span className={`badge ${poi.status === 'APPROVED' ? 'badge-success' : 'badge-warning'}`}>
                            {poi.status || 'PENDING'}
                          </span>
                          <span className={`badge ${poi.isActive ? 'badge-success' : 'badge-danger'}`}>
                            {poi.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>

                      {/* QR Preview nhỏ */}
                      <td style={{ textAlign: 'center', padding: '8px 16px' }}>
                        {qr ? (
                          <div
                            style={{
                              display: 'inline-block',
                              background: '#fff',
                              padding: 8,
                              borderRadius: 10,
                              border: '1px solid var(--clr-border)',
                              cursor: 'pointer',
                              transition: 'box-shadow .2s',
                            }}
                            title="Click để xem chi tiết QR"
                            onClick={() => setModalPoi(poi)}
                          >
                            <QRCodeSVG
                              value={guestUrl}
                              size={64}
                              level="M"
                              includeMargin={false}
                            />
                          </div>
                        ) : (
                          <span style={{ color: 'var(--clr-text-muted)', fontSize: '0.85rem' }}>—</span>
                        )}
                      </td>

                      {/* Guest URL */}
                      <td>
                        {guestUrl ? (
                          <div>
                            <a
                              href={guestUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}
                            >
                              /qr/{qr.qrValue}
                            </a>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--clr-text-muted)' }}>—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setModalPoi(poi)}
                          >
                            🔍 Xem QR
                          </button>
                          {isAdmin && (
                            <button
                              id={`gen-qr-${poi.id}`}
                              className="btn btn-primary btn-sm"
                              onClick={() => generateQR(poi)}
                              disabled={generating === poi.id || poi.status !== 'APPROVED'}
                              title={poi.status !== 'APPROVED' ? 'POI cần được duyệt trước' : ''}
                            >
                              {generating === poi.id
                                ? <span className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} />
                                : qr ? '🔄' : '✨'
                              }
                              {' '}{qr ? 'Tạo lại' : 'Tạo QR'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {visiblePois.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state" style={{ padding: '2rem 0' }}>
                        <div className="empty-state-icon">📱</div>
                        <div className="empty-state-title">Không tìm thấy POI nào</div>
                        <div className="empty-state-desc">Thử tìm kiếm với từ khóa khác</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalPoi && (
        <QRModal
          poi={modalPoi}
          qr={qrResults[modalPoi.id]}
          generating={generating}
          isAdmin={isAdmin}
          onClose={() => setModalPoi(null)}
          onRegenerate={generateQR}
        />
      )}
    </Layout>
  );
}
