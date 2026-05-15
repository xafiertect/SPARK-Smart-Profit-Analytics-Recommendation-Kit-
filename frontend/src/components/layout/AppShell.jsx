import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, ScanLine, MessageCircle, Package, Settings, Zap, Search, Bell, Sun, Moon } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import BottomNav from './BottomNav';
import './AppShell.css';
import { useState, useEffect } from 'react';

function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    return document.documentElement.dataset.theme || localStorage.getItem('spark-theme') || 'dark';
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.dataset.theme);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('spark-theme', next);
  };

  return (
    <button onClick={toggle} className="topbar__btn" aria-label="Toggle Theme">
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

export default function AppShell() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/products': return '📦 Produk';
      case '/chat': return '💬 AI Chat';
      case '/settings': return '⚙️ Pengaturan';
      case '/scan': return '📸 Scan Nota';
      case '/validation': return '✅ Validasi';
      default: return 'SPARK';
    }
  };

  return (
    <div className="app-shell">
      {/* Sidebar (Tablet/Desktop) */}
      <aside className="app-shell__sidebar">
        <div className="sidebar__brand">
          <div className="sidebar__logo animate-pulse-gold">
            <Zap size={24} />
          </div>
          <span className="sidebar__name">SPARK</span>
        </div>

        <nav className="sidebar__nav">
          <NavLink to="/" end className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}>
            <LayoutDashboard size={20} /> <span className="sidebar__label">Dashboard</span>
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}>
            <Package size={20} /> <span className="sidebar__label">Produk</span>
          </NavLink>
          <NavLink to="/scan" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}>
            <ScanLine size={20} /> <span className="sidebar__label">Scan Nota</span>
          </NavLink>
          <NavLink to="/chat" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}>
            <MessageCircle size={20} /> <span className="sidebar__label">AI Chat</span>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}>
            <Settings size={20} /> <span className="sidebar__label">Pengaturan</span>
          </NavLink>
        </nav>

        <div className="sidebar__bottom">
          <div className="sidebar__user">
            <div className="sidebar__avatar">
              {user?.business_name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">{user?.business_name || 'SPARK User'}</span>
              <span className="sidebar__user-role">Pemilik Usaha</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="app-shell__content">
        {/* Topbar */}
        <header className="app-shell__topbar">
          <div className="topbar__left">
            <h1 className="topbar__title">{getPageTitle()}</h1>
          </div>
          <div className="topbar__center">
            <div className="topbar__search">
              <Search size={16} className="search-icon" />
              <input type="text" placeholder="Cari..." />
              <div className="search-hint">⌘K</div>
            </div>
          </div>
          <div className="topbar__right">
            <button className="topbar__btn relative" aria-label="Notifications">
              <Bell size={20} />
              <span className="topbar__notif-badge" />
            </button>
            <ThemeToggle />
            <div className="topbar__avatar">
              {user?.business_name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="app-shell__main">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
