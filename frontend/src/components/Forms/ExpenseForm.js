import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '../../services/api';

const ExpenseForm = ({ expense, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    category: 'utilities',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (expense) {
      setFormData({
        category: expense.category,
        amount: expense.amount,
        date: expense.date.split('T')[0],
        description: expense.description || ''
      });
    }
  }, [expense]);

  const mutation = useMutation({
    mutationFn: (data) => 
      expense 
        ? api.put(`/expenses/${expense._id}`, data)
        : api.post('/expenses', data),
    onSuccess: () => {
      toast.success(expense ? 'Expense updated successfully' : 'Expense created successfully');
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      ...formData,
      amount: parseFloat(formData.amount)
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{expense ? 'Edit Expense' : 'Add Expense'}</h5>
            <button type="button" className="close" onClick={onClose}>
              <span>&times;</span>
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  className="form-control"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="utilities">Utilities</option>
                  <option value="salaries">Salaries</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="outreach">Outreach</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  name="amount"
                  className="form-control"
                  value={formData.amount}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  className="form-control"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={mutation.isLoading}>
                {mutation.isLoading ? 'Saving...' : expense ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExpenseForm;