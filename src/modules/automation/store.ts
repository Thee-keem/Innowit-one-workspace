import {
  AutomationRule,
  AutomationExecutionLog,
  SystemNotification,
  ProductRecord,
  InvoiceRecord,
  DealRecord,
  PurchaseOrderRecord,
  EtimsQueueItem,
  PayrollRunRecord,
  UserSessionPayload,
} from '@/types';
import { logAuditEntry } from '@/modules/audit/store';

const RULES_STORAGE_KEY = 'innowit_automation_rules_v1';
const LOGS_STORAGE_KEY = 'innowit_automation_logs_v1';
const NOTIFICATIONS_STORAGE_KEY = 'innowit_system_notifications_v1';

export const DEFAULT_AUTOMATION_RULES: AutomationRule[] = [
  {
    id: 'rule_stock_reorder',
    name: 'Stock Below Reorder Level Alert',
    description: 'Scans inventory catalog for products whose quantity on hand is less than or equal to reorder threshold, and generates a restock procurement alert.',
    trigger: 'STOCK_BELOW_REORDER',
    triggerLabel: 'Inventory Balance <= Reorder Level',
    conditions: [
      { field: 'quantityOnHand', operator: 'LESS_EQUAL', value: 'reorderLevel' },
    ],
    actionType: 'DRAFT_PURCHASE_REQUISITION',
    actionLabel: 'Draft Restock Requisition & Dispatch Inventory Alert',
    targetRole: 'PROCUREMENT_OFFICER',
    isActive: true,
    executionCount: 14,
    lastExecutedAt: '2026-11-11 08:30:00',
  },
  {
    id: 'rule_invoice_overdue',
    name: '15-Day Overdue Invoice Escalation',
    description: 'Identifies posted customer invoices with outstanding balance overdue past 15 days and initiates finance escalation notices.',
    trigger: 'INVOICE_OVERDUE_15D',
    triggerLabel: 'Due Date Passed > 15 Days & Balance > 0',
    conditions: [
      { field: 'daysPastDue', operator: 'GREATER_THAN', value: 15 },
      { field: 'balanceDueKes', operator: 'GREATER_THAN', value: 0 },
    ],
    actionType: 'FLAG_HIGH_PRIORITY_TASK',
    actionLabel: 'Create High-Priority AR Debt Collection Task',
    targetRole: 'FINANCE_MANAGER',
    isActive: true,
    executionCount: 8,
    lastExecutedAt: '2026-11-10 14:15:22',
  },
  {
    id: 'rule_deal_negotiation',
    name: 'High-Value Deal Negotiation Review',
    description: 'Detects enterprise sales opportunities entering Negotiation stage with valuation exceeding KES 1,000,000 for executive pricing authorization.',
    trigger: 'DEAL_MOVED_NEGOTIATION',
    triggerLabel: 'Stage == Negotiation & Deal Value >= 1,000,000',
    conditions: [
      { field: 'stage', operator: 'EQUALS', value: 'Negotiation' },
      { field: 'valueKes', operator: 'GREATER_THAN', value: 1000000 },
    ],
    actionType: 'ESCALATE_TO_EXECUTIVE',
    actionLabel: 'Notify Executive & Sales Director for Pricing Approval',
    targetRole: 'EXECUTIVE',
    isActive: true,
    executionCount: 5,
    lastExecutedAt: '2026-11-09 11:00:10',
  },
  {
    id: 'rule_po_approval_gate',
    name: 'PO Capital Expenditure Approval Gate',
    description: 'Requires multi-tier executive approval for any procurement purchase order exceeding KES 250,000.',
    trigger: 'PO_AWAITING_APPROVAL',
    triggerLabel: 'PO Status == PENDING & Total >= KES 250,000',
    conditions: [
      { field: 'status', operator: 'EQUALS', value: 'PENDING' },
      { field: 'totalKes', operator: 'GREATER_THAN', value: 250000 },
    ],
    actionType: 'IN_APP_NOTIFICATION',
    actionLabel: 'Dispatch Fast-Track Approval Prompt to Finance Manager',
    targetRole: 'FINANCE_MANAGER',
    isActive: true,
    executionCount: 11,
    lastExecutedAt: '2026-11-08 17:20:45',
  },
  {
    id: 'rule_etims_failure',
    name: 'eTIMS Transmission Retry Alert',
    description: 'Alerts compliance officer when a KRA eTIMS transmission fails or reaches 3+ retry attempts in outbox queue.',
    trigger: 'ETIMS_TRANSMISSION_FAILED',
    triggerLabel: 'Transmission Attempts >= 3 or Status == REJECTED',
    conditions: [
      { field: 'attemptCount', operator: 'GREATER_THAN', value: 2 },
    ],
    actionType: 'IN_APP_NOTIFICATION',
    actionLabel: 'Dispatch Urgent Fiscal Compliance Attention Alert',
    targetRole: 'SUPER_ADMIN',
    isActive: true,
    executionCount: 3,
    lastExecutedAt: '2026-11-07 10:45:00',
  },
  {
    id: 'rule_payroll_readiness',
    name: 'Statutory Payroll Monthly Audit',
    description: 'Ensures current period payroll calculations are locked and statutory deductions (PAYE, NSSF, SHIF, Housing Levy) reconcile before cutoff.',
    trigger: 'PAYROLL_PENDING_APPROVAL',
    triggerLabel: 'Payroll Run == DRAFT & Month End Nearing',
    conditions: [
      { field: 'status', operator: 'EQUALS', value: 'DRAFT' },
    ],
    actionType: 'EMAIL_DISPATCH',
    actionLabel: 'Send Monthly Payroll Variance Report to HR & Finance',
    targetRole: 'HR_MANAGER',
    isActive: true,
    executionCount: 2,
    lastExecutedAt: '2026-11-05 09:00:00',
  },
];

