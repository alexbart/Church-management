exports.options = {
  swagger: {
    info: {
      title: 'Church Management System API',
      description: 'API documentation for Church Management System',
      version: '1.0.0'
    },
    host: 'localhost:4000',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    securityDefinitions: {
      bearerAuth: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
      }
    },
    definitions: {
      User: {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          role: { type: 'string', enum: ['admin', 'pastor', 'member'] },
          isActive: { type: 'boolean' }
        },
        required: ['firstName', 'lastName', 'email', 'password']
      },
      Revenue: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['tithe', 'offering', 'donation', 'other'] },
          amount: { type: 'number', minimum: 0 },
          date: { type: 'string', format: 'date' },
          description: { type: 'string' },
          memberId: { type: 'string' }
        },
        required: ['type', 'amount']
      },
      Expense: {
        type: 'object',
        properties: {
          category: { type: 'string', enum: ['utilities', 'salaries', 'maintenance', 'outreach', 'other'] },
          amount: { type: 'number', minimum: 0 },
          date: { type: 'string', format: 'date' },
          description: { type: 'string' }
        },
        required: ['category', 'amount']
      },
      Login: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        },
        required: ['email', 'password']
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' }
        }
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object' }
        }
      }
    }
  }
};

exports.uiOptions = {
  routePrefix: '/documentation',
  exposeRoute: true,
  staticCSP: true
};