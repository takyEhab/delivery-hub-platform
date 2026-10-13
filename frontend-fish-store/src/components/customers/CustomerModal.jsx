import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { createCustomer, updateCustomer } from '../../api/customers';
import { getErrorMessage } from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { useLanguage } from '../../context/LanguageContext';
import { isContactPickerSupported, selectContact, normalizePhone } from '../../utils/contacts';
import { getCurrentGpsLocation } from '../../utils/location';
import { Smartphone, User, Phone, MapPin, FileText, UserCheck, Trash2, Navigation, ExternalLink, Loader2 } from 'lucide-react';

export function CustomerModal({
  isOpen,
  onClose,
  customer,
  existingCustomers = [],
  onSuccess,
  onDelete,
  isOwner,
}) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    location_url: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isPickingContact, setIsPickingContact] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const { success, error: toastError, warning, info } = useToast();
  const { t, language } = useLanguage();
  const isEditing = Boolean(customer?.id);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        address: customer.address || '',
        location_url: customer.location_url || '',
        notes: customer.notes || '',
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        address: '',
        location_url: '',
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
        const norm = normalizePhone(contact.phone);
        const existingMatch = (existingCustomers || []).find((c) => {
          if (isEditing && c.id === customer?.id) return false;
          return normalizePhone(c.phone) === norm;
        });

        setFormData((prev) => ({
          ...prev,
          name: contact.name || prev.name,
          phone: contact.phone || prev.phone,
          address: contact.address || prev.address,
        }));

        if (existingMatch) {
          setErrors((prev) => ({
            ...prev,
            phone:
              language === 'ar'
                ? `رقم الهاتف مسجل بالفعل باسم "${existingMatch.name}". لا يمكن تكرار رقم الهاتف.`
                : `This phone is already registered to "${existingMatch.name}".`,
          }));
          warning(
            language === 'ar'
              ? `رقم الهاتف مسجل مسبقاً باسم "${existingMatch.name}". غير مسموح بتكرار رقم الهاتف.`
              : `This contact is already registered to "${existingMatch.name}". Only 1 customer per phone is allowed.`,
            language === 'ar' ? 'رقم مكرر' : 'Duplicate Phone'
          );
        } else {
          setErrors((prev) => {
            const copy = { ...prev };
            delete copy.phone;
            return copy;
          });
          success(language === 'ar' ? `تم استيراد: ${contact.name}` : `Imported ${contact.name}!`);
        }
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
    } else {
      // Check phone uniqueness against existing customers
      const norm = normalizePhone(formData.phone);
      const existingMatch = (existingCustomers || []).find((c) => {
        if (isEditing && c.id === customer?.id) return false;
        return normalizePhone(c.phone) === norm;
      });
      if (existingMatch) {
        errs.phone =
          language === 'ar'
            ? `رقم الهاتف مسجل بالفعل باسم "${existingMatch.name}". لا يمكن تسجيل أكثر من عميل بنفس الرقم.`
            : `This phone number is already registered to "${existingMatch.name}".`;
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleGetGps = async () => {
    setIsLocatingGps(true);
    try {
      const { url } = await getCurrentGpsLocation(language);
      setFormData((prev) => ({ ...prev, location_url: url }));
      success(
        language === 'ar'
          ? 'تم التقاط موقعك الجغرافي الحالي عبر GPS بنجاح!'
          : 'Current GPS location captured successfully!',
        language === 'ar' ? 'تحديد الموقع' : 'GPS Location'
      );
    } catch (err) {
      toastError(err.message || 'Failed to capture GPS location');
    } finally {
      setIsLocatingGps(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    const normPhone = normalizePhone(formData.phone);
    const payload = {
      name: formData.name.trim(),
      phone: normPhone,
      address: formData.address?.trim() || null,
      location_url: formData.location_url?.trim() || null,
      notes: formData.notes?.trim() || null,
    };

    try {
      let result = null;
      if (isEditing) {
        result = await updateCustomer(customer.id, payload);
        const title = language === 'ar' ? 'تم التحديث بنجاح' : 'Customer Updated';
        const msg = language === 'ar'
          ? `تم تحديث بيانات العميل ${payload.name} بنجاح!`
          : `Customer ${payload.name} updated successfully!`;
        success(msg, title);
      } else {
        result = await createCustomer(payload);
        const title = language === 'ar' ? 'تمت الإضافة بنجاح' : 'Customer Created';
        const msg = language === 'ar'
          ? `تمت إضافة العميل الجديد ${payload.name} بنجاح!`
          : `Customer ${payload.name} added successfully!`;
        success(msg, title);
      }
      if (onSuccess) onSuccess(result);
      onClose();
    } catch (err) {
      const errMsg = getErrorMessage(err);
      toastError(errMsg);
      if (errMsg.toLowerCase().includes('phone') || errMsg.toLowerCase().includes('already exists') || errMsg.includes('مسجل')) {
        setErrors((prev) => ({ ...prev, phone: errMsg }));
      }
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

        {/* Google Maps Location / Link */}
        <div className="w-full space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-300">
              {language === 'ar' ? 'موقع خرائط جوجل (اختياري)' : 'Google Maps Location (Optional)'}
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGetGps}
                disabled={isLocatingGps}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 disabled:opacity-50 transition-colors"
              >
                {isLocatingGps ? (
                  <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                ) : (
                  <Navigation className="w-3 h-3 text-cyan-400" />
                )}
                <span>
                  {isLocatingGps
                    ? (language === 'ar' ? 'جاري التحديد...' : 'Locating...')
                    : (language === 'ar' ? 'حدد موقعي بالـ GPS' : 'Use My GPS')}
                </span>
              </button>
              {formData.location_url && (
                <a
                  href={formData.location_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-300 hover:text-teal-200 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>{language === 'ar' ? 'اختبار الرابط' : 'Test Link'}</span>
                </a>
              )}
            </div>
          </div>
          <div className="relative rounded-xl shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 flex items-center pl-3 rtl:pl-0 rtl:pr-3">
              <Navigation className="h-4 w-4 text-cyan-400/80" />
            </div>
            <input
              type="text"
              placeholder={
                language === 'ar'
                  ? 'الصق رابط موقع جوجل ماب أو واتساب أو إحداثيات...'
                  : 'Paste Google Maps URL, WhatsApp link, or coordinates...'
              }
              value={formData.location_url}
              onChange={(e) => setFormData({ ...formData, location_url: e.target.value })}
              className="block w-full rounded-xl border border-slate-700/80 bg-[#020b14]/80 text-sm text-white placeholder:text-slate-500 pl-10 pr-3 rtl:pl-3 rtl:pr-10 py-2.5 focus:border-cyan-400 focus:outline-none transition-colors"
            />
          </div>
          <p className="text-[10px] text-slate-400">
            {language === 'ar'
              ? 'اضغط "حدد موقعي بالـ GPS" أو الصق رابط لوكيشن لتسهيل وصول الطيار بدقة وبضغطة واحدة.'
              : 'Tap "Use My GPS" or paste a location link for 1-click courier navigation.'}
          </p>
        </div>

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

        {isEditing && isOwner && onDelete && (
          <div className="pt-4 mt-3 border-t border-rose-950/70">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-rose-950/30 p-3.5 rounded-xl border border-rose-900/40">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" />
                  {t('delete_customer')}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  {language === 'ar'
                    ? 'سيُطلب منك تأكيد الحذف قبل إزالة العميل نهائياً'
                    : 'You will be asked to confirm before permanent removal'}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={Trash2}
                onClick={() => {
                  onClose();
                  onDelete(customer);
                }}
                className="text-xs text-rose-400 border-rose-800/80 hover:bg-rose-900/40 hover:text-rose-200 shrink-0 py-1.5 px-3"
              >
                {t('delete_customer')}
              </Button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
