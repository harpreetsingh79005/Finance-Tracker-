const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const api = {
  // Transactions API
  getTransactions: async (month) => {
    const url = month ? `${API_URL}/api/transactions?month=${month}` : `${API_URL}/api/transactions`;
    const response = await fetch(url, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  },

  getMonthlyStats: async () => {
    const response = await fetch(`${API_URL}/api/transactions/monthly`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch monthly stats');
    return response.json();
  },

  addTransaction: async (transactionData) => {
    const response = await fetch(`${API_URL}/api/transactions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(transactionData)
    });
    if (!response.ok) throw new Error('Failed to add transaction');
    return response.json();
  },

  deleteTransaction: async (id) => {
    const response = await fetch(`${API_URL}/api/transactions/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete transaction');
    return response.json();
  },

  // Assets API
  getAssets: async () => {
    const response = await fetch(`${API_URL}/api/assets`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch assets');
    return response.json();
  },

  addAsset: async (assetData) => {
    const response = await fetch(`${API_URL}/api/assets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(assetData)
    });
    if (!response.ok) throw new Error('Failed to add asset');
    return response.json();
  },

  updateAsset: async (id, assetData) => {
    const response = await fetch(`${API_URL}/api/assets/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(assetData)
    });
    if (!response.ok) throw new Error('Failed to update asset');
    return response.json();
  },

  deleteAsset: async (id) => {
    const response = await fetch(`${API_URL}/api/assets/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete asset');
    return response.json();
  }
};
