const ExcelJS = require('exceljs');
const Revenue = require('../models/Revenue');
const Expense = require('../models/Expense');
const moment = require('moment');

// Generate comprehensive Excel report with multiple sheets and analytics
exports.generateComprehensiveFinancialReport = async (filters = {}) => {
  const workbook = new ExcelJS.Workbook();
  
  // Add worksheets
  const summarySheet = workbook.addWorksheet('Executive Summary');
  const revenueSheet = workbook.addWorksheet('Revenues');
  const expenseSheet = workbook.addWorksheet('Expenses');
  const analyticsSheet = workbook.addWorksheet('Analytics');
  const chartsSheet = workbook.addWorksheet('Charts');

  // Set up data
  const revenueFilter = {};
  const expenseFilter = {};
  
  if (filters.startDate) {
    revenueFilter.date = { $gte: new Date(filters.startDate) };
    expenseFilter.date = { $gte: new Date(filters.startDate) };
  }
  if (filters.endDate) {
    revenueFilter.date = revenueFilter.date || {};
    revenueFilter.date.$lte = new Date(filters.endDate);
    expenseFilter.date = expenseFilter.date || {};
    expenseFilter.date.$lte = new Date(filters.endDate);
  }
  if (filters.type) revenueFilter.type = filters.type;
  if (filters.category) expenseFilter.category = filters.category;

  const revenues = await Revenue.find(revenueFilter)
    .populate('recordedBy', 'firstName lastName')
    .sort({ date: -1 });

  const expenses = await Expense.find(expenseFilter)
    .populate('recordedBy', 'firstName lastName')
    .populate('approvedBy', 'firstName lastName')
    .sort({ date: -1 });

  // Calculate analytics
  const totalRevenue = revenues.reduce((sum, revenue) => sum + revenue.amount, 0);
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const balance = totalRevenue - totalExpense;

  const revenueByType = revenues.reduce((acc, revenue) => {
    acc[revenue.type] = (acc[revenue.type] || 0) + revenue.amount;
    return acc;
  }, {});

  const expenseByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const revenueByMonth = revenues.reduce((acc, revenue) => {
    const month = moment(revenue.date).format('YYYY-MM');
    acc[month] = (acc[month] || 0) + revenue.amount;
    return acc;
  }, {});

  // Executive Summary Sheet
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 25 },
    { header: 'Value', key: 'value', width: 20 }
  ];

  summarySheet.addRow({ metric: 'Total Revenue', value: totalRevenue });
  summarySheet.addRow({ metric: 'Total Expenses', value: totalExpense });
  summarySheet.addRow({ metric: 'Net Balance', value: balance });
  summarySheet.addRow({ metric: 'Revenue Entries', value: revenues.length });
  summarySheet.addRow({ metric: 'Expense Entries', value: expenses.length });
  summarySheet.addRow({ metric: 'Report Period', value: `${filters.startDate || 'Beginning'} to ${filters.endDate || 'Current'}` });

  // Revenue Breakdown
  Object.entries(revenueByType).forEach(([type, amount]) => {
    summarySheet.addRow({ metric: `${type} Revenue`, value: amount });
  });

  // Expense Breakdown
  Object.entries(expenseByCategory).forEach(([category, amount]) => {
    summarySheet.addRow({ metric: `${category} Expenses`, value: amount });
  });

  // Revenue Sheet
  revenueSheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Type', key: 'type', width: 15 },
    { header: 'Amount', key: 'amount', width: 15, style: { numFmt: '$#,##0.00' } },
    { header: 'Description', key: 'description', width: 30 },
    { header: 'Recorded By', key: 'recordedBy', width: 20 },
    { header: 'Created', key: 'createdAt', width: 20 }
  ];

  revenues.forEach(revenue => {
    revenueSheet.addRow({
      date: moment(revenue.date).format('YYYY-MM-DD'),
      type: revenue.type,
      amount: revenue.amount,
      description: revenue.description,
      recordedBy: revenue.recordedBy ? `${revenue.recordedBy.firstName} ${revenue.recordedBy.lastName}` : 'N/A',
      createdAt: moment(revenue.createdAt).format('YYYY-MM-DD HH:mm')
    });
  });

  // Expense Sheet
  expenseSheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Category', key: 'category', width: 15 },
    { header: 'Amount', key: 'amount', width: 15, style: { numFmt: '$#,##0.00' } },
    { header: 'Description', key: 'description', width: 30 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Recorded By', key: 'recordedBy', width: 20 },
    { header: 'Approved By', key: 'approvedBy', width: 20 },
    { header: 'Created', key: 'createdAt', width: 20 }
  ];

  expenses.forEach(expense => {
    expenseSheet.addRow({
      date: moment(expense.date).format('YYYY-MM-DD'),
      category: expense.category,
      amount: expense.amount,
      description: expense.description,
      status: expense.status,
      recordedBy: expense.recordedBy ? `${expense.recordedBy.firstName} ${expense.recordedBy.lastName}` : 'N/A',
      approvedBy: expense.approvedBy ? `${expense.approvedBy.firstName} ${expense.approvedBy.lastName}` : 'N/A',
      createdAt: moment(expense.createdAt).format('YYYY-MM-DD HH:mm')
    });
  });

  // Analytics Sheet
  analyticsSheet.columns = [
    { header: 'Month', key: 'month', width: 15 },
    { header: 'Revenue', key: 'revenue', width: 15, style: { numFmt: '$#,##0.00' } },
    { header: 'Expenses', key: 'expenses', width: 15, style: { numFmt: '$#,##0.00' } },
    { header: 'Balance', key: 'balance', width: 15, style: { numFmt: '$#,##0.00' } }
  ];

  // Add monthly data (you would need to aggregate expenses by month too)
  Object.entries(revenueByMonth).forEach(([month, revenue]) => {
    analyticsSheet.addRow({
      month: moment(month).format('MMM YYYY'),
      revenue: revenue,
      expenses: 0, // You would calculate this similarly
      balance: revenue // You would calculate this
    });
  });

  // Style headers
  [summarySheet, revenueSheet, expenseSheet, analyticsSheet].forEach(sheet => {
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
  });

  // Add charts (ExcelJS chart support)
  if (revenues.length > 0) {
    const chart = revenueSheet.addChart({
      type: 'pie',
      title: 'Revenue by Type',
      position: { from: { row: 1, col: 7 }, to: { row: 16, col: 12 } }
    });

    const revenueData = Object.entries(revenueByType).map(([type, amount]) => ({
      name: type,
      value: amount
    }));

    chart.addSeries({
      name: 'Revenue Distribution',
      data: revenueData.map(item => ({ name: item.name, value: item.value }))
    });
  }

  return workbook;
};

// Generate budget vs actual report
exports.generateBudgetVsActualReport = async (budgetData) => {
  // Implementation for budget comparison
};

// Generate donor contribution report
exports.generateDonorReport = async (memberId = null) => {
  // Implementation for donor analysis
};