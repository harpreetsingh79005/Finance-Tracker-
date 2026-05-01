import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { DataTable } from '../components/DataTable';
import { Wallet, TrendingUp, TrendingDown, Calendar as CalendarIcon } from 'lucide-react';
import { format, subMonths, addMonths } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/format';

export function DashboardView() {
  const { 
    monthlyTransactions, 
    totals, 
    walletTotal,
    deleteTransaction,
    selectedMonth,
    setSelectedMonth
  } = useFinance();

  const handlePrevMonth = () => setSelectedMonth(subMonths(selectedMonth, 1));
  const handleNextMonth = () => setSelectedMonth(addMonths(selectedMonth, 1));

  // Prepare data for the quick chart
  const incomeTotal = totals.income;
  const expenseTotal = totals.expenses;
  const chartData = [
    { name: 'Income', amount: incomeTotal, fill: 'var(--success)' },
    { name: 'Expenses', amount: expenseTotal, fill: 'var(--destructive)' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Here's your financial overview.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-card border rounded-lg p-1">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-muted rounded-md transition-colors">&larr;</button>
          <div className="flex items-center gap-2 font-medium px-2 min-w-[120px] justify-center">
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            {format(selectedMonth, 'MMMM yyyy')}
          </div>
          <button onClick={handleNextMonth} className="p-2 hover:bg-muted rounded-md transition-colors">&rarr;</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Balance</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg shadow-[0_0_15px_rgba(139,92,246,0.15)]">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{formatCurrency(walletTotal)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Income</CardTitle>
            <div className="p-2 bg-success/10 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-success drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">+{formatCurrency(totals.income)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Expenses</CardTitle>
            <div className="p-2 bg-destructive/10 rounded-lg shadow-[0_0_15px_rgba(244,63,94,0.15)]">
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-destructive drop-shadow-[0_0_10px_rgba(244,63,94,0.3)]">-{formatCurrency(totals.expenses)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable 
              data={monthlyTransactions.slice(0, 5)} 
              type="mixed" 
              onDelete={deleteTransaction} 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)' }} />
                <Tooltip 
                  cursor={{fill: 'var(--muted)', opacity: 0.2}}
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', backdropFilter: 'blur(8px)', color: 'var(--foreground)' }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]} filter="url(#neonGlow)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
