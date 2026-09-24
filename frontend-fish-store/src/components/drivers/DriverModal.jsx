import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { createDriver, updateDriver } from '../../api/drivers';
import { getErrorMessage } from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { useLanguage } from '../../context/LanguageContext';
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
  const { t, language } = useLanguage();
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
    if (!formData.name.trim()) {
      errs.name = language === 'ar' ? 'اسم الكابتن مطلوب' : 'Driver name is required';
    }
    if (!formData.phone.trim()) {
      errs.phone = language === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone number is required';
    }

    if (!isEditing) {
      if (!formData.password) {
        errs.password = language === 'ar' ? 'كلمة المرور مطلوبة' : 'Password is required';
      } else if (formData.password.length < 6) {
        errs.password = language === 'ar' ? 'كلمة المرور يجب أن لا تقل عن 6 أحرف' : 'Password must be at least 6 characters';
      }
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
        const payload = {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email?.trim() || null,
          is_active: formData.is_active,
        };
        if (formData.password) payload.password = formData.password;
        await updateDriver(driver.id, payload);
        const title = language === 'ar' ? 'تم التحديث بنجاح' : 'Driver Updated';
        const msg = language === 'ar'
          ? `تم تحديث بيانات الكابتن ${formData.name} بنجاح!`
          : `Driver ${formData.name} updated successfully!`;
        success(msg, title);
      } else {
        await createDriver({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email?.trim() || null,
          password: formData.password,
          is_active: formData.is_active,
        });
        const title = language === 'ar' ? 'تمت إضافة الكابتن' : 'Driver Created';
        const msg = language === 'ar'
          ? `تمت إضافة الكابتن ${formData.name} بنجاح!`
          : `Driver ${formData.name} created successfully!`;
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
          ? (language === 'ar' ? `تعديل بيانات الكابتن #${driver?.id}` : `Edit Courier #${driver?.id}`)
          : (language === 'ar' ? 'إضافة كابتن توصيل جديد' : 'Add New Courier')
      }
      description={
        language === 'ar'
          ? 'سجل بيانات الكابتن لتسجيل الدخول واستلام طلبات الأسماك.'
          : 'Set credentials and delivery availability.'
      }
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={language === 'ar' ? 'اسم الكابتن' : 'Courier Name'}
          placeholder={language === 'ar' ? 'مثال: كابتن محمود حسن' : 'Full name'}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          error={errors.name}
          icon={User}
        />

        <Input
          label={t('phone_label')}
          placeholder="010XXXXXXXX"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
          error={errors.phone}
          icon={Phone}
        />

        <Input
          label={t('password_label')}
          type="password"
          placeholder={isEditing ? (language === 'ar' ? 'اتركه فارغاً للإبقاء على القديم' : 'Leave empty to keep current') : '••••••••'}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required={!isEditing}
          error={errors.password}
          icon={Lock}
        />

        {/* Active Toggle Switch */}
        <div className="pt-2">
          <label className="flex items-center gap-3 p-3 rounded-xl bg-[#030e1a] border border-cyan-900/40 cursor-pointer hover:bg-cyan-950/30 transition-colors">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 bg-slate-900 border-slate-700"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">
                {language === 'ar' ? 'كابتن متاح لاستقبال الطلبات' : 'Active and available for delivery'}
              </span>
              <span className="text-[11px] text-slate-400">
                {language === 'ar' ? 'يمكن تعيين طلبات أسماك جديدة له' : 'Can receive and accept delivery dispatches'}
              </span>
            </div>
          </label>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-cyan-950/80">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="border-slate-700 text-slate-300">
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold border-0"
          >
            {isEditing
              ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes')
              : (language === 'ar' ? 'إضافة الكابتن' : 'Add Courier')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
