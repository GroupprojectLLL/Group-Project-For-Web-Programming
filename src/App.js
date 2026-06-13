import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { categories, products } from './data';

const iconPaths = {
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.2 4.2" /></>,
  bag: <><path d="M5 8.5h14l-1 12H6l-1-12Z" /><path d="M9 10V7a3 3 0 0 1 6 0v3" /></>,
  user: <><circle cx="12" cy="8" r="3.5" /><path d="M5.5 20c.5-4 2.8-6 6.5-6s6 2 6.5 6" /></>,
  arrow: <path d="m9 18 6-6-6-6" />,
  spark: <><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z" /><path d="m19 17 .7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7L19 17Z" /></>,
  play: <path d="m9 7 9 5-9 5V7Z" />,
  heart: <path d="M20.8 8.6c0 5.1-8.8 10.2-8.8 10.2S3.2 13.7 3.2 8.6A4.4 4.4 0 0 1 12 8a4.4 4.4 0 0 1 8.8.6Z" />,
  check: <path d="m5 12 4.5 4.5L19 7" />,
  chevron: <path d="m7 10 5 5 5-5" />,
  sliders: <><path d="M4 7h16M4 17h16" /><circle cx="9" cy="7" r="2" /><circle cx="15" cy="17" r="2" /></>,
  grid: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
};

function Icon({ name, size = 20 }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  );
}

function Rating({ value, reviews, compact = false }) {
  return (
    <div className="rating" aria-label={`${value} out of 5 stars`}>
      <span className="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <i className={star <= Math.round(value) ? 'filled' : ''} key={star} />
        ))}
      </span>
      <strong>{value}</strong>
      {!compact && <span>({reviews.toLocaleString()})</span>}
    </div>
  );
}

function Logo({ onClick }) {
  return (
    <button className="logo" onClick={onClick} aria-label="Go to home">
      <span className="logo-mark"><span /></span>
      <span>zehao<span className="logo-accent">shangou</span></span>
    </button>
  );
}

function Header({ navigate, cartCount, search, setSearch }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const submitSearch = (event) => {
    event.preventDefault();
    navigate('listing');
  };

  return (
    <>
      <div className="announcement">
        <span><Icon name="spark" size={14} /> Mid-year drop: save up to 60% on selected titles</span>
        <button onClick={() => navigate('listing')}>Explore deals <Icon name="arrow" size={14} /></button>
      </div>
      <header className="site-header">
        <div className="header-main">
          <Logo onClick={() => navigate('home')} />
          <form className="search-box" onSubmit={submitSearch}>
            <Icon name="search" size={19} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search games, books, movies..." aria-label="Search products" />
            <span className="search-key">/</span>
          </form>
          <div className="header-actions">
            <button className="icon-button cart-button" aria-label="Cart">
              <Icon name="bag" size={21} />
              <span className="cart-count">{cartCount}</span>
            </button>
            <button className="account-button" onClick={() => navigate('account')}>
              <span className="avatar-mini">M</span>
              <span><small>Welcome back</small>My account</span>
              <Icon name="chevron" size={14} />
            </button>
            <button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
              <Icon name={mobileOpen ? 'close' : 'menu'} />
            </button>
          </div>
        </div>
        <nav className={mobileOpen ? 'nav-open' : ''}>
          <button onClick={() => navigate('home')}>Discover</button>
          {categories.map((category) => (
            <button key={category.name} onClick={() => navigate('listing', category.name)}>{category.name}</button>
          ))}
          <button onClick={() => navigate('listing')} className="deal-link"><span />Deals</button>
          <button onClick={() => navigate('listing')}>Top charts</button>
        </nav>
      </header>
    </>
  );
}

