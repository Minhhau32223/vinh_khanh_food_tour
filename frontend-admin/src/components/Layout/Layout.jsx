import Sidebar from './Sidebar';

export default function Layout({ title, subtitle, actions, children }) {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="main-content">
        <header className="topbar">
          <div className="flex items-center" style={{ flex: 1 }}>
            <div>
              <div className="topbar-title">{title}</div>
              {subtitle && <div className="topbar-sub">{subtitle}</div>}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-3">{actions}</div>
          )}
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
