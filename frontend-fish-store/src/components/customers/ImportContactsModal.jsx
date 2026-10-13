import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { createCustomer } from '../../api/customers';
import { getErrorMessage } from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { useLanguage } from '../../context/LanguageContext';
import { normalizePhone } from '../../utils/contacts';
import { Users, Phone, Check, CheckSquare, Square, AlertCircle, UserCheck } from 'lucide-react';

export function ImportContactsModal({
  isOpen,
  onClose,
  contacts = [],
  existingCustomers = [],
  onSuccess,
}) {
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const { success, error: toastError, warning, info } = useToast();
  const { t, language } = useLanguage();

  // Map existing customers by normalized phone
  const existingPhoneMap = useMemo(() => {
    const map = new Map();
    (existingCustomers || []).forEach((cust) => {
      if (cust.phone) {
        map.set(normalizePhone(cust.phone), cust);
      }
    });
    return map;
  }, [existingCustomers]);

  // Analyze imported contacts for duplicates
  const analyzedContacts = useMemo(() => {
    const seenInBatch = new Set();
    return (contacts || []).map((c, idx) => {
      const norm = normalizePhone(c.phone);
      const existingMatch = existingPhoneMap.get(norm);
      const isBatchDuplicate = seenInBatch.has(norm);
      seenInBatch.add(norm);

      return {
        ...c,
        originalIndex: idx,
        normalizedPhone: norm,
        isAlreadyRegistered: Boolean(existingMatch),
        existingName: existingMatch ? existingMatch.name : null,
        isBatchDuplicate,
      };
    });
  }, [contacts, existingPhoneMap]);

  // Select non-duplicate contacts by default
  useEffect(() => {
    const newIndices = analyzedContacts
      .filter((c) => !c.isAlreadyRegistered && !c.isBatchDuplicate)
      .map((c) => c.originalIndex);
    setSelectedIndices(newIndices);
    setImportProgress(0);
  }, [analyzedContacts]);

  const newContactsCount = analyzedContacts.filter(
    (c) => !c.isAlreadyRegistered && !c.isBatchDuplicate
  ).length;
  const duplicateContactsCount = analyzedContacts.length - newContactsCount;

  const toggleSelectAll = () => {
    const validIndices = analyzedContacts
      .filter((c) => !c.isAlreadyRegistered && !c.isBatchDuplicate)
      .map((c) => c.originalIndex);

    if (selectedIndices.length === validIndices.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(validIndices);
    }
  };

  const toggleIndex = (idx) => {
    const item = analyzedContacts[idx];
    if (item && (item.isAlreadyRegistered || item.isBatchDuplicate)) return;

    setSelectedIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleImport = async () => {
    const toImport = analyzedContacts.filter(
      (c) =>
        selectedIndices.includes(c.originalIndex) &&
        !c.isAlreadyRegistered &&
        !c.isBatchDuplicate
    );

    if (toImport.length === 0) {
      info(
        language === 'ar'
          ? 'لم يتم تحديد جهات اتصال جديدة للإضافة.'
          : 'No new contacts selected for import.',
        language === 'ar' ? 'تنبيه' : 'Notice'
      );
      return;
    }

    setIsSubmitting(true);
    setImportProgress(0);

    let successCount = 0;
    let skippedDuplicates = 0;
    const errorsList = [];
    const importedPhones = new Set();

    for (let i = 0; i < toImport.length; i++) {
      const contact = toImport[i];
      const phone = contact.normalizedPhone;

      if (importedPhones.has(phone) || existingPhoneMap.has(phone)) {
        skippedDuplicates++;
        continue;
      }

      try {
        await createCustomer({
          name: contact.name.trim() || phone,
          phone: phone,
          address: contact.address || null,
          notes: null,
        });
        importedPhones.add(phone);
        successCount++;
      } catch (err) {
        const errMsg = getErrorMessage(err);
        if (
          errMsg.toLowerCase().includes('already exists') ||
          errMsg.toLowerCase().includes('duplicate') ||
          errMsg.includes('مسجل')
        ) {
          skippedDuplicates++;
        } else {
          errorsList.push(`${contact.name} (${contact.phone}): ${errMsg}`);
        }
      }

      setImportProgress(Math.round(((i + 1) / toImport.length) * 100));
    }

    setIsSubmitting(false);

    if (successCount > 0) {
      success(
        language === 'ar'
          ? `تم استيراد ${successCount} عميل جديد بنجاح!`
          : `Successfully imported ${successCount} new customer(s)!`,
        language === 'ar' ? 'تم الاستيراد' : 'Import Complete'
      );

      if (skippedDuplicates > 0 || duplicateContactsCount > 0) {
        info(
          language === 'ar'
            ? `تم تخطي ${skippedDuplicates + duplicateContactsCount} جهة اتصال مكررة تلقائياً لمنع التكرار.`
            : `Safely skipped ${skippedDuplicates + duplicateContactsCount} duplicate contacts.`,
          language === 'ar' ? 'منع التكرار' : 'Duplicates Restricted'
        );
      }

      if (errorsList.length > 0) {
        warning(
          language === 'ar'
            ? `تعذر استيراد ${errorsList.length} جهة اتصال بسبب مشاكل في الشبكة.`
            : `${errorsList.length} contact(s) could not be imported.`,
          language === 'ar' ? 'تنبيه' : 'Notice'
        );
      }

      if (onSuccess) onSuccess();
      onClose();
    } else if (skippedDuplicates > 0 || duplicateContactsCount > 0) {
      info(
        language === 'ar'
          ? 'جميع جهات الاتصال المحددة مسجلة بالفعل في دليل العملاء.'
          : 'All selected contacts already exist in the customer directory.',
        language === 'ar' ? 'مسجلين مسبقاً' : 'Already Registered'
      );
      onClose();
    } else if (errorsList.length > 0) {
      toastError(
        language === 'ar'
          ? `فشل استيراد جهات الاتصال: ${errorsList[0]}`
          : `Failed to import contacts: ${errorsList[0]}`,
        language === 'ar' ? 'خطأ في الاستيراد' : 'Import Failed'
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        language === 'ar'
          ? 'استيراد جهات الاتصال — أمير البحار'
          : 'Import Contacts — Prince of the Seas'
      }
      description={
        language === 'ar'
          ? 'راجع جهات الاتصال وحدد المطلوب إضافته. يتم حظر تكرار أرقام الهواتف تلقائياً.'
          : 'Select contacts to add. Duplicate phone numbers are automatically restricted.'
      }
      maxWidth="max-w-lg"
    >
      <div className="space-y-4 text-slate-200">
        {/* Banner with stats & duplicate notice */}
        <div className="p-3 bg-cyan-950/60 rounded-xl border border-cyan-800/40 flex items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-cyan-200">
              <Users className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                {language === 'ar'
                  ? `${newContactsCount} عميل جديد متاح للإضافة`
                  : `${newContactsCount} new customer(s) available`}
              </span>
            </div>
            {duplicateContactsCount > 0 && (
              <p className="text-[11px] text-amber-300 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  {language === 'ar'
                    ? `${duplicateContactsCount} جهة اتصال مسجلة مسبقاً أو مكررة (مستبعدة)`
                    : `${duplicateContactsCount} contact(s) already registered (restricted)`}
                </span>
              </p>
            )}
          </div>

          {newContactsCount > 0 && (
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 shrink-0 transition-colors"
            >
              {selectedIndices.length === newContactsCount ? (
                <>
                  <CheckSquare className="w-4 h-4" />
                  <span>{language === 'ar' ? 'إلغاء التحديد' : 'Deselect All'}</span>
                </>
              ) : (
                <>
                  <Square className="w-4 h-4" />
                  <span>{language === 'ar' ? 'تحديد الجدد' : 'Select All New'}</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Contacts Checkbox List */}
        <div className="max-h-64 overflow-y-auto divide-y divide-cyan-950/60 border border-cyan-900/40 rounded-2xl bg-[#030e1a]">
          {analyzedContacts.map((c, idx) => {
            const isSelected = selectedIndices.includes(idx);
            const isDuplicate = c.isAlreadyRegistered || c.isBatchDuplicate;

            return (
              <div
                key={idx}
                onClick={() => !isDuplicate && toggleIndex(idx)}
                className={`p-3 flex items-center justify-between gap-3 transition-colors ${
                  isDuplicate
                    ? 'bg-slate-950/60 opacity-60 cursor-not-allowed'
                    : isSelected
                    ? 'bg-cyan-950/50 hover:bg-cyan-950/70 cursor-pointer'
                    : 'hover:bg-slate-900/60 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      isDuplicate
                        ? 'border-slate-700 bg-slate-900 text-slate-600'
                        : isSelected
                        ? 'bg-cyan-500 border-cyan-500 text-slate-950'
                        : 'border-slate-600 bg-slate-900'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{c.name}</p>
                    <p className="text-[11px] text-cyan-300/80 font-mono" dir="ltr">
                      {c.phone}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right rtl:text-left">
                  {c.isAlreadyRegistered ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 bg-amber-950/60 border border-amber-800/60 font-semibold px-2 py-0.5 rounded-full">
                      {language === 'ar' ? 'مسجل مسبقاً' : 'Already in directory'}
                    </span>
                  ) : c.isBatchDuplicate ? (
                    <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full font-medium">
                      {language === 'ar' ? 'مكرر في القائمة' : 'Duplicate in batch'}
                    </span>
                  ) : (
                    <span className="text-[10px] text-teal-300 bg-teal-950/60 border border-teal-800/60 font-semibold px-2 py-0.5 rounded-full">
                      {language === 'ar' ? 'جاهز للإضافة' : 'Ready to add'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        {isSubmitting && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>{language === 'ar' ? 'جاري الاستيراد...' : 'Importing...'}</span>
              <span>{importProgress}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-200"
                style={{ width: `${importProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-cyan-950/80">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-slate-700 text-slate-300"
          >
            {t('cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleImport}
            isLoading={isSubmitting}
            disabled={selectedIndices.length === 0}
            icon={UserCheck}
            className="bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold border-0 shadow-md shadow-cyan-500/20"
          >
            {language === 'ar'
              ? `استيراد (${selectedIndices.length}) عميل جديد`
              : `Import (${selectedIndices.length}) New`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
