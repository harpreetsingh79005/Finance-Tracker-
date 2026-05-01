import React from 'react';
import { cn } from '../utils/cn';

export const Button = React.forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  const variants = {
    default: "bg-primary text-primary-foreground hover:brightness-110 hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all duration-300",
    destructive: "bg-destructive text-destructive-foreground hover:brightness-110 hover:shadow-[0_0_20px_rgba(244,63,94,0.5)] transition-all duration-300",
    outline: "border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-300",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-300",
    ghost: "hover:bg-primary/10 hover:text-primary transition-all duration-300",
    link: "text-primary underline-offset-4 hover:underline",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});
Button.displayName = "Button";
