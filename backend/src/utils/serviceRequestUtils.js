export function normalizeCreateRequestPayload(payload = {}, user = {}) {
  const requestPayload = { ...payload };

  if (user && user._id) {
    requestPayload.owner = user._id;
  }

  delete requestPayload.assignedPartner;
  delete requestPayload.price;

  return requestPayload;
}
