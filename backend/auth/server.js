import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import sql from 'mssql';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
import crypto from "crypto";

const {
  PORT = 3001,
  NODE_ENV = 'development',
  JWT_SECRET = 'change-me',
  JWT_EXPIRES = '3600',
  MSSQL_SERVER = 'mssql',
  MSSQL_DB = 'YourAppDb',
  MSSQL_USER = 'sa',
  MSSQL_PASSWORD = 'YourStrong!Passw0rd',
  MSSQL_ENCRYPT = 'false',
  NOCO_URL = 'http://nocodb:8080',
  NOCO_API_TOKEN = '',
  CORS_ORIGINS = ''
} = process.env;

const app = express();

app.use(cookieParser());
app.use(express.json());

const defaultOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3002',
  'http://127.0.0.1:3002',
];
const origins = CORS_ORIGINS
  ? CORS_ORIGINS.split(',').map(s => s.trim()).filter(Boolean)
  : defaultOrigins;
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || origins.includes(origin)) return cb(null, true);
    return cb(new Error('CORS blocked'), false);
  },
  credentials: true
}));

// ---------- ACCOUNT WORKSPACE ROUTES ----------
const DEFAULT_ACCOUNT_WORKSPACE = {
  wishlistProductIds: [2, 3, 4, 8, 9, 11],
  downloadedProductIds: [],
  orders: [
    {
      id: 'ORD-1001',
      paymentId: 'PAY-1001',
      paymentMethod: 'Visa **** 1234',
      createdAt: '2026-05-20',
      status: 'Completed',
      items: [
        { productId: 1, quantity: 1 },
        { productId: 2, quantity: 1 },
      ],
    },
    {
      id: 'ORD-1002',
      paymentId: 'PAY-1002',
      paymentMethod: 'PayPal account',
      createdAt: '2026-05-18',
      status: 'Refund Requested',
      items: [
        { productId: 11, quantity: 1 },
      ],
    },
    {
      id: 'ORD-1003',
      paymentId: 'PAY-1003',
      paymentMethod: 'Visa **** 1234',
      createdAt: '2026-05-12',
      status: 'Refunded',
      items: [
        { productId: 3, quantity: 1 },
      ],
    },
  ],
};

const accountWorkspaces = new Map();

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeCustomerId(customerId) {
  return String(customerId || 'guest');
}

function getCustomerId(req) {
  return normalizeCustomerId(req.body?.customerId || req.query?.customerId || req.user?.sub || 'guest');
}

function getAccountWorkspace(customerId) {
  const workspaceKey = normalizeCustomerId(customerId);

  if (!accountWorkspaces.has(workspaceKey)) {
    accountWorkspaces.set(workspaceKey, cloneJson(DEFAULT_ACCOUNT_WORKSPACE));
  }

  return accountWorkspaces.get(workspaceKey);
}

function normalizeOrderForWorkspace(order) {
  const id = String(order?.id || `ORD-${Date.now().toString().slice(-6)}`);
  const items = Array.isArray(order?.items)
    ? order.items
      .map((item) => ({
        productId: toPositiveInt(item.productId ?? item.id),
        stockItemId: toPositiveInt(item.stockItemId),
        quantity: Math.max(1, toPositiveInt(item.quantity) || 1),
      }))
      .filter((item) => item.productId)
    : [];

  return {
    id,
    paymentId: String(order?.paymentId || `PAY-${Date.now().toString().slice(-6)}`),
    databaseOrderId: toPositiveInt(order?.databaseOrderId),
    paymentMethod: String(order?.paymentMethod || 'Unknown'),
    createdAt: String(order?.createdAt || new Date().toLocaleString()),
    status: String(order?.status || 'Completed'),
    subtotal: Number(order?.subtotal || 0),
    discount: Number(order?.discount || 0),
    tax: Number(order?.tax || 0),
    total: Number(order?.total || 0),
    items,
  };
}

app.get('/account/workspace', (req, res) => {
  res.json(cloneJson(getAccountWorkspace(getCustomerId(req))));
});

app.post('/account/wishlist', (req, res) => {
  const productId = toPositiveInt(req.body?.productId);

  if (!productId) {
    return res.status(400).json({ error: 'productId is required' });
  }

  const workspace = getAccountWorkspace(getCustomerId(req));
  const productIds = workspace.wishlistProductIds.map(String);

  if (!productIds.includes(String(productId))) {
    workspace.wishlistProductIds = [productId, ...workspace.wishlistProductIds];
  }

  res.status(201).json({ wishlistProductIds: workspace.wishlistProductIds });
});

