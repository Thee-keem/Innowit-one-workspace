# IMPLEMENTATION ROADMAP & EXECUTION GUIDE
# Innowit One Workspace (Business Operating System)
**Document Version:** 1.0.0  
**Target Execution Agent:** Coder Subagent / Autonomous Engineering Agent  
**Methodology:** Strict Phase-Gated Modular Construction with Test-Driven Acceptance

---

## 1. Executive Instructions for Coder Subagents

You are executing as the lead full-stack implementation engineer for **Innowit One Workspace**. You must build a real, fully persistent, interactive business operating system that strictly complies with:
- [01-PRODUCT-REQUIREMENTS-DOCUMENT.md](file:///c:/Users/thee-keem/Projects/innowit-one-workspace-specs/01-PRODUCT-REQUIREMENTS-DOCUMENT.md)
- [02-TECHNICAL-REQUIREMENTS-DOCUMENT.md](file:///c:/Users/thee-keem/Projects/innowit-one-workspace-specs/02-TECHNICAL-REQUIREMENTS-DOCUMENT.md)
- [03-APP-FLOW-DOCUMENT.md](file:///c:/Users/thee-keem/Projects/innowit-one-workspace-specs/03-APP-FLOW-DOCUMENT.md)
- [04-UI-UX-DOCUMENT.md](file:///c:/Users/thee-keem/Projects/innowit-one-workspace-specs/04-UI-UX-DOCUMENT.md)
- [05-BACKEND-SCHEMA-DATA-CONNECTIONS.md](file:///c:/Users/thee-keem/Projects/innowit-one-workspace-specs/05-BACKEND-SCHEMA-DATA-CONNECTIONS.md)

### Strict Operating Directives for Coder Subagents:
1. **Never Stop After Planning:** Complete every phase sequentially. Proceed through the phases without terminating early or waiting for manual prompts between sub-tasks.
2. **No Placeholder Implementations:** Do not generate `// TODO`, mock arrays, or nonfunctional buttons. Every table must query the database, every form must mutate data, and every calculation must be derived from actual records.
3. **Double-Entry Balance Enforcement:** Every financial transaction must create an atomic `JournalEntry` where `SUM(debit) == SUM(credit)`. Unbalanced entries must be blocked at the domain service and database constraint levels.
4. **Air-Gapped eTIMS Separation:** Sandbox integration and production activation are two distinct milestones. Production submission must be blocked by backend safety checks until explicit administrator certification flags are toggled.
5. **Phase-Gate Verification:** Before advancing from Phase N to Phase N+1, you must run automated tests and verify database records to satisfy the phase acceptance gate.

---

## 2. Phase-by-Phase Implementation Roadmap

```
+-------------------------------------------------------------------------------------------------------+
| PHASE 1: Scaffolding, Core Infrastructure & Design System                                            |
|   1.1 Project Scaffold -> 1.2 Prisma & Postgres Setup -> 1.3 Design Tokens -> 1.4 Auth & Shell Gate  |
+-------------------------------------------------------------------------------------------------------+
                                                   |
+-------------------------------------------------------------------------------------------------------+
| PHASE 2: Team Collaboration Engine                                                                    |
|   2.1 Channels & Members -> 2.2 Messaging & Threads -> 2.3 Files & Notes -> 2.4 Huddles Interface    |
+-------------------------------------------------------------------------------------------------------+
                                                   |
+-------------------------------------------------------------------------------------------------------+
| PHASE 3: CRM & Pipeline Management                                                                    |
|   3.1 Customers & Contacts -> 3.2 Sales Reps -> 3.3 6-Stage Deals Kanban -> 3.4 Tasks & CRM Metrics  |
+-------------------------------------------------------------------------------------------------------+
                                                   |
+-------------------------------------------------------------------------------------------------------+
| PHASE 4: Accounting Core & General Ledger                                                             |
|   4.1 Chart of Accounts -> 4.2 Atomic Journal Engine -> 4.3 AR & Invoicing -> 4.4 AP & Banking        |
+-------------------------------------------------------------------------------------------------------+
                                                   |
+-------------------------------------------------------------------------------------------------------+
| PHASE 5: ERP Operations (Inventory, Procurement, Sales, HR, Assets)                                  |
|   5.1 Product Master & Stock Ledger -> 5.2 Purchasing & GRN -> 5.3 Order Dispatch -> 5.4 HR & Payroll |
+-------------------------------------------------------------------------------------------------------+
                                                   |
+-------------------------------------------------------------------------------------------------------+
| PHASE 6: Kenya eTIMS Tax Compliance Engine (OSCU / VSCU)                                              |
|   6.1 Taxpayer Config -> 6.2 Outbox Queue & Retry -> 6.3 Credit Notes -> 6.4 Reconciliation Monitor   |
+-------------------------------------------------------------------------------------------------------+
                                                   |
+-------------------------------------------------------------------------------------------------------+
| PHASE 7: Business Intelligence, Automation & System Services                                         |
|   7.1 Executive BI Dashboards -> 7.2 Event Automation Engine -> 7.3 Omni Command Bar (Ctrl+K)         |
+-------------------------------------------------------------------------------------------------------+
                                                   |
+-------------------------------------------------------------------------------------------------------+
| PHASE 8: Production Hardening, Acceptance Testing & Handover                                          |
|   8.1 Automated Test Suite -> 8.2 Security Review -> 8.3 Seeding & Demo Data -> 8.4 Documentation     |
+-------------------------------------------------------------------------------------------------------+
```

---

## Phase 1: Scaffolding, Core Infrastructure & Design System

### 1.1 Project Initialization & Dependencies
- Scaffold Next.js 15+ App Router application with TypeScript strict mode:
  ```bash
  npx create-next-app@latest innowit-workspace --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
  ```
- Install core production dependencies:
  - Primitives & UI: `@radix-ui/react-*`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`
  - Forms & Validation: `react-hook-form`, `@hookform/resolvers`, `zod`
  - Tables & State: `@tanstack/react-table`, `@tanstack/react-query`, `zustand`
  - Charts: `recharts`
  - Data & Security: `@prisma/client`, `prisma`, `argon2`, `jose` (JWT/Session tokens)
- Configure Docker and `docker-compose.yml` for local PostgreSQL 16 container.

### 1.2 Database Architecture & Prisma Schema
- Copy the complete Prisma schema from [05-BACKEND-SCHEMA-DATA-CONNECTIONS.md](file:///c:/Users/thee-keem/Projects/innowit-one-workspace-specs/05-BACKEND-SCHEMA-DATA-CONNECTIONS.md) into `prisma/schema.prisma`.
- Run initial migration:
  ```bash
  npx prisma migrate dev --name init_innowit_operating_system
  ```
- Verify all 25+ relational models, enums, unique indexes, and foreign key constraints.

### 1.3 Design System & Innowit Theme Tokens
- Configure `src/app/globals.css` with Innowit custom CSS tokens as specified in [04-UI-UX-DOCUMENT.md](file:///c:/Users/thee-keem/Projects/innowit-one-workspace-specs/04-UI-UX-DOCUMENT.md):
  - Primary Teal: `#00B3C8`
  - Accent Orange: `#E8631A`
  - Dark Base: `#1A1A1A`
  - Slate-Purple Sidebar: `#1E1B2E` / `#2D2254`
  - Surface Scale: `#0F1115` to `#161920`
- Implement reusable UI primitives inside `src/components/ui/` (Button, Input, Select, Badge, Card, Modal Dialog, Slide-over Sheet, Dropdown Menu, Data Table).

### 1.4 Authentication, RBAC & Global Application Shell
- Implement session-based authentication in `src/modules/auth/` using secure HTTP-only cookies and Argon2id password hashing.
- Implement server-side permission guard (`requirePermission(userId, module, action)`).
- Build the global persistent application shell:
  - Collapsible left navigation sidebar with module groups.
  - Top control bar with branch selector, environment badge, notification bell, and user avatar.
  - Global `Ctrl+K` command palette modal skeleton.
- **Phase 1 Acceptance Gate:**
  - Login page authenticates seed user and establishes HTTP-only session.
  - Application shell renders without console warnings or layout shifts.
  - Database health-check endpoint returns HTTP 200 with active PostgreSQL connection.

---

## Phase 2: Team Collaboration Engine

### 2.1 Channels & Channel Management
- Create `src/modules/collaboration/` services and API routes.
- Implement Public and Private Channel creation, editing, membership listing, and channel descriptions.
- Channel sidebar with live unread indicators and active channel state.

### 2.2 Messaging, Threads & Real-Time Sync
- Build rich message composer (markdown formatting, emoji reaction selector, file attachment button).
- Implement message list with virtual scrolling, date dividers, and floating hover action toolbar.
- Implement right-side Thread Drawer sliding out upon clicking "Reply in Thread", displaying chronological replies and dedicated reply composer.
- Implement optimistic message rendering with automatic rollback on network failure.

### 2.3 Workspace Files & Notes Environment
- Build File storage service with local disk storage abstraction and metadata indexing.
- Files viewer interface with search, filtering by type (PDF, image, spreadsheet), and download triggers.
- Shared Notes editor with bi-directional tagging to Customers, Deals, and Projects.

### 2.4 Huddles Interface (Demonstration Mode)
- Implement interactive Huddle overlay modal with participant presence chips, simulated mic/camera toggle buttons, and screen-sharing toggle state.
- Clearly label as demonstration interface per architectural requirements.
- **Phase 2 Acceptance Gate:**
  - Able to create channels, send messages, post threaded replies, add emoji reactions, and upload files.
  - All messages survive browser refresh and application restart.

---

## Phase 3: CRM & Sales Pipeline Management

### 3.1 Customer & Contact Management
- Implement Customer Directory data table with multi-column sorting, search, and status filters.
- Add Customer slide-over drawer with Zod schema validation (including KRA PIN format validation `/^[A-Z]\d{9}[A-Z]$/`).
- Customer Detail profile view (`/crm/customers/[id]`) with tabs: Overview, Deals, Invoices, Tasks, and Activity Timeline.

### 3.2 Sales Representative Tracking
- Sales representative management: user assignment, quota tracking, active customer count, and pipeline attribution.

### 3.3 6-Stage Deals Pipeline Kanban
- Build interactive Deals Kanban board across 6 stages:
  1. New Lead
  2. Contacted
  3. Qualified
  4. Proposal
  5. Negotiation
  6. Closed (with mandatory Won/Lost dialog)
- Implement smooth drag-and-drop or column transition buttons updating deal stage and probability.
- Deal win/loss modal logging explicit reason on loss, or optional quotation generation on win.

### 3.4 Tasks & CRM Metrics
- Cross-entity task manager with priority badges (Low, Medium, High, Urgent), due date alerts, and completion toggles.
- Real-time CRM Dashboard calculating live pipeline valuation, weighted forecasts, conversion win-rates, and monthly won revenue.
- **Phase 3 Acceptance Gate:**
  - Moving deals between Kanban stages updates database and recalculates pipeline metrics immediately.
  - Customer profiles accurately display aggregated deal values and associated tasks.

---

## Phase 4: Accounting Core & General Ledger (The Heart of ERP)

### 4.1 Chart of Accounts (COA)
- Implement hierarchical Chart of Accounts tree structure:
  - 1000 - Assets, 2000 - Liabilities, 3000 - Equity, 4000 - Revenue, 5000 - Cost of Sales, 6000 - Operating Expenses.
- Account creation and editing modal with account type classification and currency assignment.

### 4.2 Atomic Double-Entry General Ledger
- Implement Journal Entry posting service:
  ```typescript
  async function postJournalEntry(tx: PrismaTransaction, entry: JournalEntryInput): Promise<JournalEntry>
  ```
- **Balance Rule:** Enforce `SUM(debits) - SUM(credits) == 0`. Throw `UnbalancedJournalError` if not balanced.
- Make posted journal entries strictly immutable. Provide explicit "Create Reversing Entry" workflow for corrections.
- Manual Journal Entry creation UI (`/accounting/journal-entries/new`) with live debit/credit difference calculation and dynamic line item addition.

### 4.3 Accounts Receivable (AR) & Customer Invoices
- Build Invoice creation interface: Customer selection, product line item picker, quantity, tax rate (16% VAT), and subtotal calculation.
- "Validate & Post to Ledger" button executing an atomic database transaction:
  - Sets invoice status to `POSTED`.
  - Generates balancing General Ledger entry (Dr AR, Cr Sales Revenue, Cr VAT Output).
  - Enqueues record into `EtimsTransmissionQueue`.
- Payment recording modal: Supports partial payments, updates invoice balance, and posts balancing cash entry (Dr Cash/Bank, Cr AR).
- Accounts Receivable aging schedule (0-30, 31-60, 61-90, 90+ days).

### 4.4 Accounts Payable (AP) & Banking Reconciliation
- Supplier bill entry and 3-way matching view (PO vs Goods Receipt vs Bill).
- Cash and Bank ledger view with inter-account transfer modal.
- Bank statement CSV reconciliation view with rule-based transaction matching.
- Real-time Financial Reports derived strictly from posted ledger lines:
  - Profit and Loss Statement (P&L)
  - Balance Sheet
  - Trial Balance
- **Phase 4 Acceptance Gate:**
  - Automated test verifies that an unbalanced journal entry throws an error and rolls back the database.
  - Generating an invoice correctly updates AR aging and financial reports simultaneously.

---

## Phase 5: ERP Operations (Inventory, Procurement, Sales, HR, Assets)

### 5.1 Inventory & Multi-Warehouse Management
- Product Master directory with SKU, barcode, category, UOM, cost price, and selling price.
- Multi-warehouse stock tracking with location bins.
- Stock Movement Ledger: Every inventory change creates an immutable `StockMovement` entry (`RECEIPT`, `ISSUE`, `TRANSFER`, `ADJUSTMENT`).
- Stock reservation logic: Confirmed Sales Orders increment `quantityReserved` to prevent overselling. Prevent negative stock unless authorized.

### 5.2 Procurement & Supplier Workflow
- Supplier Directory with KRA PINs and payment terms.
- 8-step procurement workflow:
  1. Purchase Requisition
  2. Approval
  3. RFQ
  4. Supplier Selection
  5. Purchase Order (PO)
  6. Goods Receipt Note (GRN) with warehouse stock update
  7. Supplier Bill
  8. Payment Settlement

### 5.3 Sales Order Fulfillment
- Commercial workflow: Quotation -> Confirmed Sales Order -> Delivery Note -> Tax Invoice.
- 1-click document conversion carrying line items and tax classifications forward without manual re-typing.

### 5.4 Human Resources & Statutory Payroll
- Employee Directory with departmental hierarchy, salary structure, and emergency contacts.
- Attendance clocking interface and leave request/approval workflows.
- Payroll calculation engine: Basic pay, allowances, overtime, gross salary, and statutory Kenyan deductions (PAYE, NSSF, NHIF/SHIF, Housing Levy).
- Payroll approval workflow generating balanced GL entry (Dr Wages Expense, Cr Tax Liabilities, Cr Net Pay Payable) and PDF payslips.

### 5.5 Fixed Asset & Project Management
- Fixed Asset register with straight-line depreciation engine and maintenance logs.
- Project Task Board (Kanban & Gantt) with budget tracking and billable hour logging.
- **Phase 5 Acceptance Gate:**
  - Goods Receipt Note increases product stock balance and logs movement history.
  - Sales Order confirmation reserves stock and blocks duplicate stock allocation.

---

## Phase 6: Kenya eTIMS Tax Compliance Engine (OSCU / VSCU)

### 6.1 Taxpayer Setup & Mode Configuration
- Build eTIMS Configuration page (`/etims/configuration`):
  - Taxpayer Legal Name, KRA PIN, Branch Code, Device Serial / Key.
  - Mode Selection: OSCU (Direct REST API) vs VSCU (Fiscal Proxy / Outbox Queue).
  - Environment Toggle: Sandbox (Test) vs Production (Live).
  - Encrypted credential storage.
  - "Test Connection" button validating KRA sandbox API connectivity.

### 6.2 Transactional Outbox & Submission Queue
- Implement background queue processor:
  - Reads `PENDING` items from `EtimsTransmissionQueue`.
  - Serializes invoice data into official KRA eTIMS JSON payload structure.
  - Transmits payload with unique `idempotencyKey` (UUIDv4) to prevent duplicate KRA submissions.
  - On Success: Stores KRA Control Number, Internal Signature Hash, and QR Code URL; updates local status to `ACCEPTED`.
  - On Failure: Implements exponential backoff retry (30s, 2m, 10m, 30m, 2h); flags non-recoverable validation errors as `REJECTED`.

### 6.3 Credit Note & Correction Lifecycle
- Build Credit Note creation workflow referencing original eTIMS invoice:
  - Validates that original invoice has an accepted KRA Control Number.
  - Enforces mandatory reason code and restricts return quantities to original invoiced amounts.
  - Transmits credit note payload through the exact same eTIMS adapter mode.
  - Posts reversing accounting entries and restores physical inventory where applicable.

### 6.4 Monitoring, Audit & 3-Way Reconciliation
- Build eTIMS Monitoring Dashboard (`/etims/queue`):
  - Live filter pills: Pending, In Flight, Accepted, Rejected, Retry Scheduled.
  - Modal viewing raw sanitized JSON request payload and KRA response.
- Build 3-Way Reconciliation screen (`/etims/reconciliation`):
  - Compares Local ERP Invoices vs. eTIMS Queue Submissions vs. KRA Acknowledged Receipts.
  - Highlights missing signatures or mismatched tax values.
- **Phase 6 Acceptance Gate (Milestone A - Sandbox Verification):**
  - Invoice submitted in sandbox receives valid mock/test KRA Control Number and QR Code.
  - Offline simulation queues transactions locally and synchronizes upon reconnect without duplicating entries.
  - UI displays prominent badge: `[SANDBOX VERIFIED - PRODUCTION NOT YET AUTHORIZED]`.

---

## Phase 7: Business Intelligence, Automation & System Services

### 7.1 Executive BI & Operational Analytics
- Executive dashboard with dynamic date filters (Today, This Month, This Quarter, Custom):
  - Cash Runway, Working Capital, Gross & Net Margins, Inventory Valuation.
  - Top-selling products, sales rep leaderboards, customer acquisition trends.
- PDF and CSV export utilities for all data grids and financial reports.

### 7.2 Event-Driven Workflow Automation
- Implement trigger-condition-action engine in `src/modules/automation/`:
  - Triggers: Stock Below Reorder Level, Invoice Overdue 15 Days, Deal Moved to Negotiation, PO Awaiting Approval.
  - Actions: In-app notification, email alert, draft purchase requisition creation.
- Automation execution history and toggleable active rules.

### 7.3 Universal Command Bar (Ctrl+K)
- Implement global search index scanning across Customers, Invoices, Products, Employees, Deals, Messages, and Navigation Routes.
- Sub-20ms search response with keyboard navigation (Up/Down/Enter).

### 7.4 Comprehensive Audit Logging
- Implement audit log middleware capturing User ID, IP, Action Type (Create, Update, Delete, Post, Approve), Entity, and before/after JSON diffs.
- **Phase 7 Acceptance Gate:**
  - `Ctrl+K` searches across all modules and jumps directly to records.
  - Modifying a customer or posting a journal writes an immutable record to `AuditLog`.

---

## Phase 8: Hardening, Acceptance Testing & Production Handover

### 8.1 Automated Test Suite
- Write and execute automated integration tests covering the 5 Mandatory Acceptance Gates:
  - **Gate 1 (Accounting):** Every posted transaction balances; reversing entries retain lineage.
  - **Gate 2 (Inventory):** Physical movements reconcile exactly with warehouse stock levels.
  - **Gate 3 (Module Integration):** CRM -> Sales -> Inventory -> Accounting data continuity.
  - **Gate 4 (eTIMS):** Idempotency prevents duplicate tax submissions; credit notes link to original invoices.
  - **Gate 5 (Architecture):** Server-side authorization blocks unauthorized role access.

### 8.2 Database Seeding & Demo Account Provisioning
- Implement robust `prisma/seed.ts` script populating:
  - Demonstration organization with branches and departments.
  - 12 standard users (one for each role) with documented passwords.
  - Realistic customers, suppliers, inventory products with stock levels, deals across all 6 stages, posted invoices, and balanced journal entries.
  - Option to reset demo data cleanly via `npm run db:seed`.

### 8.3 Production Air-Gap Verification
- Verify that setting `APP_ENV != 'production'` completely prevents any outgoing network traffic to production KRA endpoints.
- Ensure production activation requires explicit Super Admin dual-step authorization.

### 8.4 Final Handover Documentation
- Generate clean `README.md` in the project root with exact commands:
  - Installation: `npm install`
  - Database setup: `npm run db:up` (Docker) & `npx prisma migrate dev` & `npm run db:seed`
  - Development server: `npm run dev`
  - Automated tests: `npm run test`
  - Production build: `npm run build && npm run start`
