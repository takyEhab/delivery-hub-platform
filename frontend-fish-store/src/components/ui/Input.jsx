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
          className="block text-xs font-semibold text-slate-300 mb-1.5"
        >
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-subtle">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 flex items-center pl-3.5 rtl:pl-0 rtl:pr-3.5 text-slate-400">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          className={`block w-full rounded-lg border text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-1 focus:ring-offset-0 disabled:bg-slate-900/50 disabled:text-slate-600 ${
            Icon ? 'pl-10 pr-3 rtl:pl-3 rtl:pr-10' : 'px-3.5'
          } py-2.5 bg-[#0B1019] ${
            error
              ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-950/15 text-rose-200'
              : 'border-slate-700/70 focus:border-blue-500 focus:ring-blue-500/20 hover:border-slate-600'
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
