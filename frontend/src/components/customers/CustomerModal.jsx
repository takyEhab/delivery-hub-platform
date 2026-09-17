import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { createCustomer, updateCustomer } from '../../api/customers';
import { getErrorMessage } from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { isContactPickerSupported, selectContact } from '../../utils/contacts';
import { Smartphone, User, Phone, MapPin, FileText, UserCheck } from 'lucide-react';

export function CustomerModal({ isOpen, onClose, customer, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isPickingContact, setIsPickingContact] = useState(false);
  const { success, error: toastError, info } = useToast();
  const isEditing = Boolean(customer?.id);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        address: customer.address || '',
        notes: customer.notes || '',
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        address: '',
        notes: '',
      });
    }
    setErrors({});
  }, [customer, isOpen]);

  const handleContactImport = async () => {
    if (!isContactPickerSupported()) {
      info(
        'Contact Picker is available on mobile browsers (e.g. Chrome on Android). You can type manually on desktop.',
        'Device Notice'
      );
      return;
    }

    setIsPickingContact(true);
    try {
      const contact = await selectContact();
      if (contact) {
        setFormData((prev) => ({
          ...prev,
          name: contact.name || prev.name,
          phone: contact.phone || prev.phone,
          address: contact.address || prev.address,
        }));
        success(`Autofilled ${contact.name} (${contact.phone})!`, 'Contact Selected');
      }
    } catch (err) {
      toastError(err.message || 'Failed to select contact');
    } finally {
      setIsPickingContact(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Customer name is required';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    else if (formData.phone.trim().length < 3)
      errs.phone = 'Phone number must be at least 3 characters';
    
    // Note: address is optional per user request
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
        saved = await updateCustomer(customer.id, {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          address: formData.address?.trim() || null,
          notes: formData.notes?.trim() || null,
        });
        success(`Customer ${saved.name} updated successfully!`);
      } else {
        saved = await createCustomer({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          address: formData.address?.trim() || null,
          notes: formData.notes?.trim() || null,
        });
        success(`Customer ${saved.name} created successfully!`);
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
      title={isEditing ? 'Edit Customer' : 'Add New Customer'}
      description={
        isEditing
          ? 'Update delivery and contact information for this customer.'
          : 'Create a new customer profile manually or choose from device contacts.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Autofill from contact button */}
        {!isEditing && (
          <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-950">
                  Select from Contacts
                </p>
                <p className="text-[11px] text-emerald-700">
                  Autofill name and phone number instantly
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={UserCheck}
              isLoading={isPickingContact}
              onClick={handleContactImport}
              className="bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs py-1.5 px-3"
            >
              Choose Contact
            </Button>
          </div>
        )}

        <Input
          label="Full Name"
          placeholder="e.g. Sarah Jenkins"
          icon={User}
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
        />

        <Input
          label="Phone Number"
          placeholder="e.g. 0501234567"
          icon={Phone}
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          error={errors.phone}
        />

        <div className="w-full">
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Delivery Address (Optional)
          </label>
          <div className="relative rounded-lg shadow-sm">
            <div className="pointer-events-none absolute top-2.5 left-0 flex items-center pl-3">
              <MapPin className="h-4 w-4 text-slate-400" />
            </div>
            <textarea
              rows={2}
              placeholder="Building, street, apartment or instructions (optional)..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="block w-full rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 pl-9 pr-3 py-2 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 hover:border-slate-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="w-full">
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Delivery Notes (Optional)
          </label>
          <div className="relative rounded-lg shadow-sm">
            <div className="pointer-events-none absolute top-2.5 left-0 flex items-center pl-3">
              <FileText className="h-4 w-4 text-slate-400" />
            </div>
            <textarea
              rows={2}
              placeholder="e.g. Ring bell twice, leave with doorman..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="block w-full rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 pl-9 pr-3 py-2 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 hover:border-slate-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Create Customer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
