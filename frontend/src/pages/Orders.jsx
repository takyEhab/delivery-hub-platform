import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useLocation, useNavigate } from 'react-router-dom';
import { listOrders } from '../api/orders';
import { listDrivers } from '../api/drivers';
import { getErrorMessage } from '../api/client';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { OrderTable } from '../components/orders/OrderTable';
import { AssignDriverModal } from '../components/orders/AssignDriverModal';
import { Button } from '../components/ui/Button';
import { TableSkeleton } from '../components/ui/Skeleton';
import {
  Package,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Truck,
  CheckCircle2,
  Clock,
  Bike,
  History,
  UserPlus,
  Users,
} from 'lucide-react';

export function Orders({ isHistoryView = false }) {
  const { isOwner, isDriver } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { openCreateOrder } = useOutletContext() || {};
  const { error: toastError } = useToast();

  const isHistory = isHistoryView || location.pathname === '/orders/history';

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

  const handleOrderDeleted = (deletedOrderId) => {
    setOrders((prev) => prev.filter((o) => o.id !== deletedOrderId));
  };

  // Counts for tabs
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const inDeliveryCount = orders.filter((o) => o.status === 'out_for_delivery').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const activeOrdersCount = orders.filter((o) => o.status !== 'delivered').length;
  const totalOrdersCount = orders.length;

  // Client-side filtering across orders
  const filteredOrders = orders.filter((order) => {
    // In Active Deliveries view for Driver: automatically hide delivered orders!
    if (isDriver && !isHistory && order.status === 'delivered') {
      return false;
    }

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

    // Text search (Order ID, Customer Name, Customer Phone, Address)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = String(order.id).includes(q);
      const matchCustName = order.customer?.name?.toLowerCase().includes(q);
      const matchCustPhone = order.customer?.phone?.includes(q);
      const matchAddress = order.customer?.address?.toLowerCase().includes(q);
      const matchDriver = order.driver?.name?.toLowerCase().includes(q);

      if (!matchId && !matchCustName && !matchCustPhone && !matchAddress && !matchDriver) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isDriver
                ? isHistory
                  ? 'Delivery History'
                  : 'Active Deliveries'
                : 'Orders Dispatch'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-200/70 text-slate-700 text-xs font-semibold">
              {filteredOrders.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isDriver
              ? isHistory
                ? 'Archive of all completed and past delivery orders.'
                : 'Deliveries in progress. When you deliver an order it will disappear from this queue automatically.'
              : 'Dispatch and monitor customer orders across the delivery lifecycle.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">

          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => fetchOrders()}
            className="text-xs"
          >
            Refresh
          </Button>

          {isOwner && (
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={openCreateOrder}
              className="text-xs"
            >
              Create Order
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-card space-y-3">
        {/* Status Tab Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isDriver && !isHistory
              ? `All Active (${activeOrdersCount})`
              : `All Orders (${orders.length})`}
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('preparing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              statusFilter === 'preparing'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Preparing ({preparingCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('out_for_delivery')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              statusFilter === 'out_for_delivery'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Out for Delivery ({inDeliveryCount})
          </button>

          {(!isDriver || isHistory) && (
            <button
              type="button"
              onClick={() => setStatusFilter('delivered')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                statusFilter === 'delivered'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Delivered ({deliveredCount})
            </button>
          )}
        </div>

        {/* Search and Secondary Selects */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1 max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by ID, customer, address, or driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 text-sm placeholder:text-slate-400 pl-9 pr-3 py-1.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-colors"
            />
          </div>

          {/* Driver filter dropdown for Owner */}
          {isOwner && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 whitespace-nowrap">
                Filter Driver:
              </span>
              <select
                value={driverFilter}
                onChange={(e) => setDriverFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">All Drivers</option>
                <option value="unassigned">Unassigned Only</option>
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
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <TableSkeleton rows={6} cols={6} />
        </div>
      ) : filteredOrders.length === 0 && isDriver && !isHistory ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-3xl shadow-sm">
            🎉
          </div>
          <div className="max-w-md space-y-1.5">
            <h3 className="text-lg font-bold text-slate-900">
              All Deliveries Completed!
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No active delivery tasks pending right now. All assigned orders have been delivered. You can check order history or add new customers.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <Button
              variant="primary"
              size="sm"
              icon={History}
              onClick={() => {
                setStatusFilter('all');
                navigate('/orders/history');
              }}
              className="text-xs"
            >
              View Order History
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={UserPlus}
              onClick={() => navigate('/driver/customers')}
              className="text-xs"
            >
              Add Customers
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => fetchOrders()}
              className="text-xs"
            >
              Refresh
            </Button>
          </div>
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
