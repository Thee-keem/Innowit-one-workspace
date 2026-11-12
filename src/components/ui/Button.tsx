import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'ghost'
  | 'brandOrange';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  // 10% Loud Blood Orange for Primary Action
  primary: 'bg-[#E03616] text-white font-semibold hover:bg-[#C72E14] shadow-sm',
  // 30% Slate Blue for Secondary Action
  secondary: 'bg-[#1B2436] text-white border border-[#2D3A52] hover:bg-[#27334D]',
  // Loud Blood Orange for destructive/critical
  destructive: 'bg-[#E03616] text-white font-semibold hover:bg-[#C72E14] shadow-sm',
  // Alpine Frost Outline
  outline: 'border border-[#D8E2EC] bg-white text-[#334155] hover:bg-[#E8EEF5] hover:text-[#0F172A]',
  ghost: 'bg-transparent text-[#475569] hover:bg-[#E8EEF5] hover:text-[#0F172A]',
  brandOrange: 'bg-[#E03616] text-white font-semibold hover:bg-[#C72E14] shadow-sm',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4 text-[13px]',
  lg: 'h-11 px-6 text-sm',
  icon: 'h-9 w-9 p-0 flex items-center justify-center',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E03616] disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] cursor-pointer whitespace-nowrap',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
