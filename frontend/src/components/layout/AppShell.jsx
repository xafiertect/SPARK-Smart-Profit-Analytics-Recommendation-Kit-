import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, ScanLine, MessageCircle, Package, Settings, Zap } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import BottomNav from './BottomNav';
import './AppShell.css';

export default function AppShell() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="app-shell">
      {/* Desktop sidebar */}
      <aside className="app-shell__sidebar">
        <div className="sidebar__brand">
          <div className="sidebar__logo">
            <Zap size={20} />
          </div>
          <div className="sidebar__name">
            <span>SPARK</span>
          </div>
        </div>

        <nav className="sidebar__nav">
          <NavLink to="/" end className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}>
            <Package size={18} /> Produk
          </NavLink>
          <NavLink to="/chat" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}>
            <MessageCircle size={18} /> AI Chat
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}>
            <Settings size={18} /> Pengaturan
          </NavLink>

          <NavLink to="/scan" className="sidebar__link sidebar__link--scan">
            <ScanLine size={18} /> Scan Nota
          </NavLink>
        </nav>

        <div className="sidebar__user">
          <div className="sidebar__avatar">
            {user?.business_name?.charAt(0) || 'S'}
          </div>
          <div className="sidebar__user-info">
            <span className="sidebar__user-name">{user?.business_name || 'SPARK User'}</span>
            <span className="sidebar__user-role">Pemilik Usaha</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="app-shell__main">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
