const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");

const rulesPath = path.join(__dirname, "rules.json");
let rules = [];

try {
  const data = fs.readFileSync(rulesPath, "utf8");
  rules = JSON.parse(data);

  if (!Array.isArray(rules) || rules.length === 0) {
    throw new Error("Rules configuration is empty or invalid");
  }

  logger.info("Rule engine loaded", { rulesCount: rules.length });
} catch (err) {
  logger.error("Failed to load rules configuration", err);
  // Fail fast if rules cannot be loaded - this is a critical configuration
  process.exit(1);
}

function categorize(description) {
  if (!description || typeof description !== "string") {
    return "Uncategorized";
  }

  const upper = description.toUpperCase();

  for (const rule of rules) {
    if (rule.keywords && rule.keywords.some((k) => upper.includes(k))) {
      return rule.category;
    }
  }

  return "Uncategorized";
}

module.exports = { categorize, rules };
