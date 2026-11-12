import {
  Account,
  JournalEntry,
  JournalLine,
  InvoiceRecord,
  PaymentRecord,
} from '@/types';
import { DEFAULT_ACCOUNTS, DEFAULT_JOURNAL_ENTRIES } from '@/data/kernel';
import {
  SEED_INVOICES,
  SEED_BANK_TRANSACTIONS,
  SEED_SUPPLIER_BILLS,
  BankTransactionRecord,
  SupplierBillRecord,
} from '@/data/accountingSeed';

const STORAGE_KEY = 'innowit_accounting_v4';

export interface AccountingState {
  accounts: Account[];
  journalEntries: JournalEntry[];
  invoices: InvoiceRecord[];
  bankTransactions: BankTransactionRecord[];
  supplierBills: SupplierBillRecord[];
}

export function loadAccountingState(): AccountingState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.accounts && parsed.journalEntries && parsed.invoices) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load accounting state from localStorage:', err);
  }

  return {
    accounts: DEFAULT_ACCOUNTS,
    journalEntries: DEFAULT_JOURNAL_ENTRIES,
    invoices: SEED_INVOICES,
    bankTransactions: SEED_BANK_TRANSACTIONS,
    supplierBills: SEED_SUPPLIER_BILLS,
  };
}

export function saveAccountingState(state: AccountingState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to save accounting state to localStorage:', err);
  }
}

/**
 * Double-Entry Balance Validator
 * Enforces SUM(debits) == SUM(credits) within 0.01 tolerance
 */
export function validateDoubleEntryBalance(lines: { debit: number; credit: number }[]): boolean {
  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  return totalDebit > 0 && Math.abs(totalDebit - totalCredit) < 0.01;
}

/**
 * Updates Account Balances based on posted Journal Entry lines
 */
export function applyLinesToAccountBalances(
  accounts: Account[],
  lines: JournalLine[],
  isReversal: boolean = false
): Account[] {
  return accounts.map((acc) => {
    const matchingLines = lines.filter((l) => l.accountId === acc.id);
    if (matchingLines.length === 0) return acc;

    let delta = 0;
    for (const l of matchingLines) {
      const dr = isReversal ? -l.debit : l.debit;
      const cr = isReversal ? -l.credit : l.credit;

      // Assets and Expenses increase with debit, decrease with credit
      if (acc.type === 'ASSET' || acc.type === 'EXPENSE') {
        delta += dr - cr;
      } else {
        // Liabilities, Equity, Revenue increase with credit, decrease with debit
        delta += cr - dr;
      }
    }

    return { ...acc, balance: acc.balance + delta };
  });
}
