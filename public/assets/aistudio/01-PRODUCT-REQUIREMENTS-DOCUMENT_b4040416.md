# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# Innowit One Workspace (Business Operating System)
**Document Version:** 1.0.0  
**Target Architecture:** Modular Monolith / Local-First Deployable ERP + CRM + Collaboration  
**Compliance Context:** Accounting-First Transaction Integrity & Kenya Revenue Authority (KRA) eTIMS System-to-System Compliance

---

## 1. Overview

Innowit One Workspace is a unified, locally deployable, modular enterprise business operating system designed for modern SMEs, growth ventures, and distributed teams. It consolidates team collaboration, CRM, enterprise resource planning (ERP), human capital management, project execution, business intelligence, and statutory tax compliance into a single cohesive platform.

Traditional businesses suffer from data fragmentation: team communication happens in Slack or Teams; customer pipelines live in HubSpot or Salesforce; billing and inventory exist in disparate spreadsheets or QuickBooks; and statutory tax compliance requires external, disconnected portals. Innowit One Workspace eliminates this operational friction by anchoring all workflows to an accounting-first transaction engine where every commercial action (a closed deal, an inventory receipt, a dispatched sales order, or a processed payroll) updates the general ledger, synchronizes stock ledgers, and triggers statutory compliance workflows automatically.

The system natively incorporates Kenya Revenue Authority (KRA) eTIMS (Electronic Tax Invoice Management System) compliance, supporting both OSCU (Online Sales Control Unit) and VSCU (Virtual Sales Control Unit) integration modes, with air-gapped sandbox and production separation.

---

## 2. Goals & Objectives

### 2.1 Core Business Goals
1. **Unified Operational Hub:** Eliminate departmental silos by converging messaging, customer relationships, procurement, inventory, accounting, HR, and compliance into a singular source of truth.
2. **Absolute Accounting & Audit Integrity:** Implement a strict double-entry general ledger where debits equal credits at all times, transactions are immutable, corrections use reversing entries or credit notes, and every ledger entry traces directly to its originating operational document.
3. **Statutory Kenya eTIMS Conformance:** Deliver a certified, reliable KRA eTIMS adapter with automated payload generation, queue-based transmission, cryptographic validation storage, offline-resilient batching, and credit note linkage.
4. **Local-First Reliability with Cloud Scalability:** Enable full on-premises local deployment (Docker-compatible, local PostgreSQL, offline operations) while maintaining an architectural path toward multi-tenant SaaS.
5. **Zero Friction UX:** Deliver an intuitive, high-performance interface with dark terminal aesthetics, Swiss typography, sub-100ms response times, and keyboard-driven navigation (Ctrl+K Command Center).

### 2.2 Non-Goals
- Real-time WebRTC media server engineering (Huddles feature provides a structured demonstration shell and signaling abstraction rather than proprietary video encoding infrastructure).
- Disconnected CRUD prototypes: No module may store data without relational enforcement, double-entry audit linkage, or validation against business rules.
- Direct database writes across module boundaries: All inter-module actions must traverse declared service interfaces.

---

## 3. Core Requirements & Module Breakdown

### 3.1 Module 1: Team Workspace & Collaboration
- **Channels:** Public and private discussion spaces organized by topic, project, or department. Includes channel descriptions, membership management, pinned messages, channel-specific file attachments, and full-text search.
- **Direct & Group Messaging:** 1-on-1 and multi-user direct messaging with markdown styling, code syntax highlighting, emoji reactions, read states, and edit/delete capabilities with audit records.
- **Threaded Conversations:** Contextual branching from any parent message, reply counts, dedicated thread sidebars, and thread subscription alerts.
- **Workspace Files & Assets:** Centralized file repository with preview generation (images, PDFs, text), metadata indexing (size, mime type, uploader, entity tag), and access control.
- **Shared Operational Notes:** Rich-text collaborative workspace documents with bi-directional linkage to CRM deals, tasks, ERP projects, and customer accounts.
- **Huddles (Demonstration Mode):** Virtual meeting spaces with participant presence, audio/video toggle states, screen-share simulation controls, and meeting summary notes.

