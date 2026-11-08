# LedgerFlow ERP

LedgerFlow is an **enterprise-grade accounting and business management platform** (in active phased development), inspired by Tally Prime / BUSY, targeting a modern, secure web stack with real double-entry accounting, GST (India), inventory, banking, and reporting.

> **Status:** Phase 1 (architecture/design) is documented; Phase 2 (foundation) has initial scaffolding (Express API + Prisma schema draft + Docker dev services). The original Next.js dashboard remains a working frontend slice with sample in-memory data until it is migrated to authenticated APIs.

## Repository layout (current + target)

- **Root (current web app):** Next.js 15, React 19, TypeScript, Tailwind, Recharts, Lucide — existing dashboard slice (preserved).
- `server/` — Express + TypeScript API foundation, Prisma schema (`server/prisma/schema.prisma`), health routes.
- `docs/` — Phase 1 architecture, database design, API contracts, security architecture, implementation checklist.
- `docker-compose.yml` — local PostgreSQL + Redis for development.
- `.env.example` (root) and `server/.env.example` — environment templates.

Target structure (see `docs/architecture/phase-1.md`): evolve toward `apps/web` + `apps/api` (or keep root web + `server/` transitional) with shared packages.

## Run the existing web slice (preserved)

```bash
pnpm install
pnpm dev
```

Open the URL printed by Next.js (usually <http://localhost:3000>).

Verification (web slice):

```bash
pnpm exec vitest run src/lib/finance.test.ts
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

## Run the API foundation (Phase 2 scaffold)

1. Start infrastructure:

```bash
docker compose up -d
```

2. Configure server environment:

```bash
copy server\.env.example server\.env
# Edit server/.env if needed (DATABASE_URL matches docker-compose defaults)
```

3. Install dependencies (workspace includes `server`):

```bash
pnpm install
```

4. Generate Prisma client and run migrations (after DB is up):

```bash
pnpm --filter @ledgerflow/server prisma:generate
pnpm --filter @ledgerflow/server prisma:migrate
```

5. Start the API:

```bash
pnpm --filter @ledgerflow/server dev
```

- Health: `GET http://localhost:4000/health`
- Base: `GET http://localhost:4000/api/v1`

6. Run API foundation tests (after `pnpm install` has installed server deps):

```bash
pnpm --filter @ledgerflow/server test
```

## What is implemented now

### Phase 1 (design artifacts)
- Architecture, module boundaries, risks: `docs/architecture/phase-1.md`
- Database schema principles + ERD sketch: `docs/database/schema-design.md`
- API contract map: `docs/api/contracts.md`
- Security architecture: `docs/security/architecture.md`
- Checklist: `docs/implementation-checklist.md`

### Phase 2 (started)
- Express app with Helmet, CORS, rate limiting, cookie parsing, structured errors, `/health`.
- Prisma foundation schema: users/sessions/MFA/reset tokens, RBAC tables, company/financial year, account groups/ledgers, vouchers+entries (decimal, balanced totals fields, posting status, reversal link), audit log.
- Docker Compose (Postgres 16, Redis 7), env templates.

### Preserved frontend slice
- Responsive dashboard with sample aggregates, chart, receivables panel, transactions table/search, in-memory invoice dialog, theme toggle.
- Tested INR formatting and dashboard aggregation (`src/lib/finance.test.ts`).

## Boundaries / not yet implemented
- No production persistence for business data in the web UI yet; dashboard/invoices remain sample/in-memory.
- No real authentication/RBAC enforcement wired end-to-end yet.
- No posted accounting engine workflows, GST calculations, inventory valuation engine, bank reconciliation, report generation, imports/exports, MFA, or AI features beyond placeholders in docs/UI.
- E-invoice/e-way/GSTR *filing* integrations are **not** operational; only design/readiness is planned.

## Next milestones (recommended)
1. Run DB migrations; implement auth (Argon2id, sessions, CSRF) and tenant/company context middleware.
2. Build the **accounting posting engine** (atomic balanced vouchers, numbering, FY guards, reversals) with invariant tests.
3. Migrate web UI to TanStack Query + API client; replace sample dashboard with scoped, real aggregates.
4. Deliver sales/purchase/inventory/GST/banking modules with posting integrations.
5. Implement report queries/exports, RBAC/MFA hardening, audit UI, backups, CI/CD.

## Safety note
This project handles financial data concepts. Do not treat demo content as accounting advice or production-ready books until modules are implemented, tested, and reviewed.
