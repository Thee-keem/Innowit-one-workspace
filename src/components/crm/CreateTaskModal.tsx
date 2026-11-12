import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TaskRecord, CustomerRecord, DealRecord, SalesRepRecord } from '@/types';
import { CheckSquare, Calendar, Flag, User, Building2, Briefcase } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (task: TaskRecord) => void;
  customers: CustomerRecord[];
  deals: DealRecord[];
  salesReps: SalesRepRecord[];
  initialCustomer?: CustomerRecord | null;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  onCreateTask,
  customers,
  deals,
  salesReps,
  initialCustomer,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskRecord['priority']>('HIGH');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().slice(0, 10);
  });
  const [assignedToId, setAssignedToId] = useState(salesReps[0]?.id || '');
  const [customerId, setCustomerId] = useState(initialCustomer?.id || '');
  const [dealId, setDealId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedRep = salesReps.find((r) => r.id === assignedToId) || salesReps[0];
    const selectedCust = customers.find((c) => c.id === customerId);
    const selectedDeal = deals.find((d) => d.id === dealId);

    const newTask: TaskRecord = {
      id: `task_${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      status: 'PENDING',
      dueDate,
      assignedToId: selectedRep.id,
      assignedToName: selectedRep.name,
      customerId: selectedCust?.id,
      customerName: selectedCust?.name,
      dealId: selectedDeal?.id,
      dealTitle: selectedDeal?.title,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    onCreateTask(newTask);
    onClose();

    // Reset
    setTitle('');
    setDescription('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Commercial Action Task"
      description="Schedule cross-departmental follow-up, quotation dispatch, or client milestone."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1">
            Task Title <span className="text-[#E03616]">*</span>
          </label>
          <input
            required
            type="text"
            placeholder="e.g. Follow up on Twiga Cold-Chain Pilot SLA"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1">
            Task Description / Instructions
          </label>
          <textarea
            rows={2}
            placeholder="Key talking points, deliverables, or executive notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Priority Level
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskRecord['priority'])}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            >
              <option value="URGENT">Urgent (Immediate)</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] font-mono focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1">
            Assign To Sales Rep
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Related Customer (Optional)
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            >
              <option value="">None / General Task</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Related Deal (Optional)
            </label>
            <select
              value={dealId}
              onChange={(e) => setDealId(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            >
              <option value="">None / General Deal</option>
              {deals.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D8E2EC]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
