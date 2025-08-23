const PDFDocument = require('pdfkit');
const moment = require('moment');
const Revenue = require('../models/Revenue');
const Expense = require('../models/Expense');

// Generate detailed financial PDF report
exports.generateDetailedFinancialPDF = async (filters = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

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

      // Calculate totals and statistics
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

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text('CHURCH FINANCIAL REPORT', { align: 'center' });
      doc.moveDown();
      
      // Period information
      doc.fontSize(12).font('Helvetica');
      if (filters.startDate || filters.endDate) {
        doc.text(
          `Period: ${filters.startDate ? moment(filters.startDate).format('MMMM D, YYYY') : 'Beginning'} to ${filters.endDate ? moment(filters.endDate).format('MMMM D, YYYY') : moment().format('MMMM D, YYYY')}`,
          { align: 'center' }
        );
      }
      doc.text(`Report generated: ${moment().format('MMMM D, YYYY h:mm A')}`, { align: 'center' });
      doc.moveDown(2);

      // Executive Summary
      doc.fontSize(16).font('Helvetica-Bold').text('EXECUTIVE SUMMARY', { underline: true });
      doc.moveDown(0.5);
      
      doc.fontSize(12).font('Helvetica');
      doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`);
      doc.text(`Total Expenses: $${totalExpense.toFixed(2)}`);
      doc.text(`Net Balance: $${balance.toFixed(2)}`);
      doc.text(`Revenue Entries: ${revenues.length}`);
      doc.text(`Expense Entries: ${expenses.length}`);
      doc.moveDown();

      // Revenue Breakdown
      doc.addPage();
      doc.fontSize(16).font('Helvetica-Bold').text('REVENUE BREAKDOWN', { underline: true });
      doc.moveDown(0.5);
      
      Object.entries(revenueByType).forEach(([type, amount]) => {
        const percentage = ((amount / totalRevenue) * 100).toFixed(1);
        doc.text(`${type.charAt(0).toUpperCase() + type.slice(1)}: $${amount.toFixed(2)} (${percentage}%)`);
      });
      doc.moveDown();

      // Expense Breakdown
      doc.fontSize(16).font('Helvetica-Bold').text('EXPENSE BREAKDOWN', { underline: true });
      doc.moveDown(0.5);
      
      Object.entries(expenseByCategory).forEach(([category, amount]) => {
        const percentage = ((amount / totalExpense) * 100).toFixed(1);
        doc.text(`${category.charAt(0).toUpperCase() + category.slice(1)}: $${amount.toFixed(2)} (${percentage}%)`);
      });
      doc.moveDown();

      // Detailed Revenue Transactions
      doc.addPage();
      doc.fontSize(16).font('Helvetica-Bold').text('DETAILED REVENUE TRANSACTIONS', { underline: true });
      doc.moveDown(0.5);
      
      let yPosition = doc.y;
      revenues.forEach((revenue, index) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }
        
        doc.fontSize(10);
        doc.text(`${index + 1}. ${moment(revenue.date).format('MMM D, YYYY')} - ${revenue.type.toUpperCase()}`, 50, yPosition);
        doc.text(`$${revenue.amount.toFixed(2)}`, 400, yPosition, { width: 100, align: 'right' });
        
        if (revenue.description) {
          yPosition += 15;
          doc.text(`   ${revenue.description}`, 50, yPosition, { width: 400 });
        }
        
        yPosition += 20;
      });

      // Detailed Expense Transactions
      doc.addPage();
      doc.fontSize(16).font('Helvetica-Bold').text('DETAILED EXPENSE TRANSACTIONS', { underline: true });
      doc.moveDown(0.5);
      
      yPosition = doc.y;
      expenses.forEach((expense, index) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }
        
        doc.fontSize(10);
        doc.text(`${index + 1}. ${moment(expense.date).format('MMM D, YYYY')} - ${expense.category.toUpperCase()}`, 50, yPosition);
        doc.text(`$${expense.amount.toFixed(2)} - ${expense.status.toUpperCase()}`, 400, yPosition, { width: 100, align: 'right' });
        
        if (expense.description) {
          yPosition += 15;
          doc.text(`   ${expense.description}`, 50, yPosition, { width: 400 });
        }
        
        yPosition += 20;
      });

      // Footer with church information
      doc.addPage();
      doc.fontSize(10).text('Generated by Church Management System', { align: 'center' });
      doc.text('Confidential Financial Report - For Internal Use Only', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Generate comparative report (month-over-month, year-over-year)
exports.generateComparativeReport = async (period = 'month') => {
  // Implementation for comparative analysis
};

// Generate trend analysis report
exports.generateTrendAnalysis = async (startDate, endDate) => {
  // Implementation for trend analysis
};