import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { TransactionForm } from '../components/TransactionForm';
import { MonthSelector } from '../components/MonthSelector';
import { Plus } from 'lucide-react';

export function ExpensesView() {
  const { monthlyTransactions, deleteTransaction, addTransaction } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const expenses = monthlyTransactions.filter(t => t.type === 'expense');

  const handleAdd = (data) => {
    addTransaction(data);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground mt-1">Track and categorize your spending.</p>
        </div>
        <div className="flex items-center gap-4">
          <MonthSelector />
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Expense
          </Button>
        </div>
      </div>

      <DataTable data={expenses} type="expense" onDelete={deleteTransaction} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Expense"
      >
        <TransactionForm
          type="expense"
          onSubmit={handleAdd}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
