export function getCartItemQuantity(item) {
  return Number(item.quantity || 1);
}

export function getCartLineTotal(item) {
  return Number(item.price || 0) * getCartItemQuantity(item);
}

export function getOrderTotals(items) {
  const subtotal = items.reduce((sum, product) => sum + getCartLineTotal(product), 0);
  const discount = subtotal >= 50 ? subtotal * 0.1 : 0;
  const tax = 0;
  return {
    subtotal,
    discount,
    tax,
    total: subtotal + tax - discount,
  };
}
