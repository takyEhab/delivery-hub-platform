import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
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
  FileText,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ClipboardPaste,
  Sparkles,
  Loader2,
  CheckSquare,
  Square,
  Clock,
} from 'lucide-react';

export function DriverCustomers() {
  const { language, isRTL } = useLanguage();
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

  // Session Activity List (only customers added in this session - zero leak of full directory!)
  const [sessionAddedCustomers, setSessionAddedCustomers] = useState([]);

  // --- Handlers for Single Customer ---
  const handleGpsCapture = async () => {
    setIsLocatingGps(true);
    try {
      const { url } = await getCurrentGpsLocation(language);
      setSingleForm((prev) => ({ ...prev, location_url: url }));
      success(
        language === 'ar'
          ? 'تم التقاط إحداثيات GPS لموقع العميل بنجاح!'
          : 'Customer GPS location captured successfully!',
        language === 'ar' ? 'تحديد الموقع' : 'GPS Captured'
      );
    } catch (err) {
      toastError(err.message || 'Failed to capture GPS coordinates');
    } finally {
      setIsLocatingGps(false);
    }
  };

  const handleAutofillFromDevice = async () => {
    if (!isContactPickerSupported()) {
      info(
        language === 'ar'
          ? 'استيراد جهات الاتصال متاح على متصفحات الهواتف الذكية (مثل متصفح Chrome على الهاتف).'
          : 'Contact Picker is supported on mobile browsers (e.g. Chrome on Android).'
      );
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
        success(
          language === 'ar' ? `تم ملء بيانات: ${contact.name}` : `Autofilled: ${contact.name}`
        );
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
    if (!singleForm.name.trim()) {
      errs.name = language === 'ar' ? 'اسم العميل مطلوب' : 'Customer name is required';
    }
    const cleanPhone = normalizePhone(singleForm.phone);
    if (!cleanPhone || cleanPhone.length < 5) {
      errs.phone = language === 'ar' ? 'رقم الهاتف مطلوب وبصيغة صحيحة' : 'Valid phone number required';
    }

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
      success(
        language === 'ar'
          ? `تم تسجيل العميل "${created.name}" بنجاح!`
          : `Customer "${created.name}" registered successfully!`,
        language === 'ar' ? 'تم الحفظ' : 'Customer Registered'
      );

      // Add to session list
      setSessionAddedCustomers((prev) => [
        { ...created, timestamp: new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US') },
        ...prev,
      ]);

      // Reset form
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
      info(
        language === 'ar'
          ? 'خاصية استيراد جهات الاتصال متاحة على متصفحات الهواتف المحمولة (مثل متصفح Chrome على الهاتف). يمكنك استخدام تبويب "لصق أرقام سريعة" إذا كنت على الكمبيوتر.'
          : 'Contact Picker is supported on mobile browsers. You can use the Quick Paste tab on desktop.',
        language === 'ar' ? 'ميزة الهاتف المحمول' : 'Mobile Feature'
      );
      return;
    }

    setIsSelectingContacts(true);
    try {
      const contacts = await selectMultipleContacts();
      if (contacts && contacts.length > 0) {
        setBatchContacts(contacts);
        setSelectedBatchIndices(contacts.map((_, idx) => idx));
        success(
          language === 'ar'
            ? `تم اختيار ${contacts.length} جهة اتصال من هاتفك جاهزة للاستيراد.`
            : `Selected ${contacts.length} contact(s) ready for import.`
        );
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
      warning(
        language === 'ar' ? 'يرجى تحديد جهة اتصال واحدة على الأقل.' : 'Please select at least one contact.'
      );
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
          timestamp: new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US'),
        });
      } catch (err) {
        const errMsg = getErrorMessage(err);
        if (errMsg.toLowerCase().includes('already') || errMsg.toLowerCase().includes('duplicate') || errMsg.includes('مسجل')) {
          skippedCount++;
        }
      }

      setBatchProgress(Math.round(((i + 1) / toImport.length) * 100));
    }

    setIsImportingBatch(false);

    if (successCount > 0) {
      success(
        language === 'ar'
          ? `تم استيراد وحفظ ${successCount} عميل جديد بنجاح!`
          : `Successfully imported ${successCount} new customer(s)!`,
        language === 'ar' ? 'تم الاستيراد' : 'Import Complete'
      );
      setSessionAddedCustomers((prev) => [...newlyAdded, ...prev]);
      setBatchContacts([]);
      setSelectedBatchIndices([]);
    }

    if (skippedCount > 0) {
      info(
        language === 'ar'
          ? `تم تخطي ${skippedCount} جهة اتصال لأن أرقامهم مسجلة بالفعل.`
          : `Skipped ${skippedCount} duplicate contact(s).`,
        language === 'ar' ? 'تخطي المكرر' : 'Duplicates Skipped'
      );
    }
  };

  // --- Handlers for Quick Paste ---
  const handleParsePastedText = () => {
    const lines = rawPastedText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      warning(language === 'ar' ? 'يرجى لصق نص يحتوي على أرقام هواتف.' : 'Please paste text containing phone numbers.');
      return;
    }

    const parsed = [];
    const seen = new Set();

    lines.forEach((line) => {
      // Find mobile numbers (e.g. 01xxxxxxxxx or +201xxxxxxxxx or any digits string)
      const phoneMatch = line.match(/(?:(?:\+?20|0020)?0?1[0125]\d{8})|\b\d{8,12}\b/);
      if (phoneMatch) {
        const rawPhone = phoneMatch[0];
        const norm = normalizePhone(rawPhone);
        const namePart = line.replace(rawPhone, '').replace(/[,\-:\/|]/g, ' ').trim();
        const finalName = namePart || `عميل ${norm.slice(-4)}`;

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
      toastError(
        language === 'ar'
          ? 'لم يتم العثور على أرقام هواتف واضحة في النص الملصق.'
          : 'No valid phone numbers found in the pasted text.'
      );
      return;
    }

    setParsedPastedContacts(parsed);
    setSelectedPastedIndices(parsed.map((_, idx) => idx));
    success(
      language === 'ar'
        ? `تم استخراج ${parsed.length} جهة اتصال بنجاح.`
        : `Extracted ${parsed.length} contact(s) successfully.`
    );
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
          timestamp: new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US'),
        });
      } catch (err) {
        skippedCount++;
      }
    }

    setIsImportingPasted(false);
    if (successCount > 0) {
      success(
        language === 'ar'
          ? `تم استيراد ${successCount} عميل جديد بنجاح!`
          : `Imported ${successCount} new customer(s)!`
      );
      setSessionAddedCustomers((prev) => [...newlyAdded, ...prev]);
      setRawPastedText('');
      setParsedPastedContacts([]);
      setSelectedPastedIndices([]);
    }

    if (skippedCount > 0) {
      info(
        language === 'ar'
          ? `تم تخطي ${skippedCount} رقم لأنهم مسجلون مسبقاً.`
          : `Skipped ${skippedCount} existing customer(s).`
      );
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
              <Users className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                {language === 'ar' ? 'إضافة وتسجيل العملاء' : 'Customer Registration & Import'}
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                {language === 'ar'
                  ? 'تسجيل عميل جديد أو استيراد جهات الاتصال من هاتفك المحمول بسهولة'
                  : 'Register a new customer or batch import contacts from your phone'}
              </p>
            </div>
          </div>
        </div>

        {/* Live Session Counter Badge */}
        {sessionAddedCustomers.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-bold w-fit">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              {language === 'ar'
                ? `تم تسجيل ${sessionAddedCustomers.length} عميل في هذه الجلسة`
                : `${sessionAddedCustomers.length} registered this session`}
            </span>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-[#030e1a]/90 rounded-2xl border border-cyan-900/40 w-full sm:w-fit overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('single')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'single'
              ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md shadow-cyan-500/20 font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>{language === 'ar' ? 'إضافة عميل فردي' : 'Single Customer'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('batch_contacts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'batch_contacts'
              ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md shadow-cyan-500/20 font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>{language === 'ar' ? 'استيراد من جهات الاتصال' : 'Import from Mobile'}</span>
          {batchContacts.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-slate-950/30 text-slate-950 text-[10px]">
              {batchContacts.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('paste')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'paste'
              ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md shadow-cyan-500/20 font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <ClipboardPaste className="w-4 h-4" />
          <span>{language === 'ar' ? 'لصق أرقام سريعة' : 'Quick Paste / WhatsApp'}</span>
        </button>
      </div>

      {/* --- Tab 1: Single Customer Form --- */}
      {activeTab === 'single' && (
        <div className="bg-[#05172b]/90 rounded-2xl border border-cyan-900/40 p-5 sm:p-7 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-cyan-950/80">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-cyan-400" />
                <span>{language === 'ar' ? 'بيانات العميل الجديد' : 'New Customer Details'}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'ar'
                  ? 'أدخل بيانات العميل مع إمكانية تحديد موقعه الحالي عبر GPS لتسهيل التوصيل لاحقاً.'
                  : 'Enter details with optional GPS capture for smooth delivery navigation.'}
              </p>
            </div>

            {/* Mobile Autofill Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Smartphone}
              isLoading={isAutofillingContact}
              onClick={handleAutofillFromDevice}
              className="text-xs border-cyan-600/60 text-cyan-300 hover:bg-cyan-950/60 font-bold self-start sm:self-auto"
            >
              {language === 'ar' ? 'تعبئة من جهات الاتصال' : 'Autofill from Contacts'}
            </Button>
          </div>

          <form onSubmit={handleSaveSingleCustomer} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {language === 'ar' ? 'اسم العميل *' : 'Customer Name *'}
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 flex items-center pl-3 rtl:pl-0 rtl:pr-3">
                    <User className="h-4 w-4 text-cyan-400/80" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder={language === 'ar' ? 'مثال: محمد أحمد' : 'e.g. Mohamed Ahmed'}
                    value={singleForm.name}
                    onChange={(e) => setSingleForm({ ...singleForm, name: e.target.value })}
                    className={`block w-full rounded-xl border bg-[#020b14]/90 text-sm text-white placeholder:text-slate-500 pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2.5 focus:outline-none transition-colors ${
                      singleErrors.name ? 'border-rose-500' : 'border-slate-700/80 focus:border-cyan-400'
                    }`}
                  />
                </div>
                {singleErrors.name && <p className="text-[11px] text-rose-400 mt-1">{singleErrors.name}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {language === 'ar' ? 'رقم الهاتف *' : 'Phone Number *'}
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 flex items-center pl-3 rtl:pl-0 rtl:pr-3">
                    <Phone className="h-4 w-4 text-cyan-400/80" />
                  </div>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    placeholder="01xxxxxxxxx"
                    value={singleForm.phone}
                    onChange={(e) => setSingleForm({ ...singleForm, phone: e.target.value })}
                    className={`block w-full rounded-xl border bg-[#020b14]/90 text-sm text-white placeholder:text-slate-500 pl-9 pr-3 py-2.5 focus:outline-none transition-colors ${
                      singleErrors.phone ? 'border-rose-500' : 'border-slate-700/80 focus:border-cyan-400'
                    }`}
                  />
                </div>
                {singleErrors.phone && <p className="text-[11px] text-rose-400 mt-1">{singleErrors.phone}</p>}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {language === 'ar' ? 'العنوان وتفاصيل السكن' : 'Delivery Address'}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 flex items-center pl-3 rtl:pl-0 rtl:pr-3">
                  <MapPin className="h-4 w-4 text-cyan-400/80" />
                </div>
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'مثال: شارع البحر، عمارة الأمل، الدور الثاني' : 'e.g. 15 Sea St, Apt 4'}
                  value={singleForm.address}
                  onChange={(e) => setSingleForm({ ...singleForm, address: e.target.value })}
                  className="block w-full rounded-xl border border-slate-700/80 bg-[#020b14]/90 text-sm text-white placeholder:text-slate-500 pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2.5 focus:border-cyan-400 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* GPS Capture Button & Link Preview */}
            <div className="p-3.5 rounded-xl bg-[#020e1c] border border-cyan-900/50 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">
                    {language === 'ar' ? 'موقع العميل على الخريطة (GPS)' : 'Customer Location on Map (GPS)'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {language === 'ar'
                      ? 'التقط موقعك الحالي إن كنت عند العميل الآن، أو الصق رابط خرائط جوجل'
                      : 'Capture current GPS if you are at the customer location, or paste Google Maps link'}
                  </span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={MapPin}
                  isLoading={isLocatingGps}
                  onClick={handleGpsCapture}
                  className="text-xs border-cyan-500/60 text-cyan-300 hover:bg-cyan-950/60 font-bold shrink-0"
                >
                  {language === 'ar' ? '📍 التقاط موقعي الحالي GPS' : '📍 Capture Current GPS'}
                </Button>
              </div>

              <input
                type="text"
                placeholder={language === 'ar' ? 'رابط خرائط جوجل (Google Maps URL)' : 'Google Maps URL'}
                value={singleForm.location_url}
                onChange={(e) => setSingleForm({ ...singleForm, location_url: e.target.value })}
                className="block w-full rounded-xl border border-slate-700/80 bg-[#020b14]/90 text-xs text-cyan-200 placeholder:text-slate-500 px-3 py-2 focus:border-cyan-400 focus:outline-none transition-colors"
              />

              {singleForm.location_url && (
                <div className="flex items-center gap-2 text-[11px] text-emerald-400 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'تم حفظ رابط الموقع بنجاح' : 'Location URL configured'}</span>
                  <a
                    href={buildGoogleMapsUrl(singleForm.location_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-cyan-400 hover:underline font-bold mr-auto rtl:mr-0 rtl:ml-auto"
                  >
                    <span>{language === 'ar' ? 'معاينة على الخريطة' : 'View on Map'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {language === 'ar' ? 'ملاحظات إضافية للتوصيل (اختياري)' : 'Delivery Notes (Optional)'}
              </label>
              <textarea
                rows={2}
                placeholder={language === 'ar' ? 'مثال: بجوار صيدلية الأمل، رن الجرس مرتين' : 'e.g. Next to pharmacy, ring bell twice'}
                value={singleForm.notes}
                onChange={(e) => setSingleForm({ ...singleForm, notes: e.target.value })}
                className="block w-full rounded-xl border border-slate-700/80 bg-[#020b14]/90 text-xs text-white placeholder:text-slate-500 px-3 py-2.5 focus:border-cyan-400 focus:outline-none transition-colors"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmittingSingle}
                icon={UserPlus}
                className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black shadow-lg shadow-cyan-500/20 text-sm py-2.5 px-6"
              >
                {language === 'ar' ? 'حفظ وتسجيل العميل' : 'Save & Register Customer'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* --- Tab 2: Batch Mobile Contacts Import --- */}
      {activeTab === 'batch_contacts' && (
        <div className="bg-[#05172b]/90 rounded-2xl border border-cyan-900/40 p-5 sm:p-7 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyan-950/80">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                <span>{language === 'ar' ? 'استيراد جهات الاتصال من الهاتف' : 'Import Contacts from Device'}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'ar'
                  ? 'اختر جهات اتصال متعددة من دفتر هاتفك بنقرة واحدة لحفظهم في المنظومة مباشرة.'
                  : 'Select multiple contacts from your mobile device to batch register them.'}
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={Smartphone}
              isLoading={isSelectingContacts}
              onClick={handleOpenContactPicker}
              className="bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20 text-xs"
            >
              {language === 'ar' ? '📱 فتح جهات الاتصال للاختيار' : '📱 Select Mobile Contacts'}
            </Button>
          </div>

          {batchContacts.length === 0 ? (
            <div className="p-8 border border-dashed border-cyan-900/60 rounded-2xl text-center space-y-3 bg-[#020d1a]/50">
              <div className="w-12 h-12 rounded-full bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center mx-auto text-xl text-cyan-400">
                📱
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <p className="text-xs font-bold text-white">
                  {language === 'ar' ? 'لم يتم اختيار أي جهات اتصال بعد' : 'No contacts selected yet'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {language === 'ar'
                    ? 'انقر على الزر أعلاه لفتح قائمة أرقام هاتفك واختيار الزبائن دفعة واحدة.'
                    : 'Tap the button above to launch your device contact picker and select contacts.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Batch Actions Bar */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#020d1a] border border-cyan-900/60 text-xs">
                <button
                  type="button"
                  onClick={handleToggleAllBatch}
                  className="flex items-center gap-2 text-cyan-300 font-bold hover:text-white transition-colors"
                >
                  {selectedBatchIndices.length === batchContacts.length ? (
                    <CheckSquare className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500" />
                  )}
                  <span>
                    {language === 'ar'
                      ? `تحديد الكل (${selectedBatchIndices.length} من ${batchContacts.length})`
                      : `Select All (${selectedBatchIndices.length}/${batchContacts.length})`}
                  </span>
                </button>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  isLoading={isImportingBatch}
                  onClick={handleImportBatch}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20"
                >
                  {language === 'ar'
                    ? `استيراد المحددين (${selectedBatchIndices.length})`
                    : `Import Selected (${selectedBatchIndices.length})`}
                </Button>
              </div>

              {/* Progress bar */}
              {isImportingBatch && (
                <div className="space-y-1.5 p-3 rounded-xl bg-[#020b14] border border-cyan-500/40">
                  <div className="flex items-center justify-between text-xs text-cyan-300 font-bold">
                    <span>{language === 'ar' ? 'جاري الاستيراد...' : 'Importing...'}</span>
                    <span>{batchProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-2 transition-all duration-300"
                      style={{ width: `${batchProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Contacts List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1">
                {batchContacts.map((c, idx) => {
                  const isSelected = selectedBatchIndices.includes(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleToggleBatchIndex(idx)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-500/60 ring-1 ring-cyan-500/30'
                          : 'bg-[#020b14]/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                            isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {c.name ? c.name[0] : '👤'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{c.name || 'عميل بدون اسم'}</p>
                          <p className="text-[11px] text-slate-400 font-mono" dir="ltr">{c.phone}</p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 stroke-[2.5]" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- Tab 3: Quick Paste Tool --- */}
      {activeTab === 'paste' && (
        <div className="bg-[#05172b]/90 rounded-2xl border border-cyan-900/40 p-5 sm:p-7 shadow-xl space-y-6">
          <div className="pb-4 border-b border-cyan-950/80">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ClipboardPaste className="w-5 h-5 text-cyan-400" />
              <span>{language === 'ar' ? 'لصق واستخراج أرقام زبائن سريعة' : 'Quick Paste from WhatsApp / Messages'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'ar'
                ? 'انسخ أرقام العملاء من واتساب أو الرسائل والصقها هنا مباشرة، وسيقوم النظام باستخراج الأسماء والأرقام تلقائياً.'
                : 'Paste customer contacts from WhatsApp or chats, and the system will extract them automatically.'}
            </p>
          </div>

          <div className="space-y-3">
            <textarea
              rows={4}
              placeholder={
                language === 'ar'
                  ? 'الصق النص هنا، مثال:\nمحمد إبراهيم 01012345678\nأحمد علي - 01223456789\n01556789012'
                  : 'Paste text here, e.g.:\nMohamed 01012345678\nAhmed 01223456789'
              }
              value={rawPastedText}
              onChange={(e) => setRawPastedText(e.target.value)}
              className="block w-full rounded-xl border border-slate-700/80 bg-[#020b14]/90 text-xs text-white placeholder:text-slate-500 p-3 focus:border-cyan-400 focus:outline-none font-mono"
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Sparkles}
              onClick={handleParsePastedText}
              className="border-cyan-600/70 text-cyan-300 hover:bg-cyan-950/60 font-bold text-xs"
            >
              {language === 'ar' ? '🔍 استخراج وتحليل جهات الاتصال' : 'Extract Contacts'}
            </Button>
          </div>

          {parsedPastedContacts.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-cyan-950/80">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">
                  {language === 'ar'
                    ? `تم استخراج ${parsedPastedContacts.length} رقم جاهز للحفظ:`
                    : `Extracted ${parsedPastedContacts.length} contact(s):`}
                </span>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  isLoading={isImportingPasted}
                  onClick={handleImportPasted}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs"
                >
                  {language === 'ar' ? 'حفظ جهات الاتصال في النظام' : 'Save Extracted Contacts'}
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {parsedPastedContacts.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#020b14]/90 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-white truncate">{c.name}</span>
                    <span className="font-mono text-cyan-300 text-[11px]" dir="ltr">{c.phone}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- Session History Card: Customers Added in Current Session --- */}
      {sessionAddedCustomers.length > 0 && (
        <div className="bg-[#05172b]/90 rounded-2xl border border-emerald-900/40 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-black text-white">
                {language === 'ar'
                  ? `العملاء المسجلون خلال هذه الجلسة (${sessionAddedCustomers.length})`
                  : `Customers Registered in Current Session (${sessionAddedCustomers.length})`}
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {language === 'ar' ? 'تم الحفظ في قاعدة البيانات' : 'Saved in Database'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sessionAddedCustomers.map((cust, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#020e1c] border border-cyan-900/50 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">{cust.name}</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {cust.timestamp}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono text-cyan-300" dir="ltr">{cust.phone}</span>
                  {cust.location_url && (
                    <a
                      href={buildGoogleMapsUrl(cust.location_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-400 hover:underline font-bold"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>GPS</span>
                    </a>
                  )}
                </div>

                {cust.address && (
                  <p className="text-[11px] text-slate-300 truncate">
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
