import React, { useState } from 'react';
import { Filing, DocumentRequirement, Client, FilingStatus, ChatMessage } from '../../types';
import { DirectChatBox } from '../chat/DirectChatBox';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FilePlus,
  FileCheck,
  Eye,
  UploadCloud,
  AlertTriangle,
  History,
  Share2,
  Check,
  Calculator,
  MessageSquare,
  Maximize2,
  Clock,
  Send,
  CreditCard,
  Building2,
  Phone,
  Mail,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Download,
  Lock,
  Unlock,
  CheckCheck,
  UserCheck,
  Search,
  ExternalLink,
  Smartphone,
  Calendar,
  IndianRupee,
  BadgeAlert,
  FileText,
  Filter,
} from 'lucide-react';

interface FilingDetailAdminViewProps {
  filing: Filing;
  requirements: DocumentRequirement[];
  client?: Client;
  chatMessages?: ChatMessage[];
  onBack: () => void;
  onUpdateStatus: (filingId: string, status: FilingStatus) => void;
  onApproveDocument: (requirementId: string) => void;
  onRejectDocument: (requirementId: string, reason: string) => void;
  onRequestAdditionalDoc: (filingId: string, categoryId: string, name: string, description: string) => void;
  onUploadFinalDocument: (filingId: string, title: string, fileName: string) => void;
  onPreviewDocument: (title: string, url?: string, versions?: any[]) => void;
  onSendMessage?: (
    clientId: string,
    message: string,
    senderRole: 'CA_ADMIN' | 'CA_STAFF' | 'CLIENT',
    senderName: string,
    attachments?: { name: string; type: string; url?: string; size?: number }[]
  ) => void;
  onMarkChatRead?: (clientId: string, readerRole: 'CA_ADMIN' | 'CA_STAFF' | 'CLIENT') => void;
}

