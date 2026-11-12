import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  PackageCheck,
  CheckCircle2,
  FileCheck,
  ShoppingBag,
  Truck,
  Search,
  Filter,
  Check,
  X,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  UserRole,
  PurchaseOrderRecord,
  GoodsReceiptNoteRecord,
  SupplierRecord,
  SupplierBillRecord,
  SalesOrderRecord,
  QuotationRecord,
  ProductRecord,
  WarehouseRecord,
  Branch,
  StockMovementRecord,
  JournalEntry,
} from '@/types';
import { formatKES } from '@/lib/utils';
import { hasPermission } from '@/modules/auth/rbac';
import { CreatePurchaseOrderModal } from '@/components/erp/procurement/CreatePurchaseOrderModal';
import { GoodsReceiptModal } from '@/components/erp/procurement/GoodsReceiptModal';
import { CreateSalesOrderModal } from '@/components/erp/procurement/CreateSalesOrderModal';
import { CreateSupplierModal } from '@/components/erp/procurement/CreateSupplierModal';

interface ProcurementViewProps {
  purchaseOrders: PurchaseOrderRecord[];
  goodsReceiptNotes: GoodsReceiptNoteRecord[];
  suppliers: SupplierRecord[];
  supplierBills: SupplierBillRecord[];
  salesOrders: SalesOrderRecord[];
  quotations: QuotationRecord[];
  products: ProductRecord[];
  warehouses: WarehouseRecord[];
  branches: Branch[];
  customers: any[];
  userRole: UserRole;
  userFullName: string;
  onApprovePO: (poId: string) => void;
  onCreatePO: (po: PurchaseOrderRecord) => void;
  onConfirmReceipt: (
    grn: GoodsReceiptNoteRecord,
    movements: StockMovementRecord[],
    updatedProducts: ProductRecord[],
    bill?: SupplierBillRecord,
    journalEntry?: JournalEntry
  ) => void;
  onCreateSalesOrder: (so: SalesOrderRecord) => void;
  onAddSupplier: (supplier: SupplierRecord) => void;
}

type ProcurementTab = 'pos' | 'grn' | 'sales_orders' | 'suppliers';

