import React from "react";
import { BadgeCheck, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/Button";
import { Rating } from "@/components/Rating";
import { StatusBadge } from "@/components/StatusBadge";
import { inr } from "@/utils/helpers";

/**
 * Card representing a Service Partner / Mechanic
 */
export function PartnerCard({ partner, onSelect, selected }) {
  return (
    <article
      className={`surface-card p-5 transition-all ${
        selected ? "ring-2 ring-accent" : "hover:shadow-[var(--shadow-float)]"
      }`}
    >
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">
          {partner.photo}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="font-display text-base font-semibold">{partner.name}</h3>
            {partner.verified && (
              <BadgeCheck className="h-4.5 w-4.5 text-info" aria-label="Verified partner" />
            )}
            <StatusBadge status={partner.available ? "Available" : "Busy"} className="ml-auto" />
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {typeof partner.rating === "number" && (
              <Rating value={partner.rating} reviews={partner.reviews || 0} />
            )}
            {typeof partner.jobs === "number" && (
              <span>{partner.jobs.toLocaleString("en-IN")} jobs</span>
            )}
            {typeof partner.distanceKm === "number" && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {partner.distanceKm.toFixed(1)} km
              </span>
            )}
            {typeof partner.etaMinutes === "number" && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {partner.etaMinutes} min
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Estimated price</p>
              <p className="font-display text-lg font-bold">{inr(partner.price)}</p>
            </div>
            {onSelect && (
              <Button
                variant={selected ? "default" : "accent"}
                onClick={onSelect}
                disabled={!partner.available}
              >
                {selected ? "Selected" : "Request This Partner"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
