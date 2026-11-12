# TECHNICAL REQUIREMENTS DOCUMENT (TRD)
# Innowit One Workspace (Business Operating System)
**Document Version:** 1.0.0  
**Stack Baseline:** Next.js (App Router) / React 19 / TypeScript / Tailwind CSS / PostgreSQL / Prisma ORM / Docker  
**Compliance Mandate:** Dual-Environment KRA eTIMS System-to-System Engine & Double-Entry Accounting Core

---

## 1. System Architecture & Topology

Innowit One Workspace is architected as a **Modular Monolith**. It unifies domain logic into bounded modules sharing a common platform kernel (authentication, permission verification, event dispatch, audit logging, and transactional persistence) while keeping internal module tables and domain models decoupled.

```
+-----------------------------------------------------------------------------------+
|                           PRESENTATION LAYER (Next.js / React 19)                 |
|  Tailwind CSS v4 | Shadcn UI | Radix Primitives | Recharts | Lucide | TanStack    |
+-----------------------------------------------------------------------------------+
                                      |
                         REST / Server Actions / SSE
                                      |
+-----------------------------------------------------------------------------------+
|                            DOMAIN & APPLICATION CORE                              |
|  +--------------------+  +--------------------+  +--------------------+           |
|  |   Collaboration    |  |       CRM          |  |  Sales & Invoicing |           |
|  +--------------------+  +--------------------+  +--------------------+           |
|  +--------------------+  +--------------------+  +--------------------+           |
|  |     Inventory      |  |   Procurement      |  |   General Ledger   |           |
|  +--------------------+  +--------------------+  +--------------------+           |
|  +--------------------+  +--------------------+  +--------------------+           |
|  |    HR & Payroll    |  |  Fixed Assets      |  | Tax & eTIMS Engine |           |
|  +--------------------+  +--------------------+  +--------------------+           |
+-----------------------------------------------------------------------------------+
                                      |
+-----------------------------------------------------------------------------------+
|                              SHARED INFRASTRUCTURE                                |
|  Event Bus | RBAC Guard | Transaction Manager | Outbox Queue | Audit Logger       |
+-----------------------------------------------------------------------------------+
                                      |
+-----------------------------------------------------------------------------------+
|                           DATA PERSISTENCE & SERVICES                             |
|  PostgreSQL 16+ (Prisma ORM) | Local File Storage / S3 | Redis Queue (Optional)   |
+-----------------------------------------------------------------------------------+
```

---

## 2. Frontend & User Interface Architecture

### 2.1 Framework & Core Dependencies
- **Runtime:** Node.js 20+ LTS or Bun runtime.
- **Framework:** Next.js 15+ / React 19 using the App Router (`app/` directory).
- **Language:** TypeScript 5.5+ (strict mode enabled, `noImplicitAny: true`, `exactOptionalPropertyTypes: true`).
- **Styling Engine:** Tailwind CSS v4 configured with custom Innowit design tokens (CSS variables for themes).
- **Component Primitives:** Radix UI primitives wrapped in Shadcn/UI conventions for accessible dialogues, dropdowns, popovers, tabs, and tooltips.
- **Icons:** `lucide-react`.
- **State Management:**
  - Server State: TanStack Query (React Query) v5 for data fetching, caching, invalidation, and optimistic mutations.
  - UI State: Zustand for lightweight global state (sidebar collapse state, command palette toggle, active audio modal).
  - Form State: React Hook Form paired with Zod resolvers for client and server schema parity.
- **Data Tables:** TanStack Table v8 for virtualized rendering, multi-column sorting, facet filtering, and pagination.
- **Charts & Visualizations:** Recharts for analytics cards, pipeline funnels, cash flow charts, and inventory distribution graphs.

