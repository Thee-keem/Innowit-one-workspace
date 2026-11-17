import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Search,
  FileText,
  Users,
  Package,
  CheckSquare,
  Shield,
  Layers,
  ArrowRight,
  Sparkles,
  BarChart3,
  Briefcase,
  ShoppingCart,
  RotateCcw,
  FileCheck,
  Zap,
  TrendingUp,
  CreditCard,
  UserCheck,
  Building2,
  Calendar,
  DollarSign,
  Command,
} from 'lucide-react';
import {
  CustomerRecord,
  InvoiceRecord,
  ProductRecord,
  EmployeeRecord,
  DealRecord,
} from '@/types';
import { formatKES } from '@/lib/utils';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onOpenRoleSwitcher: () => void;
  customers?: CustomerRecord[];
  invoices?: InvoiceRecord[];
  products?: ProductRecord[];
  employees?: EmployeeRecord[];
  deals?: DealRecord[];
  onTriggerAutomations?: () => void;
}

export type SearchCategory =
  | 'ALL'
  | 'ACTIONS'
  | 'NAVIGATION'
  | 'INVOICES'
  | 'CUSTOMERS'
  | 'PRODUCTS'
  | 'DEALS'
  | 'EMPLOYEES';

interface SearchResultItem {
  id: string;
  label: string;
  sublabel?: string;
  badge?: string;
  category: SearchCategory;
  icon: React.ElementType;
  keywords: string;
  action: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onOpenRoleSwitcher,
  customers = [],
  invoices = [],
  products = [],
  employees = [],
  deals = [],
  onTriggerAutomations,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('ALL');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard navigation & global shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Construct comprehensive search index
  const searchIndex: SearchResultItem[] = useMemo(() => {
    const items: SearchResultItem[] = [
      // Quick Actions
      {
        id: 'action_switch_role',
        label: 'Switch Active User Role (12 RBAC)',
        sublabel: 'Simulate Super Admin, Accountant, Sales Rep, Executive...',
        badge: 'ACTION',
        category: 'ACTIONS',
        icon: Users,
        keywords: 'switch role rbac permission admin user impersonate access',
        action: () => {
          onClose();
          onOpenRoleSwitcher();
        },
      },
      {
        id: 'action_create_invoice',
        label: 'Create New Sales Invoice',
        sublabel: 'Standard 16% VAT or exempt items, eTIMS queuing',
        badge: 'ACTION',
        category: 'ACTIONS',
        icon: CreditCard,
        keywords: 'new invoice create sales billing debtor etims kra post ledger',
        action: () => {
          onClose();
          onNavigate('/accounting/invoices');
        },
      },
      {
        id: 'action_run_automations',
        label: 'Scan & Run Automation Event Bus',
        sublabel: 'Evaluate stock thresholds, overdue debt, and high-value approvals',
        badge: 'AUTOMATION',
        category: 'ACTIONS',
        icon: Zap,
        keywords: 'run automations sweep rules stock low overdue alerts cron event bus',
        action: () => {
          onClose();
          if (onTriggerAutomations) onTriggerAutomations();
          onNavigate('/bi/automations');
        },
      },
      {
        id: 'action_exec_bi',
        label: 'View Executive BI Analytics Dashboard',
        sublabel: 'Cash runway, working capital, operating margins, EBITDA',
        badge: 'BI',
        category: 'ACTIONS',
        icon: BarChart3,
        keywords: 'executive bi dashboard analytics runway working capital profit margins ebitda',
        action: () => {
          onClose();
          onNavigate('/bi/executive');
        },
      },
      {
        id: 'action_audit_trail',
        label: 'Inspect System Audit Trail',
        sublabel: 'Immutable log of GL postings, state diffs, and compliance events',
        badge: 'AUDIT',
        category: 'ACTIONS',
        icon: Shield,
        keywords: 'audit log trail history changes state diff immutable compliance',
        action: () => {
          onClose();
          onNavigate('/system/audit-logs');
        },
      },

      // Navigation Routes
      {
        id: 'nav_exec_bi',
        label: 'Executive BI Dashboard',
        sublabel: '/bi/executive · Runway, margins, operational analytics',
        category: 'NAVIGATION',
        icon: TrendingUp,
        keywords: 'executive bi analytics cash runway margins revenue leaderboard',
        action: () => {
          onClose();
          onNavigate('/bi/executive');
        },
      },
      {
        id: 'nav_automations',
        label: 'Workflow Automations Engine',
        sublabel: '/bi/automations · Trigger-condition-action rules & logs',
        category: 'NAVIGATION',
        icon: Zap,
        keywords: 'automations workflow triggers rules alerts logs cron event bus',
        action: () => {
          onClose();
          onNavigate('/bi/automations');
        },
      },
      {
        id: 'nav_audit_trail',
        label: 'System Audit Trail Explorer',
        sublabel: '/system/audit-logs · Immutable ledger mutations & diffs',
        category: 'NAVIGATION',
        icon: Shield,
        keywords: 'audit logs trail history changes diff json security compliance',
        action: () => {
          onClose();
          onNavigate('/system/audit-logs');
        },
      },
      {
        id: 'nav_hardening',
        label: 'Production Hardening & Acceptance Gates',
        sublabel: '/system/hardening · 5 Mandatory Gates, eTIMS Air-Gap, Demo Reset',
        category: 'NAVIGATION',
        icon: Shield,
        keywords: 'phase 8 acceptance gates hardening test airgap seed reset demo',
        action: () => {
          onClose();
          onNavigate('/system/hardening');
        },
      },
      {
        id: 'nav_coa',
        label: 'Chart of Accounts (General Ledger)',
        sublabel: '/accounting/chart-of-accounts · Assets, liabilities, equity, P&L',
        category: 'NAVIGATION',
        icon: Layers,
        keywords: 'chart of accounts coa general ledger assets liabilities equity revenue cogs',
        action: () => {
          onClose();
          onNavigate('/accounting/chart-of-accounts');
        },
      },
      {
        id: 'nav_journal',
        label: 'Journal Entries & Fiscal Postings',
        sublabel: '/accounting/journal-entries · Double-entry atomic journals',
        category: 'NAVIGATION',
        icon: FileText,
        keywords: 'journal entries debits credits double-entry posting gl reversing entry',
        action: () => {
          onClose();
          onNavigate('/accounting/journal-entries');
        },
      },
      {
        id: 'nav_invoices',
        label: 'Sales Invoices & Accounts Receivable',
        sublabel: '/accounting/invoices · VAT invoices, payments, aging schedule',
        category: 'NAVIGATION',
        icon: CreditCard,
        keywords: 'invoices sales ar debtors payments collections aging',
        action: () => {
          onClose();
          onNavigate('/accounting/invoices');
        },
      },
      {
        id: 'nav_financial_reports',
        label: 'Financial Statements (P&L, Balance Sheet)',
        sublabel: '/accounting/reports · Real-time GAAP financial statements',
        category: 'NAVIGATION',
        icon: BarChart3,
        keywords: 'financial reports balance sheet profit loss pl income statement trial balance',
        action: () => {
          onClose();
          onNavigate('/accounting/reports');
        },
      },
      {
        id: 'nav_crm_pipeline',
        label: 'Deals Pipeline Kanban',
        sublabel: '/crm/deals · 6-stage sales pipeline & deal conversions',
        category: 'NAVIGATION',
        icon: Briefcase,
        keywords: 'deals pipeline kanban opportunities leads proposals negotiations won lost',
        action: () => {
          onClose();
          onNavigate('/crm/deals');
        },
      },
      {
        id: 'nav_customers',
        label: 'Customers Directory',
        sublabel: '/crm/customers · Client accounts, KRA PINs, credit limits',
        category: 'NAVIGATION',
        icon: Users,
        keywords: 'customers clients safaricom equity twiga debtors directory',
        action: () => {
          onClose();
          onNavigate('/crm/customers');
        },
      },
      {
        id: 'nav_inventory',
        label: 'Inventory & Multi-Warehouse Stock',
        sublabel: '/inventory/products · Catalog, stock movements, adjustments',
        category: 'NAVIGATION',
        icon: Package,
        keywords: 'inventory stock warehouse products sku reorder bins transfers adjustment',
        action: () => {
          onClose();
          onNavigate('/inventory/products');
        },
      },
      {
        id: 'nav_procurement',
        label: 'Purchase Orders & Suppliers',
        sublabel: '/procurement/purchase-orders · Requisitions, POs, GRN, bills',
        category: 'NAVIGATION',
        icon: ShoppingCart,
        keywords: 'procurement purchase orders pos suppliers grn vendor goods receipt',
        action: () => {
          onClose();
          onNavigate('/procurement/purchase-orders');
        },
      },
      {
        id: 'nav_payroll',
        label: 'HR & Kenyan Statutory Payroll',
        sublabel: '/hr/payroll · PAYE, NSSF, SHIF, Housing Levy, payslips',
        category: 'NAVIGATION',
        icon: UserCheck,
        keywords: 'hr payroll paye nssf shif nhif housing levy kra employees payslips attendance',
        action: () => {
          onClose();
          onNavigate('/hr/payroll');
        },
      },
      {
        id: 'nav_etims_setup',
        label: 'eTIMS Setup & OSCU/VSCU Config',
        sublabel: '/etims/configuration · Private keys, device serial, endpoints',
        category: 'NAVIGATION',
        icon: Shield,
        keywords: 'etims configuration setup oscu vscu kra tax pin private key sandbox',
        action: () => {
          onClose();
          onNavigate('/etims/configuration');
        },
      },
      {
        id: 'nav_etims_queue',
        label: 'eTIMS Outbox Submission Queue',
        sublabel: '/etims/queue · Real-time fiscal transmissions & KRA CU ack',
        category: 'NAVIGATION',
        icon: CheckSquare,
        keywords: 'etims queue outbox submissions receipt cu numbers retry transmission',
        action: () => {
          onClose();
          onNavigate('/etims/queue');
        },
      },
      {
        id: 'nav_etims_recon',
        label: 'eTIMS 3-Way Reconciliation Audit',
        sublabel: '/etims/reconciliation · ERP vs Outbox vs KRA Acks',
        category: 'NAVIGATION',
        icon: FileCheck,
        keywords: 'reconciliation audit 3-way erp outbox kra ack discrepancy match export',
        action: () => {
          onClose();
          onNavigate('/etims/reconciliation');
        },
      },
    ];

    // Indexed Real Invoices
    invoices.forEach((inv) => {
      items.push({
        id: `inv_${inv.id}`,
        label: `${inv.invoiceNumber} — ${inv.customerName}`,
        sublabel: `Total: ${formatKES(inv.totalAmount)} · Due: ${inv.dueDate} · Balance: ${formatKES(inv.balanceDue)}`,
        badge: inv.status,
        category: 'INVOICES',
        icon: CreditCard,
        keywords: `${inv.invoiceNumber} ${inv.customerName} ${inv.status} ${inv.totalAmount} invoice billing`,
        action: () => {
          onClose();
          onNavigate('/accounting/invoices');
        },
      });
    });

    // Indexed Real Customers
    customers.forEach((cust) => {
      items.push({
        id: `cust_${cust.id}`,
        label: `${cust.name} (${cust.customerCode})`,
        sublabel: `PIN: ${cust.kraPin} · ${cust.city} · Limit: ${formatKES(cust.creditLimitKes || 0)}`,
        badge: cust.status,
        category: 'CUSTOMERS',
        icon: Users,
        keywords: `${cust.name} ${cust.customerCode} ${cust.kraPin} ${cust.city} ${cust.email} ${cust.phone} customer`,
        action: () => {
          onClose();
          onNavigate('/crm/customers');
        },
      });
    });

    // Indexed Real Products
    products.forEach((prod) => {
      items.push({
        id: `prod_${prod.id}`,
        label: `${prod.name} (${prod.sku})`,
        sublabel: `Category: ${prod.category} · Stock: ${prod.stockOnHand} · Price: ${formatKES(prod.unitPriceKes)}`,
        badge: prod.stockOnHand <= (prod.reorderLevel || 10) ? 'LOW STOCK' : 'IN STOCK',
        category: 'PRODUCTS',
        icon: Package,
        keywords: `${prod.name} ${prod.sku} ${prod.category} stock inventory product price`,
        action: () => {
          onClose();
          onNavigate('/inventory/products');
        },
      });
    });

    // Indexed Real Deals
    deals.forEach((deal) => {
      items.push({
        id: `deal_${deal.id}`,
        label: `${deal.title} — ${deal.customerName}`,
        sublabel: `Stage: ${deal.stage} · Value: ${formatKES(deal.value)} · Rep: ${deal.assignedToName}`,
        badge: deal.stage.toUpperCase(),
        category: 'DEALS',
        icon: Briefcase,
        keywords: `${deal.title} ${deal.customerName} ${deal.stage} ${deal.assignedToName} deal pipeline`,
        action: () => {
          onClose();
          onNavigate('/crm/deals');
        },
      });
    });

    // Indexed Real Employees
    employees.forEach((emp) => {
      items.push({
        id: `emp_${emp.id}`,
        label: `${emp.fullName} (${emp.employeeCode})`,
        sublabel: `${emp.jobTitle} · ${emp.departmentName} · PIN: ${emp.kraPin}`,
        badge: emp.departmentName,
        category: 'EMPLOYEES',
        icon: UserCheck,
        keywords: `${emp.fullName} ${emp.employeeCode} ${emp.jobTitle} ${emp.departmentName} ${emp.email} employee`,
        action: () => {
          onClose();
          onNavigate('/hr/payroll');
        },
      });
    });

    return items;
  }, [invoices, customers, products, employees, deals, onClose, onNavigate, onOpenRoleSwitcher, onTriggerAutomations]);

