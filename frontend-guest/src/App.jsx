import { Component } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { SessionProvider, useSession } from './contexts/SessionContext';
import { AudioProvider, useAudio } from './contexts/AudioContext';
import Home from './pages/Home';
import PoiDetail from './pages/PoiDetail';
import QRPage from './pages/QRPage';
import TourList from './pages/TourList';
import Settings from './pages/Settings';
//chi tiết poi
import { useNavigate } from 'react-router-dom';

// ─── Error Boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '100dvh', padding: '2rem',
          fontFamily: 'system-ui, sans-serif', textAlign: 'center',
          background: '#faf8f5', color: '#1a1a1a',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Ứng dụng gặp sự cố
          </div>
          <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1.5rem', maxWidth: 320 }}>
            {this.state.error?.message || 'Lỗi không xác định'}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#c0392b', color: '#fff', border: 'none',
              borderRadius: 12, padding: '0.75rem 1.5rem',
              fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
            }}
          >
            Tải lại trang
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Language Options ──────────────────────────────────────────────────────────
const LANGUAGE_OPTIONS = [
  { code: 'vi', label: 'Tieng Viet' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Francais' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'zh-CN', label: 'Chinese' },
  { code: 'es', label: 'Spanish' },
  { code: 'ru', label: 'Russian' },
  { code: 'it', label: 'Italian' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'th', label: 'Thai' },
  { code: 'ar', label: 'Arabic' },
  { code: 'tr', label: 'Turkish' },
  { code: 'id', label: 'Indonesian' },
];

// ─── Now Playing Bar ───────────────────────────────────────────────────────────
function NowPlayingBar() {
  const { playing, stop, toggle, progress, isPaused } = useAudio();
  const navigate = useNavigate();
  if (!playing) return null;

  const handleGoToDetail = () => {
    if (playing.poiId) {
      navigate(`/poi/${playing.poiId}`);
    }
  };

  return (
    <div className="now-playing">
      {/* 1. Phần Icon - Click cũng chuyển trang */}
      <div className="now-playing-icon" onClick={handleGoToDetail} style={{ cursor: 'pointer' }}>
        {isPaused ? '⏸' : (
          <div className="sound-wave">
            {[1,2,3,4].map(i => <div key={i} className="sound-bar" />)}
          </div>
        )}
      </div>

      {/* 2. Phần thông tin chữ - Click để chuyển trang */}
      <div 
        className="now-playing-info"
        onClick={handleGoToDetail} 
        style={{ cursor: 'pointer', flex: 1 }} // flex: 1 để chiếm không gian giữa
      >
        <div className="now-playing-label">🎙️ Đang phát thuyết minh</div>
        <div className="now-playing-name">{playing.poiName}</div>
        <div style={{ marginTop: 4, height: 3, background: 'rgba(255,255,255,0.15)', borderRadius: 2 }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'var(--clr-primary-light)', borderRadius: 2, transition: 'width .3s' }} />
        </div>
      </div>

      {/* 3. Các nút điều khiển - Giữ nguyên không thay đổi để tránh xung đột click */}
      <button className="now-playing-stop" onClick={toggle} title={isPaused ? 'Phát' : 'Tạm dừng'}>
        {isPaused ? '▶' : '⏸'}
      </button>
      <button className="now-playing-stop" onClick={stop} title="Dừng">✕</button>
    </div>
  );
}

// ─── Geofence Toast ────────────────────────────────────────────────────────────
function GeofenceToast() {
  const { activeToast } = useSession();
  if (!activeToast) return null;
  return (
    <div className="geofence-toast">
      <div className="geofence-toast-icon">📍</div>
      <div className="geofence-toast-info">
        <div className="geofence-toast-label">Thông báo vị trí</div>
        <div className="geofence-toast-name">{activeToast}</div>
      </div>
    </div>
  );
}

// ─── App Header ────────────────────────────────────────────────────────────────
function AppHeader() {
  const { language, updateLanguage } = useSession();
  return (
    <header className="app-header">
      <div className="header-brand">
        <span className="header-logo">🍜</span>
        <div>
          <div className="header-title">Phố Vĩnh Khánh</div>
          <div className="header-sub">Food Tour Guide</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <NavLink id="qr-btn" to="/qr" className="lang-btn" style={{ textDecoration: 'none' }}>
          QR
        </NavLink>
        <select
          id="lang-select"
          className="lang-btn"
          value={language}
          onChange={e => updateLanguage(e.target.value)}
          style={{ border: 'none' }}
        >
          {LANGUAGE_OPTIONS.map(option => (
            <option key={option.code} value={option.code}>{option.label}</option>
          ))}
        </select>
      </div>
    </header>
  );
}

// ─── Bottom Navigation ─────────────────────────────────────────────────────────
function BottomNav() {
  const location = useLocation();
  const isDetail = location.pathname.startsWith('/poi/');

  if (isDetail) return null;

  return (
    <nav className="bottom-nav">
      <NavLink id="nav-home" to="/" className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`} end>
        <span className="nav-tab-icon">🗺️</span>
        <span>Khám phá</span>
      </NavLink>
      <NavLink id="nav-tours" to="/tours" className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}>
        <span className="nav-tab-icon">🏛️</span>
        <span>Tour</span>
      </NavLink>
      <NavLink id="nav-qr" to="/qr" className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}>
        <span className="nav-tab-icon">📷</span>
        <span>QR</span>
      </NavLink>
      <NavLink id="nav-settings" to="/settings" className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}>
        <span className="nav-tab-icon">⚙️</span>
        <span>Cài đặt</span>
      </NavLink>
    </nav>
  );
}

// ─── App Shell ─────────────────────────────────────────────────────────────────
function AppShell() {
  const location = useLocation();
  const isDetail = location.pathname.startsWith('/poi/');
  const { playing } = useAudio();

  return (
    <>
      {!isDetail && <AppHeader />}
      <GeofenceToast />

      <div className={`page${playing ? ' with-player' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/poi/:id" element={<PoiDetail />} />
          <Route path="/qr" element={<QRPage />} />
          <Route path="/qr/:qrValue" element={<QRPage />} />
          <Route path="/tours" element={<TourList />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>

      <NowPlayingBar />
      <BottomNav />
    </>
  );
}

// ─── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <BrowserRouter>
          <AudioProvider>
            <AppShell />
          </AudioProvider>
        </BrowserRouter>
      </SessionProvider>
    </ErrorBoundary>
  );
}
