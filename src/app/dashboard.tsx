'use client';

import { useMemo, useState, type FormEvent } from 'react';
import {
  Activity, ArrowRight, ArrowUpDown, ArrowUpRight, BarChart3,
  Bell, BookOpen, Boxes, CalendarDays, Check, CheckCircle2,
  ChevronDown, CircleHelp, Clock3, Command, CreditCard,
  Download, FileText, Filter, Landmark, LayoutDashboard, Menu, Moon,
  MoreHorizontal, Plus, Receipt, Search, Settings, ShieldCheck,
  Sparkles, Sun, TrendingUp, Users, Wallet, X,
} from 'lucide-react';
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { cashFlowByMonth, overviewLedger, recentTransactions, type RecentTransaction } from '@/lib/dashboard-data';
import { formatINR, summarizeTransactions } from '@/lib/finance';

const navigation = [
  { label: 'Dashboard', icon: LayoutDashboard, section: 'workspace' },
  { label: 'Accounting', icon: BookOpen, section: 'workspace' },
  { label: 'Sales', icon: FileText, section: 'workspace' },
  { label: 'Purchases', icon: Receipt, section: 'workspace' },
  { label: 'Inventory', icon: Boxes, section: 'workspace' },
  { label: 'Banking', icon: Landmark, section: 'workspace' },
  { label: 'Customers', icon: Users, section: 'manage' },
  { label: 'Reports', icon: BarChart3, section: 'manage' },
];

const metricConfig = [
  { label: 'Total revenue', value: 'revenue', icon: TrendingUp, change: '+12.8%', note: 'vs. last month', color: 'violet' },
  { label: 'Total expenses', value: 'expenses', icon: CreditCard, change: '+4.2%', note: 'vs. last month', color: 'orange' },
  { label: 'Cash flow', value: 'cashFlow', icon: Wallet, change: '+18.6%', note: 'vs. last month', color: 'green' },
] as const;

function Sidebar({ active, onSelect, mobileOpen, onClose }: {
  active: string; onSelect: (label: string) => void; mobileOpen: boolean; onClose: () => void;
}) {
  return (
    <>
      {mobileOpen && <button className="sidebar-scrim" aria-label="Close menu" onClick={onClose} />}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-row">
          <div className="brand-mark"><Activity size={19} strokeWidth={2.7} /></div>
          <span className="brand-name">ledger<span>flow</span></span>
          <button className="icon-button mobile-close" aria-label="Close menu" onClick={onClose}><X size={17} /></button>
        </div>
        <button className="company-switcher">
          <span className="company-avatar">A</span>
          <span className="company-copy"><strong>Acme Studio</strong><small>Business account</small></span>
          <ChevronDown size={15} className="muted-icon" />
        </button>
        <div className="nav-scroll">
          <div className="nav-group-label">WORKSPACE</div>
          {navigation.filter((item) => item.section === 'workspace').map((item) => {
            const Icon = item.icon;
            return <button key={item.label} onClick={() => { onSelect(item.label); onClose(); }} className={`nav-link ${active === item.label ? 'nav-active' : ''}`}><Icon size={18} /><span>{item.label}</span>{item.label === 'Sales' && <span className="nav-count">4</span>}</button>;
          })}
          <div className="nav-group-label nav-group-spaced">MANAGE</div>
          {navigation.filter((item) => item.section === 'manage').map((item) => {
            const Icon = item.icon;
            return <button key={item.label} onClick={() => { onSelect(item.label); onClose(); }} className={`nav-link ${active === item.label ? 'nav-active' : ''}`}><Icon size={18} /><span>{item.label}</span></button>;
          })}
          <div className="nav-group-label nav-group-spaced">YOUR SHORTCUTS <button aria-label="Add shortcut" className="tiny-plus"><Plus size={13} /></button></div>
          <button className="nav-link shortcut-link"><span className="shortcut-dot dot-purple" /><span>Monthly close</span></button>
          <button className="nav-link shortcut-link"><span className="shortcut-dot dot-amber" /><span>Tax planning</span></button>
          <div className="upgrade-card">
            <div className="upgrade-icon"><Sparkles size={15} /></div>
            <strong>Make more of LedgerFlow</strong>
            <p>Unlock automation and deeper insights.</p>
            <button onClick={() => onSelect('Plans & billing')}>Explore plans <ArrowRight size={13} /></button>
          </div>
        </div>
        <div className="sidebar-bottom">
          <button className="nav-link" onClick={() => onSelect('Settings')}><Settings size={18} /><span>Settings</span></button>
          <button className="nav-link" onClick={() => onSelect('Help center')}><CircleHelp size={18} /><span>Help center</span><span className="help-shortcut">?</span></button>
          <div className="profile-row"><div className="profile-avatar">JD</div><div className="profile-copy"><strong>Jordan Davis</strong><small>Owner</small></div><MoreHorizontal size={18} className="muted-icon" /></div>
        </div>
      </aside>
    </>
  );
}

