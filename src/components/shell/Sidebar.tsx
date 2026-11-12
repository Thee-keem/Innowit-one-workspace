import React from 'react';
import {
  MessageSquare,
  Users,
  Briefcase,
  CheckSquare,
  BookOpen,
  FileText,
  CreditCard,
  Building2,
  Package,
  ShoppingCart,
  TrendingUp,
  UserCheck,
  ShieldCheck,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Layers,
  Lock,
  Shield,
  FolderKanban,
} from 'lucide-react';
import { UserRole, SystemModule } from '@/types';
import { canViewModule } from '@/modules/auth/rbac';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  module: SystemModule;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAVIGATION_SECTIONS: NavSection[] = [
  {
    title: 'COLLABORATION',
    items: [
      { id: 'channels', label: 'Channels & Chat', href: '/collaboration', icon: MessageSquare, module: 'COLLABORATION' },
      { id: 'notes', label: 'Notes & Living Docs', href: '/collaboration/notes', icon: BookOpen, module: 'COLLABORATION' },
      { id: 'files', label: 'Workspace Files & Vault', href: '/collaboration/files', icon: FolderKanban, module: 'COLLABORATION' },
    ],
  },
  {
    title: 'CRM & SALES',
    items: [
      { id: 'crm-dashboard', label: 'CRM Dashboard', href: '/crm/dashboard', icon: BarChart3, module: 'CRM' },
      { id: 'customers', label: 'Customers', href: '/crm/customers', icon: Users, module: 'CRM' },
      { id: 'deals', label: 'Deals Pipeline', href: '/crm/deals', icon: Briefcase, module: 'CRM' },
      { id: 'tasks', label: 'Tasks & Activities', href: '/crm/tasks', icon: CheckSquare, module: 'CRM' },
    ],
  },
  {
    title: 'ACCOUNTING & FINANCE',
    items: [
      { id: 'chart-of-accounts', label: 'Chart of Accounts', href: '/accounting/chart-of-accounts', icon: Layers, module: 'ACCOUNTING' },
      { id: 'journal-entries', label: 'Journal Entries', href: '/accounting/journal-entries', icon: FileText, module: 'ACCOUNTING' },
      { id: 'invoices', label: 'Sales Invoices', href: '/accounting/invoices', icon: CreditCard, module: 'ACCOUNTING' },
      { id: 'reports', label: 'Financial Reports', href: '/accounting/reports', icon: TrendingUp, module: 'BI_REPORTS' },
    ],
  },
  {
    title: 'ERP OPERATIONS',
    items: [
      { id: 'inventory', label: 'Inventory & Stock', href: '/inventory/products', icon: Package, module: 'INVENTORY' },
      { id: 'procurement', label: 'Purchase Orders', href: '/procurement/purchase-orders', icon: ShoppingCart, module: 'PROCUREMENT' },
      { id: 'hr-payroll', label: 'HR & Payroll', href: '/hr/payroll', icon: UserCheck, module: 'HR_PAYROLL' },
    ],
  },
  {
    title: 'TAX COMPLIANCE',
    items: [
      { id: 'etims-config', label: 'eTIMS Setup', href: '/etims/configuration', icon: ShieldCheck, module: 'ETIMS_COMPLIANCE' },
      { id: 'etims-queue', label: 'Submission Queue', href: '/etims/queue', icon: Building2, module: 'ETIMS_COMPLIANCE' },
    ],
  },
  {
    title: 'SYSTEM GOVERNANCE',
    items: [
      { id: 'rbac-matrix', label: '12-Role RBAC Matrix', href: '/system/rbac', icon: Shield, module: 'SYSTEM_ADMIN' },
    ],
  },
];

interface SidebarProps {
  currentPath: string;
  onNavigate: (href: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  userRole: UserRole;
}

export function Sidebar({
  currentPath,
  onNavigate,
  collapsed,
  onToggleCollapse,
  userRole,
}: SidebarProps) {
  return (
    <aside
      className={`relative flex flex-col border-r border-[#243048] bg-[#1B2436] transition-all duration-200 select-none z-20 shrink-0 text-slate-200 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between border-b border-[#243048] px-4 bg-[#141B29]">
        {!collapsed && (
          <div className="flex items-center space-x-2.5">
            {/* Loud Blood Orange Logo Accent */}
            <div className="h-7 w-7 rounded bg-[#E03616] flex items-center justify-center font-bold text-white text-xs shadow-sm">
              IN
            </div>
            <div className="flex flex-col">
              <span className="font-semibold tracking-tight text-white text-[13px] leading-none">
                Innowit <span className="text-[#E03616]">One</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider mt-1">WORKSPACE OS</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="h-7 w-7 mx-auto rounded bg-[#E03616] flex items-center justify-center font-bold text-white text-xs">
            IN
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="rounded p-1 text-slate-400 hover:bg-[#243048] hover:text-white transition-colors cursor-pointer"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav Link Groups */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-5">
        {NAVIGATION_SECTIONS.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <h3 className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {section.title}
              </h3>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.href;
              const isAllowed = canViewModule(userRole, item.module);

              return (
                <button
                  key={item.href}
                  onClick={() => onNavigate(item.href)}
                  className={`flex h-9 w-full items-center justify-between rounded-md px-3 text-[13px] font-medium transition-colors text-left group cursor-pointer ${
                    isActive
                      ? 'bg-[#27334D] text-white border-l-3 border-[#E03616] font-semibold'
                      : isAllowed
                      ? 'text-slate-300 hover:bg-[#243048] hover:text-white'
                      : 'text-slate-500 hover:bg-[#243048]/50 hover:text-slate-400 opacity-60'
                  }`}
                  title={
                    collapsed
                      ? `${item.label}${!isAllowed ? ' (Locked for ' + userRole + ')' : ''}`
                      : !isAllowed
                      ? `Access restricted for role: ${userRole}`
                      : undefined
                  }
                >
                  <div className="flex items-center min-w-0">
                    <Icon
                      size={17}
                      className={
                        collapsed
                          ? 'mx-auto shrink-0'
                          : `mr-3 shrink-0 ${isActive ? 'text-[#E03616]' : 'text-slate-400 group-hover:text-white'}`
                      }
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!collapsed && !isAllowed && (
                    <Lock
                      size={12}
                      className="text-slate-500 ml-1 shrink-0 group-hover:text-slate-400 transition-colors"
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Status / Organization in Slate Blue */}
      {!collapsed && (
        <div className="border-t border-[#243048] p-3 bg-[#141B29] text-[11px] text-slate-400">
          <div className="font-medium text-slate-300 truncate">Innowit Technologies Ltd</div>
          <div className="font-mono text-[10px] text-slate-400 flex items-center justify-between mt-0.5">
            <span>PIN: P051234567Z</span>
            <span className="text-[#E03616] font-semibold">v1.0-KE</span>
          </div>
        </div>
      )}
    </aside>
  );
}
