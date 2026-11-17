/**
 * INNOWIT ONE WORKSPACE — DEMO WORKSPACE SEEDING & RESET SERVICE
 * Populates and resets all operational module stores to verified baseline seed data.
 *
 * @license Apache-2.0
 */

import {
  DEFAULT_ORGANIZATION,
  DEFAULT_BRANCHES,
  DEFAULT_ACCOUNTS,
  DEFAULT_JOURNAL_ENTRIES,
  DEFAULT_ETIMS_RECORDS,
  DEFAULT_PRODUCTS,
  SEED_USERS,
} from '@/data/kernel';
import { SEED_INVOICES } from '@/data/accountingSeed';
import { SEED_CUSTOMERS, SEED_DEALS, SEED_TASKS, SEED_CONTACTS, SEED_SALES_REPS, SEED_ACTIVITY_LOGS } from '@/data/crmSeed';
import {
  SEED_WAREHOUSES,
  SEED_WAREHOUSE_STOCKS,
  SEED_STOCK_MOVEMENTS,
  SEED_SUPPLIERS,
  SEED_PURCHASE_ORDERS,
  SEED_GOODS_RECEIPT_NOTES,
  SEED_SUPPLIER_BILLS,
  SEED_SALES_ORDERS,
  SEED_QUOTATIONS,
  SEED_DEPARTMENTS,
  SEED_EMPLOYEES,
  SEED_PAYROLL_RUNS,
  SEED_ATTENDANCE,
  SEED_LEAVE_REQUESTS,
  SEED_FIXED_ASSETS,
  SEED_ERP_PROJECTS,
} from '@/data/erpSeed';
import {
  DEFAULT_ETIMS_CONFIG,
  SEED_ETIMS_QUEUE,
  SEED_CREDIT_NOTES,
} from '@/data/etimsSeed';
import {
  SEED_CHANNELS,
  SEED_MESSAGES,
  SEED_THREAD_REPLIES,
  SEED_WORKSPACE_FILES,
  SEED_SHARED_NOTES,
  SEED_HUDDLE_SESSION,
} from '@/data/collaborationSeed';
import { SEED_AUDIT_LOGS } from '@/modules/audit/store';
import {
  DEFAULT_AUTOMATION_RULES,
  SEED_AUTOMATION_LOGS,
  SEED_NOTIFICATIONS,
} from '@/modules/automation/store';
import { KRA_ENDPOINTS, saveAirGapStatus } from '@/modules/etims/airgap';
import { saveErpState } from '@/modules/erp/store';
import { saveCrmState } from '@/modules/crm/store';
import { saveCollaborationState } from '@/modules/collaboration/store';
import { saveAuditLogs } from '@/modules/audit/store';
import {
  saveAutomationRules,
  saveAutomationLogs,
  saveNotifications,
} from '@/modules/automation/store';

export const WORKSPACE_STORAGE_KEYS = [
  'innowit_erp_v5',
  'innowit_crm_v3',
  'innowit_accounting_v4',
  'innowit_collaboration_v2',
  'innowit_audit_logs_v1',
  'innowit_automation_rules_v1',
  'innowit_automation_logs_v1',
  'innowit_system_notifications_v1',
  'innowit_etims_airgap_v1',
] as const;

export interface SeedManifest {
  timestamp: string;
  organization: string;
  kraPin: string;
  counts: {
    branches: number;
    users: number;
    accounts: number;
    journalEntries: number;
    invoices: number;
    customers: number;
    deals: number;
    products: number;
    warehouses: number;
    suppliers: number;
    purchaseOrders: number;
    employees: number;
    etimsQueueItems: number;
    creditNotes: number;
    channels: number;
    automationRules: number;
    auditLogs: number;
  };
}

