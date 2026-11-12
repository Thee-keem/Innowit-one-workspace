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
  createdBy?: string;
  status: 'DRAFT' | 'POSTED' | 'VOID';
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
  isReversed?: boolean;
  reversalEntryId?: string;
  sourceModule?: string;
  sourceId?: string;
  postedAt?: string;
}

export interface InvoiceLineItem {
  id: string;
  productId: string;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // e.g. 0.16 = 16%
  taxClassification: 'STANDARD_16' | 'ZERO_RATED_0' | 'EXEMPT';
  taxAmount: number;
  lineTotal: number;
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  invoiceNumber?: string;
  customerName?: string;
  paymentNumber: string;
  date: string;
  paymentDate?: string;
  amount: number;
  paymentMethod: 'M-PESA' | 'BANK_TRANSFER' | 'CHEQUE' | 'CASH';
  referenceCode: string;
  referenceNumber?: string;
  recordedBy: string;
  notes?: string;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerPin: string;
  customerAddress?: string;
  issueDate: string;
  dueDate: string;
  paymentTermsDays: number;
  status: 'DRAFT' | 'POSTED' | 'KRA_ACCEPTED' | 'PAID' | 'OVERDUE' | 'VOID' | 'CANCELLED';
  items: InvoiceLineItem[];
  subtotal: number;
  taxableAmount?: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  kraControlNumber?: string;
  kraQrPayload?: string;
  payments: PaymentRecord[];
  createdAt: string;
}

export type EtimsMode = 'OSCU' | 'VSCU';
export type EtimsEnvironment = 'SANDBOX' | 'PRODUCTION';
export type EtimsSubmissionStatus =
  | 'PENDING'
  | 'IN_FLIGHT'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'RETRY_SCHEDULED'
  | 'CANCELLED'
  | 'FAILED';

export interface EtimsRecord {
  id: string;
  invoiceId?: string;
  invoiceNumber: string;
  customerName: string;
  buyerName?: string;
  customerPin: string;
  totalAmountKes: number;
  vatAmountKes: number;
  totalAmount?: number;
  taxableAmount?: number;
  taxAmount?: number;
  environment: EtimsEnvironment;
  status: 'PENDING' | 'TRANSMITTED' | 'ACCEPTED' | 'FAILED';
  mode?: EtimsMode;
  cuNumber: string; // Control Unit Number (e.g. KRAMU1234567890)
  kraReceiptNumber?: string;
  kraControlNumber?: string;
  internalSignature?: string;
  transmissionTimestamp: string;
  verificationUrl?: string;
  qrPayload?: string;
  errorCode?: string;
  retryCount: number;
  payloadJson?: string;
  responseJson?: string;
}

export interface EtimsQueueItem {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  customerPin: string;
  idempotencyKey: string; // UUIDv4
  mode: EtimsMode;
  environment: EtimsEnvironment;
  status: EtimsSubmissionStatus;
  totalAmountKes: number;
  vatAmountKes: number;
  cuNumber: string;
  kraControlNumber?: string;
  internalSignature?: string;
  qrPayload?: string;
  payloadJson: string;
  responseJson?: string;
  attemptCount: number;
  lastError?: string;
  nextRetryAt?: string;
  transmissionTimestamp?: string;
}

export interface EtimsConfigurationRecord {
  id: string;
  legalName: string;
  tradeName: string;
  kraPin: string;
  branchCode: string;
  vatNumber: string;
  mode: EtimsMode;
  environment: EtimsEnvironment;
  deviceSerial: string;
  clientSecretMasked: string;
  apiUrl: string;
  isCertified: boolean;
  isProductionActive: boolean;
  vatOutputAccount: string;
  vatInputAccount: string;
  withholdingAccount: string;
  lastPingLatencyMs?: number;
  lastPingStatus?: 'CONNECTED' | 'ERROR';
}

