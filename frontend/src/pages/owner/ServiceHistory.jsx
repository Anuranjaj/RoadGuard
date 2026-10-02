import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Eye,
  History,
  Search,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { ServiceIcon } from "@/components/ServiceIcon";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { inr } from "@/utils/helpers";
import { requestApi, serviceApi } from "@/services/api";

/**
 * Owner Service History Page
 */
export function ServiceHistory() {
  const [list, setList] = useState([]);
  const [serviceNames, setServiceNames] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    let isActive = true;

    Promise.all([requestApi.list(), serviceApi.list()])
      .then(([requestResponse, serviceResponse]) => {
        if (!isActive) return;
        setList(requestResponse.data || []);
        setServiceNames(
          Object.fromEntries((serviceResponse.data || []).map((service) => [service.id, service.name])),
        );
      })
      .catch((loadError) => {
        if (isActive) setError(loadError.message || "Unable to load service history.");
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const filtered = useMemo(() => list.filter((item) => {
    const vehicleName = item.vehicle?.name || "";
    const partnerName = item.assignedPartner?.businessName || item.assignedPartner?.name || "";
    const itemId = item._id || item.id || "";
    const matchSearch =
      itemId.toLowerCase().includes(search.toLowerCase()) ||
      partnerName.toLowerCase().includes(search.toLowerCase()) ||
      vehicleName.toLowerCase().includes(search.toLowerCase());

    const terminal = item.status === "COMPLETED" || item.status === "CANCELLED";
    const matchStatus = statusFilter === "all" ||
      (statusFilter === "active" && !terminal) ||
      item.status === statusFilter;
    const matchService = serviceFilter === "all" || item.serviceCategory === serviceFilter;

    return matchSearch && matchStatus && matchService;
  }), [list, search, serviceFilter, statusFilter]);

  const serviceName = (serviceId) => serviceNames[serviceId] || serviceId || "Service";
  const formatDate = (date) => (date ? new Date(date).toLocaleString() : "Date unavailable");

  return (
    <DashboardLayout role="owner">
      <div className="space-y-6">
        <PageHeader
          title="Service History"
          description="Comprehensive log of all previous roadside assistance dispatches, on-site repairs and invoices."
          action={
            <Link to="/owner/request-service">
              <Button variant="accent">Request Assistance</Button>
            </Link>
          }
        />

        {/* Search and Filters Bar */}
        <div className="surface-card p-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by ID, partner, vehicle..."
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
              <option value="active">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Services</option>
              {Object.entries(serviceNames).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* History List */}
        {isLoading ? (
          <div className="surface-card p-12 text-center">
            <p className="text-sm text-muted-foreground">Loading service history...</p>
          </div>
        ) : error ? (
          <div className="surface-card p-12 text-center" role="alert">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="surface-card p-12 text-center space-y-3">
            <History className="h-10 w-10 mx-auto text-muted-foreground" />
            <h3 className="font-display text-lg font-bold">
              {list.length === 0 ? "No service requests yet" : "No records found"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {list.length === 0
                ? "Completed and active requests will appear here."
                : "Try adjusting your search query or filters."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div
                  key={item._id || item.id}
                className="surface-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-[var(--shadow-float)]"
              >
                <div className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary">
                    <ServiceIcon service={item.service} />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-display text-base font-bold">
                        {serviceName(item.serviceCategory)}
                      </h4>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {(item._id || item.id)} · {item.vehicle?.name || "Vehicle unavailable"} · {item.assignedPartner?.businessName || item.assignedPartner?.name || "Partner unassigned"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-0 pt-3 sm:pt-0">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Request estimate</p>
                    <p className="font-display text-base font-bold text-foreground">
                      {inr(Number(item.price) || 0)}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedItem(item)}>
                    <Eye className="h-4 w-4" /> Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Service Details Modal */}
        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={`Service Request: ${(selectedItem?._id || selectedItem?.id || "").slice(-8)}`}
          description={`Details for ${selectedItem?.vehicle?.name || "vehicle unavailable"} on ${formatDate(selectedItem?.createdAt)}`}
          footer={
            <Button variant="ghost" onClick={() => setSelectedItem(null)}>
              Close
            </Button>
          }
        >
          {selectedItem && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 bg-secondary/40 p-4 rounded-xl">
                <div>
                  <p className="text-xs text-muted-foreground">Service Type</p>
                    <p className="font-bold">{serviceName(selectedItem.serviceCategory)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <StatusBadge status={selectedItem.status} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Assigned Partner</p>
                  <p className="font-bold">
                    {selectedItem.assignedPartner?.businessName || selectedItem.assignedPartner?.name || "Partner unassigned"}
                  </p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Request estimate</p>
                  <p className="font-bold font-display text-primary">{inr(Number(selectedItem.price) || 0)}</p>
                </div>
              </div>

              <div className="border border-border p-4 rounded-xl space-y-2">
                <h5 className="font-display font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                  Request Details
                </h5>
                <p>{selectedItem.pickupLocation || "Pickup location unavailable"}</p>
                <p>{selectedItem.description || "No problem description provided."}</p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
export default ServiceHistory;
