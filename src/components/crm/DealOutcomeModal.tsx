import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { DealRecord } from '@/types';
import { Trophy, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { formatKES } from '@/lib/utils';

interface DealOutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: DealRecord | null;
  onConfirmOutcome: (
    dealId: string,
    outcome: 'CLOSED_WON' | 'CLOSED_LOST',
    lostReason?: string,
    lostNotes?: string,
    generateQuotation?: boolean
  ) => void;
}

export function DealOutcomeModal({
  isOpen,
  onClose,
  deal,
  onConfirmOutcome,
}: DealOutcomeModalProps) {
  const [outcome, setOutcome] = useState<'CLOSED_WON' | 'CLOSED_LOST'>('CLOSED_WON');
  const [lostReason, setLostReason] = useState('Price Too High');
  const [lostNotes, setLostNotes] = useState('');
  const [generateQuotation, setGenerateQuotation] = useState(true);

  if (!isOpen || !deal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmOutcome(
      deal.id,
      outcome,
      outcome === 'CLOSED_LOST' ? lostReason : undefined,
      outcome === 'CLOSED_LOST' ? lostNotes : undefined,
      outcome === 'CLOSED_WON' ? generateQuotation : false
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Deal Outcome"
      description={`Finalize status for "${deal.title}" (${formatKES(deal.value)})`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Outcome Selector */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setOutcome('CLOSED_WON')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
              outcome === 'CLOSED_WON'
                ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/30'
                : 'border-[#D8E2EC] bg-[#F8FAFC] hover:bg-[#E8EEF5]'
            }`}
          >
            <div className={`p-2 rounded-lg ${outcome === 'CLOSED_WON' ? 'bg-emerald-600 text-white' : 'bg-[#D8E2EC] text-[#54657E]'}`}>
              <Trophy size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-[#0F172A]">Closed Won</div>
              <div className="text-[11px] text-[#64748B]">Client accepted quotation & terms</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setOutcome('CLOSED_LOST')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
              outcome === 'CLOSED_LOST'
                ? 'border-[#E03616] bg-red-50/70 ring-2 ring-[#E03616]/30'
                : 'border-[#D8E2EC] bg-[#F8FAFC] hover:bg-[#E8EEF5]'
            }`}
          >
            <div className={`p-2 rounded-lg ${outcome === 'CLOSED_LOST' ? 'bg-[#E03616] text-white' : 'bg-[#D8E2EC] text-[#54657E]'}`}>
              <XCircle size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-[#0F172A]">Closed Lost</div>
              <div className="text-[11px] text-[#64748B]">Opportunity lost or cancelled</div>
            </div>
          </button>
        </div>

        {/* Closed Won Options */}
        {outcome === 'CLOSED_WON' && (
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
              <CheckCircle2 size={16} />
              <span>Deal Won Celebration</span>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed">
              Revenue of <strong>{formatKES(deal.value)}</strong> will be credited to {deal.assignedToName}&apos;s monthly quota and added to realized sales metrics.
            </p>

            <label className="flex items-center gap-2.5 pt-2 border-t border-emerald-200 cursor-pointer">
              <input
                type="checkbox"
                checked={generateQuotation}
                onChange={(e) => setGenerateQuotation(e.target.checked)}
                className="rounded border-[#D8E2EC] text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <span className="text-xs font-medium text-emerald-950">
                Automatically generate Quotation / Sales Order in ERP Module
              </span>
            </label>
          </div>
        )}

        {/* Closed Lost Options */}
        {outcome === 'CLOSED_LOST' && (
          <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-red-800">
              <AlertTriangle size={16} />
              <span>Mandatory Loss Audit</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Primary Reason for Loss <span className="text-[#E03616]">*</span>
              </label>
              <select
                required
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                className="w-full rounded-lg border border-[#D8E2EC] bg-white px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:outline-none"
              >
                <option value="Price Too High">Price Too High / Budget Constraints</option>
                <option value="Competitor Chosen">Competitor Chosen (e.g. SAP / Oracle)</option>
                <option value="Budget Cancelled">Customer Budget Cancelled / Frozen</option>
                <option value="Project Deferred">Project Deferred to Next Fiscal Year</option>
                <option value="Feature Mismatch">Feature Mismatch / Missing Integration</option>
                <option value="Other">Other Executive Reason</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Post-Mortem Notes & Learnings
              </label>
              <textarea
                rows={2}
                placeholder="Explain why the deal was lost and recommendations for future quarters..."
                value={lostNotes}
                onChange={(e) => setLostNotes(e.target.value)}
                className="w-full rounded-lg border border-[#D8E2EC] bg-white px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:outline-none"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D8E2EC]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className={outcome === 'CLOSED_WON' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          >
            Confirm {outcome === 'CLOSED_WON' ? 'Win' : 'Loss'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
