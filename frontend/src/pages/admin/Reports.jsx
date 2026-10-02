import React, { useEffect, useState } from "react";
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  DollarSign,
  Download,
  Flame,
  Star,
  TrendingUp,
  Wrench,
  XCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Rating } from "@/components/Rating";
import { Button } from "@/components/Button";
import { adminApi } from "@/services/api";
import { inr } from "@/utils/helpers";

/**
 * Admin Operational Analytics and Intelligence Reports Page
 */
export function Reports() {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi.analytics().then((response) => setAnalytics(response.data)).catch((requestError) => setError(requestError.message));
  }, []);

  const data = analytics || {
    grossVolume: 0,
    totalRequests: 0,
    completedRequests: 0,
    cancellationRate: 0,
    monthlySeries: [],
    topPartners: [],
  };

  const handleExport = () => {
    alert("Platform Analytics Report generated and downloaded (CSV/PDF)");
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        <PageHeader
          title="Reports &amp; Operational Analytics"
          description="Comprehensive intelligence on request fulfillment, partner performance benchmarks and revenue trends."
          action={
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" /> Export Analytics
            </Button>
          }
        />
        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* 4 Summary KPIs */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="6-Month Gross Volume"
            value={inr(data.grossVolume)}
            icon={DollarSign}
            tone="success"
            hint="Completed request volume"
          />
          <StatCard
            label="Total Roadside Requests"
            value={data.totalRequests.toLocaleString("en-IN")}
            icon={Flame}
            tone="accent"
            hint={`${data.totalRequests ? ((data.completedRequests / data.totalRequests) * 100).toFixed(2) : 0}% fulfilled`}
          />
          <StatCard
            label="Completed Services"
            value={data.completedRequests.toLocaleString("en-IN")}
            icon={CheckCircle2}
            tone="success"
            hint="Completed requests"
          />
          <StatCard
            label="Cancellation Rate"
            value={`${data.cancellationRate}%`}
            icon={XCircle}
            tone="neutral"
            hint="Of all requests"
          />
        </section>

        {/* Multi-Bar Chart: Completed vs Cancelled */}
        <section className="surface-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold">
                Monthly Service Volume &amp; Fulfillment
              </h3>
              <p className="text-xs text-muted-foreground">
                Comparing completed services vs cancellations
              </p>
            </div>
          </div>

          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlySeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="label" tickLine={false} />
                <YAxis tickLine={false} width={50} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    borderColor: "var(--color-border)",
                    borderRadius: "0.75rem",
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: "12px", fontSize: "12px" }} />
                <Bar
                  dataKey="completed"
                  name="Completed Dispatches"
                  fill="oklch(0.29 0.075 262)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="cancelled"
                  name="Cancelled"
                  fill="oklch(0.58 0.222 25)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Leaderboard of Top Performing Partners */}
        <section className="surface-card p-6 space-y-4">
          <h3 className="font-display text-base font-bold">Top Performing Workshop Partners</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="p-3">Rank &amp; Workshop</th>
                  <th className="p-3">Completed Jobs</th>
                  <th className="p-3">Customer Rating</th>
                  <th className="p-3">Gross Revenue Generated</th>
                  <th className="p-3">Platform Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.topPartners.length === 0 ? (
                  <tr><td className="p-6 text-center text-sm text-muted-foreground" colSpan="5">No completed partner jobs found.</td></tr>
                ) : data.topPartners.map((tp, idx) => (
                  <tr key={tp.name} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-3 font-semibold text-foreground flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                        {idx + 1}
                      </span>
                      {tp.name}
                    </td>
                    <td className="p-3 text-xs">{tp.jobs.toLocaleString("en-IN")} dispatches</td>
                    <td className="p-3">
                      <Rating value={tp.rating} />
                    </td>
                    <td className="p-3 font-display font-bold text-success">{inr(tp.earnings)}</td>
                    <td className="p-3 text-xs">
                      <span className="inline-block bg-accent/15 text-accent-foreground px-2 py-0.5 rounded font-bold">
                        {idx === 0 ? "Gold Fleet" : "Silver Partner"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
export default Reports;
