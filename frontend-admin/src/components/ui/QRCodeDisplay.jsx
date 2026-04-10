import { useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';

/**
 * Hiển thị QR code cho một giá trị bất kỳ.
 * - value: chuỗi nhúng vào QR (thường là full URL guest)
 * - size: kích thước px (mặc định 180)
 * - showActions: hiển thị nút Download / Copy link
 * - label: nhãn hiển thị bên dưới (tùy chọn)
 */
export default function QRCodeDisplay({ value, size = 180, showActions = true, label }) {
  const canvasRef = useRef(null);

  const downloadQR = () => {
    // Render canvas ẩn để download PNG
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');

    // Dùng SVG → Blob → image → canvas
    const svgEl = document.querySelector(`[data-qr-value="${CSS.escape(value)}"] svg`);
    if (!svgEl) {
      alert('Không thể tải QR để download. Vui lòng thử lại.');
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 300, 300);
      ctx.drawImage(img, 0, 0, 300, 300);
      URL.revokeObjectURL(url);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `qr-${label || 'poi'}.png`;
      link.click();
    };
    img.src = url;
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(value);
      alert('✅ Đã copy link QR!');
    } catch {
      alert('Không thể copy. Vui lòng copy thủ công: ' + value);
    }
  };

  if (!value) return null;

  return (
    <div
      data-qr-value={value}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
      }}
    >
      {/* QRCode SVG */}
      <div
        style={{
          background: '#fff',
          padding: 12,
          borderRadius: 12,
          border: '1px solid var(--clr-border)',
          boxShadow: 'var(--shadow-sm)',
          display: 'inline-block',
          lineHeight: 0,
        }}
      >
        <QRCodeSVG
          value={value}
          size={size}
          level="M"
          includeMargin={false}
          style={{ display: 'block' }}
        />
      </div>

      {/* Label */}
      {label && (
        <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', textAlign: 'center', maxWidth: size + 24 }}>
          {label}
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={downloadQR}
            title="Tải ảnh QR về máy"
          >
            ⬇️ Tải PNG
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={copyLink}
            title="Copy link Guest web"
          >
            📋 Copy link
          </button>
        </div>
      )}
    </div>
  );
}
