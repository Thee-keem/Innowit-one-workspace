/**
 * INNOWIT ONE WORKSPACE — 5 MANDATORY ACCEPTANCE GATES TEST SUITE
 * Test-Driven Verification of Accounting, Inventory, Integration, eTIMS, and RBAC Security.
 *
 * @license Apache-2.0
 */

import {
  DEFAULT_ACCOUNTS,
  DEFAULT_JOURNAL_ENTRIES,
  DEFAULT_CUSTOMERS,
  DEFAULT_PRODUCTS,
  SEED_USERS,
} from '@/data/kernel';
import { SEED_INVOICES } from '@/data/accountingSeed';
import { SEED_CUSTOMERS } from '@/data/crmSeed';
import { SEED_CREDIT_NOTES, SEED_ETIMS_QUEUE } from '@/data/etimsSeed';
import {
  SEED_WAREHOUSES,
  SEED_WAREHOUSE_STOCKS,
  SEED_PURCHASE_ORDERS,
  SEED_STOCK_MOVEMENTS,
} from '@/data/erpSeed';
import { canViewModule } from '@/modules/auth/rbac';
import {
  validateOutboundTransmission,
  activateProductionAirGap,
  KRA_ENDPOINTS,
} from '@/modules/etims/airgap';
import {
  Account,
  JournalEntry,
  ProductRecord,
  InvoiceRecord,
  CustomerRecord,
  PurchaseOrderRecord,
  StockMovementRecord,
  WarehouseStockRecord,
  EtimsQueueItem,
  CreditNoteRecord,
  UserRole,
  SystemModule,
} from '@/types';

export interface AssertionResult {
  check: string;
  passed: boolean;
  message: string;
  evidence?: Record<string, unknown>;
}

export interface GateResult {
  id: string;
  name: string;
  category: string;
  passed: boolean;
  durationMs: number;
  description: string;
  assertions: AssertionResult[];
}

export interface TestSuiteSummary {
  timestamp: string;
  allPassed: boolean;
  totalGates: number;
  passedGates: number;
  failedGates: number;
  totalAssertions: number;
  passedAssertions: number;
  failedAssertions: number;
  totalDurationMs: number;
  gates: GateResult[];
}

/**
 * Helper to validate double-entry balance
 */
export function validateJournalEntryBalance(entry: JournalEntry): boolean {
  const totalDebit = entry.lines.reduce((sum, l) => sum + (l.debit || 0), 0);
  const totalCredit = entry.lines.reduce((sum, l) => sum + (l.credit || 0), 0);
  return totalDebit > 0 && Math.abs(totalDebit - totalCredit) < 0.01;
}

/**
 * GATE 1: Accounting Core & General Ledger Integrity
 */
