import { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import api from '../api/client';

const ROLES = ['ADMIN', 'OWNER'];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', role: 'OWNER' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/users').then(r => setUsers(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleStatus = async user => {
    try {
      await api.patch(`/users/${user.id}/status`, { isActive: !user.isActive });
      load();
    } catch { alert('Lỗi cập nhật trạng thái'); }
  };

  const createUser = async e => {
    e.preventDefault();
    setFormError('');
    if (!form.username || !form.password) { setFormError('Vui lòng điền đầy đủ thông tin'); return; }
    setSaving(true);
    try {
      await api.post('/users', form);
      setShowModal(false);
      setForm({ username: '', password: '', role: 'OWNER' });
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Lỗi tạo user');
    } finally { setSaving(false); }
  };

  return (
    <Layout
      title="Quản lý Người dùng"
      subtitle={`${users.length} người dùng`}
      actions={
        <button id="create-user-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          ＋ Thêm người dùng
        </button>
      }
    >
      <div className="card">
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên đăng nhập</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--clr-text-muted)' }}>#{u.id}</td>
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--clr-accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem' }}>
                          {u.username[0].toUpperCase()}
                        </div>
                        {u.username}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${u.role === 'ADMIN' ? 'badge-info' : 'badge-warning'}`}>
                        {u.role === 'ADMIN' ? '🔑 Admin' : '🏪 Owner'}
                      </span>
                    </td>
                    <td>
                      <button className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}
                        style={{ cursor: 'pointer', border: 'none' }} onClick={() => toggleStatus(u)}>
                        {u.isActive ? '● Hoạt động' : '○ Khóa'}
                      </button>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi') : '—'}
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => toggleStatus(u)}>
                        {u.isActive ? '🔒 Khóa' : '🔓 Mở'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Thêm người dùng mới</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={createUser}>
              <div className="modal-body">
                {formError && <div className="alert alert-danger">{formError}</div>}
                <div className="form-group">
                  <label className="form-label required">Tên đăng nhập</label>
                  <input id="new-username" className="form-input" value={form.username}
                    onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                    placeholder="owner_vinhkhanh" />
                </div>
                <div className="form-group">
                  <label className="form-label required">Mật khẩu</label>
                  <input id="new-password" className="form-input" type="password" value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Tối thiểu 8 ký tự" />
                </div>
                <div className="form-group">
                  <label className="form-label">Vai trò</label>
                  <select id="new-role" className="form-select" value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button id="save-user-btn" type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> Đang tạo…</> : '＋ Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
