import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Car,
  CheckCircle2,
  Clock,
  History,
  Plus,
  Wallet,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/Button";
import { requestApi, serviceApi, vehicleApi } from "@/services/api";
import { inr, useSession } from "@/utils/helpers";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const quickActions = [
  { to: "/owner/vehicles", label: "My Vehicles", icon: Car },
  { to: "/owner/history", label: "Service History", icon: History },
  { to: "/owner/request-service", label: "Request Assistance", icon: Clock },
];

/**
 * Vehicle Owner Dashboard Overview
 */
export function OwnerDashboard() {
  const session = useSession();
  const firstName = (session?.name ?? "Driver").split(" ")[0];
  const [vehicles, setVehicles] = useState([]);
  const [requests, setRequests] = useState([]);
  const [serviceNames, setServiceNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    Promise.all([vehicleApi.list(), requestApi.list(), serviceApi.list()])
      .then(([vehicleResponse, requestResponse, serviceResponse]) => {
        if (!isActive) return;
        setVehicles(vehicleResponse.data || []);
        setRequests(requestResponse.data || []);
        setServiceNames(
          Object.fromEntries((serviceResponse.data || []).map((service) => [service.id, service.name])),
        );
      })
      .catch((loadError) => {
        if (isActive) setError(loadError.message || "Unable to load dashboard data.");
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const recent = useMemo(() => {
    return [...requests]
      .sort((a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0))
      .slice(0, 3)
      .map((request) => ({
        id: request._id || request.id,
        service: serviceNames[request.serviceCategory] || request.serviceCategory || "Service",
        vehicle: request.vehicle?.name || "Vehicle",
        partner: request.assignedPartner?.businessName || request.assignedPartner?.name || "Partner unassigned",
        date: request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "Date unavailable",
        amount: Number(request.price || 0),
        status: request.status,
      }));
  }, [requests, serviceNames]);

  const activeRequests = requests.filter((request) => !["COMPLETED", "CANCELLED"].includes(request.status));
  const totalSpend = requests.reduce((total, request) => total + Number(request.price || 0), 0);
  const vehicleCount = vehicles.length;

  return (
    <DashboardLayout role="owner">
      <div className="space-y-8">
        <PageHeader
          title={`${getGreeting()}, ${firstName}`}
          description="Need roadside assistance? Help is a tap away — verified partners reach you in minutes."
        />

        {/* Emergency Assistance Banner */}
        <section className="overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-lg">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground/70">
                Emergency
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
                Stuck on the road right now?
              </h2>
              <p className="mt-2 text-sm text-primary-foreground/80">
                Share your location and compare nearby verified mechanics and towing partners with
                live ETA and upfront pricing.
              </p>
            </div>
            <Link to="/owner/request-service" className="shrink-0">
              <Button variant="emergency" size="xl" className="w-full sm:w-auto">
                Request Assistance <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {(error || loading) && (
          <div className="surface-card p-4 text-sm text-muted-foreground">
            {loading ? "Loading your RoadGuard activity..." : error}
          </div>
        )}

        {/* 4 Summary Metric Cards */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Vehicles registered" value={String(vehicleCount)} icon={Car} />
          <StatCard label="Active requests" value={String(activeRequests.length)} icon={CheckCircle2} tone="success" hint={activeRequests.length ? "Real-time request activity" : "No active service requests"} />
          <StatCard label="Average arrival" value="--" icon={Clock} tone="accent" />
          <StatCard label="Total spend" value={inr(totalSpend)} icon={Wallet} />
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="font-display text-lg font-semibold">Quick actions</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {quickActions.map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="surface-card flex items-center gap-3 p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-float)]"
              >
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/8 text-primary">
                  <a.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold">{a.label}</span>
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>

        {/* My Vehicles Section */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">My vehicles</h2>
            <Link to="/owner/vehicles">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4" /> Manage
              </Button>
            </Link>
          </div>
          <div className="mt-3">
            {vehicles.length === 0 ? (
              <div className="surface-card p-8 text-center">
                <p className="text-sm text-muted-foreground">No vehicles added yet.</p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {vehicles.map((vehicle) => (
                  <div key={vehicle._id || vehicle.id} className="surface-card p-4">
                    <p className="font-display text-base font-bold">{vehicle.name}</p>
                    <p className="text-xs text-muted-foreground">{vehicle.registration}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{vehicle.type}</span>
                      <span>{vehicle.fuel}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Recent Services List */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent services</h2>
            <Link to="/owner/history">
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          </div>
          <ul className="mt-3 space-y-3">
            {recent.length === 0 ? (
              <li className="surface-card p-6 text-center text-sm text-muted-foreground">
                No completed services yet.
              </li>
            ) : (
              recent.map((h) => (
                <li key={h.id} className="surface-card flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{h.service}</p>
                    <p className="text-xs text-muted-foreground">{h.id} · {h.vehicle} · {h.partner}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{h.date}</p>
                  <p className="font-display text-base font-bold">{inr(h.amount)}</p>
                  <StatusBadge status={h.status} />
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </DashboardLayout>
  );
}
export default OwnerDashboard;
