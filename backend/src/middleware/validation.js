const Joi = require('@hapi/joi');

// User validation schemas
exports.userValidation = {
  register: Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin', 'pastor', 'member').default('member')
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  update: Joi.object({
    firstName: Joi.string().min(2).max(50),
    lastName: Joi.string().min(2).max(50),
    email: Joi.string().email(),
    role: Joi.string().valid('admin', 'pastor', 'member'),
    isActive: Joi.boolean()
  }).min(1)
};

// Revenue validation schemas
exports.revenueValidation = {
  create: Joi.object({
    type: Joi.string().valid('tithe', 'offering', 'donation', 'other').required(),
    amount: Joi.number().min(0).required(),
    date: Joi.date().default(Date.now),
    description: Joi.string().max(500).allow(''),
    memberId: Joi.string().allow('').optional()
  }),

  update: Joi.object({
    type: Joi.string().valid('tithe', 'offering', 'donation', 'other'),
    amount: Joi.number().min(0),
    date: Joi.date(),
    description: Joi.string().max(500).allow(''),
    memberId: Joi.string().allow('').optional()
  }).min(1)
};

// Expense validation schemas
exports.expenseValidation = {
  create: Joi.object({
    category: Joi.string().valid('utilities', 'salaries', 'maintenance', 'outreach', 'other').required(),
    amount: Joi.number().min(0).required(),
    date: Joi.date().default(Date.now),
    description: Joi.string().max(500).allow('')
  }),

  update: Joi.object({
    category: Joi.string().valid('utilities', 'salaries', 'maintenance', 'outreach', 'other'),
    amount: Joi.number().min(0),
    date: Joi.date(),
    description: Joi.string().max(500).allow('')
  }).min(1)
};

// Report validation schemas
exports.reportValidation = {
  financialSummary: Joi.object({
    startDate: Joi.date(),
    endDate: Joi.date(),
    type: Joi.string().valid('tithe', 'offering', 'donation', 'other'),
    category: Joi.string().valid('utilities', 'salaries', 'maintenance', 'outreach', 'other')
  })
};

// Validation middleware
exports.validate = (schema) => {
  return (req, reply, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return reply.code(400).send({
        success: false,
        message: error.details[0].message
      });
    }
    next();
  };
};

// Query validation middleware
exports.validateQuery = (schema) => {
  return (req, reply, next) => {
    const { error } = schema.validate(req.query);
    if (error) {
      return reply.code(400).send({
        success: false,
        message: error.details[0].message
      });
    }
    next();
  };
};