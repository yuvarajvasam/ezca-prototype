import React, { useState } from 'react';
import { Download, Zap, CheckCircle2, Clock, Eye, DollarSign, FileText, AlertCircle, Search } from 'lucide-react';

interface InvoiceRow {
  id: string;
  clientName: string;
  pan: string;
  filingId: string;
  amount: number;
  status: 'Paid' | 'Pending';
}

const mockInvoices: InvoiceRow[] = [
  { id: 'inv-1', clientName: 'Anand Mehta', pan: 'AAGPM9012F', filingId: 'FIL-2026-001', amount: 2500, status: 'Pending' },
  { id: 'inv-2', clientName: 'Priya Sharma', pan: 'BKXPS4412K', filingId: 'FIL-2026-002', amount: 4500, status: 'Paid' },
  { id: 'inv-3', clientName: 'Vikram Malhotra', pan: 'CPYVM8821L', filingId: 'FIL-2026-003', amount: 2500, status: 'Pending' },
  { id: 'inv-4', clientName: 'Kothari Enterprises', pan: 'AAACK1109E', filingId: 'FIL-2026-004', amount: 15000, status: 'Pending' },
  { id: 'inv-5', clientName: 'Sanjay Dutt', pan: 'BPSSD9912A', filingId: 'FIL-2026-005', amount: 4500, status: 'Pending' },
  { id: 'inv-6', clientName: 'Meera Patel', pan: 'CLXMP3310B', filingId: 'FIL-2026-006', amount: 15000, status: 'Paid' },
];

