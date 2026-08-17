import React, { useState } from 'react';
import { Filing, Client, DocumentRequirement, FilingStatus } from '../../types';
import {
  CheckCircle2,
  Clock,
  CreditCard,
  FileCheck,
  FileText,
  AlertTriangle,
  Lock,
  Download,
  UploadCloud,
  FilePlus,
  ShieldCheck,
  ArrowRight,
  Info,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  UserCheck,
  FileSearch,
  Calculator,
} from 'lucide-react';

interface TaxFilingWorkflowTrackerProps {
  filing: Filing;
  client?: Client;
  requirements?: DocumentRequirement[];
  onUploadFinal?: () => void;
  onRequestDoc?: () => void;
  onPayNow?: () => void;
  onDownloadAck?: () => void;
  onVerifyPan?: () => void;
  isClientView?: boolean;
}

interface WorkflowStep {
  index: number;
  id: string;
  label: string;
  shortDesc: string;
  fullDesc: string;
  owner: 'Client' | 'Chartered Accountant' | 'Both';
  actionNeeded: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING';
  isCurrent: boolean;
}

export const TaxFilingWorkflowTracker: React.FC<TaxFilingWorkflowTrackerProps> = ({
  filing,
  client,
  requirements = [],
  onUploadFinal,
  onRequestDoc,
  onPayNow,
  onDownloadAck,
  onVerifyPan,
  isClientView = false,
}) => {
  const [showProcessGuide, setShowProcessGuide] = useState(false);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);

  // Determine current active step (0 to 4)
  const getActiveStepIndex = (status: FilingStatus): number => {
    switch (status) {
      case 'CREATED':
      case 'DOCUMENTS_REQUESTED':
        return 0;
      case 'DOCUMENTS_PARTIALLY_SUBMITTED':
      case 'DOCUMENTS_SUBMITTED':
        return 1;
      case 'UNDER_REVIEW':
      case 'ADDITIONAL_DOCUMENTS_REQUIRED':
      case 'FILING_IN_PROGRESS':
        return 2;
      case 'DOCUMENTS_READY':
      case 'PAYMENT_PENDING':
        return 3;
      case 'PAYMENT_COMPLETED':
        return filing.panDobVerified ? 4 : 3;
      case 'DOWNLOAD_UNLOCKED':
      case 'CLOSED':
      case 'FILING_COMPLETED':
        return 4;
      default:
        return Math.min(Math.floor((filing.progress / 100) * 4), 4);
    }
  };

  const activeIndex = getActiveStepIndex(filing.status);
  const isCompleted = filing.status === 'FILING_COMPLETED' || filing.status === 'DOWNLOAD_UNLOCKED' || filing.status === 'CLOSED';

  const pendingDocsCount = requirements.filter(
    (r) => r.status === 'PENDING' || r.status === 'REJECTED'
  ).length;
  const approvedDocsCount = requirements.filter((r) => r.status === 'APPROVED').length;
  const totalDocsCount = requirements.length || 4;

  const steps: WorkflowStep[] = [
    {
      index: 0,
      id: 'intake',
      label: '1. Setup',
      shortDesc: 'Profile linked',
      fullDesc: 'The tax filing is opened for the Assessment Year. Client identity, PAN, and basic salary structure are linked.',
      owner: 'Both',
      actionNeeded: 'Check that PAN and personal profile details match official tax records.',
      status: activeIndex > 0 ? 'COMPLETED' : activeIndex === 0 ? 'IN_PROGRESS' : 'UPCOMING',
      isCurrent: activeIndex === 0,
    },
    {
      index: 1,
      id: 'docs',
      label: '2. Documents',
      shortDesc: `${approvedDocsCount}/${totalDocsCount} verified`,
      fullDesc: 'Upload and review of Form 16, AIS/TIS, 26AS tax credits, bank statements, and deduction proofs.',
      owner: 'Client',
      actionNeeded: pendingDocsCount > 0 ? `Upload ${pendingDocsCount} remaining document(s)` : 'All requested documents uploaded and verified.',
      status: activeIndex > 1 ? 'COMPLETED' : activeIndex === 1 ? 'IN_PROGRESS' : 'UPCOMING',
      isCurrent: activeIndex === 1,
    },
    {
      index: 2,
      id: 'computation',
      label: '3. CA Review',
      shortDesc: 'Tax calculation',
      fullDesc: 'CA reviews deductions (80C, 80D, HRA), compares Old vs New Regime under Sec 115BAC, and computes net tax or refund.',
      owner: 'Chartered Accountant',
      actionNeeded: 'CA reviews deductions and generates the tax computation draft.',
      status: activeIndex > 2 ? 'COMPLETED' : activeIndex === 2 ? 'IN_PROGRESS' : 'UPCOMING',
      isCurrent: activeIndex === 2,
    },
    {
      index: 3,
      id: 'payment',
      label: '4. Payment',
      shortDesc: filing.paymentStatus === 'SUCCESS' ? 'Fee paid' : `₹${filing.feeAmount.toLocaleString('en-IN')} due`,
      fullDesc: 'Client reviews the prepared computation sheet, authorizes the filing, and pays the CA fee.',
      owner: 'Client',
      actionNeeded: filing.paymentStatus === 'SUCCESS' ? 'Fee paid. Ready for filing.' : `Pay CA fee of ₹${filing.feeAmount.toLocaleString('en-IN')}.`,
      status: activeIndex > 3 ? 'COMPLETED' : activeIndex === 3 ? 'IN_PROGRESS' : 'UPCOMING',
      isCurrent: activeIndex === 3,
    },
    {
      index: 4,
      id: 'filed',
      label: '5. Completed',
      shortDesc: isCompleted ? 'ITR-V filed' : 'Final submission',
      fullDesc: 'The return is filed on the Income Tax portal and the signed ITR-V acknowledgement is saved in the vault.',
      owner: 'Chartered Accountant',
      actionNeeded: isCompleted ? 'Download signed ITR-V acknowledgement and computation sheet.' : 'Upload official ITR-V acknowledgement.',
      status: isCompleted ? 'COMPLETED' : 'UPCOMING',
      isCurrent: activeIndex === 4,
    },
  ];

  const currentStep = steps[activeIndex] || steps[0];
  const inspectedStep = selectedStepIndex !== null ? steps[selectedStepIndex] : currentStep;

  return (
    <div className="bg-card border border-border/70 rounded-[8px] p-4 space-y-4 shadow-xs">
      
      {/* 1. Header Row: Title, Year, Status Pill & Guide Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <span className="text-[13px] font-semibold text-foreground">
              Filing Progress
            </span>
            <span className="font-mono text-[11px] font-semibold text-muted-foreground bg-muted/60 px-1.5 py-0.2 rounded border border-border/50">
              {filing.id}
            </span>
            <span className="text-[11px] font-medium text-muted-foreground hidden sm:inline">
              • AY {filing.assessmentYear} ({filing.financialYear})
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Form {filing.filingType || 'ITR-1'} • Income Tax E-Filing
          </p>
        </div>

        {/* Current State Pill & How it Works button */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setShowProcessGuide(!showProcessGuide)}
            className="flex items-center space-x-1 px-2 h-[26px] rounded-[5px] text-[11px] font-semibold text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted border border-border/60 transition-colors cursor-pointer"
            title="Learn how the filing process works"
          >
            <HelpCircle className="w-3.5 h-3.5 text-primary" />
            <span>Guide</span>
            {showProcessGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <span
            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-[5px] text-[11px] font-semibold border ${
              isCompleted
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                : filing.status === 'UNDER_REVIEW' || filing.status === 'DOCUMENTS_SUBMITTED'
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25'
                : filing.status === 'PAYMENT_PENDING' || filing.status === 'DOCUMENTS_READY'
                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <Clock className="w-3.5 h-3.5" />
            )}
            <span>{filing.status.replace(/_/g, ' ')}</span>
          </span>

          <span className="text-[12px] font-bold text-foreground font-mono bg-muted/50 px-2 py-0.5 rounded-[4px] border border-border/60">
            {filing.progress}%
          </span>
        </div>
      </div>

      {/* 2. Visual 5-Stage Stepper */}
      <div className="space-y-2">
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {steps.map((step) => {
            const isDone = step.status === 'COMPLETED';
            const isCurrent = step.isCurrent;
            const isSelected = selectedStepIndex === step.index;

            return (
              <button
                key={step.index}
                onClick={() => setSelectedStepIndex(selectedStepIndex === step.index ? null : step.index)}
                className={`text-left p-2 rounded-[6px] transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-muted/80 border-primary/60 ring-1 ring-primary/40'
                    : isCurrent
                    ? 'bg-primary/5 border-primary/30'
                    : isDone
                    ? 'bg-muted/20 border-border/50 hover:bg-muted/40'
                    : 'bg-muted/10 border-border/30 opacity-70 hover:opacity-100'
                }`}
              >
                {/* Visual Step Bar */}
                <div className="h-[4px] w-full rounded-full overflow-hidden bg-muted mb-2">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isDone
                        ? 'bg-emerald-500'
                        : isCurrent
                        ? 'bg-primary'
                        : 'bg-transparent'
                    }`}
                  />
                </div>

                {/* Step Content */}
                <div className="flex items-center space-x-1.5">
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : isCurrent ? (
                    <Clock className="w-3.5 h-3.5 text-primary shrink-0 animate-pulse" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground/40 shrink-0 flex items-center justify-center text-[9px] text-muted-foreground">
                      {step.index + 1}
                    </div>
                  )}
                  <p
                    className={`text-[11px] font-semibold truncate ${
                      isDone
                        ? 'text-foreground'
                        : isCurrent
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>

                <p className="text-[10px] text-muted-foreground truncate mt-1 hidden md:block">
                  {step.shortDesc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Active / Inspected Step Detail Callout */}
        <div className="p-3 rounded-[6px] bg-muted/25 border border-border/60 text-[12px] space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-foreground text-[12px]">
                {inspectedStep.label}
              </span>
              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/40">
                Action Owner: {inspectedStep.owner}
              </span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                inspectedStep.status === 'COMPLETED'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : inspectedStep.status === 'IN_PROGRESS'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {inspectedStep.status.replace(/_/g, ' ')}
              </span>
            </div>

            <span className="text-[11px] text-muted-foreground">
              {inspectedStep.actionNeeded}
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {inspectedStep.fullDesc}
          </p>
        </div>
      </div>

      {/* 3. Expandable "How Tax Filing Works" Guide */}
      {showProcessGuide && (
        <div className="p-4 rounded-[6px] bg-muted/30 border border-border/70 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="text-[13px] font-semibold text-foreground">
                Filing Process Guide
              </h3>
            </div>
            <span className="text-[11px] text-muted-foreground">Standard 5-Step Process</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 text-[11px]">
            <div className="p-2.5 bg-card border border-border/60 rounded-[5px] space-y-1">
              <div className="font-semibold text-foreground flex items-center space-x-1.5">
                <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">1</span>
                <span>Setup</span>
              </div>
              <p className="text-muted-foreground text-[10px] leading-normal">
                Open case, link PAN, personal details, and assign applicable ITR Form.
              </p>
            </div>

            <div className="p-2.5 bg-card border border-border/60 rounded-[5px] space-y-1">
              <div className="font-semibold text-foreground flex items-center space-x-1.5">
                <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">2</span>
                <span>Documents</span>
              </div>
              <p className="text-muted-foreground text-[10px] leading-normal">
                Upload Form 16, AIS/TIS, 26AS, bank statements, and deduction proofs.
              </p>
            </div>

            <div className="p-2.5 bg-card border border-border/60 rounded-[5px] space-y-1">
              <div className="font-semibold text-foreground flex items-center space-x-1.5">
                <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">3</span>
                <span>Compute</span>
              </div>
              <p className="text-muted-foreground text-[10px] leading-normal">
                CA reconciles TDS with 26AS, compares tax regimes, and drafts computation.
              </p>
            </div>

            <div className="p-2.5 bg-card border border-border/60 rounded-[5px] space-y-1">
              <div className="font-semibold text-foreground flex items-center space-x-1.5">
                <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">4</span>
                <span>Pay Fee</span>
              </div>
              <p className="text-muted-foreground text-[10px] leading-normal">
                Client reviews final computation, authorizes filing, and pays the fee.
              </p>
            </div>

            <div className="p-2.5 bg-card border border-border/60 rounded-[5px] space-y-1">
              <div className="font-semibold text-foreground flex items-center space-x-1.5">
                <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">5</span>
                <span>Filed</span>
              </div>
              <p className="text-muted-foreground text-[10px] leading-normal">
                Return is uploaded to the portal and the ITR-V is saved in the vault.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Action Context Bar (Actionable callout tailored to current state) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-[6px] bg-muted/20 border border-border/60 text-[12px]">
        
        {/* State Description */}
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          {isCompleted ? (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-foreground truncate font-medium">
                ITR successfully submitted. Acknowledgement (ITR-V) is vaulted and available for download.
              </span>
            </>
          ) : pendingDocsCount > 0 ? (
            <>
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-foreground truncate font-medium">
                {pendingDocsCount} document(s) pending client submission or verification.
              </span>
            </>
          ) : filing.paymentStatus !== 'SUCCESS' ? (
            <>
              <CreditCard className="w-4 h-4 text-purple-500 shrink-0" />
              <span className="text-foreground truncate font-medium">
                Computation completed. CA service fee of ₹{filing.feeAmount.toLocaleString('en-IN')} pending settlement.
              </span>
            </>
          ) : (
            <>
              <FileCheck className="w-4 h-4 text-primary shrink-0" />
              <span className="text-foreground truncate font-medium">
                All documents approved & computation verified. Ready for final ITR-V upload.
              </span>
            </>
          )}
        </div>

        {/* Primary Context Action Button */}
        <div className="flex items-center space-x-2 shrink-0">
          {!isClientView && (
            <>
              {pendingDocsCount > 0 && onRequestDoc && (
                <button
                  onClick={onRequestDoc}
                  className="px-2.5 h-[28px] rounded-[5px] bg-card hover:bg-muted text-foreground border border-border/70 text-[11px] font-semibold transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <FilePlus className="w-3.5 h-3.5 text-primary" />
                  <span>Request Doc</span>
                </button>
              )}

              {!isCompleted && onUploadFinal && (
                <button
                  onClick={onUploadFinal}
                  className="px-2.5 h-[28px] rounded-[5px] bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors cursor-pointer flex items-center space-x-1 shadow-2xs"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload ITR-V</span>
                </button>
              )}

              {isCompleted && onDownloadAck && (
                <button
                  onClick={onDownloadAck}
                  className="px-2.5 h-[28px] rounded-[5px] bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-semibold transition-colors cursor-pointer flex items-center space-x-1 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download ITR-V</span>
                </button>
              )}
            </>
          )}

          {isClientView && (
            <>
              {filing.paymentStatus !== 'SUCCESS' && onPayNow && (
                <button
                  onClick={onPayNow}
                  className="px-3 h-[28px] rounded-[5px] bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-semibold transition-colors cursor-pointer flex items-center space-x-1 shadow-2xs"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pay ₹{filing.feeAmount.toLocaleString('en-IN')}</span>
                </button>
              )}

              {isCompleted && onDownloadAck && (
                <button
                  onClick={onDownloadAck}
                  className="px-3 h-[28px] rounded-[5px] bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors cursor-pointer flex items-center space-x-1 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download ITR-V</span>
                </button>
              )}
            </>
          )}
        </div>

      </div>

    </div>
  );
};
