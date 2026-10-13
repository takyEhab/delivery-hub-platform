import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { createCustomer } from '../../api/customers';
import { getErrorMessage } from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { normalizePhone } from '../../utils/contacts';
import { Users, Phone, Check, AlertCircle, UserCheck } from 'lucide-react';

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
  const { success, error: toastError, info, warning } = useToast();

  // Map existing customers by normalized phone number
  const existingPhoneMap = useMemo(() => {
    const map = new Map();
    (existingCustomers || []).forEach((cust) => {
      if (cust.phone) {
        map.set(normalizePhone(cust.phone), cust);
      }
    });
    return map;
  }, [existingCustomers]);

  // Analyze contacts for duplicates
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

  // Select only new (non-duplicate) contacts by default
  useEffect(() => {
    const nonDuplicateIndices = analyzedContacts
      .filter((c) => !c.isAlreadyRegistered && !c.isBatchDuplicate)
      .map((c) => c.originalIndex);
    setSelectedIndices(nonDuplicateIndices);
    setImportProgress(0);
  }, [analyzedContacts]);

  const newContactsCount = analyzedContacts.filter(
    (c) => !c.isAlreadyRegistered && !c.isBatchDuplicate
  ).length;
  const duplicateContactsCount = analyzedContacts.length - newContactsCount;

  const toggleSelectAll = () => {
    const validIndices = analyzedContacts
      .filter((c) => !c.isAlreadyRegistered)
      .map((c) => c.originalIndex);

    if (selectedIndices.length === validIndices.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(validIndices);
    }
  };

  const toggleIndex = (idx) => {
    const item = analyzedContacts[idx];
    if (item && item.isAlreadyRegistered) return; // Prevent selecting already registered contacts

    setSelectedIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleImport = async () => {
    const toImport = analyzedContacts.filter(
      (c) =>
        selectedIndices.includes(c.originalIndex) &&
        !c.isAlreadyRegistered
    );

    if (toImport.length === 0) {
      info('No new contacts selected for import.', 'Import Notice');
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
          errMsg.toLowerCase().includes('duplicate')
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
        `Successfully imported ${successCount} new customer${
          successCount === 1 ? '' : 's'
        }!`,
        'Contacts Imported'
      );

      if (skippedDuplicates > 0 || duplicateContactsCount > 0) {
        info(
          `${skippedDuplicates + duplicateContactsCount} duplicate contact(s) were safely skipped.`,
          'Duplicates Restrict'
        );
      }

      if (errorsList.length > 0) {
        warning(
          `${errorsList.length} contact(s) failed due to network errors.`,
          'Notice'
        );
      }

      if (onSuccess) onSuccess();
      onClose();
    } else if (skippedDuplicates > 0 || duplicateContactsCount > 0) {
      info(
        'All selected contacts already exist in the customer directory.',
        'Already Registered'
      );
      onClose();
    } else if (errorsList.length > 0) {
      toastError(`Failed to import contacts: ${errorsList[0]}`, 'Import Failed');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Multiple Contacts"
      description="Review and select the contacts you want to add as customers. Duplicate phone numbers are automatically restricted."
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* Summary notification banner */}
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-950">
              <Users className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {newContactsCount} new customer{newContactsCount === 1 ? '' : 's'} available
              </span>
            </div>
            {duplicateContactsCount > 0 && (
              <p className="text-[11px] text-amber-700 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                <span>{duplicateContactsCount} contact(s) already registered (restricted)</span>
              </p>
            )}
          </div>

          {newContactsCount > 0 && (
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-emerald-700 hover:text-emerald-900 font-semibold text-xs transition-colors shrink-0"
            >
              {selectedIndices.length === newContactsCount ? 'Deselect All' : 'Select All New'}
            </button>
          )}
        </div>

        {/* Contacts preview list */}
        <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white shadow-inner">
          {analyzedContacts.map((c, idx) => {
            const isSelected = selectedIndices.includes(idx);
            const isDuplicate = c.isAlreadyRegistered || c.isBatchDuplicate;

            return (
              <div
                key={idx}
                onClick={() => !isDuplicate && toggleIndex(idx)}
                className={`p-3 flex items-center justify-between gap-3 transition-colors ${
                  isDuplicate
                    ? 'bg-slate-50/80 opacity-70 cursor-not-allowed'
                    : isSelected
                    ? 'bg-emerald-50/40 hover:bg-emerald-50/70 cursor-pointer'
                    : 'hover:bg-slate-50 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center transition-colors shrink-0 ${
                      isDuplicate
                        ? 'border border-slate-200 bg-slate-100 text-slate-300'
                        : isSelected
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
                      <span className="font-mono">{c.phone}</span>
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  {c.isAlreadyRegistered ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 border border-amber-200 font-medium px-2 py-0.5 rounded-full">
                      Already in directory
                    </span>
                  ) : c.isBatchDuplicate ? (
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                      Duplicate in batch
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 font-medium px-2 py-0.5 rounded-full border border-emerald-200/60">
                      Ready to add
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress bar during batch import */}
        {isSubmitting && (
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Importing new contacts...</span>
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
            icon={UserCheck}
            isLoading={isSubmitting}
            disabled={selectedIndices.length === 0}
            onClick={handleImport}
          >
            Import {selectedIndices.length} New Customer{selectedIndices.length === 1 ? '' : 's'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
