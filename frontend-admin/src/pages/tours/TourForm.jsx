import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Layout from '../../components/Layout/Layout';
import api from '../../api/client';

function SortableItem({ item }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.poiId });
  return (
    <div ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className={`drag-item ${isDragging ? 'dragging' : ''}`}
    >
      <span className="drag-handle" {...listeners} {...attributes}>⋮⋮</span>
      <span style={{ flex: 1, fontWeight: 500 }}>#{item.orderIndex} — {item.poiName}</span>
      <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', fontFamily: 'monospace' }}>POI ID: {item.poiId}</span>
    </div>
  );
}

export default function TourForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', description: '', isSystem: true, isActive: true });
  const [orderedPois, setOrderedPois] = useState([]);
  const [allPois, setAllPois] = useState([]);
  const [addPoiId, setAddPoiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    api.get('/pois').then(r => setAllPois(r.data)).catch(() => {});
    if (isEdit) {
      setLoading(true);
      api.get(`/tours/${id}`)
        .then(({ data }) => {
          setForm({ name: data.name, description: data.description || '', isSystem: data.system, isActive: data.active });
          if (data.pois) {
            setOrderedPois(data.pois.map(p => ({ poiId: p.poiId || p.id, poiName: p.poiName || p.name, orderIndex: p.orderIndex })));
          }
        })
        .catch(() => alert('Không thể tải tour'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      const oldIdx = orderedPois.findIndex(p => p.poiId === active.id);
      const newIdx = orderedPois.findIndex(p => p.poiId === over.id);
      const reordered = arrayMove(orderedPois, oldIdx, newIdx).map((p, i) => ({ ...p, orderIndex: i + 1 }));
      setOrderedPois(reordered);
    }
  };

  const addPoi = () => {
    if (!addPoiId) return;
    const poi = allPois.find(p => String(p.id) === String(addPoiId));
    if (!poi) return;
    if (orderedPois.find(p => String(p.poiId) === String(poi.id))) { alert('POI này đã trong tour'); return; }
    setOrderedPois(prev => [...prev, { poiId: poi.id, poiName: poi.name, orderIndex: prev.length + 1 }]);
    setAddPoiId('');
  };

  const removePoi = poiId => {
    setOrderedPois(prev => prev.filter(p => p.poiId !== poiId).map((p, i) => ({ ...p, orderIndex: i + 1 })));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim()) { alert('Tên tour không được để trống'); return; }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description,
      isSystem: form.isSystem,
      isActive: form.isActive,
      pois: orderedPois.map(p => ({ poiId: p.poiId, orderIndex: p.orderIndex })),
    };
    try {
      if (isEdit) await api.put(`/tours/${id}`, payload);
      else await api.post('/tours', payload);
      navigate('/tours');
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi lưu tour');
    } finally { setSaving(false); }
  };

  return (
    <Layout title={isEdit ? 'Sửa Tour' : 'Tạo Tour mới'}>
      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Tour Info */}
            <div className="card">
              <div className="card-header"><span className="card-title">Thông tin Tour</span></div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label required">Tên Tour</label>
                  <input id="tour-name" className="form-input" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Vd: Tour Ẩm Thực Buổi Tối" />
                </div>
                <div className="form-group">
                  <label className="form-label">Mô tả</label>
                  <textarea id="tour-desc" className="form-textarea" rows={4} value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Khám phá những địa điểm ẩm thực hấp dẫn…" />
                </div>
                <div className="form-group">
                  <label className="form-label">Loại tour</label>
                  <select id="tour-type" className="form-select" value={form.isSystem}
                    onChange={e => setForm(f => ({ ...f, isSystem: e.target.value === 'true' }))}>
                    <option value="true">🏛️ Tour Hệ thống</option>
                    <option value="false">👤 Tour Cá nhân</option>
                  </select>
                </div>
                <div className="form-group">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="form-label" style={{ margin: 0 }}>Trạng thái:</span>
                    <button type="button"
                      className={`badge ${form.isActive ? 'badge-success' : 'badge-gray'}`}
                      style={{ cursor: 'pointer', border: 'none', padding: '6px 14px' }}
                      onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}>
                      {form.isActive ? '● Hoạt động' : '○ Tắt'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* POI Order */}
            <div className="card">
              <div className="card-header"><span className="card-title">🗺️ Danh sách POI (kéo để sắp xếp)</span></div>
              <div className="card-body">
                <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
                  <select id="add-poi-select" className="form-select" style={{ flex: 1 }}
                    value={addPoiId} onChange={e => setAddPoiId(e.target.value)}>
                    <option value="">— Chọn POI để thêm —</option>
                    {allPois.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <button type="button" id="add-poi-btn" className="btn btn-primary" onClick={addPoi}>＋</button>
                </div>

                {orderedPois.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem' }}>
                    <div style={{ fontSize: '2rem' }}>📍</div>
                    <div>Chưa có POI nào. Thêm POI ở trên.</div>
                  </div>
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={orderedPois.map(p => p.poiId)} strategy={verticalListSortingStrategy}>
                      {orderedPois.map(item => (
                        <div key={item.poiId} style={{ position: 'relative' }}>
                          <SortableItem item={item} />
                          <button type="button"
                            onClick={() => removePoi(item.poiId)}
                            style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-danger)' }}>
                            ✕
                          </button>
                        </div>
                      ))}
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/tours')}>Hủy</button>
            <button id="save-tour-btn" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> Đang lưu…</> : '💾 Lưu Tour'}
            </button>
          </div>
        </form>
      )}
    </Layout>
  );
}
