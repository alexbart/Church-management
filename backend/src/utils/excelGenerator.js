// utils/excelGenerator.js
const ExcelJS = require('exceljs');
const Revenue = require('../models/Revenue');
const Expense = require('../models/Expense');
const moment = require('moment');

// Generate Excel report for financial data
exports.generateFinancialReport = async (filters = {}) => {
  const workbook = new ExcelJS.Workbook();
  
  // Add worksheets
  const revenueSheet = workbook.addWorksheet('Revenues');
  const expenseSheet = workbook.addWorksheet('Expenses');
  const summarySheet = workbook.addWorksheet('Summary');

  // Set up revenue data
  const revenueFilter = {};
  if (filters.startDate) revenueFilter.date = { $gte: new Date(filters.startDate) };
  if (filters.endDate) {
    revenueFilter.date = revenueFilter.date || {};
    revenueFilter.date.$lte = new Date(filters.endDate);
  }
  if (filters.type) revenueFilter.type = filters.type;

  const revenues = await Revenue.find(revenueFilter)
    .populate('recordedBy', 'firstName lastName')
    .sort({ date: -1 });

  // Set up expense data
  const expenseFilter = {};
  if (filters.startDate) expenseFilter.date = { $gte: new Date(filters.startDate) };
  if (filters.endDate) {
    expenseFilter.date = expenseFilter.date || {};
    expenseFilter.date.$lte = new Date(filters.endDate);
  }
  if (filters.category) expenseFilter.category = filters.category;

  const expenses = await Expense.find(expenseFilter)
    .populate('recordedBy', 'firstName lastName')
    .populate('approvedBy', 'firstName lastName')
    .sort({ date: -1 });

  // Add revenues to sheet
  revenueSheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Type', key: 'type', width: 15 },
    { header: 'Amount', key: 'amount', width: 15 },
    { header: 'Description', key: 'description', width: 30 },
    { header: 'Recorded By', key: 'recordedBy', width: 20 }
  ];

  revenues.forEach(revenue => {
    revenueSheet.addRow({
      date: moment(revenue.date).format('YYYY-MM-DD'),
      type: revenue.type,
      amount: revenue.amount,
      description: revenue.description,
      recordedBy: revenue.recordedBy ? `${revenue.recordedBy.firstName} ${revenue.recordedBy.lastName}` : 'N/A'
    });
  });

  // Add expenses to sheet
  expenseSheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Category', key: 'category', width: 15 },
    { header: 'Amount', key: 'amount', width: 15 },
    { header: 'Description', key: 'description', width: 30 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Recorded By', key: 'recordedBy', width: 20 },
    { header: 'Approved By', key: 'approvedBy', width: 20 }
  ];

  expenses.forEach(expense => {
    expenseSheet.addRow({
      date: moment(expense.date).format('YYYY-MM-DD'),
      category: expense.category,
      amount: expense.amount,
      description: expense.description,
      status: expense.status,
      recordedBy: expense.recordedBy ? `${expense.recordedBy.firstName} ${expense.recordedBy.lastName}` : 'N/A',
      approvedBy: expense.approvedBy ? `${expense.approvedBy.firstName} ${expense.approvedBy.lastName}` : 'N/A'
    });
  });

  // Add summary data
  const totalRevenue = revenues.reduce((sum, revenue) => sum + revenue.amount, 0);
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const balance = totalRevenue - totalExpense;

  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 20 },
    { header: 'Value', key: 'value', width: 15 }
  ];

  summarySheet.addRow({ metric: 'Total Revenue', value: totalRevenue });
  summarySheet.addRow({ metric: 'Total Expenses', value: totalExpense });
  summarySheet.addRow({ metric: 'Balance', value: balance });
  summarySheet.addRow({ metric: 'Number of Revenue Entries', value: revenues.length });
  summarySheet.addRow({ metric: 'Number of Expense Entries', value: expenses.length });

  // Style the headers
  [revenueSheet, expenseSheet, summarySheet].forEach(sheet => {
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
  });

  return workbook;
};

// Parse Excel file for bulk revenue import
exports.parseRevenueExcel = async (filePath) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  
  const worksheet = workbook.worksheets[0];
  const revenues = [];
  
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) { // Skip header row
      const values = row.values;
      revenues.push({
        date: values[1] ? new Date(values[1]) : new Date(),
        type: values[2] || 'other',
        amount: values[3] || 0,
        description: values[4] || ''
      });
    }
  });
  
  return revenues;
};

// Parse Excel file for bulk expense import
exports.parseExpenseExcel = async (filePath) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  
  const worksheet = workbook.worksheets[0];
  const expenses = [];
  
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) { // Skip header row
      const values = row.values;
      expenses.push({
        date: values[1] ? new Date(values[1]) : new Date(),
        category: values[2] || 'other',
        amount: values[3] || 0,
        description: values[4] || ''
      });
    }
  });
  
  return expenses;
};