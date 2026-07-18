import { apiRequest } from './client';

export async function fetchStaffSummary() {
  const payload = await apiRequest('/staff/summary');
  return payload.summary;
}

export async function fetchStaffProducts() {
  const payload = await apiRequest('/staff/products');
  return Array.isArray(payload.products) ? payload.products : [];
}

export async function fetchStaffUsers() {
  const payload = await apiRequest('/staff/users');
  return Array.isArray(payload.users) ? payload.users : [];
}
