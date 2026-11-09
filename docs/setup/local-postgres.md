# Local PostgreSQL setup (temporary, until proper deployment setup)

LedgerFlow uses **PostgreSQL** (Prisma) and **Redis** (optional for early flows). For now, run Postgres locally.

## 1. Install PostgreSQL (Windows)
1. Download PostgreSQL 16.x from https://www.postgresql.org/download/windows/ (EDB installer).
2. Install with default port **5432**. Remember the **postgres** superuser password you set.
3. (Optional) Install pgAdmin or use `psql`.

## 2. Create database and user (psql or pgAdmin)
```sql
CREATE USER ledgerflow WITH PASSWORD 'ledgerflow_dev_password';
CREATE DATABASE ledgerflow OWNER ledgerflow;
GRANT ALL PRIVILEGES ON DATABASE ledgerflow TO ledgerflow;
```
> If you use a different password/user/db/port, update `server/.env` accordingly.

## 3. Configure LedgerFlow
```powershell
cd C:\Users\Luv\ledgerflow
Copy-Item server\.env.example server\.env
# Edit server/.env: set DATABASE_URL to your local Postgres
```

Example:
```env
DATABASE_URL="postgresql://ledgerflow:ledgerflow_dev_password@localhost:5432/ledgerflow?schema=public"
```

## 4. Install deps, generate client, migrate
```powershell
cd C:\Users\Luv\ledgerflow
pnpm install
pnpm --filter @ledgerflow/server prisma:generate
pnpm --filter @ledgerflow/server prisma:migrate -- --name init
```

## 5. Run and verify
```powershell
pnpm --filter @ledgerflow/server dev
# GET http://localhost:4000/health  -> checks.database should be "ok"
```

## 6. Smoke test (after server is running)
Register, then create group/ledger, then post a balanced voucher:
- `POST /api/v1/auth/register` `{ "email","name","password","companyName" }`
- Use session cookie + `x-company-id` (company returned on register) for accounting routes.
- `POST /api/v1/companies/:companyId/account-groups`, `/ledgers`, `/vouchers`

## Notes
- **Never commit** `server/.env`.
- Redis is configured in compose/env but not required for basic auth+posting flows yet.
- After the full project is complete, we’ll replace this with a proper deployment/setup (managed DB, secrets, migrations pipeline, backups, Nginx, CI/CD).
