import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '../../services/api';
import ReportFilters from '../../components/Reports/ReportFilters';
import FinancialCharts from '../../components/Reports/FinancialCharts';

const Reports = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: '',
    category: ''
  });

  const { data: summary, isLoading, refetch } = useQuery({
    queryKey: ['financial-summary', filters],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.type) params.append('type', filters.type);
        if (filters.category) params.append('category', filters.category);

        const response = await api.get(`/reports/financial-summary?${params}`);
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
    },
    enabled: false
  });

  const handleGenerateReport = () => {
    refetch();
  };

  const handleExport = async (type) => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.type) params.append('type', filters.type);
      if (filters.category) params.append('category', filters.category);

      const response = await api.get(`/reports/export-${type}?${params}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `financial-report.${type}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`Report exported successfully as ${type.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  return (
    <div>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Reports</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Report Filters</h3>
              </div>
              <div className="card-body">
                <ReportFilters
                  filters={filters}
                  onChange={setFilters}
                  onGenerate={handleGenerateReport}
                />
              </div>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="row mt-4">
            <div className="col-md-12">
              <div className="card">
                <div className="card-body text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                  <p className="mt-2">Generating report...</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {summary && !isLoading && (
          <>
            <div className="row mt-4">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Financial Summary</h3>
                    <div className="card-tools">
                      <button
                        className="btn btn-sm btn-success mr-2"
                        onClick={() => handleExport('excel')}
                      >
                        <i className="fas fa-file-excel mr-1"></i> Export Excel
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleExport('pdf')}
                      >
                        <i className="fas fa-file-pdf mr-1"></i> Export PDF
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-3 col-sm-6">
                        <div className="info-box bg-info">
                          <span className="info-box-icon"><i className="fas fa-money-bill-wave"></i></span>
                          <div className="info-box-content">
                            <span className="info-box-text">Total Revenue</span>
                            <span className="info-box-number">${(summary.totalRevenue || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 col-sm-6">
                        <div className="info-box bg-success">
                          <span className="info-box-icon"><i className="fas fa-receipt"></i></span>
                          <div className="info-box-content">
                            <span className="info-box-text">Total Expenses</span>
                            <span className="info-box-number">${(summary.totalExpense || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 col-sm-6">
                        <div className="info-box bg-warning">
                          <span className="info-box-icon"><i className="fas fa-chart-line"></i></span>
                          <div className="info-box-content">
                            <span className="info-box-text">Net Balance</span>
                            <span className="info-box-number">${(summary.balance || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 col-sm-6">
                        <div className="info-box bg-secondary">
                          <span className="info-box-icon"><i className="fas fa-list"></i></span>
                          <div className="info-box-content">
                            <span className="info-box-text">Total Entries</span>
                            <span className="info-box-number">
                              {((summary.revenueByType || []).reduce((sum, item) => sum + (item.count || 0), 0) + 
                               (summary.expenseByCategory || []).reduce((sum, item) => sum + (item.count || 0), 0))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <FinancialCharts summary={summary} />

            {/* Additional report sections can be added here */}
            <div className="row mt-4">
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Revenue Breakdown</h3>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(summary.revenueByType || []).map((item, index) => (
                            <tr key={index}>
                              <td>{item._id?.toUpperCase() || 'Unknown'}</td>
                              <td>${(item.total || 0).toFixed(2)}</td>
                              <td>{item.count || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Expense Breakdown</h3>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(summary.expenseByCategory || []).map((item, index) => (
                            <tr key={index}>
                              <td>{item._id?.toUpperCase() || 'Unknown'}</td>
                              <td>${(item.total || 0).toFixed(2)}</td>
                              <td>{item.count || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {!summary && !isLoading && (
          <div className="row mt-4">
            <div className="col-md-12">
              <div className="card">
                <div className="card-body text-center">
                  <i className="fas fa-chart-bar fa-3x text-muted mb-3"></i>
                  <h4>No Report Generated</h4>
                  <p className="text-muted">Use the filters above to generate a financial report.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;