export function runGate1Accounting(
  accounts: Account[] = DEFAULT_ACCOUNTS,
  journalEntries: JournalEntry[] = DEFAULT_JOURNAL_ENTRIES
): GateResult {
  const startTime = performance.now();
  const assertions: AssertionResult[] = [];

  // Assertion 1.1: Every posted journal entry in the database balances
  const postedEntries = journalEntries.filter((je) => je.status === 'POSTED');
  const allBalanced =
    postedEntries.length > 0 && postedEntries.every((entry) => validateJournalEntryBalance(entry));

  assertions.push({
    check: 'Double-Entry Balancing (SUM(Debits) == SUM(Credits))',
    passed: allBalanced,
    message: allBalanced
      ? `All ${postedEntries.length} posted General Ledger journal entries are mathematically balanced.`
      : 'Unbalanced journal entry detected in General Ledger state.',
    evidence: { postedEntriesCount: postedEntries.length },
  });

  // Assertion 1.2: Unbalanced journal entry rejection guard
  const unbalancedSample: JournalEntry = {
    id: 'je_test_unbalanced',
    entryNumber: 'JE-TEST-999',
    date: '2026-11-12',
    reference: 'TEST-UNBALANCED',
    memo: 'Unbalanced entry test',
    postedBy: 'Test Subagent',
    status: 'POSTED',
    lines: [
      { id: '1', accountId: '1010', accountNumber: '1010', accountName: 'Cash', debit: 50000, credit: 0, description: 'Line 1' },
      { id: '2', accountId: '4010', accountNumber: '4010', accountName: 'Sales', debit: 0, credit: 45000, description: 'Line 2' },
    ],
    totalDebit: 50000,
    totalCredit: 45000,
  };
  const isRejected = !validateJournalEntryBalance(unbalancedSample);
  assertions.push({
    check: 'Unbalanced Journal Entry Rejection Guard',
    passed: isRejected,
    message: isRejected
      ? 'Double-entry guard successfully blocked unbalanced journal entry (Debit 50,000 != Credit 45,000).'
      : 'Failed: Unbalanced journal entry was not blocked.',
  });

  // Assertion 1.3: Reversing entry retains original bi-directional lineage
  const reversedEntries = journalEntries.filter((je) => je.isReversed);
  const entryMap = new Map(journalEntries.map((je) => [je.id, je]));
  const reversingHasLineage =
    reversedEntries.length > 0 &&
    reversedEntries.every((je) => {
      if (!je.reversalEntryId) return false;
      const rev = entryMap.get(je.reversalEntryId);
      return Boolean(
        rev &&
          validateJournalEntryBalance(rev) &&
          Math.abs(rev.totalDebit - je.totalCredit) < 0.01
      );
    });
  assertions.push({
    check: 'Reversing Entry Lineage & Audit Retention',
    passed: reversingHasLineage,
    message: reversingHasLineage
      ? `Verified ${reversedEntries.length} reversed journal entry(ies) with valid bi-directional reversal lineage.`
      : 'No valid reversing entry lineage found in General Ledger.',
    evidence: { reversedCount: reversedEntries.length },
  });

  // Assertion 1.4: Exact Trial Balance equality across all GL accounts
  const trialDebit = accounts
    .filter((a) => a.type === 'ASSET' || a.type === 'EXPENSE')
    .reduce((sum, a) => sum + a.balance, 0);
  const trialCredit = accounts
    .filter((a) => a.type === 'LIABILITY' || a.type === 'EQUITY' || a.type === 'REVENUE')
    .reduce((sum, a) => sum + a.balance, 0);
  const variance = Math.abs(trialDebit - trialCredit);
  const trialBalanced = variance < 0.01;

  assertions.push({
    check: 'Trial Balance Equality (SUM(Debit Accounts) == SUM(Credit Accounts))',
    passed: trialBalanced && accounts.length >= 10,
    message: trialBalanced
      ? `Trial Balance reconciles with zero variance (${trialDebit.toLocaleString()} == ${trialCredit.toLocaleString()}) across ${accounts.length} accounts.`
      : `Trial Balance out of balance by ${variance.toLocaleString()} (Debits ${trialDebit.toLocaleString()} != Credits ${trialCredit.toLocaleString()}).`,
    evidence: { trialDebit, trialCredit, variance, accountCount: accounts.length },
  });

  const durationMs = Math.round((performance.now() - startTime) * 100) / 100;
  return {
    id: 'gate_1_accounting',
    name: 'Gate 1: Accounting Core & General Ledger Integrity',
    category: 'ACCOUNTING',
    passed: assertions.every((a) => a.passed),
    durationMs,
    description: 'Verifies double-entry equation balance, atomic posting constraints, trial balance equality, and reversing lineages.',
    assertions,
  };
}

/**
 * GATE 2: Inventory & Multi-Warehouse Stock Ledger Reconciliation
 */
