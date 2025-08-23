import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '../../services/api';
import RevenueForm from '../../components/Forms/RevenueForm';
import DataTable from '../../components/Common/DataTable';

const Revenues = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingRevenue, setEditingRevenue] = useState(null);
  const queryClient = useQueryClient();

  const { data: revenues, isLoading } = useQuery({
    queryKey: ['revenues'],
    queryFn: async () => {
      const response = await api.get('/revenues');
      return response.data.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/revenues/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['revenues']);
      toast.success('Revenue deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete revenue');
    }
  });

  const columns = [
    { 
      field: 'date', 
      headerName: 'Date', 
      width: 120, 
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A' 
    },
    { field: 'type', headerName: 'Type', width: 120 },
    { 
      field: 'amount', 
      headerName: 'Amount', 
      width: 120, 
      valueFormatter: (params) => params.value ? `$${params.value.toFixed(2)}` : '$0.00' 
    },
    { field: 'description', headerName: 'Description', width: 200 },
    { 
      field: 'recordedBy', 
      headerName: 'Recorded By', 
      width: 150, 
      valueFormatter: (params) => params.value ? `${params.value.firstName} ${params.value.lastName}` : 'N/A' 
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <div>
          <button
            className="btn btn-sm btn-primary mr-1"
            onClick={() => setEditingRevenue(params.row)}
          >
            Edit
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => deleteMutation.mutate(params.row._id)}
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  if (isLoading) return <div className="text-center">Loading revenues...</div>;

  return (
    <div>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Revenues</h1>
            </div>
            <div className="col-sm-6 text-right">
              <button
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                <i className="fas fa-plus mr-1"></i> Add Revenue
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Revenue Records</h3>
          </div>
          <div className="card-body">
            <DataTable
              rows={revenues || []}
              columns={columns}
              loading={isLoading}
            />
          </div>
        </div>
      </div>

      {(showForm || editingRevenue) && (
        <RevenueForm
          revenue={editingRevenue}
          onClose={() => {
            setShowForm(false);
            setEditingRevenue(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingRevenue(null);
            queryClient.invalidateQueries(['revenues']);
          }}
        />
      )}
    </div>
  );
};

export default Revenues;