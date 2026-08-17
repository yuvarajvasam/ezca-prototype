import React, { useState } from 'react';
import { Filing, Client, DocumentRequirement, AuditLog } from '../../types';
import {
  Search,
  Download,
  Plus,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FolderOpen,
  CreditCard,
  Lock,
  Send,
  Eye,
  Zap,
  TrendingUp,
  FileCheck,
  X,
  Check,
  Calendar,
  Activity,
  ArrowRight,
  ChevronRight,
  User,
  BellRing,
  FileText,
  ShieldAlert,
  ArrowUpRight,
  Filter,
  MessageSquare,
  LayoutGrid,
  ListFilter,
  HelpCircle,
  Layers,
  ArrowDownToLine,
  FilePlus,
  Calculator,
} from 'lucide-react';

interface AdminDashboardViewProps {
  filings: Filing[];
  clients: Client[];
  requirements?: DocumentRequirement[];
  auditLogs?: AuditLog[];
  onSelectFiling: (filing: Filing | string) => void;
  onCreateFilingClick?: () => void;
  onCreateFiling?: (clientId: string) => void;
  onBulkRemind?: () => void;
  onBulkMarkCompleted?: () => void;
  onBulkCreateFilings?: (clientIds: string[], fee: number) => void;
  onBulkRemindMissing?: () => void;
}

interface StatutoryDeadline {
  id: string;
  title: string;
  section: string;
  dueDate: string;
  daysRemaining: number;
  category: 'ITR' | 'AUDIT' | 'ADVANCE_TAX' | 'TDS' | 'CUTOFF';
  urgency: 'CRITICAL' | 'URGENT' | 'UPCOMING' | 'NORMAL';
  description: string;
  totalFilingsTargeted: number;
  completedFilingsCount: number;
}

interface DashboardActivityItem {
  id: string;
  type: 'UPLOAD' | 'PAYMENT' | 'STATUS_CHANGE' | 'REMINDER' | 'VERIFICATION';
  title: string;
  description: string;
  clientName: string;
  filingId?: string;
  timestamp: string;
  timeAgo: string;
  actor: 'CLIENT' | 'CA_STAFF' | 'SYSTEM' | 'RAZORPAY';
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  filings,
  clients,
  requirements = [],
  auditLogs = [],
  onSelectFiling,
  onCreateFilingClick,
  onCreateFiling,
  onBulkRemind,
  onBulkMarkCompleted,
  onBulkCreateFilings,
  onBulkRemindMissing,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'pipeline'>('table');
  const [showProcessGuideModal, setShowProcessGuideModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedBulkClientIds, setSelectedBulkClientIds] = useState<string[]>([]);
  const [bulkFee, setBulkFee] = useState(2500);

  // Activity Filter State
  const [activityFilter, setActivityFilter] = useState<'ALL' | 'UPLOAD' | 'PAYMENT' | 'STATUS_CHANGE' | 'REMINDER'>('ALL');

  // Computed Metrics
  const totalFilings = filings.length;
  const pendingReview = filings.filter((f) => f.status === 'UNDER_REVIEW' || f.status === 'DOCUMENTS_SUBMITTED').length;
  const missingDocs = filings.filter((f) => f.status === 'DOCUMENTS_REQUESTED' || f.status === 'ADDITIONAL_DOCUMENTS_REQUIRED' || f.status === 'DOCUMENTS_PARTIALLY_SUBMITTED').length;
  const paymentPending = filings.filter((f) => f.status === 'PAYMENT_PENDING' || f.status === 'DOCUMENTS_READY').length;
  const completedFilings = filings.filter((f) => f.status === 'FILING_COMPLETED' || f.status === 'DOWNLOAD_UNLOCKED' || f.status === 'CLOSED').length;
  const totalRevenue = filings.filter((f) => f.paymentStatus === 'SUCCESS').reduce((sum, f) => sum + f.feeAmount, 0);

  // Statutory Deadlines Array for AY 2026–27
  const statutoryDeadlines: StatutoryDeadline[] = [
    {
      id: 'dl-1',
      title: 'Non-Audit ITR Filing Cutoff',
      section: 'Sec 139(1)',
      dueDate: 'July 31, 2026',
      daysRemaining: 12,
      category: 'ITR',
      urgency: 'CRITICAL',
      description: 'Annual Income Tax Return filing for Salaried, HUF & Non-Audit Businesses',
      totalFilingsTargeted: totalFilings || 12,
      completedFilingsCount: completedFilings || 7,
    },
    {
      id: 'dl-2',
      title: 'Q2 Advance Tax Installment (45%)',
      section: 'Sec 211',
      dueDate: 'September 15, 2026',
      daysRemaining: 56,
      category: 'ADVANCE_TAX',
      urgency: 'UPCOMING',
      description: '2nd Installment payment of advance estimated tax liability for FY 2026–27',
      totalFilingsTargeted: clients.length || 15,
      completedFilingsCount: Math.floor((clients.length || 15) * 0.6),
    },
    {
      id: 'dl-3',
      title: 'Tax Audit Report Submission',
      section: 'Sec 44AB (Form 3CD)',
      dueDate: 'September 30, 2026',
      daysRemaining: 71,
      category: 'AUDIT',
      urgency: 'UPCOMING',
      description: 'Audit Report filing for accounts required to be audited under Section 44AB',
      totalFilingsTargeted: 5,
      completedFilingsCount: 2,
    },
    {
      id: 'dl-4',
      title: 'Corporate & Audit Cases ITR',
      section: 'Sec 139(1)',
      dueDate: 'October 31, 2026',
      daysRemaining: 102,
      category: 'ITR',
      urgency: 'NORMAL',
      description: 'Filing of Income Tax Return for Companies, Partners & Audited Entities',
      totalFilingsTargeted: 6,
      completedFilingsCount: 1,
    },
    {
      id: 'dl-5',
      title: 'Belated & Revised Return Deadline',
      section: 'Sec 139(4) / 139(5)',
      dueDate: 'December 31, 2026',
      daysRemaining: 163,
      category: 'CUTOFF',
      urgency: 'NORMAL',
      description: 'Final cutoff for filing belated or revised returns for AY 2026–27',
      totalFilingsTargeted: totalFilings,
      completedFilingsCount: completedFilings,
    },
  ];

