import React, { useState, useEffect, useCallback } from 'react';
import { listDrivers, deleteDriver } from '../api/drivers';
import { getErrorMessage } from '../api/client';
import { useToast } from '../hooks/useToast';
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
      success(`Driver ${driverToDelete.name} has been removed.`);
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
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Delivery Drivers
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-200/70 text-slate-700 text-xs font-semibold">
              {activeCount} Active / {drivers.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your driver roster, credentials, phone accounts, and dispatch availability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => fetchDrivers()}
            className="text-xs"
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleCreateClick}
            className="text-xs"
          >
            Add Driver
          </Button>
        </div>
      </div>

      {/* Driver List Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
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
        onClose={() => setModalOpen(false)}
        driver={editingDriver}
        onSuccess={fetchDrivers}
      />

      {/* Confirm Deletion Dialog */}
      <ConfirmModal
        isOpen={confirmDeleteOpen}
        onClose={() => {
          setConfirmDeleteOpen(false);
          setDriverToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Remove Driver"
        message={`Are you sure you want to delete ${driverToDelete?.name}? Any pending orders assigned to this driver will have their assignment reset.`}
        confirmText="Delete Driver"
        isLoading={isDeleting}
      />
    </div>
  );
}
