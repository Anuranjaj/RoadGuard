import { clearSessionAndRedirect, getSession } from '@/utils/helpers';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getFriendlyMessage = (message) => {
  if (!message) return 'Something went wrong. Please try again.';

  const lower = message.toLowerCase();
  if (lower.includes('jwt') || lower.includes('token') || lower.includes('expired') || lower.includes('not authorized')) {
    return 'Your session has expired. Please log in again.';
  }
  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return 'Unable to reach the server. Please check your connection and try again.';
  }
  if (lower.includes('duplicate') || lower.includes('already exists')) {
    if (lower.includes('vehicle')) {
      return 'A vehicle with this registration number is already registered to your account.';
    }
    return 'An account with this email or phone number already exists.';
  }
  if (lower.includes('validation') || lower.includes('invalid')) {
    return 'Please check your details and try again.';
  }

  return message;
};

async function apiRequest(endpoint, { method = 'GET', body, token, redirectOnUnauthorized = true } = {}) {
  const session = getSession();
  const authToken = token || session?.token;
  const headers = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new Error('Unable to reach the server. Please check your connection and try again.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = getFriendlyMessage(data.message || 'Request failed');
    if (response.status === 401 && redirectOnUnauthorized) {
      clearSessionAndRedirect();
    }
    throw new Error(message);
  }

  return data;
}

export const authApi = {
  register: (payload) => apiRequest('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => apiRequest('/auth/login', { method: 'POST', body: payload, redirectOnUnauthorized: false }),
  me: (token) => apiRequest('/auth/me', { token }),
};

export const vehicleApi = {
  list: (token) => apiRequest('/vehicles', { token }),
  create: (payload, token) => apiRequest('/vehicles', { method: 'POST', body: payload, token }),
  update: (id, payload, token) => apiRequest(`/vehicles/${id}`, { method: 'PUT', body: payload, token }),
  remove: (id, token) => apiRequest(`/vehicles/${id}`, { method: 'DELETE', token }),
};

export const serviceApi = {
  list: () => apiRequest('/services'),
};

export const requestApi = {
  list: (token) => apiRequest('/service-requests', { token }),
  create: (payload, token) => apiRequest('/service-requests', { method: 'POST', body: payload, token }),
  accept: (id, token) => apiRequest(`/service-requests/${id}/accept`, { method: 'POST', token }),
  pass: (id, token) => apiRequest(`/service-requests/${id}/pass`, { method: 'POST', token }),
  updateCharges: (id, charges, token) => apiRequest(`/service-requests/${id}/charges`, { method: 'PATCH', body: { charges }, token }),
  cancel: (id, payload, token) => apiRequest(`/service-requests/${id}/cancel`, { method: 'POST', body: payload, token }),
  updateStatus: (id, payload, token) => apiRequest(`/service-requests/${id}/status`, { method: 'PATCH', body: payload, token }),
};

export const notificationApi = {
  list: (token) => apiRequest('/notifications', { token }),
  markRead: (id, token) => apiRequest(`/notifications/${id}/read`, { method: 'PATCH', token }),
  markAllRead: (token) => apiRequest('/notifications/read-all', { method: 'PATCH', token }),
};

export const partnerApi = {
  list: (token) => apiRequest('/partners', { token }),
  nearby: (query, token) => apiRequest(`/partners/nearby?${new URLSearchParams(query).toString()}`, { token }),
  me: (token) => apiRequest('/partners/me', { token }),
  updateProfile: (payload, token) => apiRequest('/partners/me', { method: 'PATCH', body: payload, token }),
  updateAvailability: (availability, token) => apiRequest('/partners/me/availability', { method: 'PATCH', body: { availability }, token }),
  payouts: (token) => apiRequest('/partners/me/payouts', { token }),
  requestPayout: (amount, token) => apiRequest('/partners/me/payouts', { method: 'POST', body: { amount }, token }),
};

export const adminApi = {
  metrics: (token) => apiRequest('/admin/metrics', { token }),
  users: (token) => apiRequest('/admin/users', { token }),
  updateUserStatus: (id, isActive, token) => apiRequest(`/admin/users/${id}/status`, { method: 'PATCH', body: { isActive }, token }),
  partners: (token) => apiRequest('/admin/partners', { token }),
  updatePartnerVerification: (id, isVerified, token) => apiRequest(`/admin/partners/${id}/verification`, { method: 'PATCH', body: { isVerified }, token }),
  requests: (token) => apiRequest('/admin/requests', { token }),
  complaints: (token) => apiRequest('/admin/complaints', { token }),
  analytics: (token) => apiRequest('/admin/analytics', { token }),
};

export const complaintApi = {
  update: (id, payload, token) => apiRequest(`/complaints/${id}`, { method: 'PATCH', body: payload, token }),
};

export default API_BASE_URL;
