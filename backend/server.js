require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const path = require('path');
const fs = require('fs');
const connectDB = require('./src/config/database');
const swagger = require('./src/config/swagger');
// Add to server.js after other imports
const { validate, validateQuery, userValidation, revenueValidation, expenseValidation, reportValidation } = require('./src/middleware/validation');


// Connect to database
connectDB();

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const excelDir = path.join(uploadsDir, 'excel');
const tempDir = path.join(uploadsDir, 'temp');

[uploadsDir, excelDir, tempDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Register Swagger
fastify.register(require('@fastify/swagger'), swagger.options);
fastify.register(require('@fastify/swagger-ui'), swagger.uiOptions);

// Register plugins
fastify.register(require('@fastify/cors'), { 
  origin: true,
  credentials: true 
});
fastify.register(require('@fastify/helmet'));

// Import routes and middleware
const { protect, authorize } = require('./src/middleware/auth');
const auditLog = require('./src/middleware/auditLog');
const upload = require('./src/middleware/upload');

// Import route handlers
const authRoutes = require('./src/routes/auth');
const revenueRoutes = require('./src/routes/revenues');
const expenseRoutes = require('./src/routes/expenses');
const userRoutes = require('./src/routes/users');
const reportRoutes = require('./src/routes/reports');

// Test route
fastify.get('/', {
  schema: {
    description: 'API Root Endpoint',
    tags: ['System'],
    response: {
      200: {
        description: 'API is running',
        type: 'object',
        properties: {
          message: { type: 'string' },
          version: { type: 'string' }
        }
      }
    }
  }
}, async (request, reply) => {
  return { 
    message: 'Church Management System API is running!',
    version: '1.0.0'
  };
});

// Health check endpoint
fastify.get('/health', {
  schema: {
    description: 'API Health Check',
    tags: ['System'],
    response: {
      200: {
        description: 'API is healthy',
        type: 'object',
        properties: {
          status: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
          uptime: { type: 'number' }
        }
      }
    }
  }
}, async (request, reply) => {
  return {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  };
});

// Auth routes
fastify.post('/api/v1/auth/register', {
  schema: authRoutes.registerSchema,
  preHandler: [validate(userValidation.register)],
  handler: authRoutes.register
});

fastify.post('/api/v1/auth/login', {
  schema: authRoutes.loginSchema,
  preHandler: [validate(userValidation.login)],
  handler: authRoutes.login
});

// Protected route example
fastify.get('/api/v1/protected', {
  schema: {
    description: 'Protected route example',
    tags: ['System'],
    security: [{ bearerAuth: [] }],
    response: {
      200: {
        description: 'Protected route accessed successfully',
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          user: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string' },
              role: { type: 'string' }
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
      }
    }
  },
  preHandler: [protect],
  handler: async (req, reply) => {
    return {
      success: true,
      message: 'You accessed a protected route!',
      user: req.user
    };
  }
});

// Admin only route example
fastify.get('/api/v1/admin-only', {
  schema: {
    description: 'Admin only route example',
    tags: ['System'],
    security: [{ bearerAuth: [] }],
    response: {
      200: {
        description: 'Admin route accessed successfully',
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          user: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string' },
              role: { type: 'string' }
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
      }
    }
  },
  preHandler: [protect, authorize('admin')],
  handler: async (req, reply) => {
    return {
      success: true,
      message: 'You accessed an admin-only route!',
      user: req.user
    };
  }
});

// Revenue routes
fastify.get('/api/v1/revenues', {
  schema: revenueRoutes.getRevenuesSchema,
  preHandler: [protect],
  handler: revenueRoutes.getRevenues
});

fastify.post('/api/v1/revenues', {
  schema: revenueRoutes.createRevenueSchema,
  preHandler: [protect],
  handler: revenueRoutes.createRevenue
});

// Expense routes
fastify.get('/api/v1/expenses', {
  schema: expenseRoutes.getExpensesSchema,
  preHandler: [protect],
  handler: expenseRoutes.getExpenses
});

fastify.post('/api/v1/expenses', {
  schema: expenseRoutes.createExpenseSchema,
  preHandler: [protect, validate(expenseValidation.create)],
  handler: expenseRoutes.createExpense
});

fastify.patch('/api/v1/expenses/:id/approve', {
  schema: expenseRoutes.approveExpenseSchema,
  preHandler: [protect, authorize('admin', 'pastor')],
  handler: expenseRoutes.approveExpense
});

// User routes (admin only)
fastify.get('/api/v1/users', {
  schema: userRoutes.getUsersSchema,
  preHandler: [protect, authorize('admin')],
  handler: userRoutes.getUsers
});

fastify.get('/api/v1/users/:id', {
  schema: userRoutes.getUserSchema,
  preHandler: [protect, authorize('admin')],
  handler: userRoutes.getUser
});

fastify.put('/api/v1/users/:id', {
  schema: userRoutes.updateUserSchema,
  preHandler: [protect, authorize('admin')],
  handler: userRoutes.updateUser
});

fastify.delete('/api/v1/users/:id', {
  schema: userRoutes.deleteUserSchema,
  preHandler: [protect, authorize('admin')],
  handler: userRoutes.deleteUser
});

// Report routes
fastify.get('/api/v1/reports/financial-summary', {
  schema: reportRoutes.getFinancialSummarySchema,
  preHandler: [protect, validateQuery(reportValidation.financialSummary)],
  handler: reportRoutes.getFinancialSummary
});

fastify.get('/api/v1/reports/export-excel', {
  schema: reportRoutes.exportToExcelSchema,
  preHandler: [protect, validateQuery(reportValidation.financialSummary)],
  handler: reportRoutes.exportToExcel
});

fastify.get('/api/v1/reports/export-pdf', {
  schema: reportRoutes.exportToPDFSchema,
  preHandler: [protect, validateQuery(reportValidation.financialSummary)],
  handler: reportRoutes.exportToPDF
});

fastify.post('/api/v1/reports/import-revenues', {
  schema: reportRoutes.importRevenuesSchema,
  preHandler: [protect, authorize('admin', 'pastor')],
  preValidation: upload.single('file'),
  handler: reportRoutes.importRevenues
});

fastify.post('/api/v1/reports/import-expenses', {
  schema: reportRoutes.importExpensesSchema,
  preHandler: [protect, authorize('admin', 'pastor')],
  preValidation: upload.single('file'),
  handler: reportRoutes.importExpenses
});

// fastify.get('/api/v1/reports/export-detailed-pdf', {
//   schema: reportRoutes.exportDetailedPDFSchema,
//   preHandler: [protect, validateQuery(reportValidation.financialSummary)],
//   handler: reportRoutes.exportDetailedPDF
// });

// fastify.get('/api/v1/reports/export-comprehensive-excel', {
//   schema: reportRoutes.exportComprehensiveExcelSchema,
//   preHandler: [protect, validateQuery(reportValidation.financialSummary)],
//   handler: reportRoutes.exportComprehensiveExcel
// });

// Add audit logging hook
fastify.addHook('onSend', async (request, reply, payload) => {
  await auditLog(request, reply, payload);
  return payload;
});

// Handle errors
fastify.setErrorHandler((error, request, reply) => {
  const statusCode = error.statusCode || 500;
  reply.code(statusCode).send({
    success: false,
    message: error.message || 'Internal Server Error'
  });
});

// Start server
const startServer = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 4000 });
    console.log('Server listening on http://localhost:4000');
    console.log('Swagger documentation available at http://localhost:4000/documentation');
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

fastify.ready(err => {
  if (err) throw err;
  fastify.swagger();
});

startServer();