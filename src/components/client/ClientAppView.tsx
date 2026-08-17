import React, { useState } from 'react';
import {
  Filing,
  DocumentRequirement,
  Client,
  Tenant,
  NotificationItem,
  Payment,
  ChatMessage,
} from '../../types';
import {
  Home,
  FolderOpen,
  ShieldCheck,
  Bell,
  User,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Lock,
  CreditCard,
  Download,
  Phone,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  MessageSquare,
  Search,
  HelpCircle,
  X,
  ChevronRight,
  Info,
  FileCheck,
} from 'lucide-react';
import { DirectChatBox } from '../chat/DirectChatBox';

interface ClientAppViewProps {
  client: Client;
  tenant: Tenant;
  filings: Filing[];
  requirements: DocumentRequirement[];
  notifications: NotificationItem[];
  payments: Payment[];
  chatMessages?: ChatMessage[];
  onUploadDocument: (requirementId: string, fileName: string, fileType: string, fileSize: number) => void;
  onPayFiling: (filingId: string) => void;
  onVerifyPanDob: (filingId: string, pan: string, dob: string) => Promise<boolean>;
  onDownloadDocument: (requirementId: string) => Promise<{ downloadUrl: string; fileName: string } | null>;
  onMarkNotificationRead: (notifId: string) => void;
  onPreviewDocument: (title: string, url?: string, versions?: any[]) => void;
  onSendMessage?: (
    clientId: string,
    message: string,
    senderRole: 'CA_ADMIN' | 'CA_STAFF' | 'CLIENT',
    senderName: string,
    attachments?: any
  ) => void;
  onMarkChatRead?: (clientId: string, readerRole: 'CA_ADMIN' | 'CA_STAFF' | 'CLIENT') => void;
}

