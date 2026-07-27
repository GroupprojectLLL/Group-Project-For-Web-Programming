import { apiRequest } from './client';

function getQuantity(item) {
  const quantity = Number(item.quantity || 1);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
}

// Builds the checkout payload expected by the authenticated order endpoint.
export async function createOrder(order) {
  return apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify({
      paymentMethod: order.paymentMethod,
      address: order.address || {},
      items: order.items.map((item) => ({
        productId: item.id,
        stockItemId: item.stockItemId,
        quantity: getQuantity(item),
      })),
    }),
  });
}

export async function fetchOrders() {
  const payload = await apiRequest('/orders');
  return Array.isArray(payload.orders) ? payload.orders : [];
}

export async function fetchOrder(orderId) {
  const payload = await apiRequest(`/orders/${encodeURIComponent(orderId)}`);
  return payload.order;
}

export async function fetchLibrary() {
  const payload = await apiRequest('/library');
  return Array.isArray(payload.items) ? payload.items : [];
}
