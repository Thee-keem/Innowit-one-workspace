import React from 'react';
import {
  MessageSquare,
  Smile,
  Pin,
  Paperclip,
  Download,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { MessageRecord, WorkspaceFile } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface MessageListProps {
  messages: MessageRecord[];
  currentUserName: string;
  onOpenThread: (message: MessageRecord) => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
  onTogglePin?: (messageId: string) => void;
  onDownloadFile?: (file: WorkspaceFile) => void;
}

export function MessageList({
  messages,
  currentUserName,
  onOpenThread,
  onToggleReaction,
  onTogglePin,
  onDownloadFile,
}: MessageListProps) {
  const renderFormattedContent = (text: string) => {
    // Basic rich formatting for bold, inline code, and bullet lists
    const lines = text.split('\n');
    return lines.map((line, lIdx) => {
      // Bold **text**
      let formatted: React.ReactNode = line;
      if (line.startsWith('- ')) {
        return (
          <li key={lIdx} className="ml-4 list-disc text-xs text-[#1E293B]">
            {line.substring(2)}
          </li>
        );
      }
      return (
        <div key={lIdx} className="text-xs text-[#1E293B] leading-relaxed">
          {line}
        </div>
      );
    });
  };

  const getFileIcon = (category: string) => {
    switch (category) {
      case 'SPREADSHEET':
        return <FileSpreadsheet size={14} className="text-emerald-700" />;
      case 'IMAGE':
        return <ImageIcon size={14} className="text-[#E03616]" />;
      default:
        return <FileText size={14} className="text-[#1B2436]" />;
    }
  };

  return (
    <div className="space-y-4 py-2">
      {messages.map((msg) => {
        const isPinned = msg.isPinned;

        return (
          <div
            key={msg.id}
            className={`group relative rounded-xl p-3.5 transition-all ${
              isPinned
                ? 'bg-[#E03616]/5 border border-[#E03616]/20'
                : 'hover:bg-[#F8FAFC] border border-transparent hover:border-[#D8E2EC]'
            }`}
          >
            {/* Pinned banner if pinned */}
            {isPinned && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#E03616] uppercase tracking-wider mb-2">
                <Pin size={11} className="rotate-45" /> Pinned Message
              </div>
            )}

            {/* Message Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-[#1B2436] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {msg.senderAvatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#0F172A]">
                      {msg.senderName}
                    </span>
                    <span className="text-[10px] text-[#E03616] font-mono uppercase font-semibold">
                      {msg.senderRole}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#64748B]">{msg.timestamp}</span>
                </div>
              </div>

              {/* Floating Hover Action Toolbar */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white border border-[#D8E2EC] p-1 rounded-lg shadow-sm">
                <button
                  type="button"
                  onClick={() => onToggleReaction(msg.id, '👍')}
                  className="p-1 rounded text-[#54657E] hover:text-[#0F172A] hover:bg-[#E8EEF5] text-xs cursor-pointer"
                  title="React with 👍"
                >
                  👍
                </button>
                <button
                  type="button"
                  onClick={() => onToggleReaction(msg.id, '❤️')}
                  className="p-1 rounded text-[#54657E] hover:text-[#0F172A] hover:bg-[#E8EEF5] text-xs cursor-pointer"
                  title="React with ❤️"
                >
                  ❤️
                </button>
                <button
                  type="button"
                  onClick={() => onToggleReaction(msg.id, '🚀')}
                  className="p-1 rounded text-[#54657E] hover:text-[#0F172A] hover:bg-[#E8EEF5] text-xs cursor-pointer"
                  title="React with 🚀"
                >
                  🚀
                </button>
                <span className="w-[1px] h-3.5 bg-[#D8E2EC]" />
                <button
                  type="button"
                  onClick={() => onOpenThread(msg)}
                  className="p-1 rounded text-[#54657E] hover:text-[#E03616] hover:bg-[#E8EEF5] text-xs cursor-pointer flex items-center gap-1"
                  title="Reply in Thread"
                >
                  <MessageSquare size={13} />
                </button>
                {onTogglePin && (
                  <button
                    type="button"
                    onClick={() => onTogglePin(msg.id)}
                    className="p-1 rounded text-[#54657E] hover:text-[#E03616] hover:bg-[#E8EEF5] text-xs cursor-pointer"
                    title={isPinned ? 'Unpin message' : 'Pin message'}
                  >
                    <Pin size={13} className={isPinned ? 'text-[#E03616]' : ''} />
                  </button>
                )}
              </div>
            </div>

            {/* Message Body Content */}
            <div className="mt-2.5 pl-10 space-y-1">
              {renderFormattedContent(msg.content)}
            </div>

            {/* Attached Files (if any) */}
            {msg.attachments && msg.attachments.length > 0 && (
              <div className="mt-2.5 pl-10 flex flex-wrap gap-2">
                {msg.attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-[#D8E2EC] bg-[#F8FAFC] max-w-sm hover:border-[#CAD6E2] transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {getFileIcon(file.category)}
                      <div className="truncate">
                        <div className="text-xs font-semibold text-[#0F172A] truncate">
                          {file.fileName}
                        </div>
                        <div className="text-[10px] text-[#64748B]">
                          {(file.fileSize / 1024).toFixed(0)} KB · {file.category}
                        </div>
                      </div>
                    </div>
                    {onDownloadFile && (
                      <button
                        type="button"
                        onClick={() => onDownloadFile(file)}
                        className="p-1 text-[#54657E] hover:text-[#E03616] cursor-pointer shrink-0"
                        title="Download Asset"
                      >
                        <Download size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Emoji Reactions & Thread Reply Badge */}
            <div className="mt-3 pl-10 flex flex-wrap items-center gap-1.5">
              {msg.reactions.map((r) => {
                const hasReacted = r.users.includes(currentUserName);
                return (
                  <button
                    key={r.emoji}
                    type="button"
                    onClick={() => onToggleReaction(msg.id, r.emoji)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors cursor-pointer ${
                      hasReacted
                        ? 'bg-[#E03616]/10 border border-[#E03616]/40 text-[#E03616] font-bold'
                        : 'bg-[#F0F4F8] border border-[#D8E2EC] text-[#334155] hover:bg-[#E8EEF5]'
                    }`}
                    title={r.users.join(', ')}
                  >
                    <span>{r.emoji}</span>
                    <span className="font-mono text-[11px]">{r.count}</span>
                  </button>
                );
              })}

              {/* Thread indicator badge */}
              {msg.replyCount > 0 && (
                <button
                  type="button"
                  onClick={() => onOpenThread(msg)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8EEF5] text-[#1B2436] hover:bg-[#D8E2EC] text-xs font-semibold cursor-pointer border border-[#D8E2EC] ml-2"
                >
                  <MessageSquare size={12} className="text-[#E03616]" />
                  <span>
                    {msg.replyCount} {msg.replyCount === 1 ? 'reply' : 'replies'}
                  </span>
                  {msg.lastReplyAt && (
                    <span className="text-[10px] text-[#64748B]">· {msg.lastReplyAt}</span>
                  )}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
