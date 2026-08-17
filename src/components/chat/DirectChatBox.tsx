import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Client } from '../../types';
import {
  Send,
  Paperclip,
  Check,
  CheckCheck,
  Sparkles,
  FileText,
  X,
  Search,
  MessageSquare,
  Clock,
  Shield,
  User,
  Building,
} from 'lucide-react';

interface DirectChatBoxProps {
  clientId: string;
  client?: Client;
  messages: ChatMessage[];
  currentRole: 'CA_ADMIN' | 'CA_STAFF' | 'CLIENT';
  currentUserName: string;
  onSendMessage: (
    clientId: string,
    message: string,
    senderRole: 'CA_ADMIN' | 'CA_STAFF' | 'CLIENT',
    senderName: string,
    attachments?: { name: string; type: string; url?: string; size?: number }[]
  ) => void;
  onMarkRead?: (clientId: string, readerRole: 'CA_ADMIN' | 'CA_STAFF' | 'CLIENT') => void;
  compact?: boolean;
  onClose?: () => void;
  className?: string;
}

export const DirectChatBox: React.FC<DirectChatBoxProps> = ({
  clientId,
  client,
  messages,
  currentRole,
  currentUserName,
  onSendMessage,
  onMarkRead,
  compact = false,
  onClose,
  className = '',
}) => {
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; type: string; size: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter messages for this client
  const clientMessages = messages.filter((m) => m.clientId === clientId);

  const displayedMessages = clientMessages.filter((m) => {
    if (!searchQuery) return true;
    const q = (searchQuery || '').toLowerCase();
    return (
      (m.message || '').toLowerCase().includes(q) ||
      (m.senderName || '').toLowerCase().includes(q)
    );
  });

  // Mark as read when opened or new messages arrive
  useEffect(() => {
    if (onMarkRead && clientMessages.some((m) => !m.read && m.senderRole !== currentRole)) {
      onMarkRead(clientId, currentRole);
    }
  }, [clientId, clientMessages.length, currentRole]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [clientMessages.length]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !attachedFile) return;

    const attachments = attachedFile
      ? [
          {
            name: attachedFile.name,
            type: attachedFile.type,
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            size: attachedFile.size,
          },
        ]
      : undefined;

    onSendMessage(
      clientId,
      inputText.trim(),
      currentRole,
      currentUserName,
      attachments
    );

    setInputText('');
    setAttachedFile(null);
  };

  const handleQuickTemplate = (text: string) => {
    setInputText(text);
  };

  const isClientView = currentRole === 'CLIENT';
  const clientFullName = client ? `${client.firstName} ${client.lastName}` : 'Client';

  const adminQuickTemplates = [
    'Please upload your Form 16 Part B to proceed.',
    'Your draft tax computation is ready for review.',
    'Payment receipt verified. Documents unlocked in your vault.',
    'Please confirm your Section 80C investment breakdown.',
  ];

  const clientQuickTemplates = [
    'I have uploaded the requested documents.',
    'When will my ITR acknowledgement be filed?',
    'Could you clarify the tax deduction on my salary?',
    'I have completed the fee payment.',
  ];

  const quickTemplates = isClientView ? clientQuickTemplates : adminQuickTemplates;

  return (
    <div
      className={`flex flex-col bg-card overflow-hidden h-full w-full ${
        compact || isClientView
          ? 'border-0 rounded-none shadow-none text-xs'
          : 'border border-border/70 rounded-[8px] shadow-sm text-sm'
      } ${className}`}
    >
      {/* Header */}
      <div className="bg-card border-b border-border/70 px-3.5 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="relative">
            <div
              className={`w-8 h-8 rounded-[6px] flex items-center justify-center font-semibold text-xs ${
                isClientView ? 'bg-primary text-primary-foreground' : 'bg-indigo-600 text-white'
              }`}
            >
              {isClientView ? <Building className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border-2 border-card rounded-full" />
          </div>

          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="font-semibold text-foreground text-[13px]">
                {isClientView ? 'CA Support & Desk' : clientFullName}
              </h3>
              <span className="text-[9px] px-1.5 py-0.5 rounded-[4px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                Online
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]">
              {isClientView ? 'Kothari & Associates • Tax Vault Support' : `PAN: ${client?.pan || 'N/A'} • ID: ${client?.clientId || clientId}`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setShowSearch(!showSearch)}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-[6px] transition-colors cursor-pointer"
            title="Search messages"
          >
            <Search className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-[6px] transition-colors cursor-pointer"
              title="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Input Bar (Expandable) */}
      {showSearch && (
        <div className="p-2 border-b border-border/60 bg-muted/20 flex items-center space-x-2 shrink-0">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border/70 rounded-[4px] px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            autoFocus
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-muted-foreground hover:text-foreground text-xs p-1">
              ✕
            </button>
          )}
        </div>
      )}

      {/* Messages Thread Container */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 min-h-0 bg-background/40">
        {displayedMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-muted-foreground">
            <div className="w-9 h-9 rounded-[6px] bg-muted/60 flex items-center justify-center text-muted-foreground">
              <MessageSquare className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-foreground">No messages yet</p>
            <p className="text-[11px] max-w-xs text-muted-foreground">
              {isClientView
                ? 'Send a message directly to your CA team for fast filing queries and updates.'
                : `Start a direct conversation with ${clientFullName}. They can view and reply from their TaxVault portal.`}
            </p>
          </div>
        ) : (
          displayedMessages.map((msg) => {
            const isMe = msg.senderRole === currentRole;
            const formattedTime = new Date(msg.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
              >
                {/* Sender badge (if received message) */}
                {!isMe && (
                  <span className="text-[10px] font-semibold text-muted-foreground px-0.5">
                    {msg.senderName} ({msg.senderRole === 'CA_ADMIN' ? 'CA Admin' : msg.senderRole === 'CA_STAFF' ? 'Staff' : 'Client'})
                  </span>
                )}

                {/* Bubble - clean modern rectangular shape without rounded bubble look */}
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-[6px] px-3.5 py-2.5 shadow-2xs ${
                    isMe
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border/75 text-foreground'
                  }`}
                >
                  {/* Attachment if present */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mb-2 space-y-1.5">
                      {msg.attachments.map((att, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center space-x-2 p-2 rounded-[4px] text-xs font-medium ${
                            isMe ? 'bg-primary-foreground/10 text-primary-foreground' : 'bg-muted/80 text-foreground'
                          }`}
                        >
                          <FileText className="w-4 h-4 shrink-0" />
                          <span className="truncate flex-1 font-mono text-[11px]">{att.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-[12.5px] leading-relaxed break-words whitespace-pre-wrap">{msg.message}</p>

                  <div
                    className={`flex items-center justify-end space-x-1 mt-1 text-[10px] ${
                      isMe ? 'text-primary-foreground/80' : 'text-muted-foreground'
                    }`}
                  >
                    <span>{formattedTime}</span>
                    {isMe && (
                      msg.read ? (
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-300 dark:text-emerald-400" />
                      ) : (
                        <Check className="w-3.5 h-3.5 opacity-70" />
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Responses Bar */}
      <div className="px-3 py-1.5 border-t border-border/60 bg-muted/20 flex items-center space-x-1.5 overflow-x-auto shrink-0 scrollbar-none">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Quick:
        </span>
        {quickTemplates.map((template, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleQuickTemplate(template)}
            className="px-2.5 py-1 rounded-[4px] bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-[11px] border border-border/60 whitespace-nowrap transition-colors cursor-pointer shrink-0"
          >
            {template}
          </button>
        ))}
      </div>

      {/* File Attachment Preview */}
      {attachedFile && (
        <div className="px-3 py-1.5 bg-muted/40 border-t border-border/60 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 text-xs text-foreground">
            <FileText className="w-3.5 h-3.5 text-primary" />
            <span className="font-medium truncate max-w-[200px]">{attachedFile.name}</span>
            <span className="text-[10px] text-muted-foreground">({Math.round(attachedFile.size / 1024)} KB)</span>
          </div>
          <button
            type="button"
            onClick={() => setAttachedFile(null)}
            className="text-muted-foreground hover:text-foreground p-1 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input Composer Form */}
      <form onSubmit={handleSend} className="p-2.5 bg-card border-t border-border/70 flex items-center space-x-2 shrink-0">
        <label
          htmlFor={`chat-file-${clientId}`}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-[6px] transition-colors cursor-pointer shrink-0"
          title="Attach document/PDF"
        >
          <Paperclip className="w-4 h-4" />
          <input
            id={`chat-file-${clientId}`}
            type="file"
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setAttachedFile({
                  name: file.name,
                  type: file.type || 'application/pdf',
                  size: file.size,
                });
              }
            }}
          />
        </label>

        <textarea
          rows={1}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={isClientView ? 'Type a question or message for your CA...' : `Message ${client?.firstName || 'client'}...`}
          className="flex-1 bg-background border border-border/70 rounded-[6px] px-3 py-2 text-[12.5px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none placeholder:text-muted-foreground/60 max-h-24 min-h-[38px]"
        />

        <button
          type="submit"
          disabled={!inputText.trim() && !attachedFile}
          className="p-2 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground rounded-[6px] transition-all shadow-xs cursor-pointer shrink-0"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
