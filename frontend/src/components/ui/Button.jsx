import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:
    'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow active:bg-emerald-800 focus-visible:ring-emerald-500 border border-transparent',
  secondary:
    'bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:shadow active:bg-slate-950 focus-visible:ring-slate-700 border border-transparent',
  outline:
    'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm active:bg-slate-100 focus-visible:ring-emerald-500',
  ghost:
    'bg-transparent hover:bg-slate-100 text-slate-700 active:bg-slate-200 focus-visible:ring-slate-400 border border-transparent',
  danger:
    'bg-rose-600 hover:bg-rose-700 text-white shadow-sm hover:shadow active:bg-rose-800 focus-visible:ring-rose-500 border border-transparent',
};

const sizes = {
  sm: 'px-2.5 py-1.5 text-xs font-medium rounded-lg',
  md: 'px-3.5 py-2 text-sm font-medium rounded-lg',
  lg: 'px-4 py-2.5 text-base font-medium rounded-xl',
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
      className={`inline-flex items-center justify-center gap-2 transition-all duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
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
