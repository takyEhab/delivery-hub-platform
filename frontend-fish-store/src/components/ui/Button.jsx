import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:
    'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold shadow-button border border-blue-400/25 active:scale-[0.98] focus-visible:ring-blue-500',
  secondary:
    'bg-[#161F2E] hover:bg-[#1D293D] active:bg-[#121A27] text-slate-200 font-semibold shadow-subtle border border-slate-700/60 active:scale-[0.98] focus-visible:ring-slate-600',
  outline:
    'bg-transparent hover:bg-slate-800/60 active:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 hover:border-slate-600 active:scale-[0.98] focus-visible:ring-slate-500',
  ghost:
    'bg-transparent hover:bg-slate-800/60 active:bg-slate-800 text-slate-400 hover:text-white border border-transparent focus-visible:ring-slate-500',
  danger:
    'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold shadow-button border border-rose-400/30 active:scale-[0.98] focus-visible:ring-rose-500',
  coral:
    'bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-bold shadow-button border border-amber-400/30 active:scale-[0.98] focus-visible:ring-amber-500',
  emerald:
    'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold shadow-button border border-emerald-400/30 active:scale-[0.98] focus-visible:ring-emerald-500',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs font-semibold rounded-lg',
  md: 'px-4 py-2 text-sm font-semibold rounded-xl',
  lg: 'px-5 py-2.5 text-base font-bold rounded-xl',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  ...props
}) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-2 transition-all duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-[#070B12] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />
      )}
      <span>{children}</span>
      {!isLoading && Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4 shrink-0" />
      )}
    </button>
  );
}
