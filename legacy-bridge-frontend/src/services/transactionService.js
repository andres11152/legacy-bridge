import api from "./apiService";

const getTransactions = async (category = "") => {
  try {
    const response = await api.get(`/transactions`, {
      params: { category },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};

const getMerchantSummary = async () => {
  try {
    const response = await api.get(`/merchants/summary`);
    return response.data;
  } catch (error) {
    console.error("Error fetching merchant summary:", error);
    throw error;
  }
};

export default {
  getTransactions,
  getMerchantSummary,
};