app.delete('/account/wishlist/:productId', (req, res) => {
  const productId = toPositiveInt(req.params.productId);
  const workspace = getAccountWorkspace(getCustomerId(req));
  workspace.wishlistProductIds = workspace.wishlistProductIds.filter((itemId) => String(itemId) !== String(productId));

  res.json({ wishlistProductIds: workspace.wishlistProductIds });
});

app.post('/account/orders', (req, res) => {
  const order = normalizeOrderForWorkspace(req.body?.order);

  if (!order.items.length) {
    return res.status(400).json({ error: 'at least one order item is required' });
  }

  const workspace = getAccountWorkspace(getCustomerId(req));
  workspace.orders = [
    order,
    ...workspace.orders.filter((savedOrder) => savedOrder.id !== order.id),
  ];

  res.status(201).json({ order, orders: workspace.orders });
});

app.patch('/account/orders/:orderId/refund', (req, res) => {
  const workspace = getAccountWorkspace(getCustomerId(req));
  const order = workspace.orders.find((savedOrder) => savedOrder.id === req.params.orderId);

  if (!order) {
    return res.status(404).json({ error: 'order not found' });
  }

  order.status = 'Refund Requested';
  order.refundRequestedAt = new Date().toLocaleString();

  res.json({ order, orders: workspace.orders });
});

app.post('/account/downloads', (req, res) => {
  const productId = toPositiveInt(req.body?.productId);

  if (!productId) {
    return res.status(400).json({ error: 'productId is required' });
  }

  const workspace = getAccountWorkspace(getCustomerId(req));
  const productIds = workspace.downloadedProductIds.map(String);

  if (!productIds.includes(String(productId))) {
    workspace.downloadedProductIds = [...workspace.downloadedProductIds, productId];
  }

  res.status(201).json({ downloadedProductIds: workspace.downloadedProductIds });
});

// ---------- PROXY TO NOCODB (protected) ----------
app.use('/api', authRequired, (req, res, next) => {
  next();
}, createProxyMiddleware({
  target: process.env.NOCO_URL,
  changeOrigin: true,
  pathRewrite: (path, req) => {
    let out = path.replace(/^\/inft3050\//, '/api/v1/db/data/v1/inft3050/');
    console.log("Out path=" + out);
    return out;
  },
  headers: { 'xc-token': process.env.NOCO_API_TOKEN },
}));

// ---------- MSSQL POOL ----------
const poolPromise = sql.connect({
  server: MSSQL_SERVER,
  database: MSSQL_DB,
  user: MSSQL_USER,
  password: MSSQL_PASSWORD,
  options: {
    encrypt: String(MSSQL_ENCRYPT).toLowerCase() === 'true',
    trustServerCertificate: true
  }
});

// ---------- JWT helpers ----------
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: Number(JWT_EXPIRES) });
}

