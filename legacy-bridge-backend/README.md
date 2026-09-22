# Legacy Bridge - Fintech Integration Challenge

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Data Normalization Strategy](#data-normalization-strategy)
- [Rule Engine Configuration](#rule-engine-configuration)
- [Error Handling](#error-handling)
- [Frontend Application](#frontend-application)
- [Video Walkthroughs](#video-walkthroughs)
- [Future Roadmap](#future-roadmap)

## Overview

This project implements a Middleware Integration solution for Acme Corp, designed to ingest, clean, normalize, and visualize financial transaction data from a legacy XML-based banking system.

**Core Challenge:** The client's transaction data is locked in a legacy system that outputs raw, inconsistent XML. This solution bridges that system to a modern PostgreSQL database and serves clean, categorized data to a React frontend dashboard.

### Key Features

- **XML Parsing:** Handles inconsistent XML structures (arrays vs single objects)
- **Data Sanitization:** Cleans dirty amounts ($5.50 → 5.50), messy descriptions, and non-ISO dates
- **Normalized Database:** PostgreSQL schema with Merchants and Transactions entities
- **Extensible Rule Engine:** JavaScript-based categorization via external JSON config
- **Enterprise Security:** Helmet, Rate Limiting (100 req/15min), Zod validation
- **Structured Logging:** JSON-formatted error logs with full context for observability

## Architecture

The solution follows a pragmatic layered architecture without unnecessary abstraction:

### Layer Responsibilities

| Layer | Components | Location in Code | Responsibility |
| --- | --- | --- | --- |
| Application | XML Parser, Data Sanitizer, Rule Engine | `src/ingestion/` | Parse XML, clean dirty data, categorize transactions |
| Infrastructure | Express API, Security Middleware | `src/server.js` | HTTP routing, Helmet headers, Rate limiting |
| Data Access | Prisma Client, Schema Models | `src/db/`, `src/prisma/schema.prisma` | Database abstraction, CRUD operations, schema definition |
| Database | PostgreSQL | Render Cloud | Persistent storage with merchants and transactions tables |
| Presentation | React Frontend | `../legacy-bridge-frontend/` | User interface, data visualization, filtering |

**Note:** This architecture uses Prisma-generated models as entities (no separate domain layer). The `Transaction` and `Merchant` entities exist as Prisma schema definitions, not as separate TypeScript/JavaScript classes.

**Directory Structure:**

```
src/
├── ingestion/ # XML parsing, sanitization, rule engine
├── db/ # Database client (Prisma), SQL DDL scripts
├── utils/ # Logger, Zod schemas
├── server.js # Express API with security middleware
└── prisma/ # Prisma schema and migrations
```

## Database Schema

### Design Principles

- **Normalization:** Merchants are separated from Transactions to avoid data redundancy
- **Referential Integrity:** Foreign key `merchant_id` links transactions to their respective merchant
- **Precision:** `DECIMAL(12,2)` for amounts to avoid floating-point errors in financial calculations

### Entity Relationship

```
merchants (1) ─────< (N) transactions
```

### DDL (SQL Schema)

The complete SQL schema is available in `src/db/init.sql`. Key tables:

```sql
CREATE TABLE "merchants" (
"id" SERIAL PRIMARY KEY,
"name" TEXT NOT NULL,
"normalized_name" TEXT UNIQUE NOT NULL
);

CREATE TABLE "transactions" (
"id" SERIAL PRIMARY KEY,
"txn_id" TEXT UNIQUE NOT NULL,
"merchant_id" INTEGER REFERENCES "merchants"("id") ON DELETE SET NULL,
"amount" DECIMAL(12,2) NOT NULL,
"currency" CHAR(3) NOT NULL,
"category" TEXT NOT NULL,
"txn_date" DATE NOT NULL,
"raw_description" TEXT NOT NULL
);
```

**Why this design:**

- `normalized_name` in merchants ensures deduplication (e.g., "AMZN MKTP US" → "AMZN MKTP US")
- `DECIMAL` type prevents precision loss for financial amounts
- `UNIQUE` constraint on `txn_id` prevents duplicate transactions
- Foreign key relationship allows efficient JOIN queries for merchant summaries

## Getting Started

### Prerequisites

- Node.js v18 or higher
- PostgreSQL 14+ (or access to a cloud instance like Render)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/andres11152/legacy-bridge.git
cd legacy-bridge/legacy-bridge-backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:

```
DATABASE_URL="postgresql://user:password@host:5432/dbname"
NODE_ENV="development"
```

**Security note:** Never commit a real `.env` file to version control. Use `.env.example` as a template, keep `.env` in `.gitignore`, and manage real credentials via platform environment variables (Render, Vercel, AWS Parameter Store), a secrets manager (HashiCorp Vault, AWS Secrets Manager), or CI/CD secrets (GitHub Actions, GitLab CI/CD).

4. **Set up database (local development only)**

```bash
npm run db:migrate
```

This runs `prisma migrate dev` to create the `merchants` and `transactions` tables in your local PostgreSQL instance.

5. **Run ingestion (populate data)**

```bash
npm run ingest
```

This parses the sample XML (`sample.xml`), sanitizes data, and inserts it into PostgreSQL. Re-running ingestion is idempotent: existing records are upserted, not duplicated.

6. **Start the backend API**

```bash
npm start
```

Server runs on `http://localhost:3001`.

7. **Development mode (with hot-reload)**

```bash
npm run dev
```

## Data Normalization Strategy

### Challenge: Dirty Legacy Data

The XML payload contains inconsistent data that must be cleaned before storage.

**1. Amount Normalization**

Problem: Amounts are strings, some with currency symbols ("$5.50", "120.50")
Solution: `src/ingestion/sanitizer.js` uses Decimal.js for arbitrary-precision arithmetic:

```javascript
function cleanAmount(amount) {
const cleaned = amount.replace(/[^0-9.]/g, ""); // Remove $, commas
return new Decimal(cleaned); // Preserves precision (0.1 + 0.2 = 0.3)
}
```

**2. Date Normalization**

Problem: Dates in multiple formats ("2023/10/01", "Oct 02, 2023", "2023-10-03")
Solution: dayjs with custom parse formats:

```javascript
function normalizeDate(date) {
return dayjs(date, ["YYYY/MM/DD", "YYYY-MM-DD", "MMM DD, YYYY"]).format(
"YYYY-MM-DD"
);
}
```

**3. Description Cleanup**

Problem: Messy merchant names ("UBER *TRIP 882", "AMZN Mktp US*123")
Solution: Extract normalized merchant identifier:

```javascript
function normalizeMerchant(desc) {
return desc
.toUpperCase()
.replace(/[*0-9]/g, "")
.trim();
// "UBER *TRIP 882" → "UBER TRIP"
}
```

## Rule Engine Configuration

### Requirement: Extensible Categorization

The categorization logic must be configurable without modifying core code.

**Implementation**

File: `src/ingestion/rules.json`

```json
[
{
"category": "eCommerce",
"keywords": ["AMZN", "EBAY", "SHOPIFY"]
},
{
"category": "Transport & Food",
"keywords": ["STARBUCKS", "UBER", "LYFT"]
}
]
```

**Adding a new rule**

1. Open `src/ingestion/rules.json`
2. Add a new object:

```json
{
"category": "Subscriptions",
"keywords": ["NETFLIX", "SPOTIFY", "ADOBE"]
}
```

3. No code changes required. The next ingestion run applies the new rule automatically.

**How it works**

The `ruleEngine.js` dynamically loads `rules.json` at startup:

```javascript
const rules = JSON.parse(fs.readFileSync("rules.json", "utf8"));

function categorize(description) {
const upper = description.toUpperCase();
for (const rule of rules) {
if (rule.keywords.some((k) => upper.includes(k))) {
return rule.category;
}
}
return "Uncategorized";
}
```

## Error Handling

### Strategy: Three-Level Defense

If the legacy API returns bad data, the system handles errors gracefully:

**1. Schema Validation (Pre-Processing)**

- Tool: Zod schemas (`src/utils/schemas.js`)
- What: Validates required fields, data types, string lengths
- If fails: Logs error with `txn_id` and raw payload, skips transaction

**2. Graceful Degradation (During Processing)**

- Pattern: Individual try/catch per transaction in the loop
- Behavior: A single malformed transaction logs an error but does NOT stop the batch

```javascript
for (const t of txns) {
try {
const validated = rawTransactionSchema.parse(t); // May throw ZodError
// ... process transaction
} catch (err) {
logger.error("Failed to ingest transaction", err, {
txn_id: t?.txn_id || "unknown",
raw_payload: t,
});
// Continue to next transaction
}
}
```

**3. Structured Logging (Observability)**

Format: JSON logs with timestamp, level, message, error stack, and context. Example output:

```json
{
"timestamp": "2023-12-19T15:30:45.123Z",
"level": "error",
"message": "Failed to ingest transaction",
"error_message": "Invalid amount format",
"txn_id": "tx_002",
"raw_payload": {"txn_id": "tx_002", "amount": "ABC"},
"stack": "Error: Invalid amount format at cleanAmount..."
}
```

Benefits:

- Machine-parsable (can send to CloudWatch, Datadog, ELK)
- Enables alerting on specific error patterns (e.g., `txn_id === 'unknown'`)
- Preserves raw payload for manual replay/debugging

## Frontend Application

### Technology

- Framework: React 18 with Vite
- State Management: React Hooks (`useState`, `useEffect`)
- Styling: CSS Modules (scoped, minimal)
- HTTP Client: Axios

### Features

**Transaction Table**

- Displays: Date, Merchant, Category, Amount
- Responsive design (Desktop table + Mobile card view)

**Category Filter**

- Dropdown to filter transactions by category
- Client-side filtering for simplicity

**Merchant Summary**

- Aggregated view of total spending per merchant
- Demonstrates data enrichment capability

### Running the Frontend

Location: `../legacy-bridge-frontend/`

```bash
cd ../legacy-bridge-frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies API calls to `http://localhost:3001`.

**Important:** The backend must be running for the frontend to fetch data.

## Infrastructure & Deployment

### Current Setup

- Database: PostgreSQL hosted on Render (production-grade cloud instance)
- Advantage: High availability, immediate access for evaluators
- Local Alternative: Use `src/db/init.sql` for on-premise PostgreSQL setup

## Video Walkthroughs

### Video A: Product Deliverable (Client-Facing)

**Duration:** 3 minutes
**Audience:** Acme Corp stakeholders
**Link:** [Watch Video (Google Drive)](https://drive.google.com/file/d/1jih4kgj5X887WTBCXq0JEIaSzxIC929Z/view?usp=drive_link)

Demonstrates how the categorization rules help visualize corporate spending through the dashboard.

### Video B: Technical Deep Dive (Engineer-Facing)

**Duration:** 5 minutes
**Audience:** Internal engineering team
**Link:** [Watch Video (Google Drive)](https://drive.google.com/file/d/100IpeB2D8KVREf5rGy2I4t8NcJdXWgVf/view?usp=drive_link)

Explains the architecture, XML parsing strategy, database normalization, and rule engine configuration.

## Future Roadmap

While the current solution meets all functional requirements, the following enhancements are identified for ultra-high-scale scenarios (e.g., millions of transactions/hour):

**Streaming Ingestion**
Replace `fs.readFileSync` with Node.js Streams to handle multi-GB XML files without memory pressure.

**Batch Processing**
Use `prisma.createMany` for bulk inserts to reduce database round-trip latency.

**Dynamic Rules (Hot-Reload)**
Store rules in Redis or a database table to update categorization logic without restarting the service.

**Message Queue Integration**
Decouple ingestion from processing using BullMQ or RabbitMQ for traffic spike resilience.

## Scripts Reference

| Command | Description |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run db:migrate` | Apply Prisma migrations to PostgreSQL |
| `npm run db:generate` | Regenerate Prisma Client |
| `npm run ingest` | Run ingestion script (parse XML → insert to DB) |
| `npm start` | Start production server (port 3001) |
| `npm run dev` | Start development server with hot-reload |

Submitted for the Solutions Engineer Take-Home Challenge.
