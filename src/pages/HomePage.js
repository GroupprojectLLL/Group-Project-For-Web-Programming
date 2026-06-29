import { categories, products as demoProducts } from '../data';
import { heroArt } from '../config/assets';
import Icon from '../components/Icon';
import ProductCard from '../components/ProductCard';
import SectionHeading from '../components/SectionHeading';

export default function HomePage({ navigate, viewProduct, addToCart, products }) {
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
          <img className="hero-art-image" src={heroArt} alt="" />
          <span className="hero-ship">PV-7</span>
          <span className="hero-price"><small>Launch price</small><strong>$19.99</strong></span>
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
