import React, { useState, useEffect, useCallback } from 'react';
import { listCustomers, searchCustomers } from '../api/customers';
import { getErrorMessage } from '../api/client';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { useLanguage } from '../context/LanguageContext';
import { CustomerTable } from '../components/customers/CustomerTable';
import { CustomerModal } from '../components/customers/CustomerModal';
import { ImportContactsModal } from '../components/customers/ImportContactsModal';
import { Button } from '../components/ui/Button';
import { TableSkeleton } from '../components/ui/Skeleton';
import { Users, Plus, Search, RefreshCw, Smartphone, UserPlus } from 'lucide-react';
import { isContactPickerSupported, selectMultipleContacts } from '../utils/contacts';

export function Customers() {
  const { isOwner } = useAuth();
  const { error: toastError, info } = useToast();
  const { t, language } = useLanguage();

  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Batch Contact Import
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importedContacts, setImportedContacts] = useState([]);
  const [isSelectingContacts, setIsSelectingContacts] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await listCustomers();
      setCustomers(data || []);
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Debounced search
  useEffect(() => {
    if (debouncedSearch.trim().length >= 1) {
      setIsSearching(true);
      searchCustomers(debouncedSearch.trim())
        .then((data) => setCustomers(data || []))
        .catch((err) => toastError(getErrorMessage(err)))
        .finally(() => setIsSearching(false));
    } else {
      fetchCustomers();
    }
  }, [debouncedSearch, fetchCustomers, toastError]);

  const handleCreateClick = () => {
    setEditingCustomer(null);
    setModalOpen(true);
  };

  const handleEditClick = (customer) => {
    setEditingCustomer(customer);
    setModalOpen(true);
  };

  const handleImportFromContacts = async () => {
    if (!isContactPickerSupported()) {
      info(
        language === 'ar'
          ? 'استيراد جهات الاتصال متاح على متصفحات الهواتف المحمولة.'
          : 'Contact Picker is available on mobile browsers.',
        language === 'ar' ? 'ميزة الموبايل' : 'Mobile Feature'
      );
      return;
    }

    setIsSelectingContacts(true);
    try {
      const selected = await selectMultipleContacts();
      if (selected && selected.length > 0) {
        setImportedContacts(selected);
        setImportModalOpen(true);
      }
    } catch (err) {
      toastError(err.message || 'Failed to select contacts from device');
    } finally {
      setIsSelectingContacts(false);
    }
  };

  const handleSuccess = () => {
    if (debouncedSearch.trim().length >= 1) {
      searchCustomers(debouncedSearch.trim()).then((data) => setCustomers(data || []));
    } else {
      fetchCustomers();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-cyan-400 stroke-[2.2]" />
              <span>{t('customers_title')}</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/40 text-xs font-bold">
              {customers.length}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            {t('customers_subtitle')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => fetchCustomers()}
            className="text-xs border-cyan-700/60 text-cyan-300 hover:bg-cyan-950/40"
          >
            {t('refresh')}
          </Button>

          {isOwner && (
            <>
              <Button
                variant="outline"
                size="sm"
                icon={Smartphone}
                isLoading={isSelectingContacts}
                onClick={handleImportFromContacts}
                className="text-xs border-cyan-700/60 text-cyan-300 hover:bg-cyan-950/40 hidden sm:inline-flex"
              >
                {t('import_contacts')}
              </Button>

              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={handleCreateClick}
                className="text-xs bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold border-0 shadow-md shadow-cyan-500/20"
              >
                {t('add_customer')}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-[#05172b]/90 p-4 rounded-2xl border border-cyan-900/40 shadow-xl">
        <div className="relative max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 flex items-center pl-3.5 rtl:pl-0 rtl:pr-3.5">
            <Search className="h-4 w-4 text-cyan-400/80" />
          </div>
          <input
            type="text"
            placeholder={t('search_customers_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-xl border border-slate-700/80 bg-[#020b14]/80 text-sm text-white placeholder:text-slate-500 pl-10 pr-3 rtl:pl-3 rtl:pr-10 py-2.5 focus:border-cyan-400 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Customer Directory Table */}
      {isLoading ? (
        <div className="bg-[#05172b]/90 rounded-2xl border border-cyan-900/40 p-4">
          <TableSkeleton rows={5} cols={5} />
        </div>
      ) : (
        <CustomerTable
          customers={customers}
          onEdit={handleEditClick}
          isOwner={isOwner}
        />
      )}

      {/* Customer Add / Edit Modal */}
      <CustomerModal
        isOpen={modalOpen}
        customer={editingCustomer}
        onClose={() => {
          setModalOpen(false);
          setEditingCustomer(null);
        }}
        onSuccess={handleSuccess}
      />

      {/* Batch Import Contacts Modal */}
      <ImportContactsModal
        isOpen={importModalOpen}
        contacts={importedContacts}
        onClose={() => {
          setImportModalOpen(false);
          setImportedContacts([]);
        }}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
