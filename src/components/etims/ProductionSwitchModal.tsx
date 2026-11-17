import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Lock } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { UserRole } from '@/types';
import { activateProductionAirGap, AirGapSecurityStatus } from '@/modules/etims/airgap';

interface ProductionSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSwitch: (status?: AirGapSecurityStatus) => void;
  userId?: string;
  userFullName?: string;
  userRole?: UserRole;
  taxpayerPin?: string;
}

export function ProductionSwitchModal({
  isOpen,
  onClose,
  onConfirmSwitch,
  userId = 'usr_super_01',
  userFullName = 'Kimani Mwangi',
  userRole = 'SUPER_ADMIN',
  taxpayerPin = 'P051234567Z',
}: ProductionSwitchModalProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [confirmationPhrase, setConfirmationPhrase] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const expectedPhrase = `ACTIVATE-LIVE-KRA-${taxpayerPin}`;
  const isSuperAdmin = userRole === 'SUPER_ADMIN';

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!confirmed) {
      setErrorMessage('You must attest to KRA production certification before unlocking.');
      return;
    }

    const result = activateProductionAirGap({
      userId,
      userFullName,
      userRole,
      confirmationPhrase: confirmationPhrase.trim(),
      taxpayerPin,
    });

    if (!result.success) {
      setErrorMessage(result.message);
      return;
    }

    onConfirmSwitch(result.status);
    onClose();
    setConfirmed(false);
    setConfirmationPhrase('');
    setErrorMessage(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setErrorMessage(null);
        onClose();
      }}
      title="Air-Gap Security Gate: Switch to Live Production"
      description="Dual-step Super Admin authorization required before disabling Sandbox isolation."
      maxWidth="md"
    >
      <form onSubmit={handleConfirm} className="space-y-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-2 text-xs text-red-900">
          <div className="flex items-center gap-2 font-bold text-red-950 text-sm">
            <ShieldAlert size={18} className="text-[#E03616]" />
            Regulatory Warning: KRA Production Endpoint
          </div>
          <p className="text-[11px] leading-relaxed text-red-800">
            You are about to disable the local Air-Gap test sandbox and transition to live KRA eTIMS endpoints (<span className="font-mono">https://etims.kra.go.ke</span>). Every validated tax invoice, credit note, or void transaction will incur real statutory tax liabilities on PIN <span className="font-mono font-bold">{taxpayerPin}</span>.
          </p>
        </div>

        {!isSuperAdmin && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950 flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Super Admin Clearance Required</div>
              <div className="text-[11px] text-amber-800 mt-0.5">
                Current session role is <span className="font-mono font-bold">{userRole}</span>. Only <span className="font-mono font-bold">SUPER_ADMIN</span> can certify Live Production eTIMS activation.
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <label className="flex items-start gap-2.5 p-3 rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] cursor-pointer text-xs">
            <input
              type="checkbox"
              required
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 rounded border-[#D8E2EC] text-[#E03616] focus:ring-[#E03616]"
            />
            <span className="font-semibold text-[#0F172A] leading-normal">
              Step 1: I certify that our organization has completed KRA OSCU/VSCU certification and I authorize production fiscal transmissions.
            </span>
          </label>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Step 2: Type Exact Authorization Phrase
            </label>
            <div className="text-[11px] font-mono text-[#54657E] mb-1.5">
              Expected: <span className="font-bold text-[#0F172A] select-all">{expectedPhrase}</span>
            </div>
            <input
              type="text"
              required
              placeholder={expectedPhrase}
              value={confirmationPhrase}
              onChange={(e) => setConfirmationPhrase(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs font-mono text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-[11px] text-red-900 font-medium">
            {errorMessage}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D8E2EC]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setErrorMessage(null);
              onClose();
            }}
          >
            Stay in Air-Gapped Sandbox
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!confirmed || !isSuperAdmin || confirmationPhrase.trim() !== expectedPhrase}
            className="flex items-center gap-1.5 bg-[#E03616] hover:bg-[#C72E14]"
          >
            <Lock size={14} /> Authorize &amp; Unlock Production
          </Button>
        </div>
      </form>
    </Modal>
  );
}
