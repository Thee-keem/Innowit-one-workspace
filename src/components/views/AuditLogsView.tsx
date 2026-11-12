import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Eye,
  FileText,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Code,
  Layers,
  ChevronRight,
  Database,
  Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { AuditLogRecord, UserRole } from '@/types';
import { exportAuditLogsToCsv } from '@/modules/audit/store';

interface AuditLogsViewProps {
  logs: AuditLogRecord[];
  userRole: UserRole;
  userFullName: string;
}

export function AuditLogsView({
  logs,
  userRole,
  userFullName,
}: AuditLogsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLogRecord | null>(null);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesEntity = entityFilter === 'ALL' || log.entityType === entityFilter;
      const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        log.entityId.toLowerCase().includes(q) ||
        (log.entityName && log.entityName.toLowerCase().includes(q)) ||
        log.userFullName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.entityType.toLowerCase().includes(q);

      return matchesEntity && matchesAction && matchesSearch;
    });
  }, [logs, entityFilter, actionFilter, searchQuery]);

  const stats = useMemo(() => {
    const glPostings = logs.filter((l) => l.action === 'POST_GL').length;
    const taxTransmissions = logs.filter((l) => l.action === 'TRANSMIT_TAX').length;
    const uniqueUsers = new Set(logs.map((l) => l.userId)).size;
    return {
      totalRecords: logs.length,
      glPostings,
      taxTransmissions,
      uniqueUsers,
    };
  }, [logs]);

  const handleExportCsv = () => {
    const csv = exportAuditLogsToCsv(filteredLogs);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Innowit_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadgeVariant = (action: AuditLogRecord['action']) => {
    switch (action) {
      case 'POST_GL':
        return 'success';
      case 'TRANSMIT_TAX':
        return 'sandbox';
      case 'APPROVE':
        return 'slateBlue';
      case 'CREATE':
        return 'bloodOrange';
      case 'UPDATE':
        return 'warning';
      case 'DELETE':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  // Helper to parse changes JSON safely
  const parsedChanges = useMemo(() => {
    if (!selectedLog || !selectedLog.changesJson) return null;
    try {
      return JSON.parse(selectedLog.changesJson);
    } catch {
      return null;
    }
  }, [selectedLog]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#D8E2EC] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-[#10B981]" />
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A] sm:text-2xl">
              Immutable System Audit Trail
            </h1>
            <Badge variant="success" className="text-[10px]">
              TAMPER-RESISTANT LOG
            </Badge>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Complete append-only audit trail capturing user identities, client IPs, state mutations, GL postings, and fiscal compliance transmissions.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCsv}
          className="flex items-center space-x-1.5 text-xs text-[#1B2436] border-[#D8E2EC] hover:bg-[#F0F4F8]"
        >
          <Download size={13} className="text-[#E03616]" />
          <span>Export Audit Trail (CSV)</span>
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Audit Events</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{stats.totalRecords}</span>
            <span className="text-xs text-slate-400">immutable rows</span>
          </div>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">General Ledger Postings</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#10B981]">{stats.glPostings}</span>
            <span className="text-xs text-slate-400">balanced transactions</span>
          </div>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tax Transmissions</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#8B5CF6]">{stats.taxTransmissions}</span>
            <span className="text-xs text-slate-400">KRA submissions</span>
          </div>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Operators</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{stats.uniqueUsers}</span>
            <span className="text-xs text-slate-400">RBAC identities</span>
          </div>
        </div>
      </div>

      {/* Main Audit Data Grid */}
      <div className="rounded-xl border border-[#D8E2EC] bg-white shadow-xs overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-[#D8E2EC] bg-[#F8FAFC] flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by entity, ID, user, or action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#D8E2EC] rounded-md text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1B2436]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Entity Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500">Entity:</span>
              <select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                className="rounded-md border border-[#D8E2EC] bg-white px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#1B2436]"
              >
                <option value="ALL">All Entities</option>
                <option value="SalesInvoice">Sales Invoice</option>
                <option value="JournalEntry">Journal Entry</option>
                <option value="StockMovement">Stock Movement</option>
                <option value="PurchaseOrder">Purchase Order</option>
                <option value="GoodsReceipt">Goods Receipt</option>
                <option value="PayrollRun">Payroll Run</option>
                <option value="Customer">Customer</option>
                <option value="AutomationRule">Automation Rule</option>
                <option value="EtimsConfiguration">eTIMS Setup</option>
              </select>
            </div>

            {/* Action Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500">Action:</span>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="rounded-md border border-[#D8E2EC] bg-white px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#1B2436]"
              >
                <option value="ALL">All Actions</option>
                <option value="POST_GL">POST_GL (General Ledger)</option>
                <option value="TRANSMIT_TAX">TRANSMIT_TAX (eTIMS)</option>
                <option value="APPROVE">APPROVE (Sign-Off)</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="TRIGGER_AUTOMATION">TRIGGER_AUTOMATION</option>
              </select>
            </div>
          </div>
        </div>

        {/* Audit Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#D8E2EC] text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-[#F8FAFC]">
              <tr>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Entity Type</th>
                <th className="py-2.5 px-4">Entity Description / Record</th>
                <th className="py-2.5 px-4">Operator</th>
                <th className="py-2.5 px-4">IP Address</th>
                <th className="py-2.5 px-4 text-center">Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EEF5]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No audit records matching query parameters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-2.5 px-4">
                      <Badge
                        variant={getActionBadgeVariant(log.action)}
                        className="text-[10px]"
                      >
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-4 font-mono font-semibold text-slate-800">
                      {log.entityType}
                    </td>
                    <td className="py-2.5 px-4 text-slate-800">
                      <div className="font-semibold text-slate-900 truncate max-w-xs">
                        {log.entityName || log.entityId}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        ID: {log.entityId}
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="font-medium text-slate-900">{log.userFullName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{log.userRole}</div>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px]">
                      {log.ipAddress || '192.168.1.10'}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 rounded text-slate-500 hover:text-white hover:bg-[#1B2436] transition-colors cursor-pointer"
                        title="View Detailed State Diff"
                      >
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STATE MUTATION DIFF MODAL */}
      {selectedLog && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedLog(null)}
          title={`Audit State Inspection: ${selectedLog.entityType} (${selectedLog.entityId})`}
        >
          <div className="space-y-4 text-xs">
            {/* Metadata Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] text-[11px]">
              <div>
                <span className="text-slate-400 block">Action</span>
                <span className="font-bold text-slate-900">{selectedLog.action}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Operator</span>
                <span className="font-semibold text-slate-900">{selectedLog.userFullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Role</span>
                <span className="font-mono text-slate-900">{selectedLog.userRole}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Timestamp</span>
                <span className="font-mono text-slate-900">{selectedLog.timestamp}</span>
              </div>
            </div>

            {/* Before vs After Visual Comparison if available */}
            {parsedChanges && (parsedChanges.before || parsedChanges.after) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Before State */}
                <div className="rounded-lg border border-red-200 bg-red-50/40 p-3">
                  <div className="font-semibold text-red-900 pb-1.5 border-b border-red-200 text-[11px] flex items-center justify-between">
                    <span>Previous State (Before)</span>
                    <span className="text-[10px] text-red-600 font-mono">PRIOR</span>
                  </div>
                  <pre className="mt-2 text-[11px] font-mono text-red-950 overflow-x-auto whitespace-pre-wrap">
                    {parsedChanges.before
                      ? JSON.stringify(parsedChanges.before, null, 2)
                      : 'None (Initial Creation)'}
                  </pre>
                </div>

                {/* After State */}
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3">
                  <div className="font-semibold text-emerald-900 pb-1.5 border-b border-emerald-200 text-[11px] flex items-center justify-between">
                    <span>Mutated State (After)</span>
                    <span className="text-[10px] text-emerald-600 font-mono">POSTED</span>
                  </div>
                  <pre className="mt-2 text-[11px] font-mono text-emerald-950 overflow-x-auto whitespace-pre-wrap">
                    {parsedChanges.after
                      ? JSON.stringify(parsedChanges.after, null, 2)
                      : JSON.stringify(parsedChanges, null, 2)}
                  </pre>
                </div>
              </div>
            ) : null}

            {/* Complete Raw JSON Diff View */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Code size={13} className="text-[#E03616]" />
                  Raw Mutation Payload
                </span>
                <span className="text-[10px] font-mono text-slate-400">JSON Payload</span>
              </div>
              <div className="rounded-lg border border-[#D8E2EC] bg-[#141B29] p-3 text-slate-200 font-mono text-[11px] max-h-56 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-[#00B3C8]">
                  {selectedLog.changesJson || JSON.stringify(selectedLog, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E8EEF5]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedLog(null)}
              >
                Close Audit Inspector
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
