const accountLinks = [
  { label: 'Profile', page: 'account' },
  { label: 'Payment Methods', page: 'payment-methods' },
  { label: 'Wishlist', page: 'wishlist' },
  { label: 'Order History', page: 'order-history' },
  { label: 'My Library', page: 'my-library' },
  { label: 'Settings', page: 'settings' },
];

const libraryFilters = [
  { label: 'All Products', value: 'all' },
  { label: 'My E-books', value: 'E-book' },
  { label: 'My Games', value: 'Game' },
  { label: 'My Movies', value: 'Movie' },
  { label: 'Recently Purchased', value: 'recent' },
  { label: 'Downloaded Items', value: 'downloaded' },
];

export default function AccountSideNav({ active, filter = 'all', navigate, onFilterChange, variant = 'account' }) {
  if (variant === 'library') {
    return (
      <aside className="account-side-nav">
        <span className="side-nav-section-label">Library</span>
        {libraryFilters.map((item) => (
          <button
            className={filter === item.value ? 'active' : ''}
            key={item.value}
            onClick={() => onFilterChange?.(item.value)}
          >
            {item.label}
          </button>
        ))}
      </aside>
    );
  }

  return (
    <aside className="account-side-nav">
      <span className="side-nav-section-label">Account</span>
      {accountLinks.map((item) => (
        <button
          className={active === item.page ? 'active' : ''}
          key={item.page}
          onClick={() => navigate(item.page)}
        >
          {item.label}
        </button>
      ))}
    </aside>
  );
}
