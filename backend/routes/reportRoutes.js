const {
  generateFinancialReport,
  exportRevenues,
  exportExpenses,
  importRevenues,
  importExpenses,
} = require("../controllers/reportController");

async function reportRoutes(fastify, options) {
  // Generate financial report
  fastify.get(
    "/reports/financial",
    {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ["Reports"],
        security: [{ Bearer: [] }],
        querystring: {
          type: "object",
          properties: {
            startDate: { type: "string", format: "date" },
            endDate: { type: "string", format: "date" },
            format: { type: "string", enum: ["json", "pdf", "excel"] },
          },
        },
      },
    },
    generateFinancialReport
  );

  // Export revenues to Excel
  fastify.get(
    "/reports/export/revenues",
    {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ["Reports"],
        security: [{ Bearer: [] }],
        querystring: {
          type: "object",
          properties: {
            startDate: { type: "string", format: "date" },
            endDate: { type: "string", format: "date" },
          },
        },
      },
    },
    exportRevenues
  );

  // Export expenses to Excel
  fastify.get(
    "/reports/export/expenses",
    {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ["Reports"],
        security: [{ Bearer: [] }],
        querystring: {
          type: "object",
          properties: {
            startDate: { type: "string", format: "date" },
            endDate: { type: "string", format: "date" },
          },
        },
      },
    },
    exportExpenses
  );

  // Import revenues from Excel
  fastify.post(
    "/reports/import/revenues",
    {
      preHandler: [fastify.authenticate],
    },
    importRevenues
  );

  // Import expenses from Excel
  fastify.post(
    "/reports/import/expenses",
    {
      preHandler: [fastify.authenticate],
    },
    importExpenses
  );
}

module.exports = reportRoutes;
