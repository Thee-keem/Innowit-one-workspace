import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ChannelRecord } from '@/types';
import { Hash, Lock, Globe } from 'lucide-react';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChannel: (channel: ChannelRecord) => void;
  currentUserId: string;
}

export function CreateChannelModal({
  isOpen,
  onClose,
  onCreateChannel,
  currentUserId,
}: CreateChannelModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const handleNameChange = (val: string) => {
    // Auto format to kebab-case
    const formatted = val
      .toLowerCase()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    setName(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newChannel: ChannelRecord = {
      id: `ch_${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'Workspace operational discussion space.',
      topic: topic.trim() || undefined,
      isPrivate,
      memberCount: 1,
      createdById: currentUserId,
      createdAt: new Date().toISOString().slice(0, 10),
      unreadCount: 0,
    };

    onCreateChannel(newChannel);
    onClose();

    // Reset
    setName('');
    setDescription('');
    setTopic('');
    setIsPrivate(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Channel"
      description="Channels are shared spaces where teams organize discussions around projects, branches, or operations."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1">
            Channel Name <span className="text-[#E03616]">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
              #
            </span>
            <input
              required
              autoFocus
              type="text"
              placeholder="e.g. kra-compliance-audit"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] pl-8 pr-3 py-1.5 text-xs text-[#0F172A] font-mono focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>
          <p className="mt-1 text-[11px] text-[#64748B]">
            Names must be lowercase kebab-case without spaces or special characters.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1">
            Purpose & Description
          </label>
          <textarea
            rows={2}
            placeholder="What is this channel about? (e.g. Q4 financial closing, regional transport logs)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1">
            Header Topic
          </label>
          <input
            type="text"
            placeholder="e.g. Active project sprint · Sprint Lead: Alex Kibet"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
          />
        </div>

        {/* Visibility Type Selector */}
        <div className="pt-2 border-t border-[#D8E2EC]">
          <label className="block text-xs font-semibold text-[#0F172A] mb-2">
            Channel Privacy
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsPrivate(false)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                !isPrivate
                  ? 'border-[#E03616] bg-[#E03616]/5 ring-1 ring-[#E03616]/30'
                  : 'border-[#D8E2EC] bg-[#F8FAFC] hover:bg-[#E8EEF5]'
              }`}
            >
              <Globe size={16} className={!isPrivate ? 'text-[#E03616]' : 'text-[#64748B]'} />
              <div>
                <div className="text-xs font-bold text-[#0F172A]">Public</div>
                <div className="text-[10px] text-[#64748B]">Anyone in the workspace can view and join</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIsPrivate(true)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                isPrivate
                  ? 'border-[#E03616] bg-[#E03616]/5 ring-1 ring-[#E03616]/30'
                  : 'border-[#D8E2EC] bg-[#F8FAFC] hover:bg-[#E8EEF5]'
              }`}
            >
              <Lock size={16} className={isPrivate ? 'text-[#E03616]' : 'text-[#64748B]'} />
              <div>
                <div className="text-xs font-bold text-[#0F172A]">Private</div>
                <div className="text-[10px] text-[#64748B]">Only invited members can view discussions</div>
              </div>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#D8E2EC]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={!name.trim()}>
            Create Channel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
