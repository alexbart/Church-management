const Revenue = require('../models/Revenue');

// Get all revenues
exports.getRevenues = async (req, reply) => {
  try {
    const { page = 1, limit = 10, sort = '-date', type, startDate, endDate } = req.query;
    
    // Build filter object
    const filter = {};
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    // Calculate skip for pagination
    const skip = (page - 1) * limit;
    
    const revenues = await Revenue.find(filter)
      .populate('recordedBy', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Revenue.countDocuments(filter);
    
    return reply.send({
      success: true,
      count: revenues.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: revenues
    });
  } catch (error) {
    return reply.code(500).send({
      success: false,
      message: error.message
    });
  }
};

// Create revenue
exports.createRevenue = async (req, reply) => {
  try {
    // Add user who recorded the revenue
    req.body.recordedBy = req.user.id;
    
    const revenue = await Revenue.create(req.body);
    await revenue.populate('recordedBy', 'firstName lastName email');
    
    return reply.code(201).send({
      success: true,
      message: 'Revenue created successfully',
      data: revenue
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
exports.getRevenuesSchema = {
  description: 'Get all revenues',
  tags: ['Revenues'],
  security: [{ bearerAuth: [] }],
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      sort: { type: 'string', default: '-date' },
      type: { type: 'string', enum: ['tithe', 'offering', 'donation', 'other'] },
      startDate: { type: 'string', format: 'date' },
      endDate: { type: 'string', format: 'date' }
    }
  },
  response: {
    200: {
      description: 'List of revenues',
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
              type: { type: 'string' },
              amount: { type: 'number' },
              date: { type: 'string', format: 'date' },
              description: { type: 'string' },
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

exports.createRevenueSchema = {
  description: 'Create a new revenue entry',
  tags: ['Revenues'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['type', 'amount'],
    properties: {
      type: { type: 'string', enum: ['tithe', 'offering', 'donation', 'other'] },
      amount: { type: 'number', minimum: 0 },
      date: { type: 'string', format: 'date' },
      description: { type: 'string' },
      memberId: { type: 'string' }
    }
  },
  response: {
    201: {
      description: 'Revenue created successfully',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            type: { type: 'string' },
            amount: { type: 'number' },
            date: { type: 'string', format: 'date' },
            description: { type: 'string' },
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