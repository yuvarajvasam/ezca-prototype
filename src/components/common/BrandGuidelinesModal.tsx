import React, { useState } from 'react';
import {
  X,
  Check,
  Copy,
  Layers,
  Grid,
  Sparkles,
  Info,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Terminal,
  Code,
  Palette,
  Type,
  Maximize2,
} from 'lucide-react';

interface BrandGuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const BrandGuidelinesModal: React.FC<BrandGuidelinesModalProps> = ({
  isOpen,
  onClose,
  currentTheme = 'dark',
  onToggleTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'01' | '02' | '03'>('01');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const darkSwatches = [
    { name: 'Background', hex: '#000101', role: 'Primary Canvas' },
    { name: 'Foreground', hex: '#FBFAF8', role: 'Main Text & Titles' },
    { name: 'Card / Panel', hex: '#09090b', role: 'Surface Elevation' },
    { name: 'Muted / Hover', hex: '#18181b', role: 'Subtle Background' },
    { name: 'Border / Line', hex: '#282424', role: '1px Sharp Borders' },
    { name: 'Muted Text', hex: '#A6A09B', role: 'Metadata & Labels' },
    { name: 'Info / Accent', hex: '#2A7FFE', role: 'Primary System Blue' },
    { name: 'Warn / Alert', hex: '#FF6801', role: 'Pending / Action Needed' },
    { name: 'Error / Critical', hex: '#FA2C37', role: 'Destructive / High Risk' },
    { name: 'Success / Safe', hex: '#01C951', role: 'Verified / Approved' },
  ];

  const lightSwatches = [
    { name: 'Background', hex: '#FAFAFA', role: 'Primary White Canvas' },
    { name: 'Foreground', hex: '#0C0B08', role: 'Deep Dark Text' },
    { name: 'Card / Panel', hex: '#FFFFFF', role: 'Clean Surface' },
    { name: 'Muted / Hover', hex: '#F4F5F5', role: 'Subtle Gray Fill' },
    { name: 'Border / Line', hex: '#E6E4E4', role: 'Crisp Border Line' },
    { name: 'Muted Text', hex: '#79706A', role: 'Metadata & Labels' },
    { name: 'Info / Accent', hex: '#2A7FFE', role: 'Primary System Blue' },
    { name: 'Warn / Alert', hex: '#FF6801', role: 'Pending / Action Needed' },
    { name: 'Error / Critical', hex: '#FA2C37', role: 'Destructive / High Risk' },
    { name: 'Success / Safe', hex: '#01C951', role: 'Verified / Approved' },
  ];

  const activeSwatches = currentTheme === 'dark' ? darkSwatches : lightSwatches;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-5xl max-h-[92vh] bg-[#000101] border border-[#282424] text-[#FBFAF8] rounded-[0.2rem] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Top Monospaced Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#09090b] border-b border-[#282424]">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 text-[11px] font-mono tracking-wider text-[#A6A09B] uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#2A7FFE]" />
              <span>SYSTEM</span>
              <span>/</span>
              <span>TAXVAULT</span>
              <span>/</span>
              <span className="text-[#FBFAF8] font-semibold">BRAND_GUIDELINES_V1.0</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="px-2.5 py-1 text-[11px] font-mono uppercase bg-[#18181b] border border-[#282424] rounded-[0.2rem] text-[#A6A09B] hover:text-[#FBFAF8] transition-colors"
              >
                THEME: {currentTheme.toUpperCase()}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-[#A6A09B] hover:text-[#FBFAF8] hover:bg-[#18181b] rounded-[0.2rem] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs: 01 Foundations | 02 Motifs | 03 Components */}
        <div className="flex items-center space-x-2 px-6 pt-4 pb-2 border-b border-[#282424] bg-[#000101]">
          <button
            onClick={() => setActiveTab('01')}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-mono tracking-wider uppercase rounded-[0.2rem] transition-all ${
              activeTab === '01'
                ? 'bg-[#FBFAF8] text-[#1D1916] font-bold shadow-sm'
                : 'text-[#A6A09B] hover:text-[#FBFAF8] hover:bg-[#18181b]'
            }`}
          >
            <span>01</span>
            <span>FOUNDATIONS</span>
          </button>

          <button
            onClick={() => setActiveTab('02')}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-mono tracking-wider uppercase rounded-[0.2rem] transition-all ${
              activeTab === '02'
                ? 'bg-[#FBFAF8] text-[#1D1916] font-bold shadow-sm'
                : 'text-[#A6A09B] hover:text-[#FBFAF8] hover:bg-[#18181b]'
            }`}
          >
            <span>02</span>
            <span>MOTIFS & PATTERNS</span>
          </button>

          <button
            onClick={() => setActiveTab('03')}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-mono tracking-wider uppercase rounded-[0.2rem] transition-all ${
              activeTab === '03'
                ? 'bg-[#FBFAF8] text-[#1D1916] font-bold shadow-sm'
                : 'text-[#A6A09B] hover:text-[#FBFAF8] hover:bg-[#18181b]'
            }`}
          >
            <span>03</span>
            <span>COMPONENTS</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-8 bg-[#000101] flex-1">
          
          {/* TAB 01: FOUNDATIONS */}
          {activeTab === '01' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Section Header */}
              <div>
                <div className="flex items-center space-x-2 text-[11px] font-mono tracking-widest text-[#2A7FFE] uppercase mb-1">
                  <Palette className="w-3.5 h-3.5" />
                  <span>01 FOUNDATIONS</span>
                </div>
                <h2 className="text-2xl font-medium tracking-tight text-[#FBFAF8]">
                  Color System, Typography & Corner Geometry
                </h2>
                <p className="text-xs text-[#A6A09B] mt-1 max-w-2xl">
                  Ultra-clean technical aesthetic inspired by high-precision developer tools. Sharp 0.2rem corner radius, monospaced metadata labels, and high contrast typography.
                </p>
              </div>

              {/* Color Palette Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#A6A09B]">
                    COLOR PALETTE TOKENS ({currentTheme.toUpperCase()} MODE)
                  </span>
                  {copiedHex && (
                    <span className="text-[11px] font-mono text-[#01C951] flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>Copied {copiedHex} to clipboard!</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {activeSwatches.map((s) => (
                    <div
                      key={s.name}
                      onClick={() => handleCopy(s.hex)}
                      className="group cursor-pointer p-3 bg-[#09090b] border border-[#282424] rounded-[0.2rem] hover:border-[#2A7FFE] transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div
                          className="w-full h-10 rounded-[0.2rem] border border-white/10"
                          style={{ backgroundColor: s.hex }}
                        />
                        <div>
                          <p className="text-xs font-medium text-[#FBFAF8] group-hover:text-[#2A7FFE] transition-colors">
                            {s.name}
                          </p>
                          <p className="text-[10px] font-mono text-[#A6A09B]">{s.role}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[#A6A09B] pt-2 border-t border-[#282424]">
                        <span>{s.hex}</span>
                        <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Typography Spec Showcase */}
              <div className="p-5 bg-[#09090b] border border-[#282424] rounded-[0.2rem] space-y-4">
                <div className="flex items-center justify-between border-b border-[#282424] pb-3">
                  <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-[#A6A09B]">
                    <Type className="w-4 h-4 text-[#2A7FFE]" />
                    <span>TYPOGRAPHY HIERARCHY (GEIST SANS & GEIST MONO)</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border-b border-[#282424]/60 pb-3">
                    <span className="text-[10px] font-mono uppercase text-[#A6A09B]">DISPLAY HEADING — TEXT-4XL / TRACKING-TIGHT / FONT-MEDIUM</span>
                    <p className="text-3xl sm:text-4xl font-medium tracking-tight text-[#FBFAF8] mt-1">
                      TaxVault Client Operations
                    </p>
                  </div>

                  <div className="border-b border-[#282424]/60 pb-3">
                    <span className="text-[10px] font-mono uppercase text-[#A6A09B]">SECTION TITLE — TEXT-XL / TRACKING-TIGHT / FONT-MEDIUM</span>
                    <p className="text-xl font-medium tracking-tight text-[#FBFAF8] mt-1">
                      01 Structured Document Collection & Audit Trail
                    </p>
                  </div>

                  <div className="border-b border-[#282424]/60 pb-3">
                    <span className="text-[10px] font-mono uppercase text-[#A6A09B]">BODY TEXT — TEXT-SM / LEADING-RELAXED</span>
                    <p className="text-sm leading-relaxed text-[#A6A09B] mt-1">
                      Designed to streamline Chartered Accountant client workflows by replacing unstructured chat messages with encrypted, structured document vaults.
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#A6A09B]">MONO METADATA LABEL — FONT-MONO / TEXT-[11PX] / UPPERCASE / TRACKING-WIDER</span>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-[#2A7FFE] mt-1">
                      SYSTEM / TENANT_ID: TENANT-KOTHARI-01 / STATUS: VERIFIED_PROD
                    </p>
                  </div>
                </div>
              </div>

              {/* Corner Geometry & Radius Rules */}
              <div className="p-5 bg-[#09090b] border border-[#282424] rounded-[0.2rem] space-y-3">
                <span className="text-xs font-mono uppercase tracking-wider text-[#A6A09B]">
                  CORNER GEOMETRY & RADIUS RULES
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 bg-[#000101] border border-[#282424] rounded-[0.2rem] space-y-2">
                    <span className="text-[10px] font-mono text-[#01C951]">REQUIRED (0.2rem / 3px)</span>
                    <p className="text-xs text-[#FBFAF8] font-medium">Standard Controls & Cards</p>
                    <p className="text-[11px] text-[#A6A09B]">Tight, sharp minimal corners. Used on buttons, inputs, cards, and modals.</p>
                  </div>

                  <div className="p-4 bg-[#000101] border border-[#282424] rounded-none space-y-2">
                    <span className="text-[10px] font-mono text-[#2A7FFE]">SPECIAL (0px Sharp)</span>
                    <p className="text-xs text-[#FBFAF8] font-medium">Code Blocks & System Strips</p>
                    <p className="text-[11px] text-[#A6A09B]">Zero border-radius for code snippets, raw data tables, and top metadata bars.</p>
                  </div>

                  <div className="p-4 bg-[#000101] border border-[#FA2C37]/40 rounded-2xl space-y-2 opacity-50">
                    <span className="text-[10px] font-mono text-[#FA2C37]">DISALLOWED (24px+ Large Pills)</span>
                    <p className="text-xs text-[#FBFAF8] font-medium">Over-Rounded Cards</p>
                    <p className="text-[11px] text-[#A6A09B]">Avoid soft rounded bubbles on container cards to preserve the technical aesthetic.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 02: MOTIFS */}
          {activeTab === '02' && (
            <div className="space-y-8 animate-fadeIn">
              
              <div>
                <div className="flex items-center space-x-2 text-[11px] font-mono tracking-widest text-[#2A7FFE] uppercase mb-1">
                  <Grid className="w-3.5 h-3.5" />
                  <span>02 MOTIFS & PATTERNS</span>
                </div>
                <h2 className="text-2xl font-medium tracking-tight text-[#FBFAF8]">
                  Grid Systems, Dot Matrix & Monospaced Breadcrumbs
                </h2>
                <p className="text-xs text-[#A6A09B] mt-1 max-w-2xl">
                  Background grids and subtle textures add depth without visual clutter.
                </p>
              </div>

              {/* Grid Background Pattern Demo */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#A6A09B]">02.1 GRID MATRIX (32px Grid Lines)</span>
                <div className="h-40 bg-grid bg-[#000101] border border-[#282424] rounded-[0.2rem] p-4 flex items-end justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#A6A09B] bg-[#09090b]/90 px-2.5 py-1 border border-[#282424] rounded-[0.2rem]">
                    BG-GRID (32px LINE MATRIX)
                  </span>
                  <span className="font-mono text-[11px] text-[#2A7FFE] bg-[#09090b]/90 px-2.5 py-1 border border-[#282424] rounded-[0.2rem]">
                    TAXVAULT_MATRIX_01
                  </span>
                </div>
              </div>

              {/* Dot Matrix Pattern Demo */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#A6A09B]">02.2 DOT MATRIX (16px Radial Dots)</span>
                <div className="h-40 bg-dot bg-[#000101] border border-[#282424] rounded-[0.2rem] p-4 flex items-end justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#A6A09B] bg-[#09090b]/90 px-2.5 py-1 border border-[#282424] rounded-[0.2rem]">
                    BG-DOT (16px RADIAL MATRIX)
                  </span>
                  <span className="font-mono text-[11px] text-[#01C951] bg-[#09090b]/90 px-2.5 py-1 border border-[#282424] rounded-[0.2rem]">
                    VERIFIED_CANVAS
                  </span>
                </div>
              </div>

              {/* Monospaced System Strip Demo */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#A6A09B]">02.3 MONOSPACED BREADCRUMB STRIP</span>
                <div className="bg-[#09090b] border border-[#282424] p-3 rounded-[0.2rem] flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
                  <div className="flex items-center space-x-2 text-[#A6A09B]">
                    <Terminal className="w-3.5 h-3.5 text-[#2A7FFE]" />
                    <span>TENANT</span>
                    <span>/</span>
                    <span>KOTHARI_CA</span>
                    <span>/</span>
                    <span className="text-[#FBFAF8]">CLIENT_PORTAL</span>
                  </div>
                  <div className="flex items-center space-x-3 text-[#A6A09B]">
                    <span>STATUS: ONLINE</span>
                    <span className="w-2 h-2 rounded-full bg-[#01C951] animate-pulse" />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 03: COMPONENTS */}
          {activeTab === '03' && (
            <div className="space-y-8 animate-fadeIn">
              
              <div>
                <div className="flex items-center space-x-2 text-[11px] font-mono tracking-widest text-[#2A7FFE] uppercase mb-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>03 COMPONENTS</span>
                </div>
                <h2 className="text-2xl font-medium tracking-tight text-[#FBFAF8]">
                  Buttons, Inputs, Cards, Callouts & Badges
                </h2>
                <p className="text-xs text-[#A6A09B] mt-1 max-w-2xl">
                  Re-usable UI elements built strictly around the 0.2rem tight radius, high contrast typography, and dashed accent rules.
                </p>
              </div>

              {/* Button Variants Showcase */}
              <div className="p-5 bg-[#09090b] border border-[#282424] rounded-[0.2rem] space-y-4">
                <span className="text-xs font-mono uppercase tracking-wider text-[#A6A09B]">03.1 BUTTON VARIANTS</span>
                <div className="flex flex-wrap items-center gap-3">
                  <button className="px-4 py-2 bg-[#FBFAF8] text-[#1D1916] text-xs font-semibold rounded-[0.2rem] hover:bg-white transition-colors">
                    DEFAULT (SOLID)
                  </button>
                  <button className="px-4 py-2 bg-[#282424] text-[#FBFAF8] text-xs font-medium rounded-[0.2rem] hover:bg-[#322d2d] transition-colors">
                    SECONDARY
                  </button>
                  <button className="px-4 py-2 border border-[#282424] text-[#FBFAF8] text-xs font-medium rounded-[0.2rem] hover:bg-[#18181b] transition-colors">
                    OUTLINE
                  </button>
                  <button className="px-4 py-2 text-[#A6A09B] hover:text-[#FBFAF8] text-xs font-medium rounded-[0.2rem] hover:bg-[#18181b] transition-colors">
                    GHOST
                  </button>
                  <button className="px-4 py-2 bg-[#FA2C37] text-white text-xs font-medium rounded-[0.2rem] hover:bg-[#e02630] transition-colors">
                    DESTRUCTIVE
                  </button>
                </div>
              </div>

              {/* Callouts Showcase (Info, Warn, Error, Success) */}
              <div className="space-y-3">
                <span className="text-xs font-mono uppercase tracking-wider text-[#A6A09B]">03.2 DASHED CALLOUT BOXES</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Info Callout */}
                  <div className="callout-info p-3.5 space-y-1">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-[#2A7FFE]">
                      <Info className="w-4 h-4" />
                      <span className="font-mono uppercase text-[11px] tracking-wider">01 INFO CALLOUT</span>
                    </div>
                    <p className="text-xs text-[#FBFAF8] pl-6">
                      System automatically reconciles Form 26AS data with client uploaded Form 16 PDFs.
                    </p>
                  </div>

                  {/* Warn Callout */}
                  <div className="callout-warn p-3.5 space-y-1">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-[#FF6801]">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-mono uppercase text-[11px] tracking-wider">02 WARNING CALLOUT</span>
                    </div>
                    <p className="text-xs text-[#FBFAF8] pl-6">
                      Capital gains statement missing for Q3 trading activity. Client notification dispatched.
                    </p>
                  </div>

                  {/* Error Callout */}
                  <div className="callout-error p-3.5 space-y-1">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-[#FA2C37]">
                      <AlertOctagon className="w-4 h-4" />
                      <span className="font-mono uppercase text-[11px] tracking-wider">03 ERROR CALLOUT</span>
                    </div>
                    <p className="text-xs text-[#FBFAF8] pl-6">
                      PAN mismatch detected between Income Tax Portal record and Aadhaar certificate.
                    </p>
                  </div>

                  {/* Success Callout */}
                  <div className="callout-success p-3.5 space-y-1">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-[#01C951]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="font-mono uppercase text-[11px] tracking-wider">04 SUCCESS CALLOUT</span>
                    </div>
                    <p className="text-xs text-[#FBFAF8] pl-6">
                      Payment received via Razorpay UPI. TaxVault receipt generated and saved in Vault.
                    </p>
                  </div>

                </div>
              </div>

              {/* Form Input Spec */}
              <div className="p-5 bg-[#09090b] border border-[#282424] rounded-[0.2rem] space-y-3">
                <span className="text-xs font-mono uppercase tracking-wider text-[#A6A09B]">03.3 SHARP FORM INPUTS WITH TOP MONO LABELS</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#A6A09B]">CLIENT PAN NUMBER</label>
                    <input
                      type="text"
                      readOnly
                      value="ABCDE1234F"
                      className="w-full bg-[#000101] border border-[#282424] rounded-[0.2rem] px-3 py-2 text-xs font-mono text-[#FBFAF8] focus:border-[#2A7FFE] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#A6A09B]">FILING YEAR</label>
                    <input
                      type="text"
                      readOnly
                      value="AY 2025-26"
                      className="w-full bg-[#000101] border border-[#282424] rounded-[0.2rem] px-3 py-2 text-xs font-mono text-[#FBFAF8] focus:border-[#2A7FFE] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Card with Dashed Footer Rule */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#A6A09B]">03.4 FLAT CARD WITH DASHED FOOTER RULE</span>
                <div className="p-4 bg-[#09090b] border border-[#282424] rounded-[0.2rem] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-[#FBFAF8]">ITR-3 Business & Profession Filing</h3>
                      <p className="text-xs text-[#A6A09B]">Kothari Enterprises • AY 2025-26</p>
                    </div>
                    <span className="px-2 py-0.5 bg-[#01C951]/10 text-[#01C951] border border-[#01C951]/30 font-mono text-[10px] uppercase rounded-[0.2rem]">
                      APPROVED
                    </span>
                  </div>

                  {/* Dashed Footer Rule */}
                  <div className="pt-3 border-t border-dashed border-[#282424] flex items-center justify-between text-[11px] font-mono text-[#A6A09B]">
                    <span>DOCS: 6 VERIFIED / 0 PENDING</span>
                    <span>VAULT_ID: VLT-88219</span>
                  </div>
                </div>
              </div>

              {/* Badges Showcase */}
              <div className="p-5 bg-[#09090b] border border-[#282424] rounded-[0.2rem] space-y-3">
                <span className="text-xs font-mono uppercase tracking-wider text-[#A6A09B]">03.5 STATUS BADGES</span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 bg-[#282424] text-[#FBFAF8] font-mono text-[10px] uppercase rounded-[0.2rem]">
                    DEFAULT
                  </span>
                  <span className="px-2.5 py-1 bg-[#2A7FFE]/10 text-[#2A7FFE] border border-[#2A7FFE]/30 font-mono text-[10px] uppercase rounded-[0.2rem]">
                    INFO / IN REVIEW
                  </span>
                  <span className="px-2.5 py-1 bg-[#01C951]/10 text-[#01C951] border border-[#01C951]/30 font-mono text-[10px] uppercase rounded-[0.2rem]">
                    VERIFIED
                  </span>
                  <span className="px-2.5 py-1 bg-[#FF6801]/10 text-[#FF6801] border border-[#FF6801]/30 font-mono text-[10px] uppercase rounded-[0.2rem]">
                    ACTION NEEDED
                  </span>
                  <span className="px-2.5 py-1 bg-[#FA2C37]/10 text-[#FA2C37] border border-[#FA2C37]/30 font-mono text-[10px] uppercase rounded-[0.2rem]">
                    DESTRUCTIVE
                  </span>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#09090b] border-t border-[#282424] flex items-center justify-between text-xs text-[#A6A09B]">
          <span className="font-mono text-[11px]">TAXVAULT BRAND SPECIFICATIONS • VER 1.0</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#FBFAF8] text-[#1D1916] font-semibold text-xs rounded-[0.2rem] hover:bg-white transition-colors"
          >
            CLOSE SYSTEM SPEC
          </button>
        </div>

      </div>
    </div>
  );
};
