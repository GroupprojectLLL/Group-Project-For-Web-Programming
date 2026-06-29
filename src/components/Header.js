import { useState } from 'react';
import Icon from './Icon';
import Logo from './Logo';

export default function Header({ navigate, navigationMenus, search, setSearch, cartCount }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const submitSearch = (event) => {
    event.preventDefault();
    navigate('listing');
  };

  return (
    <header className="site-header">
        <div className="header-main">
          <Logo onClick={() => navigate('home')} />
          <form className="search-box" onSubmit={submitSearch}>
            <Icon name="search" size={19} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search games, books, movies..." aria-label="Search products" />
            <span className="search-key">/</span>
          </form>
          <div className="header-actions">
            <button className="icon-button cart-button" onClick={() => navigate('cart')} aria-label="Cart">
              <Icon name="bag" size={21} />
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </button>
            <button className="account-button" onClick={() => navigate('account')}>
              <span>My account</span>
              <Icon name="chevron" size={14} />
            </button>
            <button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
              <Icon name={mobileOpen ? 'close' : 'menu'} />
            </button>
          </div>
        </div>
        <nav className={mobileOpen ? 'nav-open' : ''}>
          <button className="nav-home" onClick={() => navigate('home')}>Home</button>
          {navigationMenus.map((menu) => (
            <div className="nav-menu" key={menu.label}>
              <button onClick={() => navigate('listing', menu.label)}>{menu.label}<Icon name="chevron" size={13} /></button>
              <div className="nav-dropdown">
                <strong>{menu.label}</strong>
                <button onClick={() => navigate('listing', menu.label)}>View all {menu.label}</button>
                {menu.items.map((item) => <button onClick={() => navigate('listing', menu.label, item)} key={item}>{item}</button>)}
              </div>
            </div>
          ))}
          <button onClick={() => navigate('listing')} className="deal-link">Deals</button>
        </nav>
      </header>
  );
}
