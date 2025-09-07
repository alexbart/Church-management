const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

async function userRoutes(fastify, options) {
  // Get all users - Admin/Pastor only
  fastify.get('/users', {
    preHandler: [fastify.authenticate, fastify.authorize(['admin', 'pastor'])],
    schema: {
      tags: ['Users'],
      security: [{ Bearer: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100 },
          role: { type: 'string', enum: ['admin', 'pastor', 'member'] },
          isActive: { type: 'boolean' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' },
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
  }, getAllUsers);

  // Get single user - Admin/Pastor only
  fastify.get('/users/:id', {
    preHandler: [fastify.authenticate, fastify.authorize(['admin', 'pastor'])],
    schema: {
      tags: ['Users'],
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
  }, getUser);

  // Create user - Admin/Pastor only
  fastify.post('/users', {
    preHandler: [fastify.authenticate, fastify.authorize(['admin', 'pastor'])],
    schema: {
      tags: ['Users'],
      security: [{ Bearer: [] }],
      body: {
        type: 'object',
        required: ['firstName', 'lastName', 'email', 'password'],
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          role: { type: 'string', enum: ['admin', 'pastor', 'member'] }
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
  }, createUser);

  // Update user - Admin/Pastor only
  fastify.put('/users/:id', {
    preHandler: [fastify.authenticate, fastify.authorize(['admin', 'pastor'])],
    schema: {
      tags: ['Users'],
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
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          role: { type: 'string', enum: ['admin', 'pastor', 'member'] },
          isActive: { type: 'boolean' }
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
  }, updateUser);

  // Delete user - Admin only
  fastify.delete('/users/:id', {
    preHandler: [fastify.authenticate, fastify.authorize(['admin'])],
    schema: {
      tags: ['Users'],
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
  }, deleteUser);
}

module.exports = userRoutes;