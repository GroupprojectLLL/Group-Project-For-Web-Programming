import { useEffect, useMemo, useState } from 'react';
import { fetchStaffProducts, fetchStaffSummary, fetchStaffUsers } from '../api/staff';
import Icon from '../components/Icon';

const PAGE_SIZE = 10;

function Pagination({ page, pageCount, onChange }) {
  if (pageCount <= 1) return null;

  return (
    <div className="workspace-pagination">
      <button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => onChange(page - 1)}>
        <Icon name="arrow" size={14} />
      </button>
      <span>Page {page} of {pageCount}</span>
      <button type="button" aria-label="Next page" disabled={page === pageCount} onClick={() => onChange(page + 1)}>
        <Icon name="arrow" size={14} />
      </button>
    </div>
  );
}

export default function EmployeeDashboardPage({ user, navigate }) {
  const [activeView, setActiveView] = useState('inventory');
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const hasStaffAccess = user?.role === 'Employee' || user?.role === 'Admin' || user?.isAdmin;

  useEffect(() => {
    let ignore = false;
    if (!hasStaffAccess) {
      setLoading(false);
      return () => { ignore = true; };
    }

    setLoading(true);
    Promise.all([fetchStaffSummary(), fetchStaffProducts(), fetchStaffUsers()])
      .then(([nextSummary, nextProducts, nextUsers]) => {
        if (ignore) return;
        setSummary(nextSummary);
        setProducts(nextProducts);
        setUsers(nextUsers);
        setError('');
      })
      .catch((loadError) => {
        if (!ignore) setError(loadError.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => { ignore = true; };
  }, [hasStaffAccess]);

  useEffect(() => {
    setPage(1);
  }, [activeView, query]);

  const filteredRecords = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const records = activeView === 'inventory' ? products : users;
    if (!needle) return records;

    return records.filter((record) => (
      activeView === 'inventory'
        ? [record.name, record.author, record.category, record.subCategory]
        : [record.name, record.username, record.email, record.role]
    ).some((value) => String(value || '').toLowerCase().includes(needle)));
  }, [activeView, products, query, users]);

  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const visibleRecords = filteredRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (!hasStaffAccess) {
    return (
      <main className="account-workspace page-shell">
        <div className="empty-state">
          <Icon name="lock" size={30} />
          <h3>Employee access required</h3>
          <button className="primary-button" onClick={() => navigate('account')}>Go to Account</button>
        </div>
      </main>
    );
  }

  return (
    <main className="account-workspace page-shell">
      <section className="account-workspace-heading">
        <div>
          <span className="workspace-eyebrow">Store operations</span>
          <h1>Employee Dashboard</h1>
          <p>Read-only StoreDB inventory and account records.</p>
        </div>
        <span className="staff-access-badge"><Icon name="lock" size={15} />Read only</span>
      </section>

      {error && <div className="workspace-panel workspace-error" role="alert">{error}</div>}
      {loading && <div className="workspace-panel workspace-message">Loading StoreDB records...</div>}

      {!loading && !error && (
        <section className="account-workspace-main staff-workspace">
          {summary && (
            <div className="admin-summary-grid">
              <button type="button" onClick={() => setActiveView('inventory')}><strong>{summary.productCount}</strong><span>Products</span></button>
              <button type="button" onClick={() => setActiveView('accounts')}><strong>{summary.userCount}</strong><span>Accounts</span></button>
              <div><strong>{summary.orderCount}</strong><span>Orders</span></div>
              <div><strong>{summary.lowStockCount}</strong><span>Low-stock records</span></div>
            </div>
          )}

          <div className="staff-view-tabs" role="tablist" aria-label="Employee data views">
            <button className={activeView === 'inventory' ? 'active' : ''} type="button" role="tab" aria-selected={activeView === 'inventory'} onClick={() => setActiveView('inventory')}>
              <Icon name="bag" size={16} />Inventory
            </button>
            <button className={activeView === 'accounts' ? 'active' : ''} type="button" role="tab" aria-selected={activeView === 'accounts'} onClick={() => setActiveView('accounts')}>
              <Icon name="user" size={16} />Accounts
            </button>
          </div>

          <div className="workspace-panel admin-list-toolbar">
            <input
              aria-label={`Search ${activeView}`}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={activeView === 'inventory' ? 'Search product, creator, or category' : 'Search name, email, or role'}
            />
            <span>{filteredRecords.length} records</span>
          </div>

          {activeView === 'inventory' ? (
            <div className="admin-data-table staff-product-table">
              <div className="admin-data-header"><span>ID</span><span>Product</span><span>Category</span><span>Price</span><span>Stock</span></div>
              {visibleRecords.map((product) => (
                <article key={product.id}>
                  <span>{product.id}</span>
                  <span><strong>{product.name}</strong><small>{product.author || 'Creator not recorded'}</small></span>
                  <span><strong>{product.category || product.genre}</strong><small>{product.subCategory || product.subGenre}</small></span>
                  <span>${Number(product.price || 0).toFixed(2)}</span>
                  <span>{Number(product.quantity || 0)}</span>
                </article>
              ))}
            </div>
          ) : (
            <div className="admin-data-table staff-account-table">
              <div className="admin-data-header"><span>ID</span><span>Account</span><span>Email</span><span>Role</span></div>
              {visibleRecords.map((record) => (
                <article key={record.id}>
                  <span>{record.id}</span>
                  <span><strong>{record.name || record.username}</strong><small>{record.username}</small></span>
                  <span>{record.email || 'No email'}</span>
                  <span>{record.role}</span>
                </article>
              ))}
            </div>
          )}

          {!visibleRecords.length && <div className="workspace-panel workspace-message">No matching records.</div>}
          <Pagination page={page} pageCount={pageCount} onChange={setPage} />
        </section>
      )}
    </main>
  );
}
