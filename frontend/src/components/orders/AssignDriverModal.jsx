import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { listDrivers } from '../../api/drivers';
import { assignOrder } from '../../api/orders';
import { getErrorMessage } from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { Truck, AlertCircle } from 'lucide-react';

export function AssignDriverModal({ isOpen, onClose, order, onSuccess }) {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    if (isOpen) {
      setIsLoadingDrivers(true);
      listDrivers()
        .then((data) => {
          const activeDrivers = (data || []).filter((d) => d.is_active);
          setDrivers(activeDrivers);
          if (activeDrivers.length > 0) {
            setSelectedDriverId(String(activeDrivers[0].id));
          }
        })
        .catch((err) => {
          toastError(getErrorMessage(err));
        })
        .finally(() => {
          setIsLoadingDrivers(false);
        });
    }
  }, [isOpen, toastError]);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedDriverId) return;

    setIsSubmitting(true);
    try {
      const updatedOrder = await assignOrder(order.id, selectedDriverId);
      success(
        `Order #${order.id} assigned to driver ${updatedOrder.driver?.name || ''}!`,
        'Driver Assigned'
      );
      onSuccess(updatedOrder);
      onClose();
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign Driver to Order #${order?.id || ''}`}
      description="Select an active delivery driver to assign this order."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleAssign} className="space-y-4">
        {order?.driver && (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Notice: Order is already assigned</p>
              <p className="mt-0.5">
                Current driver: <strong>{order.driver.name}</strong> ({order.driver.phone})
              </p>
            </div>
          </div>
        )}

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Customer:</span>
            <span className="font-medium text-slate-900">{order?.customer?.name}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Destination:</span>
            <span className="font-medium text-slate-900 text-right truncate max-w-[200px]">
              {order?.customer?.address}
            </span>
          </div>
        </div>

        {isLoadingDrivers ? (
          <div className="py-4 text-center text-xs text-slate-500">
            Loading active drivers...
          </div>
        ) : drivers.length === 0 ? (
          <div className="p-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-xs text-slate-500">
            No active drivers available. Please add or activate a driver first.
          </div>
        ) : (
          <Select
            label="Select Active Driver"
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            required
          >
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} — ({d.phone})
              </option>
            ))}
          </Select>
        )}

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={Truck}
            isLoading={isSubmitting}
            disabled={drivers.length === 0}
          >
            Confirm Assignment
          </Button>
        </div>
      </form>
    </Modal>
  );
}
