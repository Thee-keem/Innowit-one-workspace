import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CustomerRecord } from '@/types';
import { Building2, ShieldCheck, Mail, Phone, MapPin, DollarSign, AlertCircle } from 'lucide-react';

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCustomer: (customer: CustomerRecord) => void;
}

export function CreateCustomerModal({
  isOpen,
  onClose,
  onCreateCustomer,
}: CreateCustomerModalProps) {
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [kraPin, setKraPin] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Nairobi');
  const [billingAddress, setBillingAddress] = useState('');
  const [creditLimitKes, setCreditLimitKes] = useState('10000000');
  const [paymentTermsDays, setPaymentTermsDays] = useState('30');
  const [businessType, setBusinessType] = useState<'CORPORATE' | 'INDIVIDUAL'>('CORPORATE');
  const [leadSource, setLeadSource] = useState('Direct Sales Outreach');
  const [pinError, setPinError] = useState('');

  // Validate KRA PIN format: 1 capital letter, 9 digits, 1 capital letter (e.g., P051234567Z)
  const validateKraPin = (pin: string) => {
    const regex = /^[A-Z]\d{9}[A-Z]$/;
    return regex.test(pin);
  };

  const handlePinChange = (val: string) => {
    const formatted = val.toUpperCase().trim();
    setKraPin(formatted);
    if (formatted && !validateKraPin(formatted)) {
      setPinError('KRA PIN must be in valid format (e.g., P051234567Z: 1 letter, 9 digits, 1 letter)');
    } else {
      setPinError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (kraPin && !validateKraPin(kraPin)) {
      setPinError('Please enter a valid KRA PIN before saving.');
      return;
    }

    const newCust: CustomerRecord = {
      id: `cust_${Date.now()}`,
      customerCode: `CUST-${String(Math.floor(100 + Math.random() * 900))}`,
      name: name.trim(),
      companyName: companyName.trim() || name.trim(),
      kraPin: kraPin.trim() || 'P051000000X',
      email: email.trim() || 'billing@customer.co.ke',
      phone: phone.trim() || '+254 700 000 000',
      city: city.trim(),
      billingAddress: billingAddress.trim() || `${city}, Kenya`,
      creditLimitKes: parseFloat(creditLimitKes) || 5000000,
      paymentTermsDays: parseInt(paymentTermsDays) || 30,
      totalRevenueKes: 0,
      outstandingBalanceKes: 0,
      status: 'ACTIVE',
      businessType,
      leadSource,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    onCreateCustomer(newCust);
    onClose();

    // Reset Form
    setName('');
    setCompanyName('');
    setKraPin('');
    setEmail('');
    setPhone('');
    setBillingAddress('');
    setPinError('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Enterprise Customer Account"
      description="Register a verified commercial account with KRA tax compliance, credit limit, and payment terms."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Business Type Selector */}
        <div className="flex items-center gap-3 p-2 rounded-xl bg-[#F8FAFC] border border-[#D8E2EC]">
          <span className="text-xs font-semibold text-[#0F172A] px-2">Account Type:</span>
          <button
            type="button"
            onClick={() => setBusinessType('CORPORATE')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              businessType === 'CORPORATE'
                ? 'bg-[#1B2436] text-white shadow-xs'
                : 'text-[#54657E] hover:bg-[#E8EEF5]'
            }`}
          >
            Corporate Enterprise
          </button>
          <button
            type="button"
            onClick={() => setBusinessType('INDIVIDUAL')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              businessType === 'INDIVIDUAL'
                ? 'bg-[#1B2436] text-white shadow-xs'
                : 'text-[#54657E] hover:bg-[#E8EEF5]'
            }`}
          >
            Individual / Sole Trader
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Customer Trade Name <span className="text-[#E03616]">*</span>
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

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Registered Legal Entity Name
            </label>
            <input
              type="text"
              placeholder="e.g. Kenya Airways Company Limited"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              KRA PIN (Kenya Revenue Authority) <span className="text-[#E03616]">*</span>
            </label>
            <div className="relative">
              <input
                required
                type="text"
                maxLength={11}
                placeholder="P051234567Z"
                value={kraPin}
                onChange={(e) => handlePinChange(e.target.value)}
                className={`w-full rounded-lg border px-3 py-1.5 text-xs font-mono uppercase focus:outline-none ${
                  pinError
                    ? 'border-[#E03616] bg-red-50 text-[#E03616]'
                    : 'border-[#D8E2EC] bg-[#F8FAFC] text-[#0F172A] focus:border-[#E03616] focus:bg-white'
                }`}
              />
            </div>
            {pinError && (
              <p className="mt-1 text-[10px] text-[#E03616] flex items-center gap-1">
                <AlertCircle size={10} /> {pinError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              City / Regional Hub
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Lead Source
            </label>
            <select
              value={leadSource}
              onChange={(e) => setLeadSource(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            >
              <option value="Direct Sales Outreach">Direct Sales Outreach</option>
              <option value="Executive Inbound">Executive Inbound</option>
              <option value="Partner Referral">Partner Referral</option>
              <option value="RFP Tender">RFP Tender</option>
              <option value="Trade Expo">Trade Expo</option>
              <option value="Web Lead">Web Lead</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Finance & Billing Email
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
              Corporate Telephone
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

        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1">
            Physical / Billing Address
          </label>
          <input
            type="text"
            placeholder="e.g. Airport North Road, Embakasi, P.O. Box 19002-00501, Nairobi"
            value={billingAddress}
            onChange={(e) => setBillingAddress(e.target.value)}
            className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
          />
        </div>

        {/* Commercial Credit Terms */}
        <div className="p-3 rounded-xl bg-[#F0F4F8] border border-[#D8E2EC] space-y-3">
          <span className="text-[10px] font-bold text-[#54657E] uppercase tracking-wider block">
            Commercial Credit Terms
          </span>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Credit Limit (KES)
              </label>
              <input
                type="number"
                value={creditLimitKes}
                onChange={(e) => setCreditLimitKes(e.target.value)}
                className="w-full rounded-lg border border-[#D8E2EC] bg-white px-3 py-1.5 text-xs text-[#0F172A] font-mono focus:border-[#E03616] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Payment Terms (Days)
              </label>
              <select
                value={paymentTermsDays}
                onChange={(e) => setPaymentTermsDays(e.target.value)}
                className="w-full rounded-lg border border-[#D8E2EC] bg-white px-3 py-1.5 text-xs text-[#0F172A] font-mono focus:border-[#E03616] focus:outline-none"
              >
                <option value="0">Cash on Delivery (COD)</option>
                <option value="15">Net 15 Days</option>
                <option value="30">Net 30 Days (Standard)</option>
                <option value="45">Net 45 Days</option>
                <option value="60">Net 60 Days (Enterprise)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D8E2EC]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Save & Verify Customer
          </Button>
        </div>
      </form>
    </Modal>
  );
}
