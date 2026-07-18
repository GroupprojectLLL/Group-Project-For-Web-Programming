import { useEffect, useState } from 'react';
import { accountVisualArt } from '../config/assets';
import { loginUser, logoutUser, registerUser, updateCurrentUser } from '../api/auth';
import Field from '../components/FormField';
import Icon from '../components/Icon';

function buildProfileDraft(user) {
  return {
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    address: {
      streetAddress: user?.address?.streetAddress || '',
      postCode: user?.address?.postCode || '',
      suburb: user?.address?.suburb || '',
      state: user?.address?.state || '',
    },
  };
}

export default function AccountPage({ user, onAuth, checkoutPending, navigate }) {
  const [view, setView] = useState(user ? 'profile' : 'login');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState(() => buildProfileDraft(user));
  const [registration, setRegistration] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setView('profile');
      setProfileDraft(buildProfileDraft(user));
    }
  }, [user]);

  function changeView(nextView) {
    setView(nextView);
    setMessage('');
    setError('');
  }

  async function submitLogin(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const authenticatedUser = await loginUser(identifier, loginPassword);
      onAuth?.(authenticatedUser);
      setMessage('Welcome back. Your StoreDB account is signed in.');
      setLoginPassword('');
      setView('profile');
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function submitRegistration(event) {
    event.preventDefault();
    setError('');

    if (registration.password !== registration.confirmPassword) {
      setError('Passwords do not match. Please enter the same password in both fields.');
      return;
    }

    setSubmitting(true);
    try {
      const authenticatedUser = await registerUser({
        name: registration.name,
        username: registration.username,
        email: registration.email,
        password: registration.password,
      });
      onAuth?.(authenticatedUser);
      setRegistration({ name: '', username: '', email: '', password: '', confirmPassword: '' });
      setMessage('Your customer account was created in StoreDB and is ready to use.');
      setView('profile');
    } catch (registrationError) {
      setError(registrationError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function signOut() {
    setSubmitting(true);
    try {
      await logoutUser();
    } catch {
      // The local session is cleared even if the backend is already offline.
    } finally {
      onAuth?.(null);
      setIdentifier('');
      setLoginPassword('');
      setEditingProfile(false);
      setMessage('You are signed out.');
      setView('login');
      setSubmitting(false);
    }
  }

  const updateRegistration = (field) => (event) => {
    setRegistration((current) => ({ ...current, [field]: event.target.value }));
    setError('');
  };

  const updateProfileField = (field) => (event) => {
    setProfileDraft((current) => ({ ...current, [field]: event.target.value }));
    setError('');
  };

  const updateAddressField = (field) => (event) => {
    setProfileDraft((current) => ({
      ...current,
      address: { ...current.address, [field]: event.target.value },
    }));
    setError('');
  };

  async function submitProfile(event) {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      const updatedUser = await updateCurrentUser(profileDraft);
      onAuth?.(updatedUser);
      setEditingProfile(false);
      setMessage('Your StoreDB profile details have been updated.');
    } catch (profileError) {
      setError(profileError.message);
    } finally {
      setSubmitting(false);
    }
  }

  const displayName = user?.name || user?.username || 'Customer';
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'CU';

  const panels = {
    login: (
      <form className="account-form" key="login" onSubmit={submitLogin}>
        <span className="eyebrow">Welcome back</span>
        <h2>Sign in to your account</h2>
        <p>Use the username or email stored in StoreDB.</p>
        <Field
          label="Email address or username"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          placeholder="you@example.com"
          autoComplete="username"
        />
        <Field
          label="Password"
          type="password"
          value={loginPassword}
          onChange={(event) => setLoginPassword(event.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
        />
        <div className="form-row"><label className="remember"><input type="checkbox" /> Remember me</label></div>
        <button className="primary-button form-submit" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in'} <Icon name="arrow" size={17} />
        </button>
        <div className="login-links">
          <button type="button" onClick={() => changeView('register')}><span>New here?</span><strong>Register a new account</strong><Icon name="arrow" size={16} /></button>
          <button type="button" onClick={() => changeView('forgot')}><span>Cannot sign in?</span><strong>Forgot your password</strong><Icon name="arrow" size={16} /></button>
        </div>
      </form>
    ),
    register: (
      <form className="account-form" key="register" onSubmit={submitRegistration}>
        <button className="account-back" type="button" onClick={() => changeView('login')}><Icon name="arrow" size={15} /> Back to login</button>
        <span className="eyebrow">Join the community</span>
        <h2>Create your account</h2>
        <p>A customer login and customer record will be created together.</p>
        <Field label="Full name" value={registration.name} onChange={updateRegistration('name')} placeholder="Morgan Lee" autoComplete="name" />
        <Field label="Username" value={registration.username} onChange={updateRegistration('username')} placeholder="morganlee" minLength={3} autoComplete="username" />
        <Field label="Email address" type="email" value={registration.email} onChange={updateRegistration('email')} placeholder="you@example.com" autoComplete="email" />
        <Field label="Password" type="password" value={registration.password} onChange={updateRegistration('password')} placeholder="At least 8 characters" minLength={8} autoComplete="new-password" />
        <Field label="Confirm password" type="password" value={registration.confirmPassword} onChange={updateRegistration('confirmPassword')} placeholder="Enter the same password" minLength={8} autoComplete="new-password" />
        <button className="primary-button form-submit" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Create account'} <Icon name="arrow" size={17} />
        </button>
      </form>
    ),
    forgot: (
      <form className="account-form" key="forgot" onSubmit={(event) => { event.preventDefault(); setView('login'); setError(''); setMessage('Password reset is not connected to email delivery in this prototype.'); }}>
        <button className="account-back" type="button" onClick={() => changeView('login')}><Icon name="arrow" size={15} /> Back to login</button>
        <span className="eyebrow">Account recovery</span>
        <h2>Reset your password</h2>
        <p>Enter your account email to request reset instructions.</p>
        <Field label="Email address" type="email" placeholder="you@example.com" autoComplete="email" />
        <button className="primary-button form-submit">Send reset link <Icon name="mail" size={17} /></button>
      </form>
    ),
    profile: user ? (
      <div className="account-form profile-view" key="profile">
        <div className="profile-heading">
          <div className="profile-avatar"><span>{initials}</span></div>
          <div><span className="eyebrow">StoreDB account</span><h2>{displayName}</h2><p>{user.email}</p></div>
          <button type="button" onClick={signOut} disabled={submitting}>Log out</button>
        </div>
        {checkoutPending && <button className="primary-button account-continue-button" type="button" onClick={() => navigate('checkout')}>Continue to checkout <Icon name="arrow" size={17} /></button>}
        <div className="profile-stats">
          <div><strong>{user.role}</strong><span>Account role</span></div>
          <div><strong>{user.customerId || 'Not applicable'}</strong><span>{user.role === 'Customer' ? 'Customer record' : 'Customer access'}</span></div>
          <div><strong>{user.paymentMethod ? `**** ${user.paymentMethod.last4}` : 'None'}</strong><span>Saved card</span></div>
        </div>
        <div className="profile-section">
          <h3>Account pages</h3>
          <div className="account-shortcuts">
            {user.role === 'Customer' && <button onClick={() => navigate('my-library')}>My Library</button>}
            {user.role === 'Customer' && <button onClick={() => navigate('order-history')}>Order History</button>}
            {user.role === 'Customer' && <button onClick={() => navigate('wishlist')}>Wishlist</button>}
            {user.role === 'Customer' && <button onClick={() => navigate('payment-methods')}>Payment Methods</button>}
            {user.role === 'Employee' && <button onClick={() => navigate('employee-dashboard')}>Employee Dashboard</button>}
            {user.isAdmin && <button onClick={() => navigate('admin-dashboard')}>Admin Dashboard</button>}
            <button onClick={() => navigate('settings')}>Settings</button>
          </div>
        </div>
        <div className="profile-section">
          <div className="profile-section-heading">
            <h3>Personal information</h3>
            <button
              type="button"
              onClick={() => {
                setProfileDraft(buildProfileDraft(user));
                setEditingProfile((current) => !current);
                setError('');
                setMessage('');
              }}
            >
              {editingProfile ? 'Cancel' : 'Edit details'}
            </button>
          </div>
          {editingProfile ? (
            <form className="profile-edit-form" onSubmit={submitProfile}>
              <div className="profile-edit-grid">
                <Field label="Full name" value={profileDraft.name} onChange={updateProfileField('name')} autoComplete="name" />
                <Field label="Email address" type="email" value={profileDraft.email} onChange={updateProfileField('email')} autoComplete="email" />
                {user.role === 'Customer' && (
                  <>
                    <Field label="Phone number" value={profileDraft.phoneNumber} onChange={updateProfileField('phoneNumber')} required={false} autoComplete="tel" />
                    <Field label="Street address" value={profileDraft.address.streetAddress} onChange={updateAddressField('streetAddress')} required={false} autoComplete="street-address" />
                    <Field label="Suburb" value={profileDraft.address.suburb} onChange={updateAddressField('suburb')} required={false} autoComplete="address-level2" />
                    <Field label="State" value={profileDraft.address.state} onChange={updateAddressField('state')} required={false} autoComplete="address-level1" />
                    <Field label="Postcode" value={profileDraft.address.postCode} onChange={updateAddressField('postCode')} required={false} autoComplete="postal-code" />
                  </>
                )}
              </div>
              <div className="profile-edit-actions">
                <button className="primary-button" disabled={submitting}>{submitting ? 'Saving...' : 'Save details'}</button>
              </div>
            </form>
          ) : (
            <div className="profile-info-grid">
              <span><small>Full name</small><strong>{displayName}</strong></span>
              <span><small>Username</small><strong>{user.username}</strong></span>
              <span><small>Email address</small><strong>{user.email || 'Not supplied'}</strong></span>
              <span><small>Phone number</small><strong>{user.phoneNumber || 'Not supplied'}</strong></span>
              {user.role === 'Customer' && <span><small>Street address</small><strong>{user.address?.streetAddress || 'Not supplied'}</strong></span>}
              {user.role === 'Customer' && <span><small>Suburb and state</small><strong>{[user.address?.suburb, user.address?.state, user.address?.postCode].filter(Boolean).join(', ') || 'Not supplied'}</strong></span>}
              <span><small>Account status</small><strong className="status-active">Active</strong></span>
            </div>
          )}
        </div>
      </div>
    ) : null,
  };

  return (
    <main className={`account-page page-shell ${user ? 'account-page-profile' : ''}`}>
      <div className="account-visual">
        <img className="account-visual-image" src={accountVisualArt} alt="" />
      </div>
      <div className="account-panel">
        <div className="account-panel-label"><Icon name={user ? 'user' : 'lock'} size={17} />{user ? 'My account' : 'Secure account access'}</div>
        {message && <div className="form-message"><Icon name="check" size={16} />{message}</div>}
        {error && <div className="form-message account-error" role="alert">{error}</div>}
        {panels[view] || panels.login}
      </div>
    </main>
  );
}
