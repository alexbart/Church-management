const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const Revenue = require('../models/Revenue');
const Expense = require('../models/Expense');
const TransactionType = require('../models/TransactionType');
const logger = require('../utils/logger');

// Generate financial report
exports.generateFinancialReport = async (filters, format = 'pdf') => {
  try {
    const { startDate, endDate } = filters;
    
    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    
    // Get revenues and expenses
    const revenueFilter = dateFilter ? { date: dateFilter } : {};
    const expenseFilter = dateFilter ? { date: dateFilter } : {};
    
    const revenues = await Revenue.find(revenueFilter)
      .populate('type', 'name')
      .populate('member', 'firstName lastName')
      .sort({ date: 1 });
    
    const expenses = await Expense.find(expenseFilter)
      .populate('type', 'name')
      .sort({ date: 1 });
    
    // Calculate totals
    const revenueTotal = revenues.reduce((sum, revenue) => sum + revenue.amount, 0);
    const expenseTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const netTotal = revenueTotal - expenseTotal;
    
    // Group by type
    const revenueByType = {};
    revenues.forEach(revenue => {
      const typeName = revenue.type.name;
      if (!revenueByType[typeName]) {
        revenueByType[typeName] = { total: 0, count: 0 };
      }
      revenueByType[typeName].total += revenue.amount;
      revenueByType[typeName].count += 1;
    });
    
    const expenseByType = {};
    expenses.forEach(expense => {
      const typeName = expense.type.name;
      if (!expenseByType[typeName]) {
        expenseByType[typeName] = { total: 0, count: 0 };
      }
      expenseByType[typeName].total += expense.amount;
      expenseByType[typeName].count += 1;
    });
    
    const reportData = {
      revenues,
      expenses,
      summary: {
        revenueTotal,
        expenseTotal,
        netTotal,
        revenueByType,
        expenseByType
      },
      filters: {
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      }
    };
    
    if (format === 'pdf') {
      return await generatePDFReport(reportData);
    } else if (format === 'excel') {
      return await generateExcelReport(reportData);
    }
    
    return reportData;
  } catch (error) {
    logger.error(`Generate financial report error: ${error.message}`);
    throw error;
  }
};

// Generate PDF report
async function generatePDFReport(reportData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // Add title
      doc.fontSize(20).text('Financial Report', { align: 'center' });
      doc.moveDown();
      
      // Add date range
      if (reportData.filters.startDate || reportData.filters.endDate) {
        doc.fontSize(12).text('Date Range:', { continued: true });
        doc.text(` ${reportData.filters.startDate ? reportData.filters.startDate.toDateString() : 'Beginning'} to ${reportData.filters.endDate ? reportData.filters.endDate.toDateString() : 'Today'}`);
        doc.moveDown();
      }
      
      // Add summary
      doc.fontSize(16).text('Summary');
      doc.fontSize(12).text(`Total Revenue: $${reportData.summary.revenueTotal.toFixed(2)}`);
      doc.text(`Total Expense: $${reportData.summary.expenseTotal.toFixed(2)}`);
      doc.text(`Net Total: $${reportData.summary.netTotal.toFixed(2)}`);
      doc.moveDown();
      
      // Add revenue by type
      doc.fontSize(14).text('Revenue by Type');
      Object.entries(reportData.summary.revenueByType).forEach(([type, data]) => {
        doc.fontSize(12).text(`${type}: $${data.total.toFixed(2)} (${data.count} transactions)`);
      });
      doc.moveDown();
      
      // Add expense by type
      doc.fontSize(14).text('Expense by Type');
      Object.entries(reportData.summary.expenseByType).forEach(([type, data]) => {
        doc.fontSize(12).text(`${type}: $${data.total.toFixed(2)} (${data.count} transactions)`);
      });
      doc.moveDown();
      
      // Add detailed transactions
      doc.addPage();
      doc.fontSize(16).text('Revenue Details');
      reportData.revenues.forEach(revenue => {
        doc.fontSize(10).text(`${revenue.date.toDateString()} - ${revenue.type.name} - ${revenue.member ? revenue.member.firstName + ' ' + revenue.member.lastName : 'Anonymous'} - $${revenue.amount.toFixed(2)}`);
      });
      
      doc.addPage();
      doc.fontSize(16).text('Expense Details');
      reportData.expenses.forEach(expense => {
        doc.fontSize(10).text(`${expense.date.toDateString()} - ${expense.type.name} - $${expense.amount.toFixed(2)} - ${expense.description || ''}`);
      });
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Generate Excel report
async function generateExcelReport(reportData) {
  try {
    const workbook = new ExcelJS.Workbook();
    
    // Summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 20 },
      { header: 'Value', key: 'value', width: 15 }
    ];
    
    summarySheet.addRow({ metric: 'Total Revenue', value: reportData.summary.revenueTotal });
    summarySheet.addRow({ metric: 'Total Expense', value: reportData.summary.expenseTotal });
    summarySheet.addRow({ metric: 'Net Total', value: reportData.summary.netTotal });
    
    // Revenue by type sheet
    const revenueTypeSheet = workbook.addWorksheet('Revenue by Type');
    revenueTypeSheet.columns = [
      { header: 'Type', key: 'type', width: 20 },
      { header: 'Total Amount', key: 'total', width: 15 },
      { header: 'Transaction Count', key: 'count', width: 15 }
    ];
    
    Object.entries(reportData.summary.revenueByType).forEach(([type, data]) => {
      revenueTypeSheet.addRow({ type, total: data.total, count: data.count });
    });
    
    // Expense by type sheet
    const expenseTypeSheet = workbook.addWorksheet('Expense by Type');
    expenseTypeSheet.columns = [
      { header: 'Type', key: 'type', width: 20 },
      { header: 'Total Amount', key: 'total', width: 15 },
      { header: 'Transaction Count', key: 'count', width: 15 }
    ];
    
    Object.entries(reportData.summary.expenseByType).forEach(([type, data]) => {
      expenseTypeSheet.addRow({ type, total: data.total, count: data.count });
    });
    
    // Revenue details sheet
    const revenueSheet = workbook.addWorksheet('Revenue Details');
    revenueSheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Type', key: 'type', width: 20 },
      { header: 'Member', key: 'member', width: 25 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Description', key: 'description', width: 30 }
    ];
    
    reportData.revenues.forEach(revenue => {
      revenueSheet.addRow({
        date: revenue.date,
        type: revenue.type.name,
        member: revenue.member ? `${revenue.member.firstName} ${revenue.member.lastName}` : 'Anonymous',
        amount: revenue.amount,
        description: revenue.description || ''
      });
    });
    
    // Expense details sheet
    const expenseSheet = workbook.addWorksheet('Expense Details');
    expenseSheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Type', key: 'type', width: 20 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Description', key: 'description', width: 30 }
    ];
    
    reportData.expenses.forEach(expense => {
      expenseSheet.addRow({
        date: expense.date,
        type: expense.type.name,
        amount: expense.amount,
        description: expense.description || ''
      });
    });
    
    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    throw error;
  }
}