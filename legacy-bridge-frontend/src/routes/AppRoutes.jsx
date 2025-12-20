import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import TransactionsController from "../controllers/TransactionsController";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TransactionsController />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
