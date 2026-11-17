# Innowit One Workspace

Enterprise workspace, financial accounting, ERP, CRM, HR/payroll, collaboration, and Kenya eTIMS tax compliance kernel built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS v4**.

---

## Architecture & Modules

Innowit One Workspace runs an integrated multi-branch (`HQ - Nairobi Branch (00)`, `Mombasa Coastal Branch (01)`, `Kisumu Western Hub (02)`) enterprise kernel for **Innowit Technologies Limited** (`KRA PIN: P051234567Z`, Base Currency: `KES`) with local persisted domain stores:

- **Accounting & General Ledger (`/accounting/*`)**: Hierarchical Chart of Accounts, immutable double-entry Journal Entries with reversing-entry lineage, AR/AP Invoicing & Payments, Trial Balance, P&L, and Balance Sheet reports.
- **Kenya eTIMS Compliance Kernel (`/compliance/etims`)**: OSCU/VSCU transmission queue, KRA tax codes (`A` Exempt, `B` 16% VAT, `D` Non-VAT, `E` 8%), fiscal credit notes, and **Air-Gap Security Guard** isolating Sandbox (`https://etims-sbx.kra.go.ke/etims-api/v1/taxpayer-invoices`) from Live Production (`https://etims.kra.go.ke/etims-api/v1/taxpayer-invoices`).
- **CRM & Commercial Pipeline (`/crm/*`)**: Customers directory, 6-stage Kanban Deal Pipeline, Contacts, Tasks Manager, and won-deal conversion.
- **Inventory & Fixed Assets (`/inventory/*`)**: Multi-warehouse stock distribution, bin-to-bin transfers, stock adjustments, and fixed asset depreciation register.
- **Procurement & Sales Orders (`/procurement/*`)**: Suppliers, Purchase Orders, Goods Receipt Notes (GRN), Supplier Bills, and Sales Orders.
- **HR & Kenyan Statutory Payroll (`/hr/*`)**: Departments, Employee Directory, Leave Requests, and PAYE / NSSF / SHIF / Housing Levy payroll runs & payslips.
- **Collaboration & Governance (`/collaboration`, `/executive/bi`, `/automations`, `/system/*`)**: Team channels, threads, shared notes, Executive BI telemetry, event-driven workflow automations, immutable audit trail, 12-Role RBAC Matrix, and Phase 8 Acceptance & Hardening console.

---

## Quick Start & Verified Commands

### Prerequisites
- **Node.js** `>= 20.x`
- **npm** `>= 10.x`

### 1. Install Dependencies
```bash
npm install
```

### 2. Verify & Seed Baseline Workspace Data
Runs `src/scripts/seed.ts` to verify the baseline dataset, display provisioned entity counts and all 12 RBAC demo accounts, and run the 5 Mandatory Acceptance Gates:
```bash
npm run db:seed
```

### 3. Start Development Server (Port 3000)
```bash
npm run dev
```
The workspace serves on `http://localhost:3000` (bound to `0.0.0.0:3000`).

### 4. Run Automated Acceptance Gates Suite
Executes `src/tests/runner.ts` across all 5 Mandatory Acceptance Gates (19 assertions):
```bash
npm run test
```

### 5. Typecheck & Production Build
```bash
npm run lint
npm run build
```

---

## 12-Role RBAC Demo Accounts

Use the **Role Switcher** (`TopBar` user menu or `/system/hardening` → **Seed & Demo Accounts**) to simulate any of the 12 seeded personas immediately:

