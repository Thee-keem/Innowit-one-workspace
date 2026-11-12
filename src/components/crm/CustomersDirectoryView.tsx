import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Mail,
  Phone,
  MapPin,
  Building2,
  ExternalLink,
  Briefcase,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  CustomerRecord,
  CustomerContact,
  DealRecord,
  TaskRecord,
  ActivityLogRecord,
  SalesRepRecord,
} from '@/types';
import { formatKES } from '@/lib/utils';
import { CreateCustomerModal } from '@/components/crm/CreateCustomerModal';
import { CustomerDetailDrawer } from '@/components/crm/CustomerDetailDrawer';
import { CreateDealModal } from '@/components/crm/CreateDealModal';
import { CreateTaskModal } from '@/components/crm/CreateTaskModal';

interface CustomersDirectoryViewProps {
  customers: CustomerRecord[];
  contacts: CustomerContact[];
  deals: DealRecord[];
  tasks: TaskRecord[];
  activities: ActivityLogRecord[];
  salesReps: SalesRepRecord[];
  onCreateCustomer: (customer: CustomerRecord) => void;
  onAddContact: (contact: CustomerContact) => void;
  onCreateDeal: (deal: DealRecord) => void;
  onCreateTask: (task: TaskRecord) => void;
  selectedCustomer?: CustomerRecord | null;
  onSelectCustomer?: (customer: CustomerRecord | null) => void;
}

type SortField = 'name' | 'totalRevenueKes' | 'outstandingBalanceKes' | 'customerCode';
type SortOrder = 'asc' | 'desc';

