import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { listOrders } from '../api/orders';
import { listDrivers } from '../api/drivers';
import { getErrorMessage } from '../api/client';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import { OrderTable } from '../components/orders/OrderTable';
import { AssignDriverModal } from '../components/orders/AssignDriverModal';
import { Button } from '../components/ui/Button';
import { TableSkeleton } from '../components/ui/Skeleton';
import {
  Fish,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Truck,
  CheckCircle2,
  Clock,
  Flame,
} from 'lucide-react';

export function Orders() {
  const { isOwner, isDriver } = useAuth();
  const { t, language } = useLanguage();
  const { openCreateOrder } = useOutletContext() || {};
  const { error: toastError } = useToast();

  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'preparing' | 'out_for_delivery' | 'delivered'
  const [driverFilter, setDriverFilter] = useState('all'); // 'all' | 'unassigned' | <driverId>
  const [searchQuery, setSearchQuery] = useState('');

  // Assign Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isOwner) {
        const [ordersData, driversData] = await Promise.all([
          listOrders(),
          listDrivers(),
        ]);
        setOrders(ordersData || []);
        setDrivers(driversData || []);
      } else {
        const ordersData = await listOrders();
        setOrders(ordersData || []);
      }
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [isOwner, toastError]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleAssignClick = (order) => {
    setSelectedOrderForAssign(order);
    setAssignModalOpen(true);
  };

  const handleStatusUpdated = (updatedOrder) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
    );
  };

  // Client-side filtering across orders
  const filteredOrders = orders.filter((order) => {
    // Status filter
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }

    // Driver filter (owner only)
    if (isOwner && driverFilter !== 'all') {
      if (driverFilter === 'unassigned') {
        if (order.assigned_driver_id) return false;
      } else if (String(order.assigned_driver_id) !== String(driverFilter)) {
        return false;
      }
    }

    // Text search (Order ID, Customer Name, Customer Phone, Address, items)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = String(order.id).includes(q);
      const matchCustName = order.customer?.name?.toLowerCase().includes(q);
      const matchCustPhone = order.customer?.phone?.includes(q);
      const matchAddress = order.customer?.address?.toLowerCase().includes(q);
      const matchDriver = order.driver?.name?.toLowerCase().includes(q);
      const matchItems = Array.isArray(order.items)
        ? order.items.some((it) => (it.name || it.description || '').toLowerCase().includes(q))
        : String(order.items || '').toLowerCase().includes(q);

      if (!matchId && !matchCustName && !matchCustPhone && !matchAddress && !matchDriver && !matchItems) {
        return false;
      }
    }

    return true;
  });

  // Counts for tabs
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const inDeliveryCount = orders.filter((o) => o.status === 'out_for_delivery').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Fish className="w-6 h-6 text-cyan-400 stroke-[2.2]" />
              <span>{isDriver ? t('nav_my_deliveries') : t('orders_title')}</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/40 text-xs font-bold">
              {filteredOrders.length}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            {isDriver
              ? (language === 'ar' ? 'الطلبات المسندة إليك لتسليمها لزبائن أمير البحار.' : 'Orders assigned to you for delivery. Tap status buttons to advance.')
              : t('orders_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => fetchOrders()}
            className="text-xs border-cyan-700/60 text-cyan-300 hover:bg-cyan-950/40"
          >
            {t('refresh')}
          </Button>

          {isOwner && (
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={openCreateOrder}
              className="text-xs bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold border-0 shadow-md shadow-cyan-500/20"
            >
              {t('create_order')}
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-[#05172b]/90 p-4 rounded-2xl border border-cyan-900/40 shadow-xl space-y-3">
        {/* Status Tab Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === 'all'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {t('filter_all')} ({orders.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('preparing')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              statusFilter === 'preparing'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-amber-950/40 text-amber-300 border border-amber-500/30 hover:bg-amber-900/40'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            {t('filter_preparing')} ({preparingCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('out_for_delivery')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              statusFilter === 'out_for_delivery'
                ? 'bg-sky-500 text-slate-950 shadow-md'
                : 'bg-sky-950/40 text-sky-300 border border-sky-500/30 hover:bg-sky-900/40'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            {t('filter_out_for_delivery')} ({inDeliveryCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('delivered')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              statusFilter === 'delivered'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/40'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t('filter_delivered')} ({deliveredCount})
          </button>
        </div>

        {/* Search and Secondary Selects */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-cyan-950/80">
          <div className="relative flex-1 max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 flex items-center pl-3 rtl:pl-0 rtl:pr-3">
              <Search className="h-4 w-4 text-cyan-400/80" />
            </div>
            <input
              type="text"
              placeholder={t('search_orders_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-xl border border-slate-700/80 bg-[#020b14]/80 text-sm text-white placeholder:text-slate-500 pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 focus:border-cyan-400 focus:outline-none transition-colors"
            />
          </div>

          {/* Driver filter dropdown for Owner */}
          {isOwner && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300 whitespace-nowrap">
                {language === 'ar' ? 'تصفية بالكابتن:' : 'Filter Courier:'}
              </span>
              <select
                value={driverFilter}
                onChange={(e) => setDriverFilter(e.target.value)}
                className="text-xs bg-[#020b14] border border-slate-700/80 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400"
              >
                <option value="all">{language === 'ar' ? 'جميع الكباتن' : 'All Couriers'}</option>
                <option value="unassigned">{language === 'ar' ? 'بدون كابتن بعد' : 'Unassigned Only'}</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Orders Table & Cards */}
      {isLoading ? (
        <div className="bg-[#05172b]/90 rounded-2xl border border-cyan-900/40 p-4">
          <TableSkeleton rows={6} cols={6} />
        </div>
      ) : (
        <OrderTable
          orders={filteredOrders}
          onAssignClick={handleAssignClick}
          onStatusUpdated={handleStatusUpdated}
          isOwner={isOwner}
          isDriver={isDriver}
        />
      )}

      {/* Assign Driver Modal */}
      {selectedOrderForAssign && (
        <AssignDriverModal
          isOpen={assignModalOpen}
          order={selectedOrderForAssign}
          onClose={() => {
            setAssignModalOpen(false);
            setSelectedOrderForAssign(null);
          }}
          onSuccess={() => fetchOrders()}
        />
      )}
    </div>
  );
}
