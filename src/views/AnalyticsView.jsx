import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { formatCurrency } from '../utils/format';

export function AnalyticsView() {
  const { transactions, selectedMonth } = useFinance();

  const expenses = transactions.filter(t => t.type === 'expense' && isSameMonth(parseISO(t.date), selectedMonth));
  const incomes = transactions.filter(t => t.type === 'income' && isSameMonth(parseISO(t.date), selectedMonth));

  // Category breakdown
  const categoryDataMap = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + parseFloat(curr.amount);
    return acc;
  }, {});

  const categoryData = Object.keys(categoryDataMap).map(key => ({
    name: key,
    value: categoryDataMap[key]
  })).sort((a, b) => b.value - a.value);

  const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b'];

  // Monthly trends (Line chart over days of the selected month)
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(selectedMonth),
    end: endOfMonth(selectedMonth)
  });

  const trendDataMap = {};
  daysInMonth.forEach(day => {
    trendDataMap[format(day, 'yyyy-MM-dd')] = { name: format(day, 'dd MMM'), income: 0, expense: 0 };
  });

  [...incomes, ...expenses].forEach(t => {
    const parsedDate = parseISO(t.date);
    const dayStr = format(parsedDate, 'yyyy-MM-dd');
    if (trendDataMap[dayStr]) {
      if (t.type === 'income') trendDataMap[dayStr].income += parseFloat(t.amount);
      else trendDataMap[dayStr].expense += parseFloat(t.amount);
    }
  });

  const trendData = Object.values(trendDataMap);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Deep dive into your financial habits for {format(selectedMonth, 'MMMM yyyy')}.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Cash Flow Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
             <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <filter id="neonGlowLine" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', backdropFilter: 'blur(8px)', color: 'var(--foreground)' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" dataKey="income" stroke="var(--success)" strokeWidth={4} dot={false} filter="url(#neonGlowLine)" activeDot={{ r: 8, fill: 'var(--success)', stroke: 'var(--card)', strokeWidth: 2 }} />
                <Line type="monotone" dataKey="expense" stroke="var(--destructive)" strokeWidth={4} dot={false} filter="url(#neonGlowLine)" activeDot={{ r: 8, fill: 'var(--destructive)', stroke: 'var(--card)', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <filter id="neonGlowPie" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ filter: 'url(#neonGlowPie)' }} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', backdropFilter: 'blur(8px)', color: 'var(--foreground)' }}
                    formatter={(value) => formatCurrency(value)}
                    itemStyle={{ color: 'var(--foreground)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No expense data for this month.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Expenses</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4 mt-4">
              {categoryData.slice(0, 5).map((category, index) => (
                <div key={index} className="flex items-center justify-between group p-2 rounded-lg hover:bg-white/[0.02] transition-colors duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: COLORS[index % COLORS.length], color: COLORS[index % COLORS.length] }}></div>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <span className="text-muted-foreground font-medium group-hover:text-foreground transition-colors">{formatCurrency(category.value)}</span>
                </div>
              ))}
              {categoryData.length === 0 && (
                <div className="text-center text-muted-foreground py-8">No expenses found</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
