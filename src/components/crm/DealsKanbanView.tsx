import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  Trophy,
  XCircle,
  Clock,
  User,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  DealRecord,
  CustomerRecord,
  SalesRepRecord,
  DealStage,
} from '@/types';
import { formatKES } from '@/lib/utils';
import { CreateDealModal } from '@/components/crm/CreateDealModal';
import { DealOutcomeModal } from '@/components/crm/DealOutcomeModal';

interface DealsKanbanViewProps {
  deals: DealRecord[];
  customers: CustomerRecord[];
  salesReps: SalesRepRecord[];
  onCreateDeal: (deal: DealRecord) => void;
  onUpdateDealStage: (
    dealId: string,
    newStage: DealStage,
    lostReason?: string,
    lostNotes?: string,
    generateQuotation?: boolean
  ) => void;
  onSelectCustomer?: (customer: CustomerRecord) => void;
}

const STAGES: { id: DealStage; label: string; prob: number }[] = [
  { id: 'NEW_LEAD', label: '1. New Lead', prob: 20 },
  { id: 'CONTACTED', label: '2. Contacted', prob: 40 },
  { id: 'QUALIFIED', label: '3. Qualified', prob: 60 },
  { id: 'PROPOSAL', label: '4. Proposal', prob: 75 },
  { id: 'NEGOTIATION', label: '5. Negotiation', prob: 90 },
  { id: 'CLOSED_WON', label: '6. Closed', prob: 100 },
];

