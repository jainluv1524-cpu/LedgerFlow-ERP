# LedgerFlow — API Contracts (v1 map)

Base: `/api/v1` (Express). JSON responses. Auth via HTTP-only session cookie + CSRF for unsafe methods. All company data requires authenticated user + authorized company context.

## Conventions

- **Success**: `{ "data": ..., "meta"?: { pagination } }`
- **Error**: `{ "error": { "code": string, "message": string, "details"?: unknown, "traceId": string } }`
- **Validation**: 400 with `details` (field errors). **Auth**: 401/403. **Not found (scoped)**: 404 without leaking cross-tenant existence.

## Modules (planned endpoints)

### Auth
- `POST /auth/register` (if enabled) / admin-invite flow
- `POST /auth/login`, `POST /auth/logout`, `POST /auth/logout-all`
- `GET /auth/me`, `GET /auth/sessions`
- `POST /auth/mfa/setup|verify|disable`
- `POST /auth/password/forgot`, `POST /auth/password/reset`

### Tenancy
- `GET/POST /companies`, `GET/PATCH /companies/:id`
- `POST /companies/:id/switch` (session context)
- `CRUD /companies/:id/branches`, `/financial-years`, `/settings`, `/users`, `/permissions`

### Accounting
- `CRUD /companies/:companyId/account-groups`, `/ledgers`
- `GET/POST /companies/:companyId/vouchers` (types: contra/payment/receipt/journal/sales/purchase/debit-note/credit-note)
- `POST /companies/:companyId/vouchers/:id/reverse` (creates reversal voucher; no destructive edit)
- `POST /companies/:companyId/vouchers/:id/cancel` (controlled, audited)
- `GET /companies/:companyId/day-book`, `/ledger/:id/entries`

### Sales / Purchases / Inventory / GST / Banking
- Resource CRUD + workflow actions (confirm/post/return) that generate balanced accounting postings atomically.
- Examples: `/sales-invoices`, `/purchase-invoices`, `/products`, `/warehouses`, `/stock-movements`, `/gst/*`, `/bank-accounts`, `/reconciliations`.

### Reports
- `GET /reports/trial-balance`, `/balance-sheet`, `/profit-loss`, `/cash-flow`, `/general-ledger`, registers, outstanding, stock, GST summary — all with `from`, `to`, `financialYearId`, `branchId` filters and export options.

### Admin
- `GET /admin/audit-logs` (read-only), `/admin/backups`, user/role management (scoped).

### Integrations (pending until configured)
- E-invoice/e-way/bank feeds: adapter interfaces + `501 Not Implemented` or feature-flagged endpoints with clear status.

## Security requirements per endpoint
- Rate limit auth endpoints; stricter limits on login/reset.
- Permission checks mapped to actions (e.g., `voucher:post`, `report:view`, `company:admin`).
- Idempotency keys for imports/payments where duplicates are risky.
