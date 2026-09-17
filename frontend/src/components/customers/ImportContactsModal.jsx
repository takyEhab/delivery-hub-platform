import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { createCustomer } from '../../api/customers';
import { getErrorMessage } from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { Users, Phone, Check, CheckSquare, Square, AlertCircle } from 'lucide-react';

export function ImportContactsModal({ isOpen, onClose, contacts = [], onSuccess }) {
  const [selectedIndices, setSelectedIndices] = useState(() =>
    contacts.map((_, i) => i)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const { success, error: toastError, warning } = useToast();

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
        `Successfully imported ${successCount} customer${successCount === 1 ? '' : 's'} from your contacts!`,
        'Contacts Imported'
      );
      if (errorsList.length > 0) {
        warning(
          `${errorsList.length} contact(s) could not be imported (e.g. duplicate phone numbers).`,
          'Import Notice'
        );
      }
      if (onSuccess) onSuccess();
      onClose();
    } else if (errorsList.length > 0) {
      toastError(
        `Failed to import contacts: ${errorsList[0]}`,
        'Import Failed'
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Multiple Contacts"
      description="Review and select the contacts you want to add as customers. Addresses are optional."
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* Summary header */}
        <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs">
          <div className="flex items-center gap-2 text-emerald-900 font-medium">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>
              {selectedIndices.length} of {contacts.length} selected for import
            </span>
          </div>
          <button
            type="button"
            onClick={toggleSelectAll}
            className="text-emerald-700 hover:text-emerald-900 font-semibold transition-colors"
          >
            {selectedIndices.length === contacts.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        {/* Contacts preview list */}
        <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white">
          {contacts.map((c, idx) => {
            const isSelected = selectedIndices.includes(idx);
            return (
              <div
                key={idx}
                onClick={() => toggleIndex(idx)}
                className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-emerald-50/40 hover:bg-emerald-50/70' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'border border-slate-300 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {c.name}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{c.phone}</span>
                    </p>
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                  Address Optional
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar during batch import */}
        {isSubmitting && (
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Importing contacts...</span>
              <span className="font-semibold">{importProgress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-200"
                style={{ width: `${importProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            icon={Users}
            isLoading={isSubmitting}
            disabled={selectedIndices.length === 0}
            onClick={handleImport}
          >
            Import {selectedIndices.length} Customer{selectedIndices.length === 1 ? '' : 's'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