export function getSeedManifest(): SeedManifest {
  return {
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    organization: DEFAULT_ORGANIZATION.legalName,
    kraPin: DEFAULT_ORGANIZATION.kraPin,
    counts: {
      branches: DEFAULT_BRANCHES.length,
      users: SEED_USERS.length,
      accounts: DEFAULT_ACCOUNTS.length,
      journalEntries: DEFAULT_JOURNAL_ENTRIES.length,
      invoices: SEED_INVOICES.length,
      customers: SEED_CUSTOMERS.length,
      deals: SEED_DEALS.length,
      products: DEFAULT_PRODUCTS.length,
      warehouses: SEED_WAREHOUSES.length,
      suppliers: SEED_SUPPLIERS.length,
      purchaseOrders: SEED_PURCHASE_ORDERS.length,
      employees: SEED_EMPLOYEES.length,
      etimsQueueItems: SEED_ETIMS_QUEUE.length,
      creditNotes: SEED_CREDIT_NOTES.length,
      channels: SEED_CHANNELS.length,
      automationRules: DEFAULT_AUTOMATION_RULES.length,
      auditLogs: SEED_AUDIT_LOGS.length,
    },
  };
}

export function resetWorkspaceDemoData(): SeedManifest {
  if (typeof localStorage !== 'undefined') {
    for (const key of WORKSPACE_STORAGE_KEYS) {
      localStorage.removeItem(key);
    }
  }

  // Re-populate persisted module stores with verified baseline seed records
  saveErpState({
    warehouses: SEED_WAREHOUSES,
    warehouseStocks: SEED_WAREHOUSE_STOCKS,
    stockMovements: SEED_STOCK_MOVEMENTS,
    suppliers: SEED_SUPPLIERS,
    purchaseOrders: SEED_PURCHASE_ORDERS,
    goodsReceiptNotes: SEED_GOODS_RECEIPT_NOTES,
    supplierBills: SEED_SUPPLIER_BILLS,
    salesOrders: SEED_SALES_ORDERS,
    quotations: SEED_QUOTATIONS,
    departments: SEED_DEPARTMENTS,
    employees: SEED_EMPLOYEES,
    payrollRuns: SEED_PAYROLL_RUNS,
    attendance: SEED_ATTENDANCE,
    leaveRequests: SEED_LEAVE_REQUESTS,
    fixedAssets: SEED_FIXED_ASSETS,
    projects: SEED_ERP_PROJECTS,
  });

  saveCrmState({
    customers: SEED_CUSTOMERS,
    contacts: SEED_CONTACTS,
    deals: SEED_DEALS,
    tasks: SEED_TASKS,
    salesReps: SEED_SALES_REPS,
    activityLogs: SEED_ACTIVITY_LOGS,
  });

  saveCollaborationState({
    channels: SEED_CHANNELS,
    messages: SEED_MESSAGES,
    threadReplies: SEED_THREAD_REPLIES,
    files: SEED_WORKSPACE_FILES,
    notes: SEED_SHARED_NOTES,
    huddle: SEED_HUDDLE_SESSION,
  });

  saveAuditLogs(SEED_AUDIT_LOGS);
  saveAutomationRules(DEFAULT_AUTOMATION_RULES);
  saveAutomationLogs(SEED_AUTOMATION_LOGS);
  saveNotifications(SEED_NOTIFICATIONS);

  saveAirGapStatus({
    isAirGapped: true,
    environment: 'SANDBOX',
    productionTrafficAllowed: false,
    superAdminCertified: false,
    activeEndpointUrl: KRA_ENDPOINTS.SANDBOX,
  });

  return getSeedManifest();
}

export function getBaselineKernelState() {
  return {
    branches: DEFAULT_BRANCHES,
    accounts: DEFAULT_ACCOUNTS,
    journalEntries: DEFAULT_JOURNAL_ENTRIES,
    invoices: SEED_INVOICES,
    etimsRecords: DEFAULT_ETIMS_RECORDS,
    customers: SEED_CUSTOMERS,
    products: DEFAULT_PRODUCTS,
    etimsConfig: DEFAULT_ETIMS_CONFIG,
    etimsQueue: SEED_ETIMS_QUEUE,
    creditNotes: SEED_CREDIT_NOTES,
  };
}
