# LedgerFlow — Security Architecture

## Goals
Protect confidentiality, integrity (especially financial data), and availability. Enforce tenant isolation and full auditability.

## Authentication
- **Passwords**: Argon2id (memory-hard params tuned for server; stored as encoded hash). Minimum complexity + breached-password checks can be added.
- **Sessions**: server-side session records (DB/Redis), opaque ID in HTTP-only, Secure, SameSite cookie; rotation on privilege changes; absolute/idle timeouts.
- **MFA**: TOTP devices (`MfaDevice`), recovery codes (hashed), step-up for sensitive actions (optional).
- **Account protection**: rate limiting, lockout/backoff signals, login history, suspicious-activity alerts (phased).

## Authorization
- **RBAC**: roles → permissions; users may have company-scoped roles.
- **Object scoping**: every query filtered by `company_id` (and branch/FY where applicable) derived from trusted session context.
- **Least privilege**: separate permissions for view/post/reverse/export/admin.

## Data protection
- **In transit**: TLS everywhere in deployment.
- **At rest**: rely on managed disk/DB encryption; field-level encryption for highly sensitive secrets if introduced; encrypt backups.
- **PII/financial**: minimize logging of sensitive fields; redact in logs.

## Application security controls
- Zod validation on all inputs; strict content types; file upload allowlists, size limits, AV/scanning hook.
- Prisma parameterized queries (no raw SQL concatenation).
- Helmet headers, CSP (tuned for Next/inline needs), HSTS in production.
- CSRF tokens/origin checks for cookie-based session flows.
- CORS allowlist (no wildcard with credentials in production).

## Audit & compliance posture
- **AuditLog**: append-only; records actor, company, action, entity type/id, timestamp, IP/user-agent where appropriate, before/after diffs for sensitive changes.
- **Financial immutability**: posted vouchers/entries not updated/deleted via normal paths; corrections via reversal entries.
- **Access reviews**: admin UI for sessions/roles (Phase 7).

## Operational security
- Dependency scanning in CI, secret scanning, SAST where practical.
- Separate DB credentials per environment; least-privilege DB role.
- Backup/restore drills documented (Phase 7+).

## Threat model (initial)
- **Broken access control / IDOR**: mitigate with tenant middleware + tests.
- **Session hijacking**: secure cookies, short lifetimes, revocation.
- **Injection/XSS**: validation, encoding, CSP.
- **CSRF**: token/origin defenses.
- **Financial fraud/tampering**: immutable postings, audit, approvals for sensitive ops.
- **Supply chain**: pinned/compatible deps, CI checks.
