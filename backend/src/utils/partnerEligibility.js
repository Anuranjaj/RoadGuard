export const ACTIVE_PARTNER_JOB_STATUSES = [
  'REQUESTED',
  'PARTNER_ACCEPTED',
  'PARTNER_ARRIVING',
  'PARTNER_ARRIVED',
  'SERVICE_IN_PROGRESS',
];

export const getPartnerSearchRadiusMeters = () => {
  const configuredRadius = Number(process.env.PARTNER_SEARCH_RADIUS_METERS);
  return Number.isFinite(configuredRadius) && configuredRadius > 0 ? configuredRadius : 15000;
};

export const normalizeServiceCategory = (value) =>
  typeof value === 'string' ? value.toLowerCase().replace(/[^a-z0-9]/g, '') : '';

export const getServiceCategoryKeys = (service) =>
  new Set([service.id, service.name].map(normalizeServiceCategory));

export const partnerOffersService = (categories, serviceKeys) =>
  (categories || []).some((category) => serviceKeys.has(normalizeServiceCategory(category)));

export const hasUsablePartnerLocation = (partner) => {
  const [longitude, latitude] = partner.location?.coordinates || [];
  return Number.isFinite(latitude) &&
    latitude >= -90 && latitude <= 90 &&
    Number.isFinite(longitude) &&
    longitude >= -180 && longitude <= 180 &&
    (latitude !== 0 || longitude !== 0);
};

export const distanceMetersBetween = (origin, destination) => {
  const radians = (degrees) => (degrees * Math.PI) / 180;
  const latitudeDelta = radians(destination.latitude - origin.latitude);
  const longitudeDelta = radians(destination.longitude - origin.longitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(origin.latitude)) *
      Math.cos(radians(destination.latitude)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
};