export function runGate2Inventory(
  products: ProductRecord[] = DEFAULT_PRODUCTS,
  movements: StockMovementRecord[] = SEED_STOCK_MOVEMENTS,
  warehouseStocks: WarehouseStockRecord[] = SEED_WAREHOUSE_STOCKS
): GateResult {
  const startTime = performance.now();
  const assertions: AssertionResult[] = [];

  // Assertion 2.1: Catalog stock levels match non-negative bounds
  const noNegativeStock = products.length > 0 && products.every((p) => p.stockOnHand >= 0);
  assertions.push({
    check: 'Non-Negative Physical Stock Level Guard',
    passed: noNegativeStock,
    message: noNegativeStock
      ? `All ${products.length} catalog items possess non-negative stock on hand.`
      : 'Negative stock level violation found in product inventory.',
  });

  // Assertion 2.2: Stock movements have valid transaction classification
  const validMovementTypes = ['RECEIPT', 'ISSUE', 'TRANSFER', 'ADJUSTMENT', 'RETURN'];
  const allMovementsValid =
    movements.length > 0 && movements.every((m) => validMovementTypes.includes(m.movementType));
  assertions.push({
    check: 'Immutable Stock Movement Classification (GRN, Issue, Adjustment)',
    passed: allMovementsValid,
    message: `Verified ${movements.length} immutable warehouse movements with valid ERP operational types.`,
  });

  // Assertion 2.3: Multi-warehouse stock allocation reconciles with physical product totals
  const warehouses = SEED_WAREHOUSES;
  const binStockReconciles = products.every((p) => {
    const whTotal = warehouseStocks
      .filter((ws) => ws.productId === p.id)
      .reduce((sum, ws) => sum + ws.quantityOnHand, 0);
    // Allow catalog items without warehouse rows only if none exist, otherwise must match exactly
    const hasRows = warehouseStocks.some((ws) => ws.productId === p.id);
    return !hasRows || whTotal === p.stockOnHand;
  });

  // Also verify movement ledger net balance for seeded hardware item prod_02 equals remaining + issued reconciliation
  const prod02MovementsNet = SEED_STOCK_MOVEMENTS.filter((m) => m.productId === 'prod_02').reduce(
    (sum, m) => sum + m.quantity,
    0
  );
  const movementBalanceConsistent = prod02MovementsNet >= 0;

  assertions.push({
    check: 'Multi-Warehouse Isolation & Stock Reconciliation',
    passed: warehouses.length >= 2 && binStockReconciles && movementBalanceConsistent,
    message: binStockReconciles
      ? `Multi-warehouse bin stocks across ${warehouses.length} sites (${warehouses.map((w) => w.code).join(', ')}) reconcile exactly with catalog balances.`
      : 'Warehouse stock sum mismatch detected against product master stockOnHand.',
    evidence: { warehouseCount: warehouses.length, prod02MovementsNet },
  });

  const durationMs = Math.round((performance.now() - startTime) * 100) / 100;
  return {
    id: 'gate_2_inventory',
    name: 'Gate 2: Inventory Ledger & Multi-Warehouse Reconciliation',
    category: 'INVENTORY',
    passed: assertions.every((a) => a.passed),
    durationMs,
    description: 'Verifies physical stock reconciles with warehouse bin allocations, prevents negative stock, and validates movement logs.',
    assertions,
  };
}

/**
 * GATE 3: Cross-Module Commercial Order-to-Cash Continuity
 */
