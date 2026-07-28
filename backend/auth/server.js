import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import sql from 'mssql';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
import crypto from 'crypto';

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
  CORS_ORIGINS = 'http://localhost:3000',
} = process.env;

const app = express();
const origins = CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean);

app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS blocked'), false);
  },
  credentials: true,
}));

const poolPromise = new sql.ConnectionPool({
  server: MSSQL_SERVER,
  database: MSSQL_DB,
  user: MSSQL_USER,
  password: MSSQL_PASSWORD,
  options: {
    encrypt: String(MSSQL_ENCRYPT).toLowerCase() === 'true',
    trustServerCertificate: true,
  },
}).connect();

// The supplied StoreDB schema is used as-is. This service only reads and writes records.
const applicationPoolPromise = poolPromise;

const ACCOUNT_ROLES = new Set(['Customer', 'Employee', 'Admin']);
const ACCOUNT_SOURCES = new Set(['user', 'patron']);

function normalizeRole(value, fallback = 'Customer') {
  const requested = String(value || '').trim().toLowerCase();
  const role = [...ACCOUNT_ROLES].find((candidate) => candidate.toLowerCase() === requested);
  return role || fallback;
}

function normalizeAccountSource(value, fallback = 'user') {
  const requested = String(value || '').trim().toLowerCase();
  return ACCOUNT_SOURCES.has(requested) ? requested : fallback;
}

function signToken(user) {
  return jwt.sign({
    sub: user.id,
    accountSource: normalizeAccountSource(user.accountSource),
    email: user.email,
    username: user.username,
    isAdmin: Boolean(user.isAdmin),
    role: normalizeRole(user.role, user.isAdmin ? 'Admin' : 'Customer'),
    customerId: user.customerId || null,
  }, JWT_SECRET, { expiresIn: Number(JWT_EXPIRES) });
}

function toPositiveInt(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function accountKey(accountSource, accountId) {
  return `${normalizeAccountSource(accountSource)}:${toPositiveInt(accountId)}`;
}

function parseAccountReference(value) {
  const text = String(value || '').trim();
  const matched = text.match(/^(user|patron):(\d+)$/i);
  if (matched) {
    const id = toPositiveInt(matched[2]);
    return id ? { accountSource: normalizeAccountSource(matched[1]), id } : null;
  }

  const id = toPositiveInt(text);
  return id ? { accountSource: 'user', id } : null;
}

function toNonNegativeNumber(value, fallback = null) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function cleanText(value, maxLength = 255) {
  const text = String(value ?? '').trim();
  return text ? text.slice(0, maxLength) : null;
}

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function hashPassword(salt, password) {
  return crypto.createHash('sha256').update(`${salt}${password}`, 'utf8').digest('hex');
}

function passwordsMatch(expectedHash, actualHash) {
  const expected = Buffer.from(String(expectedHash || '').toLowerCase());
  const actual = Buffer.from(String(actualHash || '').toLowerCase());
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function setSessionCookie(res, user) {
  res.cookie('token', signToken(user), {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: Number(JWT_EXPIRES) * 1000,
  });
}

function clearSessionCookie(res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
  });
}