  // Derive Recent Activity Items
  const activityFeedItems: DashboardActivityItem[] = React.useMemo(() => {
    const list: DashboardActivityItem[] = [
      {
        id: 'act-1',
        type: 'UPLOAD',
        title: 'Form 16 (Part A & B) Uploaded',
        description: 'Uploaded 1.8 MB PDF document for AY 2026–27 tax computation',
        clientName: 'Anand Mehta',
        filingId: 'FIL-2026-001',
        timestamp: '10 mins ago',
        timeAgo: '10m ago',
        actor: 'CLIENT',
      },
      {
        id: 'act-2',
        type: 'PAYMENT',
        title: 'CA Service Fee Payment Received',
        description: 'Successfully received ₹3,500 via Razorpay Vault. Download unlocked.',
        clientName: 'Priya Sharma',
        filingId: 'FIL-2026-002',
        timestamp: '35 mins ago',
        timeAgo: '35m ago',
        actor: 'RAZORPAY',
      },
      {
        id: 'act-3',
        type: 'STATUS_CHANGE',
        title: 'Filing Review Completed',
        description: 'CA Admin marked ITR-1 draft as reviewed and ready for portal filing',
        clientName: 'Rahul Verma',
        filingId: 'FIL-2026-005',
        timestamp: '2 hours ago',
        timeAgo: '2h ago',
        actor: 'CA_STAFF',
      },
      {
        id: 'act-4',
        type: 'REMINDER',
        title: 'WhatsApp Document Reminder Sent',
        description: 'Dispatched automated checklist reminder to 4 pending taxpayers',
        clientName: 'Bulk Dispatch',
        timestamp: '3 hours ago',
        timeAgo: '3h ago',
        actor: 'SYSTEM',
      },
      {
        id: 'act-5',
        type: 'UPLOAD',
        title: 'Home Loan Interest Certificate',
        description: 'Uploaded housing loan deduction proof for Sec 24(b) exemption',
        clientName: 'Vikram Malhotra',
        filingId: 'FIL-2026-003',
        timestamp: 'Yesterday, 05:20 PM',
        timeAgo: 'Yesterday',
        actor: 'CLIENT',
      },
      {
        id: 'act-6',
        type: 'VERIFICATION',
        title: 'PAN & DOB Portal Verification',
        description: 'ITD ERI portal validated PAN & DOB match for Sunita Patel',
        clientName: 'Sunita Patel',
        filingId: 'FIL-2026-006',
        timestamp: 'Yesterday, 11:45 AM',
        timeAgo: 'Yesterday',
        actor: 'SYSTEM',
      },
    ];

    if (auditLogs && auditLogs.length > 0) {
      const mappedAuditLogs: DashboardActivityItem[] = auditLogs.slice(0, 5).map((log, idx) => ({
        id: `audit-${log.id || idx}`,
        type: log.action.includes('PAYMENT') ? 'PAYMENT' : log.action.includes('UPLOAD') ? 'UPLOAD' : log.action.includes('REMIND') ? 'REMINDER' : 'STATUS_CHANGE',
        title: log.action.replace(/_/g, ' '),
        description: `${log.actorName} performed ${log.action} on ${log.entityType}`,
        clientName: log.actorName || 'System User',
        timestamp: log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
        timeAgo: 'Just now',
        actor: log.actorType === 'CLIENT' ? 'CLIENT' : log.actorType === 'CA_ADMIN' ? 'CA_STAFF' : 'SYSTEM',
      }));

      return [...mappedAuditLogs, ...list];
    }

    return list;
  }, [auditLogs]);

  const filteredActivityFeed = activityFeedItems.filter((item) => {
    if (activityFilter === 'ALL') return true;
    return item.type === activityFilter;
  });

