import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Search,
  ShieldAlert,
  User,
  Wrench,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { ServiceIcon } from "@/components/ServiceIcon";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { adminApi, complaintApi } from "@/services/api";

const serviceNames = {
  breakdown: "Breakdown Repair",
  towing: "Towing",
  battery: "Battery Jump-Start",
  tyre: "Flat Tire Repair",
  fuel: "Fuel Delivery",
};

const toViewComplaint = (complaint) => ({
  id: String(complaint._id).slice(-8).toUpperCase(),
  recordId: complaint._id,
  user: complaint.user?.name || "Unknown user",
  partner: complaint.serviceRequest?.assignedPartner?.businessName || complaint.serviceRequest?.assignedPartner?.name || "Unassigned",
  service: complaint.serviceRequest?.serviceCategory || "",
  date: complaint.createdAt,
  issue: complaint.title,
  detail: complaint.description,
  status: complaint.status === "IN_REVIEW" ? "Under Review" : complaint.status === "RESOLVED" ? "Resolved" : "Open",
});

/**
 * Admin Dispute & Complaints Arbitration Page
 */
export function Complaints() {
  const [complaintList, setComplaintList] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [error, setError] = useState("");

  const loadComplaints = () => adminApi.complaints().then((response) => setComplaintList(response.data.map(toViewComplaint)));

  useEffect(() => {
    loadComplaints().catch((requestError) => setError(requestError.message));
  }, []);

  const handleUpdateStatus = async (complaint, newStatus) => {
    try {
      const status = newStatus === "Under Review" ? "IN_REVIEW" : newStatus === "Resolved" ? "RESOLVED" : "OPEN";
      await complaintApi.update(complaint.recordId, { status });
      await loadComplaints();
      setActiveComplaint(null);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const filtered = complaintList.filter((c) => {
    const matchStatus =
      statusFilter === "all" || c.status.toLowerCase() === statusFilter.toLowerCase();
    const matchSearch =
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.user.toLowerCase().includes(search.toLowerCase()) ||
      c.partner.toLowerCase().includes(search.toLowerCase()) ||
      c.issue.toLowerCase().includes(search.toLowerCase());

    return matchStatus && matchSearch;
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <PageHeader
          title="Disputes &amp; Complaint Management"
          description="Arbitrate customer escalations, arrival SLA delays, billing inaccuracies and mechanic grievances."
        />
        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Filter bar */}
        <div className="surface-card p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search ticket ID, user, partner..."
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
              <option value="all">All Ticket Statuses</option>
              <option value="open">Open Escalations</option>
              <option value="under review">Under Review</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Complaints list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="surface-card p-12 text-center text-sm text-muted-foreground">No complaints found.</div>
          ) : filtered.map((item) => (
            <div
              key={item.id}
              className="surface-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-[var(--shadow-float)]"
            >
              <div className="flex items-start gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-primary">{item.id}</span>
                    <h4 className="font-display font-bold text-sm text-foreground">{item.issue}</h4>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Filed by {item.user} · Involving {item.partner} · {new Date(item.date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-1 italic">
                    "{item.detail}"
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button size="sm" variant="outline" onClick={() => setActiveComplaint(item)}>
                  <Eye className="h-4 w-4" /> Arbitrate
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Arbitration Modal */}
        <Modal
          isOpen={!!activeComplaint}
          onClose={() => setActiveComplaint(null)}
          title={`Arbitrate Ticket: ${activeComplaint?.id}`}
          description={`Filed on ${activeComplaint ? new Date(activeComplaint.date).toLocaleDateString() : ""}`}
          footer={
            <Button variant="default" onClick={() => setActiveComplaint(null)}>
              Close
            </Button>
          }
        >
          {activeComplaint && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 bg-secondary/40 p-4 rounded-xl">
                <div>
                  <p className="text-xs text-muted-foreground">Complainant (Driver)</p>
                  <p className="font-bold">{activeComplaint.user}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Service Partner</p>
                  <p className="font-bold">{activeComplaint.partner}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Service</p>
                  <p className="font-bold">{serviceNames[activeComplaint.service] || activeComplaint.service || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current Status</p>
                  <StatusBadge status={activeComplaint.status} />
                </div>
              </div>

              <div>
                <h5 className="font-display font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Issue Statement
                </h5>
                <p className="text-xs bg-secondary/30 p-3 rounded-xl border border-border">
                  {activeComplaint.detail}
                </p>
              </div>

              <div className="pt-2 border-t border-border">
                <h5 className="font-display font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Update Resolution Status
                </h5>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={activeComplaint.status === "Open" ? "accent" : "outline"}
                    onClick={() => handleUpdateStatus(activeComplaint, "Open")}
                  >
                    Mark Open
                  </Button>
                  <Button
                    size="sm"
                    variant={activeComplaint.status === "Under Review" ? "accent" : "outline"}
                    onClick={() => handleUpdateStatus(activeComplaint, "Under Review")}
                  >
                    Under Review
                  </Button>
                  <Button
                    size="sm"
                    variant={activeComplaint.status === "Resolved" ? "accent" : "outline"}
                    onClick={() => handleUpdateStatus(activeComplaint, "Resolved")}
                  >
                    Resolve &amp; Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
export default Complaints;
