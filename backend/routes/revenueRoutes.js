const {
  getAllRevenues,
  getRevenue,
  createRevenue,
  updateRevenue,
  deleteRevenue
} = require('../controllers/revenueController');

async function revenueRoutes(fastify, options) {
  // Get all revenues
  fastify.get('/revenues', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['Revenues'],
      security: [{ Bearer: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100 },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          type: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' },
            summary: {
              type: 'object',
              properties: {
                totalAmount: { type: 'number' },
                totalCount: { type: 'integer' }
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total: { type: 'integer' },
                pages: { type: 'integer' }
              }
            }
          }
        }
      }
    }
  }, getAllRevenues);

  // Get single revenue
  fastify.get('/revenues/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['Revenues'],
      security: [{ Bearer: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }
          }
        }
      }
    }
  }, getRevenue);

  // Create revenue
  fastify.post('/revenues', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['Revenues'],
      security: [{ Bearer: [] }],
      body: {
        type: 'object',
        required: ['type', 'amount'],
        properties: {
          type: { type: 'string' },
          amount: { type: 'number', minimum: 0 },
          description: { type: 'string' },
          date: { type: 'string', format: 'date' },
          member: { type: 'string' }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' }
          }
        }
      }
    }
  }, createRevenue);

  // Update revenue
  fastify.put('/revenues/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['Revenues'],
      security: [{ Bearer: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          amount: { type: 'number', minimum: 0 },
          description: { type: 'string' },
          date: { type: 'string', format: 'date' },
          member: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' }
          }
        }
      }
    }
  }, updateRevenue);

  // Delete revenue - Admin only
  fastify.delete('/revenues/:id', {
    preHandler: [fastify.authenticate, fastify.authorize(['admin'])],
    schema: {
      tags: ['Revenues'],
      security: [{ Bearer: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, deleteRevenue);
}

module.exports = revenueRoutes;