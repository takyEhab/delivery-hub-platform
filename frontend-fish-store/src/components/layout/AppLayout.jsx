import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CreateOrderModal } from '../orders/CreateOrderModal';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createOrderOpen, setCreateOrderOpen] = useState(false);
  const { isOwner } = useAuth();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  const handleOrderCreated = (newOrder) => {
    setCreateOrderOpen(false);
    navigate(`/orders/${newOrder.id}`);
  };

  return (
    <div className="min-h-screen bg-[#031326] text-slate-100 flex flex-col relative overflow-x-hidden">
      {/* Oceanic ambient backdrop light */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[350px] bg-cyan-600/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="fixed bottom-0 right-10 w-[500px] h-[350px] bg-ocean-600/10 blur-[130px] pointer-events-none rounded-full" />

      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area - dynamically adjusts padding based on RTL/LTR */}
      <div
        className={`flex flex-col flex-1 min-w-0 transition-all duration-200 ${
          isRTL ? 'lg:pr-64' : 'lg:pl-64'
        }`}
      >
        <Topbar
          onOpenSidebar={() => setSidebarOpen(true)}
          onNewOrderClick={isOwner ? () => setCreateOrderOpen(true) : null}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto relative z-10">
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
