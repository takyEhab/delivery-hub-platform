import React, { useState, useEffect, useCallback } from 'react';
import { listCustomers, searchCustomers } from '../api/customers';
import { getErrorMessage } from '../api/client';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
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
        'Contact Picker is available on mobile browsers (e.g. Chrome on Android). You can add customers manually on desktop.',
        'Mobile Feature'
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Customer Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-200/70 text-slate-700 text-xs font-semibold">
              {customers.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Search, manage, and register customer addresses for delivery orders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => fetchCustomers()}
            className="text-xs"
          >
            Refresh
          </Button>

          {isOwner && (
            <>
              {/* Import Multiple Contacts Button (Mobile & progressive enhancement) */}
              <Button
                variant="outline"
                size="sm"
                icon={Smartphone}
                isLoading={isSelectingContacts}
                onClick={handleImportFromContacts}
                className="text-xs bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
              >
                Import from Contacts
              </Button>

              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={handleCreateClick}
                className="text-xs"
              >
                Add Customer
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by customer name or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-lg border border-slate-300 text-sm placeholder:text-slate-400 pl-9 pr-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-colors"
          />
        </div>

        {/* Mobile Callout for Contact Import */}
        {isOwner && isContactPickerSupported() && (
          <button
            type="button"
            onClick={handleImportFromContacts}
            className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-lg border border-emerald-200 transition-colors text-left"
          >
            <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-semibold block">Import Multiple from Device</span>
              <span className="text-[10px] text-emerald-600 block">
                Tap to pick multiple contacts without typing addresses
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Customer List / Table */}
      {isLoading || isSearching ? (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <TableSkeleton rows={5} cols={5} />
        </div>
      ) : (
        <CustomerTable
          customers={customers}
          onEdit={handleEditClick}
          isOwner={isOwner}
        />
      )}

      {/* Create / Edit Customer Modal */}
      <CustomerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        customer={editingCustomer}
        onSuccess={handleSuccess}
      />

      {/* Batch Import Contacts Modal */}
      <ImportContactsModal
        isOpen={importModalOpen}
        onClose={() => {
          setImportModalOpen(false);
          setImportedContacts([]);
        }}
        contacts={importedContacts}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
