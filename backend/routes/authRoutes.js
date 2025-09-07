const { login, register } = require("../controllers/authController");

async function authRoutes(fastify, options) {
  fastify.post("/auth/register", register);
  fastify.post("/auth/login", login);
}

module.exports = authRoutes;
