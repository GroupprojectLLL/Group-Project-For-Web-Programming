import { useEffect, useMemo, useState } from 'react';
import Icon from '../components/Icon';
import ProductCard from '../components/ProductCard';

const PRODUCTS_PER_PAGE = 10;

// Keeps large StoreDB result sets readable while preserving first and last page links.
function buildPaginationItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
  return [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b)
    .reduce((items, page, index, sortedPages) => {
      if (index > 0 && page - sortedPages[index - 1] > 1) {
        items.push(`gap-${page}`);
      }
      items.push(page);
      return items;
    }, []);
}

export default function ListingPage({ category, subCategory, search, viewProduct, addToCart, products, canShop = true }) {
  const [sort, setSort] = useState('Popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('list');
  const hasRatings = products.some((product) => (
    product.rating !== null
    && product.rating !== undefined
    && product.reviews !== null
    && product.reviews !== undefined
    && Number.isFinite(Number(product.rating))
    && Number.isFinite(Number(product.reviews))
  ));

  const visibleProducts = useMemo(() => {
    let result = products.filter((product) =>
      (category === 'All products' || product.category === category) &&
      (subCategory === 'All subcategories' || product.subCategory === subCategory || product.type === subCategory) &&
      (!search || product.title.toLowerCase().includes(search.toLowerCase()))
    );
    if (sort === 'Price: Low') result = [...result].sort((a, b) => a.price - b.price);
    if (sort === 'Rating') result = [...result].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    return result;
  }, [category, products, search, sort, subCategory]);

  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / PRODUCTS_PER_PAGE));
  const pageStartIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  // Only the current page slice is rendered, while filtering still uses the full result set.
  const paginatedProducts = visibleProducts.slice(pageStartIndex, pageStartIndex + PRODUCTS_PER_PAGE);
  const paginationItems = buildPaginationItems(currentPage, totalPages);
  const firstShownItem = visibleProducts.length ? pageStartIndex + 1 : 0;
  const lastShownItem = Math.min(pageStartIndex + PRODUCTS_PER_PAGE, visibleProducts.length);

  // A new browsing context should always start from the first page.
  useEffect(() => {
    setCurrentPage(1);
  }, [category, search, sort, subCategory]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  useEffect(() => {
    if (!hasRatings && sort === 'Rating') setSort('Popular');
  }, [hasRatings, sort]);

  const goToPage = (page) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const listingTitle = search ? `Results for "${search}"` : subCategory !== 'All subcategories' ? subCategory : category;
  const listingDescription = visibleProducts.length === 0
    ? 'No matching titles are available for the current search or filter.'
    : subCategory !== 'All subcategories' && category !== 'All products'
      ? `${visibleProducts.length} ${subCategory} titles in ${category}. Showing ${firstShownItem}-${lastShownItem} of ${visibleProducts.length}.`
      : `${visibleProducts.length} hand-picked titles ready to download. Showing ${firstShownItem}-${lastShownItem} of ${visibleProducts.length}.`;

  return (
    <main className="listing-page page-shell">
      <div className="listing-title">
        <div><span className="eyebrow">The digital shelf</span><h1>{listingTitle}</h1><p>{listingDescription}</p></div>
        <div className="listing-controls">
          <label className="sort-select">Sort by:<select value={sort} onChange={(event) => setSort(event.target.value)}><option>Popular</option>{hasRatings && <option>Rating</option>}<option>Price: Low</option></select><Icon name="chevron" size={14} /></label>
          <button
            className="view-mode"
            type="button"
            aria-label={viewMode === 'list' ? 'Show product grid' : 'Show product list'}
            title={viewMode === 'list' ? 'Show product grid' : 'Show product list'}
            onClick={() => setViewMode((mode) => mode === 'list' ? 'grid' : 'list')}
          >
            <Icon name={viewMode === 'list' ? 'grid' : 'menu'} size={18} />
          </button>
        </div>
      </div>
      <div className="listing-layout">
        <section>
          {visibleProducts.length ? (
            <div className={`listing-grid listing-grid-${viewMode}`}>
              {paginatedProducts.map((product) => <ProductCard product={product} onView={viewProduct} onAdd={addToCart} canPurchase={canShop} layout={viewMode === 'list' ? 'row' : 'grid'} key={product.id} />)}
            </div>
          ) : (
            <div className="empty-state"><Icon name="search" size={30} /><h3>No titles found</h3><p>Try clearing a filter or searching for something else.</p></div>
          )}
          {totalPages > 1 && (
            <nav className="pagination" aria-label="Product listing pages">
              <button type="button" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous product page"><Icon name="arrow" size={16} /></button>
              {paginationItems.map((item) => (
                typeof item === 'number'
                  ? (
                    <button type="button" className={item === currentPage ? 'active' : ''} onClick={() => goToPage(item)} aria-current={item === currentPage ? 'page' : undefined} key={item}>
                      {item}
                    </button>
                  )
                  : <span key={item}>...</span>
              ))}
              <button type="button" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Next product page"><Icon name="arrow" size={16} /></button>
            </nav>
          )}
        </section>
      </div>
    </main>
  );
}
