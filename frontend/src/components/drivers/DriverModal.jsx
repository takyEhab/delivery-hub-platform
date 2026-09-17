import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { createDriver, updateDriver } from '../../api/drivers';
import { getErrorMessage } from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { User, Phone, Mail, Lock, ShieldCheck } from 'lucide-react';

export function DriverModal({ isOpen, onClose, driver, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    is_active: true,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { success, error: toastError } = useToast();
  const isEditing = Boolean(driver?.id);

  useEffect(() => {
    if (driver) {
      setFormData({
        name: driver.name || '',
        phone: driver.phone || '',
        email: driver.email || '',
        password: '',
        is_active: driver.is_active ?? true,
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        password: '',
        is_active: true,
      });
    }
    setErrors({});
  }, [driver, isOpen]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Driver name is required';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    else if (formData.phone.trim().length < 3)
      errs.phone = 'Phone must be at least 3 characters';

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errs.email = 'Please provide a valid email address';
      }
    }

    if (!isEditing) {
      if (!formData.password) errs.password = 'Password is required';
      else if (formData.password.length < 6)
        errs.password = 'Password must be at least 6 characters';
    } else if (formData.password && formData.password.length < 6) {
      errs.password = 'New password must be at least 6 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      let saved;
      if (isEditing) {
        const payload = {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email?.trim() || null,
          is_active: formData.is_active,
        };
        if (formData.password) {
          payload.password = formData.password;
        }
        saved = await updateDriver(driver.id, payload);
        success(`Driver ${saved.name} updated successfully!`);
      } else {
        saved = await createDriver({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email?.trim() || null,
          password: formData.password,
        });
        success(`Driver ${saved.name} added to roster!`);
      }
      onSuccess(saved);
      onClose();
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Driver' : 'Add New Driver'}
      description={
        isEditing
          ? 'Update driver credentials, contact details, or active delivery status.'
          : 'Add a new delivery driver to your team roster.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="e.g. John Miller"
          icon={User}
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
        />

        <Input
          label="Phone Number"
          placeholder="e.g. 0509876543"
          icon={Phone}
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          error={errors.phone}
          helperText="Used by driver to log into DeliveryHub portal."
        />

        <Input
          label="Email Address (Optional)"
          type="email"
          placeholder="e.g. driver@example.com"
          icon={Mail}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
        />

        <Input
          label={isEditing ? 'Change Password (Optional)' : 'Password'}
          type="password"
          placeholder={isEditing ? 'Leave blank to keep existing password' : '••••••••'}
          icon={Lock}
          required={!isEditing}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          error={errors.password}
          helperText={
            isEditing
              ? 'Only fill this if you want to reset the driver login password.'
              : 'Must be at least 6 characters.'
          }
        />

        {isEditing && (
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <div className="flex-1 text-xs">
                <span className="font-semibold text-slate-800 block">
                  Active Status
                </span>
                <span className="text-slate-500 block">
                  Inactive drivers cannot log in or be assigned to new delivery orders.
                </span>
              </div>
            </label>
          </div>
        )}

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Create Driver'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
