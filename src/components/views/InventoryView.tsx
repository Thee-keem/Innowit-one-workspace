import React, { useState } from 'react';
import { Package, Plus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ProductRecord, UserRole } from '@/types';
import { formatKES } from '@/lib/utils';
import { hasPermission } from '@/modules/auth/rbac';

interface InventoryViewProps {
  products: ProductRecord[];
  onAddProduct: (product: ProductRecord) => void;
  userRole: UserRole;
}

export function InventoryView({
  products,
  onAddProduct,
  userRole,
}: InventoryViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Hardware');
  const [unitPrice, setUnitPrice] = useState('');
  const [stockOnHand, setStockOnHand] = useState('');
  const [reorderLevel, setReorderLevel] = useState('10');

  const canCreate = hasPermission(userRole, 'INVENTORY', 'CREATE');

  const totalValue = products.reduce(
    (sum, p) => sum + p.unitPriceKes * p.stockOnHand,
    0
  );
  const lowStockCount = products.filter((p) => p.stockOnHand <= p.reorderLevel).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || !name) return;

    const newProd: ProductRecord = {
      id: `prod_${Date.now()}`,
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      category: category.trim(),
      unitPriceKes: parseFloat(unitPrice) || 0,
      stockOnHand: parseInt(stockOnHand) || 0,
      reorderLevel: parseInt(reorderLevel) || 10,
      vatRate: 0.16,
      taxCode: 'A',
    };

    onAddProduct(newProd);
    setIsModalOpen(false);

    setSku('');
    setName('');
    setUnitPrice('');
    setStockOnHand('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D8E2EC] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2.5">
              <Package className="text-[#E03616]" size={22} />
              Inventory & Warehouse Operations
            </h1>
            <Badge variant="slateBlue">Operations</Badge>
          </div>
          <p className="mt-1 text-xs text-[#54657E]">
            Real-time stock valuation, bin allocation, and eTIMS tax classification mapping (KRA Code A 16%).
          </p>
        </div>

        {canCreate && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 text-xs"
          >
            <Plus size={14} /> Add Product / SKU
          </Button>
        )}
      </div>

      {/* KPI Cards in Alpine Frost / White */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-[#54657E] uppercase tracking-wider">
            Total Inventory Valuation
          </span>
          <div className="mt-1 text-lg font-bold text-[#0F172A] font-mono tabular-nums">
            {formatKES(totalValue)}
          </div>
          <span className="text-[10px] text-[#64748B]">Ledger Account 1300 Asset Balance</span>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-[#54657E] uppercase tracking-wider">
            Tracked SKUs
          </span>
          <div className="mt-1 text-lg font-bold text-[#1B2436] font-mono tabular-nums">
            {products.length} Active Catalog Items
          </div>
          <span className="text-[10px] text-[#64748B]">Standardized across all 3 branches</span>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-[#54657E] uppercase tracking-wider">
            Replenishment Alerts
          </span>
          <div className="mt-1 text-lg font-bold font-mono tabular-nums flex items-center gap-2">
            {lowStockCount > 0 ? (
              <span className="text-[#E03616] flex items-center gap-1.5">
                <AlertTriangle size={16} /> {lowStockCount} SKUs below threshold
              </span>
            ) : (
              <span className="text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" /> Optimal Stock Levels
              </span>
            )}
          </div>
          <span className="text-[10px] text-[#64748B]">Automatic PO trigger enabled</span>
        </div>
      </div>

      {/* Product Table */}
      <div className="rounded-xl border border-[#D8E2EC] bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#D8E2EC] bg-[#E8EEF5] text-[11px] font-bold text-[#334155] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-36">SKU Code</th>
                <th className="py-3 px-4">Item Name & Category</th>
                <th className="py-3 px-4 w-32">KRA Tax Code</th>
                <th className="py-3 px-4 text-right w-36">Unit Price (KES)</th>
                <th className="py-3 px-4 text-right w-32">Stock On Hand</th>
                <th className="py-3 px-4 text-right w-40">Valuation (KES)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8E2EC] text-[#334155]">
              {products.map((prod) => {
                const isLow = prod.stockOnHand <= prod.reorderLevel;
                return (
                  <tr key={prod.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0F172A]">
                      {prod.sku}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#0F172A]">{prod.name}</div>
                      <div className="text-[10px] text-[#64748B] font-mono mt-0.5">
                        {prod.category}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="frost" className="font-mono text-[#1B2436]">
                        Code {prod.taxCode} (16%)
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#0F172A] tabular-nums font-semibold">
                      {formatKES(prod.unitPriceKes)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      <span className={isLow ? 'text-[#E03616] font-bold' : 'text-[#334155]'}>
                        {prod.stockOnHand}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#1B2436] tabular-nums">
                      {formatKES(prod.unitPriceKes * prod.stockOnHand)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Inventory Item / SKU"
        description="Register a new item with unit price and eTIMS tax classification."
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                SKU Code <span className="text-[#E03616]">*</span>
              </label>
              <input
                required
                type="text"
                placeholder="e.g. INNO-DEVICE-01"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] font-mono uppercase focus:border-[#E03616] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Product Description / Title <span className="text-[#E03616]">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Cisco Business Switch 24-Port Gigabit"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Price (KES) <span className="text-[#E03616]">*</span>
              </label>
              <input
                required
                type="number"
                placeholder="0.00"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] font-mono focus:border-[#E03616] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Initial Stock
              </label>
              <input
                type="number"
                placeholder="0"
                value={stockOnHand}
                onChange={(e) => setStockOnHand(e.target.value)}
                className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] font-mono focus:border-[#E03616] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Reorder Level
              </label>
              <input
                type="number"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(e.target.value)}
                className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] font-mono focus:border-[#E03616] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D8E2EC]">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Inventory Item
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
