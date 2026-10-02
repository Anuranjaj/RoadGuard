import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIconRetina from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import { ArrowRight, MapPin, Navigation, Phone, Plus, Wrench } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { requestApi } from "@/services/api";
import { usePartnerWorkspace } from "@/hooks/usePartnerWorkspace";
import { inr } from "@/utils/helpers";
import { isAssignedPartnerRequest, partnerActiveStatuses } from "@/utils/partnerData";

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
});

const partnerStatusSteps = [
  { key: "PARTNER_ACCEPTED", label: "Accepted", desc: "Dispatch acknowledged" },
  { key: "PARTNER_ARRIVING", label: "On The Way", desc: "Driving to stranded vehicle" },
  { key: "PARTNER_ARRIVED", label: "Arrived", desc: "Reached breakdown location" },
  { key: "SERVICE_IN_PROGRESS", label: "Service Started", desc: "Repair/towing in progress" },
  { key: "COMPLETED", label: "Completed", desc: "Work finished & invoiced" },
];

function FitJobBounds({ requestPosition, partnerPosition }) {
  const map = useMap();
  useEffect(() => {
    const positions = partnerPosition ? [requestPosition, partnerPosition] : [requestPosition];
    map.fitBounds(positions, { padding: [42, 42], maxZoom: 15 });
  }, [map, requestPosition, partnerPosition]);
  return null;
}

function getPartnerCoordinates(profile) {
  const [longitude, latitude] = profile?.location?.coordinates || [];
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || (latitude === 0 && longitude === 0)) {
    return null;
  }
  return [latitude, longitude];
}

