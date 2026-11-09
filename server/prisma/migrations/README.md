# Prisma migrations

No initial migration is checked in yet because this environment does not have a live PostgreSQL connection.

When local Postgres is available:
```powershell
cd C:\Users\Luv\ledgerflow
pnpm --filter @ledgerflow/server prisma:migrate -- --name init
```
This will create `migrations/<timestamp>_init/migration.sql` from `prisma/schema.prisma`.

**Important:** review generated SQL before applying in shared/staging/production environments. Financial tables (vouchers, entries, audit logs) must not be destructively altered after data exists.
