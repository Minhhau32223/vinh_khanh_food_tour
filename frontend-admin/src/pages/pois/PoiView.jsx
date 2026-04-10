import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import api from '../../api/client';

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
  const [poi, setPoi] = useState(null);
  const [contents, setContents] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('vi');
  const [loading, setLoading] = useState(true);

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
      subtitle={poi?.name || 'Xem noi dung da tao theo tung ngon ngu'}
      actions={
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => navigate('/pois')}>
            Quay lai
          </button>
          <button className="btn btn-primary" onClick={() => navigate(`/pois/${id}/edit`)}>
            Sua POI
          </button>
        </div>
      }
    >
      {loading ? (
        <div className="loading-center"><div className="spinner" /><span>Dang tai...</span></div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div className="card">
            <div className="card-header"><span className="card-title">Thong tin POI</span></div>
            <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1rem' }}>
              <div>
                <div className="form-hint">Ten</div>
                <div style={{ fontWeight: 700 }}>{poi?.name}</div>
              </div>
              <div>
                <div className="form-hint">Trang thai</div>
                <span className={`badge ${poi?.status === 'APPROVED' ? 'badge-success' : 'badge-orange'}`}>
                  {poi?.status || 'PENDING'}
                </span>
              </div>
              <div>
                <div className="form-hint">Geofence</div>
                <div>{poi?.triggerRadius} m</div>
              </div>
              <div>
                <div className="form-hint">Toa do</div>
                <div>{poi ? `${poi.latitude}, ${poi.longitude}` : '-'}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="card-title">Noi dung theo ngon ngu</span>
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
                <div className="alert alert-warning">POI nay chua co noi dung cho ngon ngu duoc chon.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
