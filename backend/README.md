# StoreDB Backend

The backend combines an Express API, MSSQL StoreDB, and the NocoDB product-data proxy.

## Start

Create the local configuration file. This file is ignored by Git:

```powershell
Copy-Item .env.example .env
```

Open `.env` and set the local StoreDB password, a long random JWT secret, and the
NocoDB personal access token. If NocoDB has not been initialised yet, first start
the database and NocoDB:

```powershell
docker compose up -d db noco
```

Open `http://localhost:8080`, create a Personal Access Token, place it in
`NOCO_API_TOKEN` in `.env`, and then start the complete backend:

```powershell
docker compose up -d --build
```

Expected services:

- React: `http://localhost:3000`
- Express API: `http://localhost:3001`
- NocoDB: `http://localhost:8080`
- MSSQL: `localhost:1433`

The `.env`, `db`, and `noco` runtime data are ignored by Git. Use the StoreDB files supplied by the course; do not include passwords, tokens, database files, or NocoDB runtime data in a GitHub or Canvas submission.

The Express service implements account sessions, customer registration and profile updates, order transactions, order-history reads, My Library data, safe payment-method storage, employee read-only views, and admin product/user management. Product catalogue reads continue through `/api/inft3050`.

The API is designed to work with the course-supplied StoreDB without running schema migrations. It supports Customer, Employee, and Admin workflows, preserves compatibility with existing course accounts, and keeps prototype wishlist selections in the browser.