function ProductArt({ product, className = '' }) {
  return (
    <div className={`product-art art-${product.art} ${className}`}>
      <span className="art-orbit orbit-one" />
      <span className="art-orbit orbit-two" />
      <span className="art-grid" />
      <span className="art-label">{product.type}</span>
      <strong>{product.title}</strong>
      <small>ZEHAOSHANGOU ORIGINAL</small>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description, action, onAction }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action && <button className="text-button" onClick={onAction}>{action}<Icon name="arrow" size={16} /></button>}
    </div>
  );
}

function ProductCard({ product, onView, onAdd, wide = false }) {
  const saving = Math.round((1 - product.price / product.oldPrice) * 100);
  return (
    <article className={`product-card ${wide ? 'product-card-wide' : ''}`}>
      <button className="cover-button" onClick={() => onView(product)}>
        <ProductArt product={product} />
        <span className="discount-pill">-{saving}%</span>
        <span className="quick-view">Quick view <Icon name="arrow" size={14} /></span>
      </button>
      <div className="product-card-body">
        <div className="product-meta"><span>{product.category}</span><span>{product.type}</span></div>
        <button className="product-title" onClick={() => onView(product)}>{product.title}</button>
        <Rating value={product.rating} reviews={product.reviews} />
        <div className="product-card-footer">
          <div className="price"><strong>${product.price}</strong><del>${product.oldPrice}</del></div>
          <button className="add-button" onClick={() => onAdd(product)} aria-label={`Add ${product.title} to cart`}>
            <Icon name="bag" size={17} /><span>Add</span>
          </button>
        </div>
      </div>
    </article>
  );
}

function HomePage({ navigate, viewProduct, addToCart }) {
  return (
    <main>
      <section className="hero page-shell">
        <div className="hero-copy">
          <span className="hero-kicker"><i /> FEATURED RELEASE</span>
          <h1>Lose yourself in the <em>unknown.</em></h1>
          <p>Chart a course through a beautiful fractured galaxy in this award-winning story adventure.</p>
          <div className="hero-rating"><Rating value={4.9} reviews={2847} /><span>Overwhelmingly positive</span></div>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => viewProduct(products[0])}>Explore Nebula Protocol <Icon name="arrow" /></button>
            <button className="round-button" onClick={() => viewProduct(products[0])}><Icon name="play" size={18} /></button>
            <span>Watch trailer</span>
          </div>
          <div className="hero-stats">
            <span><strong>60%</strong> launch offer</span>
            <span><strong>12h</strong> story mode</span>
            <span><strong>4K</strong> enhanced</span>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <span className="hero-planet" />
          <span className="hero-ring ring-one" />
          <span className="hero-ring ring-two" />
          <span className="hero-ship">PV-7</span>
          <span className="hero-price"><small>Launch price</small><strong>$19.99</strong></span>
        </div>
      </section>

      <section className="content-section page-shell">
        <SectionHeading eyebrow="Browse the vault" title="Pick your next obsession" description="Curated collections for every kind of downtime." />
        <div className="category-grid">
          {categories.map((category, index) => (
            <button className={`category-card category-${category.accent}`} key={category.name} onClick={() => navigate('listing', category.name)}>
              <span className="category-number">0{index + 1}</span>
              <span className="category-icon"><span /><span /></span>
              <span className="category-copy"><small>{category.count}</small><strong>{category.name}</strong><em>{category.description}</em></span>
              <span className="category-go"><Icon name="arrow" size={18} /></span>
            </button>
          ))}
        </div>
      </section>

      <section className="content-section page-shell">
        <SectionHeading eyebrow="Limited time" title="Deals worth downloading" description="Great stories, smaller prices. Updated every Friday." action="View all deals" onAction={() => navigate('listing')} />
        <div className="product-row">
          {products.slice(1, 6).map((product) => (
            <ProductCard product={product} onView={viewProduct} onAdd={addToCart} key={product.id} />
          ))}
        </div>
      </section>

      <section className="newsletter page-shell">
        <div>
          <span className="eyebrow">Never miss a drop</span>
          <h2>Good things, straight to your inbox.</h2>
          <p>Fresh releases, thoughtful recommendations, and members-only offers. No noise.</p>
        </div>
        <form onSubmit={(event) => event.preventDefault()}>
          <Icon name="mail" />
          <input placeholder="you@example.com" aria-label="Email address" />
          <button className="primary-button">Join the list <Icon name="arrow" size={17} /></button>
        </form>
      </section>
    </main>
  );
}

