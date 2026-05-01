import React from 'react';
import { cn } from '../utils/cn';

export function Card({ className, children, ...props }) {
  return (
    <div 
      className={cn(
        "bg-card text-card-foreground rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-[0_8px_30px_rgba(139,92,246,0.12)] hover:border-primary/30 relative overflow-hidden group",
        className
      )} 
      {...props}
    >
      {/* Subtle top highlight for glass effect */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn("font-semibold leading-none tracking-tight", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  );
}
