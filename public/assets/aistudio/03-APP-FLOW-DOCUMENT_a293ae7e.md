# APPLICATION FLOW DOCUMENT (AFD)
# Innowit One Workspace (Business Operating System)
**Document Version:** 1.0.0  
**Coverage Scope:** Complete Screen Inventory, User Journeys & Click-by-Click Action Matrix  
**Interaction Model:** Desktop Primary (1440px+) / Tablet Adaptive (768px-1024px) / Mobile Responsive (375px-430px)

---

## 1. Application Navigation & Shell Architecture

### 1.1 Global Application Shell
The application shell encloses every authenticated screen.

```
+---------------------------------------------------------------------------------------------------------+
| [Workspace Icon] Innowit One | [Branch Switcher] | [Global Search / Ctrl+K] | [Mode Badge] [Bell] [User] |
+------------------------------+--------------------------------------------------------------------------+
| SIDEBAR NAVIGATION (Collapsible)                                                                        |
| - COLLABORATION              | BREADCRUMBS: Home / ERP / Invoices / INV-2026-0042                       |
|   * Channels                 +--------------------------------------------------------------------------+
|   * Direct Messages          | MAIN WORKING CANVAS                                                      |
|   * Shared Notes             | (Dynamic Module Content: Grids, Forms, Kanban, Dashboards)               |
|   * Workspace Files          |                                                                          |
|   * Huddles (Demo)           |                                                                          |
| - CRM                        |                                                                          |
|   * Dashboard                |                                                                          |
|   * Customers & Contacts     |                                                                          |
|   * Deals Pipeline (Kanban)  |                                                                          |
|   * Tasks & Activities       |                                                                          |
| - ERP & ACCOUNTING           |                                                                          |
|   * General Ledger & COA     |                                                                          |
|   * Invoicing & AR           |                                                                          |
|   * Bills & AP               |                                                                          |
|   * Banking & Reconciliation |                                                                          |
|   * Financial Reports        |                                                                          |
| - OPERATIONS                 |                                                                          |
|   * Products & Inventory     |                                                                          |
|   * Procurement & POs        |                                                                          |
|   * Sales Orders             |                                                                          |
|   * Projects & Operations    |                                                                          |
|   * Asset Register           |                                                                          |
| - HUMAN CAPITAL              |                                                                          |
|   * Employees & Depts        |                                                                          |
|   * Attendance & Leaves      |                                                                          |
|   * Payroll Processing       |                                                                          |
| - KENYA eTIMS ENGINE         |                                                                          |
|   * Taxpayer Setup           |                                                                          |
|   * Transmission Queue       |                                                                          |
|   * eTIMS Reconciliation     |                                                                          |
| - SETTINGS & AUDIT           |                                                                          |
+------------------------------+--------------------------------------------------------------------------+
```

---

## 2. Authentication, Onboarding & Workspace Initialization

### Screen A1: Login (`/login`)
- **Elements:** Company Logo, Email input, Password input, Remember Me checkbox, "Sign In" button, "Forgot Password" link, Demo Account Auto-Fill buttons (Admin, Accountant, Sales Rep).
- **Interactions & Clicks:**
  1. Click "Demo Admin" -> Fills credentials (`admin@innowit.ke` / `DemoPass123!`).
  2. Click "Sign In":
     - Validates form via Zod client-side.
     - Submits POST to `/api/auth/login`.
     - Displays loading spinner on button.
     - On success: Sets HTTP-only session cookie and redirects to `/workspace`.
     - On error: Renders high-contrast red error alert banner ("Invalid email or password").
  3. Click "Forgot Password" -> Navigates to `/forgot-password`.