function FilterGroup({ title, options, selected, onChange }) {
  return (
    <div className="filter-group">
      <h4>{title}</h4>
      {options.map((option) => (
        <label key={option}>
          <input type="checkbox" checked={selected.includes(option)} onChange={() => onChange(option)} />
          <span className="checkmark"><Icon name="check" size={12} /></span>
          {option}
        </label>
      ))}
    </div>
  );
}

function ListingPage({ category, setCategory, search, viewProduct, addToCart }) {
  const [sort, setSort] = useState('Popular');
  const [types, setTypes] = useState([]);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [priceLimit, setPriceLimit] = useState(60);

  const toggleType = (type) => setTypes((current) => current.includes(type) ? current.filter((item) => item !== type) : [...current, type]);
  const visibleProducts = useMemo(() => {
    let result = products.filter((product) =>
      (category === 'All products' || product.category === category) &&
      (!search || product.title.toLowerCase().includes(search.toLowerCase())) &&
      (!types.length || types.includes(product.type)) &&
      product.price <= priceLimit
    );
    if (sort === 'Price: Low') result = [...result].sort((a, b) => a.price - b.price);
    if (sort === 'Rating') result = [...result].sort((a, b) => b.rating - a.rating);
    return result;
  }, [category, search, types, priceLimit, sort]);

  return (
    <main className="listing-page page-shell">
      <div className="breadcrumbs"><button>Discover</button><Icon name="arrow" size={13} /><span>{category}</span></div>
      <div className="listing-title">
        <div><span className="eyebrow">The digital shelf</span><h1>{search ? `Results for "${search}"` : category}</h1><p>{visibleProducts.length} hand-picked titles ready to download.</p></div>
        <div className="listing-controls">
          <button className="filter-toggle" onClick={() => setMobileFilters(!mobileFilters)}><Icon name="sliders" size={18} /> Filters</button>
          <label className="sort-select">Sort by:<select value={sort} onChange={(event) => setSort(event.target.value)}><option>Popular</option><option>Rating</option><option>Price: Low</option></select><Icon name="chevron" size={14} /></label>
          <button className="view-mode"><Icon name="grid" size={18} /></button>
        </div>
      </div>
      <div className="listing-layout">
        <aside className={mobileFilters ? 'filters-open' : ''}>
          <div className="filter-header"><h3>Filters</h3><button onClick={() => { setCategory('All products'); setTypes([]); setPriceLimit(60); }}>Clear all</button></div>
          <FilterGroup title="Category" options={['E-books', 'Games', 'Movies & TV']} selected={category === 'All products' ? [] : [category]} onChange={(value) => setCategory(value === category ? 'All products' : value)} />
          <FilterGroup title="Genre" options={['Action', 'Adventure', 'Design', 'Fiction', 'Mystery', 'Puzzle']} selected={types} onChange={toggleType} />
          <div className="filter-group price-filter">
            <h4>Price range</h4>
            <div><span>$0</span><strong>${priceLimit}</strong></div>
            <input type="range" min="5" max="60" value={priceLimit} onChange={(event) => setPriceLimit(Number(event.target.value))} />
          </div>
          <div className="filter-promo">
            <Icon name="spark" />
            <strong>Member pricing</strong>
            <p>Sign in to unlock extra savings on selected titles.</p>
          </div>
        </aside>
        <section>
          {visibleProducts.length ? (
            <div className="listing-grid">
              {visibleProducts.map((product) => <ProductCard product={product} onView={viewProduct} onAdd={addToCart} key={product.id} />)}
            </div>
          ) : (
            <div className="empty-state"><Icon name="search" size={30} /><h3>No titles found</h3><p>Try clearing a filter or searching for something else.</p></div>
          )}
          <div className="pagination"><button disabled><Icon name="arrow" size={16} /></button><button className="active">1</button><button>2</button><button>3</button><span>...</span><button>8</button><button><Icon name="arrow" size={16} /></button></div>
        </section>
      </div>
    </main>
  );
}

