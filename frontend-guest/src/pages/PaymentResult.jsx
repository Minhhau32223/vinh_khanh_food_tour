import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';

export default function PaymentResult() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { joinTour } = useSession();
  const resultCode = params.get('resultCode');
  const success = resultCode === '0';

  // ✅ Tự động join tour nếu thanh toán thành công
  useEffect(() => {
    if (!success) return;
    const orderId = params.get('orderId');
    if (!orderId) return;

    // orderId format: TOUR_{tourId}_{sessionId}_{timestamp}
    const tourId = orderId.split('_')[1];
    if (tourId) joinTour(Number(tourId));
  }, [success]);

  return (
    <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
      <div style={{ fontSize: '4rem' }}>{success ? '🎉' : '❌'}</div>
      <div style={{ fontWeight: 800, fontSize: '1.3rem', margin: '1rem 0 0.5rem' }}>
        {success ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
      </div>
      <div style={{ color: 'var(--clr-muted)', marginBottom: '2rem' }}>
        {success ? 'Bạn đã được tham gia tour!' : `Mã lỗi: ${resultCode} · ${params.get('message') || ''}`}
      </div>
      <button
        onClick={() => navigate('/tours')}
        style={{
          background: success ? 'var(--clr-primary)' : '#e0e0e0',
          color: success ? '#fff' : '#333',
          border: 'none', borderRadius: 14,
          padding: '0.875rem 2rem',
          fontWeight: 700, cursor: 'pointer',
        }}
      >
        {success ? 'Về danh sách tour' : 'Thử lại'}
      </button>
    </div>
  );
}