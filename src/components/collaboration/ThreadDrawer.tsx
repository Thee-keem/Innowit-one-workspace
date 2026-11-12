import React, { useState } from 'react';
import { X, MessageSquare, Send, Smile, Paperclip } from 'lucide-react';
import { MessageRecord, ThreadReplyRecord } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface ThreadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  parentMessage: MessageRecord | null;
  replies: ThreadReplyRecord[];
  onSendReply: (content: string) => void;
}

export function ThreadDrawer({
  isOpen,
  onClose,
  parentMessage,
  replies,
  onSendReply,
}: ThreadDrawerProps) {
  const [replyText, setReplyText] = useState('');

  if (!isOpen || !parentMessage) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onSendReply(replyText.trim());
    setReplyText('');
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-white border-l border-[#D8E2EC] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="flex items-center justify-between border-b border-[#D8E2EC] px-4 py-3 bg-[#F8FAFC]">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-[#E03616]" />
          <h3 className="font-bold text-sm text-[#0F172A]">Threaded Discussion</h3>
          <Badge variant="frost" className="text-[10px] text-[#1B2436]">
            {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
          </Badge>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-[#54657E] hover:text-[#0F172A] hover:bg-[#E8EEF5] transition-colors cursor-pointer"
          title="Close Thread (ESC)"
        >
          <X size={18} />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {/* Parent Message Card */}
        <div className="p-3.5 rounded-xl border border-[#D8E2EC] bg-[#F8FAFC]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-[#1B2436] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {parentMessage.senderAvatar}
              </div>
              <div>
                <span className="font-bold text-xs text-[#0F172A]">{parentMessage.senderName}</span>
                <span className="text-[10px] text-[#E03616] font-mono ml-1.5 uppercase font-semibold">
                  {parentMessage.senderRole}
                </span>
              </div>
            </div>
            <span className="text-[10px] text-[#64748B]">{parentMessage.timestamp}</span>
          </div>

          <p className="mt-2 text-xs text-[#1E293B] leading-relaxed">
            {parentMessage.content}
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2 my-2">
          <div className="h-[1px] flex-1 bg-[#D8E2EC]" />
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
            Thread Replies
          </span>
          <div className="h-[1px] flex-1 bg-[#D8E2EC]" />
        </div>

        {/* Replies List */}
        {replies.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#64748B]">
            No replies in this thread yet. Be the first to chime in!
          </div>
        ) : (
          <div className="space-y-3">
            {replies.map((reply) => (
              <div key={reply.id} className="flex items-start gap-2.5">
                <div className="h-6 w-6 rounded-full bg-[#E8EEF5] text-[#1B2436] border border-[#D8E2EC] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  {reply.senderAvatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-xs text-[#0F172A]">{reply.senderName}</span>
                    <span className="text-[10px] text-[#64748B]">{reply.timestamp}</span>
                  </div>
                  <div className="mt-1 p-2.5 rounded-lg bg-[#F8FAFC] border border-[#D8E2EC] text-xs text-[#1E293B] leading-relaxed">
                    {reply.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply Composer at Bottom */}
      <form onSubmit={handleSend} className="p-3 border-t border-[#D8E2EC] bg-[#F8FAFC]">
        <div className="flex items-center gap-2 rounded-xl border border-[#D8E2EC] bg-white p-1.5 focus-within:border-[#E03616] transition-colors">
          <input
            type="text"
            placeholder="Reply in thread..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full bg-transparent px-2.5 text-xs text-[#0F172A] placeholder-[#64748B] focus:outline-none"
          />
          <button
            type="submit"
            disabled={!replyText.trim()}
            className="p-1.5 rounded-lg bg-[#E03616] text-white hover:bg-[#C72E14] transition-colors disabled:opacity-30 cursor-pointer shadow-xs shrink-0"
          >
            <Send size={13} />
          </button>
        </div>
      </form>
    </div>
  );
}
