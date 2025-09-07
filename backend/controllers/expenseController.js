const Expense = require('../models/Expense');
const TransactionType = require('../models/TransactionType');
const { generateExpenseId } = require('../services/numberSeriesService');
const logger = require('../utils/logger');

// Get all expenses
exports.getAllExpenses = async (request, reply) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, type } = request.query;
    
    const filter = {};
    
    // Date filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    // Type filter
    if (type) filter.type = type;
    
    const expenses = await Expense.find(filter)
      .populate('type', 'name category')
      .populate('createdBy', 'firstName lastName userId')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1, createdAt: -1 });
    
    const total = await Expense.countDocuments(filter);
    const totalAmount = await Expense.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    logger.info(`Expenses retrieved by user ${request.user.id}`, { 
      action: 'getAllExpenses', 
      userId: request.user.id 
    });
    
    reply.send({
      success: true,
      data: expenses,
      summary: {
        totalAmount: totalAmount[0]?.total || 0,
        totalCount: total
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error(`Get expenses error: ${error.message}`);
    reply.code(500).send({ success: false, message: error.message });
  }
};

// Get single expense
exports.getExpense = async (request, reply) => {
  try {
    const expense = await Expense.findById(request.params.id)
      .populate('type', 'name category')
      .populate('createdBy', 'firstName lastName userId');
    
    if (!expense) {
      return reply.code(404).send({ success: false, message: 'Expense not found' });
    }
    
    logger.info(`Expense ${request.params.id} retrieved by user ${request.user.id}`, { 
      action: 'getExpense', 
      userId: request.user.id,
      expenseId: request.params.id
    });
    
    reply.send({ success: true, data: expense });
  } catch (error) {
    logger.error(`Get expense error: ${error.message}`);
    reply.code(500).send({ success: false, message: error.message });
  }
};

// Create expense
exports.createExpense = async (request, reply) => {
  try {
    const { type, amount, description, date } = request.body;
    
    // Verify transaction type exists and is for expense
    const transactionType = await TransactionType.findOne({ 
      _id: type, 
      category: 'expense',
      isActive: true 
    });
    
    if (!transactionType) {
      return reply.code(400).send({ 
        success: false, 
        message: 'Invalid transaction type for expense' 
      });
    }
    
    const expenseId = await generateExpenseId();
    const expense = new Expense({
      expenseId,
      type,
      amount,
      description,
      date: date || new Date(),
      createdBy: request.user.id
    });
    
    await expense.save();
    
    // Populate the created expense for response
    const populatedExpense = await Expense.findById(expense._id)
      .populate('type', 'name category')
      .populate('createdBy', 'firstName lastName userId');
    
    logger.info(`Expense created: ${expenseId} by user ${request.user.id}`, { 
      action: 'createExpense', 
      userId: request.user.id,
      expenseId: expense._id
    });
    
    reply.code(201).send({
      success: true,
      message: 'Expense created successfully',
      data: populatedExpense
    });
  } catch (error) {
    logger.error(`Create expense error: ${error.message}`);
    reply.code(500).send({ success: false, message: error.message });
  }
};

// Update expense
exports.updateExpense = async (request, reply) => {
  try {
    const { type, amount, description, date } = request.body;
    
    const expense = await Expense.findById(request.params.id);
    if (!expense) {
      return reply.code(404).send({ success: false, message: 'Expense not found' });
    }
    
    // Verify transaction type if provided
    if (type) {
      const transactionType = await TransactionType.findOne({ 
        _id: type, 
        category: 'expense',
        isActive: true 
      });
      
      if (!transactionType) {
        return reply.code(400).send({ 
          success: false, 
          message: 'Invalid transaction type for expense' 
        });
      }
      expense.type = type;
    }
    
    if (amount !== undefined) expense.amount = amount;
    if (description !== undefined) expense.description = description;
    if (date) expense.date = date;
    
    await expense.save();
    
    // Populate the updated expense for response
    const populatedExpense = await Expense.findById(expense._id)
      .populate('type', 'name category')
      .populate('createdBy', 'firstName lastName userId');
    
    logger.info(`Expense ${request.params.id} updated by user ${request.user.id}`, { 
      action: 'updateExpense', 
      userId: request.user.id,
      expenseId: request.params.id
    });
    
    reply.send({
      success: true,
      message: 'Expense updated successfully',
      data: populatedExpense
    });
  } catch (error) {
    logger.error(`Update expense error: ${error.message}`);
    reply.code(500).send({ success: false, message: error.message });
  }
};

// Delete expense
exports.deleteExpense = async (request, reply) => {
  try {
    const expense = await Expense.findById(request.params.id);
    
    if (!expense) {
      return reply.code(404).send({ success: false, message: 'Expense not found' });
    }
    
    await Expense.findByIdAndDelete(request.params.id);
    
    logger.info(`Expense ${request.params.id} deleted by user ${request.user.id}`, { 
      action: 'deleteExpense', 
      userId: request.user.id,
      expenseId: request.params.id
    });
    
    reply.send({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    logger.error(`Delete expense error: ${error.message}`);
    reply.code(500).send({ success: false, message: error.message });
  }
};