import React, { useState, useEffect, useCallback } from 'react';
import { listDrivers, deleteDriver } from '../api/drivers';
import { getErrorMessage } from '../api/client';
import { useToast } from '../hooks/useToast';
import { useLanguage } from '../context/LanguageContext';
import { DriverTable } from '../components/drivers/DriverTable';
import { DriverModal } from '../components/drivers/DriverModal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Button } from '../components/ui/Button';
import { TableSkeleton } from '../components/ui/Skeleton';
import { Truck, Plus, RefreshCw, UserCheck } from 'lucide-react';

export function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  // Deletion modal state
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { success, error: toastError } = useToast();
  const { t, language } = useLanguage();

  const fetchDrivers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await listDrivers();
      setDrivers(data || []);
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleCreateClick = () => {
    setEditingDriver(null);
    setModalOpen(true);
  };

  const handleEditClick = (driver) => {
    setEditingDriver(driver);
    setModalOpen(true);
  };

  const handleDeleteClick = (driver) => {
    setDriverToDelete(driver);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!driverToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDriver(driverToDelete.id);
      success(
        language === 'ar'
          ? `تم حذف الكابتن ${driverToDelete.name} بنجاح.`
          : `Courier ${driverToDelete.name} has been removed.`
      );
      setConfirmDeleteOpen(false);
      setDriverToDelete(null);
      fetchDrivers();
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const activeCount = drivers.filter((d) => d.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-400 stroke-[2.2]" />
              <span>{t('drivers_title')}</span>
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono font-medium">
              {activeCount} {language === 'ar' ? 'متاح' : 'Active'} / {drivers.length} {language === 'ar' ? 'إجمالي' : 'Total'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t('drivers_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => fetchDrivers()}
            className="text-xs"
          >
            {t('refresh')}
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleCreateClick}
            className="text-xs"
          >
            {t('add_driver')}
          </Button>
        </div>
      </div>

      {/* Drivers Table / Cards */}
      {isLoading ? (
        <div className="bg-[#0F1622] rounded-xl border border-slate-800/80 p-4">
          <TableSkeleton rows={4} cols={5} />
        </div>
      ) : (
        <DriverTable
          drivers={drivers}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Create / Edit Modal */}
      <DriverModal
        isOpen={modalOpen}
        driver={editingDriver}
        onClose={() => {
          setModalOpen(false);
          setEditingDriver(null);
        }}
        onSuccess={() => fetchDrivers()}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmDeleteOpen}
        onClose={() => {
          setConfirmDeleteOpen(false);
          setDriverToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={language === 'ar' ? 'تأكيد إزالة الكابتن' : 'Remove Courier'}
        message={
          language === 'ar'
            ? `هل أنت متأكد من رغبتك في حذف الكابتن "${driverToDelete?.name}" من طاقم توصيل أمير البحار؟`
            : `Are you sure you want to remove ${driverToDelete?.name}?`
        }
        confirmText={language === 'ar' ? 'حذف الكابتن' : 'Remove Courier'}
        cancelText={t('cancel')}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
