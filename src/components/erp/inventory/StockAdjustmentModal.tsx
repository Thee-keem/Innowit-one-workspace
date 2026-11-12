import React, { useState } from 'react';
import { SlidersHorizontal, AlertTriangle, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ProductRecord, WarehouseRecord, StockMovementRecord, JournalEntry } from '@/types';
import { formatKES } from '@/lib/utils';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductRecord[];
  warehouses: WarehouseRecord[];
  userFullName: string;
  onPostAdjustment: (
    movement: StockMovementRecord,
    journalEntry: JournalEntry,
    updatedProduct: ProductRecord
  ) => void;
}

export function StockAdjustmentModal({
  isOpen,
  onClose,
  products,
  warehouses,
  userFullName,
  onPostAdjustment,
}: StockAdjustmentModalProps) {
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(warehouses[0]?.id || '');
  const [adjustmentType, setAdjustmentType] = useState<'INCREASE' | 'DECREASE'>('DECREASE');
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState('Audit Variance / Physical Count Discrepancy');
  const [notes, setNotes] = useState('');

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const selectedWarehouse = warehouses.find((w) => w.id === selectedWarehouseId) || warehouses[0];

  const qtyNumber = parseInt(quantity, 10) || 0;
  // Estimated unit cost: approximately 60% of unit price if not specified
  const unitCost = Math.round(selectedProduct ? selectedProduct.unitPriceKes * 0.64 : 0);
  const totalValue = unitCost * qtyNumber;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !selectedWarehouse || qtyNumber <= 0) return;

    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const movementNumber = `ADJ-${Date.now().toString().slice(-6)}`;
    const jeNumber = `JE-ADJ-${Date.now().toString().slice(-6)}`;

    const movementQty = adjustmentType === 'INCREASE' ? qtyNumber : -qtyNumber;

    const movement: StockMovementRecord = {
      id: `mov_adj_${Date.now()}`,
      movementNumber,
      productId: selectedProduct.id,
      productSku: selectedProduct.sku,
      productName: selectedProduct.name,
      warehouseId: selectedWarehouse.id,
      warehouseName: selectedWarehouse.name,
      movementType: 'ADJUSTMENT',
      quantity: movementQty,
      unitCostKes: unitCost,
      totalValueKes: totalValue,
      referenceDocument: movementNumber,
      reason: `${reason} - ${notes || 'Stock audit reconciliation'}`,
      performedBy: userFullName,
      timestamp,
      journalEntryId: `je_${movementNumber}`,
    };

    // Double-Entry Atomic Balancing Journal Entry
    // If DECREASE (Shrinkage/Damage): Dr 5020 Inventory Shrinkage (Expense), Cr 1300 Inventory Assets
    // If INCREASE (Found Stock/Surplus): Dr 1300 Inventory Assets, Cr 5020 Inventory Adjustment/Income
    const journalEntry: JournalEntry = {
      id: `je_${movementNumber}`,
      entryNumber: jeNumber,
      date: new Date().toISOString().slice(0, 10),
      reference: movementNumber,
      memo: `Stock Adjustment: ${selectedProduct.sku} (${adjustmentType} ${qtyNumber} units) - ${reason}`,
      postedBy: userFullName,
      createdBy: userFullName,
      status: 'POSTED',
      postedAt: new Date().toISOString(),
      sourceModule: 'INVENTORY',
      lines:
        adjustmentType === 'DECREASE'
          ? [
              {
                id: `line_adj_1_${Date.now()}`,
                accountId: 'acc_5010',
                accountNumber: '5020',
                accountName: 'Inventory Shrinkage & Write-Downs',
                description: `Shrinkage: Write off ${qtyNumber} units of ${selectedProduct.sku}`,
                debit: totalValue,
                credit: 0,
              },
              {
                id: `line_adj_2_${Date.now()}`,
                accountId: 'acc_1300',
                accountNumber: '1300',
                accountName: 'Inventory Asset Account',
                description: `Reduction in stock on hand at ${selectedWarehouse.name}`,
                debit: 0,
                credit: totalValue,
              },
            ]
          : [
              {
                id: `line_adj_1_${Date.now()}`,
                accountId: 'acc_1300',
                accountNumber: '1300',
                accountName: 'Inventory Asset Account',
                description: `Inventory surplus recognized: ${selectedProduct.sku}`,
                debit: totalValue,
                credit: 0,
              },
              {
                id: `line_adj_2_${Date.now()}`,
                accountId: 'acc_5010',
                accountNumber: '5020',
                accountName: 'Inventory Shrinkage & Adjustments',
                description: `Stock audit surplus offset for ${selectedWarehouse.name}`,
                debit: 0,
                credit: totalValue,
              },
            ],
      totalDebit: totalValue,
      totalCredit: totalValue,
    };

    const newStockOnHand = Math.max(0, selectedProduct.stockOnHand + movementQty);
    const updatedProduct: ProductRecord = {
      ...selectedProduct,
      stockOnHand: newStockOnHand,
    };

    onPostAdjustment(movement, journalEntry, updatedProduct);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stock Ledger Adjustment (Atomic GL Post)"
      description="Record physical stock discrepancies with atomic Double-Entry General Ledger write-off or surplus postings."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Warning Banner */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={16} />
          <div>
            <div className="font-semibold text-amber-950">GAAP General Ledger Linkage Warning</div>
            <p className="mt-0.5 text-amber-800 text-[11px] leading-relaxed">
              Every adjustment immediately writes an immutable record to the physical stock ledger and posts an atomic balancing Journal Entry into Account 1300 (Inventory Asset) and Account 5020 (Inventory Shrinkage).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Select Product SKU <span className="text-[#E03616]">*</span>
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} — {p.name} (On Hand: {p.stockOnHand})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Physical Warehouse Location <span className="text-[#E03616]">*</span>
            </label>
            <select
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.code} — {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Adjustment Type <span className="text-[#E03616]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjustmentType('DECREASE')}
                className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  adjustmentType === 'DECREASE'
                    ? 'border-[#E03616] bg-[#E03616]/10 text-[#E03616]'
                    : 'border-[#D8E2EC] bg-[#F8FAFC] text-[#54657E] hover:bg-[#E8EEF5]'
                }`}
              >
                <ArrowDownRight size={14} /> Write-Down
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType('INCREASE')}
                className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  adjustmentType === 'INCREASE'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                    : 'border-[#D8E2EC] bg-[#F8FAFC] text-[#54657E] hover:bg-[#E8EEF5]'
                }`}
              >
                <ArrowUpRight size={14} /> Surplus
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Quantity <span className="text-[#E03616]">*</span>
            </label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs font-mono tabular-nums text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Audit Reason Category
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            >
              <option value="Audit Variance / Physical Count Discrepancy">Audit Physical Count Discrepancy</option>
              <option value="Damaged in Transit / Warehouse Handling">Damaged in Transit or Handling</option>
              <option value="Warranty Return / Defective Component">Defective Component Write-Off</option>
              <option value="Packaging Breach / Exposure">Packaging Breach / Depleted</option>
              <option value="Internal Demo & Testing Unit Allocation">Internal R&D / Testing Demo Kit</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1">
            Auditor Notes / Reference Document
          </label>
          <input
            type="text"
            placeholder="e.g. Q4 warehouse count sheet #14 audited by Sarah Chebet"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
          />
        </div>

        {/* GL Posting Impact Preview */}
        <div className="rounded-xl border border-[#D8E2EC] bg-[#E8EEF5]/60 p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#1B2436] flex items-center gap-1.5">
              <SlidersHorizontal size={14} className="text-[#E03616]" />
              Double-Entry General Ledger Impact
            </span>
            <span className="font-mono font-bold text-[#0F172A] tabular-nums">
              KES {totalValue.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[11px] pt-1 border-t border-[#D8E2EC]">
            <div className="rounded border border-emerald-200 bg-emerald-50/70 p-2">
              <span className="font-bold text-emerald-800 uppercase tracking-wider block text-[10px]">
                Debit Line
              </span>
              <span className="text-emerald-950 font-medium">
                {adjustmentType === 'DECREASE'
                  ? '5020 Inventory Shrinkage (Expense)'
                  : '1300 Inventory Assets (Asset)'}
              </span>
              <div className="font-mono text-emerald-700 font-bold mt-0.5">
                + KES {totalValue.toLocaleString()}
              </div>
            </div>

            <div className="rounded border border-rose-200 bg-rose-50/70 p-2">
              <span className="font-bold text-rose-800 uppercase tracking-wider block text-[10px]">
                Credit Line
              </span>
              <span className="text-rose-950 font-medium">
                {adjustmentType === 'DECREASE'
                  ? '1300 Inventory Assets (Asset)'
                  : '5020 Inventory Adjustments (Offset)'}
              </span>
              <div className="font-mono text-rose-700 font-bold mt-0.5">
                - KES {totalValue.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D8E2EC]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" className="flex items-center gap-1.5">
            <CheckCircle2 size={14} /> Post Stock Adjustment & GL Entry
          </Button>
        </div>
      </form>
    </Modal>
  );
}
