import React from 'react';

export function Input({
  label,
  error,
  helperText,
  icon: Icon,
  required = false,
  className = '',
  id,
  type = 'text',
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-bold text-slate-300 mb-1.5"
        >
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}
      <div className="relative rounded-xl shadow-sm">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 flex items-center pl-3.5 rtl:pl-0 rtl:pr-3.5">
            <Icon className="h-4 w-4 text-cyan-400/80" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          className={`block w-full rounded-xl border text-sm text-white placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-1 focus:ring-offset-0 disabled:bg-slate-900/50 disabled:text-slate-600 ${
            Icon ? 'pl-10 pr-3 rtl:pl-3 rtl:pr-10' : 'px-3.5'
          } py-2.5 bg-[#020b14]/80 ${
            error
              ? 'border-rose-500/60 focus:border-rose-400 focus:ring-rose-500/20 bg-rose-950/20 text-rose-200'
              : 'border-slate-700/80 focus:border-cyan-400 focus:ring-cyan-500/20 hover:border-slate-600'
          } ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1 text-xs text-rose-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
}