function decodeSession(req) {
  const token = req.cookies?.token;
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

async function requireAuth(req, res, next) {
  const session = decodeSession(req);
  if (!session) return res.status(401).json({ error: 'Authentication required' });

  try {
    const pool = await applicationPoolPromise;
    const source = normalizeAccountSource(session.accountSource, 'user');
    const account = serializeUser(await findAccountById(pool, source, session.sub));
    if (!account) {
      clearSessionCookie(res);
      return res.status(401).json({ error: 'Account no longer exists' });
    }

    req.user = {
      ...session,
      sub: account.id,
      username: account.username,
      email: account.email,
      role: account.role,
      isAdmin: account.isAdmin,
      customerId: account.customerId,
      accountSource: account.accountSource,
      accountKey: account.accountKey,
    };
    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Account access could not be verified' });
  }
}

function requireAdmin(req, res, next) {
  return requireAuth(req, res, () => {
    if (!req.user.isAdmin && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    return next();
  });
}

function requireStaff(req, res, next) {
  return requireAuth(req, res, () => {
    const role = normalizeRole(req.user.role, req.user.isAdmin ? 'Admin' : 'Customer');
    if (role !== 'Employee' && role !== 'Admin') {
      return res.status(403).json({ error: 'Employee or Admin access required' });
    }
    return next();
  });
}

function requireCustomer(req, res, next) {
  return requireAuth(req, res, () => {
    const role = normalizeRole(req.user.role, req.user.isAdmin ? 'Admin' : 'Customer');
    if (role !== 'Customer') {
      return res.status(403).json({ error: 'Customer access required' });
    }
    return next();
  });
}

async function findAccountById(context, accountSource, accountId) {
  const source = normalizeAccountSource(accountSource);
  const request = new sql.Request(context).input('accountId', sql.Int, toPositiveInt(accountId));
  const query = source === 'patron'
    ? `
      SELECT TOP 1
        patron.UserID AS id,
        patron.Email AS username,
        patron.Email AS email,
        patron.Name AS name,
        CAST(0 AS bit) AS isAdmin,
        N'Customer' AS accessRole,
        N'patron' AS accountSource,
        customer.customerID AS customerId,
        customer.PhoneNumber AS phoneNumber,
        customer.StreetAddress AS streetAddress,
        customer.PostCode AS postCode,
        customer.Suburb AS suburb,
        customer.State AS state,
        customer.CardNumber AS cardNumber,
        customer.CardOwner AS cardOwner,
        customer.Expiry AS expiry
      FROM dbo.Patrons patron
      OUTER APPLY (
        SELECT TOP 1 account.*
        FROM dbo.[TO] account
        WHERE account.PatronId = patron.UserID
          OR (
            account.PatronId IS NULL
            AND patron.Email IS NOT NULL
            AND LOWER(account.Email) = LOWER(patron.Email)
          )
        ORDER BY CASE WHEN account.PatronId = patron.UserID THEN 0 ELSE 1 END, account.customerID
      ) customer
      WHERE patron.UserID = @accountId
    `
    : `
      SELECT TOP 1
        account.UserID AS id,
        account.UserName AS username,
        account.Email AS email,
        account.Name AS name,
        account.isAdmin AS isAdmin,
        CASE
          WHEN account.isAdmin = 1 THEN N'Admin'
          WHEN customer.customerID IS NOT NULL THEN N'Customer'
          ELSE N'Employee'
        END AS accessRole,
        N'user' AS accountSource,
        customer.customerID AS customerId,
        customer.PhoneNumber AS phoneNumber,
        customer.StreetAddress AS streetAddress,
        customer.PostCode AS postCode,
        customer.Suburb AS suburb,
        customer.State AS state,
        customer.CardNumber AS cardNumber,
        customer.CardOwner AS cardOwner,
        customer.Expiry AS expiry
      FROM dbo.[User] account
      OUTER APPLY (
        SELECT TOP 1 customerRecord.*
        FROM dbo.[TO] customerRecord
        WHERE account.Email IS NOT NULL AND LOWER(customerRecord.Email) = LOWER(account.Email)
        ORDER BY customerRecord.customerID
      ) customer
      WHERE account.UserID = @accountId
    `;
  const result = await request.query(query);

  return result.recordset?.[0] || null;
}

function serializeUser(row) {
  if (!row) return null;
  const cardDigits = String(row.cardNumber || '').replace(/\D/g, '');
  const accountSource = normalizeAccountSource(row.accountSource);
  const id = Number(row.id);

  return {
    id,
    accountSource,
    accountKey: accountKey(accountSource, id),
    username: row.username || row.email,
    email: row.email,
    name: row.name || row.username || row.email,
    isAdmin: Boolean(row.isAdmin),
    role: normalizeRole(row.accessRole, row.isAdmin ? 'Admin' : 'Customer'),
    customerId: row.customerId ? Number(row.customerId) : null,
    phoneNumber: row.phoneNumber || '',
    address: {
      streetAddress: row.streetAddress || '',
      postCode: row.postCode || '',
      suburb: row.suburb || '',
      state: row.state || '',
    },
    paymentMethod: cardDigits
      ? { last4: cardDigits.slice(-4), cardOwner: row.cardOwner || '', expiry: row.expiry || '' }
      : null,
  };
}

async function ensureCustomerForUser(transaction, user, address = {}) {
  if (!user.email) throw createHttpError(400, 'A customer email is required before checkout');
  const patronId = user.accountSource === 'patron' ? toPositiveInt(user.id) : null;

  const existing = await new sql.Request(transaction)
    .input('patronId', sql.Int, patronId)
    .input('email', sql.NVarChar(255), user.email)
    .query(`
      SELECT TOP 1 customerID
      FROM dbo.[TO] WITH (UPDLOCK, HOLDLOCK)
      WHERE (@patronId IS NOT NULL AND PatronId = @patronId)
         OR (
           LOWER(Email) = LOWER(@email)
           AND (@patronId IS NULL OR PatronId IS NULL OR PatronId = @patronId)
         )
      ORDER BY CASE WHEN PatronId = @patronId THEN 0 ELSE 1 END, customerID
    `);

  const customerId = toPositiveInt(existing.recordset?.[0]?.customerID);
  const streetAddress = cleanText(address.streetAddress);
  const postCode = toPositiveInt(address.postCode);
  const suburb = cleanText(address.suburb, 50);
  const state = cleanText(address.state, 50);

  if (customerId) {
    if (patronId || streetAddress || postCode || suburb || state) {
      await new sql.Request(transaction)
        .input('customerId', sql.Int, customerId)
        .input('patronId', sql.Int, patronId)
        .input('streetAddress', sql.NVarChar(255), streetAddress)
        .input('postCode', sql.Int, postCode)
        .input('suburb', sql.NVarChar(50), suburb)
        .input('state', sql.NVarChar(50), state)
        .query(`
          UPDATE dbo.[TO]
          SET PatronId = COALESCE(PatronId, @patronId),
              StreetAddress = COALESCE(@streetAddress, StreetAddress),
              PostCode = COALESCE(@postCode, PostCode),
              Suburb = COALESCE(@suburb, Suburb),
              State = COALESCE(@state, State)
          WHERE customerID = @customerId
        `);
    }
    return customerId;
  }

  const inserted = await new sql.Request(transaction)
    .input('patronId', sql.Int, patronId)
    .input('email', sql.NVarChar(255), user.email)
    .input('streetAddress', sql.NVarChar(255), streetAddress)
    .input('postCode', sql.Int, postCode)
    .input('suburb', sql.NVarChar(50), suburb)
    .input('state', sql.NVarChar(50), state)
    .query(`
      INSERT INTO dbo.[TO] (PatronId, Email, StreetAddress, PostCode, Suburb, State)
      OUTPUT INSERTED.customerID
      VALUES (@patronId, @email, @streetAddress, @postCode, @suburb, @state)
    `);

  return toPositiveInt(inserted.recordset?.[0]?.customerID);
}

async function findDuplicateAccount(context, {
  username = null,
  email,
  excludeSource = null,
  excludeId = null,
}) {
  const excludedUserId = excludeSource === 'user' ? toPositiveInt(excludeId) : null;
  const excludedPatronId = excludeSource === 'patron' ? toPositiveInt(excludeId) : null;
  const result = await new sql.Request(context)
    .input('username', sql.NVarChar(50), username)
    .input('email', sql.NVarChar(255), email)
    .input('excludedUserId', sql.Int, excludedUserId)
    .input('excludedPatronId', sql.Int, excludedPatronId)
    .query(`
      SELECT TOP 1 accountSource, accountId
      FROM (
        SELECT N'user' AS accountSource, UserID AS accountId
        FROM dbo.[User]
        WHERE (
          (@username IS NOT NULL AND LOWER(UserName) = LOWER(@username))
          OR LOWER(Email) = LOWER(@email)
        )
        AND (@excludedUserId IS NULL OR UserID <> @excludedUserId)

        UNION ALL

        SELECT N'patron' AS accountSource, UserID AS accountId
        FROM dbo.Patrons
        WHERE LOWER(Email) = LOWER(@email)
          AND (@excludedPatronId IS NULL OR UserID <> @excludedPatronId)
      ) duplicateAccounts
    `);
  return result.recordset?.[0] || null;
}

async function createAccount(transaction, input, allowRoleSelection = false) {
  const email = cleanText(input.email, 255)?.toLowerCase();
  const name = cleanText(input.name, 255);
  const password = String(input.password || '');
  const requestedRole = input.role || (input.isAdmin ? 'Admin' : 'Customer');
  const role = allowRoleSelection ? normalizeRole(requestedRole, null) : 'Customer';
  const username = role === 'Customer' ? email : cleanText(input.username, 50);
  const isAdmin = role === 'Admin';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw createHttpError(400, 'A valid email address is required');
  if (!name) throw createHttpError(400, 'Name is required');
  if (password.length < 8) throw createHttpError(400, 'Password must contain at least 8 characters');
  if (!role || !ACCOUNT_ROLES.has(role)) throw createHttpError(400, 'Role must be Customer, Employee, or Admin');
  if (role !== 'Customer' && (!username || username.length < 3)) {
    throw createHttpError(400, 'Username must contain at least 3 characters');
  }

  if (await findDuplicateAccount(transaction, { username, email })) {
    throw createHttpError(409, 'Username or email is already registered');
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(salt, password);

  if (role === 'Customer') {
    const insertedPatron = await new sql.Request(transaction)
      .input('email', sql.NVarChar(255), email)
      .input('name', sql.NVarChar(255), name)
      .input('salt', sql.VarChar(32), salt)
      .input('hash', sql.VarChar(64), hash)
      .query(`
        INSERT INTO dbo.Patrons (Email, Name, Salt, HashPW)
        OUTPUT INSERTED.UserID
        VALUES (@email, @name, @salt, @hash)
      `);
    const patronId = toPositiveInt(insertedPatron.recordset?.[0]?.UserID);
    await new sql.Request(transaction)
      .input('patronId', sql.Int, patronId)
      .input('email', sql.NVarChar(255), email)
      .query('INSERT INTO dbo.[TO] (PatronId, Email) VALUES (@patronId, @email)');
    return findAccountById(transaction, 'patron', patronId);
  }

  const inserted = await new sql.Request(transaction)
    .input('username', sql.NVarChar(50), username)
    .input('email', sql.NVarChar(255), email)
    .input('name', sql.NVarChar(255), name)
    .input('isAdmin', sql.Bit, isAdmin)
    .input('salt', sql.VarChar(32), salt)
    .input('hash', sql.VarChar(64), hash)
    .query(`
      INSERT INTO dbo.[User] (UserName, Email, Name, isAdmin, Salt, HashPW)
      OUTPUT INSERTED.UserID
      VALUES (@username, @email, @name, @isAdmin, @salt, @hash)
    `);

  const userId = toPositiveInt(inserted.recordset?.[0]?.UserID);
  return findAccountById(transaction, 'user', userId);
}

function extractTableFromPath(pathname) {
  const match = pathname.match(/^\/inft3050\/([^/?]+)/i);
  return match ? decodeURIComponent(match[1]).toLowerCase() : null;
}

const SENSITIVE_TABLES = new Set(['user', 'users', 'to', 'orders', 'productsinorders', 'patrons']);

function authorizeProxy(req, res, next) {
  const table = extractTableFromPath(req.url);
  if (!table) return res.status(404).json({ error: 'Unknown API table' });

  if (req.method === 'GET' && !SENSITIVE_TABLES.has(table)) return next();
  if (req.method === 'GET') return requireStaff(req, res, next);
  return requireAdmin(req, res, next);
}

app.use('/api', authorizeProxy, createProxyMiddleware({
  target: NOCO_URL,
  changeOrigin: true,
  pathRewrite: (path) => path.replace(/^\/inft3050\//, '/api/v1/db/data/v1/inft3050/'),
  headers: { 'xc-token': NOCO_API_TOKEN },
}));

app.post('/register', async (req, res) => {
  const pool = await applicationPoolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
    const row = await createAccount(transaction, req.body || {}, false);
    await transaction.commit();
    const user = serializeUser(row);
    setSessionCookie(res, user);
    return res.status(201).json({ user });
  } catch (error) {
    try { await transaction.rollback(); } catch { /* No active transaction. */ }
    return res.status(error.status || 500).json({ error: error.message || 'Account could not be created' });
  }
});

app.post('/login', async (req, res) => {
  const identifier = cleanText(req.body?.identifier ?? req.body?.username, 255);
  const password = String(req.body?.password || '');
  if (!identifier || !password) return res.status(400).json({ error: 'Username or email and password are required' });

  try {
    const pool = await applicationPoolPromise;
    const result = await pool.request()
      .input('identifier', sql.NVarChar(255), identifier)
      .query(`
        SELECT N'user' AS accountSource, UserID, UserName, Email, Name, isAdmin, Salt, HashPW
        FROM dbo.[User]
        WHERE LOWER(UserName) = LOWER(@identifier) OR LOWER(Email) = LOWER(@identifier)

        UNION ALL

        SELECT N'patron' AS accountSource, UserID, Email AS UserName, Email, Name,
               CAST(0 AS bit) AS isAdmin, Salt, HashPW
        FROM dbo.Patrons
        WHERE LOWER(Email) = LOWER(@identifier)
      `);

    const record = result.recordset?.find(
      (candidate) => passwordsMatch(candidate.HashPW, hashPassword(candidate.Salt, password)),
    );
    if (!record) {
      return res.status(401).json({ error: 'Invalid username, email, or password' });
    }

    const user = serializeUser(await findAccountById(pool, record.accountSource, record.UserID));
    setSessionCookie(res, user);
    return res.json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Sign in failed' });
  }
});

app.post('/logout', (req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

app.get('/session', async (req, res) => {
  const session = decodeSession(req);
  if (!session) return res.json({ user: null });

  try {
    const pool = await applicationPoolPromise;
    const source = normalizeAccountSource(session.accountSource, 'user');
    return res.json({ user: serializeUser(await findAccountById(pool, source, session.sub)) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Session could not be loaded' });
  }
});

app.get('/me', requireAuth, async (req, res) => {
  try {
    const pool = await applicationPoolPromise;
    const user = serializeUser(await findAccountById(pool, req.user.accountSource, req.user.sub));
    if (!user) {
      clearSessionCookie(res);
      return res.status(401).json({ error: 'Account no longer exists' });
    }
    return res.json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Account could not be loaded' });
  }
});

app.put('/me', requireAuth, async (req, res) => {
  const name = cleanText(req.body?.name, 255);
  const email = cleanText(req.body?.email, 255)?.toLowerCase();
  const phoneNumber = cleanText(req.body?.phoneNumber, 50);
  const address = req.body?.address || {};
  const streetAddress = cleanText(address.streetAddress, 255);
  const suburb = cleanText(address.suburb, 50);
  const state = cleanText(address.state, 50);
  const postCodeInput = String(address.postCode ?? '').trim();
  const postCode = postCodeInput ? toPositiveInt(postCodeInput) : null;
  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'A name and valid email are required' });
  }
  if (postCodeInput && !postCode) {
    return res.status(400).json({ error: 'Postcode must be a positive whole number' });
  }

  const pool = await applicationPoolPromise;
  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
    const accountSource = normalizeAccountSource(req.user.accountSource, 'user');
    const current = await findAccountById(transaction, accountSource, req.user.sub);
    if (!current) throw createHttpError(404, 'Account not found');

    if (await findDuplicateAccount(transaction, {
      email,
      excludeSource: accountSource,
      excludeId: req.user.sub,
    })) {
      throw createHttpError(409, 'Email is already registered');
    }

    if (accountSource === 'patron') {
      await new sql.Request(transaction)
        .input('patronId', sql.Int, req.user.sub)
        .input('name', sql.NVarChar(255), name)
        .input('email', sql.NVarChar(255), email)
        .query('UPDATE dbo.Patrons SET Name = @name, Email = @email WHERE UserID = @patronId');
      await new sql.Request(transaction)
        .input('patronId', sql.Int, req.user.sub)
        .input('customerId', sql.Int, current.customerId)
        .input('email', sql.NVarChar(255), email)
        .query(`
          UPDATE dbo.[TO]
          SET Email = @email
          WHERE PatronId = @patronId OR customerID = @customerId
        `);
    } else {
      await new sql.Request(transaction)
        .input('userId', sql.Int, req.user.sub)
        .input('name', sql.NVarChar(255), name)
        .input('email', sql.NVarChar(255), email)
        .query('UPDATE dbo.[User] SET Name = @name, Email = @email WHERE UserID = @userId');
      if (current.email) {
        await new sql.Request(transaction)
          .input('oldEmail', sql.NVarChar(255), current.email)
          .input('email', sql.NVarChar(255), email)
          .query('UPDATE dbo.[TO] SET Email = @email WHERE LOWER(Email) = LOWER(@oldEmail)');
      }
    }

    if (current.customerId) {
      await new sql.Request(transaction)
        .input('customerId', sql.Int, current.customerId)
        .input('phoneNumber', sql.NVarChar(50), phoneNumber)
        .input('streetAddress', sql.NVarChar(255), streetAddress)
        .input('postCode', sql.Int, postCode)
        .input('suburb', sql.NVarChar(50), suburb)
        .input('state', sql.NVarChar(50), state)
        .query(`
          UPDATE dbo.[TO]
          SET PhoneNumber = @phoneNumber,
              StreetAddress = @streetAddress,
              PostCode = @postCode,
              Suburb = @suburb,
              State = @state
          WHERE customerID = @customerId
        `);
    }

    const row = await findAccountById(transaction, accountSource, req.user.sub);
    await transaction.commit();
    const user = serializeUser(row);
    setSessionCookie(res, user);
    return res.json({ user });
  } catch (error) {
    try { await transaction.rollback(); } catch { /* No active transaction. */ }
    return res.status(error.status || 500).json({ error: error.message || 'Profile could not be updated' });
  }
});

app.put('/me/payment-method', requireCustomer, async (req, res) => {
  const cardDigits = String(req.body?.cardNumber || '').replace(/\D/g, '');
  const cardOwner = cleanText(req.body?.cardOwner, 50);
  const expiry = cleanText(req.body?.expiry, 5);
  if (cardDigits.length < 12 || cardDigits.length > 19 || !cardOwner || !/^\d{2}\/\d{2}$/.test(expiry || '')) {
    return res.status(400).json({ error: 'Valid card details are required' });
  }

  const pool = await applicationPoolPromise;
  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();
    const user = serializeUser(await findAccountById(transaction, req.user.accountSource, req.user.sub));
    if (!user) throw createHttpError(404, 'Account not found');
    const customerId = await ensureCustomerForUser(transaction, user);
    const last4 = cardDigits.slice(-4);

    await new sql.Request(transaction)
      .input('customerId', sql.Int, customerId)
      .input('cardNumber', sql.NVarChar(50), last4)
      .input('cardOwner', sql.NVarChar(50), cardOwner)
      .input('expiry', sql.VarChar(5), expiry)
      .query(`
        UPDATE dbo.[TO]
        SET CardNumber = @cardNumber, CardOwner = @cardOwner, Expiry = @expiry, CVV = NULL
        WHERE customerID = @customerId
      `);

    await transaction.commit();
    return res.json({ paymentMethod: { last4, cardOwner, expiry } });
  } catch (error) {
    try { await transaction.rollback(); } catch { /* No active transaction. */ }
    return res.status(error.status || 500).json({ error: error.message || 'Payment method could not be saved' });
  }
});

async function resolveStockRecord(transaction, item, quantity) {
  const stockItemId = toPositiveInt(item.stockItemId ?? item.stocktakeItemId ?? item.itemId);
  const productId = toPositiveInt(item.productId ?? item.id);
  const request = new sql.Request(transaction).input('quantity', sql.Int, quantity);

  if (stockItemId) {
    request.input('stockItemId', sql.Int, stockItemId);
    const result = await request.query(`
      SELECT TOP 1 s.ItemId, s.ProductId, s.Quantity, s.Price, p.Name
      FROM dbo.Stocktake s WITH (UPDLOCK, ROWLOCK)
      JOIN dbo.Product p ON p.ID = s.ProductId
      WHERE s.ItemId = @stockItemId AND s.Quantity >= @quantity
    `);
    return result.recordset?.[0] || null;
  }

  if (!productId) return null;
  request.input('productId', sql.Int, productId);
  const result = await request.query(`
    SELECT TOP 1 s.ItemId, s.ProductId, s.Quantity, s.Price, p.Name
    FROM dbo.Stocktake s WITH (UPDLOCK, ROWLOCK)
    JOIN dbo.Product p ON p.ID = s.ProductId
    WHERE s.ProductId = @productId AND s.Quantity >= @quantity
    ORDER BY s.Price, s.ItemId
  `);
  return result.recordset?.[0] || null;
}

function categoryName(value) {
  const name = String(value || '').toLowerCase();
  if (name.includes('book')) return 'Books';
  if (name.includes('movie')) return 'Movies & TV';
  if (name.includes('game')) return 'Games';
  return 'Digital product';
}

async function loadOrders(pool, customerId, requestedOrderId = null) {
  if (!customerId) return [];
  const request = pool.request().input('customerId', sql.Int, customerId);
  let orderFilter = '';
  if (requestedOrderId) {
    request.input('orderId', sql.Int, requestedOrderId);
    orderFilter = 'AND o.OrderID = @orderId';
  }

  const result = await request.query(`
    SELECT
      o.OrderID AS orderId,
      o.StreetAddress AS streetAddress,
      o.PostCode AS postCode,
      o.Suburb AS suburb,
      o.State AS state,
      lines.Quantity AS quantity,
      stock.ItemId AS stockItemId,
      stock.Price AS price,
      product.ID AS productId,
      product.Name AS title,
      product.Author AS creator,
      product.Description AS description,
      COALESCE(bookGenre.Name, movieGenre.Name, gameGenre.Name) AS subGenreName,
      genre.Name AS genreName
    FROM dbo.Orders o
    LEFT JOIN dbo.ProductsInOrders lines ON lines.OrderId = o.OrderID
    LEFT JOIN dbo.Stocktake stock ON stock.ItemId = lines.produktId
    LEFT JOIN dbo.Product product ON product.ID = stock.ProductId
    LEFT JOIN dbo.Genre genre ON genre.genreID = product.Genre
    LEFT JOIN dbo.Book_genre bookGenre
      ON product.Genre = 1 AND bookGenre.subGenreID = product.subGenre
    LEFT JOIN dbo.Movie_genre movieGenre
      ON product.Genre = 2 AND movieGenre.subGenreID = product.subGenre
    LEFT JOIN dbo.Game_genre gameGenre
      ON product.Genre = 3 AND gameGenre.subGenreID = product.subGenre
    WHERE o.customer = @customerId ${orderFilter}
    ORDER BY o.OrderID DESC, product.Name
  `);

  const orders = new Map();
  for (const row of result.recordset) {
    if (!orders.has(row.orderId)) {
      orders.set(row.orderId, {
        id: `ORD-${row.orderId}`,
        orderId: Number(row.orderId),
        databaseOrderId: Number(row.orderId),
        paymentId: `PAY-${row.orderId}`,
        paymentMethod: 'Not stored by StoreDB',
        createdAt: null,
        status: 'Recorded',
        refundStatus: 'Not available',
        address: {
          streetAddress: row.streetAddress || '',
          postCode: row.postCode || '',
          suburb: row.suburb || '',
          state: row.state || '',
        },
        total: 0,
        itemCount: 0,
        items: [],
      });
    }

    if (row.productId) {
      const order = orders.get(row.orderId);
      const quantity = Math.max(1, Number(row.quantity || 1));
      const price = Number(row.price || 0);
      order.items.push({
        id: Number(row.productId),
        productId: Number(row.productId),
        stockItemId: Number(row.stockItemId),
        title: row.title,
        creator: row.creator || '',
        description: row.description || '',
        category: categoryName(row.genreName),
        type: row.subGenreName || 'General',
        quantity,
        price,
      });
      order.itemCount += quantity;
      order.total += price * quantity;
    }
  }

  return [...orders.values()].map((order) => {
    const discount = order.total >= 50 ? order.total * 0.1 : 0;
    return {
      ...order,
      total: Number((order.total - discount).toFixed(2)),
    };
  });
}

app.post('/orders', requireCustomer, async (req, res) => {
  const { items = [], address = {}, paymentMethod = 'Store payment' } = req.body || {};
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'At least one order item is required' });

  const pool = await applicationPoolPromise;
  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
    const user = serializeUser(await findAccountById(transaction, req.user.accountSource, req.user.sub));
    if (!user) throw createHttpError(401, 'Account no longer exists');
    const customerId = await ensureCustomerForUser(transaction, user, address);
    const createdAt = new Date();

    const orderResult = await new sql.Request(transaction)
      .input('customerId', sql.Int, customerId)
      .input('streetAddress', sql.NVarChar(255), cleanText(address.streetAddress) || user.address.streetAddress || null)
      .input('postCode', sql.Int, toPositiveInt(address.postCode) || toPositiveInt(user.address.postCode))
      .input('suburb', sql.NVarChar(50), cleanText(address.suburb, 50) || user.address.suburb || null)
      .input('state', sql.NVarChar(50), cleanText(address.state, 50) || user.address.state || null)
      .query(`
        INSERT INTO dbo.Orders (customer, StreetAddress, PostCode, Suburb, State)
        OUTPUT INSERTED.OrderID
        VALUES (@customerId, @streetAddress, @postCode, @suburb, @state)
      `);

    const orderId = toPositiveInt(orderResult.recordset?.[0]?.OrderID);
    const savedItems = [];
    let total = 0;

    for (const item of items) {
      const quantity = Math.max(1, toPositiveInt(item.quantity) || 1);
      const stock = await resolveStockRecord(transaction, item, quantity);
      if (!stock) throw createHttpError(409, `Insufficient stock for product ${item.productId ?? item.id ?? 'unknown'}`);

      await new sql.Request(transaction)
        .input('stockItemId', sql.Int, stock.ItemId)
        .input('quantity', sql.Int, quantity)
        .query('UPDATE dbo.Stocktake SET Quantity = Quantity - @quantity WHERE ItemId = @stockItemId');

      await new sql.Request(transaction)
        .input('orderId', sql.Int, orderId)
        .input('stockItemId', sql.Int, stock.ItemId)
        .input('quantity', sql.Int, quantity)
        .query(`
          INSERT INTO dbo.ProductsInOrders (OrderId, produktId, Quantity)
          VALUES (@orderId, @stockItemId, @quantity)
        `);

      const price = Number(stock.Price || 0);
      total += price * quantity;
      savedItems.push({
        productId: Number(stock.ProductId),
        stockItemId: Number(stock.ItemId),
        title: stock.Name,
        quantity,
        price,
      });
    }

    const discount = total >= 50 ? total * 0.1 : 0;
    total = Number((total - discount).toFixed(2));

    await transaction.commit();
    return res.status(201).json({
      orderId,
      customerId,
      status: 'Paid',
      refundStatus: 'Not requested',
      paymentMethod: cleanText(paymentMethod, 80) || 'Store payment',
      createdAt: createdAt.toISOString(),
      discount: Number(discount.toFixed(2)),
      total,
      itemCount: savedItems.reduce((sum, item) => sum + item.quantity, 0),
      items: savedItems,
    });
  } catch (error) {
    try { await transaction.rollback(); } catch { /* No active transaction. */ }
    console.error(error);
    return res.status(error.status || 500).json({ error: error.message || 'Order could not be saved' });
  }
});

