import { useState } from 'react';
import Icon from '../components/Icon';
import ProductArt from '../components/ProductArt';
import Rating from '../components/Rating';
import SectionHeading from '../components/SectionHeading';

export default function ProductDetailPage({ product, addToCart, addToWishlist, isWishlisted, buyNow, navigate }) {
  const [gallery, setGallery] = useState(0);
  const galleryLabels = ['Key art', 'In-game', 'World map', 'Characters'];

  return (
    <main className="detail-page page-shell">
      <section className="product-intro">
        <div className="product-gallery">
          <div className={`gallery-main gallery-${gallery}`}><ProductArt product={product} /><span className="gallery-counter">0{gallery + 1} / 04</span></div>
          <div className="gallery-thumbs">
            {galleryLabels.map((label, index) => <button className={gallery === index ? 'active' : ''} onClick={() => setGallery(index)} key={label}><ProductArt product={{ ...product, art: ['nebula', 'neon', 'parallel', 'solaris'][index] }} /><span>{label}</span></button>)}
          </div>
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
            <button onClick={() => addToWishlist(product)}>{isWishlisted ? 'Saved in wishlist' : 'Add to wishlist'}</button>
          </div>
          <div className="detail-facts">
            <div><span>Delivery</span><strong>Instant download</strong></div>
            <div><span>License</span><strong>Personal use</strong></div>
            <div><span>Platform</span><strong>Windows / macOS</strong></div>
            <div><span>File size</span><strong>18.6 GB</strong></div>
          </div>
          <div className="secure-note"><span><strong>Secure checkout</strong> 7-day refund policy on unused downloads</span></div>
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
          {['A rich story shaped by your choices', 'A fully original atmospheric soundtrack', 'Optimized for keyboard and controller', 'Includes all launch-day bonus content'].map((feature, index) => <span key={feature}><strong>{String(index + 1).padStart(2, '0')}</strong>{feature}</span>)}
        </div>
      </section>

      <section className="reviews-section">
        <SectionHeading eyebrow="Player reviews" title="Loved across the galaxy" description="Verified reviews from ZeHaoShanGou customers." />
        <div className="review-grid">
          {[['Ari K.', 'Beautiful from start to finish. I kept stopping just to look around.'], ['Jordan M.', 'Smart writing, satisfying exploration, and an incredible soundtrack.']].map(([name, quote]) => (
            <article key={name}><Rating value={5} reviews={0} compact /><p>"{quote}"</p><div><span><strong>{name}</strong><small>Verified purchase</small></span></div></article>
          ))}
        </div>
      </section>
    </main>
  );
}
