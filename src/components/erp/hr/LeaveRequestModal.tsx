import React, { useState } from 'react';
import { Calendar, CheckCircle2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { EmployeeRecord, LeaveRequestRecord } from '@/types';

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: EmployeeRecord[];
  onSubmitLeave: (req: LeaveRequestRecord) => void;
}

export function LeaveRequestModal({
  isOpen,
  onClose,
  employees,
  onSubmitLeave,
}: LeaveRequestModalProps) {
  const [employeeId, setEmployeeId] = useState(employees[0]?.id || '');
  const [leaveType, setLeaveType] = useState<'ANNUAL' | 'SICK' | 'MATERNITY' | 'COMPASSIONATE'>('ANNUAL');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10)
  );
  const [reason, setReason] = useState('');

  const selectedEmp = employees.find((e) => e.id === employeeId) || employees[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1);

    const newReq: LeaveRequestRecord = {
      id: `leave_${Date.now()}`,
      employeeId: selectedEmp.id,
      employeeName: selectedEmp.fullName,
      leaveType,
      startDate,
      endDate,
      daysCount: diffDays,
      reason: reason.trim() || `${leaveType} leave scheduled`,
      status: 'PENDING',
    };

    onSubmitLeave(newReq);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Statutory Leave Request"
      description="Apply for annual vacation, outpatient medical sick leave, or compassionate leave."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1">
            Applying Employee <span className="text-[#E03616]">*</span>
          </label>
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
          >
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.fullName} ({e.departmentName})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1">
            Leave Classification <span className="text-[#E03616]">*</span>
          </label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value as any)}
            className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
          >
            <option value="ANNUAL">ANNUAL (Paid Annual Entitlement - 21 Days)</option>
            <option value="SICK">SICK (Certified Outpatient / Inpatient)</option>
            <option value="MATERNITY">MATERNITY / PATERNITY LEAVE</option>
            <option value="COMPASSIONATE">COMPASSIONATE / BEREAVEMENT</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Start Date <span className="text-[#E03616]">*</span>
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] font-mono focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              End Date <span className="text-[#E03616]">*</span>
            </label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] font-mono focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1">
            Justification / Leave Notes
          </label>
          <input
            type="text"
            placeholder="e.g. Annual leave balance clearance; handover to Patrick"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D8E2EC]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" className="flex items-center gap-1.5">
            <CheckCircle2 size={14} /> Submit for Manager Approval
          </Button>
        </div>
      </form>
    </Modal>
  );
}
