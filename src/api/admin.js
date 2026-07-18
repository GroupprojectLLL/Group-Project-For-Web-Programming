import { apiRequest } from './client';

export async function fetchAdminSummary() {
  const payload = await apiRequest('/admin/summary');
  return payload.summary;
}

export async function fetchAdminProducts() {
  const payload = await apiRequest('/admin/products');
  return payload.products || [];
}

export async function fetchAdminProductOptions() {
  const payload = await apiRequest('/admin/product-options');
  return payload.genres || [];
}

export async function createAdminProduct(product) {
  return apiRequest('/admin/products', {
    method: 'POST',
    body: JSON.stringify(product),
  });
}

export async function updateAdminProduct(productId, product) {
  return apiRequest(`/admin/products/${encodeURIComponent(productId)}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  });
}

export async function deleteAdminProduct(productId) {
  return apiRequest(`/admin/products/${encodeURIComponent(productId)}`, { method: 'DELETE' });
}

export async function fetchAdminUsers() {
  const payload = await apiRequest('/admin/users');
  return payload.users || [];
}

export async function createAdminUser(user) {
  const payload = await apiRequest('/admin/users', {
    method: 'POST',
    body: JSON.stringify(user),
  });
  return payload.user;
}

export async function updateAdminUser(userId, user) {
  const payload = await apiRequest(`/admin/users/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    body: JSON.stringify(user),
  });
  return payload.user;
}

export async function deleteAdminUser(userId) {
  return apiRequest(`/admin/users/${encodeURIComponent(userId)}`, { method: 'DELETE' });
}
