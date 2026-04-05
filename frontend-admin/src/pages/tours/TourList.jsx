import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import api from '../../api/client';

export default function TourList() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    api.get('/tours').then(r => setTours(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const deleteTour = async id => {
    if (!window.confirm('Xóa tour này?')) return;
    await api.delete(`/tours/${id}`).catch(() => alert('Lỗi xóa tour'));
    load();
  };

  return (
    <Layout
      title="Tour du lịch"
      subtitle={`${tours.length} tour`}
      actions={
        <button id="create-tour-btn" className="btn btn-primary" onClick={() => navigate('/tours/new')}>
          ＋ Tạo tour mới
        </button>
      }
    >
      <div className="card">
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : tours.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🗺️</div>
            <div className="empty-state-title">Chưa có tour nào</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên Tour</th>
                  <th>Mô tả</th>
                  <th>Loại</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {tours.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--clr-text-muted)' }}>#{t.id}</td>
                    <td style={{ fontWeight: 600 }}>{t.name}</td>
                    <td style={{ maxWidth: 200 }}>
                      <span className="truncate" style={{ display: 'block', color: 'var(--clr-text-muted)', fontSize: '0.875rem' }}>
                        {t.description || '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${t.isSystem ? 'badge-info' : 'badge-gray'}`}>
                        {t.isSystem ? '🏛️ Hệ thống' : '👤 Cá nhân'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${t.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {t.isActive ? '● Hoạt động' : '○ Tắt'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/tours/${t.id}/edit`)}>
                          ✏️ Sửa
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteTour(t.id)}>
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
