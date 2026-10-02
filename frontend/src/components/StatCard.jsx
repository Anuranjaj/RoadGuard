import React from "react";
import { cn } from "@/utils/helpers";

/**
 * Metric card displaying value, icon, label and optional hint
 */
export function StatCard({ label, value, icon: Icon, hint, tone = "neutral" }) {
  const ring =
    tone === "accent"
      ? "bg-accent/15 text-accent-foreground"
      : tone === "success"
        ? "bg-success/12 text-success"
        : tone === "danger"
          ? "bg-destructive/12 text-destructive"
          : "bg-primary/8 text-primary";

  return (
    <div className="surface-card p-5 transition-shadow hover:shadow-[var(--shadow-float)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <span className={cn("grid h-9 w-9 place-items-center rounded-lg", ring)}>
            <Icon className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
