const WISHLIST_KEY_PREFIX = 'zhsg-wishlist';

function storageKey(userId) {
  if (!userId) throw new Error('A signed-in account is required');
  return `${WISHLIST_KEY_PREFIX}-${userId}`;
}

function readItems(userId) {
  try {
    const value = window.localStorage.getItem(storageKey(userId));
    const items = value ? JSON.parse(value) : [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

function writeItems(userId, items) {
  window.localStorage.setItem(storageKey(userId), JSON.stringify(items));
}

export async function fetchWishlist(userId) {
  return readItems(userId);
}

export async function saveWishlistItem(userId, productId) {
  const items = readItems(userId);
  const exists = items.some((item) => String(item.productId) === String(productId));
  if (exists) return { created: false };

  writeItems(userId, [
    { productId: Number(productId), createdAt: new Date().toISOString() },
    ...items,
  ]);
  return { created: true };
}

export async function removeWishlistItem(userId, productId) {
  const items = readItems(userId);
  const remaining = items.filter((item) => String(item.productId) !== String(productId));
  writeItems(userId, remaining);
  return { removed: remaining.length !== items.length };
}
