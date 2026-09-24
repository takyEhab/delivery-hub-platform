import React from 'react';

const variantClasses = {
  neutral: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
  success: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40',
  warning: 'bg-amber-950/70 text-amber-300 border-amber-500/40',
  info: 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40',
  danger: 'bg-rose-950/70 text-rose-300 border-rose-500/40',
  purple: 'bg-purple-950/70 text-purple-300 border-purple-500/40',
  coral: 'bg-orange-950/70 text-orange-300 border-orange-500/40',
};

const dotClasses = {
  neutral: 'bg-slate-400',
  success: 'bg-emerald-400 animate-pulse',
  warning: 'bg-amber-400 animate-pulse',
  info: 'bg-cyan-400 animate-pulse',
  danger: 'bg-rose-400',
  purple: 'bg-purple-400',
  coral: 'bg-orange-400 animate-pulse',
};

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px] font-semibold' : 'px-2.5 py-1 text-xs font-bold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variantClasses[variant] || variantClasses.neutral} ${sizeClasses} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClasses[variant] || dotClasses.neutral}`}
        />
      )}
      {children}
    </span>
  );
}
