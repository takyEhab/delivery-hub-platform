import React, { useState, useEffect, useCallback } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { listOrders } from '../api/orders';
import { listCustomers } from '../api/customers';
import { listDrivers } from '../api/drivers';
import { getErrorMessage } from '../api/client';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardHeader } from '../components/ui/Card';
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
  RefreshCw,
  Phone,
  Anchor,
  Bike,
  History,
  UserPlus,
} from 'lucide-react';

export function Dashboard() {
  const { isOwner, user } = useAuth();
  const { t, language } = useLanguage();
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F1622] p-5 sm:p-6 rounded-2xl border border-slate-800/80 shadow-card">
        <div>
          <div className="flex items-center gap-2 mb-1 text-slate-400 text-xs font-medium">
            <Anchor className="w-3.5 h-3.5 text-blue-400" />
            <span>{t('store_name')} — {t('store_tagline')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {t('dashboard_title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {t('dashboard_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            isLoading={isRefreshing}
            onClick={() => fetchData(true)}
            className="text-xs"
          >
            {t('refresh')}
          </Button>

          {isOwner && (
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={openCreateOrder}
              className="text-xs"
            >
              {t('create_order')}
            </Button>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">{t('total_orders')}</span>
            <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-white">
              {isLoading ? '—' : totalOrders}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {language === 'ar' ? 'طلب مسجل' : 'orders'}
            </span>
          </div>
        </Card>

        {/* Preparing */}
        <Card className="p-4 sm:p-5 border-t-2 border-t-amber-500/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300/90">{t('preparing_seafood')}</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-800/50 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-amber-400">
              {isLoading ? '—' : preparingOrders}
            </span>
            <span className="text-[11px] text-amber-400/70 font-medium">
              {language === 'ar' ? 'قيد التجهيز' : 'in kitchen'}
            </span>
          </div>
        </Card>

        {/* Out for Delivery */}
        <Card className="p-4 sm:p-5 border-t-2 border-t-blue-500/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-300/90">
              {t('out_for_delivery')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-800/50 text-blue-400 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-blue-400">
              {isLoading ? '—' : outForDeliveryOrders}
            </span>
            <span className="text-[11px] text-blue-400/70 font-medium">
              {language === 'ar' ? 'مع الكابتن' : 'on road'}
            </span>
          </div>
        </Card>

        {/* Delivered Orders */}
        <Card className="p-4 sm:p-5 border-t-2 border-t-emerald-500/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-300/90">{t('delivered_orders')}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-400">
              {isLoading ? '—' : deliveredOrders}
            </span>
            <span className="text-[11px] text-emerald-400/70 font-medium">
              {language === 'ar' ? 'تم التسليم' : 'delivered'}
            </span>
          </div>
        </Card>
      </div>

      {/* Secondary Row: Quick Actions Bar (for Owner) */}
      {isOwner ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={openCreateOrder}
            className="cursor-pointer bg-[#0F1622] hover:bg-[#131B2A] p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 shadow-sm transition-colors flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-button">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                {t('create_order')}
              </h4>
              <p className="text-xs text-slate-400">
                {language === 'ar' ? 'تسجيل طلب أسماك لعميل جديد أو حالي' : 'New seafood order for customer'}
              </p>
            </div>
          </div>

          <div
            onClick={() => setCustomerModalOpen(true)}
            className="cursor-pointer bg-[#0F1622] hover:bg-[#131B2A] p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 shadow-sm transition-colors flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-lg bg-[#0B1019] text-slate-300 border border-slate-700/60 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white group-hover:text-slate-200 transition-colors">
                {t('add_customer')}
              </h4>
              <p className="text-xs text-slate-400">
                {totalCustomers} {t('total_customers')}
              </p>
            </div>
          </div>

          <div
            onClick={() => setDriverModalOpen(true)}
            className="cursor-pointer bg-[#0F1622] hover:bg-[#131B2A] p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 shadow-sm transition-colors flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-lg bg-[#0B1019] text-blue-400 border border-slate-700/60 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                {t('add_driver')}
              </h4>
              <p className="text-xs text-slate-400">
                {activeDrivers} {t('active_couriers')}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/orders"
            className="bg-[#0F1622] hover:bg-[#131B2A] p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 shadow-sm transition-colors flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-button">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                {language === 'ar' ? 'المهام النشطة للتوصيل' : 'Active Deliveries'}
              </h4>
              <p className="text-xs text-slate-400">
                {language === 'ar' ? `${preparingOrders + outForDeliveryOrders} طلبات قيد التسليم` : `${preparingOrders + outForDeliveryOrders} pending orders`}
              </p>
            </div>
          </Link>

          <Link
            to="/orders/history"
            className="bg-[#0F1622] hover:bg-[#131B2A] p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 shadow-sm transition-colors flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-lg bg-[#0B1019] text-slate-300 border border-slate-700/60 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white group-hover:text-slate-200 transition-colors">
                {language === 'ar' ? 'سجل جميع الطلبات' : 'Delivery History'}
              </h4>
              <p className="text-xs text-slate-400">
                {deliveredOrders} {language === 'ar' ? 'طلبات تم تسليمها' : 'delivered orders'}
              </p>
            </div>
          </Link>

          <Link
            to="/driver/customers"
            className="bg-[#0F1622] hover:bg-[#131B2A] p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 shadow-sm transition-colors flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-lg bg-[#0B1019] text-blue-400 border border-slate-700/60 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                {language === 'ar' ? 'إضافة وتسجيل عملاء' : 'Add Customers'}
              </h4>
              <p className="text-xs text-slate-400">
                {language === 'ar' ? 'إضافة عميل أو استيراد جهات اتصال' : 'Register customer or import'}
              </p>
            </div>
          </Link>
        </div>
      )}

      {/* Main Content Split: Recent Orders & Active Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders List (2 columns on large) */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title={t('recent_orders')}
              description={language === 'ar' ? 'أحدث الوجبات والأسماك المطلوبة اليوم' : 'Latest seafood orders created'}
              action={
                <Link
                  to="/orders"
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1.5"
                >
                  <span>{t('view_all_orders')}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </Link>
              }
            />
            <div className="divide-y divide-slate-800/80">
              {recentOrders.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  {t('no_recent_orders')}
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 hover:bg-slate-800/20 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-[#0B1019] border border-slate-800 text-slate-300 flex items-center justify-center font-mono font-semibold text-xs shrink-0">
                        #{order.id}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-white truncate">
                            {order.customer?.name}
                          </p>
                          <Badge
                            variant={getStatusBadgeVariant(order.status)}
                            size="sm"
                          >
                            {formatStatus(order.status, language)}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5 max-w-xs">
                          {order.customer?.address || (language === 'ar' ? 'طلب استلام من المحل' : 'Store Pickup')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right rtl:text-left hidden sm:block">
                        <p className="text-xs text-slate-300 font-medium">
                          {order.driver ? (
                            <span className="flex items-center gap-1 text-slate-300">
                              <Truck className="w-3 h-3 text-slate-400" />
                              {order.driver.name}
                            </span>
                          ) : (
                            <span className="text-amber-400 text-xs">{t('unassigned')}</span>
                          )}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {formatShortDate(order.created_at, language)}
                        </p>
                      </div>

                      <Link to={`/orders/${order.id}`}>
                        <Button variant="outline" size="sm" className="text-xs py-1 px-3">
                          {t('view_details')}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Driver Activity & Stats (Owner) or Courier Shift Card (Driver) */}
        <div>
          {isOwner ? (
            <Card>
              <CardHeader
                title={t('drivers_title')}
                description={language === 'ar' ? 'طاقم مناديب التوصيل المتاح' : 'Available couriers ready for delivery'}
                action={
                  <Link
                    to="/drivers"
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1.5"
                  >
                    <span>{language === 'ar' ? 'إدارة' : 'Manage'}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </Link>
                }
              />
              <div className="divide-y divide-slate-800/80">
                {drivers.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    {language === 'ar' ? 'لم يتم إضافة مناديب بعد.' : 'No couriers added yet.'}
                  </div>
                ) : (
                  drivers.map((driver) => (
                    <div
                      key={driver.id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-800/20 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {driver.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-white truncate">
                            {driver.name}
                          </p>
                          <a
                            href={`tel:${driver.phone}`}
                            className="text-[11px] text-slate-400 hover:text-blue-400 flex items-center gap-1 font-mono"
                            dir="ltr"
                          >
                            <Phone className="w-3 h-3 text-slate-500" />
                            {driver.phone}
                          </a>
                        </div>
                      </div>
                      <Badge
                        variant={driver.is_active ? 'success' : 'neutral'}
                        size="sm"
                      >
                        {driver.is_active ? t('driver_status_active') : t('driver_status_inactive')}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </Card>
          ) : (
            <Card>
              <CardHeader
                title={language === 'ar' ? 'ملخص وردية التوصيل' : 'Courier Shift Overview'}
                description={language === 'ar' ? 'بيانات الكابتن وحالة المهام اليوم' : 'Your active status and delivery progress'}
              />
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3 bg-[#0B1019] p-3.5 rounded-xl border border-slate-800">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-button">
                    {user?.name?.charAt(0).toUpperCase() || 'C'}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{user?.name}</h4>
                    <p className="text-xs text-slate-400 font-mono" dir="ltr">{user?.phone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#0B1019] p-3 rounded-lg border border-slate-800 text-center">
                    <span className="text-slate-400 block text-[11px]">{language === 'ar' ? 'قيد التوصيل' : 'In Delivery'}</span>
                    <span className="text-xl font-bold text-blue-400 mt-1 block">{outForDeliveryOrders}</span>
                  </div>
                  <div className="bg-[#0B1019] p-3 rounded-lg border border-slate-800 text-center">
                    <span className="text-slate-400 block text-[11px]">{language === 'ar' ? 'تم تسليمها' : 'Delivered'}</span>
                    <span className="text-xl font-bold text-emerald-400 mt-1 block">{deliveredOrders}</span>
                  </div>
                </div>

                <Link
                  to="/orders"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-button transition-colors"
                >
                  <Bike className="w-4 h-4" />
                  <span>{language === 'ar' ? 'الانتقال لمهام التوصيل النشطة' : 'Go to Active Deliveries'}</span>
                </Link>
              </div>
            </Card>
          )}
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
