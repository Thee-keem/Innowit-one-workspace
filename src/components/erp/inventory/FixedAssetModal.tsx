import React, { useState } from 'react';
import { Landmark, Plus, CheckCircle2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { FixedAssetRecord } from '@/types';

interface FixedAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAsset: (asset: FixedAssetRecord) => void;
}

export function FixedAssetModal({ isOpen, onClose, onAddAsset }: FixedAssetModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'HARDWARE' | 'FURNITURE' | 'VEHICLE' | 'INFRASTRUCTURE'>('HARDWARE');
  const [location, setLocation] = useState('Nairobi HQ Datacenter');
  const [custodian, setCustodian] = useState('Alex Kibet (Sysadmin)');
  const [purchaseCost, setPurchaseCost] = useState('250000');
  const [depreciationRate, setDepreciationRate] = useState('20'); // 20%
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));

  const costNumber = parseFloat(purchaseCost) || 0;
  const rateNumber = parseFloat(depreciationRate) / 100 || 0.2;
  const annualDepreciation = Math.round(costNumber * rateNumber);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || costNumber <= 0) return;

    const assetTag = `AST-${category.slice(0, 3)}-${Date.now().toString().slice(-4)}`;

    const newAsset: FixedAssetRecord = {
      id: `ast_${Date.now()}`,
      assetTag,
      name: name.trim(),
      category,
      location: location.trim(),
      custodian: custodian.trim(),
      purchaseDate,
      purchaseCostKes: costNumber,
      depreciationRateAnnual: rateNumber,
      accumulatedDepreciationKes: 0,
      netBookValueKes: costNumber,
      status: 'ACTIVE',
    };

    onAddAsset(newAsset);
    onClose();
    setName('');
    setPurchaseCost('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register Capital Fixed Asset"
      description="Capitalize equipment, computing hardware, or vehicles into the fixed asset register with automatic straight-line depreciation schedules."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1">
            Asset Description / Title <span className="text-[#E03616]">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Cisco Nexus 9000 Spine Switch Core"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Asset Category <span className="text-[#E03616]">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            >
              <option value="HARDWARE">HARDWARE (Computing & Network)</option>
              <option value="INFRASTRUCTURE">INFRASTRUCTURE (Power & Telecom)</option>
              <option value="VEHICLE">VEHICLE (Fleet & Logistics)</option>
              <option value="FURNITURE">FURNITURE & FIXTURES</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Physical Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Custodian / Responsible Officer
            </label>
            <input
              type="text"
              value={custodian}
              onChange={(e) => setCustodian(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Capital Purchase Date
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] font-mono focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Acquisition Cost (KES) <span className="text-[#E03616]">*</span>
            </label>
            <input
              type="number"
              required
              min="1"
              value={purchaseCost}
              onChange={(e) => setPurchaseCost(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs font-mono tabular-nums text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Annual Depreciation Rate (%)
            </label>
            <select
              value={depreciationRate}
              onChange={(e) => setDepreciationRate(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            >
              <option value="20">20% Straight Line (5 Years - IT Hardware)</option>
              <option value="25">25% Straight Line (4 Years - Vehicles)</option>
              <option value="12.5">12.5% Straight Line (8 Years - Infrastructure)</option>
              <option value="10">10% Straight Line (10 Years - Fixtures)</option>
            </select>
          </div>
        </div>

        <div className="rounded-lg border border-[#D8E2EC] bg-[#E8EEF5]/60 p-3 text-xs flex items-center justify-between">
          <span className="text-[#54657E]">Annual Straight-Line Depreciation:</span>
          <span className="font-mono font-bold text-[#1B2436] tabular-nums">
            KES {annualDepreciation.toLocaleString()} / Year
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D8E2EC]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" className="flex items-center gap-1.5">
            <CheckCircle2 size={14} /> Capitalize & Save Fixed Asset
          </Button>
        </div>
      </form>
    </Modal>
  );
}
