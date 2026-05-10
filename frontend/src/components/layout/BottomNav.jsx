import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ScanLine, MessageCircle, Package, Settings } from 'lucide-react';
import './BottomNav.css';

export default function BottomNav() {
  const navigate = useNavigate();

  return (
    <>
      <div className="bottom-nav-spacer" />
      <nav className="bottom-nav" id="bottom-navigation">
        <NavLink
          to="/"
          className={({ isActive }) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
          id="nav-dashboard"
        >
          <LayoutDashboard size={22} />
          <span className="bottom-nav__label">Dashboard</span>
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
          id="nav-products"
        >
          <Package size={22} />
          <span className="bottom-nav__label">Produk</span>
        </NavLink>

        <button
          className="bottom-nav__scan"
          onClick={() => navigate('/scan')}
          id="nav-scan"
          aria-label="Scan Nota"
        >
          <ScanLine size={26} />
        </button>

        <NavLink
          to="/chat"
          className={({ isActive }) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
          id="nav-chat"
        >
          <MessageCircle size={22} />
          <span className="bottom-nav__label">AI Chat</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
          id="nav-settings"
        >
          <Settings size={22} />
          <span className="bottom-nav__label">Lainnya</span>
        </NavLink>
      </nav>
    </>
  );
}