app.get('/orders', requireCustomer, async (req, res) => {
  try {
    const pool = await applicationPoolPromise;
    const user = serializeUser(await findAccountById(pool, req.user.accountSource, req.user.sub));
    if (!user) return res.status(401).json({ error: 'Account no longer exists' });
    const customerId = user.customerId;
    return res.json({ orders: await loadOrders(pool, customerId) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Order history could not be loaded' });
  }
});

app.get('/orders/:orderId', requireCustomer, async (req, res) => {
  const orderId = toPositiveInt(req.params.orderId);
  if (!orderId) return res.status(400).json({ error: 'Valid order id is required' });

  try {
    const pool = await applicationPoolPromise;
    const user = serializeUser(await findAccountById(pool, req.user.accountSource, req.user.sub));
    if (!user) return res.status(401).json({ error: 'Account no longer exists' });
    const orders = await loadOrders(pool, user.customerId, orderId);
    if (!orders.length) return res.status(404).json({ error: 'Order not found' });
    return res.json({ order: orders[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Order could not be loaded' });
  }
});

app.get('/library', requireCustomer, async (req, res) => {
  try {
    const pool = await applicationPoolPromise;
    const user = serializeUser(await findAccountById(pool, req.user.accountSource, req.user.sub));
    if (!user) return res.status(401).json({ error: 'Account no longer exists' });
    const orders = await loadOrders(pool, user.customerId);
    const products = new Map();

    for (const order of orders) {
      for (const item of order.items) {
        const existing = products.get(item.productId);
        products.set(item.productId, {
          ...item,
          ownedQuantity: Number(existing?.ownedQuantity || 0) + item.quantity,
          orderId: existing?.orderId || order.orderId,
          status: 'Owned',
        });
      }
    }

    return res.json({ items: [...products.values()] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Library could not be loaded' });
  }
});

app.get('/admin/summary', requireAdmin, async (req, res) => {
  try {
    const pool = await applicationPoolPromise;
    const result = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM dbo.Product) AS productCount,
        ((SELECT COUNT(*) FROM dbo.[User]) + (SELECT COUNT(*) FROM dbo.Patrons)) AS userCount,
        (SELECT COUNT(*) FROM dbo.Orders) AS orderCount,
        (SELECT COUNT(*) FROM dbo.Stocktake WHERE Quantity <= 5) AS lowStockCount
    `);
    return res.json({ summary: result.recordset[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Admin summary could not be loaded' });
  }
});

async function listAdminProducts(pool) {
  const result = await pool.request().query(`
    SELECT
      product.ID AS id,
      product.Name AS name,
      product.Author AS author,
      product.Description AS description,
      product.Genre AS genre,
      product.subGenre AS subGenre,
      genre.Name AS category,
      COALESCE(bookGenre.Name, movieGenre.Name, gameGenre.Name) AS subCategory,
      product.Published AS published,
      product.LastUpdatedBy AS lastUpdatedBy,
      product.LastUpdated AS lastUpdated,
      stock.ItemId AS stockItemId,
      stock.Price AS price,
      stock.Quantity AS quantity
    FROM dbo.Product product
    LEFT JOIN dbo.Genre genre ON genre.genreID = product.Genre
    LEFT JOIN dbo.Book_genre bookGenre
      ON product.Genre = 1 AND bookGenre.subGenreID = product.subGenre
    LEFT JOIN dbo.Movie_genre movieGenre
      ON product.Genre = 2 AND movieGenre.subGenreID = product.subGenre
    LEFT JOIN dbo.Game_genre gameGenre
      ON product.Genre = 3 AND gameGenre.subGenreID = product.subGenre
    OUTER APPLY (
      SELECT TOP 1 ItemId, Price, Quantity
      FROM dbo.Stocktake
      WHERE ProductId = product.ID
      ORDER BY CASE WHEN Quantity > 0 THEN 0 ELSE 1 END, Price, ItemId
    ) stock
    ORDER BY product.ID
  `);
  return result.recordset;
}

async function listStoreUsers(pool) {
  const result = await pool.request().query(`
    SELECT
      users.UserID AS id,
      users.UserName AS username,
      users.Email AS email,
      users.Name AS name,
      users.isAdmin AS isAdmin,
      CASE
        WHEN users.isAdmin = 1 THEN N'Admin'
        WHEN customer.customerID IS NOT NULL THEN N'Customer'
        ELSE N'Employee'
      END AS role,
      customer.customerID AS customerId,
      N'user' AS accountSource
    FROM dbo.[User] users
    OUTER APPLY (
      SELECT TOP 1 account.customerID
      FROM dbo.[TO] account
      WHERE users.Email IS NOT NULL AND LOWER(account.Email) = LOWER(users.Email)
      ORDER BY account.customerID
    ) customer

    UNION ALL

    SELECT
      patron.UserID AS id,
      patron.Email AS username,
      patron.Email AS email,
      patron.Name AS name,
      CAST(0 AS bit) AS isAdmin,
      N'Customer' AS role,
      customer.customerID AS customerId,
      N'patron' AS accountSource
    FROM dbo.Patrons patron
    OUTER APPLY (
      SELECT TOP 1 account.customerID
      FROM dbo.[TO] account
      WHERE account.PatronId = patron.UserID
        OR (
          account.PatronId IS NULL
          AND patron.Email IS NOT NULL
          AND LOWER(account.Email) = LOWER(patron.Email)
        )
      ORDER BY CASE WHEN account.PatronId = patron.UserID THEN 0 ELSE 1 END, account.customerID
    ) customer

    ORDER BY accountSource, id
  `);

  return result.recordset.map((user) => ({
    ...user,
    isAdmin: Boolean(user.isAdmin),
    role: normalizeRole(user.role, user.isAdmin ? 'Admin' : 'Customer'),
    customerId: toPositiveInt(user.customerId),
    accountSource: normalizeAccountSource(user.accountSource),
    accountKey: accountKey(user.accountSource, user.id),
  }));
}

app.get('/staff/summary', requireStaff, async (req, res) => {
  try {
    const pool = await applicationPoolPromise;
    const result = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM dbo.Product) AS productCount,
        ((SELECT COUNT(*) FROM dbo.[User]) + (SELECT COUNT(*) FROM dbo.Patrons)) AS userCount,
        (SELECT COUNT(*) FROM dbo.Orders) AS orderCount,
        (SELECT COUNT(*) FROM dbo.Stocktake WHERE Quantity <= 5) AS lowStockCount
    `);
    return res.json({ summary: result.recordset[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Employee summary could not be loaded' });
  }
});

app.get('/staff/products', requireStaff, async (req, res) => {
  try {
    const pool = await applicationPoolPromise;
    return res.json({ products: await listAdminProducts(pool) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Employee product view could not be loaded' });
  }
});

app.get('/staff/users', requireStaff, async (req, res) => {
  try {
    const pool = await applicationPoolPromise;
    return res.json({ users: await listStoreUsers(pool) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Employee account view could not be loaded' });
  }
});

app.get('/admin/products', requireAdmin, async (req, res) => {
  try {
    const pool = await applicationPoolPromise;
    return res.json({ products: await listAdminProducts(pool) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Products could not be loaded' });
  }
});

const SUBGENRE_TABLE_BY_GENRE = {
  1: 'dbo.Book_genre',
  2: 'dbo.Movie_genre',
  3: 'dbo.Game_genre',
};

async function requireValidSubgenre(context, genre, subGenre) {
  const tableName = SUBGENRE_TABLE_BY_GENRE[genre];
  if (!tableName) throw createHttpError(400, 'Valid product category is required');

  const result = await new sql.Request(context)
    .input('subGenre', sql.Int, subGenre)
    .query(`SELECT subGenreID FROM ${tableName} WHERE subGenreID = @subGenre`);
  if (!result.recordset?.length) throw createHttpError(400, 'The selected subcategory does not belong to this category');
}

app.get('/admin/product-options', requireAdmin, async (req, res) => {
  try {
    const pool = await applicationPoolPromise;
    const [genres, books, movies, games] = await Promise.all([
      pool.request().query('SELECT genreID AS id, Name AS name FROM dbo.Genre ORDER BY genreID'),
      pool.request().query('SELECT subGenreID AS id, Name AS name FROM dbo.Book_genre ORDER BY subGenreID'),
      pool.request().query('SELECT subGenreID AS id, Name AS name FROM dbo.Movie_genre ORDER BY subGenreID'),
      pool.request().query('SELECT subGenreID AS id, Name AS name FROM dbo.Game_genre ORDER BY subGenreID'),
    ]);
    const subgenres = {
      1: books.recordset,
      2: movies.recordset,
      3: games.recordset,
    };
    return res.json({
      genres: genres.recordset.map((genre) => ({
        ...genre,
        subgenres: (subgenres[genre.id] || []).filter((record) => {
          const name = String(record.name || '').trim();
          return name && !/^<.*>$/.test(name);
        }),
      })),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Product categories could not be loaded' });
  }
});

app.post('/admin/products', requireAdmin, async (req, res) => {
  const name = cleanText(req.body?.name, 255);
  const genre = toPositiveInt(req.body?.genre);
  const subGenre = toPositiveInt(req.body?.subGenre);
  const price = toNonNegativeNumber(req.body?.price);
  const quantity = toNonNegativeNumber(req.body?.quantity);
  if (!name || !genre || !subGenre || price === null || !Number.isInteger(quantity)) {
    return res.status(400).json({ error: 'Name, genre, subgenre, price, and whole-number quantity are required' });
  }

  const pool = await applicationPoolPromise;
  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();
    await requireValidSubgenre(transaction, genre, subGenre);
    const productResult = await new sql.Request(transaction)
      .input('name', sql.NVarChar(255), name)
      .input('author', sql.NVarChar(255), cleanText(req.body?.author, 255))
      .input('description', sql.NVarChar(sql.MAX), cleanText(req.body?.description, 4000))
      .input('genre', sql.Int, genre)
      .input('subGenre', sql.Int, subGenre)
      .input('published', sql.Date, req.body?.published || null)
      .input('updatedBy', sql.NVarChar(50), req.user.username)
      .query(`
        INSERT INTO dbo.Product (Name, Author, Description, Genre, subGenre, Published, LastUpdatedBy, LastUpdated)
        OUTPUT INSERTED.ID
        VALUES (@name, @author, @description, @genre, @subGenre, @published, @updatedBy, GETDATE())
      `);
    const productId = toPositiveInt(productResult.recordset?.[0]?.ID);
    await new sql.Request(transaction)
      .input('productId', sql.Int, productId)
      .input('price', sql.Float, price)
      .input('quantity', sql.Int, quantity)
      .query('INSERT INTO dbo.Stocktake (ProductId, Price, Quantity) VALUES (@productId, @price, @quantity)');
    await transaction.commit();
    return res.status(201).json({ productId });
  } catch (error) {
    try { await transaction.rollback(); } catch { /* No active transaction. */ }
    console.error(error);
    return res.status(error.status || 500).json({ error: error.message || 'Product could not be created' });
  }
});

app.put('/admin/products/:productId', requireAdmin, async (req, res) => {
  const productId = toPositiveInt(req.params.productId);
  const name = cleanText(req.body?.name, 255);
  const genre = toPositiveInt(req.body?.genre);
  const subGenre = toPositiveInt(req.body?.subGenre);
  const price = toNonNegativeNumber(req.body?.price);
  const quantity = toNonNegativeNumber(req.body?.quantity);
  if (!productId || !name || !genre || !subGenre || price === null || !Number.isInteger(quantity)) {
    return res.status(400).json({ error: 'Valid product fields are required' });
  }

  const pool = await applicationPoolPromise;
  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();
    await requireValidSubgenre(transaction, genre, subGenre);
    const updated = await new sql.Request(transaction)
      .input('productId', sql.Int, productId)
      .input('name', sql.NVarChar(255), name)
      .input('author', sql.NVarChar(255), cleanText(req.body?.author, 255))
      .input('description', sql.NVarChar(sql.MAX), cleanText(req.body?.description, 4000))
      .input('genre', sql.Int, genre)
      .input('subGenre', sql.Int, subGenre)
      .input('published', sql.Date, req.body?.published || null)
      .input('updatedBy', sql.NVarChar(50), req.user.username)
      .query(`
        UPDATE dbo.Product
        SET Name = @name, Author = @author, Description = @description,
            Genre = @genre, subGenre = @subGenre, Published = @published,
            LastUpdatedBy = @updatedBy, LastUpdated = GETDATE()
        WHERE ID = @productId
      `);
    if (!updated.rowsAffected[0]) throw createHttpError(404, 'Product not found');

    const stockItemId = toPositiveInt(req.body?.stockItemId);
    const stockRequest = new sql.Request(transaction)
      .input('productId', sql.Int, productId)
      .input('price', sql.Float, price)
      .input('quantity', sql.Int, quantity);
    if (stockItemId) {
      stockRequest.input('stockItemId', sql.Int, stockItemId);
      await stockRequest.query('UPDATE dbo.Stocktake SET Price = @price, Quantity = @quantity WHERE ItemId = @stockItemId AND ProductId = @productId');
    } else {
      await stockRequest.query('INSERT INTO dbo.Stocktake (ProductId, Price, Quantity) VALUES (@productId, @price, @quantity)');
    }
    await transaction.commit();
    return res.json({ ok: true });
  } catch (error) {
    try { await transaction.rollback(); } catch { /* No active transaction. */ }
    return res.status(error.status || 500).json({ error: error.message || 'Product could not be updated' });
  }
});

app.delete('/admin/products/:productId', requireAdmin, async (req, res) => {
  const productId = toPositiveInt(req.params.productId);
  if (!productId) return res.status(400).json({ error: 'Valid product id is required' });

  const pool = await applicationPoolPromise;
  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();
    const references = await new sql.Request(transaction)
      .input('productId', sql.Int, productId)
      .query(`
        SELECT COUNT(*) AS referenceCount
        FROM dbo.ProductsInOrders lines
        JOIN dbo.Stocktake stock ON stock.ItemId = lines.produktId
        WHERE stock.ProductId = @productId
      `);
    if (Number(references.recordset[0].referenceCount) > 0) {
      throw createHttpError(409, 'Products included in previous orders cannot be deleted');
    }
    await new sql.Request(transaction).input('productId', sql.Int, productId).query('DELETE FROM dbo.Stocktake WHERE ProductId = @productId');
    const removed = await new sql.Request(transaction).input('productId', sql.Int, productId).query('DELETE FROM dbo.Product WHERE ID = @productId');
    if (!removed.rowsAffected[0]) throw createHttpError(404, 'Product not found');
    await transaction.commit();
    return res.json({ ok: true });
  } catch (error) {
    try { await transaction.rollback(); } catch { /* No active transaction. */ }
    return res.status(error.status || 500).json({ error: error.message || 'Product could not be deleted' });
  }
});

app.get('/admin/users', requireAdmin, async (req, res) => {
  try {
    const pool = await applicationPoolPromise;
    return res.json({ users: await listStoreUsers(pool) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Users could not be loaded' });
  }
});

app.post('/admin/users', requireAdmin, async (req, res) => {
  const pool = await applicationPoolPromise;
  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
    const user = serializeUser(await createAccount(transaction, req.body || {}, true));
    await transaction.commit();
    return res.status(201).json({ user });
  } catch (error) {
    try { await transaction.rollback(); } catch { /* No active transaction. */ }
    return res.status(error.status || 500).json({ error: error.message || 'User could not be created' });
  }
});

app.put('/admin/users/:accountReference', requireAdmin, async (req, res) => {
  const accountReference = parseAccountReference(req.params.accountReference);
  const name = cleanText(req.body?.name, 255);
  const email = cleanText(req.body?.email, 255)?.toLowerCase();
  const requestedRole = req.body?.role || (req.body?.isAdmin ? 'Admin' : 'Customer');
  const role = normalizeRole(requestedRole, null);
  if (!accountReference || !name || !email || !role || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid user fields are required' });
  }
  const isSelf = req.user.accountSource === accountReference.accountSource
    && Number(req.user.sub) === accountReference.id;
  if (isSelf && role !== 'Admin') {
    return res.status(400).json({ error: 'You cannot remove your own admin access' });
  }

  const pool = await applicationPoolPromise;
  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
    const current = await findAccountById(
      transaction,
      accountReference.accountSource,
      accountReference.id,
    );
    if (!current) throw createHttpError(404, 'User not found');
    const currentRole = normalizeRole(current.accessRole, current.isAdmin ? 'Admin' : 'Customer');
    const customerModel = accountReference.accountSource === 'patron' || currentRole === 'Customer';
    if (customerModel && role !== 'Customer') {
      throw createHttpError(400, 'Customer accounts must remain in the Patrons customer model. Create a separate staff account instead.');
    }
    if (!customerModel && role === 'Customer') {
      throw createHttpError(400, 'Staff accounts cannot be converted to customers. Create a separate customer account instead.');
    }
    if (await findDuplicateAccount(transaction, {
      email,
      excludeSource: accountReference.accountSource,
      excludeId: accountReference.id,
    })) {
      throw createHttpError(409, 'Email is already registered');
    }

    if (accountReference.accountSource === 'patron') {
      await new sql.Request(transaction)
        .input('patronId', sql.Int, accountReference.id)
        .input('name', sql.NVarChar(255), name)
        .input('email', sql.NVarChar(255), email)
        .query('UPDATE dbo.Patrons SET Name = @name, Email = @email WHERE UserID = @patronId');
      await new sql.Request(transaction)
        .input('patronId', sql.Int, accountReference.id)
        .input('customerId', sql.Int, current.customerId)
        .input('email', sql.NVarChar(255), email)
        .query(`
          UPDATE dbo.[TO]
          SET Email = @email
          WHERE PatronId = @patronId OR customerID = @customerId
        `);
    } else {
      await new sql.Request(transaction)
        .input('userId', sql.Int, accountReference.id)
        .input('name', sql.NVarChar(255), name)
        .input('email', sql.NVarChar(255), email)
        .input('isAdmin', sql.Bit, role === 'Admin')
        .query('UPDATE dbo.[User] SET Name = @name, Email = @email, isAdmin = @isAdmin WHERE UserID = @userId');
      if (currentRole === 'Customer' && current.email) {
        await new sql.Request(transaction)
          .input('oldEmail', sql.NVarChar(255), current.email)
          .input('email', sql.NVarChar(255), email)
          .query('UPDATE dbo.[TO] SET Email = @email WHERE LOWER(Email) = LOWER(@oldEmail)');
      }
    }

    const user = serializeUser(await findAccountById(
      transaction,
      accountReference.accountSource,
      accountReference.id,
    ));
    await transaction.commit();
    return res.json({ user });
  } catch (error) {
    try { await transaction.rollback(); } catch { /* No active transaction. */ }
    return res.status(error.status || 500).json({ error: error.message || 'User could not be updated' });
  }
});

app.delete('/admin/users/:accountReference', requireAdmin, async (req, res) => {
  const accountReference = parseAccountReference(req.params.accountReference);
  if (!accountReference) return res.status(400).json({ error: 'Valid account reference is required' });
  if (
    req.user.accountSource === accountReference.accountSource
    && Number(req.user.sub) === accountReference.id
  ) {
    return res.status(400).json({ error: 'You cannot delete your own account' });
  }

  const pool = await applicationPoolPromise;
  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
    const user = await findAccountById(
      transaction,
      accountReference.accountSource,
      accountReference.id,
    );
    if (!user) throw createHttpError(404, 'User not found');

    if (accountReference.accountSource === 'patron') {
      const references = await new sql.Request(transaction)
        .input('patronId', sql.Int, accountReference.id)
        .input('customerId', sql.Int, user.customerId)
        .input('email', sql.NVarChar(255), user.email)
        .query(`
          SELECT COUNT(*) AS orderReferences
          FROM dbo.Orders orders
          JOIN dbo.[TO] customer ON customer.customerID = orders.customer
          WHERE customer.PatronId = @patronId
             OR customer.customerID = @customerId
             OR (
               customer.PatronId IS NULL
               AND LOWER(customer.Email) = LOWER(@email)
             )
        `);
      if (Number(references.recordset[0].orderReferences) > 0) {
        throw createHttpError(409, 'Customer cannot be deleted because order history is linked to this account');
      }

      await new sql.Request(transaction)
        .input('patronId', sql.Int, accountReference.id)
        .input('customerId', sql.Int, user.customerId)
        .input('email', sql.NVarChar(255), user.email)
        .query(`
          DELETE FROM dbo.[TO]
          WHERE PatronId = @patronId
             OR customerID = @customerId
             OR (
               PatronId IS NULL
               AND LOWER(Email) = LOWER(@email)
             )
        `);
      await new sql.Request(transaction)
        .input('patronId', sql.Int, accountReference.id)
        .query('DELETE FROM dbo.Patrons WHERE UserID = @patronId');
      await transaction.commit();
      return res.json({ ok: true });
    }

    const references = await new sql.Request(transaction)
      .input('username', sql.NVarChar(50), user.username)
      .input('email', sql.NVarChar(255), user.email)
      .query(`
        SELECT
          (SELECT COUNT(*) FROM dbo.Product WHERE LastUpdatedBy = @username) AS productReferences,
          (
            SELECT COUNT(*)
            FROM dbo.Orders orders
            JOIN dbo.[TO] customer ON customer.customerID = orders.customer
            WHERE LOWER(customer.Email) = LOWER(@email)
          ) AS orderReferences
      `);

    const referenceCounts = references.recordset[0];
    if (Number(referenceCounts.productReferences) > 0) {
      throw createHttpError(409, 'User cannot be deleted because product records reference this account');
    }
    if (Number(referenceCounts.orderReferences) > 0) {
      throw createHttpError(409, 'User cannot be deleted because order history is linked to this account');
    }

    await new sql.Request(transaction)
      .input('email', sql.NVarChar(255), user.email)
      .query('DELETE FROM dbo.[TO] WHERE LOWER(Email) = LOWER(@email)');
    await new sql.Request(transaction)
      .input('userId', sql.Int, accountReference.id)
      .query('DELETE FROM dbo.[User] WHERE UserID = @userId');
    await transaction.commit();
    return res.json({ ok: true });
  } catch (error) {
    try { await transaction.rollback(); } catch { /* No active transaction. */ }
    return res.status(error.status || 500).json({ error: error.message || 'User could not be deleted' });
  }
});

app.get('/health', async (req, res) => {
  try {
    const pool = await applicationPoolPromise;
    await pool.request().query('SELECT 1 AS ok');
    return res.json({ ok: true, database: MSSQL_DB });
  } catch {
    return res.status(503).json({ ok: false, database: MSSQL_DB });
  }
});

app.listen(PORT, () => {
  console.log(`Store API server listening on :${PORT}`);
});
