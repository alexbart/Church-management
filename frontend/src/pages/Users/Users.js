import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '../../services/api';
import DataTable from '../../components/Common/DataTable';
import { useAuth } from '../../hooks/useAuth';
import UserForm from '../../components/Forms/UserForm';

const Users = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data.data;
    },
    enabled: currentUser?.role === 'admin'
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }) => api.put(`/users/${id}`, { isActive: !isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('User status updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  });

  const columns = [
    { field: 'firstName', headerName: 'First Name', width: 120 },
    { field: 'lastName', headerName: 'Last Name', width: 120 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'role', headerName: 'Role', width: 100 },
    { 
      field: 'isActive', 
      headerName: 'Status', 
      width: 100, 
      renderCell: (params) => (
        <span className={`badge ${params.value ? 'bg-success' : 'bg-danger'}`}>
          {params.value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    { 
      field: 'lastLogin', 
      headerName: 'Last Login', 
      width: 150, 
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'Never' 
    },
    { 
      field: 'createdAt', 
      headerName: 'Created', 
      width: 120, 
      valueFormatter: (params) => new Date(params.value).toLocaleDateString() 
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        currentUser?.role === 'admin' && (
          <div>
            {params.row._id !== currentUser._id && (
              <>
                <button
                  className="btn btn-sm btn-warning mr-1"
                  onClick={() => setEditingUser(params.row)}
                  title="Edit User"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  className="btn btn-sm btn-secondary mr-1"
                  onClick={() => toggleStatusMutation.mutate({ 
                    id: params.row._id, 
                    isActive: params.row.isActive 
                  })}
                  title={params.row.isActive ? 'Deactivate' : 'Activate'}
                >
                  <i className={`fas ${params.row.isActive ? 'fa-user-times' : 'fa-user-check'}`}></i>
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this user?')) {
                      deleteMutation.mutate(params.row._id);
                    }
                  }}
                  title="Delete User"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </>
            )}
            {params.row._id === currentUser._id && (
              <span className="text-muted">Current User</span>
            )}
          </div>
        )
      )
    }
  ];

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="container-fluid mt-4">
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle mr-2"></i>
          You don't have permission to access this page. Admin privileges required.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container-fluid mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Users Management</h1>
            </div>
            <div className="col-sm-6 text-right">
              <button
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                <i className="fas fa-plus mr-1"></i> Add User
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">System Users</h3>
                <div className="card-tools">
                  <span className="badge bg-primary">
                    Total: {users?.length || 0} users
                  </span>
                </div>
              </div>
              <div className="card-body">
                <DataTable
                  rows={users || []}
                  columns={columns}
                  loading={isLoading}
                  pageSize={10}
                  rowsPerPageOptions={[5, 10, 20]}
                />
              </div>
            </div>
          </div>
        </div>

        {/* User Statistics */}
        <div className="row mt-4">
          <div className="col-md-3 col-sm-6">
            <div className="info-box">
              <span className="info-box-icon bg-info">
                <i className="fas fa-users"></i>
              </span>
              <div className="info-box-content">
                <span className="info-box-text">Total Users</span>
                <span className="info-box-number">{users?.length || 0}</span>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="info-box">
              <span className="info-box-icon bg-success">
                <i className="fas fa-user-check"></i>
              </span>
              <div className="info-box-content">
                <span className="info-box-text">Active Users</span>
                <span className="info-box-number">
                  {users?.filter(user => user.isActive).length || 0}
                </span>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="info-box">
              <span className="info-box-icon bg-danger">
                <i className="fas fa-user-times"></i>
              </span>
              <div className="info-box-content">
                <span className="info-box-text">Inactive Users</span>
                <span className="info-box-number">
                  {users?.filter(user => !user.isActive).length || 0}
                </span>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="info-box">
              <span className="info-box-icon bg-warning">
                <i className="fas fa-user-shield"></i>
              </span>
              <div className="info-box-content">
                <span className="info-box-text">Admins</span>
                <span className="info-box-number">
                  {users?.filter(user => user.role === 'admin').length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Form Modal */}
      {(showForm || editingUser) && (
        <UserForm
          user={editingUser}
          onClose={() => {
            setShowForm(false);
            setEditingUser(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingUser(null);
            queryClient.invalidateQueries(['users']);
          }}
        />
      )}
    </div>
  );
};

export default Users;