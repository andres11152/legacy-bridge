import propTypes from "prop-types";
import { formatCurrency, formatDate } from "../utils/formatters";
import styles from "./TransactionList.module.css";

const TransactionList = ({ transactions }) => {
  if (transactions.length === 0) {
    return (
      <div className={styles.emptyState}>
        No transactions found for this category.
      </div>
    );
  }

  return (
    <div>
      {/* Desktop Table View */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Merchant</th>
              <th>Category</th>
              <th style={{ textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.txn_id}>
                <td className={styles.dateCell}>{formatDate(t.txn_date)}</td>
                <td className={styles.merchantCell}>
                  <div className={styles.merchantName}>{t.raw_description}</div>
                </td>
                <td className={styles.categoryCell}>
                  <CategoryBadge category={t.category} />
                </td>
                <td className={styles.amountCell}>
                  {formatCurrency(t.amount, t.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className={styles.cardList}>
        {transactions.map((t) => (
          <div key={t.txn_id} className={styles.card}>
            <div className={styles.cardTop}>
              <div>
                <div className={styles.cardMerchant}>{t.raw_description}</div>
                <div className={styles.cardDate}>{formatDate(t.txn_date)}</div>
              </div>
              <CategoryBadge category={t.category} />
            </div>

            <div className={styles.cardBottom}>
              <span
                style={{
                  color: "var(--color-text-secondary)",
                  fontSize: "0.9rem",
                }}
              >
                Amount
              </span>
              <span className={styles.cardAmount}>
                {formatCurrency(t.amount, t.currency)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CategoryBadge = ({ category }) => {
  const getStyle = (cat) => {
    switch (cat) {
      case "eCommerce":
        return styles.badgeEcommerce;
      case "Transport & Food":
        return styles.badgeTransport;
      default:
        return styles.badgeDefault;
    }
  };

  return (
    <span className={`${styles.badge} ${getStyle(category)}`}>{category}</span>
  );
};

TransactionList.propTypes = {
  transactions: propTypes.arrayOf(
    propTypes.shape({
      txn_id: propTypes.string.isRequired,
      txn_date: propTypes.string,
      raw_description: propTypes.string,
      amount: propTypes.oneOfType([propTypes.string, propTypes.number]),
      currency: propTypes.string,
      category: propTypes.string,
    })
  ).isRequired,
};

CategoryBadge.propTypes = {
  category: propTypes.string,
};

export default TransactionList;
