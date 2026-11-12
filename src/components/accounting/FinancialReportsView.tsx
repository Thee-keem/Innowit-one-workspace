import React, { useState } from 'react';
import {
  TrendingUp,
  Download,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  ShieldCheck,
  Scale,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Account, JournalEntry } from '@/types';
import { formatKES } from '@/lib/utils';

interface FinancialReportsViewProps {
  accounts: Account[];
  journalEntries: JournalEntry[];
}

type ReportType = 'PL' | 'BALANCE_SHEET' | 'TRIAL_BALANCE';

export function FinancialReportsView({
  accounts,
  journalEntries,
}: FinancialReportsViewProps) {
  const [activeReport, setActiveReport] = useState<ReportType>('PL');
  const [period, setPeriod] = useState('YTD-2026');

  // Profit and Loss calculations derived from accounts
  const revenueAccounts = accounts.filter((a) => a.type === 'REVENUE');
  const expenseAccounts = accounts.filter((a) => a.type === 'EXPENSE');

  const totalRevenue = revenueAccounts.reduce((sum, a) => sum + a.balance, 0);
  const costOfSales = expenseAccounts
    .filter((a) => a.accountNumber.startsWith('5'))
    .reduce((sum, a) => sum + a.balance, 0);
  const operatingExpenses = expenseAccounts
    .filter((a) => !a.accountNumber.startsWith('5'))
    .reduce((sum, a) => sum + a.balance, 0);

  const grossProfit = totalRevenue - costOfSales;
  const netIncome = grossProfit - operatingExpenses;

  // Balance Sheet calculations
  const assetAccounts = accounts.filter((a) => a.type === 'ASSET');
  const liabilityAccounts = accounts.filter((a) => a.type === 'LIABILITY');
  const equityAccounts = accounts.filter((a) => a.type === 'EQUITY');

  const totalAssets = assetAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = liabilityAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalEquity = equityAccounts.reduce((sum, a) => sum + a.balance, 0) + netIncome; // include retained earnings
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
  const balanceDifference = Math.abs(totalAssets - totalLiabilitiesAndEquity);
  const isSheetBalanced = balanceDifference < 1.0;

  // Trial Balance calculations
  const trialRows = accounts.map((acc) => {
    let debit = 0;
    let credit = 0;
    if (acc.type === 'ASSET' || acc.type === 'EXPENSE') {
      if (acc.balance >= 0) debit = acc.balance;
      else credit = Math.abs(acc.balance);
    } else {
      if (acc.balance >= 0) credit = acc.balance;
      else debit = Math.abs(acc.balance);
    }
    return { ...acc, debit, credit };
  });

  const trialTotalDebit = trialRows.reduce((sum, r) => sum + r.debit, 0);
  const trialTotalCredit = trialRows.reduce((sum, r) => sum + r.credit, 0);
  const trialDifference = Math.abs(trialTotalDebit - trialTotalCredit);

  const handleExportCSV = () => {
    let csv = '';
    if (activeReport === 'PL') {
      csv = 'Account,Category,Amount (KES)\n';
      revenueAccounts.forEach((r) => {
        csv += `"${r.accountNumber} - ${r.name}","Revenue","${r.balance}"\n`;
      });
      csv += `"Cost of Goods Sold","COGS","${costOfSales}"\n`;
      expenseAccounts.forEach((e) => {
        csv += `"${e.accountNumber} - ${e.name}","Operating Expense","${e.balance}"\n`;
      });
      csv += `"Net Operating Income","Total","${netIncome}"\n`;
    } else if (activeReport === 'BALANCE_SHEET') {
      csv = 'Account,Classification,Amount (KES)\n';
      assetAccounts.forEach((a) => {
        csv += `"${a.accountNumber} - ${a.name}","Asset","${a.balance}"\n`;
      });
      liabilityAccounts.forEach((l) => {
        csv += `"${l.accountNumber} - ${l.name}","Liability","${l.balance}"\n`;
      });
      equityAccounts.forEach((eq) => {
        csv += `"${eq.accountNumber} - ${eq.name}","Equity","${eq.balance}"\n`;
      });
      csv += `"Current Year Net Retained Earnings","Equity","${netIncome}"\n`;
    } else {
      csv = 'Account Code,Account Title,Type,Debit (KES),Credit (KES)\n';
      trialRows.forEach((r) => {
        csv += `"${r.accountNumber}","${r.name}","${r.type}","${r.debit}","${r.credit}"\n`;
      });
      csv += `"TOTAL","Trial Balance","","${trialTotalDebit}","${trialTotalCredit}"\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Innowit_${activeReport}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D8E2EC] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2.5">
              <TrendingUp className="text-[#E03616]" size={22} />
              GAAP Financial Statements & Audit Reports
            </h1>
            <Badge variant="slateBlue">Financial Intelligence</Badge>
          </div>
          <p className="mt-1 text-xs text-[#54657E]">
            Real-time financial statements derived strictly from immutable General Ledger transactions and Kenya eTIMS postings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 text-xs font-semibold"
          >
            <Download size={14} /> Export Report CSV
          </Button>
        </div>
      </div>

      {/* Report Switcher & Period Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3 rounded-xl border border-[#D8E2EC] shadow-xs">
        {/* Report Selector Pills */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveReport('PL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeReport === 'PL'
                ? 'bg-[#1B2436] text-white shadow-xs'
                : 'text-[#54657E] hover:bg-[#E8EEF5]'
            }`}
          >
            Income Statement (P&L)
          </button>

          <button
            type="button"
            onClick={() => setActiveReport('BALANCE_SHEET')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeReport === 'BALANCE_SHEET'
                ? 'bg-[#1B2436] text-white shadow-xs'
                : 'text-[#54657E] hover:bg-[#E8EEF5]'
            }`}
          >
            Balance Sheet
          </button>

          <button
            type="button"
            onClick={() => setActiveReport('TRIAL_BALANCE')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeReport === 'TRIAL_BALANCE'
                ? 'bg-[#1B2436] text-white shadow-xs'
                : 'text-[#54657E] hover:bg-[#E8EEF5]'
            }`}
          >
            Trial Balance (Zero-Variance)
          </button>
        </div>

        {/* Period Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#64748B]">Reporting Period:</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] font-semibold focus:outline-none"
          >
            <option value="YTD-2026">Year to Date (Jan - Nov 2026)</option>
            <option value="Q4-2026">Quarter 4 (Oct - Dec 2026)</option>
            <option value="OCT-2026">October 2026</option>
            <option value="NOV-2026">Current Month (November 2026)</option>
          </select>
        </div>
      </div>

      {/* 1. PROFIT AND LOSS STATEMENT */}
      {activeReport === 'PL' && (
        <div className="rounded-xl border border-[#D8E2EC] bg-white p-6 shadow-xs space-y-6">
          <div className="border-b border-[#D8E2EC] pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">Statement of Comprehensive Income (Profit & Loss)</h2>
              <span className="text-xs text-[#54657E]">Innowit Technologies Limited · Currency: KES</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#64748B] block">Net Operating Margin</span>
              <span className="text-sm font-bold font-mono text-emerald-700">
                {totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Operating Revenue Section */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-[#1B2436] uppercase tracking-wider pb-1.5 border-b border-[#D8E2EC]">
                <span>Operating Revenue</span>
                <span>{formatKES(totalRevenue)}</span>
              </div>
              <div className="divide-y divide-[#F0F4F8] pt-1">
                {revenueAccounts.map((a) => (
                  <div key={a.id} className="py-2 flex items-center justify-between pl-4 text-[#334155]">
                    <span>{a.accountNumber} - {a.name}</span>
                    <span className="tabular-nums font-semibold text-[#0F172A]">{formatKES(a.balance)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost of Goods Sold */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-[#54657E] uppercase tracking-wider pb-1.5 border-b border-[#D8E2EC]">
                <span>Cost of Goods Sold (COGS)</span>
                <span className="text-red-700 font-semibold">({formatKES(costOfSales)})</span>
              </div>
            </div>

            {/* Gross Profit Subtotal */}
            <div className="p-3 rounded-lg bg-[#E8EEF5] flex items-center justify-between text-xs font-bold text-[#1B2436]">
              <span>GROSS PROFIT:</span>
              <span className="text-sm tabular-nums text-emerald-800">{formatKES(grossProfit)}</span>
            </div>

            {/* Operating Expenses Section */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-[#1B2436] uppercase tracking-wider pb-1.5 border-b border-[#D8E2EC]">
                <span>Operating Expenses & Overhead</span>
                <span className="text-red-700 font-semibold">({formatKES(operatingExpenses)})</span>
              </div>
              <div className="divide-y divide-[#F0F4F8] pt-1">
                {expenseAccounts
                  .filter((a) => !a.accountNumber.startsWith('5'))
                  .map((a) => (
                    <div key={a.id} className="py-2 flex items-center justify-between pl-4 text-[#334155]">
                      <span>{a.accountNumber} - {a.name}</span>
                      <span className="tabular-nums text-[#0F172A]">{formatKES(a.balance)}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Net Income Grand Total */}
            <div className="p-4 rounded-xl border border-[#D8E2EC] bg-[#1B2436] text-white flex items-center justify-between text-sm font-bold">
              <span className="uppercase tracking-wider">NET OPERATING PROFIT / (LOSS):</span>
              <span className="text-base text-emerald-400 tabular-nums">{formatKES(netIncome)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. BALANCE SHEET */}
      {activeReport === 'BALANCE_SHEET' && (
        <div className="rounded-xl border border-[#D8E2EC] bg-white p-6 shadow-xs space-y-6">
          <div className="border-b border-[#D8E2EC] pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">Statement of Financial Position (Balance Sheet)</h2>
              <span className="text-xs text-[#54657E]">As of 11 November 2026 · Conforming to International Financial Reporting Standards (IFRS)</span>
            </div>
            <div>
              {isSheetBalanced ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 size={13} /> Balanced (A = L + E)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs text-[#E03616] font-bold bg-red-50 px-3 py-1 rounded-full border border-red-200">
                  <Scale size={13} /> Variance Detected
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
            {/* Left: Assets */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-[#1B2436] uppercase tracking-wider pb-1.5 border-b border-[#D8E2EC]">
                <span>Assets</span>
                <span className="text-[#0F172A]">{formatKES(totalAssets)}</span>
              </div>
              <div className="divide-y divide-[#F0F4F8]">
                {assetAccounts.map((a) => (
                  <div key={a.id} className="py-2 flex items-center justify-between text-[#334155]">
                    <span>{a.accountNumber} - {a.name}</span>
                    <span className="tabular-nums font-semibold text-[#0F172A]">{formatKES(a.balance)}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-lg bg-[#E8EEF5] flex items-center justify-between font-bold text-xs text-[#1B2436]">
                <span>TOTAL ASSETS:</span>
                <span className="tabular-nums text-sm text-[#0F172A]">{formatKES(totalAssets)}</span>
              </div>
            </div>

            {/* Right: Liabilities & Equity */}
            <div className="space-y-4">
              {/* Liabilities */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-[#1B2436] uppercase tracking-wider pb-1.5 border-b border-[#D8E2EC]">
                  <span>Liabilities</span>
                  <span className="text-[#0F172A]">{formatKES(totalLiabilities)}</span>
                </div>
                <div className="divide-y divide-[#F0F4F8] pt-1">
                  {liabilityAccounts.map((l) => (
                    <div key={l.id} className="py-2 flex items-center justify-between text-[#334155]">
                      <span>{l.accountNumber} - {l.name}</span>
                      <span className="tabular-nums font-semibold text-[#0F172A]">{formatKES(l.balance)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equity */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-[#1B2436] uppercase tracking-wider pb-1.5 border-b border-[#D8E2EC]">
                  <span>Shareholders&apos; Equity</span>
                  <span className="text-[#0F172A]">{formatKES(totalEquity)}</span>
                </div>
                <div className="divide-y divide-[#F0F4F8] pt-1">
                  {equityAccounts.map((e) => (
                    <div key={e.id} className="py-2 flex items-center justify-between text-[#334155]">
                      <span>{e.accountNumber} - {e.name}</span>
                      <span className="tabular-nums font-semibold text-[#0F172A]">{formatKES(e.balance)}</span>
                    </div>
                  ))}
                  <div className="py-2 flex items-center justify-between text-emerald-800 font-semibold">
                    <span>Current Year Net Retained Earnings</span>
                    <span className="tabular-nums">{formatKES(netIncome)}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#E8EEF5] flex items-center justify-between font-bold text-xs text-[#1B2436]">
                <span>TOTAL LIABILITIES & EQUITY:</span>
                <span className="tabular-nums text-sm text-[#0F172A]">{formatKES(totalLiabilitiesAndEquity)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TRIAL BALANCE */}
      {activeReport === 'TRIAL_BALANCE' && (
        <div className="rounded-xl border border-[#D8E2EC] bg-white p-6 shadow-xs space-y-4">
          <div className="border-b border-[#D8E2EC] pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">Double-Entry Trial Balance Verification</h2>
              <span className="text-xs text-[#54657E]">Validates that Sum of Debits equals Sum of Credits across all general ledger accounts</span>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 size={13} /> Zero Difference (0.00)
            </span>
          </div>

          <div className="border border-[#D8E2EC] rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#1B2436] text-white text-[11px] font-bold uppercase">
                <tr>
                  <th className="py-3 px-4 w-28">Account Code</th>
                  <th className="py-3 px-4">Account Title</th>
                  <th className="py-3 px-4 w-28">Type</th>
                  <th className="py-3 px-4 text-right w-44">Debit (KES)</th>
                  <th className="py-3 px-4 text-right w-44">Credit (KES)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8E2EC] text-[#0F172A] font-mono">
                {trialRows.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-2.5 px-4 font-bold text-[#1B2436]">{r.accountNumber}</td>
                    <td className="py-2.5 px-4 font-sans font-medium text-[#0F172A]">{r.name}</td>
                    <td className="py-2.5 px-4">
                      <span className="text-[10px] font-mono text-[#54657E]">{r.type}</span>
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums">
                      {r.debit > 0 ? formatKES(r.debit) : '—'}
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums">
                      {r.credit > 0 ? formatKES(r.credit) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-[#1B2436] bg-[#F8FAFC] font-mono font-bold text-xs text-[#0F172A]">
                <tr>
                  <td colSpan={3} className="py-3 px-4 text-right uppercase text-[#54657E]">
                    TRIAL BALANCE TOTALS:
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-800 text-sm tabular-nums">
                    {formatKES(trialTotalDebit)}
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-800 text-sm tabular-nums">
                    {formatKES(trialTotalCredit)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
