import React, { useState } from 'react';
import { Search, FileText, CheckCircle2, AlertCircle, Columns, Table, ChevronRight, User, Download, Eye, Send, FolderOpen } from 'lucide-react';
import { Client, DocumentRequirement } from '../../types';

interface DocumentsViewProps {
  clients?: Client[];
  requirements?: DocumentRequirement[];
  onPreviewDoc?: (doc: any) => void;
}

interface DocItem {
  id: string;
  name: string;
  clientName: string;
  clientPan: string;
  clientId?: string;
  uploadedDate: string;
  status: 'Done' | 'Needed';
  category?: string;
  fileSize?: string;
}

const mockDocRows: DocItem[] = [
  { id: 'doc-1', name: 'Form 16 (Part A & B)', clientName: 'Anand Mehta', clientPan: 'AAGPM9012F', clientId: 'c1', uploadedDate: 'May 20, 2026', status: 'Done', category: 'Income Statements', fileSize: '1.8 MB' },
  { id: 'doc-2', name: 'Bank Statement (12 Mths)', clientName: 'Anand Mehta', clientPan: 'AAGPM9012F', clientId: 'c1', uploadedDate: 'Jun 01, 2026', status: 'Done', category: 'Banking & Financials', fileSize: '4.2 MB' },
  { id: 'doc-3', name: 'PAN Card Copy', clientName: 'Anand Mehta', clientPan: 'AAGPM9012F', clientId: 'c1', uploadedDate: 'May 15, 2026', status: 'Done', category: 'Identity Verification', fileSize: '450 KB' },
  { id: 'doc-4', name: 'Capital Gains Summary', clientName: 'Anand Mehta', clientPan: 'AAGPM9012F', clientId: 'c1', uploadedDate: '—', status: 'Needed', category: 'Investment Statements' },
  { id: 'doc-5', name: 'Form 26AS Tax Credit', clientName: 'Priya Sharma', clientPan: 'BKXPS4412K', clientId: 'c2', uploadedDate: 'May 28, 2026', status: 'Done', category: 'Tax Receipts', fileSize: '980 KB' },
  { id: 'doc-6', name: 'GST Annual Return Copy', clientName: 'Priya Sharma', clientPan: 'BKXPS4412K', clientId: 'c2', uploadedDate: '—', status: 'Needed', category: 'GST & Business' },
  { id: 'doc-7', name: 'Home Loan Interest Cert', clientName: 'Vikram Malhotra', clientPan: 'CPYVM8821L', clientId: 'c3', uploadedDate: 'Jun 04, 2026', status: 'Done', category: 'Deductions & Exemptions', fileSize: '1.1 MB' },
  { id: 'doc-8', name: 'Aadhaar Card Copy', clientName: 'Vikram Malhotra', clientPan: 'CPYVM8821L', clientId: 'c3', uploadedDate: 'Jun 02, 2026', status: 'Done', category: 'Identity Verification', fileSize: '620 KB' },
  { id: 'doc-9', name: 'Audit Balance Sheet', clientName: 'Kothari Enterprises', clientPan: 'AAACK1109E', clientId: 'c4', uploadedDate: '—', status: 'Needed', category: 'Corporate Audit' },
  { id: 'doc-10', name: 'TDS Deduction Certificates', clientName: 'Kothari Enterprises', clientPan: 'AAACK1109E', clientId: 'c4', uploadedDate: 'Jun 05, 2026', status: 'Done', category: 'TDS & TCS', fileSize: '2.5 MB' },
  { id: 'doc-11', name: 'Form 16 (Part A & B)', clientName: 'Rahul Verma', clientPan: 'DRPV1092K', clientId: 'c5', uploadedDate: 'Jun 02, 2026', status: 'Done', category: 'Income Statements', fileSize: '1.4 MB' },
  { id: 'doc-12', name: 'Salary Slips (3 Mths)', clientName: 'Rahul Verma', clientPan: 'DRPV1092K', clientId: 'c5', uploadedDate: '—', status: 'Needed', category: 'Income Statements' },
  { id: 'doc-13', name: 'Form 26AS Tax Credit', clientName: 'Sunita Patel', clientPan: 'EPSP5519L', clientId: 'c6', uploadedDate: 'May 29, 2026', status: 'Done', category: 'Tax Receipts', fileSize: '850 KB' },
  { id: 'doc-14', name: '80C Investment Proofs', clientName: 'Sunita Patel', clientPan: 'EPSP5519L', clientId: 'c6', uploadedDate: '—', status: 'Needed', category: 'Deductions & Exemptions' },
];