  // Filter Filings for Data Table and Pipeline
  const filteredFilings = filings.filter((f) => {
    const q = (searchTerm || '').toLowerCase();
    const matchesSearch =
      (f.id || '').toLowerCase().includes(q) ||
      (f.clientName || '').toLowerCase().includes(q) ||
      (f.panMasked || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'REVIEW') return f.status === 'UNDER_REVIEW' || f.status === 'DOCUMENTS_SUBMITTED';
    if (statusFilter === 'MISSING') return f.status === 'DOCUMENTS_REQUESTED' || f.status === 'ADDITIONAL_DOCUMENTS_REQUIRED' || f.status === 'DOCUMENTS_PARTIALLY_SUBMITTED';
    if (statusFilter === 'PAYMENT') return f.status === 'PAYMENT_PENDING' || f.status === 'DOCUMENTS_READY';
    if (statusFilter === 'COMPLETED') return f.status === 'FILING_COMPLETED' || f.status === 'DOWNLOAD_UNLOCKED' || f.status === 'CLOSED';

    return true;
  });

  // Pipeline Columns
  const pipelineStages = [
    {
      id: 'stage-1',
      title: '1. Collect Docs',
      sub: 'Waiting for client',
      filter: (f: Filing) => ['CREATED', 'DOCUMENTS_REQUESTED', 'DOCUMENTS_PARTIALLY_SUBMITTED'].includes(f.status),
      color: 'border-amber-500/40 bg-amber-500/5',
      badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    },
    {
      id: 'stage-2',
      title: '2. CA Review',
      sub: 'Verifying proofs',
      filter: (f: Filing) => ['DOCUMENTS_SUBMITTED', 'UNDER_REVIEW', 'ADDITIONAL_DOCUMENTS_REQUIRED'].includes(f.status),
      color: 'border-blue-500/40 bg-blue-500/5',
      badge: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    },
    {
      id: 'stage-3',
      title: '3. Tax Compute',
      sub: 'Calculating tax',
      filter: (f: Filing) => ['FILING_IN_PROGRESS', 'DOCUMENTS_READY'].includes(f.status),
      color: 'border-indigo-500/40 bg-indigo-500/5',
      badge: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
    },
    {
      id: 'stage-4',
      title: '4. Payment',
      sub: 'Fee settlement',
      filter: (f: Filing) => ['PAYMENT_PENDING', 'PAYMENT_COMPLETED'].includes(f.status),
      color: 'border-purple-500/40 bg-purple-500/5',
      badge: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
    },
    {
      id: 'stage-5',
      title: '5. Completed',
      sub: 'ITR-V filed',
      filter: (f: Filing) => ['DOWNLOAD_UNLOCKED', 'FILING_COMPLETED', 'CLOSED'].includes(f.status),
      color: 'border-emerald-500/40 bg-emerald-500/5',
      badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    },
  ];

  const handleBulkSelectAll = () => {
    if (selectedBulkClientIds.length === clients.length) {
      setSelectedBulkClientIds([]);
    } else {
      setSelectedBulkClientIds(clients.map((c) => c.id));
    }
  };

  const handleBulkSubmit = () => {
    if (selectedBulkClientIds.length === 0) return;
    if (onBulkCreateFilings) {
      onBulkCreateFilings(selectedBulkClientIds, bulkFee);
    } else {
      selectedBulkClientIds.forEach((cId) => {
        if (onCreateFiling) onCreateFiling(cId);
      });
    }
    setShowBulkModal(false);
    setSelectedBulkClientIds([]);
  };