export function DealsKanbanView({
  deals,
  customers,
  salesReps,
  onCreateDeal,
  onUpdateDealStage,
  onSelectCustomer,
}: DealsKanbanViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [repFilter, setRepFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Outcome modal state
  const [outcomeDeal, setOutcomeDeal] = useState<DealRecord | null>(null);

  const filteredDeals = deals.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.assignedToName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRep = repFilter === 'ALL' || d.assignedToId === repFilter;
    return matchesSearch && matchesRep;
  });

  const getStageDeals = (stageId: DealStage) => {
    if (stageId === 'CLOSED_WON') {
      // Stage 6 contains both CLOSED_WON and CLOSED_LOST
      return filteredDeals.filter(
        (d) => d.stage === 'CLOSED_WON' || d.stage === 'CLOSED_LOST'
      );
    }
    return filteredDeals.filter((d) => d.stage === stageId);
  };

  const advanceStage = (deal: DealRecord) => {
    const order: DealStage[] = [
      'NEW_LEAD',
      'CONTACTED',
      'QUALIFIED',
      'PROPOSAL',
      'NEGOTIATION',
      'CLOSED_WON',
    ];
    const currentIndex = order.indexOf(
      deal.stage === 'CLOSED_LOST' ? 'CLOSED_WON' : deal.stage
    );

    if (currentIndex < order.length - 1) {
      const nextStage = order[currentIndex + 1];
      if (nextStage === 'CLOSED_WON') {
        // Trigger outcome modal for Closed Won / Lost
        setOutcomeDeal(deal);
      } else {
        onUpdateDealStage(deal.id, nextStage);
      }
    }
  };

  const rollbackStage = (deal: DealRecord) => {
    const order: DealStage[] = [
      'NEW_LEAD',
      'CONTACTED',
      'QUALIFIED',
      'PROPOSAL',
      'NEGOTIATION',
      'CLOSED_WON',
    ];
    const currentIndex = order.indexOf(
      deal.stage === 'CLOSED_LOST' ? 'CLOSED_WON' : deal.stage
    );

    if (currentIndex > 0) {
      const prevStage = order[currentIndex - 1];
      onUpdateDealStage(deal.id, prevStage);
    }
  };

  const totalPipelineKes = filteredDeals
    .filter((d) => d.stage !== 'CLOSED_LOST')
    .reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3 rounded-xl border border-[#D8E2EC] shadow-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search deals by title, customer, or sales rep..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] pl-9 pr-3 py-1.5 text-xs text-[#0F172A] placeholder-[#64748B] focus:border-[#E03616] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sales Rep Filter */}
          <select
            value={repFilter}
            onChange={(e) => setRepFilter(e.target.value)}
            className="rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:outline-none"
          >
            <option value="ALL">All Sales Representatives</option>
            {salesReps.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap"
          >
            <Plus size={14} /> New Deal
          </Button>
        </div>
      </div>

      {/* Pipeline Summary Strip */}
      <div className="flex items-center justify-between px-2 text-xs text-[#54657E]">
        <div>
          Showing <strong className="text-[#0F172A]">{filteredDeals.length} deals</strong> across 6 pipeline stages
        </div>
        <div>
          Active Pipeline Value: <strong className="text-[#E03616] font-mono text-sm">{formatKES(totalPipelineKes)}</strong>
        </div>
      </div>

      {/* 6-Column Kanban Board with horizontal scroll if needed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 min-h-[580px] overflow-x-auto pb-4">
        {STAGES.map((col) => {
          const colDeals = getStageDeals(col.id);
          const colValue = colDeals.reduce((sum, d) => sum + d.value, 0);

          return (
            <div
              key={col.id}
              className="rounded-xl border border-[#D8E2EC] bg-[#F8FAFC] flex flex-col min-w-[220px]"
            >
              {/* Column Header in 30% Slate Blue style */}
              <div className="p-3 border-b border-[#D8E2EC] bg-[#1B2436] text-white rounded-t-xl">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs truncate">{col.label}</span>
                  <span className="text-[10px] bg-[#27334D] text-[#D8E2EC] px-1.5 py-0.2 rounded-full font-mono">
                    {colDeals.length}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-300 font-mono">
                  <span>{col.prob}% prob</span>
                  <span className="font-bold text-[#E03616] truncate max-w-[100px]">
                    {formatKES(colValue)}
                  </span>
                </div>
              </div>

              {/* Cards Container */}
              <div className="flex-1 p-2 space-y-2.5 overflow-y-auto max-h-[640px]">
                {colDeals.length === 0 ? (
                  <div className="py-10 text-center text-[11px] text-[#64748B]">
                    No deals in this stage
                  </div>
                ) : (
                  colDeals.map((deal) => {
                    const isWon = deal.stage === 'CLOSED_WON';
                    const isLost = deal.stage === 'CLOSED_LOST';

                    return (
                      <div
                        key={deal.id}
                        className={`rounded-xl border p-3 bg-white shadow-xs transition-all hover:border-[#CAD6E2] space-y-2.5 ${
                          isWon
                            ? 'border-emerald-300 bg-emerald-50/20'
                            : isLost
                            ? 'border-red-200 bg-red-50/20 opacity-80'
                            : 'border-[#D8E2EC]'
                        }`}
                      >
                        {/* Customer & Value */}
                        <div>
                          <div className="flex items-center justify-between">
                            <span
                              onClick={() => {
                                const matchedCust = customers.find((c) => c.id === deal.customerId);
                                if (matchedCust && onSelectCustomer) onSelectCustomer(matchedCust);
                              }}
                              className="text-[11px] font-bold text-[#1B2436] hover:text-[#E03616] cursor-pointer truncate max-w-[130px]"
                              title={deal.customerName}
                            >
                              {deal.customerName}
                            </span>
                            {isWon && (
                              <Badge variant="success" className="text-[9px] py-0">
                                Won
                              </Badge>
                            )}
                            {isLost && (
                              <Badge variant="neutral" className="text-[9px] py-0">
                                Lost
                              </Badge>
                            )}
                          </div>

                          <h4 className="text-xs font-semibold text-[#0F172A] line-clamp-2 mt-1 leading-snug">
                            {deal.title}
                          </h4>
                        </div>

                        {/* Value & Probability */}
                        <div className="flex items-center justify-between pt-1 border-t border-[#F0F4F8] text-xs">
                          <span className="font-mono font-bold text-[#E03616] tabular-nums">
                            {formatKES(deal.value)}
                          </span>
                          <span className="text-[10px] font-mono text-[#54657E]">
                            {deal.winProbability}%
                          </span>
                        </div>

                        {/* Rep & Date */}
                        <div className="flex items-center justify-between text-[10px] text-[#64748B]">
                          <div className="flex items-center gap-1.5 truncate">
                            <div className="h-5 w-5 rounded-full bg-[#1B2436] text-white flex items-center justify-center font-bold text-[9px] shrink-0">
                              {deal.assignedToAvatar}
                            </div>
                            <span className="truncate max-w-[85px]">{deal.assignedToName}</span>
                          </div>
                          <span className="font-mono text-[9px] flex items-center gap-0.5">
                            <Clock size={10} /> {deal.expectedCloseDate.slice(5)}
                          </span>
                        </div>

                        {/* Lost Reason Banner if Lost */}
                        {isLost && deal.lostReason && (
                          <div className="text-[10px] text-red-700 bg-red-100/60 p-1.5 rounded border border-red-200">
                            Reason: {deal.lostReason}
                          </div>
                        )}

                        {/* Stage Transition Toolbar */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#F0F4F8]">
                          {col.id !== 'NEW_LEAD' ? (
                            <button
                              type="button"
                              onClick={() => rollbackStage(deal)}
                              className="p-1 rounded text-[#54657E] hover:text-[#0F172A] hover:bg-[#E8EEF5] transition-colors cursor-pointer text-xs"
                              title="Move back a stage"
                            >
                              <ArrowLeft size={13} />
                            </button>
                          ) : (
                            <span />
                          )}

                          {col.id !== 'CLOSED_WON' ? (
                            <button
                              type="button"
                              onClick={() => advanceStage(deal)}
                              className="px-2 py-0.5 rounded bg-[#1B2436] text-white hover:bg-[#27334D] transition-colors text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                              title="Advance to next stage"
                            >
                              <span>Next</span>
                              <ArrowRight size={11} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setOutcomeDeal(deal)}
                              className="text-[10px] text-[#54657E] hover:text-[#0F172A] hover:underline cursor-pointer"
                            >
                              Change Outcome
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Deal Modal */}
      <CreateDealModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateDeal={onCreateDeal}
        customers={customers}
        salesReps={salesReps}
      />

      {/* Deal Outcome Modal (Won / Lost Dialog) */}
      <DealOutcomeModal
        isOpen={!!outcomeDeal}
        onClose={() => setOutcomeDeal(null)}
        deal={outcomeDeal}
        onConfirmOutcome={(dealId, outcome, lostReason, lostNotes, generateQuotation) => {
          onUpdateDealStage(dealId, outcome, lostReason, lostNotes, generateQuotation);
          setOutcomeDeal(null);
        }}
      />
    </div>
  );
}
