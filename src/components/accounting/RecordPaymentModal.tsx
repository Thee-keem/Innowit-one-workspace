import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { InvoiceRecord, PaymentRecord } from '@/types';
import { DollarSign, ShieldCheck, CreditCard, CheckCircle2 } from 'lucide-react';
import { formatKES } from '@/lib/utils';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceRecord | null;
  onRecordPayment: (
    invoiceId: string,
    payment: PaymentRecord,
    isFullSettlement: boolean
  ) => void;
  currentUserFullName: string;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  invoice,
  onRecordPayment,
  currentUserFullName,
}: RecordPaymentModalProps) {
  const [amountKes, setAmountKes] = useState(invoice ? String(invoice.balanceDue) : '0');
  const [paymentMethod, setPaymentMethod] = useState<PaymentRecord['paymentMethod']>('BANK_TRANSFER');
  const [referenceCode, setReferenceCode] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  if (!isOpen || !invoice) return null;

  const paymentAmount = parseFloat(amountKes) || 0;
  const newRemainingBalance = Math.max(0, invoice.balanceDue - paymentAmount);
  const isFull = newRemainingBalance === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) return;

    const newPayment: PaymentRecord = {
      id: `pay_${Date.now()}`,
      invoiceId: invoice.id,
      paymentNumber: `RCPT-2026-${String(Math.floor(100 + Math.random() * 900))}`,
      date,
      amount: paymentAmount,
      paymentMethod,
      referenceCode: referenceCode.trim() || 'TRF-DIRECT',
      recordedBy: currentUserFullName,
      notes: notes.trim() || undefined,
    };

    onRecordPayment(invoice.id, newPayment, isFull);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Customer Payment Receipt"
      description={`Record cash or bank settlement against invoice ${invoice.invoiceNumber}.`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Invoice Summary Banner */}
        <div className="p-3 rounded-xl border border-[#D8E2EC] bg-[#F8FAFC] space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#64748B]">Customer:</span>
            <strong className="text-[#0F172A]">{invoice.customerName}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#64748B]">Invoice Total:</span>
            <span className="font-mono text-[#0F172A]">{formatKES(invoice.totalAmount)}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-[#D8E2EC]">
            <span className="text-[#64748B] font-semibold">Current Balance Due:</span>
            <span className="font-mono font-bold text-[#E03616] text-sm">
              {formatKES(invoice.balanceDue)}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1">
            Payment Amount (KES) <span className="text-[#E03616]">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#64748B]">
              KES
            </span>
            <input
              required
              type="number"
              min="1"
              max={invoice.balanceDue}
              value={amountKes}
              onChange={(e) => setAmountKes(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-white pl-12 pr-3 py-1.5 text-xs text-[#0F172A] font-mono font-bold focus:border-[#E03616] focus:outline-none"
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-[#54657E]">
            <span>Remaining balance after payment:</span>
            <strong className="font-mono text-[#0F172A]">{formatKES(newRemainingBalance)}</strong>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentRecord['paymentMethod'])}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:outline-none"
            >
              <option value="BANK_TRANSFER">Bank Wire / RTGS / EFT</option>
              <option value="M-PESA">M-Pesa Corporate Paybill</option>
              <option value="CHEQUE">Banker&apos;s Cheque</option>
              <option value="CASH">Cash / Petty Float</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Receipt Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] font-mono focus:border-[#E03616] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1">
            Reference / Transaction Code <span className="text-[#E03616]">*</span>
          </label>
          <input
            required
            type="text"
            placeholder="e.g. M-Pesa Code QG721HD89 or NCBA-TRF-094812"
            value={referenceCode}
            onChange={(e) => setReferenceCode(e.target.value)}
            className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] font-mono focus:border-[#E03616] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1">
            Notes & Verification Details
          </label>
          <textarea
            rows={2}
            placeholder="Banking slip number, cashier initials, branch deposit..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#54657E] pt-1">
          <ShieldCheck size={14} className="text-emerald-700" />
          <span>Generates balancing cash voucher: Dr Operating Bank (1020), Cr Accounts Receivable (1200).</span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D8E2EC]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Post Payment Receipt
          </Button>
        </div>
      </form>
    </Modal>
  );
}
