import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Compass,
  MapPin,
  Phone,
  Wrench,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { StatusBadge } from "@/components/StatusBadge";
import { inr } from "@/utils/helpers";
import { requestApi, serviceApi } from "@/services/api";

const statusLabels = {
  REQUESTED: "Request submitted",
  PARTNER_ACCEPTED: "Partner accepted",
  PARTNER_ARRIVING: "Partner on the way",
  PARTNER_ARRIVED: "Partner arrived",
  SERVICE_IN_PROGRESS: "Service in progress",
  COMPLETED: "Service completed",
  CANCELLED: "Request cancelled",
};

const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : "Not available");

/**
 * Live Roadside Assistance Tracking Page
 */
export function Tracking() {
  const [searchParams] = useSearchParams();
  const requestedId = searchParams.get("requestId");
  const [request, setRequest] = useState(null);
  const [serviceNames, setServiceNames] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const loadTrackingData = useCallback(async () => {
    try {
      const [requestResponse, serviceResponse] = await Promise.all([
        requestApi.list(),
        serviceApi.list(),
      ]);
      const requests = requestResponse.data || [];
      const activeRequest = requestedId
        ? requests.find((item) => item._id === requestedId)
        : requests.find((item) => !["COMPLETED", "CANCELLED"].includes(item.status));
      setRequest(activeRequest || null);
      setServiceNames(
        Object.fromEntries((serviceResponse.data || []).map((service) => [service.id, service.name])),
      );
      setError("");
    } catch (loadError) {
      setError(loadError.message || "Unable to load live assistance details.");
    } finally {
      setIsLoading(false);
    }
  }, [requestedId]);

  useEffect(() => {
    loadTrackingData();
    const interval = window.setInterval(loadTrackingData, 15000);
    return () => window.clearInterval(interval);
  }, [loadTrackingData]);

  const handleCancelRequest = async () => {
    if (!request || isCancelling) return;
    setIsCancelling(true);
    setCancelError("");
    try {
      await requestApi.cancel(request._id, { reason: "Cancelled by owner" });
      setCancelOpen(false);
      await loadTrackingData();
    } catch (cancelRequestError) {
      setCancelError(cancelRequestError.message || "Unable to cancel this request.");
    } finally {
      setIsCancelling(false);
    }
  };

  const partner = request?.assignedPartner;
  const vehicle = request?.vehicle;
  const serviceName = serviceNames[request?.serviceCategory] || request?.serviceCategory || "Service";
  const partnerCoordinates = partner?.location?.coordinates;
  const partnerLocation = partnerCoordinates?.length === 2
    ? `${partnerCoordinates[1]}, ${partnerCoordinates[0]}`
    : null;
  const canCancel = request && !["COMPLETED", "CANCELLED"].includes(request.status);

  return (
    <DashboardLayout role="owner">
      <div className="space-y-6">
        <PageHeader
          title="Live Assistance Tracking"
          description={request
            ? `Tracking request ${(request._id || "").slice(-8)} for ${vehicle?.name || "your vehicle"} (${vehicle?.registration || "registration unavailable"})`
            : "Live status for your current roadside assistance request."}
          action={
            request && (
              <div className="flex items-center gap-2">
                {canCancel && (
                  <Button variant="outline" size="sm" onClick={() => setCancelOpen(true)}>
                    Cancel Request
                  </Button>
                )}
                {partner?.phone && (
                  <a href={`tel:${partner.phone}`}>
                    <Button size="sm" variant="accent">
                      <Phone className="h-4 w-4" /> Call Partner
                    </Button>
                  </a>
                )}
              </div>
            )
          }
        />

        {isLoading && (
          <div className="surface-card p-8 text-center text-sm text-muted-foreground">
            Loading assistance details...
          </div>
        )}
        {error && (
          <div className="surface-card p-6 text-sm text-destructive" role="alert">
            {error}{request ? " Showing the last available request data." : ""}
          </div>
        )}
        {!isLoading && !request && !error && (
          <div className="surface-card p-12 text-center space-y-3">
            <Compass className="h-10 w-10 mx-auto text-muted-foreground" />
            <h2 className="font-display text-lg font-bold">No active assistance request</h2>
            <p className="text-sm text-muted-foreground">
              Submit a roadside assistance request to see its live status here.
            </p>
            <Link to="/owner/request-service">
              <Button variant="accent">
                Request Assistance <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}

        {request && (
          <>

        {/* Current persisted request status */}
        <section className="surface-card p-6 flex flex-wrap items-center justify-between gap-4 bg-primary text-primary-foreground">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-accent-foreground font-bold">
              <Compass className="h-6 w-6 animate-spin" />
            </span>
            <div>
              <p className="text-xs uppercase font-bold tracking-widest text-primary-foreground/70">
                Current Status
              </p>
              <h2 className="font-display text-xl font-bold">
                {statusLabels[request.status] || request.status}
              </h2>
              <p className="text-xs text-primary-foreground/80">
                Last updated {formatDateTime(request.updatedAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-primary-foreground/70">Service</p>
              <p className="font-display text-lg font-bold text-accent">{serviceName}</p>
            </div>
            <div className="text-right border-l border-primary-foreground/20 pl-6">
              <p className="text-xs text-primary-foreground/70">Request ID</p>
              <p className="font-display text-lg font-bold">{(request._id || "").slice(-8)}</p>
            </div>
          </div>
        </section>

        {/* Main Grid: Radar Map + Timeline */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left 7 Cols: Persisted request locations */}
          <div className="lg:col-span-7 space-y-4">
            <div className="surface-card min-h-[480px] p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-display text-base font-bold">Pickup location</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {request.pickupLocation || "Pickup address unavailable"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {Number.isFinite(request.latitude) && Number.isFinite(request.longitude)
                    ? `${request.latitude}, ${request.longitude}`
                    : "Coordinates unavailable"}
                </p>
              </div>
              {Number.isFinite(request.latitude) && Number.isFinite(request.longitude) && (
                <a
                  href={`https://maps.google.com/?q=${request.latitude},${request.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  <MapPin className="h-4 w-4" /> Open pickup location in Maps
                </a>
              )}
              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-semibold">Partner location</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  {partnerLocation || (partner ? "Partner coordinates unavailable" : "Waiting for a partner assignment")}
                </p>
              </div>
            </div>

            {/* Assigned partner */}
            <div className="surface-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-primary font-display font-bold text-primary-foreground">
                  {partner
                    ? (partner.businessName || partner.name || "P").slice(0, 1).toUpperCase()
                    : <Wrench className="h-5 w-5" />}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display font-bold">
                      {partner?.businessName || partner?.name || "No partner assigned"}
                    </h3>
                    {partner?.isVerified && <BadgeCheck className="h-4 w-4 text-info" />}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {partner ? partner.name : "Partner details will appear after assignment"}
                  </p>
                </div>
              </div>

              {partner?.phone && (
                <a href={`tel:${partner.phone}`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  <Phone className="h-4 w-4" /> {partner.phone}
                </a>
              )}
            </div>
          </div>

          {/* Right 5 Cols: Request details */}
          <div className="lg:col-span-5 space-y-4">
            <div className="surface-card p-6">
              <h3 className="font-display text-base font-bold mb-4">Request details</h3>
              <dl className="space-y-4 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Vehicle</dt>
                  <dd className="text-right font-medium">
                    {vehicle?.name || "Vehicle unavailable"} {vehicle?.registration ? `(${vehicle.registration})` : ""}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Service</dt>
                  <dd className="text-right font-medium">{serviceName}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Submitted</dt>
                  <dd className="text-right font-medium">{formatDateTime(request.createdAt)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Problem</dt>
                  <dd className="max-w-[65%] text-right font-medium">
                    {request.description || "No description provided"}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Persisted estimate */}
            <div className="surface-card p-5 space-y-3">
              <div className="flex justify-between items-center text-sm border-b border-border pb-3">
                <span className="text-muted-foreground">Request estimate</span>
                <span className="font-display text-base font-bold">{inr(Number(request.price) || 0)}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-border pb-3">
                <span className="text-muted-foreground">Request status</span>
                <StatusBadge status={request.status} />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Last refreshed</span>
                <span className="text-xs font-medium text-foreground">Every 15 seconds</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        <Modal
          isOpen={cancelOpen}
          onClose={() => setCancelOpen(false)}
          title="Cancel Assistance Request?"
          description="Are you sure you want to cancel this assistance request?"
          maxWidth="max-w-sm"
          footer={
            <>
              <Button variant="ghost" onClick={() => setCancelOpen(false)} disabled={isCancelling}>
                Keep Request
              </Button>
              <Button variant="danger" onClick={handleCancelRequest} disabled={isCancelling}>
                {isCancelling ? "Cancelling..." : "Cancel Request"}
              </Button>
            </>
          }
        >
          {cancelError ? (
            <p className="text-sm text-destructive" role="alert">{cancelError}</p>
          ) : (
            <div className="rounded-xl bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>This will update the request status in your account.</span>
            </div>
          )}
        </Modal>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
export default Tracking;