function ProductDetailPage({ product, addToCart, navigate }) {
  const [gallery, setGallery] = useState(0);
  const galleryLabels = ['Key art', 'In-game', 'World map', 'Characters'];

  return (
    <main className="detail-page page-shell">
      <div className="breadcrumbs"><button onClick={() => navigate('home')}>Discover</button><Icon name="arrow" size={13} /><button onClick={() => navigate('listing', product.category)}>{product.category}</button><Icon name="arrow" size={13} /><span>{product.title}</span></div>
      <section className="product-intro">
        <div className="product-gallery">
          <div className={`gallery-main gallery-${gallery}`}><ProductArt product={product} /><button className="trailer-button"><Icon name="play" /> Watch trailer</button><span className="gallery-counter">0{gallery + 1} / 04</span></div>
          <div className="gallery-thumbs">
            {galleryLabels.map((label, index) => <button className={gallery === index ? 'active' : ''} onClick={() => setGallery(index)} key={label}><ProductArt product={{ ...product, art: ['nebula', 'neon', 'parallel', 'solaris'][index] }} /><span>{label}</span></button>)}
          </div>
        </div>
        <div className="product-info">
          <span className="product-badge">{product.badge}</span>
          <span className="eyebrow">{product.category} / {product.type}</span>
          <h1>{product.title}</h1>
          <p className="product-lead">{product.description}</p>
          <Rating value={product.rating} reviews={product.reviews} />
          <div className="detail-price"><strong>${product.price}</strong><del>${product.oldPrice}</del><span>Save {Math.round((1 - product.price / product.oldPrice) * 100)}%</span></div>
          <button className="buy-button" onClick={() => addToCart(product)}><span>Buy now</span><strong>${product.price}</strong><Icon name="arrow" /></button>
          <div className="secondary-actions">
            <button onClick={() => addToCart(product)}><Icon name="bag" size={18} /> Add to cart</button>
            <button><Icon name="heart" size={18} /> Add to wishlist</button>
          </div>
          <div className="detail-facts">
            <div><span>Delivery</span><strong>Instant download</strong></div>
            <div><span>License</span><strong>Personal use</strong></div>
            <div><span>Platform</span><strong>Windows / macOS</strong></div>
            <div><span>File size</span><strong>18.6 GB</strong></div>
          </div>
          <div className="secure-note"><Icon name="lock" size={17} /><span><strong>Secure checkout</strong> 7-day refund policy on unused downloads</span></div>
        </div>
      </section>

      <section className="detail-description">
        <div>
          <span className="eyebrow">About this title</span>
          <h2>A small ship. A very big universe.</h2>
          <p>{product.description} Every choice opens a new path, every destination has a story, and no two journeys unfold in quite the same way.</p>
          <p>Created by a close-knit independent team, {product.title} pairs a memorable original score with hand-crafted environments and accessible, rewarding play.</p>
        </div>
        <div className="feature-list">
          {['A rich story shaped by your choices', 'A fully original atmospheric soundtrack', 'Optimized for keyboard and controller', 'Includes all launch-day bonus content'].map((feature) => <span key={feature}><i><Icon name="check" size={14} /></i>{feature}</span>)}
        </div>
      </section>

      <section className="reviews-section">
        <SectionHeading eyebrow="Player reviews" title="Loved across the galaxy" description="Verified reviews from zehaoshangou customers." />
        <div className="review-grid">
          {[['Ari K.', 'Beautiful from start to finish. I kept stopping just to look around.'], ['Jordan M.', 'Smart writing, satisfying exploration, and an incredible soundtrack.']].map(([name, quote]) => (
            <article key={name}><Rating value={5} reviews={0} compact /><p>"{quote}"</p><div><span className="review-avatar">{name[0]}</span><span><strong>{name}</strong><small>Verified purchase</small></span></div></article>
          ))}
        </div>
      </section>
    </main>
  );
}

