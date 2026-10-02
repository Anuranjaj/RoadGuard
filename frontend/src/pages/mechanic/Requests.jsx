import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Inbox, MapPin, Search } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { ServiceIcon } from "@/components/ServiceIcon";
import { Button } from "@/components/Button";
import { requestApi } from "@/services/api";
import { usePartnerWorkspace } from "@/hooks/usePartnerWorkspace";
import { inr } from "@/utils/helpers";
import { isAssignedPartnerRequest } from "@/utils/partnerData";

/**
 * Incoming Requests Page for Mechanics
 */
export function Requests() {
  const navigate = useNavigate();
  const { requests, loading, error, refresh } = usePartnerWorkspace();
  const [actionError, setActionError] = useState("");
  const [search, setSearch] = useState("");
  const requestList = requests.filter(
    (request) => request.status === "REQUESTED" && !isAssignedPartnerRequest(request),
  );

  const handleAccept = async (request) => {
    setActionError("");
    try {
      await requestApi.accept(request.id);
      navigate(`/mechanic/active-job?requestId=${request.id}`);
    } catch (requestError) {
      setActionError(requestError.message || "Unable to accept this request.");
    }
  };

  const handleReject = async (requestId) => {
    setActionError("");
    try {
      await requestApi.pass(requestId);
      await refresh();
    } catch (requestError) {
      setActionError(requestError.message || "Unable to pass this request.");
    }
  };

  const filtered = requestList.filter(
    (r) =>
      r.customer.toLowerCase().includes(search.toLowerCase()) ||
      r.vehicleName.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <DashboardLayout role="mechanic">
      <div className="space-y-6">
        <PageHeader
          title="Incoming Assistance Requests"
          description="Real-time roadside service dispatches matching your service categories and geographic zone."
        />

        {(error || actionError) && (
          <p className="text-sm text-destructive" role="alert">
            {actionError || error}
          </p>
        )}

        {/* Search bar */}
        <div className="surface-card p-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by customer, vehicle, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* List of Requests */}
        {filtered.length === 0 ? (
          <div className="surface-card p-12 text-center space-y-3">
            <Inbox className="h-10 w-10 mx-auto text-muted-foreground" />
            <h3 className="font-display text-lg font-bold">
              {loading ? "Loading incoming requests" : "No incoming requests"}
            </h3>
            <p className="text-xs text-muted-foreground">
              All nearby requests have been answered or no drivers are currently stranded in your
              area.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((req) => (
              <div
                key={req.id}
                className="surface-card p-5 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent/15 text-accent-foreground">
                        <ServiceIcon service={req.service} />
                      </span>
                      <div>
                        <h3 className="font-display text-base font-bold">{req.customer}</h3>
                          <p className="text-xs text-muted-foreground">{req.requestedAt}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg font-bold">{inr(req.amount)}</p>
                      <span className="text-xs text-muted-foreground">
                        {req.distanceKm === null ? "Distance unavailable" : `${req.distanceKm.toFixed(1)} km away`}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p className="font-medium text-foreground">
                      {req.vehicleName} ({req.registration}) · {req.serviceLabel}
                    </p>
                    <p className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {req.location}
                    </p>
                    {req.notes && (
                      <p className="bg-secondary/40 p-2 rounded-lg text-foreground italic mt-2">
                        "{req.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleReject(req.id)}
                  >
                    Pass
                  </Button>
                  <Button
                    variant="accent"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleAccept(req)}
                  >
                    Accept Dispatch
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
export default Requests;
