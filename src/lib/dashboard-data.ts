import type { LedgerTransaction } from './finance';

export const overviewLedger: LedgerTransaction[] = [
  { kind: 'sale', amount: 2480000, status: 'paid' },
  { kind: 'expense', amount: 820000, status: 'paid' },
];

export const cashFlowByMonth = [
  { month: 'Apr', income: 280, expense: 155 },
  { month: 'May', income: 315, expense: 178 },
  { month: 'Jun', income: 290, expense: 162 },
  { month: 'Jul', income: 365, expense: 190 },
  { month: 'Aug', income: 340, expense: 205 },
  { month: 'Sep', income: 420, expense: 212 },
  { month: 'Oct', income: 388, expense: 225 },
  { month: 'Nov', income: 465, expense: 240 },
  { month: 'Dec', income: 430, expense: 218 },
  { month: 'Jan', income: 510, expense: 265 },
  { month: 'Feb', income: 472, expense: 251 },
  { month: 'Mar', income: 580, expense: 290 },
];

export type RecentTransaction = {
  id: string;
  initials: string;
  name: string;
  type: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  tone: string;
};

export const recentTransactions: RecentTransaction[] = [
  { id: 'INV-2025', initials: 'AC', name: 'Acme Corporation', type: 'Sales invoice', date: 'Today, 10:42 AM', amount: 148500, status: 'Paid', tone: 'lavender' },
  { id: 'INV-2024', initials: 'ST', name: 'Studio Terra', type: 'Sales invoice', date: 'Today, 9:18 AM', amount: 78200, status: 'Pending', tone: 'mint' },
  { id: 'EXP-0892', initials: 'OF', name: 'Orbit Freight', type: 'Purchase bill', date: 'Yesterday', amount: -32400, status: 'Paid', tone: 'peach' },
  { id: 'INV-2023', initials: 'NS', name: 'Northstar Labs', type: 'Sales invoice', date: 'Yesterday', amount: 216000, status: 'Overdue', tone: 'blue' },
  { id: 'EXP-0891', initials: 'GR', name: 'Greenleaf Supplies', type: 'Expense', date: '22 Oct 2026', amount: -18750, status: 'Paid', tone: 'rose' },
];
