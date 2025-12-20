const fs = require("fs");
const path = require("path");

function fetchLegacyXML() {
  const filePath = path.join(__dirname, "../../sample.xml");
  return fs.readFileSync(filePath, "utf-8");
}

module.exports = { fetchLegacyXML };
