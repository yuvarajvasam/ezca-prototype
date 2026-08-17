import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Send,
  Copy,
  Download,
  Eye,
  AlertTriangle,
  Plus,
  FileText,
  UserCheck,
  Building,
  MessageSquare,
} from 'lucide-react';
import { Client, ChatMessage } from '../../types';
import { DirectChatBox } from '../chat/DirectChatBox';

interface ClientProfileDetailViewProps {
  client?: Client;
  chatMessages?: ChatMessage[];
  onBack?: () => void;
  onPreviewPortal?: () => void;
  onSendMessage?: (
    clientId: string,
    message: string,
    senderRole: 'CA_ADMIN' | 'CA_STAFF' | 'CLIENT',
    senderName: string,
    attachments?: any
  ) => void;
  onMarkChatRead?: (clientId: string, readerRole: 'CA_ADMIN' | 'CA_STAFF' | 'CLIENT') => void;
}

const steps = [
  { id: 'waiting', label: 'Waiting', done: true },
  { id: 'docs_in', label: 'Docs in', done: true },
  { id: 'computed', label: 'Computed', done: true },
  { id: 'prepared', label: 'Prepared', done: true },
  { id: 'approved', label: 'Approved', done: true },
  { id: 'filed', label: 'Filed', done: true },
  { id: 'ack_done', label: 'Ack done', done: true },
];

