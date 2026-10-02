import React, { useEffect, useState } from "react";
import { Calendar, DollarSign, Download, TrendingUp, Wallet, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { partnerApi } from "@/services/api";
import { usePartnerWorkspace } from "@/hooks/usePartnerWorkspace";
import { inr } from "@/utils/helpers";
import { isAssignedPartnerRequest } from "@/utils/partnerData";

/**
 * Mechanic Earnings & Settlements Page
 */
export function Earnings() {
  const { profile, requests, loading, error } = usePartnerWorkspace();
  const [payouts, setPayouts] = useState([]);
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutConfirmed, setPayoutConfirmed] = useState(false);
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);
  const [payoutError, setPayoutError] = useState("");
  const [payoutRequestedAmount, setPayoutRequestedAmount] = useState(0);
  const completedJobs = requests.filter(
    (request) => isAssignedPartnerRequest(request) && request.status === "COMPLETED",
  );
  const completedOn = (request) => new Date(request.completedAt || request.updatedAt || request.createdAt);
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfWeek.getDate() - 7);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const earningsFor = (start, end) => completedJobs
    .filter((request) => completedOn(request) >= start && (!end || completedOn(request) < end))
    .reduce((total, request) => total + request.amount, 0);
  const todayEarnings = earningsFor(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  const weeklyEarnings = earningsFor(startOfWeek);
  const previousWeekEarnings = earningsFor(startOfLastWeek, startOfWeek);
  const monthlyEarnings = earningsFor(startOfMonth);
  const allTimeEarnings = completedJobs.reduce((total, request) => total + request.amount, 0);
  const payoutReserved = payouts
    .filter((payout) => ["PENDING", "APPROVED", "PAID"].includes(payout.status))
    .reduce((total, payout) => total + payout.amount, 0);
  const availableToPayout = Math.max(0, allTimeEarnings - payoutReserved);
  const weeklyChange = previousWeekEarnings
    ? `${((weeklyEarnings / previousWeekEarnings - 1) * 100).toFixed(1)}% vs last week`
    : "No previous-week earnings";
  const transactions = completedJobs.map((request) => ({
    id: request.requestCode,
    date: request.date,
    customer: request.customer,
    service: request.serviceLabel,
    amount: request.amount,
    status: request.statusLabel,
  }));
  const earningsSeries = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + index);
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);
    return {
      label: new Intl.DateTimeFormat("en", { weekday: "short" }).format(date),
      earnings: earningsFor(date, nextDate),
    };
  });

  useEffect(() => {
    let isActive = true;
    partnerApi.payouts()
      .then((response) => {
        if (isActive) setPayouts(response.data || []);
      })
      .catch((requestError) => {
        if (isActive) setPayoutError(requestError.message || "Unable to load payout requests.");
      });
    return () => {
      isActive = false;
    };
  }, [payoutConfirmed]);

  const handleRequestPayout = async () => {
    if (!availableToPayout || payoutSubmitting) return;
    setPayoutSubmitting(true);
    setPayoutError("");
    try {
      setPayoutRequestedAmount(availableToPayout);
      await partnerApi.requestPayout(availableToPayout);
      setPayoutConfirmed(true);
    } catch (requestError) {
      setPayoutError(requestError.message || "Unable to submit your payout request.");
    } finally {
      setPayoutSubmitting(false);
    }
  };

  const handleDownloadStatement = () => {
    const rows = [
      ["Request ID", "Date", "Customer", "Service", "Earnings", "Status"],
      ...transactions.map((transaction) => [
        transaction.id,
        transaction.date,
        transaction.customer,
        transaction.service,
        transaction.amount,
        transaction.status,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const downloadUrl = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "roadguard-earnings.csv";
    link.click();
    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <DashboardLayout role="mechanic">
      <div className="space-y-8">
        <PageHeader
          title="Earnings &amp; Payouts"
          description="Completed service earnings and payout request history."
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadStatement}
              >
                <Download className="h-4 w-4" /> Download CSV
              </Button>
              <Button size="sm" variant="accent" onClick={() => setPayoutModalOpen(true)}>
                <Wallet className="h-4 w-4" /> Request Payout
              </Button>
            </div>
          }
        />

        {/* 4 Summary Stat Cards */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Today's Earnings"
            value={inr(todayEarnings)}
            icon={DollarSign}
            tone="success"
            hint="Completed today"
          />
          <StatCard
            label="Weekly Earnings"
            value={inr(weeklyEarnings)}
            icon={TrendingUp}
            tone="accent"
            hint="Current week"
          />
          <StatCard
            label="Monthly Earnings"
            value={inr(monthlyEarnings)}
            icon={Calendar}
            tone="neutral"
            hint={new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(today)}
          />
          <StatCard
            label="All-Time Total Earnings"
            value={inr(allTimeEarnings)}
            icon={Wallet}
            tone="neutral"
            hint={`${completedJobs.length} completed jobs`}
          />
        </section>

        {/* Weekly Revenue Bar Chart */}
        <section className="surface-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold">Weekly Performance Trend</h3>
              <p className="text-xs text-muted-foreground">Daily earnings over the current week</p>
            </div>
            <span className="text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full">
              {weeklyChange}
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={earningsSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="label" tickLine={false} />
                <YAxis tickLine={false} tickFormatter={(val) => `₹${val}`} width={60} />
                <Tooltip
                  formatter={(val) => [inr(val), "Revenue"]}
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    borderColor: "var(--color-border)",
                    borderRadius: "0.75rem",
                  }}
                />
                <Bar dataKey="earnings" fill="oklch(0.76 0.165 62)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Completed Job Earnings */}
        <section className="surface-card p-6 space-y-4">
          <h3 className="font-display text-base font-bold">Completed Job Earnings</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="p-3">Request ID</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Earnings</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-3 font-mono text-xs">{tx.id}</td>
                    <td className="p-3 text-muted-foreground">{tx.date}</td>
                    <td className="p-3 font-medium">{tx.customer}</td>
                    <td className="p-3">{tx.service}</td>
                    <td className="p-3">{inr(tx.amount)}</td>
                    <td className="p-3">
                      <StatusBadge status={tx.status} />
                    </td>
                  </tr>
                ))}
                {!loading && transactions.length === 0 && (
                  <tr>
                    <td className="p-6 text-center text-sm text-muted-foreground" colSpan={6}>
                      No completed job earnings yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Request Payout Modal */}
        <Modal
          isOpen={payoutModalOpen}
          onClose={() => {
            setPayoutModalOpen(false);
            setPayoutConfirmed(false);
            setPayoutError("");
          }}
          title="Payout Request"
          description="Submit available earnings for payout review"
          footer={
            !payoutConfirmed && (
              <>
                <Button variant="ghost" onClick={() => setPayoutModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="accent" onClick={handleRequestPayout} disabled={!availableToPayout || payoutSubmitting}>
                  {payoutSubmitting ? "Submitting…" : "Submit Request"}
                </Button>
              </>
            )
          }
        >
          {payoutConfirmed ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
              <h4 className="font-display font-bold text-lg text-success">
                Payout Request Initiated
              </h4>
              <p className="text-xs text-muted-foreground">
                A payout request for {inr(payoutRequestedAmount)} has been recorded for review.
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-sm">
              <div className="bg-secondary/40 p-4 rounded-xl flex justify-between items-center">
                <span className="text-muted-foreground">Available to Payout</span>
                <span className="font-display font-bold text-xl text-primary">{inr(availableToPayout)}</span>
              </div>
              <div className="border border-border p-4 rounded-xl space-y-1 text-xs text-muted-foreground">
                <p><strong>Partner:</strong> {profile?.businessName || profile?.name || "—"}</p>
                <p><strong>Contact:</strong> {profile?.phone || profile?.email || "—"}</p>
                <p><strong>Latest request:</strong> {payouts[0]?.status || "No previous requests"}</p>
              </div>
            </div>
          )}
          {(error || payoutError) && <p className="mt-3 text-xs text-destructive" role="alert">{payoutError || error}</p>}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
export default Earnings;
