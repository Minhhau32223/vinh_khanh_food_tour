/**
 * QRPage — Guest Web
 * Dùng jsqr (canvas-based) để quét QR từ camera HOẶC từ ảnh thư viện.
 * Hoạt động trên mọi trình duyệt (Chrome, Edge, Firefox, Safari) kể cả localhost.
 */
import jsQR from 'jsqr';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import { useAudio } from '../contexts/AudioContext';
import { useSession } from '../contexts/SessionContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseImages(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return String(raw).split('\n').map(s => s.trim()).filter(Boolean);
  }
}

/** Rút qr_value từ URL đầy đủ (nếu QR nhúng full URL) hoặc dùng thẳng */
function extractCode(raw) {
  const s = (raw || '').trim();
  try {
    const url = new URL(s);
    const parts = url.pathname.split('/qr/');
    if (parts.length > 1 && parts[1]) return decodeURIComponent(parts[1]);
  } catch { /* not a URL */ }
  return s;
}

// ─── POI Result Card ──────────────────────────────────────────────────────────
function PoiResultCard({ result, onReset }) {
  const { play, toggle, stop, playing, isPaused, progress, currentTime, duration, fmt } = useAudio();
  const { sessionId, language } = useSession();
  const isThisPoi = playing?.poiId === result?.poi?.id;

  // Tự động phát audio khi load xong
  useEffect(() => {
    if (!result?.content?.audioFileUrl) return;
    play({
      poiId:       result.poi.id,
      poiName:     result.content.title || result.poi.name,
      audioUrl:    result.content.audioFileUrl,
      sessionId,
      language,
      triggerType: 'QR',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result?.poi?.id]);

  const images = parseImages(result?.content?.imageUrls);

  const handlePlay = () => {
    if (!result.content?.audioFileUrl) return;
    if (isThisPoi) { toggle(); return; }
    play({
      poiId:       result.poi.id,
      poiName:     result.content.title || result.poi.name,
      audioUrl:    result.content.audioFileUrl,
      sessionId, language, triggerType: 'QR',
    });
  };

  return (
    <div style={{ display: 'grid', gap: '0.875rem' }}>
      {/* Info */}
      <div style={S.card}>
        <div style={S.poiName}>{result.content?.title || result.poi?.name}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '0.6rem' }}>
          <span className="badge badge-red">📡 QR</span>
          <span className="badge badge-orange">{result.language}</span>
          {result.usedFallbackToVietnamese && <span className="badge badge-orange">⚠️ Tiếng Việt</span>}
        </div>
        <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--clr-text-2)' }}>
          {result.content?.description || 'Chưa có mô tả cho địa điểm này.'}
        </p>
      </div>

      {/* Images */}
      {images.length > 0 && (
        <div style={S.card}>
          <div style={S.label}>📸 Hình ảnh</div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {images.map((url, i) => (
              <img key={`${url}-${i}`} src={url} alt={`img-${i}`}
                style={{ width: 160, height: 108, objectFit: 'cover', borderRadius: 12, flexShrink: 0 }} />
            ))}
          </div>
        </div>
      )}

      {/* Audio */}
      <div style={S.card}>
        <div style={S.label}>🎙️ Thuyết minh</div>
        {result.content?.audioFileUrl ? (
          <div className="audio-controls">
            <button className="play-btn" onClick={handlePlay}>
              {isThisPoi && !isPaused ? '⏸' : '▶'}
            </button>
            <div className="audio-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${isThisPoi ? progress : 0}%` }} />
              </div>
              <div className="progress-time">
                <span>{isThisPoi ? fmt(currentTime) : '0:00'}</span>
                <span>{isThisPoi && duration ? fmt(duration) : '—'}</span>
              </div>
            </div>
            {isThisPoi && (
              <button onClick={stop}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>⏹</button>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '0.75rem 0', color: 'var(--clr-muted)', fontSize: '0.85rem' }}>
            Chưa có audio thuyết minh
          </div>
        )}
      </div>

      <button onClick={onReset} style={S.primaryBtn}>
        📷 Quét QR khác
      </button>
    </div>
  );
}

