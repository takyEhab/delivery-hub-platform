import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CreateOrderModal } from '../orders/CreateOrderModal';
import { CustomerModal } from '../customers/CustomerModal';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createOrderOpen, setCreateOrderOpen] = useState(false);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const { isOwner, isDriver } = useAuth();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  const handleOrderCreated = (newOrder) => {
    setCreateOrderOpen(false);
    navigate(`/orders/${newOrder.id}`);
  };

  return (
    <div className="min-h-screen bg-[#070B12] text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-blue-600/30 selection:text-white">
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
          onAddCustomerClick={isDriver ? () => navigate('/driver/customers') : () => setAddCustomerOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto relative z-10">
          <Outlet
            context={{
              openCreateOrder: () => setCreateOrderOpen(true),
              openAddCustomer: isDriver ? () => navigate('/driver/customers') : () => setAddCustomerOpen(true),
            }}
          />
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

      {/* Global Quick Add Customer Modal for Driver or Owner */}
      <CustomerModal
        isOpen={addCustomerOpen}
        onClose={() => setAddCustomerOpen(false)}
        isOwner={isOwner}
        onSuccess={() => {
          setAddCustomerOpen(false);
        }}
      />
    </div>
  );
}
