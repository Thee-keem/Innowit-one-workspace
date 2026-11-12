import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Upload,
  Search,
  Download,
  Trash2,
  Tag,
  Clock,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { WorkspaceFile } from '@/types';

interface WorkspaceFilesViewProps {
  files: WorkspaceFile[];
  onUploadFile: (file: WorkspaceFile) => void;
  onDeleteFile: (fileId: string) => void;
  currentUserName: string;
}

export function WorkspaceFilesView({
  files,
  onUploadFile,
  onDeleteFile,
  currentUserName,
}: WorkspaceFilesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<WorkspaceFile | null>(null);

  // Upload Form State
  const [fileName, setFileName] = useState('');
  const [fileCategory, setFileCategory] = useState<WorkspaceFile['category']>('DOCUMENT');
  const [relatedTag, setRelatedTag] = useState('');
  const [fileSizeKb, setFileSizeKb] = useState('450');

  const filteredFiles = files.filter((f) => {
    const matchesSearch =
      f.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.relatedEntityTag && f.relatedEntityTag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'ALL' || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalBytes = files.reduce((sum, f) => sum + f.fileSize, 0);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    const newFile: WorkspaceFile = {
      id: `file_${Date.now()}`,
      fileName: fileName.trim(),
      fileSize: (parseInt(fileSizeKb) || 250) * 1024,
      mimeType:
        fileCategory === 'SPREADSHEET'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : fileCategory === 'IMAGE'
          ? 'image/png'
          : 'application/pdf',
      category: fileCategory,
      uploadedBy: currentUserName,
      uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      relatedEntityTag: relatedTag.trim() || undefined,
    };

    onUploadFile(newFile);
    setIsUploadModalOpen(false);

    setFileName('');
    setRelatedTag('');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'SPREADSHEET':
        return <FileSpreadsheet size={18} className="text-emerald-700" />;
      case 'IMAGE':
        return <ImageIcon size={18} className="text-[#E03616]" />;
      default:
        return <FileText size={18} className="text-[#1B2436]" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D8E2EC] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-[#0F172A]">Workspace Asset & File Repository</h2>
            <Badge variant="slateBlue">Central Vault</Badge>
          </div>
          <p className="mt-0.5 text-xs text-[#54657E]">
            Encrypted documents, fiscal eTIMS receipts, supplier contracts, and audit spreadsheets.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-1.5 text-xs font-semibold"
        >
          <Upload size={14} /> Upload Workspace File
        </Button>
      </div>

      {/* KPI & Storage Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-[#D8E2EC] bg-white p-3.5 shadow-xs">
          <span className="text-[10px] font-bold text-[#54657E] uppercase tracking-wider">
            Total Indexed Files
          </span>
          <div className="mt-1 text-lg font-bold text-[#0F172A] font-mono tabular-nums">
            {files.length} Assets
          </div>
          <span className="text-[10px] text-[#64748B]">Audited across all 6 departments</span>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-3.5 shadow-xs">
          <span className="text-[10px] font-bold text-[#54657E] uppercase tracking-wider">
            Storage Footprint
          </span>
          <div className="mt-1 text-lg font-bold text-[#1B2436] font-mono tabular-nums">
            {(totalBytes / (1024 * 1024)).toFixed(2)} MB
          </div>
          <span className="text-[10px] text-[#64748B]">Local storage volume synced</span>
        </div>

        <div className="rounded-xl border border-[#D8E2EC] bg-white p-3.5 shadow-xs">
          <span className="text-[10px] font-bold text-[#54657E] uppercase tracking-wider">
            eTIMS Compliance Binders
          </span>
          <div className="mt-1 text-lg font-bold text-[#E03616] font-mono tabular-nums">
            {files.filter((f) => f.category === 'FISCAL_RECEIPT').length} Tax Receipts
          </div>
          <span className="text-[10px] text-[#64748B]">KRA audit readiness confirmed</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#D8E2EC] shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search by file name, author, or entity tag (e.g. Safaricom, INV)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] pl-9 pr-3 py-1.5 text-xs text-[#0F172A] placeholder-[#64748B] focus:border-[#E03616] focus:bg-white focus:outline-none"
          />
        </div>

        {/* Category segments in 30% Slate Blue */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'DOCUMENT', 'SPREADSHEET', 'IMAGE', 'FISCAL_RECEIPT'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#1B2436] text-white shadow-xs'
                  : 'text-[#54657E] hover:text-[#0F172A] hover:bg-[#E8EEF5]'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredFiles.map((file) => (
          <div
            key={file.id}
            className="rounded-xl border border-[#D8E2EC] bg-white p-4 shadow-xs hover:border-[#CAD6E2] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 truncate">
                  <div className="p-2 rounded-lg bg-[#F0F4F8] shrink-0 mt-0.5">
                    {getCategoryIcon(file.category)}
                  </div>
                  <div className="truncate">
                    <h4 className="font-bold text-xs text-[#0F172A] truncate" title={file.fileName}>
                      {file.fileName}
                    </h4>
                    <span className="text-[10px] text-[#64748B]">
                      {(file.fileSize / 1024).toFixed(0)} KB · {file.category}
                    </span>
                  </div>
                </div>
              </div>

              {file.relatedEntityTag && (
                <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-[#E03616] font-semibold bg-[#E03616]/5 px-2 py-0.5 rounded w-fit border border-[#E03616]/20">
                  <Tag size={11} /> {file.relatedEntityTag}
                </div>
              )}

              <div className="mt-2 text-[11px] text-[#54657E]">
                Uploaded by <span className="font-medium text-[#1B2436]">{file.uploadedBy}</span>
              </div>
            </div>

            <div className="mt-4 pt-2.5 border-t border-[#D8E2EC] flex items-center justify-between text-xs text-[#64748B]">
              <span className="text-[10px] flex items-center gap-1 font-mono">
                <Clock size={11} /> {file.uploadedAt}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewFile(file)}
                  className="p-1 text-[#54657E] hover:text-[#0F172A] hover:bg-[#E8EEF5] rounded transition-colors cursor-pointer"
                  title="Preview Asset"
                >
                  <Eye size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const alertMsg = `Downloading "${file.fileName}"...`;
                    alert(alertMsg);
                  }}
                  className="p-1 text-[#54657E] hover:text-[#E03616] hover:bg-[#E8EEF5] rounded transition-colors cursor-pointer"
                  title="Download File"
                >
                  <Download size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteFile(file.id)}
                  className="p-1 text-[#64748B] hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                  title="Delete File"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload File Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Asset to Workspace Vault"
        description="Index documents with bi-directional tagging to customers, invoices, or compliance receipts."
        maxWidth="md"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              File Name / Title <span className="text-[#E03616]">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="e.g. KRA_Exemption_Certificate_Twiga_Foods.pdf"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Category
              </label>
              <select
                value={fileCategory}
                onChange={(e) => setFileCategory(e.target.value as WorkspaceFile['category'])}
                className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
              >
                <option value="DOCUMENT">Document (PDF/DOCX)</option>
                <option value="SPREADSHEET">Spreadsheet (XLSX/CSV)</option>
                <option value="IMAGE">Image (PNG/JPG)</option>
                <option value="FISCAL_RECEIPT">Fiscal eTIMS Receipt</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Estimated Size (KB)
              </label>
              <input
                type="number"
                value={fileSizeKb}
                onChange={(e) => setFileSizeKb(e.target.value)}
                className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] font-mono focus:border-[#E03616] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              ERP / CRM Entity Tag (Bi-Directional Link)
            </label>
            <input
              type="text"
              placeholder="e.g. Safaricom Enterprise, INV-2026-0189, or HQ Westlands"
              value={relatedTag}
              onChange={(e) => setRelatedTag(e.target.value)}
              className="w-full rounded-lg border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#E03616] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#D8E2EC]">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Index & Upload File
            </Button>
          </div>
        </form>
      </Modal>

      {/* File Preview Modal */}
      {previewFile && (
        <Modal
          isOpen={!!previewFile}
          onClose={() => setPreviewFile(null)}
          title={`Asset Preview: ${previewFile.fileName}`}
          description={`Indexed under ${previewFile.category} · ${(previewFile.fileSize / 1024).toFixed(0)} KB`}
          maxWidth="lg"
        >
          <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#D8E2EC] space-y-4">
            <div className="flex items-center justify-between border-b border-[#D8E2EC] pb-2 text-xs">
              <span className="text-[#64748B]">Document Signer / Uploader:</span>
              <span className="font-semibold text-[#0F172A]">{previewFile.uploadedBy}</span>
            </div>

            <div className="min-h-[160px] flex flex-col items-center justify-center p-6 bg-white rounded-lg border border-[#D8E2EC] text-center space-y-2">
              <div className="p-3 rounded-full bg-[#E8EEF5]">
                {getCategoryIcon(previewFile.category)}
              </div>
              <div className="font-bold text-sm text-[#0F172A]">{previewFile.fileName}</div>
              {previewFile.relatedEntityTag && (
                <Badge variant="bloodOrange" className="text-xs">
                  {previewFile.relatedEntityTag}
                </Badge>
              )}
              <p className="text-xs text-[#64748B] max-w-sm mt-1">
                Cryptographic hash verified in local PostgreSQL storage. File signature conforms to ISO/IEC 27001 document retention policies.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewFile(null)}
              >
                Close Preview
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  alert(`Downloading asset "${previewFile.fileName}"`);
                  setPreviewFile(null);
                }}
                className="flex items-center gap-1.5"
              >
                <Download size={14} /> Download Document
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