### Screen A2: Command Palette (`Ctrl+K` / `Cmd+K` anywhere)
- **Elements:** Backdrop blur overlay, search input with placeholder "Type a command, search customers, invoices, or jump to module...", categorized result list.
- **Interactions & Clicks:**
  1. Press `Ctrl+K` -> Opens modal with autofocus on search input.
  2. Type query (e.g., "INV-0042" or "Create Customer"):
     - Filters commands, recent records, and module links in real time (<20ms debounce).
  3. Press Arrow Down / Up -> Moves keyboard selection highlight.
  4. Press `Enter` -> Immediately executes action or navigates to destination, closing the palette.
  5. Press `Esc` or click backdrop -> Closes modal.

---

## 3. Module 1: Team Collaboration Flow

### Screen C1: Channel View (`/collaboration/channels/[channelId]`)
- **Elements:**
  - Sidebar: Channel list (with `#` icon and lock icon for private), Direct Message list (with user avatar and online status pip), "Add Channel" button (`+`).
  - Top Bar: Channel title, topic, member count, search in channel, "Start Huddle" button, "Channel Details" button.
  - Message Area: Scrollable chat history, date dividers, message bubbles (sender avatar, name, timestamp, rich text content, attachment cards, emoji reactions).
  - Bottom Bar: Rich message composer (bold, italic, code block, attach file button, emoji picker, Send button).
  - Right Drawer (Contextual): Thread view or Channel Info (slides in from right).
- **Interactions & Clicks:**
  1. Click `#general` in sidebar -> Switches active channel, updates URL, loads last 50 messages, connects to live updates.
  2. Click `+` next to Channels -> Opens "Create Channel" modal:
     - Form: Name (`kebab-case` auto-formatted), Description, Private toggle.
     - Click "Create" -> Posts to API, appends new channel to sidebar, navigates into it.
  3. Hover message -> Reveals floating action toolbar (Add Reaction, Reply in Thread, Pin Message, More Options).
  4. Click "Reply in Thread" -> Slides out right-side Thread Drawer:
     - Renders parent message at top.
     - Renders chronologically ordered replies.
     - Separate reply composer at bottom.
  5. Click "Attach File" in composer -> Opens OS file picker -> Uploads to `/api/files/upload` -> Displays file attachment card with download icon and thumbnail preview.
  6. Click "Start Huddle" -> Opens Huddle demonstration window overlay with mic/cam controls and screen-sharing toggle.

---

## 4. Module 2: CRM & Sales Pipeline Flow

### Screen CRM1: CRM Dashboard (`/crm/dashboard`)
- **Elements:** Date range selector (Today, This Week, This Month, This Quarter, Custom), Metrics Cards (Total Customers, Active Deals, Pipeline Value, Won Revenue, Overdue Tasks), Sales Funnel bar chart, Recent Activity Feed.
- **Interactions & Clicks:**
  1. Click date range selector -> Updates all KPI cards and charts dynamically.
  2. Click "Active Deals" card -> Navigates to Deals Kanban filtered by open deals.
  3. Click "Overdue Tasks" count -> Scrolls to or filters task table below.

### Screen CRM2: Customer Directory & Detail (`/crm/customers`)
- **Elements:**
  - Table: Customer Name, Company, KRA PIN, Email, Phone, Status (Lead, Active, Inactive), Open Deals Value, Actions (`...`).
  - Top Controls: Search box, Status filter dropdown, "Add Customer" button.
- **Interactions & Clicks:**
  1. Click "Add Customer" button -> Opens slide-over drawer:
     - Fields: Customer Name, Business Type (Corporate / Individual), KRA PIN (with regex validation `/^[A-Z]\d{9}[A-Z]$/`), Email, Phone, Billing Address, Credit Limit, Payment Terms (Net 30, COD, etc.).
     - Click "Save Customer" -> Validates, posts to `/api/crm/customers`, inserts into table, triggers success toast.
  2. Click customer row -> Navigates to `/crm/customers/[id]`:
     - Header: Customer name, KRA PIN, account balance summary.
     - Tabs: Overview, Deals, Invoices & Payments, Tasks, Activity Timeline.
     - Click "New Deal" from Deals tab -> Opens Deal Creation dialog with customer pre-selected.

