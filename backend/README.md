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

The API is designed to work with the course-supplied StoreDB without running schema migrations. It supports Customer, Employee, and Admin workflows, preserves compatibility with existing course accounts, and keeps prototype wishlist selections in the browser.
