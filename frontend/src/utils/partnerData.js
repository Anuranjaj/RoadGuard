const statusLabels = {
  REQUESTED: "Requested",
  PARTNER_ACCEPTED: "Accepted",
  PARTNER_ARRIVING: "On The Way",
  PARTNER_ARRIVED: "Arrived",
  SERVICE_IN_PROGRESS: "Service In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const partnerActiveStatuses = [
  "PARTNER_ACCEPTED",
  "PARTNER_ARRIVING",
  "PARTNER_ARRIVED",
  "SERVICE_IN_PROGRESS",
];

export function serviceName(serviceId, services = []) {
  return services.find((service) => service.id === serviceId)?.name || serviceId || "Service";
}

export function serviceRequestTotal(request) {
  return (
    Number(request.price || 0) +
    (request.additionalCharges || []).reduce((total, charge) => total + Number(charge.amount || 0), 0)
  );
}

function distanceKm(request, partnerLocation) {
  const [longitude, latitude] = partnerLocation?.coordinates || [];
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    (latitude === 0 && longitude === 0) ||
    !Number.isFinite(request.latitude) ||
    !Number.isFinite(request.longitude)
  ) {
    return null;
  }

  const radians = (degrees) => (degrees * Math.PI) / 180;
  const latitudeDelta = radians(request.latitude - latitude);
  const longitudeDelta = radians(request.longitude - longitude);
  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(latitude)) *
      Math.cos(radians(request.latitude)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function relativeTime(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

export function normalizePartnerRequest(request, services = [], partnerLocation) {
  const id = String(request._id || request.id || "");
  const owner = request.owner && typeof request.owner === "object" ? request.owner : {};
  const vehicle = request.vehicle && typeof request.vehicle === "object" ? request.vehicle : {};
  const createdAt = request.createdAt;
  const requestDate = new Date(request.completedAt || request.updatedAt || createdAt);

  return {
    ...request,
    id,
    requestCode: request.requestNumber || `REQ-${id.slice(-8).toUpperCase()}`,
    customer: owner.name || "Customer",
    phone: owner.phone || "",
    vehicleName: vehicle.name || "Vehicle",
    registration: vehicle.registration || "",
    service: request.serviceCategory,
    serviceLabel: serviceName(request.serviceCategory, services),
    statusLabel: statusLabels[request.status] || request.status || "Unknown",
    location: request.pickupLocation || "",
    notes: request.description || "",
    distanceKm: distanceKm(request, partnerLocation),
    requestedAt: relativeTime(createdAt),
    date: Number.isNaN(requestDate.getTime())
      ? ""
      : new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(
          requestDate,
        ),
    amount: serviceRequestTotal(request),
  };
}

export function isAssignedPartnerRequest(request) {
  return Boolean(request.assignedPartner?._id || request.assignedPartner);
}