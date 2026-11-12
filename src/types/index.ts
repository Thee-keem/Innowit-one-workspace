export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'EXECUTIVE'
  | 'FINANCE_MANAGER'
  | 'ACCOUNTANT'
  | 'SALES_MANAGER'
  | 'SALES_REP'
  | 'PROCUREMENT_OFFICER'
  | 'INVENTORY_MANAGER'
  | 'HR_MANAGER'
  | 'PROJECT_MANAGER'
  | 'EMPLOYEE';

export type SystemModule =
  | 'COLLABORATION'
  | 'CRM'
  | 'ACCOUNTING'
  | 'INVENTORY'
  | 'PROCUREMENT'
  | 'SALES'
  | 'HR_PAYROLL'
  | 'ETIMS_COMPLIANCE'
  | 'BI_REPORTS'
  | 'SYSTEM_ADMIN';

export type ActionType =
  | 'VIEW'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'APPROVE'
  | 'POST_GL'
  | 'TRANSMIT_TAX';

export type AccountType =
  | 'ASSET'
  | 'LIABILITY'
  | 'EQUITY'
  | 'REVENUE'
  | 'EXPENSE';

export interface UserSessionPayload {
  userId: string;
  organizationId: string;
  branchId: string | null;
  email: string;
  fullName: string;
  role: UserRole;
  title: string;
  avatarInitials: string;
}

export interface Organization {
  id: string;
  legalName: string;
  tradeName: string;
  kraPin: string;
  vatNumber: string;
  currency: string;
  fiscalYearEnd: string;
}

export interface Branch {
  id: string;
  organizationId: string;
  branchCode: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  isHq: boolean;
}

export interface Account {
  id: string;
  organizationId: string;
  accountNumber: string;
  name: string;
  type: AccountType;
  subType?: string;
  balance: number;
  description?: string;
  currency: string;
  isActive: boolean;
  isReconciled?: boolean;
}

export interface JournalLine {
  id: string;
  accountId: string;
  accountNumber: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  reference: string;
  memo: string;
  postedBy: string;
  status: 'DRAFT' | 'POSTED' | 'VOID';
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
}

export interface EtimsRecord {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPin: string;
  totalAmountKes: number;
  vatAmountKes: number;
  environment: 'SANDBOX' | 'PRODUCTION';
  status: 'PENDING' | 'TRANSMITTED' | 'ACCEPTED' | 'FAILED';
  cuNumber: string; // Control Unit Number (e.g. KRAMU1234567890)
  kraReceiptNumber?: string;
  transmissionTimestamp: string;
  verificationUrl?: string;
  qrPayload?: string;
  errorCode?: string;
  retryCount: number;
}

export interface CustomerRecord {
  id: string;
  customerCode?: string;
  name: string;
  companyName?: string;
  kraPin: string;
  email: string;
  phone: string;
  city: string;
  billingAddress?: string;
  creditLimitKes?: number;
  paymentTermsDays?: number;
  totalRevenueKes: number;
  outstandingBalanceKes: number;
  status: 'ACTIVE' | 'INACTIVE';
  businessType?: 'CORPORATE' | 'INDIVIDUAL';
  leadSource?: string;
  createdAt?: string;
}

export interface ProductRecord {
  id: string;
  sku: string;
  name: string;
  category: string;
  unitPriceKes: number;
  stockOnHand: number;
  reorderLevel: number;
  vatRate: number; // 0.16 = 16%
  taxCode: 'A' | 'B' | 'E' | 'D'; // eTIMS Tax classification: A=16%, E=Exempt, B=Zero
}

// ============================================================================
// COLLABORATION TYPES (Phase 2)
// ============================================================================

export interface ChannelRecord {
  id: string;
  name: string;
  description: string;
  topic?: string;
  isPrivate: boolean;
  memberCount: number;
  createdById: string;
  createdAt: string;
  unreadCount?: number;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[]; // user fullNames
}

export interface WorkspaceFile {
  id: string;
  fileName: string;
  fileSize: number; // in bytes
  mimeType: string;
  category: 'DOCUMENT' | 'SPREADSHEET' | 'IMAGE' | 'FISCAL_RECEIPT';
  uploadedBy: string;
  uploadedAt: string;
  relatedEntityTag?: string; // e.g. "INV-2026-0042", "Safaricom PLC", "KRA eTIMS Cert"
  downloadUrl?: string;
}

export interface MessageRecord {
  id: string;
  channelId?: string; // set for channel messages
  recipientId?: string; // set for direct messages
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  isPinned?: boolean;
  reactions: MessageReaction[];
  attachments?: WorkspaceFile[];
  replyCount: number;
  lastReplyAt?: string;
}

export interface ThreadReplyRecord {
  id: string;
  messageId: string; // parent message
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
}

export interface SharedNoteRecord {
  id: string;
  title: string;
  content: string;
  category: 'FINANCE' | 'SALES' | 'COMPLIANCE' | 'ENGINEERING' | 'GENERAL';
  authorName: string;
  authorRole: string;
  updatedAt: string;
  linkedEntityType?: 'CUSTOMER' | 'DEAL' | 'INVOICE' | 'PROJECT';
  linkedEntityId?: string;
  linkedEntityName?: string;
  isPinned?: boolean;
}

export interface HuddleParticipant {
  userId: string;
  fullName: string;
  role: string;
  avatar: string;
  isSpeaking: boolean;
  isMuted: boolean;
  isVideoOn: boolean;
  isSharingScreen: boolean;
}

export interface HuddleSessionRecord {
  id: string;
  channelId: string;
  channelName: string;
  isActive: boolean;
  startedAt: string;
  participants: HuddleParticipant[];
  meetingNotes: string;
}

// ============================================================================
// CRM & SALES PIPELINE TYPES (Phase 3)
// ============================================================================

export type DealStage =
  | 'NEW_LEAD'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'CLOSED_WON'
  | 'CLOSED_LOST';

export interface CustomerContact {
  id: string;
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  isPrimary?: boolean;
}

export interface DealRecord {
  id: string;
  customerId: string;
  customerName: string;
  customerPin?: string;
  assignedToId: string;
  assignedToName: string;
  assignedToAvatar: string;
  title: string;
  value: number; // in KES
  currency: 'KES' | 'USD';
  stage: DealStage;
  winProbability: number; // 0 - 100
  expectedCloseDate: string; // YYYY-MM-DD
  lostReason?: string;
  lostNotes?: string;
  wonQuotationNumber?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface TaskRecord {
  id: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate: string;
  assignedToId: string;
  assignedToName: string;
  customerId?: string;
  customerName?: string;
  dealId?: string;
  dealTitle?: string;
  completedAt?: string;
  createdAt: string;
}

export interface SalesRepRecord {
  id: string;
  userId: string;
  name: string;
  role: string;
  avatar: string;
  email: string;
  monthlyQuotaKes: number;
  achievedRevenueKes: number;
  activeDealsCount: number;
  activeCustomersCount: number;
  winRatePercentage: number;
}

export interface ActivityLogRecord {
  id: string;
  entityType: 'CUSTOMER' | 'DEAL' | 'TASK';
  entityId: string;
  entityName?: string;
  title: string;
  description: string;
  user: string;
  timestamp: string;
  type: 'CALL' | 'EMAIL' | 'MEETING' | 'STAGE_CHANGE' | 'NOTE';
}

