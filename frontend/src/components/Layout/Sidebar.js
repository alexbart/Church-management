import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <aside className="main-sidebar sidebar-dark-primary elevation-4">
      <a href="/" className="brand-link">
        <span className="brand-text font-weight-light">Church Management</span>
      </a>

      <div className="sidebar">
        <nav className="mt-2">
          <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu">
            <li className="nav-item">
              <Link to="/" className={`nav-link ${isActive('/')}`}>
                <i className="nav-icon fas fa-tachometer-alt"></i>
                <p>Dashboard</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/revenues" className={`nav-link ${isActive('/revenues')}`}>
                <i className="nav-icon fas fa-money-bill-wave"></i>
                <p>Revenues</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/expenses" className={`nav-link ${isActive('/expenses')}`}>
                <i className="nav-icon fas fa-receipt"></i>
                <p>Expenses</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/reports" className={`nav-link ${isActive('/reports')}`}>
                <i className="nav-icon fas fa-chart-bar"></i>
                <p>Reports</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/users" className={`nav-link ${isActive('/users')}`}>
                <i className="nav-icon fas fa-users"></i>
                <p>Users</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/settings" className={`nav-link ${isActive('/settings')}`}>
                <i className="nav-icon fas fa-cog"></i>
                <p>Settings</p>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;