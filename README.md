# Legacy Bridge - Solutions Engineer Challenge

> **Enterprise-grade middleware integration for financial transaction processing**

This project demonstrates a complete fintech data pipeline that ingests, normalizes, and visualizes transaction data from a legacy XML-based banking system for Acme Corp.

---

## Project Structure

```
legacy-bridge/
├── legacy-bridge-backend/ # Node.js + Express + PostgreSQL
│ ├── src/
│ │ ├── ingestion/ # XML parsing, sanitization, rule engine
│ │ ├── db/ # Database client instantiation
│ │ ├── prisma/ # Prisma Schema (Entities definition)
│ │ ├── routes/ # API Routes definitions
│ │ ├── utils/ # Logger, Zod schemas
│ │ └── server.js # REST API with security middleware
│ └── README.md # Backend documentation
│
└── legacy-bridge-frontend/ # React + Vite
├── src/
│ ├── components/ # UI components (TransactionList, Header, etc.)
│ ├── controllers/ # Smart components with state management
│ ├── services/ # API layer (Axios)
│ └── utils/ # Formatters (currency, dates)
└── README.md # Frontend documentation
```

> **Implementation Note on Prisma & Entities:**
> Per the project requirements, we implemented the **exact SQL schema** provided. We use **Prisma** as the ORM to manage these entities. The `schema.prisma` file defines the core business entities (`Merchant`, `Transaction`) and ensures strict adherence to the requested database structure, while Prisma Client handles the data access layer safely specificities.

---

## Challenge Requirements Met

| Requirement | Implementation | Status |
| -------------------------- | --------------------------------------------------- | ------ |
| **XML Parsing** | `xml2js` with edge case handling (array vs object) | Done |
| **Dirty Data Cleaning** | Regex + `Decimal.js` for amounts, `dayjs` for dates | Done |
| **PostgreSQL Schema** | Normalized `Merchants` + `Transactions` with FK | Done |
| **Extensible Rule Engine** | JSON-based configuration (`rules.json`) | Done |
| **Frontend (React)** | Table view + Category filter + Merchant summary | Done |
| **Error Logging** | Structured JSON logs with context preservation | Done |
| **Security** | Helmet, Rate Limiting, Zod validation | Done |

---

## Quick Start

### Prerequisites

- Node.js v18+
- PostgreSQL 14+ (or use the provided Render cloud instance)

### Backend Setup

```bash
git clone https://github.com/andres11152/legacy-bridge.git
cd legacy-bridge/legacy-bridge-backend
npm install
npm run db:migrate # Apply Prisma migrations (development only)
npm run ingest # Parse XML and populate database
npm start # Start API on port 3001
```

**Note:** The `db:migrate` command runs `prisma migrate dev`, which is for local development. The Render database already contains pre-loaded demo data, so you can view transactions immediately without running migrations or ingestion.

### Frontend Setup

```bash
cd legacy-bridge-frontend
npm install
npm run dev # Start Vite dev server on port 5173
```

**Important:** Ensure the backend is running before accessing the frontend.

---

## Detailed Documentation

- **[Backend Documentation](./legacy-bridge-backend/README.md)**

- Architecture diagram (Mermaid)
- Database schema explanation
- Data normalization strategy
- Rule engine configuration
- Error handling approach

- **[Frontend Documentation](./legacy-bridge-frontend/README.md)**
- Component structure
- API integration
- Currency formatting logic
- Responsive design approach

---

## Video Walkthroughs

### Video A: Product Deliverable (Client-Facing)

**Duration:** 3 minutes
**Audience:** Acme Corp stakeholders
**Link:** [Watch Video (Google Drive)](https://drive.google.com/file/d/1jih4kgj5X887WTBCXq0JEIaSzxIC929Z/view?usp=drive_link)

Demonstrates how the categorization rules help visualize corporate spending through the dashboard.

---

### Video B: Technical Deep Dive (Engineer-Facing)

**Duration:** 5 minutes
**Audience:** Internal engineering team
**Link:** [Watch Video (Google Drive)](https://drive.google.com/file/d/100IpeB2D8KVREf5rGy2I4t8NcJdXWgVf/view?usp=drive_link)

Explains the architecture, XML parsing strategy, database normalization, and rule engine configuration.

---

## Architecture Highlights

### Layered Design

- **Presentation Layer:** React frontend with responsive UI
- **Infrastructure Layer:** Express API with security middleware (Helmet, Rate Limit)
- **Application Layer:** Ingestion pipeline, Rule Engine, Data Sanitizer
- **Data Access Layer:** Prisma ORM with idempotent operations (includes generated models)
- **Database:** PostgreSQL with normalized schema

### Key Technical Decisions

1. **Decimal Precision:** Used `Decimal.js` to avoid floating-point errors in financial calculations
2. **Idempotency:** Implemented `upsert` logic to prevent duplicate transactions on re-runs
3. **Graceful Degradation:** Single malformed transaction doesn't stop batch processing
4. **Extensibility:** Rule engine uses external JSON config (no code changes needed)
5. **Observability:** Structured JSON logging for CloudWatch/Datadog integration

---

## Security Notice

> **For Evaluators:**
> This repository includes a `.env` file with live database credentials for **demonstration purposes only**.
> In production, credentials would be managed via:
>
> - Platform environment variables (Render, Vercel, AWS Parameter Store)
> - Secret management services (HashiCorp Vault, AWS Secrets Manager)
> - CI/CD secrets (GitHub Actions, GitLab CI/CD)
>
> Credentials will be rotated after evaluation.

---

## Database Schema

```sql
-- Merchants (normalized entity)
CREATE TABLE "merchants" (
"id" SERIAL PRIMARY KEY,
"name" TEXT NOT NULL,
"normalized_name" TEXT UNIQUE NOT NULL
);

-- Transactions (with foreign key to merchants)
CREATE TABLE "transactions" (
"id" SERIAL PRIMARY KEY,
"txn_id" TEXT UNIQUE NOT NULL,
"merchant_id" INTEGER REFERENCES "merchants"("id"),
"amount" DECIMAL(12,2) NOT NULL,
"currency" CHAR(3) NOT NULL,
"category" TEXT NOT NULL,
"txn_date" DATE NOT NULL,
"raw_description" TEXT NOT NULL
);
```

---

## Testing the Solution

### 1. Verify Backend API

```bash
curl http://localhost:3001/transactions
curl http://localhost:3001/merchants/summary
```

### 2. Test Idempotency

```bash
# Run ingestion twice - data should not duplicate
npm run ingest
npm run ingest
```

### 3. Test Rule Engine Extensibility

Edit `legacy-bridge-backend/src/ingestion/rules.json`:

```json
{
"category": "Subscriptions",
"keywords": ["NETFLIX", "SPOTIFY"]
}
```

Re-run ingestion to see new category applied.

---

## Future Roadmap

For ultra-high-scale scenarios (millions of transactions/hour):

1. **Streaming Ingestion:** Node.js Streams for multi-GB XML files
2. **Batch Processing:** `prisma.createMany` for bulk inserts
3. **Dynamic Rules:** Redis-backed rule engine for hot-reloading
4. **Message Queues:** BullMQ/RabbitMQ for traffic spike resilience

---

## Contact

**Submitted by:** Andres Betancourt O.
**Challenge:** Fuse Solutions Engineer Take-Home
**Repository:** [github.com/andres11152/legacy-bridge](https://github.com/andres11152/legacy-bridge)
