import AccountSideNav from '../components/AccountSideNav';

const libraryItems = [
  ['Purchased E-book', 'Read Now', 'Download'],
  ['Purchased Game', 'Play Now', 'Install'],
  ['Purchased Movie', 'Watch Now', 'Download'],
  ['Purchased E-book 2', 'Read Now', 'Download'],
  ['Purchased Game 2', 'Play Now', 'Install'],
  ['Purchased Movie 2', 'Watch Now', 'Download'],
];

export default function MyLibraryPage({ navigate }) {
  return (
    <main className="account-workspace page-shell">
      <section className="account-workspace-heading">
        <h1>Page Title: My Library</h1>
      </section>

      <div className="account-workspace-layout">
        <AccountSideNav variant="library" filter="all" onFilterChange={() => {}} navigate={navigate} />

        <section className="account-workspace-main">
          <form className="workspace-panel library-toolbar" onSubmit={(event) => event.preventDefault()}>
            <label>
              <span>Search Library</span>
              <input aria-label="Search Library" />
            </label>
            <label>
              <span>Type</span>
              <select aria-label="Library Type" defaultValue="All">
                <option>All</option>
                <option>E-book</option>
                <option>Game</option>
                <option>Movie</option>
              </select>
            </label>
            <label>
              <span>Sort</span>
              <select aria-label="Library Sort" defaultValue="Newest">
                <option>Newest</option>
                <option>Oldest</option>
              </select>
            </label>
          </form>

          <div className="library-grid">
            {libraryItems.map(([title, primaryAction, secondaryAction]) => (
              <article className="owned-card" key={title}>
                <div className="cover-placeholder">Cover</div>
                <div className="workspace-card-copy">
                  <strong>{title}</strong>
                  <span>Purchased: 2026-05-26</span>
                  <span>License: Owned</span>
                </div>
                <div className="workspace-card-actions">
                  <button type="button">{primaryAction}</button>
                  <button type="button">{secondaryAction}</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
