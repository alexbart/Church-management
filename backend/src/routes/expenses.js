const Expense = require('../models/Expense');

// Get all expenses
exports.getExpenses = async (req, reply) => {
  try {
    const { page = 1, limit = 10, sort = '-date', category, status, startDate, endDate } = req.query;
    
    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    // Calculate skip for pagination
    const skip = (page - 1) * limit;
    
    const expenses = await Expense.find(filter)
      .populate('recordedBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Expense.countDocuments(filter);
    
    return reply.send({
      success: true,
      count: expenses.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: expenses
    });
  } catch (error) {
    return reply.code(500).send({
      success: false,
      message: error.message
    });
  }
};

// Create expense
exports.createExpense = async (req, reply) => {
  try {
    // Add user who recorded the expense
    req.body.recordedBy = req.user.id;
    
    const expense = await Expense.create(req.body);
    await expense.populate('recordedBy', 'firstName lastName email');
    
    return reply.code(201).send({
      success: true,
      message: 'Expense created successfully',
      data: expense
    });
  } catch (error) {
    return reply.code(500).send({
      success: false,
      message: error.message
    });
  }
};

// Approve expense
exports.approveExpense = async (req, reply) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id, 
      { 
        status: 'approved',
        approvedBy: req.user.id 
      }, 
      { new: true, runValidators: true }
    )
    .populate('recordedBy', 'firstName lastName email')
    .populate('approvedBy', 'firstName lastName email');
    
    if (!expense) {
      return reply.code(404).send({
        success: false,
        message: 'Expense not found'
      });
    }
    
    return reply.send({
      success: true,
      message: 'Expense approved successfully',
      data: expense
    });
  } catch (error) {
    return reply.code(500).send({
      success: false,
      message: error.message
    });
  }
};

// Schema definitions for Swagger
// Schema definitions for Swagger
exports.getExpensesSchema = {
  description: 'Get all expenses',
  tags: ['Expenses'],
  security: [{ bearerAuth: [] }],
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      sort: { type: 'string', default: '-date' },
      category: { type: 'string', enum: ['utilities', 'salaries', 'maintenance', 'outreach', 'other'] },
      status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
      startDate: { type: 'string', format: 'date' },
      endDate: { type: 'string', format: 'date' }
    }
  },
  response: {
    200: {
      description: 'List of expenses',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        count: { type: 'integer' },
        total: { type: 'integer' },
        page: { type: 'integer' },
        pages: { type: 'integer' },
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
              recordedBy: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  email: { type: 'string' }
                }
              },
              approvedBy: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  email: { type: 'string' }
                }
              },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
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

exports.createExpenseSchema = {
  description: 'Create a new expense entry',
  tags: ['Expenses'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['category', 'amount'],
    properties: {
      category: { type: 'string', enum: ['utilities', 'salaries', 'maintenance', 'outreach', 'other'] },
      amount: { type: 'number', minimum: 0 },
      date: { type: 'string', format: 'date' },
      description: { type: 'string' }
    }
  },
  response: {
    201: {
      description: 'Expense created successfully',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            category: { type: 'string' },
            amount: { type: 'number' },
            date: { type: 'string', format: 'date' },
            description: { type: 'string' },
            status: { type: 'string' },
            recordedBy: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string' }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
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

exports.approveExpenseSchema = {
  description: 'Approve an expense (Admin/Pastor only)',
  tags: ['Expenses'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' }
    },
    required: ['id']
  },
  response: {
    200: {
      description: 'Expense approved successfully',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            category: { type: 'string' },
            amount: { type: 'number' },
            date: { type: 'string', format: 'date' },
            description: { type: 'string' },
            status: { type: 'string' },
            recordedBy: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string' }
              }
            },
            approvedBy: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string' }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
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
    403: {
      description: 'Forbidden',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    },
    404: {
      description: 'Expense not found',
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