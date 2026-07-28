import { useEffect, useState } from 'react';
import { createAdminUser, deleteAdminUser, fetchAdminUsers, updateAdminUser } from '../api/admin';
import AdminSideNav from '../components/AdminSideNav';
import Icon from '../components/Icon';

const emptyUser = { name: '', username: '', email: '', password: '', role: 'Customer' };

function getAccountKey(record) {
  return record?.accountKey || `${record?.accountSource || 'user'}:${record?.id}`;
}

function isSameAccount(first, second) {
  return Boolean(first && second && getAccountKey(first) === getAccountKey(second));
}

export default function AdminUserManagementPage({ user, navigate }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyUser);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  async function loadUsers() {
    try {
      setUsers(await fetchAdminUsers());
      setError('');
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  useEffect(() => { if (user?.isAdmin) loadUsers(); }, [user]);
  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  async function submitUser(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const created = await createAdminUser(form);
      setMessage(`${created.name || created.email} created as ${created.role}.`);
      setForm(emptyUser);
      await loadUsers();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveUserChanges(event) {
    event.preventDefault();
    if (!editingUser) return;
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const updated = await updateAdminUser(getAccountKey(editingUser), editingUser);
      setMessage(`${updated.name || updated.email} account details updated.`);
      setEditingUser(null);
      await loadUsers();
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeUser(record) {
    if (!window.confirm(`Delete ${record.username}?`)) return;
    setMessage('');
    setError('');
    try {
      await deleteAdminUser(getAccountKey(record));
      setMessage(`${record.name || record.email} deleted.`);
      await loadUsers();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  if (!user?.isAdmin) return <main className="account-workspace page-shell"><div className="empty-state"><Icon name="lock" size={30} /><h3>Admin access required</h3><button className="primary-button" onClick={() => navigate('account')}>Go to Account</button></div></main>;

  return (
    <main className="account-workspace page-shell">
      <section className="account-workspace-heading"><h1>Admin User Management</h1></section>
      <div className="account-workspace-layout">
        <AdminSideNav active="admin-user-management" navigate={navigate} />
        <section className="account-workspace-main">
          <div className="workspace-section-label">Create Customer, Employee, or Admin</div>
          <form className="workspace-panel admin-form" onSubmit={submitUser}>
            <label><span>Full name</span><input value={form.name} onChange={updateField('name')} required /></label>
            {form.role !== 'Customer' && (
              <label><span>Username</span><input value={form.username} onChange={updateField('username')} minLength="3" required /></label>
            )}
            <label><span>Email</span><input type="email" value={form.email} onChange={updateField('email')} required /></label>
            <label><span>Temporary password</span><input type="password" value={form.password} onChange={updateField('password')} minLength="8" autoComplete="new-password" required /></label>
            <label>
              <span>Account role</span>
              <select value={form.role} onChange={updateField('role')}>
                <option>Customer</option>
                <option>Employee</option>
                <option>Admin</option>
              </select>
            </label>
            <div className="admin-form-actions"><button className="primary-button" disabled={saving}>{saving ? 'Creating...' : 'Create Account'}</button></div>
          </form>
          {message && <div className="workspace-panel workspace-success">{message}</div>}
          {error && <div className="workspace-panel workspace-error" role="alert">{error}</div>}

          <div className="workspace-section-label">StoreDB Users</div>
          {editingUser && (
            <form className="workspace-panel admin-form admin-edit-user-form" onSubmit={saveUserChanges}>
              <label><span>Full name</span><input value={editingUser.name} onChange={(event) => setEditingUser((current) => ({ ...current, name: event.target.value }))} required /></label>
              <label><span>Email</span><input type="email" value={editingUser.email} onChange={(event) => setEditingUser((current) => ({ ...current, email: event.target.value }))} required /></label>
              <label>
                <span>Account role</span>
                <select
                  value={editingUser.role}
                  onChange={(event) => setEditingUser((current) => ({ ...current, role: event.target.value }))}
                  disabled={isSameAccount(editingUser, user) || editingUser.originalRole === 'Customer'}
                >
                  {editingUser.originalRole === 'Customer' ? (
                    <option>Customer</option>
                  ) : (
                    <>
                      <option>Employee</option>
                      <option>Admin</option>
                    </>
                  )}
                </select>
              </label>
              <div className="admin-form-actions">
                <button type="button" onClick={() => setEditingUser(null)}>Cancel</button>
                <button className="primary-button" disabled={saving}>{saving ? 'Saving...' : 'Save Account'}</button>
              </div>
            </form>
          )}
          <div className="admin-data-table admin-user-table">
            <div className="admin-data-header"><span>ID</span><span>User</span><span>Email</span><span>Role</span><span>Actions</span></div>
            {users.map((record) => (
              <article key={getAccountKey(record)}>
                <span>{record.accountSource === 'patron' ? `Patron ${record.id}` : `User ${record.id}`}</span>
                <span><strong>{record.name || record.username}</strong><small>{record.username}</small></span>
                <span>{record.email || 'No email'}</span>
                <span>{record.role}</span>
                <span className="admin-row-actions">
                  <button onClick={() => {
                    setEditingUser({
                      id: record.id,
                      accountSource: record.accountSource,
                      accountKey: getAccountKey(record),
                      username: record.username,
                      name: record.name || record.username,
                      email: record.email || '',
                      role: record.role,
                      originalRole: record.role,
                    });
                    setMessage('');
                    setError('');
                  }}>Edit</button>
                  <button onClick={() => removeUser(record)} disabled={isSameAccount(record, user)}>Delete</button>
                </span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
