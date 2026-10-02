import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Radio } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { ServiceIcon } from "@/components/ServiceIcon";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { adminApi } from "@/services/api";
import { inr } from "@/utils/helpers";

const serviceNames = {
  breakdown: "Breakdown Repair",
  towing: "Towing",
  battery: "Battery Jump-Start",
  tyre: "Flat Tire Repair",
  fuel: "Fuel Delivery",
};

const statusNames = {
  REQUESTED: "searching",
  PARTNER_ACCEPTED: "assigned",
  PARTNER_ARRIVING: "travelling",
  PARTNER_ARRIVED: "travelling",
  SERVICE_IN_PROGRESS: "started",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

const activeStatuses = new Set([
  "REQUESTED",
  "PARTNER_ACCEPTED",
  "PARTNER_ARRIVING",
  "PARTNER_ARRIVED",
  "SERVICE_IN_PROGRESS",
]);

const toViewRequest = (request) => ({
  id: String(request._id).slice(-8).toUpperCase(),
  requestId: String(request._id),
  customer: request.owner?.name || "Unknown customer",
  phone: request.owner?.phone || "",
  vehicle: request.vehicle?.name || "Vehicle unavailable",
  vehicleRegistration: request.vehicle?.registration || "",
  service: request.serviceCategory,
  requestStatus: request.status,
  status: statusNames[request.status] || request.status.toLowerCase(),
  location: request.pickupLocation,
  latitude: request.latitude,
  longitude: request.longitude,
  partnerLatitude: request.assignedPartner?.location?.coordinates?.[1],
  partnerLongitude: request.assignedPartner?.location?.coordinates?.[0],
  price: request.price + (request.additionalCharges || []).reduce((total, charge) => total + charge.amount, 0),
  requestedAt: request.createdAt,
  partnerId: request.assignedPartner?._id,
  partner: request.assignedPartner?.name || request.assignedPartner?.businessName || "",
  eta: request.estimatedArrivalTime,
});

const hasValidCoordinates = (request) =>
  Number.isFinite(request.latitude) &&
  request.latitude >= -90 &&
  request.latitude <= 90 &&
  Number.isFinite(request.longitude) &&
  request.longitude >= -180 &&
  request.longitude <= 180;

const popupContent = (request, markerType, latitude, longitude) => {
  const content = document.createElement("div");
  const details = [
    ["Map point", markerType],
    ["Request", request.id],
    ["Owner", request.customer],
    ["Service", serviceNames[request.service] || request.service],
    ["Vehicle", `${request.vehicle}${request.vehicleRegistration ? ` (${request.vehicleRegistration})` : ""}`],
    ["Status", request.status],
    ["Requested", new Date(request.requestedAt).toLocaleString()],
    ["Location", request.location],
    ["Coordinates", `${latitude}, ${longitude}`],
  ];

  if (request.partner) details.push(["Partner", request.partner]);
  if (Number.isFinite(request.eta) && request.eta > 0) details.push(["ETA", `${request.eta} minutes`]);

  details.forEach(([label, value]) => {
    const row = document.createElement("p");
    row.textContent = `${label}: ${value || "Unavailable"}`;
    content.appendChild(row);
  });

  return content;
};

/**
 * Admin Live Dispatch Radar & Service Requests Monitoring Page
 */
export function ServiceRequests() {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReq, setSelectedReq] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerLayerRef = useRef(null);
  const markersByIdRef = useRef(new Map());
  const fittedRequestLocationsRef = useRef("");

  useEffect(() => {
    let mounted = true;
    let requestInFlight = false;

    const loadRequests = async () => {
      if (requestInFlight) return;
      requestInFlight = true;

      try {
        const response = await adminApi.requests();
        if (!mounted) return;
        const nextRequests = response.data.map(toViewRequest);
        setRequests(nextRequests);
        setSelectedReq((current) =>
          current ? nextRequests.find((request) => request.requestId === current.requestId) || null : null,
        );
        setError("");
      } catch (requestError) {
        if (mounted) setError(requestError.message || "Unable to load service requests.");
      } finally {
        requestInFlight = false;
        if (mounted) setLoading(false);
      }
    };

    loadRequests();
    const intervalId = window.setInterval(loadRequests, 15000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) return undefined;

    const map = L.map(mapContainerRef.current).setView([0, 0], 2);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    const markerLayer = L.featureGroup().addTo(map);
    mapRef.current = map;
    markerLayerRef.current = markerLayer;
    setMapReady(true);

    const frameId = window.requestAnimationFrame(() => map.invalidateSize());

    return () => {
      window.cancelAnimationFrame(frameId);
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
      markersByIdRef.current.clear();
    };
  }, []);

  const activeRequests = requests.filter((request) => activeStatuses.has(request.requestStatus));
  const mappedRequests = activeRequests.filter(hasValidCoordinates);

  useEffect(() => {
    const map = mapRef.current;
    const markerLayer = markerLayerRef.current;
    if (!map || !markerLayer) return;

    const requestsToMap = requests.filter(
      (request) => activeStatuses.has(request.requestStatus) && hasValidCoordinates(request),
    );
    markerLayer.clearLayers();
    markersByIdRef.current.clear();

    const rootStyles = getComputedStyle(document.documentElement);
    const colorsByStatus = {
      REQUESTED: rootStyles.getPropertyValue("--warning").trim(),
      PARTNER_ACCEPTED: rootStyles.getPropertyValue("--info").trim(),
      PARTNER_ARRIVING: rootStyles.getPropertyValue("--info").trim(),
      PARTNER_ARRIVED: rootStyles.getPropertyValue("--info").trim(),
      SERVICE_IN_PROGRESS: rootStyles.getPropertyValue("--info").trim(),
    };
    const partnerMarkers = new Set();

    requestsToMap.forEach((request) => {
      const marker = L.circleMarker([request.latitude, request.longitude], {
        radius: 9,
        color: "var(--card)",
        weight: 2,
        fillColor: colorsByStatus[request.requestStatus],
        fillOpacity: 1,
      })
        .bindPopup(popupContent(request, "Service request", request.latitude, request.longitude))
        .on("click", () => setSelectedReq(request))
        .addTo(markerLayer);

      markersByIdRef.current.set(request.requestId, marker);

      const partnerCoordinates = {
        latitude: request.partnerLatitude,
        longitude: request.partnerLongitude,
      };
      if (
        request.partnerId &&
        hasValidCoordinates(partnerCoordinates) &&
        (request.partnerLatitude !== 0 || request.partnerLongitude !== 0) &&
        !partnerMarkers.has(request.partnerId)
      ) {
        partnerMarkers.add(request.partnerId);
        L.circleMarker([request.partnerLatitude, request.partnerLongitude], {
          radius: 7,
          color: rootStyles.getPropertyValue("--card").trim(),
          weight: 2,
          fillColor: rootStyles.getPropertyValue("--success").trim(),
          fillOpacity: 1,
        })
          .bindPopup(
            popupContent(
              request,
              "Saved partner location",
              request.partnerLatitude,
              request.partnerLongitude,
            ),
          )
          .on("click", () => setSelectedReq(request))
          .addTo(markerLayer);
      }
    });

    const locationSignature = requestsToMap
      .map((request) => `${request.requestId}:${request.latitude}:${request.longitude}:${request.partnerLatitude}:${request.partnerLongitude}`)
      .sort()
      .join("|");

    if (locationSignature !== fittedRequestLocationsRef.current) {
      fittedRequestLocationsRef.current = locationSignature;
      if (requestsToMap.length === 1) {
        map.setView([requestsToMap[0].latitude, requestsToMap[0].longitude], 14);
      } else if (requestsToMap.length > 1) {
        map.fitBounds(markerLayer.getBounds(), { padding: [32, 32], maxZoom: 14 });
      } else {
        map.setView([0, 0], 2);
      }
    }
  }, [requests]);

  useEffect(() => {
    if (!mapReady || !selectedReq) return;
    const map = mapRef.current;
    const marker = markersByIdRef.current.get(selectedReq.requestId);
    if (!map || !marker) return;

    map.setView(marker.getLatLng(), Math.max(map.getZoom(), 14));
    marker.openPopup();
  }, [mapReady, selectedReq, requests]);

  const filtered = requests.filter((r) =>
    statusFilter === "all" ? true : r.status === statusFilter,
  );

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <PageHeader
          title="Live Service Monitoring &amp; Requests"
          description="Real-time geographic radar of active driver breakdown requests, travelling tow units and garage dispatches."
          action={
            <div className="flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
              <Radio className="h-3.5 w-3.5 animate-pulse" /> Radar Active ({activeRequests.length}{" "}
              Dispatches)
            </div>
          }
        />
        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Split Radar Layout */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left 7 Cols: Live Request Map */}
          <div className="lg:col-span-7 space-y-4">
            <div className="surface-card overflow-hidden">
              <div className="relative h-[560px] w-full bg-secondary">
                <div ref={mapContainerRef} className="h-full w-full" />
                {loading && (
                  <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-background/70 text-sm text-muted-foreground">
                    Loading service requests...
                  </div>
                )}
                {!loading && !error && activeRequests.length === 0 && (
                  <div className="absolute left-1/2 top-4 z-[1000] -translate-x-1/2 rounded-lg bg-card px-3 py-2 text-sm text-muted-foreground shadow">
                    No active service requests
                  </div>
                )}
                {!loading && !error && activeRequests.length > 0 && mappedRequests.length === 0 && (
                  <div className="absolute left-1/2 top-4 z-[1000] -translate-x-1/2 rounded-lg bg-card px-3 py-2 text-sm text-muted-foreground shadow">
                    No active request locations available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Requests Stream */}
          <div className="lg:col-span-5 space-y-4">
            <div className="surface-card p-4 flex items-center justify-between">
              <h3 className="font-display font-bold text-sm">Active Incidents</h3>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-input bg-background px-2.5 py-1 text-xs"
              >
                <option value="all">All Dispatches</option>
                <option value="travelling">Travelling Units</option>
                <option value="started">In Progress</option>
                <option value="searching">Searching Partner</option>
                <option value="assigned">Assigned</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {loading ? (
                <div className="surface-card p-8 text-center text-sm text-muted-foreground">Loading service requests...</div>
              ) : filtered.length === 0 ? (
                <div className="surface-card p-8 text-center text-sm text-muted-foreground">No service requests found.</div>
              ) : filtered.map((req) => (
                <div
                  key={req.requestId}
                  onClick={() => setSelectedReq(req)}
                  className={`surface-card p-4 space-y-2 cursor-pointer transition-all hover:border-primary/50 ${selectedReq?.requestId === req.requestId ? "border-primary/50" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-sm">{req.customer}</span>
                        <StatusBadge status={req.status} />
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{req.id}</p>
                    </div>
                    <p className="font-display font-bold text-sm text-foreground">
                      {inr(req.price)}
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span>{hasValidCoordinates(req) ? req.location : "Location unavailable"}</span>
                  </p>

                  <div className="flex justify-between items-center text-xs text-muted-foreground pt-1 border-t border-border">
                    <span>{req.vehicle}</span>
                    <span>{new Date(req.requestedAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Incident Inspector Modal */}
        <Modal
          isOpen={!!selectedReq}
          onClose={() => setSelectedReq(null)}
          title={`Dispatch Monitor: ${selectedReq?.id}`}
          description={`Customer: ${selectedReq?.customer} (${selectedReq?.phone})`}
          footer={
            <Button variant="default" onClick={() => setSelectedReq(null)}>
              Close Monitor
            </Button>
          }
        >
          {selectedReq && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 bg-secondary/40 p-4 rounded-xl">
                <div>
                  <p className="text-xs text-muted-foreground">Service</p>
                  <p className="font-bold">{serviceNames[selectedReq.service] || selectedReq.service}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <StatusBadge status={selectedReq.status} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vehicle</p>
                  <p className="font-bold">
                    {selectedReq.vehicle}{selectedReq.vehicleRegistration ? ` (${selectedReq.vehicleRegistration})` : ""}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="font-bold font-display text-primary">{inr(selectedReq.price)}</p>
                </div>
              </div>

              <div className="border border-border p-4 rounded-xl text-xs space-y-1">
                <p>
                  <strong>GPS Location:</strong> {selectedReq.location}
                </p>
                <p>
                  <strong>Requested At:</strong> {selectedReq.requestedAt}
                </p>
                {selectedReq.partnerId && (
                  <p>
                    <strong>Partner:</strong> {selectedReq.partner || selectedReq.partnerId}
                  </p>
                )}
                {Number.isFinite(selectedReq.eta) && selectedReq.eta > 0 && (
                  <p>
                    <strong>ETA:</strong> {selectedReq.eta} minutes
                  </p>
                )}
                {hasValidCoordinates(selectedReq) && (
                  <p>
                    <strong>Coordinates:</strong> {selectedReq.latitude}, {selectedReq.longitude}
                  </p>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
export default ServiceRequests;