### 2.2 Client-Side Performance Targets
- **Core Web Vitals:** First Contentful Paint (FCP) < 0.8s, Largest Contentful Paint (LCP) < 1.5s, Cumulative Layout Shift (CLS) < 0.05.
- **Optimistic Updates:** Immediate UI updates on chat messages, task checkbox toggles, and pipeline stage drag-and-drop, with rollback on server failure.
- **Keyboard Navigation:** Native accesskeys and focus traps for modal dialogs and the Ctrl+K / Cmd+K command bar.

---

## 3. Backend & Business Logic Layer

### 3.1 Modular Monolith Layout
Each module resides in a dedicated directory within `src/modules/` containing its domain logic, service layer, validation schemas, and route endpoints:

```
src/
├── app/                  # Next.js App Router (Layouts, Pages, API routes)
├── components/           # Shared UI component library (Button, Modal, Table, etc.)
├── lib/                  # Shared utilities (prisma client, logger, crypto, formatters)
└── modules/
    ├── auth/             # Session verification, password hashing, token issuance
    ├── collaboration/    # Channels, messages, threads, notes, huddle signaling
    ├── crm/              # Customers, contacts, deals, tasks, sales activities
    ├── accounting/       # Chart of accounts, journal entries, AR, AP, reconciliation
    ├── inventory/        # Products, warehouses, stock movements, valuations
    ├── procurement/      # Suppliers, purchase orders, goods receipts, vendor bills
    ├── sales/            # Quotations, sales orders, delivery notes, invoices
    ├── etims/            # KRA OSCU/VSCU adapter, queue processor, payload builders
    ├── hr/               # Employees, departments, attendance, payroll calculations
    ├── assets/           # Asset register, depreciation engine, maintenance logs
    └── bi/               # Cross-module reporting, metrics calculations
```

### 3.2 Inter-Module Communication
- Modules must not execute direct cross-domain SQL joins or foreign table updates.
- Operations that cross domain boundaries (e.g., Sales Order creating an Inventory Reservation, or Confirmed Invoice posting to Accounting) invoke typed **Domain Services** wrapped in database transactions.
- Asynchronous notifications and non-blocking side-effects emit typed events via an in-process **Domain Event Bus** (or persistent transactional outbox).

### 3.3 Transaction Integrity & Idempotency
- **Idempotency Keys:** Every mutating financial or compliance endpoint requires an `Idempotency-Key` header (UUIDv4). Keys are stored in an `idempotency_keys` table with an expiration window of 24 hours. Duplicate requests return the original response without re-executing business logic.
- **Double-Entry Balance Enforcement:** The accounting service checks that `SUM(debits) - SUM(credits) == 0` on every journal entry before committing to the database. An unbalanced entry throws an `UnbalancedJournalError` and triggers an immediate transaction rollback.

---

## 4. Database Architecture & Persistence

### 4.1 Engine & Isolation Standards
- **Database Engine:** PostgreSQL 16+ running locally or containerized in Docker.
- **ORM / Schema Tool:** Prisma ORM with strict typing, migrations (`prisma migrate dev`), and database seeding scripts (`prisma/seed.ts`).
- **Connection Management:** Connection pooling via PgBouncer or Prisma Client built-in pool with a maximum connection ceiling scaled to local RAM limits.
- **Transaction Isolation Levels:**
  - Standard CRUD: `READ COMMITTED`.
  - Financial Postings & Inventory Movements: `SERIALIZABLE` or `REPEATABLE READ` to prevent phantom reads and stock over-commitments.

### 4.2 Data Integrity Rules
- Strict foreign key constraints with `ON DELETE RESTRICT` on all ledger, inventory, customer, and compliance tables to prevent accidental cascading deletion of financial history.
- Soft-delete semantics (`deleted_at TIMESTAMP WITH TIME ZONE NULL`) used for master records (Customers, Suppliers, Products, Employees), while posted transactions (Journal Entries, Invoices, Stock Movements) are strictly immutable.
- Check constraints on financial amounts (`amount >= 0`, `debit >= 0`, `credit >= 0`).

---

## 5. Authentication, Authorization & Security

