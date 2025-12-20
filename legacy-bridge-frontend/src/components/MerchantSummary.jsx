import propTypes from "prop-types";
import { formatCurrency } from "../utils/formatters";
import styles from "./MerchantSummary.module.css";

const MerchantSummary = ({ summary }) => {
  if (!summary || !Array.isArray(summary) || summary.length === 0) {
    return <div className={styles.emptyState}>No merchant data available.</div>;
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Merchant Summary</h3>
      <div className={styles.summaryCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Merchant (Normalized)</th>
              <th style={{ textAlign: "right" }}>Total Expenses</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((item, index) => (
              <tr key={`${item.merchant}-${item.currency}-${index}`}>
                <td className={styles.merchantName}>{item.merchant}</td>
                <td className={styles.amountCell}>
                  {formatCurrency(item.totalAmount, item.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

MerchantSummary.propTypes = {
  summary: propTypes.arrayOf(
    propTypes.shape({
      merchant: propTypes.string.isRequired,
      currency: propTypes.string.isRequired,
      totalAmount: propTypes.oneOfType([propTypes.string, propTypes.number])
        .isRequired,
    })
  ).isRequired,
};

export default MerchantSummary;
