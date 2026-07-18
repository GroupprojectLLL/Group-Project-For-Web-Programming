import Icon from './Icon';
import ProductArt from './ProductArt';
import Rating from './Rating';

export default function ProductCard({ product, onView, onAdd, layout = 'grid', canPurchase = true }) {
  const hasPromotion = Number(product.oldPrice) > Number(product.price);
  const hasRating = product.rating !== null
    && product.rating !== undefined
    && product.reviews !== null
    && product.reviews !== undefined
    && Number.isFinite(Number(product.rating))
    && Number.isFinite(Number(product.reviews));
  const saving = hasPromotion ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  return (
    <article className={`product-card product-card-${layout}`}>
      <button className="cover-button" onClick={() => onView(product)}>
        <ProductArt product={product} />
        {hasPromotion && <span className="discount-pill">-{saving}%</span>}
      </button>
      <div className="product-card-body">
        <div className="product-meta"><span>{product.category}</span><span>{product.type}</span></div>
        <button className="product-title" onClick={() => onView(product)}>{product.title}</button>
        {layout === 'row' && <p className="product-card-description">{product.description}</p>}
        {hasRating && <Rating value={product.rating} reviews={product.reviews} />}
        <div className="product-card-footer">
          <div className="price"><strong>${Number(product.price || 0).toFixed(2)}</strong></div>
          <div className="card-actions">
            {layout === 'row' && <button className="view-button" onClick={() => onView(product)}>View details</button>}
            {canPurchase && (
              <button className="add-button" onClick={() => onAdd(product)} aria-label={`Add ${product.title} to cart`}>
                <Icon name="bag" size={17} /><span>Add to cart</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
