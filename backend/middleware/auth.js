const fp = require('fastify-plugin');

async function authPlugin(fastify, options) {
  // Register JWT plugin
  fastify.register(require('@fastify/jwt'), {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
  });

  // Create authentication function
  const authenticate = async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
  };

  // Create authorization function
  const authorize = (roles = []) => {
    return async (request, reply) => {
      try {
        await request.jwtVerify();
        
        if (roles.length && !roles.includes(request.user.role)) {
          return reply.code(403).send({ 
            success: false, 
            message: 'Insufficient permissions' 
          });
        }
      } catch (err) {
        reply.code(401).send({ 
          success: false, 
          message: 'Invalid or expired token' 
        });
      }
    };
  };

  // Decorate fastify with the functions
  fastify.decorate('authenticate', authenticate);
  fastify.decorate('authorize', authorize);
}

module.exports = fp(authPlugin);