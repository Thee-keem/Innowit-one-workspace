import React, { useState } from 'react';
import { Code2, Copy, Check, ShieldCheck, Terminal } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { EtimsQueueItem } from '@/types';

interface RawPayloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  queueItem: EtimsQueueItem | null;
}

export function RawPayloadModal({ isOpen, onClose, queueItem }: RawPayloadModalProps) {
  const [copied, setCopied] = useState(false);
  const [viewTab, setViewTab] = useState<'request' | 'response'>('request');

  if (!queueItem) return null;

  const handleCopy = () => {
    const textToCopy = viewTab === 'request' ? queueItem.payloadJson : queueItem.responseJson || '{}';
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`eTIMS Telemetry Inspector — ${queueItem.invoiceNumber}`}
      description="Raw sanitized JSON payload transmitted to the KRA OSCU Gateway and acknowledgment receipt."
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Environment & Metadata Badge Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0F172A]">CU: {queueItem.cuNumber}</span>
            <span className="text-[#64748B]">•</span>
            <span className="text-[#54657E]">Mode: {queueItem.mode}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#64748B]">Idempotency Key:</span>
            <span className="text-[#1B2436] font-bold truncate max-w-[180px]">
              {queueItem.idempotencyKey}
            </span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center justify-between border-b border-[#D8E2EC]">
          <div className="flex gap-4 text-xs font-semibold">
            <button
              onClick={() => setViewTab('request')}
              className={`pb-2.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewTab === 'request'
                  ? 'border-b-2 border-[#E03616] text-[#E03616] font-bold'
                  : 'text-[#54657E] hover:text-[#0F172A]'
              }`}
            >
              <Terminal size={14} /> Outbound Request Payload
            </button>
            <button
              onClick={() => setViewTab('response')}
              className={`pb-2.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewTab === 'response'
                  ? 'border-b-2 border-[#E03616] text-[#E03616] font-bold'
                  : 'text-[#54657E] hover:text-[#0F172A]'
              }`}
            >
              <ShieldCheck size={14} /> KRA Gateway Response
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="text-xs text-[#54657E] hover:text-[#0F172A] flex items-center gap-1 cursor-pointer pb-2"
          >
            {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            {copied ? 'Copied JSON' : 'Copy Payload'}
          </button>
        </div>

        {/* Code Viewer */}
        <div className="rounded-xl border border-[#243048] bg-[#141B29] p-4 text-slate-100 font-mono text-[11px] leading-relaxed max-h-[380px] overflow-y-auto">
          <pre className="whitespace-pre-wrap">
            {viewTab === 'request'
              ? queueItem.payloadJson
              : queueItem.responseJson ||
                JSON.stringify(
                  {
                    status: 'PENDING_TRANSMISSION',
                    message: 'Item has not yet received an acknowledgment response from the gateway.',
                    attempts: queueItem.attemptCount,
                    lastError: queueItem.lastError || null,
                  },
                  null,
                  2
                )}
          </pre>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-[#64748B]">
            Cryptographic signatures and private keys are sanitarily masked.
          </span>
          <Button variant="primary" size="sm" onClick={onClose}>
            Close Inspector
          </Button>
        </div>
      </div>
    </Modal>
  );
}
