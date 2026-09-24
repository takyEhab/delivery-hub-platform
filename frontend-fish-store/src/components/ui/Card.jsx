import React from 'react';

export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-[#06182c]/80 backdrop-blur-xl rounded-2xl border border-cyan-900/35 text-slate-100 shadow-lg shadow-black/40 transition-all ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', title, description, action }) {
  return (
    <div
      className={`px-5 py-4 border-b border-cyan-950/80 flex items-center justify-between gap-4 ${className}`}
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
      className={`px-5 py-3.5 bg-[#031120]/90 border-t border-cyan-950/80 rounded-b-2xl flex items-center justify-between ${className}`}
    >
      {children}
    </div>
  );
}
