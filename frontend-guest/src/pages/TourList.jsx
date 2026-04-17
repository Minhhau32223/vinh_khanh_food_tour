import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useSession } from '../contexts/SessionContext';

export default function TourList() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentTourId, joinTour, leaveTour } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/tours')
      .then(r => setTours(r.data.filter(t => t.isActive !== false)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div style={{ padding: '0 var(--sp-4) var(--sp-4)' }}>
      <div className="section-title">🏛️ Tour Hệ Thống ({tours.length} tour)</div>

      {tours.length === 0 ? (
        <div className="empty-page">
          <div className="empty-page-icon">🗺️</div>
          <div className="empty-page-title">Chưa có tour nào</div>
          <div className="empty-page-desc">Admin sẽ tạo tour sớm thôi!</div>
        </div>
      ) : tours.map(tour => (
        <div key={tour.id} className="tour-card">
          <div className="tour-card-header">
            <div className="tour-card-title">🗺️ {tour.name}</div>
            {tour.description && <div className="tour-card-desc">{tour.description}</div>}
          </div>
          <div className="tour-card-body">
            {/* POI list */}
            {tour.pois?.length > 0 ? (
              <>
                <div style={{ fontSize: '0.75rem', color: 'var(--clr-muted)', marginBottom: 8, fontWeight: 600 }}>
                  DANH SÁCH ĐỊA ĐIỂM ({tour.pois.length})
                </div>
                {tour.pois.map((tp, i) => (
                  <div key={tp.poiId || i} className="tour-poi-item">
                    <span className="tour-poi-number">{tp.orderIndex || i + 1}</span>
                    <span>{tp.poiName || `POI #${tp.poiId}`}</span>
                  </div>
                ))}
              </>
            ) : (
              <div style={{ color: 'var(--clr-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>
                Chưa có địa điểm trong tour
              </div>
            )}

            {/* Join/Leave button */}
            {currentTourId === tour.id ? (
              <button
                id={`leave-tour-${tour.id}`}
                className="join-tour-btn active"
                onClick={leaveTour}
              >
                ✅ Đang tham gia · Rời tour
              </button>
            ) : (
              <button
                id={`join-tour-${tour.id}`}
                className="join-tour-btn"
                onClick={() => {
                  joinTour(tour.id);
                  navigate('/');
                }}
              >
                ▶ Tham gia Tour
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
