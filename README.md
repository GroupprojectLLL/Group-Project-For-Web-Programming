# ZeHaoShanGou Online Store

React prototype connected to the provided INFT3050 StoreDB through the backend service in `backend/auth`.

## Run the project

1. Put the course database files in `backend/db`. Database files are intentionally excluded from Git.
2. Start the backend services:

   ```powershell
   cd backend
   docker compose up -d --build
   ```

3. Start the React application in another PowerShell window:

   ```powershell
   cd ..
   npm install
   npm start
   ```

4. Open `http://localhost:3000`.

The frontend expects the API at `http://localhost:3001`. To use another address, set `REACT_APP_API_BASE_URL` in a local `.env` file.

## StoreDB integration

- Product browsing reads `Product`, `Stocktake`, `Genre`, and the subgenre tables through the protected NocoDB proxy.
- Registration creates matching authentication and customer records in `User` and `TO`.
- Login uses the supplied salted SHA-256 password format and an HTTP-only JWT cookie.
- Signed-in customers can update their name, email, phone number, and address in the existing `User` and `TO` records.
- Roles use the supplied schema: an `isAdmin` user is Admin, a non-admin user linked to `TO` is Customer, and a remaining non-admin user is Employee.
- Employee accounts are created by an Admin and have read-only access to product, inventory, and account summaries.
- Checkout writes `Orders` and `ProductsInOrders` in one transaction, validates stock, and reduces `Stocktake.Quantity`.
- Order History and My Library are generated from the authenticated customer's saved orders.
- Admin pages provide protected product and user create, update, and delete operations, including role assignment.
- Saved prototype cards keep only the last four digits, cardholder name, and expiry. CVV is never stored.
- Wishlist selections are kept in browser storage because the supplied StoreDB schema has no wishlist table.
- StoreDB has no rating or review fields, so live products do not display generated ratings or customer reviews.
- The 20% strike-through promotion is a frontend presentation rule; the current selling price still comes from `Stocktake.Price`.

The backend does not create tables or add columns. It writes only to the original course tables, so the project can run against a fresh copy of the supplied StoreDB.

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
| `/admin/users` | Admin | User CRUD and role assignment |

## Verification

```powershell
npm test -- --watchAll=false --runInBand
npm run build
```

If the product API is unavailable, public product pages fall back to the local demonstration products in `src/data.js`. Authentication, order history, admin management, and database writes do not use fake success responses.

The original `Orders` and `ProductsInOrders` tables do not contain payment time, payment status, refund status, or historical unit-price fields. The API therefore persists the course-defined order and line records only. The immediate confirmation page can display the current prototype payment details, while later order-history totals are calculated from the linked stock records.
