import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { createCustomer } from '../../api/customers';
import { getErrorMessage } from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { useLanguage } from '../../context/LanguageContext';
import { Users, Phone, Check, CheckSquare, Square, AlertCircle } from 'lucide-react';

export function ImportContactsModal({ isOpen, onClose, contacts = [], onSuccess }) {
  const [selectedIndices, setSelectedIndices] = useState(() =>
    contacts.map((_, i) => i)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const { success, error: toastError, warning } = useToast();
  const { t, language } = useLanguage();

  // Keep all selected by default when contacts change
  React.useEffect(() => {
    setSelectedIndices(contacts.map((_, i) => i));
    setImportProgress(0);
  }, [contacts]);

  const toggleSelectAll = () => {
    if (selectedIndices.length === contacts.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(contacts.map((_, i) => i));
    }
  };

  const toggleIndex = (idx) => {
    setSelectedIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleImport = async () => {
    const toImport = contacts.filter((_, i) => selectedIndices.includes(i));
    if (toImport.length === 0) return;

    setIsSubmitting(true);
    setImportProgress(0);

    let successCount = 0;
    const errorsList = [];

    for (let i = 0; i < toImport.length; i++) {
      const contact = toImport[i];
      try {
        await createCustomer({
          name: contact.name.trim() || contact.phone.trim(),
          phone: contact.phone.trim(),
          address: contact.address || null,
          notes: null,
        });
        successCount++;
      } catch (err) {
        errorsList.push(`${contact.name} (${contact.phone}): ${getErrorMessage(err)}`);
      }
      setImportProgress(Math.round(((i + 1) / toImport.length) * 100));
    }

    setIsSubmitting(false);

    if (successCount > 0) {
      success(
        language === 'ar'
          ? `تم استيراد ${successCount} عميل بنجاح!`
          : `Successfully imported ${successCount} customer(s)!`
      );
      onSuccess();
      onClose();
    }

    if (errorsList.length > 0) {
      warning(
        language === 'ar'
          ? `فشل استيراد ${errorsList.length} جهة اتصال (قد تكون مسجلة مسبقاً).`
          : `Some contacts could not be imported.`
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={language === 'ar' ? 'استيراد جهات الاتصال إلى عملاء أمير البحار' : 'Import Contacts into Prince of the Seas'}
      description={
        language === 'ar'
          ? `حدد جهات الاتصال التي ترغب في إضافتها لسجل العملاء (${selectedIndices.length} محددة)`
          : `Select the contacts you wish to add (${selectedIndices.length} selected)`
      }
      maxWidth="max-w-lg"
    >
      <div className="space-y-4 text-slate-200">
        <div className="flex items-center justify-between pb-2 border-b border-cyan-950/80">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300"
          >
            {selectedIndices.length === contacts.length ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            <span>{selectedIndices.length === contacts.length ? (language === 'ar' ? 'إلغاء تحديد الكل' : 'Deselect All') : (language === 'ar' ? 'تحديد الكل' : 'Select All')}</span>
          </button>
          <span className="text-xs text-slate-400 font-medium">
            {contacts.length} {language === 'ar' ? 'جهة اتصال' : 'contacts found'}
          </span>
        </div>

        {/* Contacts Checkbox List */}
        <div className="max-h-64 overflow-y-auto divide-y divide-cyan-950/60 border border-cyan-900/40 rounded-2xl bg-[#030e1a]">
          {contacts.map((c, idx) => {
            const isSelected = selectedIndices.includes(idx);
            return (
              <div
                key={idx}
                onClick={() => toggleIndex(idx)}
                className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-cyan-950/40' : 'hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-cyan-500 border-cyan-500 text-slate-950'
                        : 'border-slate-600 bg-slate-900'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{c.name}</p>
                    <p className="text-[11px] text-cyan-300/80 font-mono" dir="ltr">{c.phone}</p>
                  </div>
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
          <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="border-slate-700 text-slate-300">
            {t('cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleImport}
            isLoading={isSubmitting}
            disabled={selectedIndices.length === 0}
            className="bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold border-0"
          >
            {language === 'ar' ? `استيراد (${selectedIndices.length}) عميل` : `Import (${selectedIndices.length})`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