function toPositiveInt(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

async function resolveStockItemId(transaction, item) {
  const stockItemId = toPositiveInt(item.stockItemId ?? item.stocktakeItemId ?? item.itemId);
  if (stockItemId) return stockItemId;

  const productId = toPositiveInt(item.productId ?? item.id);
  if (!productId) return null;

  const result = await new sql.Request(transaction)
    .input('productId', sql.Int, productId)
    .query(`
      SELECT TOP 1 ItemId
      FROM dbo.Stocktake
      WHERE ProductId = @productId
      ORDER BY
        CASE WHEN Quantity > 0 THEN 0 ELSE 1 END,
        Price ASC,
        ItemId ASC
    `);

  return toPositiveInt(result.recordset?.[0]?.ItemId);
}

function extractTableFromPath(pathname) {
  // v2: /api/v2/tables/<tableIdOrSlug>/...
  let m = pathname.match(/^\/inft3050\/([^/]+)/i);
  if (m) return decodeURIComponent(m[1]);

  return null;
}

function authRequired(req, res, next) {
  const token = req.cookies?.token;
  const { pathname } = new URL(req.url, 'http://x'); // safe parse
  const table = extractTableFromPath(pathname);
  console.log("Received request for table: " + table + " on URL " + pathname);

  // Block specific tables before proxying to NocoDB
  const BLOCKED = new Set([
    'user', 'users', 'dbo.user', 'dbo.users',
    // add your table slug or UUID here if using v2 ids, e.g.:
    // 'tbl_123abc', '3f2e4f1b-...' 
  ]);

  let needAuth = true;
  let needAdmin = true;

  if (req.url == '/login') {
    needAuth = false;
    needAdmin = false;
  } else if (req.url == '/logout') {
    needAuth = true;
    needAdmin = false;
  } else if (req.url == '/me') {
    needAuth = true;
    needAdmin = false;
  }
  else if (table) {
    if (BLOCKED.has(table.toLowerCase())) {
      if (req.method === "GET") {
        needAuth = true;
        needAdmin = false;
      }
      else {
        needAuth = true;
        needAdmin = true;
      }
    } else {
      if (req.method === "GET") {
        needAuth = false;
        needAdmin = false;
      }
      else {
        needAuth = true;
        needAdmin = false;
      }
    }
  } else {
    console.log("Rejected - unknown URL " + pathname);
    return res.status(401).json({ error: 'Forbidden: unknown URL' });
  }

  if (needAuth) {
    if (!token) {
      console.log("Rejected - authentication required but no token found on URL " + pathname);
      return res.status(401).json({ error: 'Forbidden: authentication required' });
    }
    try {
      req.user = jwt.verify(token, JWT_SECRET);

      if (needAdmin) {
        if (req.user.isAdmin === true) {
          console.log("Accepted - admin credentials required on URL " + pathname);
          next();
        }
        else {
          console.log("Rejected - credentials provided but not admin on URL " + pathname);
          return res.status(403).json({ error: 'Forbidden: admin access required' });
        }
      }
      else {
        console.log("Accepted - non admin authenticated request on URL " + pathname);
        next();
      }
    } catch {
      console.log("Rejected - invalid token provided on URL " + pathname);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }
  else {
    console.log("Accepted - public request on URL " + pathname)
    next();
  }

}

// ---------- ORDER ROUTES ----------
app.post('/orders', async (req, res) => {
  const { customerId, items = [], address = {} } = req.body ?? {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'at least one order item is required' });
  }

  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const orderResult = await new sql.Request(transaction)
      .input('customer', sql.Int, toPositiveInt(customerId))
      .input('streetAddress', sql.NVarChar(255), address.streetAddress || null)
      .input('postCode', sql.Int, toPositiveInt(address.postCode))
      .input('suburb', sql.NVarChar(255), address.suburb || null)
      .input('state', sql.NVarChar(50), address.state || null)
      .query(`
        INSERT INTO dbo.Orders (customer, StreetAddress, PostCode, Suburb, State)
        OUTPUT INSERTED.OrderID
        VALUES (@customer, @streetAddress, @postCode, @suburb, @state)
      `);

    const orderId = toPositiveInt(orderResult.recordset?.[0]?.OrderID);
    const savedItems = [];

    for (const item of items) {
      const stockItemId = await resolveStockItemId(transaction, item);
      const quantity = Math.max(1, toPositiveInt(item.quantity) || 1);

      if (!stockItemId) {
        throw new Error(`No Stocktake item found for product ${item.productId ?? item.id ?? 'unknown'}`);
      }

      await new sql.Request(transaction)
        .input('orderId', sql.Int, orderId)
        .input('stockItemId', sql.Int, stockItemId)
        .input('quantity', sql.Int, quantity)
        .query(`
          INSERT INTO dbo.ProductsInOrders (OrderId, produktId, Quantity)
          VALUES (@orderId, @stockItemId, @quantity)
        `);

      savedItems.push({
        productId: toPositiveInt(item.productId ?? item.id),
        stockItemId,
        quantity,
      });
    }

    await transaction.commit();

    res.status(201).json({
      orderId,
      itemCount: savedItems.length,
      items: savedItems,
    });
  } catch (e) {
    try {
      await transaction.rollback();
    } catch {
      // The original database error is more useful for the caller.
    }

    console.error(e);
    res.status(500).json({ error: e.message || 'order could not be saved' });
  }
});

// ---------- AUTH ROUTES ----------
// Expect body: { username, password }
app.post('/login', async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('username', sql.VarChar, username)
      .query(`
        SELECT userid, username, hashpw, salt, email, isAdmin  
        FROM [User]  
        WHERE username = @username
      `);

    const user = result.recordset?.[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const hash = crypto.createHash("sha256").update(user.salt + password, "utf8").digest("hex");
    if (hash != user.hashpw) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken({ sub: user.userid, email: user.email, isAdmin: user.isAdmin });
    res.cookie('token', token, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: Number(JWT_EXPIRES) * 1000
    });
    res.json({ id: user.userid, email: user.email, username: user.username, isAdmin: user.isAdmin });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: NODE_ENV === 'production' ? 'none' : 'lax'
  });
  res.json({ ok: true });
});

app.get('/me', authRequired, (req, res) => {
  res.json({ id: req.user.sub, email: req.user.email });
});

app.listen(PORT, () => {
  console.log(`Auth server listening on :${PORT}`);
});
