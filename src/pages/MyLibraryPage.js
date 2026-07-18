import { useEffect, useMemo, useState } from 'react';
import { fetchLibrary } from '../api/orders';
import AccountSideNav from '../components/AccountSideNav';
import Icon from '../components/Icon';
import ProductArt from '../components/ProductArt';

const filterLabels = {
  all: 'All Products',
  Books: 'My Books',
  Games: 'My Games',
  'Movies & TV': 'My Movies & TV',
};

function normalizeLibraryCategory(value) {
  const category = String(value || '').toLowerCase();
  if (category.includes('book')) return 'Books';
  if (category.includes('game')) return 'Games';
  if (category.includes('movie')) return 'Movies & TV';
  return 'Other';
}

export default function MyLibraryPage({ user, products, navigate, viewProduct, defaultSort = 'Newest' }) {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState(defaultSort);
  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState('');

  useEffect(() => {
    setSort(defaultSort);
  }, [defaultSort]);

  useEffect(() => {
    let ignore = false;
    if (!user) {
      setItems([]);
      setLoading(false);
      return () => { ignore = true; };
    }

    setLoading(true);
    fetchLibrary()
      .then((records) => {
        if (!ignore) {
          setItems(records);
          setError('');
        }
      })
      .catch((loadError) => {
        if (!ignore) setError(loadError.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => { ignore = true; };
  }, [user]);

  const mergedItems = useMemo(() => items.map((item) => {
    const mergedItem = {
      ...products.find((product) => String(product.id) === String(item.productId)),
      ...item,
      id: item.productId,
    };
    return {
      ...mergedItem,
      category: normalizeLibraryCategory(mergedItem.category),
    };
  }), [items, products]);

  const categoryCounts = useMemo(() => mergedItems.reduce((counts, item) => ({
    ...counts,
    all: counts.all + 1,
    [item.category]: Number(counts[item.category] || 0) + 1,
  }), {
    all: 0,
    Books: 0,
    Games: 0,
    'Movies & TV': 0,
  }), [mergedItems]);

  const libraryItems = useMemo(() => {
    const filtered = mergedItems.filter((item) => {
      const queryMatches = !query.trim() || item.title?.toLowerCase().includes(query.trim().toLowerCase());
      const filterMatches = filter === 'all' || item.category === filter;
      return queryMatches && filterMatches;
    });
    return sort === 'Oldest' ? [...filtered].reverse() : filtered;
  }, [filter, mergedItems, query, sort]);

  if (!user) {
    return (
      <main className="account-workspace page-shell">
        <div className="empty-state">
          <Icon name="lock" size={30} />
          <h3>Sign in to open My Library</h3>
          <p>Your library is generated from products in your StoreDB order history.</p>
          <button className="primary-button" onClick={() => navigate('account')}>Go to Account <Icon name="arrow" /></button>
        </div>
      </main>
    );
  }

  return (
    <main className="account-workspace page-shell">
      <section className="account-workspace-heading">
        <div>
          <span className="workspace-eyebrow">Digital collection</span>
          <h1>My Library</h1>
          <p>Products from your completed StoreDB orders.</p>
        </div>
        <div className="workspace-heading-stat">
          <strong>{mergedItems.length}</strong>
          <span>Owned products</span>
        </div>
      </section>
      <div className="account-workspace-layout">
        <AccountSideNav
          variant="library"
          filter={filter}
          onFilterChange={setFilter}
          counts={categoryCounts}
        />
        <section className="account-workspace-main" id="library-results" aria-live="polite">
          <div className="workspace-section-heading">
            <div>
              <span className="workspace-section-kicker">Collection</span>
              <h2>{filterLabels[filter]}</h2>
            </div>
            <span className="workspace-result-count">{libraryItems.length} shown</span>
          </div>
          <div className="workspace-panel library-toolbar">
            <label><span>Search Library</span><input aria-label="Search Library" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
            <label><span>Sort</span><select aria-label="Library Sort" value={sort} onChange={(event) => setSort(event.target.value)}><option>Newest</option><option>Oldest</option></select></label>
          </div>

          {loading && <div className="workspace-panel workspace-message">Loading purchased products...</div>}
          {error && <div className="workspace-panel workspace-error" role="alert">{error}</div>}
          {!loading && !error && !libraryItems.length && (
            <div className="workspace-panel workspace-message">
              No purchased products match {filterLabels[filter].toLowerCase()}.
            </div>
          )}

          <div className="library-grid">
            {libraryItems.map((item) => (
              <article className="owned-card" key={item.productId}>
                <ProductArt product={item} />
                <div className="workspace-card-copy">
                  <strong>{item.title}</strong>
                  <span>{item.category} / {item.type}</span>
                  <span>Owned quantity: {item.ownedQuantity}</span>
                  <span>Order: ORD-{item.orderId}</span>
                </div>
                <div className="workspace-card-actions">
                  <button type="button" onClick={() => viewProduct(item)}>View Product</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