export const ClientAppView: React.FC<ClientAppViewProps> = ({
  client,
  tenant,
  filings,
  requirements,
  notifications,
  payments,
  chatMessages = [],
  onUploadDocument,
  onPayFiling,
  onVerifyPanDob,
  onDownloadDocument,
  onMarkNotificationRead,
  onPreviewDocument,
  onSendMessage,
  onMarkChatRead,
}) => {
  // Navigation tabs: Home, Documents, Vault, Chat, Profile (Notifications removed from bottom bar)
  const [activeNav, setActiveNav] = useState<'home' | 'filings' | 'vault' | 'chat' | 'profile'>('home');
  const [selectedFilingId, setSelectedFilingId] = useState<string>(filings[0]?.id || '');
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [docStatusFilter, setDocStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [showDocGuide, setShowDocGuide] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  
  // Upload Modal
  const [uploadingReq, setUploadingReq] = useState<DocumentRequirement | null>(null);
  const [simulatedFileName, setSimulatedFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Identity Verification Modal (PAN + DOB)
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [inputPan, setInputPan] = useState('');
  const [inputDob, setInputDob] = useState(client.dateOfBirth || '2004-08-30');
  const [verificationError, setVerificationError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Payment Checkout Modal Simulation
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const activeFiling = filings.find((f) => f.id === selectedFilingId) || filings[0];
  const activeRequirements = activeFiling ? requirements.filter((r) => r.filingId === activeFiling.id) : [];

  const unreadNotifCount = notifications.filter((n) => !n.read).length;
  const unreadChatCount = chatMessages.filter(
    (m) => m.clientId === client.id && !m.read && (m.senderRole === 'CA_ADMIN' || m.senderRole === 'CA_STAFF')
  ).length;

  const missingDocsCount = activeRequirements.filter(
    (r) => r.status === 'PENDING' || r.status === 'REJECTED'
  ).length;
  const approvedDocsCount = activeRequirements.filter((r) => r.status === 'APPROVED').length;
  const totalDocsCount = activeRequirements.length || 4;

  const filteredRequirements = activeRequirements.filter((req) => {
    const q = (docSearchQuery || '').toLowerCase();
    const matchesSearch =
      !docSearchQuery ||
      (req.name || '').toLowerCase().includes(q) ||
      (req.categoryName || '').toLowerCase().includes(q);
    const matchesStatus = docStatusFilter === 'ALL' || req.status === docStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Official Vault Documents (Strictly CA-Provided/Uploaded Documents Only)
  const isCaDeliveredDoc = (req: DocumentRequirement) => {
    if (!req.currentDocument || req.status !== 'APPROVED') return false;
    const uploader = (req.currentDocument?.latestVersion?.uploadedBy || '').toLowerCase();
    const cat = (req.categoryName || '').toLowerCase();
    const name = (req.name || '').toLowerCase();

    // Exclude generic client-uploaded forms
    if (
      cat.includes('pan') ||
      name.includes('pan card') ||
      cat.includes('form 16') ||
      name.includes('form 16') ||
      cat.includes('bank statement') ||
      name.includes('bank statement') ||
      cat.includes('ais') ||
      cat.includes('tis') ||
      cat.includes('26as') ||
      cat.includes('80c') ||
      name.includes('investment')
    ) {
      return false;
    }

    return (
      uploader.includes('ca') ||
      uploader.includes('rajesh') ||
      uploader.includes('kothari') ||
      uploader.includes('staff') ||
      cat.includes('itr') ||
      cat.includes('computation') ||
      cat.includes('acknowledgement') ||
      cat.includes('certificate') ||
      cat.includes('audit') ||
      cat.includes('receipt') ||
      name.includes('itr') ||
      name.includes('computation') ||
      name.includes('acknowledgement') ||
      name.includes('certificate') ||
      name.includes('receipt')
    );
  };

  const caVaultDocuments = activeRequirements.filter(isCaDeliveredDoc);

  // Client-Friendly Stages (1: Docs -> 2: CA Review -> 3: Review & Pay -> 4: Filed & Download)
  const getSimpleStageNumber = () => {
    if (!activeFiling) return 1;
    if (activeFiling.status === 'FILING_COMPLETED' || activeFiling.status === 'DOWNLOAD_UNLOCKED' || activeFiling.status === 'CLOSED') return 4;
    if (activeFiling.status === 'PAYMENT_PENDING' || activeFiling.status === 'DOCUMENTS_READY') return 3;
    if (missingDocsCount > 0) return 1;
    return 2; // Under CA review
  };

  const simpleStage = getSimpleStageNumber();

  // Handle Upload
  const handleConfirmUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadingReq || !simulatedFileName) return;
    setIsUploading(true);

    setTimeout(() => {
      onUploadDocument(
        uploadingReq.id,
        simulatedFileName,
        simulatedFileName.endsWith('.png') || simulatedFileName.endsWith('.jpg') ? 'image/png' : 'application/pdf',
        850000
      );
      setIsUploading(false);
      setUploadingReq(null);
      setSimulatedFileName('');
    }, 600);
  };

  // Handle Pay Flow
  const handleInitiatePay = () => {
    setShowPaymentModal(true);
  };

  const handleConfirmRazorpayPayment = () => {
    if (!activeFiling) return;
    setIsProcessingPayment(true);
    setTimeout(() => {
      onPayFiling(activeFiling.id);
      setIsProcessingPayment(false);
      setShowPaymentModal(false);
    }, 1000);
  };

  // Handle PAN + DOB Identity Verification
  const handleConfirmIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFiling) return;
    setIsVerifying(true);
    setVerificationError('');

    try {
      const success = await onVerifyPanDob(activeFiling.id, inputPan, inputDob);
      if (success) {
        setShowIdentityModal(false);
        setInputPan('');
      } else {
        setVerificationError('Identity verification failed. Please check your PAN and Date of Birth on record.');
      }
    } catch (err: any) {
      setVerificationError(err.message || 'Verification error');
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle Download Click
  const handleDownloadClick = async (reqId: string) => {
    if (!activeFiling) return;

    if (activeFiling.paymentStatus !== 'SUCCESS') {
      setShowPaymentModal(true);
      return;
    }

    if (!activeFiling.panDobVerified) {
      setShowIdentityModal(true);
      return;
    }

    const res = await onDownloadDocument(reqId);
    if (res) {
      onPreviewDocument(res.fileName, res.downloadUrl);
    }
  };

  return (
    <div className="w-[375px] sm:w-[390px] h-[780px] max-h-[calc(100vh-4rem)] mx-auto bg-background text-foreground rounded-[2.25rem] border-[6px] border-foreground/15 shadow-2xl flex flex-col justify-between overflow-hidden relative font-sans shrink-0">
      
      {/* Mobile App Top Header */}
      <header className="bg-card border-b border-border/70 px-4 py-3 shrink-0 z-20 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-[6px] bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs">
            {tenant.brandName.substring(0, 2).toUpperCase()}
          </div>
          <span className="text-[13px] font-semibold text-foreground tracking-tight">
            {tenant.brandName}
          </span>
        </div>

        {/* Notifications Icon Button with Unread Badge */}
        <button
          id="btn-client-notifs-icon"
          onClick={() => setShowNotifDrawer(true)}
          className="relative p-2 text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted rounded-[6px] border border-border/60 transition-colors cursor-pointer"
          title="Notifications Preview"
        >
          <Bell className="w-4 h-4" />
          {unreadNotifCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
              {unreadNotifCount}
            </span>
          )}
        </button>
      </header>

      {/* Main Body Screen Content */}
      <main
        className={`flex-1 min-h-0 bg-background ${
          activeNav === 'chat'
            ? 'p-0 flex flex-col overflow-hidden bg-card'
            : 'p-3.5 overflow-y-auto space-y-3.5'
        }`}
      >
        
        {/* ================= TAB 1: HOME ================= */}
        {activeNav === 'home' && activeFiling && (
          <div className="space-y-3.5">
            {/* Friendly Greeting */}
            <div className="flex items-center justify-between pb-0.5">
              <div>
                <h1 className="text-[16px] font-bold text-foreground tracking-tight">
                  Hello, {client.firstName}! 👋
                </h1>
                <p className="text-[11px] text-muted-foreground">
                  Welcome to your tax filing dashboard
                </p>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-muted rounded-[4px] text-muted-foreground border border-border/60">
                AY {activeFiling.assessmentYear}
              </span>
            </div>
            
            {/* Current Tax Filing Status Card */}
            <div className="bg-card border border-border/70 rounded-[12px] p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Tax Return • AY {activeFiling.assessmentYear}
                  </span>
                  <h2 className="text-[15px] font-bold text-foreground mt-0.5">
                    {activeFiling.filingType || 'ITR-1 (Salaried)'}
                  </h2>
                </div>

                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-[6px] border ${
                    simpleStage === 4
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                      : simpleStage === 3
                      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25'
                      : simpleStage === 2
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
                  }`}
                >
                  {simpleStage === 4
                    ? 'ITR Filed'
                    : simpleStage === 3
                    ? 'Review & Pay'
                    : simpleStage === 2
                    ? 'CA Reviewing'
                    : 'Documents Needed'}
                </span>
              </div>

              {/* Minimal 4-Step Visual Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { num: 1, label: 'Upload Docs' },
                    { num: 2, label: 'CA Review' },
                    { num: 3, label: 'Approve & Pay' },
                    { num: 4, label: 'ITR-V Filed' },
                  ].map((step) => {
                    const isDone = simpleStage > step.num;
                    const isCurrent = simpleStage === step.num;
                    return (
                      <div key={step.num} className="space-y-1">
                        <div
                          className={`h-1.5 rounded-full transition-colors ${
                            isDone
                              ? 'bg-emerald-500'
                              : isCurrent
                              ? 'bg-primary'
                              : 'bg-muted'
                          }`}
                        />
                        <span
                          className={`block text-[9px] truncate font-medium ${
                            isCurrent
                              ? 'text-primary font-semibold'
                              : isDone
                              ? 'text-foreground'
                              : 'text-muted-foreground/60'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Next Action Callout Card (Highlighting What the Client Needs to Do Right Now) */}
            {missingDocsCount > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/25 rounded-[12px] p-4 space-y-2.5 shadow-xs">
                <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-semibold text-[13px]">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Action Needed: Upload {missingDocsCount} Document{missingDocsCount > 1 ? 's' : ''}</span>
                </div>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  Your CA requires these documents to compute and verify your maximum tax deductions.
                </p>
                <button
                  id="btn-client-upload-now"
                  onClick={() => setActiveNav('filings')}
                  className="w-full h-[36px] bg-amber-600 hover:bg-amber-500 text-white font-semibold text-[12px] rounded-[8px] transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Documents Now ({missingDocsCount})</span>
                </button>
              </div>
            )}

            {/* Pay CA Fee Card (When computation is ready) */}
            {(activeFiling.status === 'PAYMENT_PENDING' || activeFiling.status === 'DOCUMENTS_READY') && activeFiling.paymentStatus !== 'SUCCESS' && (
              <div className="bg-purple-500/10 border border-purple-500/25 rounded-[12px] p-4 space-y-2.5 shadow-xs">
                <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 font-semibold text-[13px]">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Tax Computation Ready</span>
                </div>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  Your return computation is ready. Pay professional filing fee of ₹{activeFiling.feeAmount.toLocaleString('en-IN')} to unlock your official ITR-V.
                </p>
                <button
                  id="btn-client-pay-now-home"
                  onClick={handleInitiatePay}
                  className="w-full h-[36px] bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[12px] rounded-[8px] transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pay ₹{activeFiling.feeAmount.toLocaleString('en-IN')} & Unlock Downloads</span>
                </button>
              </div>
            )}

            {/* Unlocked ITR-V Downloads Card (When completed) */}
            {simpleStage === 4 && (
              <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-[12px] p-4 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-semibold text-[13px]">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Return Successfully Filed</span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-[4px]">
                    ITR-V READY
                  </span>
                </div>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  Your official ITR-V Acknowledgement and certified Tax Computation sheets are ready in your Vault.
                </p>
                <button
                  id="btn-client-go-to-vault"
                  onClick={() => setActiveNav('vault')}
                  className="w-full h-[36px] bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[12px] rounded-[8px] transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download ITR-V Acknowledgement</span>
                </button>
              </div>
            )}

            {/* When CA is reviewing and no client action required */}
            {simpleStage === 2 && missingDocsCount === 0 && (
              <div className="bg-blue-500/10 border border-blue-500/25 rounded-[12px] p-4 space-y-2 shadow-xs">
                <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-semibold text-[13px]">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>CA Is Reviewing Your Tax File</span>
                </div>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  All documents have been received. Your CA is cross-checking TDS on 26AS/AIS and optimizing your deductions.
                </p>
              </div>
            )}

            {/* 3 Quick Snapshot Cards */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-card border border-border/70 rounded-[10px] p-2.5 text-center shadow-xs">
                <span className="text-[10px] font-medium text-muted-foreground block">Documents</span>
                <span className="text-[13px] font-bold text-foreground mt-0.5 block">
                  {approvedDocsCount}/{totalDocsCount}
                </span>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">Verified</span>
              </div>

              <div className="bg-card border border-border/70 rounded-[10px] p-2.5 text-center shadow-xs">
                <span className="text-[10px] font-medium text-muted-foreground block">CA Fee</span>
                <span className="text-[13px] font-bold text-foreground mt-0.5 block">
                  ₹{activeFiling.feeAmount}
                </span>
                <span className={`text-[9px] font-medium ${activeFiling.paymentStatus === 'SUCCESS' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {activeFiling.paymentStatus === 'SUCCESS' ? 'Settled' : 'Payable'}
                </span>
              </div>

              <div className="bg-card border border-border/70 rounded-[10px] p-2.5 text-center shadow-xs">
                <span className="text-[10px] font-medium text-muted-foreground block">Financial Year</span>
                <span className="text-[13px] font-bold text-foreground mt-0.5 block">
                  2025-26
                </span>
                <span className="text-[9px] text-muted-foreground font-medium">AY 2026-27</span>
              </div>
            </div>

            {/* Dedicated CA Contact & Quick Chat Bar */}
            <div className="bg-card border border-border/70 rounded-[12px] p-3.5 flex items-center justify-between shadow-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Assigned CA Office</span>
                <h4 className="text-[13px] font-semibold text-foreground">{tenant.brandName}</h4>
                <div className="flex items-center space-x-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Online • Ready to assist</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  id="btn-client-chat-quick"
                  onClick={() => setActiveNav('chat')}
                  className="px-3 h-[32px] bg-primary text-primary-foreground hover:bg-primary/90 rounded-[8px] text-[11px] font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs relative"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat</span>
                  {unreadChatCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 absolute -top-0.5 -right-0.5 ring-2 ring-card" />
                  )}
                </button>
                <a
                  href={`tel:${tenant.supportPhone}`}
                  className="p-2 bg-muted hover:bg-muted/80 text-foreground rounded-[8px] border border-border/60 transition-colors"
                  title="Call CA Office"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 2: DOCUMENTS & CHECKLIST ================= */}
        {activeNav === 'filings' && (
          <div className="space-y-3">
            
            {/* Header with Title and "Why Needed" Button */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[14px] font-bold text-foreground">Required Documents</h2>
                <p className="text-[11px] text-muted-foreground">
                  {approvedDocsCount} of {activeRequirements.length} verified by your CA
                </p>
              </div>

              <button
                onClick={() => setShowDocGuide(!showDocGuide)}
                className="flex items-center space-x-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer bg-primary/5 px-2 py-1 rounded-[6px] border border-primary/20"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Why Needed?</span>
              </button>
            </div>

            {/* Document Guide Explainer (Expandable) */}
            {showDocGuide && (
              <div className="p-3 bg-muted/40 border border-border/70 rounded-[10px] text-[11px] space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between font-semibold text-foreground border-b border-border/50 pb-1.5">
                  <span className="flex items-center space-x-1.5">
                    <Info className="w-3.5 h-3.5 text-primary" />
                    <span>Why are these documents required?</span>
                  </span>
                  <button onClick={() => setShowDocGuide(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-1.5 text-[11px] text-muted-foreground">
                  <div className="p-2 bg-card rounded-[6px] border border-border/50">
                    <span className="font-semibold text-foreground block">Form 16</span>
                    <p className="text-[10px]">TDS certificate from employer showing salary and tax deposited.</p>
                  </div>
                  <div className="p-2 bg-card rounded-[6px] border border-border/50">
                    <span className="font-semibold text-foreground block">AIS / TIS & 26AS</span>
                    <p className="text-[10px]">Income tax portal ledgers reflecting bank interest, stock dividends, and tax credits.</p>
                  </div>
                  <div className="p-2 bg-card rounded-[6px] border border-border/50">
                    <span className="font-semibold text-foreground block">80C & 80D Proofs</span>
                    <p className="text-[10px]">LIC, ELSS, Health Insurance & Home loan receipts to maximize tax refund.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Filter Pills (All / Pending / Verified) */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5 text-[11px]">
              {[
                { key: 'ALL', label: 'All' },
                { key: 'PENDING', label: `Pending (${missingDocsCount})` },
                { key: 'APPROVED', label: `Verified (${approvedDocsCount})` },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setDocStatusFilter(filter.key as any)}
                  className={`px-3 py-1 rounded-[6px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    docStatusFilter === filter.key
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'bg-muted/60 text-muted-foreground hover:text-foreground border border-border/60'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Document Cards List */}
            <div className="space-y-2.5">
              {filteredRequirements.length === 0 ? (
                <div className="bg-card border border-border/60 rounded-[10px] p-6 text-center text-xs text-muted-foreground">
                  No documents found in this view.
                </div>
              ) : (
                filteredRequirements.map((req) => {
                  const isApproved = req.status === 'APPROVED';
                  const isRejected = req.status === 'REJECTED';
                  const doc = req.currentDocument;

                  return (
                    <div
                      key={req.id}
                      id={`client-req-card-${req.id}`}
                      className={`bg-card border rounded-[10px] p-3.5 space-y-2.5 transition-all shadow-xs ${
                        isRejected
                          ? 'border-rose-500/40 bg-rose-500/5'
                          : isApproved
                          ? 'border-emerald-500/40 bg-emerald-500/5'
                          : 'border-border/70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-[13px] font-semibold text-foreground truncate">{req.name}</h3>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">{req.description}</p>
                        </div>

                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-[4px] border shrink-0 uppercase tracking-wider ${
                            isApproved
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : isRejected
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                              : doc
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {isApproved
                            ? 'Verified'
                            : isRejected
                            ? 'Needs Resubmission'
                            : doc
                            ? 'Under Review'
                            : 'Upload Needed'}
                        </span>
                      </div>

                      {/* CA Rejection note */}
                      {isRejected && req.rejectionReason && (
                        <div className="bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-[6px] text-[11px] text-rose-600 dark:text-rose-400 space-y-0.5">
                          <span className="font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Note from CA:
                          </span>
                          <p className="font-medium">{req.rejectionReason}</p>
                        </div>
                      )}

                      {/* Uploaded File Pill */}
                      {doc && doc.latestVersion && (
                        <div className="bg-background/80 p-2 rounded-[6px] border border-border/60 text-[11px] flex items-center justify-between">
                          <span className="text-foreground font-medium truncate max-w-[200px] flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-primary" />
                            {doc.latestVersion.fileName}
                          </span>
                          <span className="text-muted-foreground font-mono text-[10px]">
                            {(doc.latestVersion.fileSize / 1000).toFixed(0)} KB
                          </span>
                        </div>
                      )}

                      {/* Action Button */}
                      <div>
                        {isApproved ? (
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 pt-0.5">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Verified by CA</span>
                          </div>
                        ) : (
                          <button
                            id={`btn-client-upload-${req.id}`}
                            onClick={() => {
                              setUploadingReq(req);
                              setSimulatedFileName(req.name.replace(/\s+/g, '_') + '_FY2025.pdf');
                            }}
                            className={`w-full h-[32px] rounded-[6px] text-[12px] font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs ${
                              isRejected
                                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                            }`}
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>{isRejected ? 'Upload Replacement Document' : doc ? 'Replace Document' : 'Upload Document'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* ================= TAB 3: TAX VAULT ================= */}
        {activeNav === 'vault' && activeFiling && (
          <div className="space-y-3.5">
            
            <div className="bg-card border border-border/70 rounded-[12px] p-4 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <h2 className="text-[14px] font-bold text-foreground flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>CA Certified Tax Vault</span>
                </h2>

                {activeFiling.panDobVerified ? (
                  <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold px-2 py-0.5 rounded-[4px] uppercase tracking-wider">
                    Identity Verified
                  </span>
                ) : (
                  <button
                    id="btn-trigger-verify-identity"
                    onClick={() => setShowIdentityModal(true)}
                    className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 text-[10px] font-semibold px-2 py-1 rounded-[4px] transition-colors cursor-pointer uppercase tracking-wider"
                  >
                    Verify Identity
                  </button>
                )}
              </div>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                Official completed tax deliverables, certified computation sheets, and ITR-V filed by {tenant.brandName}.
              </p>
            </div>

            {/* Payment reminder if not paid */}
            {activeFiling.paymentStatus !== 'SUCCESS' && (
              <div className="bg-purple-500/10 border border-purple-500/25 rounded-[10px] p-3.5 space-y-2">
                <div className="flex items-center space-x-1.5 text-purple-600 dark:text-purple-400 text-[12px] font-semibold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Downloads Locked Pending Fee Settlement</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Complete CA fee payment of ₹{activeFiling.feeAmount} to download official digitally signed returns.
                </p>
                <button
                  onClick={handleInitiatePay}
                  className="w-full h-[32px] bg-emerald-600 hover:bg-emerald-500 text-white text-[12px] font-semibold rounded-[6px] cursor-pointer transition-colors flex items-center justify-center space-x-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pay ₹{activeFiling.feeAmount} & Unlock</span>
                </button>
              </div>
            )}

            {/* Official CA Delivered Vault Files Only */}
            <div className="space-y-2.5">
              {caVaultDocuments.length === 0 ? (
                <div className="p-6 text-center bg-card border border-border/70 rounded-[10px] space-y-2">
                  <div className="w-10 h-10 rounded-[6px] bg-muted/60 text-muted-foreground mx-auto flex items-center justify-center">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <h4 className="text-[13px] font-semibold text-foreground">No CA Deliverables Ready Yet</h4>
                  <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                    Once your CA completes your computation and files your return with the Income Tax Department, the certified documents will appear here.
                  </p>
                </div>
              ) : (
                caVaultDocuments.map((req) => {
                  const doc = req.currentDocument!;
                  const uploadedBy = doc.latestVersion.uploadedBy || 'CA Office';

                  return (
                    <div
                      key={req.id}
                      className="bg-card border border-emerald-500/35 bg-emerald-500/5 rounded-[10px] p-3.5 space-y-3 shadow-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-[4px] font-semibold border border-emerald-500/30">
                              {req.categoryName}
                            </span>
                            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-[3px] border border-emerald-500/20 uppercase tracking-wider">
                              CA Certified
                            </span>
                          </div>
                          <h3 className="text-[13px] font-semibold text-foreground mt-1.5">{req.name}</h3>
                          <p className="text-[11px] text-muted-foreground font-mono truncate max-w-[220px]">
                            {doc.latestVersion.fileName}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground font-mono">
                            v{doc.latestVersion.versionNumber} • {(doc.latestVersion.fileSize / 1000).toFixed(0)} KB
                          </span>
                          <span className="text-[9px] text-muted-foreground">
                            Issued by {uploadedBy}
                          </span>
                        </div>

                        <button
                          id={`btn-download-${req.id}`}
                          onClick={() => handleDownloadClick(req.id)}
                          className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold px-3 h-[30px] rounded-[6px] transition-colors cursor-pointer shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* ================= TAB 4: DIRECT CA CHAT ================= */}
        {activeNav === 'chat' && (
          <div className="h-full w-full flex flex-col flex-1 min-h-0">
            <DirectChatBox
              clientId={client.id}
              client={client}
              messages={chatMessages}
              currentRole="CLIENT"
              currentUserName={`${client.firstName} ${client.lastName}`}
              compact={true}
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

        {/* ================= TAB 5: PROFILE ================= */}
        {activeNav === 'profile' && (
          <div className="space-y-3.5">
            <div className="bg-card border border-border/70 rounded-[12px] p-5 text-center space-y-2 shadow-xs">
              <div className="w-14 h-14 mx-auto rounded-[12px] bg-primary/10 border border-primary/20 flex items-center justify-center text-[18px] font-bold text-primary">
                {client.firstName.charAt(0)}{client.lastName.charAt(0)}
              </div>
              <h2 className="text-[16px] font-bold text-foreground">{client.firstName} {client.lastName}</h2>
              <p className="text-[12px] text-muted-foreground font-mono font-semibold">PAN: {client.pan}</p>
              <span className="inline-block bg-muted text-foreground px-2.5 py-0.5 rounded-[4px] text-[11px] font-semibold border border-border/60">
                Client ID: {client.clientId}
              </span>
            </div>

            <div className="bg-card border border-border/70 rounded-[12px] p-4 space-y-3 text-[13px] shadow-xs">
              <div className="flex justify-between border-b border-border/60 pb-2.5">
                <span className="text-muted-foreground font-medium">Mobile:</span>
                <span className="font-semibold text-foreground">{client.mobile}</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2.5">
                <span className="text-muted-foreground font-medium">Email:</span>
                <span className="font-semibold text-foreground truncate max-w-[180px]">{client.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">DOB on Record:</span>
                <span className="font-semibold text-foreground font-mono">{client.dateOfBirth}</span>
              </div>
            </div>

            <div className="bg-card border border-border/70 rounded-[12px] p-4 text-[13px] space-y-1.5 shadow-xs">
              <span className="text-muted-foreground text-[10px] uppercase font-semibold tracking-wider">Assigned CA Office</span>
              <h4 className="font-semibold text-foreground text-[14px]">{tenant.brandName}</h4>
              <p className="text-muted-foreground text-[12px]">{tenant.supportPhone} • {tenant.supportEmail}</p>
            </div>
          </div>
        )}

      </main>

      {/* Clean, Minimal Bottom Navigation Bar (No Notification tab) */}
      <nav className="bg-card border-t border-border/80 px-2 py-1.5 shrink-0 z-20 flex items-center justify-around">
        {[
          { id: 'home', label: 'Home', icon: Home },
          { id: 'filings', label: 'Documents', icon: FolderOpen, badge: missingDocsCount > 0 ? missingDocsCount : undefined },
          { id: 'vault', label: 'Vault', icon: ShieldCheck },
          { id: 'chat', label: 'Chat', icon: MessageSquare, badge: unreadChatCount > 0 ? unreadChatCount : undefined },
          { id: 'profile', label: 'Profile', icon: User },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              id={`nav-app-${item.id}`}
              onClick={() => setActiveNav(item.id as any)}
              className={`flex flex-col items-center py-1 px-3 rounded-[8px] transition-colors relative cursor-pointer ${
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              {item.badge !== undefined && (
                <span className="absolute top-0.5 right-2 w-2 h-2 bg-rose-600 border-[1.5px] border-card rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Slide-in Notifications Preview (Constrained Inside Mobile View Only) */}
      {showNotifDrawer && (
        <div className="absolute inset-0 z-40 bg-background/95 backdrop-blur-xs flex flex-col p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-primary" />
              <h3 className="text-[14px] font-bold text-foreground">Notifications Preview</h3>
              {unreadNotifCount > 0 && (
                <span className="text-[9px] bg-rose-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                  {unreadNotifCount} new
                </span>
              )}
            </div>
            <button
              onClick={() => setShowNotifDrawer(false)}
              className="text-muted-foreground hover:text-foreground p-1 rounded-[4px] hover:bg-muted cursor-pointer"
              title="Close preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[150px]">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No notifications at this time.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => onMarkNotificationRead(n.id)}
                  className={`p-3 rounded-[8px] border space-y-1 cursor-pointer transition-colors ${
                    !n.read ? 'border-primary/40 bg-primary/5' : 'border-border/60 bg-muted/20'
                  }`}
                >
                  <div className="flex items-center justify-between text-[12px] font-semibold text-foreground">
                    <span>{n.title}</span>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{n.message}</p>
                  <div className="text-[9px] text-muted-foreground font-mono pt-0.5">
                    {new Date(n.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-border/60 flex justify-end">
            <button
              onClick={() => setShowNotifDrawer(false)}
              className="px-3 h-[30px] rounded-[6px] text-[12px] font-semibold bg-muted hover:bg-muted/80 text-foreground cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Upload File Modal */}
      {uploadingReq && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleConfirmUpload} className="bg-card border border-border/70 rounded-[12px] max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-[14px] font-bold text-foreground flex items-center space-x-1.5">
                <Upload className="w-4 h-4 text-primary" />
                <span>Upload {uploadingReq.name}</span>
              </h3>
              <button type="button" onClick={() => setUploadingReq(null)} className="text-muted-foreground hover:text-foreground p-1 rounded-[4px] hover:bg-muted cursor-pointer">✕</button>
            </div>

            <p className="text-[12px] text-muted-foreground leading-relaxed">
              Select or capture a clear PDF or image of your {uploadingReq.name}.
            </p>

            <div className="border border-dashed border-border/70 rounded-[10px] p-6 text-center space-y-2 bg-muted/20 hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="w-6 h-6 text-primary mx-auto" />
              <div className="text-[13px] font-semibold text-foreground">Tap to browse document</div>
              <p className="text-[11px] text-muted-foreground">PDF, JPG, PNG up to 25MB</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-foreground">File Name</label>
              <input
                type="text"
                required
                value={simulatedFileName}
                onChange={(e) => setSimulatedFileName(e.target.value)}
                className="w-full bg-background border border-border/70 text-foreground rounded-[6px] px-3 h-[36px] focus:outline-none focus:ring-1 focus:ring-primary text-[13px] font-mono"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-border/60">
              <button type="button" onClick={() => setUploadingReq(null)} className="px-3 h-[32px] rounded-[6px] text-[12px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 h-[32px] rounded-[6px] text-[12px] font-semibold shadow-xs cursor-pointer transition-colors"
              >
                {isUploading ? 'Uploading...' : 'Confirm Upload'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Razorpay Payment Modal Simulation */}
      {showPaymentModal && activeFiling && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/70 rounded-[12px] max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded-[4px] bg-primary font-bold text-[9px] flex items-center justify-center text-primary-foreground">RZP</div>
                <h3 className="text-[14px] font-bold text-foreground">Pay CA Professional Fee</h3>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-muted-foreground hover:text-foreground p-1 rounded-[4px] hover:bg-muted cursor-pointer">✕</button>
            </div>

            <div className="bg-muted/30 p-3.5 rounded-[8px] border border-border/60 space-y-2 text-[12px]">
              <div className="flex justify-between text-muted-foreground font-medium">
                <span>Tax Return ({activeFiling.financialYear}):</span>
                <span className="font-semibold text-foreground">₹{activeFiling.feeAmount}</span>
              </div>
              <div className="flex justify-between text-muted-foreground font-medium">
                <span>Payment Processing Fee:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">₹0 Free</span>
              </div>
              <div className="pt-2 border-t border-border/60 flex justify-between font-bold text-[14px] text-foreground">
                <span>Total Amount:</span>
                <span className="text-emerald-600 dark:text-emerald-400">₹{activeFiling.feeAmount}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center justify-between p-3 rounded-[8px] bg-background border border-primary/50 text-foreground cursor-pointer shadow-xs">
                <span className="text-[13px] font-semibold">UPI (GPay / PhonePe / Paytm)</span>
                <input type="radio" checked readOnly className="text-primary focus:ring-0" />
              </label>
            </div>

            <button
              id="btn-confirm-razorpay-pay"
              onClick={handleConfirmRazorpayPayment}
              disabled={isProcessingPayment}
              className="w-full h-[38px] bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[13px] rounded-[8px] transition-colors flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>{isProcessingPayment ? 'Processing...' : `Pay ₹${activeFiling.feeAmount}`}</span>
            </button>
          </div>
        </div>
      )}

      {/* Identity Verification Modal (PAN + DOB Gate) */}
      {showIdentityModal && activeFiling && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleConfirmIdentity} className="bg-card border border-border/70 rounded-[12px] max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-[14px] font-bold text-foreground flex items-center space-x-2">
                <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Identity Verification</span>
              </h3>
              <button type="button" onClick={() => setShowIdentityModal(false)} className="text-muted-foreground hover:text-foreground p-1 rounded-[4px] hover:bg-muted cursor-pointer">✕</button>
            </div>

            <p className="text-[12px] text-muted-foreground leading-relaxed">
              Verify your PAN and Date of Birth to access your official vaulted documents.
            </p>

            {verificationError && (
              <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-[6px] text-[12px] font-medium text-rose-600 dark:text-rose-400 flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{verificationError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-foreground">PAN Number</label>
              <input
                type="text"
                required
                maxLength={10}
                placeholder="ABCDE1234F"
                value={inputPan}
                onChange={(e) => setInputPan(e.target.value.toUpperCase())}
                className="w-full bg-background border border-border/70 font-mono text-foreground rounded-[6px] px-3 h-[36px] text-[13px] focus:outline-none focus:ring-1 focus:ring-primary uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-foreground">Date of Birth</label>
              <input
                type="date"
                required
                value={inputDob}
                onChange={(e) => setInputDob(e.target.value)}
                className="w-full bg-background border border-border/70 text-foreground rounded-[6px] px-3 h-[36px] text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-border/60">
              <button type="button" onClick={() => setShowIdentityModal(false)} className="px-3 h-[32px] rounded-[6px] text-[12px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isVerifying}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 h-[32px] rounded-[6px] text-[12px] font-semibold shadow-xs cursor-pointer transition-colors"
              >
                {isVerifying ? 'Verifying...' : 'Verify & Unlock'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
