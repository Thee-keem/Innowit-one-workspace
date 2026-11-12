import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { DealRecord, CustomerRecord, SalesRepRecord, DealStage } from '@/types';
import { Briefcase, DollarSign, Calendar, User, Tag } from 'lucide-react';

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateDeal: (deal: DealRecord) => void;
  customers: CustomerRecord[];
  salesReps: SalesRepRecord[];
  initialCustomer?: CustomerRecord | null;
}

const STAGE_DEFAULT_PROBABILITIES: Record<DealStage, number> = {
  NEW_LEAD: 20,
  CONTACTED: 40,
  QUALIFIED: 60,
  PROPOSAL: 75,
  NEGOTIATION: 90,
  CLOSED_WON: 100,
  CLOSED_LOST: 0,
};

export function CreateDealModal({
  isOpen,
  onClose,
  onCreateDeal,
  customers,
  salesReps,
  initialCustomer,
}: CreateDealModalProps) {
  const [title, setTitle] = useState('');
  const [customerId, setCustomerId] = useState(initialCustomer?.id || customers[0]?.id || '');
  const [valueKes, setValueKes] = useState('2500000');
  const [stage, setStage] = useState<DealStage>('NEW_LEAD');
  const [probability, setProbability] = useState<number>(STAGE_DEFAULT_PROBABILITIES.NEW_LEAD);
  const [expectedCloseDate, setExpectedCloseDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });
  const [assignedToId, setAssignedToId] = useState(salesReps[0]?.id || '');
  const [notes, setNotes] = useState('');

  const handleStageChange = (newStage: DealStage) => {
    setStage(newStage);
    setProbability(STAGE_DEFAULT_PROBABILITIES[newStage] || 20);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !customerId) return;

    const selectedCust = customers.find((c) => c.id === customerId);
    const selectedRep = salesReps.find((r) => r.id === assignedToId) || salesReps[0];

    const newDeal: DealRecord = {
      id: `deal_${Date.now()}`,
      customerId,
      customerName: selectedCust?.name || 'Customer Account',
      customerPin: selectedCust?.kraPin,
      assignedToId: selectedRep.id,
      assignedToName: selectedRep.name,
      assignedToAvatar: selectedRep.avatar,
      title: title.trim(),
      value: parseFloat(valueKes) || 1000000,
      currency: 'KES',
      stage,
      winProbability: probability,
      expectedCloseDate,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      notes: notes.trim() || undefined,
    };

    onCreateDeal(newDeal);
    onClose();

    // Reset Form
    setTitle('');
    setValueKes('2500000');
    setNotes('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Commercial Deal"
      description="Add an opportunity to the 6-stage sales pipeline with projected value, stage, and probability."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1">
            Deal Title / Project Scope <span className="text-[#E03616]">*</span>
          </label>
          <input
            required
            type="text"
            placeholder="e.g. Enterprise Cloud ERP Multi-Branch Rollout"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
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
                  {c.name} ({c.kraPin})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Deal Value (KES) <span className="text-[#E03616]">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#64748B]">
                KES
              </span>
              <input
                required
                type="number"
                min="0"
                step="10000"
                value={valueKes}
                onChange={(e) => setValueKes(e.target.value)}
                className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] pl-12 pr-3 py-1.5 text-xs text-[#0F172A] font-mono focus:border-[#E03616] focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Pipeline Stage
            </label>
            <select
              value={stage}
              onChange={(e) => handleStageChange(e.target.value as DealStage)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            >
              <option value="NEW_LEAD">1. New Lead (20%)</option>
              <option value="CONTACTED">2. Contacted (40%)</option>
              <option value="QUALIFIED">3. Qualified (60%)</option>
              <option value="PROPOSAL">4. Proposal (75%)</option>
              <option value="NEGOTIATION">5. Negotiation (90%)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Win Probability (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={probability}
              onChange={(e) => setProbability(parseInt(e.target.value) || 0)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] font-mono focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Target Close Date
            </label>
            <input
              type="date"
              value={expectedCloseDate}
              onChange={(e) => setExpectedCloseDate(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] font-mono focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1">
            Assigned Sales Representative
          </label>
          <select
            value={assignedToId}
            onChange={(e) => setAssignedToId(e.target.value)}
            className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
          >
            {salesReps.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.role})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1">
            Deal Background & Executive Notes
          </label>
          <textarea
            rows={2}
            placeholder="Document customer requirements, decision-makers, and competitor presence..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D8E2EC]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Add to Pipeline
          </Button>
        </div>
      </form>
    </Modal>
  );
}
