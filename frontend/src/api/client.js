/**
 * Schlanker API-Client für das Tradelater-Backend.
 *
 * Authentifizierung erfolgt im Prototyp über den `x-user-id`-Header (siehe
 * backend/src/middleware/auth.js). setAuthUser() wird vom AuthContext gesetzt.
 */
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

let currentUserId = null;

export function setAuthUser(userId) {
  currentUserId = userId;
}

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(currentUserId ? { 'x-user-id': currentUserId } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const error = new Error(data.message || data.error || `HTTP ${res.status}`);
    error.status = res.status;
    error.payload = data;
    throw error;
  }
  return data;
}

export const api = {
  // Auth
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),

  // Produkte
  discover: (q = '', category = '') =>
    request(`/products?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}`),
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (payload) => request('/products', { method: 'POST', body: payload }),
  updateProduct: (id, payload) => request(`/products/${id}`, { method: 'PATCH', body: payload }),
  adjustStock: (id, delta) => request(`/products/${id}/stock`, { method: 'POST', body: { delta } }),
  setProductStatus: (id, status) => request(`/products/${id}/status`, { method: 'POST', body: { status } }),
  boostProduct: (id, hours = 24) => request(`/products/${id}/boost`, { method: 'POST', body: { hours } }),

  // Offerten / Verhandlung
  makeOffer: (payload) => request('/offers', { method: 'POST', body: payload }),
  myOffers: () => request('/offers'),
  counterOffer: (id, payload) => request(`/offers/${id}/counter`, { method: 'POST', body: payload }),
  acceptOffer: (id) => request(`/offers/${id}/accept`, { method: 'POST' }),
  rejectOffer: (id) => request(`/offers/${id}/reject`, { method: 'POST' }),

  // Bestellungen / Treuhand
  checkout: (payload) => request('/orders/checkout', { method: 'POST', body: payload }),
  myOrders: () => request('/orders/mine'),
  sellingOrders: () => request('/orders/selling'),
  getOrder: (id) => request(`/orders/${id}`),
  shipOrder: (id, payload) => request(`/orders/${id}/ship`, { method: 'POST', body: payload }),
  confirmReceipt: (id) => request(`/orders/${id}/confirm`, { method: 'POST' }),
  disputeOrder: (id, reason) => request(`/orders/${id}/dispute`, { method: 'POST', body: { reason } }),

  // Payments
  escrowInfo: () => request('/payments/escrow/info'),
  onboardSeller: () => request('/payments/connect/onboard', { method: 'POST' }),

  // Logistik
  getShipment: (id) => request(`/logistics/${id}`),

  // Ads
  bookAd: (payload) => request('/ads', { method: 'POST', body: payload }),
  myAds: () => request('/ads/mine'),

  // Admin
  adminUsers: () => request('/admin/users'),
  adminEscrow: () => request('/admin/escrow'),
  adminReports: () => request('/admin/reports'),
  adminShipments: () => request('/admin/shipments'),
  adminOffers: () => request('/admin/offers'),
  adminAds: () => request('/admin/ads'),
  adminSetAdStatus: (id, status) => request(`/admin/ads/${id}/status`, { method: 'POST', body: { status } }),
  adminSeo: () => request('/admin/seo'),
  adminUpdateSeo: (payload) => request('/admin/seo', { method: 'PUT', body: payload }),
  adminRefund: (orderId, reason) => request(`/admin/orders/${orderId}/refund`, { method: 'POST', body: { reason } }),
  adminSetUserActive: (id, isActive) => request(`/admin/users/${id}/active`, { method: 'POST', body: { is_active: isActive } }),
};

export default api;
