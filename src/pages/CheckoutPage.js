import { useState } from 'react';
import Icon from '../components/Icon';
import ProductArt from '../components/ProductArt';
import { getCartItemQuantity, getCartLineTotal, getOrderTotals } from '../utils/orderTotals';
import { createOrder } from '../api/orders';

function validateNewCard({ cardNumber, cardName, cardExpiry, cardCvv }) {
  const number = cardNumber.replace(/[\s-]/g, '');
  if (!/^\d{12,19}$/.test(number)) return 'Enter a valid card number.';
  if (cardName.trim().length < 2) return 'Enter the cardholder name.';

  const expiryMatch = cardExpiry.trim().match(/^(0[1-9]|1[0-2])\s*\/\s*(\d{2}|\d{4})$/);
  if (!expiryMatch) return 'Enter a valid expiry date in MM / YY format.';

  const expiryMonth = Number(expiryMatch[1]);
  const rawYear = Number(expiryMatch[2]);
  const expiryYear = rawYear < 100 ? 2000 + rawYear : rawYear;
  const now = new Date();
  if (expiryYear < now.getFullYear() || (expiryYear === now.getFullYear() && expiryMonth < now.getMonth() + 1)) {
    return 'The card expiry date has passed.';
  }

  if (!/^\d{3,4}$/.test(cardCvv.trim())) return 'Enter a valid CVV.';
  return '';
}

export default function CheckoutPage({ cart, user, navigate, onPlaceOrder }) {
  const savedCardLabel = user?.paymentMethod ? `Card **** ${user.paymentMethod.last4}` : null;
  const [paymentMethod, setPaymentMethod] = useState(savedCardLabel || 'New card');
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

    if (user.role !== 'Customer') {
      setError('Checkout is available to customer accounts only.');
      return;
    }

    if (!cart.length) {
      setError('Your cart is empty.');
      return;
    }

    if (paymentMethod === 'New card') {
      const validationError = validateNewCard({ cardNumber, cardName, cardExpiry, cardCvv });
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setError('');
    setSavingOrder(true);
    const paymentLabel = paymentMethod === 'New card'
      ? `Card **** ${cardNumber.replace(/\D/g, '').slice(-4)}`
      : paymentMethod;

    const order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      paymentId: `PAY-${Date.now().toString().slice(-6)}`,
      user,
      items: cart,
      paymentMethod: paymentLabel,
      subtotal,
      discount,
      tax,
      total,
      createdAt: new Date().toLocaleString(),
    };

    try {
      // Payment confirmation waits for StoreDB to return the saved order id.
      const savedOrder = await createOrder(order);

      onPlaceOrder({
        ...order,
        id: `ORD-${savedOrder.orderId}`,
        databaseOrderId: savedOrder.orderId,
        status: savedOrder.status,
        refundStatus: savedOrder.refundStatus,
        total: Number(savedOrder.total ?? order.total),
        paymentMethod: savedOrder.paymentMethod || order.paymentMethod,
        createdAt: savedOrder.createdAt || order.createdAt,
        savedItems: savedOrder.items,
      });
      navigate('order-detail');
    } catch (orderError) {
      setError(`Order could not be saved to StoreDB: ${orderError.message}`);
    } finally {
      setSavingOrder(false);
    }
  }

  if (user && user.role !== 'Customer') {
    return (
      <main className="checkout-page page-shell">
        <div className="empty-state">
          <Icon name="lock" size={30} />
          <h3>Customer account required</h3>
          <button className="primary-button" onClick={() => navigate(user.role === 'Employee' ? 'employee-dashboard' : 'admin-dashboard')}>
            Return to dashboard
          </button>
        </div>
      </main>
    );
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
              {[...(savedCardLabel ? [savedCardLabel] : []), 'PayPal account', 'New card'].map((method) => (
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
                <label><span>Card number</span><input value={cardNumber} onChange={(event) => setCardNumber(event.target.value)} placeholder="1234 5678 9012 3456" inputMode="numeric" autoComplete="cc-number" maxLength="23" /></label>
                <label><span>Cardholder name</span><input value={cardName} onChange={(event) => setCardName(event.target.value)} placeholder="Morgan Lee" autoComplete="cc-name" maxLength="100" /></label>
                <label><span>Expiry</span><input value={cardExpiry} onChange={(event) => setCardExpiry(event.target.value)} placeholder="MM / YY" inputMode="numeric" autoComplete="cc-exp" maxLength="9" /></label>
                <label><span>CVV</span><input value={cardCvv} onChange={(event) => setCardCvv(event.target.value)} placeholder="123" inputMode="numeric" autoComplete="cc-csc" maxLength="4" /></label>
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