export const InvoicesView: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceRow[]>(mockInvoices);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRow | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending'>('All');

  const totalBilled = invoices.reduce((acc, curr) => acc + curr.amount, 0);
  const collected = invoices.filter((i) => i.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0);
  const outstanding = totalBilled - collected;
  const collectionRate = Math.round((collected / totalBilled) * 100);

  const filteredInvoices = invoices.filter((inv) => {
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch =
      (inv.clientName || '').toLowerCase().includes(q) ||
      (inv.pan || '').toLowerCase().includes(q) ||
      (inv.filingId || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleMarkPaid = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: 'Paid' } : inv))
    );
  };

  return (
    <div className="h-full flex flex-col min-h-0 space-y-4 w-full">
      
      {/* Section Header Row */}
      <div className="-mx-4 -mt-4 px-4 h-[46px] border-b border-border/70 flex items-center justify-between shrink-0 mb-4 bg-background">
        <div className="flex items-center space-x-3">
          <h1 className="text-[15px] font-semibold leading-none tracking-tight text-foreground">Invoices</h1>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => alert('PDF report exported successfully.')}
            className="bg-card hover:bg-muted text-foreground border border-border/70 h-[25px] px-2 rounded-[4px] text-[11px] font-semibold transition-colors shadow-2xs flex items-center space-x-1 cursor-pointer"
          >
            <Download className="w-3 h-3" />
            <span>Export</span>
          </button>

          <button
            onClick={() => alert('Bulk WhatsApp & SMS payment links sent to all clients with outstanding balances.')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-[25px] px-2 rounded-[4px] text-[11px] transition-colors shadow-2xs flex items-center space-x-1 cursor-pointer"
          >
            <Zap className="w-3 h-3" />
            <span>Send Links</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="shrink-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Card 1: Total billed */}
          <div className="bg-card border border-border/70 rounded-[6px] p-3 shadow-2xs space-y-0.5">
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Total Billed</p>
            <p className="text-[22px] leading-[28px] font-bold tracking-tight text-foreground">₹{totalBilled.toLocaleString('en-IN')}</p>
          </div>

          {/* Card 2: Collected */}
          <div className="bg-card border border-border/70 rounded-[6px] p-3 shadow-2xs space-y-0.5">
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Collected</p>
            <p className="text-[22px] leading-[28px] font-bold tracking-tight text-emerald-600 dark:text-emerald-400">₹{collected.toLocaleString('en-IN')}</p>
          </div>

          {/* Card 3: Outstanding */}
          <div className="bg-card border border-border/70 rounded-[6px] p-3 shadow-2xs space-y-0.5">
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Outstanding</p>
            <p className="text-[22px] leading-[28px] font-bold tracking-tight text-amber-600 dark:text-amber-400">₹{outstanding.toLocaleString('en-IN')}</p>
          </div>

          {/* Card 4: Collection rate */}
          <div className="bg-card border border-border/70 rounded-[6px] p-3 shadow-2xs space-y-0.5">
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Collection Rate</p>
            <p className="text-[22px] leading-[28px] font-bold tracking-tight text-foreground">{collectionRate}%</p>
          </div>

        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0 bg-card border border-border/70 rounded-xl p-2.5 shadow-2xs">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'Paid', 'Pending'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 h-[28px] rounded-[6px] text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              {st === 'All' ? 'All Invoices' : st}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search invoice, client, PAN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border/70 rounded-[6px] pl-8 pr-2.5 h-[28px] text-[12px] focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      {/* Invoice Data Table (6 Columns) */}
      <div className="flex-1 min-h-0 bg-card border border-border/70 rounded-[8px] shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-[13px]">
            
            <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-xs border-b border-border/60 text-[11px] text-muted-foreground font-semibold uppercase tracking-[0.05em] shadow-2xs">
              <tr>
                <th className="py-3 px-4 font-semibold">CLIENT</th>
                <th className="py-3 px-4 font-semibold">FILING</th>
                <th className="py-3 px-4 font-semibold">AMOUNT</th>
                <th className="py-3 px-4 font-semibold">STATUS</th>
                <th className="py-3 px-4 text-right font-semibold">ACTIONS</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/60">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground text-xs">
                    No invoices found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/10 transition-colors">
                  
                  {/* CLIENT */}
                  <td className="py-3 px-4 font-medium text-foreground">
                    <div className="flex flex-col">
                      <span className="font-semibold text-[13px] text-foreground">{inv.clientName}</span>
                      <span className="text-[11px] text-muted-foreground font-mono mt-0.5">{inv.pan}</span>
                    </div>
                  </td>

                  {/* FILING */}
                  <td className="py-3 px-4 font-mono text-muted-foreground font-semibold text-[12px]">
                    {inv.filingId}
                  </td>

                  {/* AMOUNT */}
                  <td className="py-3 px-4 font-bold text-[14px] text-foreground">
                    ₹{inv.amount.toLocaleString('en-IN')}
                  </td>

                  {/* STATUS */}
                  <td className="py-3 px-4">
                    {inv.status === 'Paid' ? (
                      <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-[4px] text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Paid</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-[4px] text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                        <Clock className="w-3 h-3" />
                        <span>Pending</span>
                      </span>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="px-2.5 py-1 rounded-[4px] border border-border/60 text-[11px] text-foreground hover:bg-muted font-semibold transition-colors cursor-pointer"
                    >
                      View
                    </button>

                    {inv.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => alert(`Payment link re-sent to ${inv.clientName}`)}
                          className="px-2.5 py-1 rounded-[4px] bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Collect
                        </button>

                        <button
                          onClick={() => handleMarkPaid(inv.id)}
                          className="px-2.5 py-1 rounded-[4px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Mark Paid
                        </button>
                      </>
                    )}
                  </td>

                </tr>
              ))
            )}
          </tbody>

          </table>
        </div>
      </div>



      {/* View Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/70 rounded-[8px] p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="font-semibold text-[14px] text-foreground">Invoice #{selectedInvoice.id}</h3>
                <p className="text-[12px] text-muted-foreground mt-0.5">{selectedInvoice.clientName}</p>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="p-1 rounded-[4px] text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer">
                ✕
              </button>
            </div>

            <div className="space-y-2 text-[12px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">PAN Identifier:</span>
                <span className="font-mono font-semibold text-foreground">{selectedInvoice.pan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Filing Ref:</span>
                <span className="font-mono font-semibold text-foreground">{selectedInvoice.filingId}</span>
              </div>
              <div className="flex justify-between text-[14px] font-bold pt-3 border-t border-border/60">
                <span>Amount Due:</span>
                <span className="text-primary">₹{selectedInvoice.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedInvoice(null)}
              className="w-full h-[32px] bg-primary text-primary-foreground font-semibold rounded-[6px] text-[12px] transition-colors hover:bg-primary/90 cursor-pointer shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
