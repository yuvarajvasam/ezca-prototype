import React, { useState } from 'react';
import {
  Download,
  ShieldCheck,
  X,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  FileText,
  CheckCircle2,
  Lock,
  Calendar,
  Building2,
  User,
  QrCode,
  Sparkles,
} from 'lucide-react';

interface DocumentViewerModalProps {
  title: string;
  url?: string;
  versions?: any[];
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  title = 'Document Preview',
  url,
  versions = [],
  onClose,
}) => {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showMetadata, setShowMetadata] = useState(true);

  const safeTitle = title || 'Document Preview';
  const totalPages = safeTitle.toLowerCase().includes('form 16') || safeTitle.toLowerCase().includes('computation') ? 2 : 1;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 15, 180));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 15, 60));
  const handleResetZoom = () => setZoom(100);
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (url && url !== '#' && !url.startsWith('javascript:')) {
      const a = document.createElement('a');
      a.href = url;
      a.download = `${safeTitle.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert(`Downloading official PDF copy: ${safeTitle}.pdf`);
    }
  };

  const isAck = safeTitle.toLowerCase().includes('itr') || safeTitle.toLowerCase().includes('ack') || safeTitle.toLowerCase().includes('acknowledgement');
  const isComputation = safeTitle.toLowerCase().includes('computation') || safeTitle.toLowerCase().includes('calculation');
  const isForm16 = safeTitle.toLowerCase().includes('form 16');

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-card border border-border/80 rounded-[12px] max-w-5xl w-full h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* PDF Viewer Top Navigation & Control Toolbar */}
        <div className="px-3 sm:px-4 py-2.5 bg-card border-b border-border/70 flex items-center justify-between gap-2 shrink-0 z-10">
          
          {/* Document Title & Badge */}
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-[6px] bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-[13px] sm:text-[14px] font-bold text-foreground truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                  {title}
                </h3>
                <span className="hidden sm:inline-flex text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[4px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Verified PDF
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground font-mono truncate">
                SHA-256: 8f94e2b0...e41c • Secure 256-bit AES Vault
              </p>
            </div>
          </div>

          {/* Action & Control Buttons */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
            
            {/* Zoom Controls */}
            <div className="hidden md:flex items-center bg-muted/60 p-0.5 rounded-[6px] border border-border/60">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoom <= 60}
                className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-40 rounded-[4px] transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="px-1.5 text-[11px] font-mono font-medium text-foreground hover:bg-muted/80 rounded-[3px] transition-colors"
                title="Reset to 100%"
              >
                {zoom}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoom >= 180}
                className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-40 rounded-[4px] transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Page Navigation */}
            {totalPages > 1 && (
              <div className="flex items-center bg-muted/60 p-0.5 rounded-[6px] border border-border/60 text-xs">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-40 rounded-[4px] cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-1.5 text-[11px] font-medium text-muted-foreground">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-40 rounded-[4px] cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Rotate */}
            <button
              type="button"
              onClick={handleRotate}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-[6px] transition-colors cursor-pointer"
              title="Rotate Page"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Print */}
            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:inline-flex p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-[6px] transition-colors cursor-pointer"
              title="Print Document"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            {/* Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center space-x-1.5 bg-primary hover:bg-primary/90 text-primary-foreground px-2.5 sm:px-3 h-[30px] rounded-[6px] text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-[6px] transition-colors cursor-pointer ml-1"
              title="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewer Main Body */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-muted/30 overflow-hidden">
          
          {/* Document Canvas Workspace */}
          <div className="flex-1 overflow-auto p-3 sm:p-6 flex items-start justify-center custom-scrollbar">
            <div
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
              }}
              className="w-full max-w-[760px] bg-white text-slate-900 border border-slate-300 rounded-[4px] shadow-lg p-6 sm:p-10 space-y-6 select-text my-2"
            >
              
              {/* Document Header with Official Emblem / Logo */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold tracking-wider uppercase text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                      GOVERNMENT OF INDIA • INCOME TAX DEPARTMENT
                    </span>
                  </div>
                  <h1 className="text-[18px] sm:text-[20px] font-black tracking-tight text-slate-900 mt-1.5 uppercase font-serif">
                    {isAck
                      ? 'INDIAN INCOME TAX RETURN ACKNOWLEDGEMENT [ITR-V]'
                      : isComputation
                      ? 'STATEMENT OF TAX COMPUTATION & SCHEDULE'
                      : isForm16
                      ? 'FORM NO. 16 [PART A & PART B CERTIFICATE]'
                      : title.toUpperCase()}
                  </h1>
                  <p className="text-[12px] text-slate-600 font-sans mt-0.5">
                    Filed under Section 139(1) of the Income-tax Act, 1961 • Assessment Year 2026–27
                  </p>
                </div>

                <div className="text-right shrink-0 hidden sm:block">
                  <div className="w-16 h-16 border-2 border-slate-900 rounded p-1 flex flex-col items-center justify-center bg-slate-50 text-slate-900 font-mono text-[9px]">
                    <QrCode className="w-10 h-10 text-slate-800" />
                    <span className="text-[8px] font-bold">VERIFIED</span>
                  </div>
                </div>
              </div>

              {/* Page 1 Content */}
              {currentPage === 1 && (
                <div className="space-y-5 text-xs text-slate-800">
                  
                  {/* Taxpayer Information Grid */}
                  <div className="border border-slate-300 rounded overflow-hidden">
                    <div className="bg-slate-100 px-3 py-1.5 font-bold text-[11px] uppercase tracking-wider border-b border-slate-300 text-slate-700">
                      1. Taxpayer Assessment Details
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-white">
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-semibold block">Permanent Account Number (PAN)</span>
                        <span className="font-mono font-bold text-[13px] text-slate-900">ABCDE1234F</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-semibold block">Name of Taxpayer</span>
                        <span className="font-bold text-[13px] text-slate-900">Yuvaraj Vasam</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-semibold block">Status & Filing Type</span>
                        <span className="font-medium text-slate-900">Individual • Resident</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-semibold block">Assessment Year</span>
                        <span className="font-mono font-bold text-slate-900">2026–27</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-semibold block">Financial Year (Previous Year)</span>
                        <span className="font-mono text-slate-900">2025–26</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-semibold block">E-Filing Acknowledgement No.</span>
                        <span className="font-mono font-bold text-emerald-700">881920192011</span>
                      </div>
                    </div>
                  </div>

                  {/* Income Computation Table */}
                  <div className="border border-slate-300 rounded overflow-hidden">
                    <div className="bg-slate-100 px-3 py-1.5 font-bold text-[11px] uppercase tracking-wider border-b border-slate-300 text-slate-700 flex justify-between">
                      <span>2. Computation of Total Income & Tax Liability</span>
                      <span className="font-mono font-normal">Amounts in INR (₹)</span>
                    </div>
                    <table className="w-full text-left text-xs border-collapse">
                      <tbody>
                        <tr className="border-b border-slate-200">
                          <td className="p-2.5 text-slate-600 font-medium">1. Gross Salary Income (as per Form 16)</td>
                          <td className="p-2.5 text-right font-mono font-semibold text-slate-900">₹ 14,50,000</td>
                        </tr>
                        <tr className="border-b border-slate-200 bg-slate-50/50">
                          <td className="p-2.5 text-slate-600 font-medium">2. Standard Deduction u/s 16(ia)</td>
                          <td className="p-2.5 text-right font-mono text-slate-700">- ₹ 50,000</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2.5 text-slate-600 font-medium">3. Income from Other Sources (Savings Bank Interest + FD)</td>
                          <td className="p-2.5 text-right font-mono font-semibold text-slate-900">₹ 24,600</td>
                        </tr>
                        <tr className="border-b border-slate-300 font-bold bg-slate-100/60">
                          <td className="p-2.5 text-slate-900">4. Gross Total Income (1 - 2 + 3)</td>
                          <td className="p-2.5 text-right font-mono text-slate-900">₹ 14,24,600</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2.5 text-slate-600 font-medium">5. Deductions under Chapter VI-A (80C, 80D, 80TTA)</td>
                          <td className="p-2.5 text-right font-mono text-slate-700">- ₹ 1,60,000</td>
                        </tr>
                        <tr className="border-b-2 border-slate-400 font-bold bg-slate-100">
                          <td className="p-2.5 text-slate-900 text-[13px]">6. Total Taxable Income</td>
                          <td className="p-2.5 text-right font-mono text-slate-900 text-[13px]">₹ 12,64,600</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2.5 text-slate-600 font-medium">7. Total Tax Payable on Taxable Income</td>
                          <td className="p-2.5 text-right font-mono font-semibold text-slate-900">₹ 1,56,250</td>
                        </tr>
                        <tr className="border-b border-slate-200 bg-slate-50/50">
                          <td className="p-2.5 text-slate-600 font-medium">8. Health & Education Cess @ 4%</td>
                          <td className="p-2.5 text-right font-mono text-slate-700">₹ 6,250</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2.5 text-slate-600 font-medium">9. Taxes Paid: Total TDS Deposited (by TCS Ltd)</td>
                          <td className="p-2.5 text-right font-mono text-emerald-700 font-semibold">₹ 1,62,500</td>
                        </tr>
                        <tr className="border-t-2 border-slate-900 font-bold bg-emerald-50 text-emerald-950">
                          <td className="p-3 text-[13px]">10. NET REFUND / (TAX PAYABLE)</td>
                          <td className="p-3 text-right font-mono text-[14px] text-emerald-700">₹ 0 (Nil Balance)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Verification Statement & CA Digital Stamp */}
                  <div className="border border-slate-300 rounded p-3.5 bg-slate-50 space-y-3">
                    <p className="text-[10px] text-slate-600 leading-relaxed italic">
                      "I, Yuvaraj Vasam, solemnly declare that to the best of my knowledge and belief, the information given in the return and the schedules thereto is correct and complete and is in accordance with the provisions of the Income-tax Act, 1961."
                    </p>
                    
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-semibold">Prepared & Filed By Authorized Representative</span>
                        <span className="font-bold text-[12px] text-slate-900">CA Rajesh Kothari (FCA, M.No: 045129)</span>
                        <p className="text-[10px] text-slate-600">Kothari & Associates Chartered Accountants</p>
                      </div>

                      <div className="text-right border-2 border-emerald-600 bg-emerald-50 px-3 py-1.5 rounded text-emerald-800 font-mono text-[10px]">
                        <div className="font-bold flex items-center gap-1 justify-end">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>DSC DIGITALLY SIGNED</span>
                        </div>
                        <span className="text-[9px] text-emerald-700">Date: 15-Aug-2026 11:24 IST</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* Page 2 Content (Schedule of Deductions & Bank Verification) */}
              {currentPage === 2 && (
                <div className="space-y-5 text-xs text-slate-800">
                  <div className="border border-slate-300 rounded overflow-hidden">
                    <div className="bg-slate-100 px-3 py-1.5 font-bold text-[11px] uppercase tracking-wider border-b border-slate-300 text-slate-700">
                      Schedule Chapter VI-A Deductions & Bank Verification
                    </div>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <tr>
                          <th className="p-2.5">SECTION</th>
                          <th className="p-2.5">DESCRIPTION & PARTICULARS</th>
                          <th className="p-2.5 text-right">ELIGIBLE AMOUNT</th>
                          <th className="p-2.5 text-right">CLAIMED AMOUNT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="p-2.5 font-mono font-bold">80C</td>
                          <td className="p-2.5">Public Provident Fund (PPF) + Employee EPF</td>
                          <td className="p-2.5 text-right font-mono">₹ 1,50,000</td>
                          <td className="p-2.5 text-right font-mono font-bold">₹ 1,50,000</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono font-bold">80D</td>
                          <td className="p-2.5">Mediclaim Health Insurance (Self & Family)</td>
                          <td className="p-2.5 text-right font-mono">₹ 25,000</td>
                          <td className="p-2.5 text-right font-mono font-bold">₹ 25,000</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono font-bold">80TTA</td>
                          <td className="p-2.5">Interest on Savings Accounts</td>
                          <td className="p-2.5 text-right font-mono">₹ 10,000</td>
                          <td className="p-2.5 text-right font-mono font-bold">₹ 10,000</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="border border-slate-300 rounded p-4 bg-slate-50 space-y-2">
                    <h4 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">
                      Verified Bank Account for Direct Tax Refund Credit
                    </h4>
                    <div className="grid grid-cols-3 gap-3 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Bank Name</span>
                        <strong className="text-slate-900">HDFC Bank Ltd</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Account Number</span>
                        <strong className="font-mono text-slate-900">XXXXXXXX4819</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">IFSC Code</span>
                        <strong className="font-mono text-slate-900">HDFC0000128</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Document Footer Bar */}
              <div className="border-t border-slate-300 pt-3 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Page {currentPage} of {totalPages}</span>
                <span>TaxVault Engine v2.4 • Non-tamperable PDF</span>
                <span>Document ID: TXV-2026-992140</span>
              </div>

            </div>
          </div>

          {/* Right Inspector & Audit Trail Drawer */}
          <div className="w-full md:w-72 bg-card border-t md:border-t-0 md:border-l border-border/70 p-3.5 space-y-3.5 shrink-0 overflow-y-auto custom-scrollbar text-xs">
            
            <div className="flex items-center justify-between pb-1 border-b border-border/60">
              <h4 className="font-bold text-foreground text-[12px] flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Vault Verification</span>
              </h4>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-[4px] border border-emerald-500/20">
                ACTIVE
              </span>
            </div>

            {/* Checksum & Storage Properties */}
            <div className="bg-muted/40 border border-border/60 rounded-[8px] p-3 space-y-2">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">File Name</span>
                <span className="text-[11px] font-mono font-medium text-foreground break-all">
                  {title.replace(/\s+/g, '_')}.pdf
                </span>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Issued By</span>
                <span className="text-[11px] font-medium text-foreground">
                  CA Rajesh Kothari & Co.
                </span>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Certified Timestamp</span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  15 Aug 2026, 11:24 AM IST
                </span>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Encryption</span>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  AES-256 Cloud Encrypted
                </span>
              </div>
            </div>

            {/* Version History */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Version History ({versions.length > 0 ? versions.length : '1 Version'})
              </span>

              <div className="space-y-1.5">
                <div className="p-2 rounded-[6px] bg-primary/5 border border-primary/25 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-foreground block">Version 1.0 (Current)</span>
                    <span className="text-[10px] text-muted-foreground font-mono">420 KB • Certified Final</span>
                  </div>
                  <span className="text-[9px] bg-primary text-primary-foreground font-bold px-1.5 py-0.5 rounded-[4px]">
                    LATEST
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t border-border/60 space-y-1.5">
              <button
                type="button"
                onClick={handleDownload}
                className="w-full flex items-center justify-center space-x-1.5 bg-primary hover:bg-primary/90 text-primary-foreground h-[32px] rounded-[6px] text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Certified Copy</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
