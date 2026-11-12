import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Send,
  QrCode,
  ExternalLink,
  CheckCircle2,
  Cpu,
  Lock,
  FileCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EtimsRecord, UserRole } from '@/types';
import { formatKES } from '@/lib/utils';
import { hasPermission } from '@/modules/auth/rbac';

interface EtimsViewProps {
  records: EtimsRecord[];
  isSandbox: boolean;
  onToggleSandbox: () => void;
  onTransmitQueue: () => void;
  userRole: UserRole;
}

export function EtimsView({
  records,
  isSandbox,
  onToggleSandbox,
  onTransmitQueue,
  userRole,
}: EtimsViewProps) {
  const [selectedRecord, setSelectedRecord] = useState<EtimsRecord | null>(records[0] || null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isTransmitting, setIsTransmitting] = useState(false);

  const canTransmit = hasPermission(userRole, 'ETIMS_COMPLIANCE', 'TRANSMIT_TAX');

  const pendingCount = records.filter((r) => r.status === 'PENDING').length;
  const acceptedCount = records.filter((r) => r.status === 'ACCEPTED').length;

  const handleTransmit = () => {
    setIsTransmitting(true);
    setTimeout(() => {
      onTransmitQueue();
      setIsTransmitting(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D8E2EC] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2.5">
              <ShieldCheck className="text-[#E03616]" size={22} />
              Kenya eTIMS Compliance & Air-Gap Engine
            </h1>
            {isSandbox ? (
              <Badge variant="sandbox">Sandbox Test Mode</Badge>
            ) : (
              <Badge variant="bloodOrange">Production Live</Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-[#54657E]">
            Kenya Revenue Authority (KRA) Electronic Tax Invoice Management System (eTIMS) middleware & control unit telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleSandbox}
            className="flex items-center gap-1.5 text-xs font-mono"
          >
            {isSandbox ? (
              <>
                <ShieldAlert size={14} className="text-[#E03616]" /> Switch to Production
              </>
            ) : (
              <>
                <ShieldCheck size={14} className="text-emerald-700" /> Switch to Sandbox
              </>
            )}
          </Button>

          {canTransmit && (
            <Button
              variant="primary"
              size="sm"
              isLoading={isTransmitting}
              onClick={handleTransmit}
              disabled={pendingCount === 0}
              className="flex items-center gap-1.5 text-xs font-semibold"
            >
              <Send size={14} /> Transmit Pending ({pendingCount})
            </Button>
          )}
        </div>
      </div>

      {/* Compliance Architecture Status Cards in Alpine Frost / Slate Blue */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#54657E]">
            <span className="font-semibold">Air-Gap Protection</span>
            <Lock size={14} className="text-[#E03616]" />
          </div>
          <div className="mt-2 text-sm font-bold text-[#0F172A]">
            {isSandbox ? 'ENGAGED (AIR-GAP)' : 'UNLOCKED (PRODUCTION)'}
          </div>
          <p className="mt-1 text-[11px] text-[#64748B]">
            Strict isolation guarantees test invoices do not trigger real KRA tax liabilities.
          </p>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#54657E]">
            <span className="font-semibold">Registered KRA PIN</span>
            <Cpu size={14} className="text-[#1B2436]" />
          </div>
          <div className="mt-2 text-base font-bold text-[#0F172A] font-mono">
            P051234567Z
          </div>
          <p className="mt-1 text-[11px] text-[#64748B]">
            Innowit Technologies Limited · Branch Code: 00 (HQ)
          </p>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#54657E]">
            <span className="font-semibold">OSCU Control Unit</span>
            <CheckCircle2 size={14} className="text-emerald-600" />
          </div>
          <div className="mt-2 text-base font-bold text-[#0F172A] font-mono">
            ONLINE · KRAMU010049
          </div>
          <p className="mt-1 text-[11px] text-[#64748B]">
            Latency: 28ms to KRA iTax gateway endpoint
          </p>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#54657E]">
            <span className="font-semibold">Outbox Transmissions</span>
            <FileCheck size={14} className="text-[#E03616]" />
          </div>
          <div className="mt-2 text-base font-bold text-[#0F172A] font-mono tabular-nums">
            {acceptedCount} / {records.length} Transmitted
          </div>
          <p className="mt-1 text-[11px] text-[#64748B]">
            {pendingCount} waiting in air-gapped queue
          </p>
        </div>
      </div>

      {/* Main Submission Queue & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Outbox Table */}
        <div className="lg:col-span-8 rounded-xl border border-[#D8E2EC] bg-white overflow-hidden shadow-xs">
          <div className="p-3.5 border-b border-[#D8E2EC] bg-[#E8EEF5] flex items-center justify-between text-xs">
            <span className="font-bold text-[#1B2436]">
              Tax Invoices & Transmission Queue
            </span>
            <span className="text-[10px] text-[#54657E] font-mono">
              Auto-sync every 60s
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#D8E2EC] bg-[#F8FAFC] text-[11px] font-bold text-[#334155] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Invoice No</th>
                  <th className="py-2.5 px-3">Client & PIN</th>
                  <th className="py-2.5 px-3 text-right">Amount (KES)</th>
                  <th className="py-2.5 px-3 text-right">VAT 16%</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8E2EC] text-[#334155]">
                {records.map((rec) => {
                  const isSelected = selectedRecord?.id === rec.id;
                  return (
                    <tr
                      key={rec.id}
                      onClick={() => setSelectedRecord(rec)}
                      className={`hover:bg-[#F8FAFC] transition-colors cursor-pointer ${
                        isSelected ? 'bg-[#F0F4F8] font-medium' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-mono font-bold text-[#0F172A]">
                        {rec.invoiceNumber}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[#0F172A]">{rec.customerName}</div>
                        <div className="text-[10px] text-[#64748B] font-mono">{rec.customerPin}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-[#0F172A] tabular-nums">
                        {formatKES(rec.totalAmountKes)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-[#54657E] tabular-nums">
                        {formatKES(rec.vatAmountKes)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge
                          variant={
                            rec.status === 'ACCEPTED'
                              ? 'success'
                              : rec.status === 'PENDING'
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {rec.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRecord(rec);
                            setIsQrModalOpen(true);
                          }}
                          className="p-1 rounded text-slate-500 hover:text-[#E03616] hover:bg-[#E8EEF5] transition-colors cursor-pointer"
                          title="View KRA QR Code verification"
                        >
                          <QrCode size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Record Detail & KRA OSCU Card in Slate Blue / White */}
        <div className="lg:col-span-4 rounded-xl border border-[#D8E2EC] bg-white p-5 shadow-xs space-y-4">
          {selectedRecord ? (
            <>
              <div className="flex items-center justify-between border-b border-[#D8E2EC] pb-3">
                <div>
                  <div className="text-xs text-[#54657E] uppercase font-mono font-semibold">Invoice Telemetry</div>
                  <div className="text-base font-bold text-[#0F172A] font-mono">
                    {selectedRecord.invoiceNumber}
                  </div>
                </div>
                <Badge
                  variant={selectedRecord.status === 'ACCEPTED' ? 'success' : 'warning'}
                >
                  {selectedRecord.status}
                </Badge>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Purchaser Legal Entity</span>
                  <span className="font-bold text-[#0F172A]">{selectedRecord.customerName}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono">
                  <div>
                    <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Purchaser PIN</span>
                    <span className="text-[#1B2436] font-semibold">{selectedRecord.customerPin}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Environment</span>
                    <span className="text-[#1B2436] font-bold">{selectedRecord.environment}</span>
                  </div>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#D8E2EC] space-y-1.5 font-mono text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#54657E]">Total Invoice:</span>
                    <span className="text-[#0F172A] font-bold">{formatKES(selectedRecord.totalAmountKes)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#54657E]">VAT Component (16%):</span>
                    <span className="text-[#1B2436] font-semibold">{formatKES(selectedRecord.vatAmountKes)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-[#D8E2EC]">
                    <span className="text-[#54657E]">Net Taxable:</span>
                    <span className="text-[#0F172A] font-bold">
                      {formatKES(selectedRecord.totalAmountKes - selectedRecord.vatAmountKes)}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 font-mono text-[11px]">
                  <div className="text-[#64748B] text-[10px] uppercase font-semibold">KRA Control Unit Serial</div>
                  <div className="text-[#1B2436] font-bold bg-[#E8EEF5] p-2 rounded-lg border border-[#D8E2EC]">
                    {selectedRecord.cuNumber}
                  </div>
                </div>

                {selectedRecord.kraReceiptNumber && (
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="text-[#64748B] text-[10px] uppercase font-semibold">KRA Fiscal Receipt Number</div>
                    <div className="text-emerald-800 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      {selectedRecord.kraReceiptNumber}
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsQrModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <QrCode size={14} /> Open eTIMS QR Verification
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-[#64748B] text-xs py-10">
              Select an invoice from the queue.
            </div>
          )}
        </div>
      </div>

      {/* QR Code / Receipt Verification Modal */}
      {selectedRecord && (
        <Modal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          title="KRA eTIMS Fiscal QR Verification"
          description={`Tax receipt audit verification for ${selectedRecord.invoiceNumber}`}
          maxWidth="md"
        >
          <div className="flex flex-col items-center justify-center p-4 space-y-4 text-center">
            {/* KRA QR Code Box */}
            <div className="p-4 bg-white rounded-xl shadow-md border border-[#D8E2EC] inline-block">
              <div className="h-44 w-44 bg-[#1B2436] flex flex-col items-center justify-center p-2 rounded-lg">
                <div className="grid grid-cols-5 gap-1.5 w-full h-full p-2 bg-white rounded">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-xs ${
                        (i % 2 === 0 || i % 5 === 0) ? 'bg-[#1B2436]' : 'bg-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1 font-mono text-xs">
              <div className="font-bold text-[#0F172A]">{selectedRecord.invoiceNumber}</div>
              <div className="text-[#54657E] text-[11px]">CU: {selectedRecord.cuNumber}</div>
              <div className="text-[#E03616] font-bold">
                KRA VERIFIED · {formatKES(selectedRecord.totalAmountKes)}
              </div>
            </div>

            <p className="text-[11px] text-[#64748B] max-w-xs">
              This cryptographic payload is scanned by customer fiscal auditors or KRA enforcement officers to validate real-time tax remittance.
            </p>

            {selectedRecord.verificationUrl && (
              <a
                href={selectedRecord.verificationUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#E03616] font-semibold hover:underline"
              >
                Inspect on KRA Portal <ExternalLink size={12} />
              </a>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
