import React, { useState } from 'react';
import { Plus, X, Clock, Calendar, Zap, CheckCircle2, Search } from 'lucide-react';

interface DeadlineItem {
  id: string;
  daysRemaining: string;
  title: string;
  dueDate: string;
  category: 'Income Tax' | 'GST' | 'TDS';
  status: 'Urgent' | 'Soon' | 'On track';
}

const initialDeadlines: DeadlineItem[] = [
  { id: 'dl-1', daysRemaining: '9 DAYS', title: 'GST GSTR-1 Monthly Return', dueDate: 'June 11, 2026', category: 'GST', status: 'Urgent' },
  { id: 'dl-2', daysRemaining: '18 DAYS', title: 'Advance Tax Payment - Q1', dueDate: 'June 20, 2026', category: 'Income Tax', status: 'Soon' },
  { id: 'dl-3', daysRemaining: '59 DAYS', title: 'ITR-1 & ITR-4 Individual Filings', dueDate: 'July 31, 2026', category: 'Income Tax', status: 'On track' },
  { id: 'dl-4', daysRemaining: '212 DAYS', title: 'Tax Audit Report (Form 3CA/3CB)', dueDate: 'December 31, 2026', category: 'Income Tax', status: 'On track' },
  { id: 'dl-5', daysRemaining: '25 DAYS', title: 'TDS Quarterly Return (Form 26Q)', dueDate: 'June 27, 2026', category: 'TDS', status: 'Soon' },
];

export const DeadlinesView: React.FC = () => {
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>(initialDeadlines);
  const [activeCategory, setActiveCategory] = useState<'All' | 'Income Tax' | 'GST' | 'TDS'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Income Tax' | 'GST' | 'TDS'>('Income Tax');
  const [newDueDate, setNewDueDate] = useState('');

  const filteredDeadlines = deadlines.filter((item) => {
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch =
      (item.title || '').toLowerCase().includes(q) ||
      (item.dueDate || '').toLowerCase().includes(q) ||
      (item.category || '').toLowerCase().includes(q) ||
      (item.status || '').toLowerCase().includes(q);

    const matchesCategory = activeCategory === 'All' ? true : item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDismiss = (id: string) => {
    setDeadlines((prev) => prev.filter((d) => d.id !== id));
  };

  const handleAddDeadline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDueDate) return;

    const newItem: DeadlineItem = {
      id: `dl-${Date.now()}`,
      daysRemaining: '30 DAYS',
      title: newTitle,
      dueDate: newDueDate,
      category: newCategory,
      status: 'On track',
    };

    setDeadlines([newItem, ...deadlines]);
    setShowAddModal(false);
    setNewTitle('');
    setNewDueDate('');
  };

  return (
    <div className="h-full flex flex-col min-h-0 space-y-4 w-full">
      
      {/* Section Header Row */}
      <div className="-mx-4 -mt-4 px-4 h-[46px] border-b border-border/70 flex items-center justify-between shrink-0 mb-4 bg-background">
        <div className="flex items-center space-x-3">
          <h1 className="text-[15px] font-semibold leading-none tracking-tight text-foreground">Deadlines</h1>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-2 h-[25px] rounded-[4px] text-[11px] transition-all shadow-2xs flex items-center space-x-1 cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>Add Deadline</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-xs border border-border/70 rounded-xl p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shadow-2xs shrink-0">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'Income Tax', 'GST', 'TDS'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 h-[28px] rounded-[6px] text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search compliance deadlines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border/70 rounded-[6px] pl-8 pr-2.5 h-[28px] text-[12px] focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      {/* Deadline Card Stack */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
        {filteredDeadlines.length === 0 ? (
          <div className="bg-card border border-border/70 rounded-xl p-8 text-center text-muted-foreground text-xs shadow-2xs">
            No compliance deadlines found matching your search and filter criteria.
          </div>
        ) : (
          filteredDeadlines.map((item) => {
          const isUrgent = item.status === 'Urgent';
          const isSoon = item.status === 'Soon';

          return (
            <div
              key={item.id}
              className="bg-card border border-border/70 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-primary/40"
            >
              
              {/* Left Node + Center Group */}
              <div className="flex items-center space-x-4">
                
                {/* Left Node: Square Badge Duration Value */}
                <div
                  className={`w-16 h-16 rounded-xl border flex flex-col items-center justify-center shrink-0 ${
                    isUrgent
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400'
                      : isSoon
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'
                      : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  <span className="text-sm font-extrabold tracking-tight leading-none">{item.daysRemaining.split(' ')[0]}</span>
                  <span className="text-[10px] font-bold uppercase mt-0.5 opacity-80">{item.daysRemaining.split(' ')[1]}</span>
                </div>

                {/* Center Group: Title & Due Date */}
                <div className="flex flex-col">
                  <h3 className="text-base font-semibold text-foreground tracking-tight">{item.title}</h3>
                  <div className="flex items-center space-x-1.5 text-xs text-muted-foreground mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Due Date: <strong className="text-foreground">{item.dueDate}</strong></span>
                  </div>
                </div>

              </div>

              {/* Right Node: Category Tag + Status Pill + Dismiss Icon Button */}
              <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-muted text-foreground border border-border/80">
                  {item.category}
                </span>

                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    isUrgent
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                      : isSoon
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {item.status}
                </span>

                <button
                  onClick={() => handleDismiss(item.id)}
                  className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                  title="Dismiss deadline"
                >
                  <X className="w-4 h-4" />
                </button>

              </div>

            </div>
          );
        })
      )}
    </div>

      {/* Add Deadline Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Add New Compliance Deadline</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDeadline} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Compliance Title</label>
                <input
                  type="text"
                  placeholder="e.g., GSTR-3B Return Filing"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Income Tax">Income Tax</option>
                    <option value="GST">GST</option>
                    <option value="TDS">TDS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Due Date</label>
                  <input
                    type="text"
                    placeholder="e.g., June 20, 2026"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90"
                >
                  Save Deadline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
