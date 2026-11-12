import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  Building2,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TaskRecord, CustomerRecord, DealRecord, SalesRepRecord } from '@/types';
import { CreateTaskModal } from '@/components/crm/CreateTaskModal';

interface TasksManagerViewProps {
  tasks: TaskRecord[];
  customers: CustomerRecord[];
  deals: DealRecord[];
  salesReps: SalesRepRecord[];
  onCreateTask: (task: TaskRecord) => void;
  onToggleTaskStatus: (taskId: string) => void;
  onSelectCustomer?: (customer: CustomerRecord) => void;
}

export function TasksManagerView({
  tasks,
  customers,
  deals,
  salesReps,
  onCreateTask,
  onToggleTaskStatus,
  onSelectCustomer,
}: TasksManagerViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.customerName && t.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.assignedToName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const pendingCount = tasks.filter((t) => t.status !== 'COMPLETED').length;
  const overdueCount = tasks.filter(
    (t) => t.status !== 'COMPLETED' && t.dueDate < todayStr
  ).length;

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3 rounded-xl border border-[#D8E2EC] shadow-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search tasks, customers, instructions, or assignees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] pl-9 pr-3 py-1.5 text-xs text-[#0F172A] placeholder-[#64748B] focus:border-[#E03616] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent Only</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap"
          >
            <Plus size={14} /> Add Task
          </Button>
        </div>
      </div>

      {/* KPI & Status Filter Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#F8FAFC] p-3 rounded-xl border border-[#D8E2EC]">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5">
          {(['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#1B2436] text-white shadow-xs'
                  : 'text-[#54657E] hover:bg-[#E8EEF5]'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Counter Summary */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-[#54657E]">
            Pending: <strong className="text-[#0F172A]">{pendingCount}</strong>
          </span>
          {overdueCount > 0 && (
            <span className="text-[#E03616] font-bold flex items-center gap-1 bg-red-100/70 px-2 py-0.5 rounded">
              <AlertCircle size={12} /> {overdueCount} Overdue
            </span>
          )}
        </div>
      </div>

      {/* Tasks List */}
      <div className="rounded-xl border border-[#D8E2EC] bg-white overflow-hidden shadow-xs divide-y divide-[#D8E2EC]">
        {filteredTasks.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#64748B]">
            No action tasks found matching your filters.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'COMPLETED';
            const isOverdue = !isCompleted && task.dueDate < todayStr;

            return (
              <div
                key={task.id}
                className={`p-4 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCompleted ? 'bg-[#F8FAFC] opacity-75' : 'hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Complete Checkbox */}
                  <button
                    type="button"
                    onClick={() => onToggleTaskStatus(task.id)}
                    className={`mt-0.5 h-5 w-5 rounded border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-[#CAD6E2] hover:border-[#E03616] bg-white'
                    }`}
                    title={isCompleted ? 'Mark Pending' : 'Mark Completed'}
                  >
                    {isCompleted && <CheckCircle2 size={13} />}
                  </button>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-bold ${
                          isCompleted
                            ? 'line-through text-[#64748B]'
                            : 'text-[#0F172A]'
                        }`}
                      >
                        {task.title}
                      </span>

                      {/* Priority Badge */}
                      <Badge
                        variant={
                          task.priority === 'URGENT'
                            ? 'bloodOrange'
                            : task.priority === 'HIGH'
                            ? 'slateBlue'
                            : 'frost'
                        }
                        className="text-[9px] py-0 font-bold"
                      >
                        {task.priority}
                      </Badge>

                      {isOverdue && (
                        <span className="text-[10px] font-bold text-[#E03616] bg-red-50 border border-red-200 px-1.5 py-0.2 rounded font-mono">
                          OVERDUE
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-[#54657E] line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-[#64748B] pt-0.5 flex-wrap">
                      {task.customerName && (
                        <span
                          onClick={() => {
                            const c = customers.find((cust) => cust.id === task.customerId);
                            if (c && onSelectCustomer) onSelectCustomer(c);
                          }}
                          className="flex items-center gap-1 font-semibold text-[#1B2436] hover:text-[#E03616] cursor-pointer"
                        >
                          <Building2 size={11} /> {task.customerName}
                        </span>
                      )}

                      {task.dealTitle && (
                        <span className="flex items-center gap-1 text-[#54657E]">
                          <Briefcase size={11} /> {task.dealTitle}
                        </span>
                      )}

                      <span className="flex items-center gap-1">
                        <User size={11} /> {task.assignedToName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Due Date & Action */}
                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-[#64748B] block">Due Date</span>
                    <span
                      className={`font-mono text-xs font-semibold ${
                        isOverdue ? 'text-[#E03616] font-bold' : 'text-[#0F172A]'
                      }`}
                    >
                      {task.dueDate}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleTaskStatus(task.id)}
                    className="px-2.5 py-1 rounded text-xs border border-[#D8E2EC] hover:bg-[#E8EEF5] text-[#1B2436] cursor-pointer transition-colors"
                  >
                    {isCompleted ? 'Reopen' : 'Done'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTask={onCreateTask}
        customers={customers}
        deals={deals}
        salesReps={salesReps}
      />
    </div>
  );
}
