import React from 'react';

const variantClasses = {
  neutral: 'bg-slate-100 text-slate-700 border-slate-200/80',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  warning: 'bg-amber-50 text-amber-800 border-amber-200/80',
  info: 'bg-sky-50 text-sky-700 border-sky-200/80',
  danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
  purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
};

const dotClasses = {
  neutral: 'bg-slate-400',
  success: 'bg-emerald-500 animate-pulse',
  warning: 'bg-amber-500',
  info: 'bg-sky-500 animate-pulse',
  danger: 'bg-rose-500',
  purple: 'bg-purple-500',
};

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variantClasses[variant] || variantClasses.neutral} ${sizeClasses} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotClasses[variant] || dotClasses.neutral}`}
        />
      )}
      {children}
    </span>
  );
}
