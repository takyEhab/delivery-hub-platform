import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { createCustomer, updateCustomer } from '../../api/customers';
import { getErrorMessage } from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { useLanguage } from '../../context/LanguageContext';
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
  const { t, language } = useLanguage();
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
        language === 'ar'
          ? 'استيراد جهات الاتصال متاح على متصفحات الهواتف المحمولة.'
          : 'Contact Picker is available on mobile browsers.',
        language === 'ar' ? 'ميزة الموبايل' : 'Device Notice'
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
        success(language === 'ar' ? `تم استيراد: ${contact.name}` : `Imported ${contact.name}!`);
      }
    } catch (err) {
      toastError(err.message || 'Failed to select contact from device');
    } finally {
      setIsPickingContact(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = language === 'ar' ? 'اسم العميل مطلوب' : 'Customer name is required';
    }
    if (!formData.phone.trim()) {
      errs.phone = language === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone number is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      if (isEditing) {
        await updateCustomer(customer.id, formData);
        const title = language === 'ar' ? 'تم التحديث بنجاح' : 'Customer Updated';
        const msg = language === 'ar'
          ? `تم تحديث بيانات العميل ${formData.name} بنجاح!`
          : `Customer ${formData.name} updated successfully!`;
        success(msg, title);
      } else {
        await createCustomer(formData);
        const title = language === 'ar' ? 'تمت الإضافة بنجاح' : 'Customer Created';
        const msg = language === 'ar'
          ? `تمت إضافة العميل الجديد ${formData.name} بنجاح!`
          : `Customer ${formData.name} added successfully!`;
        success(msg, title);
      }
      onSuccess();
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
      title={
        isEditing
          ? (language === 'ar' ? `تعديل بيانات العميل #${customer?.id}` : `Edit Customer #${customer?.id}`)
          : (language === 'ar' ? 'إضافة عميل جديد — أمير البحار' : 'Add New Customer — Prince of the Seas')
      }
      description={
        language === 'ar'
          ? 'سجل اسم العميل ورقم هاتفه وعنوان التوصيل المعتاد لمحل الأسماك.'
          : 'Save customer phone, delivery address, and preferences.'
      }
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Contact picker autofill trigger */}
        {!isEditing && (
          <div className="flex items-center justify-between p-3 bg-cyan-950/40 rounded-xl border border-cyan-800/40">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-cyan-200">
                {language === 'ar' ? 'استيراد جهة اتصال' : 'Autofill from device contacts'}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              isLoading={isPickingContact}
              onClick={handleContactImport}
              className="bg-cyan-900/60 border-cyan-500/40 text-cyan-200 hover:bg-cyan-800/60 text-xs py-1 px-3"
            >
              {language === 'ar' ? 'اختر جهة اتصال' : 'Choose Contact'}
            </Button>
          </div>
        )}

        <Input
          label={t('customer_name')}
          placeholder={language === 'ar' ? 'اسم العميل بالكامل' : 'Full name'}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          error={errors.name}
          icon={User}
        />

        <Input
          label={t('customer_phone')}
          placeholder="010XXXXXXXX"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
          error={errors.phone}
          icon={Phone}
        />

        <Input
          label={t('delivery_address_opt')}
          placeholder={language === 'ar' ? 'المنطقة / الشارع / رقم العمارة' : 'Street, building, floor...'}
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          icon={MapPin}
        />

        <Input
          label={t('order_notes')}
          placeholder={language === 'ar' ? 'تفضيلات العميل (مثل: يحب السمك مشوي بزيادة)' : 'Cooking preferences or gate code...'}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          icon={FileText}
        />

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-cyan-950/80">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="border-slate-700 text-slate-300">
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            icon={UserCheck}
            className="bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold border-0"
          >
            {isEditing
              ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes')
              : (language === 'ar' ? 'حفظ العميل' : 'Save Customer')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
