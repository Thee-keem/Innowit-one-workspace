import React, { useState } from 'react';
import {
  X,
  Building2,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  CreditCard,
  Plus,
  Briefcase,
  CheckSquare,
  Clock,
  ExternalLink,
  Tag,
  DollarSign,
  User,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  CustomerRecord,
  CustomerContact,
  DealRecord,
  TaskRecord,
  ActivityLogRecord,
} from '@/types';
import { formatKES } from '@/lib/utils';

interface CustomerDetailDrawerProps {
  customer: CustomerRecord | null;
  isOpen: boolean;
  onClose: () => void;
  deals: DealRecord[];
  contacts: CustomerContact[];
  tasks: TaskRecord[];
  activities: ActivityLogRecord[];
  onAddContact: (contact: CustomerContact) => void;
  onOpenNewDeal: (customer: CustomerRecord) => void;
  onOpenNewTask: (customer: CustomerRecord) => void;
}

type CustomerTab = 'overview' | 'deals' | 'invoices' | 'tasks' | 'activity';

export function CustomerDetailDrawer({
  customer,
  isOpen,
  onClose,
  deals,
  contacts,
  tasks,
  activities,
  onAddContact,
  onOpenNewDeal,
  onOpenNewTask,
}: CustomerDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<CustomerTab>('overview');

  // New Contact form state
  const [showAddContact, setShowAddContact] = useState(false);
  const [cFirstName, setCFirstName] = useState('');
  const [cLastName, setCLastName] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cJobTitle, setCJobTitle] = useState('');

  if (!isOpen || !customer) return null;

  const customerDeals = deals.filter((d) => d.customerId === customer.id);
  const customerContacts = contacts.filter((c) => c.customerId === customer.id);
  const customerTasks = tasks.filter((t) => t.customerId === customer.id);
  const customerActivities = activities.filter(
    (a) => a.entityType === 'CUSTOMER' && a.entityId === customer.id
  );

  const totalDealsPipelineKes = customerDeals.reduce((sum, d) => sum + d.value, 0);

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cFirstName.trim() || !cLastName.trim()) return;

    const newContact: CustomerContact = {
      id: `cont_${Date.now()}`,
      customerId: customer.id,
      firstName: cFirstName.trim(),
      lastName: cLastName.trim(),
      email: cEmail.trim() || customer.email,
      phone: cPhone.trim() || customer.phone,
      jobTitle: cJobTitle.trim() || 'Commercial Contact',
      isPrimary: customerContacts.length === 0,
    };

    onAddContact(newContact);
    setShowAddContact(false);
    setCFirstName('');
    setCLastName('');
    setCEmail('');
    setCPhone('');
    setCJobTitle('');
  };

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'CLOSED_WON':
        return <Badge variant="success">Closed Won</Badge>;
      case 'CLOSED_LOST':
        return <Badge variant="neutral">Closed Lost</Badge>;
      case 'NEGOTIATION':
        return <Badge variant="bloodOrange">Negotiation (90%)</Badge>;
      case 'PROPOSAL':
        return <Badge variant="slateBlue">Proposal (75%)</Badge>;
      case 'QUALIFIED':
        return <Badge variant="frost">Qualified (60%)</Badge>;
      default:
        return <Badge variant="neutral">{stage}</Badge>;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white border-l border-[#D8E2EC] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 text-[#0F172A]">
      {/* Top Header */}
      <div className="border-b border-[#D8E2EC] p-5 bg-[#F8FAFC]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-[#1B2436] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {customer.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#0F172A]">{customer.name}</h2>
                <Badge variant={customer.status === 'ACTIVE' ? 'success' : 'neutral'}>
                  {customer.status}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-[#54657E]">
                <span className="font-mono text-[#E03616] font-bold">
                  PIN: {customer.kraPin}
                </span>
                {customer.customerCode && (
                  <span className="font-mono text-slate-500">
                    {customer.customerCode}
                  </span>
                )}
                <span>·</span>
                <span>{customer.city}, Kenya</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#54657E] hover:text-[#0F172A] hover:bg-[#E8EEF5] transition-colors cursor-pointer"
            title="Close Drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Financial KPI Banner */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#D8E2EC]">
          <div className="rounded-lg bg-white p-2.5 border border-[#D8E2EC]">
            <span className="text-[10px] uppercase font-bold text-[#54657E] block">
              Total Revenue
            </span>
            <span className="text-sm font-bold font-mono text-[#0F172A] tabular-nums">
              {formatKES(customer.totalRevenueKes)}
            </span>
          </div>

          <div className="rounded-lg bg-white p-2.5 border border-[#D8E2EC]">
            <span className="text-[10px] uppercase font-bold text-[#54657E] block">
              Debtor Balance
            </span>
            <span className={`text-sm font-bold font-mono tabular-nums ${
              customer.outstandingBalanceKes > 0 ? 'text-[#E03616]' : 'text-emerald-700'
            }`}>
              {formatKES(customer.outstandingBalanceKes)}
            </span>
          </div>

          <div className="rounded-lg bg-white p-2.5 border border-[#D8E2EC]">
            <span className="text-[10px] uppercase font-bold text-[#54657E] block">
              Pipeline Value
            </span>
            <span className="text-sm font-bold font-mono text-[#1B2436] tabular-nums">
              {formatKES(totalDealsPipelineKes)}
            </span>
          </div>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div className="flex items-center gap-1 mt-4 border-b border-[#D8E2EC] -mb-5 pb-0 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-2 px-3 font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-[#E03616] text-[#E03616]'
                : 'border-transparent text-[#54657E] hover:text-[#0F172A]'
            }`}
          >
            Overview & Contacts ({customerContacts.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('deals')}
            className={`pb-2 px-3 font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'deals'
                ? 'border-[#E03616] text-[#E03616]'
                : 'border-transparent text-[#54657E] hover:text-[#0F172A]'
            }`}
          >
            Deals ({customerDeals.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('invoices')}
            className={`pb-2 px-3 font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'invoices'
                ? 'border-[#E03616] text-[#E03616]'
                : 'border-transparent text-[#54657E] hover:text-[#0F172A]'
            }`}
          >
            Receivables & Ledger
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`pb-2 px-3 font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'tasks'
                ? 'border-[#E03616] text-[#E03616]'
                : 'border-transparent text-[#54657E] hover:text-[#0F172A]'
            }`}
          >
            Tasks ({customerTasks.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`pb-2 px-3 font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'activity'
                ? 'border-[#E03616] text-[#E03616]'
                : 'border-transparent text-[#54657E] hover:text-[#0F172A]'
            }`}
          >
            Timeline Log
          </button>
        </div>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-white">
        {/* Tab 1: Overview & Contacts */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* Account Details Card */}
            <div className="rounded-xl border border-[#D8E2EC] p-4 space-y-3 bg-[#F8FAFC]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#54657E]">
                Corporate Profile & Credit Governance
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#64748B] block">Legal Name:</span>
                  <span className="font-semibold text-[#0F172A]">{customer.companyName || customer.name}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block">KRA Tax PIN:</span>
                  <span className="font-mono font-bold text-[#E03616]">{customer.kraPin}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Credit Limit Authorized:</span>
                  <span className="font-mono font-semibold text-[#0F172A]">
                    {formatKES(customer.creditLimitKes || 10000000)}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Payment Terms:</span>
                  <span className="font-semibold text-[#0F172A]">
                    Net {customer.paymentTermsDays || 30} Days
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[#64748B] block">Billing / Postal Address:</span>
                  <span className="font-medium text-[#0F172A]">
                    {customer.billingAddress || `${customer.city}, Kenya`}
                  </span>
                </div>
              </div>
            </div>

            {/* Contacts Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#54657E]">
                  Authorized Executive Contacts ({customerContacts.length})
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddContact(!showAddContact)}
                  className="text-xs py-1 h-7 flex items-center gap-1"
                >
                  <Plus size={12} /> Add Contact
                </Button>
              </div>

              {/* Add Contact Sub-Form */}
              {showAddContact && (
                <form
                  onSubmit={handleSaveContact}
                  className="p-4 rounded-xl border border-[#E03616]/40 bg-[#E03616]/5 space-y-3"
                >
                  <div className="text-xs font-bold text-[#E03616]">Add Direct Contact Person</div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      required
                      type="text"
                      placeholder="First Name"
                      value={cFirstName}
                      onChange={(e) => setCFirstName(e.target.value)}
                      className="rounded-lg border border-[#D8E2EC] bg-white px-2.5 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#E03616]"
                    />
                    <input
                      required
                      type="text"
                      placeholder="Last Name"
                      value={cLastName}
                      onChange={(e) => setCLastName(e.target.value)}
                      className="rounded-lg border border-[#D8E2EC] bg-white px-2.5 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#E03616]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="email"
                      placeholder="Direct Email"
                      value={cEmail}
                      onChange={(e) => setCEmail(e.target.value)}
                      className="rounded-lg border border-[#D8E2EC] bg-white px-2.5 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#E03616]"
                    />
                    <input
                      type="text"
                      placeholder="Mobile (+254...)"
                      value={cPhone}
                      onChange={(e) => setCPhone(e.target.value)}
                      className="rounded-lg border border-[#D8E2EC] bg-white px-2.5 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#E03616]"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Job Title / Role (e.g. Procurement Lead, Head of IT)"
                    value={cJobTitle}
                    onChange={(e) => setCJobTitle(e.target.value)}
                    className="w-full rounded-lg border border-[#D8E2EC] bg-white px-2.5 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#E03616]"
                  />
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddContact(false)}
                      className="text-xs h-7"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="sm" className="text-xs h-7">
                      Save Contact
                    </Button>
                  </div>
                </form>
              )}

              {/* Contacts List */}
              <div className="space-y-2">
                {customerContacts.map((ct) => (
                  <div
                    key={ct.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-[#D8E2EC] bg-white hover:border-[#CAD6E2] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-[#E8EEF5] text-[#1B2436] font-bold text-xs flex items-center justify-center shrink-0">
                        {ct.firstName[0]}{ct.lastName[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#0F172A]">
                            {ct.firstName} {ct.lastName}
                          </span>
                          {ct.isPrimary && (
                            <Badge variant="bloodOrange" className="text-[9px] py-0">
                              Primary
                            </Badge>
                          )}
                        </div>
                        <span className="text-[11px] text-[#64748B] block">{ct.jobTitle}</span>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-[#54657E]">
                          <span className="flex items-center gap-1">
                            <Mail size={11} /> {ct.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone size={11} /> {ct.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Deals Pipeline */}
        {activeTab === 'deals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#54657E]">
                  Associated Deals & Opportunities
                </h3>
                <span className="text-xs text-[#64748B]">
                  Total Pipeline: <strong className="text-[#0F172A]">{formatKES(totalDealsPipelineKes)}</strong>
                </span>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onOpenNewDeal(customer)}
                className="text-xs py-1 h-7 flex items-center gap-1"
              >
                <Plus size={12} /> New Deal for Customer
              </Button>
            </div>

            {customerDeals.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#64748B] border border-dashed border-[#D8E2EC] rounded-xl">
                No active deals linked to {customer.name}. Click &quot;New Deal&quot; to initiate a sales opportunity.
              </div>
            ) : (
              <div className="space-y-3">
                {customerDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="p-4 rounded-xl border border-[#D8E2EC] bg-white hover:border-[#CAD6E2] transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-[#0F172A]">{deal.title}</h4>
                        <span className="text-[11px] text-[#64748B]">
                          Rep: <strong className="text-[#1B2436]">{deal.assignedToName}</strong> · Expected: {deal.expectedCloseDate}
                        </span>
                      </div>
                      {getStageBadge(deal.stage)}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#D8E2EC] text-xs">
                      <span className="font-mono text-sm font-bold text-[#E03616]">
                        {formatKES(deal.value)}
                      </span>
                      <span className="font-mono text-[11px] text-[#54657E]">
                        Win Probability: {deal.winProbability}%
                      </span>
                    </div>

                    {deal.notes && (
                      <p className="text-[11px] text-[#54657E] bg-[#F8FAFC] p-2 rounded border border-[#D8E2EC]">
                        {deal.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Invoices & Receivables */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-[#D8E2EC] bg-[#F8FAFC] p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#54657E]">
                Accounts Receivable Status & Aging
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-[#64748B] block text-[10px] uppercase">All-Time Invoiced</span>
                  <span className="text-base font-bold text-[#0F172A]">
                    {formatKES(customer.totalRevenueKes)}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px] uppercase">Current Outstanding Debtor</span>
                  <span className={`text-base font-bold ${
                    customer.outstandingBalanceKes > 0 ? 'text-[#E03616]' : 'text-emerald-700'
                  }`}>
                    {formatKES(customer.outstandingBalanceKes)}
                  </span>
                </div>
              </div>

              {/* Credit Status Bar */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-[#54657E]">Credit Utilization:</span>
                  <span className="font-mono font-bold text-[#0F172A]">
                    {((customer.outstandingBalanceKes / (customer.creditLimitKes || 10000000)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#D8E2EC] overflow-hidden">
                  <div
                    className="h-full bg-[#E03616] rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (customer.outstandingBalanceKes / (customer.creditLimitKes || 10000000)) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#D8E2EC] bg-white space-y-2">
              <div className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-700" />
                <span>Kenya eTIMS Invoicing Compliance</span>
              </div>
              <p className="text-xs text-[#54657E] leading-relaxed">
                All sales transactions to {customer.name} are electronically signed through Innowit Core with KRA Control Units. Zero tax discrepancy flags logged.
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Tasks & Activities */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#54657E]">
                Assigned Follow-Up Actions ({customerTasks.length})
              </h3>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onOpenNewTask(customer)}
                className="text-xs py-1 h-7 flex items-center gap-1"
              >
                <Plus size={12} /> Add Task
              </Button>
            </div>

            {customerTasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#64748B] border border-dashed border-[#D8E2EC] rounded-xl">
                No active tasks pending for this customer.
              </div>
            ) : (
              <div className="space-y-2">
                {customerTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl border border-[#D8E2EC] bg-white hover:border-[#CAD6E2] transition-colors flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#0F172A]">{t.title}</span>
                        <Badge
                          variant={
                            t.priority === 'URGENT'
                              ? 'bloodOrange'
                              : t.priority === 'HIGH'
                              ? 'slateBlue'
                              : 'frost'
                          }
                          className="text-[10px] py-0"
                        >
                          {t.priority}
                        </Badge>
                      </div>
                      {t.description && (
                        <p className="mt-1 text-xs text-[#64748B] line-clamp-2">{t.description}</p>
                      )}
                      <div className="mt-2 flex items-center gap-3 text-[11px] text-[#54657E]">
                        <span>Assigned: <strong>{t.assignedToName}</strong></span>
                        <span>·</span>
                        <span className="font-mono text-[#E03616] font-semibold">
                          Due: {t.dueDate}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Timeline Log */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#54657E]">
              Executive Touchpoint & Audit Log
            </h3>
            {customerActivities.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#64748B] border border-dashed border-[#D8E2EC] rounded-xl">
                No touchpoint activity logged yet for this account.
              </div>
            ) : (
              <div className="relative pl-6 space-y-4 border-l-2 border-[#D8E2EC]">
                {customerActivities.map((act) => (
                  <div key={act.id} className="relative">
                    <span className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full bg-[#1B2436] border-2 border-white ring-2 ring-[#D8E2EC]" />
                    <div className="p-3 rounded-xl border border-[#D8E2EC] bg-[#F8FAFC]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#0F172A]">{act.title}</span>
                        <span className="text-[10px] text-[#64748B] font-mono">{act.timestamp}</span>
                      </div>
                      <p className="mt-1 text-xs text-[#334155] leading-relaxed">
                        {act.description}
                      </p>
                      <span className="mt-2 text-[10px] text-[#54657E] block font-medium">
                        Logged by {act.user} ({act.type})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-4 border-t border-[#D8E2EC] bg-[#F8FAFC] flex items-center justify-between text-xs">
        <span className="text-[#64748B] font-mono text-[11px]">
          Customer Record ID: {customer.id}
        </span>
        <Button variant="outline" size="sm" onClick={onClose}>
          Close Profile
        </Button>
      </div>
    </div>
  );
}
