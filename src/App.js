import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { categories, products as demoProducts } from './data';
import { API_ROOT, fetchProducts } from './api/products';
import PlaceholderPage from './pages/PlaceholderPage';
import zhsgLogo from './assets/zhsg-logo.png';
import coverApex from './assets/product-covers/cover-apex.png';
import coverCalm from './assets/product-covers/cover-calm.png';
import coverHabit from './assets/product-covers/cover-habit.png';
import coverNebula from './assets/product-covers/cover-nebula.png';
import coverNeon from './assets/product-covers/cover-neon.png';
import coverNight from './assets/product-covers/cover-night.png';
import coverParallel from './assets/product-covers/cover-parallel.png';
import coverQuiet from './assets/product-covers/cover-quiet.png';
import coverSignal from './assets/product-covers/cover-signal.png';
import coverSolaris from './assets/product-covers/cover-solaris.png';
import coverWeekend from './assets/product-covers/cover-weekend.png';
import coverWorlds from './assets/product-covers/cover-worlds.png';

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
  minus: <path d="M6 12h12" />,
  plus: <><path d="M12 6v12" /><path d="M6 12h12" /></>,
};

const productCoverImages = {
  apex: coverApex,
  calm: coverCalm,
  habit: coverHabit,
  nebula: coverNebula,
  neon: coverNeon,
  night: coverNight,
  parallel: coverParallel,
  quiet: coverQuiet,
  signal: coverSignal,
  solaris: coverSolaris,
  weekend: coverWeekend,
  worlds: coverWorlds,
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
    <div className="rating" aria-label={`${value} out of 5`}>
      <strong>{value} / 5</strong>
      {!compact && <span>({reviews.toLocaleString()} reviews)</span>}
    </div>
  );
}

function Logo({ onClick }) {
  return (
    <button className="logo" onClick={onClick} aria-label="Go to home">
      <img className="logo-mark" src={zhsgLogo} alt="" />
      <span>zehao<span className="logo-accent">shangou</span></span>
    </button>
  );
}

const fallbackNavigationMenus = [
  { label: 'E-books', items: ['Fiction', 'Mystery', 'Design', 'Wellbeing'] },
  { label: 'Games', items: ['Adventure', 'Action', 'Racing', 'Puzzle', 'Simulation'] },
  { label: 'Movies & TV', items: ['Documentary', 'Thriller', 'Animation'] },
];

const categoryOrder = ['E-books', 'Games', 'Movies & TV'];

function buildNavigationMenus(products) {
  return categoryOrder.map((categoryName) => {
    const fallbackMenu = fallbackNavigationMenus.find((menu) => menu.label === categoryName);
    const items = [...new Set(
      products
        .filter((product) => product.category === categoryName)
        .map((product) => product.subCategory || product.type)
        .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b));

    return {
      label: categoryName,
      items: items.length ? items : fallbackMenu?.items || [],
    };
  });
}

