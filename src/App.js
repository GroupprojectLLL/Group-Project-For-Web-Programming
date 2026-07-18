import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { products as demoProducts } from './data';
import { fetchProducts } from './api/products';
import { fetchCurrentUser } from './api/auth';
import { saveWishlistItem } from './api/wishlist';
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
import WishlistPage from './pages/WishlistPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import MyLibraryPage from './pages/MyLibraryPage';
import SettingsPage, { DEFAULT_SETTINGS } from './pages/SettingsPage';
import EmployeeDashboardPage from './pages/EmployeeDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProductManagementPage from './pages/AdminProductManagementPage';
import AdminUserManagementPage from './pages/AdminUserManagementPage';
import { placeholderPages } from './config/placeholderPages';
import { buildNavigationMenus } from './utils/navigation';

const SETTINGS_STORAGE_KEY = 'zhsg-settings';
const PROTECTED_ACCOUNT_PAGES = new Set([
  'checkout',
  'payment-methods',
  'wishlist',
  'order-history',
  'my-library',
  'order-detail',
  'settings',
]);
const CUSTOMER_ONLY_PAGES = new Set([
  'cart',
  'checkout',
  'payment-methods',
  'wishlist',
  'order-history',
  'my-library',
  'order-detail',
]);

function readSettings() {
  try {
    const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export default function App() {
  const [page, setPage] = useState(window.location.hash.replace('#', '') || 'home');
  const [category, setCategory] = useState('All products');
  const [subCategory, setSubCategory] = useState('All subcategories');
  const [products, setProducts] = useState(demoProducts);
  const [selectedProduct, setSelectedProduct] = useState(demoProducts[0]);
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [pendingAccountPage, setPendingAccountPage] = useState(null);
  const [latestOrder, setLatestOrder] = useState(null);
  const [settings, setSettings] = useState(readSettings);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [toastTone, setToastTone] = useState('success');
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

  useEffect(() => {
    let ignore = false;
    fetchCurrentUser()
      .then((account) => {
        if (!ignore) setUser(account);
      })
      .catch(() => {
        if (!ignore) setUser(null);
      })
      .finally(() => {
        if (!ignore) setSessionLoaded(true);
      });
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', settings.reduceMotion);
    return () => document.documentElement.classList.remove('reduce-motion');
  }, [settings.reduceMotion]);

  useEffect(() => {
    if (!sessionLoaded) return;

    if (!user && page !== 'account' && PROTECTED_ACCOUNT_PAGES.has(page)) {
      setPendingAccountPage(page);
      setToastTone('error');
      setToast('Please sign in first.');
      window.setTimeout(() => setToast(''), 2600);
      window.location.hash = 'account';
      setPage('account');
      return;
    }

    if (user && user.role !== 'Customer' && CUSTOMER_ONLY_PAGES.has(page)) {
      const destination = user.role === 'Employee' ? 'employee-dashboard' : 'admin-dashboard';
      setToastTone('error');
      setToast('This page is available to customer accounts.');
      window.setTimeout(() => setToast(''), 2600);
      window.location.hash = destination;
      setPage(destination);
    }
  }, [page, sessionLoaded, user]);

  const showToast = (message, tone = 'success') => {
    setToastTone(tone);
    setToast(message);
    window.setTimeout(() => setToast(''), tone === 'error' ? 2600 : 2200);
  };

  const navigate = (nextPage, nextCategory, nextSubCategory) => {
    let destinationPage = nextPage;

    if (!user && PROTECTED_ACCOUNT_PAGES.has(nextPage)) {
      setPendingAccountPage(nextPage);
      showToast('Please sign in first.', 'error');
      destinationPage = 'account';
    } else if (user && user.role !== 'Customer' && CUSTOMER_ONLY_PAGES.has(nextPage)) {
      showToast('This page is available to customer accounts.', 'error');
      destinationPage = user.role === 'Employee' ? 'employee-dashboard' : 'admin-dashboard';
    } else if (nextPage !== 'account') {
      setPendingAccountPage(null);
    }

    if (nextPage === 'listing') {
      setCategory(nextCategory || 'All products');
      setSubCategory(nextSubCategory || 'All subcategories');
    } else if (nextCategory) {
      setCategory(nextCategory);
      setSubCategory(nextSubCategory || 'All subcategories');
    }

    window.location.hash = destinationPage;
    setPage(destinationPage);
    window.scrollTo({ top: 0, behavior: settings.reduceMotion ? 'auto' : 'smooth' });
  };

  const handleAuth = (nextUser) => {
    setUser(nextUser);

    if (!nextUser) {
      setPendingAccountPage(null);
      return;
    }

    if (pendingAccountPage) {
      const customerDestination = nextUser.role === 'Customer'
        ? pendingAccountPage
        : nextUser.role === 'Employee' ? 'employee-dashboard' : 'admin-dashboard';
      setPendingAccountPage(null);
      window.location.hash = customerDestination;
      setPage(customerDestination);
    }
  };

  const viewProduct = (product) => {
    setSelectedProduct(product);
    navigate('detail');
  };

  const addToCart = (product) => {
    if (user && user.role !== 'Customer') {
      showToast('Employee and Admin accounts have read-only store access.', 'error');
      return;
    }

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
    showToast(`${product.title} added to cart`);
  };

  const addToWishlist = async (product) => {
    if (!user) {
      setToast('Sign in to save wishlist items');
      window.setTimeout(() => setToast(''), 2200);
      navigate('account');
      return;
    }

    if (user.role !== 'Customer') {
      showToast('Wishlist is available to customer accounts.', 'error');
      return;
    }

    try {
      const result = await saveWishlistItem(user.id, product.id);
      showToast(result.created ? `${product.title} added to wishlist` : `${product.title} is already in your wishlist`);
    } catch (error) {
      showToast(`Wishlist could not be updated: ${error.message}`, 'error');
    }
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
    showToast('Item removed from cart');
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
    showToast('Payment successful');
  };

  const openStoredOrder = (order) => {
    const items = order.items.map((item) => ({
      ...products.find((product) => String(product.id) === String(item.productId || item.id)),
      ...item,
      id: item.productId || item.id,
    }));
    setLatestOrder({ ...order, items });
    navigate('order-detail');
  };

  const saveSettings = (nextSettings, message = 'Settings saved') => {
    const savedSettings = { ...DEFAULT_SETTINGS, ...nextSettings };
    setSettings(savedSettings);
    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(savedSettings));
    } catch {
      // Settings remain active for this session when local storage is unavailable.
    }
    showToast(message);
  };

  const placeholder = placeholderPages[page];
  const cartCount = cartItems.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
  const canShop = !user || user.role === 'Customer';

  return (
    <div className="app">
      <Header navigate={navigate} navigationMenus={navigationMenus} search={search} setSearch={setSearch} cartCount={cartCount} user={user} />
      <DataSourceNotice status={dataStatus} error={dataError} />
      {page === 'home' && <HomePage navigate={navigate} viewProduct={viewProduct} addToCart={addToCart} products={products} canShop={canShop} />}
      {page === 'listing' && <ListingPage category={category} subCategory={subCategory} search={search} viewProduct={viewProduct} addToCart={addToCart} navigate={navigate} products={products} canShop={canShop} />}
      {page === 'detail' && <ProductDetailPage product={selectedProduct} addToCart={addToCart} addToWishlist={addToWishlist} buyNow={buyNow} canShop={canShop} />}
      {page === 'account' && <AccountPage user={user} onAuth={handleAuth} checkoutPending={cartCount > 0} navigate={navigate} />}
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
      {page === 'payment-methods' && <PaymentMethodsPage user={user} navigate={navigate} onUserUpdate={setUser} />}
      {page === 'order-detail' && <OrderDetailPage order={latestOrder} navigate={navigate} />}
      {page === 'wishlist' && <WishlistPage user={user} products={products} addToCart={addToCart} viewProduct={viewProduct} navigate={navigate} />}
      {page === 'order-history' && <OrderHistoryPage user={user} products={products} navigate={navigate} onOpenOrder={openStoredOrder} />}
      {page === 'my-library' && <MyLibraryPage user={user} products={products} navigate={navigate} viewProduct={viewProduct} defaultSort={settings.librarySort} />}
      {page === 'settings' && user && <SettingsPage settings={settings} onSave={saveSettings} />}
      {page === 'employee-dashboard' && <EmployeeDashboardPage user={user} navigate={navigate} />}
      {page === 'admin-dashboard' && <AdminDashboardPage user={user} navigate={navigate} />}
      {page === 'admin-product-management' && <AdminProductManagementPage user={user} navigate={navigate} />}
      {page === 'admin-user-management' && <AdminUserManagementPage user={user} navigate={navigate} />}
      {placeholder && <PlaceholderPage title={placeholder.title} description={placeholder.description} actions={placeholder.actions} navigate={navigate} />}
      <Footer navigate={navigate} />
      <div className={`toast toast-${toastTone} ${toast ? 'show' : ''}`} role={toastTone === 'error' && toast ? 'alert' : undefined}>
        <Icon name={toastTone === 'error' ? 'lock' : 'check'} size={16} />{toast}
      </div>
    </div>
  );
}
