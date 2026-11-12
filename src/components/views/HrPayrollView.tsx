import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Calculator,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  SlidersHorizontal,
  Search,
  Printer,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  UserRole,
  DepartmentRecord,
  EmployeeRecord,
  PayrollRunRecord,
  PayslipRecord,
  AttendanceRecord,
  LeaveRequestRecord,
  JournalEntry,
} from '@/types';
import { formatKES } from '@/lib/utils';
import { hasPermission } from '@/modules/auth/rbac';
import { NewPayrollRunModal } from '@/components/erp/hr/NewPayrollRunModal';
import { PayslipDetailModal } from '@/components/erp/hr/PayslipDetailModal';
import { CreateEmployeeModal } from '@/components/erp/hr/CreateEmployeeModal';
import { LeaveRequestModal } from '@/components/erp/hr/LeaveRequestModal';

interface HrPayrollViewProps {
  departments: DepartmentRecord[];
  employees: EmployeeRecord[];
  payrollRuns: PayrollRunRecord[];
  attendance: AttendanceRecord[];
  leaveRequests: LeaveRequestRecord[];
  userRole: UserRole;
  userFullName: string;
  onAddEmployee: (emp: EmployeeRecord) => void;
  onCreatePayrollRun: (run: PayrollRunRecord) => void;
  onPostPayrollToGl: (runId: string, journalEntry: JournalEntry) => void;
  onSubmitLeave: (req: LeaveRequestRecord) => void;
  onUpdateLeaveStatus: (leaveId: string, status: 'APPROVED' | 'REJECTED') => void;
}

type HrTab = 'payroll' | 'employees' | 'tax_engine' | 'attendance';

