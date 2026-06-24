import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, HeartPulse, Search, Loader2 } from 'lucide-react';
import api from '../api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const emptyForm = { class_id: '', grade: '', self_care_advice: '', treatment_method: '' };

export default function Treatment() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const { data } = await api.get('/treatment');
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item.guideline_id);
    setForm({
      class_id: item.class_id ?? '',
      grade: item.grade ?? '',
      self_care_advice: item.self_care_advice ?? '',
      treatment_method: item.treatment_method ?? '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/treatment/${editing}`, form);
      } else {
        await api.post('/treatment', form);
      }
      setModalOpen(false);
      fetchItems();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/treatment/${deleteId}`);
      setItems(items.filter((i) => i.guideline_id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = items.filter(
    (i) =>
      i.grade?.toLowerCase().includes(search.toLowerCase()) ||
      i.self_care_advice?.toLowerCase().includes(search.toLowerCase()) ||
      i.treatment_method?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-100 flex items-center gap-3">
            <HeartPulse className="w-7 h-7 text-brand-400" />
            คำแนะนำการดูแล
          </h1>
          <p className="text-surface-400 mt-1">จัดการคำแนะนำการดูแลตนเองและวิธีการรักษา</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 self-start">
          <Plus className="w-5 h-5" />
          เพิ่มคำแนะนำ
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
        <input
          type="text"
          className="input-field pl-12"
          placeholder="ค้นหาจากระดับ, คำแนะนำ, หรือวิธีการรักษา..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Cards */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto" />
          <p className="text-surface-400 mt-2">กำลังโหลดข้อมูล...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12 text-surface-400">
          {search ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีข้อมูลคำแนะนำ'}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div key={item.guideline_id} className="card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {item.class_id ?? '?'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-surface-100">{item.grade || 'ไม่ระบุ'}</h3>
                    <p className="text-xs text-surface-500">Class ID: {item.class_id ?? '-'}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(item)} className="btn-icon text-surface-400 hover:text-brand-400">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteId(item.guideline_id)} className="btn-icon text-surface-400 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-surface-800/40 rounded-xl">
                  <p className="text-xs font-medium text-brand-400 mb-1">💡 คำแนะนำการดูแลตนเอง</p>
                  <p className="text-sm text-surface-300 leading-relaxed">{item.self_care_advice || '-'}</p>
                </div>
                <div className="p-3 bg-surface-800/40 rounded-xl">
                  <p className="text-xs font-medium text-purple-400 mb-1">🩺 วิธีการรักษา</p>
                  <p className="text-sm text-surface-300 leading-relaxed">{item.treatment_method || '-'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <Modal
          title={editing ? 'แก้ไขคำแนะนำ' : 'เพิ่มคำแนะนำใหม่'}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-text">Class ID</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="เช่น 0, 1, 2"
                  value={form.class_id}
                  onChange={(e) => setForm({ ...form, class_id: e.target.value })}
                />
              </div>
              <div>
                <label className="label-text">ระดับ (Grade)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="เช่น ระดับ 0"
                  value={form.grade}
                  onChange={(e) => setForm({ ...form, grade: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="label-text">คำแนะนำการดูแลตนเอง</label>
              <textarea
                className="textarea-field"
                placeholder="กรอกคำแนะนำการดูแลตนเอง..."
                value={form.self_care_advice}
                onChange={(e) => setForm({ ...form, self_care_advice: e.target.value })}
              />
            </div>
            <div>
              <label className="label-text">วิธีการรักษา</label>
              <textarea
                className="textarea-field"
                placeholder="กรอกวิธีการรักษา..."
                value={form.treatment_method}
                onChange={(e) => setForm({ ...form, treatment_method: e.target.value })}
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
                ยกเลิก
              </button>
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? 'บันทึกการแก้ไข' : 'เพิ่มคำแนะนำ'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirm Delete */}
      {deleteId && (
        <ConfirmDialog
          message="คุณต้องการลบคำแนะนำนี้หรือไม่?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
