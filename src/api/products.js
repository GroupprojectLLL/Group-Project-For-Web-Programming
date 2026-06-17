import { products as demoProducts } from '../data';

const DEFAULT_API_BASE_URL = 'http://localhost:3001';
const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '');
const API_ROOT = `${API_BASE_URL}/api/inft3050`;

const ART_KEYS = [
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

const CATEGORY_BY_GENRE_ID = {
  1: 'E-books',
  2: 'Movies & TV',
  3: 'Games',
};

const SUBGENRE_FALLBACKS = {
  1: {
    1: 'Fiction',
    2: 'Historical Fiction',
    3: 'Fantasy/Sci-Fi',
    4: 'Young Adult',
    5: 'Humour',
    6: 'Crime',
    7: 'Mystery',
    8: 'Romance',
    9: 'Thriller',
  },
  2: {
    1: 'Drama',
    2: 'Comedy',
    3: 'Crime',
    4: 'Action',
    5: 'Horror',
    6: 'Family',
    7: 'Western',
    8: 'Documentary',
  },
  3: {
    1: 'RPG',
    2: 'Musical game',
    3: 'Puzzle game',
    4: 'Strategy',
    5: 'Platform',
    6: 'Action-adventure',
    7: 'Racing',
    8: 'Stealth',
    9: 'MMORPG',
    10: 'Survival',
    11: 'Simulation',
    12: 'Sports',
    13: 'First-person shooter',
    14: 'Fighting',
  },
};

const SUBGENRE_TABLE_BY_GENRE_ID = {
  1: 'BookGenre',
  2: 'MovieGenre',
  3: 'GameGenre',
};

function unwrapList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.list)) return payload.list;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

async function fetchTable(tableName) {
  const url = new URL(`${API_ROOT}/${encodeURIComponent(tableName)}`);
  url.searchParams.set('limit', '1000');

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`${tableName} API returned ${response.status}`);
  }

  return unwrapList(await response.json());
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function getGenreIdFromProduct(product, genreRows) {
  const genreValue = product.Genre ?? product.genre;

  if (typeof genreValue === 'number' || typeof genreValue === 'string') {
    return toNumber(genreValue);
  }

  if (genreValue && typeof genreValue === 'object') {
    const linkedGenreId = toNumber(genreValue.GenreID ?? genreValue.genreID ?? genreValue.id);
    if (linkedGenreId) return linkedGenreId;
  }

  const productId = toNumber(product.ID ?? product.id);
  const matchedGenre = genreRows.find((genre) => {
    const productList = genre['Product List'] || genre.products || [];
    return productList.some((linkedProduct) => toNumber(linkedProduct.ID ?? linkedProduct.id) === productId);
  });

  if (matchedGenre) {
    return toNumber(matchedGenre.GenreID ?? matchedGenre.genreID ?? matchedGenre.id);
  }

  if (productId >= 300) return 3;
  if (productId >= 200) return 2;
  return 1;
}

function normalizeCategory(product, genreRows) {
  const genreId = getGenreIdFromProduct(product, genreRows);
  const genre = genreRows.find((row) => toNumber(row.GenreID ?? row.genreID ?? row.id) === genreId);
  const genreName = String(genre?.Name || '').toLowerCase();

  if (genreName.includes('book')) return 'E-books';
  if (genreName.includes('movie')) return 'Movies & TV';
  if (genreName.includes('game')) return 'Games';

  return CATEGORY_BY_GENRE_ID[genreId] || 'E-books';
}

function normalizeSubCategory(product, genreId, subGenreRowsByGenreId) {
  const subGenreId = toNumber(product.SubGenre ?? product.subGenre);
  const rows = subGenreRowsByGenreId[genreId] || [];
  const matchedSubGenre = rows.find((row) => toNumber(row.subGenreID ?? row.SubGenreID ?? row.id) === subGenreId);

  return matchedSubGenre?.Name || SUBGENRE_FALLBACKS[genreId]?.[subGenreId] || 'General';
}

function getStockInfo(stockRows, productId) {
  const matchingStock = stockRows.filter((row) => toNumber(row.ProductId ?? row.productId) === productId);
  const prices = matchingStock
    .map((row) => toNumber(row.Price ?? row.price))
    .filter((price) => price > 0);

  const quantity = matchingStock.reduce((total, row) => total + toNumber(row.Quantity ?? row.quantity), 0);
  const price = prices.length ? Math.min(...prices) : demoProducts[(productId - 1) % demoProducts.length]?.price || 9.99;

  return {
    price,
    quantity,
  };
}

function normalizeProduct(product, stockRows, genreRows, subGenreRowsByGenreId, index) {
  const id = toNumber(product.ID ?? product.id, index + 1);
  const genreId = getGenreIdFromProduct(product, genreRows);
  const stock = getStockInfo(stockRows, id);
  const price = Number(stock.price.toFixed(2));
  const subCategory = normalizeSubCategory(product, genreId, subGenreRowsByGenreId);

  return {
    id,
    title: product.Name || product.title || 'Untitled product',
    category: normalizeCategory(product, genreRows),
    type: subCategory,
    subCategory,
    creator: product.Author || product.creator || '',
    price,
    oldPrice: Number((price * 1.25).toFixed(2)),
    rating: Number((4.4 + (id % 5) * 0.1).toFixed(1)),
    reviews: 120 + ((id * 137) % 4800),
    badge: stock.quantity > 0 ? `${stock.quantity} in stock` : 'Database item',
    art: ART_KEYS[index % ART_KEYS.length],
    description: product.Description || product.description || 'No description is available for this product.',
    published: product.Published,
    stockQuantity: stock.quantity,
    raw: product,
  };
}

export async function fetchProducts() {
  const [productRows, stockRows, genreRows, bookGenreRows, movieGenreRows, gameGenreRows] = await Promise.all([
    fetchTable('Product'),
    fetchTable('Stocktake').catch(() => []),
    fetchTable('Genre').catch(() => []),
    fetchTable(SUBGENRE_TABLE_BY_GENRE_ID[1]).catch(() => []),
    fetchTable(SUBGENRE_TABLE_BY_GENRE_ID[2]).catch(() => []),
    fetchTable(SUBGENRE_TABLE_BY_GENRE_ID[3]).catch(() => []),
  ]);

  if (!productRows.length) {
    throw new Error('Product API returned no products');
  }

  const subGenreRowsByGenreId = {
    1: bookGenreRows,
    2: movieGenreRows,
    3: gameGenreRows,
  };

  return productRows.map((product, index) => normalizeProduct(product, stockRows, genreRows, subGenreRowsByGenreId, index));
}

export { API_ROOT };
