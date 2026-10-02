import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock,
  DollarSign,
  Inbox,
  MapPin,
  Radio,
  Star,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { ServiceIcon } from "@/components/ServiceIcon";
import { Button } from "@/components/Button";
import { partnerApi, requestApi } from "@/services/api";
import { usePartnerWorkspace } from "@/hooks/usePartnerWorkspace";
import { inr } from "@/utils/helpers";
import { isAssignedPartnerRequest, partnerActiveStatuses } from "@/utils/partnerData";

export function MechanicDashboard() {
  const navigate = useNavigate();
  const { profile, requests, services, loading, error, refresh } = usePartnerWorkspace();
  const [actionError, setActionError] = useState("");
  const [availabilitySaving, setAvailabilitySaving] = useState(false);
  const [pendingRequestId, setPendingRequestId] = useState("");
  const isOnline = Boolean(profile?.availability);
  const incomingRequests = requests.filter(
    (request) => request.status === "REQUESTED" && !isAssignedPartnerRequest(request),
  );
  const assignedRequests = requests.filter(isAssignedPartnerRequest);
  const activeJob = assignedRequests.find((request) => partnerActiveStatuses.includes(request.status));
  const completedJobs = assignedRequests.filter((request) => request.status === "COMPLETED");
  const today = new Date().toDateString();
  const todaysJobs = completedJobs.filter(
    (request) => new Date(request.completedAt || request.updatedAt || request.createdAt).toDateString() === today,
  );
  const todayEarnings = todaysJobs.reduce((total, job) => total + job.amount, 0);
  const terminalJobs = assignedRequests.filter((request) => ["COMPLETED", "CANCELLED"].includes(request.status));
  const successRate = terminalJobs.length
    ? `${((completedJobs.length / terminalJobs.length) * 100).toFixed(1)}%`
    : "—";
  const ratedCount = Number(profile?.ratingCount || 0);
  const arrivalRequests = assignedRequests.filter((request) => request.estimatedArrivalTime > 0);
  const averageArrival = arrivalRequests.length
    ? `${(
        arrivalRequests.reduce((total, request) => total + request.estimatedArrivalTime, 0) /
        arrivalRequests.length
      ).toFixed(1)} mins`
    : "—";
  const categoryNames = (profile?.serviceCategories || [])
    .map((id) => services.find((service) => service.id === id)?.name || id)
    .join(", ");

  const handleAccept = async (request) => {
    setPendingRequestId(request.id);
    setActionError("");
    try {
      await requestApi.accept(request.id);
      navigate(`/mechanic/active-job?requestId=${request.id}`);
    } catch (requestError) {
      setActionError(requestError.message || "Unable to accept this request.");
    } finally {
      setPendingRequestId("");
    }
  };

  const handlePass = async (requestId) => {
    setPendingRequestId(requestId);
    setActionError("");
    try {
      await requestApi.pass(requestId);
      await refresh();
    } catch (requestError) {
      setActionError(requestError.message || "Unable to pass this request.");
    } finally {
      setPendingRequestId("");
    }
  };

  const handleAvailabilityChange = async () => {
    setAvailabilitySaving(true);
    setActionError("");
    try {
      await partnerApi.updateAvailability(!isOnline);
      await refresh();
    } catch (requestError) {
      setActionError(requestError.message || "Unable to update your availability.");
    } finally {
      setAvailabilitySaving(false);
    }
  };

  return (
    <DashboardLayout role="mechanic">
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                {profile?.businessName || profile?.name || ""}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-info/15 text-info px-2 py-0.5 text-xs font-semibold">
                <BadgeCheck className="h-3.5 w-3.5" />
                {profile?.isVerified ? "Verified Unit" : "Verification Pending"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Service Hub: {profile?.businessArea || "Not set"} · Services: {categoryNames || "Not set"}
            </p>
          </div>

          <div className="surface-card flex items-center gap-3 px-4 py-2 self-start sm:self-auto">
            <div className="flex items-center gap-2">
              <span
                className={`h-3 w-3 rounded-full ${
                  isOnline ? "bg-success animate-pulse" : "bg-muted-foreground"
                }`}
              />
              <span className="text-sm font-semibold">
                {isOnline ? "Duty: Available for Jobs" : "Duty: Offline"}
              </span>
            </div>
            <button
              type="button"
              onClick={handleAvailabilityChange}
              disabled={availabilitySaving || loading}
              aria-label={isOnline ? "Go offline" : "Go online"}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isOnline ? "bg-success" : "bg-muted"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                  isOnline ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {(error || actionError) && (
          <p className="text-sm text-destructive" role="alert">
            {actionError || error}
          </p>
        )}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Pending Requests" value={String(incomingRequests.length)} icon={Inbox} tone={incomingRequests.length ? "accent" : "neutral"} />
          <StatCard label="Today's Earnings" value={inr(todayEarnings)} icon={DollarSign} tone="success" hint={`${todaysJobs.length} dispatches`} />
          <StatCard label="Active Job" value={`${assignedRequests.filter((request) => partnerActiveStatuses.includes(request.status)).length} Running`} icon={Radio} tone="accent" />
          <StatCard label="Job Success" value={successRate} icon={CheckCircle2} tone="success" />
          <StatCard label="Customer Rating" value={`${Number(profile?.rating || 0).toFixed(1)} / 5`} icon={Star} hint={`${ratedCount} reviews`} />
          <StatCard label="Avg Arrival" value={averageArrival} icon={Clock} hint="Based on recorded jobs" />
        </section>

        {activeJob && (
          <section className="surface-card bg-primary text-primary-foreground p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs uppercase font-bold tracking-widest text-accent">Active Mission</span>
              <h3 className="font-display text-xl font-bold">
                Dispatch {activeJob.requestCode}: {activeJob.customer} ({activeJob.vehicleName})
              </h3>
              <p className="text-xs text-primary-foreground/80">
                {activeJob.serviceLabel} at {activeJob.location}
              </p>
            </div>
            <Link to={`/mechanic/active-job?requestId=${activeJob.id}`} className="shrink-0">
              <Button variant="accent" size="lg">
                Open Job Console <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold">New Incoming Dispatches Nearby</h2>
            <Link to="/mechanic/requests">
              <Button variant="ghost" size="sm">View all ({incomingRequests.length})</Button>
            </Link>
          </div>
          {incomingRequests.length === 0 ? (
            <div className="surface-card p-8 text-center text-muted-foreground text-sm">
              No new requests at the moment. Keep your duty toggle online to receive nearby calls.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {incomingRequests.map((request) => (
                <div key={request.id} className="surface-card p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                        <ServiceIcon service={request.service} />
                      </span>
                      <div>
                        <h4 className="font-display font-bold text-base">{request.customer}</h4>
                        <p className="text-xs text-muted-foreground">
                          {request.vehicleName} · {request.registration}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-lg">{inr(request.amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {request.distanceKm === null ? "Distance unavailable" : `${request.distanceKm.toFixed(1)} km away`}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{request.location}</span>
                  </div>
                  {request.notes && (
                    <p className="text-xs bg-secondary/50 p-2.5 rounded-lg text-foreground italic">
                      "{request.notes}"
                    </p>
                  )}
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handlePass(request.id)}
                      disabled={pendingRequestId === request.id}
                    >
                      Pass
                    </Button>
                    <Button
                      variant="accent"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAccept(request)}
                      disabled={pendingRequestId === request.id}
                    >
                      Accept Job
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold">Recent Completed Jobs</h2>
            <Link to="/mechanic/history">
              <Button variant="ghost" size="sm">View history</Button>
            </Link>
          </div>
          <div className="surface-card overflow-hidden">
            <div className="divide-y divide-border">
              {completedJobs.slice(0, 4).map((job) => (
                <div key={job.id} className="p-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                  <div>
                    <p className="font-semibold text-foreground">{job.vehicleName}</p>
                    <p className="text-xs text-muted-foreground">
                      {job.requestCode} · {job.customer} · {job.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-display font-bold text-base">{inr(job.amount)}</span>
                    <StatusBadge status={job.statusLabel} />
                  </div>
                </div>
              ))}
              {!loading && completedJobs.length === 0 && (
                <p className="p-6 text-center text-sm text-muted-foreground">No completed jobs yet.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default MechanicDashboard;
