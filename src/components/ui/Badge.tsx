import * as React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'bloodOrange'
  | 'slateBlue'
  | 'frost'
  | 'neutral'
  | 'success'
  | 'danger'
  | 'warning'
  | 'sandbox'
  | 'teal';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  bloodOrange: 'bg-[#E03616]/10 text-[#E03616] border border-[#E03616]/30',
  slateBlue: 'bg-[#1B2436] text-slate-100 border border-[#2D3A52]',
  frost: 'bg-[#E8EEF5] text-[#334155] border border-[#D8E2EC]',
  neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  danger: 'bg-red-50 text-[#E03616] border border-[#E03616]/30',
  warning: 'bg-amber-50 text-amber-800 border border-amber-200',
  sandbox: 'bg-[#1B2436] text-slate-200 border border-[#2D3A52]',
  teal: 'bg-[#E03616]/10 text-[#E03616] border border-[#E03616]/30',
};

export function Badge({ className, variant = 'frost', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase transition-colors whitespace-nowrap',
        variantStyles[variant] || variantStyles.frost,
        className
      )}
      {...props}
    />
  );
}
