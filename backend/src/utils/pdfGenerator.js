// utils/pdfGenerator.js
const PDFDocument = require('pdfkit');
const moment = require('moment');
const Revenue = require('../models/Revenue');
const Expense = require('../models/Expense');

// Generate PDF financial report
exports.generateFinancialPDF = async (filters = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

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

      // Calculate totals
      const totalRevenue = revenues.reduce((sum, revenue) => sum + revenue.amount, 0);
      const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const balance = totalRevenue - totalExpense;

      // Add header
      doc.fontSize(20).text('Church Financial Report', { align: 'center' });
      doc.moveDown();
      
      if (filters.startDate || filters.endDate) {
        doc.fontSize(12).text(
          `Period: ${filters.startDate ? moment(filters.startDate).format('YYYY-MM-DD') : 'Beginning'} to ${filters.endDate ? moment(filters.endDate).format('YYYY-MM-DD') : 'Today'}`,
          { align: 'center' }
        );
        doc.moveDown();
      }

      // Summary section
      doc.fontSize(16).text('Financial Summary', { underline: true });
      doc.moveDown(0.5);
      
      doc.fontSize(12);
      doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`);
      doc.text(`Total Expenses: $${totalExpense.toFixed(2)}`);
      doc.text(`Balance: $${balance.toFixed(2)}`);
      doc.text(`Number of Revenue Entries: ${revenues.length}`);
      doc.text(`Number of Expense Entries: ${expenses.length}`);
      doc.moveDown();

      // Revenue details
      doc.addPage();
      doc.fontSize(16).text('Revenue Details', { underline: true });
      doc.moveDown(0.5);
      
      revenues.forEach((revenue, index) => {
        doc.fontSize(10);
        doc.text(`${index + 1}. ${moment(revenue.date).format('YYYY-MM-DD')} - ${revenue.type} - $${revenue.amount.toFixed(2)}`);
        if (revenue.description) {
          doc.text(`   Description: ${revenue.description}`);
        }
        doc.moveDown(0.5);
      });

      // Expense details
      doc.addPage();
      doc.fontSize(16).text('Expense Details', { underline: true });
      doc.moveDown(0.5);
      
      expenses.forEach((expense, index) => {
        doc.fontSize(10);
        doc.text(`${index + 1}. ${moment(expense.date).format('YYYY-MM-DD')} - ${expense.category} - $${expense.amount.toFixed(2)} - Status: ${expense.status}`);
        if (expense.description) {
          doc.text(`   Description: ${expense.description}`);
        }
        doc.moveDown(0.5);
      });

      // Footer
      doc.addPage();
      doc.fontSize(10).text(
        `Report generated on ${moment().format('YYYY-MM-DD HH:mm:ss')}`,
        { align: 'center' }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};