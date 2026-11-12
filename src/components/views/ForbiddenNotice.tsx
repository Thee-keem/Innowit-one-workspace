import React from 'react';
import { ShieldAlert, ArrowLeft, RefreshCw, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { UserRole, SystemModule } from '@/types';
import { ROLE_METADATA } from '@/modules/auth/rbac';

interface ForbiddenNoticeProps {
  module: SystemModule;
  currentRole: UserRole;
  onOpenRoleSwitcher: () => void;
  onNavigateHome: () => void;
}

export function ForbiddenNotice({
  module,
  currentRole,
  onOpenRoleSwitcher,
  onNavigateHome,
}: ForbiddenNoticeProps) {
  const roleMeta = ROLE_METADATA[currentRole];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-xl mx-auto text-center px-4">
      <div className="h-16 w-16 rounded-full bg-[#E03616]/10 border border-[#E03616]/30 flex items-center justify-center text-[#E03616] mb-5 shadow-sm">
        <ShieldAlert size={32} />
      </div>

      <Badge variant="bloodOrange" className="mb-3 font-mono font-bold">
        403 ACCESS RESTRICTED
      </Badge>

      <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
        RBAC Permission Barrier Active
      </h2>

      <p className="mt-2 text-xs text-[#334155] leading-relaxed font-mono bg-white border border-[#D8E2EC] p-3.5 rounded-xl w-full text-left shadow-xs">
        <span className="text-[#E03616] font-bold">FORBIDDEN_INSUFFICIENT_PERMISSIONS:</span>
        <br />
        Current principal with role <span className="text-[#0F172A] font-bold">{currentRole}</span> ({roleMeta.label}) is not authorized to execute <span className="text-[#1B2436] font-bold">VIEW</span> action on module <span className="text-[#0F172A] font-bold">{module}</span>.
      </p>

      <div className="mt-4 text-xs text-[#54657E]">
        Access to this operational subsystem is governed by the 12-Role RBAC policy. Switch to an authorized role like <span className="text-[#0F172A] font-semibold">SUPER_ADMIN</span>, <span className="text-[#0F172A] font-semibold">FINANCE_MANAGER</span>, or <span className="text-[#0F172A] font-semibold">ACCOUNTANT</span> to inspect these records.
      </div>

      <div className="flex items-center gap-3 mt-6">
        <Button
          variant="outline"
          size="md"
          onClick={onNavigateHome}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={14} /> Back to Channels
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={onOpenRoleSwitcher}
          className="flex items-center gap-2 font-semibold"
        >
          <RefreshCw size={14} /> Switch Authorized Role
        </Button>
      </div>

      <div className="mt-8 pt-4 border-t border-[#D8E2EC] text-[11px] text-[#64748B] font-mono flex items-center gap-2">
        <KeyRound size={12} className="text-[#1B2436]" /> Cryptographic session audit trail logged to /var/log/innowit/audit.log
      </div>
    </div>
  );
}