export function CustomersDirectoryView({
  customers,
  contacts,
  deals,
  tasks,
  activities,
  salesReps,
  onCreateCustomer,
  onAddContact,
  onCreateDeal,
  onCreateTask,
  selectedCustomer: externalSelectedCustomer,
  onSelectCustomer: externalOnSelectCustomer,
}: CustomersDirectoryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'HAS_DEBT'>('ALL');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Modals & Drawers
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [internalSelectedCustomer, setInternalSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [dealModalCustomer, setDealModalCustomer] = useState<CustomerRecord | null>(null);
  const [taskModalCustomer, setTaskModalCustomer] = useState<CustomerRecord | null>(null);

  const activeCustomer = externalSelectedCustomer ?? internalSelectedCustomer;
  const setActiveCustomer = (cust: CustomerRecord | null) => {
    setInternalSelectedCustomer(cust);
    if (externalOnSelectCustomer) externalOnSelectCustomer(cust);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filtered = customers
    .filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.kraPin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.customerCode && c.customerCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
        c.city.toLowerCase().includes(searchQuery.toLowerCase());

      if (statusFilter === 'ACTIVE') return matchesSearch && c.status === 'ACTIVE';
      if (statusFilter === 'INACTIVE') return matchesSearch && c.status === 'INACTIVE';
      if (statusFilter === 'HAS_DEBT') return matchesSearch && c.outstandingBalanceKes > 0;
      return matchesSearch;
    })
    .sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return sortOrder === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

  const totalOutstanding = customers.reduce((sum, c) => sum + c.outstandingBalanceKes, 0);
  const totalInvoiced = customers.reduce((sum, c) => sum + c.totalRevenueKes, 0);

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3 rounded-xl border border-[#D8E2EC] shadow-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search by customer name, code (CUST-...), KRA PIN, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] pl-9 pr-3 py-1.5 text-xs text-[#0F172A] placeholder-[#64748B] focus:border-[#E03616] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Accounts</option>
            <option value="HAS_DEBT">Debtors with Outstanding Balance</option>
            <option value="INACTIVE">Inactive Accounts</option>
          </select>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap"
          >
            <Plus size={14} /> Add Customer
          </Button>
        </div>
      </div>

      {/* Directory Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-[#D8E2EC] bg-white p-3.5 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#54657E] tracking-wider block">
            Registered Accounts
          </span>
          <div className="mt-1 text-lg font-bold text-[#0F172A] font-mono tabular-nums">
            {customers.length} Enterprise Clients
          </div>
          <span className="text-[10px] text-[#64748B]">All accounts verified on KRA iTax</span>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-3.5 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#54657E] tracking-wider block">
            All-Time Realized Invoicing
          </span>
          <div className="mt-1 text-lg font-bold text-[#1B2436] font-mono tabular-nums">
            {formatKES(totalInvoiced)}
          </div>
          <span className="text-[10px] text-[#64748B]">Posted to General Ledger</span>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-3.5 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#54657E] tracking-wider block">
            Debtor Receivables Outstanding
          </span>
          <div className="mt-1 text-lg font-bold text-[#E03616] font-mono tabular-nums">
            {formatKES(totalOutstanding)}
          </div>
          <span className="text-[10px] text-[#64748B]">Active Accounts Receivable balance</span>
        </div>
      </div>

      {/* Customers Data Table */}
      <div className="rounded-xl border border-[#D8E2EC] bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1B2436] text-white select-none">
              <tr>
                <th
                  onClick={() => handleSort('customerCode')}
                  className="px-4 py-3 font-semibold cursor-pointer hover:text-[#E03616] transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Code</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="px-4 py-3 font-semibold cursor-pointer hover:text-[#E03616] transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Customer Account</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th className="px-4 py-3 font-semibold">KRA PIN</th>
                <th className="px-4 py-3 font-semibold">City / Hub</th>
                <th
                  onClick={() => handleSort('totalRevenueKes')}
                  className="px-4 py-3 font-semibold text-right cursor-pointer hover:text-[#E03616] transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Total Invoiced</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('outstandingBalanceKes')}
                  className="px-4 py-3 font-semibold text-right cursor-pointer hover:text-[#E03616] transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Debtor Balance</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th className="px-4 py-3 font-semibold text-center">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8E2EC] text-[#0F172A]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#64748B]">
                    No customers found matching &quot;{searchQuery}&quot;
                  </td>
                </tr>
              ) : (
                filtered.map((cust) => {
                  const custDeals = deals.filter((d) => d.customerId === cust.id);

                  return (
                    <tr
                      key={cust.id}
                      className="hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                      onClick={() => setActiveCustomer(cust)}
                    >
                      <td className="px-4 py-3.5 font-mono text-[#54657E] font-medium">
                        {cust.customerCode || 'CUST-000'}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-bold text-[#0F172A] group-hover:text-[#E03616] transition-colors">
                          {cust.name}
                        </div>
                        <div className="text-[11px] text-[#64748B] flex items-center gap-2 mt-0.5">
                          <span>{cust.email}</span>
                          {custDeals.length > 0 && (
                            <span className="text-[#1B2436] font-semibold">
                              · {custDeals.length} active deal{custDeals.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[#E03616] font-bold">
                        {cust.kraPin}
                      </td>

                      <td className="px-4 py-3.5 text-[#54657E]">
                        {cust.city}, Kenya
                      </td>

                      <td className="px-4 py-3.5 text-right font-mono tabular-nums font-semibold text-[#0F172A]">
                        {formatKES(cust.totalRevenueKes)}
                      </td>

                      <td className="px-4 py-3.5 text-right font-mono tabular-nums font-bold">
                        <span
                          className={
                            cust.outstandingBalanceKes > 0
                              ? 'text-[#E03616]'
                              : 'text-emerald-700'
                          }
                        >
                          {formatKES(cust.outstandingBalanceKes)}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <Badge variant={cust.status === 'ACTIVE' ? 'success' : 'neutral'}>
                          {cust.status}
                        </Badge>
                      </td>

                      <td
                        className="px-4 py-3.5 text-right space-x-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setActiveCustomer(cust)}
                          className="px-2 py-1 rounded text-xs bg-[#E8EEF5] text-[#1B2436] hover:bg-[#D8E2EC] transition-colors font-medium cursor-pointer"
                          title="View Profile"
                        >
                          Profile
                        </button>
                        <button
                          type="button"
                          onClick={() => setDealModalCustomer(cust)}
                          className="px-2 py-1 rounded text-xs bg-[#1B2436] text-white hover:bg-[#27334D] transition-colors font-medium cursor-pointer"
                          title="Add Deal"
                        >
                          + Deal
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Customer Modal */}
      <CreateCustomerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateCustomer={onCreateCustomer}
      />

      {/* Customer 5-Tab Detail Profile Drawer */}
      <CustomerDetailDrawer
        customer={activeCustomer}
        isOpen={!!activeCustomer}
        onClose={() => setActiveCustomer(null)}
        deals={deals}
        contacts={contacts}
        tasks={tasks}
        activities={activities}
        onAddContact={onAddContact}
        onOpenNewDeal={(c) => {
          setActiveCustomer(null);
          setDealModalCustomer(c);
        }}
        onOpenNewTask={(c) => {
          setActiveCustomer(null);
          setTaskModalCustomer(c);
        }}
      />

      {/* Quick Deal Creation for Customer */}
      {dealModalCustomer && (
        <CreateDealModal
          isOpen={!!dealModalCustomer}
          onClose={() => setDealModalCustomer(null)}
          onCreateDeal={onCreateDeal}
          customers={customers}
          salesReps={salesReps}
          initialCustomer={dealModalCustomer}
        />
      )}

      {/* Quick Task Creation for Customer */}
      {taskModalCustomer && (
        <CreateTaskModal
          isOpen={!!taskModalCustomer}
          onClose={() => setTaskModalCustomer(null)}
          onCreateTask={onCreateTask}
          customers={customers}
          deals={deals}
          salesReps={salesReps}
          initialCustomer={taskModalCustomer}
        />
      )}
    </div>
  );
}
