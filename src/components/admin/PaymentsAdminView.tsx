import React, { useState } from 'react';
import { Payment, Filing } from '../../types';
import {
  CreditCard,
  DollarSign,
  CheckCircle2,
  Clock,
  Lock,
  Unlock,
  ShieldCheck,
  RefreshCw,
  Search,
} from 'lucide-react';

interface PaymentsAdminViewProps {
  payments: Payment[];
  filings: Filing[];
}

export const PaymentsAdminView: React.FC<PaymentsAdminViewProps> = ({ payments, filings }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'PENDING' | 'FAILED'>('ALL');
  const [methodFilter, setMethodFilter] = useState<'ALL' | 'UPI' | 'Card' | 'NetBanking' | 'Checkout'>('ALL');

  const totalInvoiced = filings.reduce((sum, f) => sum + f.feeAmount, 0);
  const totalCollected = payments.filter((p) => p.status === 'SUCCESS').reduce((sum, p) => sum + p.amount, 0);
  const pendingCollection = totalInvoiced - totalCollected;
  const unlockedVaults = filings.filter((f) => f.status === 'DOWNLOAD_UNLOCKED').length;

  const filteredPayments = payments.filter((p) => {
    const filing = filings.find((f) => f.id === p.filingId);
    const clientName = (filing?.clientName || p.clientId || '').toLowerCase();
    const orderId = (p.razorpayOrderId || '').toLowerCase();
    const paymentId = (p.razorpayPaymentId || '').toLowerCase();
    const fy = (filing?.financialYear || '').toLowerCase();
    const q = (searchQuery || '').toLowerCase();

    const matchesSearch =
      clientName.includes(q) ||
      orderId.includes(q) ||
      paymentId.includes(q) ||
      fy.includes(q);

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesMethod = methodFilter === 'ALL' || (p.paymentMethod && p.paymentMethod.toLowerCase().includes((methodFilter || '').toLowerCase()));

    return matchesSearch && matchesStatus && matchesMethod;
  });

  return (
    <div className="h-full flex flex-col min-h-0 space-y-4 w-full">
      
      {/* Section Header Row */}
      <div className="-mx-4 -mt-4 px-4 h-[46px] border-b border-border/70 flex items-center justify-between shrink-0 mb-4 bg-background">
        <div className="flex items-center space-x-3">
          <h1 className="text-[15px] font-semibold leading-none tracking-tight text-foreground">Payments</h1>
        </div>

        <div className="flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-[5px] text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Vault Active</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="shrink-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          
          <div className="bg-card border border-border/70 rounded-[6px] p-3 shadow-2xs space-y-0.5">
            <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">Total Invoiced</span>
            <div className="text-[22px] leading-[28px] font-bold tracking-tight text-foreground">₹{totalInvoiced.toLocaleString('en-IN')}</div>
          </div>

          <div className="bg-card border border-border/70 rounded-[6px] p-3 shadow-2xs space-y-0.5">
            <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">Collected</span>
            <div className="text-[22px] leading-[28px] font-bold tracking-tight text-emerald-600 dark:text-emerald-400">₹{totalCollected.toLocaleString('en-IN')}</div>
          </div>

          <div className="bg-card border border-border/70 rounded-[6px] p-3 shadow-2xs space-y-0.5">
            <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">Pending</span>
            <div className="text-[22px] leading-[28px] font-bold tracking-tight text-amber-600 dark:text-amber-400">₹{pendingCollection.toLocaleString('en-IN')}</div>
          </div>

          <div className="bg-card border border-border/70 rounded-[6px] p-3 shadow-2xs space-y-0.5">
            <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">Unlocked</span>
            <div className="text-[22px] leading-[28px] font-bold tracking-tight text-foreground">{unlockedVaults}</div>
          </div>

        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0 bg-card border border-border/70 rounded-xl p-2.5 shadow-2xs">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'SUCCESS', 'PENDING'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 h-[28px] rounded-[6px] text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              {st === 'ALL' ? 'All Payments' : st === 'SUCCESS' ? 'Paid / Settled' : 'Pending / Due'}
            </button>
          ))}

          <div className="h-4 w-[1px] bg-border mx-1" />

          {(['ALL', 'UPI', 'Card', 'NetBanking'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMethodFilter(m)}
              className={`px-2.5 h-[28px] rounded-[6px] text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                methodFilter === m
                  ? 'bg-muted/80 text-foreground border border-border font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              {m === 'ALL' ? 'All Methods' : m}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search order ID, client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border/70 rounded-[6px] pl-8 pr-2.5 h-[28px] text-[12px] focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      {/* Payments Ledger Table */}
      <div className="flex-1 min-h-0 bg-card border border-border rounded-xl p-4 space-y-3 flex flex-col shadow-2xs">
        <div className="flex items-center justify-between shrink-0">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center space-x-2">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>Transactions ({filteredPayments.length})</span>
          </h2>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-xs shadow-2xs">
              <tr className="border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider bg-muted/40">
                <th className="py-2.5 px-3">Order ID / Payment ID</th>
                <th className="py-2.5 px-3">Client & Filing</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-foreground">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground text-xs">
                    No transactions found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const filing = filings.find((f) => f.id === p.filingId);
                  const isSuccess = p.status === 'SUCCESS';
                  return (
                    <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-3 font-mono">
                        <div className="font-medium text-foreground">{p.razorpayOrderId}</div>
                        <div className="text-[11px] text-muted-foreground">{p.razorpayPaymentId || 'Pending'}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-medium text-foreground">{filing ? filing.clientName : p.clientId}</div>
                        <div className="text-[11px] text-muted-foreground">{filing ? filing.financialYear : 'Tax Filing'}</div>
                      </td>

                      <td className="py-3 px-3 font-semibold text-foreground">₹{p.amount.toLocaleString('en-IN')}</td>

                      <td className="py-3 px-3 text-muted-foreground">{p.paymentMethod || 'Checkout'}</td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
                            isSuccess
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {isSuccess ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          <span>{p.status}</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 text-muted-foreground">
                        {p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN') : 'Pending'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
