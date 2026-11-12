import React, { useState } from 'react';
import { Users, Plus, Search, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { CustomerRecord, UserRole } from '@/types';
import { formatKES } from '@/lib/utils';
import { hasPermission } from '@/modules/auth/rbac';

interface CustomersViewProps {
  customers: CustomerRecord[];
  onAddCustomer: (customer: CustomerRecord) => void;
  userRole: UserRole;
}

export function CustomersView({
  customers,
  onAddCustomer,
  userRole,
}: CustomersViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [kraPin, setKraPin] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Nairobi');

  const canCreate = hasPermission(userRole, 'CRM', 'CREATE');

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.kraPin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !kraPin) return;

    const newCust: CustomerRecord = {
      id: `cust_${Date.now()}`,
      name: name.trim(),
      kraPin: kraPin.trim().toUpperCase(),
      email: email.trim(),
      phone: phone.trim(),
      city: city.trim(),
      totalRevenueKes: 0,
      outstandingBalanceKes: 0,
      status: 'ACTIVE',
    };

    onAddCustomer(newCust);
    setIsModalOpen(false);

    setName('');
    setKraPin('');
    setEmail('');
    setPhone('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D8E2EC] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2.5">
              <Users className="text-[#E03616]" size={22} />
              Enterprise Customers Directory
            </h1>
            <Badge variant="slateBlue">CRM Accounts</Badge>
          </div>
          <p className="mt-1 text-xs text-[#54657E]">
            Validated commercial accounts, KRA PIN compliance verification, and debtor receivables ledger.
          </p>
        </div>

        {canCreate && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 text-xs"
          >
            <Plus size={14} /> Add Customer
          </Button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
        <input
          type="text"
          placeholder="Search by customer name, KRA PIN (e.g. P051...), city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-[#D8E2EC] bg-white pl-9 pr-3 py-2 text-xs text-[#0F172A] placeholder-[#64748B] focus:border-[#E03616] focus:outline-none shadow-xs"
        />
      </div>

      {/* Grid of Customer Cards in Alpine Frost / White */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cust) => (
          <div
            key={cust.id}
            className="rounded-xl border border-[#D8E2EC] bg-white p-5 shadow-xs hover:border-[#CAD6E2] transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-[#0F172A] text-sm">{cust.name}</h3>
                  <div className="font-mono text-[11px] text-[#E03616] mt-0.5 font-bold">
                    PIN: {cust.kraPin}
                  </div>
                </div>
                <Badge variant={cust.status === 'ACTIVE' ? 'success' : 'neutral'}>
                  {cust.status}
                </Badge>
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-[#334155]">
                <div className="flex items-center gap-2 text-[#54657E]">
                  <Mail size={13} className="shrink-0 text-[#1B2436]" />
                  <span className="truncate">{cust.email}</span>
                </div>
                <div className="flex items-center gap-2 text-[#54657E]">
                  <Phone size={13} className="shrink-0 text-[#1B2436]" />
                  <span>{cust.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-[#54657E]">
                  <MapPin size={13} className="shrink-0 text-[#1B2436]" />
                  <span>{cust.city}, Kenya</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#D8E2EC] flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-[10px] text-[#54657E] uppercase block font-semibold">Total Invoiced</span>
                <span className="font-bold text-[#0F172A] tabular-nums">
                  {formatKES(cust.totalRevenueKes)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#54657E] uppercase block font-semibold">Debtor Balance</span>
                <span className={`font-bold tabular-nums ${cust.outstandingBalanceKes > 0 ? 'text-[#E03616]' : 'text-emerald-700'}`}>
                  {formatKES(cust.outstandingBalanceKes)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Enterprise Customer Account"
        description="Register a corporate client with Kenya Revenue Authority PIN."
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Company Legal Name <span className="text-[#E03616]">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Kenya Airways PLC"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                KRA PIN <span className="text-[#E03616]">*</span>
              </label>
              <input
                required
                type="text"
                placeholder="P051234567X"
                value={kraPin}
                onChange={(e) => setKraPin(e.target.value.toUpperCase())}
                className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] font-mono uppercase focus:border-[#E03616] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                City / Branch
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Accounts Email
              </label>
              <input
                type="email"
                placeholder="invoices@client.co.ke"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Direct Phone
              </label>
              <input
                type="text"
                placeholder="+254 700 000 000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D8E2EC]">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Customer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
