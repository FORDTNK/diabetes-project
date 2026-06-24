import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  HeartPulse,
  FileText,
  LogOut,
  Activity
} from 'lucide-react';

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'แดชบอร์ด' },
  { to: '/users',     icon: Users,           label: 'จัดการผู้ใช้' },
  { to: '/treatment', icon: HeartPulse,      label: 'คำแนะนำการดูแล' },
  { to: '/diabetes',  icon: FileText,        label: 'ข้อมูลเบาหวาน' },
];

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem('admin') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-72 bg-surface-950 border-r border-surface-800
          flex flex-col transition-transform duration-300 lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-surface-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-brand-400 to-brand-200 bg-clip-text text-transparent">
                Admin Panel
              </h1>
              <p className="text-xs text-surface-500">ระบบจัดการข้อมูล</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs text-surface-600 uppercase tracking-wider px-4 mb-3 font-semibold">
            เมนูหลัก
          </p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Admin info + Logout */}
        <div className="p-4 border-t border-surface-800">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-900/50 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm">
              {admin.first_name?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-200 truncate">
                {admin.first_name} {admin.last_name}
              </p>
              <p className="text-xs text-surface-500">ผู้ดูแลระบบ</p>
            </div>
          </div>
          <button onClick={handleLogout} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <LogOut className="w-5 h-5" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>
    </>
  );
}
