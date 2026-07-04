import Icon from './Icon';
import ProductArt from './ProductArt';
import Rating from './Rating';

export default function ProductCard({ product, onView, onAdd, layout = 'grid' }) {
  const saving = Math.round((1 - product.price / product.oldPrice) * 100);
  return (
    <article className={`product-card product-card-${layout}`}>
      <button className="cover-button" onClick={() => onView(product)}>
        <ProductArt product={product} />
        <span className="discount-pill">-{saving}%</span>
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
