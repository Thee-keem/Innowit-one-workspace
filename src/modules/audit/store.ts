import { AuditLogRecord, UserRole } from '@/types';

const AUDIT_STORAGE_KEY = 'innowit_audit_logs_v1';

export const SEED_AUDIT_LOGS: AuditLogRecord[] = [
  {
    id: 'audit-log-008',
    userId: 'usr_super_admin',
    userFullName: 'Dr. David Kiprop',
    userRole: 'SUPER_ADMIN',
    action: 'POST_GL',
    entityType: 'PayrollRun',
    entityId: 'pay_run_2026_11',
    entityName: 'November 2026 Payroll Run (KES 3,240,000)',
    changesJson: JSON.stringify({
      before: { status: 'APPROVED', journalEntryId: null },
      after: { status: 'POSTED_TO_GL', journalEntryId: 'je_auto_pay_2026_11' },
      linesPosted: [
        { account: '6010 - Wages & Salaries', debit: 3240000, credit: 0 },
        { account: '2020 - PAYE Tax Payable', debit: 0, credit: 842400 },
        { account: '2030 - NSSF Statutory Payable', debit: 0, credit: 172800 },
        { account: '2040 - SHIF Health Insurance Payable', debit: 0, credit: 89100 },
        { account: '2050 - Housing Levy Payable', debit: 0, credit: 97200 },
        { account: '2060 - Net Salaries Payable', debit: 0, credit: 2038500 },
      ],
      memo: 'November 2026 Payroll Statutory Journal',
    }),
    ipAddress: '192.168.1.10',
    timestamp: '2026-11-10 16:45:22',
  },
  {
    id: 'audit-log-007',
    userId: 'usr_super_admin',
    userFullName: 'Dr. David Kiprop',
    userRole: 'SUPER_ADMIN',
    action: 'TRANSMIT_TAX',
    entityType: 'SalesInvoice',
    entityId: 'inv_2026_001',
    entityName: 'INV-2026-001 (Safaricom PLC)',
    changesJson: JSON.stringify({
      before: { etimsStatus: 'PENDING', kraControlNumber: null },
      after: {
        etimsStatus: 'ACCEPTED',
        kraControlNumber: 'KRAMU010049281',
        internalData: '4c65e8a939f1...b721',
        qrCodeUrl: 'https://itax.kra.go.ke/KRA-Portal/invoiceCheck.htm?inv=KRAMU010049281',
      },
      transmissionMode: 'OSCU_REST_V1',
      ackCode: '00',
    }),
    ipAddress: '192.168.1.10',
    timestamp: '2026-11-09 14:22:04',
  },
  {
    id: 'audit-log-006',
    userId: 'usr_super_admin',
    userFullName: 'Dr. David Kiprop',
    userRole: 'SUPER_ADMIN',
    action: 'APPROVE',
    entityType: 'PurchaseOrder',
    entityId: 'po_2026_001',
    entityName: 'PO-2026-001 (Cisco Systems Kenya)',
    changesJson: JSON.stringify({
      before: { status: 'PENDING_APPROVAL', approvedBy: null },
      after: {
        status: 'APPROVED',
        approvedBy: 'Dr. David Kiprop (SUPER_ADMIN)',
        totalKes: 1450000,
      },
    }),
    ipAddress: '192.168.1.10',
    timestamp: '2026-11-08 11:30:15',
  },
  {
    id: 'audit-log-005',
    userId: 'usr_super_admin',
    userFullName: 'Dr. David Kiprop',
    userRole: 'SUPER_ADMIN',
    action: 'POST_GL',
    entityType: 'StockMovement',
    entityId: 'mov_adj_2026_01',
    entityName: 'Stock Adjustment: Fibre Optic Splicer (+2 units)',
    changesJson: JSON.stringify({
      before: { quantityOnHand: 6 },
      after: { quantityOnHand: 8, costPerUnitKes: 220000 },
      journalEntry: {
        reference: 'ADJ-2026-001',
        debitAccount: '1050 - Inventory Valuation',
        creditAccount: '5020 - Inventory Adjustment Gain/Loss',
        amount: 440000,
      },
    }),
    ipAddress: '192.168.1.10',
    timestamp: '2026-11-06 09:15:40',
  },
  {
    id: 'audit-log-004',
    userId: 'usr_super_admin',
    userFullName: 'Dr. David Kiprop',
    userRole: 'SUPER_ADMIN',
    action: 'POST_GL',
    entityType: 'SalesInvoice',
    entityId: 'inv_2026_002',
    entityName: 'INV-2026-002 (Equity Bank Group)',
    changesJson: JSON.stringify({
      before: { status: 'DRAFT' },
      after: { status: 'POSTED', totalKes: 1856000 },
      journalLines: [
        { account: '1030 - Accounts Receivable', debit: 1856000, credit: 0 },
        { account: '4010 - Enterprise Solution Revenue', debit: 0, credit: 1600000 },
        { account: '2010 - VAT Output Tax Liability (16%)', debit: 0, credit: 256000 },
      ],
    }),
    ipAddress: '192.168.1.10',
    timestamp: '2026-11-05 13:40:11',
  },
  {
    id: 'audit-log-003',
    userId: 'usr_super_admin',
    userFullName: 'Dr. David Kiprop',
    userRole: 'SUPER_ADMIN',
    action: 'CREATE',
    entityType: 'Customer',
    entityId: 'cust_twiga',
    entityName: 'Twiga Foods Kenya Ltd (CUST-003)',
    changesJson: JSON.stringify({
      initial: {
        name: 'Twiga Foods Kenya Ltd',
        kraPin: 'P051345678W',
        creditLimitKes: 8000000,
        paymentTermsDays: 30,
        city: 'Nairobi',
      },
    }),
    ipAddress: '192.168.1.10',
    timestamp: '2026-11-03 10:20:00',
  },
  {
    id: 'audit-log-002',
    userId: 'usr_super_admin',
    userFullName: 'Dr. David Kiprop',
    userRole: 'SUPER_ADMIN',
    action: 'POST_GL',
    entityType: 'JournalEntry',
    entityId: 'je_open_001',
    entityName: 'JE-2026-0001 (Opening Fiscal Balance)',
    changesJson: JSON.stringify({
      status: 'POSTED',
      totalDebit: 45000000,
      totalCredit: 45000000,
      balanceCheck: 'BALANCED_OK',
    }),
    ipAddress: '192.168.1.10',
    timestamp: '2026-11-01 08:00:00',
  },
  {
    id: 'audit-log-001',
    userId: 'usr_super_admin',
    userFullName: 'Dr. David Kiprop',
    userRole: 'SUPER_ADMIN',
    action: 'CREATE',
    entityType: 'EtimsConfiguration',
    entityId: 'cfg_etims_default',
    entityName: 'eTIMS Taxpayer & Device Setup',
    changesJson: JSON.stringify({
      taxpayerPin: 'P051234567Z',
      branchCode: '00',
      deviceSerial: 'INW-VSCU-2026-001',
      mode: 'OSCU_REST_V1',
      environment: 'SANDBOX',
    }),
    ipAddress: '192.168.1.10',
    timestamp: '2026-11-01 07:45:12',
  },
];

