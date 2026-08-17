import React, { useState } from 'react';
import { AuditLog, DownloadEvent } from '../../types';
import { History, Download, Search } from 'lucide-react';

interface AuditLogsViewProps {
  auditLogs: AuditLog[];
  downloadEvents: DownloadEvent[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ auditLogs, downloadEvents }) => {
  const [activeSubTab, setActiveSubTab] = useState<'audit' | 'downloads'>('audit');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter((log) => {
    const q = (searchTerm || '').toLowerCase();
    return (
      (log.actorName || '').toLowerCase().includes(q) ||
      (log.action || '').toLowerCase().includes(q) ||
      (log.entityType || '').toLowerCase().includes(q) ||
      (log.ipAddress || '').includes(q)
    );
  });

  const filteredDownloads = downloadEvents.filter((dl) => {
    const q = (searchTerm || '').toLowerCase();
    return (
      (dl.userName || '').toLowerCase().includes(q) ||
      (dl.documentName || '').toLowerCase().includes(q) ||
      (dl.ipAddress || '').includes(q)
    );
  });

  return (
    <div className="space-y-6 w-full pb-10">
      
      {/* Section Header Row */}
      <div className="-mx-4 -mt-4 px-4 h-[56px] border-b border-border/70 flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-[16px] font-semibold leading-[22px] tracking-tight text-foreground">Audit Trail</h1>
          <span className="text-[14px] font-normal text-muted-foreground">/ download history</span>
        </div>

        <div className="flex bg-muted/50 p-1 rounded-[6px] border border-border/60">
          <button
            id="tab-sub-audit"
            onClick={() => setActiveSubTab('audit')}
            className={`px-3 h-[28px] rounded-[4px] text-[12px] font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'audit'
                ? 'bg-background text-foreground shadow-2xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Audit Logs ({auditLogs.length})
          </button>
          <button
            id="tab-sub-downloads"
            onClick={() => setActiveSubTab('downloads')}
            className={`px-3 h-[28px] rounded-[4px] text-[12px] font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'downloads'
                ? 'bg-background text-foreground shadow-2xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Download Events ({downloadEvents.length})
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          id="input-search-audit"
          type="text"
          placeholder="Search logs by actor, action, file name or IP address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-card text-foreground text-[13px] rounded-[8px] pl-9 pr-4 h-[36px] border border-border/70 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm placeholder:text-muted-foreground/60"
        />
      </div>

      {/* Main Content Table */}
      <div className="bg-card border border-border/70 rounded-[8px] p-0 shadow-sm overflow-hidden">
        {activeSubTab === 'audit' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] border-collapse">
              <thead className="bg-muted/30">
                <tr className="border-b border-border/60 text-muted-foreground uppercase text-[11px] font-semibold tracking-[0.05em]">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor & Role</th>
                  <th className="py-3 px-4">Action Event</th>
                  <th className="py-3 px-4">Entity Type & ID</th>
                  <th className="py-3 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-foreground">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                    <td className="py-3 px-4 text-muted-foreground font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleDateString('en-IN')}{' '}
                      {new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground text-[13px]">{log.actorName}</div>
                      <span className="text-[10px] bg-muted/50 text-muted-foreground px-2 py-0.5 rounded-[4px] border border-border/60 font-semibold uppercase tracking-wider inline-block mt-1">
                        {log.actorType}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] font-semibold text-foreground bg-muted/30 px-2 py-0.5 rounded-[4px] border border-border/60">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-muted-foreground text-[11px]">
                      <div className="font-semibold text-foreground">{log.entityType}</div>
                      <div className="font-mono text-[10px] text-muted-foreground mt-0.5">{log.entityId}</div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] border-collapse">
              <thead className="bg-muted/30">
                <tr className="border-b border-border/60 text-muted-foreground uppercase text-[11px] font-semibold tracking-[0.05em]">
                  <th className="py-3 px-4">Download Time</th>
                  <th className="py-3 px-4">Client / User</th>
                  <th className="py-3 px-4">Document Downloaded</th>
                  <th className="py-3 px-4">User Agent & IP</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-foreground">
                {filteredDownloads.map((dl) => (
                  <tr key={dl.id} className="hover:bg-muted/10 transition-colors">
                    <td className="py-3 px-4 text-muted-foreground font-mono text-[11px]">
                      {new Date(dl.timestamp).toLocaleDateString('en-IN')}{' '}
                      {new Date(dl.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="py-3 px-4 font-semibold text-foreground text-[13px]">{dl.userName}</td>

                    <td className="py-3 px-4 font-semibold text-foreground">
                      <div className="flex items-center space-x-2">
                        <Download className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[13px]">{dl.documentName}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-muted-foreground text-[11px]">
                      <div className="font-mono">{dl.ipAddress}</div>
                      <div className="text-[10px] text-muted-foreground/70 truncate max-w-xs mt-0.5">{dl.userAgent}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-[4px] text-[10px] font-semibold tracking-wider uppercase">
                        Verified Token
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

