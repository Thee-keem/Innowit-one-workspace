import React, { useState } from 'react';
import { ShoppingCart, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ProductRecord, SupplierRecord, Branch, PurchaseOrderRecord, PurchaseOrderItem } from '@/types';
import { formatKES } from '@/lib/utils';

interface CreatePurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: SupplierRecord[];
  products: ProductRecord[];
  branches: Branch[];
  userFullName: string;
  onCreatePO: (po: PurchaseOrderRecord) => void;
}

export function CreatePurchaseOrderModal({
  isOpen,
  onClose,
  suppliers,
  products,
  branches,
  userFullName,
  onCreatePO,
}: CreatePurchaseOrderModalProps) {
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [branchId, setBranchId] = useState(branches[0]?.id || '');
  const [expectedDate, setExpectedDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState<
    { productId: string; quantity: number; unitCostKes: number }[]
  >([
    {
      productId: products[1]?.id || products[0]?.id || '',
      quantity: 10,
      unitCostKes: Math.round((products[1]?.unitPriceKes || products[0]?.unitPriceKes || 50000) * 0.64),
    },
  ]);

  const selectedSupplier = suppliers.find((s) => s.id === supplierId) || suppliers[0];
  const selectedBranch = branches.find((b) => b.id === branchId) || branches[0];

  const handleAddItem = () => {
    const defaultProd = products[0];
    setItems((prev) => [
      ...prev,
      {
        productId: defaultProd.id,
        quantity: 5,
        unitCostKes: Math.round(defaultProd.unitPriceKes * 0.64),
      },
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateItem = (
    idx: number,
    field: 'productId' | 'quantity' | 'unitCostKes',
    value: any
  ) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        if (field === 'productId') {
          const prod = products.find((p) => p.id === value);
          const autoCost = prod ? Math.round(prod.unitPriceKes * 0.64) : item.unitCostKes;
          return { ...item, productId: value, unitCostKes: autoCost };
        }
        return { ...item, [field]: value };
      })
    );
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitCostKes, 0);
  const taxAmount = Math.round(subtotal * 0.16);
  const totalAmount = subtotal + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || items.length === 0 || subtotal <= 0) return;

    const poNumber = `PO-2026-${Date.now().toString().slice(-4)}`;
    const lineItems: PurchaseOrderItem[] = items.map((item, idx) => {
      const prod = products.find((p) => p.id === item.productId) || products[0];
      const lineNet = item.quantity * item.unitCostKes;
      return {
        id: `poi_${Date.now()}_${idx}`,
        productId: prod.id,
        productSku: prod.sku,
        productName: prod.name,
        quantity: item.quantity,
        receivedQuantity: 0,
        unitCostKes: item.unitCostKes,
        taxRate: 0.16,
        lineTotalKes: Math.round(lineNet * 1.16),
      };
    });

    const newPO: PurchaseOrderRecord = {
      id: `po_${Date.now()}`,
      poNumber,
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.name,
      supplierPin: selectedSupplier.kraPin,
      branchId: selectedBranch.id,
      branchName: selectedBranch.name,
      orderDate: new Date().toISOString().slice(0, 10),
      expectedDeliveryDate: expectedDate,
      status: 'PENDING_APPROVAL',
      items: lineItems,
      subtotalKes: subtotal,
      taxAmountKes: taxAmount,
      totalAmountKes: totalAmount,
      notes: notes.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
    };

    onCreatePO(newPO);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Commercial Purchase Order"
      description="Issue official procurement purchase order with KRA PIN tax verification and line item cost pricing."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Select Vendor / Supplier <span className="text-[#E03616]">*</span>
            </label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (PIN: {s.kraPin})
                </option>
              ))}
            </select>
            {selectedSupplier && (
              <span className="text-[10px] text-[#64748B] mt-1 block">
                Payment Terms: Net {selectedSupplier.paymentTermsDays} Days • Category: {selectedSupplier.category}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Receiving Branch Facility <span className="text-[#E03616]">*</span>
            </label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Expected Delivery Date <span className="text-[#E03616]">*</span>
            </label>
            <input
              type="date"
              required
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] font-mono focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Line Items Table */}
        <div className="rounded-xl border border-[#D8E2EC] bg-white overflow-hidden shadow-xs">
          <div className="p-3 bg-[#E8EEF5] border-b border-[#D8E2EC] flex items-center justify-between">
            <span className="text-xs font-bold text-[#1B2436] uppercase tracking-wider">
              Procurement Line Items (KRA 16% VAT Applicable)
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              className="text-xs h-7 px-2.5 flex items-center gap-1"
            >
              <Plus size={12} /> Add Item Line
            </Button>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[11px] font-semibold text-[#54657E] border-b border-[#D8E2EC]">
              <tr>
                <th className="py-2.5 px-3">Item / SKU Description</th>
                <th className="py-2.5 px-3 w-24 text-right">Quantity</th>
                <th className="py-2.5 px-3 w-36 text-right">Unit Cost (KES)</th>
                <th className="py-2.5 px-3 w-36 text-right">Line Total (KES)</th>
                <th className="py-2.5 px-3 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8E2EC]">
              {items.map((item, idx) => {
                const lineNet = item.quantity * item.unitCostKes;
                return (
                  <tr key={idx} className="hover:bg-[#F8FAFC]">
                    <td className="py-2 px-3">
                      <select
                        value={item.productId}
                        onChange={(e) => handleUpdateItem(idx, 'productId', e.target.value)}
                        className="w-full rounded border border-[#D8E2EC] bg-white px-2 py-1 text-xs text-[#0F172A] focus:border-[#E03616] focus:outline-none"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.sku} — {p.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateItem(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))
                        }
                        className="w-full rounded border border-[#D8E2EC] bg-white px-2 py-1 text-xs text-right font-mono tabular-nums text-[#0F172A] focus:border-[#E03616] focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="0"
                        value={item.unitCostKes}
                        onChange={(e) =>
                          handleUpdateItem(
                            idx,
                            'unitCostKes',
                            Math.max(0, parseFloat(e.target.value) || 0)
                          )
                        }
                        className="w-full rounded border border-[#D8E2EC] bg-white px-2 py-1 text-xs text-right font-mono tabular-nums text-[#0F172A] focus:border-[#E03616] focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-semibold tabular-nums text-[#0F172A]">
                      {formatKES(lineNet)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-[#54657E] hover:text-[#E03616] transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals Summary */}
          <div className="p-4 bg-[#F8FAFC] border-t border-[#D8E2EC] flex flex-col items-end space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between w-64 text-[#54657E]">
              <span>Subtotal Net:</span>
              <span className="tabular-nums font-semibold">{formatKES(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between w-64 text-[#54657E]">
              <span>KRA 16% Input VAT:</span>
              <span className="tabular-nums font-semibold">{formatKES(taxAmount)}</span>
            </div>
            <div className="flex items-center justify-between w-64 text-sm font-bold text-[#1B2436] pt-1.5 border-t border-[#D8E2EC]">
              <span>Total Payable:</span>
              <span className="tabular-nums text-[#E03616]">{formatKES(totalAmount)}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1">
            Purchase Order Terms & Internal Instructions
          </label>
          <input
            type="text"
            placeholder="e.g. Standard delivery to Westlands Bay 4, inspection on arrival required"
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
            <CheckCircle2 size={14} /> Submit Purchase Order for Approval
          </Button>
        </div>
      </form>
    </Modal>
  );
}
