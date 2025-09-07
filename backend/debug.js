require('dotenv').config();
const fastify = require('fastify')({ 
  logger: true
});
const mongoose = require('mongoose');

// Test basic server
fastify.get('/', async (request, reply) => {
  return { message: 'Church Management System API - Debug Mode' };
});

const start = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/church_db');
    console.log('MongoDB connected successfully');
    
    await fastify.listen({ 
      port: process.env.PORT || 4000, 
      host: process.env.HOST || '0.0.0.0'
    });
    
    console.log(`Server listening on ${fastify.server.address().port}`);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

start();