# LedgerFlow - Local PostgreSQL setup helper (run in an ELEVATED PowerShell if winget install requires it)
# This script provides commands; it does not bypass UAC/network policy.

Write-Host "== LedgerFlow local Postgres setup ==" -ForegroundColor Cyan
Write-Host "If winget downloads are blocked (403), download PostgreSQL 16/17 installer manually from https://www.postgresql.org/download/windows/"
Write-Host ""
Write-Host "Option A (winget, may require elevation):"
Write-Host "  winget install --id PostgreSQL.PostgreSQL.17 -e --accept-package-agreements --accept-source-agreements"
Write-Host ""
Write-Host "After install, create DB/user (adjust password/port if needed):"
Write-Host @'
  psql -U postgres -c "CREATE USER ledgerflow WITH PASSWORD 'ledgerflow_dev_password';"
  psql -U postgres -c "CREATE DATABASE ledgerflow OWNER ledgerflow;"
  psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ledgerflow TO ledgerflow;"
'@
Write-Host ""
Write-Host "Then in C:\Users\Luv\ledgerflow:"
Write-Host "  Copy-Item server\.env.example server\.env"
Write-Host "  pnpm install"
Write-Host "  pnpm --filter @ledgerflow/server prisma:generate"
Write-Host "  pnpm --filter @ledgerflow/server prisma:migrate -- --name init"
Write-Host "  pnpm --filter @ledgerflow/server dev"
Write-Host ""
Write-Host "When ready, tell the agent: 'postgres ready'"
