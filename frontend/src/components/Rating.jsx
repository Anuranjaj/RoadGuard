import React from "react";
import { Star } from "lucide-react";

/**
 * Display a numeric star rating with review count
 */
export function Rating({ value, reviews }) {
  const numericValue = typeof value === "number" ? value : 0;
  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold">
      <Star className="h-4 w-4 fill-accent text-accent" aria-hidden="true" />
      {numericValue.toFixed(1)}
      {reviews !== undefined && (
        <span className="font-normal text-muted-foreground">({reviews})</span>
      )}
      <span className="sr-only">out of 5 stars</span>
    </span>
  );
}
