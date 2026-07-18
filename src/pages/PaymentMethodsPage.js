import { useState } from 'react';
import { savePaymentMethod } from '../api/auth';
import Icon from '../components/Icon';

export default function PaymentMethodsPage({ user, navigate, onUserUpdate }) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardOwner, setCardOwner] = useState(user?.name || '');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submitPaymentMethod(event) {
    event.preventDefault();
    if (!user) {
      navigate('account');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');
    try {
      const paymentMethod = await savePaymentMethod({ cardNumber, cardOwner, expiry });
      onUserUpdate?.({ ...user, paymentMethod });
      setCardNumber('');
      setCvv('');
      setMessage('Payment method saved. StoreDB keeps only the card number ending, owner, and expiry.');
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return (
      <main className="payment-methods-page page-shell">
        <div className="empty-state">
          <Icon name="lock" size={30} />
          <h3>Sign in to manage payment methods</h3>
          <p>Saved payment information belongs to a StoreDB customer account.</p>
          <button className="primary-button" onClick={() => navigate('account')}>Go to Account <Icon name="arrow" /></button>
        </div>
      </main>
    );
  }

  return (
    <main className="payment-methods-page page-shell">
      <div className="breadcrumbs">
        <button onClick={() => navigate('account')}>My Account</button>
        <Icon name="arrow" size={13} />
        <span>Payment Methods</span>
      </div>

      <div className="listing-title">
        <div>
          <span className="eyebrow">Account settings</span>
          <h1>Payment methods</h1>
          <p>Manage the simulated card used during prototype checkout.</p>
        </div>
      </div>

      <section className="payment-methods-content">
        <article className="payment-panel">
          <span className="eyebrow">Saved payment method</span>
          <h2>{user.paymentMethod ? `Card ending ${user.paymentMethod.last4}` : 'No card saved'}</h2>
          {user.paymentMethod ? (
            <div className="saved-payment-card">
              <Icon name="card" size={24} />
              <div>
                <strong>**** **** **** {user.paymentMethod.last4}</strong>
                <span>{user.paymentMethod.cardOwner || user.name}</span>
                <small>Expires {user.paymentMethod.expiry || 'not recorded'}</small>
              </div>
            </div>
          ) : <p>Add a prototype card to use it at checkout.</p>}
          <small>For safety, the backend does not save the full card number or CVV.</small>
        </article>

        <article className="payment-panel">
          <span className="eyebrow">Add or replace card</span>
          <h2>Save payment method</h2>
          <form className="payment-form" onSubmit={submitPaymentMethod}>
            <label><span>Card number</span><input value={cardNumber} onChange={(event) => setCardNumber(event.target.value)} inputMode="numeric" placeholder="1234 5678 9012 3456" minLength={12} required /></label>
            <label><span>Cardholder name</span><input value={cardOwner} onChange={(event) => setCardOwner(event.target.value)} placeholder="Morgan Lee" required /></label>
            <div className="payment-form-row">
              <label><span>Expiry date</span><input value={expiry} onChange={(event) => setExpiry(event.target.value)} placeholder="MM/YY" pattern="\d{2}/\d{2}" required /></label>
              <label><span>CVV</span><input value={cvv} onChange={(event) => setCvv(event.target.value)} inputMode="numeric" placeholder="123" pattern="\d{3,4}" required /></label>
            </div>
            <button className="primary-button payment-save-button" disabled={saving}>{saving ? 'Saving...' : 'Save Payment Method'} <Icon name="arrow" /></button>
            {message && <div className="refund-message"><Icon name="check" size={16} />{message}</div>}
            {error && <div className="checkout-error" role="alert">{error}</div>}
          </form>
        </article>
      </section>
    </main>
  );
}
