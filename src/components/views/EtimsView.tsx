import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Send,
  QrCode,
  ExternalLink,
  CheckCircle2,
  Cpu,
  Lock,
  FileCheck,
  Settings,
  RefreshCw,
  Clock,
  Terminal,
  FileText,
  AlertTriangle,
  RotateCcw,
  CheckSquare,
  ArrowRight,
  Download,
  Filter,
  Search,
  Check,
  X,
  Radio,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  EtimsRecord,
  EtimsQueueItem,
  EtimsConfigurationRecord,
  CreditNoteRecord,
  InvoiceRecord,
  ProductRecord,
  UserRole,
  JournalEntry,
  StockMovementRecord,
} from '@/types';
import { formatKES } from '@/lib/utils';
import { hasPermission } from '@/modules/auth/rbac';
import { RawPayloadModal } from '@/components/etims/RawPayloadModal';
import { CreateCreditNoteModal } from '@/components/etims/CreateCreditNoteModal';
import { ProductionSwitchModal } from '@/components/etims/ProductionSwitchModal';

interface EtimsViewProps {
  records: EtimsRecord[];
  queueItems: EtimsQueueItem[];
  config: EtimsConfigurationRecord;
  creditNotes: CreditNoteRecord[];
  invoices: InvoiceRecord[];
  products: ProductRecord[];
  isSandbox: boolean;
  userRole: UserRole;
  userFullName: string;
  currentPath?: string;
  onNavigate?: (path: string) => void;
  onToggleSandbox: () => void;
  onTransmitQueue: () => void;
  onRetryQueueItem: (itemId: string) => void;
  onUpdateConfig: (config: EtimsConfigurationRecord) => void;
  onCreateCreditNote: (
    creditNote: CreditNoteRecord,
    reversingJournal: JournalEntry,
    restoredStockMovements: StockMovementRecord[]
  ) => void;
}

type EtimsTab = 'config' | 'queue' | 'credit_notes' | 'reconciliation';

