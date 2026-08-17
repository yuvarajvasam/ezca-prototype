import React, { useState, useEffect } from 'react';
import { Tenant, DocumentCategory, FeatureFlags, StaffMember, AuditLog, DownloadEvent, Payment, Filing } from '../../types';
import { Settings, Building2, Sparkles, Save, ShieldCheck, UserCog, History, CreditCard, FolderOpen, ChevronRight, Check, Palette, Sun, Moon, CheckCircle2, Wrench, Eye, EyeOff, Sliders } from 'lucide-react';
import { StaffManagementView } from './StaffManagementView';
import { AuditLogsView } from './AuditLogsView';
import { PaymentsAdminView } from './PaymentsAdminView';

interface FirmSettingsViewProps {
  tenant: Tenant;
  categories: DocumentCategory[];
  featureFlags: FeatureFlags;
  staffList?: StaffMember[];
  auditLogs?: AuditLog[];
  downloadEvents?: DownloadEvent[];
  payments?: Payment[];
  filings?: Filing[];
  currentTheme?: 'dark' | 'light';
  hideToolsSection?: boolean;
  onToggleHideToolsSection?: () => void;
  onToggleTheme?: () => void;
  onUpdateTenant: (updated: Tenant) => void;
  onAddCategory: (name: string, description: string) => void;
  onInviteStaff?: (name: string, email: string, mobile: string, permissions: string[]) => void;
}

export const THEME_COLOR_PRESETS = [
  { id: 'orange', name: 'Saffron Orange', primary: '#F97316', secondary: '#EA580C', darkPrimary: '#FF6B00', desc: 'Default energetic tax practice accent' },
  { id: 'blue', name: 'Royal Sapphire', primary: '#2563EB', secondary: '#1D4ED8', darkPrimary: '#3B82F6', desc: 'Corporate audit & institutional blue' },
  { id: 'emerald', name: 'Emerald Jade', primary: '#059669', secondary: '#047857', darkPrimary: '#10B981', desc: 'Wealth advisory & compliance green' },
  { id: 'violet', name: 'Imperial Violet', primary: '#7C3AED', secondary: '#6D28D9', darkPrimary: '#8B5CF6', desc: 'Modern fintech & premium advisory' },
  { id: 'rose', name: 'Crimson Amber', primary: '#E11D48', secondary: '#BE123C', darkPrimary: '#F43F5E', desc: 'High-visibility energetic brand theme' },
  { id: 'cyan', name: 'Nordic Teal', primary: '#0891B2', secondary: '#0E7490', darkPrimary: '#06B6D4', desc: 'Clean analytical & modern technology' },
];

