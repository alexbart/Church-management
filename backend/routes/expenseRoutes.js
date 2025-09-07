const {
  getAllExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");

async function expenseRoutes(fastify, options) {
  // Get all expenses
  fastify.get(
    "/expenses",
    {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ["Expenses"],
        security: [{ Bearer: [] }],
        querystring: {
          type: "object",
          properties: {
            page: { type: "integer", minimum: 1 },
            limit: { type: "integer", minimum: 1, maximum: 100 },
            startDate: { type: "string", format: "date" },
            endDate: { type: "string", format: "date" },
            type: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "array" },
              summary: {
                type: "object",
                properties: {
                  totalAmount: { type: "number" },
                  totalCount: { type: "integer" },
                },
              },
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
    getAllExpenses
  );

  // Get single expense
  fastify.get(
    "/expenses/:id",
    {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ["Expenses"],
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
    getExpense
  );

  // Create expense
  fastify.post(
    "/expenses",
    {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ["Expenses"],
        security: [{ Bearer: [] }],
        body: {
          type: "object",
          required: ["type", "amount"],
          properties: {
            type: { type: "string" },
            amount: { type: "number", minimum: 0 },
            description: { type: "string" },
            date: { type: "string", format: "date" },
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
    createExpense
  );

  // Update expense
  fastify.put(
    "/expenses/:id",
    {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ["Expenses"],
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
            type: { type: "string" },
            amount: { type: "number", minimum: 0 },
            description: { type: "string" },
            date: { type: "string", format: "date" },
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
    updateExpense
  );

  // Delete expense - Admin only
  fastify.delete(
    "/expenses/:id",
    {
      preHandler: [fastify.authenticate, fastify.authorize(["admin"])],
      schema: {
        tags: ["Expenses"],
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
    deleteExpense
  );
}

module.exports = expenseRoutes;