// ─── Camera Scanner dùng jsQR ─────────────────────────────────────────────────
function CameraScanner({ onScan, onError }) {
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const streamRef  = useRef(null);
  const rafRef     = useRef(null);
  const [status, setStatus] = useState('starting'); // 'starting' | 'scanning' | 'found'

  useEffect(() => {
    let active = true;

    const tick = () => {
      const video  = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || !active) return;

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width  = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });
        if (code?.data) {
          setStatus('found');
          active = false;
          onScan(code.data);
          return;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } },
          audio: false,
        });
        if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.onloadedmetadata = () => {
            video.play().then(() => {
              setStatus('scanning');
              rafRef.current = requestAnimationFrame(tick);
            }).catch(err => { if (active) onError(err); });
          };
        }
      } catch (err) {
        if (active) onError(err);
      }
    };

    start();

    return () => {
      active = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, [onScan, onError]);

  return (
    <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', background: '#111', aspectRatio: '4/3' }}>
      <video ref={videoRef} muted playsInline
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />

      {/* Canvas ẩn để decode */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Scan overlay */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{
          width: 210, height: 210,
          border: '2.5px solid rgba(255,255,255,0.75)',
          borderRadius: 20,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* 4 góc đỏ */}
          {[
            { top: -2, left: -2,   borderTop:    '4px solid #c0392b', borderLeft:  '4px solid #c0392b' },
            { top: -2, right: -2,  borderTop:    '4px solid #c0392b', borderRight: '4px solid #c0392b' },
            { bottom: -2, left: -2,borderBottom: '4px solid #c0392b', borderLeft:  '4px solid #c0392b' },
            { bottom: -2, right: -2,borderBottom:'4px solid #c0392b', borderRight: '4px solid #c0392b' },
          ].map((s, i) => (
            <div key={i} style={{ position: 'absolute', width: 24, height: 24, borderRadius: 5, ...s }} />
          ))}

          {/* Đường scan chạy dọc */}
          {status === 'scanning' && (
            <div style={{
              position: 'absolute', top: 0, left: 6, right: 6, height: 2,
              background: 'linear-gradient(90deg, transparent, #e74c3c, transparent)',
              animation: 'qrLine 1.6s ease-in-out infinite',
              borderRadius: 2,
            }} />
          )}
          {status === 'found' && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(39,174,96,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '3rem',
            }}>✅</div>
          )}
        </div>
      </div>

      {/* Status label */}
      <div style={{
        position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center',
        color: 'white', fontSize: '0.78rem', fontWeight: 600,
        textShadow: '0 1px 4px rgba(0,0,0,0.8)',
      }}>
        {status === 'starting' && '⏳ Đang khởi động camera…'}
        {status === 'scanning' && '🔍 Hướng camera vào mã QR…'}
        {status === 'found'    && '✅ Đã nhận dạng QR!'}
      </div>
    </div>
  );
}

