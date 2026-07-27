export default function AdminSideNav({ active, navigate }) {
  const links = [
    ['Dashboard', 'admin-dashboard'],
    ['Product Management', 'admin-product-management'],
    ['User Management', 'admin-user-management'],
    ['Customer Account', 'account'],
  ];

  return (
    <aside className="account-side-nav admin-side-nav">
      <span className="side-nav-section-label">Administration</span>
      {links.map(([label, page]) => (
        <button className={active === page ? 'active' : ''} key={page} onClick={() => navigate(page)}>{label}</button>
      ))}
    </aside>
  );
}
