import React from 'react';

export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-[#0F1622] rounded-xl border border-slate-800/80 text-slate-100 shadow-card transition-all ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', title, description, action }) {
  return (
    <div
      className={`px-5 py-4 border-b border-slate-800/80 flex items-center justify-between gap-4 ${className}`}
    >
      <div>
        {title && <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>}
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
        {children}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return (
    <div
      className={`px-5 py-3.5 bg-[#0B1019] border-t border-slate-800/80 rounded-b-xl flex items-center justify-between ${className}`}
    >
      {children}
    </div>
  );
}
