import React, { useState } from 'react';
import { Calculator, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { EmployeeRecord, PayrollRunRecord } from '@/types';
import { generatePayrollRun } from '@/data/erpSeed';
import { formatKES } from '@/lib/utils';

interface NewPayrollRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: EmployeeRecord[];
  userFullName: string;
  onCreatePayrollRun: (run: PayrollRunRecord) => void;
}

export function NewPayrollRunModal({
  isOpen,
  onClose,
  employees,
  userFullName,
  onCreatePayrollRun,
}: NewPayrollRunModalProps) {
  const [month, setMonth] = useState('December');
  const [year, setYear] = useState('2026');

  // Preview generated run
  const previewRun = generatePayrollRun(month, parseInt(year) || 2026, employees);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreatePayrollRun({
      ...previewRun,
      approvedBy: userFullName,
      approvedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'APPROVED',
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Execute Statutory Kenyan Payroll Run"
      description="Calculate monthly gross salaries, progressive PAYE tax bands, NSSF Tier I/II, SHIF (2.75%), and Affordable Housing Levy (1.5%)."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Pay Period Month <span className="text-[#E03616]">*</span>
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            >
              {[
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
              ].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Fiscal Year <span className="text-[#E03616]">*</span>
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            >
              <option value="2026">2026 (Current Fiscal Year)</option>
              <option value="2027">2027</option>
            </select>
          </div>
        </div>

        {/* Regulatory Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] p-3 text-xs">
            <span className="text-[10px] uppercase font-bold text-[#64748B] block">Total Gross Pay</span>
            <div className="font-mono text-sm font-bold text-[#0F172A] mt-1 tabular-nums">
              {formatKES(previewRun.totalGrossKes)}
            </div>
            <span className="text-[10px] text-[#64748B]">{previewRun.employeeCount} Active Staff</span>
          </div>

          <div className="rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] p-3 text-xs">
            <span className="text-[10px] uppercase font-bold text-[#64748B] block">PAYE (KRA Tax)</span>
            <div className="font-mono text-sm font-bold text-[#E03616] mt-1 tabular-nums">
              {formatKES(previewRun.totalPayeKes)}
            </div>
            <span className="text-[10px] text-[#64748B]">Progressive Brackets</span>
          </div>

          <div className="rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] p-3 text-xs">
            <span className="text-[10px] uppercase font-bold text-[#64748B] block">Statutory Levies</span>
            <div className="font-mono text-sm font-bold text-[#1B2436] mt-1 tabular-nums">
              {formatKES(previewRun.totalNssfKes + previewRun.totalNhifKes + previewRun.totalHousingLevyKes)}
            </div>
            <span className="text-[10px] text-[#64748B]">NSSF + SHIF + Housing</span>
          </div>

          <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-xs">
            <span className="text-[10px] uppercase font-bold text-emerald-800 block">Total Net Disbursement</span>
            <div className="font-mono text-sm font-bold text-emerald-950 mt-1 tabular-nums">
              {formatKES(previewRun.totalNetPayKes)}
            </div>
            <span className="text-[10px] text-emerald-700">Bank clearing float</span>
          </div>
        </div>

        {/* Statutory Formula Breakdown */}
        <div className="rounded-xl border border-[#D8E2EC] bg-[#E8EEF5]/60 p-3.5 text-xs space-y-1.5">
          <div className="font-bold text-[#1B2436] flex items-center gap-1.5 text-xs">
            <Calculator size={14} className="text-[#E03616]" />
            Kenya Statutory Deduction Breakdown ({previewRun.periodLabel})
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-[#D8E2EC] text-[11px] font-mono">
            <div>
              <span className="text-[#64748B] block">PAYE Tax:</span>
              <span className="font-bold text-[#0F172A]">{formatKES(previewRun.totalPayeKes)}</span>
            </div>
            <div>
              <span className="text-[#64748B] block">NSSF (Tier I & II):</span>
              <span className="font-bold text-[#0F172A]">{formatKES(previewRun.totalNssfKes)}</span>
            </div>
            <div>
              <span className="text-[#64748B] block">SHIF / NHIF (2.75%):</span>
              <span className="font-bold text-[#0F172A]">{formatKES(previewRun.totalNhifKes)}</span>
            </div>
            <div>
              <span className="text-[#64748B] block">Housing Levy (1.5%):</span>
              <span className="font-bold text-[#0F172A]">{formatKES(previewRun.totalHousingLevyKes)}</span>
            </div>
          </div>
        </div>

        {/* Employee List Preview */}
        <div className="rounded-xl border border-[#D8E2EC] bg-white overflow-hidden max-h-48 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[10px] font-bold text-[#54657E] uppercase border-b border-[#D8E2EC] sticky top-0">
              <tr>
                <th className="py-2 px-3">Employee</th>
                <th className="py-2 px-3 text-right">Gross Pay</th>
                <th className="py-2 px-3 text-right">PAYE</th>
                <th className="py-2 px-3 text-right">NSSF/SHIF/AHL</th>
                <th className="py-2 px-3 text-right">Net Salary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8E2EC]">
              {previewRun.payslips.map((p) => (
                <tr key={p.id} className="hover:bg-[#F8FAFC]">
                  <td className="py-2 px-3">
                    <span className="font-semibold text-[#0F172A]">{p.employeeName}</span>
                    <span className="text-[10px] text-[#64748B] block font-mono">{p.kraPin}</span>
                  </td>
                  <td className="py-2 px-3 text-right font-mono tabular-nums text-[#0F172A]">
                    {formatKES(p.grossSalaryKes)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono tabular-nums text-[#E03616]">
                    {formatKES(p.payeTaxKes)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono tabular-nums text-[#54657E]">
                    {formatKES(p.nssfDeductionKes + p.nhifDeductionKes + p.housingLevyKes)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold tabular-nums text-emerald-800">
                    {formatKES(p.netSalaryKes)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D8E2EC]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" className="flex items-center gap-1.5">
            <CheckCircle2 size={14} /> Approve & Generate {month} Payroll
          </Button>
        </div>
      </form>
    </Modal>
  );
}
