import { useState } from 'react';
import Icon from '../components/Icon';

export default function PaymentMethodsPage({ user, navigate }) {
  const [savedMessage, setSavedMessage] = useState('');

  function savePaymentMethod(event) {
    event.preventDefault();
    setSavedMessage('Payment method saved for checkout.');
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
          <p>Manage saved cards and PayPal payment options for faster checkout.</p>
        </div>
      </div>

      <section className="payment-methods-content">
        <article className="payment-panel">
          <span className="eyebrow">Saved payment methods</span>
          <h2>Your saved methods</h2>
          <div className="saved-method-list">
            <div className="saved-method-card">
              <div className="method-icon">V</div>
              <div className="method-info">
                <strong>Visa **** 1234</strong>
                <span>Cardholder: {user?.name || 'Morgan Lee'}</span>
                <span>Expiry: 12/28</span>
              </div>
              <span className="secure-pill"><Icon name="lock" size={14} /> Default</span>
            </div>
          </div>
        </article>

        <article className="payment-panel">
          <span className="eyebrow">Add new payment method</span>
          <h2>Add payment method</h2>
          <form className="payment-form" onSubmit={savePaymentMethod}>
            <label><span>Card number</span><input placeholder="1234 5678 9012 3456" required /></label>
            <label><span>Cardholder name</span><input placeholder="Morgan Lee" required /></label>
            <div className="two-fields">
              <label><span>Expiry date</span><input placeholder="MM / YY" required /></label>
              <label><span>CVV</span><input placeholder="123" required /></label>
            </div>
            <label className="save-default-row"><input type="checkbox" /> <span>Set as default payment method</span></label>
            <button className="primary-button payment-save-button">Save Payment Method <Icon name="arrow" /></button>
          </form>
          {savedMessage && <div className="form-message"><Icon name="check" size={16} />{savedMessage}</div>}
        </article>
      </section>
    </main>
  );
}
