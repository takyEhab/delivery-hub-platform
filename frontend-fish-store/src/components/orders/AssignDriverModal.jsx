import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { listDrivers } from '../../api/drivers';
import { assignOrder } from '../../api/orders';
import { getErrorMessage } from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { useLanguage } from '../../context/LanguageContext';
import { Truck, AlertCircle } from 'lucide-react';

export function AssignDriverModal({ isOpen, onClose, order, onSuccess }) {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error: toastError } = useToast();
  const { t, language } = useLanguage();

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
      const title = language === 'ar' ? 'تم تعيين الكابتن' : 'Courier Assigned';
      const msg = language === 'ar'
        ? `تم تعيين الكابتن ${updatedOrder.driver?.name || ''} لتوصيل الطلب #${order.id}!`
        : `Order #${order.id} assigned to courier ${updatedOrder.driver?.name || ''}!`;

      success(msg, title);
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
      title={language === 'ar' ? `تعيين كابتن للطلب #${order?.id || ''}` : `Assign Courier to Order #${order?.id || ''}`}
      description={language === 'ar' ? 'اختر أحد كباتن أمير البحار المتاحين لتسليم هذا الطلب.' : 'Select an active delivery courier to assign this seafood order.'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleAssign} className="space-y-4">
        {order?.driver && (
          <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{language === 'ar' ? 'تنبيه: هذا الطلب مسند بالفعل' : 'Notice: Order already assigned'}</p>
              <p className="mt-0.5">
                {language === 'ar' ? 'الكابتن الحالي:' : 'Current courier:'} <strong>{order.driver.name}</strong> ({order.driver.phone})
              </p>
            </div>
          </div>
        )}

        <div className="bg-[#030e1a] p-3.5 rounded-xl border border-cyan-900/40 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-300">
            <span>{t('customer')}:</span>
            <span className="font-bold text-white">{order?.customer?.name}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>{t('address')}:</span>
            <span className="font-medium text-cyan-300 text-right truncate max-w-[200px]">
              {order?.customer?.address || '—'}
            </span>
          </div>
        </div>

        {isLoadingDrivers ? (
          <div className="py-4 text-center text-xs text-slate-400">
            {language === 'ar' ? 'جاري تحميل الكباتن المتاحين...' : 'Loading active couriers...'}
          </div>
        ) : drivers.length === 0 ? (
          <div className="p-4 text-center bg-[#030e1a] rounded-xl border border-dashed border-cyan-800 text-xs text-slate-400">
            {language === 'ar' ? 'لا يوجد كباتن متاحين حالياً. يرجى تفعيل أو إضافة كابتن جديد.' : 'No active couriers available.'}
          </div>
        ) : (
          <Select
            label={language === 'ar' ? 'اختر الكابتن المسؤول' : 'Select Courier'}
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

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-cyan-950/80">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="border-slate-700 text-slate-300">
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={Truck}
            isLoading={isSubmitting}
            disabled={drivers.length === 0}
            className="bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold border-0"
          >
            {language === 'ar' ? 'تأكيد التعيين' : 'Confirm Assignment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