// ─── Main QRPage ──────────────────────────────────────────────────────────────
export default function QRPage() {
  const { qrValue: paramQrValue } = useParams();
  const navigate = useNavigate();
  const { language } = useSession();

  const [page,    setPage]    = useState('scanner'); // 'scanner' | 'result' | 'no_camera'
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const fileRef = useRef(null);

  // Có thể dùng getUserMedia không
  const hasGetUserMedia = !!navigator.mediaDevices?.getUserMedia;

  // Nếu URL có param qrValue → resolve ngay
  useEffect(() => {
    if (paramQrValue) resolveQR(paramQrValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramQrValue, language]);

  const resolveQR = useCallback(async (raw) => {
    const code = extractCode(raw);
    if (!code) return;
    setLoading(true);
    setError('');
    setPage('result');
    try {
      const { data } = await api.get(`/qr/${encodeURIComponent(code)}`, { params: { lang: language } });
      setResult(data);
    } catch {
      setResult(null);
      setError('Không tìm thấy nội dung QR này hoặc POI chưa sẵn sàng.');
      setPage('scanner');
    } finally {
      setLoading(false);
    }
  }, [language]);

  const handleReset = useCallback(() => {
    setResult(null);
    setError('');
    setPage('scanner');
    navigate('/qr', { replace: true });
  }, [navigate]);

  const handleCameraError = useCallback((err) => {
    // NotAllowedError = từ chối quyền; OverconstrainedError / các lỗi khác = ko có camera
    console.warn('[QRPage] camera error:', err?.name, err?.message);
    setPage('no_camera');
    if (err?.name === 'NotAllowedError') {
      setError('Trình duyệt chưa được cấp quyền camera. Bạn vẫn có thể chọn ảnh QR từ thư viện.');
    }
  }, []);

  // ── Đọc QR từ ảnh bằng jsQR (canvas) ────────────────────────────────────────
  const handleImageFile = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setError('');

    try {
      const imageBitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width  = imageBitmap.width;
      canvas.height = imageBitmap.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(imageBitmap, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth', // thử cả ảnh sáng và tối
      });

      if (code?.data) {
        resolveQR(code.data);
      } else {
        setError('Không tìm thấy mã QR trong ảnh. Hãy chọn ảnh rõ hơn hoặc chụp gần hơn.');
      }
    } catch (err) {
      console.error('[QRPage] image decode error:', err);
      setError('Không thể đọc ảnh. Vui lòng thử lại với ảnh khác.');
    }
  }, [resolveQR]);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes qrLine {
          0%   { transform: translateY(0px);   opacity: 1; }
          50%  { transform: translateY(200px); opacity: 0.6; }
          100% { transform: translateY(0px);   opacity: 1; }
        }
      `}</style>

      <div style={{ padding: '0 var(--sp-4) var(--sp-6)' }}>
        {/* Header */}
        <div style={{ paddingTop: 'var(--sp-4)', paddingBottom: 'var(--sp-4)' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--clr-text)', marginBottom: 3 }}>
            📷 Quét mã QR
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--clr-muted)' }}>
            Quét QR tại điểm tham quan để nghe thuyết minh tự động
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', padding: '2.5rem 0' }}>
            <div className="spinner" />
            <span style={{ color: 'var(--clr-text-2)', fontSize: '0.9rem' }}>Đang tải nội dung…</span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={S.errorBox}>⚠️ {error}</div>
        )}

        {/* Result */}
        {!loading && result && page === 'result' && (
          <PoiResultCard result={result} onReset={handleReset} />
        )}

        {/* Scanner */}
        {!loading && page === 'scanner' && (
          <>
            {hasGetUserMedia ? (
              <CameraScanner onScan={resolveQR} onError={handleCameraError} />
            ) : (
              <div style={{ ...S.card, textAlign: 'center', padding: '1.5rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📵</div>
                <div style={{ fontWeight: 700, color: 'var(--clr-text-2)', marginBottom: 4 }}>Camera không khả dụng</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--clr-muted)' }}>Trình duyệt không hỗ trợ. Hãy chọn ảnh QR bên dưới.</div>
              </div>
            )}

            <GalleryPicker fileRef={fileRef} onChange={handleImageFile} />
          </>
        )}

        {/* No camera / Permission denied → hiển thị picker thay thế */}
        {!loading && page === 'no_camera' && (
          <div style={S.card}>
            <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🚫</div>
              <div style={{ fontWeight: 700, color: 'var(--clr-text)', marginBottom: 6 }}>Camera bị từ chối</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--clr-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
                Cho phép camera trong cài đặt trình duyệt rồi tải lại trang,
                hoặc chọn ảnh QR từ thư viện.
              </div>
              <button
                style={{ ...S.outlineBtn, marginBottom: '0.5rem' }}
                onClick={() => { setPage('scanner'); setError(''); }}
              >
                🔄 Thử lại camera
              </button>
            </div>
            <GalleryPicker fileRef={fileRef} onChange={handleImageFile} />
          </div>
        )}
      </div>
    </>
  );
}

// ── Gallery Picker (dùng lại được) ────────────────────────────────────────────
function GalleryPicker({ fileRef, onChange }) {
  return (
    <div style={{ marginTop: '0.875rem' }}>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={onChange}
      />
      <button
        style={S.galleryBtn}
        onClick={() => fileRef.current?.click()}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--clr-primary)'; e.currentTarget.style.color = 'var(--clr-primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--clr-border)'; e.currentTarget.style.color = 'var(--clr-text-2)'; }}
      >
        🖼️&nbsp; Chọn ảnh QR từ thư viện
      </button>
      <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--clr-muted)', marginTop: 8 }}>
        Hỗ trợ JPG, PNG — chọn ảnh chứa mã QR
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  card: {
    background: 'var(--clr-surface)',
    border: '1px solid var(--clr-border)',
    borderRadius: 20,
    padding: '1rem',
  },
  errorBox: {
    background: 'rgba(230,126,34,0.1)',
    border: '1px solid rgba(230,126,34,0.3)',
    borderRadius: 14,
    padding: '0.85rem 1rem',
    fontSize: '0.875rem',
    color: '#8a4b08',
    marginBottom: '0.875rem',
  },
  poiName: {
    fontSize: '1.1rem', fontWeight: 800,
    color: 'var(--clr-text)', marginBottom: '0.5rem', lineHeight: 1.3,
  },
  label: {
    fontSize: '0.72rem', fontWeight: 700, color: 'var(--clr-muted)',
    textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.6rem',
  },
  galleryBtn: {
    display: 'block', width: '100%',
    padding: '0.9rem',
    borderRadius: 16,
    border: '2px dashed var(--clr-border)',
    background: 'var(--clr-surface)',
    fontSize: '0.9rem', fontWeight: 600,
    color: 'var(--clr-text-2)',
    cursor: 'pointer',
    transition: 'border-color .2s, color .2s',
  },
  primaryBtn: {
    display: 'block', width: '100%',
    padding: '0.9rem', borderRadius: 16, border: 'none',
    background: 'var(--grad-primary)',
    color: '#fff', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
  },
  outlineBtn: {
    display: 'block', width: '100%',
    padding: '0.8rem', borderRadius: 14,
    border: '1.5px solid var(--clr-border)',
    background: 'var(--clr-surface)',
    fontSize: '0.875rem', fontWeight: 600,
    color: 'var(--clr-text-2)', cursor: 'pointer',
  },
};
