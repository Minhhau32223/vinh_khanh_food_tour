import { useMemo, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import Layout from '../components/Layout/Layout';

function normalizeUrl(value) {
  const trimmed = (value || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export default function GuestQRGenerator() {
  const [guestUrl, setGuestUrl] = useState('http://localhost:3000/');
  const [generated, setGenerated] = useState(false);
  const canvasWrapRef = useRef(null);

  const fullUrl = useMemo(() => normalizeUrl(guestUrl), [guestUrl]);

  const handleGenerate = () => {
    if (!fullUrl) return;
    setGenerated(true);
  };

  const handleCopy = async () => {
    if (!fullUrl) return;
    try {
      await navigator.clipboard.writeText(fullUrl);
      alert('Da copy URL guest.');
    } catch {
      alert(fullUrl);
    }
  };

  const handleDownload = () => {
    const canvas = canvasWrapRef.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `guest-home-qr-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <Layout
      title="QR Truy cap Guest"
      subtitle="Chi can nhap 1 URL trang chu guest va tao QR"
    >
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'grid', gap: '1.25rem' }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">URL trang chu Guest</span>
          </div>
          <div className="card-body" style={{ display: 'grid', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label required">Nhap 1 URL day du</label>
              <input
                id="guest-home-url"
                className="form-input"
                type="text"
                placeholder="https://guest-domain.com/"
                value={guestUrl}
                onChange={e => {
                  setGuestUrl(e.target.value);
                  setGenerated(false);
                }}
              />
              <div className="form-hint">
                Vi du: <code>https://guest-domain.com/</code> hoac <code>http://localhost:3000/</code>
              </div>
            </div>

            <div
              style={{
                background: 'var(--clr-surface-2)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                border: '1px solid var(--clr-border)',
                display: 'grid',
                gap: 6,
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Link nhung vao QR</div>
              <code style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>
                {fullUrl || 'Chua co URL hop le'}
              </code>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                id="generate-guest-home-qr"
                type="button"
                className="btn btn-primary"
                onClick={handleGenerate}
                disabled={!fullUrl}
              >
                Tao QR
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCopy}
                disabled={!fullUrl}
              >
                Copy URL
              </button>
            </div>
          </div>
        </div>

        {generated && fullUrl && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Ma QR da tao</span>
              <button type="button" className="btn btn-primary btn-sm" onClick={handleDownload}>
                Tai PNG
              </button>
            </div>
            <div className="card-body" style={{ display: 'grid', justifyItems: 'center', gap: '1rem' }}>
              <div
                ref={canvasWrapRef}
                style={{
                  padding: 20,
                  background: '#ffffff',
                  borderRadius: 16,
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <QRCodeCanvas
                  value={fullUrl}
                  size={256}
                  fgColor="#111827"
                  bgColor="#ffffff"
                  level="H"
                  includeMargin
                />
              </div>

              <div style={{ textAlign: 'center', maxWidth: 480 }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', marginBottom: 4 }}>
                  Khach quet QR se mo link nay
                </div>
                <a href={fullUrl} target="_blank" rel="noreferrer" style={{ fontWeight: 600, wordBreak: 'break-all' }}>
                  {fullUrl}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
