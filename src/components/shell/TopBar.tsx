import React, { useState } from 'react';
import {
  Search,
  Bell,
  ShieldAlert,
  ShieldCheck,
  Building2,
  ChevronDown,
  Check,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Branch, UserSessionPayload, SystemNotification } from '@/types';
import { ROLE_METADATA } from '@/modules/auth/rbac';

interface TopBarProps {
  onOpenCommandPalette: () => void;
  onOpenRoleSwitcher: () => void;
  branches: Branch[];
  activeBranch: Branch;
  onSelectBranch: (branch: Branch) => void;
  isSandbox: boolean;
  onToggleSandbox: () => void;
  currentUser: UserSessionPayload;
  notifications?: SystemNotification[];
  onNotificationClick?: (linkHref?: string) => void;
  onClearNotifications?: () => void;
}

export function TopBar({
  onOpenCommandPalette,
  onOpenRoleSwitcher,
  branches,
  activeBranch,
  onSelectBranch,
  isSandbox,
  onToggleSandbox,
  currentUser,
  notifications = [],
  onNotificationClick,
  onClearNotifications,
}: TopBarProps) {
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="flex h-14 w-full items-center justify-between border-b border-[#243048] bg-[#141B29] px-4 md:px-6 relative z-10 shrink-0 text-slate-200">
      {/* Left: Branch & Operational Context */}
      <div className="relative">
        <button
          onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
          className="flex items-center space-x-2 rounded-md px-2.5 py-1.5 text-xs text-slate-300 hover:bg-[#243048] hover:text-white transition-colors cursor-pointer border border-transparent hover:border-[#2D3A52]"
        >
          <Building2 size={15} className="text-[#E03616]" />
          <span className="text-slate-400 hidden sm:inline">Branch:</span>
          <span className="font-semibold text-white">{activeBranch.name}</span>
          <ChevronDown size={13} className="text-slate-400" />
        </button>

        {branchDropdownOpen && (
          <div className="absolute left-0 mt-1 w-64 rounded-lg border border-[#2D3A52] bg-[#1B2436] py-1 shadow-2xl z-30">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-[#2D3A52]">
              Select Active Branch
            </div>
            {branches.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  onSelectBranch(b);
                  setBranchDropdownOpen(false);
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-xs text-slate-200 hover:bg-[#27334D] hover:text-white transition-colors cursor-pointer"
              >
                <div>
                  <div className="font-medium text-white">{b.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{b.address}</div>
                </div>
                {b.id === activeBranch.id && (
                  <Check size={14} className="text-[#E03616] shrink-0 ml-2" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Middle: Global Command Center Trigger */}
      <button
        onClick={onOpenCommandPalette}
        className="flex h-9 w-60 md:w-96 items-center justify-between rounded-md border border-[#2D3A52] bg-[#1B2436] px-3 text-xs text-slate-400 hover:border-[#415374] hover:text-slate-200 transition-colors cursor-pointer"
      >
        <span className="flex items-center space-x-2 truncate">
          <Search size={14} className="text-[#E03616] shrink-0" />
          <span className="truncate">Search accounts, invoices, deals...</span>
        </span>
        <kbd className="hidden sm:inline-block rounded bg-[#243048] px-1.5 py-0.5 text-[10px] font-mono text-slate-300 border border-[#2D3A52]">
          Ctrl+K
        </kbd>
      </button>

      {/* Right: Compliance Indicator, Notifications & User Role Switcher */}
      <div className="flex items-center space-x-3">
        {/* eTIMS Air-Gap Sandbox Button */}
        <button
          onClick={onToggleSandbox}
          className="cursor-pointer transition-transform active:scale-95"
          title="Click to toggle eTIMS Sandbox / Live Environment status"
        >
          {isSandbox ? (
            <Badge variant="sandbox" className="flex items-center space-x-1.5 border-[#2D3A52] bg-[#1B2436]">
              <ShieldAlert size={12} className="text-slate-300" />
              <span>eTIMS SANDBOX TEST</span>
            </Badge>
          ) : (
            <Badge variant="bloodOrange" className="flex items-center space-x-1.5">
              <ShieldCheck size={12} className="text-[#E03616]" />
              <span>eTIMS LIVE PRODUCTION</span>
            </Badge>
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative rounded p-1.5 text-slate-300 hover:bg-[#243048] hover:text-white transition-colors cursor-pointer"
            title="System notifications"
          >
            <Bell size={16} />
            {/* Blood Orange Notification Badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-[#E03616] text-white text-[9px] font-mono font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-1 w-84 rounded-lg border border-[#2D3A52] bg-[#1B2436] shadow-2xl z-30 overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#2D3A52] px-4 py-2.5 bg-[#141B29]">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-white">System Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] text-[#E03616] font-semibold font-mono">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                {onClearNotifications && notifications.length > 0 && (
                  <button
                    onClick={onClearNotifications}
                    className="text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="divide-y divide-[#2D3A52]/60 max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        if (onNotificationClick && n.linkHref) {
                          onNotificationClick(n.linkHref);
                          setNotificationsOpen(false);
                        }
                      }}
                      className={`w-full p-3 text-left hover:bg-[#243048] transition-colors cursor-pointer ${
                        !n.read ? 'bg-[#243048]/40' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                          {!n.read && (
                            <span className="h-1.5 w-1.5 rounded-full bg-[#E03616]" />
                          )}
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{n.timestamp}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-300 leading-snug">{n.message}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher */}
        <button
          onClick={onOpenRoleSwitcher}
          className="flex items-center space-x-2.5 border-l border-[#243048] pl-3 py-1 text-left hover:bg-[#243048]/60 rounded px-2 transition-colors cursor-pointer group"
          title="Click to switch active role (Test all 12 RBAC profiles)"
        >
          <div className="h-7 w-7 rounded-full bg-[#E03616] text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {currentUser.avatarInitials}
          </div>
          <div className="hidden lg:block text-left text-xs">
            <div className="font-semibold text-white leading-tight">
              {currentUser.fullName.split(' ')[0]}
            </div>
            <div className="text-[10px] text-slate-300 uppercase font-mono tracking-wider flex items-center gap-1">
              <span>{ROLE_METADATA[currentUser.role]?.label || currentUser.role}</span>
              <RefreshCw size={9} className="opacity-60 text-[#E03616] group-hover:rotate-180 transition-transform duration-300" />
            </div>
          </div>
        </button>
      </div>
    </header>
  );
}
