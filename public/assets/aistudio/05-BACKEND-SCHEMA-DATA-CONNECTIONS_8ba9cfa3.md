# BACKEND SCHEMA & DATA CONNECTIONS SPECIFICATION
# Innowit One Workspace (Business Operating System)
**Document Version:** 1.0.0  
**Database Engine:** PostgreSQL 16+  
**ORM Definition:** Prisma ORM Schema & DDL Specifications  
**Integrity Guarantees:** Double-Entry Atomic Ledgers, Foreign Key Cascading Guards & Kenya eTIMS Audit Trail

---

## 1. Relational Entity Architecture Overview

The diagram below illustrates how domain records connect across module boundaries. Notice that all commercial transactions converge into the **Accounting General Ledger** and the **eTIMS Tax Compliance** engine.

```
       +-------------------+       +---------------------+
       |   Organizations   | <----+|   Users & Roles     |
       +---------+---------+       +----------+----------+
                 |                            |
       +---------v---------+       +----------v----------+
       |     Branches      |       |  Employees & Depts  |
       +----+---------+----+       +----------+----------+
            |         |                       |
            |         |                       v
            |         |            +---------------------+
            |         |            | Payroll Runs & Pays |
            |         |            +----------+----------+
            |         |                       | (Dr Wages, Cr Tax)
            |         v                       v
            |   +-----------+       +---------------------+
            |   | Customers |       |    General Ledger   |
            |   +-----+-----+       |   (Double-Entry)    |
            |         |             +----------^----------+
            |         v                        |
            |   +-----------+       +----------+----------+
            |   |   Deals   |       |  Chart of Accounts  |
            |   +-----+-----+       +---------------------+
            |         |                        ^
            |         v                        |
            |   +-----------+                  | (Dr AR, Cr Sales, Cr VAT)
            |   | Quotation |                  |
            |   +-----+-----+                  |
            |         v                        |
            |   +-------------+                |
            |   | Sales Order +----------------+
            |   +-----+-------+                |
            |         | (Stock Reservation)    |
            |         v                        |
            |   +---------------+              |
            +-->| Sales Invoice +--------------+
                +-----+---------+              |
                      |                        |
                      +------------+           |
                      |            |           |
                      v            v           |
        +---------------+  +----------------+  |
        | eTIMS Queue   |  | Customer Paymt +--+
        | & Validation  |  +----------------+
        +-------+-------+
                |
                v
        +---------------+
        | KRA eTIMS Ack |
        | & Control No. |
        +---------------+
```

---

## 2. Complete Prisma Schema (`schema.prisma`)

This schema represents the production-grade data model. It includes all required enums, models, relational foreign keys, indexes, and constraints.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ============================================================================
// 1. GLOBAL ENUMS
// ============================================================================

enum UserRole {
  SUPER_ADMIN
  ADMIN
  EXECUTIVE
  FINANCE_MANAGER
  ACCOUNTANT
  SALES_MANAGER
  SALES_REP
  PROCUREMENT_OFFICER
  INVENTORY_MANAGER
  HR_MANAGER
  PROJECT_MANAGER
  EMPLOYEE
}

enum AccountType {
  ASSET
  LIABILITY
  EQUITY
  REVENUE
  EXPENSE
}

enum CurrencyCode {
  KES
  USD
  EUR
  GBP
}

