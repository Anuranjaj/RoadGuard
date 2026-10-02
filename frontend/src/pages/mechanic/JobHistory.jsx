import React, { useState } from "react";
import { Calendar, Eye, History, Search } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { ServiceIcon } from "@/components/ServiceIcon";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { usePartnerWorkspace } from "@/hooks/usePartnerWorkspace";
import { inr } from "@/utils/helpers";
import { isAssignedPartnerRequest } from "@/utils/partnerData";

/**
 * Mechanic Job History Page
 */
export function JobHistory() {
  const { requests, loading, error } = usePartnerWorkspace();
  const list = requests.filter(isAssignedPartnerRequest);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState(null);

  const filtered = list.filter((job) => {
    const matchSearch =
      job.requestCode.toLowerCase().includes(search.toLowerCase()) ||
      job.customer.toLowerCase().includes(search.toLowerCase()) ||
      job.vehicleName.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === "all" || job.status === statusFilter;
    const matchService = serviceFilter === "all" || job.service === serviceFilter;

    return matchSearch && matchStatus && matchService;
  });

  return (
    <DashboardLayout role="mechanic">
      <div className="space-y-6">
        <PageHeader
          title="Partner Job History"
          description="Complete audit log of dispatched jobs, customer vehicles serviced, payout summaries and ratings."
        />
        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

        {/* Filters */}
        <div className="surface-card p-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by Job ID, customer, vehicle..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="REQUESTED">Pending</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Services</option>
              <option value="breakdown">Breakdown Repair</option>
              <option value="towing">Towing</option>
              <option value="battery">Battery Jump-Start</option>
              <option value="tyre">Flat Tire Repair</option>
              <option value="fuel">Fuel Delivery</option>
            </select>
          </div>
        </div>

        {/* History List */}
        {filtered.length === 0 ? (
          <div className="surface-card p-12 text-center space-y-3">
            <History className="h-10 w-10 mx-auto text-muted-foreground" />
            <h3 className="font-display text-lg font-bold">
              {loading ? "Loading job history" : "No jobs found"}
            </h3>
            <p className="text-xs text-muted-foreground">
              Try clearing or adjusting your search filters.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((job) => (
              <div
                key={job.id}
                className="surface-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-[var(--shadow-float)]"
              >
                <div className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary">
                    <ServiceIcon service={job.service} />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-display text-base font-bold">{job.vehicleName}</h4>
                      <StatusBadge status={job.statusLabel} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {job.requestCode} · Driver: {job.customer} · {job.serviceLabel}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {job.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-0 pt-3 sm:pt-0">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Earnings</p>
                    <p className="font-display text-base font-bold text-foreground">
                      {inr(job.amount)}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedJob(job)}>
                    <Eye className="h-4 w-4" /> Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Job Detail Modal */}
        <Modal
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          title={`Job Record: ${selectedJob?.requestCode}`}
          description={`Serviced on ${selectedJob?.date}`}
          footer={
            <Button variant="default" onClick={() => setSelectedJob(null)}>
              Close
            </Button>
          }
        >
          {selectedJob && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 bg-secondary/40 p-4 rounded-xl">
                <div>
                  <p className="text-xs text-muted-foreground">Vehicle</p>
                  <p className="font-bold">{selectedJob.vehicleName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="font-bold">{selectedJob.customer}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Service</p>
                  <p className="font-bold">{selectedJob.serviceLabel}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Net Payout</p>
                  <p className="font-bold font-display text-primary">{inr(selectedJob.amount)}</p>
                </div>
              </div>
              <div className="border border-border p-4 rounded-xl space-y-2 text-xs">
                <p className="text-muted-foreground">
                  Status: <strong className="text-foreground">{selectedJob.status}</strong>
                </p>
                <p className="text-muted-foreground">
                  Payout status is available on the Earnings &amp; Payouts page.
                </p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
export default JobHistory;
