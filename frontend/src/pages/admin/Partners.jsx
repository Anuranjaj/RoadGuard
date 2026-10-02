import React, { useEffect, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck,
  FileText,
  MapPin,
  Phone,
  Search,
  ShieldAlert,
  ShieldCheck,
  Star,
  Wrench,
  XCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Rating } from "@/components/Rating";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { adminApi } from "@/services/api";

/**
 * Admin Partner KYC Verification & Compliance Page
 */
export function Partners() {
  const [partnerList, setPartnerList] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [error, setError] = useState("");

  const loadPartners = () => adminApi.partners().then((response) => setPartnerList(response.data));

  useEffect(() => {
    loadPartners().catch((requestError) => setError(requestError.message));
  }, []);

  const handleVerify = async (partnerId) => {
    try {
      await adminApi.updatePartnerVerification(partnerId, true);
      await loadPartners();
      setSelectedPartner(null);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleReject = async (partnerId) => {
    try {
      await adminApi.updatePartnerVerification(partnerId, false);
      await loadPartners();
      setSelectedPartner(null);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const filtered = partnerList.filter((p) => {
    const matchTab = activeTab === "all" || p.status === activeTab;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.owner.toLowerCase().includes(search.toLowerCase()) ||
      p.area.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const pendingCount = partnerList.filter((p) => p.status === "pending").length;

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <PageHeader
          title="Partner Registrations &amp; KYC Verification"
          description="Verify garages, mobile mechanics and towing operators to maintain high safety &amp; service standards."
        />
        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Tab & Search Bar */}
        <div className="surface-card p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap gap-1 border-b sm:border-0 pb-2 sm:pb-0">
              {[
                { key: "pending", label: `Pending Review (${pendingCount})` },
                { key: "verified", label: "Verified Units" },
                { key: "rejected", label: "Rejected" },
                { key: "all", label: "All Garages" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === tab.key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search partners..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Partners Table / Cards */}
        {filtered.length === 0 ? (
          <div className="surface-card p-12 text-center space-y-3">
            <Wrench className="h-10 w-10 mx-auto text-muted-foreground" />
            <h3 className="font-display text-lg font-bold">No partner records found</h3>
            <p className="text-xs text-muted-foreground">
              No partners match the current filter selection.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((partner) => (
              <div
                key={partner.id}
                className="surface-card p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-all hover:shadow-[var(--shadow-float)]"
              >
                <div className="flex items-start gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground font-display font-bold">
                    {partner.photo}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-display font-bold text-base">{partner.name}</h4>
                      {partner.verified && <BadgeCheck className="h-4 w-4 text-info" />}
                      <StatusBadge status={partner.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Proprietor: {partner.owner} · Base: {partner.area} · Phone: {partner.phone}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-2">
                      <Rating value={partner.rating} reviews={partner.reviews} />
                      <span>{partner.jobs} dispatches completed</span>
                      <span>Joined: {new Date(partner.joined).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Document Status Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {partner.documents.map((doc) => (
                    <span
                      key={doc.name}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                        doc.status === "uploaded"
                          ? "bg-success/15 text-success border border-success/30"
                          : "bg-warning/15 text-warning-foreground border border-warning/30"
                      }`}
                    >
                      {doc.status === "uploaded" ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {doc.name}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 self-end lg:self-center">
                  <Button size="sm" variant="outline" onClick={() => setSelectedPartner(partner)}>
                    <Eye className="h-4 w-4" /> Review KYC
                  </Button>
                  {partner.status === "pending" && (
                    <>
                      <Button size="sm" variant="accent" onClick={() => handleVerify(partner.id)}>
                        Approve
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleReject(partner.id)}>
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review KYC Modal */}
        <Modal
          isOpen={!!selectedPartner}
          onClose={() => setSelectedPartner(null)}
          title={`KYC Review: ${selectedPartner?.name}`}
          description={`Registered by ${selectedPartner?.owner} on ${selectedPartner?.joined}`}
          footer={
            selectedPartner?.status === "pending" ? (
              <>
                <Button variant="danger" onClick={() => handleReject(selectedPartner.id)}>
                  Reject Registration
                </Button>
                <Button variant="accent" onClick={() => handleVerify(selectedPartner.id)}>
                  Verify &amp; Activate Partner
                </Button>
              </>
            ) : (
              <Button variant="default" onClick={() => setSelectedPartner(null)}>
                Close
              </Button>
            )
          }
        >
          {selectedPartner && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 bg-secondary/40 p-4 rounded-xl">
                <div>
                  <p className="text-xs text-muted-foreground">Garage ID</p>
                  <p className="font-mono font-bold">{selectedPartner.id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current Status</p>
                  <StatusBadge status={selectedPartner.status} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedPartner.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Territory</p>
                  <p className="font-medium">{selectedPartner.area}</p>
                </div>
              </div>

              <div>
                <h5 className="font-display font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Uploaded Documents &amp; Certificates
                </h5>
                <div className="space-y-2">
                  {selectedPartner.documents.map((doc) => (
                    <div
                      key={doc.name}
                      className="flex items-center justify-between p-3 rounded-xl border border-border bg-card"
                    >
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-primary" />
                        <span className="font-medium">{doc.name}</span>
                      </div>
                      <StatusBadge status={doc.status} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
export default Partners;
