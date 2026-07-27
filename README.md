# ZeHaoShanGou Online Store

React prototype connected to the provided INFT3050 StoreDB through the backend service in `backend/auth`.

## Run the project

1. Put the course database files in `backend/db`. Database files are intentionally excluded from Git.
2. Create the private backend configuration and follow
   [`backend/README.md`](backend/README.md) to set the StoreDB password, JWT
   secret, and NocoDB token:

   ```powershell
   cd backend
   Copy-Item .env.example .env
   ```

3. Start the backend services:

   ```powershell
   docker compose up -d --build
   ```

4. Start the React application in another PowerShell window:

   ```powershell
   cd ..
   npm install
   npm start
   ```

5. Open `http://localhost:3000`.

The frontend expects the API at `http://localhost:3001`. To use another address, set `REACT_APP_API_BASE_URL` in a local `.env` file.

## StoreDB integration

- Product browsing loads catalogue, inventory, category, and subcategory data through the protected backend service.
- Customer registration creates a persistent StoreDB account and customer profile.
- Login uses the supplied salted SHA-256 password format and an HTTP-only JWT cookie.
- Customers sign in with email; Employee and Admin accounts can use a username or email.
- Signed-in customers can update their persisted profile and contact details.
- Customer, Employee, and Admin sessions are separated while existing course accounts remain supported.
- Employee accounts are created by an Admin and have read-only access to product, inventory, and account summaries.
- Checkout validates stock and saves an order atomically.
- Order History and My Library are generated from the authenticated customer's saved orders.
- Admin pages provide protected product and account create, update, and delete operations. Customer and staff account models remain separate.
- Saved prototype cards keep only the last four digits, cardholder name, and expiry. CVV is never stored.
- Wishlist selections are kept in browser storage for this prototype.
- Live products do not display fabricated ratings or customer reviews.
- The 20% strike-through promotion is a frontend presentation rule; the current selling price comes from the backend product data.

The backend is compatible with the StoreDB supplied by the course and does not run schema migrations.

## Main API routes

| Route | Access | Purpose |
| --- | --- | --- |
| `POST /register` | Public | Create customer account |
| `POST /login` | Public | Start authenticated session |
| `POST /logout` | Signed in | Clear session |
| `GET /me` | Signed in | Load current account |
| `PUT /me` | Signed in | Update profile details |
| `PUT /me/payment-method` | Customer | Save safe prototype card details |
| `POST /orders` | Customer | Validate stock and create order |
| `GET /orders` | Customer | Load customer order history |
| `GET /library` | Customer | Load purchased products |
| `/staff/products` | Employee or Admin | Read product and inventory records |
| `/staff/users` | Employee or Admin | Read account summaries |
| `/admin/products` | Admin | Product CRUD |
| `/admin/users` | Admin | Customer and staff account management |

## Verification

```powershell
npm test -- --watchAll=false --runInBand
npm run build
```

If the product API is unavailable, public product pages fall back to the local demonstration products in `src/data.js`. Authentication, order history, admin management, and database writes do not use fake success responses.

The immediate confirmation page can display prototype payment details, while later order history uses the information available from the supplied StoreDB.
