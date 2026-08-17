import React, { useState } from 'react';
import { Zap, Search, MessageSquare, PhoneCall, Mail, CheckCircle2, CheckCheck, Clock, Send } from 'lucide-react';

export const RemindersView: React.FC = () => {
  const [reminders] = useState([
    { id: 'rem-1', clientName: 'Anand Mehta', phone: '+91 98765 43210', type: 'WhatsApp', message: 'Hi Anand, your Form 16 and Capital Gains document is pending for AY 2026-27 filing.', sentDate: 'May 28, 2026', status: 'Delivered' },
    { id: 'rem-2', clientName: 'Vikram Malhotra', phone: '+91 98200 88210', type: 'SMS', message: 'Reminder: Advance tax Q1 payment due by June 15, 2026. Please confirm payment.', sentDate: 'Jun 01, 2026', status: 'Read' },
    { id: 'rem-3', clientName: 'Kothari Enterprises', phone: '+91 98111 22334', type: 'WhatsApp', message: 'Dear client, your GST GSTR-1 filing document request is open.', sentDate: 'Jun 04, 2026', status: 'Delivered' },
    { id: 'rem-4', clientName: 'Priya Sharma', phone: '+91 99887 76655', type: 'Email', message: 'Your draft ITR-2 return is ready for review. Kindly confirm before filing.', sentDate: 'Jun 05, 2026', status: 'Sent' },
    { id: 'rem-5', clientName: 'Meera Patel', phone: '+91 97654 32109', type: 'WhatsApp', message: 'Reminder: Advance tax calculation has been completed. Check portal.', sentDate: 'Jun 06, 2026', status: 'Read' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<'All' | 'WhatsApp' | 'SMS' | 'Email'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Delivered' | 'Read' | 'Sent'>('All');

  const filteredReminders = reminders.filter((r) => {
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch =
      (r.clientName || '').toLowerCase().includes(q) ||
      (r.phone || '').includes(q) ||
      (r.message || '').toLowerCase().includes(q);
    const matchesChannel = channelFilter === 'All' || r.type === channelFilter;
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesChannel && matchesStatus;
  });

  return (
    <div className="h-full flex flex-col min-h-0 space-y-4 w-full">
      {/* Section Header Row */}
      <div className="-mx-4 -mt-4 px-4 h-[46px] border-b border-border/70 flex items-center justify-between shrink-0 mb-4 bg-background">
        <div className="flex items-center space-x-3">
          <h1 className="text-[15px] font-semibold leading-none tracking-tight text-foreground">Reminders</h1>
          <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-[4px] border border-border/60">
            {filteredReminders.length} Sent
          </span>
        </div>

        <button
          type="button"
          onClick={() => alert('Broadcast WhatsApp reminder sent to all pending clients.')}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-2.5 h-[28px] rounded-[5px] text-[11px] transition-colors shadow-2xs flex items-center space-x-1.5 cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 text-amber-300" />
          <span>Broadcast Reminders</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 shrink-0 bg-card border border-border/70 rounded-[10px] p-2.5 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Channel Filter Segmented Group */}
          <div className="inline-flex items-center bg-muted/60 p-1 rounded-[7px] border border-border/60 gap-0.5">
            {(['All', 'WhatsApp', 'SMS', 'Email'] as const).map((ch) => {
              const isActive = channelFilter === ch;
              return (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setChannelFilter(ch)}
                  className={`px-2.5 h-[26px] rounded-[5px] text-[11px] font-semibold transition-colors duration-150 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-background text-foreground shadow-2xs border border-border/70'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/40 border border-transparent'
                  }`}
                >
                  {ch}
                </button>
              );
            })}
          </div>

          <div className="hidden sm:block h-5 w-[1px] bg-border/80 mx-0.5" />

          {/* Status Filter Segmented Group */}
          <div className="inline-flex items-center bg-muted/60 p-1 rounded-[7px] border border-border/60 gap-0.5">
            {(['All', 'Delivered', 'Read', 'Sent'] as const).map((st) => {
              const isActive = statusFilter === st;
              const label = st === 'All' ? 'All Status' : st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 h-[26px] rounded-[5px] text-[11px] font-semibold transition-colors duration-150 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-background text-foreground shadow-2xs border border-border/70'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/40 border border-transparent'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

        </div>

        <div className="relative lg:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search reminders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border/70 rounded-[6px] pl-8 pr-2.5 h-[28px] text-[12px] focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 min-h-0 bg-card border border-border/70 rounded-[10px] shadow-2xs overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-xs border-b border-border text-muted-foreground font-semibold shadow-2xs">
              <tr>
                <th className="py-3 px-4">CLIENT</th>
                <th className="py-3 px-4">CHANNEL</th>
                <th className="py-3 px-4">MESSAGE BODY</th>
                <th className="py-3 px-4">TIMESTAMP</th>
                <th className="py-3 px-4 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredReminders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-muted-foreground text-xs">
                    No reminders found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredReminders.map((rem) => (
                  <tr key={rem.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-foreground">
                      <div>{rem.clientName}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{rem.phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-[4px] text-[11px] font-bold border ${
                        rem.type === 'WhatsApp'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : rem.type === 'SMS'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                          : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                      }`}>
                        {rem.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground max-w-xs truncate">
                      {rem.message}
                    </td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      {rem.sentDate}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-[4px] text-[11px] font-semibold border ${
                        rem.status === 'Read'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : rem.status === 'Delivered'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      }`}>
                        {rem.status === 'Read' ? (
                          <CheckCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        ) : rem.status === 'Delivered' ? (
                          <CheckCircle2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        )}
                        <span>{rem.status}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
