import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import api from '../../api/client';

export default function PoiApprovalList() {
  const navigate = useNavigate();
  const [pois, setPois] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/pois')
      .then(({ data }) => {
        const pending = data.filter(poi => poi.status !== 'APPROVED');
        setPois(pending);
      })
      .catch(() => setPois([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="Yeu cau duyet POI" subtitle={`${pois.length} POI dang cho duyet`}>
      <div className="card">
        {loading ? (
          <div className="loading-center"><div className="spinner" /><span>Dang tai...</span></div>
        ) : pois.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">Khong co yeu cau duyet</div>
            <div className="empty-state-desc">Tat ca POI hien da duoc xu ly.</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Ten POI</th>
                  <th>Trang thai</th>
                  <th>Hoat dong</th>
                  <th>Thao tac</th>
                </tr>
              </thead>
              <tbody>
                {pois.map(poi => (
                  <tr key={poi.id}>
                    <td>#{poi.id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{poi.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>
                        {Number(poi.latitude).toFixed(4)}, {Number(poi.longitude).toFixed(4)}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-orange">{poi.status || 'PENDING'}</span>
                    </td>
                    <td>
                      <span className={`badge ${poi.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {poi.isActive ? 'Hoat dong' : 'Tat'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/poi-approvals/${poi.id}`)}
                      >
                        Xem va duyet
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
