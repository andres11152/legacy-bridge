const xml2js = require("xml2js");

async function parseXML(xml) {
  const parser = new xml2js.Parser({ explicitArray: false });
  const result = await parser.parseStringPromise(xml);

  // Handle edge case: empty or malformed XML
  if (!result || !result.transactions || !result.transactions.transaction) {
    return [];
  }

  const transactions = result.transactions.transaction;

  // Normalize to array (xml2js returns object if single transaction)
  return Array.isArray(transactions) ? transactions : [transactions];
}

module.exports = { parseXML };