### Screen CRM3: Deals Pipeline Kanban (`/crm/deals`)
- **Elements:** 6 columns (New Lead, Contacted, Qualified, Proposal, Negotiation, Closed). Cards show Deal Name, Customer, Value (KES), Probability %, Assigned Rep avatar.
- **Interactions & Clicks:**
  1. Drag deal card from "Proposal" to "Negotiation" -> Card smoothly animates; updates deal stage on drop via API mutation.
  2. Drag deal card to "Closed" -> Triggers "Deal Outcome Modal":
     - Radio selection: "Closed Won" or "Closed Lost".
     - If Won: Optional checkbox "Generate Quotation / Sales Order in ERP".
     - If Lost: Mandatory "Lost Reason" dropdown (Price, Competitor, Budget Cancelled, Other).
     - Click "Confirm" -> Commits outcome, updates CRM metrics.

---

## 5. Module 3: Accounting, Finance & General Ledger Flow

### Screen ACC1: Chart of Accounts (`/accounting/chart-of-accounts`)
- **Elements:** Hierarchical tree-view organized by primary classes (1000 Assets, 2000 Liabilities, 3000 Equity, 4000 Revenue, 5000 Expenses). Columns: Account Code, Account Name, Type, Current Balance, Status, Actions.
- **Interactions & Clicks:**
  1. Click category row (e.g., `1000 Assets`) -> Expands/collapses child accounts.
  2. Click "Add Account" button -> Opens modal:
     - Fields: Parent Category, Account Number, Account Name, Currency, Description.
     - Click "Save Account" -> Validates unique account code, updates tree.
  3. Click account row -> Opens slide-over displaying all historical journal lines for that account.

### Screen ACC2: General Ledger & Manual Journal Entries (`/accounting/journal-entries`)
- **Elements:** Journal entry list (Entry Number, Posting Date, Source Module, Reference, Total Debit, Total Credit, Status), "New Journal Entry" button.
- **Interactions & Clicks:**
  1. Click "New Journal Entry" -> Opens journal entry creator (`/accounting/journal-entries/new`):
     - Header: Posting Date, Reference Number, Entry Description.
     - Line Items Grid: Account Selector (searchable dropdown), Description, Debit amount input, Credit amount input, Delete line icon (`trash`).
     - Footer: Live calculation of Total Debits, Total Credits, Difference (Difference highlighted in red if non-zero; green `0.00` when balanced).
     - "Post Journal Entry" button (disabled if Difference != 0 or lines < 2).
  2. Enter lines: Line 1: `1010 Bank` Debit `50,000`. Line 2: `4010 Sales Revenue` Credit `50,000`.
  3. Click "Post Journal Entry":
     - Enforces atomic database transaction.
     - Sets status to `POSTED`.
     - Entry becomes permanently immutable (no edit/delete buttons; only "Create Reversing Entry" option).

### Screen ACC3: Accounts Receivable & Invoicing (`/accounting/invoices`)
- **Elements:** Invoice table with status filters (All, Draft, Posted, KRA Accepted, Paid, Overdue), Search by customer/invoice number.
- **Interactions & Clicks:**
  1. Click "Create Invoice" -> Opens Invoice Form:
     - Select Customer (auto-populates billing address and KRA PIN).
     - Select Payment Terms (e.g., Net 30 -> auto-computes Due Date).
     - Line Items: Select Product -> Auto-fills description, unit price, KRA tax classification (16% VAT). Enter Quantity -> Computes Subtotal, VAT Amount, Line Total.
     - Financial Summary: Subtotal, VAT (16%), Total Payable.
     - Actions: "Save as Draft", "Validate & Post to Ledger", "Cancel".
  2. Click "Validate & Post to Ledger":
     - Runs double-entry validation (Dr Accounts Receivable, Cr Sales Revenue, Cr VAT Output).
     - Posts journal entry to GL.
     - Automatically creates entry in `etims_transmission_queue` with status `PENDING`.
     - Displays invoice detail view with eTIMS transmission badge "Transmitting to KRA...".

