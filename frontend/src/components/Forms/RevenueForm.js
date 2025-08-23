import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '../../services/api';

const RevenueForm = ({ revenue, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    type: 'tithe',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    memberId: ''
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (revenue) {
      setFormData({
        type: revenue.type,
        amount: revenue.amount,
        date: revenue.date.split('T')[0],
        description: revenue.description || '',
        memberId: revenue.memberId || ''
      });
    }
  }, [revenue]);

  const mutation = useMutation({
    mutationFn: (data) => 
      revenue 
        ? api.put(`/revenues/${revenue._id}`, data)
        : api.post('/revenues', data),
    onSuccess: () => {
      toast.success(revenue ? 'Revenue updated successfully' : 'Revenue created successfully');
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
            <h5 className="modal-title">{revenue ? 'Edit Revenue' : 'Add Revenue'}</h5>
            <button type="button" className="close" onClick={onClose}>
              <span>&times;</span>
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-group">
                <label>Type</label>
                <select
                  name="type"
                  className="form-control"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="tithe">Tithe</option>
                  <option value="offering">Offering</option>
                  <option value="donation">Donation</option>
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

              <div className="form-group">
                <label>Member ID (Optional)</label>
                <input
                  type="text"
                  name="memberId"
                  className="form-control"
                  value={formData.memberId}
                  onChange={handleChange}
                  placeholder="Enter member ID if applicable"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={mutation.isLoading}>
                {mutation.isLoading ? 'Saving...' : revenue ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RevenueForm;