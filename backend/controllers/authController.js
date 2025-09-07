const User = require('../models/User');
const { generateUserId } = require('../services/numberSeriesService');
const logger = require('../utils/logger');

exports.register = async (request, reply) => {
  try {
    const { firstName, lastName, email, password, role } = request.body;
    
    const userId = await generateUserId();
    const user = new User({
      userId,
      firstName,
      lastName,
      email,
      password,
      role: role || 'member'
    });
    
    await user.save();
    
    logger.info(`User registered: ${email}`, { 
      action: 'register', 
      userId: user._id 
    });
    
    reply.code(201).send({
      success: true,
      message: 'User registered successfully',
      user: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    reply.code(500).send({ success: false, message: error.message });
  }
};

exports.login = async (request, reply) => {
  try {
    const { email, password } = request.body;
    const user = await User.findOne({ email, isActive: true });
    
    if (!user || !(await user.comparePassword(password))) {
      return reply.code(401).send({ success: false, message: 'Invalid credentials' });
    }
    
    // Use fastify.jwt.sign instead of jsonwebtoken directly
    const token = request.server.jwt.sign({
      id: user._id,
      email: user.email,
      role: user.role
    });
    
    logger.info(`User logged in: ${email}`, { 
      action: 'login', 
      userId: user._id 
    });
    
    reply.send({
      success: true,
      message: 'Login successful',
      token,
      user: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    reply.code(500).send({ success: false, message: error.message });
  }
};