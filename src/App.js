import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { products as demoProducts } from './data';
import { fetchProducts } from './api/products';
import {
  deleteWishlistProduct,
  fetchAccountWorkspace,
  saveAccountOrder,
  saveDownloadedProduct,
  saveRefundRequest,
  saveWishlistProduct,
} from './api/accountWorkspace';
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
import { placeholderPages } from './config/placeholderPages';
import { buildNavigationMenus } from './utils/navigation';
import { getCartItemQuantity, getOrderTotals } from './utils/orderTotals';

const WISHLIST_STORAGE_KEY = 'zhsg-wishlist-product-ids';
const ORDER_HISTORY_STORAGE_KEY = 'zhsg-order-history';
const DOWNLOADED_STORAGE_KEY = 'zhsg-downloaded-product-ids';
const SETTINGS_STORAGE_KEY = 'zhsg-settings';
const DEFAULT_WISHLIST_PRODUCT_IDS = [2, 3, 4, 8, 9, 11];
const PROTECTED_ACCOUNT_PAGES = new Set([
  'payment-methods',
  'wishlist',
  'order-history',
  'my-library',
  'settings',
]);

function readStoredValue(key, fallback) {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function writeStoredValue(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Local storage is a convenience for this frontend prototype.
  }
}

function productIdOf(value) {
  return String(value?.productId ?? value?.id ?? value);
}

function buildOrder(id, date, status, items, paymentMethod = 'Visa **** 1234') {
  const orderItems = items.map((item) => ({
    ...item.product,
    productId: item.product.id,
    quantity: item.quantity,
  }));
  const totals = getOrderTotals(orderItems);

  return {
    id,
    paymentId: `PAY-${id.replace('ORD-', '')}`,
    paymentMethod,
    createdAt: date,
    status,
    items: orderItems,
    ...totals,
  };
}

function buildDemoOrderHistory(products) {
  return [
    buildOrder('ORD-1001', '2026-05-20', 'Completed', [
      { product: products[0], quantity: 1 },
      { product: products[1], quantity: 1 },
    ]),
    buildOrder('ORD-1002', '2026-05-18', 'Refund Requested', [
      { product: products[10], quantity: 1 },
    ], 'PayPal account'),
    buildOrder('ORD-1003', '2026-05-12', 'Refunded', [
      { product: products[2], quantity: 1 },
    ]),
  ].filter((order) => order.items.every(Boolean));
}

