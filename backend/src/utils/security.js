const protectedFields = new Set([
  'password',
  'passwordHash',
  'role',
  'isAdmin',
  'isVerified',
  'approved',
  'balance',
  'earnings',
  'token',
  'jwt',
  'secret',
]);

const statusFlow = {
  REQUESTED: ['PARTNER_ACCEPTED', 'CANCELLED'],
  PARTNER_ACCEPTED: ['PARTNER_ARRIVING', 'CANCELLED'],
  PARTNER_ARRIVING: ['PARTNER_ARRIVED', 'CANCELLED'],
  PARTNER_ARRIVED: ['SERVICE_IN_PROGRESS', 'CANCELLED'],
  SERVICE_IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

export const sanitizeProtectedFields = (data = {}) => {
  if (!data || typeof data !== 'object') return {};

  return Object.fromEntries(
    Object.entries(data).filter(([key]) => !protectedFields.has(key) && key !== '_id'),
  );
};

export const isAllowedStatusTransition = (currentStatus, nextStatus) => {
  if (!currentStatus || !nextStatus) return false;
  return statusFlow[currentStatus]?.includes(nextStatus) ?? false;
};
