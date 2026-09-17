import React, { useState, useEffect, useCallback } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { listOrders } from '../api/orders';
import { listCustomers } from '../api/customers';
import { listDrivers } from '../api/drivers';
import { getErrorMessage } from '../api/client';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CustomerModal } from '../components/customers/CustomerModal';
import { DriverModal } from '../components/drivers/DriverModal';
import { AssignDriverModal } from '../components/orders/AssignDriverModal';
import {
  formatStatus,
  getStatusBadgeVariant,
  formatShortDate,
} from '../utils/formatters';
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  Users,
  Plus,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Phone,
  UserCheck,
} from 'lucide-react';

export function Dashboard() {
  const { isOwner, user } = useAuth();
  const { openCreateOrder } = useOutletContext() || {};
  const { error: toastError } = useToast();

  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState(null);

  const fetchData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      if (isOwner) {
        const [ordersData, customersData, driversData] = await Promise.all([
          listOrders(),
          listCustomers(),
          listDrivers(),
        ]);
        setOrders(ordersData || []);
        setCustomers(customersData || []);
        setDrivers(driversData || []);
      } else {
        const ordersData = await listOrders();
        setOrders(ordersData || []);
      }
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isOwner, toastError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived metrics
  const totalOrders = orders.length;
  const preparingOrders = orders.filter((o) => o.status === 'preparing').length;
  const outForDeliveryOrders = orders.filter(
    (o) => o.status === 'out_for_delivery'
  ).length;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
  const activeDrivers = drivers.filter((d) => d.is_active).length;
  const totalCustomers = customers.length;

  const recentOrders = orders.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Page Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Welcome back, {user?.name}. Here is the real-time status of your delivery operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            isLoading={isRefreshing}
            onClick={() => fetchData(true)}
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
              New Order
            </Button>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <Card className="p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">
              {isLoading ? '—' : totalOrders}
            </span>
            <span className="text-[11px] text-slate-400">recorded</span>
          </div>
        </Card>

        {/* Preparing */}
        <Card className="p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Preparing</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-amber-600">
              {isLoading ? '—' : preparingOrders}
            </span>
            <span className="text-[11px] text-slate-400">in kitchen</span>
          </div>
        </Card>

        {/* Out for Delivery */}
        <Card className="p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              In Delivery
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-sky-600">
              {isLoading ? '—' : outForDeliveryOrders}
            </span>
            <span className="text-[11px] text-slate-400">on the road</span>
          </div>
        </Card>

        {/* Delivered Orders */}
        <Card className="p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Completed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-600">
              {isLoading ? '—' : deliveredOrders}
            </span>
            <span className="text-[11px] text-slate-400">delivered</span>
          </div>
        </Card>
      </div>

      {/* Secondary Row: Quick Actions Bar (for Owner) */}
      {isOwner && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={openCreateOrder}
            className="cursor-pointer bg-white hover:bg-emerald-50/50 p-4 rounded-xl border border-slate-200/80 shadow-card hover:border-emerald-300 transition-all flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Create Order
              </h4>
              <p className="text-[11px] text-slate-500">
                New delivery with existing or inline customer
              </p>
            </div>
          </div>

          <div
            onClick={() => setCustomerModalOpen(true)}
            className="cursor-pointer bg-white hover:bg-emerald-50/50 p-4 rounded-xl border border-slate-200/80 shadow-card hover:border-emerald-300 transition-all flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Add Customer
              </h4>
              <p className="text-[11px] text-slate-500">
                {totalCustomers} registered customers
              </p>
            </div>
          </div>

          <div
            onClick={() => setDriverModalOpen(true)}
            className="cursor-pointer bg-white hover:bg-emerald-50/50 p-4 rounded-xl border border-slate-200/80 shadow-card hover:border-emerald-300 transition-all flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 group-hover:text-sky-700 transition-colors">
                Add Driver
              </h4>
              <p className="text-[11px] text-slate-500">
                {activeDrivers} active drivers on duty
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Split: Recent Orders & Active Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders List (2 columns on large) */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Recent Orders"
              description="Latest delivery orders created in your system"
              action={
                <Link
                  to="/orders"
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
            />
            <div className="divide-y divide-slate-100">
              {recentOrders.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No orders recorded yet. Click "New Order" to get started.
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0">
                        #{order.id}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-slate-900 truncate">
                            {order.customer?.name}
                          </p>
                          <Badge
                            variant={getStatusBadgeVariant(order.status)}
                            size="sm"
                            dot
                          >
                            {formatStatus(order.status)}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5 max-w-xs">
                          {order.customer?.address}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-slate-700 font-medium">
                          {order.driver ? (
                            <span className="flex items-center gap-1">
                              <Truck className="w-3 h-3 text-sky-500" />
                              {order.driver.name}
                            </span>
                          ) : (
                            <span className="text-amber-600 italic">Unassigned</span>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {formatShortDate(order.created_at)}
                        </p>
                      </div>

                      <Link to={`/orders/${order.id}`}>
                        <Button variant="outline" size="sm" className="text-xs py-1 px-2.5">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Driver Activity & Stats */}
        <div>
          <Card>
            <CardHeader
              title="Active Drivers"
              description="Team roster available for assignments"
              action={
                <Link
                  to="/drivers"
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                >
                  <span>Manage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
            />
            <div className="divide-y divide-slate-100">
              {drivers.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No drivers added yet.
                </div>
              ) : (
                drivers.map((driver) => (
                  <div
                    key={driver.id}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0 border border-sky-100">
                        {driver.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-xs text-slate-900 truncate">
                          {driver.name}
                        </p>
                        <a
                          href={`tel:${driver.phone}`}
                          className="text-[11px] text-slate-400 hover:text-sky-600 flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-slate-300" />
                          {driver.phone}
                        </a>
                      </div>
                    </div>
                    <Badge
                      variant={driver.is_active ? 'success' : 'neutral'}
                      size="sm"
                      dot={driver.is_active}
                    >
                      {driver.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Add Customer Modal */}
      <CustomerModal
        isOpen={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        onSuccess={() => fetchData()}
      />

      {/* Quick Add Driver Modal */}
      <DriverModal
        isOpen={driverModalOpen}
        onClose={() => setDriverModalOpen(false)}
        onSuccess={() => fetchData()}
      />

      {/* Assign Driver Modal */}
      {selectedOrderForAssign && (
        <AssignDriverModal
          isOpen={assignModalOpen}
          order={selectedOrderForAssign}
          onClose={() => {
            setAssignModalOpen(false);
            setSelectedOrderForAssign(null);
          }}
          onSuccess={() => fetchData()}
        />
      )}
    </div>
  );
}
