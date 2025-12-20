# Legacy Bridge - Frontend Dashboard

## Overview

This is the **frontend application** for the Legacy Bridge Fintech Integration Challenge. It provides a clean, minimal interface to visualize normalized financial transaction data from Acme Corp's legacy XML system.

## Technology Stack

- **Framework:** React 18
- **Build Tool:** Vite (fast dev server, HMR)
- **Styling:** CSS Modules (scoped, modular styles)
- **HTTP Client:** Axios
- **Routing:** React Router v6

## Features

### 1. Transaction Table

Displays all transactions with:

- Transaction Date
- Merchant (from raw description)
- Category (calculated by backend rule engine)
- Amount (formatted with currency)

### 2. Category Filter

- Dropdown to filter transactions by category
- Includes bonus categories beyond the required "eCommerce" and "Transport & Food"

### 3. Merchant Summary

- Aggregated view showing total spending per merchant
- Demonstrates data enrichment capability

### 4. Responsive Design

- Desktop: Traditional table layout
- Mobile: Card-based view for better readability on small screens

## Getting Started

### Prerequisites

- Node.js v18 or higher
- Backend API running on `http://localhost:3001` (see `legacy-bridge-backend/README.md`)

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start development server**

   ```bash
   npm run dev
   ```

3. **Access the application**
   Open `http://localhost:5173` in your browser

### Production Build

```bash
npm run build
npm run preview
```

## API Integration

The frontend communicates with the backend via two endpoints:

| Endpoint             | Method | Description                                                         |
| -------------------- | ------ | ------------------------------------------------------------------- |
| `/transactions`      | GET    | Fetch all transactions (with optional `?category=eCommerce` filter) |
| `/merchants/summary` | GET    | Fetch aggregated spending by merchant                               |

**Proxy Configuration:**  
`vite.config.js` proxies API calls to `http://localhost:3001` during development.

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.jsx       # Title + Category Filter
│   ├── TransactionList.jsx  # Main table/card view
│   └── MerchantSummary.jsx  # Aggregated merchant data
├── controllers/         # Data fetching logic
│   └── TransactionsController.jsx
├── services/            # API layer
│   ├── apiService.js    # Axios instance
│   └── transactionService.js
├── utils/               # Helper functions
│   └── formatters.js    # Currency/Date formatting
├── routes/              # React Router setup
│   └── AppRoutes.jsx
├── App.jsx              # Root component
└── main.jsx             # Entry point
```

## Design Philosophy

Per the challenge requirements:

> "We care more about **clean data flow and structure** than CSS styling."

This frontend prioritizes:

- ✅ **Separation of Concerns**: Presentation (Components) vs Data (Services) vs State (Controllers)
- ✅ **Reusable Utilities**: Currency/Date formatters handle backend string formats gracefully
- ✅ **Error Handling**: Loading states, error boundaries
- ❌ **Not prioritized:** Complex animations, design systems, theming

## Key Implementation Details

### 1. Currency Formatting

The backend returns amounts as **strings** (to preserve Decimal precision during transport). The frontend safely converts them for display:

```javascript
// src/utils/formatters.js
export const formatCurrency = (amount, currency = "USD") => {
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return "N/A";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(numericAmount);
};
```

### 2. Controller Pattern

`TransactionsController.jsx` acts as a **Smart Component**, managing state and orchestrating data fetches. Child components like `TransactionList` are **Dumb/Presentational**, receiving data via props.

## Scripts Reference

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm install`     | Install dependencies                 |
| `npm run dev`     | Start development server (port 5173) |
| `npm run build`   | Build for production                 |
| `npm run preview` | Preview production build locally     |
| `npm run lint`    | Run ESLint checks                    |

## Notes for Evaluators

- **Backend dependency:** This frontend requires the backend API to be running first.
- **Sample data:** The backend must have ingested data via `npm run ingest` for transactions to appear.
- **CORS:** Already configured in backend (`server.js` allows `origin: "*"` for development).

---

**Part of the Solutions Engineer Take-Home Challenge**
