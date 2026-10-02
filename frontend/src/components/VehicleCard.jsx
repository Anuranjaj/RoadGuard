import React from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/Button";
import { StatusBadge } from "@/components/StatusBadge";

/**
 * Card representing a Registered Vehicle
 */
export function VehicleCard({ vehicle, onDelete, onEdit }) {
  return (
    <article className="surface-card overflow-hidden transition-shadow hover:shadow-[var(--shadow-float)]">
      <img
        src={vehicle.image}
        alt={`${vehicle.name} in ${vehicle.color}`}
        loading="lazy"
        className="h-40 w-full object-cover"
      />
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-semibold">{vehicle.name}</h3>
            <p className="text-sm font-medium text-muted-foreground">{vehicle.registration}</p>
          </div>
          <StatusBadge status={vehicle.type} />
        </div>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Fuel</dt>
            <dd className="font-medium">{vehicle.fuel}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Last service</dt>
            <dd className="font-medium">{vehicle.lastService}</dd>
          </div>
        </dl>
        <div className="flex gap-2 pt-1">
          <Link to="/owner/history" className="flex-1">
            <Button size="sm" variant="secondary" className="w-full">
              <Eye className="h-4 w-4" /> View
            </Button>
          </Link>
          <Button size="sm" variant="outline" className="flex-1" onClick={onEdit}>
            <Pencil className="h-4 w-4" /> Edit
          </Button>
          {onDelete && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              aria-label={`Delete ${vehicle.name}`}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
