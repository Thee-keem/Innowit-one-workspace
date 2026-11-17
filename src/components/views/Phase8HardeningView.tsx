import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Play,
  Download,
  RotateCcw,
  Lock,
  CheckCircle2,
  XCircle,
  Users,
  Database,
  ChevronDown,
  ChevronRight,
  KeyRound,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Account,
  JournalEntry,
  ProductRecord,
  InvoiceRecord,
  CustomerRecord,
  PurchaseOrderRecord,
  StockMovementRecord,
  WarehouseStockRecord,
  EtimsQueueItem,
  CreditNoteRecord,
  UserRole,
  UserSessionPayload,
} from '@/types';
import { runAllAcceptanceGates, TestSuiteSummary } from '@/tests/acceptanceGates';
import {
  loadAirGapStatus,
  validateOutboundTransmission,
  KRA_ENDPOINTS,
} from '@/modules/etims/airgap';
import { getSeedManifest } from '@/modules/seed/reset';
import { ROLE_METADATA } from '@/modules/auth/rbac';
import { ProductionSwitchModal } from '@/components/etims/ProductionSwitchModal';

interface Phase8HardeningViewProps {
  accounts: Account[];
  journalEntries: JournalEntry[];
  products: ProductRecord[];
  invoices: InvoiceRecord[];
  customers: CustomerRecord[];
  purchaseOrders: PurchaseOrderRecord[];
  stockMovements: StockMovementRecord[];
  warehouseStocks: WarehouseStockRecord[];
  queueItems: EtimsQueueItem[];
  creditNotes: CreditNoteRecord[];
  allUsers: UserSessionPayload[];
  currentUser: UserSessionPayload;
  isSandbox: boolean;
  taxpayerPin: string;
  onLockSandbox: () => void;
  onActivateProduction: () => void;
  onResetDemoData: () => void;
  onSwitchUser: (user: UserSessionPayload) => void;
}

type HardeningTab = 'gates' | 'airgap' | 'seeding';

