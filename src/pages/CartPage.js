import Icon from '../components/Icon';
import ProductArt from '../components/ProductArt';
import ProductCard from '../components/ProductCard';
import SectionHeading from '../components/SectionHeading';
import { getCartItemQuantity, getCartLineTotal, getOrderTotals } from '../utils/orderTotals';

export default function CartPage({ products, cart, user, navigate, viewProduct, removeFromCart, updateCartQuantity, addToCart }) {
  const { subtotal, discount, total } = getOrderTotals(cart);
  const cartQuantity = cart.reduce((sum, item) => sum + getCartItemQuantity(item), 0);
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
            title={`${cartQuantity} item${cartQuantity === 1 ? '' : 's'} selected`}
            description="All products are delivered digitally after payment."
          />

          {cart.length ? (
            <div className="cart-item-list">
              {cart.map((product) => {
                const quantity = getCartItemQuantity(product);
                const lineTotal = getCartLineTotal(product);

                return (
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
                      <button onClick={() => removeFromCart(product.id)}>Remove</button>
                    </div>
                  </div>

                  <div className="cart-item-price">
                    <span>Unit ${Number(product.price || 0).toFixed(2)}</span>
                    <div className="cart-quantity-control">
                      <button
                        type="button"
                        aria-label={`Remove one ${product.title}`}
                        onClick={() => updateCartQuantity(product.id, quantity - 1)}
                      >
                        -
                      </button>
                      <span aria-label={`Quantity for ${product.title}`}>{quantity}</span>
                      <button
                        type="button"
                        aria-label={`Add one more ${product.title}`}
                        onClick={() => addToCart(product)}
                      >
                        +
                      </button>
                    </div>
                    <small>Line total</small>
                    <strong>${lineTotal.toFixed(2)}</strong>
                    {Number(product.oldPrice || 0) > Number(product.price || 0) && <del>${Number(product.oldPrice || 0).toFixed(2)}</del>}
                  </div>
                </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <Icon name="bag" size={30} />
              <h3>Your cart is empty</h3>
              <p>Add games, books, or movies before checkout.</p>
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
