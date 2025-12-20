import { useEffect, useState } from "react";
import transactionService from "../services/transactionService";
import TransactionList from "../components/TransactionList";
import Header from "../components/Header";
import MerchantSummary from "../components/MerchantSummary";
import { Loader2 } from "lucide-react";

const TransactionsController = () => {
  const [txns, setTxns] = useState([]);
  const [summary, setSummary] = useState([]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [tData, sData] = await Promise.all([
          transactionService.getTransactions(category),
          transactionService.getMerchantSummary(),
        ]);
        setTxns(tData);
        setSummary(sData);
      } catch (err) {
        console.error(err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category]);

  const handleCategoryChange = (val) => {
    setCategory(val);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <Header category={category} onCategoryChange={handleCategoryChange} />

      {loading ? (
        <div
          style={{ display: "flex", justifyContent: "center", padding: "4rem" }}
        >
          <Loader2
            className="animate-spin"
            size={48}
            color="var(--color-accent)"
          />
        </div>
      ) : error ? (
        <div style={{ color: "red", textAlign: "center", marginTop: "2rem" }}>
          {error}
        </div>
      ) : (
        <>
          <TransactionList transactions={txns} />
          <MerchantSummary summary={summary} />
        </>
      )}
    </div>
  );
};

export default TransactionsController;
