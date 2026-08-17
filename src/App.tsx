import React, { useEffect, useState } from 'react';
import {
  Tenant,
  Client,
  Filing,
  DocumentRequirement,
  Payment,
  AuditLog,
  DownloadEvent,
  StaffMember,
  FeatureFlags,
  NotificationItem,
  FilingStatus,
  ChatMessage,
  User,
} from './types';
import {
  defaultTenant,
  defaultFeatureFlags,
  defaultUsers,
  defaultClients,
  defaultCategories,
  defaultFilings,
  defaultRequirements,
  defaultPayments,
  defaultNotifications,
  defaultAuditLogs,
  defaultDownloadEvents,
  defaultStaffMembers,
  defaultChatMessages,
} from './data/mockData';

import { HeaderNavbar } from './components/HeaderNavbar';
import { AdminSidebar } from './components/admin/AdminSidebar';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { ClientManagementView } from './components/admin/ClientManagementView';
import { FilingDetailAdminView } from './components/admin/FilingDetailAdminView';
import { PaymentsAdminView } from './components/admin/PaymentsAdminView';
import { AuditLogsView } from './components/admin/AuditLogsView';
import { StaffManagementView } from './components/admin/StaffManagementView';
import { FirmSettingsView } from './components/admin/FirmSettingsView';
import { DocumentsView } from './components/admin/DocumentsView';
import { DeadlinesView } from './components/admin/DeadlinesView';
import { InvoicesView } from './components/admin/InvoicesView';
import { TaxComputeView } from './components/admin/TaxComputeView';
import { TemplatesView } from './components/admin/TemplatesView';
import { ClientProfileDetailView } from './components/admin/ClientProfileDetailView';
import { RemindersView } from './components/admin/RemindersView';
import { AckTrackerView } from './components/admin/AckTrackerView';
import { ClientAppView } from './components/client/ClientAppView';
import { DocumentViewerModal } from './components/common/DocumentViewerModal';
import { V2IntelligencePreviewModal } from './components/v2/V2IntelligencePreviewModal';
import { BrandGuidelinesModal } from './components/common/BrandGuidelinesModal';
import { AuthPage } from './components/auth/AuthPage';

