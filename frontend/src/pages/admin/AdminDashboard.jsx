import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  DollarSign,
  Radio,
  ShieldAlert,
  Users,
  Wrench,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/Button";
import { adminApi } from "@/services/api";
import { inr } from "@/utils/helpers";

const PIE_COLORS = [
  "oklch(0.29 0.075 262)",
  "oklch(0.76 0.165 62)",
  "oklch(0.63 0.145 152)",
  "oklch(0.62 0.12 245)",
  "oklch(0.58 0.222 25)",
];

/**
 * Administrator Master Dashboard Overview
 */
export function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [pendingPartners, setPendingPartners] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([adminApi.metrics(), adminApi.partners(), adminApi.complaints()])
      .then(([metricsResponse, partnersResponse, complaintsResponse]) => {
        setMetrics(metricsResponse.data);
        setPendingPartners(partnersResponse.data.filter((partner) => partner.status === "pending"));
        setComplaints(complaintsResponse.data.filter((complaint) => complaint.status !== "RESOLVED").slice(0, 5).map((complaint) => ({
          id: String(complaint._id).slice(-8).toUpperCase(),
          issue: complaint.title,
          user: complaint.user?.name || "Unknown user",
          partner: complaint.serviceRequest?.assignedPartner?.businessName || complaint.serviceRequest?.assignedPartner?.name || "Unassigned",
          date: new Date(complaint.createdAt).toLocaleDateString(),
          status: complaint.status === "IN_REVIEW" ? "Under Review" : "Open",
        })));
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  const currentMetrics = metrics || {
    totalUsers: 0,
    totalPartners: 0,
    pendingPartners: 0,
    activeRequests: 0,
    completedRequests: 0,
    grossVolume: 0,
    monthlySeries: [],
    serviceMix: [],
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        <PageHeader
          title="Platform Administration Dashboard"
          description="Real-time operational health, revenue trajectory, fleet dispatch metrics and partner compliance."
          action={
            <div className="flex items-center gap-2">
              <Link to="/admin/requests">
                <Button variant="outline" size="sm">
                  <Radio className="h-4 w-4 text-accent animate-pulse" /> Live Monitoring
                </Button>
              </Link>
              <Link to="/admin/reports">
                <Button size="sm">
                  <BarChart3 className="h-4 w-4" /> Full Analytics
                </Button>
              </Link>
            </div>
          }
        />

        {/* 6 Master KPIs */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            label="Total Users"
            value={currentMetrics.totalUsers.toLocaleString("en-IN")}
            icon={Users}
            hint="Registered owners and partners"
          />
          <StatCard
            label="Total Partners"
            value={currentMetrics.totalPartners.toLocaleString("en-IN")}
            icon={Wrench}
            hint="Registered partners"
          />
          <StatCard
            label="Pending KYC"
            value={String(currentMetrics.pendingPartners)}
            icon={ShieldAlert}
            tone="accent"
            hint="Action required"
          />
          <StatCard
            label="Active Dispatches"
            value={String(currentMetrics.activeRequests)}
            icon={Radio}
            tone="accent"
            hint="Live on road"
          />
          <StatCard
            label="Completed Jobs"
            value={currentMetrics.completedRequests.toLocaleString("en-IN")}
            icon={CheckCircle2}
            tone="success"
            hint={`${currentMetrics.completionRate || 0}% of requests`}
          />
          <StatCard
            label="Gross Volume"
            value={inr(currentMetrics.grossVolume)}
            icon={DollarSign}
            tone="success"
            hint="Completed requests"
          />
        </section>

        {/* Two Data Charts: Revenue Trajectory + Service Category Mix */}
        <section className="grid gap-6 lg:grid-cols-12">
          {/* Revenue Area Chart */}
          <div className="surface-card p-6 lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold">
                  Revenue &amp; Dispatches Trajectory
                </h3>
                <p className="text-xs text-muted-foreground">Monthly volume trend</p>
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentMetrics.monthlySeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="adminRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.29 0.075 262)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.29 0.075 262)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="label" tickLine={false} />
                  <YAxis
                    tickLine={false}
                    tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                    width={50}
                  />
                  <Tooltip
                    formatter={(val) => [inr(val), "Revenue"]}
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      borderColor: "var(--color-border)",
                      borderRadius: "0.75rem",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="oklch(0.29 0.075 262)"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#adminRevenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Service Mix Pie Chart */}
          <div className="surface-card p-6 lg:col-span-4 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-display text-base font-bold">Service Share (%)</h3>
              <p className="text-xs text-muted-foreground">Distribution by roadside category</p>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={currentMetrics.serviceMix}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {currentMetrics.serviceMix.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${val}%`, "Share"]}
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      borderColor: "var(--color-border)",
                      borderRadius: "0.75rem",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border">
              {currentMetrics.serviceMix.map((entry, index) => (
                <div key={entry.label} className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                  />
                  <span className="text-muted-foreground">{entry.label}</span>
                  <span className="font-bold ml-auto">{entry.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pending Partner Verifications Quick Queue */}
        <section className="surface-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold">Pending Partner Registrations</h3>
              <p className="text-xs text-muted-foreground">
                Garages waiting for document verification before dispatch activation
              </p>
            </div>
            <Link to="/admin/partners">
              <Button variant="ghost" size="sm">
                View all ({pendingPartners.length})
              </Button>
            </Link>
          </div>

          <div className="divide-y divide-border overflow-x-auto">
            {pendingPartners.length === 0 ? (
              <p className="py-6 text-sm text-muted-foreground">No pending partner registrations.</p>
            ) : pendingPartners.map((partner) => (
              <div
                key={partner.id}
                className="py-3 flex flex-wrap items-center justify-between gap-4 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground font-display font-bold">
                    {partner.photo}
                  </span>
                  <div>
                    <h4 className="font-bold text-foreground">{partner.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      Proprietor: {partner.owner} · {partner.area} · Joined {new Date(partner.joined).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={partner.status} />
                  <Link to="/admin/partners">
                    <Button size="sm" variant="outline">
                      Review Documents
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Open Driver Complaints */}
        <section className="surface-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold">Active Customer Grievances</h3>
              <p className="text-xs text-muted-foreground">
                Disputes and arrival delays pending resolution
              </p>
            </div>
            <Link to="/admin/complaints">
              <Button variant="ghost" size="sm">
                View complaints
              </Button>
            </Link>
          </div>

          <div className="divide-y divide-border">
            {error ? <p className="py-6 text-sm text-destructive">{error}</p> : complaints.length === 0 ? (
              <p className="py-6 text-sm text-muted-foreground">No active customer grievances.</p>
            ) : complaints.map((c) => (
              <div
                key={c.id}
                className="py-3.5 flex flex-wrap items-center justify-between gap-3 text-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-primary">{c.id}</span>
                    <span className="font-medium text-foreground">{c.issue}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Customer: {c.user} · Partner: {c.partner} · {c.date}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={c.status} />
                  <Link to="/admin/complaints">
                    <Button size="sm" variant="ghost">
                      Arbitrate <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
export default AdminDashboard;
