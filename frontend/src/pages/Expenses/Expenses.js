import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '../../services/api';
import ExpenseForm from '../../components/Forms/ExpenseForm';
import DataTable from '../../components/Common/DataTable';

const Expenses = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const queryClient = useQueryClient();

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const response = await api.get('/expenses');
      return response.data.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['expenses']);
      toast.success('Expense deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete expense');
    }
  });

  const approveMutation = useMutation({
    mutationFn: (id) => api.patch(`/expenses/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries(['expenses']);
      toast.success('Expense approved successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to approve expense');
    }
  });

  const columns = [
    { 
      field: 'date', 
      headerName: 'Date', 
      width: 120, 
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A' 
    },
    { field: 'category', headerName: 'Category', width: 120 },
    { 
      field: 'amount', 
      headerName: 'Amount', 
      width: 120, 
      valueFormatter: (params) => params.value ? `$${params.value.toFixed(2)}` : '$0.00' 
    },
    { field: 'status', headerName: 'Status', width: 100 },
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
      width: 180,
      renderCell: (params) => (
        <div>
          {params.row.status === 'pending' && (
            <button
              className="btn btn-sm btn-success mr-1"
              onClick={() => approveMutation.mutate(params.row._id)}
            >
              Approve
            </button>
          )}
          <button
            className="btn btn-sm btn-primary mr-1"
            onClick={() => setEditingExpense(params.row)}
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

  if (isLoading) return <div className="text-center">Loading expenses...</div>;

  return (
    <div>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Expenses</h1>
            </div>
            <div className="col-sm-6 text-right">
              <button
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                <i className="fas fa-plus mr-1"></i> Add Expense
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Expense Records</h3>
          </div>
          <div className="card-body">
            <DataTable
              rows={expenses || []}
              columns={columns}
              loading={isLoading}
            />
          </div>
        </div>
      </div>

      {(showForm || editingExpense) && (
        <ExpenseForm
          expense={editingExpense}
          onClose={() => {
            setShowForm(false);
            setEditingExpense(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingExpense(null);
            queryClient.invalidateQueries(['expenses']);
          }}
        />
      )}
    </div>
  );
};

export default Expenses;