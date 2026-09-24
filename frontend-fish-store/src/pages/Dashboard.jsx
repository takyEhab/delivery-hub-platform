import React, { useState, useEffect, useCallback } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { listOrders } from '../api/orders';
import { listCustomers } from '../api/customers';
import { listDrivers } from '../api/drivers';
import { getErrorMessage } from '../api/client';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
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
  Fish,
  Flame,
  Waves,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';

export function Dashboard() {
  const { isOwner, user } = useAuth();
  const { t, language, isRTL } = useLanguage();
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#071c33] via-[#0b294a] to-[#071c33] p-6 rounded-3xl border border-cyan-900/40 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Fish className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>{t('store_name')} — {t('store_tagline')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {t('dashboard_title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {t('dashboard_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            isLoading={isRefreshing}
            onClick={() => fetchData(true)}
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

      {/* KPI Stats Grid with Oceanic Design */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <Card className="p-4 sm:p-5 relative overflow-hidden border-cyan-900/40 bg-gradient-to-b from-[#08203c]/90 to-[#041222]/90 hover:border-cyan-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">{t('total_orders')}</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-400/30 group-hover:scale-110 transition-transform">
              <Fish className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-white">
              {isLoading ? '—' : totalOrders}
            </span>
            <span className="text-[11px] font-semibold text-cyan-400">{language === 'ar' ? 'طلب مسجل' : 'orders'}</span>
          </div>
        </Card>

        {/* Preparing */}
        <Card className="p-4 sm:p-5 relative overflow-hidden border-amber-900/40 bg-gradient-to-b from-[#1c1507]/90 to-[#0c0a03]/90 hover:border-amber-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-200">{t('preparing_seafood')}</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-400/30 group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-amber-400">
              {isLoading ? '—' : preparingOrders}
            </span>
            <span className="text-[11px] font-semibold text-amber-300/80">{language === 'ar' ? 'في المطبخ والشواية' : 'in kitchen'}</span>
          </div>
        </Card>

        {/* Out for Delivery */}
        <Card className="p-4 sm:p-5 relative overflow-hidden border-sky-900/40 bg-gradient-to-b from-[#071c33]/90 to-[#030e1a]/90 hover:border-sky-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-200">
              {t('out_for_delivery')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center border border-sky-400/30 group-hover:scale-110 transition-transform">
              <Truck className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-sky-400">
              {isLoading ? '—' : outForDeliveryOrders}
            </span>
            <span className="text-[11px] font-semibold text-sky-300/80">{language === 'ar' ? 'مع الكابتن' : 'on the road'}</span>
          </div>
        </Card>

        {/* Delivered Orders */}
        <Card className="p-4 sm:p-5 relative overflow-hidden border-emerald-900/40 bg-gradient-to-b from-[#062016]/90 to-[#02120b]/90 hover:border-emerald-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-200">{t('delivered_orders')}</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-emerald-400">
              {isLoading ? '—' : deliveredOrders}
            </span>
            <span className="text-[11px] font-semibold text-emerald-300/80">{language === 'ar' ? 'تم الاستلام' : 'delivered'}</span>
          </div>
        </Card>
      </div>

      {/* Secondary Row: Quick Actions Bar (for Owner) */}
      {isOwner && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={openCreateOrder}
            className="cursor-pointer bg-[#05172b] hover:bg-[#082240] p-4 rounded-2xl border border-cyan-900/50 shadow-md hover:border-cyan-400/50 transition-all flex items-center gap-3.5 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-slate-950 flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                {t('create_order')}
              </h4>
              <p className="text-[11px] text-slate-400">
                {language === 'ar' ? 'تسجيل طلب أسماك لعميل حالي أو جديد' : 'New seafood order with existing or inline customer'}
              </p>
            </div>
          </div>

          <div
            onClick={() => setCustomerModalOpen(true)}
            className="cursor-pointer bg-[#05172b] hover:bg-[#082240] p-4 rounded-2xl border border-cyan-900/50 shadow-md hover:border-cyan-400/50 transition-all flex items-center gap-3.5 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#030e1a] text-cyan-400 border border-cyan-800/40 flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                {t('add_customer')}
              </h4>
              <p className="text-[11px] text-slate-400">
                {totalCustomers} {t('total_customers')}
              </p>
            </div>
          </div>

          <div
            onClick={() => setDriverModalOpen(true)}
            className="cursor-pointer bg-[#05172b] hover:bg-[#082240] p-4 rounded-2xl border border-cyan-900/50 shadow-md hover:border-cyan-400/50 transition-all flex items-center gap-3.5 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 text-white flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                {t('add_driver')}
              </h4>
              <p className="text-[11px] text-slate-400">
                {activeDrivers} {t('active_couriers')}
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
              title={t('recent_orders')}
              description={language === 'ar' ? 'أحدث الوجبات والأسماك المطلوبة اليوم في المحل' : 'Latest seafood orders created in Prince of the Seas'}
              action={
                <Link
                  to="/orders"
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1.5"
                >
                  <span>{t('view_all_orders')}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </Link>
              }
            />
            <div className="divide-y divide-cyan-950/60">
              {recentOrders.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  {t('no_recent_orders')}
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 hover:bg-cyan-950/20 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 flex items-center justify-center font-black text-xs shrink-0 shadow-inner">
                        #{order.id}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-white truncate">
                            {order.customer?.name}
                          </p>
                          <Badge
                            variant={getStatusBadgeVariant(order.status)}
                            size="sm"
                            dot
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
                        <p className="text-xs text-slate-300 font-semibold">
                          {order.driver ? (
                            <span className="flex items-center gap-1 text-cyan-300">
                              <Truck className="w-3 h-3 text-cyan-400" />
                              {order.driver.name}
                            </span>
                          ) : (
                            <span className="text-amber-400 italic font-normal text-[11px]">{t('unassigned')}</span>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {formatShortDate(order.created_at, language)}
                        </p>
                      </div>

                      <Link to={`/orders/${order.id}`}>
                        <Button variant="outline" size="sm" className="text-xs py-1 px-3 border-cyan-800/60 text-cyan-300 hover:bg-cyan-950/40">
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

        {/* Right Column: Driver Activity & Stats */}
        <div>
          <Card>
            <CardHeader
              title={t('drivers_title')}
              description={language === 'ar' ? 'طاقم مناديب التوصيل المتاح لتسليم الطلبات' : 'Available couriers ready for delivery'}
              action={
                <Link
                  to="/drivers"
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1.5"
                >
                  <span>{language === 'ar' ? 'إدارة' : 'Manage'}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </Link>
              }
            />
            <div className="divide-y divide-cyan-950/60">
              {drivers.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  {language === 'ar' ? 'لم يتم إضافة مناديب بعد.' : 'No couriers added yet.'}
                </div>
              ) : (
                drivers.map((driver) => (
                  <div
                    key={driver.id}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-cyan-950/20 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-700 to-sky-800 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                        {driver.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-white truncate">
                          {driver.name}
                        </p>
                        <a
                          href={`tel:${driver.phone}`}
                          className="text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1"
                          dir="ltr"
                        >
                          <Phone className="w-3 h-3 text-cyan-400/80" />
                          {driver.phone}
                        </a>
                      </div>
                    </div>
                    <Badge
                      variant={driver.is_active ? 'success' : 'neutral'}
                      size="sm"
                      dot={driver.is_active}
                    >
                      {driver.is_active ? t('driver_status_active') : t('driver_status_inactive')}
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
