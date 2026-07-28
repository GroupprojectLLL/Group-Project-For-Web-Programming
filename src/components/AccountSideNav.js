const libraryFilters = [
  { label: 'All Products', value: 'all' },
  { label: 'My Books', value: 'Books' },
  { label: 'My Games', value: 'Games' },
  { label: 'My Movies & TV', value: 'Movies & TV' },
];

const accountPages = [
  { label: 'My Library', value: 'my-library' },
  { label: 'Order History', value: 'order-history' },
  { label: 'Wishlist', value: 'wishlist' },
  { label: 'Payment Methods', value: 'payment-methods' },
];

export default function AccountSideNav({
  variant = 'account',
  active,
  navigate,
  filter = 'all',
  onFilterChange,
  counts = {},
}) {
  const isLibraryFilter = variant === 'library';
  const items = isLibraryFilter ? libraryFilters : accountPages;
  const selectedValue = isLibraryFilter ? filter : active;

  return (
    <aside className="account-side-nav" aria-label={isLibraryFilter ? 'Library filters' : 'Account pages'}>
      <span className="side-nav-section-label">{isLibraryFilter ? 'My Library' : 'My Account'}</span>
      {items.map((item) => (
        <button
          type="button"
          className={selectedValue === item.value ? 'active' : ''}
          key={item.value}
          onClick={() => {
            if (isLibraryFilter) onFilterChange?.(item.value);
            else navigate?.(item.value);
          }}
          aria-pressed={selectedValue === item.value}
          aria-controls={isLibraryFilter ? 'library-results' : undefined}
        >
          <span>{item.label}</span>
          {isLibraryFilter && <small>{Number(counts[item.value] || 0)}</small>}
        </button>
      ))}
    </aside>
  );
}
