import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CreateOrderModal } from '../orders/CreateOrderModal';
import { useAuth } from '../../hooks/useAuth';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createOrderOpen, setCreateOrderOpen] = useState(false);
  const { isOwner } = useAuth();
  const navigate = useNavigate();

  const handleOrderCreated = (newOrder) => {
    setCreateOrderOpen(false);
    // Navigate or trigger refresh
    navigate(`/orders/${newOrder.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <Topbar
          onOpenSidebar={() => setSidebarOpen(true)}
          onNewOrderClick={isOwner ? () => setCreateOrderOpen(true) : null}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ openCreateOrder: () => setCreateOrderOpen(true) }} />
        </main>
      </div>

      {/* Global Quick Create Order Modal for Owner */}
      {isOwner && (
        <CreateOrderModal
          isOpen={createOrderOpen}
          onClose={() => setCreateOrderOpen(false)}
          onOrderCreated={handleOrderCreated}
        />
      )}
    </div>
  );
}
