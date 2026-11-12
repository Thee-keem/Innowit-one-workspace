import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface ProductionSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSwitch: () => void;
}

export function ProductionSwitchModal({
  isOpen,
  onClose,
  onConfirmSwitch,
}: ProductionSwitchModalProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [adminKey, setAdminKey] = useState('');

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmed) return;
    onConfirmSwitch();
    onClose();
    setConfirmed(false);
    setAdminKey('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Air-Gap Security Gate: Switch to Live Production"
      description="Warning: Production activation dispatches irreversible tax transmissions to the Kenya Revenue Authority live gateway."
      maxWidth="md"
    >
      <form onSubmit={handleConfirm} className="space-y-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-2 text-xs text-red-900">
          <div className="flex items-center gap-2 font-bold text-red-950 text-sm">
            <ShieldAlert size={18} className="text-[#E03616]" />
            Regulatory Warning: KRA Production Endpoint
          </div>
          <p className="text-[11px] leading-relaxed text-red-800">
            You are about to disable the local Air-Gap test sandbox and transition to live KRA eTIMS endpoints (`https://etims.kra.go.ke`). Every validated tax invoice, credit note, or void transaction will incur real statutory tax liabilities on PIN `P051234567Z`.
          </p>
        </div>

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
              I certify that our organization has completed KRA certification and I authorize production fiscal transmissions.
            </span>
          </label>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Super Admin Confirmation Code
            </label>
            <input
              type="password"
              placeholder="Enter authorization password (or leave blank for demo simulation)"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs font-mono text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D8E2EC]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Stay in Air-Gapped Sandbox
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!confirmed}
            className="flex items-center gap-1.5 bg-[#E03616] hover:bg-[#C72E14]"
          >
            <Lock size={14} /> Authorize & Unlock Production
          </Button>
        </div>
      </form>
    </Modal>
  );
}
