import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onOpenRoleSwitcher: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onOpenRoleSwitcher,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');

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

  if (!isOpen) return null;

  const quickNavItems = [
    {
      label: 'Channels & Team Chat',
      path: '/collaboration',
      icon: Layers,
      category: 'Collaboration',
      keywords: 'channels chat messaging threads communication kra general finance huddle',
    },
    {
      label: 'Living Notes & Operational Docs',
      path: '/collaboration/notes',
      icon: FileText,
      category: 'Collaboration',
      keywords: 'notes living docs knowledge crm deals invoices bi-directional lineage',
    },
    {
      label: 'Workspace Asset & File Vault',
      path: '/collaboration/files',
      icon: Package,
      category: 'Collaboration',
      keywords: 'files repository vault documents spreadsheets receipts kra etims certs',
    },
    {
      label: 'Chart of Accounts (General Ledger)',
      path: '/accounting/chart-of-accounts',
      icon: Layers,
      category: 'Accounting',
      keywords: 'coa ledger assets liabilities equity revenue cogs accounts',
    },
    {
      label: 'Journal Entries & Fiscal Postings',
      path: '/accounting/journal-entries',
      icon: FileText,
      category: 'Accounting',
      keywords: 'je debits credits double-entry posting gl',
    },
    {
      label: 'eTIMS Tax Compliance Setup & Keys',
      path: '/etims/configuration',
      icon: Shield,
      category: 'Compliance',
      keywords: 'kra etims oscu tax vat pin private key sandbox',
    },
    {
      label: 'eTIMS Real-Time Submission Queue',
      path: '/etims/queue',
      icon: CheckSquare,
      category: 'Compliance',
      keywords: 'outbox transmissions receipt cu numbers retry status',
    },
    {
      label: 'CRM Intelligence Dashboard & Forecasts',
      path: '/crm/dashboard',
      icon: BarChart3,
      category: 'CRM & Sales',
      keywords: 'crm dashboard pipeline metrics win rate forecasts leaderboard quotas',
    },
    {
      label: 'Customer Accounts Directory',
      path: '/crm/customers',
      icon: Users,
      category: 'CRM & Sales',
      keywords: 'clients safaricom equity twiga kcb debtors kra pin compliance directory',
    },
    {
      label: '6-Stage Deals Pipeline Kanban',
      path: '/crm/deals',
      icon: Briefcase,
      category: 'CRM & Sales',
      keywords: 'deals pipeline kanban opportunities leads proposals negotiations won lost',
    },
    {
      label: 'CRM Tasks & Follow-Up Activities',
      path: '/crm/tasks',
      icon: CheckSquare,
      category: 'CRM & Sales',
      keywords: 'tasks activities followups due dates priority urgent overdue crm',
    },
    {
      label: 'Inventory & Stock Valuation',
      path: '/inventory/products',
      icon: Package,
      category: 'Operations',
      keywords: 'products sku stock warehouse units reorder',
    },
    {
      label: '12-Role RBAC Governance Matrix',
      path: '/system/rbac',
      icon: Shield,
      category: 'Administration',
      keywords: 'roles permissions security super admin access audit',
    },
  ];

  const filteredItems = quickNavItems.filter((i) => {
    const match =
      i.label.toLowerCase().includes(query.toLowerCase()) ||
      i.keywords.toLowerCase().includes(query.toLowerCase()) ||
      i.category.toLowerCase().includes(query.toLowerCase());
    return match;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-[#0F172A]/70 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="w-full max-w-xl rounded-xl border border-[#2D3A52] bg-[#1B2436] shadow-2xl overflow-hidden text-slate-200">
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-[#2D3A52] px-4 py-3 bg-[#141B29]">
          <Search size={18} className="text-[#E03616] mr-3 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command, account number, or search workspace..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          <kbd className="text-[10px] font-mono text-slate-300 border border-[#2D3A52] px-1.5 py-0.5 rounded bg-[#1B2436]">
            ESC
          </kbd>
        </div>

        {/* Quick Action Strip */}
        <div className="bg-[#141B29]/90 px-4 py-2 border-b border-[#2D3A52]/70 flex items-center justify-between text-[11px] text-slate-300">
          <span className="flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#E03616]" />
            Quick Actions
          </span>
          <button
            onClick={() => {
              onClose();
              onOpenRoleSwitcher();
            }}
            className="text-[#E03616] font-semibold hover:underline cursor-pointer flex items-center gap-1 font-mono"
          >
            Switch User Role <ArrowRight size={10} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No workspace records found matching &quot;{query}&quot;
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    onNavigate(item.path);
                    onClose();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs text-slate-200 hover:bg-[#27334D] hover:text-white transition-colors cursor-pointer group"
                >
                  <span className="flex items-center space-x-3">
                    <Icon
                      size={16}
                      className="text-slate-400 group-hover:text-[#E03616] group-hover:scale-110 transition-all"
                    />
                    <span className="font-medium text-white">{item.label}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-[#141B29] border-t border-[#2D3A52] text-[10px] text-slate-400 flex items-center justify-between font-mono">
          <span>Innowit One Global Workspace</span>
          <span>Press ↑↓ to navigate · Enter to select</span>
        </div>
      </div>
    </div>
  );
}
