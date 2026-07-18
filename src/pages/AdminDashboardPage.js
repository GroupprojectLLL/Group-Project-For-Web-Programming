import { useEffect, useState } from 'react';
import { fetchAdminSummary } from '../api/admin';
import AdminSideNav from '../components/AdminSideNav';
import Icon from '../components/Icon';

export default function AdminDashboardPage({ user, navigate }) {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    if (!user?.isAdmin) return () => { ignore = true; };
    fetchAdminSummary()
      .then((record) => { if (!ignore) setSummary(record); })
      .catch((loadError) => { if (!ignore) setError(loadError.message); });
    return () => { ignore = true; };
  }, [user]);

  if (!user?.isAdmin) {
    return (
      <main className="account-workspace page-shell">
        <div className="empty-state"><Icon name="lock" size={30} /><h3>Admin access required</h3><p>This area is protected by the StoreDB isAdmin role.</p><button className="primary-button" onClick={() => navigate('account')}>Go to Account</button></div>
      </main>
    );
  }

  return (
    <main className="account-workspace page-shell">
      <section className="account-workspace-heading"><h1>Admin Dashboard</h1></section>
      <div className="account-workspace-layout">
        <AdminSideNav active="admin-dashboard" navigate={navigate} />
        <section className="account-workspace-main">
          <div className="workspace-section-label">StoreDB Overview</div>
          {error && <div className="workspace-panel workspace-error" role="alert">{error}</div>}
          {!summary && !error && <div className="workspace-panel workspace-message">Loading StoreDB summary...</div>}
          {summary && (
            <div className="admin-summary-grid">
              <button onClick={() => navigate('admin-product-management')}><strong>{summary.productCount}</strong><span>Products</span></button>
              <button onClick={() => navigate('admin-user-management')}><strong>{summary.userCount}</strong><span>Users</span></button>
              <div><strong>{summary.orderCount}</strong><span>Orders</span></div>
              <div><strong>{summary.lowStockCount}</strong><span>Low-stock records</span></div>
            </div>
          )}
          <div className="workspace-panel admin-guidance">
            <h2>Database administration</h2>
            <p>Product and user changes are written directly to the provided StoreDB and require an authenticated admin account.</p>
            <p>Roles use the supplied schema: isAdmin identifies Admin accounts, a matching customer record identifies Customers, and other non-admin accounts are Employees.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