const placeholderPages = {
  wishlist: {
    title: 'WishlistPage',
    description: 'Second iteration route prepared for the Wishlist Page.',
  },
  'order-history': {
    title: 'OrderHistoryPage',
    description: 'Second iteration route prepared for the Order History Page.',
  },
  'my-library': {
    title: 'MyLibraryPage',
    description: 'Second iteration route prepared for the My Library Page.',
  },
  'admin-dashboard': {
    title: 'AdminDashboard',
    description: 'Second iteration route prepared for the Admin Dashboard.',
    actions: [
      { label: 'Admin Product Management', page: 'admin-product-management' },
      { label: 'Admin Refund Management', page: 'admin-refund-management' },
      { label: 'Admin User Management', page: 'admin-user-management' },
    ],
  },
  'admin-product-management': {
    title: 'AdminProductManagementPage',
    description: 'Second iteration route prepared for the Admin Product Management Page.',
  },
  'admin-refund-management': {
    title: 'AdminRefundManagementPage',
    description: 'Second iteration route prepared for the Admin Refund Management Page.',
  },
  'admin-user-management': {
    title: 'AdminUserManagementPage',
    description: 'Second iteration route prepared for the Admin User Management Page.',
  },
  newsletter: {
    title: 'NewsletterPage',
    description: 'Newsletter sign-up handling will be completed in a later iteration.',
  },
  about: {
    title: 'AboutPage',
    description: 'Company information will be added when the content is ready.',
  },
  'gift-cards': {
    title: 'GiftCardsPage',
    description: 'Gift card purchasing will be added in a later iteration.',
  },
  careers: {
    title: 'CareersPage',
    description: 'Careers content will be added in a later iteration.',
  },
  support: {
    title: 'SupportPage',
    description: 'Customer support content will be added in a later iteration.',
  },
  refunds: {
    title: 'RefundsPage',
    description: 'Refund policy content will be added in a later iteration.',
  },
  contact: {
    title: 'ContactPage',
    description: 'Contact options will be added in a later iteration.',
  },
  terms: {
    title: 'TermsPage',
    description: 'Terms of service content will be added in a later iteration.',
  },
  privacy: {
    title: 'PrivacyPage',
    description: 'Privacy policy content will be added in a later iteration.',
  },
  cookies: {
    title: 'CookiesPage',
    description: 'Cookie policy content will be added in a later iteration.',
  },
  'listing-page-2': {
    title: 'ListingPage2',
    description: 'Additional product-listing pagination routes are prepared for future product paging.',
  },
  'listing-page-3': {
    title: 'ListingPage3',
    description: 'Additional product-listing pagination routes are prepared for future product paging.',
  },
  'listing-page-8': {
    title: 'ListingPage8',
    description: 'Additional product-listing pagination routes are prepared for future product paging.',
  },
};

