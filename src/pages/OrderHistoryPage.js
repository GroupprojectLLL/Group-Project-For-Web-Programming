import { useEffect, useMemo, useState } from 'react';
import { fetchOrders } from '../api/orders';
import AccountSideNav from '../components/AccountSideNav';
import Icon from '../components/Icon';

export default function OrderHistoryPage({ user, products, navigate, onOpenOrder }) {
  const [orders, setOrders] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    if (!user) {
      setOrders([]);
      setLoading(false);
      return () => { ignore = true; };
    }

    setLoading(true);
    fetchOrders()
      .then((records) => {
        if (!ignore) {
          setOrders(records);
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

  const visibleOrders = useMemo(() => orders.filter((order) => {
    const queryMatches = !query.trim() || String(order.id).toLowerCase().includes(query.trim().toLowerCase());
    const statusMatches = status === 'All' || order.status === status;
    return queryMatches && statusMatches;
  }), [orders, query, status]);

  function openOrder(order) {
    const enrichedItems = order.items.map((item) => ({
      ...products.find((product) => String(product.id) === String(item.productId)),
      ...item,
      id: item.productId,
    }));
    onOpenOrder?.({ ...order, items: enrichedItems });
  }

  function formatOrderDate(value) {
    if (!value) return 'Legacy order';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
  }

  if (!user) {
    return (
      <main className="account-workspace page-shell">
        <div className="empty-state">
          <Icon name="lock" size={30} />
          <h3>Sign in to view order history</h3>
          <p>Orders are retrieved from the StoreDB customer record linked to your email.</p>
          <button className="primary-button" onClick={() => navigate('account')}>Go to Account <Icon name="arrow" /></button>
        </div>
      </main>
    );
  }

  return (
    <main className="account-workspace page-shell">
      <section className="account-workspace-heading"><h1>Order History</h1></section>
      <div className="account-workspace-layout">
        <AccountSideNav active="order-history" navigate={navigate} />
        <section className="account-workspace-main">
          <div className="workspace-section-label">StoreDB Orders</div>
          <div className="workspace-panel order-filter-form">
            <label>
              <span>Search by Order ID</span>
              <input aria-label="Search by Order ID" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ORD-8" />
            </label>
            <label>
              <span>Status</span>
              <select aria-label="Order status" value={status} onChange={(event) => setStatus(event.target.value)}>
                <option>All</option>
                <option>Paid</option>
              </select>
            </label>
            <div className="workspace-data-note">
              <strong>{orders.length}</strong>
              <span>orders linked to this customer</span>
            </div>
          </div>

          {loading && <div className="workspace-panel workspace-message">Loading StoreDB orders...</div>}
          {error && <div className="workspace-panel workspace-error" role="alert">{error}</div>}
          {!loading && !error && !visibleOrders.length && <div className="workspace-panel workspace-message">No matching orders were found.</div>}

          {!!visibleOrders.length && (
            <div className="order-table">
              <div className="order-table-header"><span>Order ID</span><span>Date</span><span>Items</span><span>Total</span><span>Status</span><span>Action</span></div>
              {visibleOrders.map((order) => (
                <article className="order-row" key={order.orderId}>
                  <span>{order.id}</span>
                  <span>{formatOrderDate(order.createdAt)}</span>
                  <span>{order.itemCount} item{order.itemCount === 1 ? '' : 's'}</span>
                  <span>${Number(order.total || 0).toFixed(2)}</span>
                  <span>{order.status}</span>
                  <button type="button" onClick={() => openOrder(order)}>View Details</button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
