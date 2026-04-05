import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { SessionProvider, useSession } from './contexts/SessionContext';
import { AudioProvider, useAudio } from './contexts/AudioContext';
import Home from './pages/Home';
import PoiDetail from './pages/PoiDetail';
import QRPage from './pages/QRPage';
import TourList from './pages/TourList';
import Settings from './pages/Settings';
import LanguageSelector from './components/LanguageSelector';
import { useState } from 'react';

function NowPlayingBar() {
  const { playing, stop, toggle, progress, isPaused } = useAudio();
  if (!playing) return null;
  return (
    <div className="now-playing">
      <div className="now-playing-icon">
        {isPaused ? '⏸' : (
          <div className="sound-wave">
            {[1,2,3,4].map(i => <div key={i} className="sound-bar" />)}
          </div>
        )}
      </div>
      <div className="now-playing-info">
        <div className="now-playing-label">🎙️ Đang phát thuyết minh</div>
        <div className="now-playing-name">{playing.poiName}</div>
        <div style={{ marginTop: 4, height: 3, background: 'rgba(255,255,255,0.15)', borderRadius: 2 }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'var(--clr-primary-light)', borderRadius: 2, transition: 'width .3s' }} />
        </div>
      </div>
      <button className="now-playing-stop" onClick={toggle} title={isPaused ? 'Phát' : 'Tạm dừng'}>
        {isPaused ? '▶' : '⏸'}
      </button>
      <button className="now-playing-stop" onClick={stop} title="Dừng">✕</button>
    </div>
  );
}

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

function AppHeader({ onLangClick }) {
  const { langLabel } = useSession();
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
        <button id="lang-btn" className="lang-btn" onClick={onLangClick}>{langLabel}</button>
      </div>
    </header>
  );
}

function BottomNav() {
  const { playing } = useAudio();
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
        <span className="nav-tab-icon">ðŸ“·</span>
        <span>QR</span>
      </NavLink>
      <NavLink id="nav-settings" to="/settings" className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}>
        <span className="nav-tab-icon">⚙️</span>
        <span>Cài đặt</span>
      </NavLink>
    </nav>
  );
}

function AppShell() {
  const [showLang, setShowLang] = useState(false);
  const location = useLocation();
  const isDetail = location.pathname.startsWith('/poi/');
  const { playing } = useAudio();

  return (
    <>
      {!isDetail && <AppHeader onLangClick={() => setShowLang(true)} />}
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
      {showLang && <LanguageSelector onClose={() => setShowLang(false)} />}
    </>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <AudioProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </AudioProvider>
    </SessionProvider>
  );
}
