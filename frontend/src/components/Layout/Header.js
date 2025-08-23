import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const { user, logout } = useAuth();

  const toggleSidebar = () => {
    document.body.classList.toggle('sidebar-collapsed');
    // Store sidebar state
    const isCollapsed = document.body.classList.contains('sidebar-collapsed');
    localStorage.setItem('sidebarCollapsed', isCollapsed);
  };

  return (
    <nav className="main-header navbar navbar-expand navbar-white navbar-light">
      <ul className="navbar-nav">
        <li className="nav-item">
          <button
            className="nav-link"
            onClick={toggleSidebar}
            style={{ 
              border: 'none', 
              background: 'transparent',
              cursor: 'pointer'
            }}
            title="Toggle Sidebar"
          >
            <i className="fas fa-bars"></i>
          </button>
        </li>
      </ul>

      <ul className="navbar-nav ml-auto">
        <li className="nav-item dropdown">
          <a 
            className="nav-link dropdown-toggle" 
            href="#!" 
            role="button" 
            data-toggle="dropdown"
            aria-expanded="false"
          >
            <i className="fas fa-user mr-1"></i> {user?.firstName}
          </a>
          <div className="dropdown-menu dropdown-menu-right">
            <span className="dropdown-item-text">
              <i className="fas fa-user-circle mr-2"></i>
              {user?.firstName} {user?.lastName}
            </span>
            <div className="dropdown-divider"></div>
            <a className="dropdown-item" href="/settings">
              <i className="fas fa-cog mr-2"></i> Settings
            </a>
            <div className="dropdown-divider"></div>
            <button 
              className="dropdown-item" 
              onClick={logout}
              style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
            >
              <i className="fas fa-sign-out-alt mr-2"></i> Logout
            </button>
          </div>
        </li>
      </ul>
    </nav>
  );
};

export default Header;