import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import '../../App.css';

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const { data: summary, isLoading, error } = useQuery({
    queryKey: ['financial-summary'],
    queryFn: async () => {
      try {
        const response = await api.get('/reports/financial-summary');
        return response.data.data;
      } catch (error) {
        console.error('Error fetching financial summary:', error);
        return {
          totalRevenue: 0,
          totalExpense: 0,
          balance: 0,
          revenueByType: [],
          expenseByCategory: []
        };
      }
    }
  });

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-2">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        Error loading dashboard data: {error.message}
      </div>
    );
  }

  return (
    <div className={`wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Navbar */}
      <nav className="main-header navbar navbar-expand navbar-white navbar-light">
        <ul className="navbar-nav">
          <li className="nav-item">
            <button className="nav-link" onClick={toggleSidebar}>
              <i className="fas fa-bars"></i>
            </button>
          </li>
        </ul>
      </nav>

      {/* Sidebar */}
      <aside className="main-sidebar sidebar-dark-primary elevation-4">
        <a href="/" className="brand-link">
          <span className="brand-text font-weight-light">Church Management</span>
        </a>

        <div className="sidebar">
          <nav className="mt-2">
            <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu">
              <li className="nav-item">
                <a href="/" className="nav-link active">
                  <i className="nav-icon fas fa-tachometer-alt"></i>
                  <p>Dashboard</p>
                </a>
              </li>
              <li className="nav-item">
                <a href="/revenues" className="nav-link">
                  <i className="nav-icon fas fa-money-bill-wave"></i>
                  <p>Revenues</p>
                </a>
              </li>
              <li className="nav-item">
                <a href="/expenses" className="nav-link">
                  <i className="nav-icon fas fa-receipt"></i>
                  <p>Expenses</p>
                </a>
              </li>
              <li className="nav-item">
                <a href="/reports" className="nav-link">
                  <i className="nav-icon fas fa-chart-bar"></i>
                  <p>Reports</p>
                </a>
              </li>
              <li className="nav-item">
                <a href="/users" className="nav-link">
                  <i className="nav-icon fas fa-users"></i>
                  <p>Users</p>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Content Wrapper */}
      <div className="content-wrapper">
        <div className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 className="m-0">Dashboard</h1>
              </div>
              <div className="col-sm-6">
                <ol className="breadcrumb float-sm-right">
                  <li className="breadcrumb-item"><a href="/">Home</a></li>
                  <li className="breadcrumb-item active">Dashboard</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-3 col-6">
              <div className="small-box bg-info">
                <div className="inner">
                  <h3>${(summary?.totalRevenue || 0).toFixed(2)}</h3>
                  <p>Total Revenue</p>
                </div>
                <div className="icon">
                  <i className="fas fa-money-bill-wave"></i>
                </div>
                <a href="/revenues" className="small-box-footer">
                  More info <i className="fas fa-arrow-circle-right"></i>
                </a>
              </div>
            </div>

            <div className="col-lg-3 col-6">
              <div className="small-box bg-success">
                <div className="inner">
                  <h3>${(summary?.totalExpense || 0).toFixed(2)}</h3>
                  <p>Total Expenses</p>
                </div>
                <div className="icon">
                  <i className="fas fa-receipt"></i>
                </div>
                <a href="/expenses" className="small-box-footer">
                  More info <i className="fas fa-arrow-circle-right"></i>
                </a>
              </div>
            </div>

            <div className="col-lg-3 col-6">
              <div className="small-box bg-warning">
                <div className="inner">
                  <h3>${(summary?.balance || 0).toFixed(2)}</h3>
                  <p>Current Balance</p>
                </div>
                <div className="icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <a href="/reports" className="small-box-footer">
                  More info <i className="fas fa-arrow-circle-right"></i>
                </a>
              </div>
            </div>

            <div className="col-lg-3 col-6">
              <div className="small-box bg-secondary">
                <div className="inner">
                  <h3>{(summary?.revenueByType?.length || 0) + (summary?.expenseByCategory?.length || 0)}</h3>
                  <p>Total Entries</p>
                </div>
                <div className="icon">
                  <i className="fas fa-list"></i>
                </div>
                <a href="/reports" className="small-box-footer">
                  View reports <i className="fas fa-arrow-circle-right"></i>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="row mt-4">
            <div className="col-md-12">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Quick Actions</h3>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3 col-sm-6 text-center">
                      <a href="/revenues" className="btn btn-app">
                        <i className="fas fa-money-bill-wave fa-2x"></i>
                        <span>Add Revenue</span>
                      </a>
                    </div>
                    <div className="col-md-3 col-sm-6 text-center">
                      <a href="/expenses" className="btn btn-app">
                        <i className="fas fa-receipt fa-2x"></i>
                        <span>Add Expense</span>
                      </a>
                    </div>
                    <div className="col-md-3 col-sm-6 text-center">
                      <a href="/reports" className="btn btn-app">
                        <i className="fas fa-chart-bar fa-2x"></i>
                        <span>View Reports</span>
                      </a>
                    </div>
                    <div className="col-md-3 col-sm-6 text-center">
                      <a href="/users" className="btn btn-app">
                        <i className="fas fa-users fa-2x"></i>
                        <span>Manage Users</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;