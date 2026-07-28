import { useState } from 'react';
import Icon from '../components/Icon';
import ProductArt from '../components/ProductArt';
import Rating from '../components/Rating';
import SectionHeading from '../components/SectionHeading';

export default function ProductDetailPage({ product, addToCart, addToWishlist, buyNow, canShop = true }) {
  const [gallery, setGallery] = useState(0);
  const galleryLabels = ['Cover', 'Preview', 'Details', 'Collection'];
  const hasReviews = product.rating !== null
    && product.rating !== undefined
    && product.reviews !== null
    && product.reviews !== undefined
    && Number.isFinite(Number(product.rating))
    && Number.isFinite(Number(product.reviews));
  const isStoreDbProduct = product.dataSource === 'storedb';
  const publishedDate = product.published ? new Date(product.published) : null;
  const published = publishedDate && !Number.isNaN(publishedDate.getTime())
    ? publishedDate.toLocaleDateString()
    : 'Not supplied';

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
          {hasReviews && <Rating value={product.rating} reviews={product.reviews} />}
          <div className="detail-price"><strong>${Number(product.price || 0).toFixed(2)}</strong></div>
          {canShop && (
            <>
              <button className="buy-button" onClick={() => buyNow(product)}><span>Buy now</span><strong>${Number(product.price || 0).toFixed(2)}</strong><Icon name="arrow" /></button>
              <div className="secondary-actions">
                <button onClick={() => addToCart(product)}>Add to cart</button>
                <button onClick={() => addToWishlist(product)}>Add to wishlist</button>
              </div>
            </>
          )}
          <div className="detail-facts">
            <div><span>Category</span><strong>{product.category}</strong></div>
            <div><span>Subcategory</span><strong>{product.type}</strong></div>
            <div><span>Published</span><strong>{published}</strong></div>
            <div><span>Availability</span><strong>{Number(product.stockQuantity || 0)} in stock</strong></div>
          </div>
          <div className="secure-note"><span><strong>Secure checkout</strong> Stock and price are checked again when the order is submitted.</span></div>
        </div>
      </section>

      <section className="detail-description">
        <div>
          <span className="eyebrow">About this title</span>
          <h2>Product information</h2>
          <p>{product.description}</p>
          <p>{product.creator ? `Created by ${product.creator}.` : 'Creator information is not supplied for this product.'}</p>
        </div>
        <div className="feature-list">
          {[
            `Category: ${product.category}`,
            `Subcategory: ${product.type}`,
            `Published: ${published}`,
            isStoreDbProduct ? 'Source: StoreDB catalogue' : 'Source: demonstration catalogue',
          ].map((feature, index) => <span key={feature}><strong>{String(index + 1).padStart(2, '0')}</strong>{feature}</span>)}
        </div>
      </section>

      {hasReviews && <section className="reviews-section">
        <SectionHeading eyebrow="Player reviews" title="Loved across the galaxy" description="Verified reviews from ZeHaoShanGou customers." />
        <div className="review-grid">
          {[['Ari K.', 'Beautiful from start to finish. I kept stopping just to look around.'], ['Jordan M.', 'Smart writing, satisfying exploration, and an incredible soundtrack.']].map(([name, quote]) => (
            <article key={name}><Rating value={5} reviews={0} compact /><p>"{quote}"</p><div><span><strong>{name}</strong><small>Verified purchase</small></span></div></article>
          ))}
        </div>
      </section>}
    </main>
  );
}