enum DealStage {
  NEW_LEAD
  CONTACTED
  QUALIFIED
  PROPOSAL
  NEGOTIATION
  CLOSED_WON
  CLOSED_LOST
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum OrderStatus {
  DRAFT
  CONFIRMED
  PROCESSING
  DISPATCHED
  COMPLETED
  CANCELLED
}

enum InvoiceStatus {
  DRAFT
  VALIDATED
  POSTED
  PAID
  PARTIALLY_PAID
  OVERDUE
  CANCELLED
}

enum StockMovementType {
  RECEIPT
  ISSUE
  TRANSFER
  ADJUSTMENT
  RETURN
}

enum EtimsMode {
  OSCU // Online Sales Control Unit
  VSCU // Virtual Sales Control Unit
}

enum EtimsEnvironment {
  SANDBOX
  PRODUCTION
}

enum EtimsSubmissionStatus {
  PENDING
  IN_FLIGHT
  ACCEPTED
  REJECTED
  RETRY_SCHEDULED
  CANCELLED
}

enum TaxClassification {
  STANDARD_16 // 16% VAT Kenya
  ZERO_RATED   // 0%
  EXEMPT
  WITHHOLDING
}

// ============================================================================
// 2. AUTHENTICATION & MULTI-BRANCH ORGANIZATIONS
// ============================================================================

model Organization {
  id               String         @id @default(uuid())
  legalName        String
  tradeName        String?
  kraPin           String         @unique
  vatNumber        String?
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt

  branches         Branch[]
  users            User[]
  etimsConfigs     EtimsConfiguration[]
  accounts         Account[]
}

model Branch {
  id               String         @id @default(uuid())
  organizationId   String
  branchCode       String         // e.g. "00" for HQ
  name             String
  address          String?
  phone            String?
  email            String?
  isHq             Boolean        @default(false)
  createdAt        DateTime       @default(now())

  organization     Organization   @relation(fields: [organizationId], references: [id], onDelete: Restrict)
  users            User[]
  warehouses       Warehouse[]
  invoices         SalesInvoice[]
  purchaseOrders   PurchaseOrder[]

  @@unique([organizationId, branchCode])
}

model User {
  id               String         @id @default(uuid())
  organizationId   String
  branchId         String?
  email            String         @unique
  passwordHash     String
  fullName         String
  role             UserRole       @default(EMPLOYEE)
  isActive         Boolean        @default(true)
  avatarUrl        String?
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt

  organization     Organization   @relation(fields: [organizationId], references: [id], onDelete: Restrict)
  branch           Branch?        @relation(fields: [branchId], references: [id], onDelete: SetNull)
  employee         Employee?
  assignedDeals    Deal[]
  assignedTasks    Task[]
  auditLogs        AuditLog[]
  messages         Message[]
  channelMemberships ChannelMember[]
}

// ============================================================================
// 3. COLLABORATION (CHANNELS, MESSAGES, NOTES)
// ============================================================================

model Channel {
  id               String         @id @default(uuid())
  name             String
  description      String?
  isPrivate        Boolean        @default(false)
  createdById      String
  createdAt        DateTime       @default(now())

  members          ChannelMember[]
  messages         Message[]
}

model ChannelMember {
  id               String         @id @default(uuid())
  channelId        String
  userId           String
  joinedAt         DateTime       @default(now())

  channel          Channel        @relation(fields: [channelId], references: [id], onDelete: Cascade)
  user             User           @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([channelId, userId])
}

model Message {
  id               String         @id @default(uuid())
  channelId        String?
  senderId         String
  recipientId      String?        // Populated for Direct Messages
  parentId         String?        // Populated for Thread replies
  content          String
  isPinned         Boolean        @default(false)
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt

  channel          Channel?       @relation(fields: [channelId], references: [id], onDelete: Cascade)
  sender           User           @relation(fields: [senderId], references: [id], onDelete: Restrict)
  parent           Message?       @relation("ThreadReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies          Message[]      @relation("ThreadReplies")
  attachments      FileAttachment[]
}

model FileAttachment {
  id               String         @id @default(uuid())
  messageId        String?
  fileName         String
  fileSize         Int
  mimeType         String
  storagePath      String
  uploadedAt       DateTime       @default(now())

  message          Message?       @relation(fields: [messageId], references: [id], onDelete: SetNull)
}

// ============================================================================
// 4. CRM (CUSTOMERS, DEALS, TASKS)
// ============================================================================

model Customer {
  id               String         @id @default(uuid())
  organizationId   String
  customerCode     String         @unique
  name             String
  companyName      String?
  kraPin           String?
  email            String?
  phone            String?
  billingAddress   String?
  creditLimit      Decimal        @default(0.00) @db.Decimal(14, 2)
  paymentTermsDays Int            @default(30)
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt

  deals            Deal[]
  salesOrders      SalesOrder[]
  invoices         SalesInvoice[]
  contacts         CustomerContact[]
  tasks            Task[]

  @@index([kraPin])
  @@index([customerCode])
}

model CustomerContact {
  id               String         @id @default(uuid())
  customerId       String
  firstName        String
  lastName         String
  email            String?
  phone            String?
  jobTitle         String?

  customer         Customer       @relation(fields: [customerId], references: [id], onDelete: Cascade)
}

model Deal {
  id               String         @id @default(uuid())
  customerId       String
  assignedToId     String
  title            String
  value            Decimal        @db.Decimal(14, 2)
  currency         CurrencyCode   @default(KES)
  stage            DealStage      @default(NEW_LEAD)
  winProbability   Int            @default(20) // Percentage 0 - 100
  expectedCloseDate DateTime?
  lostReason       String?
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt

  customer         Customer       @relation(fields: [customerId], references: [id], onDelete: Restrict)
  assignedTo       User           @relation(fields: [assignedToId], references: [id], onDelete: Restrict)
  tasks            Task[]
  quotations       Quotation[]
}

model Task {
  id               String         @id @default(uuid())
  title            String
  description      String?
  priority         TaskPriority   @default(MEDIUM)
  status           TaskStatus     @default(PENDING)
  dueDate          DateTime?
  assignedToId     String
  customerId       String?
  dealId           String?
  createdAt        DateTime       @default(now())

  assignedTo       User           @relation(fields: [assignedToId], references: [id], onDelete: Restrict)
  customer         Customer?      @relation(fields: [customerId], references: [id], onDelete: SetNull)
  deal             Deal?          @relation(fields: [dealId], references: [id], onDelete: SetNull)
}

// ============================================================================
// 5. ACCOUNTING CORE & GENERAL LEDGER
// ============================================================================

model Account {
  id               String         @id @default(uuid())
  organizationId   String
  accountNumber    String         // e.g., "1010"
  name             String         // e.g., "Cash on Hand"
  type             AccountType
  currency         CurrencyCode   @default(KES)
  isActive         Boolean        @default(true)
  currentBalance   Decimal        @default(0.00) @db.Decimal(14, 2)

  organization     Organization   @relation(fields: [organizationId], references: [id], onDelete: Restrict)
  journalLines     JournalLine[]

  @@unique([organizationId, accountNumber])
}

model JournalEntry {
  id               String         @id @default(uuid())
  organizationId   String
  entryNumber      String         @unique // e.g. "JE-2026-0001"
  postingDate      DateTime
  sourceModule     String         // e.g. "SALES_INVOICE", "PAYROLL", "MANUAL"
  sourceId         String?        // ID of originating invoice, bill, etc.
  description      String
  isReversed       Boolean        @default(false)
  reversalEntryId  String?        @unique
  createdAt        DateTime       @default(now())

  lines            JournalLine[]

  @@index([postingDate])
  @@index([sourceModule, sourceId])
}

model JournalLine {
  id               String         @id @default(uuid())
  journalEntryId   String
  accountId        String
  description      String?
  debit            Decimal        @default(0.00) @db.Decimal(14, 2)
  credit           Decimal        @default(0.00) @db.Decimal(14, 2)

  journalEntry     JournalEntry   @relation(fields: [journalEntryId], references: [id], onDelete: Restrict)
  account          Account        @relation(fields: [accountId], references: [id], onDelete: Restrict)

  @@index([accountId])
}

// ============================================================================
// 6. INVENTORY & WAREHOUSING
// ============================================================================

model Product {
  id               String         @id @default(uuid())
  organizationId   String
  sku              String         @unique
  barcode          String?
  name             String
  description      String?
  uom              String         @default("PCS") // Unit of measure
  costPrice        Decimal        @db.Decimal(14, 2)
  sellingPrice     Decimal        @db.Decimal(14, 2)
  taxClassification TaxClassification @default(STANDARD_16)
  reorderLevel     Int            @default(10)
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt

  stockLevels      WarehouseStock[]
  movements        StockMovement[]
  invoiceItems     SalesInvoiceItem[]
  orderItems       SalesOrderItem[]
}

model Warehouse {
  id               String         @id @default(uuid())
  branchId         String
  name             String
  code             String         @unique
  location         String?

  branch           Branch         @relation(fields: [branchId], references: [id], onDelete: Restrict)
  stockLevels      WarehouseStock[]
  movements        StockMovement[]
}

model WarehouseStock {
  id               String         @id @default(uuid())
  productId        String
  warehouseId      String
  quantityOnHand   Decimal        @default(0.00) @db.Decimal(12, 2)
  quantityReserved Decimal        @default(0.00) @db.Decimal(12, 2)

  product          Product        @relation(fields: [productId], references: [id], onDelete: Restrict)
  warehouse        Warehouse      @relation(fields: [warehouseId], references: [id], onDelete: Restrict)

  @@unique([productId, warehouseId])
}

model StockMovement {
  id               String         @id @default(uuid())
  productId        String
  warehouseId      String
  movementType     StockMovementType
  quantity         Decimal        @db.Decimal(12, 2)
  unitCost         Decimal        @db.Decimal(14, 2)
  referenceDocument String?       // e.g., "GRN-2026-0012" or "INV-2026-0045"
  notes            String?
  timestamp        DateTime       @default(now())

  product          Product        @relation(fields: [productId], references: [id], onDelete: Restrict)
  warehouse        Warehouse      @relation(fields: [warehouseId], references: [id], onDelete: Restrict)

  @@index([productId, warehouseId])
}

// ============================================================================
// 7. SALES, INVOICING & CREDIT NOTES
// ============================================================================

model Quotation {
  id               String         @id @default(uuid())
  dealId           String?
  quotationNumber  String         @unique
  validUntil       DateTime
  totalAmount      Decimal        @db.Decimal(14, 2)
  createdAt        DateTime       @default(now())

  deal             Deal?          @relation(fields: [dealId], references: [id], onDelete: SetNull)
  salesOrder       SalesOrder?
}

model SalesOrder {
  id               String         @id @default(uuid())
  quotationId      String?        @unique
  customerId       String
  orderNumber      String         @unique
  orderStatus      OrderStatus    @default(DRAFT)
  totalAmount      Decimal        @db.Decimal(14, 2)
  createdAt        DateTime       @default(now())

  quotation        Quotation?     @relation(fields: [quotationId], references: [id], onDelete: SetNull)
  customer         Customer       @relation(fields: [customerId], references: [id], onDelete: Restrict)
  items            SalesOrderItem[]
  invoice          SalesInvoice?
}

model SalesOrderItem {
  id               String         @id @default(uuid())
  salesOrderId     String
  productId        String
  quantity         Decimal        @db.Decimal(12, 2)
  unitPrice        Decimal        @db.Decimal(14, 2)
  taxRate          Decimal        @default(16.00) @db.Decimal(5, 2)
  totalAmount      Decimal        @db.Decimal(14, 2)

  salesOrder       SalesOrder     @relation(fields: [salesOrderId], references: [id], onDelete: Cascade)
  product          Product        @relation(fields: [productId], references: [id], onDelete: Restrict)
}

model SalesInvoice {
  id               String         @id @default(uuid())
  branchId         String
  customerId       String
  salesOrderId     String?        @unique
  invoiceNumber    String         @unique // Local sequence e.g. "INV-2026-0042"
  invoiceDate      DateTime
  dueDate          DateTime
  status           InvoiceStatus  @default(DRAFT)
  isSandbox        Boolean        @default(false)
  subtotal         Decimal        @db.Decimal(14, 2)
  taxAmount        Decimal        @db.Decimal(14, 2)
  totalAmount      Decimal        @db.Decimal(14, 2)
  paidAmount       Decimal        @default(0.00) @db.Decimal(14, 2)
  createdAt        DateTime       @default(now())

  branch           Branch         @relation(fields: [branchId], references: [id], onDelete: Restrict)
  customer         Customer       @relation(fields: [customerId], references: [id], onDelete: Restrict)
  salesOrder       SalesOrder?    @relation(fields: [salesOrderId], references: [id], onDelete: SetNull)
  items            SalesInvoiceItem[]
  payments         CustomerPayment[]
  creditNotes      CreditNote[]
  etimsInvoice     EtimsInvoice?
  transmissionJobs EtimsTransmissionQueue[]

  @@index([status])
  @@index([invoiceDate])
}

model SalesInvoiceItem {
  id               String         @id @default(uuid())
  salesInvoiceId   String
  productId        String
  description      String
  quantity         Decimal        @db.Decimal(12, 2)
  unitPrice        Decimal        @db.Decimal(14, 2)
  taxClassification TaxClassification @default(STANDARD_16)
  taxAmount        Decimal        @db.Decimal(14, 2)
  lineTotal        Decimal        @db.Decimal(14, 2)

  salesInvoice     SalesInvoice   @relation(fields: [salesInvoiceId], references: [id], onDelete: Cascade)
  product          Product        @relation(fields: [productId], references: [id], onDelete: Restrict)
}

model CustomerPayment {
  id               String         @id @default(uuid())
  salesInvoiceId   String
  paymentNumber    String         @unique
  paymentDate      DateTime
  amount           Decimal        @db.Decimal(14, 2)
  paymentMethod    String         // e.g. "M-PESA", "BANK_TRANSFER", "CASH"
  referenceCode    String         // e.g. M-Pesa receipt code "QG721HD89"
  createdAt        DateTime       @default(now())

  salesInvoice     SalesInvoice   @relation(fields: [salesInvoiceId], references: [id], onDelete: Restrict)
}

model CreditNote {
  id               String         @id @default(uuid())
  salesInvoiceId   String
  creditNoteNumber String         @unique
  reason           String
  totalAmount      Decimal        @db.Decimal(14, 2)
  taxAmount        Decimal        @db.Decimal(14, 2)
  issuedAt         DateTime       @default(now())

  salesInvoice     SalesInvoice   @relation(fields: [salesInvoiceId], references: [id], onDelete: Restrict)
}

// ============================================================================
// 8. KENYA eTIMS TAX COMPLIANCE MODELS
// ============================================================================

model EtimsConfiguration {
  id               String         @id @default(uuid())
  organizationId   String
  mode             EtimsMode      @default(OSCU)
  environment      EtimsEnvironment @default(SANDBOX)
  taxpayerPin      String
  branchCode       String         @default("00")
  deviceSerial     String?
  clientSecretEnc  String         // AES-256 encrypted
  apiUrl           String
  isCertified      Boolean        @default(false)
  isProductionActive Boolean      @default(false)
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt

  organization     Organization   @relation(fields: [organizationId], references: [id], onDelete: Restrict)

  @@unique([organizationId, environment])
}

model EtimsInvoice {
  id               String         @id @default(uuid())
  salesInvoiceId   String         @unique
  kraControlNumber String         @unique // KRA issued Control Number
  internalData     String         // Cryptographic signature hash
  qrCodeUrl        String
  submissionDate   DateTime       @default(now())
  ackCode          String         // e.g. "00" for success

  salesInvoice     SalesInvoice   @relation(fields: [salesInvoiceId], references: [id], onDelete: Restrict)
}

model EtimsTransmissionQueue {
  id               String         @id @default(uuid())
  salesInvoiceId   String
  idempotencyKey   String         @unique
  status           EtimsSubmissionStatus @default(PENDING)
  payloadJson      String         @db.Text
  responseJson     String?        @db.Text
  attemptCount     Int            @default(0)
  lastError        String?
  nextRetryAt      DateTime?
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt

  salesInvoice     SalesInvoice   @relation(fields: [salesInvoiceId], references: [id], onDelete: Cascade)

  @@index([status, nextRetryAt])
}

// ============================================================================
// 9. PROCUREMENT & SUPPLIERS
// ============================================================================

model Supplier {
  id               String         @id @default(uuid())
  name             String
  kraPin           String?
  email            String?
  phone            String?
  paymentTermsDays Int            @default(30)
  createdAt        DateTime       @default(now())

  purchaseOrders   PurchaseOrder[]
}

model PurchaseOrder {
  id               String         @id @default(uuid())
  branchId         String
  supplierId       String
  poNumber         String         @unique
  orderDate        DateTime
  totalAmount      Decimal        @db.Decimal(14, 2)
  isApproved       Boolean        @default(false)
  createdAt        DateTime       @default(now())

  branch           Branch         @relation(fields: [branchId], references: [id], onDelete: Restrict)
  supplier         Supplier       @relation(fields: [supplierId], references: [id], onDelete: Restrict)
}

// ============================================================================
// 10. HR & PAYROLL
// ============================================================================

model Department {
  id               String         @id @default(uuid())
  name             String         @unique
  employees        Employee[]
}

model Employee {
  id               String         @id @default(uuid())
  userId           String         @unique
  departmentId     String
  employeeCode     String         @unique
  nationalId       String?
  kraPin           String?
  nssfNumber       String?
  nhifNumber       String?
  basicSalary      Decimal        @db.Decimal(14, 2)
  hireDate         DateTime
  isActive         Boolean        @default(true)

  user             User           @relation(fields: [userId], references: [id], onDelete: Restrict)
  department       Department     @relation(fields: [departmentId], references: [id], onDelete: Restrict)
  payslips         Payslip[]
}

model PayrollRun {
  id               String         @id @default(uuid())
  month            Int
  year             Int
  totalGross       Decimal        @db.Decimal(14, 2)
  totalTax         Decimal        @db.Decimal(14, 2)
  totalNet         Decimal        @db.Decimal(14, 2)
  isApproved       Boolean        @default(false)
  postedToGl       Boolean        @default(false)
  createdAt        DateTime       @default(now())

  payslips         Payslip[]

  @@unique([month, year])
}

model Payslip {
  id               String         @id @default(uuid())
  payrollRunId     String
  employeeId       String
  basicSalary      Decimal        @db.Decimal(14, 2)
  allowances       Decimal        @default(0.00) @db.Decimal(14, 2)
  grossPay         Decimal        @db.Decimal(14, 2)
  payeTax          Decimal        @db.Decimal(14, 2)
  nssfDeduction    Decimal        @db.Decimal(14, 2)
  nhifDeduction    Decimal        @db.Decimal(14, 2)
  housingLevy      Decimal        @db.Decimal(14, 2)
  netPay           Decimal        @db.Decimal(14, 2)

  payrollRun       PayrollRun     @relation(fields: [payrollRunId], references: [id], onDelete: Cascade)
  employee         Employee       @relation(fields: [employeeId], references: [id], onDelete: Restrict)
}

// ============================================================================
// 11. AUDIT & SYSTEM UTILITIES
// ============================================================================

model AuditLog {
  id               String         @id @default(uuid())
  userId           String?
  action           String         // "CREATE", "UPDATE", "DELETE", "POST", "APPROVE"
  entityType       String         // "SalesInvoice", "JournalEntry", etc.
  entityId         String
  changesJson      String?        @db.Text
  ipAddress        String?
  timestamp        DateTime       @default(now())

  user             User?          @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([entityType, entityId])
  @@index([timestamp])
}
```

---

## 3. Data Flow Rules & Critical Triggers

### 3.1 Commercial Order-to-Cash Lifecycle
1. **Quotation -> Sales Order:** Customer accepts Quotation; Sales Order is created with status `CONFIRMED`. System creates a `quantityReserved` hold in `WarehouseStock` to prevent overselling.
2. **Sales Order -> Sales Invoice:** Delivery dispatch triggers invoice generation.
3. **Invoice Validation & Posting (Atomic Transaction):**
   - Updates `SalesInvoice.status` from `DRAFT` to `POSTED`.
   - Decrements `WarehouseStock.quantityOnHand` and `WarehouseStock.quantityReserved`.
   - Appends record to `StockMovement` with type `ISSUE`.
   - Creates a balancing `JournalEntry` with lines:
     * Dr Accounts Receivable (Customer balance increase)
     * Cr Sales Revenue (Product selling price subtotal)
     * Cr VAT Output Liability (16% KRA tax amount)
   - Inserts row into `EtimsTransmissionQueue` with status `PENDING` and UUIDv4 `idempotencyKey`.

### 3.2 eTIMS Queue & KRA Acknowledgment Flow
1. Background worker picks `PENDING` queue items with `nextRetryAt <= NOW()`.
2. Worker sets status to `IN_FLIGHT`.
3. Serializes invoice data into official KRA eTIMS JSON payload structure.
4. Posts to configured KRA endpoint (Sandbox or Production).
5. On HTTP 200 with ACK Code `00`:
   - Inserts `EtimsInvoice` containing `kraControlNumber`, `internalData` signature, and `qrCodeUrl`.
   - Updates queue item status to `ACCEPTED`.
   - Emits WebSocket event to client UI: Updates invoice badge to `[KRA ACCEPTED]`.
6. On HTTP Error or rejection code:
   - Increments `attemptCount`.
   - Records `lastError` in queue item.
   - Calculates exponential backoff: `nextRetryAt = NOW() + (attemptCount^3 * 30 seconds)`.
   - If attempts exceed 5, sets status to `RETRY_SCHEDULED` and alerts the Finance Manager.

### 3.3 Credit Note Reversal Flow
1. Credit note initiated referencing `SalesInvoice.id`.
2. Verifies that `SalesInvoice` possesses an approved `EtimsInvoice` record.
3. Validates that return quantities do not exceed original invoice quantities.
4. Generates reversing accounting entry:
   * Dr Sales Revenue (or Sales Returns Account)
   * Dr VAT Output Liability (Reversing tax)
   * Cr Accounts Receivable (Customer credit)
5. Posts reversing `StockMovement` with type `RETURN` (restoring inventory on-hand).
6. Dispatches credit note payload to KRA referencing original `kraControlNumber` through the exact same eTIMS adapter mode.
