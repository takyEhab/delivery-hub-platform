import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ConfirmModal } from '../ui/ConfirmModal';
import { deleteOrder } from '../../api/orders';
import { useToast } from '../../hooks/useToast';
import { getErrorMessage } from '../../api/client';
import {
  formatStatus,
  getStatusBadgeVariant,
  formatDate,
} from '../../utils/formatters';
import { OrderCard } from './OrderCard';
import { Package, Truck, Phone, ChevronRight, User, Trash2 } from 'lucide-react';

export function OrderTable({
  orders,
  onAssignClick,
  onStatusUpdated,
  onOrderDeleted,
  isOwner,
  isDriver,
}) {
  const { success, error: toastError } = useToast();

  const [orderToDelete, setOrderToDelete] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (order) => {
    setOrderToDelete(order);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    try {
      await deleteOrder(orderToDelete.id);
      success(`Order #${orderToDelete.id} was permanently deleted.`, 'Order Deleted');
      setConfirmDeleteOpen(false);
      if (onOrderDeleted) {
        onOrderDeleted(orderToDelete.id);
      }
      setOrderToDelete(null);
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-white rounded-xl border border-slate-200/80 shadow-card">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
          <Package className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">No orders found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          {isDriver
            ? 'You currently have no delivery orders assigned to you.'
            : 'No orders have been recorded or match your filter criteria.'}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View (for Owner or desktop displays) */}
      <div className="hidden lg:block bg-white rounded-xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-medium text-xs uppercase tracking-wider">
                <th className="py-3.5 px-5">Order</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Address</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Driver</th>
                <th className="py-3.5 px-4">Created</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {orders.map((order) => {
                const parsedItems = Array.isArray(order.items)
                  ? order.items
                  : typeof order.items === 'string'
                  ? [{ name: order.items, quantity: 1 }]
                  : [];

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/75 transition-colors group"
                  >
                    <td className="py-3.5 px-5">
                      <Link
                        to={`/orders/${order.id}`}
                        className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors"
                      >
                        #{order.id}
                      </Link>
                      <p className="text-[11px] text-slate-400">
                        {parsedItems.length} item{parsedItems.length === 1 ? '' : 's'}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900 text-xs">
                        {order.customer?.name}
                      </p>
                      {order.customer?.phone && (
                        <a
                          href={`tel:${order.customer.phone}`}
                          className="text-[11px] text-slate-500 hover:text-emerald-600 inline-flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-slate-400" />
                          {order.customer.phone}
                        </a>
                      )}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-xs text-slate-600 truncate">
                        {order.customer?.address}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge
                        variant={getStatusBadgeVariant(order.status)}
                        size="sm"
                        dot
                      >
                        {formatStatus(order.status)}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {order.driver ? (
                        <div className="flex items-center gap-1.5 text-xs text-slate-700">
                          <Truck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          <span className="font-medium">{order.driver.name}</span>
                        </div>
                      ) : isOwner ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAssignClick(order)}
                          className="text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 py-1 px-2.5 h-auto"
                        >
                          Assign Driver
                        </Button>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(order.created_at)}
                    </td>

                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/orders/${order.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            icon={ChevronRight}
                            iconPosition="right"
                            className="text-xs py-1 px-2.5"
                          >
                            View
                          </Button>
                        </Link>
                        {isOwner && (
                          <Button
                            variant="danger"
                            size="sm"
                            icon={Trash2}
                            onClick={() => handleDeleteClick(order)}
                            className="text-xs py-1 px-2.5"
                            title="Delete Order"
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile / Tablet Cards Grid */}
      <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            isOwner={isOwner}
            isDriver={isDriver}
            onStatusUpdated={onStatusUpdated}
            onAssignClick={onAssignClick}
            onDeleteClick={handleDeleteClick}
          />
        ))}
      </div>

      {/* Admin Confirm Deletion Dialog */}
      <ConfirmModal
        isOpen={confirmDeleteOpen}
        onClose={() => {
          setConfirmDeleteOpen(false);
          setOrderToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Order Permanently"
        message={`Are you sure you want to permanently delete order #${orderToDelete?.id} for customer "${orderToDelete?.customer?.name || ''}"? This action cannot be undone.`}
        confirmText="Delete Order"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
