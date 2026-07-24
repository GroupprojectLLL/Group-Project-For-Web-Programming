import { useEffect, useMemo, useState } from 'react';
import Icon from '../components/Icon';

const ORDERS_PER_PAGE = 5;

function getOrderDateValue(dateText) {
  const time = new Date(dateText).getTime();
  return Number.isFinite(time) ? time : 0;
}

function getStatusClass(status) {
  return status.toLowerCase().replace(/\s+/g, '-');
}

function getOrderItemCount(order) {
  return order.items.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
}

export default function OrderHistoryPage({ orders, onViewOrder, onRequestRefund }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const fromTime = dateFrom ? new Date(dateFrom).getTime() : null;
    const toTime = dateTo ? new Date(dateTo).getTime() : null;

    return orders
      .filter((order) => {
        const orderTime = getOrderDateValue(order.createdAt);
        const matchesQuery = !normalizedQuery ||
          order.id.toLowerCase().includes(normalizedQuery) ||
          order.items.some((item) => (
            String(item.productId || item.id).includes(normalizedQuery) ||
            item.title.toLowerCase().includes(normalizedQuery)
          ));
        const matchesStatus = status === 'All' || order.status === status;
        const matchesFrom = !fromTime || orderTime >= fromTime;
        const matchesTo = !toTime || orderTime <= toTime + 86400000;

        return matchesQuery && matchesStatus && matchesFrom && matchesTo;
      })
      .sort((a, b) => getOrderDateValue(b.createdAt) - getOrderDateValue(a.createdAt));
  }, [dateFrom, dateTo, orders, query, status]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const visibleOrders = filteredOrders.slice((currentPage - 1) * ORDERS_PER_PAGE, currentPage * ORDERS_PER_PAGE);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  function searchOrders(event) {
    event.preventDefault();
    setCurrentPage(1);
  }

  function goToPage(nextPage) {
    setCurrentPage(Math.min(Math.max(nextPage, 1), totalPages));
  }

  return (
    <main className="account-workspace page-shell">
      <section className="account-workspace-heading">
        <div>
          <span className="workspace-eyebrow">Account workspace</span>
          <h1>Order history</h1>
          <p>Review purchases and follow refund progress.</p>
        </div>
        <div className="workspace-heading-stat">
          <strong>{orders.length}</strong>
          <span>Total orders</span>
        </div>
      </section>

      <div className="account-workspace-layout account-workspace-layout-full">
        <section className="account-workspace-main" aria-labelledby="order-history-title">
          <div className="workspace-section-heading">
            <div>
              <span className="workspace-section-kicker">Purchases</span>
              <h2 id="order-history-title">Your orders</h2>
            </div>
            <span className="workspace-result-count">{filteredOrders.length} results</span>
          </div>
          <form className="workspace-panel order-filter-form" onSubmit={searchOrders}>
            <label className="workspace-field workspace-field-wide">
              <span>Search by Order / Product ID</span>
              <input
                aria-label="Search by Order or Product ID"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ORD-1001 or 1"
              />
            </label>
            <label className="workspace-field">
              <span>Status</span>
              <select aria-label="Order status" value={status} onChange={(event) => { setStatus(event.target.value); setCurrentPage(1); }}>
                <option>All</option>
                <option>Completed</option>
                <option>Refund Requested</option>
                <option>Refunded</option>
              </select>
            </label>
            <label className="workspace-field">
              <span>From</span>
              <input aria-label="Date From" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
            </label>
            <label className="workspace-field">
              <span>To</span>
              <input aria-label="Date To" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
            </label>
            <button className="workspace-action-primary workspace-toolbar-action" type="submit">
              <Icon name="search" size={16} />
              Search
            </button>
          </form>

          <div className="order-table">
            <div className="order-table-header">
              <span>Order ID</span>
              <span>Date</span>
              <span>Items</span>
              <span>Total</span>
              <span>Status</span>
              <span>Action</span>
            </div>

            {visibleOrders.map((order) => (
              <article className="order-row" key={order.id}>
                <span data-label="Order ID"><strong>{order.id}</strong></span>
                <span data-label="Date"><time dateTime={order.createdAt}>{order.createdAt}</time></span>
                <span data-label="Items">{getOrderItemCount(order)} {getOrderItemCount(order) === 1 ? 'product' : 'products'}</span>
                <span data-label="Total" className="order-total">${Number(order.total || 0).toFixed(2)}</span>
                <span data-label="Status"><span className={`order-status order-status-${getStatusClass(order.status)}`}>{order.status}</span></span>
                <span className="order-actions" data-label="Action">
                  <button className="workspace-action-secondary" type="button" onClick={() => onViewOrder(order)}>View details</button>
                  {order.status === 'Completed' && (
                    <button className="workspace-action-text" type="button" onClick={() => onRequestRefund(order.id)}>Refund</button>
                  )}
                </span>
              </article>
            ))}
          </div>

          {!visibleOrders.length && (
            <div className="workspace-empty">
              <strong>No orders found</strong>
              <span>Try another order ID, product ID, status, or date range.</span>
            </div>
          )}

          <div className="workspace-pagination">
            <button type="button" aria-label="Previous page" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>&lt;</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button type="button" aria-label="Next page" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>&gt;</button>
          </div>
        </section>
      </div>
    </main>
  );
}
