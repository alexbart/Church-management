import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const FinancialCharts = ({ summary }) => {
  const revenueData = {
    labels: summary.revenueByType?.map(item => item._id.toUpperCase()) || [],
    datasets: [
      {
        data: summary.revenueByType?.map(item => item.total) || [],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      }
    ]
  };

  const expenseData = {
    labels: summary.expenseByCategory?.map(item => item._id.toUpperCase()) || [],
    datasets: [
      {
        data: summary.expenseByCategory?.map(item => item.total) || [],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      }
    ]
  };

  return (
    <div className="row mt-4">
      <div className="col-md-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Revenue Distribution</h3>
          </div>
          <div className="card-body">
            <Doughnut data={revenueData} />
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Expense Distribution</h3>
          </div>
          <div className="card-body">
            <Doughnut data={expenseData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialCharts;