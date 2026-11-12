import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Download,
  Eye,
  AlertTriangle,
  QrCode,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  InvoiceRecord,
  CustomerRecord,
  ProductRecord,
  PaymentRecord,
  UserRole,
} from '@/types';
import { formatKES, formatDate } from '@/lib/utils';
import { CreateInvoiceModal } from '@/components/accounting/CreateInvoiceModal';
import { RecordPaymentModal } from '@/components/accounting/RecordPaymentModal';

interface InvoicesViewProps {
  invoices: InvoiceRecord[];
  customers: CustomerRecord[];
  products: ProductRecord[];
  onCreateInvoice: (invoice: InvoiceRecord) => void;
  onRecordPayment: (
    invoiceId: string,
    payment: PaymentRecord,
    isFullSettlement: boolean
  ) => void;
  userRole: UserRole;
  userFullName: string;
}

export function InvoicesView({
  invoices,
  customers,
  products,
  onCreateInvoice,
  onRecordPayment,
  userRole,
  userFullName,
}: InvoicesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState<InvoiceRecord | null>(null);
  const [viewInvoice, setViewInvoice] = useState<InvoiceRecord | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerPin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.kraControlNumber && inv.kraControlNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const isOverdue = inv.status !== 'PAID' && inv.dueDate < todayStr;

    if (statusFilter === 'OVERDUE') return matchesSearch && isOverdue;
    if (statusFilter !== 'ALL') return matchesSearch && inv.status === statusFilter;
    return matchesSearch;
  });

  // KPI calculations
  const totalReceivables = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const overdueReceivables = invoices
    .filter((inv) => inv.status !== 'PAID' && inv.dueDate < todayStr)
    .reduce((sum, inv) => sum + inv.balanceDue, 0);

  // Aging Schedule calculation
  const agingCurrent = invoices
    .filter((inv) => inv.status !== 'PAID' && inv.dueDate >= todayStr)
    .reduce((sum, inv) => sum + inv.balanceDue, 0);

  const aging30to60 = invoices
    .filter((inv) => {
      if (inv.status === 'PAID') return false;
      const diffDays = Math.floor(
        (new Date(todayStr).getTime() - new Date(inv.dueDate).getTime()) / (1000 * 3600 * 24)
      );
      return diffDays > 0 && diffDays <= 30;
    })
    .reduce((sum, inv) => sum + inv.balanceDue, 0);

  const aging60to90 = invoices
    .filter((inv) => {
      if (inv.status === 'PAID') return false;
      const diffDays = Math.floor(
        (new Date(todayStr).getTime() - new Date(inv.dueDate).getTime()) / (1000 * 3600 * 24)
      );
      return diffDays > 30 && diffDays <= 60;
    })
    .reduce((sum, inv) => sum + inv.balanceDue, 0);

  const aging90Plus = invoices
    .filter((inv) => {
      if (inv.status === 'PAID') return false;
      const diffDays = Math.floor(
        (new Date(todayStr).getTime() - new Date(inv.dueDate).getTime()) / (1000 * 3600 * 24)
      );
      return diffDays > 60;
    })
    .reduce((sum, inv) => sum + inv.balanceDue, 0);

  const getStatusBadge = (inv: InvoiceRecord) => {
    const isOverdue = inv.status !== 'PAID' && inv.dueDate < todayStr;
    if (isOverdue) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 font-mono">
          <AlertTriangle size={10} /> Overdue
        </span>
      );
    }

    switch (inv.status) {
      case 'PAID':
        return <Badge variant="success">Paid in Full</Badge>;
      case 'KRA_ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 font-mono">
            <ShieldCheck size={10} /> KRA Accepted
          </span>
        );
      case 'POSTED':
        return <Badge variant="slateBlue">Posted to GL</Badge>;
      default:
        return <Badge variant="neutral">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D8E2EC] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2.5">
              <CreditCard className="text-[#E03616]" size={22} />
              Accounts Receivable & Sales Invoicing
            </h1>
            <Badge variant="slateBlue">AR Ledger</Badge>
          </div>
          <p className="mt-1 text-xs text-[#54657E]">
            Kenya eTIMS electronic tax invoices, customer debtor balances, payment receipts, and aging schedule.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold"
          >
            <Plus size={14} /> Create Sales Invoice
          </Button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-[#D8E2EC] bg-white p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#54657E]">
            Outstanding Receivables
          </span>
          <div className="mt-1 text-base font-bold text-[#E03616] font-mono tabular-nums">
            {formatKES(totalReceivables)}
          </div>
          <span className="text-[10px] text-[#64748B]">Active debtor ledger balance</span>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#54657E]">
            Overdue Balance
          </span>
          <div className="mt-1 text-base font-bold text-red-600 font-mono tabular-nums">
            {formatKES(overdueReceivables)}
          </div>
          <span className="text-[10px] text-[#64748B]">Past agreed credit terms</span>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#54657E]">
            Collected Settlements
          </span>
          <div className="mt-1 text-base font-bold text-emerald-700 font-mono tabular-nums">
            {formatKES(totalCollected)}
          </div>
          <span className="text-[10px] text-[#64748B]">Settled into Bank / Cash</span>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#54657E]">
            Total Invoiced YTD
          </span>
          <div className="mt-1 text-base font-bold text-[#0F172A] font-mono tabular-nums">
            {formatKES(totalInvoiced)}
          </div>
          <span className="text-[10px] text-[#64748B]">Inclusive of 16% Output Tax</span>
        </div>
      </div>

      {/* AR Aging Schedule Bar */}
      <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1B2436]">
              Accounts Receivable Aging Schedule
            </h3>
            <p className="text-[11px] text-[#54657E]">Debtor exposure categorized by payment due aging buckets</p>
          </div>
          <span className="font-mono text-xs font-bold text-[#0F172A]">
            Total Due: {formatKES(totalReceivables)}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#D8E2EC]">
            <span className="text-[10px] font-bold text-[#54657E] uppercase block">
              Current (0 - 30 Days)
            </span>
            <span className="font-mono font-bold text-[#0F172A] text-sm tabular-nums">
              {formatKES(agingCurrent)}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#D8E2EC]">
            <span className="text-[10px] font-bold text-[#54657E] uppercase block">
              31 - 60 Days Overdue
            </span>
            <span className="font-mono font-bold text-[#1B2436] text-sm tabular-nums">
              {formatKES(aging30to60)}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-orange-50/60 border border-orange-200">
            <span className="text-[10px] font-bold text-orange-800 uppercase block">
              61 - 90 Days Overdue
            </span>
            <span className="font-mono font-bold text-orange-900 text-sm tabular-nums">
              {formatKES(aging60to90)}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-red-50/60 border border-red-200">
            <span className="text-[10px] font-bold text-red-800 uppercase block">
              90+ Days Overdue
            </span>
            <span className="font-mono font-bold text-red-900 text-sm tabular-nums">
              {formatKES(aging90Plus)}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#D8E2EC] shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search invoice number, customer, KRA PIN, or control code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] pl-9 pr-3 py-1.5 text-xs text-[#0F172A] placeholder-[#64748B] focus:border-[#E03616] focus:outline-none"
          />
        </div>

        {/* Status Segments */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'POSTED', 'KRA_ACCEPTED', 'PAID', 'OVERDUE'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#1B2436] text-white shadow-xs'
                  : 'text-[#54657E] hover:text-[#0F172A] hover:bg-[#E8EEF5]'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Data Grid */}
      <div className="rounded-xl border border-[#D8E2EC] bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1B2436] text-white select-none">
              <tr>
                <th className="px-4 py-3 font-semibold">Invoice #</th>
                <th className="px-4 py-3 font-semibold">Customer Account</th>
                <th className="px-4 py-3 font-semibold">KRA PIN</th>
                <th className="px-4 py-3 font-semibold">Due Date</th>
                <th className="px-4 py-3 font-semibold text-right">Invoice Total</th>
                <th className="px-4 py-3 font-semibold text-right">Balance Due</th>
                <th className="px-4 py-3 font-semibold text-center">eTIMS Control</th>
                <th className="px-4 py-3 font-semibold text-center">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8E2EC] text-[#0F172A]">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-[#64748B]">
                    No invoices found matching &quot;{searchQuery}&quot;
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-[#F8FAFC] transition-colors group cursor-pointer"
                    onClick={() => setViewInvoice(inv)}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-[#0F172A] group-hover:text-[#E03616] transition-colors">
                      {inv.invoiceNumber}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold text-[#0F172A]">{inv.customerName}</div>
                      <div className="text-[10px] text-[#64748B] font-mono">Terms: Net {inv.paymentTermsDays}d</div>
                    </td>

                    <td className="px-4 py-3 font-mono font-semibold text-[#54657E]">
                      {inv.customerPin}
                    </td>

                    <td className="px-4 py-3 font-mono text-[11px] text-[#54657E]">
                      {inv.dueDate}
                    </td>

                    <td className="px-4 py-3 text-right font-mono font-bold text-[#0F172A] tabular-nums">
                      {formatKES(inv.totalAmount)}
                    </td>

                    <td className="px-4 py-3 text-right font-mono font-bold tabular-nums">
                      <span className={inv.balanceDue > 0 ? 'text-[#E03616]' : 'text-emerald-700'}>
                        {formatKES(inv.balanceDue)}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      {inv.kraControlNumber ? (
                        <span className="font-mono text-[10px] font-bold text-[#1B2436] bg-[#E8EEF5] px-2 py-0.5 rounded border border-[#D8E2EC]">
                          {inv.kraControlNumber.slice(0, 11)}...
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Queue Pending</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {getStatusBadge(inv)}
                    </td>

                    <td
                      className="px-4 py-3 text-right space-x-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => setViewInvoice(inv)}
                        className="px-2 py-1 rounded text-xs bg-[#E8EEF5] text-[#1B2436] hover:bg-[#D8E2EC] transition-colors font-medium cursor-pointer"
                        title="View Tax Invoice"
                      >
                        View
                      </button>

                      {inv.balanceDue > 0 && (
                        <button
                          type="button"
                          onClick={() => setPaymentInvoice(inv)}
                          className="px-2 py-1 rounded text-xs bg-[#E03616] text-white hover:bg-[#C72E14] transition-colors font-medium cursor-pointer shadow-xs"
                          title="Record Payment"
                        >
                          Receive
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateInvoice={onCreateInvoice}
        customers={customers}
        products={products}
        invoiceCount={invoices.length}
      />

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={!!paymentInvoice}
        onClose={() => setPaymentInvoice(null)}
        invoice={paymentInvoice}
        onRecordPayment={onRecordPayment}
        currentUserFullName={userFullName}
      />

      {/* View Detailed Tax Invoice Modal */}
      {viewInvoice && (
        <Modal
          isOpen={!!viewInvoice}
          onClose={() => setViewInvoice(null)}
          title={`Fiscal Tax Invoice: ${viewInvoice.invoiceNumber}`}
          description={`Issued to ${viewInvoice.customerName} on ${viewInvoice.issueDate}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 p-2 bg-white">
            {/* Header Strip with KRA Status */}
            <div className="flex items-center justify-between border-b border-[#D8E2EC] pb-3 text-xs">
              <div>
                <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Customer Tax PIN:</span>
                <span className="font-mono font-bold text-[#E03616]">{viewInvoice.customerPin}</span>
              </div>
              <div className="text-right">
                <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Due Date:</span>
                <span className="font-mono font-bold text-[#0F172A]">{viewInvoice.dueDate}</span>
              </div>
            </div>

            {/* Line items table */}
            <div className="border border-[#D8E2EC] rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#E8EEF5] text-[11px] font-bold text-[#334155] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Tax (16%)</th>
                    <th className="py-2.5 px-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8E2EC]">
                  {viewInvoice.items.map((it) => (
                    <tr key={it.id}>
                      <td className="py-2 px-3">
                        <div className="font-bold text-[#0F172A]">{it.productName}</div>
                        <div className="text-[11px] text-[#54657E]">{it.description}</div>
                      </td>
                      <td className="py-2 px-3 text-center font-mono">{it.quantity}</td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums">{formatKES(it.unitPrice)}</td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-[#54657E]">{formatKES(it.taxAmount)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold tabular-nums text-[#0F172A]">{formatKES(it.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#F8FAFC] border-t border-[#D8E2EC] font-mono text-xs">
                  <tr>
                    <td colSpan={4} className="py-2 px-3 text-right font-semibold text-[#54657E]">Subtotal Excl. Tax:</td>
                    <td className="py-2 px-3 text-right font-bold tabular-nums text-[#0F172A]">{formatKES(viewInvoice.subtotal)}</td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="py-1 px-3 text-right font-semibold text-[#54657E]">Output VAT 16%:</td>
                    <td className="py-1 px-3 text-right font-bold tabular-nums text-[#0F172A]">{formatKES(viewInvoice.taxAmount)}</td>
                  </tr>
                  <tr className="border-t border-[#D8E2EC] font-bold text-sm text-[#0F172A]">
                    <td colSpan={4} className="py-2 px-3 text-right uppercase text-[#E03616]">Total Amount Due:</td>
                    <td className="py-2 px-3 text-right text-[#E03616] tabular-nums">{formatKES(viewInvoice.totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* KRA eTIMS Fiscal Stamp */}
            {viewInvoice.kraControlNumber && (
              <div className="p-3.5 rounded-xl border border-[#D8E2EC] bg-[#F8FAFC] flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5 font-mono">
                    <ShieldCheck size={14} className="text-emerald-700" />
                    <span>KRA eTIMS Validated Fiscal Receipt</span>
                  </div>
                  <div className="text-[11px] font-mono text-[#54657E]">
                    Control Number: <strong className="text-[#0F172A]">{viewInvoice.kraControlNumber}</strong>
                  </div>
                  <div className="text-[10px] text-[#64748B]">
                    Cryptographic hash validated against Kenya Revenue Authority OSCU protocol.
                  </div>
                </div>

                <div className="p-2 bg-white rounded-lg border border-[#D8E2EC] text-center shrink-0">
                  <QrCode size={36} className="text-[#1B2436] mx-auto" />
                  <span className="text-[8px] font-mono text-slate-500 block mt-0.5">KRA QR Valid</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D8E2EC]">
              <Button variant="outline" size="sm" onClick={() => setViewInvoice(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  alert(`Downloading official PDF for ${viewInvoice.invoiceNumber}...`);
                }}
                className="flex items-center gap-1.5"
              >
                <Download size={14} /> Download PDF Invoice
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
