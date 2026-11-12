import {
  CustomerRecord,
  CustomerContact,
  DealRecord,
  TaskRecord,
  SalesRepRecord,
  ActivityLogRecord,
} from '@/types';
import {
  SEED_CUSTOMERS,
  SEED_CONTACTS,
  SEED_DEALS,
  SEED_TASKS,
  SEED_SALES_REPS,
  SEED_ACTIVITY_LOGS,
} from '@/data/crmSeed';

const STORAGE_KEY = 'innowit_crm_v3';

export interface CrmState {
  customers: CustomerRecord[];
  contacts: CustomerContact[];
  deals: DealRecord[];
  tasks: TaskRecord[];
  salesReps: SalesRepRecord[];
  activityLogs: ActivityLogRecord[];
}

export function loadCrmState(): CrmState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.customers && parsed.deals && parsed.tasks) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load CRM state from localStorage:', err);
  }

  return {
    customers: SEED_CUSTOMERS,
    contacts: SEED_CONTACTS,
    deals: SEED_DEALS,
    tasks: SEED_TASKS,
    salesReps: SEED_SALES_REPS,
    activityLogs: SEED_ACTIVITY_LOGS,
  };
}

export function saveCrmState(state: CrmState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to save CRM state to localStorage:', err);
  }
}
