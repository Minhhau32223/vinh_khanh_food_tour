import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';

export default function Settings() {
  const { language, updateLanguage, sessionId, currentTourId, leaveTour } = useSession();
  const navigate = useNavigate();

  const langMap = { vi: '🇻🇳 Tiếng Việt', en: '🇺🇸 English', zh: '🇨🇳 中文' };

  const resetSession = () => {
    if (window.confirm('Xóa session và bắt đầu lại?')) {
      localStorage.removeItem('guest_session');
      localStorage.removeItem('guest_lang');
      window.location.reload();
    }
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
        <div className="settings-header">🌐 Ngôn ngữ</div>
        {['vi','en','zh'].map(lang => (
          <div key={lang} className="settings-item" style={{ cursor: 'pointer' }} onClick={() => updateLanguage(lang)}>
            <span className="settings-item-label">{langMap[lang]}</span>
            {language === lang && <span style={{ color: 'var(--clr-primary)' }}>✓</span>}
          </div>
        ))}
      </div>

      {/* Session Info */}
      <div className="settings-section">
        <div className="settings-header">📱 Phiên làm việc</div>
        <div className="settings-item">
          <span className="settings-item-label">Session ID</span>
          <span className="settings-item-value" style={{ fontFamily: 'monospace', fontSize: '0.7rem', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {sessionId ? sessionId.slice(0, 18) + '…' : '—'}
          </span>
        </div>
        <div className="settings-item">
          <span className="settings-item-label">Tour hiện tại</span>
          <span className="settings-item-value">{currentTourId ? `Tour #${currentTourId}` : 'Không tham gia'}</span>
        </div>
        {currentTourId && (
          <div className="settings-item">
            <button
              onClick={leaveTour}
              style={{ background: 'none', border: 'none', color: 'var(--clr-primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
            >
              Rời tour hiện tại
            </button>
          </div>
        )}
      </div>

      {/* GPS Info */}
      <div className="settings-section">
        <div className="settings-header">📍 GPS & Geofence</div>
        <div className="settings-item">
          <span className="settings-item-label">Tự động phát theo vị trí</span>
          <span className="settings-item-value" style={{ color: 'var(--clr-success)' }}>✓ Bật</span>
        </div>
        <div className="settings-item">
          <span className="settings-item-label">Cooldown mỗi POI</span>
          <span className="settings-item-value">30 giây</span>
        </div>
        <div className="settings-item">
          <span className="settings-item-label">Độ chính xác GPS</span>
          <span className="settings-item-value">Cao</span>
        </div>
      </div>

      <div className="settings-item">
        <button
          onClick={() => navigate('/qr')}
          style={{ background: 'none', border: 'none', color: 'var(--clr-primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
        >
          Mo man hinh QR trigger
        </button>
      </div>

      {/* About */}
      <div className="settings-section">
        <div className="settings-header">ℹ️ Thông tin ứng dụng</div>
        <div className="settings-item">
          <span className="settings-item-label">Phiên bản</span>
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
