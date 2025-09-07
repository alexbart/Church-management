const User = require('../models/User');
const { generateUserId } = require('../services/numberSeriesService');
const logger = require('../utils/logger');

// Get all users
exports.getAllUsers = async (request, reply) => {
  try {
    const { page = 1, limit = 10, role, isActive } = request.query;
    
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    const users = await User.find(filter)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(filter);
    
    logger.info(`Users retrieved by user ${request.user.id}`, { 
      action: 'getAllUsers', 
      userId: request.user.id 
    });
    
    reply.send({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error(`Get users error: ${error.message}`);
    reply.code(500).send({ success: false, message: error.message });
  }
};

// Get single user
exports.getUser = async (request, reply) => {
  try {
    const user = await User.findById(request.params.id).select('-password');
    
    if (!user) {
      return reply.code(404).send({ success: false, message: 'User not found' });
    }
    
    logger.info(`User ${request.params.id} retrieved by user ${request.user.id}`, { 
      action: 'getUser', 
      userId: request.user.id,
      targetUserId: request.params.id
    });
    
    reply.send({ success: true, data: user });
  } catch (error) {
    logger.error(`Get user error: ${error.message}`);
    reply.code(500).send({ success: false, message: error.message });
  }
};

// Create user
exports.createUser = async (request, reply) => {
  try {
    const { firstName, lastName, email, password, role } = request.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return reply.code(400).send({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }
    
    const userId = await generateUserId();
    const user = new User({
      userId,
      firstName,
      lastName,
      email,
      password,
      role: role || 'member',
      createdBy: request.user.id
    });
    
    await user.save();
    
    logger.info(`User created: ${email} by user ${request.user.id}`, { 
      action: 'createUser', 
      userId: request.user.id,
      targetUserId: user._id
    });
    
    reply.code(201).send({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    logger.error(`Create user error: ${error.message}`);
    reply.code(500).send({ success: false, message: error.message });
  }
};

// Update user
exports.updateUser = async (request, reply) => {
  try {
    const { firstName, lastName, role, isActive } = request.body;
    
    const user = await User.findById(request.params.id);
    if (!user) {
      return reply.code(404).send({ success: false, message: 'User not found' });
    }
    
    // Prevent users from changing their own role or status
    if (request.params.id === request.user.id && (role || isActive !== undefined)) {
      return reply.code(403).send({ 
        success: false, 
        message: 'You cannot change your own role or status' 
      });
    }
    
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    
    await user.save();
    
    logger.info(`User ${request.params.id} updated by user ${request.user.id}`, { 
      action: 'updateUser', 
      userId: request.user.id,
      targetUserId: request.params.id
    });
    
    reply.send({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    logger.error(`Update user error: ${error.message}`);
    reply.code(500).send({ success: false, message: error.message });
  }
};

// Delete user
exports.deleteUser = async (request, reply) => {
  try {
    const user = await User.findById(request.params.id);
    
    if (!user) {
      return reply.code(404).send({ success: false, message: 'User not found' });
    }
    
    // Prevent users from deleting themselves
    if (request.params.id === request.user.id) {
      return reply.code(403).send({ 
        success: false, 
        message: 'You cannot delete your own account' 
      });
    }
    
    await User.findByIdAndDelete(request.params.id);
    
    logger.info(`User ${request.params.id} deleted by user ${request.user.id}`, { 
      action: 'deleteUser', 
      userId: request.user.id,
      targetUserId: request.params.id
    });
    
    reply.send({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    logger.error(`Delete user error: ${error.message}`);
    reply.code(500).send({ success: false, message: error.message });
  }
};