import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { OpenLocationCode } from "open-location-code";
import "leaflet/dist/leaflet.css";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Camera,
  Car,
  CheckCircle2,
  MapPin,
  Navigation,
  Plus,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { PartnerCard } from "@/components/PartnerCard";
import { Modal } from "@/components/Modal";
import { ServiceIcon } from "@/components/ServiceIcon";
import { StatusBadge } from "@/components/StatusBadge";
import { inr } from "@/utils/helpers";
import { partnerApi, requestApi, serviceApi, vehicleApi } from "@/services/api";

const openLocationCode = new OpenLocationCode();
const defaultMapCenter = [11.9, 75.55];

function LocationMarker({ coordinates, onSelect }) {
  const map = useMap();

  useMapEvents({
    click(event) {
      onSelect({ latitude: event.latlng.lat, longitude: event.latlng.lng });
    },
  });

  useEffect(() => {
    if (coordinates) {
      map.flyTo([coordinates.latitude, coordinates.longitude], Math.max(map.getZoom(), 15));
    }
  }, [coordinates, map]);

  return coordinates ? <Marker position={[coordinates.latitude, coordinates.longitude]} /> : null;
}

async function geocodeLocation(query) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`,
  );
  if (!response.ok) throw new Error("Unable to search for this location.");

  const [result] = await response.json();
  if (!result)
    throw new Error("Location not found. Try a nearby town or a Plus Code with its area.");
  return { latitude: Number(result.lat), longitude: Number(result.lon) };
}

async function resolveLocation(value) {
  const trimmedValue = value.trim();
  const coordinateMatch = trimmedValue.match(/^(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)$/);

  if (coordinateMatch) {
    const latitude = Number(coordinateMatch[1]);
    const longitude = Number(coordinateMatch[2]);
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new Error("Enter valid latitude and longitude values.");
    }
    return { latitude, longitude };
  }

  const [possibleCode, ...contextParts] = trimmedValue.split(",");
  const code = possibleCode.trim().replace(/\s/g, "").toUpperCase();
  if (openLocationCode.isValid(code)) {
    if (openLocationCode.isFull(code)) {
      const decoded = openLocationCode.decode(code);
      return { latitude: decoded.latitudeCenter, longitude: decoded.longitudeCenter };
    }

    const context = contextParts.join(",").trim();
    if (!openLocationCode.isShort(code) || !context) {
      throw new Error("Add a nearby town or region after a short Plus Code.");
    }
    const nearbyLocation = await geocodeLocation(context);
    const fullCode = openLocationCode.recoverNearest(
      code,
      nearbyLocation.latitude,
      nearbyLocation.longitude,
    );
    const decoded = openLocationCode.decode(fullCode);
    return { latitude: decoded.latitudeCenter, longitude: decoded.longitudeCenter };
  }

  return geocodeLocation(trimmedValue);
}

function LocationMap({ coordinates, onSelect }) {
  return (
    <MapContainer
      center={coordinates ? [coordinates.latitude, coordinates.longitude] : defaultMapCenter}
      zoom={coordinates ? 15 : 9}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker coordinates={coordinates} onSelect={onSelect} />
    </MapContainer>
  );
}

const steps = [
  { num: 1, label: "Vehicle" },
  { num: 2, label: "Service" },
  { num: 3, label: "Location" },
  { num: 4, label: "Details" },
  { num: 5, label: "Partner" },
  { num: 6, label: "Confirm" },
];

const partnerSearchDiagnostics = {
  NO_PARTNER_PROFILES: "No partner profiles are registered yet.",
  NO_PARTNER_OFFERS_SERVICE: "No registered partner currently offers this service.",
  PARTNER_ACCOUNT_INACTIVE: "Matching partner accounts are inactive.",
  PARTNER_NOT_VERIFIED: "Matching partners have not completed verification.",
  PARTNER_UNAVAILABLE: "Matching partners are currently unavailable.",
  PARTNER_HAS_ACTIVE_JOB: "Matching partners are already assigned to an active job.",
};

/**
 * Service Request Multi-step Wizard
 */
export function RequestService() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Form states
  const [vehicleList, setVehicleList] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [partners, setPartners] = useState([]);
  const [partnerDiagnostics, setPartnerDiagnostics] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [locationAddress, setLocationAddress] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const locationResolutionId = useRef(0);
  const [problemDescription, setProblemDescription] = useState("");
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPartners, setIsLoadingPartners] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingVehicle, setIsSavingVehicle] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [partnerError, setPartnerError] = useState("");
  const [locationError, setLocationError] = useState("");
  const [submitError, setSubmitError] = useState("");

  // Filtering for partners
  const [sortBy, setSortBy] = useState("rating");
  const [onlyAvailable, setOnlyAvailable] = useState(true);

  // New vehicle modal
  const [addVehicleModal, setAddVehicleModal] = useState(false);
  const [newVehicleName, setNewVehicleName] = useState("");
  const [newVehicleReg, setNewVehicleReg] = useState("");
  const [newVehicleType, setNewVehicleType] = useState("Car");
  const [newVehicleFuel, setNewVehicleFuel] = useState("Petrol");

  useEffect(() => {
    let isActive = true;

    Promise.all([vehicleApi.list(), serviceApi.list()])
      .then(([vehicleResponse, serviceResponse]) => {
        if (!isActive) return;
        const vehicles = (vehicleResponse.data || []).map((vehicle) => ({
          ...vehicle,
          id: vehicle._id || vehicle.id,
        }));
        const services = serviceResponse.data || [];
        setVehicleList(vehicles);
        setServiceCategories(services);
        setSelectedVehicle(vehicles[0] || null);
        setSelectedService(services[0] || null);
      })
      .catch((error) => {
        if (isActive) setLoadError(error.message || "Unable to load vehicles and services.");
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (currentStep !== 5 || !selectedService) return undefined;

    let isActive = true;
    setIsLoadingPartners(true);
    setPartnerError("");
    setPartnerDiagnostics([]);

    partnerApi
      .nearby({
        serviceCategory: selectedService.id,
      })
      .then((response) => {
        if (!isActive) return;
        const nearbyPartners = (response.data || []).map((partner) => {
          const name = partner.businessName || partner.name;

          return {
            ...partner,
            id: partner._id,
            name,
            owner: partner.name,
            photo: name
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part[0])
              .join("")
              .toUpperCase(),
            verified: partner.isVerified,
            available: partner.availability,
            reviews: partner.ratingCount || 0,
            distanceKm: null,
            etaMinutes: null,
            price: partner.pricing || selectedService.basePrice,
            phone: partner.phone,
          };
        });
        setPartners(nearbyPartners);
        setPartnerDiagnostics(Array.isArray(response.diagnostics?.reasons) ? response.diagnostics.reasons : []);
        setSelectedPartner(null);
      })
      .catch((error) => {
        if (isActive) {
          setPartners([]);
          setPartnerDiagnostics([]);
          setPartnerError(error.message || "Unable to load partners for this service.");
        }
      })
      .finally(() => {
        if (isActive) setIsLoadingPartners(false);
      });

    return () => {
      isActive = false;
    };
  }, [currentStep, selectedService]);

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    if (isSavingVehicle || !newVehicleName.trim() || !newVehicleReg.trim()) return;

    setIsSavingVehicle(true);
    setLoadError("");
    try {
      const response = await vehicleApi.create({
        name: newVehicleName.trim(),
        registration: newVehicleReg.trim().replace(/\s/g, "").toUpperCase(),
        type: newVehicleType,
        fuel: newVehicleFuel,
      });
      const created = {
        ...response.data,
        id: response.data._id || response.data.id,
      };
      setVehicleList((prev) => [...prev, created]);
      setSelectedVehicle(created);
      setNewVehicleName("");
      setNewVehicleReg("");
      setAddVehicleModal(false);
    } catch (error) {
      setLoadError(error.message || "Unable to save this vehicle.");
    } finally {
      setIsSavingVehicle(false);
    }
  };

  const handleUseCurrentLocation = () => {
    const requestId = ++locationResolutionId.current;
    if (!navigator.geolocation) {
      setLocationError("Location is not available in this browser.");
      return;
    }

    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords: position }) => {
        if (requestId !== locationResolutionId.current) return;
        setCoordinates({ latitude: position.latitude, longitude: position.longitude });
        setLocationAddress(`${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}`);
      },
      () => {
        if (requestId === locationResolutionId.current) {
          setLocationError("Unable to access your location. Check your browser permissions.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleSelectMapLocation = (nextCoordinates) => {
    locationResolutionId.current += 1;
    setCoordinates(nextCoordinates);
    setLocationAddress(
      `${nextCoordinates.latitude.toFixed(6)}, ${nextCoordinates.longitude.toFixed(6)}`,
    );
    setLocationError("");
  };

  const handleResolveLocation = async () => {
    if (!locationAddress.trim()) return;

    const resolutionId = ++locationResolutionId.current;
    setLocationError("");
    try {
      const nextCoordinates = await resolveLocation(locationAddress);
      if (resolutionId === locationResolutionId.current) setCoordinates(nextCoordinates);
    } catch (error) {
      if (resolutionId === locationResolutionId.current) {
        setCoordinates(null);
        setLocationError(error.message || "Unable to resolve this location.");
      }
    }
  };

  // Sort partners
  const sortedPartners = partners
    .filter((p) => (onlyAvailable ? p.available : true))
    .sort((a, b) => {
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "price") return (a.price || 0) - (b.price || 0);
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      return (b.rating || 0) - (a.rating || 0);
    });

  const handleCompleteRequest = async () => {
    if (isSaving || !selectedVehicle || !selectedService || !coordinates) return;

    setIsSaving(true);
    setSubmitError("");
    try {
      const response = await requestApi.create({
        vehicle: selectedVehicle.id,
        serviceCategory: selectedService.id,
        description: problemDescription.trim(),
        pickupLocation: locationAddress.trim(),
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      });
      navigate(`/owner/tracking?requestId=${response.data._id}`);
    } catch (error) {
      setSubmitError(error.message || "Unable to submit your assistance request.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout role="owner">
      <div className="space-y-6">
        <PageHeader
          title="Request Roadside Assistance"
          description="Follow the steps below to dispatch a certified technician to your current position."
        />
        {loadError && (
          <p className="text-sm text-destructive" role="alert">
            {loadError}
          </p>
        )}

        {/* Step Progress Tracker */}
        <div className="surface-card p-4 overflow-x-auto">
          <ol className="flex items-center min-w-[580px] justify-between">
            {steps.map((s, idx) => {
              const isPast = s.num < currentStep;
              const isCurrent = s.num === currentStep;

              return (
                <li key={s.num} className="flex items-center gap-2">
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition-colors ${
                      isPast
                        ? "bg-success text-success-foreground"
                        : isCurrent
                          ? "bg-accent text-accent-foreground shadow-sm"
                          : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="h-4 w-4" /> : s.num}
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      isCurrent ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </span>
                  {idx < steps.length - 1 && (
                    <div
                      className={`h-0.5 w-8 sm:w-12 transition-colors ${
                        isPast ? "bg-success" : "bg-border"
                      }`}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {/* Step 1: Select Vehicle */}
        {currentStep === 1 && (
          <div className="surface-card p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-bold">1. Select your vehicle</h3>
                <p className="text-sm text-muted-foreground">
                  Which vehicle needs emergency assistance?
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setAddVehicleModal(true)}>
                <Plus className="h-4 w-4" /> Add Another Vehicle
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading your vehicles...</p>
              ) : vehicleList.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No vehicles are registered to your account yet. Add a vehicle to continue.
                </p>
              ) : (
                vehicleList.map((veh) => {
                  const isSelected = selectedVehicle?.id === veh.id;
                  return (
                    <div
                      key={veh.id}
                      onClick={() => setSelectedVehicle(veh)}
                      className={`surface-card p-4 transition-all cursor-pointer ${
                        isSelected ? "ring-2 ring-accent border-accent" : "hover:border-primary/50"
                      }`}
                    >
                      {veh.image ? (
                        <img
                          src={veh.image}
                          alt={veh.name}
                          className="h-28 w-full object-cover rounded-lg mb-3"
                        />
                      ) : (
                        <div className="mb-3 grid h-28 place-items-center rounded-lg bg-secondary text-muted-foreground">
                          <Car className="h-8 w-8" aria-hidden="true" />
                        </div>
                      )}
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-display text-sm font-bold">{veh.name}</h4>
                          <p className="text-xs text-muted-foreground">{veh.registration}</p>
                        </div>
                        <StatusBadge status={veh.type} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <Button
                variant="accent"
                onClick={() => setCurrentStep(2)}
                disabled={isLoading || !selectedVehicle || !!loadError}
              >
                Continue to Service Selection <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Select Service Category */}
        {currentStep === 2 && (
          <div className="surface-card p-6 space-y-6">
            <div>
              <h3 className="font-display text-lg font-bold">2. What kind of help do you need?</h3>
              <p className="text-sm text-muted-foreground">
                Select the service that matches your vehicle's issue.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading available services...</p>
              ) : serviceCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No services are available right now. Please try again later.
                </p>
              ) : (
                serviceCategories.map((srv) => {
                  const isSelected = selectedService?.id === srv.id;
                  return (
                    <div
                      key={srv.id}
                      onClick={() => setSelectedService(srv)}
                      className={`surface-card p-5 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "ring-2 ring-accent border-accent bg-accent/5"
                          : "hover:border-primary/40"
                      }`}
                    >
                      <div>
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground mb-3">
                          <ServiceIcon service={srv.id} className="h-5 w-5" />
                        </span>
                        <h4 className="font-display text-base font-bold">{srv.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{srv.description}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Estimated base</span>
                        <span className="font-bold font-display text-sm">{inr(srv.basePrice)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-between pt-4 border-t border-border">
              <Button variant="ghost" onClick={() => setCurrentStep(1)}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                variant="accent"
                onClick={() => setCurrentStep(3)}
                disabled={!selectedService}
              >
                Confirm Location <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Location Confirmation */}
        {currentStep === 3 && (
          <div className="surface-card p-6 space-y-6">
            <div>
              <h3 className="font-display text-lg font-bold">3. Where is your vehicle stranded?</h3>
              <p className="text-sm text-muted-foreground">
                We use this location to dispatch the closest available response unit.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">GPS coordinates</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-accent" />
                    <input
                      type="text"
                      value={locationAddress}
                      onChange={(e) => {
                        locationResolutionId.current += 1;
                        setLocationAddress(e.target.value);
                        setCoordinates(null);
                        setLocationError("");
                      }}
                      onBlur={handleResolveLocation}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleResolveLocation();
                        }
                      }}
                      className="h-11 w-full rounded-xl border border-input bg-background pl-9 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <Button variant="outline" onClick={handleUseCurrentLocation} disabled={isSaving}>
                    <Navigation className="h-4 w-4" /> Current GPS
                  </Button>
                </div>
                {locationError && (
                  <p className="mt-1 text-xs text-destructive" role="alert">
                    {locationError}
                  </p>
                )}
              </div>

              {/* Location Preview */}
              <div className="relative h-64 w-full rounded-2xl bg-secondary/80 border border-border overflow-hidden">
                <LocationMap coordinates={coordinates} onSelect={handleSelectMapLocation} />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-border">
              <Button variant="ghost" onClick={() => setCurrentStep(2)}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                variant="accent"
                onClick={() => setCurrentStep(4)}
                disabled={!locationAddress.trim() || !coordinates}
              >
                Describe Problem <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Describe Problem */}
        {currentStep === 4 && (
          <div className="surface-card p-6 space-y-6">
            <div>
              <h3 className="font-display text-lg font-bold">4. Describe the breakdown</h3>
              <p className="text-sm text-muted-foreground">
                Details help the technician arrive with the exact replacement battery, coolant or
                tyres.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">What happened?</label>
                <textarea
                  rows={4}
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="e.g. Engine started smoking, weird clicking noise when cranking..."
                  className="w-full rounded-xl border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Upload photos (optional)</label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-secondary/40 transition-colors cursor-pointer">
                  <Camera className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-xs font-semibold text-foreground">
                    Click or drag photos of the breakdown / dashboard warning lights
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">PNG, JPG up to 10MB</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-border">
              <Button variant="ghost" onClick={() => setCurrentStep(3)}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button variant="accent" onClick={() => setCurrentStep(5)}>
                Choose Partner <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Compare and Pick Nearby Partner */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="surface-card p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-bold">
                  5. Compare verified service partners
                </h3>
                <p className="text-xs text-muted-foreground">
                  Found {sortedPartners.length} available partners for this service.
                </p>
              </div>

              {/* Sorting and Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <span>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-lg border border-input bg-background px-2.5 py-1 text-xs"
                  >
                    <option value="rating">Highest Rated</option>
                    <option value="price">Lowest Price</option>
                    <option value="name">Partner Name</option>
                  </select>
                </div>

                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyAvailable}
                    onChange={(e) => setOnlyAvailable(e.target.checked)}
                    className="rounded border-input text-primary"
                  />
                  <span>Available Now Only</span>
                </label>
              </div>
            </div>

            <div className="grid gap-4">
              {isLoadingPartners ? (
                <p className="surface-card p-6 text-sm text-muted-foreground">
                  Finding available service partners...
                </p>
              ) : partnerError ? (
                <p className="surface-card p-6 text-sm text-destructive" role="alert">
                  {partnerError}
                </p>
              ) : sortedPartners.length === 0 ? (
                <div className="surface-card p-6 text-sm text-muted-foreground">
                  <p>No available partners were found for this service.</p>
                  {partnerDiagnostics.map((reason) => partnerSearchDiagnostics[reason] && (
                    <p key={reason} className="mt-1 text-xs">{partnerSearchDiagnostics[reason]}</p>
                  ))}
                </div>
              ) : (
                sortedPartners.map((partner) => (
                  <PartnerCard
                    key={partner.id}
                    partner={partner}
                    selected={selectedPartner?.id === partner.id}
                    onSelect={() => setSelectedPartner(partner)}
                  />
                ))
              )}
            </div>

            <div className="surface-card p-4 flex justify-between items-center">
              <Button variant="ghost" onClick={() => setCurrentStep(4)}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                variant="accent"
                onClick={() => setCurrentStep(6)}
              >
                Review &amp; Confirm <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 6: Review & Final Confirmation */}
        {currentStep === 6 && (
          <div className="surface-card p-6 sm:p-8 space-y-6 max-w-2xl mx-auto">
            <div className="border-b border-border pb-4">
              <h3 className="font-display text-xl font-bold">6. Review Request Summary</h3>
              <p className="text-sm text-muted-foreground">
                Confirm your dispatch details before broadcasting to the technician.
              </p>
            </div>

            {/* Summary List */}
            <dl className="space-y-4 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <dt className="text-muted-foreground">Vehicle</dt>
                <dd className="font-semibold text-right">
                  {selectedVehicle?.name} ({selectedVehicle?.registration})
                </dd>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <dt className="text-muted-foreground">Requested Service</dt>
                <dd className="font-semibold text-right">{selectedService?.name}</dd>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <dt className="text-muted-foreground">Assigned Partner</dt>
                <dd className="font-semibold text-right">
                  {selectedPartner?.name || "To be assigned after acceptance"}
                </dd>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <dt className="text-muted-foreground">Expected Arrival (ETA)</dt>
                <dd className="font-semibold text-accent-foreground text-right">
                  {selectedPartner?.etaMinutes
                    ? `~${selectedPartner.etaMinutes} minutes`
                    : "ETA not available"}
                </dd>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <dt className="text-muted-foreground">Breakdown Location</dt>
                <dd className="font-medium text-right max-w-xs">{locationAddress}</dd>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <dt className="text-muted-foreground">Reported Problem</dt>
                <dd className="font-medium text-right max-w-xs">{problemDescription}</dd>
              </div>
              <div className="flex justify-between py-3 text-base font-bold bg-secondary/40 px-3 rounded-xl">
                <dt>Estimated Upfront Total</dt>
                <dd className="text-primary font-display text-lg">
                  {inr(selectedPartner?.price || selectedService?.basePrice || 0)}
                </dd>
              </div>
            </dl>

            <div className="flex items-center gap-3 rounded-xl bg-success/10 p-3 text-xs text-success">
              <ShieldCheck className="h-5 w-5 shrink-0" />
              <span>
                Partner, service, and location details are based on current RoadGuard records.
              </span>
            </div>

            {submitError && (
              <p className="text-sm text-destructive" role="alert">
                {submitError}
              </p>
            )}

            <div className="flex justify-between pt-4 border-t border-border">
              <Button variant="ghost" onClick={() => setCurrentStep(5)}>
                <ArrowLeft className="h-4 w-4" /> Change Partner
              </Button>
              <Button
                variant="emergency"
                size="lg"
                onClick={handleCompleteRequest}
                disabled={isSaving}
              >
                {isSaving ? "Submitting..." : "Confirm & Dispatch Help Now"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Modal to quick add vehicle */}
        <Modal
          isOpen={addVehicleModal}
          onClose={() => setAddVehicleModal(false)}
          title="Add Vehicle to Request"
          footer={
            <>
              <Button variant="ghost" onClick={() => setAddVehicleModal(false)}>
                Cancel
              </Button>
              <Button variant="accent" onClick={handleCreateVehicle} disabled={isSavingVehicle}>
                {isSavingVehicle ? "Saving..." : "Add Vehicle"}
              </Button>
            </>
          }
        >
          <form onSubmit={handleCreateVehicle} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Make &amp; Model</label>
              <input
                type="text"
                value={newVehicleName}
                onChange={(e) => setNewVehicleName(e.target.value)}
                placeholder="e.g. Maruti Swift"
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Registration</label>
              <input
                type="text"
                value={newVehicleReg}
                onChange={(e) => setNewVehicleReg(e.target.value)}
                placeholder="KL-01-AB-1234"
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
export default RequestService;
