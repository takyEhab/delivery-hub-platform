import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrder, updateOrderStatus } from '../api/orders';
import { getErrorMessage } from '../api/client';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { OrderStatusTimeline } from '../components/orders/OrderStatusTimeline';
import { AssignDriverModal } from '../components/orders/AssignDriverModal';
import {
  formatStatus,
  getStatusBadgeVariant,
  formatDate,
  formatCurrency,
} from '../utils/formatters';
import {
  ArrowLeft,
  ArrowRight,
  Phone,
  MapPin,
  Clock,
  Truck,
  CheckCircle2,
  Package,
  User,
  ExternalLink,
  Calendar,
  AlertCircle,
  Fish,
  Flame,
} from 'lucide-react';

export function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isOwner, isDriver } = useAuth();
  const { success, error: toastError } = useToast();
  const { t, language, isRTL } = useLanguage();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getOrder(id);
      setOrder(data);
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [id, toastError]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleAdvanceStatus = async (nextStatus) => {
    setIsUpdatingStatus(true);
    try {
      const updated = await updateOrderStatus(order.id, nextStatus);
      setOrder(updated);
      const title = language === 'ar' ? 'تم تحديث حالة الطلب' : 'Status Updated';
      const msg = language === 'ar'
        ? `تم تحديث حالة طلب الأسماك #${order.id} إلى: ${formatStatus(nextStatus, 'ar')}`
        : `Order #${order.id} status updated to ${formatStatus(nextStatus, 'en')}!`;
      success(msg, title);
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-cyan-300 mt-3 font-semibold">{language === 'ar' ? 'جاري تحميل تفاصيل الطلب...' : 'Loading order details...'}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16 bg-[#05172b]/90 rounded-2xl border border-cyan-900/40 shadow-xl">
        <AlertCircle className="w-12 h-12 text-cyan-400 mx-auto mb-2" />
        <h3 className="text-base font-bold text-white">{language === 'ar' ? 'الطلب غير موجود' : 'Order Not Found'}</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          {language === 'ar' ? 'رقم الطلب غير صحيح أو غير متاح في السجلات.' : 'The requested order does not exist or you are not authorized to view it.'}
        </p>
        <Link to="/orders" className="inline-block mt-4">
          <Button variant="outline" size="sm" icon={isRTL ? ArrowRight : ArrowLeft}>
            {language === 'ar' ? 'العودة للطلبات' : 'Back to Orders'}
          </Button>
        </Link>
      </div>
    );
  }

  // Parse items
  const parsedItems = Array.isArray(order.items)
    ? order.items
    : typeof order.items === 'string'
    ? [{ name: order.items, quantity: 1 }]
    : [];

  const subtotal = parsedItems.reduce((acc, it) => {
    const q = it.quantity || 1;
    const p = it.price || 0;
    return acc + q * p;
  }, 0);

  const isAssignedToCurrentDriver =
    isDriver && order.assigned_driver_id === user?.id;

  const mapsUrl = order.customer?.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        order.customer.address
      )}`
    : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back navigation & Quick status header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl bg-slate-800/80 text-cyan-400 hover:text-white hover:bg-cyan-950/60 transition-colors border border-cyan-900/40"
            title="Go back"
          >
            {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <Fish className="w-6 h-6 text-cyan-400" />
                <span>{t('order_number')} #{order.id}</span>
              </h1>
              <Badge variant={getStatusBadgeVariant(order.status)} dot>
                {formatStatus(order.status, language)}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>{formatDate(order.created_at, language)}</span>
            </p>
          </div>
        </div>

        {/* Action button: Owner Assign or Driver Status update */}
        <div className="flex items-center gap-2">
          {isOwner && !order.driver && (
            <Button
              variant="primary"
              size="sm"
              icon={Truck}
              onClick={() => setAssignModalOpen(true)}
              className="bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold border-0"
            >
              {t('assign_driver')}
            </Button>
          )}

          {isAssignedToCurrentDriver && order.status === 'preparing' && (
            <Button
              variant="primary"
              size="md"
              icon={Truck}
              isLoading={isUpdatingStatus}
              onClick={() => handleAdvanceStatus('out_for_delivery')}
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold border-0"
            >
              {language === 'ar' ? 'استلام الطلب وبدء التوصيل' : 'Start Delivery (Out for Delivery)'}
            </Button>
          )}

          {isAssignedToCurrentDriver && order.status === 'out_for_delivery' && (
            <Button
              variant="primary"
              size="md"
              icon={CheckCircle2}
              isLoading={isUpdatingStatus}
              onClick={() => handleAdvanceStatus('delivered')}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold border-0"
            >
              {language === 'ar' ? 'تأكيد تسليم الطلب للعميل' : 'Mark as Delivered'}
            </Button>
          )}
        </div>
      </div>

      {/* Visual Status Progression Timeline */}
      <Card className="p-6">
        <OrderStatusTimeline currentStatus={order.status} />
      </Card>

      {/* Grid: Order Items Breakdown & Customer / Driver info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items list (2 cols on large) */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title={t('order_items')}
              description={language === 'ar' ? `قائمة الأسماك المطلوبة (${parsedItems.length} صنف)` : `Itemized list (${parsedItems.length} items)`}
            />
            <div className="overflow-x-auto">
              <table className="w-full text-right rtl:text-right ltr:text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#030e1a] border-b border-cyan-950/80 text-cyan-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-5">{t('item_name')}</th>
                    <th className="py-3 px-4 text-center">{t('quantity')}</th>
                    <th className="py-3 px-4 text-right rtl:text-right ltr:text-right">{t('price_egp')}</th>
                    <th className="py-3 px-5 text-right rtl:text-right ltr:text-right">{t('total')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-950/60 text-slate-200">
                  {parsedItems.map((item, idx) => {
                    const qty = item.quantity || 1;
                    const price = item.price || 0;
                    const itemTotal = qty * price;

                    return (
                      <tr key={idx} className="hover:bg-cyan-950/20">
                        <td className="py-3 px-5 font-bold text-white">
                          {item.name || item.description || (language === 'ar' ? 'صنف أسماك' : 'Item')}
                          {item.notes && (
                            <p className="text-[11px] text-cyan-300 font-normal mt-0.5 italic">
                              "{item.notes}"
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-cyan-300">
                          {qty}
                        </td>
                        <td className="py-3 px-4 text-right rtl:text-right ltr:text-right text-slate-400">
                          {price ? formatCurrency(price, language) : '—'}
                        </td>
                        <td className="py-3 px-5 text-right rtl:text-right ltr:text-right font-black text-cyan-400">
                          {price ? formatCurrency(itemTotal, language) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {subtotal > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-cyan-900/60 bg-[#030e1a]">
                      <td
                        colSpan={3}
                        className="py-3 px-5 text-right rtl:text-right ltr:text-right font-bold text-slate-300 text-xs"
                      >
                        {t('calculated_total')}:
                      </td>
                      <td className="py-3 px-5 text-right rtl:text-right ltr:text-right font-black text-cyan-400 text-sm">
                        {formatCurrency(subtotal, language)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </Card>
        </div>

        {/* Right column: Customer Profile & Driver Info */}
        <div className="space-y-6">
          {/* Customer Card */}
          <Card>
            <CardHeader
              title={t('customer')}
              description={`ID #${order.customer?.id}`}
            />
            <CardBody className="space-y-3.5 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-slate-950 flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                  {order.customer?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">
                    {order.customer?.name}
                  </h4>
                  <p className="text-cyan-400 text-[11px] font-semibold">{language === 'ar' ? 'مستلم الطلب' : 'Recipient'}</p>
                </div>
              </div>

              {order.customer?.phone && (
                <div className="pt-2 border-t border-cyan-950/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300" dir="ltr">
                    <Phone className="w-4 h-4 text-cyan-400" />
                    <span>{order.customer.phone}</span>
                  </div>
                  <a
                    href={`tel:${order.customer.phone}`}
                    className="text-xs font-bold text-cyan-300 hover:text-white bg-cyan-950/80 hover:bg-cyan-900/80 px-2.5 py-1 rounded-lg transition-colors border border-cyan-800/40"
                  >
                    {language === 'ar' ? 'اتصال بالعميل' : 'Call Customer'}
                  </a>
                </div>
              )}

              <div className="pt-2 border-t border-cyan-950/80 space-y-1.5">
                <div className="flex items-start gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{order.customer?.address || (language === 'ar' ? 'استلام من المحل' : 'Store pickup')}</span>
                </div>
                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 hover:underline"
                  >
                    <span>{language === 'ar' ? 'عرض على خرائط Google' : 'Open in Google Maps'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {order.customer?.notes && (
                <div className="pt-2 border-t border-cyan-950/80">
                  <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400" />
                    <span>{language === 'ar' ? 'تعليمات التجهيز والتوصيل:' : 'Delivery Instructions:'}</span>
                  </p>
                  <p className="text-amber-200 italic bg-amber-950/30 p-2.5 rounded-xl border border-amber-500/30 leading-relaxed">
                    "{order.customer.notes}"
                  </p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Assigned Driver Card */}
          <Card>
            <CardHeader
              title={t('driver_assigned')}
              action={
                isOwner && !order.driver && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAssignModalOpen(true)}
                    className="text-xs py-1 px-3 border-cyan-700/60 text-cyan-300 hover:bg-cyan-950/50"
                  >
                    {t('assign_driver')}
                  </Button>
                )
              }
            />
            <CardBody className="text-xs">
              {order.driver ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
                      {order.driver.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">
                        {order.driver.name}
                      </h4>
                      <p className="text-cyan-400 text-[11px]">
                        {language === 'ar' ? `كابتن #${order.driver.id}` : `Courier ID #${order.driver.id}`}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-cyan-950/80 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-300" dir="ltr">
                      <Phone className="w-4 h-4 text-cyan-400" />
                      <span>{order.driver.phone}</span>
                    </div>
                    <a
                      href={`tel:${order.driver.phone}`}
                      className="text-xs font-bold text-sky-300 hover:text-white bg-sky-950/80 hover:bg-sky-900/80 px-2.5 py-1 rounded-lg transition-colors border border-sky-800/40"
                    >
                      {language === 'ar' ? 'اتصال بالكابتن' : 'Call Courier'}
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-slate-400">
                  <Truck className="w-7 h-7 mx-auto text-slate-500 mb-1" />
                  <p className="font-bold text-slate-300">{t('unassigned')}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {language === 'ar' ? 'هذا الطلب بانتظار تعيين كابتن للتوصيل.' : 'Order is currently awaiting courier dispatch.'}
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Assign Driver Modal */}
      <AssignDriverModal
        isOpen={assignModalOpen}
        order={order}
        onClose={() => setAssignModalOpen(false)}
        onSuccess={(updated) => setOrder(updated)}
      />
    </div>
  );
}
