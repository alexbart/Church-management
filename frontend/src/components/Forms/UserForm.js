import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '../../services/api';

const UserForm = ({ user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'member',
    isActive: true
  });
  const [errors, setErrors] = useState({});

  const queryClient = useQueryClient();

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        role: user.role || 'member',
        isActive: user.isActive !== undefined ? user.isActive : true
      });
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: (data) => 
      user 
        ? api.put(`/users/${user._id}`, data)
        : api.post('/auth/register', { ...data, password: 'TempPassword123!' }),
    onSuccess: () => {
      toast.success(user ? 'User updated successfully' : 'User created successfully');
      onSuccess();
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Operation failed';
      toast.error(errorMessage);
      
      // Set form errors if available
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    
    // Basic validation
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    mutation.mutate(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear error when field is edited
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const handleCheckboxChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked
    });
  };

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{user ? 'Edit User' : 'Add New User'}</h5>
            <button type="button" className="close" onClick={onClose}>
              <span>&times;</span>
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                    {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                    {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={!!user} // Disable email editing for existing users
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Role</label>
                    <select
                      name="role"
                      className="form-control"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="member">Member</option>
                      <option value="pastor">Pastor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Status</label>
                    <div className="custom-control custom-switch mt-2">
                      <input
                        type="checkbox"
                        name="isActive"
                        className="custom-control-input"
                        id="isActiveSwitch"
                        checked={formData.isActive}
                        onChange={handleCheckboxChange}
                      />
                      <label className="custom-control-label" htmlFor="isActiveSwitch">
                        {formData.isActive ? 'Active' : 'Inactive'}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {!user && (
                <div className="alert alert-info">
                  <i className="fas fa-info-circle mr-2"></i>
                  A temporary password will be generated automatically. The user will need to reset their password on first login.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={mutation.isLoading}>
                {mutation.isLoading ? 'Saving...' : user ? 'Update User' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserForm;