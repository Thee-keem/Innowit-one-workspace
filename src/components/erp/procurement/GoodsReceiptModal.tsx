import React, { useState } from 'react';
import { PackageCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  PurchaseOrderRecord,
  WarehouseRecord,
  GoodsReceiptNoteRecord,
  GoodsReceiptNoteItem,
  StockMovementRecord,
  SupplierBillRecord,
  JournalEntry,
  ProductRecord,
} from '@/types';
import { formatKES } from '@/lib/utils';

interface GoodsReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrder: PurchaseOrderRecord | null;
  warehouses: WarehouseRecord[];
  products: ProductRecord[];
  userFullName: string;
  onConfirmReceipt: (
    grn: GoodsReceiptNoteRecord,
    movements: StockMovementRecord[],
    updatedProducts: ProductRecord[],
    bill?: SupplierBillRecord,
    journalEntry?: JournalEntry
  ) => void;
}

export function GoodsReceiptModal({
  isOpen,
  onClose,
  purchaseOrder,
  warehouses,
  products,
  userFullName,
  onConfirmReceipt,
}: GoodsReceiptModalProps) {
  if (!purchaseOrder) return null;

  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || '');
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('All units verified against vendor delivery note and inspected.');
  const [autoGenerateBill, setAutoGenerateBill] = useState(true);

  // Delivered quantities tracker per line
  const [receivedQtys, setReceivedQtys] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const item of purchaseOrder.items) {
      map[item.id] = item.quantity - item.receivedQuantity;
    }
    return map;
  });

  const selectedWarehouse = warehouses.find((w) => w.id === warehouseId) || warehouses[0];

  const handleQtyChange = (itemId: string, max: number, val: number) => {
    setReceivedQtys((prev) => ({
      ...prev,
      [itemId]: Math.max(0, Math.min(max, val)),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const grnNumber = `GRN-2026-${Date.now().toString().slice(-4)}`;
    const billNumber = `BILL-2026-${Date.now().toString().slice(-4)}`;
    const jeNumber = `JE-GRN-${Date.now().toString().slice(-4)}`;

    const grnItems: GoodsReceiptNoteItem[] = [];
    const stockMovements: StockMovementRecord[] = [];
    const updatedProducts: ProductRecord[] = [...products];

    let totalReceiptValue = 0;

    for (const item of purchaseOrder.items) {
      const qty = receivedQtys[item.id] || 0;
      if (qty <= 0) continue;

      const lineTotal = qty * item.unitCostKes;
      totalReceiptValue += lineTotal;

      grnItems.push({
        productId: item.productId,
        productSku: item.productSku,
        productName: item.productName,
        quantityReceived: qty,
        unitCostKes: item.unitCostKes,
        totalCostKes: lineTotal,
      });

      // 1. Immutable Stock Movement Entry
      stockMovements.push({
        id: `mov_grn_${Date.now()}_${item.id}`,
        movementNumber: `MOV-${grnNumber}-${item.productSku}`,
        productId: item.productId,
        productSku: item.productSku,
        productName: item.productName,
        warehouseId: selectedWarehouse.id,
        warehouseName: selectedWarehouse.name,
        movementType: 'RECEIPT',
        quantity: qty,
        unitCostKes: item.unitCostKes,
        totalValueKes: lineTotal,
        referenceDocument: grnNumber,
        reason: `PO Fulfillment: ${purchaseOrder.poNumber} from ${purchaseOrder.supplierName}`,
        performedBy: userFullName,
        timestamp,
        journalEntryId: autoGenerateBill ? `je_${billNumber}` : undefined,
      });

      // 2. Increment physical product stock on hand
      const prodIndex = updatedProducts.findIndex((p) => p.id === item.productId);
      if (prodIndex >= 0) {
        updatedProducts[prodIndex] = {
          ...updatedProducts[prodIndex],
          stockOnHand: updatedProducts[prodIndex].stockOnHand + qty,
        };
      }
    }

    if (grnItems.length === 0) return;

    // Optional 3-way matching supplier bill & balancing journal entry
    let supplierBill: SupplierBillRecord | undefined;
    let journalEntry: JournalEntry | undefined;

    if (autoGenerateBill) {
      const taxAmount = Math.round(totalReceiptValue * 0.16);
      const totalAmountWithTax = totalReceiptValue + taxAmount;

      supplierBill = {
        id: `bill_${Date.now()}`,
        billNumber,
        supplierId: purchaseOrder.supplierId,
        supplierName: purchaseOrder.supplierName,
        supplierPin: purchaseOrder.supplierPin,
        grnId: `grn_${Date.now()}`,
        grnNumber,
        poNumber: purchaseOrder.poNumber,
        billDate: receivedDate,
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        amountKes: totalReceiptValue,
        taxAmountKes: taxAmount,
        totalAmountKes: totalAmountWithTax,
        status: 'UNPAID',
        journalEntryId: `je_${billNumber}`,
      };

      // Atomic Balanced Journal Entry:
      // Dr 1300 Inventory Assets (Subtotal)
      // Dr 2020 VAT Input / Output Offset (Tax)
      // Cr 2010 Accounts Payable (Total)
      journalEntry = {
        id: `je_${billNumber}`,
        entryNumber: jeNumber,
        date: receivedDate,
        reference: billNumber,
        memo: `Supplier Bill for ${grnNumber} - ${purchaseOrder.supplierName} (PO: ${purchaseOrder.poNumber})`,
        postedBy: userFullName,
        createdBy: userFullName,
        status: 'POSTED',
        postedAt: new Date().toISOString(),
        sourceModule: 'PROCUREMENT',
        lines: [
          {
            id: `line_grn_1_${Date.now()}`,
            accountId: 'acc_1300',
            accountNumber: '1300',
            accountName: 'Inventory Asset Account',
            description: `Physical stock received at ${selectedWarehouse.name} (${grnNumber})`,
            debit: totalReceiptValue,
            credit: 0,
          },
          {
            id: `line_grn_2_${Date.now()}`,
            accountId: 'acc_2020',
            accountNumber: '2020',
            accountName: 'KRA VAT Input Tax (16%)',
            description: `Input VAT claimable on vendor bill ${billNumber}`,
            debit: taxAmount,
            credit: 0,
          },
          {
            id: `line_grn_3_${Date.now()}`,
            accountId: 'acc_2010',
            accountNumber: '2010',
            accountName: 'Accounts Payable (Trade Creditors)',
            description: `Payable liability to ${purchaseOrder.supplierName}`,
            debit: 0,
            credit: totalAmountWithTax,
          },
        ],
        totalDebit: totalAmountWithTax,
        totalCredit: totalAmountWithTax,
      };
    }

    const grnRecord: GoodsReceiptNoteRecord = {
      id: `grn_${Date.now()}`,
      grnNumber,
      poId: purchaseOrder.id,
      poNumber: purchaseOrder.poNumber,
      supplierId: purchaseOrder.supplierId,
      supplierName: purchaseOrder.supplierName,
      warehouseId: selectedWarehouse.id,
      warehouseName: selectedWarehouse.name,
      receivedDate,
      receivedBy: userFullName,
      items: grnItems,
      totalValueKes: totalReceiptValue,
      billGenerated: autoGenerateBill,
      billId: supplierBill?.id,
      journalEntryId: journalEntry?.id,
      notes,
    };

    onConfirmReceipt(grnRecord, stockMovements, updatedProducts, supplierBill, journalEntry);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Goods Receipt Note (GRN) — ${purchaseOrder.poNumber}`}
      description="Inspect delivery, allocate to warehouse bins, update stock balance, and register 3-way matching Accounts Payable liability."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] p-3 text-xs">
            <span className="text-[10px] uppercase font-bold text-[#64748B] block">Vendor</span>
            <div className="font-semibold text-[#0F172A] mt-0.5">{purchaseOrder.supplierName}</div>
            <div className="text-[10px] font-mono text-[#54657E]">PIN: {purchaseOrder.supplierPin}</div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Destination Warehouse <span className="text-[#E03616]">*</span>
            </label>
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.code} — {w.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Date Goods Received <span className="text-[#E03616]">*</span>
            </label>
            <input
              type="date"
              required
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs font-mono text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Quantities Received Input Table */}
        <div className="rounded-xl border border-[#D8E2EC] bg-white overflow-hidden shadow-xs">
          <div className="p-3 bg-[#E8EEF5] border-b border-[#D8E2EC] flex items-center justify-between">
            <span className="text-xs font-bold text-[#1B2436] uppercase tracking-wider">
              Verify Physical Delivered Quantities
            </span>
            <span className="text-[11px] text-[#54657E]">Supports Partial Deliveries</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[11px] font-semibold text-[#54657E] border-b border-[#D8E2EC]">
              <tr>
                <th className="py-2.5 px-3">Item / SKU</th>
                <th className="py-2.5 px-3 w-24 text-right">Ordered</th>
                <th className="py-2.5 px-3 w-28 text-right">Remaining</th>
                <th className="py-2.5 px-3 w-32 text-right">Delivered Now</th>
                <th className="py-2.5 px-3 w-32 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8E2EC]">
              {purchaseOrder.items.map((item) => {
                const max = item.quantity - item.receivedQuantity;
                const currentQty = receivedQtys[item.id] || 0;
                const lineNet = currentQty * item.unitCostKes;

                return (
                  <tr key={item.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-[#0F172A]">{item.productName}</div>
                      <div className="text-[10px] font-mono text-[#64748B]">{item.productSku}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[#54657E]">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-[#0F172A]">
                      {max}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        max={max}
                        value={currentQty}
                        onChange={(e) =>
                          handleQtyChange(item.id, max, parseInt(e.target.value) || 0)
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

        {/* 3-Way Matching AP Bill Option */}
        <div className="rounded-xl border border-[#D8E2EC] bg-[#F8FAFC] p-3.5 space-y-2">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={autoGenerateBill}
              onChange={(e) => setAutoGenerateBill(e.target.checked)}
              className="mt-0.5 rounded border-[#D8E2EC] text-[#E03616] focus:ring-[#E03616]"
            />
            <div>
              <span className="text-xs font-bold text-[#0F172A] block">
                Automatically generate Supplier Bill & post to Accounts Payable (3-Way Matching)
              </span>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Will create matching vendor bill and atomic Double-Entry Journal Entry: Dr 1300 Inventory Assets, Dr 2020 VAT Input, Cr 2010 Accounts Payable.
              </p>
            </div>
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1">
            Receiving Officer Inspection Remarks
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D8E2EC]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" className="flex items-center gap-1.5">
            <PackageCheck size={14} /> Confirm Goods Receipt & Update Stock
          </Button>
        </div>
      </form>
    </Modal>
  );
}
