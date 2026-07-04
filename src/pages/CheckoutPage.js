import { useState } from 'react';
import Icon from '../components/Icon';
import ProductArt from '../components/ProductArt';
import { getCartItemQuantity, getCartLineTotal, getOrderTotals } from '../utils/orderTotals';
import { createOrder } from '../api/orders';

export default function CheckoutPage({ cart, user, navigate, onPlaceOrder }) {
  const [paymentMethod, setPaymentMethod] = useState('Visa **** 1234');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [error, setError] = useState('');
  const [savingOrder, setSavingOrder] = useState(false);
  const { subtotal, discount, tax, total } = getOrderTotals(cart);

  async function confirmPayment(event) {
    event.preventDefault();

    if (!user) {
      setError('Please sign in or create an account before payment.');
      navigate('account');
      return;
    }

    if (!cart.length) {
      setError('Your cart is empty.');
      return;
    }

    if (paymentMethod === 'New card' && (!cardNumber.trim() || !cardName.trim() || !cardExpiry.trim() || !cardCvv.trim())) {
      setError('Please complete the new card details.');
      return;
    }

    setError('');
    setSavingOrder(true);

    const order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      paymentId: `PAY-${Date.now().toString().slice(-6)}`,
      user,
      items: cart,
      paymentMethod,
      subtotal,
      discount,
      tax,
      total,
      createdAt: new Date().toLocaleString(),
    };

    try {
      const savedOrder = await createOrder(order);

      onPlaceOrder({
        ...order,
        id: `ORD-${savedOrder.orderId}`,
        databaseOrderId: savedOrder.orderId,
        savedItems: savedOrder.items,
      });
      navigate('order-detail');
    } catch (orderError) {
      setError(`Order could not be saved to StoreDB: ${orderError.message}`);
    } finally {
      setSavingOrder(false);
    }
  }

  if (!cart.length) {
    return (
      <main className="checkout-page page-shell">
        <div className="empty-state">
          <Icon name="bag" size={30} />
          <h3>Your cart is empty</h3>
          <p>Add products before checkout.</p>
          <button className="primary-button" onClick={() => navigate('listing')}>
            Browse products <Icon name="arrow" />
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page page-shell">
      <div className="breadcrumbs">
        <button onClick={() => navigate('cart')}>Shopping Cart</button>
        <Icon name="arrow" size={13} />
        <span>Checkout</span>
      </div>

      <div className="listing-title">
        <div>
          <span className="eyebrow">Secure checkout</span>
          <h1>Checkout</h1>
          <p>Complete your payment and unlock your digital library instantly.</p>
        </div>
      </div>

      <form className="checkout-layout" onSubmit={confirmPayment}>
        <div className="checkout-main">
          <section className="checkout-panel">
            <span className="eyebrow">Account</span>
            <h2>Account information</h2>
            {user ? (
              <div className="checkout-status">
                <Icon name="check" size={16} />
                <span>Signed in as {user.email}</span>
              </div>
            ) : (
              <div className="checkout-warning">
                <strong>Account required</strong>
                <span>Create an account or sign in before confirming payment.</span>
                <button type="button" onClick={() => navigate('account')}>Go to Account</button>
              </div>
            )}
          </section>

          <section className="checkout-panel">
            <span className="eyebrow">Payment method</span>
            <h2>Choose payment method</h2>
            <div className="payment-options">
              {['Visa **** 1234', 'PayPal account', 'New card'].map((method) => (
                <label key={method}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                  />
                  <span>
                    <strong>{method}</strong>
                    <small>{method === 'New card' ? 'Enter card details below' : 'Ready for instant digital checkout'}</small>
                  </span>
                </label>
              ))}
            </div>

            {paymentMethod === 'New card' && (
              <div className="new-card-fields">
                <label><span>Card number</span><input value={cardNumber} onChange={(event) => setCardNumber(event.target.value)} placeholder="1234 5678 9012 3456" /></label>
                <label><span>Cardholder name</span><input value={cardName} onChange={(event) => setCardName(event.target.value)} placeholder="Morgan Lee" /></label>
                <label><span>Expiry</span><input value={cardExpiry} onChange={(event) => setCardExpiry(event.target.value)} placeholder="MM / YY" /></label>
                <label><span>CVV</span><input value={cardCvv} onChange={(event) => setCardCvv(event.target.value)} placeholder="123" /></label>
              </div>
            )}

            <button className="secondary-link-button" type="button" onClick={() => navigate('payment-methods')}>
              Manage Payment Methods <Icon name="arrow" size={15} />
            </button>
          </section>

          <section className="digital-note">
            <Icon name="lock" size={22} />
            <strong>No shipping address is required because all products are digital.</strong>
            <span>Your items will be available in My Library after payment.</span>
          </section>
        </div>

        <aside className="checkout-summary-card">
          <span className="eyebrow">Order summary</span>
          <h2>Summary</h2>
          <div className="checkout-product-list">
            {cart.map((product) => {
              const quantity = getCartItemQuantity(product);
              const lineTotal = getCartLineTotal(product);

              return (
                <div className="checkout-product" key={product.id}>
                  <ProductArt product={product} />
                  <div>
                    <strong>{product.title}</strong>
                    <span>{product.category} / {product.type}</span>
                    <span>Qty {quantity} x ${Number(product.price || 0).toFixed(2)}</span>
                  </div>
                  <em>${lineTotal.toFixed(2)}</em>
                </div>
              );
            })}
          </div>
          <div className="summary-lines">
            <div><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div>
            <div><span>Tax</span><strong>${tax.toFixed(2)}</strong></div>
            <div><span>Discount</span><strong>-${discount.toFixed(2)}</strong></div>
            <div className="summary-total"><span>Total</span><strong>${total.toFixed(2)}</strong></div>
          </div>
          {error && <div className="checkout-error">{error}</div>}
          <button className="primary-button checkout-confirm-button" type="submit" disabled={!user || savingOrder}>
            {savingOrder ? 'Saving Order...' : 'Confirm Payment'} <Icon name="arrow" />
          </button>
          <small>Secure checkout. Digital delivery only.</small>
        </aside>
      </form>
    </main>
  );
}
