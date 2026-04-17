import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import Layout from '../../components/Layout/Layout';
import api from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';

const GUEST_ORIGIN = import.meta.env.VITE_GUEST_ORIGIN || 'http://localhost:5174';

function parseImageUrls(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch {
    // Fall back to newline or single URL values.
  }
  return String(value).split('\n').map(item => item.trim()).filter(Boolean);
}

export default function PoiView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [poi, setPoi] = useState(null);
  const [contents, setContents] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('vi');
  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState(null);
  const [generatingQR, setGeneratingQR] = useState(false);
  const svgContainerRef = useRef(null);

  const guestQRUrl = qrData ? `${GUEST_ORIGIN}/qr/${encodeURIComponent(qrData.qrValue)}` : null;

  const generateQR = async () => {
    if (!poi) return;
    setGeneratingQR(true);
    try {
      const { data } = await api.post(`/qr/${poi.id}`, { note: 'Generated from PoiView' });
      setQrData(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể tạo QR');
    } finally {
      setGeneratingQR(false);
    }
  };

  const downloadQR = () => {
    const svgEl = svgContainerRef.current?.querySelector('svg');
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
      link.download = `qr-poi-${id}.png`;
      link.click();
    };
    img.src = url;
  };

  const copyGuestLink = async () => {
    if (!guestQRUrl) return;
    try {
      await navigator.clipboard.writeText(guestQRUrl);
      alert('✅ Đã copy link Guest!');
    } catch {
      alert('Link: ' + guestQRUrl);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: poiData }, { data: contentData }] = await Promise.all([
        api.get(`/pois/${id}`),
        api.get(`/pois/${id}/contents`),
      ]);
      setPoi(poiData);
      setContents(contentData);
      if (contentData.length > 0) {
        setSelectedLanguage(current => (
          contentData.some(item => item.languageCode === current)
            ? current
            : contentData[0].languageCode
        ));
      }
      // Load QR nếu có
      try {
        const { data: allQR } = await api.get('/qr/admin');
        const found = allQR.find(q => String(q.poiId) === String(id));
        if (found) setQrData(found);
      } catch { /* QR optional */ }
    } catch {
      alert('Khong the tai noi dung POI');
      navigate('/pois');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const selectedContent = useMemo(
    () => contents.find(item => item.languageCode === selectedLanguage) || null,
    [contents, selectedLanguage],
  );

  return (
    <Layout
      title={poi ? `Xem POI #${poi.id}` : 'Xem POI'}
      subtitle={poi?.name || 'Xem nội dung đã tạo theo từng ngôn ngữ'}
      actions={
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => navigate('/pois')}>
            Quay lại
          </button>
          <button className="btn btn-primary" onClick={() => navigate(`/pois/${id}/edit`)}>
            Sửa POI
          </button>
        </div>
      }
    >
      {loading ? (
        <div className="loading-center"><div className="spinner" /><span>Đang tải...</span></div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div className="card">
            <div className="card-header"><span className="card-title">Thông tin POI</span></div>
            <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1rem' }}>
              <div>
                <div className="form-hint">Ten</div>
                <div style={{ fontWeight: 700 }}>{poi?.name}</div>
              </div>
              <div>
                <div className="form-hint">Trạng thái</div>
                <span className={`badge ${poi?.status === 'APPROVED' ? 'badge-success' : 'badge-orange'}`}>
                  {poi?.status || 'PENDING'}
                </span>
              </div>
              <div>
                <div className="form-hint">Geofence</div>
                <div>{poi?.triggerRadius} m</div>
              </div>
              <div>
                <div className="form-hint">Tọa độ</div>
                <div>{poi ? `${poi.latitude}, ${poi.longitude}` : '-'}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="card-title">Nội dung theo ngôn ngữ</span>
              <select className="form-select" style={{ maxWidth: 220 }} value={selectedLanguage} onChange={e => setSelectedLanguage(e.target.value)}>
                {contents.map(item => (
                  <option key={item.languageCode} value={item.languageCode}>
                    {item.languageCode}
                  </option>
                ))}
              </select>
            </div>
            <div className="card-body">
              {selectedContent ? (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <div className="form-hint">Tieu de</div>
                    <div style={{ fontWeight: 700 }}>{selectedContent.title || '-'}</div>
                  </div>
                  <div>
                    <div className="form-hint">Mo ta</div>
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{selectedContent.description || '-'}</div>
                  </div>
                  <div>
                    <div className="form-hint">TTS script</div>
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{selectedContent.ttsScript || '-'}</div>
                  </div>
                  <div>
                    <div className="form-hint">Anh</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {parseImageUrls(selectedContent.imageUrls).map((url, index) => (
                        <img
                          key={`${url}-${index}`}
                          src={url}
                          alt={`poi-${index}`}
                          style={{ width: 140, height: 96, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--clr-border)' }}
                        />
                      ))}
                      {parseImageUrls(selectedContent.imageUrls).length === 0 && <span>-</span>}
                    </div>
                  </div>
                  <div>
                    <div className="form-hint">Audio</div>
                    {selectedContent.audioFileUrl ? (
                      <audio controls src={selectedContent.audioFileUrl} style={{ width: '100%' }} />
                    ) : <span>-</span>}
                  </div>
                </div>
              ) : (
                <div className="alert alert-warning">POI này chưa có nội dung cho ngôn ngữ được chọn.</div>
              )}
            </div>
          </div>

          {/* QR Code Card */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="card-title">📱 QR Code</span>
              {isAdmin && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={generateQR}
                  disabled={generatingQR || poi?.status !== 'APPROVED'}
                  title={poi?.status !== 'APPROVED' ? 'POI phải được duyệt để tạo QR' : ''}
                >
                  {generatingQR
                    ? <><span className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> Đang tạo…</>
                    : qrData ? '🔄 Tạo lại QR' : '✨ Tạo QR'
                  }
                </button>
              )}
            </div>
            <div className="card-body">
              {qrData ? (
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                  {/* QR image */}
                  <div
                    ref={svgContainerRef}
                    style={{
                      background: '#fff',
                      padding: 16,
                      borderRadius: 16,
                      border: '2px solid var(--clr-border)',
                      boxShadow: 'var(--shadow-md)',
                      lineHeight: 0,
                      flexShrink: 0,
                    }}
                  >
                    <QRCodeSVG
                      value={guestQRUrl}
                      size={180}
                      level="H"
                      includeMargin={false}
                    />
                  </div>

                  {/* Info + actions */}
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div className="form-hint">Guest URL (nhúng vào QR)</div>
                      <a
                        href={guestQRUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}
                      >
                        {guestQRUrl}
                      </a>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <div className="form-hint">Mã QR (qr_value)</div>
                      <code style={{ fontSize: '0.8rem', background: 'var(--clr-surface-2)', padding: '4px 8px', borderRadius: 6, wordBreak: 'break-all', display: 'inline-block' }}>
                        {qrData.qrValue}
                      </code>
                    </div>
                    <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                      <button className="btn btn-secondary btn-sm" onClick={downloadQR}>⬇️ Tải PNG</button>
                      <button className="btn btn-secondary btn-sm" onClick={copyGuestLink}>📋 Copy link</button>
                    </div>
                    <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>
                      Du khách scan QR → Guest web hiển thị nội dung POI + audio thuyết minh
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--clr-text-muted)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📱</div>
                  <div style={{ fontWeight: 600 }}>Chưa có QR code cho POI này</div>
                  <div style={{ fontSize: '0.85rem', marginTop: 6 }}>
                    {poi?.status !== 'APPROVED'
                      ? 'POI phải được duyệt (APPROVED) trước khi tạo QR.'
                      : 'Nhấn "Tạo QR" ở trên để khởi tạo.'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