export const DocumentsView: React.FC<DocumentsViewProps> = ({ clients = [], onPreviewDoc }) => {
  const [viewMode, setViewMode] = useState<'columns' | 'table'>('columns');
  const [filterTab, setFilterTab] = useState<'All' | 'Uploaded' | 'Missing'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Column View Selection States
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [selectedDocId, setSelectedDocId] = useState<string>('doc-1');
  const [clientSearchQuery, setClientSearchQuery] = useState('');

  // Derive unique client list from props and mock docs
  const clientList = React.useMemo(() => {
    const listMap = new Map<string, { id: string; name: string; pan: string }>();
    
    // Add from mockDocRows
    mockDocRows.forEach(d => {
      const key = d.clientName;
      if (!listMap.has(key)) {
        listMap.set(key, { id: d.clientId || key, name: d.clientName, pan: d.clientPan });
      }
    });

    // Add from props clients
    clients.forEach(c => {
      const name = `${c.firstName} ${c.lastName}`.trim();
      if (!listMap.has(name)) {
        listMap.set(name, { id: c.id, name, pan: c.pan });
      }
    });

    return Array.from(listMap.values());
  }, [clients]);

  const filteredClients = clientList.filter(c => 
    (c.name || '').toLowerCase().includes((clientSearchQuery || '').toLowerCase()) ||
    (c.pan || '').toLowerCase().includes((clientSearchQuery || '').toLowerCase())
  );

  // Filter docs for Table View
  const filteredDocsForTable = mockDocRows.filter((doc) => {
    const matchesFilter =
      filterTab === 'All'
        ? true
        : filterTab === 'Uploaded'
        ? doc.status === 'Done'
        : doc.status === 'Needed';

    const q = (searchQuery || '').toLowerCase();
    const matchesSearch =
      (doc.name || '').toLowerCase().includes(q) ||
      (doc.clientName || '').toLowerCase().includes(q) ||
      (doc.clientPan || '').toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  // Filter docs for Column View (Column 2)
  const filteredDocsForColumn = mockDocRows.filter((doc) => {
    const matchesClient =
      selectedClientId === 'all'
        ? true
        : doc.clientName === selectedClientId || doc.clientId === selectedClientId;

    const matchesFilter =
      filterTab === 'All'
        ? true
        : filterTab === 'Uploaded'
        ? doc.status === 'Done'
        : doc.status === 'Needed';

    const q = (searchQuery || '').toLowerCase();
    const matchesSearch =
      (doc.name || '').toLowerCase().includes(q) ||
      (doc.category || '').toLowerCase().includes(q);

    return matchesClient && matchesFilter && matchesSearch;
  });

  // Selected Doc for Column 3 Inspector
  const selectedDoc = mockDocRows.find(d => d.id === selectedDocId) || filteredDocsForColumn[0] || mockDocRows[0];

  return (
    <div className="h-full flex flex-col min-h-0 space-y-4 w-full">
      
      {/* Section Header Row */}
      <div className="-mx-4 -mt-4 px-4 h-[46px] border-b border-border/70 flex items-center justify-between shrink-0 mb-4 bg-background">
        <div className="flex items-center space-x-3">
          <h1 className="text-[15px] font-semibold leading-none tracking-tight text-foreground">Documents</h1>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center space-x-1 bg-muted/60 p-0.5 rounded-[5px] border border-border/60">
          <button
            onClick={() => setViewMode('columns')}
            className={`flex items-center space-x-1.5 px-2.5 h-[26px] rounded-[4px] text-[11px] font-semibold transition-colors cursor-pointer ${
              viewMode === 'columns'
                ? 'bg-background text-foreground shadow-2xs border border-border/70'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Columns</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center space-x-1.5 px-2.5 h-[26px] rounded-[4px] text-[11px] font-semibold transition-colors cursor-pointer ${
              viewMode === 'table'
                ? 'bg-background text-foreground shadow-2xs border border-border/70'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Card 1: Total documents */}
          <div className="bg-card border border-border/70 rounded-[6px] p-3 shadow-2xs space-y-0.5">
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Total Documents</p>
            <div className="flex items-baseline justify-between">
              <span className="text-[22px] leading-[28px] font-bold tracking-tight text-foreground">{mockDocRows.length}</span>
            </div>
          </div>

          {/* Card 2: Uploaded */}
          <div className="bg-card border border-border/70 rounded-[6px] p-3 shadow-2xs space-y-0.5">
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Uploaded</p>
            <div className="flex items-baseline justify-between">
              <span className="text-[22px] leading-[28px] font-bold tracking-tight text-foreground">
                {mockDocRows.filter(d => d.status === 'Done').length}
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-[4px] border border-emerald-500/20 uppercase">
                {Math.round((mockDocRows.filter(d => d.status === 'Done').length / mockDocRows.length) * 100)}%
              </span>
            </div>
          </div>

          {/* Card 3: Missing */}
          <div className="bg-card border border-border/70 rounded-[6px] p-3 shadow-2xs space-y-0.5">
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Missing</p>
            <div className="flex items-baseline justify-between">
              <span className="text-[22px] leading-[28px] font-bold tracking-tight text-foreground">
                {mockDocRows.filter(d => d.status === 'Needed').length}
              </span>
              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded-[4px] border border-amber-500/20 uppercase">
                {mockDocRows.filter(d => d.status === 'Needed').length} pending
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* MACOS COLUMN VIEW OPTION */}
      {viewMode === 'columns' ? (
        <div className="flex-1 min-h-0 bg-card border border-border/70 rounded-[8px] shadow-sm overflow-hidden flex flex-col md:flex-row select-none">
          
          {/* COLUMN 1: CLIENTS LIST */}
          <div className="w-full md:w-64 lg:w-72 shrink-0 border-r border-border/70 flex flex-col bg-muted/70 dark:bg-muted/40 h-full">
            
            {/* Column 1 Header */}
            <div className="p-3 border-b border-border/70 space-y-2 shrink-0 bg-card/50">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span>Clients Directory</span>
                </span>
                <span className="text-[10px] font-mono font-semibold bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                  {clientList.length}
                </span>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter clients..."
                  value={clientSearchQuery}
                  onChange={(e) => setClientSearchQuery(e.target.value)}
                  className="w-full bg-background border border-border/70 rounded-[5px] pl-8 pr-2.5 h-[28px] text-[12px] focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/60"
                />
              </div>
            </div>

            {/* Column 1 List */}
            <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {/* "All Clients" Option */}
              <button
                onClick={() => setSelectedClientId('all')}
                className={`w-full flex items-center justify-between p-2.5 rounded-[6px] text-left transition-colors cursor-pointer ${
                  selectedClientId === 'all'
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'hover:bg-muted/60 text-foreground'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <FolderOpen className={`w-4 h-4 shrink-0 ${selectedClientId === 'all' ? 'text-primary-foreground' : 'text-primary'}`} />
                  <span className="text-[13px] font-semibold truncate">All Taxpayers</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${selectedClientId === 'all' ? 'text-primary-foreground' : 'text-muted-foreground/50'}`} />
              </button>

              <div className="my-1 border-t border-border/40" />

              {filteredClients.map((client) => {
                const isSelected = selectedClientId === client.name || selectedClientId === client.id;
                const clientDocs = mockDocRows.filter(d => d.clientName === client.name || d.clientId === client.id);
                const uploadedCount = clientDocs.filter(d => d.status === 'Done').length;

                return (
                  <button
                    key={client.id}
                    onClick={() => {
                      setSelectedClientId(client.name);
                      if (clientDocs.length > 0) {
                        setSelectedDocId(clientDocs[0].id);
                      }
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-[6px] text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-primary/10 border border-primary/20 text-primary font-semibold shadow-2xs'
                        : 'hover:bg-muted/60 text-foreground'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="text-[13px] font-semibold truncate">{client.name}</div>
                      <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{client.pan}</div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                        uploadedCount === clientDocs.length && clientDocs.length > 0
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {uploadedCount}/{clientDocs.length || 0}
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-primary' : 'text-muted-foreground/40'}`} />
                    </div>
                  </button>
                );
              })}
            </div>

          </div>

          {/* COLUMN 2: DOCUMENTS LIST */}
          <div className="w-full md:w-72 lg:w-80 shrink-0 border-r border-border/70 flex flex-col bg-card h-full">
            
            {/* Column 2 Header */}
            <div className="p-3 border-b border-border/70 space-y-2 shrink-0 bg-card">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  <span className="truncate max-w-[170px]">{selectedClientId === 'all' ? 'All Client Files' : selectedClientId}</span>
                </span>
                <span className="text-[10px] font-mono font-semibold bg-muted px-1.5 py-0.5 rounded text-muted-foreground shrink-0">
                  {filteredDocsForColumn.length} docs
                </span>
              </div>

              {/* Status Filter Segmented Control */}
              <div className="flex items-center space-x-1 bg-muted/50 p-1 rounded-[5px] border border-border/60">
                {(['All', 'Uploaded', 'Missing'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilterTab(tab)}
                    className={`flex-1 py-1 text-[11px] font-semibold rounded-[3px] transition-colors cursor-pointer text-center ${
                      filterTab === tab
                        ? 'bg-background text-foreground shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-background border border-border/70 rounded-[5px] pl-8 pr-2.5 h-[28px] text-[12px] focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/60"
                />
              </div>
            </div>

            {/* Column 2 List */}
            <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {filteredDocsForColumn.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-xs">
                  No documents found matching filters.
                </div>
              ) : (
                filteredDocsForColumn.map((doc) => {
                  const isSelected = selectedDoc?.id === doc.id;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-[6px] text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                          : 'hover:bg-muted/60 text-foreground'
                      }`}
                    >
                      <div className="flex items-start space-x-2.5 min-w-0 flex-1 pr-2">
                        <div className={`p-1.5 rounded-[4px] mt-0.5 shrink-0 ${
                          isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-foreground'
                        }`}>
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[12px] font-semibold truncate leading-tight">{doc.name}</div>
                          <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                            {doc.clientName}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center space-x-1.5">
                        {doc.status === 'Done' ? (
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                            isSelected
                              ? 'bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          }`}>
                            Done
                          </span>
                        ) : (
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                            isSelected
                              ? 'bg-amber-400/30 text-primary-foreground border-amber-300/40'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          }`}>
                            Needed
                          </span>
                        )}
                        <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground/40'}`} />
                      </div>
                    </button>
                  );
                })
              )}
            </div>

          </div>

          {/* COLUMN 3: MACOS INSPECTOR / PREVIEW PANE */}
          <div className="flex-1 min-h-0 bg-card flex flex-col h-full overflow-y-auto p-6 space-y-6 custom-scrollbar">
            
            {selectedDoc ? (
              <div className="space-y-6 max-w-lg mx-auto w-full my-auto">
                
                {/* Visual File Preview Box */}
                <div className="bg-background border border-border/70 rounded-[12px] p-6 shadow-sm text-center space-y-3 relative overflow-hidden">
                  <div className="w-16 h-16 rounded-[12px] bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto shadow-2xs">
                    <FileText className="w-8 h-8" />
                  </div>

                  <div>
                    <h3 className="text-[15px] font-bold text-foreground">{selectedDoc.name}</h3>
                    <p className="text-[12px] text-muted-foreground mt-0.5">{selectedDoc.category || 'Tax Document Requirement'}</p>
                  </div>

                  {selectedDoc.status === 'Done' ? (
                    <div className="inline-flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[11px] font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified & Encrypted in CA Vault</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center space-x-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-[11px] font-semibold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Action Required: Client Upload Pending</span>
                    </div>
                  )}
                </div>

                {/* Document Metadata Cards */}
                <div className="bg-background border border-border/70 rounded-[8px] p-4 space-y-3 text-xs shadow-2xs">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-2 flex items-center justify-between">
                    <span>Document Inspector</span>
                    <span className="font-mono text-foreground font-semibold">AY 2026–27</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-muted-foreground text-[11px] block">Client Name</span>
                      <strong className="text-foreground text-[13px] font-semibold">{selectedDoc.clientName}</strong>
                    </div>

                    <div>
                      <span className="text-muted-foreground text-[11px] block">Taxpayer PAN</span>
                      <strong className="text-foreground text-[13px] font-mono">{selectedDoc.clientPan}</strong>
                    </div>

                    <div>
                      <span className="text-muted-foreground text-[11px] block">Uploaded Date</span>
                      <strong className="text-foreground text-[12px] font-medium">{selectedDoc.uploadedDate}</strong>
                    </div>

                    <div>
                      <span className="text-muted-foreground text-[11px] block">File Format & Size</span>
                      <strong className="text-foreground text-[12px] font-medium">{selectedDoc.fileSize || 'PDF • Pending'}</strong>
                    </div>
                  </div>
                </div>

                {/* Inspector Action Buttons */}
                <div className="space-y-2">
                  {selectedDoc.status === 'Done' ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onPreviewDoc && onPreviewDoc({ title: selectedDoc.name, url: '#' })}
                        className="flex items-center justify-center space-x-1.5 bg-primary hover:bg-primary/90 text-primary-foreground h-[36px] rounded-[6px] text-[12px] font-semibold transition-colors cursor-pointer shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview File</span>
                      </button>

                      <button
                        onClick={() => alert(`Downloading ${selectedDoc.name}...`)}
                        className="flex items-center justify-center space-x-1.5 bg-card hover:bg-muted text-foreground border border-border/70 h-[36px] rounded-[6px] text-[12px] font-semibold transition-colors cursor-pointer shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => alert(`WhatsApp document upload reminder link sent to ${selectedDoc.clientName}.`)}
                      className="w-full flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white h-[36px] rounded-[6px] text-[12px] font-semibold transition-colors cursor-pointer shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send WhatsApp Upload Reminder</span>
                    </button>
                  )}
                </div>

              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground text-xs my-auto">
                Select a document from the middle column to inspect details.
              </div>
            )}

          </div>

        </div>
      ) : (
        /* ORIGINAL DATA TABLE GRID MODE */
        <div className="flex-1 min-h-0 bg-card border border-border/70 rounded-[8px] shadow-sm overflow-hidden flex flex-col">
          
          {/* Table Filter Bar */}
          <div className="p-3 border-b border-border/70 flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/10 shrink-0">
            <div className="flex items-center space-x-1 bg-muted/50 p-1 rounded-[6px] w-full sm:w-auto border border-border/60">
              {(['All', 'Uploaded', 'Missing'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-4 h-[28px] rounded-[4px] text-[12px] font-semibold transition-colors cursor-pointer ${
                    filterTab === tab
                      ? 'bg-background text-foreground shadow-2xs border border-border/70'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search docs or client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-background border border-border/70 rounded-[6px] pl-8 pr-3 h-[32px] text-[13px] focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <span className="text-[12px] font-medium text-muted-foreground whitespace-nowrap">
                <strong className="text-foreground font-semibold">{filteredDocsForTable.length}</strong> documents
              </span>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-[13px]">
              
              {/* Table Header */}
              <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-xs border-b border-border/60 text-[11px] text-muted-foreground font-semibold uppercase tracking-[0.05em] shadow-2xs">
                <tr>
                  <th className="py-3 px-4 font-semibold">DOCUMENT</th>
                  <th className="py-3 px-4 font-semibold">CLIENT</th>
                  <th className="py-3 px-4 font-semibold">UPLOADED</th>
                  <th className="py-3 px-4 text-right font-semibold">STATUS</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-border/60">
                {filteredDocsForTable.map((doc) => (
                  <tr key={doc.id} className="hover:bg-muted/10 transition-colors">
                    
                    {/* Column 1: DOCUMENT */}
                    <td className="py-3 px-4 text-foreground">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-[4px] bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[13px] font-semibold">{doc.name}</span>
                      </div>
                    </td>

                    {/* Column 2: CLIENT */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-[13px]">{doc.clientName}</span>
                        <span className="text-[11px] text-muted-foreground font-mono mt-0.5">{doc.clientPan}</span>
                      </div>
                    </td>

                    {/* Column 3: UPLOADED */}
                    <td className="py-3 px-4 text-muted-foreground font-medium">
                      {doc.uploadedDate}
                    </td>

                    {/* Column 4: STATUS */}
                    <td className="py-3 px-4 text-right">
                      {doc.status === 'Done' ? (
                        <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-[4px] text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Done</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-[4px] text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                          <AlertCircle className="w-3 h-3" />
                          <span>Needed</span>
                        </span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>
      )}

    </div>
  );
};
