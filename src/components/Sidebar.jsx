import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowDownCircle, ArrowUpCircle, PieChart, Wallet as WalletIcon, Moon, Sun, LogOut, CalendarDays } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

export function Sidebar() {
  const { theme, toggleTheme } = useFinance();
  const { logout } = useAuth();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/wallet', icon: WalletIcon, label: 'My Wallet' },
    { to: '/income', icon: ArrowDownCircle, label: 'Income' },
    { to: '/expenses', icon: ArrowUpCircle, label: 'Expenses' },
    { to: '/analytics', icon: PieChart, label: 'Analytics' },
    { to: '/monthly-stats', icon: CalendarDays, label: 'Monthly Stats' },
  ];

  return (
    <div className="w-64 h-screen border-r border-border/50 bg-card/50 backdrop-blur-xl flex flex-col hidden md:flex sticky top-0 z-20">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 shadow-[0_0_20px_rgba(139,92,246,0.6)] flex items-center justify-center">
          <WalletIcon className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">Finance.</h1>
      </div>
      
      <div className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 text-sm font-medium relative group",
              isActive 
                ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(139,92,246,0.15)]" 
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="p-4 mt-auto border-t border-border/50 space-y-2">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md transition-colors text-sm font-medium text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md transition-colors text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </div>
  );
}
