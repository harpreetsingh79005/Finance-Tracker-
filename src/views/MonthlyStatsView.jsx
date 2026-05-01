import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useFinance } from '../context/FinanceContext';
import { Card, CardContent } from '../components/Card';
import { Modal } from '../components/Modal';
import { DataTable } from '../components/DataTable';
import { formatCurrency } from '../utils/format';
import { format, parse } from 'date-fns';
import { TrendingUp, TrendingDown, Activity, ChevronRight } from 'lucide-react';

export function MonthlyStatsView() {
  const { transactions } = useFinance(); // Just to trigger re-fetches when global transactions change
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [monthTransactions, setMonthTransactions] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await api.getMonthlyStats();
        setMonthlyStats(data);
      } catch (error) {
        console.error("Failed to fetch monthly stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [transactions]); // Sync automatically when new income/expense is added

  const handleCardClick = async (monthStr) => {
    setSelectedMonth(monthStr);
    setModalLoading(true);
    try {
      const data = await api.getTransactions(monthStr);
      setMonthTransactions(data);
    } catch (error) {
      console.error("Failed to fetch month transactions:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const getMonthName = (monthStr) => {
    // monthStr is 'YYYY-MM'
    if (!monthStr) return '';
    const date = parse(monthStr, 'yyyy-MM', new Date());
    return format(date, 'MMMM yyyy');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Monthly Stats</h1>
        <p className="text-muted-foreground">A high-level overview of your cashflow across all months.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : monthlyStats.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl border-white/10">
          No transactions found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {monthlyStats.map((stat) => {
            const income = parseFloat(stat.total_income);
            const expense = parseFloat(stat.total_expense);
            const cashflow = income - expense;
            const isPositive = cashflow >= 0;
            
            // Progress bar logic
            const total = income + expense;
            const expensePercent = total > 0 ? (expense / total) * 100 : 0;
            const safePercent = Math.min(Math.max(expensePercent, 0), 100);

            return (
              <Card 
                key={stat.month}
                onClick={() => handleCardClick(stat.month)}
                className="group cursor-pointer hover:-translate-y-1 transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-card to-slate-900/50 border-white/5 hover:border-primary/40 hover:shadow-[0_8px_30px_rgba(139,92,246,0.15)]"
              >
                {/* Subtle Neon Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-primary transition-colors">
                      {getMonthName(stat.month)}
                    </h3>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors translate-x-0 group-hover:translate-x-1" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <TrendingUp className="w-3.5 h-3.5 text-success" /> Income
                      </div>
                      <p className="font-semibold text-success drop-shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                        {formatCurrency(income)}
                      </p>
                    </div>
                    <div className="space-y-1 text-right">
                      <div className="flex items-center justify-end gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <TrendingDown className="w-3.5 h-3.5 text-destructive" /> Expense
                      </div>
                      <p className="font-semibold text-destructive drop-shadow-[0_0_8px_rgba(239,68,68,0.2)]">
                        {formatCurrency(expense)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                        <Activity className="w-4 h-4" /> Net Cashflow
                      </span>
                      <span className={`font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                        {isPositive ? '+' : ''}{formatCurrency(cashflow)}
                      </span>
                    </div>
                    
                    {/* Visual Progress Bar */}
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
                      <div 
                        className="h-full bg-success transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                        style={{ width: `${100 - safePercent}%` }} 
                      />
                      <div 
                        className="h-full bg-destructive transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(239,68,68,0.5)]" 
                        style={{ width: `${safePercent}%` }} 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Transactions Modal */}
      <Modal
        isOpen={!!selectedMonth}
        onClose={() => setSelectedMonth(null)}
        title={`${getMonthName(selectedMonth)} Transactions`}
      >
        <div className="mt-4">
          {modalLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
             <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
               {/* We just use the raw DataTable, mapping the data correctly */}
               <DataTable 
                 data={monthTransactions} 
                 type="all" 
                 onDelete={async (id) => {
                   // Optional: enable deleting directly from this view
                   if (window.confirm("Delete this transaction?")) {
                      await api.deleteTransaction(id);
                      setMonthTransactions(prev => prev.filter(t => t.id !== id));
                   }
                 }} 
               />
             </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
