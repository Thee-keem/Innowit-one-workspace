import React, { useState } from 'react';
import {
  FileText,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  RotateCcw,
  Search,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { JournalEntry, JournalLine, Account, UserRole } from '@/types';
import { formatKES, formatDate } from '@/lib/utils';
import { hasPermission } from '@/modules/auth/rbac';

interface JournalEntriesViewProps {
  entries: JournalEntry[];
  accounts: Account[];
  onAddEntry: (newEntry: JournalEntry) => void;
  onReverseEntry?: (originalEntryId: string, reversingEntry: JournalEntry) => void;
  userRole: UserRole;
  userFullName: string;
}

export function JournalEntriesView({
  entries,
  accounts,
  onAddEntry,
  onReverseEntry,
  userRole,
  userFullName,
}: JournalEntriesViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(entries[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'POSTED' | 'DRAFT' | 'REVERSED'>('ALL');

  // New Journal Entry state
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [reference, setReference] = useState('');
  const [memo, setMemo] = useState('');
  const [lines, setLines] = useState<
    { accountId: string; description: string; debit: number; credit: number }[]
  >([
    { accountId: accounts[0]?.id || '', description: '', debit: 0, credit: 0 },
    { accountId: accounts[1]?.id || '', description: '', debit: 0, credit: 0 },
  ]);

  const canPostGL = hasPermission(userRole, 'ACCOUNTING', 'POST_GL');

  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const isBalanced = totalDebit > 0 && Math.abs(totalDebit - totalCredit) < 0.01;

  const handleAddLine = () => {
    setLines([...lines, { accountId: accounts[0]?.id || '', description: '', debit: 0, credit: 0 }]);
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    setLines(updated);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) return;

    const populatedLines: JournalLine[] = lines.map((l, idx) => {
      const acc = accounts.find((a) => a.id === l.accountId);
      return {
        id: `jel_${Date.now()}_${idx}`,
        accountId: l.accountId,
        accountNumber: acc?.accountNumber || '0000',
        accountName: acc?.name || 'General Account',
        description: l.description || memo,
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
      };
    });

    const newEntry: JournalEntry = {
      id: `je_${Date.now()}`,
      entryNumber: `JE-2026-${String(entries.length + 42).padStart(4, '0')}`,
      date,
      reference: reference || 'GL-MANUAL',
      memo,
      postedBy: `${userFullName} (${userRole})`,
      status: canPostGL ? 'POSTED' : 'DRAFT',
      lines: populatedLines,
      totalDebit,
      totalCredit,
    };

    onAddEntry(newEntry);
    setSelectedEntry(newEntry);
    setIsModalOpen(false);

    // reset
    setReference('');
    setMemo('');
    setLines([
      { accountId: accounts[0]?.id || '', description: '', debit: 0, credit: 0 },
      { accountId: accounts[1]?.id || '', description: '', debit: 0, credit: 0 },
    ]);
  };

  // Reversing Entry workflow per Phase 4 requirements
  const handleCreateReversal = (entry: JournalEntry) => {
    if (entry.isReversed) return;

    const revLines: JournalLine[] = entry.lines.map((l, idx) => ({
      id: `jel_rev_${Date.now()}_${idx}`,
      accountId: l.accountId,
      accountNumber: l.accountNumber,
      accountName: l.accountName,
      description: `Reversal: ${l.description || entry.memo}`,
      debit: l.credit,
      credit: l.debit,
    }));

    const reversingSeq = `JE-2026-${String(entries.length + 43).padStart(4, '0')}`;
    const reversingEntry: JournalEntry = {
      id: `je_${Date.now()}`,
      entryNumber: reversingSeq,
      date: new Date().toISOString().slice(0, 10),
      reference: `REV-${entry.entryNumber}`,
      memo: `Reversing Entry for ${entry.entryNumber}: ${entry.memo}`,
      postedBy: `${userFullName} (${userRole})`,
      status: 'POSTED',
      lines: revLines,
      totalDebit: entry.totalCredit,
      totalCredit: entry.totalDebit,
      isReversed: false,
      reversalEntryId: entry.id,
      sourceModule: 'GENERAL_LEDGER_REVERSAL',
      sourceId: entry.id,
    };

    if (onReverseEntry) {
      onReverseEntry(entry.id, reversingEntry);
    } else {
      onAddEntry(reversingEntry);
    }

    setSelectedEntry(reversingEntry);
  };

  const filteredEntries = entries.filter((e) => {
    const matchesSearch =
      e.entryNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.memo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.reference.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'POSTED') return matchesSearch && e.status === 'POSTED' && !e.isReversed;
    if (statusFilter === 'DRAFT') return matchesSearch && e.status === 'DRAFT';
    if (statusFilter === 'REVERSED') return matchesSearch && e.isReversed;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D8E2EC] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2.5">
              <FileText className="text-[#E03616]" size={22} />
              Journal Entries & Fiscal Ledger
            </h1>
            <Badge variant="slateBlue">General Ledger</Badge>
          </div>
          <p className="mt-1 text-xs text-[#54657E]">
            Immutable double-entry debits and credits ledger with atomic balancing and reversing entry audit lineage.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold"
          >
            <Plus size={14} /> New Journal Entry
          </Button>
        </div>
      </div>

      {/* 2-Column Split: Entry list + Selected Entry Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Entry List Column */}
        <div className="lg:col-span-5 rounded-xl border border-[#D8E2EC] bg-white overflow-hidden shadow-xs">
          {/* Search & Status Filters */}
          <div className="p-3 border-b border-[#D8E2EC] bg-[#E8EEF5] space-y-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                placeholder="Search entry #, reference, or memo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-[#D8E2EC] bg-white pl-8 pr-2.5 py-1 text-xs text-[#0F172A] placeholder-[#64748B] focus:border-[#E03616] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto text-[10px]">
              {(['ALL', 'POSTED', 'DRAFT', 'REVERSED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-0.5 rounded font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                    statusFilter === st
                      ? 'bg-[#1B2436] text-white'
                      : 'text-[#54657E] hover:bg-[#D8E2EC]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-[#D8E2EC] max-h-[600px] overflow-y-auto">
            {filteredEntries.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#64748B]">
                No journal vouchers found matching filter.
              </div>
            ) : (
              filteredEntries.map((entry) => {
                const isSelected = selectedEntry?.id === entry.id;
                return (
                  <button
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    className={`w-full p-4 text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#F0F4F8] border-l-3 border-[#E03616]'
                        : 'hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#0F172A] text-xs">
                          {entry.entryNumber}
                        </span>
                        {entry.isReversed && (
                          <span className="text-[9px] font-bold font-mono px-1.5 py-0.2 rounded bg-orange-100 text-orange-800">
                            REVERSED
                          </span>
                        )}
                      </div>
                      <Badge variant={entry.status === 'POSTED' ? 'frost' : 'warning'}>
                        {entry.status}
                      </Badge>
                    </div>

                    <div className="mt-1 text-xs font-semibold text-[#1B2436] truncate">
                      {entry.memo}
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-[#54657E] font-mono">
                      <span>{formatDate(entry.date)}</span>
                      <span className="text-[#0F172A] font-bold tabular-nums">
                        {formatKES(entry.totalDebit)}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Entry Detail Column */}
        <div className="lg:col-span-7 rounded-xl border border-[#D8E2EC] bg-white p-6 shadow-xs space-y-6">
          {selectedEntry ? (
            <>
              <div className="flex items-start justify-between border-b border-[#D8E2EC] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-[#0F172A] font-mono">
                      {selectedEntry.entryNumber}
                    </h2>
                    <Badge variant={selectedEntry.status === 'POSTED' ? 'frost' : 'warning'}>
                      {selectedEntry.status}
                    </Badge>
                    {selectedEntry.isReversed && (
                      <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-900 font-mono text-[10px] font-bold">
                        REVERSED
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[#334155]">{selectedEntry.memo}</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="text-right text-xs">
                    <div className="text-[#64748B]">Reference:</div>
                    <div className="font-mono font-bold text-[#1B2436]">
                      {selectedEntry.reference}
                    </div>
                  </div>

                  {/* Reversing Entry Action Trigger */}
                  {selectedEntry.status === 'POSTED' && !selectedEntry.isReversed && canPostGL && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCreateReversal(selectedEntry)}
                      className="text-xs flex items-center gap-1.5 text-[#E03616] hover:bg-[#E03616]/5 border-[#E03616]/30"
                      title="Generate atomic reversing entry to cancel this transaction"
                    >
                      <RotateCcw size={12} /> Create Reversing Entry
                    </Button>
                  )}
                </div>
              </div>

              {/* Metadata strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#F8FAFC] p-3 rounded-lg border border-[#D8E2EC] text-xs">
                <div>
                  <span className="text-[10px] text-[#54657E] uppercase tracking-wider block font-semibold">Posting Date</span>
                  <span className="font-mono text-[#0F172A] font-medium">{formatDate(selectedEntry.date)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#54657E] uppercase tracking-wider block font-semibold">Posted By</span>
                  <span className="text-[#0F172A] font-medium truncate block">{selectedEntry.postedBy}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#54657E] uppercase tracking-wider block font-semibold">Audit Ledger</span>
                  <span className="text-emerald-700 font-mono font-semibold flex items-center gap-1">
                    <ShieldCheck size={12} /> Verified Balanced
                  </span>
                </div>
              </div>

              {/* Debit / Credit Distribution Table */}
              <div>
                <h3 className="text-xs font-bold text-[#1B2436] uppercase tracking-wider mb-2">
                  Double-Entry Ledger Allocations
                </h3>
                <div className="border border-[#D8E2EC] rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#E8EEF5] border-b border-[#D8E2EC] text-[11px] font-bold text-[#334155] uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Account</th>
                        <th className="py-2.5 px-3">Line Memo</th>
                        <th className="py-2.5 px-3 text-right">Debit (KES)</th>
                        <th className="py-2.5 px-3 text-right">Credit (KES)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D8E2EC] text-[#334155]">
                      {selectedEntry.lines.map((line: JournalLine) => (
                        <tr key={line.id} className="hover:bg-[#F8FAFC]">
                          <td className="py-2.5 px-3">
                            <span className="font-mono font-bold text-[#0F172A] mr-1.5">
                              {line.accountNumber}
                            </span>
                            <span className="text-[#334155]">{line.accountName}</span>
                          </td>
                          <td className="py-2.5 px-3 text-[#54657E] text-[11px]">
                            {line.description}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[#0F172A] font-medium">
                            {line.debit > 0 ? formatKES(line.debit) : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[#0F172A] font-medium">
                            {line.credit > 0 ? formatKES(line.credit) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t border-[#D8E2EC] bg-[#F8FAFC] font-mono font-bold text-xs text-[#0F172A]">
                      <tr>
                        <td colSpan={2} className="py-2.5 px-3 text-right uppercase tracking-wider text-[#54657E]">
                          Total Balancing Sum:
                        </td>
                        <td className="py-2.5 px-3 text-right text-emerald-700 tabular-nums">
                          {formatKES(selectedEntry.totalDebit)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-emerald-700 tabular-nums">
                          {formatKES(selectedEntry.totalCredit)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-[#64748B] text-xs">
              Select a journal entry on the left to inspect double-entry postings.
            </div>
          )}
        </div>
      </div>

      {/* New Journal Entry Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Double-Entry Journal Entry"
        description="Every journal voucher requires equal total debits and credits before posting to General Ledger."
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Posting Date <span className="text-[#E03616]">*</span>
              </label>
              <input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Reference / Voucher No.
              </label>
              <input
                type="text"
                placeholder="e.g. NCBA-TRF-0912 or INVOICE-SETTLE"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Memo / Purpose <span className="text-[#E03616]">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Monthly server hosting settlement & VAT allocation"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Allocation Lines */}
          <div className="space-y-2 pt-2 border-t border-[#D8E2EC]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1B2436]">Ledger Distribution Lines</span>
              <button
                type="button"
                onClick={handleAddLine}
                className="text-xs text-[#E03616] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Plus size={12} /> Add Line
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {lines.map((line, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 items-center bg-[#F8FAFC] p-2 rounded-lg border border-[#D8E2EC]"
                >
                  <div className="col-span-5">
                    <select
                      value={line.accountId}
                      onChange={(e) => handleLineChange(idx, 'accountId', e.target.value)}
                      className="w-full rounded border border-[#D8E2EC] bg-white px-2 py-1 text-xs text-[#0F172A] focus:outline-none"
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.accountNumber} - {a.name} ({a.type})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      placeholder="Debit KES"
                      value={line.debit || ''}
                      onChange={(e) => handleLineChange(idx, 'debit', parseFloat(e.target.value) || 0)}
                      className="w-full rounded border border-[#D8E2EC] bg-white px-2 py-1 text-xs text-[#0F172A] font-mono text-right"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      placeholder="Credit KES"
                      value={line.credit || ''}
                      onChange={(e) => handleLineChange(idx, 'credit', parseFloat(e.target.value) || 0)}
                      className="w-full rounded border border-[#D8E2EC] bg-white px-2 py-1 text-xs text-[#0F172A] font-mono text-right"
                    />
                  </div>
                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(idx)}
                      disabled={lines.length <= 2}
                      className="text-slate-400 hover:text-[#E03616] text-xs disabled:opacity-20 cursor-pointer font-bold"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Balancing check bar */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#E8EEF5] border border-[#D8E2EC] text-xs font-mono">
              <div className="flex items-center gap-4">
                <span>Total Debit: <strong className="text-[#0F172A]">{formatKES(totalDebit)}</strong></span>
                <span>Total Credit: <strong className="text-[#0F172A]">{formatKES(totalCredit)}</strong></span>
              </div>
              <div>
                {isBalanced ? (
                  <span className="text-emerald-700 flex items-center gap-1 font-bold">
                    <CheckCircle2 size={13} /> Balanced (Diff: 0.00)
                  </span>
                ) : (
                  <span className="text-[#E03616] flex items-center gap-1 font-bold">
                    <AlertTriangle size={13} /> Unbalanced Diff: {formatKES(Math.abs(totalDebit - totalCredit))}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#D8E2EC]">
            <div className="text-[11px] text-[#54657E]">
              {canPostGL ? (
                <span className="text-emerald-700 font-semibold">Clearance: Will be POSTED directly to GL</span>
              ) : (
                <span className="text-[#54657E] font-medium">Notice: Will save as DRAFT for review</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={!isBalanced}>
                {canPostGL ? 'Post to General Ledger' : 'Save Draft Entry'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
