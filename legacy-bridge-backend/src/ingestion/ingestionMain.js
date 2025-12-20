const { fetchLegacyXML } = require("./legacyFetcher");
const { parseXML } = require("./parser");
const {
  cleanAmount,
  normalizeDate,
  normalizeMerchant,
} = require("./sanitizer");
const { categorize } = require("./ruleEngine");
const db = require("../db/client");
const { rawTransactionSchema } = require("../utils/schemas");
const logger = require("../utils/logger");

async function ingest() {
  logger.info("Ingestion process started");
  try {
    const xml = fetchLegacyXML();
    const txns = await parseXML(xml);

    for (const t of txns) {
      try {
        // 1. Validate / Defensive Ingestion with Zod
        // rawTransactionSchema.parse will throw a ZodError if validation fails
        const validated = rawTransactionSchema.parse(t);

        const merchantName = normalizeMerchant(validated.description);
        const merchant = await db.getOrCreateMerchant(merchantName);

        await db.insertTransaction({
          txn_id: validated.txn_id,
          merchant_id: merchant.id,
          amount: cleanAmount(validated.amount),
          currency: validated.currency,
          category: categorize(validated.description),
          txn_date: normalizeDate(validated.date),
          raw_description: validated.description,
        });

        logger.info(`Successfully ingested transaction`, {
          txn_id: validated.txn_id,
        });
      } catch (err) {
        logger.error("Failed to ingest transaction", err, {
          txn_id: t?.txn_id || "unknown",
          raw_payload: t,
        });
      }
    }
  } catch (fatalError) {
    logger.error("Fatal error during ingestion initialization", fatalError);
    process.exit(1);
  } finally {
    // Ensure DB connection is closed if this is a standalone script
    logger.info("Ingestion process completed");
    await db.prisma.$disconnect();
  }
}

ingest();
