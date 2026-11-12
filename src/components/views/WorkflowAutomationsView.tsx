import React, { useState } from 'react';
import {
  Zap,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Shield,
  Layers,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Bell,
  Mail,
  FileText,
  Sliders,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  AutomationRule,
  AutomationExecutionLog,
  AutomationTrigger,
  AutomationActionType,
  UserRole,
} from '@/types';

interface WorkflowAutomationsViewProps {
  rules: AutomationRule[];
  logs: AutomationExecutionLog[];
  onToggleRule: (ruleId: string) => void;
  onRunEngine: () => void;
  onCreateRule: (newRule: AutomationRule) => void;
  onRunSingleRule?: (rule: AutomationRule) => void;
  userRole: UserRole;
  userFullName: string;
}

export function WorkflowAutomationsView({
  rules,
  logs,
  onToggleRule,
  onRunEngine,
  onCreateRule,
  onRunSingleRule,
  userRole,
  userFullName,
}: WorkflowAutomationsViewProps) {
  const [activeTab, setActiveTab] = useState<'RULES' | 'LOGS'>('RULES');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AutomationExecutionLog | null>(null);
  const [logFilter, setLogFilter] = useState<'ALL' | 'SUCCESS' | 'WARNING' | 'SKIPPED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Form State for New Rule
  const [ruleName, setRuleName] = useState('');
  const [ruleDesc, setRuleDesc] = useState('');
  const [ruleTrigger, setRuleTrigger] = useState<AutomationTrigger>('STOCK_BELOW_REORDER');
  const [conditionField, setConditionField] = useState('quantityOnHand');
  const [conditionOp, setConditionOp] = useState<'EQUALS' | 'LESS_EQUAL' | 'GREATER_THAN'>('LESS_EQUAL');
  const [conditionVal, setConditionVal] = useState('reorderLevel');
  const [ruleAction, setRuleAction] = useState<AutomationActionType>('IN_APP_NOTIFICATION');
  const [targetRole, setTargetRole] = useState<UserRole | 'ALL'>('ALL');

  const handleManualScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      onRunEngine();
      setIsScanning(false);
    }, 600);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) return;

    const newRule: AutomationRule = {
      id: `rule_custom_${Date.now().toString(36)}`,
      name: ruleName,
      description: ruleDesc || 'Custom automation rule created by ' + userFullName,
      trigger: ruleTrigger,
      triggerLabel: `${ruleTrigger.replace(/_/g, ' ')} (${conditionField} ${conditionOp} ${conditionVal})`,
      conditions: [
        {
          field: conditionField,
          operator: conditionOp,
          value: conditionVal,
        },
      ],
      actionType: ruleAction,
      actionLabel: `${ruleAction.replace(/_/g, ' ')} -> ${targetRole}`,
      targetRole,
      isActive: true,
      executionCount: 0,
      lastExecutedAt: undefined,
    };

    onCreateRule(newRule);
    setIsCreateModalOpen(false);
    setRuleName('');
    setRuleDesc('');
  };

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = logFilter === 'ALL' || log.status === logFilter;
    const matchesSearch =
      log.ruleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actionSummary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const activeRulesCount = rules.filter((r) => r.isActive).length;
  const totalExecutions = rules.reduce((sum, r) => sum + r.executionCount, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Global Action Trigger */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#D8E2EC] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-[#E03616]" />
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A] sm:text-2xl">
              Event-Driven Workflow Automation
            </h1>
            <Badge variant="bloodOrange" className="text-[10px]">
              ENGINE ACTIVE
            </Badge>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Trigger-condition-action workflow engine continuously orchestrating inventory replenishment, debt escalation, and executive gatekeeping.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-1.5 text-xs text-[#1B2436] border-[#D8E2EC] hover:bg-[#F0F4F8]"
          >
            <Plus size={14} className="text-[#E03616]" />
            <span>Create Rule</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleManualScan}
            disabled={isScanning}
            className="flex items-center space-x-1.5 text-xs bg-[#1B2436] text-white hover:bg-[#243048]"
          >
            <RefreshCw size={13} className={`text-[#E03616] ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Evaluating Rules...' : 'Run All Rules Now'}</span>
          </Button>
        </div>
      </div>

      {/* Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Rules</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{activeRulesCount}</span>
            <span className="text-xs text-slate-500">of {rules.length} total</span>
          </div>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Rule Executions</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{totalExecutions}</span>
            <span className="text-xs text-[#10B981] font-semibold">Live Event Bus</span>
          </div>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Execution Logs Captured</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{logs.length}</span>
            <span className="text-xs text-slate-500">events logged</span>
          </div>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Engine Status</div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-[#10B981] font-bold">
            <CheckCircle2 size={16} />
            <span>CRON RUNNER READY</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#D8E2EC]">
        <button
          onClick={() => setActiveTab('RULES')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
            activeTab === 'RULES'
              ? 'border-[#E03616] text-[#0F172A]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Active Automation Rules ({rules.length})
        </button>
        <button
          onClick={() => setActiveTab('LOGS')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
            activeTab === 'LOGS'
              ? 'border-[#E03616] text-[#0F172A]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Execution History & Logs ({logs.length})
        </button>
      </div>

      {/* TAB 1: RULES GRID */}
      {activeTab === 'RULES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rules.map((rule) => {
            return (
              <div
                key={rule.id}
                className={`rounded-xl border p-5 bg-white shadow-xs transition-all flex flex-col justify-between ${
                  rule.isActive ? 'border-[#D8E2EC]' : 'border-[#E2E8F0] opacity-60 bg-[#FAFAFA]'
                }`}
              >
                <div>
                  {/* Top Bar: Trigger Badge & Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 rounded bg-[#F0F4F8] px-2 py-0.5 text-[10px] font-mono font-bold text-[#1B2436] border border-[#D8E2EC]">
                      <Zap size={11} className="text-[#E03616]" />
                      {rule.trigger}
                    </span>

                    {/* Active Toggle Switch */}
                    <button
                      onClick={() => onToggleRule(rule.id)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        rule.isActive ? 'bg-[#1B2436]' : 'bg-slate-300'
                      }`}
                      title={rule.isActive ? 'Click to Pause Rule' : 'Click to Activate Rule'}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          rule.isActive ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Title & Description */}
                  <h3 className="mt-3 text-sm font-bold text-[#0F172A]">
                    {rule.name}
                  </h3>
                  <p className="mt-1 text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                    {rule.description}
                  </p>

                  {/* Trigger Condition Pill */}
                  <div className="mt-3.5 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Condition Logic
                    </div>
                    <div className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-2 font-mono text-[11px] text-slate-700">
                      {rule.triggerLabel}
                    </div>

                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2">
                      Target Action & Role
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded bg-orange-50 px-2 py-0.5 text-[10px] font-medium text-orange-800 border border-orange-200">
                        {rule.actionType === 'DRAFT_PURCHASE_REQUISITION' && <FileText size={10} />}
                        {rule.actionType === 'IN_APP_NOTIFICATION' && <Bell size={10} />}
                        {rule.actionType === 'EMAIL_DISPATCH' && <Mail size={10} />}
                        {rule.actionType === 'ESCALATE_TO_EXECUTIVE' && <Shield size={10} />}
                        {rule.actionType === 'FLAG_HIGH_PRIORITY_TASK' && <AlertTriangle size={10} />}
                        {rule.actionType}
                      </span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-600">
                        → {rule.targetRole}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Metadata & Run Button */}
                <div className="mt-5 pt-3 border-t border-[#E8EEF5] flex items-center justify-between text-xs text-[#64748B]">
                  <div className="text-[10px] font-mono">
                    <span>Executions: <strong>{rule.executionCount}</strong></span>
                    {rule.lastExecutedAt && (
                      <div className="text-slate-400 mt-0.5">Last: {rule.lastExecutedAt.slice(11, 16)}</div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRunSingleRule ? onRunSingleRule(rule) : onRunEngine()}
                    className="text-xs text-[#1B2436] hover:bg-[#F0F4F8] flex items-center gap-1 px-2 py-1"
                  >
                    <Play size={11} className="text-[#E03616]" />
                    <span>Test Trigger</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: EXECUTION LOGS TABLE */}
      {activeTab === 'LOGS' && (
        <div className="rounded-xl border border-[#D8E2EC] bg-white shadow-xs overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 border-b border-[#D8E2EC] bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search log entries, triggers, outputs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#D8E2EC] rounded-md text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1B2436]"
              />
            </div>

            <div className="flex items-center space-x-1.5 text-xs w-full sm:w-auto">
              {(['ALL', 'SUCCESS', 'WARNING', 'SKIPPED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setLogFilter(st)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                    logFilter === st
                      ? 'bg-[#1B2436] text-white'
                      : 'bg-white border border-[#D8E2EC] text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#D8E2EC] text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-[#F8FAFC]">
                <tr>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Rule / Event</th>
                  <th className="py-2.5 px-4">Trigger Evaluated</th>
                  <th className="py-2.5 px-4">Execution Summary</th>
                  <th className="py-2.5 px-4">Triggered By</th>
                  <th className="py-2.5 px-4 text-right">Timestamp</th>
                  <th className="py-2.5 px-4 text-center">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EEF5]">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      No automation logs matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-2.5 px-4">
                        <Badge
                          variant={
                            log.status === 'SUCCESS'
                              ? 'success'
                              : log.status === 'WARNING'
                              ? 'warning'
                              : log.status === 'SKIPPED'
                              ? 'neutral'
                              : 'danger'
                          }
                          className="text-[10px]"
                        >
                          {log.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">
                        {log.ruleName}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-[#1B2436]">
                        {log.trigger}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 max-w-xs truncate" title={log.details}>
                        {log.actionSummary}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                        {log.executedBy}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-500 text-right text-[11px]">
                        {log.executedAt}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="View Execution Details"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE NEW RULE MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Automation Rule"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Rule Name</label>
            <input
              type="text"
              required
              placeholder="e.g. VIP Client High-Balance Warning"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              className="mt-1 w-full rounded-md border border-[#D8E2EC] px-3 py-2 text-xs focus:outline-none focus:border-[#1B2436]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Description</label>
            <textarea
              rows={2}
              placeholder="Brief explanation of when this rule fires and what action it takes..."
              value={ruleDesc}
              onChange={(e) => setRuleDesc(e.target.value)}
              className="mt-1 w-full rounded-md border border-[#D8E2EC] px-3 py-2 text-xs focus:outline-none focus:border-[#1B2436]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Trigger Event</label>
              <select
                value={ruleTrigger}
                onChange={(e) => setRuleTrigger(e.target.value as AutomationTrigger)}
                className="mt-1 w-full rounded-md border border-[#D8E2EC] px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-[#1B2436]"
              >
                <option value="STOCK_BELOW_REORDER">Inventory Stock &lt;= Reorder Level</option>
                <option value="INVOICE_OVERDUE_15D">Invoice Overdue &gt; 15 Days</option>
                <option value="DEAL_MOVED_NEGOTIATION">Deal Moves to Negotiation</option>
                <option value="PO_AWAITING_APPROVAL">PO Total &gt; KES 250,000</option>
                <option value="ETIMS_TRANSMISSION_FAILED">eTIMS Queue Transmission Failed</option>
                <option value="PAYROLL_PENDING_APPROVAL">Payroll Run in Draft Status</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Action Type</label>
              <select
                value={ruleAction}
                onChange={(e) => setRuleAction(e.target.value as AutomationActionType)}
                className="mt-1 w-full rounded-md border border-[#D8E2EC] px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-[#1B2436]"
              >
                <option value="IN_APP_NOTIFICATION">In-App Banner Notification</option>
                <option value="EMAIL_DISPATCH">Email Notification Dispatch</option>
                <option value="DRAFT_PURCHASE_REQUISITION">Auto-Draft Purchase Requisition</option>
                <option value="FLAG_HIGH_PRIORITY_TASK">Create Priority Follow-up Task</option>
                <option value="ESCALATE_TO_EXECUTIVE">Escalate to Executive Team</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Target Role</label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value as UserRole | 'ALL')}
              className="mt-1 w-full rounded-md border border-[#D8E2EC] px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-[#1B2436]"
            >
              <option value="ALL">All Authorized Users</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN (CEO / Director)</option>
              <option value="FINANCE_MANAGER">FINANCE_MANAGER</option>
              <option value="PROCUREMENT_OFFICER">PROCUREMENT_OFFICER</option>
              <option value="SALES_MANAGER">SALES_MANAGER</option>
              <option value="HR_MANAGER">HR_MANAGER</option>
              <option value="EXECUTIVE">EXECUTIVE</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-[#E8EEF5]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="bg-[#1B2436] text-white">
              Save & Activate Rule
            </Button>
          </div>
        </form>
      </Modal>

      {/* INSPECT LOG MODAL */}
      {selectedLog && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedLog(null)}
          title={`Execution Details: ${selectedLog.ruleName}`}
        >
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8EEF5]">
              <span className="font-semibold text-slate-500">Status</span>
              <Badge
                variant={
                  selectedLog.status === 'SUCCESS'
                    ? 'success'
                    : selectedLog.status === 'WARNING'
                    ? 'warning'
                    : 'neutral'
                }
              >
                {selectedLog.status}
              </Badge>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-[#E8EEF5]">
              <span className="font-semibold text-slate-500">Trigger Evaluated</span>
              <span className="font-mono font-bold text-slate-900">{selectedLog.trigger}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-[#E8EEF5]">
              <span className="font-semibold text-slate-500">Execution Time</span>
              <span className="font-mono text-slate-800">{selectedLog.executedAt}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-[#E8EEF5]">
              <span className="font-semibold text-slate-500">Initiator</span>
              <span className="text-slate-800">{selectedLog.executedBy}</span>
            </div>

            <div className="space-y-1 pt-1">
              <span className="font-semibold text-slate-700">Detailed Findings</span>
              <div className="rounded-md border border-[#D8E2EC] bg-[#F8FAFC] p-3 text-slate-800 leading-relaxed font-sans">
                {selectedLog.details}
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <span className="font-semibold text-slate-700">Action Dispatched</span>
              <div className="rounded-md border border-orange-200 bg-orange-50/50 p-2.5 text-orange-950 font-medium">
                {selectedLog.actionSummary}
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedLog(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