export function Phase8HardeningView({
  accounts,
  journalEntries,
  products,
  invoices,
  customers,
  purchaseOrders,
  stockMovements,
  warehouseStocks,
  queueItems,
  creditNotes,
  allUsers,
  currentUser,
  isSandbox,
  taxpayerPin,
  onLockSandbox,
  onActivateProduction,
  onResetDemoData,
  onSwitchUser,
}: Phase8HardeningViewProps) {
  const [activeTab, setActiveTab] = useState<HardeningTab>('gates');
  const [expandedGates, setExpandedGates] = useState<Record<string, boolean>>({
    gate_1_accounting: true,
    gate_2_inventory: false,
    gate_3_integration: false,
    gate_4_etims: true,
    gate_5_rbac: false,
  });
  const [suiteResult, setSuiteResult] = useState<TestSuiteSummary>(() =>
    runAllAcceptanceGates({
      accounts,
      journalEntries,
      products,
      invoices,
      customers,
      purchaseOrders,
      stockMovements,
      warehouseStocks,
      queueItems,
      creditNotes,
    })
  );
  const [probeResults, setProbeResults] = useState<
    { label: string; endpoint: string; allowed: boolean; reason: string }[] | null
  >(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetNotice, setResetNotice] = useState<string | null>(null);
  const [isProductionModalOpen, setIsProductionModalOpen] = useState(false);

  const airGapStatus = useMemo(() => loadAirGapStatus(), [isSandbox]);
  const seedManifest = useMemo(() => getSeedManifest(), []);

  const handleRunGates = () => {
    const result = runAllAcceptanceGates({
      accounts,
      journalEntries,
      products,
      invoices,
      customers,
      purchaseOrders,
      stockMovements,
      warehouseStocks,
      queueItems,
      creditNotes,
    });
    setSuiteResult(result);
    const expanded: Record<string, boolean> = {};
    for (const g of result.gates) {
      expanded[g.id] = !g.passed || expandedGates[g.id] || false;
    }
    setExpandedGates(expanded);
  };

  const handleExportReport = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      executedBy: `${currentUser.fullName} (${currentUser.role})`,
      environment: isSandbox ? 'SANDBOX' : 'PRODUCTION',
      airGapStatus,
      suiteResult,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Innowit_Acceptance_Gates_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRunAirGapProbe = () => {
    const prodInSandbox = validateOutboundTransmission(KRA_ENDPOINTS.PRODUCTION, true);
    const prodNonProdEnv = validateOutboundTransmission(KRA_ENDPOINTS.PRODUCTION, false, 'staging');
    const prodCurrentState = validateOutboundTransmission(KRA_ENDPOINTS.PRODUCTION, isSandbox);
    const sandboxCurrentState = validateOutboundTransmission(KRA_ENDPOINTS.SANDBOX, isSandbox);

    setProbeResults([
      {
        label: 'Probe 1: Production KRA Endpoint in Sandbox Mode',
        endpoint: KRA_ENDPOINTS.PRODUCTION,
        allowed: prodInSandbox.allowed,
        reason: prodInSandbox.reason,
      },
      {
        label: 'Probe 2: Production KRA Endpoint with APP_ENV=staging',
        endpoint: KRA_ENDPOINTS.PRODUCTION,
        allowed: prodNonProdEnv.allowed,
        reason: prodNonProdEnv.reason,
      },
      {
        label: 'Probe 3: Production KRA Endpoint under Current Session State',
        endpoint: KRA_ENDPOINTS.PRODUCTION,
        allowed: prodCurrentState.allowed,
        reason: prodCurrentState.reason,
      },
      {
        label: 'Probe 4: Sandbox KRA Test Endpoint under Current Session State',
        endpoint: KRA_ENDPOINTS.SANDBOX,
        allowed: sandboxCurrentState.allowed,
        reason: sandboxCurrentState.reason,
      },
    ]);
  };

  const handleExecuteReset = () => {
    onResetDemoData();
    setConfirmReset(false);
    setResetNotice('Workspace restored to verified baseline seed state.');
    setTimeout(() => setResetNotice(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#D8E2EC] pb-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2">
              <ShieldCheck className="text-[#E03616]" size={22} />
              Production Hardening &amp; Acceptance Verification
            </h1>
            <Badge variant={suiteResult.allPassed ? 'success' : 'danger'}>
              {suiteResult.allPassed
                ? `${suiteResult.passedGates}/${suiteResult.totalGates} GATES PASSED`
                : `${suiteResult.failedGates} GATE(S) FAILED`}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-[#54657E]">
            Live verification of the 5 Mandatory Acceptance Gates, Kenya eTIMS Air-Gap isolation, and 12-role demo provisioning.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportReport}
            className="flex items-center gap-1.5 text-xs bg-white whitespace-nowrap shrink-0"
          >
            <Download size={14} /> Export JSON Report
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleRunGates}
            className="flex items-center gap-1.5 text-xs whitespace-nowrap shrink-0"
          >
            <Play size={14} /> Run All 5 Gates
          </Button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4">
          <div className="text-xs font-semibold text-[#54657E]">Acceptance Gates</div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-[#0F172A]">
            {suiteResult.passedGates} / {suiteResult.totalGates}
          </div>
          <div className="mt-1 text-xs text-[#64748B] font-mono tabular-nums">
            {suiteResult.passedAssertions}/{suiteResult.totalAssertions} assertions passing
          </div>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4">
          <div className="text-xs font-semibold text-[#54657E]">Execution Latency</div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-[#0F172A]">
            {suiteResult.totalDurationMs} ms
          </div>
          <div className="mt-1 text-xs text-[#64748B]">
            Last run · {suiteResult.timestamp}
          </div>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4">
          <div className="text-xs font-semibold text-[#54657E]">eTIMS Air-Gap Status</div>
          <div className="mt-1 text-base font-bold font-mono text-[#0F172A]">
            {isSandbox ? 'SANDBOX LOCKED' : 'PRODUCTION CERTIFIED'}
          </div>
          <div className="mt-1 text-xs text-[#64748B]">
            {isSandbox ? 'Production KRA traffic blocked' : `Certified by ${airGapStatus.certifiedBy || 'Super Admin'}`}
          </div>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4">
          <div className="text-xs font-semibold text-[#54657E]">RBAC Demo Identities</div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-[#0F172A]">
            {allUsers.length} Roles
          </div>
          <div className="mt-1 text-xs text-[#64748B]">
            Active · {ROLE_METADATA[currentUser.role]?.label || currentUser.role}
          </div>
        </div>
      </div>

      {/* Sub-navigation tabs */}
      <div className="flex items-center gap-1 p-1 bg-white border border-[#D8E2EC] rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('gates')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'gates'
              ? 'bg-[#1B2436] text-white'
              : 'text-[#54657E] hover:text-[#0F172A] hover:bg-[#F0F4F8]'
          }`}
        >
          Mandatory Acceptance Gates (5)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('airgap')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'airgap'
              ? 'bg-[#1B2436] text-white'
              : 'text-[#54657E] hover:text-[#0F172A] hover:bg-[#F0F4F8]'
          }`}
        >
          Production Air-Gap Verification
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('seeding')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'seeding'
              ? 'bg-[#1B2436] text-white'
              : 'text-[#54657E] hover:text-[#0F172A] hover:bg-[#F0F4F8]'
          }`}
        >
          Seeding &amp; 12 Demo Accounts
        </button>
      </div>

      {/* TAB 1: 5 MANDATORY ACCEPTANCE GATES */}
      {activeTab === 'gates' && (
        <div className="space-y-3">
          {suiteResult.gates.map((gate) => {
            const isExpanded = Boolean(expandedGates[gate.id]);
            return (
              <div
                key={gate.id}
                className="rounded-xl border border-[#D8E2EC] bg-white overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedGates((prev) => ({ ...prev, [gate.id]: !prev[gate.id] }))
                  }
                  className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {gate.passed ? (
                      <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle size={18} className="text-[#E03616] shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-[#0F172A] truncate">
                        {gate.name}
                      </div>
                      <div className="text-xs text-[#64748B] mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>{gate.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{gate.assertions.filter((a) => a.passed).length}/{gate.assertions.length} assertions passed</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{gate.durationMs} ms</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <Badge variant={gate.passed ? 'success' : 'danger'}>
                      {gate.passed ? 'PASSED' : 'FAILED'}
                    </Badge>
                    {isExpanded ? (
                      <ChevronDown size={16} className="text-[#64748B]" />
                    ) : (
                      <ChevronRight size={16} className="text-[#64748B]" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-[#D8E2EC] divide-y divide-[#E8EEF5] bg-[#F8FAFC]">
                    {gate.assertions.map((assertion, idx) => (
                      <div
                        key={idx}
                        className="px-5 py-3 flex items-start justify-between gap-4 text-xs"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          {assertion.passed ? (
                            <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle size={15} className="text-[#E03616] shrink-0 mt-0.5" />
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-[#0F172A]">{assertion.check}</div>
                            <div className="text-[#54657E] mt-0.5">{assertion.message}</div>
                          </div>
                        </div>
                        <span
                          className={`font-mono text-[11px] font-bold shrink-0 ${
                            assertion.passed ? 'text-emerald-700' : 'text-[#E03616]'
                          }`}
                        >
                          {assertion.passed ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: PRODUCTION AIR-GAP VERIFICATION */}
      {activeTab === 'airgap' && (
        <div className="space-y-5">
          <div className="rounded-xl border border-[#D8E2EC] bg-white p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8EEF5] pb-4">
              <div>
                <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                  <Lock size={16} className="text-[#E03616]" />
                  eTIMS Air-Gap Environment &amp; Dual-Step Certification Control
                </h2>
                <p className="text-xs text-[#54657E] mt-1">
                  Verifies that Sandbox mode and non-production deployments cannot dispatch traffic to <span className="font-mono">{KRA_ENDPOINTS.PRODUCTION}</span>.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRunAirGapProbe}
                  className="text-xs bg-white whitespace-nowrap shrink-0"
                >
                  Run Network Lock Probes
                </Button>
                {isSandbox ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsProductionModalOpen(true)}
                    className="flex items-center gap-1.5 text-xs whitespace-nowrap shrink-0"
                  >
                    <KeyRound size={14} /> Dual-Step Unlock...
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onLockSandbox}
                    className="flex items-center gap-1.5 text-xs bg-white whitespace-nowrap shrink-0"
                  >
                    <ShieldCheck size={14} className="text-emerald-700" /> Re-Engage Sandbox Lock
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-lg border border-[#D8E2EC] bg-[#F8FAFC]">
                <div className="text-[#64748B]">Current Mode</div>
                <div className="mt-1 font-mono font-bold text-[#0F172A]">
                  {isSandbox ? 'SANDBOX (ISOLATED)' : 'PRODUCTION (LIVE)'}
                </div>
              </div>
              <div className="p-3.5 rounded-lg border border-[#D8E2EC] bg-[#F8FAFC]">
                <div className="text-[#64748B]">Super Admin Certified</div>
                <div className="mt-1 font-mono font-bold text-[#0F172A]">
                  {airGapStatus.superAdminCertified ? 'TRUE (VERIFIED)' : 'FALSE (LOCKED)'}
                </div>
              </div>
              <div className="p-3.5 rounded-lg border border-[#D8E2EC] bg-[#F8FAFC]">
                <div className="text-[#64748B]">Active Endpoint Target</div>
                <div className="mt-1 font-mono text-[11px] text-[#0F172A] truncate">
                  {isSandbox ? KRA_ENDPOINTS.SANDBOX : airGapStatus.activeEndpointUrl}
                </div>
              </div>
            </div>

            {probeResults && (
              <div className="border-t border-[#E8EEF5] pt-4 space-y-2">
                <div className="text-xs font-bold text-[#0F172A]">
                  Outbound Endpoint Validation Probe Results
                </div>
                <div className="divide-y divide-[#E8EEF5] rounded-lg border border-[#D8E2EC] overflow-hidden">
                  {probeResults.map((probe, idx) => (
                    <div key={idx} className="p-3 bg-white flex items-start justify-between gap-4 text-xs">
                      <div className="min-w-0">
                        <div className="font-semibold text-[#0F172A]">{probe.label}</div>
                        <div className="text-[11px] text-[#54657E] mt-0.5">{probe.reason}</div>
                      </div>
                      <Badge
                        variant={probe.allowed ? 'success' : 'sandbox'}
                        className="shrink-0"
                      >
                        {probe.allowed ? 'PERMITTED' : 'BLOCKED'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DEMO SEEDING & 12-ROLE ACCOUNT DIRECTORY */}
      {activeTab === 'seeding' && (
        <div className="space-y-5">
          <div className="rounded-xl border border-[#D8E2EC] bg-white p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8EEF5] pb-4">
              <div>
                <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                  <Database size={16} className="text-[#E03616]" />
                  Workspace Seed Manifest &amp; Clean Reset
                </h2>
                <p className="text-xs text-[#54657E] mt-1">
                  {seedManifest.organization} · KRA PIN {seedManifest.kraPin} · CLI command: <span className="font-mono font-semibold">npm run db:seed</span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!confirmReset ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmReset(true)}
                    className="flex items-center gap-1.5 text-xs bg-white whitespace-nowrap shrink-0"
                  >
                    <RotateCcw size={14} /> Reset Demo Workspace
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleExecuteReset}
                      className="text-xs bg-[#E03616] whitespace-nowrap shrink-0"
                    >
                      Confirm Reset All Stores
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmReset(false)}
                      className="text-xs bg-white whitespace-nowrap shrink-0"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {resetNotice && (
              <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900 font-medium">
                {resetNotice}
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
              {[
                { label: 'Branches', val: seedManifest.counts.branches },
                { label: 'RBAC Users', val: seedManifest.counts.users },
                { label: 'GL Accounts', val: seedManifest.counts.accounts },
                { label: 'Journal Entries', val: seedManifest.counts.journalEntries },
                { label: 'Invoices', val: seedManifest.counts.invoices },
                { label: 'CRM Customers', val: seedManifest.counts.customers },
                { label: 'Deals', val: seedManifest.counts.deals },
                { label: 'Products', val: seedManifest.counts.products },
                { label: 'Warehouses', val: seedManifest.counts.warehouses },
                { label: 'Employees', val: seedManifest.counts.employees },
                { label: 'eTIMS Queue', val: seedManifest.counts.etimsQueueItems },
                { label: 'Automation Rules', val: seedManifest.counts.automationRules },
              ].map((stat) => (
                <div key={stat.label} className="p-3 rounded-lg border border-[#E8EEF5] bg-[#F8FAFC]">
                  <div className="text-[11px] text-[#64748B]">{stat.label}</div>
                  <div className="mt-0.5 text-lg font-bold font-mono tabular-nums text-[#0F172A]">
                    {stat.val}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#D8E2EC] bg-white overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#D8E2EC] bg-[#F8FAFC] flex items-center justify-between">
              <div className="text-xs font-bold text-[#0F172A] flex items-center gap-2">
                <Users size={15} className="text-[#E03616]" />
                12 Provisioned RBAC Demo Personas
              </div>
              <span className="text-xs text-[#64748B]">Click Simulate Role to switch active session</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#D8E2EC] bg-[#F8FAFC] text-[11px] font-bold text-[#334155]">
                  <tr>
                    <th className="py-2.5 px-4">Role</th>
                    <th className="py-2.5 px-4">Full Name</th>
                    <th className="py-2.5 px-4">Email</th>
                    <th className="py-2.5 px-4">Title</th>
                    <th className="py-2.5 px-4 text-right">Session Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8EEF5]">
                  {allUsers.map((u) => {
                    const isCurrent = u.userId === currentUser.userId;
                    return (
                      <tr key={u.userId} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-2.5 px-4 font-mono font-bold text-[#0F172A]">
                          {u.role}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-[#0F172A]">
                          {u.fullName}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[#54657E]">{u.email}</td>
                        <td className="py-2.5 px-4 text-[#54657E]">{u.title}</td>
                        <td className="py-2.5 px-4 text-right">
                          {isCurrent ? (
                            <Badge variant="bloodOrange">Active Session</Badge>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onSwitchUser(u)}
                              className="text-xs py-1 px-2.5 bg-white whitespace-nowrap shrink-0"
                            >
                              Simulate Role
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <ProductionSwitchModal
        isOpen={isProductionModalOpen}
        onClose={() => setIsProductionModalOpen(false)}
        onConfirmSwitch={onActivateProduction}
        userId={currentUser.userId}
        userFullName={currentUser.fullName}
        userRole={currentUser.role}
        taxpayerPin={taxpayerPin}
      />
    </div>
  );
}
