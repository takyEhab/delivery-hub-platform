import React from 'react';
import { Menu, Plus, Package, Sparkles, RotateCcw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { resetDemoData } from '../../api/mockStorage';

export function Topbar({ onOpenSidebar, onNewOrderClick }) {
  const { user, isOwner } = useAuth();
  const { success } = useToast();

  const handleResetDemo = () => {
    resetDemoData();
    success('Demo data restored to initial state!', 'Sandbox Reset');
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-nav border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
          <span className="font-bold text-slate-800">DeliveryHub</span>
          <span>/</span>
          <span className="text-slate-900 font-semibold capitalize">
            {isOwner ? 'Operations Console' : 'Deliveries'}
          </span>
        </div>
      </div>

      {/* Right: Actions, Demo Badge & User pill */}
      <div className="flex items-center gap-3">
        {/* Sandbox Demo Pill & Reset */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>Sandbox Demo</span>
          <button
            type="button"
            onClick={handleResetDemo}
            title="Reset demo data to initial state"
            className="flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-emerald-700" />
            <span className="text-[10px] font-medium">Reset</span>
          </button>
        </div>

        {isOwner && onNewOrderClick && (
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={onNewOrderClick}
            className="hidden sm:inline-flex bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
          >
            Create Order
          </Button>
        )}

        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-900 leading-tight">
              {user?.name}
            </p>
            <p className="text-[10px] text-slate-500">{user?.phone}</p>
          </div>
          <Badge variant={isOwner ? 'success' : 'info'} size="sm" dot>
            {isOwner ? 'Owner' : 'Driver'}
          </Badge>
        </div>
      </div>
    </header>
  );
}
