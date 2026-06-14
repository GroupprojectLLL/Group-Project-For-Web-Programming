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
            <button className="icon-button cart-button" onClick={() => navigate('cart')} aria-label="Cart">
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

function CartPage({ cart, navigate, viewProduct, removeFromCart, addToCart }) {
  const subtotal = cart.reduce((sum, product) => sum + product.price, 0);
  const discount = 0;
  const total = subtotal - discount;
  const recommendedProducts = products
    .filter((product) => !cart.some((item) => item.id === product.id))
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
            title={`${cart.length} item${cart.length === 1 ? '' : 's'} selected`}
            description="All products are delivered digitally after payment."
          />

          {cart.length ? (
            <div className="cart-item-list">
              {cart.map((product, index) => (
                <article className="cart-item-card" key={`${product.id}-${index}`}>
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
                      <span>Platform: Windows / macOS</span>
                      <span>Delivery: Instant download</span>
                    </div>

                    <div className="cart-item-actions">
                      <button onClick={() => removeFromCart(index)}>Remove</button>
                      <button onClick={() => removeFromCart(index)}>Move to Wishlist</button>
                    </div>
                  </div>

                  <div className="cart-item-price">
                    <strong>${product.price.toFixed(2)}</strong>
                    <del>${product.oldPrice.toFixed(2)}</del>
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

          <label className="promo-box">
            <span>Promo code</span>
            <div>
              <input placeholder="Enter code" />
              <button>Apply</button>
            </div>
          </label>

          <button
            className="primary-button cart-checkout-button"
            onClick={() => navigate('checkout')}
            disabled={!cart.length}
          >
            Proceed to Checkout <Icon name="arrow" />
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

function CheckoutPage({ cart, navigate }) {
  const checkoutItems = cart.length ? cart : products.slice(0, 2);
  const subtotal = checkoutItems.reduce((sum, product) => sum + product.price, 0);
  const tax = 0;
  const discount = 0;
  const total = subtotal + tax - discount;

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

      <section className="checkout-layout">
        <div className="checkout-main">
          <section className="checkout-panel">
            <span className="eyebrow">Account</span>
            <h2>Account information</h2>

            <label className="checkout-field">
              <span>Email / Account</span>
              <input type="email" defaultValue="morgan.lee@example.com" />
            </label>

            <div className="checkout-status">
              <Icon name="check" size={16} />
              <span>Login status: Logged in</span>
            </div>
          </section>

          <section className="checkout-panel">
            <span className="eyebrow">Payment method</span>
            <h2>Choose payment method</h2>

            <div className="payment-options">
              <label>
                <input type="radio" name="payment" defaultChecked />
                <span>
                  <strong>Visa **** 1234</strong>
                  <small>Expires 12/28</small>
                </span>
              </label>

              <label>
                <input type="radio" name="payment" />
                <span>
                  <strong>PayPal account</strong>
                  <small>user@email.com</small>
                </span>
              </label>

              <label>
                <input type="radio" name="payment" />
                <span>
                  <strong>Add new card</strong>
                  <small>Use a new credit card for this order</small>
                </span>
              </label>
            </div>

            <button className="secondary-link-button" onClick={() => navigate('payment-methods')}>
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
            {checkoutItems.map((product, index) => (
              <div className="checkout-product" key={`${product.id}-${index}`}>
                <ProductArt product={product} />
                <div>
                  <strong>{product.title}</strong>
                  <span>{product.category} / {product.type}</span>
                </div>
                <em>${product.price.toFixed(2)}</em>
              </div>
            ))}
          </div>

          <div className="summary-lines">
            <div>
              <span>Subtotal</span>
              <strong>${subtotal.toFixed(2)}</strong>
            </div>
            <div>
              <span>Tax</span>
              <strong>${tax.toFixed(2)}</strong>
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

          <button className="primary-button checkout-confirm-button" onClick={() => navigate('order-detail')}>
            Confirm Payment <Icon name="arrow" />
          </button>

          <small>Secure checkout. Digital delivery only.</small>
        </aside>
      </section>
    </main>
  );
}

function PaymentMethodsPage({ navigate }) {
  const savedMethods = [
    {
      type: 'Visa',
      detail: '**** 1234',
      holder: 'Morgan Lee',
      expiry: '12/28',
      status: 'Default',
    },
    {
      type: 'PayPal',
      detail: 'user@email.com',
      holder: 'Morgan Lee',
      expiry: 'Active',
      status: 'Backup',
    },
  ];

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

      <section className="account-settings-layout">
        <aside className="account-sidebar-card">
          <div className="sidebar-user">
            <span className="avatar-mini">M</span>
            <div>
              <strong>Morgan Lee</strong>
              <small>morgan.lee@example.com</small>
            </div>
          </div>

          <nav className="account-side-nav">
            <button onClick={() => navigate('account')}>Profile</button>
            <button className="active">Payment Methods</button>
            <button>Wishlist</button>
            <button>Order History</button>
            <button>My Library</button>
            <button>Settings</button>
            <button onClick={() => navigate('home')}>Logout</button>
          </nav>
        </aside>

        <div className="payment-methods-content">
          <section className="payment-panel">
            <div className="payment-panel-heading">
              <div>
                <span className="eyebrow">Saved payment methods</span>
                <h2>Your saved methods</h2>
              </div>
              <span className="secure-pill">
                <Icon name="lock" size={14} />
                Secure
              </span>
            </div>

            <div className="saved-method-list">
              {savedMethods.map((method) => (
                <article className="saved-method-card" key={`${method.type}-${method.detail}`}>
                  <div className="method-icon">
                    {method.type === 'Visa' ? 'V' : 'P'}
                  </div>

                  <div className="method-info">
                    <strong>{method.type} {method.detail}</strong>
                    <span>Cardholder: {method.holder}</span>
                    <span>{method.type === 'Visa' ? `Expiry: ${method.expiry}` : `Status: ${method.expiry}`}</span>
                  </div>

                  <div className="method-actions">
                    <span>{method.status}</span>
                    <button>Edit</button>
                    <button>Remove</button>
                    {method.status !== 'Default' && <button>Set Default</button>}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="payment-panel">
            <span className="eyebrow">Add new payment method</span>
            <h2>Add payment method</h2>

            <form className="payment-form" onSubmit={(event) => event.preventDefault()}>
              <label className="payment-form-field">
                <span>Payment type</span>
                <select defaultValue="Credit Card">
                  <option>Credit Card</option>
                  <option>PayPal</option>
                </select>
              </label>

              <div className="two-fields">
                <label className="payment-form-field">
                  <span>Card number</span>
                  <input placeholder="1234 5678 9012 3456" />
                </label>

                <label className="payment-form-field">
                  <span>Cardholder name</span>
                  <input placeholder="Morgan Lee" />
                </label>
              </div>

              <div className="two-fields">
                <label className="payment-form-field">
                  <span>Expiry date</span>
                  <input placeholder="MM / YY" />
                </label>

                <label className="payment-form-field">
                  <span>CVV</span>
                  <input placeholder="123" />
                </label>
              </div>

              <label className="payment-form-field">
                <span>Billing email</span>
                <input type="email" placeholder="you@example.com" />
              </label>

              <label className="save-default-row">
                <input type="checkbox" />
                <span>Set as default payment method</span>
              </label>

              <button className="primary-button payment-save-button">
                Save Payment Method <Icon name="arrow" />
              </button>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}

function OrderDetailPage({ cart, navigate }) {
  const [refundSubmitted, setRefundSubmitted] = useState(false);
  const purchasedItems = cart.length ? cart : products.slice(0, 2);
  const subtotal = purchasedItems.reduce((sum, product) => sum + product.price, 0);
  const tax = 0;
  const discount = 0;
  const total = subtotal + tax - discount;

  const submitRefund = (event) => {
    event.preventDefault();
    setRefundSubmitted(true);
  };

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
        <span className="order-success-icon">
          <Icon name="check" size={32} />
        </span>
      </section>

      <section className="order-detail-layout">
        <article className="order-panel">
          <span className="eyebrow">Payment information</span>
          <h2>Order ORD-1001</h2>

          <div className="payment-info-grid">
            <div>
              <span>Order ID</span>
              <strong>ORD-1001</strong>
            </div>
            <div>
              <span>Payment ID</span>
              <strong>PAY-888891</strong>
            </div>
            <div>
              <span>Payment Method</span>
              <strong>Visa **** 1234</strong>
            </div>
            <div>
              <span>Payment Date</span>
              <strong>2026-05-26 14:30</strong>
            </div>
            <div>
              <span>Total Paid</span>
              <strong>${total.toFixed(2)}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong className="paid-status">Paid</strong>
            </div>
          </div>
        </article>

        <article className="order-panel">
          <span className="eyebrow">Purchased products</span>
          <h2>Digital items</h2>

          <div className="purchased-list">
            {purchasedItems.map((product, index) => (
              <div className="purchased-item" key={`${product.id}-${index}`}>
                <ProductArt product={product} />
                <div>
                  <strong>{product.title}</strong>
                  <span>{product.category} / {product.type}</span>
                  <button onClick={() => navigate('account')}>
                    Open in My Library <Icon name="arrow" size={14} />
                  </button>
                </div>
                <em>${product.price.toFixed(2)}</em>
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
          <label>
            <span>Refund reason</span>
            <textarea placeholder="Please describe your refund reason..." rows="5" />
          </label>

          <div className="refund-actions">
            <button className="primary-button" type="submit">
              Submit Refund Request <Icon name="arrow" />
            </button>
            <button type="button" onClick={() => navigate('home')}>
              Cancel
            </button>
          </div>

          {refundSubmitted && (
            <div className="refund-message">
              <Icon name="check" size={16} />
              Your refund request has been submitted for admin review.
            </div>
          )}
        </form>
      </section>

      <section className="order-action-bar">
        <div>
          <span className="eyebrow">Buttons / Links</span>
          <h2>What would you like to do next?</h2>
        </div>

        <div className="order-action-buttons">
          <button>Download Receipt</button>
          <button onClick={() => navigate('account')}>Go to My Library</button>
          <button onClick={() => navigate('account')}>Back to Order History</button>
        </div>
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

  const removeFromCart = (removeIndex) => {
    setCart((current) => current.filter((_, index) => index !== removeIndex));
    setToast('Item removed from cart');
    window.setTimeout(() => setToast(''), 2200);
  };

  return (
    <div className="app">
      <Header navigate={navigate} cartCount={cart.length} search={search} setSearch={setSearch} />
      {page === 'home' && <HomePage navigate={navigate} viewProduct={viewProduct} addToCart={addToCart} />}
      {page === 'listing' && <ListingPage category={category} setCategory={setCategory} search={search} viewProduct={viewProduct} addToCart={addToCart} />}
      {page === 'detail' && <ProductDetailPage product={selectedProduct} addToCart={addToCart} navigate={navigate} />}
      {page === 'account' && <AccountPage />}

      {page === 'cart' && (
        <CartPage
          cart={cart}
          navigate={navigate}
          viewProduct={viewProduct}
          removeFromCart={removeFromCart}
          addToCart={addToCart}
        />
      )}
      {page === 'checkout' && (
        <CheckoutPage
          cart={cart}
          navigate={navigate}
        />
      )}
      {page === 'payment-methods' && <PaymentMethodsPage navigate={navigate} />}
      {page === 'order-detail' && (
        <OrderDetailPage
          cart={cart}
          navigate={navigate}
        />
      )}
      <Footer navigate={navigate} />
      <div className={`toast ${toast ? 'show' : ''}`}><Icon name="check" size={16} />{toast}</div>
    </div>
  );
}

export default App;
