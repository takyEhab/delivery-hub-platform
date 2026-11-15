import React from 'react';

const variantClasses = {
  neutral: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
  success: 'bg-emerald-950/70 text-emerald-300 border-emerald-600/40',
  warning: 'bg-amber-950/70 text-amber-300 border-amber-600/40',
  info: 'bg-blue-950/70 text-blue-300 border-blue-600/40',
  danger: 'bg-rose-950/70 text-rose-300 border-rose-600/40',
  purple: 'bg-purple-950/70 text-purple-300 border-purple-600/40',
  coral: 'bg-orange-950/70 text-orange-300 border-orange-600/40',
};

const dotClasses = {
  neutral: 'bg-slate-400',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  info: 'bg-blue-400',
  danger: 'bg-rose-400',
  purple: 'bg-purple-400',
  coral: 'bg-orange-400',
};

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) {
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px] font-semibold'
      : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-sans ${variantClasses[variant] || variantClasses.neutral} ${sizeClasses} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClasses[variant] || dotClasses.neutral}`}
        />
      )}
      <span>{children}</span>
    </span>
  );
}
