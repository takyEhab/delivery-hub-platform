import React, { useState } from 'react';
import { useToast } from '../hooks/useToast';
import { createCustomer } from '../api/customers';
import { getErrorMessage } from '../api/client';
import {
  isContactPickerSupported,
  selectContact,
  selectMultipleContacts,
  normalizePhone,
} from '../utils/contacts';
import { getCurrentGpsLocation, buildGoogleMapsUrl } from '../utils/location';
import { Button } from '../components/ui/Button';
import {
  UserPlus,
  Users,
  Smartphone,
  MapPin,
  User,
  Phone,
  CheckCircle2,
  ExternalLink,
  ClipboardPaste,
  Sparkles,
  CheckSquare,
  Square,
  Clock,
} from 'lucide-react';

export function DriverCustomers() {
  const { success, error: toastError, info, warning } = useToast();

  const [activeTab, setActiveTab] = useState('single'); // 'single' | 'batch_contacts' | 'paste'

  // Single Customer State
  const [singleForm, setSingleForm] = useState({
    name: '',
    phone: '',
    address: '',
    location_url: '',
    notes: '',
  });
  const [singleErrors, setSingleErrors] = useState({});
  const [isSubmittingSingle, setIsSubmittingSingle] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [isAutofillingContact, setIsAutofillingContact] = useState(false);

  // Batch Contacts State
  const [batchContacts, setBatchContacts] = useState([]);
  const [selectedBatchIndices, setSelectedBatchIndices] = useState([]);
  const [isSelectingContacts, setIsSelectingContacts] = useState(false);
  const [isImportingBatch, setIsImportingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);

  // Quick Paste State
  const [rawPastedText, setRawPastedText] = useState('');
  const [parsedPastedContacts, setParsedPastedContacts] = useState([]);
  const [selectedPastedIndices, setSelectedPastedIndices] = useState([]);
  const [isImportingPasted, setIsImportingPasted] = useState(false);

  // Session Activity List (zero leak of full database!)
  const [sessionAddedCustomers, setSessionAddedCustomers] = useState([]);

  // --- Handlers for Single Customer ---
  const handleGpsCapture = async () => {
    setIsLocatingGps(true);
    try {
      const { url } = await getCurrentGpsLocation();
      setSingleForm((prev) => ({ ...prev, location_url: url }));
      success('Customer GPS coordinates captured successfully!', 'GPS Captured');
    } catch (err) {
      toastError(err.message || 'Failed to capture GPS coordinates');
    } finally {
      setIsLocatingGps(false);
    }
  };

  const handleAutofillFromDevice = async () => {
    if (!isContactPickerSupported()) {
      info('Contact Picker is supported on mobile browsers (e.g. Chrome on Android).');
      return;
    }

    setIsAutofillingContact(true);
    try {
      const contact = await selectContact();
      if (contact) {
        setSingleForm((prev) => ({
          ...prev,
          name: contact.name || prev.name,
          phone: contact.phone || prev.phone,
          address: contact.address || prev.address,
        }));
        success(`Autofilled: ${contact.name}`);
      }
    } catch (err) {
      toastError(err.message || 'Failed to select contact');
    } finally {
      setIsAutofillingContact(false);
    }
  };

  const handleSaveSingleCustomer = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!singleForm.name.trim()) errs.name = 'Customer name is required';
    const cleanPhone = normalizePhone(singleForm.phone);
    if (!cleanPhone || cleanPhone.length < 5) errs.phone = 'Valid phone number required';

    if (Object.keys(errs).length > 0) {
      setSingleErrors(errs);
      return;
    }
    setSingleErrors({});

    setIsSubmittingSingle(true);
    try {
      const payload = {
        name: singleForm.name.trim(),
        phone: cleanPhone,
        address: singleForm.address.trim() || null,
        location_url: singleForm.location_url.trim() || null,
        notes: singleForm.notes.trim() || null,
      };

      const created = await createCustomer(payload);
      success(`Customer "${created.name}" registered successfully!`, 'Customer Registered');

      setSessionAddedCustomers((prev) => [
        { ...created, timestamp: new Date().toLocaleTimeString('en-US') },
        ...prev,
      ]);

      setSingleForm({
        name: '',
        phone: '',
        address: '',
        location_url: '',
        notes: '',
      });
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setIsSubmittingSingle(false);
    }
  };

  // --- Handlers for Batch Contacts ---
  const handleOpenContactPicker = async () => {
    if (!isContactPickerSupported()) {
      info('Contact Picker is supported on mobile devices. You can use Quick Paste on desktop.');
      return;
    }

    setIsSelectingContacts(true);
    try {
      const contacts = await selectMultipleContacts();
      if (contacts && contacts.length > 0) {
        setBatchContacts(contacts);
        setSelectedBatchIndices(contacts.map((_, idx) => idx));
        success(`Selected ${contacts.length} contact(s) ready for import.`);
      }
    } catch (err) {
      toastError(err.message || 'Failed to select contacts');
    } finally {
      setIsSelectingContacts(false);
    }
  };

  const handleToggleBatchIndex = (idx) => {
    setSelectedBatchIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleToggleAllBatch = () => {
    if (selectedBatchIndices.length === batchContacts.length) {
      setSelectedBatchIndices([]);
    } else {
      setSelectedBatchIndices(batchContacts.map((_, idx) => idx));
    }
  };

  const handleImportBatch = async () => {
    const toImport = batchContacts.filter((_, idx) => selectedBatchIndices.includes(idx));
    if (toImport.length === 0) {
      warning('Please select at least one contact.');
      return;
    }

    setIsImportingBatch(true);
    setBatchProgress(0);

    let successCount = 0;
    let skippedCount = 0;
    const newlyAdded = [];

    for (let i = 0; i < toImport.length; i++) {
      const c = toImport[i];
      const norm = normalizePhone(c.phone);

      try {
        const created = await createCustomer({
          name: c.name?.trim() || norm,
          phone: norm,
          address: c.address || null,
          notes: null,
        });
        successCount++;
        newlyAdded.push({
          ...created,
          timestamp: new Date().toLocaleTimeString('en-US'),
        });
      } catch (err) {
        skippedCount++;
      }

      setBatchProgress(Math.round(((i + 1) / toImport.length) * 100));
    }

    setIsImportingBatch(false);

    if (successCount > 0) {
      success(`Successfully imported ${successCount} new customer(s)!`, 'Import Complete');
      setSessionAddedCustomers((prev) => [...newlyAdded, ...prev]);
      setBatchContacts([]);
      setSelectedBatchIndices([]);
    }

    if (skippedCount > 0) {
      info(`Skipped ${skippedCount} duplicate contact(s).`);
    }
  };

  // --- Handlers for Quick Paste ---
  const handleParsePastedText = () => {
    const lines = rawPastedText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      warning('Please paste text containing phone numbers.');
      return;
    }

    const parsed = [];
    const seen = new Set();

    lines.forEach((line) => {
      const phoneMatch = line.match(/(?:(?:\+?20|0020)?0?1[0125]\d{8})|\b\d{8,12}\b/);
      if (phoneMatch) {
        const rawPhone = phoneMatch[0];
        const norm = normalizePhone(rawPhone);
        const namePart = line.replace(rawPhone, '').replace(/[,\-:\/|]/g, ' ').trim();
        const finalName = namePart || `Customer ${norm.slice(-4)}`;

        if (!seen.has(norm)) {
          seen.add(norm);
          parsed.push({
            name: finalName,
            phone: norm,
          });
        }
      }
    });

    if (parsed.length === 0) {
      toastError('No valid phone numbers found in the pasted text.');
      return;
    }

    setParsedPastedContacts(parsed);
    setSelectedPastedIndices(parsed.map((_, idx) => idx));
    success(`Extracted ${parsed.length} contact(s) successfully.`);
  };

  const handleImportPasted = async () => {
    const toImport = parsedPastedContacts.filter((_, idx) => selectedPastedIndices.includes(idx));
    if (toImport.length === 0) return;

    setIsImportingPasted(true);
    let successCount = 0;
    let skippedCount = 0;
    const newlyAdded = [];

    for (let i = 0; i < toImport.length; i++) {
      const c = toImport[i];
      try {
        const created = await createCustomer({
          name: c.name,
          phone: c.phone,
          address: null,
          notes: null,
        });
        successCount++;
        newlyAdded.push({
          ...created,
          timestamp: new Date().toLocaleTimeString('en-US'),
        });
      } catch (err) {
        skippedCount++;
      }
    }

    setIsImportingPasted(false);
    if (successCount > 0) {
      success(`Imported ${successCount} new customer(s)!`);
      setSessionAddedCustomers((prev) => [...newlyAdded, ...prev]);
      setRawPastedText('');
      setParsedPastedContacts([]);
      setSelectedPastedIndices([]);
    }

    if (skippedCount > 0) {
      info(`Skipped ${skippedCount} existing customer(s).`);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-sm">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Customer Registration & Import
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Register individual customers or batch import contacts from your phone
              </p>
            </div>
          </div>
        </div>

        {sessionAddedCustomers.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold w-fit">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{sessionAddedCustomers.length} registered in this session</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200 w-full sm:w-fit overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('single')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'single'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Single Customer</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('batch_contacts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'batch_contacts'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Import from Mobile</span>
          {batchContacts.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-white text-[10px]">
              {batchContacts.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('paste')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'paste'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <ClipboardPaste className="w-4 h-4" />
          <span>Quick Paste / WhatsApp</span>
        </button>
      </div>

      {/* --- Tab 1: Single Form --- */}
      {activeTab === 'single' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-7 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-slate-700" />
                <span>New Customer Details</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Register customer with optional GPS capture for courier navigation.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Smartphone}
              isLoading={isAutofillingContact}
              onClick={handleAutofillFromDevice}
              className="text-xs"
            >
              Autofill from Contacts
            </Button>
          </div>

          <form onSubmit={handleSaveSingleCustomer} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={singleForm.name}
                  onChange={(e) => setSingleForm({ ...singleForm, name: e.target.value })}
                  className={`block w-full rounded-lg border text-sm px-3 py-2 focus:outline-none transition-colors ${
                    singleErrors.name ? 'border-rose-500' : 'border-slate-300 focus:border-slate-900'
                  }`}
                />
                {singleErrors.name && <p className="text-[11px] text-rose-500 mt-1">{singleErrors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="01xxxxxxxxx"
                  value={singleForm.phone}
                  onChange={(e) => setSingleForm({ ...singleForm, phone: e.target.value })}
                  className={`block w-full rounded-lg border text-sm px-3 py-2 focus:outline-none transition-colors ${
                    singleErrors.phone ? 'border-rose-500' : 'border-slate-300 focus:border-slate-900'
                  }`}
                />
                {singleErrors.phone && <p className="text-[11px] text-rose-500 mt-1">{singleErrors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Delivery Address
              </label>
              <input
                type="text"
                placeholder="Street address, building, apartment..."
                value={singleForm.address}
                onChange={(e) => setSingleForm({ ...singleForm, address: e.target.value })}
                className="block w-full rounded-lg border border-slate-300 text-sm px-3 py-2 focus:border-slate-900 focus:outline-none"
              />
            </div>

            {/* GPS capture */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">
                    Customer Location on Map (GPS)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Capture current GPS coordinates if you are at customer location.
                  </span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={MapPin}
                  isLoading={isLocatingGps}
                  onClick={handleGpsCapture}
                  className="text-xs"
                >
                  📍 Capture Current GPS
                </Button>
              </div>

              <input
                type="text"
                placeholder="Google Maps URL or coordinates"
                value={singleForm.location_url}
                onChange={(e) => setSingleForm({ ...singleForm, location_url: e.target.value })}
                className="block w-full rounded-lg border border-slate-300 bg-white text-xs px-3 py-2 focus:border-slate-900 focus:outline-none"
              />

              {singleForm.location_url && (
                <div className="flex items-center gap-2 text-[11px] text-emerald-600 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>GPS location captured</span>
                  <a
                    href={buildGoogleMapsUrl(singleForm.location_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-slate-900 hover:underline font-semibold ml-auto"
                  >
                    <span>View on Map</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Delivery Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Floor, door code, special instructions..."
                value={singleForm.notes}
                onChange={(e) => setSingleForm({ ...singleForm, notes: e.target.value })}
                className="block w-full rounded-lg border border-slate-300 text-xs px-3 py-2 focus:border-slate-900 focus:outline-none"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmittingSingle}
              icon={UserPlus}
              className="w-full sm:w-auto"
            >
              Save Customer
            </Button>
          </form>
        </div>
      )}

      {/* --- Tab 2: Batch Mobile Contacts --- */}
      {activeTab === 'batch_contacts' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-7 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-slate-700" />
                <span>Import Contacts from Mobile</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select multiple contacts from your mobile device to register.
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={Smartphone}
              isLoading={isSelectingContacts}
              onClick={handleOpenContactPicker}
              className="text-xs"
            >
              📱 Select Mobile Contacts
            </Button>
          </div>

          {batchContacts.length === 0 ? (
            <div className="p-8 border border-dashed border-slate-300 rounded-xl text-center space-y-2 bg-slate-50/50">
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mx-auto text-xl">
                📱
              </div>
              <p className="text-xs font-semibold text-slate-700">No contacts selected yet</p>
              <p className="text-[11px] text-slate-500">
                Click the button above to launch your device contact picker.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={handleToggleAllBatch}
                  className="flex items-center gap-2 font-semibold text-slate-700 hover:text-slate-900"
                >
                  {selectedBatchIndices.length === batchContacts.length ? (
                    <CheckSquare className="w-4 h-4 text-slate-900" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  <span>Select All ({selectedBatchIndices.length}/{batchContacts.length})</span>
                </button>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  isLoading={isImportingBatch}
                  onClick={handleImportBatch}
                  className="text-xs"
                >
                  Import Selected ({selectedBatchIndices.length})
                </Button>
              </div>

              {isImportingBatch && (
                <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-700 font-semibold">
                    <span>Importing...</span>
                    <span>{batchProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 transition-all duration-300"
                      style={{ width: `${batchProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto">
                {batchContacts.map((c, idx) => {
                  const isSelected = selectedBatchIndices.includes(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleToggleBatchIndex(idx)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected ? 'bg-slate-50 border-slate-900' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">{c.name || 'Contact'}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{c.phone}</p>
                      </div>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-slate-900" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- Tab 3: Quick Paste --- */}
      {activeTab === 'paste' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-7 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ClipboardPaste className="w-5 h-5 text-slate-700" />
              <span>Quick Paste from WhatsApp / Chats</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Paste names and numbers directly. We'll automatically extract valid mobile numbers.
            </p>
          </div>

          <div className="space-y-3">
            <textarea
              rows={4}
              placeholder="Paste text with phone numbers..."
              value={rawPastedText}
              onChange={(e) => setRawPastedText(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 text-xs p-3 focus:border-slate-900 focus:outline-none font-mono"
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Sparkles}
              onClick={handleParsePastedText}
              className="text-xs"
            >
              Extract Contacts
            </Button>
          </div>

          {parsedPastedContacts.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  Extracted {parsedPastedContacts.length} contact(s):
                </span>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  isLoading={isImportingPasted}
                  onClick={handleImportPasted}
                  className="text-xs"
                >
                  Save Extracted Contacts
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {parsedPastedContacts.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-slate-900">{c.name}</span>
                    <span className="font-mono text-slate-600 text-[11px]">{c.phone}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- Session History --- */}
      {sessionAddedCustomers.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Customers Registered This Session ({sessionAddedCustomers.length})
              </h3>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Saved in Database
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sessionAddedCustomers.map((cust, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{cust.name}</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {cust.timestamp}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span className="font-mono">{cust.phone}</span>
                  {cust.location_url && (
                    <a
                      href={buildGoogleMapsUrl(cust.location_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-semibold"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>GPS</span>
                    </a>
                  )}
                </div>

                {cust.address && (
                  <p className="text-[11px] text-slate-500 truncate">
                    📍 {cust.address}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
