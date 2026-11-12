import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Pin,
  Tag,
  Clock,
  Edit3,
  Trash2,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { SharedNoteRecord } from '@/types';

interface SharedNotesViewProps {
  notes: SharedNoteRecord[];
  onCreateNote: (note: SharedNoteRecord) => void;
  onUpdateNote: (noteId: string, updates: Partial<SharedNoteRecord>) => void;
  onDeleteNote: (noteId: string) => void;
  currentUserName: string;
  currentUserRole: string;
}

export function SharedNotesView({
  notes,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
  currentUserName,
  currentUserRole,
}: SharedNotesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeNote, setActiveNote] = useState<SharedNoteRecord | null>(notes[0] || null);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<SharedNoteRecord['category']>('SALES');
  const [linkedEntityType, setLinkedEntityType] = useState<SharedNoteRecord['linkedEntityType']>('CUSTOMER');
  const [linkedEntityName, setLinkedEntityName] = useState('');

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.linkedEntityName && n.linkedEntityName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'ALL' || n.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newNote: SharedNoteRecord = {
      id: `note_${Date.now()}`,
      title: title.trim(),
      content: content.trim() || 'No content drafted.',
      category,
      authorName: currentUserName,
      authorRole: currentUserRole,
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      linkedEntityType,
      linkedEntityName: linkedEntityName.trim() || undefined,
      isPinned: false,
    };

    onCreateNote(newNote);
    setActiveNote(newNote);
    setIsCreateModalOpen(false);

    setTitle('');
    setContent('');
    setLinkedEntityName('');
  };

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D8E2EC] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-[#0F172A]">Shared Operational Notes</h2>
            <Badge variant="slateBlue">Living Docs</Badge>
          </div>
          <p className="mt-0.5 text-xs text-[#54657E]">
            Collaborative knowledge documents with bi-directional lineage to CRM accounts, deals, and ERP invoices.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 text-xs font-semibold"
        >
          <Plus size={14} /> New Shared Note
        </Button>
      </div>

      {/* Main 2-Column Split: Notes List + Editor/Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Notes List */}
        <div className="lg:col-span-4 rounded-xl border border-[#D8E2EC] bg-white overflow-hidden shadow-xs flex flex-col">
          {/* Search & Category Filter */}
          <div className="p-3 border-b border-[#D8E2EC] bg-[#F8FAFC] space-y-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-[#D8E2EC] bg-white pl-8 pr-2.5 py-1.5 text-xs text-[#0F172A] placeholder-[#64748B] focus:border-[#E03616] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
              {(['ALL', 'SALES', 'FINANCE', 'COMPLIANCE', 'ENGINEERING'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-0.5 rounded font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#1B2436] text-white'
                      : 'text-[#54657E] hover:bg-[#E8EEF5]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Notes Scrollable Stack */}
          <div className="divide-y divide-[#D8E2EC] max-h-[560px] overflow-y-auto">
            {filteredNotes.map((note) => {
              const isSelected = activeNote?.id === note.id;
              return (
                <button
                  key={note.id}
                  onClick={() => setActiveNote(note)}
                  className={`w-full p-3.5 text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#F0F4F8] border-l-3 border-[#E03616]'
                      : 'hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#0F172A] truncate max-w-[200px]">
                      {note.title}
                    </span>
                    {note.isPinned && (
                      <Pin size={11} className="text-[#E03616] rotate-45 shrink-0" />
                    )}
                  </div>

                  <p className="mt-1 text-[11px] text-[#64748B] line-clamp-2 leading-relaxed">
                    {note.content.replace(/[#*`-]/g, '')}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between text-[10px]">
                    <span className="font-mono text-[#54657E]">{note.category}</span>
                    {note.linkedEntityName && (
                      <span className="text-[#E03616] font-semibold truncate max-w-[130px]">
                        🔗 {note.linkedEntityName}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Note Detail Viewer */}
        <div className="lg:col-span-8 rounded-xl border border-[#D8E2EC] bg-white p-6 shadow-xs space-y-4 min-h-[580px] flex flex-col justify-between">
          {activeNote ? (
            <div className="space-y-4">
              {/* Note Header */}
              <div className="flex items-start justify-between border-b border-[#D8E2EC] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#0F172A]">
                      {activeNote.title}
                    </h3>
                    <Badge variant="frost" className="text-[10px] text-[#1B2436]">
                      {activeNote.category}
                    </Badge>
                  </div>

                  <div className="mt-1 text-xs text-[#64748B] flex items-center gap-2">
                    <span>Authored by <strong className="text-[#0F172A]">{activeNote.authorName}</strong> ({activeNote.authorRole})</span>
                    <span>·</span>
                    <span className="font-mono">{activeNote.updatedAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateNote(activeNote.id, { isPinned: !activeNote.isPinned })}
                    className={`p-1.5 rounded border transition-colors cursor-pointer ${
                      activeNote.isPinned
                        ? 'border-[#E03616] text-[#E03616] bg-[#E03616]/10'
                        : 'border-[#D8E2EC] text-[#54657E] hover:bg-[#E8EEF5]'
                    }`}
                    title={activeNote.isPinned ? 'Unpin note' : 'Pin note'}
                  >
                    <Pin size={14} className={activeNote.isPinned ? 'rotate-45' : ''} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteNote(activeNote.id)}
                    className="p-1.5 rounded border border-[#D8E2EC] text-[#64748B] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete note"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Bi-Directional Lineage Banner */}
              {activeNote.linkedEntityName && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#F8FAFC] border border-[#D8E2EC] text-xs">
                  <div className="flex items-center gap-2">
                    <Tag size={13} className="text-[#E03616]" />
                    <span className="text-[#54657E]">
                      Bi-Directional Link to {activeNote.linkedEntityType}:
                    </span>
                    <strong className="text-[#0F172A] font-semibold">
                      {activeNote.linkedEntityName}
                    </strong>
                  </div>
                  <span className="text-[10px] text-[#E03616] font-mono font-bold">
                    CONNECTED IN AUDIT
                  </span>
                </div>
              )}

              {/* Note Content */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#D8E2EC] text-xs text-[#1E293B] leading-relaxed whitespace-pre-wrap font-sans">
                {activeNote.content}
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-xs text-[#64748B]">
              Select a note on the left or create a new one to begin editing.
            </div>
          )}

          {activeNote && (
            <div className="border-t border-[#D8E2EC] pt-3 text-[11px] text-[#64748B] flex items-center justify-between font-mono">
              <span>Innowit One Shared Note Engine</span>
              <span>All changes automatically saved to local store</span>
            </div>
          )}
        </div>
      </div>

      {/* Create Note Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Shared Note"
        description="Draft operational knowledge and link it to CRM clients, deals, or tax invoices."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Note Title <span className="text-[#E03616]">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="e.g. NCBA Corporate Treasury Transfer Checklist"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SharedNoteRecord['category'])}
                className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
              >
                <option value="SALES">Commercial / Sales</option>
                <option value="FINANCE">Finance & Accounting</option>
                <option value="COMPLIANCE">eTIMS & Tax Compliance</option>
                <option value="ENGINEERING">Operations & Warehousing</option>
                <option value="GENERAL">General Operational</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Link to Entity Type
              </label>
              <select
                value={linkedEntityType}
                onChange={(e) => setLinkedEntityType(e.target.value as SharedNoteRecord['linkedEntityType'])}
                className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
              >
                <option value="CUSTOMER">Customer Account</option>
                <option value="DEAL">Deals Pipeline</option>
                <option value="INVOICE">Sales Invoice</option>
                <option value="PROJECT">Operational Project</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Linked Entity Name / Identifier
            </label>
            <input
              type="text"
              placeholder="e.g. Safaricom Enterprise PLC or INV-2026-0189"
              value={linkedEntityName}
              onChange={(e) => setLinkedEntityName(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Note Markdown Content
            </label>
            <textarea
              rows={6}
              placeholder="Document executive decisions, meeting minutes, SLA guidelines..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] p-3 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#D8E2EC]">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Shared Note
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