export const FirmSettingsView: React.FC<FirmSettingsViewProps> = ({
  tenant,
  categories,
  featureFlags,
  staffList = [],
  auditLogs = [],
  downloadEvents = [],
  payments = [],
  filings = [],
  currentTheme = 'dark',
  hideToolsSection = false,
  onToggleHideToolsSection = () => {},
  onToggleTheme,
  onUpdateTenant,
  onAddCategory,
  onInviteStaff = () => {},
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'firm-profile' | 'theme-colors' | 'feature-flags' | 'doc-categories' | 'staff-rbac' | 'audit-logs' | 'payments-vault'
  >('firm-profile');

  const [brandName, setBrandName] = useState(tenant.brandName);
  const [supportPhone, setSupportPhone] = useState(tenant.supportPhone);
  const [supportEmail, setSupportEmail] = useState(tenant.supportEmail);
  const [primaryColor, setPrimaryColor] = useState(tenant.primaryColor || '#F97316');
  const [secondaryColor, setSecondaryColor] = useState(tenant.secondaryColor || '#0d9488');

  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Apply primary color to CSS variables for dynamic live theme customization
  const applyThemeColor = (colorHex: string) => {
    setPrimaryColor(colorHex);
    document.documentElement.style.setProperty('--primary', colorHex);
    document.documentElement.style.setProperty('--ring', colorHex);
  };

  const handleSelectPreset = (preset: typeof THEME_COLOR_PRESETS[0]) => {
    applyThemeColor(preset.primary);
    setSecondaryColor(preset.secondary);
    onUpdateTenant({
      ...tenant,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleSaveFirm = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTenant({
      ...tenant,
      brandName,
      supportPhone,
      supportEmail,
      primaryColor,
      secondaryColor,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    onAddCategory(newCatName, newCatDesc || 'Custom CA Document Requirement');
    setNewCatName('');
    setNewCatDesc('');
  };

  const settingsNavItems = [
    { id: 'firm-profile', label: 'Firm Profile', icon: Building2, group: 'Firm & Branding' },
    { id: 'theme-colors', label: 'Appearance & Layout', icon: Palette, group: 'Firm & Branding' },
    { id: 'feature-flags', label: 'Features & AI', icon: Sparkles, group: 'Firm & Branding' },
    { id: 'doc-categories', label: 'Documents', icon: FolderOpen, group: 'Firm & Branding' },
    { id: 'staff-rbac', label: 'Team & Permissions', icon: UserCog, group: 'Team & Security' },
    { id: 'audit-logs', label: 'Audit Logs', icon: History, group: 'Team & Security' },
    { id: 'payments-vault', label: 'Payments', icon: CreditCard, group: 'Billing & Operations' },
  ];

  return (
    <div className="flex-1 flex w-full min-h-0 overflow-hidden bg-background">
      
      {/* Settings Secondary Sidebar (290px width) */}
      <div className="w-[290px] shrink-0 bg-card border-r border-border/70 flex flex-col h-full overflow-y-auto select-none p-4 space-y-4">
        
        {/* Header */}
        <div className="pb-2 border-b border-border/60">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-[5px] bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
              <Settings className="w-3.5 h-3.5" />
            </div>
            <h2 className="font-semibold text-[15px] text-foreground tracking-tight">Settings</h2>
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="space-y-4 text-xs">
          
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 px-2 block mb-1">
              Firm & Branding
            </span>
            {settingsNavItems.filter(i => i.group === 'Firm & Branding').map(item => {
              const Icon = item.icon;
              const isActive = activeSubTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSubTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-[6px] font-medium transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-primary/10 text-foreground font-semibold border border-primary/30 shadow-2xs'
                      : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="truncate text-[12px]">{item.label}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground/40'}`} />
                </button>
              );
            })}
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 px-2 block mb-1">
              Team & Security
            </span>
            {settingsNavItems.filter(i => i.group === 'Team & Security').map(item => {
              const Icon = item.icon;
              const isActive = activeSubTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSubTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-[6px] font-medium transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-primary/10 text-foreground font-semibold border border-primary/30 shadow-2xs'
                      : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="truncate text-[12px]">{item.label}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground/40'}`} />
                </button>
              );
            })}
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 px-2 block mb-1">
              Billing & Operations
            </span>
            {settingsNavItems.filter(i => i.group === 'Billing & Operations').map(item => {
              const Icon = item.icon;
              const isActive = activeSubTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSubTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-[6px] font-medium transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-primary/10 text-foreground font-semibold border border-primary/30 shadow-2xs'
                      : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="truncate text-[12px]">{item.label}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground/40'}`} />
                </button>
              );
            })}
          </div>

        </div>

        <div className="mt-auto pt-4 border-t border-border/60 text-[11px] text-muted-foreground flex items-center space-x-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>Enterprise CA Vault Secure</span>
        </div>

      </div>

      {/* Settings Content Area (Flexible) */}
      <div className="flex-1 min-w-0 h-full overflow-y-auto p-4 bg-background flex flex-col">
        {/* Section Header Row */}
        <div className="-mx-4 -mt-4 px-4 h-[56px] border-b border-border/70 flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center space-x-4">
            <h1 className="text-[16px] font-semibold leading-[22px] tracking-tight text-foreground">Settings</h1>
            <span className="text-[14px] font-normal text-muted-foreground">
              / {activeSubTab === 'firm-profile' ? 'firm profile' : activeSubTab === 'theme-colors' ? 'theme colors & appearance' : activeSubTab === 'feature-flags' ? 'feature flags' : activeSubTab === 'doc-categories' ? 'document requirements' : activeSubTab === 'staff-rbac' ? 'staff & rbac' : activeSubTab === 'audit-logs' ? 'audit trail' : 'payments vault'}
            </span>
          </div>
        </div>

        <div className="max-w-4xl w-full space-y-6">

          {/* Sub-tab 1: Firm Identity & Branding */}
          {activeSubTab === 'firm-profile' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-[18px] font-semibold tracking-tight text-foreground">Firm Identity & Branding</h1>
                <p className="text-[12px] text-muted-foreground mt-1">Configure CA practice name, client portal support contacts, and brand identifiers.</p>
              </div>

              <form onSubmit={handleSaveFirm} className="bg-card border border-border/70 rounded-[8px] p-6 space-y-4 shadow-sm">
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center space-x-2 border-b border-border/60 pb-3">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  <span>Practice Profile</span>
                </h2>

                <div className="space-y-1.5 text-xs">
                  <label className="text-muted-foreground font-semibold">CA Firm Brand Name</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full bg-background border border-border/70 text-foreground rounded-[6px] px-3 h-[36px] text-[13px] focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-muted-foreground font-semibold">Support Phone</label>
                    <input
                      type="text"
                      value={supportPhone}
                      onChange={(e) => setSupportPhone(e.target.value)}
                      className="w-full bg-background border border-border/70 text-foreground rounded-[6px] px-3 h-[36px] text-[13px] focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-muted-foreground font-semibold">Support Email</label>
                    <input
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="w-full bg-background border border-border/70 text-foreground rounded-[6px] px-3 h-[36px] text-[13px] focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/60">
                  {saveSuccess ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Settings saved successfully!</span>
                    </span>
                  ) : <span />}

                  <button
                    type="submit"
                    className="flex items-center space-x-1.5 bg-primary hover:bg-primary/90 text-primary-foreground px-4 h-[34px] rounded-[6px] text-[12px] font-semibold shadow-sm cursor-pointer transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Sub-tab 1.5: Theme Colors & Appearance */}
          {activeSubTab === 'theme-colors' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-[18px] font-semibold tracking-tight text-foreground">Theme Colors & Appearance</h1>
                <p className="text-[12px] text-muted-foreground mt-1">
                  Customize your firm portal accent colors, interface modes, and visual branding across admin and client views.
                </p>
              </div>

              {/* Mode Toggle Section */}
              <div className="bg-card border border-border/70 rounded-[8px] p-6 space-y-4 shadow-sm">
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center space-x-2 border-b border-border/60 pb-3">
                  {currentTheme === 'dark' ? <Moon className="w-3.5 h-3.5 text-primary" /> : <Sun className="w-3.5 h-3.5 text-primary" />}
                  <span>Display Mode</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => {
                      if (currentTheme !== 'dark' && onToggleTheme) onToggleTheme();
                    }}
                    className={`p-4 rounded-[8px] border cursor-pointer transition-all flex items-center space-x-3.5 ${
                      currentTheme === 'dark'
                        ? 'bg-primary/10 border-primary/40 shadow-xs'
                        : 'bg-muted/30 border-border/60 hover:bg-muted/50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-[6px] bg-neutral-900 border border-neutral-700 flex items-center justify-center text-orange-400 shrink-0">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[13px] text-foreground">Dark Vault Mode</span>
                        {currentTheme === 'dark' && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">High-contrast dark canvas engineered for financial focus</p>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      if (currentTheme !== 'light' && onToggleTheme) onToggleTheme();
                    }}
                    className={`p-4 rounded-[8px] border cursor-pointer transition-all flex items-center space-x-3.5 ${
                      currentTheme === 'light'
                        ? 'bg-primary/10 border-primary/40 shadow-xs'
                        : 'bg-muted/30 border-border/60 hover:bg-muted/50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-[6px] bg-white border border-neutral-300 flex items-center justify-center text-amber-500 shrink-0 shadow-2xs">
                      <Sun className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[13px] text-foreground">Clean Light Mode</span>
                        {currentTheme === 'light' && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Refined warm-neutral daylight palette with crisp surfaces</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Navigation Layout Preferences */}
              <div className="bg-card border border-border/70 rounded-[8px] p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center space-x-2">
                    <Sliders className="w-3.5 h-3.5 text-primary" />
                    <span>Sidebar Navigation Preferences</span>
                  </h2>
                  <span className="text-[11px] text-muted-foreground">Admin Workspace Layout</span>
                </div>

                <div className="p-4 rounded-[8px] bg-muted/30 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-9 h-9 rounded-[6px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-[13px] text-foreground">Tools Section in Sidebar</span>
                        <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold tracking-wider uppercase border ${
                          !hideToolsSection
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        }`}>
                          {!hideToolsSection ? 'Visible' : 'Hidden'}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed max-w-xl">
                        Show or hide the Tools section (Tax Calculator, Balance Sheet, and Templates) in the left admin sidebar navigation.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={onToggleHideToolsSection}
                      className={`flex items-center space-x-2 px-3.5 h-[34px] rounded-[6px] text-[12px] font-semibold border transition-all cursor-pointer ${
                        hideToolsSection
                          ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90 shadow-xs'
                          : 'bg-card text-foreground border-border/80 hover:bg-muted/70 shadow-2xs'
                      }`}
                    >
                      {hideToolsSection ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Show Tools in Sidebar</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hide Tools Section</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Accent Theme Palette Presets */}
              <div className="bg-card border border-border/70 rounded-[8px] p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center space-x-2">
                    <Palette className="w-3.5 h-3.5 text-primary" />
                    <span>Brand Accent Color Presets</span>
                  </h2>
                  <span className="text-[11px] text-muted-foreground">Select a curated palette</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {THEME_COLOR_PRESETS.map((preset) => {
                    const isSelected = (primaryColor || '').toLowerCase() === (preset.primary || '').toLowerCase();
                    return (
                      <div
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-3.5 rounded-[8px] border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-primary/10 border-primary/50 shadow-2xs ring-1 ring-primary/30'
                            : 'bg-muted/30 border-border/60 hover:bg-muted/60 hover:border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span
                              className="w-5 h-5 rounded-full shadow-xs border border-white/20 shrink-0 inline-block"
                              style={{ backgroundColor: preset.primary }}
                            />
                            <span className="font-semibold text-[13px] text-foreground">{preset.name}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug">{preset.desc}</p>
                        <div className="mt-2.5 flex items-center space-x-1.5 font-mono text-[10px] text-muted-foreground/80">
                          <span className="px-1.5 py-0.5 rounded-[4px] bg-background border border-border/60">{preset.primary}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Hex Color Picker Form */}
              <form onSubmit={handleSaveFirm} className="bg-card border border-border/70 rounded-[8px] p-6 space-y-4 shadow-sm">
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center space-x-2 border-b border-border/60 pb-3">
                  <Palette className="w-3.5 h-3.5 text-primary" />
                  <span>Custom Color Palette</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <label className="text-muted-foreground font-semibold flex items-center justify-between">
                      <span>Primary Accent Color</span>
                      <span className="font-mono text-muted-foreground">{primaryColor}</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => applyThemeColor(e.target.value)}
                        className="w-10 h-[36px] rounded-[6px] border border-border/70 cursor-pointer bg-background p-0.5"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => applyThemeColor(e.target.value)}
                        className="flex-1 bg-background border border-border/70 text-foreground rounded-[6px] px-3 h-[36px] text-[13px] font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="#F97316"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-muted-foreground font-semibold flex items-center justify-between">
                      <span>Secondary Accent Color</span>
                      <span className="font-mono text-muted-foreground">{secondaryColor}</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-10 h-[36px] rounded-[6px] border border-border/70 cursor-pointer bg-background p-0.5"
                      />
                      <input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="flex-1 bg-background border border-border/70 text-foreground rounded-[6px] px-3 h-[36px] text-[13px] font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="#0D9488"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Preview Sample Card */}
                <div className="p-4 rounded-[6px] bg-background border border-border/70 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 rounded-[6px] flex items-center justify-center text-white font-bold shadow-xs"
                      style={{ backgroundColor: primaryColor }}
                    >
                      CA
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-foreground">Live Theme Accent Preview</p>
                      <p className="text-[11px] text-muted-foreground">Buttons, tabs, active highlights, and indicators will render in this accent</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    style={{ backgroundColor: primaryColor }}
                    className="text-white px-3 h-[30px] rounded-[6px] text-[11px] font-semibold shadow-xs"
                  >
                    Button Sample
                  </button>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/60">
                  {saveSuccess ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Theme colors saved and applied!</span>
                    </span>
                  ) : <span />}

                  <button
                    type="submit"
                    className="flex items-center space-x-1.5 bg-primary hover:bg-primary/90 text-primary-foreground px-4 h-[34px] rounded-[6px] text-[12px] font-semibold shadow-sm cursor-pointer transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Apply Colors</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Sub-tab 2: Feature Flags */}
          {activeSubTab === 'feature-flags' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-[18px] font-semibold tracking-tight text-foreground">Feature Flags & AI Engine</h1>
                <p className="text-[12px] text-muted-foreground mt-1">Enable or disable experimental tax calculation modules and automated portal features.</p>
              </div>

              <div className="bg-card border border-border/70 rounded-[8px] p-6 space-y-4 shadow-sm">
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center space-x-2 border-b border-border/60 pb-3">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>System Capability Flags</span>
                </h2>

                <div className="space-y-2 text-xs">
                  {/* Dynamic Sidebar Tools Option */}
                  <div className="flex items-center justify-between p-3.5 rounded-[6px] bg-muted/30 border border-border/60">
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-[5px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                        <Wrench className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-foreground font-semibold text-[13px]">SIDEBAR_TOOLS_SECTION</span>
                          <span className="text-[11px] text-muted-foreground">({!hideToolsSection ? 'Visible in Navigation' : 'Hidden from Sidebar'})</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Controls visibility of Tax Calculator, Balance Sheet, and Templates in admin sidebar.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onToggleHideToolsSection}
                      className={`px-2.5 py-1 rounded-[4px] text-[10px] font-bold tracking-wider uppercase border cursor-pointer transition-all ${
                        !hideToolsSection
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                      }`}
                    >
                      {!hideToolsSection ? 'ENABLED' : 'HIDDEN'}
                    </button>
                  </div>

                  {Object.entries(featureFlags).map(([key, enabled]) => (
                    <div key={key} className="flex items-center justify-between p-3.5 rounded-[6px] bg-muted/30 border border-border/60">
                      <div>
                        <span className="font-mono text-foreground font-semibold text-[13px]">{key}</span>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Controls runtime activation of {key} across client and admin portals.</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-[4px] text-[10px] font-bold tracking-wider uppercase border ${enabled ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-muted text-muted-foreground border-border/60'}`}>
                        {enabled ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab 3: Document Categories */}
          {activeSubTab === 'doc-categories' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-[18px] font-semibold tracking-tight text-foreground">Document Requirements Library</h1>
                <p className="text-[12px] text-muted-foreground mt-1">Define standard document checklists required from clients during onboarding.</p>
              </div>

              <div className="bg-card border border-border/70 rounded-[8px] p-6 space-y-4 shadow-sm">
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border/60 pb-3">
                  Add New Document Category ({categories.length} Active)
                </h2>

                <form onSubmit={handleCreateCategory} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Category Name (e.g. Capital Gains Statement)"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="flex-1 bg-background border border-border/70 text-foreground text-[13px] rounded-[6px] px-3 h-[36px] focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60"
                  />
                  <input
                    type="text"
                    placeholder="Guidance note for client"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    className="flex-1 bg-background border border-border/70 text-foreground text-[13px] rounded-[6px] px-3 h-[36px] focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60"
                  />
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 h-[36px] rounded-[6px] text-[12px] font-semibold shrink-0 shadow-sm cursor-pointer transition-colors"
                  >
                    Add Requirement
                  </button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {categories.map((cat) => (
                    <div key={cat.id} className="bg-muted/30 border border-border/60 p-4 rounded-[6px] text-xs space-y-1.5">
                      <div className="font-semibold text-foreground text-[13px]">{cat.name}</div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{cat.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab 4: Staff & RBAC */}
          {activeSubTab === 'staff-rbac' && (
            <div className="space-y-6">
              <StaffManagementView staffList={staffList} onInviteStaff={onInviteStaff} />
            </div>
          )}

          {/* Sub-tab 5: Audit Logs */}
          {activeSubTab === 'audit-logs' && (
            <div className="space-y-6">
              <AuditLogsView auditLogs={auditLogs} downloadEvents={downloadEvents} />
            </div>
          )}

          {/* Sub-tab 6: Payments & Vault */}
          {activeSubTab === 'payments-vault' && (
            <div className="space-y-6">
              <PaymentsAdminView payments={payments} filings={filings} />
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
