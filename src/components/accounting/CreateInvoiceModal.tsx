import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  InvoiceRecord,
  InvoiceLineItem,
  CustomerRecord,
  ProductRecord,
} from '@/types';
import { Plus, Trash2, ShieldCheck, DollarSign, Calculator } from 'lucide-react';
import { formatKES } from '@/lib/utils';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateInvoice: (invoice: InvoiceRecord) => void;
  customers: CustomerRecord[];
  products: ProductRecord[];
  invoiceCount: number;
}

export function CreateInvoiceModal({
  isOpen,
  onClose,
  onCreateInvoice,
  customers,
  products,
  invoiceCount,
}: CreateInvoiceModalProps) {
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentTermsDays, setPaymentTermsDays] = useState('30');

  // Compute default due date
  const computeDueDate = (issue: string, terms: number) => {
    const d = new Date(issue);
    d.setDate(d.getDate() + terms);
    return d.toISOString().slice(0, 10);
  };

  const [dueDate, setDueDate] = useState(() => computeDueDate(issueDate, 30));

  // Line items state
  const [items, setItems] = useState<
    {
      productId: string;
      description: string;
      quantity: number;
      unitPrice: number;
      taxRate: number;
    }[]
  >([
    {
      productId: products[0]?.id || 'prod_01',
      description: products[0]?.name || 'Standard Enterprise Software License',
      quantity: 1,
      unitPrice: products[0]?.unitPriceKes || 500000,
      taxRate: 0.16,
    },
  ]);

  const selectedCustomer = customers.find((c) => c.id === customerId);

  const handleTermsChange = (termsStr: string) => {
    setPaymentTermsDays(termsStr);
    setDueDate(computeDueDate(issueDate, parseInt(termsStr) || 30));
  };

  const handleIssueDateChange = (dateStr: string) => {
    setIssueDate(dateStr);
    setDueDate(computeDueDate(dateStr, parseInt(paymentTermsDays) || 30));
  };

  const handleProductSelect = (index: number, prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      productId: prodId,
      description: prod?.name || '',
      unitPrice: prod?.unitPriceKes || 0,
      taxRate: prod?.vatRate || 0.16,
    };
    setItems(updated);
  };

  const handleItemFieldChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleAddItem = () => {
    const defaultProd = products[0];
    setItems([
      ...items,
      {
        productId: defaultProd?.id || 'prod_01',
        description: defaultProd?.name || 'Additional Line Item',
        quantity: 1,
        unitPrice: defaultProd?.unitPriceKes || 100000,
        taxRate: defaultProd?.vatRate || 0.16,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const calculatedItems: InvoiceLineItem[] = items.map((it, idx) => {
    const prod = products.find((p) => p.id === it.productId);
    const subtotal = (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0);
    const taxAmount = subtotal * (Number(it.taxRate) || 0.16);
    return {
      id: `item_${Date.now()}_${idx}`,
      productId: it.productId,
      productName: prod?.name || 'Commercial Product',
      description: it.description,
      quantity: Number(it.quantity) || 1,
      unitPrice: Number(it.unitPrice) || 0,
      taxRate: Number(it.taxRate) || 0.16,
      taxClassification: 'STANDARD_16',
      taxAmount,
      lineTotal: subtotal + taxAmount,
    };
  });

  const totalSubtotal = calculatedItems.reduce((sum, it) => sum + (it.quantity * it.unitPrice), 0);
  const totalTax = calculatedItems.reduce((sum, it) => sum + it.taxAmount, 0);
  const grandTotal = totalSubtotal + totalTax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || grandTotal <= 0) return;

    const invoiceSeq = String(invoiceCount + 45).padStart(4, '0');
    const invoiceNumber = `INV-2026-${invoiceSeq}`;
    const controlNum = `KRA202611${invoiceSeq}`;

    const newInvoice: InvoiceRecord = {
      id: `inv_${Date.now()}`,
      invoiceNumber,
      customerId,
      customerName: selectedCustomer?.name || 'Enterprise Customer',
      customerPin: selectedCustomer?.kraPin || 'P051000000X',
      customerAddress: selectedCustomer?.billingAddress || `${selectedCustomer?.city}, Kenya`,
      issueDate,
      dueDate,
      paymentTermsDays: parseInt(paymentTermsDays) || 30,
      status: 'POSTED',
      items: calculatedItems,
      subtotal: totalSubtotal,
      taxAmount: totalTax,
      totalAmount: grandTotal,
      paidAmount: 0,
      balanceDue: grandTotal,
      kraControlNumber: controlNum,
      kraQrPayload: `https://itax.kra.go.ke/verify?cu=KRAMU010049281&receipt=${controlNum}`,
      payments: [],
      createdAt: new Date().toISOString().slice(0, 10),
    };

    onCreateInvoice(newInvoice);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Sales Tax Invoice"
      description="Draft and post commercial invoice to Accounts Receivable and Kenya eTIMS transmission queue."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Header Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Customer Account <span className="text-[#E03616]">*</span>
            </label>
            <select
              required
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (PIN: {c.kraPin})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Payment Terms
            </label>
            <select
              value={paymentTermsDays}
              onChange={(e) => handleTermsChange(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            >
              <option value="0">Cash on Delivery (COD)</option>
              <option value="15">Net 15 Days</option>
              <option value="30">Net 30 Days (Standard)</option>
              <option value="45">Net 45 Days</option>
              <option value="60">Net 60 Days</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Issue / Invoice Date <span className="text-[#E03616]">*</span>
            </label>
            <input
              required
              type="date"
              value={issueDate}
              onChange={(e) => handleIssueDateChange(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] font-mono focus:border-[#E03616] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Due Date (Auto-Computed)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] font-mono focus:border-[#E03616] focus:outline-none"
            />
          </div>
        </div>

        {/* Line Items Table */}
        <div className="space-y-2 pt-2 border-t border-[#D8E2EC]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1B2436] uppercase tracking-wider">
              Invoice Line Items
            </span>
            <button
              type="button"
              onClick={handleAddItem}
              className="text-xs text-[#E03616] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Plus size={12} /> Add Product Item
            </button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto">
            {items.map((it, idx) => {
              const sub = (it.quantity || 1) * (it.unitPrice || 0);
              const vat = sub * (it.taxRate || 0.16);

              return (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] space-y-2 text-xs"
                >
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <select
                        value={it.productId}
                        onChange={(e) => handleProductSelect(idx, e.target.value)}
                        className="w-full rounded border border-[#D8E2EC] bg-white px-2 py-1 text-xs text-[#0F172A] focus:outline-none"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({formatKES(p.unitPriceKes)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={it.quantity}
                        onChange={(e) => handleItemFieldChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full rounded border border-[#D8E2EC] bg-white px-2 py-1 text-xs text-[#0F172A] font-mono text-center"
                      />
                    </div>

                    <div className="col-span-4">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-[#64748B]">
                          KES
                        </span>
                        <input
                          type="number"
                          placeholder="Unit Price"
                          value={it.unitPrice}
                          onChange={(e) => handleItemFieldChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full rounded border border-[#D8E2EC] bg-white pl-8 pr-2 py-1 text-xs text-[#0F172A] font-mono text-right"
                        />
                      </div>
                    </div>

                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={items.length <= 1}
                        className="text-slate-400 hover:text-[#E03616] disabled:opacity-20 cursor-pointer font-bold"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#54657E] pt-1 border-t border-[#E8EEF5]">
                    <input
                      type="text"
                      placeholder="Item memo / SLA description..."
                      value={it.description}
                      onChange={(e) => handleItemFieldChange(idx, 'description', e.target.value)}
                      className="bg-transparent text-xs text-[#334155] placeholder-slate-400 focus:outline-none flex-1 pr-3"
                    />
                    <span className="font-mono text-[#0F172A]">
                      Subtotal: <strong>{formatKES(sub)}</strong> + VAT 16%: <strong>{formatKES(vat)}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Totals Summary Card */}
        <div className="p-3.5 rounded-xl border border-[#D8E2EC] bg-[#1B2436] text-white space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span>Subtotal (Excl. Tax):</span>
            <span className="tabular-nums font-semibold">{formatKES(totalSubtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Kenya Output VAT (16% Standard):</span>
            <span className="tabular-nums font-semibold">{formatKES(totalTax)}</span>
          </div>
          <div className="flex items-center justify-between text-sm font-bold text-white pt-1.5 border-t border-[#2D3A52]">
            <span>Total Payable Amount:</span>
            <span className="text-[#E03616] tabular-nums">{formatKES(grandTotal)}</span>
          </div>
        </div>

        {/* Compliance Footer Note */}
        <div className="flex items-center gap-2 text-[11px] text-[#54657E]">
          <ShieldCheck size={14} className="text-emerald-700" />
          <span>Automatic Double-Entry Posting: Dr Accounts Receivable (1200), Cr Revenue (4010), Cr Output VAT (2020).</span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D8E2EC]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Validate & Post to Ledger
          </Button>
        </div>
      </form>
    </Modal>
  );
}
