import React from 'react';
import { FileText, Printer, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { PayslipRecord } from '@/types';
import { formatKES } from '@/lib/utils';

interface PayslipDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  payslip: PayslipRecord | null;
  periodLabel: string;
}

export function PayslipDetailModal({
  isOpen,
  onClose,
  payslip,
  periodLabel,
}: PayslipDetailModalProps) {
  if (!payslip) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Statutory Itemized Payslip"
      description={`Official employee remuneration advice for ${periodLabel} (Innowit Technologies Limited).`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Payslip Header Document in Slate Blue / White */}
        <div className="rounded-xl border border-[#D8E2EC] bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-start justify-between border-b border-[#D8E2EC] pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#1B2436] flex items-center justify-center font-bold text-white text-sm">
                IN
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Innowit Technologies Limited</h3>
                <span className="text-xs text-[#54657E]">
                  KRA PIN: P051234567Z • Westlands Commercial Hub, Nairobi
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 rounded bg-[#E8EEF5] px-2 py-0.5 text-[11px] font-mono font-bold text-[#1B2436]">
                <ShieldCheck size={12} className="text-[#E03616]" /> {periodLabel}
              </span>
              <div className="text-[10px] text-[#64748B] mt-1">Official Payment Advice</div>
            </div>
          </div>

          {/* Employee Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#F8FAFC] p-3 rounded-lg border border-[#D8E2EC] text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#64748B] block">Employee Name</span>
              <span className="font-bold text-[#0F172A]">{payslip.employeeName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#64748B] block">Employee Code</span>
              <span className="font-mono font-bold text-[#0F172A]">{payslip.employeeCode}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#64748B] block">KRA Tax PIN</span>
              <span className="font-mono font-bold text-[#0F172A]">{payslip.kraPin}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#64748B] block">Department</span>
              <span className="text-[#334155]">{payslip.departmentName}</span>
            </div>
          </div>

          {/* Remuneration & Deductions Two-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Column 1: Gross Remuneration Earnings */}
            <div className="rounded-lg border border-[#D8E2EC] p-3 bg-white">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B2436] pb-2 border-b border-[#D8E2EC] flex items-center justify-between">
                <span>Earnings & Emoluments</span>
                <span className="font-mono text-[#0F172A]">Amount (KES)</span>
              </h4>
              <div className="mt-2 space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-dashed border-[#E8EEF5]">
                  <span className="text-[#54657E]">Basic Salary</span>
                  <span className="tabular-nums font-semibold">{formatKES(payslip.basicSalaryKes)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-[#E8EEF5]">
                  <span className="text-[#54657E]">Housing & Transport Allowance</span>
                  <span className="tabular-nums font-semibold">{formatKES(payslip.allowancesKes)}</span>
                </div>
                <div className="flex justify-between py-1.5 font-bold text-[#0F172A] bg-[#F8FAFC] px-2 rounded">
                  <span>Gross Remuneration</span>
                  <span className="tabular-nums text-[#1B2436]">{formatKES(payslip.grossSalaryKes)}</span>
                </div>
              </div>
            </div>

            {/* Column 2: Statutory Deductions */}
            <div className="rounded-lg border border-[#D8E2EC] p-3 bg-white">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#E03616] pb-2 border-b border-[#D8E2EC] flex items-center justify-between">
                <span>Statutory Deductions</span>
                <span className="font-mono text-[#E03616]">Amount (KES)</span>
              </h4>
              <div className="mt-2 space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-dashed border-[#E8EEF5]">
                  <span className="text-[#54657E]">PAYE (Income Tax)</span>
                  <span className="tabular-nums font-semibold text-[#E03616]">
                    {formatKES(payslip.payeTaxKes)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-[#E8EEF5]">
                  <span className="text-[#54657E]">NSSF (Pension Fund)</span>
                  <span className="tabular-nums font-semibold">{formatKES(payslip.nssfDeductionKes)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-[#E8EEF5]">
                  <span className="text-[#54657E]">SHIF / NHIF (Health 2.75%)</span>
                  <span className="tabular-nums font-semibold">{formatKES(payslip.nhifDeductionKes)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-[#E8EEF5]">
                  <span className="text-[#54657E]">Affordable Housing Levy (1.5%)</span>
                  <span className="tabular-nums font-semibold">{formatKES(payslip.housingLevyKes)}</span>
                </div>
                <div className="flex justify-between py-1.5 font-bold text-[#E03616] bg-rose-50 px-2 rounded">
                  <span>Total Deductions</span>
                  <span className="tabular-nums">{formatKES(payslip.totalDeductionsKes)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Pay Highlight Banner */}
          <div className="rounded-xl border border-emerald-300 bg-emerald-50/80 p-4 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-emerald-800 tracking-wider block">
                Net Take-Home Pay Disbursed
              </span>
              <span className="text-[11px] text-emerald-900 mt-0.5 block">
                Electronic Bank Settlement via NCBA Clearing Switch
              </span>
            </div>
            <div className="font-mono text-2xl font-extrabold text-emerald-950 tabular-nums">
              {formatKES(payslip.netSalaryKes)}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex items-center gap-1.5"
          >
            <Printer size={14} /> Print / Save PDF
          </Button>

          <Button type="button" variant="primary" size="sm" onClick={onClose}>
            Close Payslip View
          </Button>
        </div>
      </div>
    </Modal>
  );
}
