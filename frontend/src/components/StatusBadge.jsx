import React from "react";
import { cn } from "@/utils/helpers";

const toneClasses = {
  neutral: "bg-muted text-muted-foreground border-border",
  success: "bg-success/12 text-success border-success/25",
  warning: "bg-warning/18 text-warning-foreground border-warning/35",
  danger: "bg-destructive/12 text-destructive border-destructive/25",
  info: "bg-info/12 text-info border-info/25",
  accent: "bg-accent/18 text-accent-foreground border-accent/35",
};

const statusTone = {
  Completed: "success",
  completed: "success",
  Paid: "success",
  Active: "success",
  Verified: "success",
  verified: "success",
  Available: "success",
  Resolved: "success",
  Pending: "warning",
  pending: "warning",
  Due: "warning",
  "Under Review": "warning",
  searching: "warning",
  new: "accent",
  assigned: "info",
  travelling: "info",
  started: "info",
  Open: "danger",
  Cancelled: "danger",
  cancelled: "danger",
  Suspended: "danger",
  Rejected: "danger",
  rejected: "danger",
  Busy: "danger",
};

/**
 * Standard StatusBadge indicating status with a colored dot and border
 */
export function StatusBadge({ status, label, className = "" }) {
  const tone = statusTone[status] || "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize",
        toneClasses[tone],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {label || status}
    </span>
  );
}