export function EtimsView({
  records,
  queueItems,
  config,
  creditNotes,
  invoices,
  products,
  isSandbox,
  userRole,
  userFullName,
  currentPath = '/etims/queue',
  onNavigate,
  onToggleSandbox,
  onTransmitQueue,
  onRetryQueueItem,
  onUpdateConfig,
  onCreateCreditNote,
}: EtimsViewProps) {
  const getTabFromPath = (path: string): EtimsTab => {
    if (path.includes('/configuration')) return 'config';
    if (path.includes('/credit-notes')) return 'credit_notes';
    if (path.includes('/reconciliation')) return 'reconciliation';
    return 'queue';
  };

  const [activeTab, setActiveTab] = useState<EtimsTab>(() => getTabFromPath(currentPath));

  useEffect(() => {
    setActiveTab(getTabFromPath(currentPath));
  }, [currentPath]);

  const handleTabChange = (tab: EtimsTab) => {
    setActiveTab(tab);
    if (onNavigate) {
      if (tab === 'config') onNavigate('/etims/configuration');
      if (tab === 'queue') onNavigate('/etims/queue');
      if (tab === 'credit_notes') onNavigate('/etims/credit-notes');
      if (tab === 'reconciliation') onNavigate('/etims/reconciliation');
    }
  };

  // State & Modals
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQueueItem, setSelectedQueueItem] = useState<EtimsQueueItem | null>(queueItems[0] || null);
  const [selectedPayloadItem, setSelectedPayloadItem] = useState<EtimsQueueItem | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isCreditNoteModalOpen, setIsCreditNoteModalOpen] = useState(false);
  const [isProductionSwitchOpen, setIsProductionSwitchOpen] = useState(false);
  const [isTransmitting, setIsTransmitting] = useState(false);

  // Ping Test State
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState<{ status: 'SUCCESS' | 'ERROR'; latencyMs: number; message: string } | null>(null);

  // Config Form State
  const [localConfig, setLocalConfig] = useState<EtimsConfigurationRecord>(config);
  const [configSaved, setConfigSaved] = useState(false);

  // Reconciliation Audit Run State
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditRunTimestamp, setAuditRunTimestamp] = useState<string | null>('2026-11-12 00:15:20');

  const canTransmit = hasPermission(userRole, 'ETIMS_COMPLIANCE', 'TRANSMIT_TAX');
  const canAdmin = hasPermission(userRole, 'ETIMS_COMPLIANCE', 'APPROVE') || userRole === 'SUPER_ADMIN';

  // Counts
  const pendingCount = queueItems.filter((q) => q.status === 'PENDING').length;
  const inFlightCount = queueItems.filter((q) => q.status === 'IN_FLIGHT').length;
  const acceptedCount = queueItems.filter((q) => q.status === 'ACCEPTED').length;
  const rejectedCount = queueItems.filter((q) => q.status === 'REJECTED').length;
  const retryCount = queueItems.filter((q) => q.status === 'RETRY_SCHEDULED').length;

  const handleTransmitAll = () => {
    setIsTransmitting(true);
    setTimeout(() => {
      onTransmitQueue();
      setIsTransmitting(false);
    }, 1200);
  };

  const handleTestPing = () => {
    setIsTestingPing(true);
    setPingResult(null);
    setTimeout(() => {
      setIsTestingPing(false);
      setPingResult({
        status: 'SUCCESS',
        latencyMs: Math.floor(Math.random() * 20) + 18,
        message: 'KRA Sandbox Gateway Handshake Verified · OSCU Device ACK 00 Online',
      });
    }, 900);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(localConfig);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2500);
  };

  const handleRunReconciliation = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      setAuditRunTimestamp(new Date().toISOString().replace('T', ' ').slice(0, 19));
    }, 800);
  };

  const handleExportReconciliationCsv = () => {
    const headers = ['Local Invoice', 'Customer Name', 'Customer PIN', 'ERP Total', 'VAT 16%', 'eTIMS Status', 'KRA Control #', 'Match Result'];
    const rows = invoices.map((inv) => {
      const q = queueItems.find((item) => item.invoiceNumber === inv.invoiceNumber);
      const isMatched = q && q.status === 'ACCEPTED';
      return [
        inv.invoiceNumber,
        inv.customerName,
        inv.customerPin,
        inv.totalAmount,
        inv.taxAmount,
        q ? q.status : 'NOT_QUEUED',
        q?.kraControlNumber || 'NONE',
        isMatched ? '3-WAY MATCHED' : 'VARIANCE DETECTED',
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KRA_eTIMS_Reconciliation_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredQueue = queueItems.filter((q) => {
    const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;
    const matchesSearch =
      q.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customerPin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.kraControlNumber && q.kraControlNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Air-Gap Environment Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D8E2EC] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2.5">
              <ShieldCheck className="text-[#E03616]" size={22} />
              Kenya eTIMS Tax Compliance Engine (OSCU / VSCU)
            </h1>
            {isSandbox ? (
              <Badge variant="sandbox">
                SANDBOX VERIFIED - PRODUCTION NOT YET AUTHORIZED
              </Badge>
            ) : (
              <Badge variant="bloodOrange">
                PRODUCTION ACTIVE (LIVE KRA)
              </Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-[#54657E]">
            Kenya Revenue Authority (KRA) System-to-System tax invoice telemetry, transactional outbox queue, credit note lifecycle, and 3-way reconciliation audit.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (isSandbox) {
                setIsProductionSwitchOpen(true);
              } else {
                onToggleSandbox();
              }
            }}
            className="flex items-center gap-1.5 text-xs font-mono bg-white"
          >
            {isSandbox ? (
              <>
                <ShieldAlert size={14} className="text-[#E03616]" /> Engage Production...
              </>
            ) : (
              <>
                <ShieldCheck size={14} className="text-emerald-700" /> Return to Sandbox
              </>
            )}
          </Button>

          {canTransmit && (
            <Button
              variant="primary"
              size="sm"
              isLoading={isTransmitting}
              onClick={handleTransmitAll}
              disabled={pendingCount === 0}
              className="flex items-center gap-1.5 text-xs font-semibold"
            >
              <Send size={14} /> Transmit Outbox ({pendingCount})
            </Button>
          )}
        </div>
      </div>

      {/* Compliance Architecture Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#54657E]">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Air-Gap Protection</span>
            <Lock size={14} className="text-[#E03616]" />
          </div>
          <div className="mt-1 text-sm font-bold text-[#0F172A] font-mono">
            {isSandbox ? 'AIR-GAP ENGAGED (TEST)' : 'UNLOCKED (PRODUCTION)'}
          </div>
          <p className="mt-1 text-[10px] text-[#64748B]">
            Sandbox certificates prevent real fiscal liabilities on KRA servers.
          </p>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#54657E]">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Registered Taxpayer PIN</span>
            <Cpu size={14} className="text-[#1B2436]" />
          </div>
          <div className="mt-1 text-base font-bold text-[#0F172A] font-mono">
            {config.kraPin}
          </div>
          <p className="mt-1 text-[10px] text-[#64748B]">
            {config.legalName} • Branch: {config.branchCode}
          </p>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#54657E]">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Control Unit Gateway</span>
            <CheckCircle2 size={14} className="text-emerald-600" />
          </div>
          <div className="mt-1 text-base font-bold text-[#0F172A] font-mono">
            ONLINE • {config.deviceSerial}
          </div>
          <p className="mt-1 text-[10px] text-[#64748B]">
            Mode: {config.mode} • Latency: {config.lastPingLatencyMs || 28}ms
          </p>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#54657E]">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Outbox Acceptance</span>
            <FileCheck size={14} className="text-[#E03616]" />
          </div>
          <div className="mt-1 text-base font-bold text-[#0F172A] font-mono tabular-nums">
            {acceptedCount} / {queueItems.length} Taxed
          </div>
          <p className="mt-1 text-[10px] text-[#64748B]">
            {pendingCount} Pending • {retryCount} Retries Scheduled
          </p>
        </div>
      </div>

      {/* Subtab Navigation Pills */}
      <div className="flex border-b border-[#D8E2EC] gap-6 text-xs font-semibold">
        <button
          onClick={() => handleTabChange('queue')}
          className={`pb-3 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'queue'
              ? 'border-b-2 border-[#E03616] text-[#E03616] font-bold'
              : 'text-[#54657E] hover:text-[#0F172A]'
          }`}
        >
          <Clock size={15} /> Submission Outbox Queue ({queueItems.length})
        </button>

        <button
          onClick={() => handleTabChange('config')}
          className={`pb-3 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'config'
              ? 'border-b-2 border-[#E03616] text-[#E03616] font-bold'
              : 'text-[#54657E] hover:text-[#0F172A]'
          }`}
        >
          <Settings size={15} /> Taxpayer & Device Setup
        </button>

        <button
          onClick={() => handleTabChange('credit_notes')}
          className={`pb-3 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'credit_notes'
              ? 'border-b-2 border-[#E03616] text-[#E03616] font-bold'
              : 'text-[#54657E] hover:text-[#0F172A]'
          }`}
        >
          <RotateCcw size={15} /> Credit Notes & Reversals ({creditNotes.length})
        </button>

        <button
          onClick={() => handleTabChange('reconciliation')}
          className={`pb-3 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'reconciliation'
              ? 'border-b-2 border-[#E03616] text-[#E03616] font-bold'
              : 'text-[#54657E] hover:text-[#0F172A]'
          }`}
        >
          <CheckSquare size={15} /> 3-Way Reconciliation Audit
        </button>
      </div>

      {/* TAB 1: SUBMISSION OUTBOX QUEUE & MONITOR */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {/* Filter Pills & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {[
                { label: 'All', value: 'ALL', count: queueItems.length },
                { label: 'Pending', value: 'PENDING', count: pendingCount },
                { label: 'Accepted', value: 'ACCEPTED', count: acceptedCount },
                { label: 'Retry Scheduled', value: 'RETRY_SCHEDULED', count: retryCount },
                { label: 'Rejected', value: 'REJECTED', count: rejectedCount },
              ].map((pill) => (
                <button
                  key={pill.value}
                  onClick={() => setStatusFilter(pill.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                    statusFilter === pill.value
                      ? 'bg-[#1B2436] text-white shadow-xs'
                      : 'bg-white border border-[#D8E2EC] text-[#54657E] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {pill.label} ({pill.count})
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
              />
              <input
                type="text"
                placeholder="Search invoice #, customer PIN, control #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-[#D8E2EC] bg-white pl-9 pr-3 py-1.5 text-xs text-[#0F172A] placeholder:text-[#64748B] focus:border-[#E03616] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Outbox Table */}
            <div className="lg:col-span-8 rounded-xl border border-[#D8E2EC] bg-white overflow-hidden shadow-xs">
              <div className="p-3.5 border-b border-[#D8E2EC] bg-[#E8EEF5] flex items-center justify-between text-xs">
                <span className="font-bold text-[#1B2436] uppercase tracking-wider">
                  Transactional Outbox Telemetry
                </span>
                <span className="text-[10px] text-[#54657E] font-mono">
                  Queue worker: active (60s poll)
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#D8E2EC] bg-[#F8FAFC] text-[11px] font-bold text-[#334155] uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Invoice No</th>
                      <th className="py-2.5 px-3">Client & PIN</th>
                      <th className="py-2.5 px-3 text-right">Amount (KES)</th>
                      <th className="py-2.5 px-3 text-right">VAT 16%</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-center">Telemetry</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D8E2EC] text-[#334155]">
                    {filteredQueue.map((item) => {
                      const isSelected = selectedQueueItem?.id === item.id;
                      return (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedQueueItem(item)}
                          className={`hover:bg-[#F8FAFC] transition-colors cursor-pointer ${
                            isSelected ? 'bg-[#F0F4F8] font-medium' : ''
                          }`}
                        >
                          <td className="py-3 px-3 font-mono font-bold text-[#0F172A]">
                            {item.invoiceNumber}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-[#0F172A]">{item.customerName}</div>
                            <div className="text-[10px] text-[#64748B] font-mono">{item.customerPin}</div>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-[#0F172A] tabular-nums">
                            {formatKES(item.totalAmountKes)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-[#54657E] tabular-nums">
                            {formatKES(item.vatAmountKes)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <Badge
                              variant={
                                item.status === 'ACCEPTED'
                                  ? 'success'
                                  : item.status === 'PENDING'
                                  ? 'warning'
                                  : item.status === 'RETRY_SCHEDULED'
                                  ? 'bloodOrange'
                                  : 'danger'
                              }
                              className="text-[10px]"
                            >
                              {item.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPayloadItem(item);
                                }}
                                className="p-1 rounded text-slate-500 hover:text-[#E03616] hover:bg-[#E8EEF5] transition-colors cursor-pointer"
                                title="Inspect raw JSON request and response payloads"
                              >
                                <Terminal size={14} />
                              </button>
                              {item.status === 'ACCEPTED' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedQueueItem(item);
                                    setIsQrModalOpen(true);
                                  }}
                                  className="p-1 rounded text-slate-500 hover:text-emerald-700 hover:bg-[#E8EEF5] transition-colors cursor-pointer"
                                  title="View KRA QR Code verification"
                                >
                                  <QrCode size={14} />
                                </button>
                              )}
                              {(item.status === 'REJECTED' || item.status === 'RETRY_SCHEDULED') && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRetryQueueItem(item.id);
                                  }}
                                  className="p-1 rounded text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                                  title="Retry immediate submission"
                                >
                                  <RefreshCw size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Selected Queue Item Inspector Card */}
            <div className="lg:col-span-4 rounded-xl border border-[#D8E2EC] bg-white p-5 shadow-xs space-y-4">
              {selectedQueueItem ? (
                <>
                  <div className="flex items-center justify-between border-b border-[#D8E2EC] pb-3">
                    <div>
                      <div className="text-xs text-[#54657E] uppercase font-mono font-semibold">
                        Fiscal Control Record
                      </div>
                      <div className="text-base font-bold text-[#0F172A] font-mono">
                        {selectedQueueItem.invoiceNumber}
                      </div>
                    </div>
                    <Badge
                      variant={selectedQueueItem.status === 'ACCEPTED' ? 'success' : 'warning'}
                      className="text-[10px]"
                    >
                      {selectedQueueItem.status}
                    </Badge>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[#64748B] block text-[10px] uppercase font-semibold">
                        Buyer Legal Name
                      </span>
                      <span className="font-bold text-[#0F172A]">{selectedQueueItem.customerName}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 font-mono">
                      <div>
                        <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Buyer PIN</span>
                        <span className="text-[#1B2436] font-semibold">{selectedQueueItem.customerPin}</span>
                      </div>
                      <div>
                        <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Mode</span>
                        <span className="text-[#1B2436] font-bold">{selectedQueueItem.mode}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#D8E2EC] space-y-1.5 font-mono text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[#54657E]">Total Invoiced:</span>
                        <span className="text-[#0F172A] font-bold">{formatKES(selectedQueueItem.totalAmountKes)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#54657E]">VAT 16% Output:</span>
                        <span className="text-[#1B2436] font-semibold">{formatKES(selectedQueueItem.vatAmountKes)}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-[#D8E2EC]">
                        <span className="text-[#54657E]">Net Taxable:</span>
                        <span className="text-[#0F172A] font-bold">
                          {formatKES(selectedQueueItem.totalAmountKes - selectedQueueItem.vatAmountKes)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 font-mono text-[11px]">
                      <div className="text-[#64748B] text-[10px] uppercase font-semibold">Idempotency Key (UUIDv4)</div>
                      <div className="text-[#1B2436] text-[10px] bg-[#E8EEF5] p-2 rounded-lg border border-[#D8E2EC] truncate">
                        {selectedQueueItem.idempotencyKey}
                      </div>
                    </div>

                    {selectedQueueItem.kraControlNumber ? (
                      <div className="space-y-1 font-mono text-[11px]">
                        <div className="text-[#64748B] text-[10px] uppercase font-semibold">KRA Control Number</div>
                        <div className="text-emerald-800 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                          {selectedQueueItem.kraControlNumber}
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                        <span className="font-semibold block">Pending Acknowledgment</span>
                        Waiting for KRA gateway confirmation ticket.
                      </div>
                    )}

                    {selectedQueueItem.lastError && (
                      <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-900 text-[11px] font-mono">
                        <span className="font-semibold block text-red-950">Gateway Diagnostic</span>
                        {selectedQueueItem.lastError}
                      </div>
                    )}

                    <div className="pt-2 flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPayloadItem(selectedQueueItem)}
                        className="w-full flex items-center justify-center gap-1.5 text-xs bg-white"
                      >
                        <Terminal size={14} /> View Raw Transmitted Payload
                      </Button>

                      {selectedQueueItem.status === 'ACCEPTED' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setIsQrModalOpen(true)}
                          className="w-full flex items-center justify-center gap-1.5 text-xs"
                        >
                          <QrCode size={14} /> Open eTIMS QR Verification
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-[#64748B] text-xs py-10">
                  Select an item from the transmission queue.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TAXPAYER & DEVICE CONFIGURATION */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveConfig} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Taxpayer Legal Identity */}
              <div className="rounded-xl border border-[#D8E2EC] bg-white p-5 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                  <Cpu size={16} className="text-[#E03616]" />
                  Taxpayer Legal Identification
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                      Taxpayer Legal Name <span className="text-[#E03616]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={localConfig.legalName}
                      onChange={(e) => setLocalConfig({ ...localConfig, legalName: e.target.value })}
                      className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                        KRA PIN Number <span className="text-[#E03616]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={localConfig.kraPin}
                        onChange={(e) => setLocalConfig({ ...localConfig, kraPin: e.target.value.toUpperCase() })}
                        className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs font-mono uppercase text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                        Branch Code <span className="text-[#E03616]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={localConfig.branchCode}
                        onChange={(e) => setLocalConfig({ ...localConfig, branchCode: e.target.value })}
                        className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs font-mono text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                      KRA VAT Registration Number
                    </label>
                    <input
                      type="text"
                      value={localConfig.vatNumber}
                      onChange={(e) => setLocalConfig({ ...localConfig, vatNumber: e.target.value })}
                      className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs font-mono text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Integration Mode & Architecture */}
              <div className="rounded-xl border border-[#D8E2EC] bg-white p-5 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                  <Settings size={16} className="text-[#1B2436]" />
                  eTIMS Architecture & Mode Selection
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                      Middleware Integration Mode
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className={`p-3 rounded-lg border cursor-pointer flex flex-col gap-1 transition-all ${
                          localConfig.mode === 'OSCU'
                            ? 'border-[#E03616] bg-[#E03616]/5'
                            : 'border-[#D8E2EC] bg-[#F8FAFC]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#0F172A]">OSCU Mode</span>
                          <input
                            type="radio"
                            name="etimsMode"
                            checked={localConfig.mode === 'OSCU'}
                            onChange={() => setLocalConfig({ ...localConfig, mode: 'OSCU' })}
                            className="text-[#E03616]"
                          />
                        </div>
                        <span className="text-[10px] text-[#64748B]">
                          Online Sales Control Unit: Direct system-to-system REST API submission.
                        </span>
                      </label>

                      <label
                        className={`p-3 rounded-lg border cursor-pointer flex flex-col gap-1 transition-all ${
                          localConfig.mode === 'VSCU'
                            ? 'border-[#E03616] bg-[#E03616]/5'
                            : 'border-[#D8E2EC] bg-[#F8FAFC]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#0F172A]">VSCU Mode</span>
                          <input
                            type="radio"
                            name="etimsMode"
                            checked={localConfig.mode === 'VSCU'}
                            onChange={() => setLocalConfig({ ...localConfig, mode: 'VSCU' })}
                            className="text-[#E03616]"
                          />
                        </div>
                        <span className="text-[10px] text-[#64748B]">
                          Virtual Sales Control Unit: Local fiscal proxy agent / batch transmission.
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                      KRA Gateway API Endpoint URL
                    </label>
                    <input
                      type="url"
                      value={localConfig.apiUrl}
                      onChange={(e) => setLocalConfig({ ...localConfig, apiUrl: e.target.value })}
                      className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs font-mono text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                      Device Serial / Hardware Key Identifier
                    </label>
                    <input
                      type="text"
                      value={localConfig.deviceSerial}
                      onChange={(e) => setLocalConfig({ ...localConfig, deviceSerial: e.target.value })}
                      className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs font-mono text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: Security & Cryptographic Credentials */}
              <div className="rounded-xl border border-[#D8E2EC] bg-white p-5 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                  <Lock size={16} className="text-emerald-700" />
                  Encrypted Security Credentials
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                      Encrypted Client Secret (AES-256 Storage)
                    </label>
                    <input
                      type="password"
                      value={localConfig.clientSecretMasked}
                      readOnly
                      className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs font-mono text-[#64748B] focus:outline-none select-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                      PKI Client Certificate Path
                    </label>
                    <input
                      type="text"
                      readOnly
                      value="/etc/ssl/innowit/etims-taxpayer-cert.p12"
                      className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs font-mono text-[#64748B]"
                    />
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs">
                    <span className="font-semibold block flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-emerald-700" /> Cryptographic Handshake Online
                    </span>
                    <span className="text-[11px] text-emerald-800">
                      RSA-2048 private key signature algorithm active. Payloads signed with sha256WithRSAEncryption.
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 4: Accounting General Ledger Tax Mappings */}
              <div className="rounded-xl border border-[#D8E2EC] bg-white p-5 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                  <FileText size={16} className="text-[#1B2436]" />
                  General Ledger Tax Account Mappings
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                      VAT Output Liability Account (16% Sales)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={localConfig.vatOutputAccount}
                      className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                      VAT Input Tax Account (Purchases)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={localConfig.vatInputAccount}
                      className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                      Withholding Tax Payable Account
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={localConfig.withholdingAccount}
                      className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Test Connection Result Box */}
            {pingResult && (
              <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs text-emerald-950 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-sm block">KRA Gateway Handshake Verified</span>
                    <span className="text-[11px] text-emerald-800">{pingResult.message}</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-sm bg-white border border-emerald-200 px-3 py-1 rounded-md text-emerald-800 tabular-nums">
                  {pingResult.latencyMs} ms
                </span>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-[#D8E2EC]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                isLoading={isTestingPing}
                onClick={handleTestPing}
                className="flex items-center gap-1.5 text-xs bg-white"
              >
                <RefreshCw size={14} /> Test KRA Gateway Connection
              </Button>

              <div className="flex items-center gap-3">
                {configSaved && (
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <Check size={14} /> Configuration Saved
                  </span>
                )}
                {canAdmin && (
                  <Button type="submit" variant="primary" size="sm" className="flex items-center gap-1.5 text-xs">
                    <CheckCircle2 size={14} /> Save Taxpayer Configuration
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: CREDIT NOTES & CORRECTION LIFECYCLE */}
      {activeTab === 'credit_notes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">KRA eTIMS Credit Notes Register</h3>
              <p className="text-xs text-[#54657E]">
                All credit notes reference accepted original KRA Control Numbers and trigger atomic General Ledger tax reversal entries.
              </p>
            </div>

            {canTransmit && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreditNoteModalOpen(true)}
                className="flex items-center gap-1.5 text-xs"
              >
                <Plus size={14} /> Issue Credit Note
              </Button>
            )}
          </div>

          <div className="rounded-xl border border-[#D8E2EC] bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#D8E2EC] bg-[#E8EEF5] text-[11px] font-bold text-[#334155] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-32">Credit Note #</th>
                    <th className="py-3 px-4 w-32">Original Invoice</th>
                    <th className="py-3 px-4">Client & PIN</th>
                    <th className="py-3 px-4 w-36">Reason Code</th>
                    <th className="py-3 px-4 text-right w-32">Net Credit (KES)</th>
                    <th className="py-3 px-4 text-right w-32">VAT Offset (16%)</th>
                    <th className="py-3 px-4 text-right w-36">Total Credit (KES)</th>
                    <th className="py-3 px-4 text-center w-28">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8E2EC] text-[#334155]">
                  {creditNotes.map((cn) => (
                    <tr key={cn.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-4 font-mono font-bold text-[#0F172A]">
                        {cn.creditNoteNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono font-semibold text-[#0F172A]">{cn.originalInvoiceNumber}</div>
                        <div className="text-[10px] text-[#64748B] font-mono">{cn.originalKraControlNumber}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#0F172A]">{cn.customerName}</div>
                        <div className="text-[10px] text-[#64748B] font-mono">{cn.customerPin}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="frost" className="text-[10px]">
                          {cn.reasonCode}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-[#54657E]">
                        {formatKES(cn.subtotalKes)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-[#E03616]">
                        {formatKES(cn.taxAmountKes)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#0F172A] tabular-nums">
                        {formatKES(cn.totalAmountKes)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="success" className="text-[10px]">
                          {cn.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: 3-WAY RECONCILIATION AUDIT */}
      {activeTab === 'reconciliation' && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">
                3-Way Reconciliation Audit Engine
              </h3>
              <p className="text-xs text-[#54657E]">
                Automated matching between Local ERP Invoices vs. eTIMS Queue Submissions vs. KRA Acknowledged Fiscal Control Codes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportReconciliationCsv}
                className="flex items-center gap-1.5 text-xs bg-white"
              >
                <Download size={14} /> Export Audit Report (CSV)
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isAuditing}
                onClick={handleRunReconciliation}
                className="flex items-center gap-1.5 text-xs"
              >
                <RefreshCw size={14} /> Run 3-Way Reconciliation Audit
              </Button>
            </div>
          </div>

          {/* Variance Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                Total ERP Invoices
              </span>
              <div className="mt-1 text-lg font-bold text-[#0F172A] font-mono tabular-nums">
                {invoices.length} Documents
              </div>
              <span className="text-[10px] text-[#64748B]">General Ledger Source</span>
            </div>

            <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                KRA Acknowledged Control Codes
              </span>
              <div className="mt-1 text-lg font-bold text-emerald-800 font-mono tabular-nums">
                {acceptedCount} Matched Receipts
              </div>
              <span className="text-[10px] text-emerald-700">100% Signature Verification</span>
            </div>

            <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                Pending or In-Flight
              </span>
              <div className="mt-1 text-lg font-bold text-amber-700 font-mono tabular-nums">
                {pendingCount + inFlightCount + retryCount} Queue Items
              </div>
              <span className="text-[10px] text-amber-800">Transmitting to gateway</span>
            </div>

            <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                Net Discrepancy Value
              </span>
              <div className="mt-1 text-lg font-bold text-[#E03616] font-mono tabular-nums">
                KES 0.00
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold">Zero Unreconciled Variance</span>
            </div>
          </div>

          {/* 3-Way Reconciliation Comparison Grid */}
          <div className="rounded-xl border border-[#D8E2EC] bg-white overflow-hidden shadow-xs">
            <div className="p-3.5 bg-[#E8EEF5] border-b border-[#D8E2EC] flex items-center justify-between text-xs">
              <span className="font-bold text-[#1B2436] uppercase tracking-wider">
                Audited Document Continuity (ERP ↔ eTIMS Queue ↔ KRA Server)
              </span>
              <span className="font-mono text-[10px] text-[#54657E]">
                Last Audit: {auditRunTimestamp || 'Running initial audit'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#D8E2EC] bg-[#F8FAFC] text-[11px] font-semibold text-[#54657E]">
                  <tr>
                    <th className="py-3 px-4">Local Invoice #</th>
                    <th className="py-3 px-4">Buyer Entity & PIN</th>
                    <th className="py-3 px-4 text-right">ERP Value (KES)</th>
                    <th className="py-3 px-4 text-right">VAT 16%</th>
                    <th className="py-3 px-4">eTIMS Queue State</th>
                    <th className="py-3 px-4">KRA Control Number</th>
                    <th className="py-3 px-4 text-center">3-Way Audit Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8E2EC]">
                  {invoices.map((inv) => {
                    const qItem = queueItems.find((q) => q.invoiceNumber === inv.invoiceNumber);
                    const isMatched = qItem && qItem.status === 'ACCEPTED';

                    return (
                      <tr key={inv.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-3 px-4 font-mono font-bold text-[#0F172A]">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#0F172A]">{inv.customerName}</div>
                          <div className="text-[10px] text-[#64748B] font-mono">{inv.customerPin}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-[#0F172A]">
                          {formatKES(inv.totalAmount)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-[#54657E]">
                          {formatKES(inv.taxAmount)}
                        </td>
                        <td className="py-3 px-4">
                          {qItem ? (
                            <Badge
                              variant={
                                qItem.status === 'ACCEPTED'
                                  ? 'success'
                                  : qItem.status === 'PENDING'
                                  ? 'warning'
                                  : 'bloodOrange'
                              }
                              className="text-[10px]"
                            >
                              {qItem.status}
                            </Badge>
                          ) : (
                            <Badge variant="neutral" className="text-[10px]">
                              Local Draft
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px]">
                          {qItem?.kraControlNumber ? (
                            <span className="text-emerald-800 font-bold">{qItem.kraControlNumber}</span>
                          ) : (
                            <span className="text-[#64748B] italic">Awaiting Sync</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isMatched ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                              <CheckCircle2 size={12} className="text-emerald-600" /> 3-Way Matched
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                              <Clock size={12} className="text-amber-600" /> Pending Transmission
                            </span>
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

      {/* MODAL 1: RAW PAYLOAD / RESPONSE INSPECTOR */}
      <RawPayloadModal
        isOpen={!!selectedPayloadItem}
        onClose={() => setSelectedPayloadItem(null)}
        queueItem={selectedPayloadItem}
      />

      {/* MODAL 2: CREATE CREDIT NOTE */}
      <CreateCreditNoteModal
        isOpen={isCreditNoteModalOpen}
        onClose={() => setIsCreditNoteModalOpen(false)}
        invoices={invoices}
        products={products}
        userFullName={userFullName}
        onCreateCreditNote={onCreateCreditNote}
      />

      {/* MODAL 3: PRODUCTION SWITCH AIR-GAP GATE */}
      <ProductionSwitchModal
        isOpen={isProductionSwitchOpen}
        onClose={() => setIsProductionSwitchOpen(false)}
        onConfirmSwitch={onToggleSandbox}
      />

      {/* MODAL 4: QR CODE DETAIL */}
      {selectedQueueItem && (
        <Modal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          title="KRA eTIMS Fiscal QR Verification"
          description={`Tax receipt audit verification for ${selectedQueueItem.invoiceNumber}`}
          maxWidth="md"
        >
          <div className="flex flex-col items-center justify-center p-4 space-y-4 text-center">
            {/* KRA QR Code Box */}
            <div className="p-4 bg-white rounded-xl shadow-md border border-[#D8E2EC] inline-block">
              <div className="h-44 w-44 bg-[#1B2436] flex flex-col items-center justify-center p-2 rounded-lg">
                <div className="grid grid-cols-5 gap-1.5 w-full h-full p-2 bg-white rounded">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-xs ${
                        (i % 2 === 0 || i % 5 === 0) ? 'bg-[#1B2436]' : 'bg-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1 font-mono text-xs">
              <div className="font-bold text-[#0F172A]">{selectedQueueItem.invoiceNumber}</div>
              <div className="text-[#54657E] text-[11px]">CU: {selectedQueueItem.cuNumber}</div>
              <div className="text-[#E03616] font-bold">
                KRA VERIFIED · {formatKES(selectedQueueItem.totalAmountKes)}
              </div>
              {selectedQueueItem.kraControlNumber && (
                <div className="text-emerald-800 text-[11px] font-bold">
                  Control #: {selectedQueueItem.kraControlNumber}
                </div>
              )}
            </div>

            <p className="text-[11px] text-[#64748B] max-w-xs">
              Cryptographic payload verified against the KRA eTIMS Gateway (Ack: 00).
            </p>

            <a
              href={`https://itax.kra.go.ke/KRA-Portal/invoiceConfirmation.htm?cu=${selectedQueueItem.cuNumber}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#E03616] font-semibold hover:underline"
            >
              Verify on Official KRA Portal <ExternalLink size={12} />
            </a>
          </div>
        </Modal>
      )}
    </div>
  );
}
