import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import { useSession } from '../contexts/SessionContext';
import { useAudio } from '../contexts/AudioContext';

function QRResolvedContent({ result }) {
  const { play, playing, toggle, stop, progress, currentTime, duration, fmt, isPaused } = useAudio();
  const { sessionId, language } = useSession();
  const isThisPoi = playing?.poiId === result?.poi?.id;

  if (!result) return null;

  const handlePlay = () => {
    if (!result.content?.audioFileUrl) return;
    if (isThisPoi) {
      toggle();
      return;
    }
    play({
      poiId: result.poi.id,
      poiName: result.content.title || result.poi.name,
      audioUrl: result.content.audioFileUrl,
      sessionId,
      language,
      triggerType: 'QR',
    });
  };

  const images = (() => {
    const raw = result.content?.imageUrls;
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return String(raw).split('\n').map(item => item.trim()).filter(Boolean);
    }
  })();

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <div style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: 20, padding: '1rem' }}>
        <div className="section-title" style={{ padding: 0 }}>
          {result.content?.title || result.poi?.name}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <span className="badge badge-red">QR trigger</span>
          <span className="badge badge-orange">{result.language}</span>
          {result.usedFallbackToVietnamese && <span className="badge badge-orange">Fallback ve tieng Viet</span>}
        </div>
        <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
          {result.content?.description || 'Chua co mo ta cho POI nay.'}
        </p>
      </div>

      {images.length > 0 && (
        <div style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: 20, padding: '1rem' }}>
          <div className="section-title" style={{ padding: 0 }}>Hinh anh</div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
            {images.map((url, index) => (
              <img key={`${url}-${index}`} src={url} alt={`qr-${index}`} style={{ width: 180, height: 120, objectFit: 'cover', borderRadius: 12 }} />
            ))}
          </div>
        </div>
      )}

      <div style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: 20, padding: '1rem' }}>
        <div className="section-title" style={{ padding: 0 }}>Audio</div>
        {result.content?.audioFileUrl ? (
          <>
            <div className="audio-controls">
              <button className="play-btn" onClick={handlePlay}>
                {isThisPoi && !isPaused ? 'â¸' : 'â–¶'}
              </button>
              <div className="audio-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${isThisPoi ? progress : 0}%` }} />
                </div>
                <div className="progress-time">
                  <span>{isThisPoi ? fmt(currentTime) : '0:00'}</span>
                  <span>{isThisPoi && duration ? fmt(duration) : 'â€”'}</span>
                </div>
              </div>
              {isThisPoi && (
                <button onClick={stop} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>â¹</button>
              )}
            </div>
            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--clr-muted)' }}>
              Ma QR: <code>{result.qrValue}</code>
            </div>
          </>
        ) : (
          <div className="empty-page" style={{ padding: '1rem 0' }}>
            <div className="empty-page-title">Chua co audio</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function QRPage() {
  const { qrValue } = useParams();
  const navigate = useNavigate();
  const { language } = useSession();
  const [manualCode, setManualCode] = useState(qrValue || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const videoRef = useRef(null);
  const detectorRef = useRef(null);
  const scanTimer = useRef(null);
  const streamRef = useRef(null);

  const supportsCameraScan = useMemo(
    () => typeof window !== 'undefined' && 'BarcodeDetector' in window && !!navigator.mediaDevices?.getUserMedia,
    []
  );

  useEffect(() => {
    if (!qrValue) {
      setResult(null);
      setError('');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');
    api.get(`/qr/${qrValue}`, { params: { lang: language } })
      .then(({ data }) => {
        if (!cancelled) setResult(data);
      })
      .catch(() => {
        if (!cancelled) {
          setResult(null);
          setError('Khong tim thay noi dung QR hoac POI chua san sang.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [qrValue, language]);

  useEffect(() => {
    if (!cameraEnabled || !supportsCameraScan) return undefined;

    let active = true;
    detectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] });

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (!active) return;
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraReady(true);
        }

        scanTimer.current = window.setInterval(async () => {
          if (!videoRef.current || !detectorRef.current) return;
          try {
            const codes = await detectorRef.current.detect(videoRef.current);
            const value = codes?.[0]?.rawValue?.trim();
            if (value) {
              window.clearInterval(scanTimer.current);
              navigate(`/qr/${encodeURIComponent(value)}`);
            }
          } catch {
            // keep scanning
          }
        }, 900);
      } catch {
        setError('Trinh duyet khong mo duoc camera. Ban van co the nhap ma QR thu cong.');
      }
    };

    startCamera();

    return () => {
      active = false;
      setCameraReady(false);
      if (scanTimer.current) window.clearInterval(scanTimer.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [cameraEnabled, navigate, supportsCameraScan]);

  const submitManualCode = e => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    navigate(`/qr/${encodeURIComponent(manualCode.trim())}`);
  };

  return (
    <div style={{ padding: '0 var(--sp-4) var(--sp-4)' }}>
      <div className="section-title">QR trigger</div>

      <div style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: 20, padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Nhap ma QR hoac scan bang camera</div>
        <form onSubmit={submitManualCode} style={{ display: 'flex', gap: 8, marginBottom: supportsCameraScan ? '0.75rem' : 0 }}>
          <input
            style={{ flex: 1, borderRadius: 14, border: '1px solid var(--clr-border)', padding: '0.9rem 1rem', font: 'inherit', background: '#fff' }}
            value={manualCode}
            onChange={e => setManualCode(e.target.value)}
            placeholder="Dan hoac nhap gia tri QR"
          />
          <button type="submit" style={{ border: 'none', borderRadius: 14, background: 'var(--clr-primary)', color: '#fff', padding: '0 1rem', fontWeight: 700 }}>
            Mo
          </button>
        </form>

        {supportsCameraScan && (
          <>
            <button
              type="button"
              onClick={() => setCameraEnabled(prev => !prev)}
              style={{ border: '1px solid var(--clr-border)', borderRadius: 14, background: '#fff', padding: '0.8rem 1rem', fontWeight: 600 }}
            >
              {cameraEnabled ? 'Tat camera' : 'Bat camera scan QR'}
            </button>
            {cameraEnabled && (
              <div style={{ marginTop: '0.75rem' }}>
                <video ref={videoRef} muted playsInline style={{ width: '100%', borderRadius: 16, background: '#111' }} />
                <div style={{ fontSize: '0.8rem', color: 'var(--clr-muted)', marginTop: 8 }}>
                  {cameraReady ? 'Dang quet QR...' : 'Dang khoi dong camera...'}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {loading && <div className="page-loading"><div className="spinner" /><span>Dang tai noi dung QR...</span></div>}
      {error && (
        <div style={{ marginBottom: '1rem', borderRadius: 16, padding: '0.9rem 1rem', background: 'rgba(230,126,34,0.12)', color: '#8a4b08', border: '1px solid rgba(230,126,34,0.25)' }}>
          {error}
        </div>
      )}
      {!loading && result && <QRResolvedContent result={result} />}
    </div>
  );
}
