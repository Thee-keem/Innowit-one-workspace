import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
}: ModalProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={cn(
          'w-full rounded-xl border border-[#D8E2EC] bg-white shadow-2xl flex flex-col max-h-[90vh] overflow-hidden',
          maxWidthMap[maxWidth]
        )}
      >
        {/* Header in Alpine Frost / Slate Blue */}
        <div className="flex items-center justify-between border-b border-[#D8E2EC] px-6 py-4 bg-[#F8FAFC]">
          <div>
            <h2 className="text-sm font-bold text-[#0F172A] tracking-wide">{title}</h2>
            {description && (
              <p className="mt-0.5 text-xs text-[#54657E]">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-[#54657E] hover:bg-[#E8EEF5] hover:text-[#0F172A] transition-colors cursor-pointer"
            title="Close (ESC)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">{children}</div>
      </div>
    </div>
  );
}
