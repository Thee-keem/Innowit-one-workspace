import React, { useState } from 'react';
import { RotateCcw, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  CreditNoteRecord,
  InvoiceRecord,
  StockMovementRecord,
  JournalEntry,
  ProductRecord,
} from '@/types';
import { formatKES } from '@/lib/utils';

interface CreateCreditNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: InvoiceRecord[];
  products: ProductRecord[];
  userFullName: string;
  onCreateCreditNote: (
    creditNote: CreditNoteRecord,
    reversingJournal: JournalEntry,
    restoredStockMovements: StockMovementRecord[]
  ) => void;
}

export function CreateCreditNoteModal({
  isOpen,
  onClose,
  invoices,
  products,
  userFullName,
  onCreateCreditNote,
}: CreateCreditNoteModalProps) {
  // Only invoices that are POSTED or KRA_ACCEPTED and have an invoiceNumber
  const eligibleInvoices = invoices.filter((inv) => inv.status !== 'DRAFT');

  const [selectedInvoiceId, setSelectedInvoiceId] = useState(eligibleInvoices[0]?.id || '');
  const [reasonCode, setReasonCode] = useState<
    'RETURN_GOODS' | 'PRICE_CORRECTION' | 'INVOICE_CANCELLATION' | 'SERVICE_DEFICIENCY'
  >('RETURN_GOODS');
  const [reasonNotes, setReasonNotes] = useState('');
  const [restoreStock, setRestoreStock] = useState(true);

  const selectedInvoice =
    eligibleInvoices.find((inv) => inv.id === selectedInvoiceId) || eligibleInvoices[0];

  // Return quantities tracking
  const [returnQtys, setReturnQtys] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    if (selectedInvoice && selectedInvoice.items) {
      for (const item of selectedInvoice.items) {
        map[item.id] = 1;
      }
    }
    return map;
  });

  const handleInvoiceChange = (id: string) => {
    setSelectedInvoiceId(id);
    const inv = eligibleInvoices.find((i) => i.id === id);
    if (inv && inv.items) {
      const map: Record<string, number> = {};
      for (const item of inv.items) {
        map[item.id] = 1;
      }
      setReturnQtys(map);
    }
  };

  const handleQtyChange = (itemId: string, max: number, qty: number) => {
    setReturnQtys((prev) => ({
      ...prev,
      [itemId]: Math.max(0, Math.min(max, qty)),
    }));
  };

  if (!selectedInvoice) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Create Fiscal Credit Note" maxWidth="md">
        <div className="p-4 text-center text-xs text-[#54657E]">
          No posted or validated tax invoices available to issue credit notes against.
        </div>
      </Modal>
    );
  }

  // Calculate return totals
  let returnSubtotal = 0;
  let returnTax = 0;
  const returnedItems: {
    productId: string;
    productSku: string;
    productName: string;
    quantity: number;
    unitPriceKes: number;
    taxRate: number;
    lineTotalKes: number;
  }[] = [];

  for (const item of selectedInvoice.items) {
    const qty = returnQtys[item.id] || 0;
    if (qty > 0) {
      const lineSubtotal = qty * item.unitPrice;
      const lineTax = Math.round(lineSubtotal * (item.taxRate || 0.16));
      returnSubtotal += lineSubtotal;
      returnTax += lineTax;

      returnedItems.push({
        productId: item.productId,
        productSku: item.productName || 'INNO-SKU',
        productName: item.description || item.productName,
        quantity: qty,
        unitPriceKes: item.unitPrice,
        taxRate: item.taxRate || 0.16,
        lineTotalKes: lineSubtotal + lineTax,
      });
    }
  }

  const returnTotal = returnSubtotal + returnTax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (returnedItems.length === 0 || returnTotal <= 0) return;

    const cnNumber = `CN-2026-${Date.now().toString().slice(-4)}`;
    const jeNumber = `JE-CN-${Date.now().toString().slice(-4)}`;
    const kraCnControlNo = `KRA-CN-${Date.now().toString().slice(-8)}`;
    const cuNumber = selectedInvoice.kraControlNumber || 'KRAMU010049281';
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const creditNote: CreditNoteRecord = {
      id: `cn_${Date.now()}`,
      creditNoteNumber: cnNumber,
      originalInvoiceId: selectedInvoice.id,
      originalInvoiceNumber: selectedInvoice.invoiceNumber,
      originalKraControlNumber: selectedInvoice.kraControlNumber || `KRA2026${Date.now().toString().slice(-7)}`,
      customerName: selectedInvoice.customerName,
      customerPin: selectedInvoice.customerPin,
      reasonCode,
      reasonNotes: reasonNotes || `Credit note issued for ${selectedInvoice.invoiceNumber}`,
      subtotalKes: returnSubtotal,
      taxAmountKes: returnTax,
      totalAmountKes: returnTotal,
      status: 'ACCEPTED',
      kraControlNumber: kraCnControlNo,
      cuNumber,
      issuedAt: timestamp,
      journalEntryId: `je_${cnNumber}`,
      items: returnedItems,
    };

    // Reversing Double-Entry General Ledger journal entry:
    // Dr 4010 Sales Revenue / Returns (Subtotal)
    // Dr 2020 VAT Output Liability (Tax)
    // Cr 1200 Accounts Receivable (Total)
    const reversingJournal: JournalEntry = {
      id: `je_${cnNumber}`,
      entryNumber: jeNumber,
      date: new Date().toISOString().slice(0, 10),
      reference: cnNumber,
      memo: `Credit Note ${cnNumber} reversing ${selectedInvoice.invoiceNumber} (${reasonCode})`,
      postedBy: userFullName,
      createdBy: userFullName,
      status: 'POSTED',
      postedAt: new Date().toISOString(),
      sourceModule: 'ETIMS_COMPLIANCE',
      lines: [
        {
          id: `line_cn_1_${Date.now()}`,
          accountId: 'acc_4010',
          accountNumber: '4010',
          accountName: 'Sales Revenue - Standard VAT',
          description: `Credit Note reversal: ${cnNumber} on ${selectedInvoice.invoiceNumber}`,
          debit: returnSubtotal,
          credit: 0,
        },
        {
          id: `line_cn_2_${Date.now()}`,
          accountId: 'acc_2020',
          accountNumber: '2020',
          accountName: 'KRA VAT Output Liability (16%)',
          description: `VAT output tax offset for credit note ${cnNumber}`,
          debit: returnTax,
          credit: 0,
        },
        {
          id: `line_cn_3_${Date.now()}`,
          accountId: 'acc_1200',
          accountNumber: '1200',
          accountName: 'Accounts Receivable (Trade Debtors)',
          description: `Receivable reduction for ${selectedInvoice.customerName}`,
          debit: 0,
          credit: returnTotal,
        },
      ],
      totalDebit: returnTotal,
      totalCredit: returnTotal,
    };

    // Optional physical inventory stock restoration
    const restoredMovements: StockMovementRecord[] = [];
    if (restoreStock && reasonCode === 'RETURN_GOODS') {
      for (const item of returnedItems) {
        restoredMovements.push({
          id: `mov_cn_${Date.now()}_${item.productId}`,
          movementNumber: `MOV-${cnNumber}-${item.productSku}`,
          productId: item.productId,
          productSku: item.productSku,
          productName: item.productName,
          warehouseId: 'wh_nbo_01',
          warehouseName: 'Nairobi Central Master Warehouse',
          movementType: 'RETURN',
          quantity: item.quantity,
          unitCostKes: Math.round(item.unitPriceKes * 0.64),
          totalValueKes: Math.round(item.quantity * item.unitPriceKes * 0.64),
          referenceDocument: cnNumber,
          reason: `Credit note physical item return from ${selectedInvoice.customerName}`,
          performedBy: userFullName,
          timestamp,
          journalEntryId: `je_${cnNumber}`,
        });
      }
    }

    onCreateCreditNote(creditNote, reversingJournal, restoredMovements);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Issue Official KRA eTIMS Credit Note"
      description="Process tax-compliant invoice adjustments with automatic GL ledger reversal and eTIMS transmission."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Warning Banner */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={16} />
          <div>
            <div className="font-semibold text-amber-950">Statutory KRA eTIMS Linkage Requirement</div>
            <p className="mt-0.5 text-amber-800 text-[11px] leading-relaxed">
              Every Credit Note must reference a validated original tax invoice. Once confirmed, the system submits the adjustment payload referencing the original KRA Control Number and posts reversing General Ledger entries.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Select Original Tax Invoice <span className="text-[#E03616]">*</span>
            </label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => handleInvoiceChange(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            >
              {eligibleInvoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} — {inv.customerName} (KES {inv.totalAmount.toLocaleString()})
                </option>
              ))}
            </select>
            <span className="text-[10px] text-[#64748B] mt-1 block">
              CU Ref: {selectedInvoice.kraControlNumber || 'KRA2026049281'} • Customer PIN: {selectedInvoice.customerPin}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Statutory KRA Reason Code <span className="text-[#E03616]">*</span>
            </label>
            <select
              value={reasonCode}
              onChange={(e) => setReasonCode(e.target.value as any)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            >
              <option value="RETURN_GOODS">RETURN_GOODS (Physical Stock Returned)</option>
              <option value="PRICE_CORRECTION">PRICE_CORRECTION (Commercial Discount/Rate Variance)</option>
              <option value="INVOICE_CANCELLATION">INVOICE_CANCELLATION (Duplicate / Full Nullification)</option>
              <option value="SERVICE_DEFICIENCY">SERVICE_DEFICIENCY (Service Delivery Adjustment)</option>
            </select>
          </div>
        </div>

        {/* Line Items Return Quantities Input */}
        <div className="rounded-xl border border-[#D8E2EC] bg-white overflow-hidden shadow-xs">
          <div className="p-3 bg-[#E8EEF5] border-b border-[#D8E2EC] flex items-center justify-between">
            <span className="text-xs font-bold text-[#1B2436] uppercase tracking-wider">
              Invoiced Line Items Available for Credit Note
            </span>
            <span className="text-[11px] text-[#54657E]">Values cannot exceed original invoice</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[11px] font-semibold text-[#54657E] border-b border-[#D8E2EC]">
              <tr>
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3 w-24 text-right">Invoiced Qty</th>
                <th className="py-2.5 px-3 w-32 text-right">Unit Price</th>
                <th className="py-2.5 px-3 w-28 text-right">Credit Qty</th>
                <th className="py-2.5 px-3 w-32 text-right">Credit Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8E2EC]">
              {selectedInvoice.items.map((item) => {
                const currentReturnQty = returnQtys[item.id] || 0;
                const lineNet = currentReturnQty * item.unitPrice;

                return (
                  <tr key={item.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-[#0F172A]">
                        {item.description || item.productName}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[#54657E]">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[#54657E]">
                      {formatKES(item.unitPrice)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        max={item.quantity}
                        value={currentReturnQty}
                        onChange={(e) =>
                          handleQtyChange(item.id, item.quantity, parseInt(e.target.value) || 0)
                        }
                        className="w-20 rounded border border-[#D8E2EC] bg-white px-2 py-1 text-xs text-right font-mono tabular-nums font-bold text-[#0F172A] focus:border-[#E03616] focus:outline-none"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-[#1B2436]">
                      {formatKES(lineNet)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Physical Stock Return Checkbox */}
        {reasonCode === 'RETURN_GOODS' && (
          <div className="rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] p-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={restoreStock}
                onChange={(e) => setRestoreStock(e.target.checked)}
                className="rounded border-[#D8E2EC] text-[#E03616] focus:ring-[#E03616]"
              />
              <span className="font-semibold text-[#0F172A]">
                Restore returned physical units to Central Master Warehouse stock ledger (Type: RETURN)
              </span>
            </label>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1">
            Reason Notes / Fiscal Justification
          </label>
          <input
            type="text"
            placeholder="e.g. Returned 1 unit damaged switch under warranty replacement agreement"
            value={reasonNotes}
            onChange={(e) => setReasonNotes(e.target.value)}
            className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
          />
        </div>

        {/* Totals Summary */}
        <div className="p-3.5 rounded-xl border border-[#D8E2EC] bg-[#F8FAFC] flex flex-col items-end space-y-1 text-xs font-mono">
          <div className="flex justify-between w-64 text-[#54657E]">
            <span>Net Taxable Credit:</span>
            <span className="tabular-nums font-semibold">{formatKES(returnSubtotal)}</span>
          </div>
          <div className="flex justify-between w-64 text-[#54657E]">
            <span>16% VAT Offset:</span>
            <span className="tabular-nums font-semibold">{formatKES(returnTax)}</span>
          </div>
          <div className="flex justify-between w-64 text-sm font-bold text-[#0F172A] pt-1 border-t border-[#D8E2EC]">
            <span>Total Credit Value:</span>
            <span className="tabular-nums text-[#E03616]">{formatKES(returnTotal)}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D8E2EC]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={returnedItems.length === 0 || returnTotal <= 0}
            className="flex items-center gap-1.5"
          >
            <ShieldCheck size={14} /> Submit & Transmit Credit Note
          </Button>
        </div>
      </form>
    </Modal>
  );
}
