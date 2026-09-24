import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:
    'bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold shadow-md shadow-cyan-500/20 active:from-cyan-600 active:to-teal-600 focus-visible:ring-cyan-400 border border-cyan-300/30',
  secondary:
    'bg-slate-800 hover:bg-slate-700 text-white shadow-sm hover:shadow active:bg-slate-900 focus-visible:ring-slate-700 border border-slate-700/80',
  outline:
    'bg-transparent hover:bg-cyan-950/50 text-cyan-300 border border-cyan-700/60 shadow-sm active:bg-cyan-900/60 focus-visible:ring-cyan-500',
  ghost:
    'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white active:bg-slate-800 focus-visible:ring-slate-500 border border-transparent',
  danger:
    'bg-rose-600 hover:bg-rose-500 text-white shadow-sm hover:shadow active:bg-rose-700 focus-visible:ring-rose-500 border border-transparent',
  coral:
    'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-bold shadow-md shadow-orange-500/25 border border-orange-300/30',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs font-semibold rounded-xl',
  md: 'px-4 py-2 text-sm font-bold rounded-xl',
  lg: 'px-5 py-3 text-base font-extrabold rounded-2xl',
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