---

## 6. Module 4: ERP Operations (Inventory, Procurement, Sales, HR)

### Screen OPS1: Inventory & Stock Management (`/inventory/products`)
- **Elements:** Product Master Grid (SKU, Barcode, Product Name, Category, UOM, Cost Price, Selling Price, Available Stock, Reorder Level, Status).
- **Interactions & Clicks:**
  1. Click "New Product" -> Opens product drawer:
     - General: Name, SKU (or auto-generate), Barcode, Category, UOM (Pieces, Kg, Liters, Boxes).
     - Pricing & Costing: Standard Cost, Selling Price, Inventory Valuation Method (FIFO / Moving Average).
     - Tax Classification: Standard 16%, Zero Rated 0%, Exempt.
     - Warehouses: Initial warehouse assignment and reorder threshold.
     - Click "Save Product" -> Inserts record.
  2. Click "Stock Operations" dropdown -> Options: "Stock Receipt", "Stock Issue", "Warehouse Transfer", "Stock Adjustment".
  3. Click "Stock Adjustment":
     - Select Product, Warehouse, Adjustment Type (Increase / Decrease), Quantity, Reason (Damaged, Audit Variance, Expiration).
     - Shows offsetting accounting expense account (e.g., `5020 Inventory Shrinkage`).
     - Click "Post Adjustment" -> Updates stock movement ledger and posts balancing journal entry atomically.

### Screen OPS2: Procurement & Purchase Orders (`/procurement/purchase-orders`)
- **Elements:** PO list (PO Number, Supplier, Order Date, Total Amount, Expected Date, Approval Status, Delivery Status).
- **Interactions & Clicks:**
  1. Click "Create Purchase Order":
     - Select Supplier (shows payment terms and KRA PIN).
     - Add Line Items (Products, Quantities, Unit Cost).
     - Click "Submit for Approval" -> Changes status to `PENDING_APPROVAL`.
  2. Approver logs in (Role: `FINANCE_MANAGER` or `ADMIN`) -> Clicks "Approve PO" -> Status becomes `APPROVED`.
  3. When goods arrive at dock -> Click "Receive Goods" -> Opens Goods Receipt Note (GRN) screen:
     - Input delivered quantities per line item (supports partial delivery).
     - Select target warehouse.
     - Click "Confirm Receipt" -> Increases warehouse stock balance in stock movement ledger, creates unbilled GRN liability entry in accounting.
  4. Click "Generate Supplier Bill" from GRN -> Matches PO, GRN, and Bill -> Posts to Accounts Payable.

### Screen OPS3: Human Resources & Payroll (`/hr/payroll`)
- **Elements:** Employee Directory, Leave Approvals list, Active Payroll Periods table (Month, Year, Total Gross, Total Deductions, Total Net, Status: Draft, Approved, Paid).
- **Interactions & Clicks:**
  1. Click "New Payroll Run":
     - Select Month & Year (e.g., November 2026).
     - Click "Compute Payroll" -> System queries active employees, applies salary structures, computes basic salary, housing allowance, overtime, calculates statutory deductions (PAYE, NSSF, NHIF/SHIF, Housing Levy).
     - Renders review table with drilldown per employee.
  2. Click "Approve Payroll" (requires `HR_MANAGER` or `FINANCE_MANAGER` role) -> Locks figures.
  3. Click "Post to General Ledger":
     - Generates atomic payroll journal entry:
       * Dr Salaries & Wages Expense (Gross Pay)
       * Cr PAYE Tax Payable
       * Cr NSSF / NHIF Statutory Liabilities
       * Cr Net Salaries Payable
  4. Click "Generate Payslips" -> Creates downloadable PDF payslips for each employee.

---

## 7. Module 5: Kenya eTIMS Tax Compliance Engine Flow