### 3.2 Module 2: Customer Relationship Management (CRM)
- **Customer Directory:** Full lifecycle customer profiles (Leads, Active Accounts, Inactive) supporting company entities, multiple contact persons, tax PINs, credit terms, and complete interaction timelines.
- **Sales Representatives:** Staff assignment, pipeline ownership, quota tracking, commission rules, and activity logs.
- **Deals & Pipeline Management:** Interactive 6-stage Kanban board (New Lead, Contacted, Qualified, Proposal, Negotiation, Closed) with mandatory Won/Lost outcome logging, win probability weighting, and anticipated closing dates.
- **Task Management:** Cross-entity task assignment linked to customers, deals, projects, or orders, with urgency scoring (Low, Medium, High, Urgent), due dates, and escalation reminders.
- **CRM Analytics:** Real-time conversion velocity, pipeline valuation, weighted pipeline forecasts, customer acquisition cost (CAC) tracking, and rep performance metrics calculated from live transactions.

### 3.3 Module 3: Enterprise Resource Planning (ERP) - Accounting Core
- **Chart of Accounts (COA):** Hierarchical 5-category accounting tree (Assets, Liabilities, Equity, Revenue, Expenses) with user-configurable sub-accounts, currency assignments, and tax treatment rules.
- **Double-Entry General Ledger (GL):** Atomic journal posting engine enforcing debits equal credits on every entry. Journal entries are immutable once posted; corrections require explicit reversal journals.
- **Accounts Receivable (AR):** Sales invoice issuance, aging reports (0-30, 31-60, 61-90, 90+ days), partial payment allocations, customer statements, and unapplied cash management.
- **Accounts Payable (AP):** Supplier bill registration, 3-way matching (PO vs. Goods Receipt vs. Bill), payment voucher creation, payment terms tracking, and supplier aging schedules.
- **Cash & Bank Management:** Multi-currency bank and cash account tracking, inter-account transfers, statement import, and bank reconciliation ledger.
- **Financial Reporting:** Real-time balance sheet, profit and loss statement (P&L), trial balance, cash flow statement, and general ledger transaction drill-down reports generated dynamically from posted entries.

### 3.4 Module 4: ERP Operations (Inventory, Procurement, Sales, HR, Assets, Projects)
- **Inventory & Multi-Warehouse:** Master product directory with SKUs, barcodes, unit of measurements (UOM), cost price (FIFO / Moving Average), selling price, and reorder points. Multi-warehouse tracking, stock movements (Receipt, Issue, Transfer, Adjustment), stock reservations on confirmed orders, and immutable stock ledgers preventing negative balances unless explicitly configured.
- **Procurement & Supplier Management:** Vendor profiles with KRA PINs, payment terms, and ratings. 8-step procurement lifecycle: Requisition -> Approval -> RFQ -> Vendor Selection -> Purchase Order (PO) -> Goods Receipt Note (GRN) -> Supplier Bill -> Payment.
- **Sales Order Fulfillment:** Commercial workflow: Quotation -> Confirmed Sales Order -> Stock Reservation -> Delivery Note / Pick List -> Tax Invoice -> Payment Settlement.
- **Human Resources & Payroll:** Employee records, departmental hierarchy, emergency contacts, salary structures, daily attendance clocking, leave request/approval workflows, and payroll calculation engine computing basic pay, allowances, overtime, and statutory deductions.
- **Project & Operational Management:** Project tracking with task boards (Kanban, List, Gantt/Timeline), milestone management, time logging, expense allocation, and project profitability reporting.
- **Fixed Asset Management:** Fixed asset register, asset tags, custodian assignment, depreciation engine (Straight-Line, Reducing Balance), maintenance logs, and asset disposal accounting.

