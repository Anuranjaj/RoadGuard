import React, { useEffect, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  Clock,
  FileCheck,
  Navigation,
  Save,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Rating } from "@/components/Rating";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/Button";
import { partnerApi, serviceApi } from "@/services/api";

/**
 * Mechanic / Partner Business Profile & KYC Verification Page
 */
export function Profile() {
  const [partner, setPartner] = useState(null);
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [description, setDescription] = useState("");
  const [serviceOptions, setServiceOptions] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState(false);

  useEffect(() => {
    let isActive = true;

    Promise.all([partnerApi.me(), serviceApi.list()])
      .then(([profileResponse, serviceResponse]) => {
        if (!profileResponse?.data) throw new Error("Garage profile data is unavailable.");
        if (!isActive) return;

        const profile = profileResponse.data;
        const coordinates = profile.location?.coordinates;
        setPartner(profile);
        setBusinessName(profile.businessName || "");
        setOwnerName(profile.name || "");
        setPhone(profile.phone || "");
        setArea(profile.businessArea || "");
        setDescription(profile.businessDescription || "");
        setServiceOptions(serviceResponse.data || []);
        setServiceCategories(profile.serviceCategories || []);
        if (Array.isArray(coordinates) && coordinates.length === 2 && (coordinates[0] !== 0 || coordinates[1] !== 0)) {
          setLongitude(String(coordinates[0]));
          setLatitude(String(coordinates[1]));
        }
      })
      .catch((error) => {
        if (isActive) setLoadError(error.message || "Unable to load your garage profile.");
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const handleUseCurrentLocation = () => {
    setSaveError("");
    if (!navigator.geolocation) {
      setSaveError("Location is not available in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLatitude(coords.latitude.toFixed(6));
        setLongitude(coords.longitude.toFixed(6));
      },
      () => setSaveError("Unable to access your location. Check your browser permissions."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const toggleServiceCategory = (serviceId) => {
    setServiceCategories((current) =>
      current.includes(serviceId)
        ? current.filter((category) => category !== serviceId)
        : [...current, serviceId],
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSaveNotice(false);

    const hasLatitude = latitude.trim() !== "";
    const hasLongitude = longitude.trim() !== "";
    if (hasLatitude !== hasLongitude) {
      setSaveError("Enter both latitude and longitude, or use your current location.");
      return;
    }

    let location;
    if (hasLatitude && hasLongitude) {
      const numericLatitude = Number(latitude);
      const numericLongitude = Number(longitude);
      if (
        !Number.isFinite(numericLatitude) ||
        !Number.isFinite(numericLongitude) ||
        numericLatitude < -90 ||
        numericLatitude > 90 ||
        numericLongitude < -180 ||
        numericLongitude > 180 ||
        (numericLatitude === 0 && numericLongitude === 0)
      ) {
        setSaveError("Enter valid service location coordinates. The default 0, 0 location is not usable.");
        return;
      }
      location = { type: "Point", coordinates: [numericLongitude, numericLatitude] };
    }

    setSaving(true);

    try {
      const response = await partnerApi.updateProfile({
        name: ownerName,
        phone,
        businessName,
        businessArea: area,
        businessDescription: description,
        serviceCategories,
        ...(location ? { location } : {}),
      });
      const updatedProfile = response.data;
      setPartner((current) => ({ ...current, ...updatedProfile }));
      setBusinessName(updatedProfile.businessName || "");
      setOwnerName(updatedProfile.name || "");
      setPhone(updatedProfile.phone || "");
      setArea(updatedProfile.businessArea || "");
      setDescription(updatedProfile.businessDescription || "");
      setServiceCategories(updatedProfile.serviceCategories || []);
      const updatedCoordinates = updatedProfile.location?.coordinates;
      if (Array.isArray(updatedCoordinates) && updatedCoordinates.length === 2 && (updatedCoordinates[0] !== 0 || updatedCoordinates[1] !== 0)) {
        setLongitude(String(updatedCoordinates[0]));
        setLatitude(String(updatedCoordinates[1]));
      }
      setSaveNotice(true);
      window.setTimeout(() => setSaveNotice(false), 3000);
    } catch (error) {
      setSaveError(error.message || "Unable to save your garage profile.");
    } finally {
      setSaving(false);
    }
  };

  const displayName = partner?.businessName || partner?.name || "";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  const documents = partner?.verificationDocuments || [];
  const hasGarageDetails = Boolean(businessName.trim() || area.trim() || description.trim());
  const partnerSince = partner?.createdAt
    ? new Date(partner.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    : "";

  return (
    <DashboardLayout role="mechanic">
      <div className="mx-auto max-w-4xl space-y-8">
        <PageHeader
          title="Business Profile &amp; Verification"
          description="Public garage profile, contact credentials, and verified compliance documents."
        />

        {/* Profile Overview Card */}
        <div className="surface-card p-6 flex flex-col sm:flex-row sm:items-center gap-6">
          <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-primary font-display text-2xl font-bold text-primary-foreground shadow-md">
            {initials}
          </span>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl font-bold">{businessName}</h2>
              {partner?.isVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-info/15 text-info px-2.5 py-0.5 text-xs font-semibold">
                  <BadgeCheck className="h-4 w-4" /> Verified Service Unit
                </span>
              ) : partner ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-info/15 text-info px-2.5 py-0.5 text-xs font-semibold">
                  <Clock className="h-4 w-4" /> Verification pending
                </span>
              ) : null}
            </div>
            {partner && (
              <>
                <p className="text-sm text-muted-foreground">
                  Proprietor: {ownerName || "Not set"} · Service Base: {area || "Not set"}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                  <Rating value={partner.rating ?? 0} reviews={partner.ratingCount ?? 0} />
                  <span>{(partner.completedDispatches ?? 0).toLocaleString("en-IN")} completed roadside dispatches</span>
                  {partnerSince && <span>Partner since {partnerSince}</span>}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Workshop Information Form */}
        <section className="surface-card p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <Wrench className="h-5 w-5 text-accent" />
            <h3 className="font-display text-lg font-bold">Workshop &amp; Operating Details</h3>
          </div>

          {saveNotice && (
            <div className="rounded-xl bg-success/15 border border-success/30 p-3 text-xs text-success flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Business profile updated successfully.
            </div>
          )}
          {(loadError || saveError) && (
            <div role="alert" className="rounded-xl bg-destructive/12 border border-destructive/25 p-3 text-xs text-destructive">
              {loadError || saveError}
            </div>
          )}
          {partner && !hasGarageDetails && (
            <p className="text-xs text-muted-foreground">
              No garage details have been saved yet. Complete the fields below to set up your profile.
            </p>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  disabled={!partner || saving}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Owner / Manager Name</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  disabled={!partner || saving}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">Dispatch Contact Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!partner || saving}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Operational Area / Hub</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  disabled={!partner || saving}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Workshop Description &amp; Specialty
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!partner || saving}
                className="w-full rounded-xl border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <fieldset className="space-y-2 border-t border-border pt-4">
              <legend className="text-sm font-medium">Services Offered</legend>
              {serviceOptions.length === 0 ? (
                <p className="text-xs text-muted-foreground">No active service categories are available.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {serviceOptions.map((service) => (
                    <label key={service.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={serviceCategories.includes(service.id)}
                        onChange={() => toggleServiceCategory(service.id)}
                        disabled={!partner || saving}
                        className="rounded border-input text-primary"
                      />
                      <span>{service.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </fieldset>

            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Service Location</p>
                  <p className="text-xs text-muted-foreground">Save real coordinates to appear in nearby searches.</p>
                </div>
                <Button type="button" variant="outline" onClick={handleUseCurrentLocation} disabled={!partner || saving}>
                  <Navigation className="h-4 w-4" /> Use Current Location
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="partner-latitude">Latitude</label>
                  <input
                    id="partner-latitude"
                    type="number"
                    min="-90"
                    max="90"
                    step="any"
                    value={latitude}
                    onChange={(event) => setLatitude(event.target.value)}
                    disabled={!partner || saving}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="partner-longitude">Longitude</label>
                  <input
                    id="partner-longitude"
                    type="number"
                    min="-180"
                    max="180"
                    step="any"
                    value={longitude}
                    onChange={(event) => setLongitude(event.target.value)}
                    disabled={!partner || saving}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" variant="accent" disabled={!partner || saving || loading}>
              <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Business Profile"}
            </Button>
          </form>
        </section>

        {/* KYC Compliance Documents */}
        <section className="surface-card p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <ShieldCheck className="h-5 w-5 text-accent" />
            <h3 className="font-display text-lg font-bold">Verification Documents (KYC)</h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {partner && documents.length > 0 ? (
              documents.map((doc) => (
                <div key={doc._id || doc.name} className="surface-card p-4 space-y-2">
                  <FileCheck className="h-6 w-6 text-success" />
                  <h4 className="font-semibold text-sm">{doc.name}</h4>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <StatusBadge status={doc.status || "Status unavailable"} />
                    <span className="text-[11px] text-muted-foreground">{doc.status || "Status unavailable"}</span>
                  </div>
                </div>
              ))
            ) : partner ? (
              <p className="text-sm text-muted-foreground">No verification documents submitted.</p>
            ) : null}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
export default Profile;
