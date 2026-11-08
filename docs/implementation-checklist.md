# LedgerFlow — Implementation Checklist

## Phase 1 — Architecture (complete)
- [x] Requirements analysis & existing repo assessment
- [x] System architecture, modules, data flow
- [x] Database design principles, ERD sketch, entity inventory
- [x] API contract map (v1)
- [x] Target folder structure & transitional plan
- [x] Security architecture & threat model baseline
- [x] Architectural risks documented

## Phase 2 — Foundation (in progress)
- [x] Preserve existing Next.js frontend slice (root) — runnable
- [x] `pnpm-workspace.yaml` includes `server`
- [x] `docker-compose.yml` for PostgreSQL + Redis (Docker not available in this agent env; config ready)
- [x] `.env.example` / `server/.env.example` templates
- [x] `server/` Express + TypeScript scaffold (Helmet, CORS, rate limit, cookies, structured errors)
- [x] Prisma schema foundation (identity/tenancy/accounting primitives) — `server/prisma/schema.prisma`
- [x] Lazy/dynamic Prisma client loading (server boots for DB-independent routes when client not generated)
- [x] Redis config module (`server/src/lib/redis.ts`, wiring pending)
- [x] Auth foundation (Argon2id hash/verify, session tokens SHA-256 hashed in DB, HTTP-only cookie): `POST /api/v1/auth/register|login|logout`, `GET /api/v1/auth/me` (requires `DATABASE_URL` + migrated DB)
- [x] Tenant context middleware skeleton (`x-company-id`; **membership verification TODO**)
- [x] OpenAPI stub: `GET /api/v1/openapi.json`
- [x] Server tests passing without DB (6 tests): health/base/404, crypto, Argon2id
- [ ] Run `docker compose up -d` and `pnpm --filter @ledgerflow/server prisma:migrate` (initial migration)
- [ ] Verify DB connectivity via `/health` with `DATABASE_URL` set
- [ ] CSRF hardening for cookie-authenticated unsafe requests
- [ ] Company membership check in tenant middleware + integration tests
- [ ] Swagger UI (optional dep) / richer OpenAPI schemas
- [ ] Connect web app to API (authenticated flows)

## Phase 3 — Core Accounting (in progress)
- [x] Double-entry validation engine (pure, 4dp fixed-scale checks): balanced totals, min 2 entries, debit XOR credit, non-negative, non-zero (`server/src/modules/accounting/*validation*`) — **7 tests**
- [x] Reversal entry builder + invariant test (swap Dr/Cr, remains balanced) — **1 test**
- [x] Posting service (DB, atomic): server-computed totals, ledger/FY/company validation, FY open + date range guards, voucher numbering (foundation), `POSTED` status, audit log (`VOUCHER_POSTED`)
- [x] Reversal service (DB, atomic): only POSTED+not-already-reversed, generates balanced reversal, links `reversesId`, marks original `REVERSED`, audit log
- [x] Voucher get/list services (tenant-scoped)
- [x] COA foundations: account group + ledger create/list (tenant-scoped, membership-checked routes)
- [x] API routes: `POST/GET /api/v1/companies/:companyId/vouchers`, `POST .../vouchers/:id/reverse`, `GET/POST .../account-groups`, `GET/POST .../ledgers` (auth + membership check)
- [ ] Concurrency-safe voucher numbering (sequence table / advisory lock) + duplicate retry
- [ ] Draft voucher lifecycle + controlled cancellation (audited)
- [ ] Immutable-post guards on all update/delete paths (service + DB strategy)
- [ ] Opening balances, FY close, cost centre/budget wiring
- [ ] DB integration tests (migrated Postgres): posting, reversal, FY guards, membership isolation, duplicate numbers

## Phase 4–9
- [ ] Business modules (sales/purchases/inventory/banking)
- [ ] GST rules & reports (configurable, test vectors)
- [ ] Financial & operational reports (drill-down, exports)
- [ ] RBAC/MFA/audit hardening, admin panel
- [ ] Optional AI (advisory only, **no auto-post**)
- [ ] Full test suite, security/perf pass, CI/CD, deployment docs

## Quality gates (always)
- [ ] No hardcoded production financial figures; no mock-as-production persistence
- [ ] No unbalanced journal entries; decimal money only
- [ ] Posted vouchers immutable; corrections via reversals
- [ ] Tenant isolation enforced + tested
- [ ] Relevant tests pass before advancing major changes
