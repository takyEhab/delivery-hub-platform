import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrder, updateOrderStatus, updatePaymentStatus, deleteOrder } from '../api/orders';
import { getErrorMessage } from '../api/client';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { OrderStatusTimeline } from '../components/orders/OrderStatusTimeline';
import { AssignDriverModal } from '../components/orders/AssignDriverModal';
import { EditOrderModal } from '../components/orders/EditOrderModal';
import { CustomerModal } from '../components/customers/CustomerModal';
import {
  formatStatus,
  getStatusBadgeVariant,
  formatPaymentStatus,
  getPaymentBadgeVariant,
  formatDate,
  formatCurrency,
  hasRawFish,
  isRawFishItem,
} from '../utils/formatters';
import {
  ArrowLeft,
  ArrowRight,
  Phone,
  MapPin,
  Clock,
  Truck,
  CheckCircle2,
  ExternalLink,
  Calendar,
  AlertCircle,
  Anchor,
  Flame,
  Edit,
  Edit3,
  Navigation,
  Banknote,
  Receipt,
  Trash2,
} from 'lucide-react';
import { buildGoogleMapsUrl } from '../utils/location';

export function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isOwner, isDriver } = useAuth();
  const { success, error: toastError } = useToast();
  const { t, language, isRTL } = useLanguage();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleAdvanceStatus = async (nextStatus, paymentStatus = null) => {
    setIsUpdatingStatus(true);
    try {
      const validPaymentStatus = typeof paymentStatus === 'string' ? paymentStatus : null;
      const updated = await updateOrderStatus(order.id, nextStatus, validPaymentStatus);
      setOrder(updated);
      const title = language === 'ar' ? 'تم تحديث حالة الطلب' : 'Status Updated';
      const msg = language === 'ar'
        ? `تم تحديث حالة طلب #${order.id} إلى: ${formatStatus(nextStatus, 'ar')}`
        : `Order #${order.id} status updated to ${formatStatus(nextStatus, 'en')}!`;
      success(msg, title);
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUpdatePayment = async (newPaymentStatus, newNotes = null) => {
    setIsUpdatingPayment(true);
    try {
      const updated = await updatePaymentStatus(
        order.id,
        newPaymentStatus,
        newNotes !== null ? newNotes : order.payment_notes
      );
      setOrder(updated);
      const title = language === 'ar' ? 'تم تحديث الدفع والتحصيل' : 'Payment Updated';
      const msg = language === 'ar'
        ? `تم تغيير حالة دفع طلب #${order.id} إلى: ${formatPaymentStatus(newPaymentStatus, 'ar')}`
        : `Order #${order.id} payment updated to ${formatPaymentStatus(newPaymentStatus, 'en')}!`;
      success(msg, title);
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!order) return;
    setIsDeleting(true);
    try {
      await deleteOrder(order.id);
      success(
        language === 'ar'
          ? `تم حذف الطلب #${order.id} بنجاح.`
          : `Order #${order.id} was permanently deleted.`,
        language === 'ar' ? 'تم الحذف' : 'Order Deleted'
      );
      navigate('/orders');
    } catch (err) {
      toastError(getErrorMessage(err));
      setIsDeleting(false);
      setConfirmDeleteOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 mt-3 font-medium">
          {language === 'ar' ? 'جاري تحميل تفاصيل الطلب...' : 'Loading order details...'}
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16 bg-[#0F1622] rounded-xl border border-slate-800 shadow-card">
        <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
        <h3 className="text-base font-semibold text-white">
          {language === 'ar' ? 'لم يتم العثور على هذا الطلب' : 'Order not found'}
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          {language === 'ar'
            ? 'ربما تم حذف هذا الطلب أو أن الرابط غير صحيح.'
            : 'The requested order could not be located or was removed.'}
        </p>
        <div className="mt-4">
          <Link to="/orders">
            <Button variant="outline" size="sm">
              {t('back_to_orders')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const parsedItems = Array.isArray(order.items)
    ? order.items
    : typeof order.items === 'string'
    ? [{ name: order.items, quantity: 1, price: 0 }]
    : [];

  const subtotal = parsedItems.reduce((acc, it) => {
    const qty = it.quantity || 1;
    const price = it.price || 0;
    return acc + qty * price;
  }, 0);

  const totalAmountToDisplay = parseFloat(order.total_amount) || subtotal || 0;
  const canUpdateStatus = isOwner || (isDriver && order.assigned_driver_id);

  const mapsUrl = buildGoogleMapsUrl(
    order.customer?.location_url,
    order.customer?.address
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back navigation & Quick status header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700"
            title="Go back"
          >
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2 font-mono">
                <span>{t('order_number')} #{order.id}</span>
              </h1>
              <span className="text-sm font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                {formatCurrency(totalAmountToDisplay, language)}
              </span>
              <Badge variant={getStatusBadgeVariant(order.status)}>
                {formatStatus(order.status, language)}
              </Badge>
              <Badge variant={getPaymentBadgeVariant(order.payment_status)}>
                {formatPaymentStatus(order.payment_status, language)}
              </Badge>
              {hasRawFish(order) && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-950/60 text-rose-300 border border-rose-800/50">
                  <span>🐟</span>
                  <span>{language === 'ar' ? 'سمك نيء' : 'Raw Fish'}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{formatDate(order.created_at, language)}</span>
            </p>
          </div>
        </div>

        {/* Action button: Owner Edit/Assign or Driver Status update */}
        <div className="flex flex-wrap items-center gap-2">
          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              icon={Edit}
              onClick={() => setEditModalOpen(true)}
            >
              {t('edit_order')}
            </Button>
          )}

          {isOwner && (
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => setConfirmDeleteOpen(true)}
            >
              {t('delete_order')}
            </Button>
          )}

          {isOwner && !order.driver && (
            <Button
              variant="primary"
              size="sm"
              icon={Truck}
              onClick={() => setAssignModalOpen(true)}
            >
              {t('assign_driver')}
            </Button>
          )}

          {canUpdateStatus && order.status === 'preparing' && (
            <Button
              variant="primary"
              size="sm"
              icon={Truck}
              isLoading={isUpdatingStatus}
              onClick={() => handleAdvanceStatus('out_for_delivery')}
            >
              {language === 'ar' ? 'استلام الطلب وبدء التوصيل' : 'Start Delivery'}
            </Button>
          )}

          {canUpdateStatus && order.status === 'out_for_delivery' && (
            order.payment_status !== 'paid' ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  icon={CheckCircle2}
                  isLoading={isUpdatingStatus}
                  onClick={() => handleAdvanceStatus('delivered', 'paid')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  {language === 'ar' ? 'تسليم + استلام كاش' : 'Delivered & Paid'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Clock}
                  isLoading={isUpdatingStatus}
                  onClick={() => handleAdvanceStatus('delivered', 'postpaid')}
                  className="text-purple-300 hover:text-white"
                >
                  {language === 'ar' ? 'تسليم بدون دفع (آجل)' : 'Delivered on Credit'}
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle2}
                isLoading={isUpdatingStatus}
                onClick={() => handleAdvanceStatus('delivered')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                {language === 'ar' ? 'تأكيد تسليم الطلب للعميل' : 'Mark as Delivered'}
              </Button>
            )
          )}
        </div>
      </div>

      {/* Visual Status Progression Timeline */}
      <Card className="p-5">
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
            {hasRawFish(order) && (
              <div className="bg-rose-950/30 border-b border-rose-800/40 py-2 px-4 flex items-center gap-2 text-xs text-rose-300">
                <span>🐟</span>
                <span className="font-semibold">
                  {language === 'ar'
                    ? 'الطلب يحتوي على أصناف سمك نيء'
                    : 'This order contains raw fish items'}
                </span>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-right rtl:text-right ltr:text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0B1019] border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-5">{t('item_name')}</th>
                    <th className="py-3 px-4 text-center">{t('quantity')}</th>
                    <th className="py-3 px-4 text-right rtl:text-right ltr:text-right">{t('price_egp')}</th>
                    <th className="py-3 px-5 text-right rtl:text-right ltr:text-right">{t('total')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-200">
                  {parsedItems.map((item, idx) => {
                    const qty = item.quantity || 1;
                    const price = item.price || 0;
                    const itemTotal = qty * price;

                    return (
                      <tr key={idx} className="hover:bg-slate-800/20">
                        <td className="py-3 px-5 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <span>{item.name || item.description || (language === 'ar' ? 'صنف أسماك' : 'Item')}</span>
                            {isRawFishItem(item) && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 text-[10px] font-semibold border border-rose-800/50">
                                <span>🐟</span>
                                <span>{language === 'ar' ? 'نيء' : 'Raw'}</span>
                              </span>
                            )}
                          </div>
                          {item.notes && (
                            <p className="text-[11px] text-slate-400 font-normal mt-0.5 italic">
                              "{item.notes}"
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-semibold text-slate-300">
                          {qty}
                        </td>
                        <td className="py-3 px-4 text-right rtl:text-right ltr:text-right text-slate-400 font-mono">
                          {price ? formatCurrency(price, language) : '—'}
                        </td>
                        <td className="py-3 px-5 text-right rtl:text-right ltr:text-right font-mono font-semibold text-white">
                          {price ? formatCurrency(itemTotal, language) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {subtotal > 0 && (
                  <tfoot>
                    <tr className="border-t border-slate-800 bg-[#0B1019]">
                      <td
                        colSpan={3}
                        className="py-3 px-5 text-right rtl:text-right ltr:text-right font-semibold text-slate-300 text-xs"
                      >
                        {t('calculated_total')}:
                      </td>
                      <td className="py-3 px-5 text-right rtl:text-right ltr:text-right font-mono font-bold text-emerald-400 text-sm">
                        {formatCurrency(subtotal, language)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </Card>
        </div>

        {/* Right column: Payment Card, Customer Profile & Driver Info */}
        <div className="space-y-6">
          {/* Payment & Collection Card */}
          <Card>
            <CardHeader
              title={t('payment_status')}
              description={language === 'ar' ? 'تفاصيل المبلغ والتحصيل المالي للطلب' : 'Order payment and collection details'}
            />
            <CardBody className="space-y-4 text-xs">
              <div className="p-3.5 rounded-lg bg-[#0B1019] border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[11px] mb-0.5">
                    {t('total_amount_to_pay')}
                  </span>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {formatCurrency(totalAmountToDisplay, language)}
                  </span>
                </div>
                <Badge variant={getPaymentBadgeVariant(order.payment_status)} size="md">
                  {formatPaymentStatus(order.payment_status, language)}
                </Badge>
              </div>

              {/* Status explanation */}
              <div className={`p-3 rounded-lg border text-xs leading-relaxed ${
                order.payment_status === 'paid'
                  ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
                  : order.payment_status === 'postpaid'
                  ? 'bg-purple-950/30 border-purple-800/50 text-purple-300'
                  : 'bg-amber-950/30 border-amber-800/50 text-amber-300'
              }`}>
                <div className="flex items-center gap-1.5 font-semibold mb-1">
                  {order.payment_status === 'paid' && <Receipt className="w-4 h-4 text-emerald-400" />}
                  {order.payment_status === 'postpaid' && <Clock className="w-4 h-4 text-purple-400" />}
                  {order.payment_status === 'unpaid' && <Banknote className="w-4 h-4 text-amber-400" />}
                  <span>{formatPaymentStatus(order.payment_status, language)}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {order.payment_status === 'paid' && t('payment_status_paid_desc')}
                  {order.payment_status === 'postpaid' && t('payment_status_postpaid_desc')}
                  {order.payment_status === 'unpaid' && t('payment_status_unpaid_desc')}
                </p>
                {order.paid_at && (
                  <p className="text-[10px] text-slate-500 font-mono mt-1.5 pt-1.5 border-t border-slate-800">
                    {language === 'ar' ? 'تاريخ السداد:' : 'Paid timestamp:'} {formatDate(order.paid_at, language)}
                  </p>
                )}
              </div>

              {order.payment_notes && (
                <div className="p-2.5 rounded-lg bg-[#0B1019] border border-slate-800 text-xs">
                  <span className="text-slate-400 block text-[10px] mb-0.5 font-semibold uppercase">
                    {t('payment_notes_label')}
                  </span>
                  <p className="text-slate-300">{order.payment_notes}</p>
                </div>
              )}

              {/* Authority buttons to update payment status */}
              {(isOwner || isDriver) && (
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <span className="text-[11px] font-medium text-slate-400 block">
                    {language === 'ar' ? 'تغيير حالة الدفع والتحصيل:' : 'Update Payment Status:'}
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      disabled={isUpdatingPayment || order.payment_status === 'paid'}
                      onClick={() => handleUpdatePayment('paid')}
                      className={`p-2 rounded-lg text-xs font-medium transition-colors flex flex-col items-center justify-center gap-1 ${
                        order.payment_status === 'paid'
                          ? 'bg-emerald-600 text-white font-semibold'
                          : 'bg-[#0B1019] border border-slate-800 text-emerald-400 hover:bg-slate-800'
                      }`}
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'مدفوع' : 'Paid'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isUpdatingPayment || order.payment_status === 'postpaid'}
                      onClick={() => handleUpdatePayment('postpaid')}
                      className={`p-2 rounded-lg text-xs font-medium transition-colors flex flex-col items-center justify-center gap-1 ${
                        order.payment_status === 'postpaid'
                          ? 'bg-purple-600 text-white font-semibold'
                          : 'bg-[#0B1019] border border-slate-800 text-purple-400 hover:bg-slate-800'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'آجل' : 'Credit'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isUpdatingPayment || order.payment_status === 'unpaid'}
                      onClick={() => handleUpdatePayment('unpaid')}
                      className={`p-2 rounded-lg text-xs font-medium transition-colors flex flex-col items-center justify-center gap-1 ${
                        order.payment_status === 'unpaid'
                          ? 'bg-amber-600 text-white font-semibold'
                          : 'bg-[#0B1019] border border-slate-800 text-amber-400 hover:bg-slate-800'
                      }`}
                    >
                      <Banknote className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'كاش مطلوب' : 'Unpaid'}</span>
                    </button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Customer Card */}
          <Card>
            <CardHeader
              title={t('customer')}
              description={`ID #${order.customer?.id}`}
              action={
                order.customer && (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Edit3}
                    onClick={() => setCustomerModalOpen(true)}
                    className="text-xs py-1 px-2.5"
                  >
                    {language === 'ar' ? 'تعديل' : 'Edit'}
                  </Button>
                )
              }
            />
            <CardBody className="space-y-3.5 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {order.customer?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">
                    {order.customer?.name}
                  </h4>
                  <p className="text-slate-400 text-[11px]">{language === 'ar' ? 'مستلم الطلب' : 'Recipient'}</p>
                </div>
              </div>

              {order.customer?.phone && (
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300 font-mono" dir="ltr">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span>{order.customer.phone}</span>
                  </div>
                  <a
                    href={`tel:${order.customer.phone}`}
                    className="text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded transition-colors border border-slate-700"
                  >
                    {language === 'ar' ? 'اتصال بالعميل' : 'Call Customer'}
                  </a>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <div className="flex items-start gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed text-slate-400">{order.customer?.address || (language === 'ar' ? 'استلام من المحل' : 'Store pickup')}</span>
                </div>
                {mapsUrl && (
                  <div className="pt-2">
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded-lg shadow-button transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'بدء التوصيل عبر خرائط Google' : 'Start Google Maps Navigation'}</span>
                      <ExternalLink className="w-3 h-3 text-blue-200" />
                    </a>
                  </div>
                )}
              </div>

              {order.customer?.notes && (
                <div className="pt-2 border-t border-slate-800">
                  <p className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400" />
                    <span>{language === 'ar' ? 'تعليمات التجهيز والتوصيل:' : 'Delivery Instructions:'}</span>
                  </p>
                  <p className="text-amber-200/90 italic bg-amber-950/30 p-2.5 rounded-lg border border-amber-800/40 leading-relaxed">
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
                    className="text-xs py-1 px-3"
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
                    <div className="w-9 h-9 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {order.driver.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">
                        {order.driver.name}
                      </h4>
                      <p className="text-slate-400 text-[11px] font-mono">
                        {language === 'ar' ? `كابتن #${order.driver.id}` : `Courier ID #${order.driver.id}`}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-300 font-mono" dir="ltr">
                      <Phone className="w-4 h-4 text-slate-500" />
                      <span>{order.driver.phone}</span>
                    </div>
                    <a
                      href={`tel:${order.driver.phone}`}
                      className="text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded transition-colors border border-slate-700"
                    >
                      {language === 'ar' ? 'اتصال بالكابتن' : 'Call Courier'}
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-slate-400">
                  <Truck className="w-6 h-6 mx-auto text-slate-500 mb-1" />
                  <p className="font-semibold text-slate-300">{t('unassigned')}</p>
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

      {/* Edit Order Modal */}
      <EditOrderModal
        isOpen={editModalOpen}
        order={order}
        onClose={() => setEditModalOpen(false)}
        onOrderUpdated={(updated) => setOrder(updated)}
      />

      {/* Edit Customer Modal */}
      {order.customer && (
        <CustomerModal
          isOpen={customerModalOpen}
          customer={order.customer}
          onClose={() => setCustomerModalOpen(false)}
          isOwner={isOwner}
          onSuccess={(updatedCustomer) => {
            if (updatedCustomer) {
              setOrder((prev) => ({
                ...prev,
                customer: {
                  ...prev.customer,
                  ...updatedCustomer,
                },
              }));
            } else {
              fetchOrderDetails();
            }
            setCustomerModalOpen(false);
          }}
        />
      )}

      {/* Delete Confirmation Modal for Admin */}
      <ConfirmModal
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('delete_order_title')}
        message={
          language === 'ar'
            ? `هل أنت متأكد من رغبتك في حذف طلب الأسماك #${order?.id} للعميل "${order?.customer?.name || ''}" نهائياً؟ هذا الإجراء نهائي ولا يمكن التراجع عنه وسيتم مسح الطلب من النظام.`
            : `Are you sure you want to permanently delete seafood order #${order?.id} for customer "${order?.customer?.name || ''}"? This action cannot be undone.`
        }
        confirmText={t('delete_order_btn')}
        cancelText={t('cancel')}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
