/**
 * INNOWIT ONE WORKSPACE — Implementation Phase 1
 * Core Scaffolding, Database Kernel, Design Tokens & Global App Shell
 *
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar } from '@/components/shell/Sidebar';
import { TopBar } from '@/components/shell/TopBar';
import { CommandPalette } from '@/components/shell/CommandPalette';
import { RoleSwitcherModal } from '@/components/shell/RoleSwitcherModal';
import { ChartOfAccountsView } from '@/components/views/ChartOfAccountsView';
import { JournalEntriesView } from '@/components/views/JournalEntriesView';
import { EtimsView } from '@/components/views/EtimsView';
import { CustomersView } from '@/components/views/CustomersView';
import { CrmView } from '@/components/views/CrmView';
import { InventoryView } from '@/components/views/InventoryView';
import { CollaborationView } from '@/components/views/CollaborationView';
import { RbacMatrixView } from '@/components/views/RbacMatrixView';
import { ForbiddenNotice } from '@/components/views/ForbiddenNotice';
import { InvoicesView } from '@/components/accounting/InvoicesView';
import { FinancialReportsView } from '@/components/accounting/FinancialReportsView';
import { ProcurementView } from '@/components/views/ProcurementView';
import { HrPayrollView } from '@/components/views/HrPayrollView';
import { loadErpState, saveErpState, ErpState } from '@/modules/erp/store';

import {
  DEFAULT_BRANCHES,
  DEFAULT_ACCOUNTS,
  DEFAULT_JOURNAL_ENTRIES,
  DEFAULT_ETIMS_RECORDS,
  DEFAULT_CUSTOMERS,
  DEFAULT_PRODUCTS,
  SEED_USERS,
} from '@/data/kernel';
import { SEED_INVOICES } from '@/data/accountingSeed';
import {
  DEFAULT_ETIMS_CONFIG,
  SEED_ETIMS_QUEUE,
  SEED_CREDIT_NOTES,
  serializeKraEtimsPayload,
  serializeKraResponse,
} from '@/data/etimsSeed';
import {
  Branch,
  UserSessionPayload,
  Account,
  JournalEntry,
  JournalLine,
  EtimsRecord,
  CustomerRecord,
  ProductRecord,
  InvoiceRecord,
  PaymentRecord,
  SystemModule,
  WarehouseRecord,
  StockMovementRecord,
  FixedAssetRecord,
  PurchaseOrderRecord,
  GoodsReceiptNoteRecord,
  SupplierRecord,
  SupplierBillRecord,
  SalesOrderRecord,
  PayrollRunRecord,
  EmployeeRecord,
  LeaveRequestRecord,
  EtimsQueueItem,
  EtimsConfigurationRecord,
  CreditNoteRecord,
} from '@/types';
import { canViewModule } from '@/modules/auth/rbac';

export default function App() {
  // Navigation State
  const [currentPath, setCurrentPath] = useState('/accounting/chart-of-accounts');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Shell Modals
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);

  // Operational Context
  const [branches] = useState<Branch[]>(DEFAULT_BRANCHES);
  const [activeBranch, setActiveBranch] = useState<Branch>(DEFAULT_BRANCHES[0]);
  const [currentUser, setCurrentUser] = useState<UserSessionPayload>(SEED_USERS[0]); // default Super Admin
  const [isSandbox, setIsSandbox] = useState<boolean>(true); // Sandbox air-gap default

  // Kernel State Stores
  const [accounts, setAccounts] = useState<Account[]>(DEFAULT_ACCOUNTS);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(DEFAULT_JOURNAL_ENTRIES);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(SEED_INVOICES);
  const [etimsRecords, setEtimsRecords] = useState<EtimsRecord[]>(DEFAULT_ETIMS_RECORDS);
  const [customers, setCustomers] = useState<CustomerRecord[]>(DEFAULT_CUSTOMERS);
  const [products, setProducts] = useState<ProductRecord[]>(DEFAULT_PRODUCTS);

  // eTIMS Compliance Engine State (Phase 6)
  const [etimsConfig, setEtimsConfig] = useState<EtimsConfigurationRecord>(DEFAULT_ETIMS_CONFIG);
  const [etimsQueue, setEtimsQueue] = useState<EtimsQueueItem[]>(SEED_ETIMS_QUEUE);
  const [creditNotes, setCreditNotes] = useState<CreditNoteRecord[]>(SEED_CREDIT_NOTES);

  // ERP Operations State (Phase 5)
  const [erpState, setErpState] = useState<ErpState>(() => loadErpState());

  const updateErpState = (updater: (prev: ErpState) => ErpState) => {
    setErpState((prev) => {
      const updated = updater(prev);
      saveErpState(updated);
      return updated;
    });
  };

  // Handlers for state updates
  const handleAddAccount = (newAcc: Account) => {
    setAccounts((prev) => [newAcc, ...prev]);
  };

  const handlePostStockAdjustment = (
    movement: StockMovementRecord,
    journalEntry: JournalEntry,
    updatedProduct: ProductRecord
  ) => {
    // 1. Append immutable stock movement
    updateErpState((prev) => ({
      ...prev,
      stockMovements: [movement, ...prev.stockMovements],
    }));

    // 2. Post balancing GL journal entry
    handleAddJournalEntry(journalEntry);

    // 3. Update product catalog stock
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  const handleTransferStock = (movements: StockMovementRecord[]) => {
    updateErpState((prev) => ({
      ...prev,
      stockMovements: [...movements, ...prev.stockMovements],
    }));
  };

  const handleAddAsset = (asset: FixedAssetRecord) => {
    updateErpState((prev) => ({
      ...prev,
      fixedAssets: [asset, ...prev.fixedAssets],
    }));
  };

  const handleApprovePO = (poId: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    updateErpState((prev) => ({
      ...prev,
      purchaseOrders: prev.purchaseOrders.map((po) =>
        po.id === poId
          ? {
              ...po,
              status: 'APPROVED',
              approvedBy: `${currentUser.fullName} (${currentUser.role})`,
              approvedAt: timestamp,
            }
          : po
      ),
    }));
  };

  const handleCreatePO = (po: PurchaseOrderRecord) => {
    updateErpState((prev) => ({
      ...prev,
      purchaseOrders: [po, ...prev.purchaseOrders],
    }));
  };

  const handleConfirmReceipt = (
    grn: GoodsReceiptNoteRecord,
    movements: StockMovementRecord[],
    updatedProducts: ProductRecord[],
    bill?: SupplierBillRecord,
    journalEntry?: JournalEntry
  ) => {
    // 1. Save GRN & Stock Movements
    updateErpState((prev) => ({
      ...prev,
      goodsReceiptNotes: [grn, ...prev.goodsReceiptNotes],
      stockMovements: [...movements, ...prev.stockMovements],
      supplierBills: bill ? [bill, ...prev.supplierBills] : prev.supplierBills,
      purchaseOrders: prev.purchaseOrders.map((po) =>
        po.id === grn.poId ? { ...po, status: 'RECEIVED' } : po
      ),
    }));

    // 2. Update product stock on hand
    setProducts(updatedProducts);

    // 3. Post atomic balanced AP journal entry if bill generated
    if (journalEntry) {
      handleAddJournalEntry(journalEntry);
    }
  };

  const handleCreateSalesOrder = (so: SalesOrderRecord) => {
    updateErpState((prev) => ({
      ...prev,
      salesOrders: [so, ...prev.salesOrders],
    }));
  };

  const handleAddSupplier = (supplier: SupplierRecord) => {
    updateErpState((prev) => ({
      ...prev,
      suppliers: [supplier, ...prev.suppliers],
    }));
  };

  const handleCreatePayrollRun = (run: PayrollRunRecord) => {
    updateErpState((prev) => ({
      ...prev,
      payrollRuns: [run, ...prev.payrollRuns],
    }));
  };

  const handlePostPayrollToGl = (runId: string, journalEntry: JournalEntry) => {
    // 1. Post balanced GL journal entry
    handleAddJournalEntry(journalEntry);

    // 2. Mark payroll run as POSTED_TO_GL
    updateErpState((prev) => ({
      ...prev,
      payrollRuns: prev.payrollRuns.map((r) =>
        r.id === runId
          ? { ...r, status: 'POSTED_TO_GL', journalEntryId: journalEntry.id }
          : r
      ),
    }));
  };

  const handleAddEmployee = (emp: EmployeeRecord) => {
    updateErpState((prev) => ({
      ...prev,
      employees: [emp, ...prev.employees],
    }));
  };

  const handleSubmitLeave = (req: LeaveRequestRecord) => {
    updateErpState((prev) => ({
      ...prev,
      leaveRequests: [req, ...prev.leaveRequests],
    }));
  };

  const handleUpdateLeaveStatus = (
    leaveId: string,
    status: 'APPROVED' | 'REJECTED'
  ) => {
    updateErpState((prev) => ({
      ...prev,
      leaveRequests: prev.leaveRequests.map((l) =>
        l.id === leaveId
          ? { ...l, status, approvedBy: currentUser.fullName }
          : l
      ),
    }));
  };

  const handleAddJournalEntry = (newEntry: JournalEntry) => {
    setJournalEntries((prev) => [newEntry, ...prev]);

    // Also update account balances if posted
    if (newEntry.status === 'POSTED') {
      setAccounts((prev) =>
        prev.map((acc) => {
          const matchingLines = newEntry.lines.filter(
            (l) => l.accountId === acc.id || l.accountNumber === acc.accountNumber
          );
          if (matchingLines.length === 0) return acc;

          let delta = 0;
          for (const l of matchingLines) {
            if (acc.type === 'ASSET' || acc.type === 'EXPENSE') {
              delta += l.debit - l.credit;
            } else {
              delta += l.credit - l.debit;
            }
          }
          return { ...acc, balance: acc.balance + delta };
        })
      );
    }
  };

  const handleReverseJournalEntry = (
    originalEntryId: string,
    reversingEntry: JournalEntry
  ) => {
    // 1. Mark original entry as reversed and append reversing entry
    setJournalEntries((prev) => [
      reversingEntry,
      ...prev.map((je) =>
        je.id === originalEntryId
          ? { ...je, isReversed: true, reversalEntryId: reversingEntry.id }
          : je
      ),
    ]);

    // 2. Adjust account balances by applying reversing entry lines
    setAccounts((prev) =>
      prev.map((acc) => {
        const matchingLines = reversingEntry.lines.filter(
          (l) => l.accountId === acc.id || l.accountNumber === acc.accountNumber
        );
        if (matchingLines.length === 0) return acc;

        let delta = 0;
        for (const l of matchingLines) {
          if (acc.type === 'ASSET' || acc.type === 'EXPENSE') {
            delta += l.debit - l.credit;
          } else {
            delta += l.credit - l.debit;
          }
        }
        return { ...acc, balance: acc.balance + delta };
      })
    );
  };

  const handleCreateInvoice = (newInvoice: InvoiceRecord) => {
    setInvoices((prev) => [newInvoice, ...prev]);

    // Create balanced Double-Entry General Ledger journal entry
    const entryId = `je_inv_${Date.now()}`;
    const entryNumber = `JE-INV-${Date.now().toString().slice(-6)}`;

    // Identify GL accounts
    const arAcc = accounts.find((a) => a.accountNumber === '1200') || accounts[1];
    const revAcc =
      accounts.find((a) => a.accountNumber === '4010') ||
      accounts.find((a) => a.type === 'REVENUE') ||
      accounts[4];
    const vatAcc =
      accounts.find((a) => a.accountNumber === '2020') ||
      accounts.find((a) => a.accountNumber === '2010') ||
      accounts[2];

    const lines: JournalLine[] = [
      {
        id: `line_${Date.now()}_1`,
        accountId: arAcc.id,
        accountNumber: arAcc.accountNumber,
        accountName: arAcc.name,
        debit: newInvoice.totalAmount,
        credit: 0,
        description: `AR: Invoice ${newInvoice.invoiceNumber} - ${newInvoice.customerName}`,
      },
      {
        id: `line_${Date.now()}_2`,
        accountId: revAcc.id,
        accountNumber: revAcc.accountNumber,
        accountName: revAcc.name,
        debit: 0,
        credit: newInvoice.subtotal,
        description: `Revenue: Invoice ${newInvoice.invoiceNumber}`,
      },
      {
        id: `line_${Date.now()}_3`,
        accountId: vatAcc.id,
        accountNumber: vatAcc.accountNumber,
        accountName: vatAcc.name,
        debit: 0,
        credit: newInvoice.taxAmount,
        description: `VAT 16% Output: Invoice ${newInvoice.invoiceNumber}`,
      },
    ];

    const journalEntry: JournalEntry = {
      id: entryId,
      entryNumber,
      date: newInvoice.issueDate,
      reference: newInvoice.invoiceNumber,
      memo: `Customer Invoice ${newInvoice.invoiceNumber} - ${newInvoice.customerName}`,
      status: 'POSTED',
      postedBy: currentUser.fullName,
      createdBy: currentUser.fullName,
      postedAt: new Date().toISOString(),
      lines,
      totalDebit: newInvoice.totalAmount,
      totalCredit: newInvoice.subtotal + newInvoice.taxAmount,
      sourceModule: 'INVOICING',
      sourceId: newInvoice.id,
    };

    setJournalEntries((prev) => [journalEntry, ...prev]);

    // Update account balances
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === arAcc.id || acc.accountNumber === arAcc.accountNumber) {
          return { ...acc, balance: acc.balance + newInvoice.totalAmount };
        }
        if (acc.id === revAcc.id || acc.accountNumber === revAcc.accountNumber) {
          return { ...acc, balance: acc.balance + newInvoice.subtotal };
        }
        if (acc.id === vatAcc.id || acc.accountNumber === vatAcc.accountNumber) {
          return { ...acc, balance: acc.balance + newInvoice.taxAmount };
        }
        return acc;
      })
    );

    // Auto-enqueue to eTIMS records & transmission queue
    const cuNumber = `KRAMU010049${Date.now().toString().slice(-4)}`;
    const etimsRec: EtimsRecord = {
      id: `etims_${Date.now()}`,
      invoiceId: newInvoice.id,
      invoiceNumber: newInvoice.invoiceNumber,
      customerPin: newInvoice.customerPin || 'P051982736Z',
      customerName: newInvoice.customerName,
      buyerName: newInvoice.customerName,
      cuNumber,
      status: 'PENDING',
      environment: isSandbox ? 'SANDBOX' : 'PRODUCTION',
      totalAmountKes: newInvoice.totalAmount,
      vatAmountKes: newInvoice.taxAmount,
      totalAmount: newInvoice.totalAmount,
      taxableAmount: newInvoice.subtotal,
      taxAmount: newInvoice.taxAmount,
      transmissionTimestamp: '',
      retryCount: 0,
    };
    setEtimsRecords((prev) => [etimsRec, ...prev]);

    const queueItem: EtimsQueueItem = {
      id: `queue_${Date.now()}`,
      invoiceId: newInvoice.id,
      invoiceNumber: newInvoice.invoiceNumber,
      customerName: newInvoice.customerName,
      customerPin: newInvoice.customerPin || 'P051982736Z',
      idempotencyKey:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      mode: etimsConfig.mode,
      environment: isSandbox ? 'SANDBOX' : 'PRODUCTION',
      status: 'PENDING',
      totalAmountKes: newInvoice.totalAmount,
      vatAmountKes: newInvoice.taxAmount,
      cuNumber,
      attemptCount: 0,
      payloadJson: serializeKraEtimsPayload({
        invoiceNumber: newInvoice.invoiceNumber,
        customerPin: newInvoice.customerPin || 'P051982736Z',
        customerName: newInvoice.customerName,
        issueDate: newInvoice.issueDate,
        subtotal: newInvoice.subtotal,
        taxAmount: newInvoice.taxAmount,
        totalAmount: newInvoice.totalAmount,
        items: newInvoice.items,
      }),
    };
    setEtimsQueue((prev) => [queueItem, ...prev]);
  };

  const handleRecordPayment = (
    invoiceId: string,
    payment: PaymentRecord,
    isFullSettlement: boolean
  ) => {
    // Locate target invoice for references
    const targetInvoice = invoices.find((inv) => inv.id === invoiceId);
    const invNumber = targetInvoice?.invoiceNumber || payment.invoiceNumber || 'INV';
    const custName = targetInvoice?.customerName || payment.customerName || 'Customer';
    const refCode = payment.referenceCode || payment.referenceNumber || 'REF';
    const pmtDate = payment.date || payment.paymentDate || new Date().toISOString().slice(0, 10);

    // 1. Update invoice
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== invoiceId) return inv;
        const newPaid = inv.paidAmount + payment.amount;
        const newBalance = Math.max(0, inv.totalAmount - newPaid);
        const newStatus = isFullSettlement || newBalance <= 0 ? 'PAID' : 'POSTED';
        return {
          ...inv,
          paidAmount: newPaid,
          balanceDue: newBalance,
          status: newStatus,
        };
      })
    );

    // 2. Generate balanced cash receipt GL entry
    // Dr: 1020 Stanbic Bank (Asset +)
    // Cr: 1200 Accounts Receivable (Asset -)
    const bankAcc = accounts.find((a) => a.accountNumber === '1020') || accounts[0];
    const arAcc = accounts.find((a) => a.accountNumber === '1200') || accounts[1];

    const lines: JournalLine[] = [
      {
        id: `line_pmt_${Date.now()}_1`,
        accountId: bankAcc.id,
        accountNumber: bankAcc.accountNumber,
        accountName: bankAcc.name,
        debit: payment.amount,
        credit: 0,
        description: `Cash Receipt ${payment.paymentNumber} (${payment.paymentMethod} Ref: ${refCode})`,
      },
      {
        id: `line_pmt_${Date.now()}_2`,
        accountId: arAcc.id,
        accountNumber: arAcc.accountNumber,
        accountName: arAcc.name,
        debit: 0,
        credit: payment.amount,
        description: `AR Settlement: ${invNumber} - ${custName}`,
      },
    ];

    const journalEntry: JournalEntry = {
      id: `je_rcp_${Date.now()}`,
      entryNumber: `JE-RCP-${Date.now().toString().slice(-6)}`,
      date: pmtDate,
      reference: payment.paymentNumber,
      memo: `Payment Receipt ${payment.paymentNumber} for ${invNumber} (${payment.paymentMethod} Ref: ${refCode})`,
      status: 'POSTED',
      postedBy: payment.recordedBy,
      createdBy: payment.recordedBy,
      postedAt: new Date().toISOString(),
      lines,
      totalDebit: payment.amount,
      totalCredit: payment.amount,
      sourceModule: 'AR_PAYMENTS',
      sourceId: payment.id,
    };

    setJournalEntries((prev) => [journalEntry, ...prev]);

    // 3. Update account balances: Bank balance increases, AR decreases
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === bankAcc.id || acc.accountNumber === bankAcc.accountNumber) {
          return { ...acc, balance: acc.balance + payment.amount };
        }
        if (acc.id === arAcc.id || acc.accountNumber === arAcc.accountNumber) {
          return { ...acc, balance: Math.max(0, acc.balance - payment.amount) };
        }
        return acc;
      })
    );
  };

  const handleAddCustomer = (newCust: CustomerRecord) => {
    setCustomers((prev) => [newCust, ...prev]);
  };

  const handleAddProduct = (newProd: ProductRecord) => {
    setProducts((prev) => [newProd, ...prev]);
  };

  const handleRetryQueueItem = (itemId: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const controlNo = `KRA2026${Date.now().toString().slice(-7)}`;
    const signature = `SIG-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    let updatedInvNumber = '';
    let updatedCuNumber = '';

    setEtimsQueue((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          updatedInvNumber = item.invoiceNumber;
          updatedCuNumber = item.cuNumber || 'KRAMU010049';
          const resp = serializeKraResponse(item.invoiceNumber, updatedCuNumber, item.totalAmountKes);
          return {
            ...item,
            status: 'ACCEPTED',
            attemptCount: item.attemptCount + 1,
            transmissionTimestamp: timestamp,
            kraControlNumber: controlNo,
            internalSignature: signature,
            qrPayload: `https://itax.kra.go.ke/verify?cu=${item.cuNumber}&inv=${item.invoiceNumber}&tot=${item.totalAmountKes}&sign=${signature}`,
            responseJson: resp,
            lastError: undefined,
            nextRetryAt: undefined,
          };
        }
        return item;
      })
    );

    setEtimsRecords((prev) =>
      prev.map((rec) => {
        if (rec.invoiceNumber === updatedInvNumber || rec.cuNumber === updatedCuNumber) {
          return {
            ...rec,
            status: 'ACCEPTED',
            transmissionTimestamp: timestamp,
            kraReceiptNumber: controlNo,
            verificationUrl: `https://itax.kra.go.ke/KRA-Portal/invoiceConfirmation.htm?cu=${rec.cuNumber}`,
            qrPayload: `https://itax.kra.go.ke/verify?cu=${rec.cuNumber}&receipt=${controlNo}`,
          };
        }
        return rec;
      })
    );
  };

  const handleTransmitEtimsQueue = () => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const generatedMap = new Map<string, { controlNo: string; signature: string }>();

    setEtimsQueue((prev) =>
      prev.map((item) => {
        if (item.status === 'PENDING' || item.status === 'RETRY_SCHEDULED' || item.status === 'FAILED') {
          const controlNo = `KRA2026${Date.now().toString().slice(-7)}${Math.floor(Math.random() * 90 + 10)}`;
          const signature = `SIG-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          generatedMap.set(item.invoiceNumber, { controlNo, signature });

          const resp = serializeKraResponse(item.invoiceNumber, item.cuNumber || 'KRAMU010049', item.totalAmountKes);
          return {
            ...item,
            status: 'ACCEPTED',
            attemptCount: item.attemptCount + 1,
            transmissionTimestamp: timestamp,
            kraControlNumber: controlNo,
            internalSignature: signature,
            qrPayload: `https://itax.kra.go.ke/verify?cu=${item.cuNumber}&inv=${item.invoiceNumber}&tot=${item.totalAmountKes}&sign=${signature}`,
            responseJson: resp,
            lastError: undefined,
            nextRetryAt: undefined,
          };
        }
        return item;
      })
    );

    setEtimsRecords((prev) =>
      prev.map((rec) => {
        if (rec.status === 'PENDING' || rec.status === 'FAILED') {
          const gen = generatedMap.get(rec.invoiceNumber);
          const receiptNumber = gen?.controlNo || `KRA2026${Date.now().toString().slice(-7)}`;
          return {
            ...rec,
            status: 'ACCEPTED',
            transmissionTimestamp: timestamp,
            kraReceiptNumber: receiptNumber,
            verificationUrl: `https://itax.kra.go.ke/KRA-Portal/invoiceConfirmation.htm?cu=${rec.cuNumber}`,
            qrPayload: `https://itax.kra.go.ke/verify?cu=${rec.cuNumber}&receipt=${receiptNumber}`,
          };
        }
        return rec;
      })
    );
  };

  const handleUpdateEtimsConfig = (newConfig: EtimsConfigurationRecord) => {
    setEtimsConfig(newConfig);
    if (newConfig.environment === 'PRODUCTION' && newConfig.isProductionActive) {
      setIsSandbox(false);
    } else if (newConfig.environment === 'SANDBOX') {
      setIsSandbox(true);
    }
  };

  const handleCreateCreditNote = (
    creditNote: CreditNoteRecord,
    reversingJournal: JournalEntry,
    restoredStockMovements: StockMovementRecord[]
  ) => {
    // 1. Append credit note
    setCreditNotes((prev) => [creditNote, ...prev]);

    // 2. Post reversing GL entry
    handleAddJournalEntry(reversingJournal);

    // 3. Update target invoice status and balance if applicable
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === creditNote.originalInvoiceId || inv.invoiceNumber === creditNote.originalInvoiceNumber) {
          const newBal = Math.max(0, inv.balanceDue - creditNote.totalAmountKes);
          return {
            ...inv,
            balanceDue: newBal,
            status: newBal === 0 ? 'VOID' : inv.status,
          };
        }
        return inv;
      })
    );

    // 4. Restore physical inventory if returned
    if (restoredStockMovements && restoredStockMovements.length > 0) {
      updateErpState((prev) => ({
        ...prev,
        stockMovements: [...restoredStockMovements, ...prev.stockMovements],
      }));

      // Adjust product catalog stock quantities
      for (const m of restoredStockMovements) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === m.productId
              ? {
                  ...p,
                  stockOnHand: p.stockOnHand + m.quantity,
                }
              : p
          )
        );
      }
    }

    // 5. Enqueue Credit Note to eTIMS queue & compliance outbox
    const cnPayload = {
      taxpayerInfo: {
        tin: etimsConfig.kraPin,
        bhfId: etimsConfig.branchCode,
        dvcSrlNo: etimsConfig.deviceSerial,
      },
      custInfo: {
        custTin: creditNote.customerPin,
        custNm: creditNote.customerName,
        prcType: '1',
      },
      trdInvcNo: creditNote.creditNoteNumber,
      orgInvcNo: creditNote.originalInvoiceNumber,
      orgRcptNo: creditNote.originalKraControlNumber,
      invcType: '2', // 2=Credit Note
      pmtTyCd: '01',
      cfrmDate: `${new Date().toISOString().slice(0, 10)} 12:00:00`,
      totItemCnt: creditNote.items.length,
      taxblAmtA: creditNote.subtotalKes,
      taxAmtA: creditNote.taxAmountKes,
      totTaxblAmt: creditNote.subtotalKes,
      totTaxAmt: creditNote.taxAmountKes,
      totAmt: creditNote.totalAmountKes,
      rsnCd: creditNote.reasonCode,
      rsnNotes: creditNote.reasonNotes,
    };

    const cnQueueItem: EtimsQueueItem = {
      id: `queue_${Date.now()}`,
      invoiceId: creditNote.id,
      invoiceNumber: creditNote.creditNoteNumber,
      customerName: creditNote.customerName,
      customerPin: creditNote.customerPin,
      idempotencyKey:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      mode: etimsConfig.mode,
      environment: isSandbox ? 'SANDBOX' : 'PRODUCTION',
      status: 'ACCEPTED',
      totalAmountKes: creditNote.totalAmountKes,
      vatAmountKes: creditNote.taxAmountKes,
      cuNumber: creditNote.cuNumber,
      kraControlNumber: creditNote.kraControlNumber,
      internalSignature: `SIG-CN-${Date.now().toString().slice(-6)}`,
      qrPayload: `https://itax.kra.go.ke/verify?cu=${creditNote.cuNumber}&cn=${creditNote.creditNoteNumber}&tot=${creditNote.totalAmountKes}`,
      attemptCount: 1,
      transmissionTimestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      payloadJson: JSON.stringify(cnPayload, null, 2),
      responseJson: serializeKraResponse(creditNote.creditNoteNumber, creditNote.cuNumber, creditNote.totalAmountKes),
    };
    setEtimsQueue((prev) => [cnQueueItem, ...prev]);

    const cnEtimsRec: EtimsRecord = {
      id: `etims_cn_${Date.now()}`,
      invoiceId: creditNote.id,
      invoiceNumber: creditNote.creditNoteNumber,
      customerPin: creditNote.customerPin,
      customerName: creditNote.customerName,
      buyerName: creditNote.customerName,
      cuNumber: creditNote.cuNumber,
      status: 'ACCEPTED',
      environment: isSandbox ? 'SANDBOX' : 'PRODUCTION',
      totalAmountKes: creditNote.totalAmountKes,
      vatAmountKes: creditNote.taxAmountKes,
      totalAmount: creditNote.totalAmountKes,
      taxableAmount: creditNote.subtotalKes,
      taxAmount: creditNote.taxAmountKes,
      kraReceiptNumber: creditNote.kraControlNumber,
      transmissionTimestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      retryCount: 0,
      verificationUrl: `https://itax.kra.go.ke/verify?cu=${creditNote.cuNumber}&cn=${creditNote.creditNoteNumber}`,
      qrPayload: `https://itax.kra.go.ke/verify?cu=${creditNote.cuNumber}&cn=${creditNote.creditNoteNumber}`,
    };
    setEtimsRecords((prev) => [cnEtimsRec, ...prev]);
  };

  // Determine required module for current route
  const getRequiredModule = (path: string): SystemModule => {
    if (path.startsWith('/collaboration')) return 'COLLABORATION';
    if (path.startsWith('/crm')) return 'CRM';
    if (path.startsWith('/accounting/reports')) return 'BI_REPORTS';
    if (path.startsWith('/accounting')) return 'ACCOUNTING';
    if (path.startsWith('/inventory')) return 'INVENTORY';
    if (path.startsWith('/procurement')) return 'PROCUREMENT';
    if (path.startsWith('/hr')) return 'HR_PAYROLL';
    if (path.startsWith('/etims')) return 'ETIMS_COMPLIANCE';
    if (path.startsWith('/system')) return 'SYSTEM_ADMIN';
    return 'ACCOUNTING';
  };

  const requiredModule = getRequiredModule(currentPath);
  const isModuleAllowed = canViewModule(currentUser.role, requiredModule);

  // Content Renderer
  const renderActiveView = () => {
    // RBAC Security Boundary Check
    if (!isModuleAllowed) {
      return (
        <ForbiddenNotice
          module={requiredModule}
          currentRole={currentUser.role}
          onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
          onNavigateHome={() => setCurrentPath('/collaboration')}
        />
      );
    }

    // Chart of Accounts
    if (currentPath === '/accounting/chart-of-accounts') {
      return (
        <ChartOfAccountsView
          accounts={accounts}
          onAddAccount={handleAddAccount}
          userRole={currentUser.role}
          journalEntries={journalEntries}
        />
      );
    }

    // Accounts Receivable & Sales Invoices
    if (currentPath === '/accounting/invoices') {
      return (
        <InvoicesView
          invoices={invoices}
          customers={customers}
          products={products}
          onCreateInvoice={handleCreateInvoice}
          onRecordPayment={handleRecordPayment}
          userRole={currentUser.role}
          userFullName={currentUser.fullName}
        />
      );
    }

    // Real-Time GAAP Financial Reports (P&L, Balance Sheet, Trial Balance)
    if (currentPath === '/accounting/reports') {
      return (
        <FinancialReportsView
          accounts={accounts}
          journalEntries={journalEntries}
        />
      );
    }

    // Journal Entries & Double-Entry General Ledger
    if (currentPath === '/accounting/journal-entries') {
      return (
        <JournalEntriesView
          entries={journalEntries}
          accounts={accounts}
          onAddEntry={handleAddJournalEntry}
          onReverseEntry={handleReverseJournalEntry}
          userRole={currentUser.role}
          userFullName={currentUser.fullName}
        />
      );
    }

    // eTIMS Compliance (Phase 6)
    if (currentPath.startsWith('/etims')) {
      return (
        <EtimsView
          records={etimsRecords}
          queueItems={etimsQueue}
          config={etimsConfig}
          creditNotes={creditNotes}
          invoices={invoices}
          products={products}
          isSandbox={isSandbox}
          userRole={currentUser.role}
          userFullName={currentUser.fullName}
          currentPath={currentPath}
          onNavigate={(path: string) => setCurrentPath(path)}
          onToggleSandbox={() => {
            const nextSandbox = !isSandbox;
            setIsSandbox(nextSandbox);
            setEtimsConfig((prev) => ({
              ...prev,
              environment: nextSandbox ? 'SANDBOX' : 'PRODUCTION',
              isProductionActive: !nextSandbox,
              apiUrl: nextSandbox
                ? 'https://etims-sbx.kra.go.ke/etims-api/v1/taxpayer-invoices'
                : 'https://etims.kra.go.ke/etims-api/v1/taxpayer-invoices',
            }));
          }}
          onTransmitQueue={handleTransmitEtimsQueue}
          onRetryQueueItem={handleRetryQueueItem}
          onUpdateConfig={handleUpdateEtimsConfig}
          onCreateCreditNote={handleCreateCreditNote}
        />
      );
    }

    // CRM & Sales Pipeline Management (Phase 3)
    if (currentPath.startsWith('/crm')) {
      return (
        <CrmView
          userFullName={currentUser.fullName}
          userRole={currentUser.role}
          currentPath={currentPath}
          onNavigate={(path: string) => setCurrentPath(path)}
          onSyncCustomers={(updated) => setCustomers(updated)}
        />
      );
    }

    // Operations: Inventory & Multi-Warehouse
    if (currentPath.startsWith('/inventory')) {
      return (
        <InventoryView
          products={products}
          warehouses={erpState.warehouses}
          warehouseStocks={erpState.warehouseStocks}
          stockMovements={erpState.stockMovements}
          fixedAssets={erpState.fixedAssets}
          userRole={currentUser.role}
          userFullName={currentUser.fullName}
          onAddProduct={handleAddProduct}
          onPostAdjustment={handlePostStockAdjustment}
          onTransferStock={handleTransferStock}
          onAddAsset={handleAddAsset}
        />
      );
    }

    // Operations: Procurement & Commercial Orders
    if (currentPath.startsWith('/procurement')) {
      return (
        <ProcurementView
          purchaseOrders={erpState.purchaseOrders}
          goodsReceiptNotes={erpState.goodsReceiptNotes}
          suppliers={erpState.suppliers}
          supplierBills={erpState.supplierBills}
          salesOrders={erpState.salesOrders}
          quotations={erpState.quotations}
          products={products}
          warehouses={erpState.warehouses}
          branches={branches}
          customers={customers}
          userRole={currentUser.role}
          userFullName={currentUser.fullName}
          onApprovePO={handleApprovePO}
          onCreatePO={handleCreatePO}
          onConfirmReceipt={handleConfirmReceipt}
          onCreateSalesOrder={handleCreateSalesOrder}
          onAddSupplier={handleAddSupplier}
        />
      );
    }

    // Operations: Human Resources & Statutory Payroll
    if (currentPath.startsWith('/hr')) {
      return (
        <HrPayrollView
          departments={erpState.departments}
          employees={erpState.employees}
          payrollRuns={erpState.payrollRuns}
          attendance={erpState.attendance}
          leaveRequests={erpState.leaveRequests}
          userRole={currentUser.role}
          userFullName={currentUser.fullName}
          onAddEmployee={handleAddEmployee}
          onCreatePayrollRun={handleCreatePayrollRun}
          onPostPayrollToGl={handlePostPayrollToGl}
          onSubmitLeave={handleSubmitLeave}
          onUpdateLeaveStatus={handleUpdateLeaveStatus}
        />
      );
    }

    // Collaboration
    if (currentPath.startsWith('/collaboration')) {
      return (
        <CollaborationView
          userFullName={currentUser.fullName}
          userRole={currentUser.role}
          userId={currentUser.userId}
          currentPath={currentPath}
          onNavigate={(path: string) => setCurrentPath(path)}
        />
      );
    }

    // 12-Role RBAC Matrix
    if (currentPath === '/system/rbac') {
      return (
        <RbacMatrixView
          currentRole={currentUser.role}
          onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
        />
      );
    }

    // Fallback default
    return (
      <ChartOfAccountsView
        accounts={accounts}
        onAddAccount={handleAddAccount}
        userRole={currentUser.role}
        journalEntries={journalEntries}
      />
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F0F4F8] text-[#0F172A]">
      {/* Persistent Left Sidebar */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={(path: string) => setCurrentPath(path)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        userRole={currentUser.role}
      />

      {/* Main Execution Viewport */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <TopBar
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
          branches={branches}
          activeBranch={activeBranch}
          onSelectBranch={(branch: Branch) => setActiveBranch(branch)}
          isSandbox={isSandbox}
          onToggleSandbox={() => setIsSandbox(!isSandbox)}
          currentUser={currentUser}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F0F4F8]">
          {renderActiveView()}
        </main>
      </div>

      {/* Ctrl+K Omni-Search Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(path: string) => setCurrentPath(path)}
        onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
      />

      {/* 12-Role RBAC Simulation Engine Modal */}
      <RoleSwitcherModal
        isOpen={isRoleSwitcherOpen}
        onClose={() => setIsRoleSwitcherOpen(false)}
        currentUser={currentUser}
        onSelectUser={(user: UserSessionPayload) => setCurrentUser(user)}
        allUsers={SEED_USERS}
      />
    </div>
  );
}
