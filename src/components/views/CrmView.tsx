import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  Briefcase,
  CheckSquare,
  Building2,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import {
  UserRole,
  CustomerRecord,
  CustomerContact,
  DealRecord,
  TaskRecord,
  SalesRepRecord,
  ActivityLogRecord,
  DealStage,
} from '@/types';
import { loadCrmState, saveCrmState, CrmState } from '@/modules/crm/store';

import { CrmDashboardView } from '@/components/crm/CrmDashboardView';
import { CustomersDirectoryView } from '@/components/crm/CustomersDirectoryView';
import { DealsKanbanView } from '@/components/crm/DealsKanbanView';
import { TasksManagerView } from '@/components/crm/TasksManagerView';

interface CrmViewProps {
  userFullName: string;
  userRole: UserRole;
  currentPath?: string;
  onNavigate?: (path: string) => void;
  // External customers pass-through if synced with root kernel
  onSyncCustomers?: (customers: CustomerRecord[]) => void;
}

type CrmSubTab = 'dashboard' | 'customers' | 'deals' | 'tasks';

export function CrmView({
  userFullName,
  userRole,
  currentPath = '/crm/dashboard',
  onNavigate,
  onSyncCustomers,
}: CrmViewProps) {
  // Load persisted state
  const [crmState, setCrmState] = useState<CrmState>(() => loadCrmState());

  // Determine active tab from URL path
  const getTabFromPath = (path: string): CrmSubTab => {
    if (path.includes('/customers')) return 'customers';
    if (path.includes('/deals')) return 'deals';
    if (path.includes('/tasks')) return 'tasks';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState<CrmSubTab>(() => getTabFromPath(currentPath));
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  useEffect(() => {
    setActiveTab(getTabFromPath(currentPath));
  }, [currentPath]);

  // Tab change handler
  const handleTabChange = (tab: CrmSubTab) => {
    setActiveTab(tab);
    if (onNavigate) {
      if (tab === 'dashboard') onNavigate('/crm/dashboard');
      if (tab === 'customers') onNavigate('/crm/customers');
      if (tab === 'deals') onNavigate('/crm/deals');
      if (tab === 'tasks') onNavigate('/crm/tasks');
    }
  };

  // State mutation helper with persistence
  const updateStateAndPersist = (updater: (prev: CrmState) => CrmState) => {
    setCrmState((prev) => {
      const updated = updater(prev);
      saveCrmState(updated);
      if (onSyncCustomers) onSyncCustomers(updated.customers);
      return updated;
    });
  };

  // 1. Add Customer
  const handleCreateCustomer = (newCust: CustomerRecord) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newActivity: ActivityLogRecord = {
      id: `act_${Date.now()}`,
      entityType: 'CUSTOMER',
      entityId: newCust.id,
      entityName: newCust.name,
      title: 'Customer Account Created',
      description: `Registered ${newCust.name} (PIN: ${newCust.kraPin}) with credit limit of KES ${(newCust.creditLimitKes || 0).toLocaleString()}.`,
      user: userFullName,
      timestamp,
      type: 'STAGE_CHANGE',
    };

    updateStateAndPersist((prev) => ({
      ...prev,
      customers: [newCust, ...prev.customers],
      activityLogs: [newActivity, ...prev.activityLogs],
    }));
  };

  // 2. Add Contact to Customer
  const handleAddContact = (newContact: CustomerContact) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      contacts: [...prev.contacts, newContact],
    }));
  };

  // 3. Create Deal
  const handleCreateDeal = (newDeal: DealRecord) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newActivity: ActivityLogRecord = {
      id: `act_${Date.now()}`,
      entityType: 'DEAL',
      entityId: newDeal.id,
      entityName: newDeal.title,
      title: 'New Deal Added to Pipeline',
      description: `Created opportunity "${newDeal.title}" for ${newDeal.customerName} valued at KES ${newDeal.value.toLocaleString()}.`,
      user: userFullName,
      timestamp,
      type: 'STAGE_CHANGE',
    };

    updateStateAndPersist((prev) => ({
      ...prev,
      deals: [newDeal, ...prev.deals],
      activityLogs: [newActivity, ...prev.activityLogs],
    }));
  };

  // 4. Update Deal Stage (including Won / Lost outcomes)
  const handleUpdateDealStage = (
    dealId: string,
    newStage: DealStage,
    lostReason?: string,
    lostNotes?: string,
    generateQuotation?: boolean
  ) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);

    updateStateAndPersist((prev) => {
      let movedDealTitle = '';
      let movedCustomerName = '';
      let dealVal = 0;

      const updatedDeals = prev.deals.map((d) => {
        if (d.id !== dealId) return d;
        movedDealTitle = d.title;
        movedCustomerName = d.customerName;
        dealVal = d.value;

        let prob = d.winProbability;
        if (newStage === 'NEW_LEAD') prob = 20;
        if (newStage === 'CONTACTED') prob = 40;
        if (newStage === 'QUALIFIED') prob = 60;
        if (newStage === 'PROPOSAL') prob = 75;
        if (newStage === 'NEGOTIATION') prob = 90;
        if (newStage === 'CLOSED_WON') prob = 100;
        if (newStage === 'CLOSED_LOST') prob = 0;

        return {
          ...d,
          stage: newStage,
          winProbability: prob,
          lostReason: newStage === 'CLOSED_LOST' ? lostReason : undefined,
          lostNotes: newStage === 'CLOSED_LOST' ? lostNotes : undefined,
          wonQuotationNumber:
            newStage === 'CLOSED_WON' && generateQuotation
              ? `QUO-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`
              : d.wonQuotationNumber,
          updatedAt: timestamp.slice(0, 10),
        };
      });

      // Update Sales Rep stats if closed won
      let updatedReps = [...prev.salesReps];
      if (newStage === 'CLOSED_WON') {
        const targetDeal = prev.deals.find((d) => d.id === dealId);
        if (targetDeal) {
          updatedReps = updatedReps.map((r) =>
            r.id === targetDeal.assignedToId
              ? { ...r, achievedRevenueKes: r.achievedRevenueKes + targetDeal.value }
              : r
          );
        }
      }

      // Add to Activity Log
      const activity: ActivityLogRecord = {
        id: `act_${Date.now()}`,
        entityType: 'DEAL',
        entityId: dealId,
        entityName: movedDealTitle,
        title: `Deal Stage Updated to ${newStage.replace('_', ' ')}`,
        description:
          newStage === 'CLOSED_LOST'
            ? `Deal closed lost for ${movedCustomerName}. Reason: ${lostReason}.`
            : newStage === 'CLOSED_WON'
            ? `Deal WON! KES ${dealVal.toLocaleString()} added to realized sales revenue.`
            : `Opportunity advanced to ${newStage.replace('_', ' ')}.`,
        user: userFullName,
        timestamp,
        type: 'STAGE_CHANGE',
      };

      return {
        ...prev,
        deals: updatedDeals,
        salesReps: updatedReps,
        activityLogs: [activity, ...prev.activityLogs],
      };
    });
  };

  // 5. Create Task
  const handleCreateTask = (newTask: TaskRecord) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const activity: ActivityLogRecord = {
      id: `act_${Date.now()}`,
      entityType: 'TASK',
      entityId: newTask.id,
      entityName: newTask.title,
      title: 'Action Task Scheduled',
      description: `Task "${newTask.title}" assigned to ${newTask.assignedToName} (Due: ${newTask.dueDate}).`,
      user: userFullName,
      timestamp,
      type: 'NOTE',
    };

    updateStateAndPersist((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
      activityLogs: [activity, ...prev.activityLogs],
    }));
  };

  // 6. Toggle Task Status
  const handleToggleTaskStatus = (taskId: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);

    updateStateAndPersist((prev) => {
      const updatedTasks = prev.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const nextStatus = t.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
        return {
          ...t,
          status: nextStatus as TaskRecord['status'],
          completedAt: nextStatus === 'COMPLETED' ? timestamp : undefined,
        };
      });

      return { ...prev, tasks: updatedTasks };
    });
  };

  return (
    <div className="space-y-5">
      {/* Top CRM Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D8E2EC] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2.5">
              <Users className="text-[#E03616]" size={22} />
              CRM & Sales Pipeline Management
            </h1>
            <Badge variant="slateBlue">Phase 3 Complete</Badge>
          </div>
          <p className="mt-0.5 text-xs text-[#54657E]">
            Customer directory with KRA compliance, 6-stage Kanban deals pipeline, cross-entity tasks, and executive performance metrics.
          </p>
        </div>

        {/* Quick Nav Status */}
        <div className="flex items-center gap-2 font-mono text-xs text-[#54657E]">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Local Storage V3: Synchronized</span>
        </div>
      </div>

      {/* Primary Sub-Tabs Navigation (Dashboard, Customers, Deals, Tasks) */}
      <div className="flex items-center justify-between border-b border-[#D8E2EC] bg-white px-2 py-1.5 rounded-xl shadow-xs">
        <div className="flex items-center space-x-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => handleTabChange('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-[#1B2436] text-white shadow-xs'
                : 'text-[#54657E] hover:text-[#0F172A] hover:bg-[#F0F4F8]'
            }`}
          >
            <BarChart3 size={14} className={activeTab === 'dashboard' ? 'text-[#E03616]' : ''} />
            <span>CRM Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('customers')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'customers'
                ? 'bg-[#1B2436] text-white shadow-xs'
                : 'text-[#54657E] hover:text-[#0F172A] hover:bg-[#F0F4F8]'
            }`}
          >
            <Users size={14} className={activeTab === 'customers' ? 'text-[#E03616]' : ''} />
            <span>Customer Accounts</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'customers'
                  ? 'bg-[#27334D] text-white'
                  : 'bg-[#E8EEF5] text-[#1B2436]'
              }`}
            >
              {crmState.customers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('deals')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'deals'
                ? 'bg-[#1B2436] text-white shadow-xs'
                : 'text-[#54657E] hover:text-[#0F172A] hover:bg-[#F0F4F8]'
            }`}
          >
            <Briefcase size={14} className={activeTab === 'deals' ? 'text-[#E03616]' : ''} />
            <span>6-Stage Deals Kanban</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'deals'
                  ? 'bg-[#27334D] text-white'
                  : 'bg-[#E8EEF5] text-[#1B2436]'
              }`}
            >
              {crmState.deals.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('tasks')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'tasks'
                ? 'bg-[#1B2436] text-white shadow-xs'
                : 'text-[#54657E] hover:text-[#0F172A] hover:bg-[#F0F4F8]'
            }`}
          >
            <CheckSquare size={14} className={activeTab === 'tasks' ? 'text-[#E03616]' : ''} />
            <span>Tasks & Activities</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'tasks'
                  ? 'bg-[#27334D] text-white'
                  : 'bg-[#E8EEF5] text-[#1B2436]'
              }`}
            >
              {crmState.tasks.length}
            </span>
          </button>
        </div>
      </div>

      {/* Render Active Sub-View */}
      {activeTab === 'dashboard' && (
        <CrmDashboardView
          customers={crmState.customers}
          deals={crmState.deals}
          tasks={crmState.tasks}
          salesReps={crmState.salesReps}
          activities={crmState.activityLogs}
          onNavigateTab={handleTabChange}
          onSelectCustomer={(c) => {
            setSelectedCustomer(c);
            handleTabChange('customers');
          }}
        />
      )}

      {activeTab === 'customers' && (
        <CustomersDirectoryView
          customers={crmState.customers}
          contacts={crmState.contacts}
          deals={crmState.deals}
          tasks={crmState.tasks}
          activities={crmState.activityLogs}
          salesReps={crmState.salesReps}
          onCreateCustomer={handleCreateCustomer}
          onAddContact={handleAddContact}
          onCreateDeal={handleCreateDeal}
          onCreateTask={handleCreateTask}
          selectedCustomer={selectedCustomer}
          onSelectCustomer={setSelectedCustomer}
        />
      )}

      {activeTab === 'deals' && (
        <DealsKanbanView
          deals={crmState.deals}
          customers={crmState.customers}
          salesReps={crmState.salesReps}
          onCreateDeal={handleCreateDeal}
          onUpdateDealStage={handleUpdateDealStage}
          onSelectCustomer={(c) => {
            setSelectedCustomer(c);
            handleTabChange('customers');
          }}
        />
      )}

      {activeTab === 'tasks' && (
        <TasksManagerView
          tasks={crmState.tasks}
          customers={crmState.customers}
          deals={crmState.deals}
          salesReps={crmState.salesReps}
          onCreateTask={handleCreateTask}
          onToggleTaskStatus={handleToggleTaskStatus}
          onSelectCustomer={(c) => {
            setSelectedCustomer(c);
            handleTabChange('customers');
          }}
        />
      )}
    </div>
  );
}
