import React, { useState } from 'react';
import { UserPlus, CheckCircle2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { EmployeeRecord, DepartmentRecord } from '@/types';

interface CreateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: DepartmentRecord[];
  onAddEmployee: (emp: EmployeeRecord) => void;
}

export function CreateEmployeeModal({
  isOpen,
  onClose,
  departments,
  onAddEmployee,
}: CreateEmployeeModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');
  const [jobTitle, setJobTitle] = useState('');
  const [kraPin, setKraPin] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [nssfNumber, setNssfNumber] = useState('');
  const [nhifNumber, setNhifNumber] = useState('');
  const [basicSalary, setBasicSalary] = useState('120000');
  const [housingAllowance, setHousingAllowance] = useState('20000');
  const [transportAllowance, setTransportAllowance] = useState('10000');
  const [bankName, setBankName] = useState('NCBA Bank Kenya');
  const [bankAccountNumber, setBankAccountNumber] = useState('');

  const selectedDept = departments.find((d) => d.id === departmentId) || departments[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !kraPin) return;

    const employeeCode = `EMP-0${Date.now().toString().slice(-2)}`;

    const newEmp: EmployeeRecord = {
      id: `emp_${Date.now()}`,
      employeeCode,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      departmentId: selectedDept.id,
      departmentName: selectedDept.name,
      jobTitle: jobTitle.trim() || 'Operations Analyst',
      hireDate: new Date().toISOString().slice(0, 10),
      kraPin: kraPin.trim().toUpperCase(),
      nationalId: nationalId.trim(),
      nssfNumber: nssfNumber.trim() || `NSSF-${Date.now().toString().slice(-6)}`,
      nhifNumber: nhifNumber.trim() || `NHIF-${Date.now().toString().slice(-6)}`,
      bankName: bankName.trim(),
      bankAccountNumber: bankAccountNumber.trim() || '1002348899',
      basicSalaryKes: parseFloat(basicSalary) || 0,
      housingAllowanceKes: parseFloat(housingAllowance) || 0,
      transportAllowanceKes: parseFloat(transportAllowance) || 0,
      isActive: true,
    };

    onAddEmployee(newEmp);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Onboard New Employee Record"
      description="Register staff with departmental allocation, Kenyan statutory identifiers (KRA PIN, NSSF, NHIF), and salary structure."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Full Legal Name <span className="text-[#E03616]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Victor Maina Waweru"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Corporate Email Address <span className="text-[#E03616]">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="v.maina@innowit.ke"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Department <span className="text-[#E03616]">*</span>
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Job Title / Designation
            </label>
            <input
              type="text"
              placeholder="e.g. Software Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+254 700 000 000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Statutory Identifiers */}
        <div className="rounded-xl border border-[#D8E2EC] bg-[#E8EEF5]/60 p-3.5 space-y-3">
          <span className="text-xs font-bold text-[#1B2436] uppercase tracking-wider block">
            Kenya Statutory Identification
          </span>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#0F172A] mb-1">
                KRA Tax PIN <span className="text-[#E03616]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="A009876543Z"
                value={kraPin}
                onChange={(e) => setKraPin(e.target.value.toUpperCase())}
                className="w-full rounded border border-[#D8E2EC] bg-white px-2.5 py-1.5 text-xs font-mono uppercase text-[#0F172A] focus:border-[#E03616] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#0F172A] mb-1">
                National ID / Passport
              </label>
              <input
                type="text"
                placeholder="30129384"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                className="w-full rounded border border-[#D8E2EC] bg-white px-2.5 py-1.5 text-xs font-mono text-[#0F172A] focus:border-[#E03616] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#0F172A] mb-1">
                NSSF Number
              </label>
              <input
                type="text"
                placeholder="NSSF-123456"
                value={nssfNumber}
                onChange={(e) => setNssfNumber(e.target.value)}
                className="w-full rounded border border-[#D8E2EC] bg-white px-2.5 py-1.5 text-xs font-mono text-[#0F172A] focus:border-[#E03616] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#0F172A] mb-1">
                SHIF / NHIF Number
              </label>
              <input
                type="text"
                placeholder="NHIF-654321"
                value={nhifNumber}
                onChange={(e) => setNhifNumber(e.target.value)}
                className="w-full rounded border border-[#D8E2EC] bg-white px-2.5 py-1.5 text-xs font-mono text-[#0F172A] focus:border-[#E03616] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Salary Structure */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Basic Salary (KES) <span className="text-[#E03616]">*</span>
            </label>
            <input
              type="number"
              required
              value={basicSalary}
              onChange={(e) => setBasicSalary(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs font-mono tabular-nums text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Housing Allowance (KES)
            </label>
            <input
              type="number"
              value={housingAllowance}
              onChange={(e) => setHousingAllowance(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs font-mono tabular-nums text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Transport Allowance (KES)
            </label>
            <input
              type="number"
              value={transportAllowance}
              onChange={(e) => setTransportAllowance(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs font-mono tabular-nums text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Bank Name
            </label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            >
              <option value="NCBA Bank Kenya">NCBA Bank Kenya</option>
              <option value="Standard Chartered Kenya">Standard Chartered Kenya</option>
              <option value="Equity Bank Kenya">Equity Bank Kenya</option>
              <option value="KCB Bank Kenya">KCB Bank Kenya</option>
              <option value="Absa Bank Kenya">Absa Bank Kenya</option>
              <option value="Co-operative Bank of Kenya">Co-operative Bank of Kenya</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Bank Account Number
            </label>
            <input
              type="text"
              placeholder="e.g. 1002938475"
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs font-mono text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D8E2EC]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" className="flex items-center gap-1.5">
            <CheckCircle2 size={14} /> Onboard Employee
          </Button>
        </div>
      </form>
    </Modal>
  );
}
