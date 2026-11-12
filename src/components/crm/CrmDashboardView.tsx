import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Briefcase,
  CheckSquare,
  AlertCircle,
  Trophy,
  ArrowRight,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  CustomerRecord,
  DealRecord,
  TaskRecord,
  SalesRepRecord,
  ActivityLogRecord,
} from '@/types';
import { formatKES } from '@/lib/utils';

interface CrmDashboardViewProps {
  customers: CustomerRecord[];
  deals: DealRecord[];
  tasks: TaskRecord[];
  salesReps: SalesRepRecord[];
  activities: ActivityLogRecord[];
  onNavigateTab: (tab: 'dashboard' | 'customers' | 'deals' | 'tasks') => void;
  onSelectCustomer?: (customer: CustomerRecord) => void;
}

type DateRange = 'TODAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YTD';

export function CrmDashboardView({
  customers,
  deals,
  tasks,
  salesReps,
  activities,
  onNavigateTab,
  onSelectCustomer,
}: CrmDashboardViewProps) {
  const [dateRange, setDateRange] = useState<DateRange>('MONTH');

  const todayStr = new Date().toISOString().slice(0, 10);

  // Calculations
  const activeDeals = deals.filter((d) => d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST');
  const wonDeals = deals.filter((d) => d.stage === 'CLOSED_WON');
  const lostDeals = deals.filter((d) => d.stage === 'CLOSED_LOST');

  const totalPipelineKes = activeDeals.reduce((sum, d) => sum + d.value, 0);
  const weightedForecastKes = activeDeals.reduce(
    (sum, d) => sum + (d.value * (d.winProbability || 0)) / 100,
    0
  );
  const totalWonRevenueKes = wonDeals.reduce((sum, d) => sum + d.value, 0);

  const totalDecided = wonDeals.length + lostDeals.length;
  const winRate = totalDecided > 0 ? Math.round((wonDeals.length / totalDecided) * 100) : 75;

  const activeAccountsCount = customers.filter((c) => c.status === 'ACTIVE').length;
  const overdueCount = tasks.filter(
    (t) => t.status !== 'COMPLETED' && t.dueDate < todayStr
  ).length;

  // Funnel calculations
  const STAGE_KEYS = [
    { key: 'NEW_LEAD', label: 'New Lead' },
    { key: 'CONTACTED', label: 'Contacted' },
    { key: 'QUALIFIED', label: 'Qualified' },
    { key: 'PROPOSAL', label: 'Proposal' },
    { key: 'NEGOTIATION', label: 'Negotiation' },
    { key: 'CLOSED_WON', label: 'Closed Won' },
  ];

  const maxStageValue = Math.max(
    ...STAGE_KEYS.map((s) => {
      const match = deals.filter((d) => d.stage === s.key);
      return match.reduce((sum, d) => sum + d.value, 0);
    }),
    1
  );

  return (
    <div className="space-y-6">
      {/* Date Filter & Executive Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-[#D8E2EC] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
              <BarChart3 className="text-[#E03616]" size={18} />
              CRM Pipeline Intelligence & Performance Dashboard
            </h2>
            <Badge variant="slateBlue">Real-Time</Badge>
          </div>
          <p className="mt-0.5 text-xs text-[#54657E]">
            Executive sales velocity, weighted opportunity forecasting, and sales representative quota attainment.
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1 bg-[#F8FAFC] p-1 rounded-lg border border-[#D8E2EC]">
          {(
            [
              { id: 'TODAY', label: 'Today' },
              { id: 'WEEK', label: 'This Week' },
              { id: 'MONTH', label: 'This Month' },
              { id: 'QUARTER', label: 'This Quarter' },
              { id: 'YTD', label: 'YTD' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setDateRange(item.id)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                dateRange === item.id
                  ? 'bg-[#1B2436] text-white shadow-xs'
                  : 'text-[#54657E] hover:text-[#0F172A]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* Total Pipeline */}
        <div
          onClick={() => onNavigateTab('deals')}
          className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs hover:border-[#CAD6E2] transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-[#54657E]">
            <span className="font-bold uppercase text-[10px] tracking-wider">Active Pipeline</span>
            <Briefcase size={14} className="text-[#1B2436] group-hover:text-[#E03616] transition-colors" />
          </div>
          <div className="mt-2 text-base font-bold font-mono text-[#0F172A] tabular-nums truncate">
            {formatKES(totalPipelineKes)}
          </div>
          <div className="mt-1 text-[11px] text-[#64748B]">
            {activeDeals.length} open opportunities
          </div>
        </div>

        {/* Weighted Forecast */}
        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#54657E]">
            <span className="font-bold uppercase text-[10px] tracking-wider">Weighted Forecast</span>
            <TrendingUp size={14} className="text-emerald-700" />
          </div>
          <div className="mt-2 text-base font-bold font-mono text-emerald-800 tabular-nums truncate">
            {formatKES(weightedForecastKes)}
          </div>
          <div className="mt-1 text-[11px] text-[#64748B]">
            Factored by stage win probability
          </div>
        </div>

        {/* Realized Won Revenue */}
        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#54657E]">
            <span className="font-bold uppercase text-[10px] tracking-wider">Won Revenue</span>
            <Trophy size={14} className="text-[#E03616]" />
          </div>
          <div className="mt-2 text-base font-bold font-mono text-[#E03616] tabular-nums truncate">
            {formatKES(totalWonRevenueKes)}
          </div>
          <div className="mt-1 text-[11px] text-[#64748B]">
            {wonDeals.length} executed contracts
          </div>
        </div>

        {/* Win Rate */}
        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#54657E]">
            <span className="font-bold uppercase text-[10px] tracking-wider">Win Rate</span>
            <CheckCircle2 size={14} className="text-[#1B2436]" />
          </div>
          <div className="mt-2 text-base font-bold font-mono text-[#0F172A] tabular-nums">
            {winRate}%
          </div>
          <div className="mt-1 text-[11px] text-[#64748B]">
            {wonDeals.length} won vs {lostDeals.length} lost
          </div>
        </div>

        {/* Active Accounts */}
        <div
          onClick={() => onNavigateTab('customers')}
          className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs hover:border-[#CAD6E2] transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-[#54657E]">
            <span className="font-bold uppercase text-[10px] tracking-wider">Active Accounts</span>
            <Users size={14} className="text-[#1B2436] group-hover:text-[#E03616] transition-colors" />
          </div>
          <div className="mt-2 text-base font-bold font-mono text-[#0F172A] tabular-nums">
            {activeAccountsCount}
          </div>
          <div className="mt-1 text-[11px] text-[#64748B]">
            Kenya enterprise clients
          </div>
        </div>

        {/* Overdue Tasks */}
        <div
          onClick={() => onNavigateTab('tasks')}
          className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs hover:border-[#CAD6E2] transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-[#54657E]">
            <span className="font-bold uppercase text-[10px] tracking-wider">Overdue Tasks</span>
            <AlertCircle size={14} className={overdueCount > 0 ? 'text-[#E03616]' : 'text-slate-400'} />
          </div>
          <div
            className={`mt-2 text-base font-bold font-mono tabular-nums ${
              overdueCount > 0 ? 'text-[#E03616]' : 'text-slate-700'
            }`}
          >
            {overdueCount}
          </div>
          <div className="mt-1 text-[11px] text-[#64748B]">
            Requires prompt attention
          </div>
        </div>
      </div>

      {/* Main Grid: Funnel Stages & Sales Rep Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Funnel Stage Visualizer */}
        <div className="lg:col-span-7 rounded-xl border border-[#D8E2EC] bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#D8E2EC] pb-3">
            <div>
              <h3 className="font-bold text-sm text-[#0F172A]">Sales Opportunity Funnel</h3>
              <p className="text-xs text-[#54657E]">Volume and total value by commercial stage</p>
            </div>
            <button
              onClick={() => onNavigateTab('deals')}
              className="text-xs font-semibold text-[#E03616] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Kanban View <ArrowRight size={12} />
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {STAGE_KEYS.map((st) => {
              const stageDeals = deals.filter((d) => d.stage === st.key);
              const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
              const percentage = Math.round((stageValue / maxStageValue) * 100);

              return (
                <div key={st.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#0F172A] flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#1B2436]" />
                      {st.label} ({stageDeals.length})
                    </span>
                    <span className="font-mono font-bold text-[#E03616] tabular-nums">
                      {formatKES(stageValue)}
                    </span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-[#F0F4F8] overflow-hidden border border-[#D8E2EC]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        st.key === 'CLOSED_WON' ? 'bg-emerald-600' : 'bg-[#1B2436]'
                      }`}
                      style={{ width: `${Math.max(6, percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Sales Rep Quota Leaderboard */}
        <div className="lg:col-span-5 rounded-xl border border-[#D8E2EC] bg-white p-5 shadow-xs space-y-4">
          <div className="border-b border-[#D8E2EC] pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#0F172A]">Sales Rep Quota Attainment</h3>
              <p className="text-xs text-[#54657E]">Monthly target vs realized revenue</p>
            </div>
            <Badge variant="frost">Team Quotas</Badge>
          </div>

          <div className="space-y-3">
            {salesReps.map((rep) => {
              const attainment = Math.round((rep.achievedRevenueKes / rep.monthlyQuotaKes) * 100);

              return (
                <div
                  key={rep.id}
                  className="p-3.5 rounded-xl border border-[#D8E2EC] bg-[#F8FAFC] space-y-2 hover:border-[#CAD6E2] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-[#1B2436] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        {rep.avatar}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[#0F172A]">{rep.name}</h4>
                        <span className="text-[10px] text-[#64748B]">{rep.role}</span>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-xs font-bold text-[#0F172A] block">
                        {attainment}%
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        {rep.winRatePercentage}% Win Rate
                      </span>
                    </div>
                  </div>

                  {/* Quota Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-[#D8E2EC] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        attainment >= 80
                          ? 'bg-emerald-600'
                          : attainment >= 60
                          ? 'bg-[#E03616]'
                          : 'bg-[#1B2436]'
                      }`}
                      style={{ width: `${Math.min(100, attainment)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#54657E] font-mono">
                    <span>Target: {formatKES(rep.monthlyQuotaKes)}</span>
                    <span className="font-semibold text-[#0F172A]">
                      Closed: {formatKES(rep.achievedRevenueKes)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Stream: Recent CRM Touchpoints & Activity Logs */}
      <div className="rounded-xl border border-[#D8E2EC] bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#D8E2EC] pb-3">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#E03616]" />
            <h3 className="font-bold text-sm text-[#0F172A]">Recent Commercial Activity & Audit Trail</h3>
          </div>
          <span className="text-[11px] text-[#64748B] font-mono">
            {activities.length} logged events
          </span>
        </div>

        <div className="divide-y divide-[#D8E2EC]">
          {activities.slice(0, 5).map((act) => (
            <div key={act.id} className="py-2.5 flex items-start justify-between gap-4 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0F172A]">{act.title}</span>
                  {act.entityName && (
                    <span className="text-[#54657E] font-medium font-mono text-[11px]">
                      · {act.entityName}
                    </span>
                  )}
                  <Badge variant="frost" className="text-[9px] py-0">
                    {act.type}
                  </Badge>
                </div>
                <p className="mt-0.5 text-[#54657E] text-[11px] leading-relaxed">
                  {act.description}
                </p>
              </div>

              <div className="text-right shrink-0 text-[#64748B] font-mono text-[10px]">
                <span className="block font-medium text-[#1B2436]">{act.user}</span>
                <span>{act.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
