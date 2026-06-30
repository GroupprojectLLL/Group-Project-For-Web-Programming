const DEFAULT_API_BASE_URL = 'http://localhost:3001';
const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '');

function getQuantity(item) {
  const quantity = Number(item.quantity || 1);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
}

export async function createOrder(order) {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      customerId: order.user?.customerId || order.user?.id || null,
      paymentMethod: order.paymentMethod,
      totals: {
        subtotal: order.subtotal,
        discount: order.discount,
        tax: order.tax,
        total: order.total,
      },
      items: order.items.map((item) => ({
        productId: item.id,
        stockItemId: item.stockItemId,
        quantity: getQuantity(item),
      })),
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || `Order API returned ${response.status}`);
  }

  return payload;
}
