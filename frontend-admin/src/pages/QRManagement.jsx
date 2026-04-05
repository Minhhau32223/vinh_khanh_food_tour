import { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import api from '../api/client';

export default function QRManagement() {
  const [pois, setPois] = useState([]);
  const [generating, setGenerating] = useState(null);
  const [qrResults, setQrResults] = useState({});

  useEffect(() => {
    api.get('/pois').then(r => setPois(r.data)).catch(() => {});
  }, []);

  const generateQR = async poi => {
    setGenerating(poi.id);
    try {
      const { data } = await api.post(`/qr/${poi.id}`, { note: 'Generated from admin' });
      setQrResults(prev => ({ ...prev, [poi.id]: data }));
    } catch (err) {
      alert('Lỗi tạo QR: ' + (err.response?.data?.message || 'Unknown error'));
    } finally { setGenerating(null); }
  };

  const copyQrValue = val => {
    navigator.clipboard.writeText(val);
    alert('✅ Đã copy mã QR!');
  };

  return (
    <Layout title="Quản lý Mã QR" subtitle="Tạo và quản lý QR code cho các POI">
      <div className="alert alert-info">
        💡 Mỗi QR code liên kết với 1 POI. Du khách scan QR để xem nội dung mà không cần GPS.
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Danh sách POI & Mã QR</span></div>
        {pois.length === 0 ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>POI</th>
                  <th>Trạng thái</th>
                  <th>Mã QR (qr_value)</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pois.map(poi => {
                  const qr = qrResults[poi.id];
                  return (
                    <tr key={poi.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{poi.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>ID: {poi.id}</div>
                      </td>
                      <td>
                        <span className={`badge ${poi.active ? 'badge-success' : 'badge-danger'}`}>
                          {poi.active ? '● Active' : '○ Inactive'}
                        </span>
                      </td>
                      <td>
                        {qr ? (
                          <div>
                            <code style={{ fontSize: '0.75rem', background: 'var(--clr-surface-2)', padding: '2px 6px', borderRadius: 4, wordBreak: 'break-all' }}>
                              {qr.qrValue}
                            </code>
                            <br />
                            <span style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)' }}>
                              URL: /api/qr/{qr.qrValue}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--clr-text-muted)', fontSize: '0.875rem' }}>— Chưa tạo —</span>
                        )}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            id={`gen-qr-${poi.id}`}
                            className="btn btn-primary btn-sm"
                            onClick={() => generateQR(poi)}
                            disabled={generating === poi.id}
                          >
                            {generating === poi.id ? <span className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> : '📱'} Tạo QR
                          </button>
                          {qr && (
                            <button className="btn btn-secondary btn-sm" onClick={() => copyQrValue(qr.qrValue)}>
                              📋 Copy
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
