import React, { useState } from 'react';
import { Button } from './Button';
import { useFinance } from '../context/FinanceContext';

export function TransactionForm({ type, onSubmit, onCancel }) {
  const { walletAssets } = useFinance();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sourceOrDesc, setSourceOrDesc] = useState('');
  const [category, setCategory] = useState('');
  const [walletId, setWalletId] = useState(walletAssets[0]?.id || '');

  // Ensure walletId is set when walletAssets load
  React.useEffect(() => {
    if (!walletId && walletAssets.length > 0) {
      setWalletId(walletAssets[0].id);
    }
  }, [walletAssets, walletId]);

  const expenseCategories = [
    'Food & Dining', 'Transportation', 'Shopping', 'Healthcare', 
    'Bills & Utilities', 'Entertainment', 'Education', 'Others'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !date || !sourceOrDesc || !walletId) {
      console.error("Validation Error: Missing required fields", { amount, date, sourceOrDesc, walletId });
      return;
    }
    
    // Auto-assign category for income if empty
    let finalCategory = category;
    if (type === 'income' && !finalCategory) {
      const lowerSource = sourceOrDesc.toLowerCase();
      if (lowerSource.includes('salary') || lowerSource.includes('wage')) finalCategory = 'Salary';
      else if (lowerSource.includes('profit')) finalCategory = 'Profit';
      else if (lowerSource.includes('pocket')) finalCategory = 'Pocket Money';
      else finalCategory = 'Other Income';
    } else if (type === 'expense' && !finalCategory) {
      finalCategory = 'Others';
    }

    const payload = {
      type,
      amount: parseFloat(amount),
      date: new Date(date).toISOString(),
      [type === 'income' ? 'source' : 'description']: sourceOrDesc,
      category: finalCategory,
      walletId
    };

    console.log("Submitting transaction payload from UI:", payload);
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="space-y-2">
        <label className="text-sm font-medium">Wallet Source</label>
        <select
          required
          className="flex h-10 w-full rounded-md border border-white/10 bg-slate-900 text-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          value={walletId}
          onChange={e => setWalletId(e.target.value)}
        >
          {walletAssets.map(asset => (
            <option key={asset.id} value={asset.id} className="bg-slate-900 text-white">{asset.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Amount</label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
          <input
            type="number"
            step="0.01"
            required
            className="flex h-10 w-full rounded-md border border-border bg-background px-8 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Date</label>
        <input
          type="date"
          required
          className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">{type === 'income' ? 'Source' : 'Description'}</label>
        <input
          type="text"
          required
          className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder={type === 'income' ? 'e.g., Salary, Freelance' : 'e.g., Groceries, Rent'}
          value={sourceOrDesc}
          onChange={e => setSourceOrDesc(e.target.value)}
        />
      </div>

      {type === 'expense' && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <select
            className="flex h-10 w-full rounded-md border border-white/10 bg-slate-900 text-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="" disabled className="bg-slate-900 text-white/50">Select a category</option>
            {expenseCategories.map(cat => (
              <option key={cat} value={cat} className="bg-slate-900 text-white">{cat}</option>
            ))}
          </select>
        </div>
      )}

      {type === 'income' && (
        <div className="space-y-2">
           <label className="text-sm font-medium">Category (Optional)</label>
           <input
             type="text"
             className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
             placeholder="Auto-assigned if left blank"
             value={category}
             onChange={e => setCategory(e.target.value)}
           />
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Add {type === 'income' ? 'Income' : 'Expense'}</Button>
      </div>
    </form>
  );
}
