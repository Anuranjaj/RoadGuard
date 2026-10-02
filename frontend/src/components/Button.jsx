import React from "react";
import { cn } from "@/utils/helpers";

/**
 * Standard reusable Button component supporting variants and sizes
 */
export function Button({
  children,
  className = "",
  variant = "default",
  size = "md",
  type = "button",
  disabled = false,
  onClick,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
    accent:
      "bg-accent text-accent-foreground hover:bg-accent/90 shadow-[var(--shadow-accent)] font-semibold",
    emergency:
      "bg-accent text-accent-foreground hover:bg-accent/90 font-bold shadow-[var(--shadow-accent)] pulse-emergency",
    outline: "border border-border bg-background hover:bg-secondary text-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-secondary text-foreground",
    danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs rounded-lg",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-6 text-base",
    xl: "h-12 px-6 text-base font-semibold",
    icon: "h-9 w-9 p-0 rounded-lg",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        baseStyles,
        variants[variant] || variants.default,
        sizes[size] || sizes.md,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