export const SEED_AUTOMATION_LOGS: AutomationExecutionLog[] = [
  {
    id: 'exec-log-005',
    ruleId: 'rule_stock_reorder',
    ruleName: 'Stock Below Reorder Level Alert',
    trigger: 'STOCK_BELOW_REORDER',
    executedAt: '2026-11-11 08:30:00',
    executedBy: 'SYSTEM_CRON_SCANNER',
    status: 'WARNING',
    matchedEntityCount: 2,
    details: 'Detected 2 inventory products below threshold: "Enterprise Core Router (4 units <= 5)" and "Cat6A Shielded Cable (8 reels <= 10)".',
    actionSummary: 'Drafted 2 procurement requisitions and alerted Procurement Officer.',
  },
  {
    id: 'exec-log-004',
    ruleId: 'rule_invoice_overdue',
    ruleName: '15-Day Overdue Invoice Escalation',
    trigger: 'INVOICE_OVERDUE_15D',
    executedAt: '2026-11-10 14:15:22',
    executedBy: 'SYSTEM_CRON_SCANNER',
    status: 'SUCCESS',
    matchedEntityCount: 1,
    details: 'Invoice INV-2026-004 (Twiga Foods) has outstanding balance of KES 1,856,000.00 overdue by 18 days.',
    actionSummary: 'Logged priority collection task and sent debtor follow-up reminder.',
  },
  {
    id: 'exec-log-003',
    ruleId: 'rule_deal_negotiation',
    ruleName: 'High-Value Deal Negotiation Review',
    trigger: 'DEAL_MOVED_NEGOTIATION',
    executedAt: '2026-11-09 11:00:10',
    executedBy: 'Dr. David Kiprop (SUPER_ADMIN)',
    status: 'SUCCESS',
    matchedEntityCount: 1,
    details: 'Deal "Core Banking SD-WAN Mesh" (Equity Bank, KES 5,400,000) reached Negotiation stage.',
    actionSummary: 'Dispatched executive pricing notification to Executive and Sales Director.',
  },
  {
    id: 'exec-log-002',
    ruleId: 'rule_po_approval_gate',
    ruleName: 'PO Capital Expenditure Approval Gate',
    trigger: 'PO_AWAITING_APPROVAL',
    executedAt: '2026-11-08 17:20:45',
    executedBy: 'SYSTEM_CRON_SCANNER',
    status: 'SUCCESS',
    matchedEntityCount: 1,
    details: 'PO-2026-002 (KES 680,000.00) pending sign-off.',
    actionSummary: 'Notified Finance Manager for dual-authorization approval.',
  },
  {
    id: 'exec-log-001',
    ruleId: 'rule_etims_failure',
    ruleName: 'eTIMS Transmission Retry Alert',
    trigger: 'ETIMS_TRANSMISSION_FAILED',
    executedAt: '2026-11-07 10:45:00',
    executedBy: 'SYSTEM_CRON_SCANNER',
    status: 'SKIPPED',
    matchedEntityCount: 0,
    details: 'Queue health check completed. All pending items within normal retry intervals.',
    actionSummary: 'No stalled items found; 0 alerts triggered.',
  },
];