export function loadAuditLogs(): AuditLogRecord[] {
  try {
    if (typeof localStorage === 'undefined') {
      return SEED_AUDIT_LOGS;
    }
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (!raw) {
      saveAuditLogs(SEED_AUDIT_LOGS);
      return SEED_AUDIT_LOGS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_AUDIT_LOGS;
  }
}

export function saveAuditLogs(logs: AuditLogRecord[]): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to save audit logs to localStorage:', err);
  }
}

export function logAuditEntry(params: {
  userId: string;
  userFullName: string;
  userRole: UserRole;
  action: AuditLogRecord['action'];
  entityType: AuditLogRecord['entityType'];
  entityId: string;
  entityName?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
}): AuditLogRecord {
  const currentLogs = loadAuditLogs();
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

  const newEntry: AuditLogRecord = {
    id: `audit-log-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    userId: params.userId,
    userFullName: params.userFullName,
    userRole: params.userRole,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    entityName: params.entityName,
    changesJson: params.changes ? JSON.stringify(params.changes, null, 2) : undefined,
    ipAddress: params.ipAddress || '192.168.1.10',
    timestamp,
  };

  const updated = [newEntry, ...currentLogs];
  saveAuditLogs(updated);
  return newEntry;
}

export function exportAuditLogsToCsv(logs: AuditLogRecord[]): string {
  const headers = ['Timestamp', 'Action', 'Entity Type', 'Entity ID', 'Entity Name', 'User', 'Role', 'IP Address', 'Changes'];
  const rows = logs.map((log) => [
    `"${log.timestamp}"`,
    `"${log.action}"`,
    `"${log.entityType}"`,
    `"${log.entityId}"`,
    `"${(log.entityName || '').replace(/"/g, '""')}"`,
    `"${log.userFullName}"`,
    `"${log.userRole}"`,
    `"${log.ipAddress || '127.0.0.1'}"`,
    `"${(log.changesJson || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