function Field({ label, type = 'text', placeholder, defaultValue }) {
  return <label className="form-field"><span>{label}</span><input type={type} placeholder={placeholder} defaultValue={defaultValue} /></label>;
}

function AccountPage() {
  const [view, setView] = useState('login');
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState('');
  const submit = (event, nextView, nextMessage) => {
    event.preventDefault();
    setMessage(nextMessage);
    if (nextView === 'profile') setLoggedIn(true);
    setView(nextView);
  };

  const panels = {
    login: (
      <form className="account-form" onSubmit={(event) => submit(event, 'profile', 'Welcome back. You are signed in.')}>
        <span className="eyebrow">Welcome back</span><h2>Sign in to your account</h2><p>Access your library, wishlist, and member prices.</p>
        <Field label="Email address" type="email" placeholder="you@example.com" /><Field label="Password" type="password" placeholder="Enter your password" />
        <div className="form-row"><label className="remember"><input type="checkbox" /> Remember me</label></div>
        <button className="primary-button form-submit">Sign in <Icon name="arrow" size={17} /></button>
        <div className="login-links">
          <button type="button" onClick={() => { setView('register'); setMessage(''); }}><span>New here?</span><strong>Register a new account</strong><Icon name="arrow" size={16} /></button>
          <button type="button" onClick={() => { setView('forgot'); setMessage(''); }}><span>Cannot sign in?</span><strong>Forgot your password</strong><Icon name="arrow" size={16} /></button>
        </div>
      </form>
    ),
    register: (
      <form className="account-form" onSubmit={(event) => submit(event, 'login', 'Your new account is ready. Please sign in.')}>
        <button className="account-back" type="button" onClick={() => { setView('login'); setMessage(''); }}><Icon name="arrow" size={15} /> Back to login</button>
        <span className="eyebrow">Join the community</span><h2>Create your account</h2><p>Build a library of stories you will love.</p>
        <div className="two-fields"><Field label="First name" placeholder="Morgan" /><Field label="Last name" placeholder="Lee" /></div>
        <Field label="Email address" type="email" placeholder="you@example.com" /><Field label="Password" type="password" placeholder="At least 8 characters" />
        <label className="terms"><input type="checkbox" required /><span>I agree to the Terms of Service and Privacy Policy.</span></label>
        <button className="primary-button form-submit">Create account <Icon name="arrow" size={17} /></button>
      </form>
    ),
    forgot: (
      <form className="account-form" onSubmit={(event) => submit(event, 'login', 'Password reset instructions have been sent.')}>
        <button className="account-back" type="button" onClick={() => { setView('login'); setMessage(''); }}><Icon name="arrow" size={15} /> Back to login</button>
        <span className="eyebrow">Account recovery</span><h2>Reset your password</h2><p>Enter your account email and we will send you a secure reset link.</p>
        <Field label="Email address" type="email" placeholder="you@example.com" />
        <button className="primary-button form-submit">Send reset link <Icon name="mail" size={17} /></button>
      </form>
    ),
    profile: (
      <div className="account-form profile-view">
        <div className="profile-heading">
          <div className="profile-avatar"><span>ML</span></div>
          <div><span className="eyebrow">Signed in</span><h2>Morgan Lee</h2><p>morgan.lee@example.com</p></div>
          <button type="button" onClick={() => { setLoggedIn(false); setView('login'); setMessage(''); }}>Log out</button>
        </div>
        <div className="profile-stats"><div><strong>12</strong><span>Owned titles</span></div><div><strong>4</strong><span>Wishlist</span></div><div><strong>2026</strong><span>Member since</span></div></div>
        <div className="profile-section"><h3>Personal information</h3><div className="profile-info-grid"><span><small>Full name</small><strong>Morgan Lee</strong></span><span><small>Phone</small><strong>+65 8123 4567</strong></span><span><small>Email address</small><strong>morgan.lee@example.com</strong></span><span><small>Account status</small><strong className="status-active">Active</strong></span></div></div>
        <div className="profile-section"><h3>Recent library</h3><div className="profile-library">{products.slice(0, 3).map((product) => <div key={product.id}><ProductArt product={product} /><span><strong>{product.title}</strong><small>{product.category}</small></span></div>)}</div></div>
      </div>
    ),
  };

  return (
    <main className="account-page page-shell">
      <div className="account-visual">
        <Logo onClick={() => {}} />
        <div className="account-quote"><span className="quote-mark">"</span><h1>Everything you love, all in one place.</h1><p>Your library follows you wherever the story goes.</p></div>
        <div className="library-stack">{products.slice(0, 4).map((product) => <ProductArt product={product} key={product.id} />)}</div>
        <div className="account-proof"><div><span className="avatar-stack"><i>A</i><i>M</i><i>J</i></span><strong>Join 48,000+ collectors</strong></div><Rating value={4.9} reviews={12000} /></div>
      </div>
      <div className="account-panel">
        <div className="account-panel-label"><Icon name={loggedIn ? 'user' : 'lock'} size={17} />{loggedIn ? 'My account' : 'Secure account access'}</div>
        {message && <div className="form-message"><Icon name="check" size={16} />{message}</div>}
        {panels[view]}
      </div>
    </main>
  );
}

