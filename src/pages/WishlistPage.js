import { useMemo, useState } from 'react';
import Icon from '../components/Icon';

function getDisplayType(product) {
  if (product.category === 'Books') return 'E-book';
  if (product.category === 'Movies & TV') return 'Movie';
  return product.category.slice(0, -1) || product.category;
}

export default function WishlistPage({ wishlistProducts, products, viewProduct, onAddProductById, onMoveToCart, onRemove }) {
  const [search, setSearch] = useState('');
  const [productId, setProductId] = useState('');

  const visibleProducts = useMemo(() => (
    wishlistProducts.filter((product) => {
      const query = search.trim().toLowerCase();

      return !query ||
        String(product.id).includes(query) ||
        product.title.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.type.toLowerCase().includes(query);
    })
  ), [search, wishlistProducts]);

  function addByProductId(event) {
    event.preventDefault();

    if (onAddProductById(productId.trim())) {
      setProductId('');
    }
  }

  return (
    <main className="account-workspace page-shell">
      <section className="account-workspace-heading">
        <div>
          <span className="workspace-eyebrow">Account workspace</span>
          <h1>Wishlist</h1>
          <p>Keep track of the products you want to revisit.</p>
        </div>
        <div className="workspace-heading-stat">
          <strong>{wishlistProducts.length}</strong>
          <span>Saved items</span>
        </div>
      </section>

      <div className="account-workspace-layout account-workspace-layout-full">
        <section className="account-workspace-main" aria-labelledby="wishlist-title">
          <div className="workspace-section-heading">
            <div>
              <span className="workspace-section-kicker">Collection</span>
              <h2 id="wishlist-title">Saved items</h2>
            </div>
            <span className="workspace-result-count">{visibleProducts.length} shown</span>
          </div>

          <form className="workspace-panel wishlist-tools" onSubmit={addByProductId}>
            <label className="workspace-field workspace-field-wide">
              <span>Search Saved Items</span>
              <input
                aria-label="Search Saved Items"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Title or product ID"
              />
            </label>
            <label className="workspace-field">
              <span>Add Product ID</span>
              <input
                aria-label="Add Product ID"
                list="wishlist-product-ids"
                value={productId}
                onChange={(event) => setProductId(event.target.value)}
                placeholder="e.g. 1"
              />
            </label>
            <datalist id="wishlist-product-ids">
              {products.map((product) => <option value={product.id} key={product.id}>{product.title}</option>)}
            </datalist>
            <button className="workspace-action-primary workspace-toolbar-action" type="submit">
              <Icon name="heart" size={16} />
              Save product
            </button>
          </form>

          {visibleProducts.length ? (
            <div className="wishlist-grid">
              {visibleProducts.map((product) => (
                <article className="wishlist-card" key={product.id}>
                  <button className="workspace-card-header" type="button" onClick={() => viewProduct(product)} title={`View ${product.title}`}>
                    <span className="workspace-card-type">{getDisplayType(product)}</span>
                    <span className="workspace-card-id">Product #{product.id}</span>
                    <Icon name="arrow" size={17} />
                  </button>
                  <div className="workspace-card-copy">
                    <strong className="workspace-card-title">{product.title}</strong>
                    <span className="workspace-card-meta">{product.type}</span>
                    <div className="workspace-card-facts">
                      <strong>${Number(product.price || 0).toFixed(2)}</strong>
                      <span><strong>{Number(product.rating || 0).toFixed(1)}</strong> / 5 rating</span>
                    </div>
                  </div>
                  <div className="workspace-card-actions">
                    <button className="workspace-action-primary" type="button" onClick={() => onMoveToCart(product.id)}>
                      <Icon name="bag" size={15} />
                      Move to cart
                    </button>
                    <button className="workspace-action-secondary workspace-action-danger" type="button" onClick={() => onRemove(product.id)}>Remove</button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="workspace-empty">
              <strong>No saved items found</strong>
              <span>Add a product by ID or clear the search field.</span>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