| # | Role | Email | Persona Name | Title |
|---|---|---|---|---|
| 01 | `SUPER_ADMIN` | `admin@innowit.ke` | Kimani Mwangi | Managing Director & Enterprise Architect |
| 02 | `ADMIN` | `sysadmin@innowit.ke` | Alex Kibet | System Administrator |
| 03 | `EXECUTIVE` | `ceo@innowit.ke` | Faith Wanjiku | Chief Executive Officer |
| 04 | `FINANCE_MANAGER` | `finance@innowit.ke` | Patrick Otieno | Head of Finance & Treasury |
| 05 | `ACCOUNTANT` | `accountant@innowit.ke` | Sarah Chebet | Senior Financial Accountant |
| 06 | `SALES_MANAGER` | `sales.dir@innowit.ke` | David Ochieng | Commercial Director |
| 07 | `SALES_REP` | `sales@innowit.ke` | Kevin Mutiso | Senior Enterprise Sales Executive |
| 08 | `PROCUREMENT_OFFICER` | `procure@innowit.ke` | Grace Mutua | Procurement Specialist |
| 09 | `INVENTORY_MANAGER` | `inventory@innowit.ke` | Hassan Abdi | Central Warehouse & Logistics Manager |
| 10 | `HR_MANAGER` | `hr@innowit.ke` | Lilian Ndinda | People & Culture Director |
| 11 | `PROJECT_MANAGER` | `pm@innowit.ke` | Brian Kiprono | Technical Implementation Lead |
| 12 | `EMPLOYEE` | `staff@innowit.ke` | Mercy Achieng | Operations Analyst |

---

## Accounting & Tax Security Guarantees

### Double-Entry Ledger Invariants
- Every posted `JournalEntry` enforces `SUM(Debit) === SUM(Credit)` (`|diff| < 0.01`) and rejects unbalanced postings.
- The Trial Balance across `DEFAULT_ACCOUNTS` reconciles Asset + Expense debits against Liability + Equity + Revenue credits (`KES 13,300,000 == KES 13,300,000`).
- Posted journal entries are immutable; corrections use reversing entries (`REVERSED` / `reversingEntryId` / `reversedEntryId`) with full lineage.

### Kenya eTIMS Air-Gap Protection
- **Default Sandbox Lock**: The workspace boots in **Sandbox Air-Gap Mode** (`isSandbox = true`, `innowit_etims_airgap_v1` locked to `https://etims-sbx.kra.go.ke/etims-api/v1/taxpayer-invoices`).
- **Environment Guard (`validateOutboundTransmission`)**: Any outbound attempt to `https://etims.kra.go.ke/...` while `isSandbox === true`, `APP_ENV !== 'production'`, or without Super Admin certification is strictly blocked and logged to the Audit Trail.
- **Dual-Step Super Admin Production Switch**: Activating live KRA production (`activateProductionAirGap`) requires:
  1. Active session role strictly equal to `SUPER_ADMIN`
  2. Explicit risk attestation checkbox + exact confirmation phrase `ACTIVATE-LIVE-KRA-P051234567Z`

---

## 5 Mandatory Acceptance Gates

Both `npm run test` and the in-app **System Governance → Acceptance & Hardening** console (`/system/hardening`) validate:

1. **Gate 1 — Accounting Core & General Ledger Integrity**: Double-entry balance, unbalanced entry rejection, reversing entry lineage, and Trial Balance equality.
2. **Gate 2 — Inventory Stock & Accounting Valuation**: Multi-warehouse bin reconciliation against `stockOnHand`, immutable stock movements, FIFO/WA costing, and positive stock valuation.
3. **Gate 3 — Cross-Module End-to-End Integration**: Canonical customer FK continuity across CRM/Invoicing/eTIMS, eTIMS tax calculation accuracy (`B` 16% VAT), Purchase Order subtotal + VAT math, and Credit Note eTIMS lineage.
4. **Gate 4 — Kenya eTIMS Air-Gap Security Enforcement**: Blocks live KRA endpoints in Sandbox and `APP_ENV !== 'production'`, blocks uncertified Production traffic, and rejects non-`SUPER_ADMIN` activation attempts.
5. **Gate 5 — 12-Role RBAC & Least-Privilege Isolation**: Confirms all 12 roles exist, `SUPER_ADMIN` retains full access, `SALES_REP` is blocked from Payroll/Audit, `EMPLOYEE` is blocked from Accounting/Settings, and `FINANCE_MANAGER` is scoped away from System RBAC administration.