### Screen ETIMS1: Taxpayer & System Configuration (`/etims/configuration`)
- **Elements:**
  - Deployment State Banner: Prominent indicator showing one of 10 states (e.g., `SANDBOX CONNECTED` or `PRODUCTION ACTIVE`).
  - Form Cards:
    * Taxpayer Identification: Legal Business Name, KRA PIN, Branch Code, VAT Number.
    * Integration Mode: Radio toggle: "Online Sales Control Unit (OSCU)" vs. "Virtual Sales Control Unit (VSCU)".
    * Environment: Radio toggle: "Sandbox (Test Environment)" vs. "Production (Live KRA)".
    * Security Credentials: Client ID, Client Secret, Certificate Path (.p12 / .pem), Private Key Passphrase.
    * Tax Account Mappings: VAT Output Account (2010), VAT Input Account (2020), Withholding Tax Account (2030).
- **Interactions & Clicks:**
  1. Fill credentials and select "Sandbox".
  2. Click "Test Connection":
     - Sends ping / validation request to KRA sandbox endpoint.
     - Displays connection status: Green checkmark ("Sandbox API Connected") or Red alert with specific error message.
  3. Toggle "Production Mode":
     - Triggers security dialog: "Warning: Production activation requires KRA certification. Are you sure you wish to switch?"
     - Requires Super Admin password and explicit confirmation checkbox.

### Screen ETIMS2: Invoice Submission Queue & Monitor (`/etims/queue`)
- **Elements:**
  - Status Filter Pills: All, Pending, In Flight, KRA Accepted, Rejected, Retry Scheduled.
  - Table Columns: Queue ID, Local Invoice #, Customer Name, Total Amount, Tax (16%), Mode, Attempts, Last Error, KRA Control #, Actions.
- **Interactions & Clicks:**
  1. Invoices posted from Sales automatically appear with status `PENDING`.
  2. Worker processes invoice:
     - Updates status to `IN_FLIGHT`.
     - On successful response: Stores KRA Control Number (e.g., `KRA20260492817`), Internal Signature Hash, QR Code URL. Status changes to `ACCEPTED`.
     - On rejection: Status changes to `REJECTED`. Error message column shows KRA return code (e.g., `ERR-042: Invalid Buyer PIN format`).
  3. Click "View Payload / Response" on any row:
     - Opens modal showing exact JSON transmitted and exact JSON received from KRA (credentials stripped).
  4. Click "Retry Submission" (for failed/rejected items):
     - Re-validates data, increments attempt counter, dispatches immediate submission.

### Screen ETIMS3: Credit Note Issuance (`/etims/credit-notes`)
- **Elements:** Credit Notes table, "Create Credit Note" button.
- **Interactions & Clicks:**
  1. Click "Create Credit Note":
     - Step 1: Select Original Invoice (search by invoice number or customer).
     - System loads original eTIMS Control Number and original line items.
     - Step 2: Select Reason (Goods Returned, Pricing Correction, Cancellation).
     - Step 3: Enter return quantities or adjustment amounts (cannot exceed original invoice values).
     - Step 4: Click "Post & Submit Credit Note":
       * Generates reversing accounting entry.
       * Restores returned items to inventory (if physical return).
       * Submits credit note payload referencing original KRA Control Number through the exact same eTIMS solution.
       * Stores credit note acknowledgment code.

### Screen ETIMS4: Reconciliation & Audit Screen (`/etims/reconciliation`)
- **Elements:**
  - 3-Way Reconciliation Comparison: Local ERP Invoices vs. eTIMS Queue Submissions vs. KRA Acknowledged Receipts.
  - Variance Summary: Total Invoices Issued, Total Successfully Taxed, Unmatched Records Count, Discrepancy Value (KES).
  - Unmatched Table: Highlighting invoices in ERP missing KRA signatures or submissions without matching local orders.
- **Interactions & Clicks:**
  1. Select reporting period (e.g., Last 30 Days).
  2. Click "Run Reconciliation":
     - Executes automated discrepancy audit across tables.
     - Displays list of variances.
  3. Click "Export Reconciliation Report" -> Generates KRA-audit ready CSV or PDF report.
