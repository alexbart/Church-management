import React from 'react';

const ReportFilters = ({ filters, onChange, onGenerate }) => {
  const handleFilterChange = (key, value) => {
    onChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className="row">
      <div className="col-md-3">
        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            className="form-control"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
          />
        </div>
      </div>
      <div className="col-md-3">
        <div className="form-group">
          <label>End Date</label>
          <input
            type="date"
            className="form-control"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
          />
        </div>
      </div>
      <div className="col-md-2">
        <div className="form-group">
          <label>Revenue Type</label>
          <select
            className="form-control"
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="tithe">Tithe</option>
            <option value="offering">Offering</option>
            <option value="donation">Donation</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div className="col-md-2">
        <div className="form-group">
          <label>Expense Category</label>
          <select
            className="form-control"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="utilities">Utilities</option>
            <option value="salaries">Salaries</option>
            <option value="maintenance">Maintenance</option>
            <option value="outreach">Outreach</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div className="col-md-2">
        <div className="form-group">
          <label>&nbsp;</label>
          <button
            className="btn btn-primary btn-block"
            onClick={onGenerate}
          >
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportFilters;