import { useMemo, useState } from 'react';
import AccountSideNav from '../components/AccountSideNav';
import Icon from '../components/Icon';

function getLibraryType(product) {
  if (product.category === 'Books') return 'E-book';
  if (product.category === 'Movies & TV') return 'Movie';
  return 'Game';
}

function getPrimaryAction(product) {
  const libraryType = getLibraryType(product);
  if (libraryType === 'E-book') return 'Read Now';
  if (libraryType === 'Movie') return 'Watch Now';
  return 'Play Now';
}

function getSecondaryAction(product) {
  return getLibraryType(product) === 'Game' ? 'Install' : 'Download';
}

function getDateValue(dateText) {
  const time = new Date(dateText).getTime();
  return Number.isFinite(time) ? time : 0;
}

export default function MyLibraryPage({ ownedProducts, viewProduct, onDownloadProduct, defaultSort = 'Newest' }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [sort, setSort] = useState(defaultSort);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return ownedProducts
      .filter((product) => {
        const libraryType = getLibraryType(product);
        const matchesFilter =
          filter === 'all' ||
          filter === libraryType ||
          (filter === 'recent' && getDateValue(product.purchasedAt) > Date.now() - 1000 * 60 * 60 * 24 * 60) ||
          (filter === 'downloaded' && product.downloaded);
        const matchesType = type === 'All' || libraryType === type;
        const matchesSearch = !query ||
          String(product.productId || product.id).includes(query) ||
          product.title.toLowerCase().includes(query) ||
          product.orderId.toLowerCase().includes(query);

        return matchesFilter && matchesType && matchesSearch;
      })
      .sort((a, b) => (
        sort === 'Oldest'
          ? getDateValue(a.purchasedAt) - getDateValue(b.purchasedAt)
          : getDateValue(b.purchasedAt) - getDateValue(a.purchasedAt)
      ));
  }, [filter, ownedProducts, search, sort, type]);

  return (
    <main className="account-workspace page-shell">
      <section className="account-workspace-heading">
        <div>
          <span className="workspace-eyebrow">Digital collection</span>
          <h1>My Library</h1>
          <p>Your purchased books, games, and movies in one place.</p>
        </div>
        <div className="workspace-heading-stat">
          <strong>{ownedProducts.length}</strong>
          <span>Owned products</span>
        </div>
      </section>

      <div className="account-workspace-layout">
        <AccountSideNav filter={filter} onFilterChange={setFilter} />

        <section className="account-workspace-main" aria-labelledby="library-title">
          <div className="workspace-section-heading">
            <div>
              <span className="workspace-section-kicker">Collection</span>
              <h2 id="library-title">Purchased products</h2>
            </div>
            <span className="workspace-result-count">{visibleProducts.length} shown</span>
          </div>
          <form className="workspace-panel library-toolbar" onSubmit={(event) => event.preventDefault()}>
            <label className="workspace-field workspace-field-wide">
              <span>Search Library</span>
              <input
                aria-label="Search Library"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Title, product ID, order ID"
              />
            </label>
            <label className="workspace-field">
              <span>Type</span>
              <select aria-label="Library Type" value={type} onChange={(event) => setType(event.target.value)}>
                <option>All</option>
                <option>E-book</option>
                <option>Game</option>
                <option>Movie</option>
              </select>
            </label>
            <label className="workspace-field">
              <span>Sort</span>
              <select aria-label="Library Sort" value={sort} onChange={(event) => setSort(event.target.value)}>
                <option>Newest</option>
                <option>Oldest</option>
              </select>
            </label>
          </form>

          {visibleProducts.length ? (
            <div className="library-grid">
              {visibleProducts.map((product) => (
                <article className="owned-card" key={`${product.orderId}-${product.productId || product.id}`}>
                  <button className={`workspace-card-header workspace-card-header-${getLibraryType(product).toLowerCase()}`} type="button" onClick={() => viewProduct(product)} title={`View ${product.title}`}>
                    <span className="workspace-card-type">{getLibraryType(product)}</span>
                    <span className="workspace-card-id">Product #{product.productId || product.id}</span>
                    <Icon name="arrow" size={17} />
                  </button>
                  <div className="workspace-card-copy">
                    <div className="workspace-card-title-row">
                      <strong className="workspace-card-title">{product.title}</strong>
                      <span className={`library-state ${product.downloaded ? 'is-ready' : ''}`}>{product.downloaded ? 'Ready' : 'Online'}</span>
                    </div>
                    <span className="workspace-card-meta">{product.type}</span>
                    <div className="library-card-details">
                      <span><small>Purchased</small>{product.purchasedAt}</span>
                      <span><small>Order</small>{product.orderId}</span>
                      <span><small>License</small>{product.license}</span>
                    </div>
                  </div>
                  <div className="workspace-card-actions">
                    <button className="workspace-action-primary" type="button" onClick={() => viewProduct(product)}>
                      <Icon name="play" size={15} />
                      {getPrimaryAction(product)}
                    </button>
                    <button className="workspace-action-secondary" type="button" onClick={() => onDownloadProduct(product.productId || product.id)} disabled={product.downloaded}>
                      {product.downloaded ? 'Ready' : getSecondaryAction(product)}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="workspace-empty">
              <strong>No library items found</strong>
              <span>Complete checkout or adjust the current filter.</span>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
