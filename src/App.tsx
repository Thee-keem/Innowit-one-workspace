/**
 * INNOWIT ONE WORKSPACE — Implementation Phase 1
 * Core Scaffolding, Database Kernel, Design Tokens & Global App Shell
 *
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar } from '@/components/shell/Sidebar';
import { TopBar } from '@/components/shell/TopBar';
import { CommandPalette } from '@/components/shell/CommandPalette';
import { RoleSwitcherModal } from '@/components/shell/RoleSwitcherModal';
import { ChartOfAccountsView } from '@/components/views/ChartOfAccountsView';
import { JournalEntriesView } from '@/components/views/JournalEntriesView';
import { EtimsView } from '@/components/views/EtimsView';
import { CustomersView } from '@/components/views/CustomersView';
import { CrmView } from '@/components/views/CrmView';
import { InventoryView } from '@/components/views/InventoryView';
import { CollaborationView } from '@/components/views/CollaborationView';
import { RbacMatrixView } from '@/components/views/RbacMatrixView';
import { ForbiddenNotice } from '@/components/views/ForbiddenNotice';

import {
  DEFAULT_BRANCHES,
  DEFAULT_ACCOUNTS,
  DEFAULT_JOURNAL_ENTRIES,
  DEFAULT_ETIMS_RECORDS,
  DEFAULT_CUSTOMERS,
  DEFAULT_PRODUCTS,
  SEED_USERS,
} from '@/data/kernel';
import {
  Branch,
  UserSessionPayload,
  Account,
  JournalEntry,
  EtimsRecord,
  CustomerRecord,
  ProductRecord,
  SystemModule,
} from '@/types';
import { canViewModule } from '@/modules/auth/rbac';

export default function App() {
  // Navigation State
  const [currentPath, setCurrentPath] = useState('/accounting/chart-of-accounts');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Shell Modals
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);

  // Operational Context
  const [branches] = useState<Branch[]>(DEFAULT_BRANCHES);
  const [activeBranch, setActiveBranch] = useState<Branch>(DEFAULT_BRANCHES[0]);
  const [currentUser, setCurrentUser] = useState<UserSessionPayload>(SEED_USERS[0]); // default Super Admin
  const [isSandbox, setIsSandbox] = useState<boolean>(true); // Sandbox air-gap default

  // Kernel State Stores
  const [accounts, setAccounts] = useState<Account[]>(DEFAULT_ACCOUNTS);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(DEFAULT_JOURNAL_ENTRIES);
  const [etimsRecords, setEtimsRecords] = useState<EtimsRecord[]>(DEFAULT_ETIMS_RECORDS);
  const [customers, setCustomers] = useState<CustomerRecord[]>(DEFAULT_CUSTOMERS);
  const [products, setProducts] = useState<ProductRecord[]>(DEFAULT_PRODUCTS);

  // Handlers for state updates
  const handleAddAccount = (newAcc: Account) => {
    setAccounts((prev) => [newAcc, ...prev]);
  };

  const handleAddJournalEntry = (newEntry: JournalEntry) => {
    setJournalEntries((prev) => [newEntry, ...prev]);

    // Also update account balances if posted
    if (newEntry.status === 'POSTED') {
      setAccounts((prev) =>
        prev.map((acc) => {
          const matchingLines = newEntry.lines.filter((l) => l.accountId === acc.id);
          if (matchingLines.length === 0) return acc;

          let delta = 0;
          for (const l of matchingLines) {
            if (acc.type === 'ASSET' || acc.type === 'EXPENSE') {
              delta += l.debit - l.credit;
            } else {
              delta += l.credit - l.debit;
            }
          }
          return { ...acc, balance: acc.balance + delta };
        })
      );
    }
  };

  const handleAddCustomer = (newCust: CustomerRecord) => {
    setCustomers((prev) => [newCust, ...prev]);
  };

  const handleAddProduct = (newProd: ProductRecord) => {
    setProducts((prev) => [newProd, ...prev]);
  };

  const handleTransmitEtimsQueue = () => {
    setEtimsRecords((prev) =>
      prev.map((rec) => {
        if (rec.status === 'PENDING') {
          const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
          const receiptNumber = `KRA${Date.now().toString().slice(-13)}`;
          return {
            ...rec,
            status: 'ACCEPTED',
            transmissionTimestamp: timestamp,
            kraReceiptNumber: receiptNumber,
            verificationUrl: `https://itax.kra.go.ke/KRA-Portal/invoiceConfirmation.htm?cu=${rec.cuNumber}`,
            qrPayload: `https://itax.kra.go.ke/verify?cu=${rec.cuNumber}&receipt=${receiptNumber}`,
          };
        }
        return rec;
      })
    );
  };

  // Determine required module for current route
  const getRequiredModule = (path: string): SystemModule => {
    if (path.startsWith('/collaboration')) return 'COLLABORATION';
    if (path.startsWith('/crm')) return 'CRM';
    if (path.startsWith('/accounting/reports')) return 'BI_REPORTS';
    if (path.startsWith('/accounting')) return 'ACCOUNTING';
    if (path.startsWith('/inventory')) return 'INVENTORY';
    if (path.startsWith('/procurement')) return 'PROCUREMENT';
    if (path.startsWith('/hr')) return 'HR_PAYROLL';
    if (path.startsWith('/etims')) return 'ETIMS_COMPLIANCE';
    if (path.startsWith('/system')) return 'SYSTEM_ADMIN';
    return 'ACCOUNTING';
  };

  const requiredModule = getRequiredModule(currentPath);
  const isModuleAllowed = canViewModule(currentUser.role, requiredModule);

  // Content Renderer
  const renderActiveView = () => {
    // RBAC Security Boundary Check
    if (!isModuleAllowed) {
      return (
        <ForbiddenNotice
          module={requiredModule}
          currentRole={currentUser.role}
          onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
          onNavigateHome={() => setCurrentPath('/collaboration')}
        />
      );
    }

    // Chart of Accounts
    if (currentPath === '/accounting/chart-of-accounts' || currentPath === '/accounting/invoices' || currentPath === '/accounting/reports') {
      return (
        <ChartOfAccountsView
          accounts={accounts}
          onAddAccount={handleAddAccount}
          userRole={currentUser.role}
        />
      );
    }

    // Journal Entries
    if (currentPath === '/accounting/journal-entries') {
      return (
        <JournalEntriesView
          entries={journalEntries}
          accounts={accounts}
          onAddEntry={handleAddJournalEntry}
          userRole={currentUser.role}
          userFullName={currentUser.fullName}
        />
      );
    }

    // eTIMS Compliance
    if (currentPath.startsWith('/etims')) {
      return (
        <EtimsView
          records={etimsRecords}
          isSandbox={isSandbox}
          onToggleSandbox={() => setIsSandbox(!isSandbox)}
          onTransmitQueue={handleTransmitEtimsQueue}
          userRole={currentUser.role}
        />
      );
    }

    // CRM & Sales Pipeline Management (Phase 3)
    if (currentPath.startsWith('/crm')) {
      return (
        <CrmView
          userFullName={currentUser.fullName}
          userRole={currentUser.role}
          currentPath={currentPath}
          onNavigate={(path: string) => setCurrentPath(path)}
          onSyncCustomers={(updated) => setCustomers(updated)}
        />
      );
    }

    // Operations & Inventory
    if (currentPath.startsWith('/inventory') || currentPath.startsWith('/procurement') || currentPath.startsWith('/hr')) {
      return (
        <InventoryView
          products={products}
          onAddProduct={handleAddProduct}
          userRole={currentUser.role}
        />
      );
    }

    // Collaboration
    if (currentPath.startsWith('/collaboration')) {
      return (
        <CollaborationView
          userFullName={currentUser.fullName}
          userRole={currentUser.role}
          userId={currentUser.userId}
          currentPath={currentPath}
          onNavigate={(path: string) => setCurrentPath(path)}
        />
      );
    }

    // 12-Role RBAC Matrix
    if (currentPath === '/system/rbac') {
      return (
        <RbacMatrixView
          currentRole={currentUser.role}
          onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
        />
      );
    }

    // Fallback default
    return (
      <ChartOfAccountsView
        accounts={accounts}
        onAddAccount={handleAddAccount}
        userRole={currentUser.role}
      />
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F0F4F8] text-[#0F172A]">
      {/* Persistent Left Sidebar */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={(path: string) => setCurrentPath(path)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        userRole={currentUser.role}
      />

      {/* Main Execution Viewport */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <TopBar
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
          branches={branches}
          activeBranch={activeBranch}
          onSelectBranch={(branch: Branch) => setActiveBranch(branch)}
          isSandbox={isSandbox}
          onToggleSandbox={() => setIsSandbox(!isSandbox)}
          currentUser={currentUser}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F0F4F8]">
          {renderActiveView()}
        </main>
      </div>

      {/* Ctrl+K Omni-Search Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(path: string) => setCurrentPath(path)}
        onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
      />

      {/* 12-Role RBAC Simulation Engine Modal */}
      <RoleSwitcherModal
        isOpen={isRoleSwitcherOpen}
        onClose={() => setIsRoleSwitcherOpen(false)}
        currentUser={currentUser}
        onSelectUser={(user: UserSessionPayload) => setCurrentUser(user)}
        allUsers={SEED_USERS}
      />
    </div>
  );
}
