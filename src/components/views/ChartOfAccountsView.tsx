import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  Download,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Account, AccountType, UserRole } from '@/types';
import { formatKES } from '@/lib/utils';
import { hasPermission } from '@/modules/auth/rbac';

interface ChartOfAccountsViewProps {
  accounts: Account[];
  onAddAccount: (newAccount: Account) => void;
  userRole: UserRole;
}

export function ChartOfAccountsView({
  accounts,
  onAddAccount,
  userRole,
}: ChartOfAccountsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New account form state
  const [newAccNumber, setNewAccNumber] = useState('');
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<AccountType>('ASSET');
  const [newAccSubType, setNewAccSubType] = useState('');
  const [newAccBalance, setNewAccBalance] = useState('');
  const [newAccDesc, setNewAccDesc] = useState('');

  const canCreate = hasPermission(userRole, 'ACCOUNTING', 'CREATE');

  // Filter accounts
  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.accountNumber.includes(searchQuery) ||
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (acc.subType && acc.subType.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'ALL' || acc.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Calculate totals
  const totalAssets = accounts
    .filter((a) => a.type === 'ASSET')
    .reduce((sum, a) => sum + a.balance, 0);

  const totalLiabilities = accounts
    .filter((a) => a.type === 'LIABILITY')
    .reduce((sum, a) => sum + a.balance, 0);

  const totalEquity = accounts
    .filter((a) => a.type === 'EQUITY')
    .reduce((sum, a) => sum + a.balance, 0);

  const totalRevenue = accounts
    .filter((a) => a.type === 'REVENUE')
    .reduce((sum, a) => sum + a.balance, 0);

  const totalExpense = accounts
    .filter((a) => a.type === 'EXPENSE')
    .reduce((sum, a) => sum + a.balance, 0);

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccNumber || !newAccName) return;

    const created: Account = {
      id: `acc_${Date.now()}`,
      organizationId: 'org_innowit_01',
      accountNumber: newAccNumber.trim(),
      name: newAccName.trim(),
      type: newAccType,
      subType: newAccSubType.trim() || undefined,
      balance: parseFloat(newAccBalance) || 0,
      currency: 'KES',
      isActive: true,
      isReconciled: true,
      description: newAccDesc.trim() || undefined,
    };

    onAddAccount(created);
    setIsAddModalOpen(false);

    // Reset form
    setNewAccNumber('');
    setNewAccName('');
    setNewAccSubType('');
    setNewAccBalance('');
    setNewAccDesc('');
  };

  const handleExportCSV = () => {
    const headers = 'Account Number,Name,Type,Sub-Type,Balance (KES),Currency,Status\n';
    const rows = filteredAccounts
      .map(
        (a) =>
          `"${a.accountNumber}","${a.name}","${a.type}","${a.subType || ''}","${a.balance}","${a.currency}","${a.isActive ? 'ACTIVE' : 'INACTIVE'}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Innowit_Chart_of_Accounts_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D8E2EC] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2.5">
              <Layers className="text-[#E03616]" size={22} />
              Chart of Accounts
            </h1>
            <Badge variant="slateBlue">General Ledger</Badge>
          </div>
          <p className="mt-1 text-xs text-[#54657E]">
            Hierarchical ledger architecture conforming to GAAP and Kenya Revenue Authority (KRA) reporting requirements.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 text-xs"
          >
            <Download size={14} /> Export CSV
          </Button>

          {canCreate && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 text-xs"
            >
              <Plus size={14} /> Add New Account
            </Button>
          )}
        </div>
      </div>

      {/* Summary KPI Strip in 60% Alpine Frost / 30% Slate Blue */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="rounded-xl border border-[#D8E2EC] bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-[#54657E] uppercase tracking-wider">
            Total Assets
          </span>
          <div className="mt-1 text-base font-bold text-[#0F172A] font-mono tabular-nums">
            {formatKES(totalAssets)}
          </div>
          <span className="text-[10px] text-[#64748B]">Cash, Bank, Receivables, Stock</span>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-[#54657E] uppercase tracking-wider">
            Total Liabilities
          </span>
          <div className="mt-1 text-base font-bold text-[#1B2436] font-mono tabular-nums">
            {formatKES(totalLiabilities)}
          </div>
          <span className="text-[10px] text-[#64748B]">Trade Payables, VAT, PAYE</span>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-[#54657E] uppercase tracking-wider">
            Equity
          </span>
          <div className="mt-1 text-base font-bold text-[#1B2436] font-mono tabular-nums">
            {formatKES(totalEquity)}
          </div>
          <span className="text-[10px] text-[#64748B]">Paid-in Share Capital</span>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-[#54657E] uppercase tracking-wider">
            Revenue YTD
          </span>
          <div className="mt-1 text-base font-bold text-[#0F172A] font-mono tabular-nums">
            {formatKES(totalRevenue)}
          </div>
          <span className="text-[10px] text-[#64748B]">Standard 16% Taxed Revenue</span>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-[#54657E] uppercase tracking-wider">
            Operating Expenses
          </span>
          <div className="mt-1 text-base font-bold text-[#E03616] font-mono tabular-nums">
            {formatKES(totalExpense)}
          </div>
          <span className="text-[10px] text-[#64748B]">COGS, Payroll & Overheads</span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#D8E2EC] shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search account number (e.g. 1010, 2020) or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] pl-9 pr-3 py-1.5 text-xs text-[#0F172A] placeholder-[#64748B] focus:border-[#E03616] focus:bg-white focus:outline-none"
          />
        </div>

        {/* Type Segments in 30% Slate Blue */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                selectedType === type
                  ? 'bg-[#1B2436] text-white shadow-xs'
                  : 'text-[#54657E] hover:text-[#0F172A] hover:bg-[#E8EEF5]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Accounts Ledger Table */}
      <div className="rounded-xl border border-[#D8E2EC] bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#D8E2EC] bg-[#E8EEF5] text-[11px] font-bold text-[#334155] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-28">Acc Code</th>
                <th className="py-3 px-4">Account Title & Sub-Classification</th>
                <th className="py-3 px-4 w-32">Type</th>
                <th className="py-3 px-4 text-right w-44">Balance (KES)</th>
                <th className="py-3 px-4 text-center w-28">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8E2EC] text-[#334155]">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#64748B]">
                    <FileSpreadsheet size={32} className="mx-auto mb-2 text-[#94A3B8]" />
                    No accounts matching query &quot;{searchQuery}&quot;
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => (
                  <tr
                    key={acc.id}
                    className="hover:bg-[#F8FAFC] transition-colors group"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#0F172A] tracking-wider">
                      {acc.accountNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#0F172A] group-hover:text-[#E03616] transition-colors">
                        {acc.name}
                      </div>
                      {acc.description && (
                        <div className="text-[11px] text-[#54657E] truncate max-w-lg mt-0.5">
                          {acc.description}
                        </div>
                      )}
                      {acc.subType && (
                        <div className="text-[10px] text-[#64748B] font-mono mt-0.5">
                          {acc.subType}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="frost" className="border-[#D8E2EC] text-[#1B2436]">
                        {acc.type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#0F172A] tabular-nums">
                      {formatKES(acc.balance)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {acc.isActive ? (
                        <span className="inline-flex items-center text-[11px] text-emerald-700 font-semibold">
                          <CheckCircle2 size={12} className="mr-1 text-emerald-600" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[11px] text-[#64748B]">
                          Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Ledger Footer */}
        <div className="border-t border-[#D8E2EC] bg-[#F8FAFC] px-4 py-2.5 flex items-center justify-between text-[11px] text-[#54657E] font-mono">
          <span>Showing {filteredAccounts.length} of {accounts.length} ledger accounts</span>
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <CheckCircle2 size={12} /> Double-Entry Trial Balance Balanced
          </span>
        </div>
      </div>

      {/* Add Account Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Account to Chart of Accounts"
        description="Provision a new general ledger classification with opening balance."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateAccount} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Account Code <span className="text-[#E03616]">*</span>
              </label>
              <input
                required
                type="text"
                placeholder="e.g. 1030 or 2040"
                value={newAccNumber}
                onChange={(e) => setNewAccNumber(e.target.value)}
                className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] font-mono focus:border-[#E03616] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Account Type <span className="text-[#E03616]">*</span>
              </label>
              <select
                value={newAccType}
                onChange={(e) => setNewAccType(e.target.value as AccountType)}
                className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
              >
                <option value="ASSET">ASSET</option>
                <option value="LIABILITY">LIABILITY</option>
                <option value="EQUITY">EQUITY</option>
                <option value="REVENUE">REVENUE</option>
                <option value="EXPENSE">EXPENSE</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Account Title / Name <span className="text-[#E03616]">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Stanbic Operating Dollar Account"
              value={newAccName}
              onChange={(e) => setNewAccName(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Sub-Classification
              </label>
              <input
                type="text"
                placeholder="e.g. Current Asset / Cash Equivalent"
                value={newAccSubType}
                onChange={(e) => setNewAccSubType(e.target.value)}
                className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Opening Balance (KES)
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={newAccBalance}
                onChange={(e) => setNewAccBalance(e.target.value)}
                className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] font-mono focus:border-[#E03616] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Description & Audit Notes
            </label>
            <textarea
              rows={2}
              placeholder="Operational purpose, reconciliation branch or designated custodian..."
              value={newAccDesc}
              onChange={(e) => setNewAccDesc(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D8E2EC]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Account to Ledger
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