function Header({ navigate, navigationMenus, search, setSearch, cartCount }) {
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

function getProductCover(product) {
  return product.imageUrl || product.coverImage || product.image || product.raw?.ImageUrl || product.raw?.Image || productCoverImages[product.art] || coverNebula;
}

function ProductArt({ product, className = '', showTitle = true }) {
  return (
    <figure className={`product-art art-${product.art || 'nebula'} ${className}`}>
      <img className="product-cover-image" src={getProductCover(product)} alt={`${product.title} cover`} loading="lazy" />
      <span className="art-label">{product.type}</span>
      {showTitle && <figcaption>{product.title}</figcaption>}
    </figure>
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

function ProductCard({ product, onView, onAdd, layout = 'grid' }) {
  const saving = Number(product.oldPrice || 0) > Number(product.price || 0)
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;
  return (
    <article className={`product-card product-card-${layout}`}>
      <button className="cover-button" onClick={() => onView(product)}>
        <ProductArt product={product} />
        {saving > 0 && <span className="discount-pill">-{saving}%</span>}
      </button>
      <div className="product-card-body">
        <div className="product-meta"><span>{product.category}</span><span>{product.type}</span></div>
        <button className="product-title" onClick={() => onView(product)}>{product.title}</button>
        {layout === 'row' && <p className="product-card-description">{product.description}</p>}
        <Rating value={product.rating} reviews={product.reviews} />
        <div className="product-card-footer">
          <div className="price"><strong>${product.price}</strong></div>
          <div className="card-actions">
            {layout === 'row' && <button className="view-button" onClick={() => onView(product)}>View details</button>}
            <button className="add-button" onClick={() => onAdd(product)} aria-label={`Add ${product.title} to cart`}>
              <Icon name="bag" size={17} /><span>Add to cart</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function HomePage({ navigate, viewProduct, addToCart, products }) {
  const featuredProduct = products[0] || demoProducts[0];

  return (
    <main>
      <section className="hero page-shell">
        <div className="hero-copy">
          <span className="hero-kicker"><i /> FEATURED RELEASE</span>
          <h1>Lose yourself in the <em>unknown.</em></h1>
          <p>Chart a course through a beautiful fractured galaxy in this award-winning story adventure.</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => viewProduct(featuredProduct)}>Explore {featuredProduct.title} <Icon name="arrow" /></button>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <ProductArt product={featuredProduct} className="hero-cover" showTitle={false} />
          <span className="hero-price"><small>Featured price</small><strong>${Number(featuredProduct.price || 0).toFixed(2)}</strong></span>
        </div>
      </section>

      <section className="content-section page-shell">
        <SectionHeading eyebrow="Browse the vault" title="Pick your next obsession" description="Curated collections for every kind of downtime." />
        <div className="category-grid">
          {categories.map((category) => (
            <button className={`category-card category-${category.accent}`} key={category.name} onClick={() => navigate('listing', category.name)}>
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
        <form onSubmit={(event) => { event.preventDefault(); navigate('newsletter'); }}>
          <Icon name="mail" />
          <input placeholder="you@example.com" aria-label="Email address" />
          <button className="primary-button">Join the list <Icon name="arrow" size={17} /></button>
        </form>
      </section>
    </main>
  );
}

function ListingPage({ category, subCategory, search, viewProduct, addToCart, navigate, products }) {
  const [sort, setSort] = useState('Popular');

  const visibleProducts = useMemo(() => {
    let result = products.filter((product) =>
      (category === 'All products' || product.category === category) &&
      (subCategory === 'All subcategories' || product.subCategory === subCategory || product.type === subCategory) &&
      (!search || product.title.toLowerCase().includes(search.toLowerCase()))
    );
    if (sort === 'Price: Low') result = [...result].sort((a, b) => a.price - b.price);
    if (sort === 'Rating') result = [...result].sort((a, b) => b.rating - a.rating);
    return result;
  }, [category, products, search, sort, subCategory]);

  const listingTitle = search ? `Results for "${search}"` : subCategory !== 'All subcategories' ? subCategory : category;
  const listingDescription = subCategory !== 'All subcategories' && category !== 'All products'
    ? `${visibleProducts.length} ${subCategory} titles in ${category}.`
    : `${visibleProducts.length} hand-picked titles ready to download.`;

  return (
    <main className="listing-page page-shell">
      <div className="listing-title">
        <div><span className="eyebrow">The digital shelf</span><h1>{listingTitle}</h1><p>{listingDescription}</p></div>
        <div className="listing-controls">
          <label className="sort-select">Sort by:<select value={sort} onChange={(event) => setSort(event.target.value)}><option>Popular</option><option>Rating</option><option>Price: Low</option></select><Icon name="chevron" size={14} /></label>
          <button className="view-mode"><Icon name="grid" size={18} /></button>
        </div>
      </div>
      <div className="listing-layout">
        <section>
          {visibleProducts.length ? (
            <div className="listing-grid">
              {visibleProducts.map((product) => <ProductCard product={product} onView={viewProduct} onAdd={addToCart} layout="row" key={product.id} />)}
            </div>
          ) : (
            <div className="empty-state"><Icon name="search" size={30} /><h3>No titles found</h3><p>Try clearing a filter or searching for something else.</p></div>
          )}
          <div className="pagination">
            <button disabled><Icon name="arrow" size={16} /></button>
            <button className="active">1</button>
            <button onClick={() => navigate('listing-page-2')}>2</button>
            <button onClick={() => navigate('listing-page-3')}>3</button>
            <span>...</span>
            <button onClick={() => navigate('listing-page-8')}>8</button>
            <button onClick={() => navigate('listing-page-2')}><Icon name="arrow" size={16} /></button>
          </div>
        </section>
      </div>
    </main>
  );
}

function ProductDetailPage({ product, addToCart, buyNow, navigate }) {
  return (
    <main className="detail-page page-shell">
      <section className="product-intro">
        <div className="product-gallery">
          <div className="gallery-main"><ProductArt product={product} /></div>
        </div>
        <div className="product-info">
          <span className="eyebrow">{product.category} / {product.type}</span>
          <h1>{product.title}</h1>
          <p className="product-lead">{product.description}</p>
          <Rating value={product.rating} reviews={product.reviews} />
          <div className="detail-price"><strong>${product.price}</strong></div>
          <button className="buy-button" onClick={() => buyNow(product)}><span>Buy now</span><strong>${product.price}</strong><Icon name="arrow" /></button>
          <div className="secondary-actions">
            <button onClick={() => addToCart(product)}>Add to cart</button>
            <button onClick={() => navigate('wishlist')}>Add to wishlist</button>
          </div>
          <div className="detail-facts">
            <div><span>Delivery</span><strong>Instant download</strong></div>
            <div><span>Category</span><strong>{product.category}</strong></div>
            <div><span>Subcategory</span><strong>{product.type}</strong></div>
            <div><span>Stock</span><strong>{product.stockQuantity === 0 ? 'Check availability' : product.stockQuantity ? `${product.stockQuantity} available` : product.badge}</strong></div>
          </div>
          <div className="secure-note"><span><strong>Secure checkout</strong> 7-day refund policy on unused downloads</span></div>
        </div>
      </section>

      <section className="detail-description">
        <div>
          <span className="eyebrow">About this title</span>
          <h2>Product information</h2>
          <p>{product.description}</p>
          <p>This product record is displayed through the current storefront flow and can be added to the cart for checkout.</p>
        </div>
        <div className="feature-list">
          {['Image-based product cover', 'Cart and checkout ready', 'Instant digital delivery', 'Order detail after payment'].map((feature, index) => <span key={feature}><strong>{String(index + 1).padStart(2, '0')}</strong>{feature}</span>)}
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  type = 'text',
  placeholder,
  defaultValue,
  required = true,
  minLength,
  value,
  onChange,
  autoComplete,
}) {
  const valueProps = value === undefined ? { defaultValue } : { value, onChange };

  return (
    <label className="form-field">
      <span>{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        {...valueProps}
      />
    </label>
  );
}

function AccountPage({ products, onAuth, checkoutPending, navigate }) {
  const [view, setView] = useState('login');
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const submit = (event, nextView, nextMessage) => {
    event.preventDefault();
    setMessage(nextMessage);
    if (nextView === 'profile') {
      setLoggedIn(true);
      onAuth?.({ name: 'Morgan Lee', email: 'morgan.lee@example.com' });
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
          <div><span className="eyebrow">Signed in</span><h2>Morgan Lee</h2><p>morgan.lee@example.com</p></div>
          <button type="button" onClick={() => { setLoggedIn(false); onAuth?.(null); setView('login'); setMessage(''); }}>Log out</button>
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

function getOrderTotals(items) {
  const subtotal = items.reduce((sum, product) => sum + Number(product.price || 0) * Number(product.quantity || 1), 0);
  const discount = subtotal >= 50 ? subtotal * 0.1 : 0;
  const tax = 0;
  return {
    subtotal,
    discount,
    tax,
    total: subtotal + tax - discount,
  };
}

function CartPage({ products, cart, user, navigate, viewProduct, removeFromCart, changeCartQuantity, addToCart }) {
  const { subtotal, discount, total } = getOrderTotals(cart);
  const totalQuantity = cart.reduce((sum, product) => sum + Number(product.quantity || 1), 0);
  const recommendedProducts = products
    .filter((product) => !cart.some((item) => String(item.id) === String(product.id)))
    .slice(0, 3);

  return (
    <main className="cart-page page-shell">
      <div className="breadcrumbs">
        <button onClick={() => navigate('home')}>Discover</button>
        <Icon name="arrow" size={13} />
        <span>Shopping Cart</span>
      </div>

      <div className="listing-title">
        <div>
          <span className="eyebrow">Shopping cart</span>
          <h1>Your cart</h1>
          <p>Review your digital products before checkout.</p>
        </div>
      </div>

      <section className="cart-layout">
        <div className="cart-items-section">
          <SectionHeading
            eyebrow="Cart items"
            title={`${totalQuantity} item${totalQuantity === 1 ? '' : 's'} selected`}
            description="All products are delivered digitally after payment."
          />

          {cart.length ? (
            <div className="cart-item-list">
              {cart.map((product) => (
                <article className="cart-item-card" key={product.id}>
                  <button className="cart-item-art" onClick={() => viewProduct(product)}>
                    <ProductArt product={product} />
                  </button>

                  <div className="cart-item-info">
                    <span className="eyebrow">{product.category} / {product.type}</span>
                    <button className="cart-item-title" onClick={() => viewProduct(product)}>
                      {product.title}
                    </button>
                    <p>{product.description}</p>

                    <div className="cart-item-meta">
                      <span>Delivery: Instant download</span>
                      <span>License: Personal use</span>
                    </div>

                    <div className="cart-item-actions">
                      <div className="quantity-control" aria-label={`${product.title} quantity`}>
                        <button
                          type="button"
                          onClick={() => changeCartQuantity(product.id, -1)}
                          disabled={Number(product.quantity || 1) <= 1}
                          aria-label={`Decrease ${product.title} quantity`}
                        >
                          <Icon name="minus" size={14} />
                        </button>
                        <span>{product.quantity || 1}</span>
                        <button
                          type="button"
                          onClick={() => changeCartQuantity(product.id, 1)}
                          aria-label={`Increase ${product.title} quantity`}
                        >
                          <Icon name="plus" size={14} />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(product.id)}>Remove</button>
                    </div>
                  </div>

                  <div className="cart-item-price">
                    <strong>${(Number(product.price || 0) * Number(product.quantity || 1)).toFixed(2)}</strong>
                    <span>${Number(product.price || 0).toFixed(2)} each</span>
                    {Number(product.oldPrice || 0) > Number(product.price || 0) && <del>${Number(product.oldPrice || 0).toFixed(2)}</del>}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Icon name="bag" size={30} />
              <h3>Your cart is empty</h3>
              <p>Add games, e-books, or movies before checkout.</p>
              <button className="primary-button" onClick={() => navigate('listing')}>
                Browse products <Icon name="arrow" />
              </button>
            </div>
          )}
        </div>

        <aside className="cart-summary-card">
          <span className="eyebrow">Order summary</span>
          <h2>Summary</h2>

          <div className="summary-lines">
            <div>
              <span>Subtotal</span>
              <strong>${subtotal.toFixed(2)}</strong>
            </div>
            <div>
              <span>Discount</span>
              <strong>-${discount.toFixed(2)}</strong>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <strong>${total.toFixed(2)}</strong>
            </div>
          </div>

          <button
            className="primary-button cart-checkout-button"
            onClick={() => navigate(user ? 'checkout' : 'account')}
            disabled={!cart.length}
          >
            {user ? 'Proceed to Checkout' : 'Sign in to Checkout'} <Icon name="arrow" />
          </button>

          <small>No shipping fee. All products are digital.</small>
        </aside>
      </section>

      <section className="cart-recommend-section">
        <SectionHeading
          eyebrow="You may also like"
          title="Recommended add-ons"
          description="Similar digital products based on your cart."
        />

        <div className="cart-recommend-grid">
          {recommendedProducts.map((product) => (
            <ProductCard
              product={product}
              onView={viewProduct}
              onAdd={addToCart}
              key={product.id}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function CheckoutPage({ cart, user, navigate, onPlaceOrder }) {
  const [paymentMethod, setPaymentMethod] = useState('Visa **** 1234');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [error, setError] = useState('');
  const { subtotal, discount, tax, total } = getOrderTotals(cart);

  function confirmPayment(event) {
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
    onPlaceOrder({
      id: `ORD-${Date.now().toString().slice(-6)}`,
      paymentId: `PAY-${Date.now().toString().slice(-6)}`,
      user,
      items: cart.map((product) => ({ ...product })),
      paymentMethod,
      subtotal,
      discount,
      tax,
      total,
      createdAt: new Date().toLocaleString(),
    });
    navigate('order-detail');
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
            {cart.map((product) => (
              <div className="checkout-product" key={product.id}>
                <ProductArt product={product} />
                <div>
                  <strong>{product.title}</strong>
                  <span>{product.category} / {product.type} / Qty {product.quantity || 1}</span>
                </div>
                <em>${(Number(product.price || 0) * Number(product.quantity || 1)).toFixed(2)}</em>
              </div>
            ))}
          </div>
          <div className="summary-lines">
            <div><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div>
            <div><span>Tax</span><strong>${tax.toFixed(2)}</strong></div>
            <div><span>Discount</span><strong>-${discount.toFixed(2)}</strong></div>
            <div className="summary-total"><span>Total</span><strong>${total.toFixed(2)}</strong></div>
          </div>
          {error && <div className="checkout-error">{error}</div>}
          <button className="primary-button checkout-confirm-button" type="submit" disabled={!user}>
            Confirm Payment <Icon name="arrow" />
          </button>
          <small>Secure checkout. Digital delivery only.</small>
        </aside>
      </form>
    </main>
  );
}

function PaymentMethodsPage({ user, navigate }) {
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

function OrderDetailPage({ order, navigate }) {
  const [refundSubmitted, setRefundSubmitted] = useState(false);

  if (!order) {
    return (
      <main className="order-detail-page page-shell">
        <div className="empty-state">
          <Icon name="search" size={30} />
          <h3>No completed order yet</h3>
          <p>Complete checkout before viewing order details.</p>
          <button className="primary-button" onClick={() => navigate('cart')}>
            Back to Cart <Icon name="arrow" />
          </button>
        </div>
      </main>
    );
  }

  function submitRefund(event) {
    event.preventDefault();
    setRefundSubmitted(true);
  }

  return (
    <main className="order-detail-page page-shell">
      <div className="breadcrumbs">
        <button onClick={() => navigate('checkout')}>Checkout</button>
        <Icon name="arrow" size={13} />
        <span>Order Detail</span>
      </div>

      <section className="order-success-banner">
        <div>
          <span className="eyebrow">Payment successful</span>
          <h1>Payment Successful</h1>
          <p>Your payment has been completed. Your digital products are now available in your library.</p>
        </div>
        <span className="order-success-icon"><Icon name="check" size={32} /></span>
      </section>

      <section className="order-detail-layout">
        <article className="order-panel">
          <span className="eyebrow">Payment information</span>
          <h2>Order {order.id}</h2>
          <div className="payment-info-grid">
            <div><span>Order ID</span><strong>{order.id}</strong></div>
            <div><span>Payment ID</span><strong>{order.paymentId}</strong></div>
            <div><span>Payment Method</span><strong>{order.paymentMethod}</strong></div>
            <div><span>Payment Date</span><strong>{order.createdAt}</strong></div>
            <div><span>Total Paid</span><strong>${order.total.toFixed(2)}</strong></div>
            <div><span>Status</span><strong className="paid-status">Paid</strong></div>
          </div>
        </article>

        <article className="order-panel">
          <span className="eyebrow">Purchased products</span>
          <h2>Digital items</h2>
          <div className="purchased-list">
            {order.items.map((product) => (
              <div className="purchased-item" key={product.id}>
                <ProductArt product={product} />
                <div>
                  <strong>{product.title}</strong>
                  <span>{product.category} / {product.type} / Qty {product.quantity || 1}</span>
                  <button onClick={() => navigate('account')}>Open in My Library <Icon name="arrow" size={14} /></button>
                </div>
                <em>${(Number(product.price || 0) * Number(product.quantity || 1)).toFixed(2)}</em>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="refund-panel">
        <div className="refund-heading">
          <div>
            <span className="eyebrow">Refund request</span>
            <h2>Request a refund</h2>
            <p>Refund eligibility: available within 7 days if the product is unused.</p>
          </div>
          <span className="refund-status-pill">Eligible</span>
        </div>
        <form className="refund-form" onSubmit={submitRefund}>
          <label><span>Refund reason</span><textarea placeholder="Please describe your refund reason..." rows="5" /></label>
          <div className="refund-actions">
            <button className="primary-button" type="submit">Submit Refund Request <Icon name="arrow" /></button>
            <button type="button" onClick={() => navigate('home')}>Cancel</button>
          </div>
          {refundSubmitted && <div className="refund-message"><Icon name="check" size={16} />Your refund request has been submitted for admin review.</div>}
        </form>
      </section>
    </main>
  );
}

function Footer({ navigate }) {
  return (
    <footer>
      <div className="footer-main page-shell">
        <div className="footer-brand"><Logo onClick={() => navigate('home')} /><p>Thoughtful digital entertainment, curated for curious people.</p></div>
        <div><strong>Discover</strong><button onClick={() => navigate('listing', 'Games')}>Games</button><button onClick={() => navigate('listing', 'E-books')}>E-books</button><button onClick={() => navigate('listing', 'Movies & TV')}>Movies & TV</button></div>
        <div><strong>zehaoshangou</strong><button onClick={() => navigate('about')}>About us</button><button onClick={() => navigate('gift-cards')}>Gift cards</button><button onClick={() => navigate('careers')}>Careers</button></div>
        <div><strong>Help</strong><button onClick={() => navigate('support')}>Support</button><button onClick={() => navigate('refunds')}>Refunds</button><button onClick={() => navigate('contact')}>Contact</button></div>
      </div>
      <div className="footer-bottom page-shell">
        <span>Copyright 2026 zehaoshangou. Built for better downtime.</span>
        <span className="footer-policy-links"><button onClick={() => navigate('terms')}>Terms</button><button onClick={() => navigate('privacy')}>Privacy</button><button onClick={() => navigate('cookies')}>Cookies</button></span>
      </div>
    </footer>
  );
}

function DataSourceNotice({ status, error }) {
  if (status === 'live') return null;

  return (
    <div className={`data-source-note data-source-${status} page-shell`}>
      {status === 'loading' ? (
        <span>Connecting to StoreDB Product API...</span>
      ) : (
        <span>Using demo products because the StoreDB Product API is unavailable. Expected API: {API_ROOT}/Product</span>
      )}
      {error && <small>{error}</small>}
    </div>
  );
}

function App() {
  const [page, setPage] = useState(window.location.hash.replace('#', '') || 'home');
  const [category, setCategory] = useState('All products');
  const [subCategory, setSubCategory] = useState('All subcategories');
  const [products, setProducts] = useState(demoProducts);
  const [selectedProduct, setSelectedProduct] = useState(demoProducts[0]);
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [latestOrder, setLatestOrder] = useState(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [dataStatus, setDataStatus] = useState('loading');
  const [dataError, setDataError] = useState('');
  const navigationMenus = useMemo(() => buildNavigationMenus(products), [products]);
  const cartCount = cartItems.reduce((sum, product) => sum + Number(product.quantity || 1), 0);

  useEffect(() => {
    const onHashChange = () => setPage(window.location.hash.replace('#', '') || 'home');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    let ignore = false;

    fetchProducts()
      .then((apiProducts) => {
        if (ignore) return;
        setProducts(apiProducts);
        setSelectedProduct(apiProducts[0] || demoProducts[0]);
        setDataStatus('live');
        setDataError('');
      })
      .catch((error) => {
        if (ignore) return;
        setProducts(demoProducts);
        setSelectedProduct(demoProducts[0]);
        setDataStatus('fallback');
        setDataError(error.message);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const navigate = (nextPage, nextCategory, nextSubCategory) => {
    if (nextPage === 'listing') {
      setCategory(nextCategory || 'All products');
      setSubCategory(nextSubCategory || 'All subcategories');
    } else if (nextCategory) {
      setCategory(nextCategory);
      setSubCategory(nextSubCategory || 'All subcategories');
    }

    window.location.hash = nextPage;
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewProduct = (product) => {
    setSelectedProduct(product);
    navigate('detail');
  };

  const addToCart = (product) => {
    setCartItems((items) => {
      const existingItem = items.find((item) => String(item.id) === String(product.id));
      if (existingItem) {
        return items.map((item) => (
          String(item.id) === String(product.id)
            ? { ...item, quantity: Number(item.quantity || 1) + 1 }
            : item
        ));
      }

      return [...items, { ...product, quantity: 1 }];
    });
    setToast(`${product.title} added to cart`);
    window.setTimeout(() => setToast(''), 2200);
  };

  const changeCartQuantity = (productId, delta) => {
    setCartItems((items) => items.map((item) => (
      String(item.id) === String(productId)
        ? { ...item, quantity: Math.max(1, Number(item.quantity || 1) + delta) }
        : item
    )));
  };

  const removeFromCart = (productId) => {
    setCartItems((items) => items.filter((item) => String(item.id) !== String(productId)));
    setToast('Item removed from cart');
    window.setTimeout(() => setToast(''), 2200);
  };

  const buyNow = (product) => {
    addToCart(product);
    navigate('checkout');
  };

  const placeOrder = (order) => {
    setLatestOrder(order);
    setCartItems([]);
    setToast('Payment successful');
    window.setTimeout(() => setToast(''), 2200);
  };

  const placeholder = placeholderPages[page];

  return (
    <div className="app">
      <Header navigate={navigate} navigationMenus={navigationMenus} search={search} setSearch={setSearch} cartCount={cartCount} />
      <DataSourceNotice status={dataStatus} error={dataError} />
      {page === 'home' && <HomePage navigate={navigate} viewProduct={viewProduct} addToCart={addToCart} products={products} />}
      {page === 'listing' && <ListingPage category={category} subCategory={subCategory} search={search} viewProduct={viewProduct} addToCart={addToCart} navigate={navigate} products={products} />}
      {page === 'detail' && <ProductDetailPage product={selectedProduct} addToCart={addToCart} buyNow={buyNow} navigate={navigate} />}
      {page === 'account' && <AccountPage products={products} onAuth={setUser} checkoutPending={cartCount > 0} navigate={navigate} />}
      {page === 'cart' && (
        <CartPage
          products={products}
          cart={cartItems}
          user={user}
          navigate={navigate}
          viewProduct={viewProduct}
          removeFromCart={removeFromCart}
          changeCartQuantity={changeCartQuantity}
          addToCart={addToCart}
        />
      )}
      {page === 'checkout' && <CheckoutPage cart={cartItems} user={user} navigate={navigate} onPlaceOrder={placeOrder} />}
      {page === 'payment-methods' && <PaymentMethodsPage user={user} navigate={navigate} />}
      {page === 'order-detail' && <OrderDetailPage order={latestOrder} navigate={navigate} />}
      {placeholder && <PlaceholderPage title={placeholder.title} description={placeholder.description} actions={placeholder.actions} navigate={navigate} />}
      <Footer navigate={navigate} />
      <div className={`toast ${toast ? 'show' : ''}`}><Icon name="check" size={16} />{toast}</div>
    </div>
  );
}

export default App;
