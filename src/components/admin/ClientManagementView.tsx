import React, { useState } from 'react';
import { Client, Filing, ChatMessage, FilingStatus } from '../../types';
import {
  Users,
  UserPlus,
  Search,
  FolderOpen,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Plus,
  MessageSquare,
  Maximize2,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { DirectChatBox } from '../chat/DirectChatBox';

interface ClientManagementViewProps {
  clients: Client[];
  filings: Filing[];
  chatMessages?: ChatMessage[];
  onAddClient: (newClientData: Omit<Client, 'id' | 'tenantId' | 'clientId' | 'status' | 'createdAt'>) => void;
  onSelectClient: (client: Client) => void;
  onCreateFilingForClient: (clientId: string) => void;
  onSendMessage?: (
    clientId: string,
    message: string,
    senderRole: 'CA_ADMIN' | 'CA_STAFF' | 'CLIENT',
    senderName: string,
    attachments?: any
  ) => void;
  onMarkChatRead?: (clientId: string, readerRole: 'CA_ADMIN' | 'CA_STAFF' | 'CLIENT') => void;
}

export const ClientManagementView: React.FC<ClientManagementViewProps> = ({
  clients,
  filings,
  chatMessages = [],
  onAddClient,
  onSelectClient,
  onCreateFilingForClient,
  onSendMessage,
  onMarkChatRead,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClientState] = useState<Client | null>(clients[0] || null);
  const [activeTab, setActiveTab] = useState<'overview' | 'chat'>('overview');
  const [showFullChatModal, setShowFullChatModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
    pan: '',
    dateOfBirth: '1995-08-15',
    address: '',
  });

  const getClientCurrentFiling = (cId: string): Filing | undefined => {
    const clientFilings = filings.filter((f) => f.clientId === cId);
    return clientFilings[0];
  };

  const getFilingStatusBadge = (status: FilingStatus) => {
    switch (status) {
      case 'DOWNLOAD_UNLOCKED':
      case 'FILING_COMPLETED':
      case 'PAYMENT_COMPLETED':
        return {
          bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-500',
          label: status.replace(/_/g, ' '),
        };
      case 'UNDER_REVIEW':
      case 'FILING_IN_PROGRESS':
        return {
          bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
          dot: 'bg-blue-500',
          label: status.replace(/_/g, ' '),
        };
      case 'DOCUMENTS_PARTIALLY_SUBMITTED':
      case 'DOCUMENTS_REQUESTED':
      case 'ADDITIONAL_DOCUMENTS_REQUIRED':
        return {
          bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
          dot: 'bg-amber-500',
          label: status.replace(/_/g, ' '),
        };
      case 'PAYMENT_PENDING':
        return {
          bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
          dot: 'bg-purple-500',
          label: 'PAYMENT PENDING',
        };
      default:
        return {
          bg: 'bg-muted text-muted-foreground border-border/70',
          dot: 'bg-muted-foreground',
          label: status.replace(/_/g, ' '),
        };
    }
  };

  const filteredClients = clients.filter((c) => {
    const q = (searchTerm || '').toLowerCase();
    return (
      (c.firstName || '').toLowerCase().includes(q) ||
      (c.lastName || '').toLowerCase().includes(q) ||
      (c.pan || '').toLowerCase().includes(q) ||
      (c.mobile || '').includes(q) ||
      (c.clientId || '').toLowerCase().includes(q)
    );
  });

  const handleSubmitNewClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.mobile || !formData.pan) return;
    onAddClient(formData);
    setShowAddModal(false);
    setFormData({
      firstName: '',
      lastName: '',
      mobile: '',
      email: '',
      pan: '',
      dateOfBirth: '1995-08-15',
      address: '',
    });
  };

  const activeClientFilings = selectedClient ? filings.filter((f) => f.clientId === selectedClient.id) : [];
  const selectedClientCurrentFiling = selectedClient ? getClientCurrentFiling(selectedClient.id) : undefined;

  const getUnreadCount = (cId: string) => {
    return chatMessages.filter((m) => m.clientId === cId && !m.read && m.senderRole === 'CLIENT').length;
  };

  const getAvatarBg = (index: number) => {
    const colors = ['bg-slate-900 text-white', 'bg-indigo-600 text-white', 'bg-emerald-600 text-white', 'bg-blue-600 text-white'];
    return colors[index % colors.length];
  };

  const selectedClientUnread = selectedClient ? getUnreadCount(selectedClient.id) : 0;

  return (
    <div className="h-full flex flex-col min-h-0 space-y-4 w-full">
      
      {/* Section Header Row */}
      <div className="-mx-4 -mt-4 px-4 h-[46px] border-b border-border/70 flex items-center justify-between shrink-0 mb-4 bg-background">
        <div className="flex items-center space-x-3">
          <h1 className="text-[15px] font-semibold leading-none tracking-tight text-foreground">Clients</h1>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-[4px]">
            {clients.length} Total Taxpayers
          </span>
        </div>

        <button
          id="btn-add-client-modal"
          onClick={() => setShowAddModal(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-2.5 h-[26px] rounded-[4px] text-[11px] transition-all shadow-2xs flex items-center space-x-1 cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add Client</span>
        </button>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
      
      {/* Client List (Left 6 Columns) */}
      <div className="lg:col-span-6 h-full flex flex-col min-h-0 space-y-3 overflow-y-auto pr-1">

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-clients"
            type="text"
            placeholder="Search clients by name, PAN, mobile or Client ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card text-foreground text-[13px] rounded-[8px] pl-9 pr-4 h-[38px] border border-border/70 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm placeholder:text-muted-foreground"
          />
        </div>

        {/* Clients Cards */}
        <div className="space-y-2">
          {filteredClients.length === 0 ? (
            <div className="bg-card border border-border/60 rounded-[8px] p-6 text-center text-xs text-muted-foreground">
              No clients found matching &quot;{searchTerm}&quot;
            </div>
          ) : (
            filteredClients.map((client, idx) => {
              const clientFilings = filings.filter((f) => f.clientId === client.id);
              const clientFilingsCount = clientFilings.length;
              const isSelected = selectedClient?.id === client.id;
              const unread = getUnreadCount(client.id);

              return (
                <div
                  key={client.id}
                  id={`client-card-${client.id}`}
                  onClick={() => setSelectedClientState(client)}
                  className={`bg-card border rounded-[8px] p-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary ring-1 ring-primary/20 bg-muted/30 shadow-xs'
                      : 'border-border/60 hover:border-border hover:bg-muted/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-[6px] flex items-center justify-center font-semibold text-[11px] ${getAvatarBg(idx)}`}>
                        {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-[13px] font-semibold text-foreground">
                            {client.firstName} {client.lastName}
                          </h3>
                          {unread > 0 && (
                            <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-1 animate-pulse">
                              <MessageSquare className="w-2.5 h-2.5" />
                              {unread} new
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-[11px] text-muted-foreground mt-0.5">
                          <span className="font-mono text-foreground font-semibold">{client.pan}</span>
                          <span>•</span>
                          <span>{client.mobile}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClientState(client);
                          setActiveTab('chat');
                        }}
                        className="p-1.5 rounded-[6px] hover:bg-muted text-muted-foreground hover:text-foreground transition-colors relative cursor-pointer border border-border/50"
                        title="Chat with client"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <span className="bg-muted text-foreground px-2 py-0.5 rounded-[4px] text-[10px] font-semibold border border-border/60">
                        {clientFilingsCount} {clientFilingsCount === 1 ? 'Filing' : 'Filings'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Selected Client Detail Panel (Right 6 Columns) */}
      <div className="lg:col-span-6 h-full flex flex-col min-h-0 overflow-hidden pr-1">
        {selectedClient ? (
          <div className="bg-card border border-border/70 rounded-[8px] p-4 flex flex-col h-full overflow-hidden shadow-sm space-y-3">
            
            {/* Header with Switcher Tabs & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/60 pb-3 gap-2 shrink-0">
              <div>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Client Profile</span>
                <h2 className="text-[16px] leading-tight font-semibold text-foreground mt-0.5">
                  {selectedClient.firstName} {selectedClient.lastName}
                </h2>
                <p className="text-[11px] text-muted-foreground font-mono">{selectedClient.clientId} • {selectedClient.pan}</p>
              </div>

              <div className="flex items-center space-x-1.5">
                {/* Tab switcher: Overview vs Chat */}
                <div className="bg-muted/60 p-0.5 rounded-[6px] border border-border/60 flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('overview')}
                    className={`px-2.5 py-1 rounded-[4px] text-[11px] font-semibold transition-all cursor-pointer ${
                      activeTab === 'overview'
                        ? 'bg-card text-foreground shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Profile & Filing
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('chat')}
                    className={`px-2.5 py-1 rounded-[4px] text-[11px] font-semibold transition-all cursor-pointer flex items-center space-x-1 ${
                      activeTab === 'chat'
                        ? 'bg-primary text-primary-foreground shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Messages</span>
                    {selectedClientUnread > 0 && (
                      <span className="ml-1 px-1 py-0.2 rounded-full bg-rose-600 text-white text-[9px] font-bold">
                        {selectedClientUnread}
                      </span>
                    )}
                  </button>
                </div>

                <button
                  id="btn-create-filing-for-client"
                  onClick={() => onCreateFilingForClient(selectedClient.id)}
                  className="flex items-center space-x-1 bg-foreground hover:bg-foreground/90 text-background px-2.5 h-[28px] rounded-[6px] text-[11px] font-semibold transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Filing</span>
                </button>
              </div>
            </div>

            {/* Content Area */}
            {activeTab === 'chat' ? (
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="flex items-center justify-between mb-1.5 px-1 shrink-0">
                  <span className="text-[11px] text-muted-foreground font-medium">Direct Chat Thread with {selectedClient.firstName}</span>
                  <button
                    type="button"
                    onClick={() => setShowFullChatModal(true)}
                    className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>Expand Window</span>
                  </button>
                </div>
                <div className="flex-1 min-h-0">
                  <DirectChatBox
                    clientId={selectedClient.id}
                    client={selectedClient}
                    messages={chatMessages}
                    currentRole="CA_ADMIN"
                    currentUserName="CA Rajesh Kothari"
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
                    compact
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1">
                
                {/* CURRENT ACTIVE FILING SHOWCASE CARD */}
                {selectedClientCurrentFiling ? (
                  <div className="bg-primary/5 border border-primary/20 rounded-[8px] p-3.5 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-[6px] bg-primary text-primary-foreground flex items-center justify-center">
                          <FolderOpen className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Current Active Filing</span>
                            <span className="text-[10px] bg-primary/10 text-primary font-semibold px-1.5 rounded">
                              {selectedClientCurrentFiling.financialYear}
                            </span>
                          </div>
                          <h4 className="font-semibold text-foreground text-[13px]">
                            Assessment Year {selectedClientCurrentFiling.assessmentYear}
                          </h4>
                        </div>
                      </div>

                      {(() => {
                        const b = getFilingStatusBadge(selectedClientCurrentFiling.status);
                        return (
                          <span className={`inline-flex items-center space-x-1.5 text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${b.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${b.dot} animate-pulse`} />
                            <span>{b.label}</span>
                          </span>
                        );
                      })()}
                    </div>

                    {/* Progress Bar & Details */}
                    <div className="space-y-1.5 bg-card/60 p-2.5 rounded-[6px] border border-border/60">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground font-medium">Document Completion</span>
                        <span className="font-semibold text-foreground">
                          {selectedClientCurrentFiling.receivedDocuments} of {selectedClientCurrentFiling.totalDocuments} Docs Received ({selectedClientCurrentFiling.progress}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-300"
                          style={{ width: `${selectedClientCurrentFiling.progress}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                        <div className="flex items-center space-x-1.5 text-muted-foreground">
                          <span>Fee:</span>
                          <strong className="text-foreground">₹{selectedClientCurrentFiling.feeAmount}</strong>
                          <span className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
                            selectedClientCurrentFiling.paymentStatus === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                          }`}>
                            {selectedClientCurrentFiling.paymentStatus}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-muted-foreground justify-end">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span>PAN/DOB:</span>
                          <strong className="text-emerald-600 dark:text-emerald-400">
                            {selectedClientCurrentFiling.panDobVerified ? 'Verified' : 'Pending'}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted/30 border border-dashed border-border/80 rounded-[8px] p-4 text-center space-y-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                      <FolderOpen className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-semibold text-foreground">No Current Filing for this Client</h4>
                    <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                      Initiate a new tax filing to start requesting documents and computing taxes for FY 2025–26.
                    </p>
                    <button
                      type="button"
                      onClick={() => onCreateFilingForClient(selectedClient.id)}
                      className="mt-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-[6px] text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer inline-flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Start New Filing</span>
                    </button>
                  </div>
                )}

                {/* Profile Fields */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-muted/20 p-2.5 rounded-[6px] border border-border/60">
                    <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-[0.05em] flex items-center gap-1.5 mb-1">
                      <CreditCard className="w-3 h-3 text-blue-500" />
                      PAN Number
                    </span>
                    <p className="font-mono font-semibold text-foreground text-[12px]">{selectedClient.pan}</p>
                  </div>

                  <div className="bg-muted/20 p-2.5 rounded-[6px] border border-border/60">
                    <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-[0.05em] flex items-center gap-1.5 mb-1">
                      <Calendar className="w-3 h-3 text-emerald-500" />
                      Date of Birth
                    </span>
                    <p className="font-semibold text-foreground text-[12px]">{selectedClient.dateOfBirth}</p>
                  </div>

                  <div className="bg-muted/20 p-2.5 rounded-[6px] border border-border/60">
                    <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-[0.05em] flex items-center gap-1.5 mb-1">
                      <Phone className="w-3 h-3 text-amber-500" />
                      Mobile Number
                    </span>
                    <p className="font-semibold text-foreground text-[12px]">{selectedClient.mobile}</p>
                  </div>

                  <div className="bg-muted/20 p-2.5 rounded-[6px] border border-border/60">
                    <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-[0.05em] flex items-center gap-1.5 mb-1">
                      <Mail className="w-3 h-3 text-purple-500" />
                      Email Address
                    </span>
                    <p className="font-semibold text-foreground truncate text-[12px]">{selectedClient.email}</p>
                  </div>
                </div>

                <div className="bg-muted/20 p-2.5 rounded-[6px] border border-border/60">
                  <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-[0.05em] flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3 h-3 text-rose-500" />
                    Residential Address
                  </span>
                  <p className="text-foreground text-[12px] leading-[17px]">{selectedClient.address}</p>
                </div>

                {/* Quick Chat Entry Banner */}
                <div
                  onClick={() => setActiveTab('chat')}
                  className="bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-[8px] p-3 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-[12px] font-semibold text-foreground">Chat with {selectedClient.firstName}</h4>
                      <p className="text-[10px] text-muted-foreground">Send real-time updates or answer taxpayer queries</p>
                    </div>
                  </div>
                  <span className="text-xs text-primary font-semibold">Open Chat →</span>
                </div>

                {/* Filings History */}
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] flex items-center gap-1.5">
                    <FolderOpen className="w-3.5 h-3.5 text-blue-500" />
                    <span>Filing History ({activeClientFilings.length})</span>
                  </h3>

                  <div className="space-y-1.5">
                    {activeClientFilings.length === 0 ? (
                      <p className="text-[12px] text-muted-foreground py-2">No filings initiated for this client yet.</p>
                    ) : (
                      activeClientFilings.map((f) => {
                        const statusB = getFilingStatusBadge(f.status);
                        return (
                          <div key={f.id} className="bg-background border border-border/60 p-2.5 rounded-[6px] flex items-center justify-between">
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <span className="font-semibold text-foreground text-[12px]">{f.financialYear}</span>
                                <span className="text-[10px] text-muted-foreground font-mono">({f.assessmentYear})</span>
                              </div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">
                                {f.receivedDocuments}/{f.totalDocuments} Docs • ₹{f.feeAmount} ({f.paymentStatus})
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`inline-flex items-center space-x-1 text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${statusB.bg}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusB.dot}`} />
                                <span>{statusB.label}</span>
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="bg-card border border-border/70 rounded-[8px] p-8 text-center text-muted-foreground text-[13px] shadow-sm">
            Select a client from the directory to view profile details and start messaging.
          </div>
        )}
      </div>

      </div>

      {/* Full Size Chat Modal */}
      {showFullChatModal && selectedClient && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/70 rounded-xl max-w-2xl w-full h-[650px] max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
            <DirectChatBox
              clientId={selectedClient.id}
              client={selectedClient}
              messages={chatMessages}
              currentRole="CA_ADMIN"
              currentUserName="CA Rajesh Kothari"
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
              onClose={() => setShowFullChatModal(false)}
            />
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmitNewClient} className="bg-card border border-border/70 rounded-[8px] max-w-md w-full p-6 space-y-4 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="text-[15px] font-semibold text-foreground flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-blue-500" />
                <span>Add Taxpayer Client</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-[4px] hover:bg-muted/80 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-foreground">First Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full bg-background border border-border/70 text-foreground text-[13px] rounded-[6px] px-3 h-[36px] focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60"
                  placeholder="e.g. Anand"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-foreground">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full bg-background border border-border/70 text-foreground text-[13px] rounded-[6px] px-3 h-[36px] focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60"
                  placeholder="e.g. Mehta"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-foreground">PAN Number <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.pan}
                  onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                  className="w-full bg-background border border-border/70 text-foreground font-mono text-[13px] rounded-[6px] px-3 h-[36px] focus:outline-none focus:ring-1 focus:ring-primary uppercase placeholder:text-muted-foreground/60"
                  placeholder="ABCDE1234F"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-foreground">Mobile Number <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full bg-background border border-border/70 text-foreground text-[13px] rounded-[6px] px-3 h-[36px] focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-foreground">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-background border border-border/70 text-foreground text-[13px] rounded-[6px] px-3 h-[36px] focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60"
                placeholder="client@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-foreground">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full bg-background border border-border/70 text-foreground text-[13px] rounded-[6px] px-3 h-[36px] focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-foreground">Address</label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-background border border-border/70 text-foreground text-[13px] rounded-[6px] p-2.5 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60"
                placeholder="Street address, City, State, PIN"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-border/60">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 h-[32px] rounded-[6px] text-[12px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 h-[32px] rounded-[6px] text-[12px] font-semibold shadow-sm cursor-pointer transition-colors"
              >
                Create Client
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};


