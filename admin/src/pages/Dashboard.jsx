import { useEffect, useState } from 'react';
import { Users, FileText, HeartPulse, Image, ShieldCheck, TrendingUp } from 'lucide-react';
import api from '../api';

const statConfig = [
  { key: 'users',         label: 'ผู้ใช้ทั้งหมด',               icon: Users,       gradient: 'from-pink-500 to-rose-600' },
  { key: 'diabetes_info', label: 'ข้อมูลเบาหวาน',             icon: FileText,    gradient: 'from-fuchsia-500 to-pink-600' },
  { key: 'treatments',    label: 'คำแนะนำการดูแล',            icon: HeartPulse,  gradient: 'from-purple-500 to-fuchsia-600' },
  { key: 'images',        label: 'รูปภาพในระบบ',               icon: Image,       gradient: 'from-violet-500 to-purple-600' },
  { key: 'admins',        label: 'ผู้ดูแลระบบ',                  icon: ShieldCheck, gradient: 'from-indigo-500 to-violet-600' },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const admin = JSON.parse(localStorage.getItem('admin') || '{}');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/dashboard/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-surface-100">
          สวัสดี, {admin.first_name || 'แอดมิน'} 👋
        </h1>
        <p className="text-surface-400 mt-1">ภาพรวมข้อมูลทั้งหมดในระบบ</p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card animate-pulse h-36">
              <div className="h-4 bg-surface-800 rounded w-24 mb-4" />
              <div className="h-8 bg-surface-800 rounded w-16" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {statConfig.map(({ key, label, icon: Icon, gradient }, idx) => (
            <div
              key={key}
              className="stat-card"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-sm text-surface-400 mb-1">{label}</p>
                  <p className="text-4xl font-bold text-surface-50 animate-count-up">
                    {stats[key]?.toLocaleString() ?? 0}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="relative z-10 mt-4 flex items-center gap-1 text-xs text-brand-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>ข้อมูลล่าสุด</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12 text-surface-400">
          ไม่สามารถโหลดข้อมูลสถิติได้
        </div>
      )}

      {/* Quick Info */}
      <div className="card">
        <h2 className="text-lg font-semibold text-surface-100 mb-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-500" />
          เกี่ยวกับระบบ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-surface-400">
          <div className="flex items-start gap-3 p-4 bg-surface-800/40 rounded-xl">
            <HeartPulse className="w-5 h-5 text-brand-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-surface-200">ระบบวิเคราะห์เท้าเบาหวาน</p>
              <p className="mt-1">จัดการข้อมูลผู้ป่วย คำแนะนำการรักษา และข้อมูลโรคเบาหวาน</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-surface-800/40 rounded-xl">
            <ShieldCheck className="w-5 h-5 text-brand-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-surface-200">ความปลอดภัยสูง</p>
              <p className="mt-1">ระบบยืนยันตัวตนด้วย JWT Token พร้อมการเข้ารหัสรหัสผ่าน</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
