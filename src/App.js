import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { products as demoProducts } from './data';
import { fetchProducts } from './api/products';
import Header from './components/Header';
import Footer from './components/Footer';
import DataSourceNotice from './components/DataSourceNotice';
import Icon from './components/Icon';
import PlaceholderPage from './pages/PlaceholderPage';
import HomePage from './pages/HomePage';
import ListingPage from './pages/ListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AccountPage from './pages/AccountPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentMethodsPage from './pages/PaymentMethodsPage';
import OrderDetailPage from './pages/OrderDetailPage';
import { placeholderPages } from './config/placeholderPages';
import { buildNavigationMenus } from './utils/navigation';

export default function App() {
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
            ? { ...item, ...product, quantity: Number(item.quantity || 1) + 1 }
            : item
        ));
      }

      return [...items, { ...product, quantity: 1 }];
    });
    setToast(`${product.title} added to cart`);
    window.setTimeout(() => setToast(''), 2200);
  };

  const updateCartQuantity = (productId, nextQuantity) => {
    setCartItems((items) => (
      items
        .map((item) => (
          String(item.id) === String(productId)
            ? { ...item, quantity: Math.max(0, Number(nextQuantity || 0)) }
            : item
        ))
        .filter((item) => item.quantity > 0)
    ));
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
    setLatestOrder({
      ...order,
      items: order.items.map((item) => ({ ...item })),
    });
    setCartItems([]);
    setToast('Payment successful');
    window.setTimeout(() => setToast(''), 2200);
  };

  const placeholder = placeholderPages[page];
  const cartCount = cartItems.reduce((sum, item) => sum + Number(item.quantity || 1), 0);

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
          updateCartQuantity={updateCartQuantity}
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
