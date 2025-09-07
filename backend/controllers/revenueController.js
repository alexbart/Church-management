const Revenue = require('../models/Revenue');
const TransactionType = require('../models/TransactionType');
const { generateRevenueId } = require('../services/numberSeriesService');
const logger = require('../utils/logger');

// Get all revenues
exports.getAllRevenues = async (request, reply) => {
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
    
    const revenues = await Revenue.find(filter)
      .populate('type', 'name category')
      .populate('member', 'firstName lastName userId')
      .populate('createdBy', 'firstName lastName userId')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1, createdAt: -1 });
    
    const total = await Revenue.countDocuments(filter);
    const totalAmount = await Revenue.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    logger.info(`Revenues retrieved by user ${request.user.id}`, { 
      action: 'getAllRevenues', 
      userId: request.user.id 
    });
    
    reply.send({
      success: true,
      data: revenues,
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
    logger.error(`Get revenues error: ${error.message}`);
    reply.code(500).send({ success: false, message: error.message });
  }
};

// Get single revenue
exports.getRevenue = async (request, reply) => {
  try {
    const revenue = await Revenue.findById(request.params.id)
      .populate('type', 'name category')
      .populate('member', 'firstName lastName userId')
      .populate('createdBy', 'firstName lastName userId');
    
    if (!revenue) {
      return reply.code(404).send({ success: false, message: 'Revenue not found' });
    }
    
    logger.info(`Revenue ${request.params.id} retrieved by user ${request.user.id}`, { 
      action: 'getRevenue', 
      userId: request.user.id,
      revenueId: request.params.id
    });
    
    reply.send({ success: true, data: revenue });
  } catch (error) {
    logger.error(`Get revenue error: ${error.message}`);
    reply.code(500).send({ success: false, message: error.message });
  }
};

// Create revenue
exports.createRevenue = async (request, reply) => {
  try {
    const { type, amount, description, date, member } = request.body;
    
    // Verify transaction type exists and is for revenue
    const transactionType = await TransactionType.findOne({ 
      _id: type, 
      category: 'revenue',
      isActive: true 
    });
    
    if (!transactionType) {
      return reply.code(400).send({ 
        success: false, 
        message: 'Invalid transaction type for revenue' 
      });
    }
    
    const revenueId = await generateRevenueId();
    const revenue = new Revenue({
      revenueId,
      type,
      amount,
      description,
      date: date || new Date(),
      member,
      createdBy: request.user.id
    });
    
    await revenue.save();
    
    // Populate the created revenue for response
    const populatedRevenue = await Revenue.findById(revenue._id)
      .populate('type', 'name category')
      .populate('member', 'firstName lastName userId')
      .populate('createdBy', 'firstName lastName userId');
    
    logger.info(`Revenue created: ${revenueId} by user ${request.user.id}`, { 
      action: 'createRevenue', 
      userId: request.user.id,
      revenueId: revenue._id
    });
    
    reply.code(201).send({
      success: true,
      message: 'Revenue created successfully',
      data: populatedRevenue
    });
  } catch (error) {
    logger.error(`Create revenue error: ${error.message}`);
    reply.code(500).send({ success: false, message: error.message });
  }
};

// Update revenue
exports.updateRevenue = async (request, reply) => {
  try {
    const { type, amount, description, date, member } = request.body;
    
    const revenue = await Revenue.findById(request.params.id);
    if (!revenue) {
      return reply.code(404).send({ success: false, message: 'Revenue not found' });
    }
    
    // Verify transaction type if provided
    if (type) {
      const transactionType = await TransactionType.findOne({ 
        _id: type, 
        category: 'revenue',
        isActive: true 
      });
      
      if (!transactionType) {
        return reply.code(400).send({ 
          success: false, 
          message: 'Invalid transaction type for revenue' 
        });
      }
      revenue.type = type;
    }
    
    if (amount !== undefined) revenue.amount = amount;
    if (description !== undefined) revenue.description = description;
    if (date) revenue.date = date;
    if (member !== undefined) revenue.member = member;
    
    await revenue.save();
    
    // Populate the updated revenue for response
    const populatedRevenue = await Revenue.findById(revenue._id)
      .populate('type', 'name category')
      .populate('member', 'firstName lastName userId')
      .populate('createdBy', 'firstName lastName userId');
    
    logger.info(`Revenue ${request.params.id} updated by user ${request.user.id}`, { 
      action: 'updateRevenue', 
      userId: request.user.id,
      revenueId: request.params.id
    });
    
    reply.send({
      success: true,
      message: 'Revenue updated successfully',
      data: populatedRevenue
    });
  } catch (error) {
    logger.error(`Update revenue error: ${error.message}`);
    reply.code(500).send({ success: false, message: error.message });
  }
};

// Delete revenue
exports.deleteRevenue = async (request, reply) => {
  try {
    const revenue = await Revenue.findById(request.params.id);
    
    if (!revenue) {
      return reply.code(404).send({ success: false, message: 'Revenue not found' });
    }
    
    await Revenue.findByIdAndDelete(request.params.id);
    
    logger.info(`Revenue ${request.params.id} deleted by user ${request.user.id}`, { 
      action: 'deleteRevenue', 
      userId: request.user.id,
      revenueId: request.params.id
    });
    
    reply.send({ success: true, message: 'Revenue deleted successfully' });
  } catch (error) {
    logger.error(`Delete revenue error: ${error.message}`);
    reply.code(500).send({ success: false, message: error.message });
  }
};