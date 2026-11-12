import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { UserRole, UserSessionPayload, ActionType } from '@/types';
import { ROLE_METADATA, ROLE_PERMISSIONS } from '@/modules/auth/rbac';
import { Check, Shield, Lock } from 'lucide-react';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSessionPayload;
  onSelectUser: (user: UserSessionPayload) => void;
  allUsers: UserSessionPayload[];
}

export function RoleSwitcherModal({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
  allUsers,
}: RoleSwitcherModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="12-Role RBAC Simulation Engine"
      description="Select an identity to simulate role-based access control, GL posting permissions, and eTIMS tax transmission clearance."
      maxWidth="2xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
        {allUsers.map((user) => {
          const meta = ROLE_METADATA[user.role];
          const isSelected = user.role === currentUser.role;
          const perms = ROLE_PERMISSIONS[user.role];
          const canGlPost = perms.ACCOUNTING?.includes('POST_GL');
          const canTaxTransmit = perms.ETIMS_COMPLIANCE?.includes('TRANSMIT_TAX');
          const canApprove = Object.values(perms).some((p) => Array.isArray(p) && (p as ActionType[]).includes('APPROVE'));

          return (
            <button
              key={user.userId}
              onClick={() => {
                onSelectUser(user);
                onClose();
              }}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? 'border-[#E03616] bg-[#E03616]/5 shadow-sm ring-1 ring-[#E03616]/40'
                  : 'border-[#D8E2EC] bg-[#F8FAFC] hover:bg-[#E8EEF5] hover:border-[#CAD6E2]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0F172A] text-xs flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-[#E03616]' : 'bg-[#1B2436]'}`}
                    />
                    {meta.label}
                  </span>
                  {isSelected && (
                    <Badge variant="bloodOrange" className="text-[10px] py-0 px-1.5 flex items-center gap-1">
                      <Check size={10} /> Active
                    </Badge>
                  )}
                </div>

                <div className="text-[11px] text-[#54657E] font-medium mt-0.5">
                  {user.fullName} · {meta.department}
                </div>

                <p className="text-[11px] text-[#64748B] mt-2 line-clamp-2">
                  {meta.description}
                </p>
              </div>

              {/* Special permission chips in Slate Blue / Blood Orange */}
              <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-[#D8E2EC] text-[10px]">
                {canGlPost && (
                  <span className="bg-[#1B2436] text-white px-1.5 py-0.5 rounded font-mono font-medium">
                    POST_GL
                  </span>
                )}
                {canTaxTransmit && (
                  <span className="bg-[#E03616]/10 text-[#E03616] border border-[#E03616]/30 px-1.5 py-0.5 rounded font-mono font-semibold">
                    TRANSMIT_TAX
                  </span>
                )}
                {canApprove && (
                  <span className="bg-[#E8EEF5] text-[#1B2436] border border-[#CAD6E2] px-1.5 py-0.5 rounded font-mono">
                    APPROVE
                  </span>
                )}
                {!canGlPost && !canTaxTransmit && (
                  <span className="text-[#64748B] flex items-center gap-1">
                    <Lock size={10} /> Restricted
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-[#D8E2EC] flex items-center justify-between text-xs text-[#54657E]">
        <span>Cryptographically verified 12-Role RBAC session simulator.</span>
        <button
          onClick={onClose}
          className="text-[#1B2436] font-medium hover:bg-[#E8EEF5] px-3 py-1 rounded border border-[#D8E2EC] transition-colors cursor-pointer"
        >
          Dismiss
        </button>
      </div>
    </Modal>
  );
}
