import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout/Layout';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';

export default function QRManagementPage() {
  const { isAdmin } = useAuth();
  const [pois, setPois] = useState([]);
  const [qrResults, setQrResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [{ data: poiData }, { data: qrData }] = await Promise.all([
          api.get('/pois'),
          api.get('/qr/admin'),
        ]);

        if (cancelled) return;
        setPois(poiData);
        setQrResults(Object.fromEntries(qrData.map(item => [item.poiId, item])));
      } catch {
        if (!cancelled) {
          setPois([]);
          setQrResults({});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const visiblePois = useMemo(
    () => pois.filter(poi => isAdmin || poi.ownerId != null),
    [isAdmin, pois]
  );

  const generateQR = async poi => {
    setGenerating(poi.id);
    try {
      const { data } = await api.post(`/qr/${poi.id}`, { note: 'Generated from dashboard' });
      setQrResults(prev => ({ ...prev, [poi.id]: data }));
    } catch (err) {
      alert(err.response?.data?.message || 'Khong the tao QR');
    } finally {
      setGenerating(null);
    }
  };

  const copyText = async value => {
    await navigator.clipboard.writeText(value);
    alert('Da copy');
  };

  return (
    <Layout
      title="Quan ly QR"
      subtitle={isAdmin ? 'Quan ly QR cho tat ca POI' : 'Xem QR cua POI do ban quan ly'}
    >
      <div className="alert alert-info">
        Moi QR code lien ket voi 1 POI. Guest web app co the scan bang camera neu trinh duyet ho tro, hoac nhap ma thu cong.
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Danh sach QR theo POI</span></div>
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>POI</th>
                  <th>Trang thai</th>
                  <th>Ma QR</th>
                  <th>Guest URL</th>
                  <th>Thao tac</th>
                </tr>
              </thead>
              <tbody>
                {visiblePois.map(poi => {
                  const qr = qrResults[poi.id];
                  return (
                    <tr key={poi.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{poi.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
                          POI #{poi.id} {poi.ownerId ? `| Owner #${poi.ownerId}` : ''}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'grid', gap: 6 }}>
                          <span className={`badge ${poi.status === 'APPROVED' ? 'badge-success' : 'badge-warning'}`}>
                            {poi.status || 'PENDING'}
                          </span>
                          <span className={`badge ${poi.isActive ? 'badge-success' : 'badge-danger'}`}>
                            {poi.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td>
                        {qr ? (
                          <code style={{ fontSize: '0.75rem', background: 'var(--clr-surface-2)', padding: '4px 8px', borderRadius: 4, wordBreak: 'break-all' }}>
                            {qr.qrValue}
                          </code>
                        ) : (
                          <span style={{ color: 'var(--clr-text-muted)' }}>Chua co QR</span>
                        )}
                      </td>
                      <td>
                        {qr ? (
                          <a href={`/qr/${qr.qrValue}`} target="_blank" rel="noreferrer">
                            /qr/{qr.qrValue}
                          </a>
                        ) : '—'}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          {isAdmin && (
                            <button
                              id={`gen-qr-${poi.id}`}
                              className="btn btn-primary btn-sm"
                              onClick={() => generateQR(poi)}
                              disabled={generating === poi.id || poi.status !== 'APPROVED'}
                            >
                              {generating === poi.id ? 'Dang tao...' : qr ? 'Tao lai QR' : 'Tao QR'}
                            </button>
                          )}
                          {qr && (
                            <>
                              <button className="btn btn-secondary btn-sm" onClick={() => copyText(qr.qrValue)}>
                                Copy ma
                              </button>
                              <button className="btn btn-secondary btn-sm" onClick={() => copyText(`${window.location.origin}/qr/${qr.qrValue}`)}>
                                Copy link
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
