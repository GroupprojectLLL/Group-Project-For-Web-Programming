const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';
const PRODUCT_ENDPOINT = `${API_BASE_URL}/api/inft3050/Product`;
const artStyles = [
  'nebula',
  'quiet',
  'apex',
  'signal',
  'solaris',
  'calm',
  'night',
  'parallel',
  'weekend',
  'neon',
  'worlds',
  'habit',
];

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.list)) return value.list;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.$values)) return value.$values;
  if (value && typeof value === 'object') return [value];
  return [];
}

function toNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function readGenre(product) {
  return (
    product.Genre?.Name ??
    product.Genre?.ID ??
    product.Genre?.Id ??
    product.GenreName ??
    product.genreName ??
    product.GenreID ??
    product.GenreId ??
    product.Genre ??
    product.genre ??
    ''
  );
}

function normalizeCategory(product) {
  const raw =
    product.Category ??
    product.category ??
    product.ProductCategory ??
    product.productCategory ??
    readGenre(product);
  const normalized = String(raw).toLowerCase();

  if (normalized.includes('game') || normalized === '3') return 'Games';
  if (normalized.includes('movie') || normalized.includes('tv') || normalized === '2') {
    return 'Movies & TV';
  }
  if (normalized.includes('book') || normalized.includes('ebook') || normalized === '1') {
    return 'E-books';
  }

  return 'E-books';
}

function readStockItem(product, key) {
  return asArray(product['Stocktake List'])
    .map((item) => item?.[key] ?? item?.[key.toLowerCase()])
    .find((value) => value !== null && value !== undefined);
}

export function normalizeProduct(product, index) {
  const id = product.ID ?? product.Id ?? product.id ?? index + 1;
  const category = normalizeCategory(product);
  const genre = readGenre(product);
  const price = toNumber(
    readStockItem(product, 'Price') ??
      product.Price ??
      product.price ??
      product.UnitPrice ??
      product.unitPrice,
    19.99
  );
  const oldPrice = toNumber(product.OldPrice ?? product.oldPrice, Number((price * 1.6).toFixed(2)));
  const rating = toNumber(product.Rating ?? product.rating, 4.6);

  return {
    id,
    title: product.Name ?? product.name ?? product.Title ?? product.title ?? `Product ${id}`,
    category,
    type:
      product.Type ??
      product.type ??
      product.SubGenre ??
      product.subGenre ??
      (typeof genre === 'string' && genre ? genre : category),
    price,
    oldPrice: Math.max(oldPrice, price),
    rating,
    reviews: toNumber(product.Reviews ?? product.reviews ?? product.ReviewCount ?? product.reviewCount, 0),
    badge: product.Badge ?? product.badge ?? (toNumber(readStockItem(product, 'Quantity'), 1) > 0 ? 'Available' : 'Sold out'),
    art: product.Art ?? product.art ?? artStyles[index % artStyles.length],
    description:
      product.Description ??
      product.description ??
      'Digital entertainment product available through zehaoshangou.',
  };
}

export async function fetchProducts() {
  const response = await fetch(PRODUCT_ENDPOINT, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Product API returned ${response.status}`);
  }

  const payload = await response.json();
  return asArray(payload.list ?? payload).map(normalizeProduct);
}
