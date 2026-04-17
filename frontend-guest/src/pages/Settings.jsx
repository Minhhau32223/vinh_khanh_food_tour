import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useSession } from '../contexts/SessionContext';
import { translateText } from '../utils/translateUI';
import {
  clearOfflinePackage,
  downloadOfflinePackageFile,
  getOfflinePackageMeta,
  saveOfflinePackage
} from '../utils/offlinePackage';

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

export default function Settings() {
  const { language, updateLanguage, sessionId, currentTourId, leaveTour } = useSession();
  const navigate = useNavigate();
  const [capabilities, setCapabilities] = useState(null);
  const [offlineMeta, setOfflineMeta] = useState(() => getOfflinePackageMeta());
  const [downloadingOffline, setDownloadingOffline] = useState(false);

  // translate cac ngon ngu khac
  const [uiText, setUiText] = useState({});

  // translate cac ngon ngu khac
  useEffect(() => {
    async function load() {
      setUiText({
        language: await translateText("Ngôn ngữ", language),
        languageVoice: await translateText("Ngôn ngữ phát", language),

        phienban: await translateText("Phiên bản", language),

        session: await translateText("Phiên làm việc", language),
        currentTour: await translateText("Tour hiện tại", language),
        notJoined: await translateText("Không tham gia", language),
        leaveTour: await translateText("Rời tour hiện tại", language),

        gps: await translateText("GPS & Geofence", language),
        autoPlay: await translateText("Tự động phát theo vị trí", language),
        cooldown: await translateText("Cooldown mỗi POI", language),
        gpsAccuracy: await translateText("Độ chính xác GPS", language),
        enabled: await translateText("Bật", language),
        high: await translateText("Cao", language),

        device: await translateText("Thiết bị & Offline", language),
        networkStatus: await translateText("Trạng thái mạng", language),
        supported: await translateText("Hỗ trợ", language),
        notSupported: await translateText("Không hỗ trợ", language),

        storage: await translateText("Bộ nhớ trong", language),
        cpuRam: await translateText("CPU / RAM tham khảo", language),
        offlinePackage: await translateText("Gói offline", language),
        notDownloaded: await translateText("Chưa tải", language),

        downloading: await translateText("Đang tải...", language),
        downloadOffline: await translateText("Tải gói offline", language),
        clearOffline: await translateText("Xóa gói offline", language),

        openQR: await translateText("Mở màn hình QR trigger", language),

        about: await translateText("Thông tin ứng dụng", language),
        version: await translateText("Phiên bản", language),
        map: await translateText("Bản đồ", language),
        backend: await translateText("Backend", language),

        resetSession: await translateText("Đặt lại phiên làm việc", language),
      });
    }
    load();
  }, [language]);

  useEffect(() => {
    let cancelled = false;

    const loadCapabilities = async () => {
      let storageEstimate = null;
      if (navigator.storage?.estimate) {
        try {
          storageEstimate = await navigator.storage.estimate();
        } catch {
          // Storage estimate is optional.
        }
      }

      if (cancelled) return;

      const availableBytes = storageEstimate?.quota && storageEstimate?.usage != null
        ? Math.max(storageEstimate.quota - storageEstimate.usage, 0)
        : null;

      setCapabilities({
        online: navigator.onLine,
        geolocation: 'geolocation' in navigator,
        camera: !!navigator.mediaDevices?.getUserMedia,
        qrScanner: typeof window !== 'undefined' && 'BarcodeDetector' in window,
        storageQuotaMb: storageEstimate?.quota ? Math.round(storageEstimate.quota / (1024 * 1024)) : null,
        storageFreeMb: availableBytes != null ? Math.round(availableBytes / (1024 * 1024)) : null,
        deviceMemoryGb: navigator.deviceMemory || null,
        cpuCores: navigator.hardwareConcurrency || null,
        canDownloadOffline: navigator.onLine && (availableBytes == null || availableBytes > 20 * 1024 * 1024),
      });
    };

    loadCapabilities();
    return () => { cancelled = true; };
  }, []);

  const resetSession = () => {
    if (window.confirm('Xóa session và bắt đầu lại?')) {
      localStorage.removeItem('guest_session');
      localStorage.removeItem('guest_lang');
      window.location.reload();
    }
  };

  const handleDownloadOffline = async () => {
    setDownloadingOffline(true);
    try {
      const { data } = await api.get('/pois/offline-package', { params: { lang: language } });
      saveOfflinePackage(data);
      setOfflineMeta(getOfflinePackageMeta());
      downloadOfflinePackageFile(data);
    } catch {
      alert('Không thể tải gói offline lúc này');
    } finally {
      setDownloadingOffline(false);
    }
  };

  const handleClearOffline = () => {
    clearOfflinePackage();
    setOfflineMeta(null);
  };

  return (
    <div style={{ padding: 'var(--sp-4)' }}>
      {/* App Info Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #c0392b, #e67e22)',
        borderRadius: 16, padding: '1.5rem', color: 'white',
        textAlign: 'center', marginBottom: '1.5rem'
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🍜</div>
        <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Phố Ẩm Thực Vĩnh Khánh</div>
        <div style={{ opacity: 0.8, fontSize: '0.8rem', marginTop: 4 }}>
          Hệ Thống Du Lịch Thông Minh · v1.0
        </div>
      </div>

      {/* Language */}
      <div className="settings-section">
        <div className="settings-header">{uiText.language || "Ngôn ngữ"}</div>
        <div className="settings-item">
          <span className="settings-item-label">{uiText.languageVoice || "Ngôn ngữ phát"}</span>
          <select
            className="form-select"
            value={language}
            onChange={e => updateLanguage(e.target.value)}
            style={{ maxWidth: 220, borderRadius: 8, padding: '4px 8px', border: '1px solid var(--clr-border)' }}
          >
            {LANGUAGE_OPTIONS.map(option => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Session Info */}
      <div className="settings-section">
        <div className="settings-header">📱 {uiText.session || "Phiên làm việc"}</div>
        <div className="settings-item">
          <span className="settings-item-label">Session ID</span>
          <span className="settings-item-value" style={{ fontFamily: 'monospace', fontSize: '0.7rem', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {sessionId ? sessionId.toString().slice(0, 18) + '…' : '—'}
          </span>
        </div>
        <div className="settings-item">
          <span className="settings-item-label">{uiText.currentTour || "Tour hiện tại"}</span>
          <span className="settings-item-value">{currentTourId ? `Tour #${currentTourId}` : (uiText.notJoined || "Không tham gia")}</span>
        </div>
        {currentTourId && (
          <div className="settings-item">
            <button
              onClick={leaveTour}
              style={{ background: 'none', border: 'none', color: 'var(--clr-primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
            >
              {uiText.leaveTour || "Rời tour hiện tại"}
            </button>
          </div>
        )}
      </div>

      {/* GPS Info */}
      <div className="settings-section">
        <div className="settings-header">📍 {uiText.gps || "GPS & Geofence"}</div>
        <div className="settings-item">
          <span className="settings-item-label">{uiText.autoPlay || "Tự động phát theo vị trí"}</span>
          <span className="settings-item-value" style={{ color: 'var(--clr-success)' }}>✔ {uiText.enabled || "Bật"}</span>
        </div>
        <div className="settings-item">
          <span className="settings-item-label">{uiText.cooldown || "Cooldown mỗi POI"}</span>
          <span className="settings-item-value">30s</span>
        </div>
        <div className="settings-item">
          <span className="settings-item-label">{uiText.gpsAccuracy || "Độ chính xác GPS"}</span>
          <span className="settings-item-value">{uiText.high || "Cao"}</span>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-header">{uiText.device || "Thiết bị & Offline"}</div>
        <div className="settings-item">
          <span className="settings-item-label">{uiText.networkStatus || "Trạng thái mạng"}</span>
          <span className="settings-item-value">{capabilities?.online ? 'Online' : 'Offline'}</span>
        </div>
        <div className="settings-item">
          <span className="settings-item-label">GPS</span>
          <span className="settings-item-value">{capabilities?.geolocation ? (uiText.supported || "Hỗ trợ") : (uiText.notSupported || "Không hỗ trợ")}</span>
        </div>
        <div className="settings-item">
          <span className="settings-item-label">Camera / QR</span>
          <span className="settings-item-value">
            {capabilities?.camera ? 'Camera OK' : 'Không có camera'}
            {capabilities?.qrScanner ? ' · QR scan OK' : ' · QR scan fallback'}
          </span>
        </div>
        <div className="settings-item">
          <span className="settings-item-label">Bộ nhớ trong</span>
          <span className="settings-item-value">
            {capabilities?.storageFreeMb != null ? `${capabilities.storageFreeMb} MB` : 'Không rõ'}
          </span>
        </div>
        <div className="settings-item">
          <span className="settings-item-label">CPU / RAM tham khảo</span>
          <span className="settings-item-value">
            {capabilities?.cpuCores || '-'} cores · {capabilities?.deviceMemoryGb || '-'} GB
          </span>
        </div>
        <div className="settings-item">
          <span className="settings-item-label">Gói offline</span>
          <span className="settings-item-value">
            {offlineMeta ? `${offlineMeta.totalPois} POI · ${offlineMeta.language}` : 'Chưa tải'}
          </span>
        </div>
        <div className="settings-item" style={{ display: 'block' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--clr-muted)', marginBottom: 10 }}>
            {capabilities?.canDownloadOffline
              ? 'Thiết bị đủ điều kiện để tải gói nội dung offline cho ngôn ngữ hiện tại.'
              : 'Nếu thiết bị không đủ tài nguyên hoặc đang offline, ứng dụng sẽ ưu tiên stream audio và nội dung trực tiếp.'}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={handleDownloadOffline}
              disabled={!capabilities?.canDownloadOffline || downloadingOffline}
              style={{ background: 'var(--clr-primary)', border: 'none', color: '#fff', borderRadius: 12, padding: '0.75rem 1rem', fontWeight: 700, cursor: 'pointer' }}
            >
              {downloadingOffline ? 'Đang tải...' : 'Tải gói offline'}
            </button>
            <button
              onClick={handleClearOffline}
              disabled={!offlineMeta}
              style={{ background: '#fff', border: '1px solid var(--clr-border)', color: 'var(--clr-text)', borderRadius: 12, padding: '0.75rem 1rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Xóa gói offline
            </button>
          </div>
        </div>
      </div>

      <div className="settings-item">
        <button
          onClick={() => navigate('/qr')}
          style={{ background: 'none', border: 'none', color: 'var(--clr-primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
        >
          Mở màn hình QR trigger
        </button>
      </div>

      {/* About */}
      <div className="settings-section">
        <div className="settings-header">ℹ️ Thông tin ứng dụng</div>
        <div className="settings-item">
          <span className="settings-item-label">{uiText.phienban || "Phiên bản"}</span>
          <span className="settings-item-value">1.0.0 MVP</span>
        </div>
        <div className="settings-item">
          <span className="settings-item-label">Bản đồ</span>
          <span className="settings-item-value">OpenStreetMap</span>
        </div>
        <div className="settings-item">
          <span className="settings-item-label">Backend</span>
          <span className="settings-item-value">Spring Boot + MySQL</span>
        </div>
      </div>

      {/* Danger Zone */}
      <button
        id="reset-session-btn"
        onClick={resetSession}
        style={{
          width: '100%', padding: '0.75rem', marginTop: '1rem',
          background: 'none', border: '1px dashed var(--clr-muted)',
          borderRadius: 12, color: 'var(--clr-muted)', cursor: 'pointer',
          fontSize: '0.875rem'
        }}
      >
        🔄 Đặt lại phiên làm việc
      </button>
    </div>
  );
}
