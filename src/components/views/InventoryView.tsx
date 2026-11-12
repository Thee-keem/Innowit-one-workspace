import React, { useState } from 'react';
import {
  Package,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Warehouse,
  ArrowLeftRight,
  SlidersHorizontal,
  Landmark,
  Search,
  Filter,
  FileText,
  Boxes,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  ProductRecord,
  UserRole,
  WarehouseRecord,
  WarehouseStockRecord,
  StockMovementRecord,
  FixedAssetRecord,
  JournalEntry,
} from '@/types';
import { formatKES } from '@/lib/utils';
import { hasPermission } from '@/modules/auth/rbac';
import { StockAdjustmentModal } from '@/components/erp/inventory/StockAdjustmentModal';
import { StockTransferModal } from '@/components/erp/inventory/StockTransferModal';
import { FixedAssetModal } from '@/components/erp/inventory/FixedAssetModal';

interface InventoryViewProps {
  products: ProductRecord[];
  warehouses: WarehouseRecord[];
  warehouseStocks: WarehouseStockRecord[];
  stockMovements: StockMovementRecord[];
  fixedAssets: FixedAssetRecord[];
  userRole: UserRole;
  userFullName: string;
  onAddProduct: (product: ProductRecord) => void;
  onPostAdjustment: (
    movement: StockMovementRecord,
    journalEntry: JournalEntry,
    updatedProduct: ProductRecord
  ) => void;
  onTransferStock: (movements: StockMovementRecord[]) => void;
  onAddAsset: (asset: FixedAssetRecord) => void;
}

type InventoryTab = 'catalog' | 'warehouses' | 'movements' | 'assets';

