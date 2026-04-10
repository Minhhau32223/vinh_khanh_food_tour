import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const NAV = [
  {
    section: 'Quản lý', items: [
      { to: '/pois', icon: '', label: 'Điểm tham quan (POI)' },
      { to: '/tours', icon: '', label: 'Tour du lịch' },
      { to: '/qr', icon: '', label: 'Mã QR' },
    ]
  },
  {
    section: 'Thống kê', items: [
      { to: '/analytics', icon: '', label: 'Phân tích & Thống kê' },
    ]
  },
];

const ADMIN_NAV = [
  {
    section: 'Duyệt nội dung', items: [
      { to: '/poi-approvals', icon: '', label: 'Danh sách xin duyệt' },
    ]
  },
  {
    section: 'Hệ thống', items: [
      { to: '/users', icon: '', label: 'Người dùng' },
    ]
  },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const allNav = isAdmin ? [...NAV, ...ADMIN_NAV] : NAV;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>🍜</div>
        <div className="sidebar-logo-title">Vĩnh Khánh</div>
        <div className="sidebar-logo-sub">Admin Dashboard</div>
      </div>

      <nav className="sidebar-nav">
        {allNav.map(section => (
          <div key={section.section}>
            <div className="nav-section-label">{section.section}</div>
            {section.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.username?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.username}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Đăng xuất">
            ⏻
          </button>
        </div>
      </div>
    </aside>
  );
}