export const SEED_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-001',
    title: 'Low Stock Reorder Alert',
    message: '2 products have dropped below safety thresholds (Enterprise Core Router & Cat6A Cable). Procurement draft created.',
    type: 'WARNING',
    source: 'AUTOMATION',
    timestamp: '25m ago',
    read: false,
    linkHref: '/inventory/products',
  },
  {
    id: 'notif-002',
    title: 'Overdue Invoice Escalation',
    message: 'Invoice INV-2026-004 for Twiga Foods (KES 1,856,000.00) is past due by 18 days.',
    type: 'ALERT',
    source: 'AUTOMATION',
    timestamp: '2h ago',
    read: false,
    linkHref: '/accounting/invoices',
  },
  {
    id: 'notif-003',
    title: 'High-Value Deal Under Negotiation',
    message: 'Equity Bank Core Banking SD-WAN (KES 5,400,000) escalated for Executive pricing review.',
    type: 'INFO',
    source: 'AUTOMATION',
    timestamp: 'Yesterday',
    read: true,
    linkHref: '/crm/deals',
  },
  {
    id: 'notif-004',
    title: 'eTIMS Sandbox Active',
    message: 'Innowit One Workspace is operating in KRA OSCU Sandbox air-gap test mode.',
    type: 'SUCCESS',
    source: 'ETIMS',
    timestamp: '3d ago',
    read: true,
    linkHref: '/etims/configuration',
  },
];

export function loadAutomationRules(): AutomationRule[] {
  try {
    const raw = localStorage.getItem(RULES_STORAGE_KEY);
    if (!raw) {
      saveAutomationRules(DEFAULT_AUTOMATION_RULES);
      return DEFAULT_AUTOMATION_RULES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_AUTOMATION_RULES;
  }
}

export function saveAutomationRules(rules: AutomationRule[]): void {
  try {
    localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(rules));
  } catch (err) {
    console.error('Failed to save automation rules:', err);
  }
}

export function loadAutomationLogs(): AutomationExecutionLog[] {
  try {
    const raw = localStorage.getItem(LOGS_STORAGE_KEY);
    if (!raw) {
      saveAutomationLogs(SEED_AUTOMATION_LOGS);
      return SEED_AUTOMATION_LOGS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_AUTOMATION_LOGS;
  }
}

export function saveAutomationLogs(logs: AutomationExecutionLog[]): void {
  try {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to save automation logs:', err);
  }
}

export function loadNotifications(): SystemNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) {
      saveNotifications(SEED_NOTIFICATIONS);
      return SEED_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_NOTIFICATIONS;
  }
}

export function saveNotifications(notifs: SystemNotification[]): void {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
  } catch (err) {
    console.error('Failed to save notifications:', err);
  }
}

export interface AutomationEvaluationContext {
  products: ProductRecord[];
  invoices: InvoiceRecord[];
  deals: DealRecord[];
  purchaseOrders: PurchaseOrderRecord[];
  etimsQueue: EtimsQueueItem[];
  payrollRuns: PayrollRunRecord[];
  currentUser: UserSessionPayload;
}

export interface AutomationRunResult {
  logs: AutomationExecutionLog[];
  newNotifications: SystemNotification[];
  matchedRulesCount: number;
}

