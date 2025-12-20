const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const logger = require("./utils/logger");

const app = express();

// Security Middlewares
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
app.use(limiter);

// Logging
app.use(morgan("combined"));

// CORS - restrict origin in production
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Routes
const apiRoutes = require("./routes/apiRoutes");
app.use("/", apiRoutes);

const server = app.listen(3001, () => {
  const port = 3001;

  // Development-friendly console output
  if (process.env.NODE_ENV !== "production") {
    console.log("\n  Legacy Bridge API\n");
    console.log("  ➜  Local:   http://localhost:" + port + "/");
    console.log("  ➜  Health:  http://localhost:" + port + "/health\n");
  }

  // Structured logging for all environments
  logger.info("Server started", {
    port: port,
    env: process.env.NODE_ENV || "development",
  });
});

// Graceful Shutdown
const shutdown = async () => {
  logger.info("Shutting down server...");
  server.close(async () => {
    logger.info("HTTP server closed.");
    try {
      const db = require("./db/client");
      await db.prisma.$disconnect();
      logger.info("Database connection closed.");
      process.exit(0);
    } catch (err) {
      logger.error("Error during shutdown", err);
      process.exit(1);
    }
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
