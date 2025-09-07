const {
  getAllTransactionTypes,
  getTransactionType,
  createTransactionType,
  updateTransactionType,
  deleteTransactionType,
} = require("../controllers/transactionTypeController");

async function transactionTypeRoutes(fastify, options) {
  // Get all transaction types
  fastify.get(
    "/transaction-types",
    {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ["Transaction Types"],
        security: [{ Bearer: [] }],
        querystring: {
          type: "object",
          properties: {
            page: { type: "integer", minimum: 1 },
            limit: { type: "integer", minimum: 1, maximum: 100 },
            category: { type: "string", enum: ["revenue", "expense"] },
            isActive: { type: "boolean" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "array" },
              pagination: {
                type: "object",
                properties: {
                  page: { type: "integer" },
                  limit: { type: "integer" },
                  total: { type: "integer" },
                  pages: { type: "integer" },
                },
              },
            },
          },
        },
      },
    },
    getAllTransactionTypes
  );

  // Get single transaction type
  fastify.get(
    "/transaction-types/:id",
    {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ["Transaction Types"],
        security: [{ Bearer: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "object" },
            },
          },
        },
      },
    },
    getTransactionType
  );

  // Create transaction type - Admin/Pastor only
  fastify.post(
    "/transaction-types",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize(["admin", "pastor"]),
      ],
      schema: {
        tags: ["Transaction Types"],
        security: [{ Bearer: [] }],
        body: {
          type: "object",
          required: ["name", "category"],
          properties: {
            name: { type: "string" },
            category: { type: "string", enum: ["revenue", "expense"] },
            description: { type: "string" },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              data: { type: "object" },
            },
          },
        },
      },
    },
    createTransactionType
  );

  // Update transaction type - Admin/Pastor only
  fastify.put(
    "/transaction-types/:id",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize(["admin", "pastor"]),
      ],
      schema: {
        tags: ["Transaction Types"],
        security: [{ Bearer: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            category: { type: "string", enum: ["revenue", "expense"] },
            description: { type: "string" },
            isActive: { type: "boolean" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              data: { type: "object" },
            },
          },
        },
      },
    },
    updateTransactionType
  );

  // Delete transaction type - Admin only
  fastify.delete(
    "/transaction-types/:id",
    {
      preHandler: [fastify.authenticate, fastify.authorize(["admin"])],
      schema: {
        tags: ["Transaction Types"],
        security: [{ Bearer: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    deleteTransactionType
  );
}

module.exports = transactionTypeRoutes;
