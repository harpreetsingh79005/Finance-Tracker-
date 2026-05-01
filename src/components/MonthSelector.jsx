import React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, subMonths, addMonths } from 'date-fns';
import { useFinance } from '../context/FinanceContext';

export function MonthSelector() {
  const { selectedMonth, setSelectedMonth } = useFinance();

  const handlePrevMonth = () => setSelectedMonth(subMonths(selectedMonth, 1));
  const handleNextMonth = () => setSelectedMonth(addMonths(selectedMonth, 1));

  return (
    <div className="flex items-center gap-2 bg-card border border-border/50 rounded-xl p-1 shadow-sm">
      <button 
        onClick={handlePrevMonth} 
        className="p-2 hover:bg-muted/80 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Previous month"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      
      <div className="flex items-center gap-2 font-medium px-4 min-w-[140px] justify-center text-sm">
        <CalendarIcon className="w-4 h-4 text-primary" />
        {format(selectedMonth, 'MMMM yyyy')}
      </div>
      
      <button 
        onClick={handleNextMonth} 
        className="p-2 hover:bg-muted/80 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Next month"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
