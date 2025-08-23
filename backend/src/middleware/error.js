// middleware/error.js
const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (error, req, reply) => {
  let err = { ...error };
  err.message = error.message;

  // Log to console for dev
  console.log(error);

  // Mongoose bad ObjectId
  if (error.name === 'CastError') {
    const message = 'Resource not found';
    err = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (error.code === 11000) {
    const message = 'Duplicate field value entered';
    err = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors).map(val => val.message);
    err = new ErrorResponse(message, 400);
  }

  reply.code(err.statusCode || 500).send({
    success: false,
    message: err.message || 'Server Error'
  });
};

module.exports = errorHandler;