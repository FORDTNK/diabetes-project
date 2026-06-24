import { useEffect, useState } from 'react';
import { Trash2, Search, Users as UsersIcon, Loader2 } from 'lucide-react';
import api from '../api';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/users/${deleteId}`);
      setUsers(users.filter((u) => u.user_id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error('Failed to delete user:', err);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.national_id?.includes(search) ||
      u.phone?.includes(search)
  );

  const formatDate = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-100 flex items-center gap-3">
            <UsersIcon className="w-7 h-7 text-brand-400" />
            จัดการผู้ใช้
          </h1>
          <p className="text-surface-400 mt-1">ดูรายชื่อและจัดการบัญชีผู้ใช้ในระบบ</p>
        </div>
        <div className="badge-pink text-sm">
          ทั้งหมด {users.length} คน
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
        <input
          type="text"
          className="input-field pl-12"
          placeholder="ค้นหาจากชื่อ, เลขบัตรประชาชน, หรือเบอร์โทร..."
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
                <th className="table-header">เลขบัตรประชาชน</th>
                <th className="table-header">ชื่อ-นามสกุล</th>
                <th className="table-header">วันเกิด</th>
                <th className="table-header">เบอร์โทร</th>
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
                    {search ? 'ไม่พบผู้ใช้ที่ค้นหา' : 'ยังไม่มีข้อมูลผู้ใช้'}
                  </td>
                </tr>
              ) : (
                filtered.map((u, idx) => (
                  <tr key={u.user_id} className="hover:bg-surface-800/30 transition-colors">
                    <td className="table-cell text-surface-500">{idx + 1}</td>
                    <td className="table-cell">
                      <span className="font-mono text-brand-300">{u.national_id}</span>
                    </td>
                    <td className="table-cell font-medium">
                      {u.first_name} {u.last_name}
                    </td>
                    <td className="table-cell text-surface-400">{formatDate(u.birth_date)}</td>
                    <td className="table-cell text-surface-400">{u.phone || '-'}</td>
                    <td className="table-cell text-right">
                      <button
                        onClick={() => setDeleteId(u.user_id)}
                        className="btn-danger text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Delete */}
      {deleteId && (
        <ConfirmDialog
          message="คุณต้องการลบผู้ใช้รายนี้หรือไม่? การดำเนินการนี้ไม่สามารถเรียกคืนได้"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
