import { describe, expect, it } from 'vitest';
import { summarizeTransactions } from './finance';

describe('summarizeTransactions', () => {
  it('totals posted sales, expenses and net cash flow', () => {
    const result = summarizeTransactions([
      { kind: 'sale', amount: 185000, status: 'paid' },
      { kind: 'sale', amount: 42000, status: 'pending' },
      { kind: 'expense', amount: 27500, status: 'paid' },
      { kind: 'expense', amount: 8000, status: 'pending' },
    ]);

    expect(result).toEqual({ revenue: 227000, expenses: 35500, cashFlow: 191500 });
  });

  it('returns zero totals for an empty ledger', () => {
    expect(summarizeTransactions([])).toEqual({ revenue: 0, expenses: 0, cashFlow: 0 });
  });
});
