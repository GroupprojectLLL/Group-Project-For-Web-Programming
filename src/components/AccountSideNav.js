const libraryFilters = [
  { label: 'All Products', value: 'all' },
  { label: 'My E-books', value: 'E-book' },
  { label: 'My Games', value: 'Game' },
  { label: 'My Movies', value: 'Movie' },
  { label: 'Recently Purchased', value: 'recent' },
  { label: 'Downloaded Items', value: 'downloaded' },
];

export default function AccountSideNav({ filter = 'all', onFilterChange }) {
  return (
    <aside className="account-side-nav" aria-label="Library filters">
      <span className="side-nav-section-label">My Library</span>
      {libraryFilters.map((item) => (
        <button
          className={filter === item.value ? 'active' : ''}
          key={item.value}
          onClick={() => onFilterChange?.(item.value)}
          aria-pressed={filter === item.value}
        >
          {item.label}
        </button>
      ))}
    </aside>
  );
}