function InvoiceDialog({ onClose, onSave }: { onClose: () => void; onSave: (transaction: RecentTransaction) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const customer = String(form.get('customer') || '').trim();
    const amount = Number(form.get('amount'));
    if (!customer || amount <= 0 || !Number.isFinite(amount)) return;
    onSave({
      id: `INV-${Math.floor(2000 + Math.random() * 8000)}`,
      initials: customer.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase(),
      name: customer,
      type: 'Sales invoice',
      date: 'Just now',
      amount,
      status: 'Pending',
      tone: 'lavender',
    });
  }

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="invoice-modal" role="dialog" aria-modal="true" aria-labelledby="invoice-title"><div className="modal-heading"><div><div className="modal-kicker">SALES</div><h2 id="invoice-title">Create an invoice</h2><p>Record a new sale for your business.</p></div><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={18} /></button></div><form onSubmit={submit}><label>Customer name<input name="customer" placeholder="e.g. Acme Corporation" autoFocus required /></label><div className="form-row"><label>Invoice amount<input name="amount" type="number" min="1" step="0.01" placeholder="0.00" required /></label><label>Due date<input name="dueDate" type="date" defaultValue="2026-11-24" /></label></div><label>Notes <span className="optional-label">Optional</span><textarea name="notes" placeholder="Add a note for this invoice" rows={3} /></label><div className="modal-footer"><span className="secure-note"><ShieldCheck size={14} /> Saved securely</span><div><button type="button" className="button-secondary" onClick={onClose}>Cancel</button><button type="submit" className="button-primary"><Plus size={16} /> Create invoice</button></div></div></form></section></div>;
}

