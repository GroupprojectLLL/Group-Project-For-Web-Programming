import { useState } from 'react';
import { accountVisualArt } from '../config/assets';
import Field from '../components/FormField';
import Icon from '../components/Icon';
import ProductArt from '../components/ProductArt';
import Rating from '../components/Rating';

export default function AccountPage({ products, user, onAuth, checkoutPending, navigate }) {
  const [view, setView] = useState(user ? 'profile' : 'login');
  const [message, setMessage] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const submit = (event, nextView, nextMessage) => {
    event.preventDefault();
    setMessage(nextMessage);
    if (nextView === 'profile') {
      setView('profile');
      onAuth?.({ name: 'Morgan Lee', email: 'morgan.lee@example.com' });
      return;
    }
    setView(nextView);
  };
  const submitRegistration = (event) => {
    event.preventDefault();

    if (registerPassword !== confirmPassword) {
      setRegisterError('Passwords do not match. Please enter the same password in both fields.');
      return;
    }

    setRegisterError('');
    setRegisterPassword('');
    setConfirmPassword('');
    setMessage('Your new account is ready. Please sign in.');
    setView('login');
  };

  const panels = {
    login: (
      <form className="account-form" onSubmit={(event) => submit(event, 'profile', 'Welcome back. You are signed in.')}>
        <span className="eyebrow">Welcome back</span><h2>Sign in to your account</h2><p>Access your library, wishlist, and member prices.</p>
        <Field label="Email address" type="email" placeholder="you@example.com" autoComplete="email" />
        <Field label="Password" type="password" placeholder="Enter your password" minLength={8} autoComplete="current-password" />
        <div className="form-row"><label className="remember"><input type="checkbox" /> Remember me</label></div>
        <button className="primary-button form-submit">Sign in <Icon name="arrow" size={17} /></button>
        <div className="login-links">
          <button type="button" onClick={() => { setView('register'); setMessage(''); setRegisterError(''); }}><span>New here?</span><strong>Register a new account</strong><Icon name="arrow" size={16} /></button>
          <button type="button" onClick={() => { setView('forgot'); setMessage(''); }}><span>Cannot sign in?</span><strong>Forgot your password</strong><Icon name="arrow" size={16} /></button>
        </div>
      </form>
    ),
    register: (
      <form className="account-form" onSubmit={submitRegistration}>
        <button className="account-back" type="button" onClick={() => { setView('login'); setMessage(''); setRegisterError(''); }}><Icon name="arrow" size={15} /> Back to login</button>
        <span className="eyebrow">Join the community</span><h2>Create your account</h2><p>Build a library of stories you will love.</p>
        <div className="two-fields"><Field label="First name" placeholder="Morgan" /><Field label="Last name" placeholder="Lee" /></div>
        <Field label="Email address" type="email" placeholder="you@example.com" autoComplete="email" />
        <Field
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          minLength={8}
          value={registerPassword}
          onChange={(event) => {
            setRegisterPassword(event.target.value);
            setRegisterError('');
          }}
          autoComplete="new-password"
        />
        <Field
          label="Confirm password"
          type="password"
          placeholder="Enter the same password"
          minLength={8}
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            setRegisterError('');
          }}
          autoComplete="new-password"
        />
        {registerError && <div className="form-message" role="alert">{registerError}</div>}
        <label className="terms"><input type="checkbox" required /><span>I agree to the Terms of Service and Privacy Policy.</span></label>
        <button className="primary-button form-submit">Create account <Icon name="arrow" size={17} /></button>
      </form>
    ),
    forgot: (
      <form className="account-form" onSubmit={(event) => submit(event, 'login', 'Password reset instructions have been sent.')}>
        <button className="account-back" type="button" onClick={() => { setView('login'); setMessage(''); }}><Icon name="arrow" size={15} /> Back to login</button>
        <span className="eyebrow">Account recovery</span><h2>Reset your password</h2><p>Enter your account email and we will send you a secure reset link.</p>
        <Field label="Email address" type="email" placeholder="you@example.com" autoComplete="email" />
        <button className="primary-button form-submit">Send reset link <Icon name="mail" size={17} /></button>
      </form>
    ),
    profile: (
      <div className="account-form profile-view">
        <div className="profile-heading">
          <div className="profile-avatar"><span>ML</span></div>
          <div><span className="eyebrow">Signed in</span><h2>{user?.name || 'Morgan Lee'}</h2><p>{user?.email || 'morgan.lee@example.com'}</p></div>
          <button type="button" onClick={() => { onAuth?.(null); setView('login'); setMessage(''); }}>Log out</button>
        </div>
        {checkoutPending && <button className="primary-button account-continue-button" type="button" onClick={() => navigate('checkout')}>Continue to checkout <Icon name="arrow" size={17} /></button>}
        <div className="profile-stats"><div><strong>12</strong><span>Owned titles</span></div><div><strong>4</strong><span>Wishlist</span></div><div><strong>2026</strong><span>Member since</span></div></div>
        <div className="profile-section">
          <h3>Second iteration pages</h3>
          <div className="account-shortcuts">
            <button onClick={() => navigate('my-library')}>My Library</button>
            <button onClick={() => navigate('order-history')}>Order History</button>
            <button onClick={() => navigate('wishlist')}>Wishlist</button>
            <button onClick={() => navigate('admin-dashboard')}>Admin Dashboard</button>
          </div>
        </div>
        <div className="profile-section"><h3>Personal information</h3><div className="profile-info-grid"><span><small>Full name</small><strong>Morgan Lee</strong></span><span><small>Phone</small><strong>+65 8123 4567</strong></span><span><small>Email address</small><strong>morgan.lee@example.com</strong></span><span><small>Account status</small><strong className="status-active">Active</strong></span></div></div>
        <div className="profile-section"><h3>Recent library</h3><div className="profile-library">{products.slice(0, 3).map((product) => <div key={product.id}><ProductArt product={product} /><span><strong>{product.title}</strong><small>{product.category}</small></span></div>)}</div></div>
      </div>
    ),
  };

  return (
    <main className="account-page page-shell">
      <div className="account-visual">
        <img className="account-visual-image" src={accountVisualArt} alt="" />
        <div className="account-visual-rating">
          <Rating value={4.9} reviews={12000} />
        </div>
      </div>
      <div className="account-panel">
        <div className="account-panel-label"><Icon name={user ? 'user' : 'lock'} size={17} />{user ? 'My account' : 'Secure account access'}</div>
        {message && <div className="form-message"><Icon name="check" size={16} />{message}</div>}
        {panels[view]}
      </div>
    </main>
  );
}