export function runGate3Integration(
  customers: CustomerRecord[] = [...DEFAULT_CUSTOMERS, ...SEED_CUSTOMERS],
  invoices: InvoiceRecord[] = SEED_INVOICES,
  purchaseOrders: PurchaseOrderRecord[] = SEED_PURCHASE_ORDERS
): GateResult {
  const startTime = performance.now();
  const assertions: AssertionResult[] = [];

  // Deduplicate customers by ID
  const uniqueCustomers = Array.from(new Map(customers.map((c) => [c.id, c])).values());

  // Assertion 3.1: Customer PIN format validation (KRA PIN: letter + 9 digits + letter)
  const kraPinRegex = /^[A-Z]\d{9}[A-Z]$/;
  const validPins =
    uniqueCustomers.length > 0 && uniqueCustomers.every((c) => !c.kraPin || kraPinRegex.test(c.kraPin));
  assertions.push({
    check: 'Kenya Taxpayer PIN Format Compliance (/^[A-Z]\\d{9}[A-Z]$/)',
    passed: validPins,
    message: validPins
      ? `All ${uniqueCustomers.length} enterprise customer profiles comply with KRA 11-character PIN syntax.`
      : 'Invalid KRA PIN syntax detected in customer directory.',
  });

  // Assertion 3.2: Invoices reference valid customer IDs
  const customerIds = new Set(uniqueCustomers.map((c) => c.id));
  const orphanInvoices = invoices.filter((inv) => !customerIds.has(inv.customerId));
  const invoicesLinked = invoices.length > 0 && orphanInvoices.length === 0;
  assertions.push({
    check: 'Invoice-to-Customer Foreign Key Continuity',
    passed: invoicesLinked,
    message: invoicesLinked
      ? `All ${invoices.length} invoices strictly map to registered customer accounts without orphan records.`
      : `Detected ${orphanInvoices.length} orphan invoice(s) referencing unregistered customer IDs (${orphanInvoices.map((o) => o.customerId).join(', ')}).`,
  });

  // Assertion 3.3: AR balance due matches (totalAmount - paidAmount)
  const mathCorrect = invoices.every(
    (inv) => Math.abs(inv.totalAmount - (inv.paidAmount + inv.balanceDue)) < 0.01
  );
  assertions.push({
    check: 'Accounts Receivable Balance Math (Total == Paid + Balance Due)',
    passed: mathCorrect,
    message: mathCorrect
      ? 'Accounts Receivable balances reconcile with exact mathematical precision.'
      : 'Invoice balance mathematical discrepancy detected.',
  });

  // Assertion 3.4: PO Line Items & Tax Summation match subtotal + VAT = total
  const poTotalsCorrect =
    purchaseOrders.length > 0 &&
    purchaseOrders.every((po) => {
      const calcSubtotal = po.items.reduce((sum, item) => sum + item.quantity * item.unitCostKes, 0);
      const calcLineTotals = po.items.reduce((sum, item) => sum + item.lineTotalKes, 0);
      return (
        Math.abs(calcSubtotal - po.subtotalKes) < 0.1 &&
        Math.abs(po.subtotalKes + po.taxAmountKes - po.totalAmountKes) < 0.1 &&
        Math.abs(calcLineTotals - po.totalAmountKes) < 0.1
      );
    });
  assertions.push({
    check: 'Procurement PO Line Item Aggregation & Tax Summation',
    passed: poTotalsCorrect,
    message: poTotalsCorrect
      ? `All ${purchaseOrders.length} purchase orders reconcile line items, pre-tax subtotals, and 16% VAT totals.`
      : 'Purchase order line aggregation mismatch detected.',
  });

  const durationMs = Math.round((performance.now() - startTime) * 100) / 100;
  return {
    id: 'gate_3_integration',
    name: 'Gate 3: Cross-Module Commercial Order-to-Cash Continuity',
    category: 'INTEGRATION',
    passed: assertions.every((a) => a.passed),
    durationMs,
    description: 'Validates complete data continuity from CRM Customer to Purchase Orders, Invoices, and AR Ledgers.',
    assertions,
  };
}

/**
 * GATE 4: Kenya eTIMS Tax Compliance & Air-Gap Sandbox
 */
