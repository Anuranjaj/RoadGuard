import React from "react";
import { cn } from "@/utils/helpers";

/**
 * Section Title component for landing / public pages
 */
export function SectionTitle({ eyebrow, title, description, center = false, className = "" }) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-foreground/80">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-base text-muted-foreground">{description}</p>}
    </div>
  );
}
