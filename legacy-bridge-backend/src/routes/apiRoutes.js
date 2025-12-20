const express = require("express");
const router = express.Router();
const db = require("../db/client");
const logger = require("../utils/logger");

// For production scale, consider:
// - Request validation middleware
// - Async wrapper to reduce try/catch boilerplate
// - Centralized error handler
// Current approach optimizes for readability in a small API surface.

router.get("/", (req, res) => {
  res.json({
    name: "Legacy Bridge API",
    version: "1.0.0",
    description: "Fintech middleware integration for Acme Corp",
    endpoints: {
      health: "GET /health",
      transactions: "GET /transactions?category={optional}",
      merchantSummary: "GET /merchants/summary",
    },
  });
});

router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

router.get("/transactions", async (req, res) => {
  try {
    const data = await db.getTransactions(req.query.category);
    res.json(data);
  } catch (err) {
    logger.error("Error fetching transactions", err, {
      category: req.query.category,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/merchants/summary", async (req, res) => {
  try {
    const summary = await db.getMerchantSummary();
    res.json(summary);
  } catch (err) {
    logger.error("Error fetching merchant summary", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
