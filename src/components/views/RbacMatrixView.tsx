import React, { useState } from 'react';
import { Shield, Check, X, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { UserRole, SystemModule, ActionType } from '@/types';
import { ROLE_PERMISSIONS, ROLE_METADATA } from '@/modules/auth/rbac';

const ALL_ROLES: UserRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'EXECUTIVE',
  'FINANCE_MANAGER',
  'ACCOUNTANT',
  'SALES_MANAGER',
  'SALES_REP',
  'PROCUREMENT_OFFICER',
  'INVENTORY_MANAGER',
  'HR_MANAGER',
  'PROJECT_MANAGER',
  'EMPLOYEE',
];

const ALL_MODULES: SystemModule[] = [
  'COLLABORATION',
  'CRM',
  'ACCOUNTING',
  'INVENTORY',
  'PROCUREMENT',
  'SALES',
  'HR_PAYROLL',
  'ETIMS_COMPLIANCE',
  'BI_REPORTS',
  'SYSTEM_ADMIN',
];

interface RbacMatrixViewProps {
  currentRole: UserRole;
  onOpenRoleSwitcher: () => void;
}

export function RbacMatrixView({
  currentRole,
  onOpenRoleSwitcher,
}: RbacMatrixViewProps) {
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<UserRole | 'ALL'>('ALL');

  const displayedRoles =
    selectedRoleFilter === 'ALL'
      ? ALL_ROLES
      : ALL_ROLES.filter((r) => r === selectedRoleFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D8E2EC] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2.5">
              <Shield className="text-[#E03616]" size={22} />
              12-Role RBAC Specification & Governance Matrix
            </h1>
            <Badge variant="slateBlue">Security Architecture</Badge>
          </div>
          <p className="mt-1 text-xs text-[#54657E]">
            Authoritative operational access boundaries spanning 12 standardized enterprise roles and 10 ERP subsystems.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenRoleSwitcher}
            className="flex items-center gap-1.5 text-xs font-semibold"
          >
            <UserCheck size={14} /> Switch Active Test Role ({currentRole})
          </Button>
        </div>
      </div>

      {/* Role filter segmented control in 30% Slate Blue */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 bg-white p-2 rounded-xl border border-[#D8E2EC] shadow-xs">
        <button
          onClick={() => setSelectedRoleFilter('ALL')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            selectedRoleFilter === 'ALL'
              ? 'bg-[#1B2436] text-white'
              : 'text-[#54657E] hover:text-[#0F172A] hover:bg-[#E8EEF5]'
          }`}
        >
          All 12 Roles Matrix
        </button>
        {ALL_ROLES.map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRoleFilter(role)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              selectedRoleFilter === role
                ? 'bg-[#1B2436] text-white'
                : 'text-[#54657E] hover:text-[#0F172A] hover:bg-[#E8EEF5]'
            }`}
          >
            {ROLE_METADATA[role].label}
          </button>
        ))}
      </div>

      {/* Matrix Table */}
      <div className="rounded-xl border border-[#D8E2EC] bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#1B2436] border-b border-[#2D3A52] text-[11px] font-bold text-white uppercase tracking-wider sticky top-0">
              <tr>
                <th className="py-3 px-4 w-52 bg-[#1B2436] border-r border-[#2D3A52]">
                  Enterprise Role
                </th>
                {ALL_MODULES.map((mod) => (
                  <th key={mod} className="py-3 px-3 text-center whitespace-nowrap min-w-28 text-slate-200">
                    {mod.replace('_', ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8E2EC] text-[#334155]">
              {displayedRoles.map((role) => {
                const meta = ROLE_METADATA[role];
                const isCurrent = role === currentRole;

                return (
                  <tr
                    key={role}
                    className={`transition-colors ${
                      isCurrent
                        ? 'bg-[#F0F4F8] border-l-3 border-[#E03616]'
                        : 'hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <td className="py-3 px-4 font-medium border-r border-[#D8E2EC] bg-white">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#0F172A] text-xs">{meta.label}</span>
                        {isCurrent && (
                          <Badge variant="bloodOrange" className="text-[9px] py-0 px-1 font-bold">
                            Current
                          </Badge>
                        )}
                      </div>
                      <div className="text-[10px] text-[#64748B] font-mono mt-0.5">
                        {role}
                      </div>
                    </td>

                    {ALL_MODULES.map((mod) => {
                      const actions: ActionType[] = ROLE_PERMISSIONS[role]?.[mod] || [];
                      const hasAccess = actions.length > 0;
                      const hasGl = actions.includes('POST_GL');
                      const hasTax = actions.includes('TRANSMIT_TAX');
                      const hasApprove = actions.includes('APPROVE');

                      return (
                        <td
                          key={mod}
                          className="py-2.5 px-2 text-center align-middle"
                        >
                          {hasAccess ? (
                            <div className="inline-flex flex-col items-center gap-1">
                              <span className="inline-flex items-center text-[#1B2436] text-[10px] font-mono font-bold bg-[#E8EEF5] px-1.5 py-0.5 rounded border border-[#D8E2EC]">
                                <Check size={11} className="mr-0.5" /> VIEW
                              </span>
                              {hasGl && (
                                <span className="text-[9px] font-mono text-white bg-[#1B2436] px-1 py-0.2 rounded font-semibold">
                                  POST_GL
                                </span>
                              )}
                              {hasTax && (
                                <span className="text-[9px] font-mono text-[#E03616] bg-[#E03616]/10 border border-[#E03616]/30 px-1 py-0.2 rounded font-bold">
                                  TRANSMIT
                                </span>
                              )}
                              {hasApprove && !hasGl && !hasTax && (
                                <span className="text-[9px] font-mono text-[#334155] bg-[#F1F5F9] border border-[#D8E2EC] px-1 py-0.2 rounded font-semibold">
                                  APPROVE
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center text-[#94A3B8]">
                              <X size={13} />
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-[#F8FAFC] border-t border-[#D8E2EC] text-xs text-[#54657E] flex flex-wrap items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[#1B2436] font-semibold">
              <Check size={12} /> Authorized Access Scope
            </span>
            <span className="flex items-center gap-1 text-[#94A3B8]">
              <X size={12} /> Air-Gapped Forbidden Access
            </span>
          </div>
          <div>
            12 Roles × 10 Subsystems × 7 Granular Action Scopes
          </div>
        </div>
      </div>
    </div>
  );
}
