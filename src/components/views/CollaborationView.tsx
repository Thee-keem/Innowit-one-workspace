import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  BookOpen,
  FolderKanban,
  Video,
  Hash,
  Plus,
  Search,
  Pin,
  Lock,
  Globe,
  Users,
  Radio,
  Download,
  Tag,
  Paperclip,
  Share2,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  UserRole,
  ChannelRecord,
  MessageRecord,
  ThreadReplyRecord,
  WorkspaceFile,
  SharedNoteRecord,
  HuddleSessionRecord,
} from '@/types';
import {
  loadCollaborationState,
  saveCollaborationState,
  CollaborationState,
} from '@/modules/collaboration/store';

import { MessageList } from '@/components/collaboration/MessageList';
import { MessageComposer } from '@/components/collaboration/MessageComposer';
import { ThreadDrawer } from '@/components/collaboration/ThreadDrawer';
import { CreateChannelModal } from '@/components/collaboration/CreateChannelModal';
import { WorkspaceFilesView } from '@/components/collaboration/WorkspaceFilesView';
import { SharedNotesView } from '@/components/collaboration/SharedNotesView';
import { HuddleModal } from '@/components/collaboration/HuddleModal';

interface CollaborationViewProps {
  userFullName: string;
  userRole: UserRole;
  userId?: string;
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

type CollaborationTab = 'chat' | 'notes' | 'files';

export function CollaborationView({
  userFullName,
  userRole,
  userId = 'usr_super_admin',
  currentPath = '/collaboration',
  onNavigate,
}: CollaborationViewProps) {
  // Global hydrated collaboration state from LocalStorage
  const [collabState, setCollabState] = useState<CollaborationState>(() =>
    loadCollaborationState()
  );

  // Active sub-tab derived from URL or state
  const getTabFromPath = (path: string): CollaborationTab => {
    if (path.includes('/notes')) return 'notes';
    if (path.includes('/files')) return 'files';
    return 'chat';
  };

  const [activeTab, setActiveTab] = useState<CollaborationTab>(() =>
    getTabFromPath(currentPath)
  );

  // Sync tab with external currentPath changes
  useEffect(() => {
    setActiveTab(getTabFromPath(currentPath));
  }, [currentPath]);

  // Handle Tab Switch
  const handleTabChange = (tab: CollaborationTab) => {
    setActiveTab(tab);
    if (onNavigate) {
      if (tab === 'chat') onNavigate('/collaboration');
      if (tab === 'notes') onNavigate('/collaboration/notes');
      if (tab === 'files') onNavigate('/collaboration/files');
    }
  };

  // Channels & Messages State
  const [activeChannelId, setActiveChannelId] = useState<string>(() => {
    return collabState.channels[0]?.id || 'ch_general';
  });
  const [channelSearch, setChannelSearch] = useState('');
  const [filterPinnedOnly, setFilterPinnedOnly] = useState(false);

  // Modals & Drawers
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [activeThreadMessage, setActiveThreadMessage] = useState<MessageRecord | null>(null);
  const [isHuddleOpen, setIsHuddleOpen] = useState(false);

  // Save to localStorage whenever collabState changes
  const updateStateAndPersist = (updater: (prev: CollaborationState) => CollaborationState) => {
    setCollabState((prev) => {
      const updated = updater(prev);
      saveCollaborationState(updated);
      return updated;
    });
  };

  // Channel Operations
  const activeChannel =
    collabState.channels.find((c) => c.id === activeChannelId) ||
    collabState.channels[0];

  const handleCreateChannel = (newChannel: ChannelRecord) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      channels: [...prev.channels, newChannel],
    }));
    setActiveChannelId(newChannel.id);
  };

  // Message Operations
  const handleSendMessage = (content: string, attachments?: WorkspaceFile[]) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: MessageRecord = {
      id: `msg_${Date.now()}`,
      channelId: activeChannelId,
      senderId: userId,
      senderName: userFullName,
      senderRole: userRole,
      senderAvatar: userFullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      content,
      timestamp,
      reactions: [],
      attachments: attachments && attachments.length > 0 ? attachments : undefined,
      replyCount: 0,
      isPinned: false,
    };

    updateStateAndPersist((prev) => ({
      ...prev,
      messages: [...prev.messages, newMsg],
    }));
  };

  // Emoji Reactions Toggle
  const handleToggleReaction = (messageId: string, emoji: string) => {
    updateStateAndPersist((prev) => {
      const updatedMessages = prev.messages.map((msg) => {
        if (msg.id !== messageId) return msg;

        const existingReaction = msg.reactions.find((r) => r.emoji === emoji);
        let newReactions = [...msg.reactions];

        if (existingReaction) {
          if (existingReaction.users.includes(userFullName)) {
            // Remove user reaction
            const newUsers = existingReaction.users.filter((u) => u !== userFullName);
            if (newUsers.length === 0) {
              newReactions = newReactions.filter((r) => r.emoji !== emoji);
            } else {
              newReactions = newReactions.map((r) =>
                r.emoji === emoji ? { ...r, count: newUsers.length, users: newUsers } : r
              );
            }
          } else {
            // Add user reaction
            newReactions = newReactions.map((r) =>
              r.emoji === emoji
                ? { ...r, count: r.count + 1, users: [...r.users, userFullName] }
                : r
            );
          }
        } else {
          // New reaction emoji
          newReactions.push({
            emoji,
            count: 1,
            users: [userFullName],
          });
        }

        return { ...msg, reactions: newReactions };
      });

      return { ...prev, messages: updatedMessages };
    });
  };

  // Message Pin Toggle
  const handleTogglePin = (messageId: string) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      messages: prev.messages.map((m) =>
        m.id === messageId ? { ...m, isPinned: !m.isPinned } : m
      ),
    }));
  };

  // Thread Replies Operations
  const handleOpenThread = (message: MessageRecord) => {
    setActiveThreadMessage(message);
  };

  const handleSendThreadReply = (content: string) => {
    if (!activeThreadMessage) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const reply: ThreadReplyRecord = {
      id: `reply_${Date.now()}`,
      messageId: activeThreadMessage.id,
      senderId: userId,
      senderName: userFullName,
      senderRole: userRole,
      senderAvatar: userFullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      content,
      timestamp,
    };

    updateStateAndPersist((prev) => {
      const existingReplies = prev.threadReplies[activeThreadMessage.id] || [];
      const updatedReplies = {
        ...prev.threadReplies,
        [activeThreadMessage.id]: [...existingReplies, reply],
      };

      // Also increment parent message replyCount and lastReplyAt
      const updatedMessages = prev.messages.map((m) =>
        m.id === activeThreadMessage.id
          ? {
              ...m,
              replyCount: (m.replyCount || 0) + 1,
              lastReplyAt: timestamp,
            }
          : m
      );

      return {
        ...prev,
        threadReplies: updatedReplies,
        messages: updatedMessages,
      };
    });

    // Update active thread message instance
    setActiveThreadMessage((prev) =>
      prev
        ? {
            ...prev,
            replyCount: (prev.replyCount || 0) + 1,
            lastReplyAt: timestamp,
          }
        : null
    );
  };

  // Workspace Files Operations
  const handleUploadFile = (newFile: WorkspaceFile) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      files: [newFile, ...prev.files],
    }));
  };

  const handleDeleteFile = (fileId: string) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      files: prev.files.filter((f) => f.id !== fileId),
    }));
  };

  // Shared Notes Operations
  const handleCreateNote = (newNote: SharedNoteRecord) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      notes: [newNote, ...prev.notes],
    }));
  };

  const handleUpdateNote = (noteId: string, updates: Partial<SharedNoteRecord>) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => (n.id === noteId ? { ...n, ...updates } : n)),
    }));
  };

  const handleDeleteNote = (noteId: string) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== noteId),
    }));
  };

  // Huddle Notes Sync
  const handleUpdateHuddleNotes = (notesText: string) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      huddle: {
        ...prev.huddle,
        meetingNotes: notesText,
      },
    }));
  };

  // Filter messages for current channel
  const currentChannelMessages = collabState.messages.filter((m) => {
    const isChannel = m.channelId === activeChannelId;
    if (filterPinnedOnly) return isChannel && m.isPinned;
    return isChannel;
  });

  const activeThreadReplies = activeThreadMessage
    ? collabState.threadReplies[activeThreadMessage.id] || []
    : [];

  const filteredChannels = collabState.channels.filter((c) =>
    c.name.toLowerCase().includes(channelSearch.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Top Workspace Collaboration Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D8E2EC] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2">
              <MessageSquare className="text-[#E03616]" size={22} />
              Team Collaboration Engine
            </h1>
            <Badge variant="slateBlue">Phase 2 Core</Badge>
          </div>
          <p className="mt-0.5 text-xs text-[#54657E]">
            Channels, real-time message threads, Living Notes with CRM/ERP lineage, encrypted files vault, and demonstration huddles.
          </p>
        </div>

        {/* Global Action Pill: Demonstration Huddle Launcher */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsHuddleOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#E03616] text-white hover:bg-[#C72E14] text-xs font-bold transition-all shadow-xs cursor-pointer group"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            <Video size={14} />
            <span>Join Huddle (#{activeChannel?.name || 'general'})</span>
          </button>
        </div>
      </div>

      {/* Primary Sub-Tabs Navigation (Channels & Chat, Living Notes, Workspace Files Vault) */}
      <div className="flex items-center justify-between border-b border-[#D8E2EC] bg-white px-2 py-1.5 rounded-xl shadow-xs">
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => handleTabChange('chat')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-[#1B2436] text-white shadow-xs'
                : 'text-[#54657E] hover:text-[#0F172A] hover:bg-[#F0F4F8]'
            }`}
          >
            <MessageSquare size={14} className={activeTab === 'chat' ? 'text-[#E03616]' : ''} />
            <span>Channels & Messages</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === 'chat' ? 'bg-[#27334D] text-white' : 'bg-[#E8EEF5] text-[#1B2436]'
            }`}>
              {collabState.channels.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('notes')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-[#1B2436] text-white shadow-xs'
                : 'text-[#54657E] hover:text-[#0F172A] hover:bg-[#F0F4F8]'
            }`}
          >
            <BookOpen size={14} className={activeTab === 'notes' ? 'text-[#E03616]' : ''} />
            <span>Living Notes & Docs</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === 'notes' ? 'bg-[#27334D] text-white' : 'bg-[#E8EEF5] text-[#1B2436]'
            }`}>
              {collabState.notes.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('files')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'files'
                ? 'bg-[#1B2436] text-white shadow-xs'
                : 'text-[#54657E] hover:text-[#0F172A] hover:bg-[#F0F4F8]'
            }`}
          >
            <FolderKanban size={14} className={activeTab === 'files' ? 'text-[#E03616]' : ''} />
            <span>Workspace Files & Vault</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === 'files' ? 'bg-[#27334D] text-white' : 'bg-[#E8EEF5] text-[#1B2436]'
            }`}>
              {collabState.files.length}
            </span>
          </button>
        </div>

        {/* Status indicator */}
        <div className="hidden md:flex items-center gap-2 text-[11px] text-[#54657E] font-mono pr-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Real-time State: Synced (Local V2)</span>
        </div>
      </div>

      {/* Tab 1: Channels & Messages Core */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 rounded-2xl border border-[#D8E2EC] bg-white overflow-hidden shadow-xs min-h-[620px]">
          {/* Left Column (30% Slate Blue Channel Sidebar) */}
          <div className="md:col-span-4 lg:col-span-3 border-r border-[#243048] bg-[#1B2436] p-3 flex flex-col justify-between text-slate-200">
            <div className="space-y-3">
              {/* Channel Header + Create Button */}
              <div className="flex items-center justify-between px-2 pt-1">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Workspace Channels
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreateChannelOpen(true)}
                  className="p-1 rounded text-slate-300 hover:text-white hover:bg-[#27334D] transition-colors cursor-pointer"
                  title="Create Channel"
                >
                  <Plus size={15} />
                </button>
              </div>

              {/* Quick Channel Search */}
              <div className="relative px-1">
                <Search size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Jump to channel..."
                  value={channelSearch}
                  onChange={(e) => setChannelSearch(e.target.value)}
                  className="w-full rounded-lg border border-[#2D3A52] bg-[#141B29] pl-7 pr-2.5 py-1 text-[11px] text-white placeholder-slate-400 focus:border-[#E03616] focus:outline-none"
                />
              </div>

              {/* Channel List */}
              <div className="space-y-1 max-h-[420px] overflow-y-auto px-1">
                {filteredChannels.map((ch) => {
                  const isActive = activeChannelId === ch.id;
                  const channelMsgCount = collabState.messages.filter(
                    (m) => m.channelId === ch.id
                  ).length;

                  return (
                    <button
                      key={ch.id}
                      onClick={() => {
                        setActiveChannelId(ch.id);
                        setFilterPinnedOnly(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition-all cursor-pointer group ${
                        isActive
                          ? 'bg-[#27334D] text-white font-bold border-l-2 border-[#E03616]'
                          : 'text-slate-300 hover:bg-[#243048] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {ch.isPrivate ? (
                          <Lock size={13} className={isActive ? 'text-[#E03616]' : 'text-slate-400'} />
                        ) : (
                          <Hash size={13} className={isActive ? 'text-[#E03616]' : 'text-slate-400'} />
                        )}
                        <span className="truncate">{ch.name}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {ch.unreadCount && ch.unreadCount > 0 ? (
                          <span className="bg-[#E03616] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                            {ch.unreadCount}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono group-hover:text-slate-200">
                            {channelMsgCount}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Channel Status / Huddle Info */}
            <div className="pt-3 border-t border-[#2D3A52] text-[11px] text-slate-300 px-2 space-y-2 bg-[#161E2E] -mx-3 -mb-3 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#E03616] animate-ping" />
                  <span className="text-white font-semibold text-xs">Live Audio Huddle</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHuddleOpen(true)}
                  className="text-[10px] text-[#E03616] hover:underline font-bold cursor-pointer"
                >
                  Join (4 Active)
                </button>
              </div>
              <div className="text-[10px] text-slate-400">
                Encrypted in-browser WebRTC signaling simulation.
              </div>
            </div>
          </div>

          {/* Right Column (60% Alpine Frost / Main Chat Room) */}
          <div className="md:col-span-8 lg:col-span-9 flex flex-col justify-between p-4 bg-white relative">
            {/* Channel Header Bar */}
            <div className="border-b border-[#D8E2EC] pb-3 mb-2 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-[#0F172A] flex items-center gap-1 font-mono">
                    {activeChannel.isPrivate ? (
                      <Lock size={16} className="text-[#E03616]" />
                    ) : (
                      <Hash size={16} className="text-[#E03616]" />
                    )}
                    {activeChannel.name}
                  </span>
                  <Badge variant="frost" className="text-[10px] text-[#1B2436] font-mono">
                    <Users size={11} className="mr-1 inline text-[#54657E]" />
                    {activeChannel.memberCount} members
                  </Badge>
                </div>
                <div className="mt-0.5 text-xs text-[#54657E] max-w-xl truncate">
                  {activeChannel.description}
                  {activeChannel.topic && (
                    <span className="ml-2 font-mono text-[11px] text-[#1B2436] font-medium border-l border-[#D8E2EC] pl-2">
                      Topic: {activeChannel.topic}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilterPinnedOnly(!filterPinnedOnly)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    filterPinnedOnly
                      ? 'bg-[#E03616]/10 text-[#E03616] border-[#E03616]/30 font-semibold'
                      : 'border-[#D8E2EC] text-[#54657E] hover:bg-[#F0F4F8]'
                  }`}
                  title="Filter Pinned Messages"
                >
                  <Pin size={12} className={filterPinnedOnly ? 'rotate-45' : ''} />
                  <span>Pinned</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsHuddleOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1B2436] text-white hover:bg-[#27334D] text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                  title="Start Huddle in this Channel"
                >
                  <Video size={13} className="text-[#E03616]" />
                  <span>Huddle</span>
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto max-h-[420px] pr-2 space-y-2">
              {currentChannelMessages.length === 0 ? (
                <div className="py-20 text-center space-y-2">
                  <div className="h-10 w-10 mx-auto rounded-full bg-[#F0F4F8] flex items-center justify-center text-[#54657E]">
                    <MessageSquare size={18} />
                  </div>
                  <h4 className="text-sm font-bold text-[#0F172A]">
                    {filterPinnedOnly
                      ? 'No pinned messages in this channel'
                      : `Welcome to #${activeChannel.name}`}
                  </h4>
                  <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                    {filterPinnedOnly
                      ? 'Hover over any message and click the pin icon to pin important operational guidelines.'
                      : 'This is the start of this channel. Send the first message or attach workspace documents.'}
                  </p>
                </div>
              ) : (
                <MessageList
                  messages={currentChannelMessages}
                  currentUserName={userFullName}
                  onOpenThread={handleOpenThread}
                  onToggleReaction={handleToggleReaction}
                  onTogglePin={handleTogglePin}
                  onDownloadFile={(f) => {
                    alert(`Downloading "${f.fileName}"...`);
                  }}
                />
              )}
            </div>

            {/* Rich Message Composer */}
            <div className="mt-3">
              <MessageComposer
                onSendMessage={handleSendMessage}
                placeholder={`Message #${activeChannel.name}...`}
                availableFiles={collabState.files}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Living Notes & Knowledge Docs */}
      {activeTab === 'notes' && (
        <SharedNotesView
          notes={collabState.notes}
          onCreateNote={handleCreateNote}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
          currentUserName={userFullName}
          currentUserRole={userRole}
        />
      )}

      {/* Tab 3: Workspace Files Vault */}
      {activeTab === 'files' && (
        <WorkspaceFilesView
          files={collabState.files}
          onUploadFile={handleUploadFile}
          onDeleteFile={handleDeleteFile}
          currentUserName={userFullName}
        />
      )}

      {/* Slide-Out Thread Drawer */}
      <ThreadDrawer
        isOpen={!!activeThreadMessage}
        onClose={() => setActiveThreadMessage(null)}
        parentMessage={activeThreadMessage}
        replies={activeThreadReplies}
        onSendReply={handleSendThreadReply}
      />

      {/* Create Channel Modal */}
      <CreateChannelModal
        isOpen={isCreateChannelOpen}
        onClose={() => setIsCreateChannelOpen(false)}
        onCreateChannel={handleCreateChannel}
        currentUserId={userId}
      />

      {/* Huddle Demonstration Modal */}
      <HuddleModal
        isOpen={isHuddleOpen}
        onClose={() => setIsHuddleOpen(false)}
        huddle={collabState.huddle}
        onUpdateNotes={handleUpdateHuddleNotes}
        currentUserId={userId}
      />
    </div>
  );
}