export default function App() {
  const [page, setPage] = useState(window.location.hash.replace('#', '') || 'home');
  const [category, setCategory] = useState('All products');
  const [subCategory, setSubCategory] = useState('All subcategories');
  const [products, setProducts] = useState(demoProducts);
  const [selectedProduct, setSelectedProduct] = useState(demoProducts[0]);
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [pendingAccountPage, setPendingAccountPage] = useState(null);
  const [latestOrder, setLatestOrder] = useState(null);
  const [wishlistProductIds, setWishlistProductIds] = useState(() => (
    readStoredValue(WISHLIST_STORAGE_KEY, DEFAULT_WISHLIST_PRODUCT_IDS).map(productIdOf)
  ));
  const [orderHistory, setOrderHistory] = useState(() => (
    readStoredValue(ORDER_HISTORY_STORAGE_KEY, buildDemoOrderHistory(demoProducts))
  ));
  const [downloadedProductIds, setDownloadedProductIds] = useState(() => (
    readStoredValue(DOWNLOADED_STORAGE_KEY, []).map(productIdOf)
  ));
  const [settings, setSettings] = useState(() => ({
    ...DEFAULT_SETTINGS,
    ...readStoredValue(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS),
  }));
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [toastTone, setToastTone] = useState('success');
  const [dataStatus, setDataStatus] = useState('loading');
  const [dataError, setDataError] = useState('');
  const customerId = user?.customerId || user?.id || 'guest';
  const navigationMenus = useMemo(() => buildNavigationMenus(products), [products]);
  const productsById = useMemo(() => new Map(products.map((product) => [productIdOf(product), product])), [products]);
  const wishlistProducts = useMemo(() => (
    wishlistProductIds.map((productId) => productsById.get(productId)).filter(Boolean)
  ), [productsById, wishlistProductIds]);
  const orderHistoryWithProducts = useMemo(() => (
    orderHistory.map((order) => {
      const items = (order.items || []).map((item) => {
        const productId = productIdOf(item);
        const product = productsById.get(productId);
        return {
          ...(product || item),
          productId,
          quantity: getCartItemQuantity(item),
        };
      });
      const totals = getOrderTotals(items);

      return {
        ...order,
        status: order.status || 'Completed',
        items,
        subtotal: Number.isFinite(Number(order.subtotal)) ? Number(order.subtotal) : totals.subtotal,
        discount: Number.isFinite(Number(order.discount)) ? Number(order.discount) : totals.discount,
        tax: Number.isFinite(Number(order.tax)) ? Number(order.tax) : totals.tax,
        total: Number.isFinite(Number(order.total)) ? Number(order.total) : totals.total,
      };
    })
  ), [orderHistory, productsById]);
  const ownedProducts = useMemo(() => {
    const ownedByProductId = new Map();

    orderHistoryWithProducts
      .filter((order) => order.status !== 'Refunded')
      .forEach((order) => {
        order.items.forEach((item) => {
          const productId = productIdOf(item);
          const current = ownedByProductId.get(productId);

          if (!current || new Date(order.createdAt) > new Date(current.purchasedAt)) {
            ownedByProductId.set(productId, {
              ...item,
              productId,
              orderId: order.id,
              purchasedAt: order.createdAt,
              license: order.status === 'Refund Requested' ? 'Refund review' : 'Owned',
              downloaded: downloadedProductIds.includes(productId),
            });
          }
        });
      });

    return [...ownedByProductId.values()];
  }, [downloadedProductIds, orderHistoryWithProducts]);

  useEffect(() => {
    writeStoredValue(WISHLIST_STORAGE_KEY, wishlistProductIds);
  }, [wishlistProductIds]);

  useEffect(() => {
    writeStoredValue(ORDER_HISTORY_STORAGE_KEY, orderHistory);
  }, [orderHistory]);

  useEffect(() => {
    writeStoredValue(DOWNLOADED_STORAGE_KEY, downloadedProductIds);
  }, [downloadedProductIds]);

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', settings.reduceMotion);

    return () => document.documentElement.classList.remove('reduce-motion');
  }, [settings.reduceMotion]);

  useEffect(() => {
    let ignore = false;

    fetchAccountWorkspace(customerId)
      .then((workspace) => {
        if (ignore) return;

        if (Array.isArray(workspace.wishlistProductIds)) {
          setWishlistProductIds(workspace.wishlistProductIds.map(productIdOf));
        }

        if (Array.isArray(workspace.orders)) {
          setOrderHistory(workspace.orders);
        }

        if (Array.isArray(workspace.downloadedProductIds)) {
          setDownloadedProductIds(workspace.downloadedProductIds.map(productIdOf));
        }
      })
      .catch(() => {
        // Keep the local fallback when the account workspace API is offline.
      });

    return () => {
      ignore = true;
    };
  }, [customerId]);

  useEffect(() => {
    const onHashChange = () => setPage(window.location.hash.replace('#', '') || 'home');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    if (!user && page !== 'account' && PROTECTED_ACCOUNT_PAGES.has(page)) {
      setPendingAccountPage(page);
      setToastTone('error');
      setToast('Please sign in first.');
      window.setTimeout(() => setToast(''), 2600);
      window.location.hash = 'account';
      setPage('account');
    }
  }, [page, user]);

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
      const destinationPage = pendingAccountPage;
      setPendingAccountPage(null);
      window.location.hash = destinationPage;
      setPage(destinationPage);
      window.scrollTo({ top: 0, behavior: settings.reduceMotion ? 'auto' : 'smooth' });
    }
  };

  const viewProduct = (product) => {
    setSelectedProduct(product);
    navigate('detail');
  };

  const syncAccountRequest = (request) => {
    request.catch(() => {
      // The UI keeps working from local state if the API is offline.
    });
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
    showToast(`${product.title} added to cart`);
  };

  const addToWishlist = (product) => {
    const productId = productIdOf(product);

    setWishlistProductIds((productIds) => (
      productIds.includes(productId) ? productIds : [productId, ...productIds]
    ));
    syncAccountRequest(saveWishlistProduct(customerId, productId));
    showToast(`${product.title} saved to wishlist`);
  };

  const addWishlistProductById = (productId) => {
    const product = productsById.get(productIdOf(productId));

    if (!product) {
      showToast(`Product ID ${productId} was not found`);
      return false;
    }

    addToWishlist(product);
    return true;
  };

  const removeFromWishlist = (productId) => {
    const product = productsById.get(productIdOf(productId));
    setWishlistProductIds((productIds) => productIds.filter((itemId) => itemId !== productIdOf(productId)));
    syncAccountRequest(deleteWishlistProduct(customerId, productIdOf(productId)));
    showToast(`${product?.title || 'Product'} removed from wishlist`);
  };

  const moveWishlistItemToCart = (productId) => {
    const product = productsById.get(productIdOf(productId));

    if (!product) {
      showToast('Product could not be found');
      return;
    }

    addToCart(product);
    setWishlistProductIds((productIds) => productIds.filter((itemId) => itemId !== productIdOf(productId)));
    syncAccountRequest(deleteWishlistProduct(customerId, productIdOf(productId)));
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
    const completedOrder = {
      ...order,
      status: 'Completed',
      items: order.items.map((item) => ({ ...item })),
    };

    setLatestOrder(completedOrder);
    setOrderHistory((orders) => [
      completedOrder,
      ...orders.filter((savedOrder) => savedOrder.id !== completedOrder.id),
    ]);
    syncAccountRequest(saveAccountOrder(customerId, completedOrder));
    setCartItems([]);
    showToast('Payment successful');
  };

  const openOrderDetail = (order) => {
    setLatestOrder(order);
    navigate('order-detail');
  };

  const requestRefundForOrder = (orderId) => {
    const refundRequestedAt = new Date().toLocaleString();

    setOrderHistory((orders) => (
      orders.map((order) => (
        order.id === orderId
          ? { ...order, status: 'Refund Requested', refundRequestedAt }
          : order
      ))
    ));
    setLatestOrder((order) => (
      order?.id === orderId
        ? { ...order, status: 'Refund Requested', refundRequestedAt }
        : order
    ));
    syncAccountRequest(saveRefundRequest(customerId, orderId));
    showToast('Refund request submitted');
  };

  const markProductDownloaded = (productId) => {
    const product = productsById.get(productIdOf(productId));

    setDownloadedProductIds((productIds) => (
      productIds.includes(productIdOf(productId)) ? productIds : [...productIds, productIdOf(productId)]
    ));
    syncAccountRequest(saveDownloadedProduct(customerId, productIdOf(productId)));
    showToast(`${product?.title || 'Product'} is ready offline`);
  };

  const saveSettings = (nextSettings, message = 'Settings saved') => {
    const savedSettings = { ...DEFAULT_SETTINGS, ...nextSettings };
    setSettings(savedSettings);
    writeStoredValue(SETTINGS_STORAGE_KEY, savedSettings);
    showToast(message);
  };

  const placeholder = placeholderPages[page];
  const cartCount = cartItems.reduce((sum, item) => sum + Number(item.quantity || 1), 0);

  return (
    <div className="app">
      <Header navigate={navigate} navigationMenus={navigationMenus} search={search} setSearch={setSearch} cartCount={cartCount} user={user} />
      <DataSourceNotice status={dataStatus} error={dataError} />
      {page === 'home' && <HomePage navigate={navigate} viewProduct={viewProduct} addToCart={addToCart} products={products} />}
      {page === 'listing' && <ListingPage category={category} subCategory={subCategory} search={search} viewProduct={viewProduct} addToCart={addToCart} navigate={navigate} products={products} />}
      {page === 'detail' && <ProductDetailPage product={selectedProduct} addToCart={addToCart} addToWishlist={addToWishlist} isWishlisted={wishlistProductIds.includes(productIdOf(selectedProduct))} buyNow={buyNow} navigate={navigate} />}
      {page === 'account' && <AccountPage products={products} user={user} onAuth={handleAuth} checkoutPending={cartCount > 0} navigate={navigate} />}
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
      {page === 'order-detail' && <OrderDetailPage order={latestOrder} navigate={navigate} onRequestRefund={requestRefundForOrder} />}
      {page === 'wishlist' && <WishlistPage wishlistProducts={wishlistProducts} products={products} navigate={navigate} viewProduct={viewProduct} onAddProductById={addWishlistProductById} onMoveToCart={moveWishlistItemToCart} onRemove={removeFromWishlist} />}
      {page === 'order-history' && <OrderHistoryPage orders={orderHistoryWithProducts} navigate={navigate} onViewOrder={openOrderDetail} onRequestRefund={requestRefundForOrder} />}
      {page === 'my-library' && <MyLibraryPage ownedProducts={ownedProducts} navigate={navigate} viewProduct={viewProduct} onDownloadProduct={markProductDownloaded} defaultSort={settings.librarySort} />}
      {page === 'settings' && <SettingsPage settings={settings} onSave={saveSettings} />}
      {placeholder && <PlaceholderPage title={placeholder.title} description={placeholder.description} actions={placeholder.actions} navigate={navigate} />}
      <Footer navigate={navigate} />
      <div className={`toast toast-${toastTone} ${toast ? 'show' : ''}`} role={toastTone === 'error' && toast ? 'alert' : undefined}>
        <Icon name={toastTone === 'error' ? 'lock' : 'check'} size={16} />
        {toast}
      </div>
    </div>
  );
}
