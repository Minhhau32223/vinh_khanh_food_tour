import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import api from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';

export default function PoiList() {
  const { isAdmin } = useAuth();
  const [pois, setPois] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [approving, setApproving] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/pois');
      setPois(data);
    } catch {
      setError('Không thể tải danh sách POI');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggleStatus = async poi => {
    try {
      await api.patch(`/pois/${poi.id}/status`);
      load();
    } catch { alert('Lỗi khi cập nhật trạng thái'); }
  };

  const confirmDelete = async id => {
    if (!window.confirm('Xóa POI này? (soft delete - set inactive)')) return;
    setDeleting(id);
    try {
      await api.patch(`/pois/${id}/status`);
      load();
    } catch { alert('Lỗi khi xóa POI'); }
    finally { setDeleting(null); }
  };

  const approvePoi = async id => {
    setApproving(id);
    try {
      await api.patch(`/pois/${id}/approve`);
      load();
    } catch {
      alert('Loi khi duyet POI');
    } finally {
      setApproving(null);
    }
  };

  return (
    <Layout
      title="Điểm tham quan (POI)"
      subtitle={`${pois.length} địa điểm`}
      actions={
        <button id="create-poi-btn" className="btn btn-primary" onClick={() => navigate('/pois/new')}>
          ＋ Thêm POI mới
        </button>
      }
    >
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
            <span>Đang tải…</span>
          </div>
        ) : pois.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📍</div>
            <div className="empty-state-title">Chưa có POI nào</div>
            <div className="empty-state-desc">Nhấn "Thêm POI mới" để bắt đầu</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên địa điểm</th>
                  <th>Tọa độ</th>
                  <th>Bán kính (m)</th>
                  <th>Ưu tiên</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pois.map(poi => (
                  <tr key={poi.id}>
                    <td style={{ color: 'var(--clr-text-muted)', fontFamily: 'monospace' }}>#{poi.id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{poi.name}</div>
                      {poi.ownerUsername && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
                          Owner: {poi.ownerUsername}
                        </div>
                      )}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {Number(poi.latitude).toFixed(4)}, {Number(poi.longitude).toFixed(4)}
                    </td>
                    <td>{poi.triggerRadius} m</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {'★'.repeat(poi.priority)}{'☆'.repeat(Math.max(0, 5 - poi.priority))}
                        <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>({poi.priority})</span>
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                        <span className={`badge ${poi.status === 'APPROVED' ? 'badge-success' : 'badge-warning'}`}>
                          {poi.status === 'APPROVED' ? 'Da duyet' : poi.status || 'Cho duyet'}
                        </span>
                      <button
                        className={`badge ${poi.isActive ? 'badge-success' : 'badge-danger'}`}
                        style={{ cursor: isAdmin ? 'pointer' : 'default', border: 'none' }}
                        onClick={() => isAdmin && toggleStatus(poi)}
                        title="Click để đổi trạng thái"
                      >
                        {poi.isActive ? '● Hoạt động' : '○ Tắt'}
                      </button>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>
                      {poi.createdAt ? new Date(poi.createdAt).toLocaleDateString('vi') : '—'}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/pois/${poi.id}`)}
                          title="Xem noi dung POI"
                        >
                          Xem
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/pois/${poi.id}/edit`)}
                          title="Sửa POI & nội dung"
                        >
                          ✏️ Sửa
                        </button>
                        {isAdmin && poi.status !== 'APPROVED' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => approvePoi(poi.id)}
                            disabled={approving === poi.id}
                            title="Duyet POI"
                          >
                            {approving === poi.id ? 'Dang duyet...' : 'Duyet'}
                          </button>
                        )}
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => confirmDelete(poi.id)}
                          disabled={deleting === poi.id}
                          title="Xóa POI"
                        >
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