export function HrPayrollView({
  departments,
  employees,
  payrollRuns,
  attendance,
  leaveRequests,
  userRole,
  userFullName,
  onAddEmployee,
  onCreatePayrollRun,
  onPostPayrollToGl,
  onSubmitLeave,
  onUpdateLeaveStatus,
}: HrPayrollViewProps) {
  const [activeTab, setActiveTab] = useState<HrTab>('payroll');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');

  // Modals
  const [isNewRunModalOpen, setIsNewRunModalOpen] = useState(false);
  const [isCreateEmployeeOpen, setIsCreateEmployeeOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipRecord | null>(null);
  const [selectedPeriodLabel, setSelectedPeriodLabel] = useState('November 2026');

  // Simulator State for Kenyan Tax Engine
  const [simSalary, setSimSalary] = useState('180000');
  const [simAllowances, setSimAllowances] = useState('30000');

  const canCreate = hasPermission(userRole, 'HR_PAYROLL', 'CREATE');
  const canApprove = hasPermission(userRole, 'HR_PAYROLL', 'APPROVE');
  const canPostGl = hasPermission(userRole, 'HR_PAYROLL', 'POST_GL');

  // Active metrics
  const activeEmployees = employees.filter((e) => e.isActive);
  const latestRun = payrollRuns[0];
  const pendingLeaves = leaveRequests.filter((l) => l.status === 'PENDING').length;

  const handleOpenPayslip = (payslip: PayslipRecord, periodLabel: string) => {
    setSelectedPayslip(payslip);
    setSelectedPeriodLabel(periodLabel);
  };

  const handlePostRunToGl = (run: PayrollRunRecord) => {
    if (run.status === 'POSTED_TO_GL') return;

    const jeNumber = `JE-PAY-${run.year}-${run.month.toUpperCase().slice(0, 3)}`;

    // Balanced Atomic Journal Entry for Payroll:
    // Dr 6010 Salaries & Wages Expense (Total Gross)
    // Cr 2030 PAYE Tax Payable (KRA Liability)
    // Cr 2040 NSSF / NHIF Statutory Social Liabilities
    // Cr 2050 Housing Levy Payable
    // Cr 2060 Net Salaries Payable / Bank Clearing (Net Disbursement)
    const journalEntry: JournalEntry = {
      id: `je_pay_${run.id}`,
      entryNumber: jeNumber,
      date: new Date().toISOString().slice(0, 10),
      reference: run.runNumber,
      memo: `Statutory Payroll GL Posting for ${run.periodLabel} (${run.employeeCount} active staff)`,
      postedBy: userFullName,
      createdBy: userFullName,
      status: 'POSTED',
      postedAt: new Date().toISOString(),
      sourceModule: 'HR_PAYROLL',
      lines: [
        {
          id: `line_pay_1_${Date.now()}`,
          accountId: 'acc_6010',
          accountNumber: '6010',
          accountName: 'Salaries & Wages Expense',
          description: `Total gross payroll expense for ${run.periodLabel}`,
          debit: run.totalGrossKes,
          credit: 0,
        },
        {
          id: `line_pay_2_${Date.now()}`,
          accountId: 'acc_2030',
          accountNumber: '2030',
          accountName: 'PAYE Tax Payable',
          description: `KRA Pay-As-You-Earn tax deduction liability (${run.periodLabel})`,
          debit: 0,
          credit: run.totalPayeKes,
        },
        {
          id: `line_pay_3_${Date.now()}`,
          accountId: 'acc_2020',
          accountNumber: '2040',
          accountName: 'Statutory Social Liabilities (NSSF & SHIF)',
          description: `Social security and health insurance contributions liability`,
          debit: 0,
          credit: run.totalNssfKes + run.totalNhifKes,
        },
        {
          id: `line_pay_4_${Date.now()}`,
          accountId: 'acc_2020',
          accountNumber: '2050',
          accountName: 'Affordable Housing Levy Payable',
          description: `Government 1.5% Housing levy deductions`,
          debit: 0,
          credit: run.totalHousingLevyKes,
        },
        {
          id: `line_pay_5_${Date.now()}`,
          accountId: 'acc_1020',
          accountNumber: '1020',
          accountName: 'Operating Bank Account (KES)',
          description: `Net electronic funds disbursement to staff bank accounts`,
          debit: 0,
          credit: run.totalNetPayKes,
        },
      ],
      totalDebit: run.totalGrossKes,
      totalCredit:
        run.totalPayeKes +
        (run.totalNssfKes + run.totalNhifKes) +
        run.totalHousingLevyKes +
        run.totalNetPayKes,
    };

    onPostPayrollToGl(run.id, journalEntry);
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesDept = selectedDeptFilter === 'ALL' || emp.departmentId === selectedDeptFilter;
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.kraPin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDept && matchesSearch;
  });

  // Simulator Calculations
  const simBasic = parseFloat(simSalary) || 0;
  const simAllow = parseFloat(simAllowances) || 0;
  const simGross = simBasic + simAllow;
  const simNssf = Math.min(2160, Math.round(simGross * 0.06));
  const simTaxable = Math.max(0, simGross - simNssf);

  let simGrossTax = 0;
  let rem = simTaxable;
  const b1 = Math.min(rem, 24000);
  simGrossTax += b1 * 0.1;
  rem -= b1;
  if (rem > 0) {
    const b2 = Math.min(rem, 8333);
    simGrossTax += b2 * 0.25;
    rem -= b2;
  }
  if (rem > 0) {
    const b3 = Math.min(rem, 467667);
    simGrossTax += b3 * 0.3;
    rem -= b3;
  }
  if (rem > 0) {
    const b4 = Math.min(rem, 300000);
    simGrossTax += b4 * 0.325;
    rem -= b4;
  }
  if (rem > 0) simGrossTax += rem * 0.35;

  const simPaye = Math.max(0, Math.round(simGrossTax - 2400));
  const simNhif = Math.round(simGross * 0.0275);
  const simHousing = Math.round(simGross * 0.015);
  const simTotalDeductions = simPaye + simNssf + simNhif + simHousing;
  const simNet = simGross - simTotalDeductions;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D8E2EC] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2.5">
              <UserCheck className="text-[#E03616]" size={22} />
              Human Resources & Statutory Kenyan Payroll
            </h1>
            <Badge variant="slateBlue">Statutory HR</Badge>
          </div>
          <p className="mt-1 text-xs text-[#54657E]">
            Kenya Finance Act statutory payroll calculation (PAYE progressive tax, NSSF Tier I/II, SHIF 2.75%, Housing Levy 1.5%), atomic General Ledger salary posting, and leave management.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {canCreate && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLeaveModalOpen(true)}
                className="flex items-center gap-1.5 text-xs bg-white"
              >
                <Calendar size={14} /> Submit Leave Request
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateEmployeeOpen(true)}
                className="flex items-center gap-1.5 text-xs bg-white"
              >
                <Plus size={14} /> Onboard Staff
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsNewRunModalOpen(true)}
                className="flex items-center gap-1.5 text-xs"
              >
                <Calculator size={14} /> Run Monthly Payroll
              </Button>
            </>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-[#54657E] uppercase tracking-wider">
            Monthly Payroll Gross
          </span>
          <div className="mt-1 text-lg font-bold text-[#0F172A] font-mono tabular-nums">
            {formatKES(latestRun ? latestRun.totalGrossKes : 0)}
          </div>
          <span className="text-[10px] text-[#64748B]">
            {latestRun ? latestRun.periodLabel : 'No active run'} • {activeEmployees.length} Staff
          </span>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-[#54657E] uppercase tracking-wider">
            Statutory Taxes & Levies
          </span>
          <div className="mt-1 text-lg font-bold text-[#E03616] font-mono tabular-nums">
            {formatKES(latestRun ? latestRun.totalDeductionsKes : 0)}
          </div>
          <span className="text-[10px] text-[#64748B]">KRA PAYE + NSSF + SHIF + Housing</span>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-[#54657E] uppercase tracking-wider">
            Net Salaries Disbursed
          </span>
          <div className="mt-1 text-lg font-bold text-emerald-800 font-mono tabular-nums">
            {formatKES(latestRun ? latestRun.totalNetPayKes : 0)}
          </div>
          <span className="text-[10px] text-emerald-700">Bank clearing settlement</span>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-[#54657E] uppercase tracking-wider">
            Pending Leave Requests
          </span>
          <div className="mt-1 text-lg font-bold font-mono tabular-nums flex items-center gap-2">
            {pendingLeaves > 0 ? (
              <span className="text-[#E03616] flex items-center gap-1.5">
                <Clock size={16} /> {pendingLeaves} Requests
              </span>
            ) : (
              <span className="text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" /> All Handled
              </span>
            )}
          </div>
          <span className="text-[10px] text-[#64748B]">Manager Signoff Required</span>
        </div>
      </div>

      {/* Subtab Navigation Pills */}
      <div className="flex border-b border-[#D8E2EC] gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('payroll')}
          className={`pb-3 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'payroll'
              ? 'border-b-2 border-[#E03616] text-[#E03616] font-bold'
              : 'text-[#54657E] hover:text-[#0F172A]'
          }`}
        >
          <Calculator size={15} /> Statutory Payroll Runs ({payrollRuns.length})
        </button>

        <button
          onClick={() => setActiveTab('employees')}
          className={`pb-3 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'employees'
              ? 'border-b-2 border-[#E03616] text-[#E03616] font-bold'
              : 'text-[#54657E] hover:text-[#0F172A]'
          }`}
        >
          <UserCheck size={15} /> Employee Directory ({employees.length})
        </button>

        <button
          onClick={() => setActiveTab('tax_engine')}
          className={`pb-3 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'tax_engine'
              ? 'border-b-2 border-[#E03616] text-[#E03616] font-bold'
              : 'text-[#54657E] hover:text-[#0F172A]'
          }`}
        >
          <SlidersHorizontal size={15} /> Kenya Statutory Tax Bands Simulator
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-3 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'attendance'
              ? 'border-b-2 border-[#E03616] text-[#E03616] font-bold'
              : 'text-[#54657E] hover:text-[#0F172A]'
          }`}
        >
          <Calendar size={15} /> Attendance & Leave Approvals ({leaveRequests.length})
        </button>
      </div>

      {/* TAB 1: PAYROLL RUNS & GENERAL LEDGER INTEGRATION */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          {payrollRuns.map((run) => {
            const isPostedToGl = run.status === 'POSTED_TO_GL';
            return (
              <div
                key={run.id}
                className="rounded-xl border border-[#D8E2EC] bg-white overflow-hidden shadow-xs space-y-4"
              >
                {/* Payroll Run Header Bar */}
                <div className="p-4 bg-[#E8EEF5] border-b border-[#D8E2EC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-[#1B2436] text-white flex items-center justify-center font-mono font-bold text-xs">
                      {run.month.slice(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#0F172A] flex items-center gap-2">
                        {run.periodLabel} Statutory Payroll Execution
                        {isPostedToGl ? (
                          <Badge variant="frost" className="bg-emerald-50 text-emerald-800 text-[10px]">
                            Posted to General Ledger
                          </Badge>
                        ) : (
                          <Badge variant="bloodOrange" className="text-[10px]">
                            Approved / Unposted to GL
                          </Badge>
                        )}
                      </h3>
                      <span className="text-[11px] text-[#54657E] font-mono">
                        Run Ref: {run.runNumber} • Approved by: {run.approvedBy}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isPostedToGl && canPostGl && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handlePostRunToGl(run)}
                        className="text-xs flex items-center gap-1.5"
                      >
                        <Send size={13} /> Post to General Ledger (Account 6010)
                      </Button>
                    )}
                    {isPostedToGl && (
                      <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md">
                        <CheckCircle2 size={14} className="text-emerald-600" /> GL Balanced
                      </span>
                    )}
                  </div>
                </div>

                {/* Aggregated Totals Bar */}
                <div className="px-4 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#D8E2EC]">
                    <span className="text-[10px] text-[#64748B] block uppercase">Gross Salaries</span>
                    <span className="font-bold text-[#0F172A]">{formatKES(run.totalGrossKes)}</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#D8E2EC]">
                    <span className="text-[10px] text-[#64748B] block uppercase">PAYE Tax (KRA)</span>
                    <span className="font-bold text-[#E03616]">{formatKES(run.totalPayeKes)}</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#D8E2EC]">
                    <span className="text-[10px] text-[#64748B] block uppercase">NSSF & SHIF (2.75%)</span>
                    <span className="font-bold text-[#1B2436]">
                      {formatKES(run.totalNssfKes + run.totalNhifKes)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#D8E2EC]">
                    <span className="text-[10px] text-[#64748B] block uppercase">Housing Levy (1.5%)</span>
                    <span className="font-bold text-[#1B2436]">{formatKES(run.totalHousingLevyKes)}</span>
                  </div>
                  <div className="p-2.5 rounded bg-emerald-50/70 border border-emerald-200">
                    <span className="text-[10px] text-emerald-800 block uppercase font-bold">
                      Net Take-Home Pay
                    </span>
                    <span className="font-bold text-emerald-950">{formatKES(run.totalNetPayKes)}</span>
                  </div>
                </div>

                {/* Payslips Table */}
                <div className="px-4 pb-4">
                  <div className="rounded-lg border border-[#D8E2EC] overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8FAFC] text-[10px] font-bold text-[#54657E] uppercase border-b border-[#D8E2EC]">
                        <tr>
                          <th className="py-2.5 px-3">Employee</th>
                          <th className="py-2.5 px-3">KRA PIN</th>
                          <th className="py-2.5 px-3 text-right">Basic (KES)</th>
                          <th className="py-2.5 px-3 text-right">Allowances</th>
                          <th className="py-2.5 px-3 text-right">Gross Pay</th>
                          <th className="py-2.5 px-3 text-right">PAYE</th>
                          <th className="py-2.5 px-3 text-right">NSSF</th>
                          <th className="py-2.5 px-3 text-right">SHIF</th>
                          <th className="py-2.5 px-3 text-right">AHL (1.5%)</th>
                          <th className="py-2.5 px-3 text-right">Net Salary</th>
                          <th className="py-2.5 px-3 text-center">Payslip</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D8E2EC]">
                        {run.payslips.map((ps) => (
                          <tr key={ps.id} className="hover:bg-[#F8FAFC]">
                            <td className="py-2 px-3">
                              <span className="font-semibold text-[#0F172A]">{ps.employeeName}</span>
                              <span className="text-[10px] text-[#64748B] block font-mono">
                                {ps.employeeCode} • {ps.jobTitle}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-mono text-[11px] text-[#54657E]">
                              {ps.kraPin}
                            </td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums text-[#54657E]">
                              {formatKES(ps.basicSalaryKes)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums text-[#54657E]">
                              {formatKES(ps.allowancesKes)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold tabular-nums text-[#0F172A]">
                              {formatKES(ps.grossSalaryKes)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums text-[#E03616] font-semibold">
                              {formatKES(ps.payeTaxKes)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums text-[#54657E]">
                              {formatKES(ps.nssfDeductionKes)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums text-[#54657E]">
                              {formatKES(ps.nhifDeductionKes)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums text-[#54657E]">
                              {formatKES(ps.housingLevyKes)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold tabular-nums text-emerald-800">
                              {formatKES(ps.netSalaryKes)}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenPayslip(ps, run.periodLabel)}
                                className="h-6 px-2 text-[10px] flex items-center gap-1 mx-auto"
                              >
                                <FileText size={11} /> View Slip
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: EMPLOYEE DIRECTORY */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="rounded-lg border border-[#D8E2EC] bg-white px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:outline-none"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>

              <div className="relative w-64">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                />
                <input
                  type="text"
                  placeholder="Search staff by name, code, PIN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-[#D8E2EC] bg-white pl-9 pr-3 py-1.5 text-xs text-[#0F172A] placeholder:text-[#64748B] focus:border-[#E03616] focus:outline-none"
                />
              </div>
            </div>

            <span className="text-xs text-[#54657E]">
              Showing {filteredEmployees.length} active employees
            </span>
          </div>

          <div className="rounded-xl border border-[#D8E2EC] bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#D8E2EC] bg-[#E8EEF5] text-[11px] font-bold text-[#334155] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-28">Staff Code</th>
                    <th className="py-3 px-4">Employee Name & Title</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4 w-32">KRA Tax PIN</th>
                    <th className="py-3 px-4 text-right w-32">Basic Salary</th>
                    <th className="py-3 px-4 text-right w-32">Allowances</th>
                    <th className="py-3 px-4">Bank & Account</th>
                    <th className="py-3 px-4 text-center w-24">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8E2EC] text-[#334155]">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-4 font-mono font-bold text-[#0F172A]">
                        {emp.employeeCode}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#0F172A]">{emp.fullName}</div>
                        <div className="text-[10px] text-[#64748B]">{emp.jobTitle} • {emp.email}</div>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <span className="text-[#0F172A]">{emp.departmentName}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-[#0F172A]">
                        {emp.kraPin}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-[#0F172A] font-semibold">
                        {formatKES(emp.basicSalaryKes)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-[#54657E]">
                        {formatKES(emp.housingAllowanceKes + emp.transportAllowanceKes)}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <div className="text-[#0F172A]">{emp.bankName}</div>
                        <div className="text-[10px] font-mono text-[#64748B]">{emp.bankAccountNumber}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="frost" className="text-emerald-800 bg-emerald-50 text-[10px]">
                          Active Staff
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STATUTORY TAX BANDS SIMULATOR */}
      {activeTab === 'tax_engine' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Controls */}
            <div className="rounded-xl border border-[#D8E2EC] bg-white p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <Calculator size={18} className="text-[#E03616]" />
                Kenya Finance Act 2023/2024 Interactive Tax Engine
              </h3>
              <p className="text-xs text-[#54657E]">
                Test custom salary structures against progressive monthly tax brackets and statutory deduction rates.
              </p>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                    Base Monthly Salary (KES)
                  </label>
                  <input
                    type="number"
                    value={simSalary}
                    onChange={(e) => setSimSalary(e.target.value)}
                    className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs font-mono tabular-nums text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                    Monthly Cash Allowances (Housing & Transport)
                  </label>
                  <input
                    type="number"
                    value={simAllowances}
                    onChange={(e) => setSimAllowances(e.target.value)}
                    className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs font-mono tabular-nums text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Statutory Formula Rules Overview */}
              <div className="rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] p-3 text-xs space-y-1.5 text-[#54657E]">
                <div className="font-semibold text-[#1B2436]">Current Statutory Tax Rules:</div>
                <div>• First KES 24,000 @ 10%</div>
                <div>• Next KES 8,333 (24,001 to 32,333) @ 25%</div>
                <div>• Next KES 467,667 (32,334 to 500,000) @ 30%</div>
                <div>• Next KES 300,000 (500,001 to 800,000) @ 32.5%</div>
                <div>• Above KES 800,000 @ 35%</div>
                <div>• Monthly Personal Relief: KES 2,400</div>
                <div>• SHIF / NHIF: 2.75% of Gross Remuneration</div>
                <div>• Affordable Housing Levy: 1.5% of Gross Remuneration</div>
              </div>
            </div>

            {/* Computed Calculation Results */}
            <div className="rounded-xl border border-[#D8E2EC] bg-white p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#0F172A]">
                Tax Computation & Net Pay Breakdown
              </h3>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between py-1.5 border-b border-[#D8E2EC]">
                  <span className="text-[#54657E]">Gross Remuneration:</span>
                  <span className="font-bold text-[#0F172A]">{formatKES(simGross)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#D8E2EC]">
                  <span className="text-[#54657E]">Less NSSF Deduction (Max 2,160):</span>
                  <span className="text-[#0F172A]">{formatKES(simNssf)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#D8E2EC] font-semibold">
                  <span className="text-[#1B2436]">Taxable Pay for PAYE:</span>
                  <span className="text-[#1B2436]">{formatKES(simTaxable)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#D8E2EC] text-[#E03616]">
                  <span>Net PAYE (After KES 2,400 Relief):</span>
                  <span className="font-bold">{formatKES(simPaye)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#D8E2EC]">
                  <span className="text-[#54657E]">SHIF / NHIF (2.75%):</span>
                  <span className="text-[#0F172A]">{formatKES(simNhif)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#D8E2EC]">
                  <span className="text-[#54657E]">Affordable Housing Levy (1.5%):</span>
                  <span className="text-[#0F172A]">{formatKES(simHousing)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#D8E2EC] text-rose-700 font-bold bg-rose-50 px-2 rounded">
                  <span>Total Deductions:</span>
                  <span>{formatKES(simTotalDeductions)}</span>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-300 bg-emerald-50/80 p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold text-emerald-800 tracking-wider block">
                    Calculated Net Pay
                  </span>
                  <span className="text-[10px] text-emerald-900 mt-0.5 block">
                    Effective Tax Rate: {((simTotalDeductions / (simGross || 1)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="font-mono text-2xl font-extrabold text-emerald-950 tabular-nums">
                  {formatKES(simNet)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ATTENDANCE & LEAVE APPROVALS */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Section 1: Leave Requests */}
          <div className="rounded-xl border border-[#D8E2EC] bg-white overflow-hidden shadow-xs">
            <div className="p-3.5 bg-[#E8EEF5] border-b border-[#D8E2EC] flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#1B2436] uppercase tracking-wider">
                Staff Leave Applications & Approval Workflow
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLeaveModalOpen(true)}
                className="text-xs h-7 px-2.5 flex items-center gap-1 bg-white"
              >
                <Plus size={12} /> Apply for Leave
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#D8E2EC] bg-[#F8FAFC] text-[11px] font-semibold text-[#54657E]">
                  <tr>
                    <th className="py-2.5 px-3">Employee</th>
                    <th className="py-2.5 px-3 w-32">Leave Type</th>
                    <th className="py-2.5 px-3 w-32">Start Date</th>
                    <th className="py-2.5 px-3 w-32">End Date</th>
                    <th className="py-2.5 px-3 w-24 text-center">Duration</th>
                    <th className="py-2.5 px-3">Reason / Handover</th>
                    <th className="py-2.5 px-3 text-center w-28">Status</th>
                    <th className="py-2.5 px-3 text-right w-36">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8E2EC]">
                  {leaveRequests.map((lr) => {
                    const isPending = lr.status === 'PENDING';
                    const isApproved = lr.status === 'APPROVED';

                    return (
                      <tr key={lr.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-2.5 px-3 font-semibold text-[#0F172A]">
                          {lr.employeeName}
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge variant="frost" className="text-[10px]">
                            {lr.leaveType}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#54657E]">
                          {lr.startDate}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#54657E]">
                          {lr.endDate}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-[#0F172A]">
                          {lr.daysCount} Days
                        </td>
                        <td className="py-2.5 px-3 text-[#54657E]">
                          {lr.reason}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge
                            variant={isApproved ? 'frost' : isPending ? 'bloodOrange' : 'neutral'}
                            className="text-[10px]"
                          >
                            {lr.status}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {isPending && canApprove ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onUpdateLeaveStatus(lr.id, 'APPROVED')}
                                className="h-6 px-2 text-[10px] border-emerald-600 text-emerald-700 hover:bg-emerald-50 flex items-center gap-1"
                              >
                                <Check size={11} /> Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onUpdateLeaveStatus(lr.id, 'REJECTED')}
                                className="h-6 px-2 text-[10px] border-rose-300 text-rose-700 hover:bg-rose-50 flex items-center gap-1"
                              >
                                <X size={11} /> Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#64748B]">
                              {lr.approvedBy ? `By ${lr.approvedBy}` : 'Processed'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Attendance Records */}
          <div className="rounded-xl border border-[#D8E2EC] bg-white overflow-hidden shadow-xs">
            <div className="p-3.5 bg-[#E8EEF5] border-b border-[#D8E2EC]">
              <h3 className="text-xs font-bold text-[#1B2436] uppercase tracking-wider">
                Daily Biometric Clocking & Attendance Activity
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#D8E2EC] bg-[#F8FAFC] text-[11px] font-semibold text-[#54657E]">
                  <tr>
                    <th className="py-2.5 px-3">Employee</th>
                    <th className="py-2.5 px-3 w-28">Date</th>
                    <th className="py-2.5 px-3 w-28">Clock In</th>
                    <th className="py-2.5 px-3 w-28">Clock Out</th>
                    <th className="py-2.5 px-3 w-28 text-right">Hours Logged</th>
                    <th className="py-2.5 px-3 text-center w-28">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8E2EC]">
                  {attendance.map((att) => (
                    <tr key={att.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-2.5 px-3 font-semibold text-[#0F172A]">
                        {att.employeeName}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[#54657E]">
                        {att.date}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-emerald-800 font-semibold">
                        {att.clockInTime}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[#54657E]">
                        {att.clockOutTime}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[#0F172A]">
                        {att.hoursWorked} hrs
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge
                          variant={att.status === 'PRESENT' ? 'frost' : 'bloodOrange'}
                          className="text-[10px]"
                        >
                          {att.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: NEW PAYROLL RUN */}
      <NewPayrollRunModal
        isOpen={isNewRunModalOpen}
        onClose={() => setIsNewRunModalOpen(false)}
        employees={employees}
        userFullName={userFullName}
        onCreatePayrollRun={onCreatePayrollRun}
      />

      {/* MODAL 2: PAYSLIP DETAIL */}
      <PayslipDetailModal
        isOpen={!!selectedPayslip}
        onClose={() => setSelectedPayslip(null)}
        payslip={selectedPayslip}
        periodLabel={selectedPeriodLabel}
      />

      {/* MODAL 3: CREATE EMPLOYEE */}
      <CreateEmployeeModal
        isOpen={isCreateEmployeeOpen}
        onClose={() => setIsCreateEmployeeOpen(false)}
        departments={departments}
        onAddEmployee={onAddEmployee}
      />

      {/* MODAL 4: LEAVE REQUEST */}
      <LeaveRequestModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        employees={employees}
        onSubmitLeave={onSubmitLeave}
      />
    </div>
  );
}
