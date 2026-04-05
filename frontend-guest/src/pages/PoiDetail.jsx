import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useSession } from '../contexts/SessionContext';
import { useAudio } from '../contexts/AudioContext';

function parseImageUrls(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch {
    // Fall back to a single image URL string.
  }
  return [value].filter(Boolean);
}

function AudioPlayer({ content, poi }) {
  const { play, stop, toggle, progress, currentTime, duration, fmt, isPaused, playing } = useAudio();
  const { sessionId, language } = useSession();

  const isThisPoi = playing?.poiId === poi?.id;

  const handlePlay = () => {
    if (!content?.audioFileUrl) return;
    if (isThisPoi) { toggle(); return; }
    play({
      poiId: poi.id,
      poiName: content.title || poi.name,
      audioUrl: content.audioFileUrl,
      sessionId, language,
      triggerType: 'MANUAL',
    });
  };

  if (!content?.audioFileUrl && !content?.ttsScript) {
    return (
      <div className="audio-player" style={{ textAlign: 'center', color: 'var(--clr-muted)' }}>
        <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎵</div>
        <div style={{ fontSize: '0.875rem' }}>Chưa có audio thuyết minh</div>
      </div>
    );
  }

  return (
    <div className="audio-player">
      <div className="audio-player-title">
        🎙️ Audio Thuyết Minh
        {isThisPoi && !isPaused && (
          <div className="sound-wave" style={{ marginLeft: 'auto' }}>
            {[1,2,3,4].map(i => <div key={i} className="sound-bar" />)}
          </div>
        )}
      </div>
      <div className="audio-controls">
        <button id="play-btn" className="play-btn" onClick={handlePlay}>
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
          <button onClick={stop} style={{ background: 'none', border: 'none', font: 'inherit', cursor: 'pointer', color: 'var(--clr-muted)', padding: 4 }}>
            ⏹
          </button>
        )}
      </div>
      {content.ttsScript && !content.audioFileUrl && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--clr-surface-2)', borderRadius: 8, fontSize: '0.85rem', color: 'var(--clr-text-2)' }}>
          📝 {content.ttsScript}
        </div>
      )}
    </div>
  );
}

export default function PoiDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useSession();
  const [poi, setPoi] = useState(null);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    Promise.all([
      api.get(`/pois/${id}`),
      api.get(`/pois/${id}/content/${language}`)
        .catch(() => language !== 'vi'
          ? api.get(`/pois/${id}/content/vi`).then(r => ({ ...r, _fallback: true })).catch(() => null)
          : null
        )
    ]).then(([poiRes, contentRes]) => {
      setPoi(poiRes.data);
      if (contentRes) {
        setContent(contentRes.data);
        setFallback(!!contentRes._fallback);
      }
    }).catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, language, navigate]);

  if (loading) return (
    <div className="page-loading">
      <div className="spinner" />
      <span>Đang tải…</span>
    </div>
  );
  if (!poi) return null;

  const images = parseImageUrls(content?.imageUrls);

  return (
    <div>
      {/* Hero */}
      <div className="detail-hero">
        <button id="back-btn" className="back-btn" onClick={() => navigate(-1)}>←</button>
        {images[0] ? (
          <img src={images[0]} alt={content?.title || poi.name} />
        ) : (
          <div style={{ background: 'linear-gradient(135deg, #c0392b, #e67e22)', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>
            🍜
          </div>
        )}
        <div className="detail-hero-overlay">
          <div className="detail-hero-title">{content?.title || poi.name}</div>
        </div>
      </div>

      {/* Body */}
      <div className="detail-body">
        {/* Meta badges */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span className="badge badge-orange">{'★'.repeat(poi.priority)}</span>
          <span className="badge badge-red">📏 Geofence {poi.triggerRadius}m</span>
          {fallback && (
            <span className="badge badge-orange" style={{ fontSize: '0.65rem' }}>
              ⚠️ Nội dung tiếng Việt (chưa có bản dịch)
            </span>
          )}
        </div>

        {/* Description */}
        {content?.description ? (
          <p className="detail-desc">{content.description}</p>
        ) : (
          <div className="empty-page" style={{ padding: '2rem 0' }}>
            <div className="empty-page-icon">📝</div>
            <div className="empty-page-title">Chưa có mô tả</div>
          </div>
        )}

        {/* Image Carousel */}
        {images.length > 1 && (
          <div>
            <div className="section-title" style={{ padding: '0 0 0.5rem' }}>📸 Hình ảnh</div>
            <div className="image-carousel">
              {images.map((url, i) => (
                <img key={i} src={url} alt={`${i+1}`} className="carousel-img" />
              ))}
            </div>
          </div>
        )}

        {/* Audio Player */}
        <div className="section-title" style={{ padding: '0 0 0.5rem' }}>🎙️ Thuyết minh</div>
        <AudioPlayer content={content} poi={poi} />

        {/* Location info */}
        <div style={{ background: 'var(--clr-surface-2)', borderRadius: 12, padding: '1rem', marginTop: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--clr-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' }}>
            📍 Vị trí
          </div>
          <div style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
            {Number(poi.latitude).toFixed(6)}, {Number(poi.longitude).toFixed(6)}
          </div>
        </div>
      </div>
    </div>
  );
}
