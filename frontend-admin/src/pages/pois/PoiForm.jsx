import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Layout from '../../components/Layout/Layout';
import api from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';

// Fix Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: e => onMapClick(e.latlng) });
  return null;
}

const DEFAULT_POI = {
  name: '', latitude: '10.7553', longitude: '106.7053',
  triggerRadius: '100', priority: '3', isActive: true, ownerId: '', status: 'PENDING',
};

const DEFAULT_CONTENT = {
  title: '', description: '', ttsScript: '', imageUrls: '', audioFileUrl: '',
};

const LANGUAGE_OPTIONS = [
  { value: 'vi', label: 'Tieng Viet' },
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Francais' },
  { value: 'de', label: 'Deutsch' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh-CN', label: 'Chinese' },
  { value: 'es', label: 'Spanish' },
  { value: 'ru', label: 'Russian' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'th', label: 'Thai' },
  { value: 'ar', label: 'Arabic' },
  { value: 'tr', label: 'Turkish' },
  { value: 'id', label: 'Indonesian' },
];

function parseImageUrls(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch {
    // Fallback to newline-separated values.
  }
  return String(value).split('\n').map(item => item.trim()).filter(Boolean);
}

export default function PoiForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  // POI basic fields
  const [poi, setPoi] = useState(DEFAULT_POI);
  const [poiErrors, setPoiErrors] = useState({});

  // Content fields (chỉ nhập tiếng Việt — backend tự dịch + TTS)
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [contentErrors, setContentErrors] = useState({});

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStep, setSaveStep] = useState(''); // 'poi' | 'content' | ''
  const [users, setUsers] = useState([]);
  const [mapCenter, setMapCenter] = useState([10.7553, 106.7053]);
  const [previewLanguage, setPreviewLanguage] = useState('vi');
  const [previewContent, setPreviewContent] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      api.get('/users').then(r => setUsers(r.data)).catch(() => {});
    }

    if (isEdit) {
      setLoading(true);
      Promise.all([
        api.get(`/pois/${id}`),
        api.get(`/pois/${id}/content/vi`).catch(() => null),
      ]).then(([poiRes, contentRes]) => {
        const p = poiRes.data;
        setPoi({
          name: p.name || '',
          latitude: String(p.latitude),
          longitude: String(p.longitude),
          triggerRadius: String(p.triggerRadius ?? 100),
          priority: String(p.priority ?? 3),
          isActive: p.isActive ?? true,
          ownerId: p.ownerId ? String(p.ownerId) : '',
          status: p.status || 'PENDING',
        });
        setMapCenter([Number(p.latitude), Number(p.longitude)]);

        if (contentRes?.data) {
          const c = contentRes.data;
          setContent({
            title: c.title || '',
            description: c.description || '',
            ttsScript: c.ttsScript || '',
            imageUrls: parseImageUrls(c.imageUrls).join('\n'),
            audioFileUrl: c.audioFileUrl || '',
          });
        }
      }).catch(() => alert('Không thể tải dữ liệu POI'))
        .finally(() => setLoading(false));
    }
  }, [id, isAdmin, isEdit]);

  useEffect(() => {
    if (!isEdit) return;
    setPreviewLoading(true);
    api.get(`/pois/${id}/content/${previewLanguage}`)
      .then(({ data }) => setPreviewContent(data))
      .catch(() => setPreviewContent(null))
      .finally(() => setPreviewLoading(false));
  }, [id, isEdit, previewLanguage]);

  const handleImageUpload = async e => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadingImages(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await api.post('/uploads/images', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedUrls.push(data.url);
      }

      setContent(current => {
        const merged = [...parseImageUrls(current.imageUrls), ...uploadedUrls];
        return { ...current, imageUrls: merged.join('\n') };
      });
    } catch {
      alert('Khong the upload anh');
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  // ── Validation ──
  const validatePoi = () => {
    const e = {};
    if (!poi.name.trim()) e.name = 'Tên không được để trống';
    const lat = Number(poi.latitude), lng = Number(poi.longitude);
    if (isNaN(lat) || lat < -90 || lat > 90) e.latitude = 'Vĩ độ không hợp lệ (-90 đến 90)';
    if (isNaN(lng) || lng < -180 || lng > 180) e.longitude = 'Kinh độ không hợp lệ (-180 đến 180)';
    const r = Number(poi.triggerRadius);
    if (isNaN(r) || r < 10 || r > 1000) e.triggerRadius = 'Bán kính phải từ 10 – 1000 m';
    const p = Number(poi.priority);
    if (isNaN(p) || p < 1 || p > 5) e.priority = 'Ưu tiên phải từ 1 – 5';
    setPoiErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateContent = () => {
    const e = {};
    if (!content.title.trim()) e.title = 'Tiêu đề không được để trống';
    if (!content.ttsScript.trim()) e.ttsScript = 'Cần nhập script để hệ thống tạo audio thuyết minh';
    setContentErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Map click ──
  const handleMapClick = ({ lat, lng }) => {
    setPoi(f => ({ ...f, latitude: lat.toFixed(7), longitude: lng.toFixed(7) }));
  };

  // ── Submit ──
  const handleSubmit = async e => {
    e.preventDefault();
    const poiOk = validatePoi();
    const contentOk = validateContent();
    if (!poiOk || !contentOk) {
      // Scroll to first error
      document.querySelector('.form-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSaving(true);
    try {
      // STEP 1: Tạo / cập nhật POI
      setSaveStep('poi');
      const poiPayload = {
        name: poi.name.trim(),
        latitude: Number(poi.latitude),
        longitude: Number(poi.longitude),
        triggerRadius: Number(poi.triggerRadius),
        priority: Number(poi.priority),
        isActive: poi.isActive,
        ownerId: isAdmin && poi.ownerId ? Number(poi.ownerId) : null,
      };

      let poiId = id;
      if (isEdit) {
        await api.put(`/pois/${id}`, poiPayload);
      } else {
        const { data } = await api.post('/pois', poiPayload);
        poiId = data.id;
      }

      // STEP 2: Tạo / cập nhật POI Content (backend tự dịch 14 ngôn ngữ + TTS)
      setSaveStep('content');
      const imageUrlsArr = parseImageUrls(content.imageUrls);
      const contentPayload = {
        title: content.title.trim(),
        description: content.description.trim(),
        ttsScript: content.ttsScript.trim(),
        imageUrls: imageUrlsArr.length > 0 ? JSON.stringify(imageUrlsArr) : null,
        audioFileUrl: content.audioFileUrl.trim() || null,
      };

      await api.post(`/pois/${poiId}/content`, contentPayload);

      navigate('/pois');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Lỗi không xác định';
      alert(`Lỗi ở bước ${saveStep === 'poi' ? 'tạo POI' : 'tạo Content'}:\n${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
    } finally {
      setSaving(false);
      setSaveStep('');
    }
  };

  const lat = Number(poi.latitude), lng = Number(poi.longitude);
  const markerPos = (!isNaN(lat) && !isNaN(lng)) ? [lat, lng] : null;

  if (loading) return (
    <Layout title={isEdit ? 'Sửa POI' : 'Thêm POI mới'}>
      <div className="loading-center"><div className="spinner" /><span>Đang tải…</span></div>
    </Layout>
  );

  return (
    <Layout
      title={isEdit ? 'Sửa POI' : 'Thêm POI mới'}
      subtitle={isAdmin ? 'Điền đầy đủ thông tin — hệ thống tự dịch và tạo audio thuyết minh' : 'POI của chủ quán sẽ chờ Admin duyệt trước khi dịch và tạo audio'}
    >
      <form onSubmit={handleSubmit}>
        {!isAdmin && !isEdit && (
          <div className="alert alert-warning" style={{ marginBottom: '1rem' }}>
            POI bạn tạo sẽ ở trạng thái chờ duyệt. Sau khi Admin duyệt, hệ thống sẽ tự động dịch đa ngôn ngữ và tạo audio.
          </div>
        )}

        {/* ═══════════════════════════════════
            PHẦN 1: THÔNG TIN CƠ BẢN POI
            ═══════════════════════════════════ */}
        <div className="section-header" style={{ marginBottom: '0.75rem' }}>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--clr-accent)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ background: 'var(--clr-accent)', color: '#fff', borderRadius: '50%', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>1</span>
            Thông tin địa điểm (POI)
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
          {/* Basic Info */}
          <div className="card">
            <div className="card-header"><span className="card-title">📍 Thông tin cơ bản</span></div>
            <div className="card-body">

              <div className="form-group">
                <label className="form-label required">Tên địa điểm</label>
                <input id="poi-name" className={`form-input ${poiErrors.name ? 'error' : ''}`}
                  value={poi.name} onChange={e => setPoi(f => ({ ...f, name: e.target.value }))}
                  placeholder="Vd: Bánh Xèo Miền Nam" maxLength={255} />
                {poiErrors.name && <div className="form-error">{poiErrors.name}</div>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">Vĩ độ (lat)</label>
                  <input id="poi-lat" className={`form-input ${poiErrors.latitude ? 'error' : ''}`}
                    type="number" step="0.0000001"
                    value={poi.latitude} onChange={e => setPoi(f => ({ ...f, latitude: e.target.value }))} />
                  {poiErrors.latitude && <div className="form-error">{poiErrors.latitude}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label required">Kinh độ (lng)</label>
                  <input id="poi-lng" className={`form-input ${poiErrors.longitude ? 'error' : ''}`}
                    type="number" step="0.0000001"
                    value={poi.longitude} onChange={e => setPoi(f => ({ ...f, longitude: e.target.value }))} />
                  {poiErrors.longitude && <div className="form-error">{poiErrors.longitude}</div>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">Bán kính geofence (m)</label>
                  <input id="poi-radius" className={`form-input ${poiErrors.triggerRadius ? 'error' : ''}`}
                    type="number" min={10} max={1000}
                    value={poi.triggerRadius} onChange={e => setPoi(f => ({ ...f, triggerRadius: e.target.value }))} />
                  {poiErrors.triggerRadius && <div className="form-error">{poiErrors.triggerRadius}</div>}
                  <div className="form-hint">10 – 1000 mét</div>
                </div>
                <div className="form-group">
                  <label className="form-label required">Ưu tiên (1–5)</label>
                  <select id="poi-priority" className={`form-select ${poiErrors.priority ? 'error' : ''}`}
                    value={poi.priority} onChange={e => setPoi(f => ({ ...f, priority: e.target.value }))}>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{'★'.repeat(n)} ({n})</option>)}
                  </select>
                </div>
              </div>

              {isAdmin && (
                <div className="form-group">
                  <label className="form-label">Chủ quán (Owner)</label>
                  <select id="poi-owner" className="form-select"
                    value={poi.ownerId} onChange={e => setPoi(f => ({ ...f, ownerId: e.target.value }))}>
                    <option value="">— Không có —</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.username} ({u.role})</option>)}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Trạng thái</label>
                <button type="button" id="poi-status-toggle"
                  className={`badge ${poi.isActive ? 'badge-success' : 'badge-gray'}`}
                  style={{ cursor: 'pointer', padding: '6px 14px', border: 'none', fontSize: '0.875rem' }}
                  onClick={() => setPoi(f => ({ ...f, isActive: !f.isActive }))}>
                  {poi.isActive ? '● Hoạt động' : '○ Tắt'}
                </button>
              </div>
            </div>
          </div>

          {/* Map Picker */}
          <div className="card">
            <div className="card-header"><span className="card-title">🗺️ Chọn vị trí trên bản đồ</span></div>
            <div className="card-body">
              <div className="alert alert-info" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>
                💡 Click vào bản đồ để cập nhật tọa độ
              </div>
              <MapContainer center={markerPos || mapCenter} zoom={15}
                style={{ height: 280, borderRadius: 8, border: '1.5px solid var(--clr-border)' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapClickHandler onMapClick={handleMapClick} />
                {markerPos && <Marker position={markerPos} />}
              </MapContainer>
              <div style={{ marginTop: 6, fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>
                📍 {poi.latitude}, {poi.longitude}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════
            PHẦN 2: NỘI DUNG THUYẾT MINH
            ═══════════════════════════════════ */}
        <div className="section-header" style={{ marginBottom: '0.75rem' }}>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--clr-accent)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ background: 'var(--clr-accent)', color: '#fff', borderRadius: '50%', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>2</span>
            Nội dung thuyết minh (tiếng Việt)
          </span>
        </div>

        <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
          🌐 Nhập nội dung bằng <strong>tiếng Việt</strong>. Sau khi lưu, hệ thống sẽ tự động:{' '}
          <strong>dịch sang 14 ngôn ngữ</strong> (EN, ZH, JA, KO, FR…) và{' '}
          <strong>tạo file audio TTS</strong> cho từng ngôn ngữ.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>

          {/* Left: title + description */}
          <div className="card">
            <div className="card-header"><span className="card-title">📝 Nội dung hiển thị</span></div>
            <div className="card-body">

              <div className="form-group">
                <label className="form-label required">Tiêu đề (title)</label>
                <input id="content-title" className={`form-input ${contentErrors.title ? 'error' : ''}`}
                  value={content.title} maxLength={255}
                  onChange={e => setContent(c => ({ ...c, title: e.target.value }))}
                  placeholder="Vd: Bánh Xèo Miền Nam – Đặc Sản Phố Vĩnh Khánh" />
                {contentErrors.title && <div className="form-error">{contentErrors.title}</div>}
                <div className="form-hint">Tên hiển thị trên app du khách (khác với tên POI)</div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Mô tả chi tiết
                  <span style={{ fontWeight: 400, color: 'var(--clr-text-muted)', marginLeft: 6, fontSize: '0.8rem' }}>
                    (description — hiển thị trên màn hình detail)
                  </span>
                </label>
                <textarea id="content-description" className="form-textarea" rows={6}
                  value={content.description}
                  onChange={e => setContent(c => ({ ...c, description: e.target.value }))}
                  placeholder="Mô tả đầy đủ về địa điểm, lịch sử, đặc điểm, món ăn đặc trưng…&#10;&#10;Đây là nội dung du khách đọc trên app khi xem chi tiết địa điểm. Có thể viết dài, nhiều đoạn." />
                <div className="form-hint" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Nội dung hiển thị trên app — du khách đọc</span>
                  <span>{content.description.length} ký tự</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Hình ảnh (mỗi dòng 1 URL)</label>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
                <div className="form-hint">Anh upload se duoc luu vao backend/img.</div>
                {uploadingImages && <div className="form-hint">Dang upload anh...</div>}
                <textarea id="content-image-urls" className="form-textarea" rows={3}
                  value={content.imageUrls}
                  onChange={e => setContent(c => ({ ...c, imageUrls: e.target.value }))}
                  placeholder="https://example.com/hinh1.jpg&#10;https://example.com/hinh2.jpg" />
                <div className="form-hint">Lưu dạng JSON array, mỗi dòng 1 URL</div>
                {parseImageUrls(content.imageUrls).length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                    {parseImageUrls(content.imageUrls).map((url, i) => (
                      <img key={i} src={url.trim()} alt={`img-${i}`}
                        style={{ width: 72, height: 50, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--clr-border)' }}
                        onError={e => e.target.style.display = 'none'} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: ttsScript + audioFileUrl */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">🎙️ Script thuyết minh (TTS)</span>
            </div>
            <div className="card-body">
              <div style={{
                background: 'rgba(230,126,34,0.1)', border: '1px solid rgba(230,126,34,0.35)',
                borderRadius: 8, padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--clr-accent)',
              }}>
                🔊 <strong>ttsScript ≠ description</strong><br />
                <span style={{ color: 'var(--clr-text-2)', lineHeight: 1.5 }}>
                  Đây là đoạn văn bản <strong>TTS sẽ đọc thành giọng nói audio</strong>.
                  Viết ngắn gọn, tự nhiên như lời người hướng dẫn đang nói.
                  Backend dùng script này để tạo file MP3 và dịch sang 14 ngôn ngữ.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label required">
                  Script TTS
                  <span style={{ fontWeight: 400, color: 'var(--clr-text-muted)', marginLeft: 6, fontSize: '0.8rem' }}>
                    (ttsScript — hệ thống đọc thành audio)
                  </span>
                </label>
                <textarea id="content-tts-script" className={`form-textarea ${contentErrors.ttsScript ? 'error' : ''}`}
                  rows={9}
                  value={content.ttsScript}
                  onChange={e => setContent(c => ({ ...c, ttsScript: e.target.value }))}
                  placeholder="Viết như lời thuyết minh tự nhiên, ngắn gọn…&#10;&#10;Ví dụ:&#10;Chào mừng bạn đến với quán bánh xèo nổi tiếng tại phố Vĩnh Khánh! Đây là một trong những địa điểm ẩm thực trứ danh của Quận 4, với hơn 30 năm phục vụ thực khách. Bánh xèo tại đây giòn tan, nhân đầy tôm thịt, ăn kèm rau sống và nước mắm chua ngọt đặc biệt…" />
                {contentErrors.ttsScript && <div className="form-error">{contentErrors.ttsScript}</div>}
                <div className="form-hint" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Script TTS → generate audio MP3 tự động</span>
                  <span style={{ color: content.ttsScript.length > 800 ? 'var(--clr-danger)' : 'inherit' }}>
                    {content.ttsScript.length} ký tự
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  URL Audio MP3 có sẵn
                  <span style={{ fontWeight: 400, color: 'var(--clr-text-muted)', marginLeft: 6, fontSize: '0.8rem' }}>
                    (tuỳ chọn — để trống = TTS tự tạo)
                  </span>
                </label>
                <input id="content-audio-url" className="form-input" type="url"
                  value={content.audioFileUrl}
                  onChange={e => setContent(c => ({ ...c, audioFileUrl: e.target.value }))}
                  placeholder="https://example.com/audio-vi.mp3" />
                <div className="form-hint">
                  Nếu đã có file MP3 sẵn, nhập URL. Nếu trống, hệ thống dùng ttsScript để tạo audio.
                </div>
                {content.audioFileUrl && (
                  <audio controls src={content.audioFileUrl}
                    style={{ width: '100%', marginTop: 8, borderRadius: 8 }} />
                )}
              </div>
            </div>
          </div>
        </div>

        {isEdit && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="card-title">Xem lai noi dung theo ngon ngu</span>
              <select className="form-select" style={{ maxWidth: 220 }} value={previewLanguage} onChange={e => setPreviewLanguage(e.target.value)}>
                {LANGUAGE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="card-body">
              {previewLoading ? (
                <div className="loading-center"><div className="spinner" /><span>Dang tai noi dung...</span></div>
              ) : previewContent ? (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <div>
                    <div className="form-hint">Tieu de</div>
                    <div style={{ fontWeight: 700 }}>{previewContent.title || '-'}</div>
                  </div>
                  <div>
                    <div className="form-hint">Mo ta</div>
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{previewContent.description || '-'}</div>
                  </div>
                  <div>
                    <div className="form-hint">TTS Script</div>
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{previewContent.ttsScript || '-'}</div>
                  </div>
                  <div>
                    <div className="form-hint">Hinh anh</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {parseImageUrls(previewContent.imageUrls).map((url, index) => (
                        <img
                          key={`${url}-${index}`}
                          src={url}
                          alt={`preview-${index}`}
                          style={{ width: 120, height: 84, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--clr-border)' }}
                        />
                      ))}
                      {parseImageUrls(previewContent.imageUrls).length === 0 && <span>-</span>}
                    </div>
                  </div>
                  <div>
                    <div className="form-hint">Audio</div>
                    {previewContent.audioFileUrl ? (
                      <audio controls src={previewContent.audioFileUrl} style={{ width: '100%' }} />
                    ) : <span>-</span>}
                  </div>
                </div>
              ) : (
                <div className="alert alert-warning">Chua co noi dung cho ngon ngu nay.</div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
          {saving && (
            <span style={{ color: 'var(--clr-text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="spinner spinner-sm" />
              {saveStep === 'poi' ? 'Đang lưu POI…' : 'Đang tạo nội dung & dịch tự động…'}
            </span>
          )}
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/pois')} disabled={saving}>
            Hủy
          </button>
          <button id="save-poi-btn" type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Đang xử lý…' : isEdit ? '💾 Lưu thay đổi' : '✨ Tạo POI & Dịch tự động'}
          </button>
        </div>

      </form>
    </Layout>
  );
}
