const { generateFinancialReport } = require('../utils/excelGenerator');
const { generateFinancialPDF } = require('../utils/pdfGenerator');
const Revenue = require('../models/Revenue');
const Expense = require('../models/Expense');
const { parseRevenueExcel, parseExpenseExcel } = require('../utils/excelGenerator');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

// Get financial summary for dashboard
exports.getFinancialSummary = async (req, reply) => {
  try {
    const { startDate, endDate, type, category } = req.query;
    
    const revenueFilter = {};
    const expenseFilter = {};
    
    if (startDate) {
      revenueFilter.date = { $gte: new Date(startDate) };
      expenseFilter.date = { $gte: new Date(startDate) };
    }
    if (endDate) {
      revenueFilter.date = revenueFilter.date || {};
      revenueFilter.date.$lte = new Date(endDate);
      expenseFilter.date = expenseFilter.date || {};
      expenseFilter.date.$lte = new Date(endDate);
    }
    if (type) revenueFilter.type = type;
    if (category) expenseFilter.category = category;

    const [totalRevenue, totalExpense, revenueByType, expenseByCategory] = await Promise.all([
      Revenue.aggregate([
        { $match: revenueFilter },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: expenseFilter },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Revenue.aggregate([
        { $match: revenueFilter },
        { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Expense.aggregate([
        { $match: expenseFilter },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ])
    ]);

    const revenueTotal = totalRevenue[0]?.total || 0;
    const expenseTotal = totalExpense[0]?.total || 0;
    const balance = revenueTotal - expenseTotal;

    return reply.send({
      success: true,
      data: {
        totalRevenue: revenueTotal,
        totalExpense: expenseTotal,
        balance: balance,
        revenueByType,
        expenseByCategory
      }
    });
  } catch (error) {
    console.error('Financial summary error:', error);
    return reply.code(500).send({
      success: false,
      message: 'Failed to generate financial summary'
    });
  }
};

// Export financial report to Excel
exports.exportToExcel = async (req, reply) => {
  try {
    const workbook = await generateFinancialReport(req.query);
    
    // Set headers for file download
    reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    reply.header('Content-Disposition', `attachment; filename=financial-report-${Date.now()}.xlsx`);
    
    // Write to buffer and send
    const buffer = await workbook.xlsx.writeBuffer();
    reply.send(buffer);
    
    return reply; // Important: return reply to prevent further processing

  } catch (error) {
    console.error('Excel export error:', error);
    return reply.code(500).send({
      success: false,
      message: 'Failed to generate Excel report'
    });
  }
};

// Export financial report to PDF
exports.exportToPDF = async (req, reply) => {
  try {
    const pdfBuffer = await generateFinancialPDF(req.query);
    
    // Set headers for file download
    reply.header('Content-Type', 'application/pdf');
    reply.header('Content-Disposition', `attachment; filename=financial-report-${Date.now()}.pdf`);
    
    reply.send(pdfBuffer);
    return reply; // Important: return reply to prevent further processing

  } catch (error) {
    console.error('PDF export error:', error);
    return reply.code(500).send({
      success: false,
      message: 'Failed to generate PDF report'
    });
  }
};

// Bulk import revenues from Excel
exports.importRevenues = async (req, reply) => {
  try {
    if (!req.file) {
      return reply.code(400).send({
        success: false,
        message: 'Please upload an Excel file'
      });
    }

    const revenues = await parseRevenueExcel(req.file.path);
    
    if (!revenues || revenues.length === 0) {
      fs.unlinkSync(req.file.path);
      return reply.code(400).send({
        success: false,
        message: 'No valid revenue data found in the Excel file'
      });
    }

    // Add recordedBy field to each revenue
    const revenuesWithUser = revenues.map(revenue => ({
      ...revenue,
      recordedBy: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const createdRevenues = await Revenue.insertMany(revenuesWithUser);
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    
    return reply.send({
      success: true,
      message: `${createdRevenues.length} revenues imported successfully`,
      data: createdRevenues
    });

  } catch (error) {
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('Revenue import error:', error);
    return reply.code(500).send({
      success: false,
      message: 'Failed to import revenues from Excel'
    });
  }
};

// Bulk import expenses from Excel
exports.importExpenses = async (req, reply) => {
  try {
    if (!req.file) {
      return reply.code(400).send({
        success: false,
        message: 'Please upload an Excel file'
      });
    }

    const expenses = await parseExpenseExcel(req.file.path);
    
    if (!expenses || expenses.length === 0) {
      fs.unlinkSync(req.file.path);
      return reply.code(400).send({
        success: false,
        message: 'No valid expense data found in the Excel file'
      });
    }

    // Add recordedBy field to each expense
    const expensesWithUser = expenses.map(expense => ({
      ...expense,
      recordedBy: req.user.id,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const createdExpenses = await Expense.insertMany(expensesWithUser);
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    
    return reply.send({
      success: true,
      message: `${createdExpenses.length} expenses imported successfully`,
      data: createdExpenses
    });

  } catch (error) {
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('Expense import error:', error);
    return reply.code(500).send({
      success: false,
      message: 'Failed to import expenses from Excel'
    });
  }
};

// Schema definitions for Swagger
exports.getFinancialSummarySchema = {
  description: 'Get financial summary for dashboard',
  tags: ['Reports'],
  security: [{ bearerAuth: [] }],
  querystring: {
    type: 'object',
    properties: {
      startDate: { type: 'string', format: 'date' },
      endDate: { type: 'string', format: 'date' },
      type: { type: 'string', enum: ['tithe', 'offering', 'donation', 'other'] },
      category: { type: 'string', enum: ['utilities', 'salaries', 'maintenance', 'outreach', 'other'] }
    }
  },
  response: {
    200: {
      description: 'Financial summary data',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            totalRevenue: { type: 'number' },
            totalExpense: { type: 'number' },
            balance: { type: 'number' },
            revenueByType: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  total: { type: 'number' },
                  count: { type: 'integer' }
                }
              }
            },
            expenseByCategory: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  total: { type: 'number' },
                  count: { type: 'integer' }
                }
              }
            }
          }
        }
      }
    },
    401: {
      description: 'Unauthorized',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    },
    500: {
      description: 'Internal server error',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  }
};

exports.exportToExcelSchema = {
  description: 'Export financial report to Excel',
  tags: ['Reports'],
  security: [{ bearerAuth: [] }],
  querystring: {
    type: 'object',
    properties: {
      startDate: { type: 'string', format: 'date' },
      endDate: { type: 'string', format: 'date' },
      type: { type: 'string', enum: ['tithe', 'offering', 'donation', 'other'] },
      category: { type: 'string', enum: ['utilities', 'salaries', 'maintenance', 'outreach', 'other'] }
    }
  },
  response: {
    200: {
      description: 'Excel file download',
      content: {
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
          schema: {
            type: 'string',
            format: 'binary'
          }
        }
      }
    },
    401: {
      description: 'Unauthorized',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    },
    500: {
      description: 'Internal server error',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  }
};

exports.exportToPDFSchema = {
  description: 'Export financial report to PDF',
  tags: ['Reports'],
  security: [{ bearerAuth: [] }],
  querystring: {
    type: 'object',
    properties: {
      startDate: { type: 'string', format: 'date' },
      endDate: { type: 'string', format: 'date' },
      type: { type: 'string', enum: ['tithe', 'offering', 'donation', 'other'] },
      category: { type: 'string', enum: ['utilities', 'salaries', 'maintenance', 'outreach', 'other'] }
    }
  },
  response: {
    200: {
      description: 'PDF file download',
      content: {
        'application/pdf': {
          schema: {
            type: 'string',
            format: 'binary'
          }
        }
      }
    },
    401: {
      description: 'Unauthorized',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    },
    500: {
      description: 'Internal server error',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  }
};

exports.importRevenuesSchema = {
  description: 'Bulk import revenues from Excel (Admin/Pastor only)',
  tags: ['Reports'],
  security: [{ bearerAuth: [] }],
  consumes: ['multipart/form-data'],
  body: {
    type: 'object',
    required: ['file'],
    properties: {
      file: {
        type: 'string',
        format: 'binary'
      }
    }
  },
  response: {
    200: {
      description: 'Revenues imported successfully',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              type: { type: 'string' },
              amount: { type: 'number' },
              date: { type: 'string', format: 'date' },
              description: { type: 'string' },
              recordedBy: { type: 'string' }
            }
          }
        }
      }
    },
    400: {
      description: 'Bad request',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    },
    401: {
      description: 'Unauthorized',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    },
    403: {
      description: 'Forbidden',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    },
    500: {
      description: 'Internal server error',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  }
};

exports.importExpensesSchema = {
  description: 'Bulk import expenses from Excel (Admin/Pastor only)',
  tags: ['Reports'],
  security: [{ bearerAuth: [] }],
  consumes: ['multipart/form-data'],
  body: {
    type: 'object',
    required: ['file'],
    properties: {
      file: {
        type: 'string',
        format: 'binary'
      }
    }
  },
  response: {
    200: {
      description: 'Expenses imported successfully',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              category: { type: 'string' },
              amount: { type: 'number' },
              date: { type: 'string', format: 'date' },
              description: { type: 'string' },
              status: { type: 'string' },
              recordedBy: { type: 'string' }
            }
          }
        }
      }
    },
    400: {
      description: 'Bad request',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    },
    401: {
      description: 'Unauthorized',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    },
    403: {
      description: 'Forbidden',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    },
    500: {
      description: 'Internal server error',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  }
};