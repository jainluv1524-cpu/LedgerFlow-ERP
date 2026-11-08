export type LedgerTransaction = {
  kind: 'sale' | 'expense';
  amount: number;
  status: 'paid' | 'pending';
};

export type TransactionSummary = {
  revenue: number;
  expenses: number;
  cashFlow: number;
};

export function summarizeTransactions(
  transactions: LedgerTransaction[],
): TransactionSummary {
  const totals = transactions.reduce(
    (summary, transaction) => {
      if (transaction.kind === 'sale') summary.revenue += transaction.amount;
      if (transaction.kind === 'expense') summary.expenses += transaction.amount;
      return summary;
    },
    { revenue: 0, expenses: 0 },
  );

  return { ...totals, cashFlow: totals.revenue - totals.expenses };
}

export function formatINR(amount: number, compact = false): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    notation: compact ? 'compact' : 'standard',
  }).format(amount);
}