export function executeAutomationsEngine(
  context: AutomationEvaluationContext
): AutomationRunResult {
  const rules = loadAutomationRules();
  const currentLogs = loadAutomationLogs();
  const currentNotifs = loadNotifications();
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

  const newLogs: AutomationExecutionLog[] = [];
  const newNotifs: SystemNotification[] = [];
  let matchedCount = 0;

  const updatedRules = rules.map((rule) => {
    if (!rule.isActive) return rule;

    let matchedItems: any[] = [];
    let logStatus: AutomationExecutionLog['status'] = 'SKIPPED';
    let details = '';
    let actionSummary = '';

    switch (rule.trigger) {
      case 'STOCK_BELOW_REORDER': {
        matchedItems = context.products.filter(
          (p) => p.stockOnHand <= (p.reorderLevel || 10)
        );
        if (matchedItems.length > 0) {
          logStatus = 'WARNING';
          matchedCount++;
          const names = matchedItems.map((p) => `${p.name} (${p.stockOnHand}/${p.reorderLevel || 10})`).join(', ');
          details = `Identified ${matchedItems.length} product(s) below reorder threshold: ${names}`;
          actionSummary = `Auto-drafted purchase requisition and dispatched alert to ${rule.targetRole}.`;

          newNotifs.push({
            id: `notif-auto-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            title: `Low Stock Alert (${matchedItems.length} Items)`,
            message: `${matchedItems.length} products have reached reorder thresholds: ${names}.`,
            type: 'WARNING',
            source: 'AUTOMATION',
            timestamp: 'Just now',
            read: false,
            linkHref: '/inventory/products',
          });
        } else {
          details = 'Catalog scan complete. All inventory levels above safety thresholds.';
          actionSummary = 'No restock required.';
        }
        break;
      }

      case 'INVOICE_OVERDUE_15D': {
        const today = new Date();
        matchedItems = context.invoices.filter((inv) => {
          if (inv.status !== 'POSTED' || inv.balanceDue <= 0) return false;
          const due = new Date(inv.dueDate);
          const diffDays = Math.floor((today.getTime() - due.getTime()) / (1000 * 3600 * 24));
          return diffDays > 15;
        });

        if (matchedItems.length > 0) {
          logStatus = 'WARNING';
          matchedCount++;
          const invNums = matchedItems.map((inv) => `${inv.invoiceNumber} (${inv.customerName})`).join(', ');
          details = `Identified ${matchedItems.length} overdue invoice(s) >15 days past due: ${invNums}`;
          actionSummary = `Created high-priority AR collection task and drafted debtor reminders.`;

          newNotifs.push({
            id: `notif-auto-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            title: `Overdue Invoices Alert (${matchedItems.length})`,
            message: `${matchedItems.length} posted invoices are >15 days overdue: ${invNums}.`,
            type: 'ALERT',
            source: 'AUTOMATION',
            timestamp: 'Just now',
            read: false,
            linkHref: '/accounting/invoices',
          });
        } else {
          details = 'Accounts Receivable review complete. No invoices currently exceeding 15 days past due.';
          actionSummary = 'No action needed.';
        }
        break;
      }

      case 'DEAL_MOVED_NEGOTIATION': {
        matchedItems = context.deals.filter(
          (d) => d.stage === 'NEGOTIATION' && d.value >= 1000000
        );
        if (matchedItems.length > 0) {
          logStatus = 'SUCCESS';
          matchedCount++;
          const dealNames = matchedItems.map((d) => `${d.title} (KES ${d.value.toLocaleString()})`).join(', ');
          details = `Found ${matchedItems.length} high-value deal(s) in Negotiation: ${dealNames}`;
          actionSummary = `Dispatched Executive pricing notification to ${rule.targetRole}.`;

          newNotifs.push({
            id: `notif-auto-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            title: 'High-Value Deal Escalation',
            message: `${matchedItems.length} deals in Negotiation exceed KES 1M: ${dealNames}.`,
            type: 'INFO',
            source: 'AUTOMATION',
            timestamp: 'Just now',
            read: false,
            linkHref: '/crm/deals',
          });
        } else {
          details = 'Pipeline scan completed. No active negotiation deals exceeding KES 1,000,000.';
          actionSummary = 'No notifications needed.';
        }
        break;
      }

      case 'PO_AWAITING_APPROVAL': {
        matchedItems = context.purchaseOrders.filter(
          (po) => po.status === 'PENDING_APPROVAL' && po.totalAmountKes >= 250000
        );
        if (matchedItems.length > 0) {
          logStatus = 'WARNING';
          matchedCount++;
          const poNums = matchedItems.map((po) => `${po.poNumber} (KES ${po.totalAmountKes.toLocaleString()})`).join(', ');
          details = `Identified ${matchedItems.length} PO(s) awaiting approval above KES 250,000: ${poNums}`;
          actionSummary = `Sent approval prompt to ${rule.targetRole}.`;

          newNotifs.push({
            id: `notif-auto-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            title: 'PO Pending Approval',
            message: `${matchedItems.length} purchase order(s) require sign-off: ${poNums}.`,
            type: 'WARNING',
            source: 'AUTOMATION',
            timestamp: 'Just now',
            read: false,
            linkHref: '/procurement/purchase-orders',
          });
        } else {
          details = 'Procurement review complete. No large POs currently pending approval.';
          actionSummary = 'No action required.';
        }
        break;
      }

      case 'ETIMS_TRANSMISSION_FAILED': {
        matchedItems = context.etimsQueue.filter(
          (item) => item.attemptCount >= 3 || item.status === 'REJECTED'
        );
        if (matchedItems.length > 0) {
          logStatus = 'ALERT' as any;
          matchedCount++;
          details = `Identified ${matchedItems.length} stalled or rejected eTIMS transmission(s).`;
          actionSummary = 'Dispatched high-priority fiscal compliance alert.';

          newNotifs.push({
            id: `notif-auto-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            title: 'eTIMS Outbox Stalled',
            message: `${matchedItems.length} eTIMS invoices require tax officer intervention.`,
            type: 'ALERT',
            source: 'ETIMS',
            timestamp: 'Just now',
            read: false,
            linkHref: '/etims/queue',
          });
        } else {
          details = 'eTIMS outbox healthy. All pending queue items within expected thresholds.';
          actionSummary = 'Queue running smoothly.';
        }
        break;
      }

      case 'PAYROLL_PENDING_APPROVAL': {
        matchedItems = context.payrollRuns.filter((r) => r.status === 'DRAFT');
        if (matchedItems.length > 0) {
          logStatus = 'WARNING';
          matchedCount++;
          const periods = matchedItems.map((r) => r.periodLabel).join(', ');
          details = `${matchedItems.length} payroll run(s) are in DRAFT status: ${periods}`;
          actionSummary = 'Sent payroll cutoff reminder to HR and Finance teams.';

          newNotifs.push({
            id: `notif-auto-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            title: 'Payroll Run Pending Approval',
            message: `Payroll run for ${periods} is awaiting review and GL posting.`,
            type: 'INFO',
            source: 'FINANCE',
            timestamp: 'Just now',
            read: false,
            linkHref: '/hr/payroll',
          });
        } else {
          details = 'Payroll check complete. No draft runs pending.';
          actionSummary = 'Payroll runs up to date.';
        }
        break;
      }
    }

    const logEntry: AutomationExecutionLog = {
      id: `exec-log-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      ruleId: rule.id,
      ruleName: rule.name,
      trigger: rule.trigger,
      executedAt: timestamp,
      executedBy: `${context.currentUser.fullName} (${context.currentUser.role})`,
      status: logStatus,
      matchedEntityCount: matchedItems.length,
      details,
      actionSummary,
    };
    newLogs.push(logEntry);

    return {
      ...rule,
      executionCount: rule.executionCount + 1,
      lastExecutedAt: timestamp,
    };
  });

  // Save updated rules, logs, notifications
  saveAutomationRules(updatedRules);
  const combinedLogs = [...newLogs, ...currentLogs];
  saveAutomationLogs(combinedLogs);
  const combinedNotifs = [...newNotifs, ...currentNotifs];
  saveNotifications(combinedNotifs);

  // Write audit trail entry
  logAuditEntry({
    userId: context.currentUser.userId,
    userFullName: context.currentUser.fullName,
    userRole: context.currentUser.role,
    action: 'TRIGGER_AUTOMATION',
    entityType: 'AutomationRule',
    entityId: 'engine_evaluator',
    entityName: 'Global Automation Engine Sweep',
    changes: {
      rulesEvaluated: rules.length,
      rulesMatched: matchedCount,
      newNotificationsGenerated: newNotifs.length,
      timestamp,
    },
  });

  return {
    logs: combinedLogs,
    newNotifications: combinedNotifs,
    matchedRulesCount: matchedCount,
  };
}
