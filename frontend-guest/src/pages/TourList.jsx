import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useSession } from '../contexts/SessionContext';
import { translateText } from '../utils/translateUI';

export default function TourList() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentTourId, joinTour, leaveTour, language, sessionId } = useSession();
  const navigate = useNavigate();

  // update thanh toan tour
  const [paymentNotice, setPaymentNotice] = useState(null);
  const [paidTourIds, setPaidTourIds] = useState(new Set());

  // Fetch các tour đã thanh toán SUCCESS
  useEffect(() => {
    if (!sessionId) return;
    api.get(`/payments/session/${sessionId}`)
      .then(r => {
        const paid = new Set(
          r.data
            .filter(p => p.status === 'SUCCESS')
            .map(p => Number(p.tourId))
        );
        setPaidTourIds(paid);
      })
      .catch(() => { });
  }, [sessionId]);

  // translate cac ngon ngu khac
  const [uiText, setUiText] = useState({});

  // translate cac ngon ngu khac
  useEffect(() => {
    async function load() {
      const [
        tourSystem,
        noTours,
        adminWillCreate,
        poiList,
        noPoi,
        joinTourText,
        joinedLeave,
      ] = await Promise.all([
        translateText("Tour Hệ Thống", language),
        translateText("Chưa có tour nào", language),
        translateText("Admin sẽ tạo tour sớm thôi!", language),
        translateText("Danh sách địa điểm", language),
        translateText("Chưa có địa điểm trong tour", language),
        translateText("Tham gia Tour", language),
        translateText("Đang tham gia · Rời tour", language),
      ]);

      setUiText({
        tourSystem,
        noTours,
        adminWillCreate,
        poiList,
        noPoi,
        joinTour: joinTourText,
        joinedLeave,
      });
    }

    load();
  }, [language]);

  useEffect(() => {
    api.get('/tours')
      .then(r => setTours(r.data.filter(t => t.isActive !== false)))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div style={{ padding: '0 var(--sp-4) var(--sp-4)' }}>
      <div className="section-title">🏛️ {uiText.tourSystem || "Tour Hệ Thống"} ({tours.length} tour)</div>

      {tours.length === 0 ? (
        <div className="empty-page">
          <div className="empty-page-icon">🗺️</div>
          <div className="empty-page-title">{uiText.noTours || "Chưa có tour nào"}</div>
          <div className="empty-page-desc">{uiText.adminWillCreate || "Admin sẽ tạo tour sớm thôi!"}</div>
        </div>
      ) : tours.map(tour => (
        <div key={tour.id} className="tour-card">
          <div
            className="tour-card-header"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '1rem'
            }}
          >
            <div style={{ flex: 1 }}>
              <div className="tour-card-title">🗺️ {tour.name}</div>

              {tour.description && (
                <div className="tour-card-desc">
                  {tour.description}
                </div>
              )}
            </div>

            <div style={{
              background: !tour.price || Number(tour.price) === 0
                ? 'linear-gradient(135deg, #10b98122, #06b6d422)'
                : paidTourIds.has(tour.id)
                  ? 'linear-gradient(135deg, #239718, #239718)'
                  : 'linear-gradient(135deg, #FFD54F, #FFC107)',
              color: !tour.price || Number(tour.price) === 0
                ? '#059669'
                : paidTourIds.has(tour.id)
                  ? '#ffffff'
                  : '#1c462e',
              border: `1px solid ${!tour.price || Number(tour.price) === 0 || paidTourIds.has(tour.id) ? '#10b981' : 'rgba(255,255,255,0.5)'}`,
              padding: '0.5rem 0.9rem',
              borderRadius: '14px',
              fontWeight: 800,
              fontSize: '0.95rem',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(55, 177, 79, 0.25)',
            }}>
              {!tour.price || Number(tour.price) === 0
                ? 'Miễn phí'
                : paidTourIds.has(tour.id)
                  ? '✅ Đã mua'
                  : Number(tour.price).toLocaleString('vi-VN') + ' ₫'}
            </div>
          </div>
          <div className="tour-card-body">
            {/* POI list */}
            {tour.pois?.length > 0 ? (
              <>
                <div style={{ fontSize: '0.75rem', color: 'var(--clr-muted)', marginBottom: 8, fontWeight: 600 }}>
                  {uiText.poiList || "DANH SÁCH ĐỊA ĐIỂM"} ({tour.pois.length})
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
                {uiText.noPoi || "Chưa có địa điểm trong tour"}
              </div>
            )}

            {/* Join/Leave button */}
            {currentTourId === tour.id ? (
              <button
                id={`leave-tour-${tour.id}`}
                className="join-tour-btn active"
                onClick={leaveTour}
              >
                ✅ {uiText.joinedLeave || "Đang tham gia · Rời tour"}
              </button>
            ) : (
              <button
                id={`join-tour-${tour.id}`}
                className="join-tour-btn"
                onClick={async () => {
                  try {

                    // const sessionId = localStorage.getItem('guest_session');

                    const res = await api.get(
                      `/payments/${tour.id}/can-join`,
                      {
                        params: { sessionId }
                      }
                    );

                    if (!res.data) {
                      setPaymentNotice({
                        tourName: tour.name,
                        price: tour.price,
                        tourId: tour.id,
                      });
                      return;
                    }

                    joinTour(tour.id);

                    // const firstPoi = tour.pois
                    //   ?.slice()
                    //   .sort((a, b) =>
                    //     (a.orderIndex || 0) - (b.orderIndex || 0)
                    //   )[0];

                    // if (firstPoi?.poiId) {
                    //   navigate(`/poi/${firstPoi.poiId}`);
                    // } else {
                    //   navigate('/');
                    // }

                  } catch (err) {
                    console.error(err);
                  }
                }}
              >
                ▶ {uiText.joinTour || "Tham gia Tour"}
              </button>
            )}
          </div>
        </div>
      ))}
      {paymentNotice && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '24px',
              width: '100%',
              maxWidth: 420,
              padding: '1.5rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              animation: 'fadeIn 0.2s ease'
            }}
          >
            <div
              style={{
                fontSize: '3rem',
                textAlign: 'center',
                marginBottom: '0.5rem'
              }}
            >
              🔒
            </div>

            <div
              style={{
                textAlign: 'center',
                fontSize: '1.25rem',
                fontWeight: 800,
                marginBottom: '0.5rem'
              }}
            >
              Tour cần thanh toán
            </div>

            <div
              style={{
                textAlign: 'center',
                color: 'var(--clr-muted)',
                lineHeight: 1.6,
                marginBottom: '1.25rem'
              }}
            >
              Bạn cần thanh toán để tham gia tour:
              <br />
              <strong>{paymentNotice.tourName}</strong>
            </div>

            <div
              style={{
                background: '#FFF8E1',
                border: '1px solid #FFD54F',
                borderRadius: '14px',
                padding: '1rem',
                textAlign: 'center',
                fontWeight: 800,
                fontSize: '1.2rem',
                color: '#E65100',
                marginBottom: '1.25rem'
              }}
            >
              {Number(paymentNotice.price).toLocaleString('vi-VN')} ₫
            </div>

            <div
              style={{
                display: 'flex',
                gap: '0.75rem'
              }}
            >
              <button
                onClick={() => setPaymentNotice(null)}
                style={{
                  flex: 1,
                  padding: '0.9rem',
                  borderRadius: '14px',
                  border: '1px solid #ddd',
                  background: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Đóng
              </button>

              <button
                style={{
                  flex: 1,
                  padding: '0.9rem',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #FF9800, #F57C00)',
                  color: '#fff',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(245,124,0,0.3)'
                }}
                onClick={async () => {
                  try {
                    const sessionId = localStorage.getItem('guest_session');
                    const res = await api.post('/payments/momo/create', null, {
                      params: {
                        sessionId,
                        tourId: paymentNotice.tourId,  // ← cần thêm tourId vào paymentNotice
                      }
                    });
                    window.location.href = res.data.payUrl;
                  } catch (err) {
                    console.error(err);
                    alert('Không thể tạo thanh toán, thử lại sau');
                  }
                }}
              >
                💳 Thanh toán
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
