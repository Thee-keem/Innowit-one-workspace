import React, { useState } from 'react';
import { ArrowLeftRight, CheckCircle2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ProductRecord, WarehouseRecord, StockMovementRecord } from '@/types';

interface StockTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductRecord[];
  warehouses: WarehouseRecord[];
  userFullName: string;
  onTransferStock: (movements: StockMovementRecord[]) => void;
}

export function StockTransferModal({
  isOpen,
  onClose,
  products,
  warehouses,
  userFullName,
  onTransferStock,
}: StockTransferModalProps) {
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [sourceWarehouseId, setSourceWarehouseId] = useState(warehouses[0]?.id || '');
  const [targetWarehouseId, setTargetWarehouseId] = useState(warehouses[1]?.id || '');
  const [quantity, setQuantity] = useState('5');
  const [transportRef, setTransportRef] = useState('');

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const sourceWh = warehouses.find((w) => w.id === sourceWarehouseId) || warehouses[0];
  const targetWh = warehouses.find((w) => w.id === targetWarehouseId) || warehouses[1];

  const qtyNumber = parseInt(quantity, 10) || 0;
  const unitCost = Math.round(selectedProduct ? selectedProduct.unitPriceKes * 0.64 : 0);
  const totalValue = unitCost * qtyNumber;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || sourceWh.id === targetWh.id || qtyNumber <= 0) return;

    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const transferRef = `TRF-${Date.now().toString().slice(-6)}`;

    // Generate balanced dual stock movement: Issue from source warehouse, Receipt at target warehouse
    const issueMovement: StockMovementRecord = {
      id: `mov_trf_out_${Date.now()}`,
      movementNumber: `${transferRef}-OUT`,
      productId: selectedProduct.id,
      productSku: selectedProduct.sku,
      productName: selectedProduct.name,
      warehouseId: sourceWh.id,
      warehouseName: sourceWh.name,
      targetWarehouseId: targetWh.id,
      targetWarehouseName: targetWh.name,
      movementType: 'TRANSFER',
      quantity: -qtyNumber,
      unitCostKes: unitCost,
      totalValueKes: totalValue,
      referenceDocument: transferRef,
      reason: `Inter-facility stock transfer to ${targetWh.name}. Waybill: ${transportRef || 'INTERNAL-LOGISTICS'}`,
      performedBy: userFullName,
      timestamp,
    };

    const receiptMovement: StockMovementRecord = {
      id: `mov_trf_in_${Date.now()}`,
      movementNumber: `${transferRef}-IN`,
      productId: selectedProduct.id,
      productSku: selectedProduct.sku,
      productName: selectedProduct.name,
      warehouseId: targetWh.id,
      warehouseName: targetWh.name,
      targetWarehouseId: sourceWh.id,
      targetWarehouseName: sourceWh.name,
      movementType: 'RECEIPT',
      quantity: qtyNumber,
      unitCostKes: unitCost,
      totalValueKes: totalValue,
      referenceDocument: transferRef,
      reason: `Received stock transfer from ${sourceWh.name}. Waybill: ${transportRef || 'INTERNAL-LOGISTICS'}`,
      performedBy: userFullName,
      timestamp,
    };

    onTransferStock([issueMovement, receiptMovement]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Warehouse Stock Transfer Order"
      description="Issue inter-branch transfer notes between regional facilities with dual-sided inventory ledger reconciliation."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1">
            Item / SKU to Transfer <span className="text-[#E03616]">*</span>
          </label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.sku} — {p.name} (Global Available: {p.stockOnHand})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Origin (Source Facility) <span className="text-[#E03616]">*</span>
            </label>
            <select
              value={sourceWarehouseId}
              onChange={(e) => setSourceWarehouseId(e.target.value)}
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
              Destination (Target Facility) <span className="text-[#E03616]">*</span>
            </label>
            <select
              value={targetWarehouseId}
              onChange={(e) => setTargetWarehouseId(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id} disabled={w.id === sourceWarehouseId}>
                  {w.code} — {w.name} {w.id === sourceWarehouseId ? '(Source)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Transfer Quantity (Units) <span className="text-[#E03616]">*</span>
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
              Waybill / Vehicle Ref
            </label>
            <input
              type="text"
              placeholder="e.g. WB-NBO-MSA-08 / Van KDF 289Q"
              value={transportRef}
              onChange={(e) => setTransportRef(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {sourceWarehouseId === targetWarehouseId && (
          <p className="text-xs text-[#E03616] font-semibold">
            Origin and destination warehouses must be different facilities.
          </p>
        )}

        <div className="rounded-lg border border-[#D8E2EC] bg-[#E8EEF5]/60 p-3 text-xs flex items-center justify-between">
          <span className="text-[#54657E]">Transferred Inventory Valuation:</span>
          <span className="font-mono font-bold text-[#1B2436] tabular-nums">
            KES {totalValue.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D8E2EC]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={sourceWarehouseId === targetWarehouseId || qtyNumber <= 0}
            className="flex items-center gap-1.5"
          >
            <ArrowLeftRight size={14} /> Dispatch Transfer Order
          </Button>
        </div>
      </form>
    </Modal>
  );
}
