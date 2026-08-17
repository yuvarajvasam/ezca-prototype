import React, { useState } from 'react';
import { Calculator, CheckCircle2, TrendingDown, ArrowRight, ShieldCheck, FileText } from 'lucide-react';

export const TaxComputeView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Income' | 'Deductions' | 'Summary' | 'Trading A/C' | 'P&L A/C' | 'Balance Sheet'>('Income');

  // Input States
  const [grossSalary, setGrossSalary] = useState<number>(1200000);
  const [basicSalary, setBasicSalary] = useState<number>(600000);
  const [hraReceived, setHraReceived] = useState<number>(180000);
  const [rentPaid, setRentPaid] = useState<number>(240000);
  const [sec80c, setSec80c] = useState<number>(150000);
  const [sec80d, setSec80d] = useState<number>(25000);
  const [otherDeductions, setOtherDeductions] = useState<number>(50000);

  // Computed Values
  const hraExemption = Math.min(
    hraReceived,
    rentPaid - 0.1 * basicSalary,
    0.5 * basicSalary
  );
  const standardDeduction = 75000;
  const netSalary = Math.max(0, grossSalary - hraExemption - standardDeduction);
  const totalDeductions = Math.min(150000, sec80c) + sec80d + otherDeductions;
  const grossTotalIncomeOld = Math.max(0, netSalary - totalDeductions);
  const grossTotalIncomeNew = Math.max(0, grossSalary - standardDeduction);

  // Simplified Tax Calculations
  const taxOld = Math.round(grossTotalIncomeOld * 0.15);
  const taxNew = Math.round(grossTotalIncomeNew * 0.12);
  const isOldRegimeBetter = taxOld < taxNew;

  return (
    <div className="h-full flex flex-col min-h-0 space-y-4 w-full">
      
      {/* Section Header Row */}
      <div className="-mx-4 -mt-4 px-4 h-[46px] border-b border-border/70 flex items-center justify-between shrink-0 mb-4 bg-background">
        <div className="flex items-center space-x-3">
          <h1 className="text-[15px] font-semibold leading-none tracking-tight text-foreground">Tax Calculator</h1>
        </div>
      </div>

      {/* Two-Column Split Layout (~75% left / ~25% right) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-5 items-start overflow-hidden">
        
        {/* Left Primary Input Area (~75% width / 3 cols on lg) */}
        <div className="lg:col-span-3 h-full overflow-y-auto pr-1 space-y-4">
          
          {/* Horizontal Navigation Tabs */}
          <div className="bg-card border border-border rounded-xl p-2 flex items-center space-x-1 overflow-x-auto shadow-2xs">
            {(['Income', 'Deductions', 'Summary', 'Trading A/C', 'P&L A/C', 'Balance Sheet'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content 1: Income */}
          {activeTab === 'Income' && (
            <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
              <h2 className="text-sm font-semibold text-foreground border-b border-border pb-2">Salary & Allowances Input Stack</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Gross Salary (Per Annum)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground font-semibold text-xs">₹</span>
                    <input
                      type="number"
                      value={grossSalary}
                      onChange={(e) => setGrossSalary(Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Basic Salary Component</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground font-semibold text-xs">₹</span>
                    <input
                      type="number"
                      value={basicSalary}
                      onChange={(e) => setBasicSalary(Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">HRA Received from Employer</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground font-semibold text-xs">₹</span>
                    <input
                      type="number"
                      value={hraReceived}
                      onChange={(e) => setHraReceived(Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Actual Rent Paid by Employee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground font-semibold text-xs">₹</span>
                    <input
                      type="number"
                      value={rentPaid}
                      onChange={(e) => setRentPaid(Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 2: Deductions */}
          {activeTab === 'Deductions' && (
            <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
              <h2 className="text-sm font-semibold text-foreground border-b border-border pb-2">Chapter VI-A Deductions Stack</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Section 80C (PPF, ELSS, EPF, LIC)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground font-semibold text-xs">₹</span>
                    <input
                      type="number"
                      value={sec80c}
                      onChange={(e) => setSec80c(Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Capped at ₹1,50,000</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Section 80D (Health Insurance)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground font-semibold text-xs">₹</span>
                    <input
                      type="number"
                      value={sec80d}
                      onChange={(e) => setSec80d(Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Other Deductions (80CCD, 80E, 80G)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground font-semibold text-xs">₹</span>
                    <input
                      type="number"
                      value={otherDeductions}
                      onChange={(e) => setOtherDeductions(Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 3 & Others: Summary / Balance Sheet */}
          {(activeTab === 'Summary' || activeTab === 'Trading A/C' || activeTab === 'P&L A/C' || activeTab === 'Balance Sheet') && (
            <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
              <h2 className="text-sm font-semibold text-foreground border-b border-border pb-2">{activeTab} Financial Statement</h2>
              
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-border/60">
                  <span className="text-muted-foreground">Gross Revenue / Salary:</span>
                  <span className="font-bold text-foreground">₹{grossSalary.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/60">
                  <span className="text-muted-foreground">Exemptions & Allowances:</span>
                  <span className="font-bold text-emerald-500">₹{(hraExemption + standardDeduction).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/60">
                  <span className="text-muted-foreground">Net Taxable Income (Old):</span>
                  <span className="font-bold text-foreground">₹{grossTotalIncomeOld.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/60">
                  <span className="text-muted-foreground">Net Taxable Income (New):</span>
                  <span className="font-bold text-foreground">₹{grossTotalIncomeNew.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Sticky Sidebar Panel (~25% width / 1 col on lg) */}
        <div className="lg:col-span-1 h-full overflow-y-auto pr-1 space-y-4">
          
          {/* Recommendation Box */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Regime Outcome</h3>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 space-y-1">
              <p className="text-xs font-extrabold text-emerald-500">
                {isOldRegimeBetter ? 'Recommended: Old Regime' : 'Recommended: New Regime'}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Saves <strong className="text-foreground">₹{Math.abs(taxOld - taxNew).toLocaleString('en-IN')}</strong> in total tax liability.
              </p>
            </div>
          </div>

          {/* Live Totals List */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">Live Computation</h3>

            <div className="space-y-2.5 text-xs font-medium">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross Salary</span>
                <span className="text-foreground font-semibold">₹{grossSalary.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-emerald-500">
                <span>Less Exemptions</span>
                <span className="font-semibold">-₹{(hraExemption + standardDeduction).toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Net Salary</span>
                <span className="text-foreground font-semibold">₹{netSalary.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross Total Income</span>
                <span className="text-foreground font-semibold">₹{grossTotalIncomeOld.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between pt-2 border-t border-border font-bold text-sm">
                <span className="text-foreground">Total Tax Payable</span>
                <span className="text-primary">₹{(isOldRegimeBetter ? taxOld : taxNew).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
