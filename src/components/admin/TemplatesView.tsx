import React from 'react';
import { Grid, CheckSquare, Plus, FileText } from 'lucide-react';

interface TemplateCard {
  id: string;
  title: string;
  docsCount: number;
  description: string;
  items: string[];
  moreCount: number;
}

const templateList: TemplateCard[] = [
  {
    id: 'tmpl-1',
    title: 'ITR-1 (Sahaj)',
    docsCount: 6,
    description: 'Standard checklist for salaried individuals with income up to ₹50 Lakhs, single house property, and interest income.',
    items: ['Form 16 (Part A & B)', 'PAN Card Copy', 'Aadhaar Card Copy'],
    moreCount: 3,
  },
  {
    id: 'tmpl-2',
    title: 'ITR-2',
    docsCount: 8,
    description: 'For individuals and HUFs not having income from profits and gains of business or profession (Capital gains, multiple houses).',
    items: ['Form 16 / Form 16A', 'Capital Gains Statement', 'Bank Statement (12 Mths)'],
    moreCount: 5,
  },
  {
    id: 'tmpl-3',
    title: 'ITR-3',
    docsCount: 11,
    description: 'For individuals and HUFs having income from proprietary business or carrying on profession.',
    items: ['Audited P&L Account', 'Balance Sheet Statement', 'GST Annual Returns'],
    moreCount: 8,
  },
  {
    id: 'tmpl-4',
    title: 'GST Filing',
    docsCount: 5,
    description: 'Monthly and quarterly compliance checklist for regular GST registered dealers and composite suppliers.',
    items: ['GSTR-1 Outward Summary', 'GSTR-3B Tax Liability', 'Purchase Ledger (ITC)'],
    moreCount: 2,
  },
  {
    id: 'tmpl-5',
    title: 'Tax Audit (Form 3CA/3CB)',
    docsCount: 14,
    description: 'Comprehensive statutory audit requirement package for corporate and non-corporate entities exceeding turnover limits.',
    items: ['Trial Balance Sheet', 'Form 3CD Annexures', 'Fixed Assets Ledger'],
    moreCount: 11,
  },
  {
    id: 'tmpl-6',
    title: 'TDS Quarterly Return',
    docsCount: 4,
    description: 'Quarterly deduction and deposit verification checklist for Form 24Q, Form 26Q, and Form 27Q filings.',
    items: ['Challan ITNS 281 Copies', 'Deductee PAN List', 'Salary / Vendor Register'],
    moreCount: 1,
  },
];

export const TemplatesView: React.FC = () => {
  return (
    <div className="h-full flex flex-col min-h-0 space-y-4 w-full">
      
      {/* Section Header Row */}
      <div className="-mx-4 -mt-4 px-4 h-[46px] border-b border-border/70 flex items-center justify-between shrink-0 mb-4 bg-background">
        <div className="flex items-center space-x-3">
          <h1 className="text-[15px] font-semibold leading-none tracking-tight text-foreground">Templates</h1>
        </div>
      </div>

      {/* Card Grid Layout (3-Column Layout) */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templateList.map((tmpl) => (
          <div
            key={tmpl.id}
            className="bg-card border border-border/70 rounded-[8px] p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-primary/50 transition-colors"
          >
            
            <div className="space-y-3">
              
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[14px] text-foreground tracking-tight">{tmpl.title}</h3>
                <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  {tmpl.docsCount} docs
                </span>
              </div>

              {/* Card Body */}
              <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-3">
                {tmpl.description}
              </p>

              {/* Checklist Section */}
              <div className="pt-3 border-t border-border/60 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Required Checklist</p>

                <ul className="space-y-1.5 text-[12px] text-foreground font-medium">
                  {tmpl.items.map((item, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <CheckSquare className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{item}</span>
                    </li>
                  ))}
                </ul>

                {tmpl.moreCount > 0 && (
                  <button
                    onClick={() => alert(`Expanding all ${tmpl.docsCount} items for ${tmpl.title}`)}
                    className="text-[11px] font-semibold text-primary hover:underline cursor-pointer pt-1 block"
                  >
                    +{tmpl.moreCount} more documents
                  </button>
                )}
              </div>

            </div>

            {/* Expandable / Apply Action Button */}
            <div className="pt-4 border-t border-border/60 mt-auto">
              <button
                onClick={() => alert(`Template "${tmpl.title}" selected.`)}
                className="w-full h-[32px] bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-[6px] text-[12px] transition-colors cursor-pointer shadow-sm border border-border/60"
              >
                Use Template
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