function Footer({ navigate }) {
  return (
    <footer>
      <div className="footer-main page-shell">
        <div className="footer-brand"><Logo onClick={() => navigate('home')} /><p>Thoughtful digital entertainment, curated for curious people.</p></div>
        <div><strong>Discover</strong><button onClick={() => navigate('listing', 'Games')}>Games</button><button onClick={() => navigate('listing', 'E-books')}>E-books</button><button onClick={() => navigate('listing', 'Movies & TV')}>Movies & TV</button></div>
        <div><strong>zehaoshangou</strong><button>About us</button><button>Gift cards</button><button>Careers</button></div>
        <div><strong>Help</strong><button>Support</button><button>Refunds</button><button>Contact</button></div>
      </div>
      <div className="footer-bottom page-shell"><span>Copyright 2026 zehaoshangou. Built for better downtime.</span><span>Terms &nbsp; Privacy &nbsp; Cookies</span></div>
    </footer>
  );
}

function App() {
  const [page, setPage] = useState(window.location.hash.replace('#', '') || 'home');
  const [category, setCategory] = useState('All products');
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const onHashChange = () => setPage(window.location.hash.replace('#', '') || 'home');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (nextPage, nextCategory) => {
    if (nextCategory) setCategory(nextCategory);
    window.location.hash = nextPage;
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewProduct = (product) => {
    setSelectedProduct(product);
    navigate('detail');
  };

  const addToCart = (product) => {
    setCart((current) => [...current, product]);
    setToast(`${product.title} added to cart`);
    window.setTimeout(() => setToast(''), 2200);
  };

  return (
    <div className="app">
      <Header navigate={navigate} cartCount={cart.length} search={search} setSearch={setSearch} />
      {page === 'home' && <HomePage navigate={navigate} viewProduct={viewProduct} addToCart={addToCart} />}
      {page === 'listing' && <ListingPage category={category} setCategory={setCategory} search={search} viewProduct={viewProduct} addToCart={addToCart} />}
      {page === 'detail' && <ProductDetailPage product={selectedProduct} addToCart={addToCart} navigate={navigate} />}
      {page === 'account' && <AccountPage />}
      <Footer navigate={navigate} />
      <div className={`toast ${toast ? 'show' : ''}`}><Icon name="check" size={16} />{toast}</div>
    </div>
  );
}

export default App;