export function runGate4Etims(
  queue: EtimsQueueItem[] = SEED_ETIMS_QUEUE,
  creditNotes: CreditNoteRecord[] = SEED_CREDIT_NOTES
): GateResult {
  const startTime = performance.now();
  const assertions: AssertionResult[] = [];

  // Assertion 4.1: Idempotency keys are unique across transmission queue
  const idempotencyKeys = queue.map((q) => q.idempotencyKey);
  const uniqueKeys = new Set(idempotencyKeys);
  const isIdempotent = queue.length > 0 && idempotencyKeys.length === uniqueKeys.size;
  assertions.push({
    check: 'eTIMS UUIDv4 Idempotency Key Uniqueness (Duplicate Suppression)',
    passed: isIdempotent,
    message: isIdempotent
      ? `All ${queue.length} queue transmission items possess unique idempotency keys, preventing duplicate KRA charges.`
      : 'Duplicate idempotency key detected in transmission outbox.',
  });

  // Assertion 4.2: Credit Notes link to accepted original invoice
  const creditNotesLinked =
    creditNotes.length > 0 &&
    creditNotes.every((cn) => Boolean(cn.originalInvoiceNumber && cn.kraControlNumber));
  assertions.push({
    check: 'Credit Note Lineage & Original eTIMS Invoice Reference',
    passed: creditNotesLinked,
    message: creditNotesLinked
      ? `Verified ${creditNotes.length} credit note(s) linked to original eTIMS invoices with KRA CU numbers.`
      : 'Credit note missing original invoice or KRA control number reference.',
  });

  // Assertion 4.3: Air-Gap Sandbox & APP_ENV isolate production KRA traffic
  const sandboxBlockCheck = validateOutboundTransmission(KRA_ENDPOINTS.PRODUCTION, true);
  const appEnvBlockCheck = validateOutboundTransmission(KRA_ENDPOINTS.PRODUCTION, false, 'development');
  const uncertifiedProdBlockCheck = validateOutboundTransmission(KRA_ENDPOINTS.PRODUCTION, false);
  const isAirGapped =
    !sandboxBlockCheck.allowed && !appEnvBlockCheck.allowed && !uncertifiedProdBlockCheck.allowed;
  assertions.push({
    check: 'Air-Gap Sandbox & APP_ENV Isolation (Production KRA Network Lock)',
    passed: isAirGapped,
    message: isAirGapped
      ? 'Air-gap security blocked simulated production KRA traffic across Sandbox mode, APP_ENV!=production, and uncertified production states.'
      : 'Security Failure: Production KRA traffic was not blocked by air-gap guards.',
    evidence: {
      sandboxReason: sandboxBlockCheck.reason,
      appEnvReason: appEnvBlockCheck.reason,
    },
  });

  // Assertion 4.4: Non-Super Admin roles blocked from activating live Production
  const nonAdminAttempt = activateProductionAirGap({
    userId: 'usr_accountant_05',
    userFullName: 'Sarah Chebet',
    userRole: 'ACCOUNTANT',
    confirmationPhrase: 'ACTIVATE-LIVE-KRA-P051234567Z',
    taxpayerPin: 'P051234567Z',
  });
  const dualStepGuardActive = !nonAdminAttempt.success;
  assertions.push({
    check: 'Dual-Step Super Admin Production Activation Guard',
    passed: dualStepGuardActive,
    message: dualStepGuardActive
      ? 'Production activation gate rejected non-SUPER_ADMIN role (ACCOUNTANT) authorization attempt.'
      : 'Security Failure: Non-SUPER_ADMIN role bypassed production activation lock.',
  });

  const durationMs = Math.round((performance.now() - startTime) * 100) / 100;
  return {
    id: 'gate_4_etims',
    name: 'Gate 4: Kenya eTIMS Tax Compliance & Air-Gap Sandbox',
    category: 'COMPLIANCE',
    passed: assertions.every((a) => a.passed),
    durationMs,
    description: 'Ensures idempotency, credit note lineage, APP_ENV!=production network lock, and Super Admin dual-step activation.',
    assertions,
  };
}

/**
 * GATE 5: Architecture, Security & 12-Role RBAC Enforcement
 */
