# StoreDB Backend

The backend combines an Express API, MSSQL StoreDB, and the NocoDB product-data proxy.

## Start

```powershell
docker compose up -d --build
```

Expected services:

- React: `http://localhost:3000`
- Express API: `http://localhost:3001`
- NocoDB: `http://localhost:8080`
- MSSQL: `localhost:1433`

The `db` and `noco` runtime directories are ignored by Git. Use the StoreDB files supplied by the course; do not include database files in a GitHub or Canvas submission.

The Express service implements account sessions, customer registration and profile updates, order transactions, order-history reads, My Library data, safe payment-method storage, employee read-only views, and admin product/user management. Product catalogue reads continue through `/api/inft3050`.

The API does not change the supplied database structure. Customer, Employee, and Admin roles are inferred from the existing `User.isAdmin` field and the user's relationship with `TO`. Checkout writes only the original `Orders` and `ProductsInOrders` fields and updates `Stocktake.Quantity`. Wishlist selections remain a browser preference because StoreDB does not provide a wishlist table.
