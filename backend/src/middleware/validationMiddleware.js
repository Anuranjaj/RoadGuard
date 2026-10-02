export const validateObjectId = (paramName) => (req, res, next) => {
  const value = req.params[paramName];
  if (!value || !/^[0-9a-fA-F]{24}$/.test(value)) {
    return res.status(400).json({ success: false, message: `Invalid ${paramName}` });
  }
  next();
};

export const validateServiceRequestStatus = (req, res, next) => {
  const statuses = [
    'REQUESTED',
    'PARTNER_ACCEPTED',
    'PARTNER_ARRIVING',
    'PARTNER_ARRIVED',
    'SERVICE_IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
  ];

  const { status } = req.body;

  if (status && !statuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid service request status' });
  }

  next();
};
