import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  brandTitle?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, brandTitle = 'LucasFlix' }) => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/" onClick={closeMenu}>{brandTitle}</Link>
        </div>
        
        <button 
          className="hamburger-btn" 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
        </button>
        
        <div className={`navbar-menu ${menuOpen ? 'menu-open' : ''}`}>
          <Link to="/" className={isActive('/') ? 'active' : ''} onClick={closeMenu}>
            <span className="menu-icon">🏠</span>
            <span>Home</span>
          </Link>
          <Link to="/sessions" className={isActive('/sessions') ? 'active' : ''} onClick={closeMenu}>
            <span className="menu-icon">🍿</span>
            <span>Sessões</span>
          </Link>
          <Link to="/rankings" className={isActive('/rankings') ? 'active' : ''} onClick={closeMenu}>
            <span className="menu-icon">🏆</span>
            <span>Rankings</span>
          </Link>
          <Link to="/achievements" className={isActive('/achievements') ? 'active' : ''} onClick={closeMenu}>
            <span className="menu-icon">🏅</span>
            <span>Conquistas</span>
          </Link>
          <Link to="/backup" className={isActive('/backup') ? 'active' : ''} onClick={closeMenu}>
            <span className="menu-icon">💾</span>
            <span>Backup</span>
          </Link>
        </div>
        
        {menuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};
