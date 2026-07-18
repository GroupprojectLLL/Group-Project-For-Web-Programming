const DEFAULT_API_BASE_URL = 'http://localhost:3001';
const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '');

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || `Account workspace API returned ${response.status}`);
  }

  return payload;
}

function customerQuery(customerId) {
  return `customerId=${encodeURIComponent(customerId || 'guest')}`;
}

export async function fetchAccountWorkspace(customerId) {
  return requestJson(`/account/workspace?${customerQuery(customerId)}`);
}

export async function saveWishlistProduct(customerId, productId) {
  return requestJson('/account/wishlist', {
    method: 'POST',
    body: JSON.stringify({ customerId, productId }),
  });
}

export async function deleteWishlistProduct(customerId, productId) {
  return requestJson(`/account/wishlist/${encodeURIComponent(productId)}?${customerQuery(customerId)}`, {
    method: 'DELETE',
  });
}

export async function saveAccountOrder(customerId, order) {
  return requestJson('/account/orders', {
    method: 'POST',
    body: JSON.stringify({ customerId, order }),
  });
}

export async function saveRefundRequest(customerId, orderId) {
  return requestJson(`/account/orders/${encodeURIComponent(orderId)}/refund`, {
    method: 'PATCH',
    body: JSON.stringify({ customerId }),
  });
}

export async function saveDownloadedProduct(customerId, productId) {
  return requestJson('/account/downloads', {
    method: 'POST',
    body: JSON.stringify({ customerId, productId }),
  });
}
