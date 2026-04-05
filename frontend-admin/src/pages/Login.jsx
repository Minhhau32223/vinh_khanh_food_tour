import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    const ok = await login(form.username, form.password);
    if (ok) navigate('/pois');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <span className="login-emoji">🍜</span>
          <div className="login-title">Vĩnh Khánh</div>
          <div className="login-sub">Hệ thống quản lý du lịch ẩm thực</div>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label required">Tên đăng nhập</label>
            <input
              id="username"
              className="form-input"
              type="text"
              placeholder="admin"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label required">Mật khẩu</label>
            <input
              id="password"
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary login-btn"
            disabled={loading}
          >
            {loading ? (
              <><span className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> Đang đăng nhập…</>
            ) : '🔐 Đăng nhập'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
          Phố Ẩm Thực Vĩnh Khánh · Admin v1.0
        </p>
        <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <button
            type="button"
            onClick={() => navigate('/register')}
            style={{ background: 'none', border: 'none', color: 'var(--clr-primary-light)', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Chủ quán chưa có tài khoản? Đăng ký tại đây
          </button>
        </p>
        <p style={{ textAlign: 'center', marginTop: '0.5rem', color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem' }}>
          Backend: localhost:8080 · Cần khởi động Spring Boot trước
        </p>
      </div>
    </div>
  );
}
