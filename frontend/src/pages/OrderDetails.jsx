import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrder, updateOrderStatus } from '../api/orders';
import { getErrorMessage } from '../api/client';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
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
} from 'lucide-react';

export function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isOwner, isDriver } = useAuth();
  const { success, error: toastError } = useToast();

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
      success(
        `Order #${order.id} status updated to ${formatStatus(nextStatus)}!`,
        'Status Updated'
      );
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 mt-2">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-card">
        <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
        <h3 className="text-base font-semibold text-slate-800">Order Not Found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          The requested order does not exist or you are not authorized to view it.
        </p>
        <Link to="/orders" className="inline-block mt-4">
          <Button variant="outline" size="sm" icon={ArrowLeft}>
            Back to Orders
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
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Order #{order.id}
              </h1>
              <Badge variant={getStatusBadgeVariant(order.status)} dot>
                {formatStatus(order.status)}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Created {formatDate(order.created_at)}</span>
              {order.updated_at && order.updated_at !== order.created_at && (
                <>
                  <span>•</span>
                  <span>Updated {formatDate(order.updated_at)}</span>
                </>
              )}
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
            >
              Assign Driver
            </Button>
          )}

          {isAssignedToCurrentDriver && order.status === 'preparing' && (
            <Button
              variant="primary"
              size="md"
              icon={Truck}
              isLoading={isUpdatingStatus}
              onClick={() => handleAdvanceStatus('out_for_delivery')}
              className="bg-sky-600 hover:bg-sky-700"
            >
              Start Delivery (Out for Delivery)
            </Button>
          )}

          {isAssignedToCurrentDriver && order.status === 'out_for_delivery' && (
            <Button
              variant="primary"
              size="md"
              icon={CheckCircle2}
              isLoading={isUpdatingStatus}
              onClick={() => handleAdvanceStatus('delivered')}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Mark as Delivered
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
              title="Order Items"
              description={`Itemized list (${parsedItems.length} items)`}
            />
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-5">Item Description</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {parsedItems.map((item, idx) => {
                    const qty = item.quantity || 1;
                    const price = item.price || 0;
                    const itemTotal = qty * price;

                    return (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-3 px-5 font-medium text-slate-900">
                          {item.name || item.description || 'Item'}
                          {item.notes && (
                            <p className="text-[11px] text-slate-400 font-normal mt-0.5 italic">
                              "{item.notes}"
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-medium">
                          {qty}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-500">
                          {price ? formatCurrency(price) : '—'}
                        </td>
                        <td className="py-3 px-5 text-right font-semibold text-slate-900">
                          {price ? formatCurrency(itemTotal) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {subtotal > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-slate-200/80 bg-slate-50/50">
                      <td
                        colSpan={3}
                        className="py-3 px-5 text-right font-semibold text-slate-700 text-xs"
                      >
                        Subtotal / Estimated Total:
                      </td>
                      <td className="py-3 px-5 text-right font-bold text-slate-900 text-sm">
                        {formatCurrency(subtotal)}
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
              title="Customer Details"
              description={`ID #${order.customer?.id}`}
            />
            <CardBody className="space-y-3.5 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-100">
                  {order.customer?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">
                    {order.customer?.name}
                  </h4>
                  <p className="text-slate-400 text-[11px]">Recipient</p>
                </div>
              </div>

              {order.customer?.phone && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{order.customer.phone}</span>
                  </div>
                  <a
                    href={`tel:${order.customer.phone}`}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    Call Customer
                  </a>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{order.customer?.address}</span>
                </div>
                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:underline pl-6"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {order.customer?.notes && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Delivery Instructions:
                  </p>
                  <p className="text-slate-700 italic bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/60 leading-relaxed">
                    "{order.customer.notes}"
                  </p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Assigned Driver Card */}
          <Card>
            <CardHeader
              title="Assigned Driver"
              action={
                isOwner && !order.driver && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAssignModalOpen(true)}
                    className="text-xs py-1 px-2.5"
                  >
                    Assign
                  </Button>
                )
              }
            />
            <CardBody className="text-xs">
              {order.driver ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-sm shrink-0 border border-sky-100">
                      {order.driver.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">
                        {order.driver.name}
                      </h4>
                      <p className="text-slate-400 text-[11px]">
                        Driver ID #{order.driver.id}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{order.driver.phone}</span>
                    </div>
                    <a
                      href={`tel:${order.driver.phone}`}
                      className="text-xs font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      Call Driver
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-slate-400">
                  <Truck className="w-6 h-6 mx-auto text-slate-300 mb-1" />
                  <p className="font-medium text-slate-600">No driver assigned</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Order is currently awaiting driver dispatch.
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
