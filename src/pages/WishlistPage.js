import AccountSideNav from '../components/AccountSideNav';

const wishlistItems = [
  ['Wishlist Item 1', 'E-book'],
  ['Wishlist Item 2', 'Game'],
  ['Wishlist Item 3', 'Movie'],
  ['Wishlist Item 4', 'Game'],
  ['Wishlist Item 5', 'E-book'],
  ['Wishlist Item 6', 'Movie'],
];

export default function WishlistPage({ navigate }) {
  return (
    <main className="account-workspace page-shell">
      <section className="account-workspace-heading">
        <h1>Page Title: Wishlist</h1>
      </section>

      <div className="account-workspace-layout">
        <AccountSideNav active="wishlist" navigate={navigate} />

        <section className="account-workspace-main">
          <div className="workspace-section-label">Saved Items</div>

          <div className="wishlist-grid">
            {wishlistItems.map(([title, type]) => (
              <article className="wishlist-card" key={title}>
                <div className="cover-placeholder">Cover</div>
                <div className="workspace-card-copy">
                  <strong>{title}</strong>
                  <span>{type}</span>
                  <span>$19.99</span>
                  <span>★★★★☆</span>
                </div>
                <div className="workspace-card-actions">
                  <button type="button" onClick={() => navigate('cart')}>Move to Cart</button>
                  <button type="button">Remove</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
