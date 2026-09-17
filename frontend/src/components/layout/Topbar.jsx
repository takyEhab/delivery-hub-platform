import React from 'react';
import { Menu, Plus, Package } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export function Topbar({ onOpenSidebar, onNewOrderClick }) {
  const { user, isOwner } = useAuth();

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
          <span className="font-medium text-slate-700">DeliveryHub</span>
          <span>/</span>
          <span className="text-slate-900 font-semibold capitalize">
            {isOwner ? 'Operations Console' : 'Deliveries'}
          </span>
        </div>
      </div>

      {/* Right: Actions & User pill */}
      <div className="flex items-center gap-3">
        {isOwner && onNewOrderClick && (
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={onNewOrderClick}
            className="hidden sm:inline-flex"
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