export function InventoryView({
  products,
  warehouses,
  warehouseStocks,
  stockMovements,
  fixedAssets,
  userRole,
  userFullName,
  onAddProduct,
  onPostAdjustment,
  onTransferStock,
  onAddAsset,
}: InventoryViewProps) {
  const [activeTab, setActiveTab] = useState<InventoryTab>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState('ALL');

  // Modals
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);

  // New Product Form State
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Hardware');
  const [unitPrice, setUnitPrice] = useState('');
  const [stockOnHand, setStockOnHand] = useState('');
  const [reorderLevel, setReorderLevel] = useState('10');
  const [taxCode, setTaxCode] = useState<'A' | 'B' | 'E'>('A');

  const canCreate = hasPermission(userRole, 'INVENTORY', 'CREATE');
  const canApprove = hasPermission(userRole, 'INVENTORY', 'APPROVE');

  // Financial Metrics
  const totalValue = products.reduce((sum, p) => sum + p.unitPriceKes * p.stockOnHand, 0);
  const lowStockProducts = products.filter((p) => p.stockOnHand <= p.reorderLevel);
  const totalFixedAssetValue = fixedAssets.reduce((sum, a) => sum + a.netBookValueKes, 0);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredMovements = stockMovements.filter((m) => {
    const matchesWh =
      selectedWarehouseFilter === 'ALL' ||
      m.warehouseId === selectedWarehouseFilter ||
      m.targetWarehouseId === selectedWarehouseFilter;
    const matchesSearch =
      m.productSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.movementNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.referenceDocument.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesWh && matchesSearch;
  });

  const handleAddProductSubmit = (e: React.FormEvent) => {
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
      vatRate: taxCode === 'A' ? 0.16 : 0,
      taxCode,
    };

    onAddProduct(newProd);
    setIsAddProductModalOpen(false);

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
              Inventory & Multi-Warehouse Operations
            </h1>
            <Badge variant="slateBlue">ERP Core</Badge>
          </div>
          <p className="mt-1 text-xs text-[#54657E]">
            Multi-facility stock tracking, bin locations, immutable movements ledger, and KRA eTIMS tax classification mapping.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {canCreate && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTransferModalOpen(true)}
                className="flex items-center gap-1.5 text-xs bg-white"
              >
                <ArrowLeftRight size={14} /> Transfer Stock
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAdjustmentModalOpen(true)}
                className="flex items-center gap-1.5 text-xs bg-white"
              >
                <SlidersHorizontal size={14} className="text-[#E03616]" /> Stock Adjustment
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddProductModalOpen(true)}
                className="flex items-center gap-1.5 text-xs"
              >
                <Plus size={14} /> Add Product / SKU
              </Button>
            </>
          )}
        </div>
      </div>

      {/* KPI Cards in Alpine Frost / Slate Blue */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-[#54657E] uppercase tracking-wider">
            Total Inventory Valuation
          </span>
          <div className="mt-1 text-lg font-bold text-[#0F172A] font-mono tabular-nums">
            {formatKES(totalValue)}
          </div>
          <span className="text-[10px] text-[#64748B]">GL Asset Account 1300 Balance</span>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-[#54657E] uppercase tracking-wider">
            Active Catalog SKUs
          </span>
          <div className="mt-1 text-lg font-bold text-[#1B2436] font-mono tabular-nums">
            {products.length} Items across {warehouses.length} Facilities
          </div>
          <span className="text-[10px] text-[#64748B]">Nairobi, Mombasa, Kisumu</span>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-[#54657E] uppercase tracking-wider">
            Replenishment Alerts
          </span>
          <div className="mt-1 text-lg font-bold font-mono tabular-nums flex items-center gap-2">
            {lowStockProducts.length > 0 ? (
              <span className="text-[#E03616] flex items-center gap-1.5">
                <AlertTriangle size={16} /> {lowStockProducts.length} Below Threshold
              </span>
            ) : (
              <span className="text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" /> Optimal Stock
              </span>
            )}
          </div>
          <span className="text-[10px] text-[#64748B]">Automatic Reorder Trigger</span>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-[#54657E] uppercase tracking-wider">
            Fixed Assets Net Book Value
          </span>
          <div className="mt-1 text-lg font-bold text-[#1B2436] font-mono tabular-nums">
            {formatKES(totalFixedAssetValue)}
          </div>
          <span className="text-[10px] text-[#64748B]">
            {fixedAssets.length} Capital Assets Depreciated
          </span>
        </div>
      </div>

      {/* Subtab Navigation Pills */}
      <div className="flex border-b border-[#D8E2EC] gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'catalog'
              ? 'border-b-2 border-[#E03616] text-[#E03616] font-bold'
              : 'text-[#54657E] hover:text-[#0F172A]'
          }`}
        >
          <Boxes size={15} /> Product Catalog Master ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('warehouses')}
          className={`pb-3 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'warehouses'
              ? 'border-b-2 border-[#E03616] text-[#E03616] font-bold'
              : 'text-[#54657E] hover:text-[#0F172A]'
          }`}
        >
          <Warehouse size={15} /> Multi-Warehouse Hubs & Bins ({warehouses.length})
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          className={`pb-3 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'movements'
              ? 'border-b-2 border-[#E03616] text-[#E03616] font-bold'
              : 'text-[#54657E] hover:text-[#0F172A]'
          }`}
        >
          <ArrowLeftRight size={15} /> Stock Movement Ledger ({stockMovements.length})
        </button>

        <button
          onClick={() => setActiveTab('assets')}
          className={`pb-3 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'assets'
              ? 'border-b-2 border-[#E03616] text-[#E03616] font-bold'
              : 'text-[#54657E] hover:text-[#0F172A]'
          }`}
        >
          <Landmark size={15} /> Capital Fixed Assets Register ({fixedAssets.length})
        </button>
      </div>

      {/* TAB 1: PRODUCT CATALOG MASTER */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
              />
              <input
                type="text"
                placeholder="Search products by SKU, name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-[#D8E2EC] bg-white pl-9 pr-3 py-1.5 text-xs text-[#0F172A] placeholder:text-[#64748B] focus:border-[#E03616] focus:outline-none"
              />
            </div>
            <span className="text-xs text-[#54657E]">
              Showing {filteredProducts.length} of {products.length} products
            </span>
          </div>

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
                    <th className="py-3 px-4 text-center w-28">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8E2EC] text-[#334155]">
                  {filteredProducts.map((prod) => {
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
                            Code {prod.taxCode} ({prod.taxCode === 'A' ? '16%' : '0%'})
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
                        <td className="py-3 px-4 text-center">
                          {isLow ? (
                            <Badge variant="danger" className="text-[10px]">
                              Reorder Low
                            </Badge>
                          ) : (
                            <Badge variant="frost" className="text-emerald-800 bg-emerald-50 text-[10px]">
                              Healthy
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MULTI-WAREHOUSE HUBS & BINS */}
      {activeTab === 'warehouses' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {warehouses.map((wh) => (
              <div
                key={wh.id}
                className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-[#1B2436] text-white flex items-center justify-center font-bold text-xs">
                      {wh.code.slice(-2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#0F172A]">{wh.name}</h3>
                      <span className="text-[11px] font-mono text-[#64748B]">{wh.code}</span>
                    </div>
                  </div>
                  {wh.isCentral && (
                    <Badge variant="bloodOrange" className="text-[10px]">Central Master</Badge>
                  )}
                </div>

                <div className="text-xs text-[#54657E] space-y-1 pt-2 border-t border-[#E8EEF5]">
                  <div><span className="font-semibold text-[#0F172A]">Location:</span> {wh.location}</div>
                  <div><span className="font-semibold text-[#0F172A]">Manager:</span> {wh.managerName} ({wh.contactPhone})</div>
                  <div><span className="font-semibold text-[#0F172A]">Capacity:</span> {wh.capacityUnits.toLocaleString()} Storage Units</div>
                </div>

                <div className="pt-2 border-t border-[#E8EEF5] flex items-center justify-between text-xs">
                  <span className="text-[#64748B]">Allocated Bins:</span>
                  <span className="font-mono font-bold text-[#1B2436]">
                    {warehouseStocks.filter((ws) => ws.warehouseId === wh.id).length} Active Bins
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Warehouse Stocks Detail Grid */}
          <div className="rounded-xl border border-[#D8E2EC] bg-white overflow-hidden shadow-xs">
            <div className="p-3.5 bg-[#E8EEF5] border-b border-[#D8E2EC]">
              <h3 className="text-xs font-bold text-[#1B2436] uppercase tracking-wider">
                Multi-Warehouse Bin Stock Allocations & Reservation Holds
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#D8E2EC] bg-[#F8FAFC] text-[11px] font-semibold text-[#54657E]">
                  <tr>
                    <th className="py-3 px-4">Warehouse</th>
                    <th className="py-3 px-4">SKU / Item</th>
                    <th className="py-3 px-4">Bin Location</th>
                    <th className="py-3 px-4 text-right">Physical On Hand</th>
                    <th className="py-3 px-4 text-right">Reserved (Sales Orders)</th>
                    <th className="py-3 px-4 text-right">Net Available to Sell</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8E2EC]">
                  {warehouseStocks.map((ws) => {
                    const prod = products.find((p) => p.id === ws.productId);
                    const netAvailable = Math.max(0, ws.quantityOnHand - ws.quantityReserved);
                    return (
                      <tr key={ws.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-3 px-4 font-semibold text-[#0F172A]">
                          {ws.warehouseCode}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-[#0F172A]">{prod?.sku}</span>
                          <span className="text-[10px] text-[#64748B] block">{prod?.name}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[#54657E]">
                          {ws.binLocation}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-[#0F172A]">
                          {ws.quantityOnHand}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-amber-600 font-semibold">
                          {ws.quantityReserved}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-emerald-700">
                          {netAvailable}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: IMMUTABLE STOCK MOVEMENT LEDGER */}
      {activeTab === 'movements' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <select
                value={selectedWarehouseFilter}
                onChange={(e) => setSelectedWarehouseFilter(e.target.value)}
                className="rounded-lg border border-[#D8E2EC] bg-white px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:outline-none"
              >
                <option value="ALL">All Warehouses</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>

              <div className="relative w-64">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                />
                <input
                  type="text"
                  placeholder="Filter movement ledger..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-[#D8E2EC] bg-white pl-9 pr-3 py-1.5 text-xs text-[#0F172A] placeholder:text-[#64748B] focus:border-[#E03616] focus:outline-none"
                />
              </div>
            </div>

            <span className="text-xs text-[#54657E]">
              Immutable audit ledger ({filteredMovements.length} entries)
            </span>
          </div>

          <div className="rounded-xl border border-[#D8E2EC] bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#D8E2EC] bg-[#E8EEF5] text-[11px] font-bold text-[#334155] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-32">Movement #</th>
                    <th className="py-3 px-4 w-28">Timestamp</th>
                    <th className="py-3 px-4 w-28">Type</th>
                    <th className="py-3 px-4">Item & Facility</th>
                    <th className="py-3 px-4 text-right w-24">Quantity</th>
                    <th className="py-3 px-4 text-right w-32">Total Value</th>
                    <th className="py-3 px-4">Ref Document & Reason</th>
                    <th className="py-3 px-4 w-32">Officer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8E2EC] text-[#334155]">
                  {filteredMovements.map((m) => {
                    const isPositive = m.quantity > 0;
                    return (
                      <tr key={m.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-3 px-4 font-mono font-bold text-[#0F172A]">
                          {m.movementNumber}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-[#64748B]">
                          {m.timestamp}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              m.movementType === 'RECEIPT'
                                ? 'frost'
                                : m.movementType === 'ADJUSTMENT'
                                ? 'bloodOrange'
                                : 'slateBlue'
                            }
                            className="text-[10px]"
                          >
                            {m.movementType}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#0F172A]">{m.productSku}</div>
                          <div className="text-[10px] text-[#64748B]">
                            {m.warehouseName}
                            {m.targetWarehouseName ? ` → ${m.targetWarehouseName}` : ''}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums font-bold">
                          <span
                            className={
                              isPositive ? 'text-emerald-700' : 'text-[#E03616]'
                            }
                          >
                            {isPositive ? `+${m.quantity}` : m.quantity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-[#1B2436]">
                          {formatKES(m.totalValueKes)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-mono text-[#0F172A] font-semibold text-[11px]">
                            {m.referenceDocument}
                          </div>
                          <div className="text-[10px] text-[#64748B] line-clamp-1">{m.reason}</div>
                        </td>
                        <td className="py-3 px-4 text-[#54657E] text-[11px]">
                          {m.performedBy}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CAPITAL FIXED ASSETS REGISTER */}
      {activeTab === 'assets' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">Fixed Asset Capital Register</h3>
              <p className="text-xs text-[#54657E]">
                Straight-line annual depreciation engine for computing equipment, servers, and logistics vehicles.
              </p>
            </div>
            {canCreate && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAssetModalOpen(true)}
                className="flex items-center gap-1.5 text-xs"
              >
                <Plus size={14} /> Capitalize Fixed Asset
              </Button>
            )}
          </div>

          <div className="rounded-xl border border-[#D8E2EC] bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#D8E2EC] bg-[#E8EEF5] text-[11px] font-bold text-[#334155] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-32">Asset Tag</th>
                    <th className="py-3 px-4">Equipment Description</th>
                    <th className="py-3 px-4 w-28">Category</th>
                    <th className="py-3 px-4">Location & Custodian</th>
                    <th className="py-3 px-4 text-right w-32">Acquisition Cost</th>
                    <th className="py-3 px-4 text-right w-32">Accum. Deprec.</th>
                    <th className="py-3 px-4 text-right w-32">Net Book Value</th>
                    <th className="py-3 px-4 text-center w-24">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8E2EC] text-[#334155]">
                  {fixedAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-4 font-mono font-bold text-[#0F172A]">
                        {asset.assetTag}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#0F172A]">{asset.name}</div>
                        <div className="text-[10px] text-[#64748B] font-mono">
                          Purchased: {asset.purchaseDate} (Rate: {(asset.depreciationRateAnnual * 100).toFixed(0)}%/yr)
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="frost" className="text-[10px]">
                          {asset.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <div className="text-[#0F172A]">{asset.location}</div>
                        <div className="text-[10px] text-[#64748B]">Custodian: {asset.custodian}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-[#54657E]">
                        {formatKES(asset.purchaseCostKes)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-[#E03616]">
                        {formatKES(asset.accumulatedDepreciationKes)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-[#1B2436]">
                        {formatKES(asset.netBookValueKes)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="slateBlue" className="text-[10px]">
                          {asset.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD PRODUCT / SKU */}
      <Modal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        title="Register Inventory Item / SKU"
        description="Add a new catalog item with selling price and eTIMS tax classification."
        maxWidth="md"
      >
        <form onSubmit={handleAddProductSubmit} className="space-y-4">
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

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Kenya eTIMS Tax Classification Code
            </label>
            <select
              value={taxCode}
              onChange={(e) => setTaxCode(e.target.value as any)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            >
              <option value="A">Code A: Standard 16% VAT</option>
              <option value="B">Code B: Zero Rated 0% VAT</option>
              <option value="E">Code E: Exempt Supplies</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D8E2EC]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddProductModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Inventory Item
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: STOCK ADJUSTMENT */}
      <StockAdjustmentModal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        products={products}
        warehouses={warehouses}
        userFullName={userFullName}
        onPostAdjustment={onPostAdjustment}
      />

      {/* MODAL 3: STOCK TRANSFER */}
      <StockTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        products={products}
        warehouses={warehouses}
        userFullName={userFullName}
        onTransferStock={onTransferStock}
      />

      {/* MODAL 4: FIXED ASSET */}
      <FixedAssetModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        onAddAsset={onAddAsset}
      />
    </div>
  );
}
