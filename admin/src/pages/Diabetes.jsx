import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, FileText, Search, Loader2, Image, X, Upload } from 'lucide-react';
import api from '../api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const emptyForm = { title: '', topic: '', content: '', images: [], imageFiles: [] };
const apiOrigin = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

export default function Diabetes() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [newImageName, setNewImageName] = useState('');

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const { data } = await api.get('/diabetes');
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
    setEditing(item.diabetes_id);
    setForm({
      title: item.title ?? '',
      topic: item.topic ?? '',
      content: item.content ?? '',
      images: item.images ?? [],
      imageFiles: [],
    });
    setModalOpen(true);
  };

  const addImageFiles = (files) => {
    const imageFiles = Array.from(files || []).filter((file) => file.type.startsWith('image/'));
    if (imageFiles.length === 0) return;
    setForm({
      ...form,
      imageFiles: [...form.imageFiles, ...imageFiles],
    });
  };

  const addImage = () => {
    if (!newImageName.trim()) return;
    setForm({
      ...form,
      images: [...form.images, { image_name: newImageName.trim() }],
    });
    setNewImageName('');
  };

  const removeImage = (idx) => {
    setForm({
      ...form,
      images: form.images.filter((_, i) => i !== idx),
    });
  };

  const removeImageFile = (idx) => {
    setForm({
      ...form,
      imageFiles: form.imageFiles.filter((_, i) => i !== idx),
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('title', form.title);
      payload.append('topic', form.topic);
      payload.append('content', form.content);
      payload.append('existingImages', JSON.stringify(form.images.map((img) => ({ image_name: img.image_name }))));
      form.imageFiles.forEach((file) => {
        payload.append('images', file);
      });
      if (editing) {
        await api.put(`/diabetes/${editing}`, payload);
      } else {
        await api.post('/diabetes', payload);
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
      await api.delete(`/diabetes/${deleteId}`);
      setItems(items.filter((i) => i.diabetes_id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = items.filter(
    (i) =>
      i.title?.toLowerCase().includes(search.toLowerCase()) ||
      i.topic?.toLowerCase().includes(search.toLowerCase()) ||
      i.content?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-100 flex items-center gap-3">
            <FileText className="w-7 h-7 text-brand-400" />
            ข้อมูลเบาหวาน
          </h1>
          <p className="text-surface-400 mt-1">จัดการข้อมูลโรคเบาหวานและเนื้อหาความรู้</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 self-start">
          <Plus className="w-5 h-5" />
          เพิ่มข้อมูล
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
        <input
          type="text"
          className="input-field pl-12"
          placeholder="ค้นหาจากชื่อเรื่อง, หัวข้อ, หรือเนื้อหา..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-800 bg-surface-900/50">
                <th className="table-header">#</th>
                <th className="table-header">ชื่อเรื่อง</th>
                <th className="table-header">หัวข้อ</th>
                <th className="table-header">เนื้อหา</th>
                <th className="table-header">รูปภาพ</th>
                <th className="table-header text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto" />
                    <p className="text-surface-400 mt-2">กำลังโหลดข้อมูล...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-surface-400">
                    {search ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีข้อมูลเบาหวาน'}
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr key={item.diabetes_id} className="hover:bg-surface-800/30 transition-colors">
                    <td className="table-cell text-surface-500">{idx + 1}</td>
                    <td className="table-cell font-medium max-w-[200px] truncate">{item.title}</td>
                    <td className="table-cell">
                      <span className="badge-pink">{item.topic || '-'}</span>
                    </td>
                    <td className="table-cell text-surface-400 max-w-[250px] truncate">
                      {item.content || '-'}
                    </td>
                    <td className="table-cell">
                      {item.images?.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {item.images.slice(0, 3).map((img) => (
                              <img
                                key={img.image_id || img.image_name}
                                src={`${apiOrigin}/uploads/${img.image_name}`}
                                alt={img.image_name}
                                className="w-8 h-8 rounded-lg object-cover border border-surface-700 bg-surface-800"
                              />
                            ))}
                          </div>
                          <span className="text-sm text-brand-300">{item.images.length} รูป</span>
                        </div>
                      ) : (
                        <span className="text-surface-600 text-sm">ไม่มี</span>
                      )}
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(item)} className="btn-icon text-surface-400 hover:text-brand-400">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(item.diabetes_id)} className="btn-icon text-surface-400 hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <Modal
          title={editing ? 'แก้ไขข้อมูลเบาหวาน' : 'เพิ่มข้อมูลเบาหวานใหม่'}
          onClose={() => setModalOpen(false)}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="label-text">ชื่อเรื่อง</label>
              <input
                type="text"
                className="input-field"
                placeholder="กรอกชื่อเรื่อง..."
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label-text">หัวข้อ</label>
              <input
                type="text"
                className="input-field"
                placeholder="เช่น ความรู้ทั่วไป, การดูแลตนเอง..."
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
              />
            </div>
            <div>
              <label className="label-text">เนื้อหา</label>
              <textarea
                className="textarea-field min-h-[140px]"
                placeholder="กรอกเนื้อหา..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </div>

            {/* Image Management */}
            <div>
              <label className="label-text">รูปภาพ</label>
              <div className="space-y-2">
                {form.images.map((img, idx) => (
                  <div key={img.image_id || img.image_name || idx} className="flex items-center gap-3 bg-surface-800/40 rounded-lg px-3 py-2">
                    <img
                      src={`${apiOrigin}/uploads/${img.image_name}`}
                      alt={img.image_name}
                      className="w-12 h-12 rounded-lg object-cover border border-surface-700 bg-surface-900"
                    />
                    <span className="text-sm text-surface-300 flex-1 truncate">{img.image_name}</span>
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="text-surface-500 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input-field flex-1"
                    placeholder="ชื่อไฟล์รูปภาพ (เช่น foot_wound_01.jpg)"
                    value={newImageName}
                    onChange={(e) => setNewImageName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addImage();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addImage}
                    className="btn-secondary flex items-center gap-1 whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    เพิ่มรูป
                  </button>
                </div>
                {form.imageFiles.map((file, idx) => (
                  <div key={`${file.name}-${idx}`} className="flex items-center gap-3 bg-brand-500/10 border border-brand-500/20 rounded-lg px-3 py-2">
                    <Image className="w-5 h-5 text-brand-400 flex-shrink-0" />
                    <span className="text-sm text-surface-200 flex-1 truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeImageFile(idx)}
                      className="text-surface-500 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-surface-700 bg-surface-900 px-4 py-5 text-sm text-surface-300 transition-colors hover:border-brand-500 hover:text-brand-300">
                  <Upload className="w-5 h-5" />
                  <span>เลือกไฟล์รูปภาพ</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      addImageFiles(e.target.files);
                      e.target.value = '';
                    }}
                  />
                </label>
                <div className="text-xs text-surface-500">
                  รองรับ JPG, PNG, GIF, WEBP และไฟล์รูปภาพทั่วไป
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
                ยกเลิก
              </button>
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? 'บันทึกการแก้ไข' : 'เพิ่มข้อมูล'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirm Delete */}
      {deleteId && (
        <ConfirmDialog
          message="คุณต้องการลบข้อมูลเบาหวานนี้หรือไม่? รูปภาพที่เกี่ยวข้องจะถูกลบด้วย"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