export default function Dashboard() {
  const [active, setActive] = useState('Dashboard');
  const [query, setQuery] = useState('');
  const [period, setPeriod] = useState('This year');
  const [transactions, setTransactions] = useState(recentTransactions);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState('');
  const summary = summarizeTransactions(overviewLedger);
  const filteredTransactions = useMemo(() => transactions.filter((transaction) => `${transaction.id} ${transaction.name} ${transaction.type} ${transaction.status}`.toLowerCase().includes(query.toLowerCase())), [transactions, query]);

  function createInvoice(transaction: RecentTransaction) {
    setTransactions((items) => [transaction, ...items]);
    setDialogOpen(false);
    setToast('Invoice added to recent activity');
    window.setTimeout(() => setToast(''), 3200);
  }

  return <div className={`app-shell ${darkMode ? 'dark-theme' : ''}`}>
    <Sidebar active={active} onSelect={setActive} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    <main className="main-area">
      <header className="topbar">
        <button className="icon-button mobile-menu" aria-label="Open menu" onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
        <div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><strong>{active}</strong></div>
        <div className="topbar-actions">
          <div className="global-search"><Search size={16} /><input aria-label="Search transactions" placeholder="Search anything..." value={query} onChange={(event) => setQuery(event.target.value)} /><span className="search-shortcut"><Command size={12} /> K</span></div>
          <button className="icon-button theme-toggle" aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'} onClick={() => setDarkMode(!darkMode)}>{darkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
          <button className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><i /></button>
          <div className="topbar-avatar">JD</div>
        </div>
      </header>
      <div className="page-content">
        <section className="welcome-row">
          <div><div className="eyebrow"><span className="live-dot" /> BUSINESS OVERVIEW <span className="eyebrow-divider">·</span> FY 2026–27</div><h1>{active === 'Dashboard' ? 'Good morning, Jordan' : active}<span className="wave">✳</span></h1><p className="welcome-subtitle">Here&apos;s what&apos;s happening with your business today.</p></div>
          <div className="welcome-actions"><button className="button-secondary date-button"><CalendarDays size={16} /> 1 Apr 2026 – 31 Mar 2027 <ChevronDown size={15} /></button><button className="button-primary" onClick={() => setDialogOpen(true)}><Plus size={17} /> New invoice</button></div>
        </section>

        <section className="metric-grid" aria-label="Key financial metrics">
          {metricConfig.map((metric) => {
            const Icon = metric.icon;
            const value = summary[metric.value];
            return <article key={metric.label} className="metric-card"><div className="metric-top"><span>{metric.label}</span><span className={`metric-icon ${metric.color}`}><Icon size={17} /></span></div><div className="metric-value">{formatINR(value)}</div><div className="metric-bottom"><span className={`trend-chip ${metric.value === 'expenses' ? 'trend-warn' : ''}`}><ArrowUpRight size={13} />{metric.change}</span><span className="metric-period">{metric.note}</span><span className="metric-menu"><MoreHorizontal size={17} /></span></div></article>;
          })}
          <article className="metric-card receivable-card"><div className="metric-top"><span>Outstanding</span><span className="metric-icon blue"><Clock3 size={17} /></span></div><div className="metric-value">₹6,42,800</div><div className="metric-bottom"><span className="due-count"><span /> 8 invoices due</span><button className="text-link" onClick={() => setActive('Sales')}>View <ArrowUpRight size={13} /></button></div></article>
        </section>

        <section className="content-grid">
          <article className="panel cashflow-panel"><div className="panel-heading"><div><div className="panel-title-row"><h2>Cash flow</h2><span className="info-dot" title="Income and expenses by month">i</span></div><p>Money in and out over time</p></div><div className="chart-tools"><button className="chart-filter"><span className="legend-dot income-dot" /> Income</button><button className="chart-filter"><span className="legend-dot expense-dot" /> Expenses</button><select aria-label="Cash flow period" value={period} onChange={(event) => setPeriod(event.target.value)}><option>This year</option><option>Last year</option><option>Last 6 months</option></select></div></div>
            <div className="chart-summary"><strong>₹24,80,000</strong><span className="trend-chip"><ArrowUpRight size={13} /> 12.8%</span><span className="chart-summary-caption">net income this year</span></div>
            <div className="cashflow-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={period === 'Last 6 months' ? cashFlowByMonth.slice(-6) : period === 'Last year' ? cashFlowByMonth.slice(0, 12) : cashFlowByMonth} margin={{ top: 14, right: 10, left: -14, bottom: 0 }}><defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0f766e" stopOpacity={0.17} /><stop offset="100%" stopColor="#0f766e" stopOpacity={0} /></linearGradient><linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#d97706" stopOpacity={0.12} /><stop offset="100%" stopColor="#d97706" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="4 5" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} dy={9} /><YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} tickFormatter={(value: number) => `₹${value}k`} /><Tooltip formatter={(value) => [formatINR(Number(value) * 1000), '']} contentStyle={{ border: '1px solid var(--line)', borderRadius: 12, background: 'var(--panel)', color: 'var(--ink)', boxShadow: '0 8px 24px rgba(16,24,40,.08)' }} labelStyle={{ color: 'var(--muted)', marginBottom: 4 }} /><Area type="monotone" dataKey="income" name="Income" stroke="#0f766e" strokeWidth={2.5} fill="url(#incomeFill)" activeDot={{ r: 4, strokeWidth: 0 }} /><Area type="monotone" dataKey="expense" name="Expenses" stroke="#d97706" strokeWidth={2} fill="url(#expenseFill)" activeDot={{ r: 4, strokeWidth: 0 }} /></AreaChart></ResponsiveContainer></div>
          </article>
          <aside className="side-panels"><article className="panel receivables-panel"><div className="panel-heading compact-heading"><div><h2>Receivables</h2><p>Invoices awaiting payment</p></div><button className="icon-button small-icon" aria-label="Receivables options"><MoreHorizontal size={18} /></button></div><div className="receivable-total"><strong>₹6,42,800</strong><span>8 invoices</span></div><div className="progress-track"><span /></div><div className="progress-labels"><span>Collected <strong>72%</strong></span><span>₹16.8L of ₹23.4L</span></div><div className="receivable-footer"><span className="due-alert"><Clock3 size={14} /> 3 overdue</span><button className="text-link" onClick={() => setActive('Sales')}>View invoices <ArrowRight size={14} /></button></div></article>
            <article className="insight-card"><div className="insight-orb"><Sparkles size={18} /></div><div className="insight-label">YOUR AI BUSINESS BRIEF</div><h3>You&apos;re having a strong month.</h3><p>Revenue is up <strong>12.8%</strong> from last month. You could save <strong>₹18,400</strong> by following up on 3 overdue invoices.</p><button onClick={() => setToast('AI insights are coming soon')}>See business insights <ArrowRight size={14} /></button><div className="insight-decoration" /></article></aside>
        </section>

        <section className="panel transactions-panel"><div className="panel-heading transaction-heading"><div><h2>Recent transactions</h2><p>Your latest business activity</p></div><div className="table-actions"><button className="table-tool" onClick={() => setQuery('')}><Filter size={15} /> Filter</button><button className="table-tool" onClick={() => setToast('Your report is ready to export')}><Download size={15} /> Export</button><button className="button-secondary view-all" onClick={() => setActive('Accounting')}>View all <ArrowRight size={14} /></button></div></div>
          <div className="table-wrap"><table><thead><tr><th><button className="sort-button">TRANSACTION <ArrowUpDown size={12} /></button></th><th>TYPE</th><th>DATE</th><th>STATUS</th><th className="amount-heading">AMOUNT</th><th><span className="sr-only">Options</span></th></tr></thead><tbody>{filteredTransactions.length ? filteredTransactions.slice(0, 5).map((transaction) => <tr key={transaction.id}><td><div className="transaction-name"><span className={`transaction-avatar ${transaction.tone}`}>{transaction.initials}</span><span><strong>{transaction.name}</strong><small>{transaction.id}</small></span></div></td><td className="type-cell">{transaction.type}</td><td className="date-cell">{transaction.date}</td><td><span className={`status-badge status-${transaction.status.toLowerCase()}`}><i />{transaction.status}</span></td><td className={`amount-cell ${transaction.amount < 0 ? 'negative-amount' : ''}`}>{transaction.amount < 0 ? '−' : ''}{formatINR(Math.abs(transaction.amount))}</td><td><button className="row-menu" aria-label={`Options for ${transaction.id}`}><MoreHorizontal size={17} /></button></td></tr>) : <tr><td colSpan={6} className="empty-state">No transactions match “{query}”.</td></tr>}</tbody></table></div>
          <div className="table-footer"><span>Showing <strong>{Math.min(filteredTransactions.length, 5)}</strong> of <strong>{transactions.length}</strong> transactions</span><div><button disabled aria-label="Previous page">‹</button><button className="page-selected">1</button><button aria-label="Next page" onClick={() => setToast('You’re viewing the latest transactions')}>›</button></div></div>
        </section>
        <footer className="page-footer"><span>© 2026 LedgerFlow, Inc.</span><div><span><CheckCircle2 size={13} /> All systems operational</span><a href="#security">Security</a><a href="#support">Support</a></div></footer>
      </div>
    </main>
    {dialogOpen && <InvoiceDialog onClose={() => setDialogOpen(false)} onSave={createInvoice} />}
    {toast && <div role="status" className="toast-message"><Check size={16} />{toast}<button aria-label="Dismiss notification" onClick={() => setToast('')}><X size={14} /></button></div>}
  </div>;
}
