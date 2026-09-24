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
          className="block text-xs font-bold text-slate-300 mb-1.5"
        >
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}
      <div className="relative rounded-xl shadow-sm">
        <select
          id={selectId}
          className={`block w-full rounded-xl border text-sm text-white transition-colors focus:outline-none focus:ring-1 focus:ring-offset-0 disabled:bg-slate-900/60 disabled:text-slate-600 px-3.5 py-2.5 bg-[#020b14] border-slate-700/80 focus:border-cyan-400 ${
            error
              ? 'border-rose-500/60 focus:border-rose-400 bg-rose-950/20'
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
