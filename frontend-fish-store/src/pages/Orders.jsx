import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useLocation, useNavigate } from 'react-router-dom';
import { listOrders } from '../api/orders';
import { listDrivers } from '../api/drivers';
import { getErrorMessage } from '../api/client';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import { OrderTable } from '../components/orders/OrderTable';
import { AssignDriverModal } from '../components/orders/AssignDriverModal';
import { CustomerModal } from '../components/customers/CustomerModal';
import { Button } from '../components/ui/Button';
import { TableSkeleton } from '../components/ui/Skeleton';
import { formatCurrency, hasRawFish } from '../utils/formatters';
import {
  Anchor,
  Plus,
  RefreshCw,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Banknote,
  Receipt,
  UserPlus,
} from 'lucide-react';

export function Orders({ isHistoryView = false }) {
  const { isOwner, isDriver } = useAuth();
  const { t, language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { openCreateOrder } = useOutletContext() || {};
  const { success, error: toastError } = useToast();

  const isHistory = isHistoryView || location.pathname === '/orders/history';

  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [rawFilter, setRawFilter] = useState(false);
  const [driverFilter, setDriverFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Assign Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState(null);

  // Customer Edit Modal
  const [editingCustomerForOrder, setEditingCustomerForOrder] = useState(null);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);

  const handleEditCustomer = (customer) => {
    setEditingCustomerForOrder(customer);
    setCustomerModalOpen(true);
  };

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

  // Financial Stats
  const totalUnpaidAmount = orders
    .filter((o) => o.payment_status === 'unpaid')
    .reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);
  const totalPostpaidAmount = orders
    .filter((o) => o.payment_status === 'postpaid')
    .reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);
  const totalPaidAmount = orders
    .filter((o) => o.payment_status === 'paid')
    .reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);

  const unpaidCount = orders.filter((o) => o.payment_status === 'unpaid').length;
  const postpaidCount = orders.filter((o) => o.payment_status === 'postpaid').length;
  const paidCount = orders.filter((o) => o.payment_status === 'paid').length;

  // Counts for status tabs
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const inDeliveryCount = orders.filter((o) => o.status === 'out_for_delivery').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const activeOrdersCount = orders.filter((o) => o.status !== 'delivered').length;
  const rawFishCount = orders.filter(hasRawFish).length;

  // Client-side filtering across orders
  const filteredOrders = orders.filter((order) => {
    if (isDriver && !isHistory && order.status === 'delivered') {
      return false;
    }

    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }

    if (paymentFilter !== 'all' && order.payment_status !== paymentFilter) {
      return false;
    }

    if (rawFilter && !hasRawFish(order)) {
      return false;
    }

    if (isOwner && driverFilter !== 'all') {
      if (driverFilter === 'unassigned') {
        if (order.assigned_driver_id) return false;
      } else if (String(order.assigned_driver_id) !== String(driverFilter)) {
        return false;
      }
    }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Anchor className="w-5 h-5 text-blue-400 stroke-[2.2]" />
              <span>
                {isDriver
                  ? isHistory
                    ? (language === 'ar' ? 'سجل جميع الطلبات' : 'Delivery History')
                    : (language === 'ar' ? 'المهام النشطة للتوصيل' : 'Active Deliveries')
                  : t('orders_title')}
              </span>
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono font-medium">
              {filteredOrders.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isDriver
              ? isHistory
                ? (language === 'ar'
                    ? 'أرشيف كامل لجميع الطلبات المسلمة والسابقة والبحث السريع في طلباتك.'
                    : 'Complete archive of all past and delivered orders.')
                : (language === 'ar'
                    ? 'الطلبات الجارية المطلوب تسليمها. عند تسليم أي طلب سيختفي من هذه القائمة تلقائياً.'
                    : 'Active delivery tasks. Delivered orders will disappear from this list automatically.')
              : t('orders_subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => fetchOrders()}
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

      {/* Financial Overview Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Unpaid / Cash to collect */}
        <div
          onClick={() => setPaymentFilter(paymentFilter === 'unpaid' ? 'all' : 'unpaid')}
          className={`cursor-pointer p-4 rounded-xl border transition-colors ${
            paymentFilter === 'unpaid'
              ? 'bg-[#141B1F] border-amber-500/80 ring-1 ring-amber-500/30'
              : 'bg-[#0F1622] border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-300 flex items-center gap-1.5">
              <Banknote className="w-4 h-4 text-amber-400" />
              {t('total_unpaid_stat')}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/50">
              {unpaidCount}
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-300">
            {formatCurrency(totalUnpaidAmount, language)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {language === 'ar' ? 'مطلوب تحصيله كاش عند تسليم الطلبات' : 'Cash to collect upon delivery'}
          </p>
        </div>

        {/* Postpaid / On Credit */}
        <div
          onClick={() => setPaymentFilter(paymentFilter === 'postpaid' ? 'all' : 'postpaid')}
          className={`cursor-pointer p-4 rounded-xl border transition-colors ${
            paymentFilter === 'postpaid'
              ? 'bg-[#181520] border-purple-500/80 ring-1 ring-purple-500/30'
              : 'bg-[#0F1622] border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-purple-400" />
              {t('total_postpaid_stat')}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/50">
              {postpaidCount}
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-300">
            {formatCurrency(totalPostpaidAmount, language)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {language === 'ar' ? 'تم تسليمها للعميل بدون دفع (على النوتة)' : 'Delivered on credit without payment'}
          </p>
        </div>

        {/* Paid / Collected */}
        <div
          onClick={() => setPaymentFilter(paymentFilter === 'paid' ? 'all' : 'paid')}
          className={`cursor-pointer p-4 rounded-xl border transition-colors ${
            paymentFilter === 'paid'
              ? 'bg-[#101A18] border-emerald-500/80 ring-1 ring-emerald-500/30'
              : 'bg-[#0F1622] border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {language === 'ar' ? 'إجمالي المحصل (مدفوع)' : 'Total Collected (Paid)'}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
              {paidCount}
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-300">
            {formatCurrency(totalPaidAmount, language)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {language === 'ar' ? 'طلبات مدفوعة ومحصلة بالكامل' : 'Paid in advance or upon delivery'}
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-[#0F1622] p-4 rounded-xl border border-slate-800/80 shadow-card space-y-3">
        {/* Status Tab Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs font-medium text-slate-400 shrink-0">
            {language === 'ar' ? 'حالة التوصيل:' : 'Status:'}
          </span>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white shadow-button'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {isDriver && !isHistory
              ? `${language === 'ar' ? 'الكل (النشطة)' : 'All Active'} (${activeOrdersCount})`
              : `${t('filter_all')} (${orders.length})`}
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('preparing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              statusFilter === 'preparing'
                ? 'bg-amber-600 text-white shadow-button'
                : 'bg-slate-800/80 text-amber-300/90 hover:bg-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            {t('filter_preparing')} ({preparingCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('out_for_delivery')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              statusFilter === 'out_for_delivery'
                ? 'bg-blue-600 text-white shadow-button'
                : 'bg-slate-800/80 text-blue-300/90 hover:bg-slate-700'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            {t('filter_out_for_delivery')} ({inDeliveryCount})
          </button>

          {(!isDriver || isHistory) && (
            <button
              type="button"
              onClick={() => setStatusFilter('delivered')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                statusFilter === 'delivered'
                  ? 'bg-emerald-600 text-white shadow-button'
                  : 'bg-slate-800/80 text-emerald-300/90 hover:bg-slate-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t('filter_delivered')} ({deliveredCount})
            </button>
          )}
        </div>

        {/* Payment Status Tab Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none pt-2.5 border-t border-slate-800/80">
          <span className="text-xs font-medium text-slate-400 shrink-0 flex items-center gap-1">
            <Banknote className="w-3.5 h-3.5 text-slate-400" />
            {language === 'ar' ? 'حالة الدفع:' : 'Payment:'}
          </span>

          <button
            type="button"
            onClick={() => setPaymentFilter('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              paymentFilter === 'all'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('filter_all_payments')}
          </button>

          <button
            type="button"
            onClick={() => setPaymentFilter('unpaid')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
              paymentFilter === 'unpaid'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800/60 text-amber-400/80 hover:text-amber-300'
            }`}
          >
            <Banknote className="w-3 h-3" />
            {t('filter_unpaid')} ({unpaidCount})
          </button>

          <button
            type="button"
            onClick={() => setPaymentFilter('postpaid')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
              paymentFilter === 'postpaid'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800/60 text-purple-400/80 hover:text-purple-300'
            }`}
          >
            <Clock className="w-3 h-3" />
            {t('filter_postpaid')} ({postpaidCount})
          </button>

          <button
            type="button"
            onClick={() => setPaymentFilter('paid')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
              paymentFilter === 'paid'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800/60 text-emerald-400/80 hover:text-emerald-300'
            }`}
          >
            <Receipt className="w-3 h-3" />
            {t('filter_paid')} ({paidCount})
          </button>

          {/* Quick Raw Fish Filter Pill */}
          <button
            type="button"
            onClick={() => setRawFilter((prev) => !prev)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ms-auto ${
              rawFilter
                ? 'bg-rose-700 text-white'
                : 'bg-slate-800/60 text-rose-300/80 hover:text-rose-200'
            }`}
            title={language === 'ar' ? 'عرض الطلبات التي تحتوي على أصناف سمك نيء' : 'Filter orders containing raw fish items'}
          >
            <span>🐟</span>
            <span>{language === 'ar' ? 'به سمك نيء' : 'Contains Raw Fish'}</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                rawFilter ? 'bg-black/40 text-white' : 'bg-slate-700 text-slate-300'
              }`}
            >
              {rawFishCount}
            </span>
          </button>
        </div>

        {/* Search and Driver filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          <div className="relative flex-1 max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 flex items-center pl-3 rtl:pl-0 rtl:pr-3 text-slate-500">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder={t('search_orders_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-lg border border-slate-700/80 bg-[#0B1019] text-sm text-white placeholder:text-slate-500 pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Driver filter dropdown for Owner */}
          {isOwner && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                {language === 'ar' ? 'تصفية بالكابتن:' : 'Filter Courier:'}
              </span>
              <select
                value={driverFilter}
                onChange={(e) => setDriverFilter(e.target.value)}
                className="text-xs bg-[#0B1019] border border-slate-700/80 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
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
        <div className="bg-[#0F1622] rounded-xl border border-slate-800/80 p-4">
          <TableSkeleton rows={6} cols={6} />
        </div>
      ) : filteredOrders.length === 0 && isDriver && !isHistory ? (
        <div className="bg-[#0F1622] rounded-xl border border-slate-800/80 p-10 text-center flex flex-col items-center justify-center space-y-4 shadow-card">
          <div className="w-14 h-14 rounded-xl bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-2xl">
            ✓
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-base font-bold text-white">
              {language === 'ar' ? 'تم تسليم جميع المهام النشطة' : 'All Active Deliveries Complete'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'ar'
                ? 'لا توجد طلبات معلقة في قائمتك حالياً. يمكنك مراجعة كافة الطلبات السابقة في سجل جميع الطلبات أو إضافة عملاء جدد.'
                : 'No active deliveries pending in your queue. You can review past deliveries in Order History or register new customers.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Button
              variant="primary"
              size="sm"
              icon={Clock}
              onClick={() => {
                setStatusFilter('all');
                navigate('/orders/history');
              }}
              className="text-xs"
            >
              {language === 'ar' ? 'عرض سجل جميع الطلبات' : 'View Order History'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={UserPlus}
              onClick={() => navigate('/driver/customers')}
              className="text-xs"
            >
              {language === 'ar' ? 'إضافة وتسجيل عملاء' : 'Add Customers'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => fetchOrders()}
              className="text-xs"
            >
              {t('refresh')}
            </Button>
          </div>
        </div>
      ) : (
        <OrderTable
          orders={filteredOrders}
          onAssignClick={handleAssignClick}
          onStatusUpdated={handleStatusUpdated}
          onEditCustomer={handleEditCustomer}
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

      {/* Edit Customer Modal */}
      {editingCustomerForOrder && (
        <CustomerModal
          isOpen={customerModalOpen}
          customer={editingCustomerForOrder}
          onClose={() => {
            setCustomerModalOpen(false);
            setEditingCustomerForOrder(null);
          }}
          isOwner={isOwner}
          onSuccess={() => {
            fetchOrders();
            setCustomerModalOpen(false);
            setEditingCustomerForOrder(null);
          }}
        />
      )}
    </div>
  );
}