### 5.1 Authentication Engine
- **Session Model:** HTTP-only, secure, SameSite=Lax cookie-based sessions backed by signed session tokens (HMAC SHA-256) or server-side Redis/Postgres session records.
- **Password Security:** Passwords hashed using Argon2id or bcrypt (cost factor 12) with mandatory salt.
- **Brute Force Protection:** Rate limiting (e.g., max 5 failed attempts per 15-minute window per IP) tracked in-memory or in Redis.

### 5.2 Role-Based Access Control (RBAC)
The system provisions 12 standardized system roles:
1. `SUPER_ADMIN` (Full system configuration, tenant management, raw audit access).
2. `ADMIN` (Workspace administration, user provisioning, general settings).
3. `EXECUTIVE` (Read-only access across all financial, sales, and BI reports).
4. `FINANCE_MANAGER` (Full GL, Chart of Accounts, period close, payment approvals).
5. `ACCOUNTANT` (Journal draft/posting, AR/AP data entry, bank reconciliation).
6. `SALES_MANAGER` (All CRM records, sales pipelines, quotation approval).
7. `SALES_REP` (Assigned leads, personal deals, customer accounts, quotations).
8. `PROCUREMENT_OFFICER` (Vendor management, purchase requisitions, PO creation).
9. `INVENTORY_MANAGER` (Warehouse management, stock movements, product master).
10. `HR_MANAGER` (Employee directory, leave approvals, attendance, payroll).
11. `PROJECT_MANAGER` (Project task creation, milestone tracking, budget view).
12. `EMPLOYEE` (Personal attendance, leave requests, assigned tasks, team chat).

### 5.3 Permission Enforcement
Authorization is strictly enforced server-side inside Next.js Route Handlers and Server Actions via a higher-order guard:
```typescript
export async function requirePermission(
  userId: string, 
  module: ModuleName, 
  action: ActionType
): Promise<UserSession>
```
Hiding frontend navigation items or buttons is considered UI enhancement only, never a security boundary.

---

## 6. Financial Engine, Payments & Reconciliation

### 6.1 Accounting Core Specification
- **Chart of Accounts:** Hierarchical numbering schema:
  - `1000 - 1999`: Assets (Current Assets, Cash, Bank, Accounts Receivable, Inventory, Fixed Assets).
  - `2000 - 2999`: Liabilities (Accounts Payable, Accrued Expenses, VAT Payable, Payroll Taxes).
  - `3000 - 3999`: Equity (Retained Earnings, Owner Capital).
  - `4000 - 4999`: Revenue (Sales Revenue, Service Income, Discounts Allowed).
  - `5000 - 5999`: Cost of Goods Sold (COGS, Direct Material, Inventory Adjustments).
  - `6000 - 7999`: Operating Expenses (Salaries, Rent, Utilities, Depreciation).
- **Accounting Period Management:** Fiscal years broken into 12 calendar periods. Periods can be locked to prevent retro-active postings.
- **Traceability Matrix:** Every `journal_entries` record carries a `source_module` enum and `source_id` foreign identifier linking back to the originating record (`sales_invoices`, `supplier_bills`, `payments`, `payroll_runs`, or `stock_adjustments`).

### 6.2 Payment Channels & Integration Points
- **Local Cash & Bank Accounts:** Manual recording with support for transaction reference numbers and bank slip attachments.
- **Mobile Money (Kenya M-Pesa Integration Architecture):**
  - Architecture ready for Daraja 2.0 API (C2B, B2C, Lipa na M-Pesa Online / STK Push).
  - Webhook listener verifying payload signatures, matching M-Pesa receipt numbers against open sales orders or invoices, and triggering automated payment allocation.
- **Bank Statement Reconciliation:** CSV/OFX statement parser matching bank feed lines against ledger cash entries with confidence scoring (Date, Amount, Reference).

---

## 7. Kenya KRA eTIMS Integration Architecture

