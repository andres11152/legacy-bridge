const { PrismaClient } = require("@prisma/client");

const prismaClientSingleton = () => {
  return new PrismaClient();
};

const prisma = globalThis.prismaGlobal || prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

const getTransactions = async (category) => {
  try {
    const where = {};
    if (category) {
      where.category = category;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: {
        txn_date: "desc",
      },
    });

    return transactions;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};

async function getOrCreateMerchant(normalizedName) {
  return prisma.merchant.upsert({
    where: { normalized_name: normalizedName },
    update: {},
    create: {
      name: normalizedName,
      normalized_name: normalizedName,
    },
  });
}

const insertTransaction = async (data) => {
  /**
   * Use upsert to ensure idempotency.
   * If the txn_id exists, we do nothing (update: {}) to preserve financial audit trail.
   * If it doesn't exist, we create it.
   * This prevents "explosions" (Unique Constraint Errors) during re-runs.
   */
  return prisma.transaction.upsert({
    where: { txn_id: data.txn_id },
    update: {}, // Immutable financial data: we don't overwrite if it already exists
    create: data,
  });
};

const getMerchantSummary = async () => {
  try {
    const summary = await prisma.$queryRaw`
      SELECT 
        m.name as merchant,
        t.currency,
        SUM(t.amount) as total_amount
      FROM transactions t
      JOIN merchants m ON t.merchant_id = m.id
      GROUP BY m.name, t.currency
      ORDER BY total_amount DESC
    `;

    // Convert BigInt/Decimal to string/number if needed (Prisma raw returns basic types but Decimal needs handling usually)
    // Actually Prisma returns Decimal as objects or numbers depending on config.
    // For safety, we map serialize them.
    return summary.map((s) => ({
      merchant: s.merchant,
      currency: s.currency,
      // Convert to string to preserve Decimal precision on the frontend
      totalAmount: s.total_amount.toString(),
    }));
  } catch (error) {
    console.error("Error fetching merchant summary:", error);
    throw error;
  }
};

module.exports = {
  prisma,
  getTransactions,
  getOrCreateMerchant,
  insertTransaction,
  getMerchantSummary,
};