  // Filtered Results with sub-20ms instant response
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    return searchIndex.filter((item) => {
      const matchesCategory =
        selectedCategory === 'ALL' || item.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;

      return (
        item.label.toLowerCase().includes(q) ||
        (item.sublabel && item.sublabel.toLowerCase().includes(q)) ||
        item.keywords.toLowerCase().includes(q)
      );
    });
  }, [searchIndex, query, selectedCategory]);

  // Keyboard Up/Down/Enter navigation
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredResults.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev <= 0 ? filteredResults.length - 1 : prev - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        filteredResults[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 bg-[#0F172A]/70 backdrop-blur-xs animate-in fade-in duration-100 p-3 sm:p-0">
      <div className="w-full max-w-2xl rounded-xl border border-[#2D3A52] bg-[#1B2436] shadow-2xl overflow-hidden text-slate-200 flex flex-col max-h-[85vh]">
        {/* Top Search Input Bar */}
        <div className="flex items-center border-b border-[#2D3A52] px-4 py-3 bg-[#141B29] shrink-0">
          <Search size={18} className="text-[#E03616] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, customer, invoice number, product, or employee..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          <kbd className="text-[10px] font-mono text-slate-300 border border-[#2D3A52] px-1.5 py-0.5 rounded bg-[#1B2436] ml-2">
            ESC
          </kbd>
        </div>

        {/* Category Pills Strip */}
        <div className="flex items-center space-x-1 px-3 py-2 bg-[#141B29]/90 border-b border-[#2D3A52]/70 overflow-x-auto text-[11px] shrink-0">
          {(
            [
              'ALL',
              'ACTIONS',
              'NAVIGATION',
              'INVOICES',
              'CUSTOMERS',
              'PRODUCTS',
              'DEALS',
              'EMPLOYEES',
            ] as SearchCategory[]
          ).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedIndex(0);
              }}
              className={`px-2.5 py-0.5 rounded-md font-mono text-[10px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#E03616] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-[#243048]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Result List with Keyboard Active State */}
        <div className="overflow-y-auto flex-1 p-2 space-y-1 divide-y divide-[#243048]/50">
          {filteredResults.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No workspace records found matching &quot;{query}&quot;
            </div>
          ) : (
            filteredResults.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors cursor-pointer group ${
                    isSelected
                      ? 'bg-[#27334D] text-white border-l-2 border-[#E03616]'
                      : 'hover:bg-[#243048]/70 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0 pr-2">
                    <div
                      className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-[#E03616] text-white'
                          : 'bg-[#141B29] text-slate-400 group-hover:text-white'
                      }`}
                    >
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-xs text-white truncate flex items-center gap-2">
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#141B29] text-slate-300 border border-[#2D3A52]">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.sublabel && (
                        <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                          {item.sublabel}
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono shrink-0 pl-2">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-4 py-2 bg-[#141B29] border-t border-[#2D3A52] text-[10px] text-slate-400 flex items-center justify-between font-mono shrink-0">
          <span className="flex items-center gap-2">
            <span>↑↓ to navigate</span>
            <span>·</span>
            <span>↵ to select</span>
          </span>
          <span className="text-slate-500">
            {filteredResults.length} records indexed
          </span>
        </div>
      </div>
    </div>
  );
}
