import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

const FinanceContext = createContext(undefined);

export function FinanceProvider({ children }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [assets, setAssets] = useState([]);
  const [theme, setTheme] = useLocalStorage('finance_theme_v3', 'dark');
  
  // Default to current month
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Fetch data from SQL backend
  const fetchData = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setAssets([]);
      return;
    }
    
    try {
      const [txData, assetsData] = await Promise.all([
        api.getTransactions(),
        api.getAssets()
      ]);
      setTransactions(txData);
      setAssets(assetsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const addTransaction = async (transaction) => {
    if (!user) return;
    try {
      const newTransaction = await api.addTransaction(transaction);
      setTransactions(prev => [newTransaction, ...prev]);
    } catch (e) {
      console.error("Error adding transaction:", e);
    }
  };

  const deleteTransaction = async (id) => {
    if (!user) return;
    try {
      await api.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      console.error("Error deleting transaction:", e);
    }
  };

  const addAsset = async (assetData) => {
    if (!user) return;
    try {
      const newAsset = await api.addAsset(assetData);
      setAssets(prev => [...prev, newAsset]);
    } catch (e) {
      console.error("Error adding asset:", e);
    }
  };

  const updateAsset = async (id, assetData) => {
    if (!user) return;
    try {
      const updated = await api.updateAsset(id, assetData);
      setAssets(prev => prev.map(a => a.id === id ? updated : a));
    } catch (e) {
      console.error("Error updating asset:", e);
    }
  };

  const deleteAsset = async (id) => {
    if (!user) return;
    try {
      await api.deleteAsset(id);
      setAssets(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      console.error("Error deleting asset:", e);
    }
  };

  // Derive wallet assets purely from transactions
  const walletAssets = assets.map(asset => {
    const assetTransactions = transactions.filter(t => t.walletId === asset.id);
    const income = assetTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const expenses = assetTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    return {
      ...asset,
      balance: parseFloat(asset.amount) + income - expenses
    };
  });

  // Filter transactions for the selected month
  const monthlyTransactions = transactions.filter(t => {
    const date = parseISO(t.date);
    return isWithinInterval(date, {
      start: startOfMonth(selectedMonth),
      end: endOfMonth(selectedMonth)
    });
  });

  const calculateTotals = (data) => {
    const income = data.filter(t => t.type === 'income').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    const expenses = data.filter(t => t.type === 'expense').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    return { income, expenses, balance: income - expenses };
  };

  const totals = calculateTotals(monthlyTransactions);
  const allTimeTotals = calculateTotals(transactions);

  const walletTotal = walletAssets.reduce((acc, curr) => acc + curr.balance, 0);

  return (
    <FinanceContext.Provider value={{
      transactions,
      monthlyTransactions,
      addTransaction,
      deleteTransaction,
      assets,
      addAsset,
      updateAsset,
      deleteAsset,
      totals,
      allTimeTotals,
      walletAssets,
      walletTotal,
      theme,
      toggleTheme,
      selectedMonth,
      setSelectedMonth,
      refreshData: fetchData
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