export function ActiveJob() {
  const [searchParams] = useSearchParams();
  const { profile, requests, services, loading, error, refresh } = usePartnerWorkspace();
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [addExtraModal, setAddExtraModal] = useState(false);
  const [extraLabel, setExtraLabel] = useState("");
  const [extraAmount, setExtraAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const selectedId = searchParams.get("requestId");
  const req =
    requests.find((request) => request.id === selectedId && isAssignedPartnerRequest(request)) ||
    requests.find((request) => isAssignedPartnerRequest(request) && partnerActiveStatuses.includes(request.status));
  const currentStepIndex = Math.max(
    0,
    partnerStatusSteps.findIndex((step) => step.key === req?.status),
  );
  const requestPosition = req && Number.isFinite(req.latitude) && Number.isFinite(req.longitude)
    ? [req.latitude, req.longitude]
    : null;
  const partnerPosition = getPartnerCoordinates(profile);
  const extraCharges = req?.additionalCharges || [];
  const totalAmount = req ? req.amount : 0;
  const service = services.find((item) => item.id === req?.serviceCategory);

  const handleNextStep = async () => {
    const nextStep = partnerStatusSteps[currentStepIndex + 1];
    if (!req || !nextStep || saving) return;
    setSaving(true);
    setActionError("");
    try {
      await requestApi.updateStatus(req.id, { status: nextStep.key });
      await refresh();
    } catch (requestError) {
      setActionError(requestError.message || "Unable to update this job.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddExtra = async (event) => {
    event.preventDefault();
    const amount = Number(extraAmount);
    if (!req || !extraLabel.trim() || !Number.isFinite(amount) || amount < 0 || saving) return;

    setSaving(true);
    setActionError("");
    try {
      await requestApi.updateCharges(req.id, [...extraCharges, { label: extraLabel.trim(), amount }]);
      setExtraLabel("");
      setExtraAmount("");
      setAddExtraModal(false);
      await refresh();
    } catch (requestError) {
      setActionError(requestError.message || "Unable to save this charge.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role="mechanic">
      <div className="space-y-6">
        {(error || actionError) && (
          <p className="text-sm text-destructive" role="alert">{actionError || error}</p>
        )}
        {!req && (
          <div className="surface-card p-8 text-center text-sm text-muted-foreground">
            {loading ? "Loading your active job..." : "No active job is assigned to your account."}
          </div>
        )}
        {req && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                    Active Job Console
                  </h1>
                  <StatusBadge status={req.statusLabel} />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Job ID: <strong className="text-foreground">{req.requestCode}</strong> · {req.customer} ({req.vehicleName})
                </p>
              </div>
              {currentStepIndex < partnerStatusSteps.length - 1 ? (
                <Button size="lg" variant="emergency" onClick={handleNextStep} disabled={saving}>
                  Next: {partnerStatusSteps[currentStepIndex + 1].label} <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Link to="/mechanic/earnings">
                  <Button size="lg" variant="accent">View Job Payout</Button>
                </Link>
              )}
            </div>

            <div className="surface-card p-4">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {partnerStatusSteps.map((step, index) => {
                  const isPast = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  return (
                    <div
                      key={step.key}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isCurrent ? "border-accent bg-accent/10" : isPast ? "border-success bg-success/5" : "border-border bg-card opacity-60"
                      }`}
                    >
                      <p className={`text-xs font-bold ${isCurrent ? "text-accent-foreground" : isPast ? "text-success" : "text-muted-foreground"}`}>
                        {index + 1}. {step.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{step.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-7 space-y-4">
                <div className="surface-card overflow-hidden">
                  <div className="relative h-[420px] w-full bg-secondary overflow-hidden">
                    {requestPosition ? (
                      <MapContainer center={requestPosition} zoom={13} scrollWheelZoom className="h-full w-full">
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <FitJobBounds requestPosition={requestPosition} partnerPosition={partnerPosition} />
                        <Marker position={requestPosition}>
                          <Popup>{req.customer} · {req.location}</Popup>
                        </Marker>
                        {partnerPosition && (
                          <Marker position={partnerPosition}>
                            <Popup>{profile.businessName || profile.name} · Service base</Popup>
                          </Marker>
                        )}
                      </MapContainer>
                    ) : (
                      <div className="grid h-full place-items-center text-sm text-muted-foreground">
                        Location coordinates are unavailable for this request.
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 right-4 z-[1000] surface-card p-3 flex items-center justify-between backdrop-blur bg-card/95">
                      <div className="flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-accent" />
                        <span className="text-xs font-semibold">
                          {req.distanceKm === null ? "Distance unavailable" : `${req.distanceKm.toFixed(1)} km away`}
                          {req.estimatedArrivalTime ? ` · ${req.estimatedArrivalTime} mins` : " · ETA unavailable"}
                        </span>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setCallModalOpen(true)} disabled={!req.phone}>
                        <Phone className="h-3.5 w-3.5" /> Call Driver
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-4">
                <div className="surface-card p-5 space-y-3">
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Driver Contact
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-bold text-base">{req.customer}</h4>
                      <p className="text-xs text-muted-foreground">{req.phone}</p>
                    </div>
                    <Button size="sm" variant="accent" onClick={() => setCallModalOpen(true)} disabled={!req.phone}>
                      <Phone className="h-4 w-4" /> Call
                    </Button>
                  </div>
                  <div className="pt-2 border-t border-border text-xs text-muted-foreground space-y-1">
                    <p><strong className="text-foreground">Stranded Vehicle:</strong> {req.vehicleName} ({req.registration})</p>
                    <p><strong className="text-foreground">Service Required:</strong> {service?.name || req.serviceCategory}</p>
                    <p><strong className="text-foreground">Location:</strong> {req.location}</p>
                    {req.notes && <p className="bg-secondary/50 p-2 rounded-lg italic mt-1 text-foreground">"{req.notes}"</p>}
                  </div>
                </div>

                <div className="surface-card p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      Job Charges &amp; Parts
                    </h3>
                    {currentStepIndex < partnerStatusSteps.length - 1 && (
                      <Button size="sm" variant="outline" onClick={() => setAddExtraModal(true)}>
                        <Plus className="h-3.5 w-3.5" /> Add Part
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-border">
                      <span className="text-foreground">{service?.name || req.serviceCategory}</span>
                      <span className="font-bold">{inr(req.price)}</span>
                    </div>
                    {extraCharges.map((item, index) => (
                      <div key={`${item.label}-${index}`} className="flex justify-between py-1.5 border-b border-border">
                        <span className="text-foreground">{item.label}</span>
                        <span className="font-bold">{inr(item.amount)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 text-sm font-bold text-foreground">
                      <span>Total Payout Amount</span>
                      <span className="font-display text-primary">{inr(totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <Modal
          isOpen={callModalOpen}
          onClose={() => setCallModalOpen(false)}
          title={`Call ${req?.customer || "Driver"}`}
          maxWidth="max-w-sm"
          footer={
            <a href={req?.phone ? `tel:${req.phone}` : undefined} className="w-full">
              <Button variant="default" className="w-full" disabled={!req?.phone}>
                <Phone className="h-4 w-4" /> Call Driver
              </Button>
            </a>
          }
        >
          <div className="text-center space-y-3 py-4">
            <div className="h-16 w-16 rounded-full bg-accent/20 text-accent mx-auto grid place-items-center">
              <Phone className="h-8 w-8" />
            </div>
            <h4 className="font-display font-bold text-lg">{req?.customer}</h4>
            <p className="text-sm font-mono text-muted-foreground">{req?.phone}</p>
          </div>
        </Modal>

        <Modal
          isOpen={addExtraModal}
          onClose={() => setAddExtraModal(false)}
          title="Add Part or Extra Charge"
          description="Customer will see this itemized on the digital job receipt."
          footer={
            <>
              <Button variant="ghost" onClick={() => setAddExtraModal(false)}>Cancel</Button>
              <Button variant="accent" type="submit" form="partner-charge-form" disabled={saving}>
                Add to Invoice
              </Button>
            </>
          }
        >
          <form id="partner-charge-form" onSubmit={handleAddExtra} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Item / Part Name</label>
              <input
                type="text"
                value={extraLabel}
                onChange={(event) => setExtraLabel(event.target.value)}
                placeholder="e.g. 1L Coolant top-up, Jump cable charge"
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amount (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={extraAmount}
                onChange={(event) => setExtraAmount(event.target.value)}
                placeholder="180"
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}

export default ActiveJob;