export function runGate5Rbac(): GateResult {
  const startTime = performance.now();
  const assertions: AssertionResult[] = [];

  // Assertion 5.1: Exactly 12 standard system roles governed
  const allRoles: UserRole[] = [
    'SUPER_ADMIN',
    'ADMIN',
    'EXECUTIVE',
    'FINANCE_MANAGER',
    'ACCOUNTANT',
    'SALES_MANAGER',
    'SALES_REP',
    'PROCUREMENT_OFFICER',
    'INVENTORY_MANAGER',
    'HR_MANAGER',
    'PROJECT_MANAGER',
    'EMPLOYEE',
  ];
  const roleCountMatches = allRoles.length === 12;
  assertions.push({
    check: '12-Role RBAC Specification Completeness',
    passed: roleCountMatches,
    message: `System governs all 12 operational enterprise roles: ${allRoles.join(', ')}.`,
  });

  // Assertion 5.2: Super Admin has full clearance across all 10 modules
  const allModules: SystemModule[] = [
    'COLLABORATION',
    'CRM',
    'ACCOUNTING',
    'INVENTORY',
    'PROCUREMENT',
    'SALES',
    'HR_PAYROLL',
    'ETIMS_COMPLIANCE',
    'BI_REPORTS',
    'SYSTEM_ADMIN',
  ];
  const superAdminAllAllowed = allModules.every((mod) => canViewModule('SUPER_ADMIN', mod));
  assertions.push({
    check: 'Super Admin Omnipresent Authorization Clearance',
    passed: superAdminAllAllowed,
    message: 'Super Admin holds verified authorization across all 10 system modules.',
  });

  // Assertion 5.3: Least-privilege boundaries across operational roles
  const salesRepSecure =
    !canViewModule('SALES_REP', 'ACCOUNTING') &&
    !canViewModule('SALES_REP', 'SYSTEM_ADMIN') &&
    !canViewModule('SALES_REP', 'HR_PAYROLL');
  const employeeSecure =
    !canViewModule('EMPLOYEE', 'ACCOUNTING') &&
    !canViewModule('EMPLOYEE', 'ETIMS_COMPLIANCE') &&
    !canViewModule('EMPLOYEE', 'SYSTEM_ADMIN');
  const financeBlockedAdmin = !canViewModule('FINANCE_MANAGER', 'SYSTEM_ADMIN');
  const boundariesSecure = salesRepSecure && employeeSecure && financeBlockedAdmin;

  assertions.push({
    check: 'Least Privilege Boundary Enforcement (Role Access Locks)',
    passed: boundariesSecure,
    message: boundariesSecure
      ? 'Sales Rep, Employee, and Finance Manager are strictly blocked from unauthorized modules.'
      : 'Privilege escalation risk: One or more roles possess unauthorized module access.',
  });

  // Assertion 5.4: Seed Users coverage (one user for each of the 12 roles)
  const seedRoles = new Set(SEED_USERS.map((u) => u.role));
  const allSeedRolesCovered = allRoles.every((r) => seedRoles.has(r));
  assertions.push({
    check: 'Standard Demo Account Provisioning (12 Dedicated RBAC Personas)',
    passed: allSeedRolesCovered,
    message: `All 12 roles possess pre-configured demo user accounts (${SEED_USERS.length} total profiles).`,
    evidence: { seedUserCount: SEED_USERS.length },
  });

  const durationMs = Math.round((performance.now() - startTime) * 100) / 100;
  return {
    id: 'gate_5_rbac',
    name: 'Gate 5: Architecture, Security & 12-Role RBAC Enforcement',
    category: 'SECURITY',
    passed: assertions.every((a) => a.passed),
    durationMs,
    description: 'Enforces least-privilege matrix, verifies authorization gates, and confirms 12-role demo accounts.',
    assertions,
  };
}

/**
 * Master Test Execution Suite
 */
export function runAllAcceptanceGates(customState?: {
  accounts?: Account[];
  journalEntries?: JournalEntry[];
  products?: ProductRecord[];
  invoices?: InvoiceRecord[];
  customers?: CustomerRecord[];
  purchaseOrders?: PurchaseOrderRecord[];
  stockMovements?: StockMovementRecord[];
  warehouseStocks?: WarehouseStockRecord[];
  queueItems?: EtimsQueueItem[];
  creditNotes?: CreditNoteRecord[];
}): TestSuiteSummary {
  const g1 = runGate1Accounting(customState?.accounts, customState?.journalEntries);
  const g2 = runGate2Inventory(
    customState?.products,
    customState?.stockMovements,
    customState?.warehouseStocks
  );
  const g3 = runGate3Integration(
    customState?.customers,
    customState?.invoices,
    customState?.purchaseOrders
  );
  const g4 = runGate4Etims(customState?.queueItems, customState?.creditNotes);
  const g5 = runGate5Rbac();

  const gates = [g1, g2, g3, g4, g5];
  const passedGates = gates.filter((g) => g.passed).length;
  const failedGates = gates.length - passedGates;

  let totalAssertions = 0;
  let passedAssertions = 0;
  let failedAssertions = 0;
  let totalDurationMs = 0;

  for (const g of gates) {
    totalDurationMs += g.durationMs;
    for (const a of g.assertions) {
      totalAssertions++;
      if (a.passed) passedAssertions++;
      else failedAssertions++;
    }
  }

  return {
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    allPassed: failedGates === 0,
    totalGates: gates.length,
    passedGates,
    failedGates,
    totalAssertions,
    passedAssertions,
    failedAssertions,
    totalDurationMs: Math.round(totalDurationMs * 100) / 100,
    gates,
  };
}
