const { z } = require("zod");

/**
 * Schema for raw transaction data coming from the XML parser.
 * This represents the "dirty" data before sanitization.
 */
const rawTransactionSchema = z.object({
  txn_id: z.string().min(1, "Transaction ID is required"),
  description: z.string().min(1, "Description is required"),
  amount: z.string().min(1, "Amount is required"),
  currency: z.string().length(3, "Currency must be a 3-letter ISO code"),
  date: z.string().min(1, "Date is required"),
});

/**
 * Schema for processed transaction data ready for DB insertion.
 */
const processedTransactionSchema = z.object({
  txn_id: z.string(),
  merchant_id: z.number().int(),
  // Amount can be a Decimal object or string depending on where it's validated
  amount: z.any().refine((val) => val && typeof val.toString === "function", {
    message: "Amount must be a Decimal-compatible value",
  }),
  currency: z.string().length(3),
  category: z.string(),
  txn_date: z.date(),
  raw_description: z.string(),
});

/**
 * Schema for validating query parameters in GET /transactions
 * Strictly rejects unknown query parameters
 */
const transactionQuerySchema = z
  .object({
    category: z.string().optional(),
  })
  .strict()
  .refine(
    (data) => {
      const allowedKeys = ["category"];
      const receivedKeys = Object.keys(data);
      const unknownKeys = receivedKeys.filter(
        (key) => !allowedKeys.includes(key)
      );
      return unknownKeys.length === 0;
    },
    {
      message: "Unknown query parameters detected",
    }
  );

module.exports = {
  rawTransactionSchema,
  processedTransactionSchema,
  transactionQuerySchema,
};
