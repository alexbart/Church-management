// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT
exports.protect = async (req, reply) => {
  try {
    let token;

    // Check if authorization header exists
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return reply.code(401).send({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return reply.code(401).send({
        success: false,
        message: 'The user belonging to this token no longer exists'
      });
    }

    // Add user to request
    req.user = currentUser;
    return;
  } catch (error) {
    return reply.code(401).send({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, reply, next) => {
    if (!roles.includes(req.user.role)) {
      return reply.code(403).send({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    return;
  };
};