export const ClientProfileDetailView: React.FC<ClientProfileDetailViewProps> = ({
  client,
  chatMessages = [],
  onBack,
  onPreviewPortal,
  onSendMessage,
  onMarkChatRead,
}) => {
  const [showChatModal, setShowChatModal] = useState(false);
  const [docList, setDocList] = useState([
    { id: 'd1', name: 'Form 16 (Part A & B)', checked: true },
    { id: 'd2', name: 'Bank Statement (12 Mths)', checked: true },
    { id: 'd3', name: 'PAN & Aadhaar Copies', checked: true },
    { id: 'd4', name: 'Capital Gains Statement', checked: false },
  ]);

  const clientName = client ? `${client.firstName} ${client.lastName}` : 'Anand Mehta';
  const pan = client?.pan || 'AAGPM9012F';
  const phone = client?.mobile || '+91 98765 43210';
  const email = client?.email || 'anand@mehtagroup.in';
  const clientId = client?.id || 'client-1';

  const unreadMessagesCount = chatMessages.filter(
    (m) => m.clientId === clientId && !m.read && m.senderRole === 'CLIENT'
  ).length;

  const toggleDoc = (id: string) => {
    setDocList((prev) =>
      prev.map((d) => (d.id === id ? { ...d, checked: !d.checked } : d))
    );
  };

  return (
    <div className="h-full flex flex-col min-h-0 space-y-4 w-full">
      
      {/* Section Header Row */}
      <div className="-mx-4 -mt-4 px-4 h-[46px] border-b border-border/70 flex items-center justify-between shrink-0 mb-4 bg-background">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1 hover:bg-muted rounded-[4px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer mr-1"
            title="Back to Clients"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-[15px] font-semibold leading-none tracking-tight text-foreground">{clientName}</h1>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setShowChatModal(true)}
            className="px-2.5 h-[25px] rounded-[4px] bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-[11px] transition-colors shadow-2xs flex items-center space-x-1 cursor-pointer relative"
          >
            <MessageSquare className="w-3 h-3" />
            <span>Chat</span>
            {unreadMessagesCount > 0 && (
              <span className="bg-rose-600 text-white text-[9px] px-1 py-0.2 rounded-full font-bold">
                {unreadMessagesCount}
              </span>
            )}
          </button>
          <button
            onClick={() => alert('Client details updated.')}
            className="px-2 h-[25px] rounded-[4px] border border-border/70 bg-card text-foreground hover:bg-muted font-semibold text-[11px] transition-colors cursor-pointer shadow-2xs"
          >
            Edit Client
          </button>
          <button
            onClick={() => alert('Filing workflow marked complete.')}
            className="px-2 h-[25px] rounded-[4px] bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition-colors shadow-2xs flex items-center space-x-1 cursor-pointer"
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Complete</span>
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">

      {/* Metadata Bar */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground bg-card border border-border/70 rounded-[8px] p-3 shadow-xs">
        <span>PAN: <strong className="font-mono text-foreground">{pan}</strong></span>
        <span>•</span>
        <span>Phone: <strong className="text-foreground">{phone}</strong></span>
        <span>•</span>
        <span>Email: <strong className="text-foreground">{email}</strong></span>
      </div>

      {/* Workflow Pipeline Stepper */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">AY 2026–27 Workflow Stepper Pipeline</h2>

        <div className="overflow-x-auto py-2">
          <div className="flex items-center justify-between min-w-[650px] relative">
            
            {/* Connecting Line */}
            <div className="absolute top-4 left-6 right-6 h-0.5 bg-emerald-500/30 z-0" />

            {steps.map((step, idx) => (
              <div key={step.id} className="flex flex-col items-center space-y-2 z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs transition-all ${
                    step.done
                      ? 'bg-emerald-500 text-white border-2 border-emerald-500/40'
                      : 'bg-muted text-muted-foreground border-2 border-border'
                  }`}
                >
                  {step.done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span className="text-xs font-semibold text-foreground whitespace-nowrap">{step.label}</span>
              </div>
            ))}

          </div>
        </div>
      </div>

      {/* Bottom Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Left: Document Status List */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
          <h2 className="text-sm font-semibold text-foreground border-b border-border pb-2">Required Checklist Status</h2>

          <div className="space-y-2.5">
            {docList.map((doc) => (
              <div
                key={doc.id}
                onClick={() => toggleDoc(doc.id)}
                className="flex items-center justify-between p-3 rounded-lg border border-border/80 hover:bg-muted/40 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={doc.checked}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-primary border-border focus:ring-primary cursor-pointer"
                  />
                  <span className={`text-xs font-medium ${doc.checked ? 'text-foreground line-through opacity-80' : 'text-foreground'}`}>
                    {doc.name}
                  </span>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    doc.checked
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  }`}
                >
                  {doc.checked ? 'Received' : 'Pending'}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => alert('WhatsApp document upload request sent to client.')}
            className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary font-semibold rounded-lg text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Request document</span>
          </button>
        </div>

        {/* Right: Activity Timeline */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
          <h2 className="text-sm font-semibold text-foreground border-b border-border pb-2">Activity Log Timeline</h2>

          <div className="space-y-4 text-xs">
            
            <div className="flex items-start space-x-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
              <div>
                <p className="font-semibold text-foreground">ITR Filed Successfully</p>
                <p className="text-[11px] text-muted-foreground">Acknowledgment ACK #88192019 generated on IT Portal.</p>
                <span className="text-[10px] font-mono text-muted-foreground mt-0.5 block">May 28, 2026 • 3:45 pm</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Tax Computation Draft Approved</p>
                <p className="text-[11px] text-muted-foreground font-medium">Draft reviewed and approved by CA Rahul Mishra.</p>
                <span className="text-[10px] font-mono text-muted-foreground mt-0.5 block">May 27, 2026 • 11:15 am</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Form 16 & Bank Statement Uploaded</p>
                <p className="text-[11px] text-muted-foreground">Client uploaded 2 documents via WhatsApp portal link.</p>
                <span className="text-[10px] font-mono text-muted-foreground mt-0.5 block">May 20, 2026 • 6:30 pm</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Action Footer Row */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowChatModal(true)}
            className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat with Client</span>
          </button>

          <button
            onClick={() => alert(`WhatsApp notification sent to ${phone}`)}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send WhatsApp</span>
          </button>

          <button
            onClick={() => {
              navigator.clipboard?.writeText(`https://caportal.app/p/mehta-9012`);
              alert('Portal link copied to clipboard!');
            }}
            className="px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted font-semibold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy portal link</span>
          </button>

          <button
            onClick={() => alert('Downloading tax fee invoice PDF...')}
            className="px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted font-semibold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download invoice</span>
          </button>

          <button
            onClick={onPreviewPortal}
            className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-semibold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview portal</span>
          </button>
        </div>

        <button
          onClick={() => alert('Issue flagged for staff review.')}
          className="px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 font-semibold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Flag issue</span>
        </button>

      </div>

      </div>

      {/* Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/70 rounded-xl max-w-2xl w-full h-[650px] max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
            <DirectChatBox
              clientId={clientId}
              client={client}
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
              onClose={() => setShowChatModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