  const getAvatarBg = (index: number) => {
    const colors = [
      'bg-slate-900 text-white',
      'bg-primary text-primary-foreground',
      'bg-emerald-600 text-white',
      'bg-blue-600 text-white',
      'bg-amber-600 text-white',
    ];
    return colors[index % colors.length];
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleFilingClick = (f: Filing) => {
    onSelectFiling(f);
  };

  return (
    <div className="h-full flex flex-col min-h-0 space-y-4 w-full">
      
      {/* Section Header Row */}
      <div className="-mx-4 -mt-4 px-4 h-[46px] border-b border-border/70 flex items-center justify-between shrink-0 mb-4 bg-background">
        <div className="flex items-center space-x-3">
          <h1 className="text-[15px] font-semibold leading-none tracking-tight text-foreground">Filings</h1>
          <span className="text-[11px] font-mono font-medium text-muted-foreground bg-muted/60 px-1.5 py-0.2 rounded border border-border/50 hidden sm:inline">
            AY 2026–27
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setShowProcessGuideModal(true)}
            className="bg-card hover:bg-muted text-foreground border border-border/70 h-[26px] px-2 rounded-[4px] text-[11px] font-semibold transition-colors shadow-2xs flex items-center space-x-1 cursor-pointer"
            title="View filing process guide"
          >
            <HelpCircle className="w-3 h-3 text-primary" />
            <span className="hidden sm:inline">Guide</span>
          </button>

          <button
            id="btn-bulk-operations"
            onClick={() => setShowBulkModal(true)}
            className="bg-card hover:bg-muted text-foreground border border-border/70 h-[26px] px-2 rounded-[4px] text-[11px] font-semibold transition-colors shadow-2xs flex items-center space-x-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span className="hidden sm:inline">Bulk Create</span>
          </button>

          <button
            id="btn-create-filing"
            onClick={onCreateFilingClick || (() => clients.length > 0 && onCreateFiling && onCreateFiling(clients[0].id))}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-[26px] px-2.5 rounded-[4px] text-[11px] transition-colors shadow-2xs flex items-center space-x-1 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>New Filing</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="shrink-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Card 1: Active Filings */}
          <div className="bg-card border border-border/70 rounded-[8px] p-3 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Total Filings</p>
              <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.2 rounded border border-border/40">AY 26-27</span>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-[22px] leading-tight font-bold tracking-tight text-foreground">{totalFilings}</p>
              <span className="text-[10px] text-muted-foreground font-medium">Cases in system</span>
            </div>
          </div>

          {/* Card 2: Needs Attention */}
          <div className="bg-card border border-border/70 rounded-[8px] p-3 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Needs Attention</p>
              {missingDocs > 0 ? (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {missingDocs} missing
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Docs clean
                </span>
              )}
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-[22px] leading-tight font-bold tracking-tight text-amber-600 dark:text-amber-400">{pendingReview + missingDocs}</p>
              <span className="text-[10px] text-muted-foreground font-medium">Review & Uploads</span>
            </div>
          </div>

          {/* Card 3: Fees Collected */}
          <div className="bg-card border border-border/70 rounded-[8px] p-3 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Fees Collected</p>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                {paymentPending} pending
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-[22px] leading-tight font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                ₹{(totalRevenue || 3500).toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-muted-foreground font-medium">Invoiced & settled</span>
            </div>
          </div>

          {/* Card 4: Completed */}
          <div className="bg-card border border-border/70 rounded-[8px] p-3 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Filed & Completed</p>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                {totalFilings > 0 ? Math.round((completedFilings / totalFilings) * 100) : 0}% Done
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-[22px] leading-tight font-bold tracking-tight text-foreground">{completedFilings}</p>
              <span className="text-[10px] text-muted-foreground font-medium">ITR-V Ack generated</span>
            </div>
          </div>

        </div>
      </div>

      {/* MAIN WORKSPACE: ACTIVE TAX CASES (LEFT) & DEADLINES + ACTIVITY (RIGHT) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch overflow-hidden">
        
        {/* MAIN SECTION (LEFT 8-9 COLUMNS): FILINGS ROSTER / PIPELINE */}
        <div className="lg:col-span-8 xl:col-span-9 h-full flex flex-col min-h-0 bg-card border border-border/70 rounded-[8px] overflow-hidden shadow-xs">
          
          {/* Top Bar: Section Title + View Switcher */}
          <div className="p-3.5 border-b border-border/60 flex items-center justify-between bg-muted/10 shrink-0">
            <div className="flex items-center space-x-2">
              <h2 className="text-[14px] font-semibold text-foreground">Filings List</h2>
              <span className="text-[11px] text-muted-foreground font-mono bg-muted/60 px-1.5 py-0.2 rounded border border-border/50">
                {filteredFilings.length}
              </span>
            </div>

            {/* View Switcher: Table vs Pipeline Board */}
            <div className="flex items-center space-x-1 bg-muted/60 p-0.5 rounded-[6px] border border-border/70">
              <button
                id="btn-view-table"
                onClick={() => setViewMode('table')}
                className={`h-[24px] px-2 rounded-[4px] text-[11px] font-semibold flex items-center space-x-1 transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-card text-foreground shadow-2xs border border-border/70'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ListFilter className="w-3 h-3" />
                <span>Table</span>
              </button>
              <button
                id="btn-view-pipeline"
                onClick={() => setViewMode('pipeline')}
                className={`h-[24px] px-2 rounded-[4px] text-[11px] font-semibold flex items-center space-x-1 transition-all cursor-pointer ${
                  viewMode === 'pipeline'
                    ? 'bg-card text-foreground shadow-2xs border border-border/70'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutGrid className="w-3 h-3" />
                <span>Board</span>
              </button>
            </div>
          </div>

          {/* Filter Bar Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 border-b border-border/60 shrink-0">
            
            {/* Filter Tabs (Left) */}
            <div className="flex items-center space-x-1 overflow-x-auto">
              {[
                { id: 'ALL', label: 'All', count: totalFilings },
                { id: 'REVIEW', label: 'Review', count: pendingReview },
                { id: 'MISSING', label: 'Missing', count: missingDocs },
                { id: 'PAYMENT', label: 'Unpaid', count: paymentPending },
                { id: 'COMPLETED', label: 'Completed', count: completedFilings },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`h-[28px] px-2.5 rounded-[5px] text-[11px] transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
                    statusFilter === tab.id
                      ? 'bg-muted/80 text-foreground font-semibold border border-border/70'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/40 font-medium border border-transparent'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="text-[10px] opacity-70">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Controls (Right): Search & Export */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 sm:w-[180px]">
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search client or PAN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-foreground text-[12px] rounded-[5px] pl-8 pr-3 h-[28px] border border-border focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                />
              </div>

              <button
                onClick={() => {
                  const csvContent = "data:text/csv;charset=utf-8," + 
                    "FilingID,Client,PAN,Status,Fee,Progress\n" + 
                    filings.map(f => `${f.id},"${f.clientName}",${f.panMasked},${f.status},${f.feeAmount},${f.progress}%`).join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", "filings_export.csv");
                  document.body.appendChild(link);
                  link.click();
                }}
                className="w-[28px] h-[28px] flex items-center justify-center bg-transparent hover:bg-muted rounded-[5px] text-muted-foreground hover:text-foreground border border-border transition-colors cursor-pointer shadow-2xs shrink-0"
                title="Export CSV"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* VIEW 1: DATA TABLE */}
          {viewMode === 'table' && (
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-[13px]">
                <thead className="sticky top-0 bg-card/95 backdrop-blur-xs z-10 border-b border-border/60 shadow-2xs">
                  <tr className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.04em] bg-muted/30 h-[36px]">
                    <th className="px-4 font-semibold w-[14%]">ID</th>
                    <th className="px-4 font-semibold w-[24%]">Client</th>
                    <th className="px-4 font-semibold w-[18%]">Progress</th>
                    <th className="px-4 font-semibold w-[15%]">Fee</th>
                    <th className="px-4 font-semibold w-[19%]">Status</th>
                    <th className="px-4 font-semibold w-[10%] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-foreground">
                  {filteredFilings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[13px] text-muted-foreground">
                        No tax filings match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredFilings.map((f, idx) => {
                      return (
                        <tr
                          key={f.id}
                          className="hover:bg-muted/30 transition-colors cursor-pointer group h-[54px]"
                          onClick={() => handleFilingClick(f)}
                        >
                          {/* 1. Filing Ref ID */}
                          <td className="px-4 font-mono text-muted-foreground text-[12px]">
                            {f.id}
                          </td>

                          {/* 2. Client & PAN */}
                          <td className="px-4">
                            <div className="flex items-center space-x-3">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold text-[11px] shrink-0 ${getAvatarBg(idx)}`}>
                                {getInitials(f.clientName)}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-[13px] leading-[18px] text-foreground truncate max-w-[170px]">{f.clientName}</span>
                                <span className="text-[11px] font-mono text-muted-foreground leading-[14px]">{f.panMasked} • AY {f.assessmentYear}</span>
                              </div>
                            </div>
                          </td>

                          {/* 3. Progress Bar */}
                          <td className="px-4">
                            <div className="w-[110px] space-y-1">
                              <div className="flex justify-between text-[11px] font-semibold">
                                <span className={
                                  f.progress >= 100
                                    ? 'text-emerald-500'
                                    : f.progress >= 50
                                    ? 'text-primary'
                                    : 'text-amber-500'
                                }>
                                  {f.progress}%
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded h-[4px] overflow-hidden">
                                <div
                                  className={`h-full transition-all ${
                                    f.progress >= 100
                                      ? 'bg-emerald-500'
                                      : f.progress >= 50
                                      ? 'bg-primary'
                                      : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${Math.max(f.progress, 5)}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* 4. Filing Fee */}
                          <td className="px-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-[12px] leading-[18px] text-foreground">
                                ₹{f.feeAmount.toLocaleString('en-IN')}
                              </span>
                              <span className={`text-[10px] leading-[14px] ${
                                f.paymentStatus === 'SUCCESS' ? 'text-emerald-500 font-medium' : 'text-amber-500 font-medium'
                              }`}>
                                {f.paymentStatus === 'SUCCESS' ? 'Paid & Vaulted' : 'Unpaid'}
                              </span>
                            </div>
                          </td>

                          {/* 5. Workflow Stage */}
                          <td className="px-4">
                            <TableStatusBadge status={f.status} />
                          </td>

                          {/* 6. Actions */}
                          <td className="px-4 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFilingClick(f);
                                }}
                                className="px-2 h-[26px] rounded-[5px] bg-card hover:bg-muted text-foreground border border-border/70 font-semibold text-[11px] transition-colors cursor-pointer shadow-2xs"
                              >
                                <span>Open</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* VIEW 2: 5-STAGE PIPELINE BOARD (Kanban Stage Columns) */}
          {viewMode === 'pipeline' && (
            <div className="flex-1 min-h-0 p-3 overflow-x-auto custom-scrollbar">
              <div className="grid grid-cols-5 gap-3 min-w-[900px] h-full">
                {pipelineStages.map((stage) => {
                  const stageFilings = filteredFilings.filter(stage.filter);

                  return (
                    <div
                      key={stage.id}
                      className="flex flex-col bg-muted/20 border border-border/60 rounded-[8px] overflow-hidden h-full min-h-0"
                    >
                      {/* Stage Column Header */}
                      <div className="p-2.5 border-b border-border/60 bg-muted/40 shrink-0 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-semibold text-foreground truncate">
                            {stage.title}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${stage.badge}`}>
                            {stageFilings.length}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {stage.sub}
                        </p>
                      </div>

                      {/* Stage Cards Container */}
                      <div className="p-2 space-y-2 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
                        {stageFilings.length === 0 ? (
                          <div className="py-6 text-center text-muted-foreground text-[11px] border border-dashed border-border/60 rounded-[6px]">
                            No cases in this stage
                          </div>
                        ) : (
                          stageFilings.map((f, idx) => (
                            <div
                              key={f.id}
                              onClick={() => handleFilingClick(f)}
                              className="p-3 bg-card border border-border/70 hover:border-primary/50 rounded-[6px] shadow-2xs space-y-2 cursor-pointer transition-all hover:shadow-xs group"
                            >
                              <div className="flex items-start justify-between gap-1">
                                <div className="space-y-0.5 min-w-0 flex-1">
                                  <p className="text-[12px] font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                    {f.clientName}
                                  </p>
                                  <p className="text-[10px] font-mono text-muted-foreground">
                                    {f.panMasked}
                                  </p>
                                </div>

                                <span className="text-[10px] font-mono font-bold bg-muted px-1.5 py-0.2 rounded border border-border/50 text-foreground shrink-0">
                                  {f.progress}%
                                </span>
                              </div>

                              <div className="w-full bg-muted rounded h-[3px] overflow-hidden">
                                <div
                                  className={`h-full ${
                                    f.progress >= 100 ? 'bg-emerald-500' : 'bg-primary'
                                  }`}
                                  style={{ width: `${Math.max(f.progress, 5)}%` }}
                                />
                              </div>

                              <div className="flex items-center justify-between text-[10px] pt-1 border-t border-border/40">
                                <span className="font-semibold text-muted-foreground">
                                  ₹{f.feeAmount.toLocaleString('en-IN')}
                                </span>
                                <span className={`px-1.5 py-0.2 rounded font-medium ${
                                  f.paymentStatus === 'SUCCESS' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' : 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
                                }`}>
                                  {f.paymentStatus === 'SUCCESS' ? 'Paid' : 'Unpaid'}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT SIDEBAR (3-4 COLUMNS): STATUTORY DEADLINES & RECENT ACTIVITY FEED */}
        <div className="lg:col-span-4 xl:col-span-3 h-full grid grid-cols-1 lg:grid-rows-[2fr_3fr] gap-3 min-h-0 overflow-hidden">
          
          {/* 1. STATUTORY TAX DEADLINES & COMPLIANCE */}
          <div className="bg-card border border-border/70 rounded-[8px] flex flex-col overflow-hidden shadow-xs min-h-0 h-full order-1">
            
            {/* Deadlines Section Header */}
            <div className="p-3.5 border-b border-border/70 flex items-center justify-between bg-muted/20 shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-[5px] bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h2 className="text-[13px] font-semibold text-foreground leading-tight">Deadlines</h2>
                </div>
              </div>

              <span className="text-[9px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 px-1.5 py-0.2 rounded border border-rose-500/20 uppercase tracking-wider">
                AY 2026–27
              </span>
            </div>

            {/* Deadlines Cards Container */}
            <div className="p-3 space-y-2 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
              {statutoryDeadlines.map((dl) => {
                const isCritical = dl.urgency === 'CRITICAL';
                const isUpcoming = dl.urgency === 'UPCOMING';
                const progressPct = Math.round((dl.completedFilingsCount / (dl.totalFilingsTargeted || 1)) * 100);

                return (
                  <div
                    key={dl.id}
                    className={`p-2.5 rounded-[6px] border transition-all ${
                      isCritical
                        ? 'bg-rose-500/5 border-rose-500/30 shadow-2xs'
                        : isUpcoming
                        ? 'bg-card border-border/80 hover:border-primary/40'
                        : 'bg-muted/10 border-border/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5 flex-wrap">
                          <span className="text-[12px] font-semibold text-foreground truncate">{dl.title}</span>
                          <span className="text-[9px] font-mono text-muted-foreground bg-muted px-1 py-0.1 rounded border border-border/50 shrink-0">
                            {dl.section}
                          </span>
                        </div>
                      </div>

                      {/* Countdown Pill */}
                      <div className="text-right shrink-0">
                        <div className={`inline-flex items-center space-x-1 px-1.5 py-0.2 rounded-[4px] text-[9px] font-bold uppercase border ${
                          isCritical
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 animate-pulse'
                            : isUpcoming
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                            : 'bg-muted text-muted-foreground border-border/60'
                        }`}>
                          <Clock className="w-2.5 h-2.5" />
                          <span>{dl.daysRemaining}D Left</span>
                        </div>
                      </div>
                    </div>

                    {/* Client Progress Tracker Bar */}
                    <div className="mt-2 pt-1.5 border-t border-border/40 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground truncate">Preparedness: {dl.completedFilingsCount}/{dl.totalFilingsTargeted}</span>
                        <span className="font-semibold text-foreground font-mono shrink-0">{progressPct}%</span>
                      </div>

                      <div className="w-full bg-muted rounded-full h-[3px] overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            progressPct >= 80
                              ? 'bg-emerald-500'
                              : progressPct >= 40
                              ? 'bg-primary'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.max(progressPct, 5)}%` }}
                        />
                      </div>
                    </div>

                    {/* Urgent Reminder Trigger */}
                    {isCritical && (
                      <div className="mt-1.5 pt-1.5 border-t border-rose-500/20 flex items-center justify-between text-[10px]">
                        <span className="font-semibold text-rose-600 dark:text-rose-400 flex items-center space-x-1 truncate">
                          <ShieldAlert className="w-3 h-3 shrink-0" />
                          <span className="truncate">{dl.totalFilingsTargeted - dl.completedFilingsCount} Pending</span>
                        </span>

                        <button
                          onClick={onBulkRemind || onBulkRemindMissing}
                          className="font-semibold text-primary hover:underline flex items-center space-x-0.5 cursor-pointer shrink-0 ml-1"
                        >
                          <span>Remind</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

          </div>

          {/* 2. RECENT ACTIVITY & AUDIT FEED */}
          <div className="bg-card border border-border/70 rounded-[8px] flex flex-col overflow-hidden shadow-xs min-h-0 h-full order-2">
            
            {/* Activity Section Header */}
            <div className="p-3.5 border-b border-border/70 flex flex-col gap-2.5 bg-muted/20 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="w-6 h-6 rounded-[5px] bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex items-center space-x-1.5 min-w-0">
                    <h2 className="text-[13px] font-semibold text-foreground truncate">Activity</h2>
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Filter Tabs for Activity */}
              <div className="flex items-center space-x-1 bg-muted/50 p-0.5 rounded-[5px] border border-border/60 overflow-x-auto">
                {(
                  [
                    { id: 'ALL', label: 'All' },
                    { id: 'UPLOAD', label: 'Docs' },
                    { id: 'PAYMENT', label: 'Pay' },
                    { id: 'STATUS_CHANGE', label: 'Status' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActivityFilter(tab.id as any)}
                    className={`px-2 h-[22px] rounded-[4px] text-[10px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      activityFilter === tab.id
                        ? 'bg-background text-foreground shadow-2xs border border-border/70'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Activity Feed Timeline Body */}
            <div className="p-3 divide-y divide-border/50 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
              {filteredActivityFeed.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-[11px]">
                  No recent activity found.
                </div>
              ) : (
                filteredActivityFeed.map((item) => {
                  const matchingFiling = filings.find(
                    (f) => f.id === item.filingId || f.clientName === item.clientName
                  ) || filings[0];

                  return (
                    <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between group hover:bg-muted/10 px-1 rounded-[5px] transition-colors">
                      
                      <div className="flex items-start space-x-2.5 min-w-0 flex-1 pr-2">
                        
                        {/* Activity Type Icon */}
                        <div className="mt-0.5 shrink-0">
                          {item.type === 'UPLOAD' && (
                            <div className="w-6 h-6 rounded-[5px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center">
                              <FileCheck className="w-3 h-3" />
                            </div>
                          )}
                          {item.type === 'PAYMENT' && (
                            <div className="w-6 h-6 rounded-[5px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                              <CreditCard className="w-3 h-3" />
                            </div>
                          )}
                          {item.type === 'STATUS_CHANGE' && (
                            <div className="w-6 h-6 rounded-[5px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center">
                              <Clock className="w-3 h-3" />
                            </div>
                          )}
                          {item.type === 'REMINDER' && (
                            <div className="w-6 h-6 rounded-[5px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center">
                              <Send className="w-3 h-3" />
                            </div>
                          )}
                          {item.type === 'VERIFICATION' && (
                            <div className="w-6 h-6 rounded-[5px] bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 flex items-center justify-center">
                              <ShieldCheck className="w-3 h-3" />
                            </div>
                          )}
                        </div>

                        {/* Content Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-1.5 flex-wrap">
                            <span className="text-[12px] font-semibold text-foreground truncate">{item.title}</span>
                            {item.filingId && (
                              <span className="text-[9px] font-mono bg-muted px-1 py-0.1 rounded text-muted-foreground border border-border/50 shrink-0">
                                {item.filingId}
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{item.description}</p>

                          <div className="flex items-center space-x-1.5 mt-1 text-[10px] text-muted-foreground">
                            <span className="font-medium text-foreground/80 truncate max-w-[90px]">{item.clientName}</span>
                            <span>•</span>
                            <span className="font-mono">{item.timestamp}</span>
                          </div>
                        </div>

                      </div>

                      {/* Quick Review Button */}
                      {matchingFiling && (
                        <button
                          onClick={() => onSelectFiling(matchingFiling)}
                          className="shrink-0 p-1 rounded-[4px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer opacity-70 group-hover:opacity-100 mt-0.5"
                          title="View Associated Filing"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>

      </div>

      {/* MODAL: Standard Operating Procedure (SOP) / Process Guide */}
      {showProcessGuideModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/70 rounded-[10px] max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-[6px] bg-primary/10 text-primary flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-foreground">
                    Tax Filing Process Guide
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    5-step workflow for CA and client
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowProcessGuideModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer p-1.5 rounded-[4px] hover:bg-muted/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 5 Stages Flow */}
            <div className="space-y-3">
              {[
                {
                  stage: '1',
                  title: 'Setup & Client Profile',
                  owner: 'CA Admin / Client',
                  desc: 'Initialize AY 2026–27 filing. Link PAN, DOB, residential status, and employer details.',
                  outcome: 'Filing created and document checklist sent to client.',
                },
                {
                  stage: '2',
                  title: 'Document Upload & Review',
                  owner: 'Client Upload → CA Review',
                  desc: 'Client uploads Form 16, AIS/TIS, 26AS, capital gains, and deduction proofs. CA verifies documents.',
                  outcome: 'One-click document approval or request for resubmission.',
                },
                {
                  stage: '3',
                  title: 'Tax Computation',
                  owner: 'Chartered Accountant',
                  desc: 'CA compares Old vs New Regime (Sec 115BAC), computes salary deductions, house property, and capital gains.',
                  outcome: 'Draft tax computation sheet prepared.',
                },
                {
                  stage: '4',
                  title: 'Approve & Pay',
                  owner: 'Client',
                  desc: 'Client reviews draft computation, authorizes filing, and pays the CA fee.',
                  outcome: 'Payment confirmed and receipt issued.',
                },
                {
                  stage: '5',
                  title: 'File Return & Archive ITR-V',
                  owner: 'Income Tax Portal',
                  desc: 'Final return uploaded to the Income Tax portal. Signed ITR-V saved in the client vault.',
                  outcome: 'Client downloads watermarked ITR-V & computation sheet.',
                },
              ].map((item) => (
                <div key={item.stage} className="p-3 rounded-[6px] bg-muted/20 border border-border/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[11px] font-bold flex items-center justify-center shrink-0">
                        {item.stage}
                      </span>
                      <h4 className="text-[13px] font-semibold text-foreground">{item.title}</h4>
                    </div>
                    <span className="text-[10px] font-mono bg-muted px-1.5 py-0.2 rounded text-muted-foreground border border-border/40">
                      {item.owner}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground pl-7">{item.desc}</p>
                  <p className="text-[11px] text-primary/90 font-medium pl-7">✓ Milestone: {item.outcome}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-border/60">
              <button
                onClick={() => setShowProcessGuideModal(false)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 h-[32px] rounded-[6px] text-[12px] font-semibold transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Operations Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/70 rounded-[8px] max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <h2 className="text-[15px] leading-[20px] font-semibold text-foreground flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Bulk Create Filings</span>
              </h2>
              <button onClick={() => setShowBulkModal(false)} className="text-muted-foreground hover:text-foreground cursor-pointer p-1.5 rounded-[4px] hover:bg-muted/80 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[13px] leading-[20px] text-muted-foreground">
              Select clients to create AY 2026–27 tax filings and send document checklists.
            </p>

            <div className="flex justify-between items-center bg-muted/30 p-3 rounded-[6px] text-[12px] border border-border/50">
              <span className="font-semibold text-foreground">{selectedBulkClientIds.length} of {clients.length} Selected</span>
              <button onClick={handleBulkSelectAll} className="text-primary hover:underline font-semibold cursor-pointer">
                {selectedBulkClientIds.length === clients.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-px border border-border/60 rounded-[6px] bg-background divide-y divide-border/40">
              {clients.map((c) => {
                const isSelected = selectedBulkClientIds.includes(c.id);
                return (
                  <label key={c.id} className={`flex items-center justify-between p-3 text-[12px] cursor-pointer hover:bg-muted/40 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedBulkClientIds([...selectedBulkClientIds, c.id]);
                          else setSelectedBulkClientIds(selectedBulkClientIds.filter((id) => id !== c.id));
                        }}
                        className="rounded-[4px] border-border/70 text-primary focus:ring-0 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-semibold text-foreground">{c.firstName} {c.lastName}</span>
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground">{c.pan}</span>
                  </label>
                );
              })}
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-[12px] font-semibold text-foreground">Standard Fee (₹)</label>
              <input
                type="number"
                value={bulkFee}
                onChange={(e) => setBulkFee(Number(e.target.value))}
                className="w-full bg-transparent border border-border/60 text-foreground text-[13px] rounded-[6px] px-3 h-[36px] focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-border/60">
              <button onClick={() => setShowBulkModal(false)} className="px-4 h-[34px] rounded-[6px] text-[12px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer border border-transparent hover:border-border/60">
                Cancel
              </button>
              <button
                onClick={handleBulkSubmit}
                disabled={selectedBulkClientIds.length === 0}
                className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground px-4 h-[34px] rounded-[6px] text-[12px] font-semibold transition-all cursor-pointer border border-primary/20"
              >
                Create {selectedBulkClientIds.length} Filings
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Table Status Badge Helper Component
const TableStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'FILING_COMPLETED':
    case 'DOWNLOAD_UNLOCKED':
    case 'CLOSED':
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Completed</span>
        </span>
      );
    case 'DOCUMENTS_READY':
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Ready to File</span>
        </span>
      );
    case 'UNDER_REVIEW':
    case 'DOCUMENTS_SUBMITTED':
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <Clock className="w-3.5 h-3.5" />
          <span>In Review</span>
        </span>
      );
    case 'PAYMENT_PENDING':
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
          <CreditCard className="w-3.5 h-3.5" />
          <span>Unpaid</span>
        </span>
      );
    case 'DOCUMENTS_REQUESTED':
    case 'ADDITIONAL_DOCUMENTS_REQUIRED':
    case 'DOCUMENTS_PARTIALLY_SUBMITTED':
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Missing Docs</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-muted/50 text-foreground border border-border/50">
          <span>{status.replace(/_/g, ' ')}</span>
        </span>
      );
  }
};