### 7.1 Architecture & Component Design
The eTIMS module is implemented as an isolated adapter conforming to the `IEtimsAdapter` interface:

```typescript
export interface IEtimsAdapter {
  initialize(config: EtimsConfiguration): Promise<boolean>;
  validateTaxpayer(pin: string): Promise<TaxpayerValidationResult>;
  submitInvoice(invoicePayload: EtimsInvoicePayload): Promise<EtimsSubmissionResponse>;
  submitCreditNote(creditNotePayload: EtimsCreditNotePayload): Promise<EtimsSubmissionResponse>;
  checkStatus(transmissionId: string): Promise<EtimsStatusResponse>;
}
```

### 7.2 OSCU vs. VSCU Modes
1. **OSCU (Online Sales Control Unit):**
   - Direct HTTPS REST communication with KRA eTIMS endpoints.
   - Real-time payload signing using taxpayer credentials / digital certificates.
   - Synchronous or near-real-time response parsing with KRA Control Number, Internal Data (signature hash), and QR Code URL generation.
2. **VSCU (Virtual Sales Control Unit):**
   - Operates through a local fiscal proxy service or background daemon.
   - Queues invoices locally in the `etims_transmission_queue` table during offline intervals.
   - Synchronizes batches upon internet restoration, maintaining original invoice timestamps.

### 7.3 Transactional Outbox & Queue Architecture
- Invoices are never submitted directly within the user's synchronous web request loop.
- Upon invoice posting, an `etims_transmission_queue` record is created inside the same database transaction with status `PENDING`.
- A background worker polls the queue, checks rate limits, executes the HTTP request, and records:
  - HTTP Status Code & Raw Payload (credentials sanitized).
  - KRA Acknowledgment Code & Error Messages.
  - Number of attempts (with exponential backoff: 30s, 2m, 10m, 30m, 2h).
  - If rejected, updates status to `REJECTED` and creates an urgent alert in the Notification Center for the Finance Manager.

### 7.4 Air-Gapped Sandbox vs. Production Separation
- **Database Partitioning:** Test/Sandbox transactions carry `is_sandbox: true` and are stored with distinct sequence numbers (e.g., `SBX-INV-0001` vs `INV-2026-0001`).
- **Configuration Isolation:** Production credentials (KRA Client ID, Client Secret, P12 Certificates) are stored in encrypted environment variables or database vaults that are strictly unreachable when `APP_ENV != 'production'`.
- **UI Safety Banner:** Whenever running in sandbox mode, a persistent visual badge is rendered on all invoice pages:  
  `[SANDBOX MODE - TEST TRANSACTIONS ONLY - NOT VALID FOR OFFICIAL TAX CLAIMS]`
- **Production Activation Gate:** A hardcoded safety check in the submission service prevents any call to production KRA endpoints unless the database deployment state is explicitly set to `PRODUCTION_ACTIVE` by a Super Admin with dual-factor confirmation.

---

## 8. Deployment, Infrastructure & DevOps

### 8.1 Local Deployment Stack
- **Docker & Compose:** Multi-stage `Dockerfile` optimizing build cache and minimizing image size, paired with `docker-compose.yml` defining:
  - `app`: Node.js Next.js standalone container.
  - `postgres`: PostgreSQL 16 image with persistent volume mapping (`./data/postgres`).
  - `redis` (optional/pluggable): Redis 7 image for background queues and session caching.
- **Environment Management:** Clear separation between `.env.development`, `.env.sandbox`, and `.env.production`.
- **Database Migrations:** Automated Prisma migration execution on container startup (`prisma migrate deploy`).

### 8.2 Backup & Disaster Recovery
- Scheduled automated PostgreSQL dump scripts (`pg_dump`) to local compressed archives.
- Point-in-time recovery support through PostgreSQL WAL (Write-Ahead Logging) archiving.
- Deterministic seed scripts for instant development and testing reset (`npm run db:reset`).
