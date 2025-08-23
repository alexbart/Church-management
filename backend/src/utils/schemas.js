// utils/schemas.js
exports.UserSchema = {
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
};

exports.RevenueSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['tithe', 'offering', 'donation', 'other'] },
    amount: { type: 'number', minimum: 0 },
    date: { type: 'string', format: 'date' },
    description: { type: 'string' },
    memberId: { type: 'string' }
  },
  required: ['type', 'amount']
};

exports.ExpenseSchema = {
  type: 'object',
  properties: {
    category: { type: 'string', enum: ['utilities', 'salaries', 'maintenance', 'outreach', 'other'] },
    amount: { type: 'number', minimum: 0 },
    date: { type: 'string', format: 'date' },
    description: { type: 'string' }
  },
  required: ['category', 'amount']
};

exports.LoginSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string' }
  },
  required: ['email', 'password']
};

exports.ErrorSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    message: { type: 'string' }
  }
};

exports.SuccessSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    message: { type: 'string' },
    data: { type: 'object' }
  }
};