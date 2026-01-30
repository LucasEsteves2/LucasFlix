import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  brandTitle?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, brandTitle = 'LucasFlix' }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/">{brandTitle}</Link>
        </div>
        <div className="navbar-menu">
          <Link to="/" className={isActive('/') ? 'active' : ''}>
            <span className="menu-icon">🏠</span>
            <span>Home</span>
          </Link>
          <Link to="/sessions" className={isActive('/sessions') ? 'active' : ''}>
            <span className="menu-icon">🍿</span>
            <span>Sessões</span>
          </Link>
          <Link to="/rankings" className={isActive('/rankings') ? 'active' : ''}>
            <span className="menu-icon">🏆</span>
            <span>Rankings</span>
          </Link>
          <Link to="/achievements" className={isActive('/achievements') ? 'active' : ''}>
            <span className="menu-icon">🏅</span>
            <span>Conquistas</span>
          </Link>
          <Link to="/backup" className={isActive('/backup') ? 'active' : ''}>
            <span className="menu-icon">💾</span>
            <span>Backup</span>
          </Link>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};
