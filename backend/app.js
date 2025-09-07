require("dotenv").config();

// Create fastify instance with simple logger
const fastify = require("fastify")({
  logger: {
    level: "info",
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    },
  },
});

const mongoose = require("mongoose");

// Import Swagger configuration
const { swaggerOptions, swaggerUiOptions } = require("./config/swagger");

// Basic routes first (always work)
fastify.get("/health", async (request, reply) => {
  return {
    status: "OK",
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime: process.uptime(),
  };
});

fastify.get("/", async (request, reply) => {
  return {
    message: "Church Management System API",
    version: "1.0.0",
    documentation: "/docs",
    endpoints: {
      auth: "/api/v1/auth",
      users: "/api/v1/users",
      revenues: "/api/v1/revenues",
      expenses: "/api/v1/expenses",
      transactionTypes: "/api/v1/transaction-types",
      reports: "/api/v1/reports",
      documentation: "/docs",
    },
  };
});

async function startServer() {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/church_management"
    );
    console.log("MongoDB connected successfully");

    // Register Swagger (must be registered before other plugins)
    console.log("Registering Swagger...");
    await fastify.register(require("@fastify/swagger"), swaggerOptions);
    await fastify.register(require("@fastify/swagger-ui"), swaggerUiOptions);

    // Register plugins
    console.log("Registering plugins...");
    await fastify.register(require("@fastify/cors"), {
      origin: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    });

    // Temporarily comment out Helmet to test if it's causing issues
    // await fastify.register(require("@fastify/helmet"), {
    //   contentSecurityPolicy: {
    //     directives: {
    //       defaultSrc: ["'self'"],
    //       styleSrc: ["'self'", "'unsafe-inline'"],
    //       scriptSrc: ["'self'", "'unsafe-inline'"],
    //     },
    //   },
    // });

    await fastify.register(require("@fastify/multipart"), {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 1,
      },
    });

    // Register auth middleware
    console.log("Registering auth middleware...");
    await fastify.register(require("./middleware/auth"));

    // Register routes with logging
    console.log("Registering routes...");
    const routes = [
      { path: "./routes/authRoutes", name: "Auth routes" },
      { path: "./routes/userRoutes", name: "User routes" },
      {
        path: "./routes/transactionTypeRoutes",
        name: "Transaction type routes",
      },
      { path: "./routes/revenueRoutes", name: "Revenue routes" },
      { path: "./routes/expenseRoutes", name: "Expense routes" },
      { path: "./routes/reportRoutes", name: "Report routes" },
    ];

    for (const route of routes) {
      try {
        await fastify.register(require(route.path), { prefix: "/api/v1" });
        console.log(`✓ ${route.name} registered`);
      } catch (error) {
        console.error(`✗ Error registering ${route.name}:`, error.message);
        throw error; // Re-throw to stop server startup
      }
    }

    // Add debug hook to catch response modifications
    console.log("Adding response debug hooks...");
    fastify.addHook('onSend', async (request, reply, payload) => {
      console.log('=== FIRST onSend Hook (Priority: 100) ===');
      console.log('Initial payload:', payload);
      console.log('Content-Type:', reply.getHeader('content-type'));
      console.log('URL:', request.url);
      return payload;
    }, { priority: 100 });

    fastify.addHook('onSend', async (request, reply, payload) => {
      console.log('=== LAST onSend Hook (Priority: -100) ===');
      console.log('Final payload:', payload);
      console.log('Payload length:', payload?.length || 0);
      
      if (typeof payload === 'string' && payload.length > 0) {
        try {
          const parsed = JSON.parse(payload);
          console.log('Parsed final payload:', parsed);
        } catch (e) {
          console.log('Final payload is not JSON');
        }
      }
      
      return payload;
    }, { priority: -100 });

   fastify.addHook('onSend', async (request, reply, payload) => {
  try {
    console.log('=== FIRST onSend Hook (Priority: 100) ===');
    console.log('Initial payload type:', typeof payload);
    console.log('Initial payload length:', payload?.length || 0);
    console.log('URL:', request.url);
    
    if (typeof payload === 'string' && payload.length > 0) {
      try {
        const parsed = JSON.parse(payload);
        console.log('Initial parsed payload keys:', Object.keys(parsed));
      } catch (e) {
        console.log('Initial payload is not JSON');
      }
    }
  } catch (error) {
    console.error('Error in first onSend hook:', error.message);
  }
  return payload;
}, { priority: 100 });

// Emergency restoration hook with better error handling
fastify.addHook('onSend', async (request, reply, payload) => {
  try {
    if (reply.getHeader('content-type')?.includes('application/json') && 
        typeof payload === 'string' && 
        payload.length > 0) {
      
      const response = JSON.parse(payload);
      
      // Detect if data was stripped (success true but empty data)
      if (response.success === true && response.data && Object.keys(response.data).length === 0) {
        console.log('⚠️  DETECTED DATA STRIPPING - attempting restoration');
        
        // Try to restore from request context
        if (request.originalResponseData) {
          response.data = request.originalResponseData;
          console.log('✅ Successfully restored original data');
          return JSON.stringify(response);
        }
      }
    }
  } catch (error) {
    console.log('Error in restoration hook (non-fatal):', error.message);
    // Don't throw, just return original payload
  }
  return payload;
}, { priority: -200 }); // Lowest priority - runs very last

    // Start server on port 4000
    console.log("Starting server...");
    await fastify.listen({
      port: 4000,
      host: "0.0.0.0",
    });

    console.log(
      "\n══════════════════════════════════════════════════════════════"
    );
    console.log("🚀 Church Management System API is running!");
    console.log(
      "══════════════════════════════════════════════════════════════"
    );
    console.log(`📍 Local: http://localhost:4000`);
    console.log(`📚 Documentation: http://localhost:4000/docs`);
    console.log(`❤️ Health Check: http://localhost:4000/health`);
    console.log(
      "══════════════════════════════════════════════════════════════"
    );
    console.log("Available API endpoints:");
    console.log("  - POST   /api/v1/auth/login");
    console.log("  - POST   /api/v1/auth/register");
    console.log("  - GET    /api/v1/users");
    console.log("  - GET    /api/v1/revenues");
    console.log("  - GET    /api/v1/expenses");
    console.log("  - GET    /api/v1/transaction-types");
    console.log("  - GET    /api/v1/reports/financial");
    console.log(
      "══════════════════════════════════════════════════════════════"
    );
  } catch (error) {
    console.error("❌ Server startup error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  try {
    await fastify.close();
    console.log("✓ Fastify server closed");

    await mongoose.connection.close();
    console.log("✓ MongoDB connection closed");

    console.log("👋 Server shutdown complete");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error.message);
    process.exit(1);
  }
};

// Handle different shutdown signals
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGQUIT", () => shutdown("SIGQUIT"));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error.message);
  shutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  shutdown("UNHANDLED_REJECTION");
});

// Start the server
startServer();