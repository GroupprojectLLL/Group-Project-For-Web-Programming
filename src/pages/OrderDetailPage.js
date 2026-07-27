import Icon from '../components/Icon';
import ProductArt from '../components/ProductArt';
import { getCartItemQuantity, getCartLineTotal } from '../utils/orderTotals';

export default function OrderDetailPage({ order, navigate }) {
  if (!order) {
    return (
      <main className="order-detail-page page-shell">
        <div className="empty-state">
          <Icon name="search" size={30} />
          <h3>No completed order yet</h3>
          <p>Complete checkout before viewing order details.</p>
          <button className="primary-button" onClick={() => navigate('cart')}>
            Back to Cart <Icon name="arrow" />
          </button>
        </div>
      </main>
    );
  }

  const paymentDate = order.createdAt && !Number.isNaN(new Date(order.createdAt).getTime())
    ? new Date(order.createdAt).toLocaleString()
    : order.createdAt || 'Legacy order';

  // The page shows the StoreDB order id returned after checkout.
  return (
    <main className="order-detail-page page-shell">
      <div className="breadcrumbs">
        <button onClick={() => navigate('checkout')}>Checkout</button>
        <Icon name="arrow" size={13} />
        <span>Order Detail</span>
      </div>

      <section className="order-success-banner">
        <div>
          <span className="eyebrow">Payment successful</span>
          <h1>Payment Successful</h1>
          <p>Your payment has been completed. Your digital products are now available in your library.</p>
        </div>
        <span className="order-success-icon"><Icon name="check" size={32} /></span>
      </section>

      <section className="order-detail-layout">
        <article className="order-panel">
          <span className="eyebrow">Payment information</span>
          <h2>Order {order.id}</h2>
          <div className="payment-info-grid">
            <div><span>Order ID</span><strong>{order.id}</strong></div>
            {order.databaseOrderId && <div><span>StoreDB OrderID</span><strong>{order.databaseOrderId}</strong></div>}
            <div><span>Payment ID</span><strong>{order.paymentId}</strong></div>
            <div><span>Payment Method</span><strong>{order.paymentMethod}</strong></div>
            <div><span>Payment Date</span><strong>{paymentDate}</strong></div>
            <div><span>Total Paid</span><strong>${order.total.toFixed(2)}</strong></div>
            <div><span>Status</span><strong className="paid-status">{order.status || 'Paid'}</strong></div>
            <div><span>Refund Status</span><strong>{order.refundStatus || 'Not requested'}</strong></div>
          </div>
        </article>

        <article className="order-panel">
          <span className="eyebrow">Purchased products</span>
          <h2>Digital items</h2>
          <div className="purchased-list">
            {order.items.map((product) => {
              const quantity = getCartItemQuantity(product);
              const lineTotal = getCartLineTotal(product);

              return (
                <div className="purchased-item" key={product.id}>
                  <ProductArt product={product} />
                  <div>
                    <strong>{product.title}</strong>
                    <span>{product.category} / {product.type}</span>
                    <span>Quantity: {quantity} x ${Number(product.price || 0).toFixed(2)}</span>
                    <button onClick={() => navigate('my-library')}>Open in My Library <Icon name="arrow" size={14} /></button>
                  </div>
                  <em>${lineTotal.toFixed(2)}</em>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="refund-panel">
        <div className="refund-heading">
          <div>
            <span className="eyebrow">Refund support</span>
            <h2>Need help with this order?</h2>
            <p>Online refund requests are not available in this prototype.</p>
          </div>
          <span className="refund-status-pill">Unavailable</span>
        </div>
        <div className="refund-actions">
          <button type="button" onClick={() => navigate('order-history')}>Back to Order History</button>
        </div>
      </section>
    </main>
  );
}
