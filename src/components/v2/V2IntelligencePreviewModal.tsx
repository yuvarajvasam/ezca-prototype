import React, { useState } from 'react';
import { Sparkles, FileCode, CheckCircle2, AlertTriangle, ShieldCheck, Cpu, Globe, X } from 'lucide-react';

interface V2IntelligencePreviewModalProps {
  onClose: () => void;
}

export const V2IntelligencePreviewModal: React.FC<V2IntelligencePreviewModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'ocr' | 'validation' | 'eri'>('ocr');

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col justify-between overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">V2 Extension Points & Architecture Specs</h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/40">
                  DAY-1 ARCHITECTED
                </span>
              </div>
              <p className="text-xs text-slate-400">Document Intelligence, OCR Field Confidence, and ITD ERI Adapter Specs</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Nav Bar */}
        <div className="bg-slate-950 p-2 border-b border-slate-800 flex items-center justify-around text-xs">
          <button
            onClick={() => setActiveTab('ocr')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'ocr' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>1. Document OCR & Confidence</span>
          </button>

          <button
            onClick={() => setActiveTab('validation')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'validation' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>2. Cross-Doc Validation Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('eri')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'eri' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>3. ITD ERI Adapter Spec</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-300">
          
          {/* TAB 1: OCR EXTRACTION & CONFIDENCE */}
          {activeTab === 'ocr' && (
            <div className="space-y-4">
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Sample Classification</span>
                  <h4 className="text-sm font-bold text-white mt-0.5">Form 16 Part A & B Salary Certificate</h4>
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold px-3 py-1 rounded-full text-xs">
                  98.4% Classification Score
                </span>
              </div>

              <h4 className="font-bold text-white uppercase text-[10px] tracking-wider text-slate-400">
                Extracted Fields & Human-in-the-Loop Confidence Scoring:
              </h4>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { field: 'Employee Name', val: 'Yuvaraj Vasam', conf: '99.2%', src: 'Page 1, Header' },
                  { field: 'PAN Number', val: 'ABCDE1234F', conf: '99.8%', src: 'Page 1, Part A' },
                  { field: 'Employer Name', val: 'Tata Consultancy Services Ltd', conf: '98.1%', src: 'Page 1, Employer' },
                  { field: 'Gross Salary (Sec 17(1))', val: '₹14,50,000', conf: '97.6%', src: 'Page 2, Line 1a' },
                  { field: 'TDS Deducted (Sec 192)', val: '₹1,62,500', conf: '98.9%', src: 'Page 2, Line 17' },
                  { field: 'Standard Deduction (Sec 16(ia))', val: '₹75,000', conf: '99.5%', src: 'Page 2, Line 2' },
                ].map((item) => (
                  <div key={item.field} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex justify-between text-slate-400 text-[10px]">
                      <span>{item.field}</span>
                      <span className="text-emerald-400 font-bold">{item.conf} Conf</span>
                    </div>
                    <div className="font-bold text-white text-xs">{item.val}</div>
                    <div className="text-[9px] text-slate-500">Source: {item.src}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CROSS-DOC VALIDATION */}
          {activeTab === 'validation' && (
            <div className="space-y-4">
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                <h4 className="font-bold text-white text-sm">Cross-Document Tax Data Consistency Engine</h4>
                <p className="text-slate-400 text-xs mt-1">
                  Automatically flags mismatches between Form 16, AIS, Form 26AS, and Bank Statements before CA submission.
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-emerald-950/30 border border-emerald-800/60 p-3.5 rounded-xl space-y-1">
                  <div className="flex items-center space-x-2 text-emerald-300 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>TDS Verification: Passed</span>
                  </div>
                  <p className="text-slate-300">Form 16 TDS (₹1,62,500) matches 26AS Tax Credit (₹1,62,500) perfectly.</p>
                </div>

                <div className="bg-rose-950/40 border border-rose-800/60 p-3.5 rounded-xl space-y-1">
                  <div className="flex items-center space-x-2 text-rose-300 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Salary Income Mismatch Flagged for CA Review</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Form 16 Gross Salary reports ₹14,50,000, whereas ITD AIS reports ₹14,68,200 due to supplementary allowance. Route to CA review queue.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ITD ERI ADAPTER SPEC */}
          {activeTab === 'eri' && (
            <div className="space-y-4">
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Income Tax Department (ITD) ERI Adapter Interface</h4>
                  <p className="text-slate-400 text-xs mt-1">PRD Guardrail #94: Feature Flag ITD_API_ENABLED=false</p>
                </div>
                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold px-3 py-1 rounded-full text-[10px]">
                  GUARDED FEATURE FLAG
                </span>
              </div>

              <p className="text-slate-300 leading-relaxed">
                As specified in the TaxVault PRD, official Type-2 ERI integration is isolated behind the <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded font-mono">TaxAuthorityAdapter</code> interface. The specification includes taxpayer consent management and service request verification.
              </p>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-[11px] text-amber-300 space-y-1">
                <div className="text-slate-400 uppercase font-bold text-[9px]">Documented Type-2 ERI API Adapter Contract:</div>
                <div>• POST /auth/login (ERI Credentials Authentication)</div>
                <div>• POST /client/add (Register Taxpayer with Consent Token)</div>
                <div>• GET  /client/prefill (Retrieve AIS / 26AS Prefill Payload)</div>
                <div>• POST /return/validate (ITD Server Schema Validation)</div>
                <div>• POST /return/submit (Authorized ERI Return Filing)</div>
                <div>• POST /return/e-verify (Client OTP / Aadhaar e-Verification)</div>
                <div>• GET  /return/acknowledgement (Retrieve Official ITR V PDF)</div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Extensible Monorepo Architecture Ready for V2 Expansion</span>
          </div>

          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs"
          >
            Close Specs Preview
          </button>
        </div>

      </div>
    </div>
  );
};
