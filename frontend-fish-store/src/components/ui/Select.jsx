import React from 'react';

export function Select({
  label,
  error,
  helperText,
  required = false,
  className = '',
  id,
  children,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-slate-300 mb-1.5"
        >
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-subtle">
        <select
          id={selectId}
          className={`block w-full rounded-lg border text-sm text-slate-100 transition-colors focus:outline-none focus:ring-1 focus:ring-offset-0 disabled:bg-slate-900/60 disabled:text-slate-600 px-3.5 py-2.5 bg-[#0B1019] border-slate-700/70 focus:border-blue-500 focus:ring-blue-500/20 ${
            error
              ? 'border-rose-500/80 focus:border-rose-500 bg-rose-950/20'
              : 'hover:border-slate-600'
          } ${className}`}
          {...props}
        >
          {children}
        </select>
      </div>
      {error ? (
        <p className="mt-1 text-xs text-rose-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
}