export function ProcurementView({
  purchaseOrders,
  goodsReceiptNotes,
  suppliers,
  supplierBills,
  salesOrders,
  quotations,
  products,
  warehouses,
  branches,
  customers,
  userRole,
  userFullName,
  onApprovePO,
  onCreatePO,
  onConfirmReceipt,
  onCreateSalesOrder,
  onAddSupplier,
}: ProcurementViewProps) {
  const [activeTab, setActiveTab] = useState<ProcurementTab>('pos');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isCreatePOOpen, setIsCreatePOOpen] = useState(false);
  const [isGRNModalOpen, setIsGRNModalOpen] = useState(false);
  const [selectedPOForGRN, setSelectedPOForGRN] = useState<PurchaseOrderRecord | null>(null);
  const [isCreateSalesOrderOpen, setIsCreateSalesOrderOpen] = useState(false);
  const [isCreateSupplierOpen, setIsCreateSupplierOpen] = useState(false);

  const canCreate = hasPermission(userRole, 'PROCUREMENT', 'CREATE');
  const canApprove = hasPermission(userRole, 'PROCUREMENT', 'APPROVE');

  // Metrics
  const totalPOSpend = purchaseOrders.reduce((sum, po) => sum + po.totalAmountKes, 0);
  const pendingApprovalsCount = purchaseOrders.filter((po) => po.status === 'PENDING_APPROVAL').length;
  const totalSalesOrderValue = salesOrders.reduce((sum, so) => sum + so.totalAmountKes, 0);

  const handleOpenGRN = (po: PurchaseOrderRecord) => {
    setSelectedPOForGRN(po);
    setIsGRNModalOpen(true);
  };

  const filteredPOs = purchaseOrders.filter((po) => {
    const matchesStatus = statusFilter === 'ALL' || po.status === statusFilter;
    const matchesSearch =
      po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplierPin.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredSalesOrders = salesOrders.filter((so) => {
    return (
      so.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      so.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D8E2EC] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2.5">
              <ShoppingCart className="text-[#E03616]" size={22} />
              Procurement & Order Fulfillment
            </h1>
            <Badge variant="slateBlue">Supply Chain</Badge>
          </div>
          <p className="mt-1 text-xs text-[#54657E]">
            End-to-end 8-step procurement workflow, Purchase Orders, Goods Receipt Notes (GRN), 3-way matching bills, and commercial sales order fulfillment.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {canCreate && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateSupplierOpen(true)}
                className="flex items-center gap-1.5 text-xs bg-white"
              >
                <Truck size={14} /> Add Vendor
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateSalesOrderOpen(true)}
                className="flex items-center gap-1.5 text-xs bg-white"
              >
                <ShoppingBag size={14} /> Create Sales Order
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreatePOOpen(true)}
                className="flex items-center gap-1.5 text-xs"
              >
                <Plus size={14} /> Create Purchase Order
              </Button>
            </>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-[#54657E] uppercase tracking-wider">
            Total Purchase Commitment
          </span>
          <div className="mt-1 text-lg font-bold text-[#0F172A] font-mono tabular-nums">
            {formatKES(totalPOSpend)}
          </div>
          <span className="text-[10px] text-[#64748B]">{purchaseOrders.length} Purchase Orders Issued</span>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-[#54657E] uppercase tracking-wider">
            Pending PO Approvals
          </span>
          <div className="mt-1 text-lg font-bold font-mono tabular-nums flex items-center gap-2">
            {pendingApprovalsCount > 0 ? (
              <span className="text-[#E03616] flex items-center gap-1.5">
                <Clock size={16} /> {pendingApprovalsCount} Awaiting Review
              </span>
            ) : (
              <span className="text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" /> All POs Cleared
              </span>
            )}
          </div>
          <span className="text-[10px] text-[#64748B]">Finance Manager / Admin Signoff</span>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-[#54657E] uppercase tracking-wider">
            GRN Receipts Delivered
          </span>
          <div className="mt-1 text-lg font-bold text-[#1B2436] font-mono tabular-nums">
            {goodsReceiptNotes.length} Goods Receipt Notes
          </div>
          <span className="text-[10px] text-[#64748B]">Stock Allocated & Billed</span>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-[#54657E] uppercase tracking-wider">
            Sales Order Pipeline
          </span>
          <div className="mt-1 text-lg font-bold text-emerald-800 font-mono tabular-nums">
            {formatKES(totalSalesOrderValue)}
          </div>
          <span className="text-[10px] text-[#64748B]">
            {salesOrders.length} Confirmed Orders Reserved
          </span>
        </div>
      </div>

      {/* Subtab Navigation Pills */}
      <div className="flex border-b border-[#D8E2EC] gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('pos')}
          className={`pb-3 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'pos'
              ? 'border-b-2 border-[#E03616] text-[#E03616] font-bold'
              : 'text-[#54657E] hover:text-[#0F172A]'
          }`}
        >
          <ShoppingCart size={15} /> Purchase Orders ({purchaseOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('grn')}
          className={`pb-3 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'grn'
              ? 'border-b-2 border-[#E03616] text-[#E03616] font-bold'
              : 'text-[#54657E] hover:text-[#0F172A]'
          }`}
        >
          <PackageCheck size={15} /> Goods Receipt Notes (GRN) ({goodsReceiptNotes.length})
        </button>

        <button
          onClick={() => setActiveTab('sales_orders')}
          className={`pb-3 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'sales_orders'
              ? 'border-b-2 border-[#E03616] text-[#E03616] font-bold'
              : 'text-[#54657E] hover:text-[#0F172A]'
          }`}
        >
          <ShoppingBag size={15} /> Sales Orders & Fulfillment ({salesOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`pb-3 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'suppliers'
              ? 'border-b-2 border-[#E03616] text-[#E03616] font-bold'
              : 'text-[#54657E] hover:text-[#0F172A]'
          }`}
        >
          <Truck size={15} /> Approved Vendors ({suppliers.length})
        </button>
      </div>

      {/* TAB 1: PURCHASE ORDERS */}
      {activeTab === 'pos' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-[#D8E2EC] bg-white px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="APPROVED">Approved (Ready for GRN)</option>
                <option value="RECEIVED">Received & Fulfilled</option>
                <option value="DRAFT">Draft</option>
              </select>

              <div className="relative w-64">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                />
                <input
                  type="text"
                  placeholder="Search PO #, supplier name, PIN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-[#D8E2EC] bg-white pl-9 pr-3 py-1.5 text-xs text-[#0F172A] placeholder:text-[#64748B] focus:border-[#E03616] focus:outline-none"
                />
              </div>
            </div>

            <span className="text-xs text-[#54657E]">
              Showing {filteredPOs.length} of {purchaseOrders.length} purchase orders
            </span>
          </div>

          <div className="rounded-xl border border-[#D8E2EC] bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#D8E2EC] bg-[#E8EEF5] text-[11px] font-bold text-[#334155] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-32">PO Number</th>
                    <th className="py-3 px-4 w-28">Order Date</th>
                    <th className="py-3 px-4">Supplier & KRA PIN</th>
                    <th className="py-3 px-4 w-32">Branch</th>
                    <th className="py-3 px-4 text-right w-36">Total Amount (KES)</th>
                    <th className="py-3 px-4 text-center w-36">Status</th>
                    <th className="py-3 px-4 text-right w-44">Workflow Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8E2EC] text-[#334155]">
                  {filteredPOs.map((po) => {
                    const isPending = po.status === 'PENDING_APPROVAL';
                    const isApproved = po.status === 'APPROVED';
                    const isReceived = po.status === 'RECEIVED';

                    return (
                      <tr key={po.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-3 px-4 font-mono font-bold text-[#0F172A]">
                          {po.poNumber}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-[#54657E]">
                          {po.orderDate}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#0F172A]">{po.supplierName}</div>
                          <div className="text-[10px] text-[#64748B] font-mono">
                            PIN: {po.supplierPin}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs text-[#334155]">
                          {po.branchName.replace(' Branch', '')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#0F172A] tabular-nums">
                          {formatKES(po.totalAmountKes)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge
                            variant={
                              isReceived
                                ? 'frost'
                                : isApproved
                                ? 'slateBlue'
                                : isPending
                                ? 'bloodOrange'
                                : 'neutral'
                            }
                            className="text-[10px]"
                          >
                            {po.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPending && canApprove && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onApprovePO(po.id)}
                                className="h-7 px-2 text-[11px] border-emerald-600 text-emerald-700 hover:bg-emerald-50 flex items-center gap-1"
                              >
                                <Check size={12} /> Approve PO
                              </Button>
                            )}
                            {isApproved && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleOpenGRN(po)}
                                className="h-7 px-2 text-[11px] flex items-center gap-1"
                              >
                                <PackageCheck size={12} /> Receive GRN
                              </Button>
                            )}
                            {isReceived && (
                              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 justify-end">
                                <CheckCircle2 size={13} /> Stock Received
                              </span>
                            )}
                          </div>
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

      {/* TAB 2: GOODS RECEIPT NOTES (GRN) */}
      {activeTab === 'grn' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[#D8E2EC] bg-white overflow-hidden shadow-xs">
            <div className="p-3.5 bg-[#E8EEF5] border-b border-[#D8E2EC] flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#1B2436] uppercase tracking-wider">
                Delivered Goods Receipt Register & Warehouse Allocations
              </h3>
              <span className="text-[11px] text-[#54657E]">
                {goodsReceiptNotes.length} Verified Deliveries
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#D8E2EC] bg-[#F8FAFC] text-[11px] font-semibold text-[#54657E]">
                  <tr>
                    <th className="py-3 px-4 w-32">GRN Number</th>
                    <th className="py-3 px-4 w-32">PO Reference</th>
                    <th className="py-3 px-4 w-28">Received Date</th>
                    <th className="py-3 px-4">Vendor</th>
                    <th className="py-3 px-4">Warehouse Facility</th>
                    <th className="py-3 px-4 text-right w-36">Total Receipt Value</th>
                    <th className="py-3 px-4 text-center w-32">3-Way Matched</th>
                    <th className="py-3 px-4 w-32">Receiving Officer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8E2EC]">
                  {goodsReceiptNotes.map((grn) => (
                    <tr key={grn.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-4 font-mono font-bold text-[#0F172A]">
                        {grn.grnNumber}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#54657E]">
                        {grn.poNumber}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#54657E]">
                        {grn.receivedDate}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#0F172A]">
                        {grn.supplierName}
                      </td>
                      <td className="py-3 px-4 text-[#334155]">
                        {grn.warehouseName}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#1B2436] tabular-nums">
                        {formatKES(grn.totalValueKes)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {grn.billGenerated ? (
                          <Badge variant="frost" className="text-emerald-800 bg-emerald-50 text-[10px]">
                            Billed (AP)
                          </Badge>
                        ) : (
                          <Badge variant="neutral" className="text-[10px]">
                            Pending Bill
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#54657E]">
                        {grn.receivedBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMMERCIAL SALES ORDERS & FULFILLMENT */}
      {activeTab === 'sales_orders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-80">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
              />
              <input
                type="text"
                placeholder="Search sales orders by number, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-[#D8E2EC] bg-white pl-9 pr-3 py-1.5 text-xs text-[#0F172A] placeholder:text-[#64748B] focus:border-[#E03616] focus:outline-none"
              />
            </div>
            {canCreate && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateSalesOrderOpen(true)}
                className="flex items-center gap-1.5 text-xs"
              >
                <Plus size={14} /> New Sales Order
              </Button>
            )}
          </div>

          <div className="rounded-xl border border-[#D8E2EC] bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#D8E2EC] bg-[#E8EEF5] text-[11px] font-bold text-[#334155] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-32">Order #</th>
                    <th className="py-3 px-4 w-28">Order Date</th>
                    <th className="py-3 px-4">Customer Account</th>
                    <th className="py-3 px-4 w-32">Source Quote</th>
                    <th className="py-3 px-4 text-right w-36">Contract Value</th>
                    <th className="py-3 px-4 text-center w-36">Inventory Allocation</th>
                    <th className="py-3 px-4 text-center w-28">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8E2EC] text-[#334155]">
                  {filteredSalesOrders.map((so) => (
                    <tr key={so.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-4 font-mono font-bold text-[#0F172A]">
                        {so.orderNumber}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#54657E]">
                        {so.orderDate}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#0F172A]">{so.customerName}</div>
                        <div className="text-[10px] text-[#64748B]">Rep: {so.salesRepName}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#54657E]">
                        {so.quotationNumber || 'Direct Order'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#0F172A] tabular-nums">
                        {formatKES(so.totalAmountKes)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {so.stockReserved ? (
                          <Badge variant="frost" className="text-amber-800 bg-amber-50 text-[10px]">
                            Stock Reserved
                          </Badge>
                        ) : (
                          <Badge variant="neutral" className="text-[10px]">
                            No Hold
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="slateBlue" className="text-[10px]">
                          {so.status}
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

      {/* TAB 4: APPROVED VENDORS DIRECTORY */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">Approved Vendor Directory</h3>
              <p className="text-xs text-[#54657E]">
                Registered commercial suppliers with verified KRA PIN credentials and agreed credit terms.
              </p>
            </div>
            {canCreate && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateSupplierOpen(true)}
                className="flex items-center gap-1.5 text-xs"
              >
                <Plus size={14} /> Register Vendor
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suppliers.map((supp) => (
              <div
                key={supp.id}
                className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[#0F172A]">{supp.name}</h4>
                    <span className="text-[11px] font-mono text-[#64748B]">
                      PIN: {supp.kraPin}
                    </span>
                  </div>
                  <Badge variant="frost" className="text-[10px]">
                    Rating {supp.rating} / 5
                  </Badge>
                </div>

                <div className="text-xs text-[#54657E] space-y-1 pt-2 border-t border-[#E8EEF5]">
                  <div><span className="font-semibold text-[#0F172A]">Category:</span> {supp.category}</div>
                  <div><span className="font-semibold text-[#0F172A]">Contact:</span> {supp.contactPerson} ({supp.phone})</div>
                  <div><span className="font-semibold text-[#0F172A]">Email:</span> {supp.email}</div>
                  <div><span className="font-semibold text-[#0F172A]">Address:</span> {supp.address}</div>
                </div>

                <div className="pt-2 border-t border-[#E8EEF5] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#64748B]">Terms: Net {supp.paymentTermsDays}d</span>
                  <span className="font-bold text-[#1B2436] tabular-nums">
                    Spend: {formatKES(supp.totalSpendKes)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE PURCHASE ORDER */}
      <CreatePurchaseOrderModal
        isOpen={isCreatePOOpen}
        onClose={() => setIsCreatePOOpen(false)}
        suppliers={suppliers}
        products={products}
        branches={branches}
        userFullName={userFullName}
        onCreatePO={onCreatePO}
      />

      {/* MODAL 2: GOODS RECEIPT (GRN) */}
      <GoodsReceiptModal
        isOpen={isGRNModalOpen}
        onClose={() => {
          setIsGRNModalOpen(false);
          setSelectedPOForGRN(null);
        }}
        purchaseOrder={selectedPOForGRN}
        warehouses={warehouses}
        products={products}
        userFullName={userFullName}
        onConfirmReceipt={onConfirmReceipt}
      />

      {/* MODAL 3: CREATE SALES ORDER */}
      <CreateSalesOrderModal
        isOpen={isCreateSalesOrderOpen}
        onClose={() => setIsCreateSalesOrderOpen(false)}
        customers={customers}
        products={products}
        quotations={quotations}
        userFullName={userFullName}
        onCreateSalesOrder={onCreateSalesOrder}
      />

      {/* MODAL 4: CREATE SUPPLIER */}
      <CreateSupplierModal
        isOpen={isCreateSupplierOpen}
        onClose={() => setIsCreateSupplierOpen(false)}
        onAddSupplier={onAddSupplier}
      />
    </div>
  );
}
