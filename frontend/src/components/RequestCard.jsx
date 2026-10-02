import React from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Button } from "@/components/Button";
import { ServiceIcon } from "@/components/ServiceIcon";
import { inr } from "@/utils/helpers";
import { serviceById } from "@/data/mockData";

/**
 * Card representing an incoming or active service request for mechanics
 */
export function RequestCard({
  id,
  customer,
  vehicle,
  service,
  distanceKm,
  location,
  price,
  requestedAt,
  onAccept,
  onReject,
  detailsLink,
}) {
  return (
    <article className="surface-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent/15 text-accent-foreground">
            <ServiceIcon service={service} />
          </span>
          <div>
            <h3 className="font-display text-base font-semibold">{customer}</h3>
            <p className="text-sm text-muted-foreground">
              {vehicle} · {serviceById(service).name}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-display text-lg font-bold">{inr(price)}</p>
          <p className="text-xs text-muted-foreground">{requestedAt}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          {location}
        </span>
        <span>{distanceKm} km away</span>
        <span className="font-medium text-foreground">{id}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {onAccept && (
          <Button size="sm" variant="accent" onClick={onAccept}>
            Accept
          </Button>
        )}
        {onReject && (
          <Button size="sm" variant="outline" onClick={onReject}>
            Reject
          </Button>
        )}
        {detailsLink && (
          <Link to={detailsLink}>
            <Button size="sm" variant="ghost">
              View details
            </Button>
          </Link>
        )}
      </div>
    </article>
  );
}
