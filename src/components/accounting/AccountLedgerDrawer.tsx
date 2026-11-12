import React from 'react';
import { X, Layers, ArrowRight, ShieldCheck, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Account, JournalEntry, JournalLine } from '@/types';
import { formatKES, formatDate } from '@/lib/utils';

interface AccountLedgerDrawerProps {
  account: Account | null;
  isOpen: boolean;
  onClose: () => void;
  journalEntries: JournalEntry[];
}

export function AccountLedgerDrawer({
  account,
  isOpen,
  onClose,
  journalEntries,
}: AccountLedgerDrawerProps) {
  if (!isOpen || !account) return null;

  // Extract all journal lines affecting this account
  const accountLines: {
    entryNumber: string;
    date: string;
    reference: string;
    memo: string;
    line: JournalLine;
  }[] = [];

  journalEntries.forEach((entry) => {
    entry.lines.forEach((l) => {
      if (l.accountId === account.id || l.accountNumber === account.accountNumber) {
        accountLines.push({
          entryNumber: entry.entryNumber,
          date: entry.date,
          reference: entry.reference,
          memo: l.description || entry.memo,
          line: l,
        });
      }
    });
  });

  // Calculate total debits and credits
  const totalDebit = accountLines.reduce((sum, al) => sum + al.line.debit, 0);
  const totalCredit = accountLines.reduce((sum, al) => sum + al.line.credit, 0);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white border-l border-[#D8E2EC] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 text-[#0F172A]">
      {/* Header */}
      <div className="p-5 border-b border-[#D8E2EC] bg-[#F8FAFC]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#1B2436] text-white flex items-center justify-center font-bold text-sm shadow-xs font-mono">
              {account.accountNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#0F172A]">{account.name}</h2>
                <Badge variant="frost">{account.type}</Badge>
              </div>
              <span className="text-xs text-[#54657E]">
                {account.subType || 'General Ledger Account'} · Currency: KES
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#54657E] hover:text-[#0F172A] hover:bg-[#E8EEF5] transition-colors cursor-pointer"
            title="Close Drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Balance Card */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#D8E2EC] font-mono text-xs">
          <div className="p-2.5 rounded-lg bg-white border border-[#D8E2EC]">
            <span className="text-[10px] uppercase font-bold text-[#54657E] block">Total Debits</span>
            <span className="font-bold text-[#0F172A] tabular-nums">{formatKES(totalDebit)}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-[#D8E2EC]">
            <span className="text-[10px] uppercase font-bold text-[#54657E] block">Total Credits</span>
            <span className="font-bold text-[#0F172A] tabular-nums">{formatKES(totalCredit)}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-[#D8E2EC]">
            <span className="text-[10px] uppercase font-bold text-[#54657E] block">Current Balance</span>
            <span className="font-bold text-[#E03616] text-sm tabular-nums">{formatKES(account.balance)}</span>
          </div>
        </div>
      </div>

      {/* Lines Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#54657E]">
            Historical Journal Line Audit ({accountLines.length} Entries)
          </h3>
          <span className="text-[11px] text-[#64748B] font-mono">Real-Time Ledger</span>
        </div>

        {accountLines.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#64748B] border border-dashed border-[#D8E2EC] rounded-xl">
            No journal lines recorded against account {account.accountNumber} yet.
          </div>
        ) : (
          <div className="border border-[#D8E2EC] rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#E8EEF5] text-[11px] font-bold text-[#334155] uppercase">
                <tr>
                  <th className="py-2.5 px-3">Voucher #</th>
                  <th className="py-2.5 px-3">Memo</th>
                  <th className="py-2.5 px-3 text-right">Debit</th>
                  <th className="py-2.5 px-3 text-right">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8E2EC] font-mono">
                {accountLines.map((al, idx) => (
                  <tr key={idx} className="hover:bg-[#F8FAFC]">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-[#0F172A]">{al.entryNumber}</div>
                      <div className="text-[10px] text-[#64748B]">{formatDate(al.date)}</div>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-xs text-[#334155]">
                      <div>{al.memo}</div>
                      <div className="text-[10px] text-[#64748B] font-mono">Ref: {al.reference}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-[#0F172A]">
                      {al.line.debit > 0 ? formatKES(al.line.debit) : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-[#0F172A]">
                      {al.line.credit > 0 ? formatKES(al.line.credit) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#D8E2EC] bg-[#F8FAFC] flex items-center justify-between text-xs">
        <span className="text-[#64748B] font-mono text-[11px]">
          Audited under General Ledger Rules
        </span>
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
