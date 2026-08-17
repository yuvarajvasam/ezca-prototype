export type Role = 'SUPER_ADMIN' | 'CA_ADMIN' | 'CA_STAFF' | 'CLIENT';

export type FilingStatus =
  | 'CREATED'
  | 'DOCUMENTS_REQUESTED'
  | 'DOCUMENTS_PARTIALLY_SUBMITTED'
  | 'DOCUMENTS_SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ADDITIONAL_DOCUMENTS_REQUIRED'
  | 'FILING_IN_PROGRESS'
  | 'FILING_COMPLETED'
  | 'DOCUMENTS_READY'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_COMPLETED'
  | 'DOWNLOAD_UNLOCKED'
  | 'CLOSED';

export type RequirementStatus =
  | 'PENDING'
  | 'UPLOADED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'NOT_REQUIRED';

export type PaymentStatus =
  | 'CREATED'
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'REFUNDED'
  | 'CANCELLED';

export type NotificationType =
  | 'DOCUMENT_REQUESTED'
  | 'DOCUMENT_APPROVED'
  | 'DOCUMENT_REJECTED'
  | 'ADDITIONAL_DOCUMENT_REQUIRED'
  | 'FILING_STARTED'
  | 'FILING_COMPLETED'
  | 'DOCUMENTS_READY'
  | 'PAYMENT_REQUIRED'
  | 'PAYMENT_SUCCESSFUL'
  | 'DOCUMENTS_UNLOCKED';

export interface Tenant {
  id: string;
  brandName: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  supportPhone: string;
  supportEmail: string;
}

export interface User {
  id: string;
  tenantId: string;
  mobile: string;
  email: string;
  name: string;
  role: Role;
}

export interface Client {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  pan: string; // Masked on frontend or full on backend
  dateOfBirth: string; // YYYY-MM-DD
  address: string;
  clientId: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
}

export interface Filing {
  id: string;
  tenantId: string;
  clientId: string;
  clientName: string;
  panMasked: string;
  financialYear: string; // e.g. "FY 2025–26"
  assessmentYear: string; // e.g. "AY 2026–27"
  status: FilingStatus;
  progress: number; // 0-100
  totalDocuments: number;
  receivedDocuments: number;
  feeAmount: number;
  paymentStatus: PaymentStatus;
  panDobVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentCategory {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  isDefault: boolean;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  contentUrl?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface DocumentRequirement {
  id: string;
  filingId: string;
  documentCategoryId: string;
  categoryName: string;
  name: string;
  description: string;
  required: boolean;
  status: RequirementStatus;
  rejectionReason?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  currentDocument?: {
    id: string;
    status: 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
    latestVersion: DocumentVersion;
    versions: DocumentVersion[];
  };
}

export interface Payment {
  id: string;
  tenantId: string;
  clientId: string;
  filingId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: string;
  paidAt?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  tenantId: string;
  clientId: string;
  filingId?: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface DownloadEvent {
  id: string;
  tenantId: string;
  clientId: string;
  filingId: string;
  documentId: string;
  documentName: string;
  userId: string;
  userName: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  actorId: string;
  actorName: string;
  actorType: 'CA_ADMIN' | 'CA_STAFF' | 'CLIENT' | 'SYSTEM';
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  ipAddress: string;
  createdAt: string;
}

export interface StaffMember {
  id: string;
  tenantId: string;
  userId: string;
  name: string;
  email: string;
  mobile: string;
  role: Role;
  permissions: string[];
  status: 'ACTIVE' | 'INVITED' | 'INACTIVE';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  tenantId: string;
  clientId: string;
  senderId: string;
  senderName: string;
  senderRole: 'CA_ADMIN' | 'CA_STAFF' | 'CLIENT';
  message: string;
  attachments?: {
    name: string;
    type: string;
    url?: string;
    size?: number;
  }[];
  read: boolean;
  createdAt: string;
}

export interface FeatureFlags {
  PAYMENTS: boolean;
  PAN_DOB_VERIFICATION: boolean;
  PUSH_NOTIFICATIONS: boolean;
  AI_OCR: boolean;
  DOCUMENT_CLASSIFICATION: boolean;
  TAX_RULES: boolean;
  ITD_ERI: boolean;
  ITD_PREFILL: boolean;
  ITD_SUBMISSION: boolean;
  WHATSAPP: boolean;
}
