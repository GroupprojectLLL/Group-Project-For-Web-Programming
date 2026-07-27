import { apiRequest } from './client';

export async function fetchCurrentUser() {
  const payload = await apiRequest('/session');
  return payload.user || null;
}

export async function loginUser(identifier, password) {
  const payload = await apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  });
  return payload.user;
}

export async function registerUser(account) {
  const payload = await apiRequest('/register', {
    method: 'POST',
    body: JSON.stringify(account),
  });
  return payload.user;
}

export async function logoutUser() {
  await apiRequest('/logout', { method: 'POST' });
}

export async function updateCurrentUser(profile) {
  const payload = await apiRequest('/me', {
    method: 'PUT',
    body: JSON.stringify(profile),
  });
  return payload.user;
}

export async function savePaymentMethod(paymentMethod) {
  const payload = await apiRequest('/me/payment-method', {
    method: 'PUT',
    body: JSON.stringify(paymentMethod),
  });
  return payload.paymentMethod;
}
