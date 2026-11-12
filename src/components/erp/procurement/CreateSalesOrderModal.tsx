import React, { useState } from 'react';
import { ShoppingBag, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  CustomerRecord,
  ProductRecord,
  SalesOrderRecord,
  SalesOrderItemRecord,
  QuotationRecord,
} from '@/types';
import { formatKES } from '@/lib/utils';

interface CreateSalesOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: CustomerRecord[];
  products: ProductRecord[];
  quotations: QuotationRecord[];
  userFullName: string;
  onCreateSalesOrder: (so: SalesOrderRecord) => void;
}

export function CreateSalesOrderModal({
  isOpen,
  onClose,
  customers,
  products,
  quotations,
  userFullName,
  onCreateSalesOrder,
}: CreateSalesOrderModalProps) {
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [quotationId, setQuotationId] = useState('');
  const [expectedDispatchDate, setExpectedDispatchDate] = useState(
    new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10)
  );
  const [status, setStatus] = useState<'DRAFT' | 'CONFIRMED'>('CONFIRMED');
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState<
    { productId: string; quantity: number; unitPriceKes: number }[]
  >([
    {
      productId: products[1]?.id || products[0]?.id || '',
      quantity: 2,
      unitPriceKes: products[1]?.unitPriceKes || products[0]?.unitPriceKes || 75000,
    },
  ]);

  const selectedCustomer = customers.find((c) => c.id === customerId) || customers[0];

  const handleQuotationSelect = (qId: string) => {
    setQuotationId(qId);
    if (!qId) return;
    const qt = quotations.find((q) => q.id === qId);
    if (qt) {
      const matchingCust = customers.find((c) => c.id === qt.customerId || c.name === qt.customerName);
      if (matchingCust) setCustomerId(matchingCust.id);
      if (qt.items.length > 0) {
        setItems(
          qt.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPriceKes: i.unitPriceKes,
          }))
        );
      }
    }
  };

  const handleAddItem = () => {
    const defaultProd = products[0];
    setItems((prev) => [
      ...prev,
      {
        productId: defaultProd.id,
        quantity: 1,
        unitPriceKes: defaultProd.unitPriceKes,
      },
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateItem = (
    idx: number,
    field: 'productId' | 'quantity' | 'unitPriceKes',
    value: any
  ) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        if (field === 'productId') {
          const prod = products.find((p) => p.id === value);
          const autoPrice = prod ? prod.unitPriceKes : item.unitPriceKes;
          return { ...item, productId: value, unitPriceKes: autoPrice };
        }
        return { ...item, [field]: value };
      })
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPriceKes, 0);
  const taxAmount = Math.round(subtotal * 0.16);
  const totalAmount = subtotal + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || items.length === 0 || subtotal <= 0) return;

    const orderNumber = `SO-2026-${Date.now().toString().slice(-4)}`;
    const lineItems: SalesOrderItemRecord[] = items.map((item, idx) => {
      const prod = products.find((p) => p.id === item.productId) || products[0];
      const lineNet = item.quantity * item.unitPriceKes;
      return {
        id: `soi_${Date.now()}_${idx}`,
        productId: prod.id,
        productSku: prod.sku,
        productName: prod.name,
        quantity: item.quantity,
        unitPriceKes: item.unitPriceKes,
        taxRate: 0.16,
        lineTotalKes: Math.round(lineNet * 1.16),
      };
    });

    const qt = quotations.find((q) => q.id === quotationId);

    const newOrder: SalesOrderRecord = {
      id: `so_${Date.now()}`,
      orderNumber,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerPin: selectedCustomer.kraPin,
      quotationId: qt?.id,
      quotationNumber: qt?.quotationNumber,
      orderDate: new Date().toISOString().slice(0, 10),
      expectedDispatchDate,
      status,
      items: lineItems,
      totalAmountKes: totalAmount,
      taxAmountKes: taxAmount,
      stockReserved: status === 'CONFIRMED', // Confirmed Sales Orders reserve physical stock!
      deliveryNoteNumber: status === 'CONFIRMED' ? `DN-2026-${Date.now().toString().slice(-4)}` : undefined,
      salesRepName: userFullName,
      notes: notes.trim(),
    };

    onCreateSalesOrder(newOrder);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Commercial Sales Order"
      description="Register confirmed sales agreement with automatic stock reservation hold and delivery dispatch tracking."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Customer Account <span className="text-[#E03616]">*</span>
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (PIN: {c.kraPin})
                </option>
              ))}
            </select>
            {selectedCustomer && (
              <span className="text-[10px] text-[#64748B] mt-1 block">
                Billing PIN: {selectedCustomer.kraPin} • City: {selectedCustomer.city}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Source Quotation (1-Click Import)
            </label>
            <select
              value={quotationId}
              onChange={(e) => handleQuotationSelect(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            >
              <option value="">-- Direct Sales Order (No Quote) --</option>
              {quotations.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.quotationNumber} — {q.customerName} (KES {q.totalAmountKes.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Expected Dispatch Date <span className="text-[#E03616]">*</span>
            </label>
            <input
              type="date"
              required
              value={expectedDispatchDate}
              onChange={(e) => setExpectedDispatchDate(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] font-mono focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Initial Status with Stock Reservation Banner */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-[#D8E2EC] bg-[#F8FAFC]">
          <div>
            <span className="text-xs font-bold text-[#0F172A] block">Initial Order Status</span>
            <span className="text-[11px] text-[#54657E]">
              {status === 'CONFIRMED'
                ? 'Confirmed orders immediately reserve inventory in warehouse to prevent overselling.'
                : 'Draft orders do not allocate inventory holds.'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStatus('DRAFT')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer border ${
                status === 'DRAFT'
                  ? 'bg-slate-200 border-slate-400 text-slate-800'
                  : 'bg-white border-[#D8E2EC] text-[#54657E]'
              }`}
            >
              Draft
            </button>
            <button
              type="button"
              onClick={() => setStatus('CONFIRMED')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer border ${
                status === 'CONFIRMED'
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'bg-white border-[#D8E2EC] text-[#54657E]'
              }`}
            >
              Confirmed (Hold Stock)
            </button>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="rounded-xl border border-[#D8E2EC] bg-white overflow-hidden shadow-xs">
          <div className="p-3 bg-[#E8EEF5] border-b border-[#D8E2EC] flex items-center justify-between">
            <span className="text-xs font-bold text-[#1B2436] uppercase tracking-wider">
              Commercial Order Items
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              className="text-xs h-7 px-2.5 flex items-center gap-1"
            >
              <Plus size={12} /> Add Product Line
            </Button>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[11px] font-semibold text-[#54657E] border-b border-[#D8E2EC]">
              <tr>
                <th className="py-2.5 px-3">Product Description</th>
                <th className="py-2.5 px-3 w-24 text-right">Quantity</th>
                <th className="py-2.5 px-3 w-36 text-right">Unit Price (KES)</th>
                <th className="py-2.5 px-3 w-36 text-right">Line Total (KES)</th>
                <th className="py-2.5 px-3 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8E2EC]">
              {items.map((item, idx) => {
                const lineNet = item.quantity * item.unitPriceKes;
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
                            {p.sku} — {p.name} (Stock: {p.stockOnHand})
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
                        value={item.unitPriceKes}
                        onChange={(e) =>
                          handleUpdateItem(
                            idx,
                            'unitPriceKes',
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
              <span>Subtotal:</span>
              <span className="tabular-nums font-semibold">{formatKES(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between w-64 text-[#54657E]">
              <span>KRA 16% Output VAT:</span>
              <span className="tabular-nums font-semibold">{formatKES(taxAmount)}</span>
            </div>
            <div className="flex items-center justify-between w-64 text-sm font-bold text-[#1B2436] pt-1.5 border-t border-[#D8E2EC]">
              <span>Total Contract Value:</span>
              <span className="tabular-nums text-[#E03616]">{formatKES(totalAmount)}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1">
            Dispatch Instructions / Customer PO Reference
          </label>
          <input
            type="text"
            placeholder="e.g. Delivery to Safaricom Data Hub, Customer Ref: SAF-PO-8821"
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
            <CheckCircle2 size={14} /> Save Sales Order
          </Button>
        </div>
      </form>
    </Modal>
  );
}