export const App: React.FC = () => {
  // Theme & Brand Modal State
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>('dark');
  const [showBrandModal, setShowBrandModal] = useState(false);

  // Sidebar Preferences
  const [hideSidebarTools, setHideSidebarTools] = useState<boolean>(() => {
    try {
      return localStorage.getItem('taxvault_hide_sidebar_tools') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleHideSidebarTools = () => {
    setHideSidebarTools((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('taxvault_hide_sidebar_tools', String(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });
  };

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('taxvault_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [currentTheme]);

  // Role / Portal Navigation State
  const [activePortalRole, setActivePortalRole] = useState<'admin' | 'client'>(() => {
    return currentUser?.role === 'CLIENT' ? 'client' : 'admin';
  });

  const [activeAdminTab, setActiveAdminTab] = useState<
    | 'dashboard'
    | 'clients'
    | 'filings'
    | 'filing-detail'
    | 'payments'
    | 'audit'
    | 'staff'
    | 'settings'
  >('dashboard');

  // Selected Entities
  const [selectedFilingId, setSelectedFilingId] = useState<string | null>(null);

  // Data Store State
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [filings, setFilings] = useState<Filing[]>([]);
  const [requirements, setRequirements] = useState<DocumentRequirement[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [downloadEvents, setDownloadEvents] = useState<DownloadEvent[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Client App State
  const [selectedClientId, setSelectedClientId] = useState<string>('client-1');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Preview Modals
  const [previewDoc, setPreviewDoc] = useState<{ title: string; url?: string; versions?: any[] } | null>(null);
  const [showV2Modal, setShowV2Modal] = useState(false);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Helper for resilient fetch calls (handles HTML 404 fallback responses on static hosts like Vercel)
  const safeFetchJson = async <T,>(url: string, fallback: T): Promise<T> => {
    try {
      const res = await fetch(url);
      if (!res.ok) return fallback;
      const text = await res.text();
      if (!text || text.trim().startsWith('<') || text.includes('<!DOCTYPE html>')) {
        return fallback;
      }
      const data = JSON.parse(text);
      return data ?? fallback;
    } catch {
      return fallback;
    }
  };

  // Load All System Data from Express Backend or Local Fallbacks
  const loadInitialData = async () => {
    try {
      const [
        tRes,
        uRes,
        cRes,
        fRes,
        rRes,
        pRes,
        aRes,
        dlRes,
        sRes,
        ffRes,
        catRes,
        chatRes,
      ] = await Promise.all([
        safeFetchJson('/api/tenant', defaultTenant),
        safeFetchJson('/api/users', defaultUsers),
        safeFetchJson('/api/clients', defaultClients),
        safeFetchJson('/api/filings', defaultFilings),
        safeFetchJson('/api/documents/requirements', defaultRequirements),
        safeFetchJson('/api/payments', defaultPayments),
        safeFetchJson('/api/audit', defaultAuditLogs),
        safeFetchJson('/api/download-events', defaultDownloadEvents),
        safeFetchJson('/api/staff', defaultStaffMembers),
        safeFetchJson('/api/feature-flags', defaultFeatureFlags),
        safeFetchJson('/api/categories', defaultCategories),
        safeFetchJson('/api/chat', defaultChatMessages),
      ]);

      setTenant(tRes);
      setAllUsers(Array.isArray(uRes) && uRes.length > 0 ? uRes : defaultUsers);
      setClients(Array.isArray(cRes) && cRes.length > 0 ? cRes : defaultClients);
      setFilings(Array.isArray(fRes) && fRes.length > 0 ? fRes : defaultFilings);
      setRequirements(Array.isArray(rRes) && rRes.length > 0 ? rRes : defaultRequirements);
      setPayments(Array.isArray(pRes) && pRes.length > 0 ? pRes : defaultPayments);
      setAuditLogs(Array.isArray(aRes) && aRes.length > 0 ? aRes : defaultAuditLogs);
      setDownloadEvents(Array.isArray(dlRes) && dlRes.length > 0 ? dlRes : defaultDownloadEvents);
      setStaffList(Array.isArray(sRes) && sRes.length > 0 ? sRes : defaultStaffMembers);
      setFeatureFlags(ffRes);
      setCategories(Array.isArray(catRes) && catRes.length > 0 ? catRes : defaultCategories);
      setChatMessages(Array.isArray(chatRes) && chatRes.length > 0 ? chatRes : defaultChatMessages);

      const activeFilingsList = Array.isArray(fRes) && fRes.length > 0 ? fRes : defaultFilings;
      if (activeFilingsList.length > 0 && !selectedFilingId) {
        setSelectedFilingId(activeFilingsList[0].id);
      }

      // Default client notifications simulation
      setNotifications(defaultNotifications);
    } catch (err) {
      console.warn('Initial data load notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Login & Signup Completion Handler
  const handleLoginSuccess = async (user: User, clientObj?: Client | null) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('taxvault_user', JSON.stringify(user));
    } catch (e) {
      console.warn(e);
    }

    await loadInitialData();

    if (user.role === 'CLIENT') {
      setActivePortalRole('client');
      if (clientObj) {
        setSelectedClientId(clientObj.id);
      } else {
        const clientList = clients.length > 0 ? clients : defaultClients;
        const found = clientList.find(
          (c) =>
            (c.email && user.email && c.email.toLowerCase() === user.email.toLowerCase()) ||
            (c.mobile && user.mobile && c.mobile === user.mobile)
        );
        setSelectedClientId(found ? found.id : 'client-1');
      }
    } else {
      setActivePortalRole('admin');
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn(e);
    }
    localStorage.removeItem('taxvault_user');
    setCurrentUser(null);
  };

  // --- HANDLERS ---

  // Create Client
  const handleAddClient = async (newClientData: any) => {
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClientData),
      });
      const created = await res.json();
      setClients((prev) => [created, ...prev]);
      await loadInitialData();
    } catch (err) {
      console.error('Error creating client:', err);
    }
  };

  // Create Filing
  const handleCreateFiling = async (clientId: string) => {
    try {
      const res = await fetch('/api/filings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, financialYear: 'FY 2025–26', assessmentYear: 'AY 2026–27', feeAmount: 2500 }),
      });
      const created = await res.json();
      setFilings((prev) => [created, ...prev]);
      setSelectedFilingId(created.id);
      setActiveAdminTab('filing-detail');
      await loadInitialData();
    } catch (err) {
      console.error('Error creating filing:', err);
    }
  };

  // Update Filing Status
  const handleUpdateFilingStatus = async (filingId: string, status: FilingStatus) => {
    try {
      await fetch(`/api/filings/${filingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      await loadInitialData();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Approve Document
  const handleApproveDoc = async (reqId: string) => {
    try {
      await fetch(`/api/documents/${reqId}/approve`, {
        method: 'POST',
      });
      await loadInitialData();
    } catch (err) {
      console.error('Error approving document:', err);
    }
  };

  // Reject Document
  const handleRejectDoc = async (reqId: string, reason: string) => {
    try {
      await fetch(`/api/documents/${reqId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      await loadInitialData();
    } catch (err) {
      console.error('Error rejecting document:', err);
    }
  };

  // Request Additional Doc
  const handleRequestAdditionalDoc = async (
    filingId: string,
    categoryId: string,
    name: string,
    description: string
  ) => {
    try {
      await fetch('/api/documents/request-additional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filingId, categoryId, name, description }),
      });
      await loadInitialData();
    } catch (err) {
      console.error('Error requesting document:', err);
    }
  };

  // Upload Final Tax Docs (CA)
  const handleUploadFinalDoc = async (filingId: string, title: string, fileName: string) => {
    try {
      await fetch('/api/documents/upload-final', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filingId, title, fileName }),
      });
      await loadInitialData();
    } catch (err) {
      console.error('Error uploading final doc:', err);
    }
  };

  // Upload Document (Client App)
  const handleClientUploadDoc = async (
    requirementId: string,
    fileName: string,
    fileType: string,
    fileSize: number
  ) => {
    try {
      await fetch(`/api/documents/${requirementId}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadedBy: 'Yuvaraj Vasam (Client)',
          fileName,
          fileType,
          fileSize,
          contentUrl: `https://pdfobject.com/pdf/sample.pdf`,
        }),
      });
      await loadInitialData();
    } catch (err) {
      console.error('Error uploading document:', err);
    }
  };

  // Pay Filing (Client App)
  const handlePayFiling = async (filingId: string) => {
    try {
      await fetch(`/api/payments/${filingId}/pay`, {
        method: 'POST',
      });
      await loadInitialData();
    } catch (err) {
      console.error('Error paying filing:', err);
    }
  };

  // Verify PAN + DOB (Client App)
  const handleVerifyPanDob = async (filingId: string, pan: string, dob: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/verify-pan-dob', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filingId, pan, dateOfBirth: dob }),
      });
      const data = await res.json();
      if (data.success) {
        await loadInitialData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error verifying identity:', err);
      return false;
    }
  };

  // Download Document (Client App / Admin)
  const handleDownloadDoc = async (requirementId: string) => {
    try {
      const activeF = filings.find((f) => f.id === selectedFilingId) || filings[0];
      const res = await fetch(`/api/documents/${requirementId}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filingId: activeF?.id,
          userName: 'Yuvaraj Vasam',
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(`Download blocked by TaxVault security lock: ${err.error}`);
        return null;
      }
      const data = await res.json();
      await loadInitialData();
      return { downloadUrl: data.downloadUrl, fileName: data.fileName };
    } catch (err) {
      console.error('Error downloading:', err);
      return null;
    }
  };

  // Invite Staff
  const handleInviteStaff = async (name: string, email: string, mobile: string, permissions: string[]) => {
    try {
      await fetch('/api/staff/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, mobile, permissions }),
      });
      await loadInitialData();
    } catch (err) {
      console.error('Error inviting staff:', err);
    }
  };

  // Update Tenant Branding
  const handleUpdateTenant = async (updated: Tenant) => {
    try {
      await fetch('/api/tenant', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      await loadInitialData();
    } catch (err) {
      console.error('Error updating tenant:', err);
    }
  };

  // Add Document Requirement Category
  const handleAddCategory = async (name: string, description: string) => {
    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      await loadInitialData();
    } catch (err) {
      console.error('Error adding category:', err);
    }
  };

  const handleBulkRemindPending = async () => {
    alert('Bulk SMS/WhatsApp reminders sent to 2 clients with pending document requirements!');
    await loadInitialData();
  };

  const handleBulkMarkCompleted = async () => {
    alert('Bulk completed status updated for selected filings!');
    await loadInitialData();
  };

  // Chat message handlers
  const handleSendMessage = async (
    clientId: string,
    message: string,
    senderRole: 'CA_ADMIN' | 'CA_STAFF' | 'CLIENT',
    senderName: string,
    attachments?: any
  ) => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, message, senderRole, senderName, attachments }),
      });
      if (res.ok) {
        const savedMessage = await res.json();
        setChatMessages((prev) => [...prev, savedMessage]);
      }
    } catch (err) {
      console.error('Error sending chat message:', err);
    }
  };

  const handleMarkChatRead = async (
    clientId: string,
    readerRole: 'CA_ADMIN' | 'CA_STAFF' | 'CLIENT'
  ) => {
    try {
      await fetch('/api/chat/read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, readerRole }),
      });
      setChatMessages((prev) =>
        prev.map((m) =>
          m.clientId === clientId && m.senderRole !== readerRole ? { ...m, read: true } : m
        )
      );
    } catch (err) {
      console.error('Error marking chat read:', err);
    }
  };

  const activeFilingObj = filings.find((f) => f.id === selectedFilingId) || filings[0];
  const activeReqsObj = activeFilingObj
    ? requirements.filter((r) => r.filingId === activeFilingObj.id)
    : [];
  const activeClientObj = clients.find((c) => c.id === (activeFilingObj?.clientId || selectedClientId)) || clients[0];

  if (isLoading || !tenant) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center space-y-3 font-mono">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-[0.2rem] animate-spin" />
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">SYSTEM / INITIALIZING TAXVAULT CONTEXT...</p>
      </div>
    );
  }

  // If user is not logged in, display full Authentication experience
  if (!currentUser) {
    return (
      <AuthPage
        tenant={tenant}
        portalMode={activePortalRole}
        onSwitchPortal={(role) => setActivePortalRole(role)}
        onLoginSuccess={handleLoginSuccess}
        currentTheme={currentTheme}
        onToggleTheme={() => setCurrentTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
      />
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground font-sans overflow-hidden transition-colors duration-200">
      
      {/* Global Header */}
      <HeaderNavbar
        activeRole={activePortalRole}
        onSwitchRole={(role) => setActivePortalRole(role)}
        tenant={tenant}
        currentUser={currentUser}
        allUsers={allUsers.length > 0 ? allUsers : undefined}
        onSelectUser={(userId) => {
          const matched = allUsers.find((u) => u.id === userId);
          if (matched) {
            setCurrentUser(matched);
            try {
              localStorage.setItem('taxvault_user', JSON.stringify(matched));
            } catch (e) {
              console.warn(e);
            }
            if (matched.role === 'CLIENT') {
              setActivePortalRole('client');
              const cl = clients.find(
                (c) =>
                  (c.email && matched.email && c.email.toLowerCase() === matched.email.toLowerCase()) ||
                  (c.mobile && matched.mobile && c.mobile === matched.mobile)
              );
              if (cl) setSelectedClientId(cl.id);
            } else {
              setActivePortalRole('admin');
            }
          }
        }}
        onLogout={handleLogout}
        onOpenV2Modal={() => setShowV2Modal(true)}
        onOpenBrandGuidelines={() => setShowBrandModal(true)}
        currentTheme={currentTheme}
        onToggleTheme={() => setCurrentTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
      />

      {/* Main Workspace Body */}
      {activePortalRole === 'admin' ? (
        <div className="flex-1 flex w-full min-h-0 overflow-hidden">
          
          {/* Admin Navigation Sidebar Sticked to Left Attached to Topbar */}
          <AdminSidebar
            activeTab={activeAdminTab}
            hideToolsSection={hideSidebarTools}
            onSelectTab={(tab) => {
              if (tab === 'filings') {
                setActiveAdminTab('filings');
              } else {
                setActiveAdminTab(tab as any);
              }
            }}
            urgentCount={filings.filter((f) => f.status === 'UNDER_REVIEW' || f.status === 'DOCUMENTS_SUBMITTED').length}
            pendingDocsCount={requirements.filter((r) => r.status === 'PENDING' || r.status === 'REJECTED').length}
          />

          {/* Admin Active Tab Content View */}
          {activeAdminTab === 'settings' && featureFlags && tenant ? (
            <FirmSettingsView
              tenant={tenant}
              categories={categories}
              featureFlags={featureFlags}
              staffList={staffList}
              auditLogs={auditLogs}
              downloadEvents={downloadEvents}
              payments={payments}
              filings={filings}
              currentTheme={currentTheme}
              hideToolsSection={hideSidebarTools}
              onToggleHideToolsSection={handleToggleHideSidebarTools}
              onToggleTheme={() => setCurrentTheme(prev => prev === 'dark' ? 'light' : 'dark')}
              onUpdateTenant={handleUpdateTenant}
              onAddCategory={handleAddCategory}
              onInviteStaff={handleInviteStaff}
            />
          ) : (
            <main className="flex-1 min-w-0 p-4 flex flex-col min-h-0 overflow-hidden">
              
              {/* Tab 1: Dashboard Overview */}
              {(activeAdminTab === 'dashboard' || activeAdminTab === 'filings') && (
                <AdminDashboardView
                  filings={filings}
                  clients={clients}
                  requirements={requirements}
                  auditLogs={auditLogs}
                  onSelectFiling={(filing) => {
                    if (typeof filing === 'string') {
                      setSelectedFilingId(filing);
                    } else {
                      setSelectedFilingId(filing.id);
                    }
                    setActiveAdminTab('filing-detail');
                  }}
                  onCreateFiling={(clientId) => handleCreateFiling(clientId)}
                  onBulkRemind={handleBulkRemindPending}
                  onBulkMarkCompleted={handleBulkMarkCompleted}
                />
              )}

              {/* Tab 2: Clients Directory & Detail */}
              {activeAdminTab === 'clients' && (
                <ClientManagementView
                  clients={clients}
                  filings={filings}
                  chatMessages={chatMessages}
                  onAddClient={handleAddClient}
                  onSelectClient={(c) => {
                    setSelectedClientId(c.id);
                    setActiveAdminTab('client-detail');
                  }}
                  onCreateFilingForClient={(cId) => handleCreateFiling(cId)}
                  onSendMessage={handleSendMessage}
                  onMarkChatRead={handleMarkChatRead}
                />
              )}

              {/* Client Profile Detail View */}
              {activeAdminTab === 'client-detail' && (
                <ClientProfileDetailView
                  client={activeClientObj}
                  chatMessages={chatMessages}
                  onBack={() => setActiveAdminTab('clients')}
                  onPreviewPortal={() => setActivePortalRole('client')}
                  onSendMessage={handleSendMessage}
                  onMarkChatRead={handleMarkChatRead}
                />
              )}

              {/* Tab 3: Documents Management */}
              {activeAdminTab === 'documents' && (
                <DocumentsView
                  clients={clients}
                  requirements={requirements}
                  onPreviewDoc={(doc) => setPreviewDoc({ title: doc.name, url: '#' })}
                />
              )}

              {/* Tab 4: Deadlines Tracking */}
              {activeAdminTab === 'deadlines' && <DeadlinesView />}

              {/* Tab 5: Invoices & Billing */}
              {activeAdminTab === 'invoices' && <InvoicesView />}

              {/* Tab 6: Reminders Log */}
              {activeAdminTab === 'reminders' && <RemindersView />}

              {/* Tab 7: Tax Compute & Balance Sheet */}
              {(activeAdminTab === 'tax-compute' || activeAdminTab === 'balance-sheet') && <TaxComputeView />}

              {/* Tab 8: Ack Tracker */}
              {activeAdminTab === 'ack-tracker' && (
                <AckTrackerView
                  onPreviewDocument={(title, url, versions) => setPreviewDoc({ title, url, versions })}
                />
              )}

              {/* Tab 9: Work Type Templates */}
              {activeAdminTab === 'templates' && <TemplatesView />}

              {/* Tab 10: Filing Detail Review Screen */}
              {activeAdminTab === 'filing-detail' && activeFilingObj && (
                <FilingDetailAdminView
                  filing={activeFilingObj}
                  requirements={activeReqsObj}
                  client={activeClientObj}
                  chatMessages={chatMessages}
                  onBack={() => setActiveAdminTab('dashboard')}
                  onUpdateStatus={handleUpdateFilingStatus}
                  onApproveDocument={handleApproveDoc}
                  onRejectDocument={handleRejectDoc}
                  onRequestAdditionalDoc={handleRequestAdditionalDoc}
                  onUploadFinalDocument={handleUploadFinalDoc}
                  onPreviewDocument={(title, url, versions) => setPreviewDoc({ title, url, versions })}
                  onSendMessage={handleSendMessage}
                  onMarkChatRead={handleMarkChatRead}
                />
              )}

              {/* Tab 11: Payments & Vault Lock */}
              {activeAdminTab === 'payments' && (
                <PaymentsAdminView payments={payments} filings={filings} />
              )}

              {/* Tab 12: Audit Trail & Download History */}
              {activeAdminTab === 'audit' && (
                <AuditLogsView auditLogs={auditLogs} downloadEvents={downloadEvents} />
              )}

              {/* Tab 13: Staff Management */}
              {activeAdminTab === 'staff' && (
                <StaffManagementView staffList={staffList} onInviteStaff={handleInviteStaff} />
              )}

            </main>
          )}

        </div>
      ) : (
        /* Client Mobile Application Portal */
        <div className="flex-1 py-4 px-4 flex items-center justify-center bg-muted/20 min-h-0 overflow-hidden">
          {activeClientObj && (
            <ClientAppView
              client={activeClientObj}
              tenant={tenant}
              filings={filings.filter((f) => f.clientId === activeClientObj.id)}
              requirements={requirements}
              notifications={notifications}
              payments={payments}
              chatMessages={chatMessages}
              onUploadDocument={handleClientUploadDoc}
              onPayFiling={handlePayFiling}
              onVerifyPanDob={handleVerifyPanDob}
              onDownloadDocument={handleDownloadDoc}
              onMarkNotificationRead={(id) => {
                setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
              }}
              onPreviewDocument={(title, url, versions) => setPreviewDoc({ title, url, versions })}
              onSendMessage={handleSendMessage}
              onMarkChatRead={handleMarkChatRead}
            />
          )}
        </div>
      )}

      {/* Document Viewer Modal */}
      {previewDoc && (
        <DocumentViewerModal
          title={previewDoc.title}
          url={previewDoc.url}
          versions={previewDoc.versions}
          onClose={() => setPreviewDoc(null)}
        />
      )}

      {/* V2 Intelligence Preview Modal */}
      {showV2Modal && (
        <V2IntelligencePreviewModal onClose={() => setShowV2Modal(false)} />
      )}

      {/* Brand Guidelines Specification Showcase Modal */}
      <BrandGuidelinesModal
        isOpen={showBrandModal}
        onClose={() => setShowBrandModal(false)}
        currentTheme={currentTheme}
        onToggleTheme={() => setCurrentTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
      />

    </div>
  );
};

export default App;
