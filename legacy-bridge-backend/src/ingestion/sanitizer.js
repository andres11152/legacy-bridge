const dayjs = require("dayjs");
const customParse = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParse);

const { Decimal } = require("decimal.js");

function cleanAmount(amount) {
  // Use Decimal to preserve precision during cleaning
  const cleaned = amount.replace(/[^0-9.]/g, "");
  return new Decimal(cleaned);
}

function normalizeDate(date) {
  const isoString = dayjs(date, [
    "YYYY/MM/DD",
    "YYYY-MM-DD",
    "MMM DD, YYYY",
  ]).format("YYYY-MM-DD");
  return new Date(isoString + "T00:00:00Z");
}

function normalizeMerchant(desc) {
  return desc
    .toUpperCase()
    .replace(/[*0-9]/g, "")
    .trim();
}

module.exports = { cleanAmount, normalizeDate, normalizeMerchant };
