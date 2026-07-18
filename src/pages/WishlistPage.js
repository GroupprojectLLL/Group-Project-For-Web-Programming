import { useEffect, useMemo, useState } from 'react';
import { fetchWishlist, removeWishlistItem } from '../api/wishlist';
import AccountSideNav from '../components/AccountSideNav';
import Icon from '../components/Icon';
import ProductArt from '../components/ProductArt';

export default function WishlistPage({ user, products, addToCart, viewProduct, navigate }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busyProductId, setBusyProductId] = useState(null);

  useEffect(() => {
    let ignore = false;
    if (!user) {
      setItems([]);
      setLoading(false);
      return () => { ignore = true; };
    }

    setLoading(true);
    fetchWishlist(user.id)
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

  const visibleItems = useMemo(() => items.map((item) => ({
    ...products.find((product) => String(product.id) === String(item.productId)),
    ...item,
    id: item.productId,
  })), [items, products]);

  async function removeItem(product) {
    setBusyProductId(product.id);
    setError('');
    setMessage('');
    try {
      await removeWishlistItem(user.id, product.id);
      setItems((current) => current.filter((item) => String(item.productId) !== String(product.id)));
      setMessage(`${product.title} removed from your wishlist.`);
      return true;
    } catch (removeError) {
      setError(removeError.message);
      return false;
    } finally {
      setBusyProductId(null);
    }
  }

  async function moveToCart(product) {
    if (await removeItem(product)) {
      addToCart(product);
    }
  }

  if (!user) {
    return (
      <main className="account-workspace page-shell">
        <div className="empty-state">
          <Icon name="lock" size={30} />
          <h3>Sign in to use your wishlist</h3>
          <p>Saved products are kept for this account in the current browser.</p>
          <button className="primary-button" onClick={() => navigate('account')}>Go to Account <Icon name="arrow" /></button>
        </div>
      </main>
    );
  }

  return (
    <main className="account-workspace page-shell">
      <section className="account-workspace-heading"><h1>Wishlist</h1></section>

      <div className="account-workspace-layout">
        <AccountSideNav active="wishlist" navigate={navigate} />
        <section className="account-workspace-main">
          <div className="workspace-section-label">Saved Items</div>
          {loading && <div className="workspace-panel workspace-message">Loading your saved products...</div>}
          {error && <div className="workspace-panel workspace-error" role="alert">{error}</div>}
          {message && <div className="workspace-panel workspace-success">{message}</div>}
          {!loading && !error && !visibleItems.length && (
            <div className="empty-state">
              <Icon name="heart" size={30} />
              <h3>Your wishlist is empty</h3>
              <p>Open a product and select Add to wishlist.</p>
              <button className="primary-button" onClick={() => navigate('listing')}>Browse Products <Icon name="arrow" /></button>
            </div>
          )}

          {!!visibleItems.length && (
            <div className="wishlist-grid">
              {visibleItems.map((product) => (
                <article className="wishlist-card" key={product.id}>
                  <button className="wishlist-cover" type="button" onClick={() => viewProduct(product)} aria-label={`View ${product.title}`}>
                    <ProductArt product={product} />
                  </button>
                  <div className="workspace-card-copy">
                    <strong>{product.title}</strong>
                    <span>{product.category} / {product.type}</span>
                    <span>${Number(product.price || 0).toFixed(2)}</span>
                    <span>{product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Currently unavailable'}</span>
                  </div>
                  <div className="workspace-card-actions">
                    <button type="button" disabled={busyProductId === product.id || product.stockQuantity <= 0} onClick={() => moveToCart(product)}>Move to Cart</button>
                    <button type="button" disabled={busyProductId === product.id} onClick={() => removeItem(product)}>Remove</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
