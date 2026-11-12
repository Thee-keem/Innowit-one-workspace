import React, { useState, useRef } from 'react';
import {
  Send,
  Bold,
  Italic,
  Code,
  List,
  Smile,
  Paperclip,
  X,
  FileText,
} from 'lucide-react';
import { WorkspaceFile } from '@/types';

interface MessageComposerProps {
  onSendMessage: (content: string, attachments?: WorkspaceFile[]) => void;
  placeholder?: string;
  availableFiles?: WorkspaceFile[];
}

const EMOJI_PALETTE = ['👍', '❤️', '🚀', '🎉', '👀', '🔥', '✅', '🔒', '👏', '💡'];

export function MessageComposer({
  onSendMessage,
  placeholder = 'Type a message... (Shift+Enter for newline, Enter to send)',
  availableFiles = [],
}: MessageComposerProps) {
  const [content, setContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<WorkspaceFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!content.trim() && selectedAttachments.length === 0) return;
    onSendMessage(
      content.trim(),
      selectedAttachments.length > 0 ? selectedAttachments : undefined
    );
    setContent('');
    setSelectedAttachments([]);
    setShowEmojiPicker(false);
    setShowFilePicker(false);
  };

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = prefix + (selectedText || 'text') + suffix;
    const newContent =
      content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText.length || 4));
    }, 10);
  };

  const handleAddEmoji = (emoji: string) => {
    setContent((prev) => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const toggleAttachment = (file: WorkspaceFile) => {
    if (selectedAttachments.some((f) => f.id === file.id)) {
      setSelectedAttachments(selectedAttachments.filter((f) => f.id !== file.id));
    } else {
      setSelectedAttachments([...selectedAttachments, file]);
    }
  };

  return (
    <div className="rounded-xl border border-[#D8E2EC] bg-white shadow-xs focus-within:border-[#E03616] transition-colors relative">
      {/* Selected Attachments Preview Strip */}
      {selectedAttachments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 border-b border-[#D8E2EC] bg-[#F8FAFC]">
          {selectedAttachments.map((file) => (
            <span
              key={file.id}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#E8EEF5] text-[11px] font-medium text-[#1B2436] border border-[#D8E2EC]"
            >
              <FileText size={12} className="text-[#E03616]" />
              <span className="truncate max-w-xs">{file.fileName}</span>
              <button
                type="button"
                onClick={() => toggleAttachment(file)}
                className="text-[#64748B] hover:text-[#E03616] cursor-pointer ml-1"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Text Area */}
      <textarea
        ref={textareaRef}
        rows={2}
        placeholder={placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full resize-none bg-transparent p-3 text-xs text-[#0F172A] placeholder-[#64748B] focus:outline-none min-h-[56px]"
      />

      {/* Formatting & Action Bar */}
      <div className="flex items-center justify-between border-t border-[#D8E2EC] px-3 py-2 bg-[#F8FAFC] rounded-b-xl">
        <div className="flex items-center gap-1">
          {/* Markdown formatting buttons */}
          <button
            type="button"
            onClick={() => insertFormatting('**', '**')}
            className="p-1.5 rounded text-[#54657E] hover:text-[#0F172A] hover:bg-[#E8EEF5] transition-colors cursor-pointer"
            title="Bold (**text**)"
          >
            <Bold size={13} />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('*', '*')}
            className="p-1.5 rounded text-[#54657E] hover:text-[#0F172A] hover:bg-[#E8EEF5] transition-colors cursor-pointer"
            title="Italic (*text*)"
          >
            <Italic size={13} />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('`', '`')}
            className="p-1.5 rounded text-[#54657E] hover:text-[#0F172A] hover:bg-[#E8EEF5] transition-colors cursor-pointer"
            title="Inline Code (`code`)"
          >
            <Code size={13} />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('- ')}
            className="p-1.5 rounded text-[#54657E] hover:text-[#0F172A] hover:bg-[#E8EEF5] transition-colors cursor-pointer"
            title="Bullet List (- item)"
          >
            <List size={13} />
          </button>

          <span className="w-[1px] h-4 bg-[#D8E2EC] mx-1" />

          {/* Emoji Picker trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1.5 rounded text-[#54657E] hover:text-[#0F172A] hover:bg-[#E8EEF5] transition-colors cursor-pointer"
              title="Add Emoji"
            >
              <Smile size={14} />
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-8 left-0 z-30 p-2 rounded-xl bg-white border border-[#D8E2EC] shadow-xl flex gap-1 animate-in fade-in">
                {EMOJI_PALETTE.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleAddEmoji(emoji)}
                    className="p-1 rounded hover:bg-[#F0F4F8] text-sm cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* File Attachment trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFilePicker(!showFilePicker)}
              className="p-1.5 rounded text-[#54657E] hover:text-[#0F172A] hover:bg-[#E8EEF5] transition-colors cursor-pointer flex items-center gap-1"
              title="Attach Workspace File"
            >
              <Paperclip size={14} />
            </button>
            {showFilePicker && (
              <div className="absolute bottom-8 left-0 z-30 w-72 rounded-xl bg-white border border-[#D8E2EC] shadow-2xl p-2 max-h-56 overflow-y-auto">
                <div className="px-2 py-1 text-[10px] font-bold text-[#54657E] uppercase border-b border-[#D8E2EC]">
                  Attach Workspace Asset
                </div>
                {availableFiles.map((f) => {
                  const isSelected = selectedAttachments.some((a) => a.id === f.id);
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => toggleAttachment(f)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#E03616]/10 text-[#E03616] font-semibold'
                          : 'hover:bg-[#F8FAFC] text-[#334155]'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="font-medium text-xs truncate">{f.fileName}</div>
                        <div className="text-[10px] text-[#64748B]">{f.category}</div>
                      </div>
                      {isSelected && <span className="text-xs">✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 10% Loud Blood Orange Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!content.trim() && selectedAttachments.length === 0}
          className="rounded-lg bg-[#E03616] px-3 py-1.5 text-white hover:bg-[#C72E14] transition-colors disabled:opacity-30 cursor-pointer shadow-xs flex items-center gap-1.5 font-semibold text-xs"
        >
          <span>Send</span>
          <Send size={12} />
        </button>
      </div>
    </div>
  );
}
