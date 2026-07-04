import AccountSideNav from '../components/AccountSideNav';

const orderRows = [
  ['ORD-1001', '2026-05-20', '2 products', '$39.98', 'Completed', 'View Details'],
  ['ORD-1002', '2026-05-18', '1 product', '$9.99', 'Refund Requested', 'View Refund'],
  ['ORD-1003', '2026-05-12', '1 product', '$19.99', 'Refunded', 'View Details'],
];

export default function OrderHistoryPage({ navigate }) {
  return (
    <main className="account-workspace page-shell">
      <section className="account-workspace-heading">
        <h1>Page Title: Order History</h1>
      </section>

      <div className="account-workspace-layout">
        <AccountSideNav active="order-history" navigate={navigate} />

        <section className="account-workspace-main">
          <div className="workspace-section-label">Search / Filter Orders</div>
          <form className="workspace-panel order-filter-form" onSubmit={(event) => event.preventDefault()}>
            <label>
              <span>Search by Order ID</span>
              <input aria-label="Search by Order ID" />
            </label>
            <label>
              <span>Status</span>
              <select aria-label="Order status" defaultValue="All">
                <option>All</option>
                <option>Completed</option>
                <option>Refund Requested</option>
                <option>Refunded</option>
              </select>
            </label>
            <label>
              <span>Date Range</span>
              <input aria-label="Date Range" placeholder="____ - ____" />
            </label>
            <button type="submit">Search</button>
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

            {orderRows.map(([id, date, items, total, status, action]) => (
              <article className="order-row" key={id}>
                <span>{id}</span>
                <span>{date}</span>
                <span>{items}</span>
                <span>{total}</span>
                <span>{status}</span>
                <button type="button">{action}</button>
              </article>
            ))}
          </div>

          <div className="workspace-pagination">
            <button type="button">&lt;</button>
            <button type="button">1</button>
            <button type="button">2</button>
            <button type="button">3</button>
            <button type="button">&gt;</button>
          </div>
        </section>
      </div>
    </main>
  );
}