### 3.5 Module 5: Kenya eTIMS Tax Compliance Module
- **Dual Architecture (OSCU & VSCU):** Replaceable integration adapter supporting both Online Sales Control Unit (direct API submission to KRA eTIMS endpoints) and Virtual Sales Control Unit (local fiscal client proxy / batch queuing).
- **Taxpayer & Branch Configuration:** Secure registration of Taxpayer Name, KRA PIN, Branch Code, Device Serial / Integration Key, VAT registration status, and tax account ledger mappings.
- **Product Tax Classification:** Standardized mapping of inventory SKUs to KRA HS codes and tax rates (Standard 16%, Zero Rated 0%, Exempt, Withholding Tax).
- **Invoice Submission Lifecycle:** Controlled 10-step submission: Local Draft -> Validation -> Accounting Post -> Payload Construction -> eTIMS Transmission -> KRA Signature / QR Code Receipt -> Status Update -> Reconciled Invoice.
- **Credit Note Enforcement:** Mandatory linkage of credit notes to original eTIMS invoice numbers, original control codes, and reason codes, ensuring compliance with KRA rules.
- **Offline Transmission Queue:** Persistent transactional outbox queue for network disruption tolerance with exponential backoff retry, idempotency safeguards, and duplicate transmission blocks.
- **Air-Gapped Sandbox vs. Production Gate:** Explicit segregation of sandbox testing credentials/endpoints from production environments, enforcing mandatory deployment states and blocking production activation until certified.

### 3.6 Module 6: Business Intelligence, Automation & System Services
- **Executive BI Dashboards:** Cross-functional KPI cards, cash runway monitors, inventory turnover ratios, revenue trends, and department budget consumption metrics.
- **Event-Driven Workflow Automation:** Configurable trigger-condition-action engine (e.g., when stock < reorder level -> generate purchase requisition draft; when invoice overdue 15 days -> dispatch reminder notification).
- **Universal Command Center (Ctrl+K):** Global omni-search spanning customers, products, invoices, orders, employees, messages, files, and fast keyboard action dispatch.
- **Audit Logging & Activity Streams:** Immutable append-only audit trail capturing user ID, timestamp, IP, entity type, record ID, previous state, and new state across all write operations.

---

## 4. User Experience & Design Philosophy

1. **Information Density with Visual Calm:** Clean, Swiss-inspired typography, dark terminal styling with balanced whitespace, structured data grids, and high-contrast status tags.
2. **Context-Preserving Navigation:** Collapsible left navigation sidebar, persistent top breadcrumbs, right-side sliding detail drawers (sheets), and keyboard shortcuts to navigate without page reloads.
3. **Deterministic Operational Feedback:** Every button click produces immediate optimistic feedback or clear loading indicators; destructive actions require confirmation dialogs; asynchronous actions register in the background notification drawer.
4. **Zero Dead Ends:** Empty states provide clear calls to action (e.g., "No invoices found. Create your first sales order or draft invoice"); search queries with zero hits recommend related filters.
5. **Clear Separation of Fiscal States:** Invoices, credit notes, and eTIMS submissions display unambiguous visual badges indicating their lifecycle (Draft, Validated, Submitted, KRA Accepted, KRA Rejected, Sandbox Test).

---

## 5. Success Metrics & Key Performance Indicators

| Metric Category | Target Indicator | Verification Method |
|---|---|---|
| **Accounting Accuracy** | 100% balanced general ledger entries (Debits == Credits). Zero orphaned journal lines. | Automated daily integrity check and database foreign key constraints. |
| **Inventory Integrity** | Stock movements exactly equal physical on-hand balance. Zero unauthorized negative stock. | Stock ledger reconciliation queries against product balances. |
| **eTIMS Transmission Reliability** | Zero duplicate invoice transmissions to KRA. 100% traceable QR codes and signature storage. | eTIMS queue retry audit and verification matching logs. |
| **System Performance** | Page transition latency < 150ms. Data table queries (10k+ rows) < 200ms. | Server-side execution benchmarks and client Core Web Vitals. |
| **Deployment Separation** | 100% isolation between sandbox mock/test submissions and production fiscal records. | Automated backend gate checks blocking production API calls on test databases. |
| **Operational Efficiency** | 1-click conversion from Quotation to Sales Order to Delivery Note to Tax Invoice. | End-to-end integration test execution time. |