export const FilingDetailAdminView: React.FC<FilingDetailAdminViewProps> = ({
  filing,
  requirements,
  client,
  chatMessages = [],
  onBack,
  onUpdateStatus,
  onApproveDocument,
  onRejectDocument,
  onRequestAdditionalDoc,
  onUploadFinalDocument,
  onPreviewDocument,
  onSendMessage,
  onMarkChatRead,
}) => {
  const [activeTab, setActiveTab] = useState<'documents' | 'computation' | 'chat' | 'activity'>('documents');
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'>('ALL');
  const [docSearch, setDocSearch] = useState('');
  const [rejectingReqId, setRejectingReqId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showFullChatModal, setShowFullChatModal] = useState(false);

  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [newDocCategory, setNewDocCategory] = useState('cat-7');
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocDesc, setNewDocDesc] = useState('');

  const [showUploadFinalModal, setShowUploadFinalModal] = useState(false);
  const [finalDocTitle, setFinalDocTitle] = useState('ITR-V Acknowledgement & Computation');
  const [finalFileName, setFinalFileName] = useState('ITR_V_Acknowledgement_AY2026_27.pdf');

  const [copiedLink, setCopiedLink] = useState(false);

  const validStatuses: FilingStatus[] = [
    'CREATED',
    'DOCUMENTS_REQUESTED',
    'DOCUMENTS_PARTIALLY_SUBMITTED',
    'DOCUMENTS_SUBMITTED',
    'UNDER_REVIEW',
    'ADDITIONAL_DOCUMENTS_REQUIRED',
    'FILING_IN_PROGRESS',
    'DOCUMENTS_READY',
    'PAYMENT_PENDING',
    'PAYMENT_COMPLETED',
    'DOWNLOAD_UNLOCKED',
    'FILING_COMPLETED',
    'CLOSED',
  ];

  const handleConfirmReject = () => {
    if (!rejectingReqId) return;
    onRejectDocument(rejectingReqId, rejectReason);
    setRejectingReqId(null);
    setRejectReason('');
  };

  const handleConfirmAddReq = (e: React.FormEvent) => {
    e.preventDefault();
    onRequestAdditionalDoc(
      filing.id,
      newDocCategory,
      newDocTitle || 'Additional Tax Document',
      newDocDesc || 'Document requested by CA for tax verification'
    );
    setShowAddDocModal(false);
    setNewDocTitle('');
    setNewDocDesc('');
  };

  const handleConfirmUploadFinal = (e: React.FormEvent) => {
    e.preventDefault();
    onUploadFinalDocument(filing.id, finalDocTitle, finalFileName);
    setShowUploadFinalModal(false);
  };

  const handleCopyClientLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Safe client details resolution
  const taxpayerName = client ? `${client.firstName} ${client.lastName || ''}`.trim() : filing.clientName;
  const taxpayerPhone = client?.mobile || '+91 98765 43210';
  const taxpayerEmail = client?.email || 'taxpayer@email.com';
  const taxpayerPan = client?.pan || filing.panMasked;
  const taxpayerDob = client?.dateOfBirth || '1990-08-15';
  const taxpayerAddress = client?.address || 'Mumbai, Maharashtra, India';

  // Filter requirements based on selected tab & search
  const filteredRequirements = requirements.filter((r) => {
    const matchesFilter =
      filterTab === 'ALL'
        ? true
        : filterTab === 'PENDING'
        ? r.status === 'PENDING'
        : filterTab === 'UNDER_REVIEW'
        ? r.status === 'UNDER_REVIEW'
        : filterTab === 'APPROVED'
        ? r.status === 'APPROVED'
        : filterTab === 'REJECTED'
        ? r.status === 'REJECTED'
        : true;

    const q = (docSearch || '').toLowerCase();
    const matchesSearch =
      !docSearch ||
      (r.name || '').toLowerCase().includes(q) ||
      (r.categoryName || '').toLowerCase().includes(q) ||
      (r.currentDocument?.latestVersion?.fileName || '').toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  const pendingCount = requirements.filter((r) => r.status === 'PENDING').length;
  const reviewCount = requirements.filter((r) => r.status === 'UNDER_REVIEW').length;
  const approvedCount = requirements.filter((r) => r.status === 'APPROVED').length;
  const rejectedCount = requirements.filter((r) => r.status === 'REJECTED').length;

  const clientChatMessages = chatMessages.filter((m) => m.clientId === filing.clientId);
  const unreadMessagesCount = clientChatMessages.filter((m) => !m.read && m.senderRole === 'CLIENT').length;

  // Workflow progress milestones
  const getWorkflowStepStatus = (stepIndex: number): 'completed' | 'current' | 'upcoming' => {
    const status = filing.status;
    let currentIdx = 0;
    if (status === 'CREATED' || status === 'DOCUMENTS_REQUESTED') currentIdx = 0;
    else if (status === 'DOCUMENTS_PARTIALLY_SUBMITTED' || status === 'DOCUMENTS_SUBMITTED') currentIdx = 1;
    else if (status === 'UNDER_REVIEW' || status === 'ADDITIONAL_DOCUMENTS_REQUIRED' || status === 'FILING_IN_PROGRESS') currentIdx = 2;
    else if (status === 'DOCUMENTS_READY' || status === 'PAYMENT_PENDING') currentIdx = 3;
    else currentIdx = 4; // PAYMENT_COMPLETED, DOWNLOAD_UNLOCKED, FILING_COMPLETED, CLOSED

    if (stepIndex < currentIdx) return 'completed';
    if (stepIndex === currentIdx) return 'current';
    return 'upcoming';
  };

  // Progression timeline milestones from 'Initiated' to 'Submitted' with timestamps
  const timelineMilestones = [
    {
      id: 'INITIATED',
      stepNumber: 1,
      title: 'Initiated',
      badge: 'Case Setup',
      description: `AY ${filing.assessmentYear} dossier initialized for ${taxpayerName}`,
      timestamp: filing.createdAt
        ? new Date(filing.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '12 Aug 2026, 09:30 AM',
      status: 'completed' as const,
      icon: FileText,
    },
    {
      id: 'DOCS_REQUESTED',
      stepNumber: 2,
      title: 'Documents Requested',
      badge: `${requirements.length} Required`,
      description: `Checklist sent with ${requirements.length} compliance items`,
      timestamp: filing.createdAt
        ? new Date(new Date(filing.createdAt).getTime() + 15 * 60000).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '12 Aug 2026, 09:45 AM',
      status: filing.status === 'CREATED' ? ('current' as const) : ('completed' as const),
      icon: UploadCloud,
    },
    {
      id: 'DOCS_VERIFIED',
      stepNumber: 3,
      title: 'Documents Verified',
      badge: `${approvedCount}/${requirements.length} Approved`,
      description:
        approvedCount === requirements.length && requirements.length > 0
          ? 'Form 16, AIS/26AS & bank records verified by CA'
          : pendingCount > 0
          ? `${pendingCount} document(s) awaiting taxpayer upload`
          : `${reviewCount} document(s) under review by CA team`,
      timestamp:
        approvedCount > 0
          ? '14 Aug 2026, 02:40 PM'
          : ['CREATED', 'DOCUMENTS_REQUESTED'].includes(filing.status)
          ? 'Pending client upload'
          : 'Verification in progress',
      status:
        (approvedCount === requirements.length && requirements.length > 0) ||
        ['DOCUMENTS_READY', 'PAYMENT_PENDING', 'PAYMENT_COMPLETED', 'DOWNLOAD_UNLOCKED', 'FILING_COMPLETED', 'CLOSED'].includes(
          filing.status
        )
          ? ('completed' as const)
          : ['DOCUMENTS_PARTIALLY_SUBMITTED', 'DOCUMENTS_SUBMITTED', 'UNDER_REVIEW', 'ADDITIONAL_DOCUMENTS_REQUIRED'].includes(
              filing.status
            )
          ? ('current' as const)
          : ('upcoming' as const),
      icon: FileCheck,
    },
    {
      id: 'TAX_COMPUTATION',
      stepNumber: 4,
      title: 'Tax Computation (115BAC)',
      badge: filing.progress >= 70 ? 'Calculated' : 'In Review',
      description: 'Deductions reconciled & regime comparison finalized',
      timestamp: ['DOCUMENTS_READY', 'PAYMENT_PENDING', 'PAYMENT_COMPLETED', 'DOWNLOAD_UNLOCKED', 'FILING_COMPLETED', 'CLOSED'].includes(
        filing.status
      )
        ? '15 Aug 2026, 11:20 AM'
        : ['UNDER_REVIEW', 'FILING_IN_PROGRESS'].includes(filing.status)
        ? 'Computation in progress'
        : 'Pending document approvals',
      status: ['DOCUMENTS_READY', 'PAYMENT_PENDING', 'PAYMENT_COMPLETED', 'DOWNLOAD_UNLOCKED', 'FILING_COMPLETED', 'CLOSED'].includes(
        filing.status
      )
        ? ('completed' as const)
        : ['UNDER_REVIEW', 'FILING_IN_PROGRESS'].includes(filing.status)
        ? ('current' as const)
        : ('upcoming' as const),
      icon: Calculator,
    },
    {
      id: 'FEE_PAYMENT',
      stepNumber: 5,
      title: 'Fee Paid & Verified',
      badge: filing.paymentStatus === 'SUCCESS' ? `₹${filing.feeAmount.toLocaleString('en-IN')} Paid` : 'Pending',
      description:
        filing.paymentStatus === 'SUCCESS'
          ? `Settled & invoiced, download vault unlocked`
          : `₹${filing.feeAmount.toLocaleString('en-IN')} filing fee pending settlement`,
      timestamp: filing.paymentStatus === 'SUCCESS' ? '16 Aug 2026, 10:05 AM' : 'Awaiting payment',
      status:
        filing.paymentStatus === 'SUCCESS'
          ? ('completed' as const)
          : ['DOCUMENTS_READY', 'PAYMENT_PENDING'].includes(filing.status)
          ? ('current' as const)
          : ('upcoming' as const),
      icon: CreditCard,
    },
    {
      id: 'SUBMITTED',
      stepNumber: 6,
      title: 'Submitted to IT Portal',
      badge: ['DOWNLOAD_UNLOCKED', 'FILING_COMPLETED', 'CLOSED'].includes(filing.status) ? 'ITR-V Ack' : 'Awaiting Filing',
      description: ['DOWNLOAD_UNLOCKED', 'FILING_COMPLETED', 'CLOSED'].includes(filing.status)
        ? `ITR filed & ITR-V Ack generated for AY ${filing.assessmentYear}`
        : 'Ready for final e-filing & ARN acknowledgment',
      timestamp: ['DOWNLOAD_UNLOCKED', 'FILING_COMPLETED', 'CLOSED'].includes(filing.status)
        ? '16 Aug 2026, 01:25 PM'
        : 'Pending submission',
      status: ['DOWNLOAD_UNLOCKED', 'FILING_COMPLETED', 'CLOSED'].includes(filing.status)
        ? ('completed' as const)
        : ['PAYMENT_COMPLETED'].includes(filing.status)
        ? ('current' as const)
        : ('upcoming' as const),
      icon: CheckCheck,
    },
  ];

  const workflowSteps = [
    {
      title: 'Dossier Initialized',
      desc: 'Checklist requirements dispatched',
      status: getWorkflowStepStatus(0),
    },
    {
      title: 'Document Collection',
      desc: `${approvedCount}/${requirements.length} documents verified`,
      status: getWorkflowStepStatus(1),
    },
    {
      title: 'Tax Computation',
      desc: 'AIS/26AS & Slab calculation',
      status: getWorkflowStepStatus(2),
    },
    {
      title: 'Fee Payment',
      desc: filing.paymentStatus === 'SUCCESS' ? `Fee paid (₹${filing.feeAmount.toLocaleString('en-IN')})` : 'Payment pending from client',
      status: getWorkflowStepStatus(3),
    },
    {
      title: 'ITR-V Filing & Ack',
      desc: ['DOWNLOAD_UNLOCKED', 'FILING_COMPLETED', 'CLOSED'].includes(filing.status) ? 'Filed & e-verified' : 'ITR-V upload pending',
      status: getWorkflowStepStatus(4),
    },
  ];

  const isFilingFinished = ['DOWNLOAD_UNLOCKED', 'FILING_COMPLETED', 'CLOSED'].includes(filing.status);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="h-full flex flex-col min-h-0 space-y-4 w-full">
      {/* 1. TOP BREADCRUMB & ACTION HEADER */}
      <div className="-mx-4 -mt-4 px-4 h-[46px] border-b border-border/70 flex items-center justify-between shrink-0 mb-4 bg-background">
        <div className="flex items-center space-x-2.5 min-w-0">
          <button
            id="btn-back-to-filings"
            onClick={onBack}
            className="p-1 hover:bg-muted rounded-[4px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
            title="Back to Filings List"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2 min-w-0">
            <h1 className="text-[15px] font-semibold leading-none tracking-tight text-foreground truncate">
              {taxpayerName}
            </h1>
            <span className="text-[11px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.2 rounded border border-border/50 hidden sm:inline shrink-0">
              AY {filing.assessmentYear}
            </span>
          </div>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center space-x-1.5 shrink-0">
          {/* Status Quick Selector */}
          <div className="flex items-center space-x-1">
            <select
              id="select-filing-status"
              value={filing.status}
              onChange={(e) => onUpdateStatus(filing.id, e.target.value as FilingStatus)}
              className="bg-card border border-border/70 text-foreground font-semibold text-[11px] rounded-[4px] px-2 h-[26px] focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-2xs"
            >
              {validStatuses.map((st) => (
                <option key={st} value={st} className="bg-background text-foreground">
                  {st.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Direct Remind / Chat */}
          <button
            onClick={() => {
              setActiveTab('chat');
              if (onSendMessage) {
                onSendMessage(
                  filing.clientId,
                  `Hello ${taxpayerName}, this is a status update regarding your AY ${filing.assessmentYear} tax filing. Current status: ${filing.status.replace(/_/g, ' ')}. Please let us know if you have any questions.`,
                  'CA_ADMIN',
                  'CA Team'
                );
              }
            }}
            className="hidden sm:flex items-center space-x-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground bg-card hover:bg-muted border border-border/70 px-2 h-[26px] rounded-[4px] transition-colors cursor-pointer shadow-2xs"
            title="Message Taxpayer"
          >
            <MessageSquare className="w-3 h-3 text-primary" />
            <span>Chat</span>
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopyClientLink}
            className="hidden md:flex items-center space-x-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground bg-card hover:bg-muted border border-border/70 px-2 h-[26px] rounded-[4px] transition-colors cursor-pointer shadow-2xs"
            title="Copy client portal tracker link"
          >
            {copiedLink ? (
              <>
                <Check className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3 h-3" />
                <span>Share</span>
              </>
            )}
          </button>

          {/* Direct Request Doc */}
          <button
            id="btn-quick-request-doc"
            onClick={() => setShowAddDocModal(true)}
            className="flex items-center space-x-1 bg-card hover:bg-muted text-foreground border border-border/70 px-2 h-[26px] rounded-[4px] text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            <FilePlus className="w-3 h-3 text-primary" />
            <span className="hidden sm:inline">Request Doc</span>
          </button>

          {/* Upload Final */}
          <button
            id="btn-quick-upload-final"
            onClick={() => setShowUploadFinalModal(true)}
            className="flex items-center space-x-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-2.5 h-[26px] rounded-[4px] text-[11px] transition-colors shadow-2xs cursor-pointer"
          >
            <UploadCloud className="w-3 h-3" />
            <span className="hidden sm:inline">Upload Final</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN WORKSPACE: LEFT (USER DOSSIER & VERTICAL STATUS TIMELINE) + RIGHT (DOCUMENTS/COMPUTATION/CHAT/ACTIVITY) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch overflow-hidden">
        
        {/* LEFT SIDEBAR (USER DETAILS + VERTICAL STATUS TIMELINE VISUALIZATION) */}
        <div className="lg:col-span-4 xl:col-span-4 2xl:col-span-3 h-full flex flex-col gap-3 min-h-0 overflow-y-auto custom-scrollbar pr-0.5">
          
          {/* CARD 1: TAXPAYER & BILLING DOSSIER CARD */}
          <div className="bg-card border border-border/70 rounded-[8px] p-3.5 shadow-xs space-y-3 shrink-0">
            <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
              <div className="flex items-center space-x-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-[11px] flex items-center justify-center shrink-0 border border-primary/20">
                  {getInitials(taxpayerName)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-[13px] font-semibold text-foreground truncate">{taxpayerName}</h3>
                  <span className="text-[10px] font-mono text-muted-foreground">ID: {filing.clientId}</span>
                </div>
              </div>
              
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                filing.paymentStatus === 'SUCCESS'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
              }`}>
                {filing.paymentStatus === 'SUCCESS' ? 'Fee Paid' : 'Fee Unpaid'}
              </span>
            </div>

            {/* Taxpayer Details Grid */}
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center space-x-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Phone Number:</span>
                </span>
                <a
                  href={`tel:${taxpayerPhone}`}
                  className="font-mono font-semibold text-primary hover:underline"
                >
                  {taxpayerPhone}
                </a>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Email Address:</span>
                </span>
                <a
                  href={`mailto:${taxpayerEmail}`}
                  className="font-medium text-foreground hover:underline truncate max-w-[150px]"
                >
                  {taxpayerEmail}
                </a>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center space-x-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>PAN Number:</span>
                </span>
                <span className="font-mono font-bold text-foreground">{taxpayerPan}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Date of Birth:</span>
                </span>
                <span className="font-mono text-muted-foreground">{taxpayerDob}</span>
              </div>

              {/* Fee Section */}
              <div className="pt-2 border-t border-border/50 flex items-center justify-between bg-muted/20 p-2 rounded-[5px]">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground">Fee To Pay</span>
                  <p className="text-[14px] font-bold text-foreground font-mono">
                    ₹{filing.feeAmount.toLocaleString('en-IN')}
                  </p>
                </div>

                <div>
                  {filing.paymentStatus === 'SUCCESS' ? (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                      Paid & Invoiced
                    </span>
                  ) : (
                    <button
                      onClick={() => onUpdateStatus(filing.id, 'PAYMENT_COMPLETED')}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-2.5 py-1 rounded text-[10px] transition-colors cursor-pointer shadow-2xs"
                    >
                      Mark as Paid
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="pt-1 flex items-center justify-between text-[11px]">
              <button
                onClick={() => {
                  setActiveTab('chat');
                  if (onSendMessage) {
                    onSendMessage(
                      filing.clientId,
                      `Hello ${taxpayerName}, here is the breakdown of your tax filing fee (₹${filing.feeAmount}). Please let us know once paid.`,
                      'CA_ADMIN',
                      'CA Team'
                    );
                  }
                }}
                className="text-primary hover:underline font-semibold cursor-pointer flex items-center space-x-1"
              >
                <MessageSquare className="w-3 h-3" />
                <span>Send Invoice Ping</span>
              </button>

              <button
                onClick={handleCopyClientLink}
                className="text-muted-foreground hover:text-foreground font-semibold cursor-pointer flex items-center space-x-1"
              >
                <Share2 className="w-3 h-3" />
                <span>Portal Link</span>
              </button>
            </div>
          </div>

          {/* CARD 2: VERTICAL STATUS TIMELINE VISUALIZATION (INITIATED -> SUBMITTED) */}
          <div className="bg-card border border-border/70 rounded-[8px] flex flex-col overflow-hidden shadow-xs shrink-0">
            
            {/* Timeline Header */}
            <div className="p-3 border-b border-border/70 bg-muted/20 shrink-0 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <h2 className="text-[13px] font-semibold text-foreground">Status Timeline</h2>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    Progression
                  </span>
                  <span className="font-mono text-[11px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
                    {filing.progress}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-[4px] overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    filing.progress >= 100 ? 'bg-emerald-500' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.max(filing.progress, 10)}%` }}
                />
              </div>
            </div>

            {/* Vertical Timeline Items List */}
            <div className="p-3 space-y-0">
              {timelineMilestones.map((milestone, idx) => {
                const isCompleted = milestone.status === 'completed';
                const isCurrent = milestone.status === 'current';
                const isLast = idx === timelineMilestones.length - 1;
                const IconComponent = milestone.icon;

                return (
                  <div key={milestone.id} className="relative flex items-start group">
                    {/* Vertical Connector Line */}
                    {!isLast && (
                      <div
                        className={`absolute left-[13px] top-[26px] bottom-[-4px] w-[2px] transition-colors ${
                          isCompleted
                            ? 'bg-emerald-500'
                            : isCurrent
                            ? 'bg-primary/50'
                            : 'bg-border/60'
                        }`}
                      />
                    )}

                    {/* Node Icon Indicator */}
                    <div className="relative z-10 mr-3 shrink-0 mt-0.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] transition-all shadow-2xs ${
                          isCompleted
                            ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                            : isCurrent
                            ? 'bg-primary text-primary-foreground ring-4 ring-primary/20 animate-pulse'
                            : 'bg-muted/70 text-muted-foreground border border-border/70'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        ) : isCurrent ? (
                          <span className="w-2 h-2 rounded-full bg-white" />
                        ) : (
                          <span className="text-[10px] font-mono">{milestone.stepNumber}</span>
                        )}
                      </div>
                    </div>

                    {/* Milestone Content */}
                    <div
                      className={`flex-1 min-w-0 pb-4 transition-all ${
                        isCurrent
                          ? 'p-2 rounded-[6px] bg-primary/5 border border-primary/30 mb-2'
                          : 'pt-0.5'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <h4
                          className={`text-[12px] font-semibold truncate ${
                            isCurrent
                              ? 'text-primary'
                              : isCompleted
                              ? 'text-foreground'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {milestone.title}
                        </h4>

                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.2 rounded shrink-0 ${
                            isCompleted
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : isCurrent
                              ? 'bg-primary/10 text-primary font-bold border border-primary/30'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {milestone.badge}
                        </span>
                      </div>

                      <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                        {milestone.description}
                      </p>

                      {/* Timestamp Row */}
                      <div className="flex items-center space-x-1 text-[10px] text-muted-foreground font-mono mt-1 pt-0.5">
                        <Clock className="w-2.5 h-2.5 opacity-70 shrink-0" />
                        <span className="truncate">{milestone.timestamp}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Button Footer */}
            <div className="p-2.5 border-t border-border/60 bg-muted/20 shrink-0">
              {!isFilingFinished ? (
                <button
                  onClick={() => setShowUploadFinalModal(true)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-[28px] rounded-[5px] text-[11px] transition-colors shadow-2xs flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Final ITR-V Ack</span>
                </button>
              ) : (
                <button
                  onClick={() => onPreviewDocument('ITR-V Acknowledgement AY 2026-27', undefined, [])}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold h-[28px] rounded-[5px] text-[11px] transition-colors shadow-2xs flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Filed Acknowledgement</span>
                </button>
              )}
            </div>

          </div>

        </div>

        {/* RIGHT WORKSPACE SECTION (DOCUMENTS / COMPUTATION / CHAT / ACTIVITY) */}
        <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-9 h-full flex flex-col min-h-0 bg-card border border-border/70 rounded-[8px] overflow-hidden shadow-xs">
          
          {/* Workspace Tab Header */}
          <div className="p-2.5 px-3.5 border-b border-border/70 flex items-center justify-between bg-muted/20 shrink-0">
            <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar">
              <button
                id="tab-filing-documents"
                onClick={() => setActiveTab('documents')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-[5px] text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'documents'
                    ? 'bg-background text-foreground shadow-2xs border border-border/70'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
                }`}
              >
                <FileCheck className={`w-3.5 h-3.5 ${activeTab === 'documents' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span>Documents</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-[4px] ${
                  pendingCount > 0 ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' : 'bg-muted text-muted-foreground'
                }`}>
                  {requirements.length}
                </span>
              </button>

              <button
                id="tab-filing-computation"
                onClick={() => setActiveTab('computation')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-[5px] text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'computation'
                    ? 'bg-background text-foreground shadow-2xs border border-border/70'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
                }`}
              >
                <Calculator className={`w-3.5 h-3.5 ${activeTab === 'computation' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span>Computation</span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                  115BAC
                </span>
              </button>

              <button
                id="tab-filing-chat"
                onClick={() => setActiveTab('chat')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-[5px] text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'chat'
                    ? 'bg-background text-foreground shadow-2xs border border-border/70'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
                }`}
              >
                <MessageSquare className={`w-3.5 h-3.5 ${activeTab === 'chat' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span>Chat</span>
                {unreadMessagesCount > 0 ? (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                    {unreadMessagesCount}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-[4px] bg-muted text-muted-foreground">
                    {clientChatMessages.length}
                  </span>
                )}
              </button>

              <button
                id="tab-filing-activity"
                onClick={() => setActiveTab('activity')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-[5px] text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'activity'
                    ? 'bg-background text-foreground shadow-2xs border border-border/70'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
                }`}
              >
                <History className={`w-3.5 h-3.5 ${activeTab === 'activity' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span>Activity</span>
              </button>
            </div>

            {/* Tab Context Action */}
            <div className="flex items-center space-x-2">
              {activeTab === 'documents' && (
                <button
                  onClick={() => setShowAddDocModal(true)}
                  className="text-[11px] text-primary hover:underline font-semibold cursor-pointer flex items-center space-x-1"
                >
                  <FilePlus className="w-3 h-3" />
                  <span>Add Requirement</span>
                </button>
              )}
              {activeTab === 'computation' && (
                <button
                  onClick={() => onPreviewDocument('Tax Computation Sheet AY 2026-27', undefined, [])}
                  className="text-[11px] text-primary hover:underline font-semibold cursor-pointer flex items-center space-x-1"
                >
                  <Eye className="w-3 h-3" />
                  <span>Preview Sheet</span>
                </button>
              )}
              {activeTab === 'chat' && (
                <button
                  onClick={() => setShowFullChatModal(true)}
                  className="text-[11px] text-muted-foreground hover:text-foreground font-semibold cursor-pointer flex items-center space-x-1"
                  title="Expand Chat Modal"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Full Screen</span>
                </button>
              )}
            </div>
          </div>

          {/* TAB 1: DOCUMENTS (Scrollable Checklist / Table) */}
          {activeTab === 'documents' && (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              
              {/* Filter Sub-bar */}
              <div className="p-2.5 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0 bg-background/50">
                <div className="flex flex-wrap items-center gap-1">
                  {[
                    { id: 'ALL', label: 'All', count: requirements.length },
                    { id: 'PENDING', label: 'Pending', count: pendingCount },
                    { id: 'UNDER_REVIEW', label: 'Review', count: reviewCount },
                    { id: 'APPROVED', label: 'Approved', count: approvedCount },
                    { id: 'REJECTED', label: 'Rejected', count: rejectedCount },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setFilterTab(tab.id as any)}
                      className={`h-[26px] px-2.5 rounded-[4px] text-[11px] font-semibold transition-all cursor-pointer flex items-center space-x-1 ${
                        filterTab === tab.id
                          ? 'bg-muted text-foreground border border-border/80 shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className="text-[10px] opacity-70">({tab.count})</span>
                    </button>
                  ))}
                </div>

                <div className="relative sm:w-56">
                  <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search documents or category..."
                    value={docSearch}
                    onChange={(e) => setDocSearch(e.target.value)}
                    className="w-full bg-card border border-border/70 rounded-[4px] pl-8 pr-2.5 h-[26px] text-[11px] focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/60"
                  />
                </div>
              </div>

              {/* Scrollable Document List */}
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 space-y-2.5">
                {filteredRequirements.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-[12px] bg-muted/10 rounded-[6px] border border-dashed border-border/70">
                    No documents found matching the filter criteria.
                  </div>
                ) : (
                  filteredRequirements.map((req) => {
                    const doc = req.currentDocument;
                    const isApproved = req.status === 'APPROVED';
                    const isRejected = req.status === 'REJECTED';
                    const isUnderReview = req.status === 'UNDER_REVIEW' || (doc && doc.status === 'UNDER_REVIEW');

                    return (
                      <div
                        key={req.id}
                        id={`req-row-${req.id}`}
                        className={`p-3 rounded-[6px] border transition-all ${
                          isRejected
                            ? 'bg-rose-500/5 border-rose-500/30'
                            : isApproved
                            ? 'bg-card border-border/60 hover:border-border'
                            : isUnderReview
                            ? 'bg-blue-500/5 border-blue-500/30'
                            : 'bg-muted/15 border-border/60'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          {/* Title & Metadata */}
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center space-x-2 flex-wrap">
                              <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.2 rounded border border-border/50">
                                {req.categoryName}
                              </span>
                              <h3 className="text-[13px] font-semibold text-foreground truncate">{req.name}</h3>
                            </div>

                            {doc && doc.latestVersion ? (
                              <div className="flex items-center space-x-2 text-[11px] text-muted-foreground flex-wrap">
                                <span className="font-mono text-primary font-medium truncate max-w-[240px]">
                                  📄 {doc.latestVersion.fileName}
                                </span>
                                <span>•</span>
                                <span>{(doc.latestVersion.fileSize / 1000).toFixed(1)} KB</span>
                                <span>•</span>
                                <span>v{doc.latestVersion.versionNumber}</span>
                                <span>•</span>
                                <span>{new Date(doc.latestVersion.uploadedAt).toLocaleDateString('en-IN')}</span>
                              </div>
                            ) : (
                              <p className="text-[11px] text-muted-foreground truncate">
                                {req.description || 'Awaiting client document upload'}
                              </p>
                            )}
                          </div>

                          {/* Status Pill & Action Buttons */}
                          <div className="flex items-center space-x-1.5 shrink-0">
                            <span
                              className={`px-2 py-0.5 rounded-[4px] text-[10px] font-semibold border ${
                                isApproved
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                  : isRejected
                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                                  : isUnderReview
                                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                                  : 'bg-muted/50 text-muted-foreground border-border/50'
                              }`}
                            >
                              {req.status.replace(/_/g, ' ')}
                            </span>

                            {doc && doc.latestVersion && (
                              <button
                                id={`btn-preview-${req.id}`}
                                onClick={() => onPreviewDocument(req.name, doc.latestVersion.contentUrl, doc.versions)}
                                className="flex items-center space-x-1 bg-card hover:bg-muted text-foreground px-2.5 h-[26px] rounded-[4px] text-[11px] font-semibold border border-border/70 transition-colors cursor-pointer"
                                title="Preview Document"
                              >
                                <Eye className="w-3 h-3 text-blue-500" />
                                <span>Preview</span>
                              </button>
                            )}

                            {!isApproved && doc && (
                              <button
                                id={`btn-approve-${req.id}`}
                                onClick={() => onApproveDocument(req.id)}
                                className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 h-[26px] rounded-[4px] text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                            )}

                            {!isRejected && doc && (
                              <button
                                id={`btn-reject-${req.id}`}
                                onClick={() => setRejectingReqId(req.id)}
                                className="flex items-center space-x-1 bg-rose-600 hover:bg-rose-500 text-white px-2.5 h-[26px] rounded-[4px] text-[11px] font-semibold transition-colors cursor-pointer"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            )}

                            {!doc && (
                              <button
                                onClick={() => {
                                  if (onSendMessage) {
                                    onSendMessage(
                                      filing.clientId,
                                      `Reminder: Please upload the required document "${req.name}" for your AY ${filing.assessmentYear} tax filing.`,
                                      'CA_ADMIN',
                                      'CA Team'
                                    );
                                    setActiveTab('chat');
                                  }
                                }}
                                className="text-[11px] text-primary hover:underline font-semibold cursor-pointer px-1"
                              >
                                Remind Client
                              </button>
                            )}
                          </div>
                        </div>

                        {isRejected && req.rejectionReason && (
                          <div className="mt-2 text-[11px] text-rose-600 dark:text-rose-400 bg-rose-500/10 p-2 rounded-[4px] border border-rose-500/20 flex items-start space-x-2">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>
                              <strong>Rejection reason:</strong> {req.rejectionReason}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TAX COMPUTATION (Scrollable Ledger) */}
          {activeTab === 'computation' && (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              
              {/* Summary Stats Strip */}
              <div className="p-3 border-b border-border/60 bg-muted/15 grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground">Gross Income</span>
                  <p className="text-[14px] font-bold text-foreground font-mono">₹18,40,000</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground">Total Deductions</span>
                  <p className="text-[14px] font-bold text-foreground font-mono">- ₹2,14,500</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground">Taxable Income</span>
                  <p className="text-[14px] font-bold text-primary font-mono">₹16,25,500</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400">Net Refund</span>
                  <p className="text-[14px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">₹14,280</p>
                </div>
              </div>

              {/* Scrollable Calculation Breakdown */}
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3.5 space-y-3">
                <div className="border border-border/70 rounded-[6px] overflow-hidden text-[12px]">
                  <div className="divide-y divide-border/60">
                    <div className="flex justify-between py-2 px-3.5 bg-muted/30 font-semibold text-foreground">
                      <span>1. Gross Salary Income (Form 16 Sec 17)</span>
                      <span className="font-mono">₹18,40,000</span>
                    </div>
                    <div className="flex justify-between py-1.5 px-3.5 text-muted-foreground pl-7">
                      <span>Less: Standard Deduction u/s 16(ia)</span>
                      <span className="font-mono text-foreground">- ₹75,000</span>
                    </div>
                    <div className="flex justify-between py-1.5 px-3.5 text-muted-foreground pl-7">
                      <span>Less: Professional Tax</span>
                      <span className="font-mono text-foreground">- ₹2,500</span>
                    </div>
                    <div className="flex justify-between py-2 px-3.5 bg-muted/15 font-semibold text-foreground">
                      <span>2. Income from Other Sources (Savings & FD Interest)</span>
                      <span className="font-mono">₹38,200</span>
                    </div>
                    <div className="flex justify-between py-2 px-3.5 bg-muted/40 font-bold text-foreground">
                      <span>Gross Total Income (GTI)</span>
                      <span className="font-mono text-primary font-bold">₹18,00,700</span>
                    </div>
                    <div className="flex justify-between py-1.5 px-3.5 text-muted-foreground pl-7">
                      <span>Less: Chapter VI-A Deductions (80C, 80D)</span>
                      <span className="font-mono text-foreground">- ₹1,75,000</span>
                    </div>
                    <div className="flex justify-between py-2 px-3.5 bg-primary/10 font-bold text-foreground border-t border-primary/20">
                      <span>Total Taxable Income</span>
                      <span className="font-mono text-[13px] font-extrabold">₹16,25,700</span>
                    </div>
                    <div className="flex justify-between py-1.5 px-3.5 text-muted-foreground">
                      <span>Gross Tax Payable under Section 115BAC (New Regime)</span>
                      <span className="font-mono text-foreground">₹1,38,280</span>
                    </div>
                    <div className="flex justify-between py-1.5 px-3.5 text-muted-foreground">
                      <span>Add: Health & Education Cess (4%)</span>
                      <span className="font-mono text-foreground">₹5,531</span>
                    </div>
                    <div className="flex justify-between py-2 px-3.5 bg-muted/25 font-semibold text-foreground">
                      <span>Total Tax Liability</span>
                      <span className="font-mono">₹1,43,811</span>
                    </div>
                    <div className="flex justify-between py-1.5 px-3.5 text-emerald-600 dark:text-emerald-400 pl-7 font-medium">
                      <span>Less: TDS & Advance Tax Claimed (26AS Match)</span>
                      <span className="font-mono">- ₹1,58,091</span>
                    </div>
                    <div className="flex justify-between py-2.5 px-3.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-[13px] border-t border-emerald-500/30">
                      <span>Net Tax Refund Claimed (Section 237)</span>
                      <span className="font-mono text-[14px]">₹14,280</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-muted/20 border border-border/60 rounded-[6px] flex items-center justify-between text-[11px] text-muted-foreground">
                  <div className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>26AS / AIS reconciliation completed with zero discrepancy</span>
                  </div>
                  <span className="font-mono text-foreground font-semibold">Verified</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CLIENT DIRECT CHAT (Clean Embedded Chat taking full height) */}
          {activeTab === 'chat' && (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <DirectChatBox
                clientId={filing.clientId}
                client={client}
                messages={chatMessages}
                currentRole="CA_ADMIN"
                currentUserName="CA Team"
                compact={true}
                className="border-0 rounded-none shadow-none h-full"
                onSendMessage={(cId, msg, sRole, sName, atts) => {
                  if (onSendMessage) {
                    onSendMessage(cId, msg, sRole, sName, atts);
                  }
                }}
                onMarkRead={(cId, rRole) => {
                  if (onMarkChatRead) {
                    onMarkChatRead(cId, rRole);
                  }
                }}
              />
            </div>
          )}

          {/* TAB 4: AUDIT ACTIVITY TRAIL (Scrollable Timeline) */}
          {activeTab === 'activity' && (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="p-2.5 px-3.5 border-b border-border/60 bg-muted/10 flex items-center justify-between shrink-0">
                <span className="text-[12px] font-semibold text-foreground">Filing Activity Trail</span>
                <span className="text-[10px] font-mono text-muted-foreground">Immutable Log</span>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3.5 space-y-2.5 text-[12px]">
                {[
                  { title: 'Filing Case Initialized', time: '14 Aug 2026, 09:15 AM', desc: `Dossier opened for AY ${filing.assessmentYear} by CA Team.`, role: 'CA Admin' },
                  { title: 'Checklist Requirements Dispatched', time: '14 Aug 2026, 09:16 AM', desc: 'Dispatched automated checklist requirements via portal.', role: 'System' },
                  { title: 'Identity & PAN Verified', time: '14 Aug 2026, 10:22 AM', desc: 'Client completed secure identity verification on portal.', role: 'Client' },
                  { title: 'Document Uploaded: Form 16', time: '15 Aug 2026, 11:30 AM', desc: 'Client uploaded Form 16 Part A & B (Version 1).', role: 'Client' },
                  { title: 'Document Approved: Form 16', time: '15 Aug 2026, 02:45 PM', desc: 'Salary breakdown & TDS schedule verified with TRACES.', role: 'CA Admin' },
                  { title: `Current Workflow State: ${filing.status.replace(/_/g, ' ')}`, time: 'Active Now', desc: 'Case actively managed in TaxVault portal with real-time sync.', role: 'System' },
                ].map((log, i) => (
                  <div key={i} className="p-3 rounded-[6px] bg-muted/20 border border-border/60 flex items-start space-x-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{log.title}</span>
                        <span className="text-[11px] text-muted-foreground font-mono">{log.time}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{log.desc}</p>
                      <span className="inline-block mt-1 text-[9px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.2 rounded">
                        Actor: {log.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* MODAL: Reject Document Reason */}
      {rejectingReqId && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/70 rounded-[8px] max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h2 className="text-[14px] font-semibold text-foreground flex items-center space-x-2 border-b border-border/60 pb-3">
              <XCircle className="w-4 h-4 text-rose-500" />
              <span>Reject Document</span>
            </h2>
            <p className="text-[12px] text-muted-foreground">
              Provide a clear reason for rejection so the client knows what to re-upload.
            </p>

            <textarea
              id="input-reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Uploaded statement is missing pages 3-4 showing interest breakdown."
              className="w-full bg-background border border-border/70 text-foreground text-[12px] rounded-[6px] p-3 h-24 focus:outline-none focus:ring-1 focus:ring-rose-500 placeholder:text-muted-foreground"
            />

            <div className="flex justify-end space-x-2 pt-3 border-t border-border/60">
              <button
                onClick={() => setRejectingReqId(null)}
                className="px-3 h-[30px] rounded-[5px] text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-reject"
                onClick={handleConfirmReject}
                className="bg-rose-600 hover:bg-rose-500 text-white px-3.5 h-[30px] rounded-[5px] text-[11px] font-semibold transition-colors cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Request Additional Document */}
      {showAddDocModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleConfirmAddReq} className="bg-card border border-border/70 rounded-[8px] max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="text-[14px] font-semibold text-foreground flex items-center space-x-2">
                <FilePlus className="w-4 h-4 text-primary" />
                <span>Request Document</span>
              </h2>
              <button type="button" onClick={() => setShowAddDocModal(false)} className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted cursor-pointer">✕</button>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground">Document Category</label>
              <select
                value={newDocCategory}
                onChange={(e) => setNewDocCategory(e.target.value)}
                className="w-full bg-background border border-border/70 text-foreground text-[12px] rounded-[5px] px-3 h-[32px] focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="cat-1">Salary & Employment (Form 16)</option>
                <option value="cat-2">Bank & Interest (Statements)</option>
                <option value="cat-3">Investments & Deductions (80C/80D)</option>
                <option value="cat-4">Capital Gains (P&L Statements)</option>
                <option value="cat-5">Business & Profession (P&L / Balance Sheet)</option>
                <option value="cat-6">Identity Proofs (Aadhaar / PAN)</option>
                <option value="cat-7">Other Miscellaneous Records</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground">Document Name / Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Housing Loan Interest Certificate FY25-26"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                className="w-full bg-background border border-border/70 text-foreground text-[12px] rounded-[5px] px-3 h-[32px] focus:outline-none focus:ring-1 focus:ring-primary"
              >
              </input>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground">Instructions for Client</label>
              <textarea
                value={newDocDesc}
                onChange={(e) => setNewDocDesc(e.target.value)}
                placeholder="e.g. Please ensure certificate displays interest & principal breakdown separately."
                className="w-full bg-background border border-border/70 text-foreground text-[12px] rounded-[5px] p-2.5 h-20 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-border/60">
              <button
                type="button"
                onClick={() => setShowAddDocModal(false)}
                className="px-3 h-[30px] rounded-[5px] text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-3.5 h-[30px] rounded-[5px] text-[11px] cursor-pointer shadow-2xs"
              >
                Send Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Upload Final ITR-V Document */}
      {showUploadFinalModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleConfirmUploadFinal} className="bg-card border border-border/70 rounded-[8px] max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="text-[14px] font-semibold text-foreground flex items-center space-x-2">
                <UploadCloud className="w-4 h-4 text-emerald-500" />
                <span>Upload Filed ITR-V Acknowledgement</span>
              </h2>
              <button type="button" onClick={() => setShowUploadFinalModal(false)} className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted cursor-pointer">✕</button>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground">Document Title</label>
              <input
                type="text"
                required
                value={finalDocTitle}
                onChange={(e) => setFinalDocTitle(e.target.value)}
                className="w-full bg-background border border-border/70 text-foreground text-[12px] rounded-[5px] px-3 h-[32px] focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground">File Name (PDF)</label>
              <input
                type="text"
                required
                value={finalFileName}
                onChange={(e) => setFinalFileName(e.target.value)}
                className="w-full bg-background border border-border/70 text-foreground text-[12px] rounded-[5px] px-3 h-[32px] focus:outline-none focus:ring-1 focus:ring-primary font-mono text-[11px]"
              />
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-[6px] text-[11px] text-emerald-700 dark:text-emerald-300 space-y-1">
              <p className="font-semibold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Vault Security Policy</span>
              </p>
              <p className="text-[10px] text-emerald-600/90 dark:text-emerald-400/90">
                Uploading the final ITR-V will mark the filing as completed, update the taxpayer's milestone tracker, and trigger an automated receipt notification.
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-border/60">
              <button
                type="button"
                onClick={() => setShowUploadFinalModal(false)}
                className="px-3 h-[30px] rounded-[5px] text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 h-[30px] rounded-[5px] text-[11px] cursor-pointer shadow-2xs"
              >
                Complete & Upload
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Expanded Chat */}
      {showFullChatModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/70 rounded-[8px] max-w-3xl w-full h-[600px] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-3 border-b border-border/60 flex items-center justify-between bg-muted/20">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span className="font-semibold text-[13px] text-foreground">Direct Chat with {taxpayerName} ({taxpayerPhone})</span>
              </div>
              <button
                onClick={() => setShowFullChatModal(false)}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <DirectChatBox
                clientId={filing.clientId}
                client={client}
                messages={chatMessages}
                currentRole="CA_ADMIN"
                currentUserName="CA Team"
                compact={false}
                className="border-0 rounded-none shadow-none h-full"
                onSendMessage={(cId, msg, sRole, sName, atts) => {
                  if (onSendMessage) {
                    onSendMessage(cId, msg, sRole, sName, atts);
                  }
                }}
                onMarkRead={(cId, rRole) => {
                  if (onMarkChatRead) {
                    onMarkChatRead(cId, rRole);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
