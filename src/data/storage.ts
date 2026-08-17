import {
  Tenant,
  User,
  Client,
  Filing,
  DocumentRequirement,
  Payment,
  NotificationItem,
  DownloadEvent,
  AuditLog,
  StaffMember,
  DocumentCategory,
  ChatMessage,
} from '../types';
import {
  defaultTenant,
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
} from './mockData';

const getStorageItem = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const setStorageItem = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage save error:', e);
  }
};

export const getLocalStore = () => {
  return {
    tenant: getStorageItem<Tenant>('ezca_tenant', defaultTenant),
    users: getStorageItem<User[]>('ezca_users', defaultUsers),
    clients: getStorageItem<Client[]>('ezca_clients', defaultClients),
    categories: getStorageItem<DocumentCategory[]>('ezca_categories', defaultCategories),
    filings: getStorageItem<Filing[]>('ezca_filings', defaultFilings),
    requirements: getStorageItem<DocumentRequirement[]>('ezca_requirements', defaultRequirements),
    payments: getStorageItem<Payment[]>('ezca_payments', defaultPayments),
    notifications: getStorageItem<NotificationItem[]>('ezca_notifications', defaultNotifications),
    auditLogs: getStorageItem<AuditLog[]>('ezca_audit_logs', defaultAuditLogs),
    downloadEvents: getStorageItem<DownloadEvent[]>('ezca_download_events', defaultDownloadEvents),
    staffMembers: getStorageItem<StaffMember[]>('ezca_staff_members', defaultStaffMembers),
    chatMessages: getStorageItem<ChatMessage[]>('ezca_chat_messages', defaultChatMessages),
  };
};

export const saveLocalStore = (data: Partial<ReturnType<typeof getLocalStore>>) => {
  if (data.tenant !== undefined) setStorageItem('ezca_tenant', data.tenant);
  if (data.users !== undefined) setStorageItem('ezca_users', data.users);
  if (data.clients !== undefined) setStorageItem('ezca_clients', data.clients);
  if (data.categories !== undefined) setStorageItem('ezca_categories', data.categories);
  if (data.filings !== undefined) setStorageItem('ezca_filings', data.filings);
  if (data.requirements !== undefined) setStorageItem('ezca_requirements', data.requirements);
  if (data.payments !== undefined) setStorageItem('ezca_payments', data.payments);
  if (data.notifications !== undefined) setStorageItem('ezca_notifications', data.notifications);
  if (data.auditLogs !== undefined) setStorageItem('ezca_audit_logs', data.auditLogs);
  if (data.downloadEvents !== undefined) setStorageItem('ezca_download_events', data.downloadEvents);
  if (data.staffMembers !== undefined) setStorageItem('ezca_staff_members', data.staffMembers);
  if (data.chatMessages !== undefined) setStorageItem('ezca_chat_messages', data.chatMessages);
};
