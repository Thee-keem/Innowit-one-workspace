import React, { useState } from 'react';
import { Truck, CheckCircle2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SupplierRecord } from '@/types';

interface CreateSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSupplier: (supplier: SupplierRecord) => void;
}

export function CreateSupplierModal({ isOpen, onClose, onAddSupplier }: CreateSupplierModalProps) {
  const [name, setName] = useState('');
  const [kraPin, setKraPin] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('Hardware & Devices');
  const [paymentTermsDays, setPaymentTermsDays] = useState('30');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !kraPin) return;

    const supplierCode = `VEND-${Date.now().toString().slice(-4)}`;

    const newSupplier: SupplierRecord = {
      id: `supp_${Date.now()}`,
      supplierCode,
      name: name.trim(),
      kraPin: kraPin.trim().toUpperCase(),
      email: email.trim(),
      phone: phone.trim(),
      contactPerson: contactPerson.trim(),
      address: address.trim(),
      category,
      paymentTermsDays: parseInt(paymentTermsDays) || 30,
      rating: 5.0,
      totalSpendKes: 0,
      status: 'ACTIVE',
    };

    onAddSupplier(newSupplier);
    onClose();
    setName('');
    setKraPin('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register Vendor / Supplier"
      description="Add an approved commercial vendor with KRA PIN and credit settlement terms."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1">
            Supplier Legal Entity Name <span className="text-[#E03616]">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Dell EMC Kenya Limited"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              KRA Tax PIN <span className="text-[#E03616]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. P051987654Z"
              value={kraPin}
              onChange={(e) => setKraPin(e.target.value.toUpperCase())}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs font-mono uppercase text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            >
              <option value="Hardware & Devices">Hardware & Devices</option>
              <option value="Cloud Infrastructure & Telecom">Cloud Infrastructure & Telecom</option>
              <option value="Networking & OEM Kits">Networking & OEM Kits</option>
              <option value="Office Equipment & Consumables">Office Equipment & Consumables</option>
              <option value="Logistics & Freight Services">Logistics & Freight Services</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Contact Person
            </label>
            <input
              type="text"
              placeholder="e.g. Jane Kamau"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Credit Payment Terms
            </label>
            <select
              value={paymentTermsDays}
              onChange={(e) => setPaymentTermsDays(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            >
              <option value="15">Net 15 Days</option>
              <option value="30">Net 30 Days (Standard)</option>
              <option value="45">Net 45 Days</option>
              <option value="60">Net 60 Days</option>
              <option value="0">Immediate / Cash on Delivery</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="billing@vendor.ke"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+254 700 000 000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1">
            Physical / Dispatch Address
          </label>
          <input
            type="text"
            placeholder="e.g. Commercial Street, Industrial Area, Nairobi"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D8E2EC]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" className="flex items-center gap-1.5">
            <CheckCircle2 size={14} /> Register Vendor
          </Button>
        </div>
      </form>
    </Modal>
  );
}
