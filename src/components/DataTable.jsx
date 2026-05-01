import React from 'react';
import { format, parseISO } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { cn } from '../utils/cn';
import { formatCurrency } from '../utils/format';

export function DataTable({ data, type, onDelete }) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-xl border-dashed">
        <p className="text-muted-foreground">No {type} transactions found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border-0 rounded-2xl bg-card/30 backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="text-xs text-muted-foreground bg-black/20 uppercase border-b border-border/50">
          <tr>
            <th className="px-6 py-5 font-semibold tracking-wider">Date</th>
            <th className="px-6 py-5 font-semibold tracking-wider">{type === 'income' ? 'Source' : 'Description'}</th>
            <th className="px-6 py-5 font-semibold tracking-wider">Category</th>
            <th className="px-6 py-5 font-semibold tracking-wider text-right">Amount</th>
            <th className="px-6 py-5 font-semibold tracking-wider text-right w-16"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          {data.map((row) => (
            <tr key={row.id} className="group hover:bg-white/[0.02] transition-colors duration-300">
              <td className="px-6 py-4 whitespace-nowrap text-muted-foreground relative">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
                {format(parseISO(row.date), 'MMM dd, yyyy')}
              </td>
              <td className="px-6 py-4 font-medium text-foreground">
                {type === 'income' ? row.source : row.description}
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground border border-primary/20">
                  {row.category}
                </span>
              </td>
              <td className={cn(
                "px-6 py-4 text-right font-medium tracking-wide",
                type === 'income' ? "text-success drop-shadow-[0_0_8px_rgba(16,185,129,0.2)]" : "text-foreground"
              )}>
                {type === 'income' ? '+' : '-'}{formatCurrency(row.amount)}
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onDelete(row.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-md hover:bg-destructive/10"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