export interface CreditNoteRecord {
  id: string;
  creditNoteNumber: string; // e.g. "CN-2026-0012"
  originalInvoiceId: string;
  originalInvoiceNumber: string;
  originalKraControlNumber: string;
  customerName: string;
  customerPin: string;
  reasonCode: 'RETURN_GOODS' | 'PRICE_CORRECTION' | 'INVOICE_CANCELLATION' | 'SERVICE_DEFICIENCY';
  reasonNotes: string;
  subtotalKes: number;
  taxAmountKes: number;
  totalAmountKes: number;
  status: 'ACCEPTED' | 'PENDING';
  kraControlNumber: string;
  cuNumber: string;
  issuedAt: string;
  journalEntryId?: string;
  items: {
    productId: string;
    productSku: string;
    productName: string;
    quantity: number;
    unitPriceKes: number;
    taxRate: number;
    lineTotalKes: number;
  }[];
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
  entityType: 'CUSTOMER' | 'DEAL' | 'TASK' | 'ORDER' | 'STOCK' | 'PAYROLL';
  entityId: string;
  entityName?: string;
  title: string;
  description: string;
  user: string;
  timestamp: string;
  type: 'CALL' | 'EMAIL' | 'MEETING' | 'STAGE_CHANGE' | 'NOTE' | 'INVENTORY' | 'PAYROLL';
}

// ============================================================================
// ERP OPERATIONS TYPES (Phase 5)
// ============================================================================

export interface WarehouseRecord {
  id: string;
  branchId: string;
  branchName: string;
  code: string; // e.g. "WH-NBO-01"
  name: string;
  location: string;
  capacityUnits: number;
  managerName: string;
  contactPhone: string;
  isCentral: boolean;
}

export interface WarehouseStockRecord {
  id: string;
  productId: string;
  warehouseId: string;
  warehouseCode: string;
  quantityOnHand: number;
  quantityReserved: number;
  binLocation: string; // e.g. "RACK-A4-BIN02"
}

export type StockMovementType =
  | 'RECEIPT'
  | 'ISSUE'
  | 'TRANSFER'
  | 'ADJUSTMENT'
  | 'RETURN';

export interface StockMovementRecord {
  id: string;
  movementNumber: string; // e.g. "MOV-2026-0042"
  productId: string;
  productSku: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  targetWarehouseId?: string;
  targetWarehouseName?: string;
  movementType: StockMovementType;
  quantity: number; // Positive for increase, negative or absolute with type
  unitCostKes: number;
  totalValueKes: number;
  referenceDocument: string; // e.g. "GRN-2026-0012", "SO-2026-0033", "ADJ-COUNT"
  reason?: string;
  performedBy: string;
  timestamp: string;
  journalEntryId?: string;
}

export interface SupplierRecord {
  id: string;
  supplierCode: string; // e.g. "VEND-001"
  name: string;
  kraPin: string;
  email: string;
  phone: string;
  contactPerson: string;
  address: string;
  category: string;
  paymentTermsDays: number;
  rating: number; // 1 - 5
  totalSpendKes: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  quantity: number;
  receivedQuantity: number;
  unitCostKes: number;
  taxRate: number; // 0.16
  lineTotalKes: number;
}

