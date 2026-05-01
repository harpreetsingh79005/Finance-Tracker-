import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FinanceProvider } from './context/FinanceContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { DashboardView } from './views/DashboardView';
import { IncomeView } from './views/IncomeView';
import { ExpensesView } from './views/ExpensesView';
import { AnalyticsView } from './views/AnalyticsView';
import { WalletView } from './views/WalletView';
import { LoginView } from './views/LoginView';
import { SignupView } from './views/SignupView';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginView />} />
            <Route path="/signup" element={<SignupView />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardView />} />
              <Route path="wallet" element={<WalletView />} />
              <Route path="income" element={<IncomeView />} />
              <Route path="expenses" element={<ExpensesView />} />
              <Route path="analytics" element={<AnalyticsView />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </FinanceProvider>
    </AuthProvider>
  );
}

export default App;
