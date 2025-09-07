const swaggerOptions = {
  swagger: {
    info: {
      title: "Church Management System API",
      description: "API documentation for the Church Management System",
      version: "1.0.0",
      contact: {
        name: "API Support",
        email: "support@church.org",
      },
    },
    host: "localhost:4000",
    schemes: ["http", "https"],
    consumes: ["application/json", "multipart/form-data"],
    produces: [
      "application/json",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    tags: [
      { name: "Authentication", description: "User authentication endpoints" },
      { name: "Users", description: "User management endpoints" },
      { name: "Revenues", description: "Church revenue management endpoints" },
      { name: "Expenses", description: "Church expense management endpoints" },
      {
        name: "Transaction Types",
        description: "Transaction type management endpoints",
      },
      { name: "Reports", description: "Reporting endpoints" },
    ],
    securityDefinitions: {
      Bearer: {
        type: "apiKey",
        name: "Authorization",
        in: "header",
        description:
          'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"',
      },
    },
    components: {
      securitySchemes: {
        Bearer: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
};

const swaggerUiOptions = {
  routePrefix: "/docs",
  exposeRoute: true,
  staticCSP: true,
  uiConfig: {
    docExpansion: "list",
    deepLinking: true,
  },
  theme: {
    title: "Church Management System API Docs",
  },
};

module.exports = {
  swaggerOptions,
  swaggerUiOptions,
};
