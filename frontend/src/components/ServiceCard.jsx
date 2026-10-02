import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ServiceIcon } from "@/components/ServiceIcon";
import { Button } from "@/components/Button";
import { inr, isAuthenticatedSession, useSession } from "@/utils/helpers";

/**
 * Card representing a Roadside Service category
 */
export function ServiceCard({ service, onRequest }) {
  const navigate = useNavigate();
  const session = useSession();

  const handleRequest = () => {
    if (onRequest) {
      onRequest();
      return;
    }

    if (isAuthenticatedSession(session)) {
      navigate("/owner/request-service");
      return;
    }

    navigate("/login");
  };

  return (
    <article className="surface-card group flex flex-col gap-3 p-6 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-float)]">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
        <ServiceIcon service={service.id} className="h-6 w-6" />
      </span>
      <h3 className="font-display text-lg font-semibold">{service.name}</h3>
      <p className="text-sm text-muted-foreground">{service.description}</p>
      <div className="mt-auto flex items-center justify-between pt-3">
        <div>
          <p className="text-xs text-muted-foreground">Starting from</p>
          <p className="font-display text-lg font-bold">{inr(service.basePrice)}</p>
        </div>
        {onRequest ? (
          <Button size="sm" onClick={onRequest}>
            Request Service
          </Button>
        ) : (
          <Button size="sm" onClick={handleRequest}>Request Service</Button>
        )}
      </div>
    </article>
  );
}