export interface PurchaseOrderRecord {
  id: string;
  poNumber: string; // e.g. "PO-2026-0084"
  supplierId: string;
  supplierName: string;
  supplierPin: string;
  branchId: string;
  branchName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'RECEIVED' | 'CANCELLED';
  items: PurchaseOrderItem[];
  subtotalKes: number;
  taxAmountKes: number;
  totalAmountKes: number;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface GoodsReceiptNoteItem {
  productId: string;
  productSku: string;
  productName: string;
  quantityReceived: number;
  unitCostKes: number;
  totalCostKes: number;
}

export interface GoodsReceiptNoteRecord {
  id: string;
  grnNumber: string; // e.g. "GRN-2026-0029"
  poId: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  receivedDate: string;
  receivedBy: string;
  items: GoodsReceiptNoteItem[];
  totalValueKes: number;
  billGenerated: boolean;
  billId?: string;
  journalEntryId?: string;
  notes?: string;
}

export interface SupplierBillRecord {
  id: string;
  billNumber: string; // e.g. "BILL-2026-0018"
  supplierId: string;
  supplierName: string;
  supplierPin: string;
  grnId?: string;
  grnNumber?: string;
  poNumber?: string;
  billDate: string;
  dueDate: string;
  amountKes: number;
  taxAmountKes: number;
  totalAmountKes: number;
  status: 'UNPAID' | 'PAID';
  journalEntryId: string;
}

export interface SalesOrderItemRecord {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  quantity: number;
  unitPriceKes: number;
  taxRate: number;
  lineTotalKes: number;
}

export interface SalesOrderRecord {
  id: string;
  orderNumber: string; // e.g. "SO-2026-0051"
  customerId: string;
  customerName: string;
  customerPin?: string;
  quotationId?: string;
  quotationNumber?: string;
  orderDate: string;
  expectedDispatchDate: string;
  status: 'DRAFT' | 'CONFIRMED' | 'PROCESSING' | 'DISPATCHED' | 'COMPLETED' | 'CANCELLED';
  items: SalesOrderItemRecord[];
  totalAmountKes: number;
  taxAmountKes: number;
  invoiceId?: string;
  invoiceNumber?: string;
  stockReserved: boolean;
  deliveryNoteNumber?: string;
  salesRepName: string;
  notes?: string;
}

export interface QuotationRecord {
  id: string;
  quotationNumber: string; // e.g. "QT-2026-0112"
  dealId?: string;
  customerId: string;
  customerName: string;
  issueDate: string;
  validUntil: string;
  items: SalesOrderItemRecord[];
  totalAmountKes: number;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'CONVERTED';
  convertedOrderId?: string;
}

export interface DepartmentRecord {
  id: string;
  name: string;
  code: string;
  headOfDept: string;
  employeeCount: number;
  monthlyBudgetKes: number;
}

export interface EmployeeRecord {
  id: string;
  employeeCode: string; // e.g. "EMP-001"
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName: string;
  jobTitle: string;
  hireDate: string;
  kraPin: string;
  nationalId: string;
  nssfNumber: string;
  nhifNumber: string;
  bankName: string;
  bankAccountNumber: string;
  basicSalaryKes: number;
  housingAllowanceKes: number;
  transportAllowanceKes: number;
  isActive: boolean;
}

export interface PayslipRecord {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  departmentName: string;
  jobTitle: string;
  kraPin: string;
  basicSalaryKes: number;
  allowancesKes: number;
  grossSalaryKes: number;
  payeTaxKes: number;
  nssfDeductionKes: number;
  nhifDeductionKes: number; // SHIF
  housingLevyKes: number;
  totalDeductionsKes: number;
  netSalaryKes: number;
  paymentStatus: 'PENDING' | 'DISBURSED';
}

export interface PayrollRunRecord {
  id: string;
  runNumber: string; // e.g. "PAY-2026-11"
  month: string; // "November"
  year: number; // 2026
  periodLabel: string; // "November 2026"
  employeeCount: number;
  totalGrossKes: number;
  totalPayeKes: number;
  totalNssfKes: number;
  totalNhifKes: number;
  totalHousingLevyKes: number;
  totalDeductionsKes: number;
  totalNetPayKes: number;
  status: 'DRAFT' | 'APPROVED' | 'POSTED_TO_GL';
  approvedBy?: string;
  approvedAt?: string;
  journalEntryId?: string;
  payslips: PayslipRecord[];
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockInTime: string;
  clockOutTime: string;
  hoursWorked: number;
  status: 'PRESENT' | 'LATE' | 'HALF_DAY' | 'ON_LEAVE';
}

export interface LeaveRequestRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'ANNUAL' | 'SICK' | 'MATERNITY' | 'COMPASSIONATE';
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
}

export interface FixedAssetRecord {
  id: string;
  assetTag: string; // e.g. "AST-2026-001"
  name: string;
  category: 'HARDWARE' | 'FURNITURE' | 'VEHICLE' | 'INFRASTRUCTURE';
  location: string;
  custodian: string;
  purchaseDate: string;
  purchaseCostKes: number;
  depreciationRateAnnual: number; // e.g. 0.20 for 20%
  accumulatedDepreciationKes: number;
  netBookValueKes: number;
  status: 'ACTIVE' | 'MAINTENANCE' | 'DISPOSED';
}

export interface ErpProjectRecord {
  id: string;
  projectCode: string; // e.g. "PRJ-KEN-01"
  name: string;
  customerId: string;
  customerName: string;
  leadManager: string;
  startDate: string;
  deadline: string;
  budgetKes: number;
  spentKes: number;
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
}

