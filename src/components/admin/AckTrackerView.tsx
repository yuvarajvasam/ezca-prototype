import React, { useState } from 'react';
import { Download, Search, Eye, FileText, CheckCircle2, Clock } from 'lucide-react';

interface AckTrackerViewProps {
  onPreviewDocument?: (title: string, url?: string, versions?: any[]) => void;
}

export const AckTrackerView: React.FC<AckTrackerViewProps> = ({ onPreviewDocument }) => {
  const [ackRecords] = useState([
    { id: 'ack-1', clientName: 'Anand Mehta', pan: 'AAGPM9012F', ackNo: '881920192011', filedDate: 'May 28, 2026', form: 'ITR-1', status: 'Verified' },
    { id: 'ack-2', clientName: 'Priya Sharma', pan: 'BKXPS4412K', ackNo: '772819203912', filedDate: 'May 20, 2026', form: 'ITR-2', status: 'Verified' },
    { id: 'ack-3', clientName: 'Vikram Malhotra', pan: 'CPYVM8821L', ackNo: '991029301928', filedDate: 'Jun 01, 2026', form: 'ITR-1', status: 'E-Verification Pending' },
    { id: 'ack-4', clientName: 'Kothari Enterprises', pan: 'AAACK1109E', ackNo: '110293849102', filedDate: 'Jun 03, 2026', form: 'GSTR-3B', status: 'Filed' },
    { id: 'ack-5', clientName: 'Meera Patel', pan: 'CLXMP3310B', ackNo: '339102938192', filedDate: 'May 15, 2026', form: 'ITR-3', status: 'Verified' },
    { id: 'ack-6', clientName: 'Rohit Verma', pan: 'AAAPR9912K', ackNo: '556192837190', filedDate: 'Jun 05, 2026', form: 'ITR-4', status: 'E-Verification Pending' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [formFilter, setFormFilter] = useState<'All' | 'ITR-1' | 'ITR-2' | 'ITR-3' | 'ITR-4' | 'GSTR-3B'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Verified' | 'E-Verification Pending' | 'Filed'>('All');

  const filteredAcks = ackRecords.filter((rec) => {
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch =
      (rec.clientName || '').toLowerCase().includes(q) ||
      (rec.pan || '').toLowerCase().includes(q) ||
      (rec.ackNo || '').includes(q);
    const matchesForm = formFilter === 'All' || rec.form === formFilter;
    const matchesStatus = statusFilter === 'All' || rec.status === statusFilter;
    return matchesSearch && matchesForm && matchesStatus;
  });

  const handlePreview = (rec: typeof ackRecords[0]) => {
    if (onPreviewDocument) {
      onPreviewDocument(`ITR-V Acknowledgement - ${rec.clientName} (${rec.form})`, undefined, []);
    } else {
      alert(`Downloading ITR-V Ack PDF for ${rec.ackNo}`);
    }
  };

  return (
    <div className="h-full flex flex-col min-h-0 space-y-4 w-full">
      {/* Section Header Row */}
      <div className="-mx-4 -mt-4 px-4 h-[46px] border-b border-border/70 flex items-center justify-between shrink-0 mb-4 bg-background">
        <div className="flex items-center space-x-3">
          <h1 className="text-[15px] font-semibold leading-none tracking-tight text-foreground">Acknowledgements</h1>
          <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-[4px] border border-border/60">
            {filteredAcks.length} Records
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 shrink-0 bg-card border border-border/70 rounded-[10px] p-2.5 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Form Filter Segmented Group */}
          <div className="inline-flex items-center bg-muted/60 p-1 rounded-[7px] border border-border/60 gap-0.5">
            {(['All', 'ITR-1', 'ITR-2', 'ITR-3', 'ITR-4', 'GSTR-3B'] as const).map((f) => {
              const isActive = formFilter === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormFilter(f)}
                  className={`px-2.5 h-[26px] rounded-[5px] text-[11px] font-semibold transition-colors duration-150 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-background text-foreground shadow-2xs border border-border/70'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/40 border border-transparent'
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>

          <div className="hidden sm:block h-5 w-[1px] bg-border/80 mx-0.5" />

          {/* Status Filter Segmented Group */}
          <div className="inline-flex items-center bg-muted/60 p-1 rounded-[7px] border border-border/60 gap-0.5">
            {(['All', 'Verified', 'E-Verification Pending', 'Filed'] as const).map((st) => {
              const isActive = statusFilter === st;
              const label = st === 'All' ? 'All Status' : st === 'E-Verification Pending' ? 'Pending E-Verify' : st;
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
            placeholder="Search client, PAN or Ack No..."
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
                <th className="py-3 px-4">FORM</th>
                <th className="py-3 px-4">ACK NO.</th>
                <th className="py-3 px-4">FILED DATE</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAcks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-muted-foreground text-xs">
                    No acknowledgements found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAcks.map((rec) => (
                  <tr key={rec.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-foreground">
                      <div>{rec.clientName}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{rec.pan}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-[4px] text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                        {rec.form}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-foreground font-semibold">
                      {rec.ackNo}
                    </td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      {rec.filedDate}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-[4px] text-[11px] font-semibold ${
                          rec.status === 'Verified'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center space-x-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => handlePreview(rec)}
                          className="px-2.5 py-1 rounded-[5px] bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-[11px] transition-colors cursor-pointer inline-flex items-center space-x-1 shadow-2xs"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View PDF</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => alert(`Downloading ITR-V Ack PDF for ${rec.ackNo}`)}
                          className="p-1 rounded-[5px] border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                          title="Download ITR-V PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
