import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { listCustomers, searchCustomers } from '../../api/customers';
import { createOrder } from '../../api/orders';
import { getErrorMessage } from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { useDebounce } from '../../hooks/useDebounce';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../utils/formatters';
import { isContactPickerSupported, selectContact } from '../../utils/contacts';
import {
  Plus,
  Trash2,
  Search,
  UserCheck,
  UserPlus,
  ShoppingBag,
  MapPin,
  Phone,
  Smartphone,
  Fish,
  Flame,
  Sparkles,
  Utensils,
  Navigation,
  ExternalLink,
  Loader2,
  Banknote,
  Receipt,
  CreditCard,
  Clock,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { getCurrentGpsLocation } from '../../utils/location';

const SEAFOOD_PRESETS = [
  {
    category: 'cat_fresh_fish',
    categoryNameAr: '🐟 أسماك طازجة بالكيلو',
    categoryNameEn: '🐟 Fresh Fish (by kg)',
    items: [
      { nameAr: 'سمك بلطي طازج', nameEn: 'Fresh Tilapia', price: 95 },
      { nameAr: 'سمك بوري بحري', nameEn: 'Sea Mullet (Bouri)', price: 160 },
      { nameAr: 'سمك دنيس فاخر', nameEn: 'Sea Bream (Denis)', price: 260 },
      { nameAr: 'سمك قاروص بلدي', nameEn: 'Sea Bass (Qarous)', price: 280 },
      { nameAr: 'فيليه قشر بياض', nameEn: 'Nile Perch Fillet', price: 220 },
      { nameAr: 'سمك وقار / هامور', nameEn: 'Grouper (Waqar)', price: 340 },
    ],
  },
  {
    category: 'cat_seafood',
    categoryNameAr: '🦐 جمبري وفواكه بحر',
    categoryNameEn: '🦐 Shrimp & Seafood',
    items: [
      { nameAr: 'جمبري جامبو سويسي', nameEn: 'Jumbo Suez Shrimp', price: 420 },
      { nameAr: 'جمبري وسط مقشر', nameEn: 'Medium Peeled Shrimp', price: 300 },
      { nameAr: 'كابوريا نتي مبطرخة', nameEn: 'Female Sea Crabs', price: 210 },
      { nameAr: 'سبيط / كاليماري بلدي', nameEn: 'Fresh Squid / Calamari', price: 280 },
      { nameAr: 'جندوفلي بلدي مبخر', nameEn: 'Fresh Steamed Clams', price: 120 },
    ],
  },
  {
    category: 'cat_meals',
    categoryNameAr: '🍲 طواجن ووجبات جاهزة',
    categoryNameEn: '🍲 Ready Meals & Casseroles',
    items: [
      { nameAr: 'وجبة بلطي مشوي (أرز + سلطة + طحينة)', nameEn: 'Grilled Tilapia Meal + Rice', price: 130 },
      { nameAr: 'وجبة بوري سنجاري إسكندراني', nameEn: 'Singari Mullet Meal', price: 185 },
      { nameAr: 'وجبة فيليه مقرمش + أرز صيادية', nameEn: 'Crispy Fillet Meal + Sayadiya Rice', price: 165 },
      { nameAr: 'طاجن سي فود وايت صوس ملوكي', nameEn: 'Royal White Sauce Seafood Tagine', price: 195 },
      { nameAr: 'طاجن جمبري إسكندراني بصلصة حمراء', nameEn: 'Alexandrian Red Shrimp Tagine', price: 230 },
      { nameAr: 'شوربة سي فود ملوكي غنية بالكريمة', nameEn: 'Royal Creamy Seafood Soup', price: 95 },
    ],
  },
];

const COOKING_STYLES = [
  { ar: 'مشوي ردة مصري', en: 'Grilled with Bran' },
  { ar: 'مشوي زيت وليمون', en: 'Grilled Olive Oil & Lemon' },
  { ar: 'سنجاري بالفرن', en: 'Baked Singari Style' },
  { ar: 'مقلي ذهبي مقرمش', en: 'Crispy Golden Fried' },
  { ar: 'طاجن فرن مخصوص', en: 'Oven Casserole' },
  { ar: 'نيء للتنظيف والتتبيل فقط', en: 'Raw Cleaned & Seasoned' },
];

export function CreateOrderModal({ isOpen, onClose, onOrderCreated }) {
  const [customerMode, setCustomerMode] = useState('existing'); // 'existing' | 'new'
  const { t, language, isRTL } = useLanguage();

  // Existing customer search state
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // New inline customer state
  const [inlineCustomer, setInlineCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    location_url: '',
    notes: '',
  });

  // Order Mode: 'quick' (Primary / Total Amount only) vs 'detailed' (Secondary / Line Items)
  const [orderMode, setOrderMode] = useState('quick');
  const [quickAmount, setQuickAmount] = useState('');
  const [quickDescription, setQuickDescription] = useState('');

  // Payment Tracking State
  const [paymentStatus, setPaymentStatus] = useState('unpaid'); // 'unpaid' | 'paid' | 'postpaid'
  const [paymentNotes, setPaymentNotes] = useState('');

  // Order Items state for Detailed Mode
  const [items, setItems] = useState([
    { name: '', quantity: 1, price: '' },
  ]);

  const [activeCategoryTab, setActiveCategoryTab] = useState(0);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const { success, error: toastError } = useToast();

  const handleGetGps = async () => {
    setIsLocatingGps(true);
    try {
      const { url } = await getCurrentGpsLocation(language);
      setInlineCustomer((prev) => ({ ...prev, location_url: url }));
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

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedCustomer(null);
      setInlineCustomer({ name: '', phone: '', address: '', location_url: '', notes: '' });
      setOrderMode('quick');
      setQuickAmount('');
      setQuickDescription('');
      setPaymentStatus('unpaid');
      setPaymentNotes('');
      setItems([{ name: '', quantity: 1, price: '' }]);
      setErrors({});

      // Pre-fetch initial recent customers
      listCustomers()
        .then((data) => setSearchResults(data.slice(0, 10)))
        .catch(() => { });
    }
  }, [isOpen]);

  // Live search effect
  useEffect(() => {
    if (!isOpen || customerMode !== 'existing') return;

    if (debouncedSearch.trim().length >= 1) {
      setIsSearching(true);
      searchCustomers(debouncedSearch.trim())
        .then((results) => setSearchResults(results))
        .catch(() => setSearchResults([]))
        .finally(() => setIsSearching(false));
    } else {
      listCustomers()
        .then((data) => setSearchResults(data.slice(0, 10)))
        .catch(() => { });
    }
  }, [debouncedSearch, customerMode, isOpen]);

  const addItemRow = () => {
    setItems((prev) => [...prev, { name: '', quantity: 1, price: '' }]);
  };

  const removeItemRow = (index) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItemRow = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  // Quick preset click handler
  const handleAddPreset = (presetItem) => {
    const itemName = language === 'ar' ? presetItem.nameAr : presetItem.nameEn;
    const itemPrice = presetItem.price;

    setItems((prev) => {
      // Check if last row is empty
      const last = prev[prev.length - 1];
      if (last && !last.name.trim() && (!last.price || last.price === '')) {
        return prev.map((it, idx) =>
          idx === prev.length - 1 ? { ...it, name: itemName, price: itemPrice } : it
        );
      }
      return [...prev, { name: itemName, quantity: 1, price: itemPrice }];
    });
  };

  // Quick cooking style append handler
  const handleAppendCookingStyle = (style) => {
    const styleText = language === 'ar' ? style.ar : style.en;
    // Append to notes
    setInlineCustomer((prev) => ({
      ...prev,
      notes: prev.notes ? `${prev.notes} - [${styleText}]` : `[${styleText}]`,
    }));
  };

  const calculateTotal = () => {
    return items.reduce((sum, it) => {
      const q = parseFloat(it.quantity) || 0;
      const p = parseFloat(it.price) || 0;
      return sum + q * p;
    }, 0);
  };

  const handleInlineContactPick = async () => {
    if (!isContactPickerSupported()) {
      toastError(language === 'ar' ? 'خاصية استيراد جهات الاتصال متاحة على أجهزة الموبايل.' : 'Contact Picker is available on mobile devices.');
      return;
    }
    try {
      const contact = await selectContact();
      if (contact) {
        setInlineCustomer((prev) => ({
          ...prev,
          name: contact.name || prev.name,
          phone: contact.phone || prev.phone,
          address: contact.address || prev.address,
        }));
        success(language === 'ar' ? `تم اختيار: ${contact.name}` : `Autofilled ${contact.name}!`);
      }
    } catch (err) {
      toastError(err.message || 'Failed to select contact');
    }
  };

  const validate = () => {
    const errs = {};

    // Customer validation
    if (customerMode === 'existing') {
      if (!selectedCustomer) {
        errs.customer = language === 'ar' ? 'يرجى اختيار عميل للطلب' : 'Please select a customer for this order';
      }
    } else {
      if (!inlineCustomer.name.trim()) errs.name = language === 'ar' ? 'اسم العميل مطلوب' : 'Customer name is required';
      if (!inlineCustomer.phone.trim()) errs.phone = language === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone number is required';
    }

    // Order mode validation
    if (orderMode === 'quick') {
      const amt = parseFloat(quickAmount);
      if (!quickAmount || isNaN(amt) || amt <= 0) {
        errs.quickAmount = language === 'ar' ? 'يرجى إدخال مبلغ صحيح أكبر من صفر' : 'Please enter a valid amount greater than 0';
      }
    } else {
      // Items validation
      const validItems = items.filter((it) => it.name.trim().length > 0);
      if (validItems.length === 0) {
        errs.items = language === 'ar' ? 'يرجى تحديد صنف أسماك واحد على الأقل' : 'Please specify at least one seafood item';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      let formattedItems = [];
      let finalTotalAmount = 0;

      if (orderMode === 'quick') {
        finalTotalAmount = parseFloat(quickAmount);
        formattedItems = [
          {
            name: quickDescription.trim() || (language === 'ar' ? 'طلب أسماك ومأكولات بحرية' : 'Seafood Order'),
            quantity: 1,
            price: finalTotalAmount,
          },
        ];
      } else {
        formattedItems = items
          .filter((it) => it.name.trim().length > 0)
          .map((it) => ({
            name: it.name.trim(),
            quantity: parseInt(it.quantity, 10) || 1,
            ...(it.price ? { price: parseFloat(it.price) } : {}),
          }));
        finalTotalAmount = calculateTotal();
      }

      const payload = {
        total_amount: finalTotalAmount,
        payment_status: paymentStatus,
        payment_notes: paymentNotes?.trim() || null,
        items: formattedItems,
      };

      if (customerMode === 'existing') {
        payload.customer_id = selectedCustomer.id;
      } else {
        payload.customer = {
          name: inlineCustomer.name.trim(),
          phone: inlineCustomer.phone.trim(),
          address: inlineCustomer.address?.trim() || null,
          location_url: inlineCustomer.location_url?.trim() || null,
          notes: inlineCustomer.notes?.trim() || null,
        };
      }

      const order = await createOrder(payload);
      const successTitle = language === 'ar' ? 'تم إنشاء الطلب بنجاح' : 'Order Created';
      const successMsg = language === 'ar'
        ? `تم تسجيل طلب الأسماك رقم #${order.id} بمبلغ ${finalTotalAmount} ج.م بنجاح!`
        : `Order #${order.id} with total ${finalTotalAmount} EGP created successfully!`;

      success(successMsg, successTitle);
      onOrderCreated(order);
      onClose();
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('new_order_title')}
      description={t('new_order_desc')}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-slate-200">
        {/* Customer Selector Mode Tabs */}
        <div>
          <div className="flex items-center gap-2 p-1 bg-slate-900/90 rounded-2xl mb-3 border border-cyan-900/40">
            <button
              type="button"
              onClick={() => setCustomerMode('existing')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${customerMode === 'existing'
                ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              <UserCheck className="w-4 h-4" />
              {t('existing_customer')}
            </button>
            <button
              type="button"
              onClick={() => setCustomerMode('new')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${customerMode === 'new'
                ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              <UserPlus className="w-4 h-4" />
              {t('new_customer')}
            </button>
          </div>

          {/* Existing Customer Selector */}
          {customerMode === 'existing' ? (
            <div className="space-y-2">
              {selectedCustomer ? (
                <div className="p-3.5 bg-cyan-950/40 rounded-2xl border border-cyan-500/40 flex items-start justify-between gap-3 shadow-inner">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-500 text-slate-950 flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                      {selectedCustomer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white text-sm">
                          {selectedCustomer.name}
                        </p>
                        <span className="text-[11px] text-cyan-400 font-mono">
                          #{selectedCustomer.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5" dir="ltr">
                        <Phone className="w-3.5 h-3.5 text-cyan-400" />
                        {selectedCustomer.phone}
                      </p>
                      {selectedCustomer.address && (
                        <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                          {selectedCustomer.address}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCustomer(null)}
                    className="text-xs text-cyan-400 hover:text-cyan-200"
                  >
                    {language === 'ar' ? 'تغيير العميل' : 'Change'}
                  </Button>
                </div>
              ) : (
                <div>
                  <Input
                    placeholder={t('select_customer_placeholder')}
                    icon={Search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    helperText={
                      isSearching
                        ? (language === 'ar' ? 'جاري البحث في قاعدة العملاء...' : 'Searching customers...')
                        : (language === 'ar' ? 'اكتب اسم العميل أو رقم الهاتف للبحث السريع' : 'Type customer name or phone')
                    }
                  />

                  {/* Customer search results list */}
                  <div className="mt-2 max-h-40 overflow-y-auto border border-cyan-900/40 rounded-2xl divide-y divide-slate-800 bg-[#041222]">
                    {searchResults.length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-400">
                        {isSearching
                          ? (language === 'ar' ? 'جاري البحث...' : 'Searching...')
                          : (language === 'ar' ? 'لم يتم العثور على عميل مسجل بهذا الاسم. اضغط على "عميل جديد".' : 'No matching customers found.')}
                      </div>
                    ) : (
                      searchResults.map((cust) => (
                        <button
                          key={cust.id}
                          type="button"
                          onClick={() => setSelectedCustomer(cust)}
                          className="w-full text-right rtl:text-right ltr:text-left px-3.5 py-2.5 hover:bg-cyan-950/50 flex items-center justify-between transition-colors"
                        >
                          <div>
                            <p className="text-xs font-bold text-white">
                              {cust.name}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate max-w-sm" dir="ltr">
                              {cust.phone} {cust.address ? `• ${cust.address}` : ''}
                            </p>
                          </div>
                          <span className="text-[11px] font-bold text-cyan-400">
                            {language === 'ar' ? 'اختيار' : 'Select'}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
              {errors.customer && (
                <p className="text-xs text-rose-400">{errors.customer}</p>
              )}
            </div>
          ) : (
            /* New Customer Inline Form */
            <div className="p-4 bg-[#041222] rounded-2xl border border-cyan-900/40 space-y-3">
              {/* Autofill from contact button */}
              <div className="flex items-center justify-between p-2.5 bg-cyan-950/50 rounded-xl border border-cyan-500/30">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-semibold text-cyan-200">
                    {language === 'ar' ? 'ملء سريع من جهات اتصال الهاتف' : 'Autofill from device contacts'}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleInlineContactPick}
                  className="bg-cyan-900/60 border-cyan-400 text-cyan-200 hover:bg-cyan-800 text-xs py-1 px-3"
                >
                  {language === 'ar' ? 'اختر جهة اتصال' : 'Choose Contact'}
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label={t('customer_name')}
                  placeholder={language === 'ar' ? 'مثال: أستاذ أحمد محمود' : 'e.g. David Miller'}
                  required
                  value={inlineCustomer.name}
                  onChange={(e) =>
                    setInlineCustomer({ ...inlineCustomer, name: e.target.value })
                  }
                  error={errors.name}
                />
                <Input
                  label={t('customer_phone')}
                  placeholder="010XXXXXXXX"
                  required
                  value={inlineCustomer.phone}
                  onChange={(e) =>
                    setInlineCustomer({ ...inlineCustomer, phone: e.target.value })
                  }
                  error={errors.phone}
                />
                <div className="sm:col-span-2">
                  <Input
                    label={t('delivery_address_opt')}
                    placeholder={language === 'ar' ? 'الحي / اسم الشارع / رقم العمارة والدور...' : 'Area / Street / Building...'}
                    value={inlineCustomer.address}
                    onChange={(e) =>
                      setInlineCustomer({ ...inlineCustomer, address: e.target.value })
                    }
                  />
                </div>
                {/* Google Maps Location / Link */}
                <div className="sm:col-span-2 space-y-1.5">
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
                      {inlineCustomer.location_url && (
                        <a
                          href={inlineCustomer.location_url}
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
                      value={inlineCustomer.location_url}
                      onChange={(e) =>
                        setInlineCustomer({ ...inlineCustomer, location_url: e.target.value })
                      }
                      className="block w-full rounded-xl border border-slate-700/80 bg-[#020b14]/80 text-sm text-white placeholder:text-slate-500 pl-10 pr-3 rtl:pl-3 rtl:pr-10 py-2.5 focus:border-cyan-400 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label={t('order_notes')}
                    placeholder={language === 'ar' ? 'ملاحظات خاصة بالتسوية (مشوي ردة، بهارات زيادة...)' : 'Cooking or delivery notes...'}
                    value={inlineCustomer.notes}
                    onChange={(e) =>
                      setInlineCustomer({ ...inlineCustomer, notes: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Mode Toggle */}
        <div className="p-1 bg-slate-900/90 rounded-2xl border border-cyan-900/40 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOrderMode('quick')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
              orderMode === 'quick'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Banknote className="w-4 h-4 text-emerald-300" />
            <span>{t('order_mode_quick')}</span>
          </button>
          <button
            type="button"
            onClick={() => setOrderMode('detailed')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
              orderMode === 'detailed'
                ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md shadow-cyan-950/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Utensils className="w-4 h-4 text-cyan-300" />
            <span>{t('order_mode_detailed')}</span>
          </button>
        </div>

        {/* Quick Amount Section (Primary Mode) */}
        {orderMode === 'quick' && (
          <div className="p-4 bg-gradient-to-br from-[#041a29] to-[#02101e] rounded-2xl border border-emerald-500/30 space-y-3.5 shadow-lg shadow-black/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-300">
                    {t('total_amount_to_pay')} <span className="text-rose-400">*</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {language === 'ar' ? 'حدد المبلغ المطلوب من العميل مباشرة دون الحاجة لإدخال تفاصيل الأسماك' : 'Enter the customer total amount directly without item breakdown'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
              <div className="sm:col-span-1">
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  {language === 'ar' ? 'المبلغ الإجمالي (ج.م) *' : 'Total Amount (EGP) *'}
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder={t('quick_amount_placeholder')}
                    value={quickAmount}
                    onChange={(e) => setQuickAmount(e.target.value)}
                    className={`block w-full rounded-xl border bg-[#020b14]/90 text-lg font-black text-emerald-300 placeholder:text-slate-500 px-3 py-2.5 focus:outline-none transition-colors ${
                      errors.quickAmount ? 'border-rose-500' : 'border-emerald-500/50 focus:border-emerald-400'
                    }`}
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center pr-3 rtl:pr-0 rtl:pl-3">
                    <span className="text-xs font-bold text-emerald-400/80">{t('currency')}</span>
                  </div>
                </div>
                {errors.quickAmount && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.quickAmount}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  {language === 'ar' ? 'وصف الطلب / الوجبة (اختياري)' : 'Order Description (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder={t('quick_desc_placeholder')}
                  value={quickDescription}
                  onChange={(e) => setQuickDescription(e.target.value)}
                  className="block w-full rounded-xl border border-slate-700/80 bg-[#020b14]/90 text-xs text-white placeholder:text-slate-500 px-3 py-3 focus:border-emerald-400 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Quick Cooking Styles Chips in Quick Mode */}
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                {language === 'ar' ? 'إضافة طريقة التسوية للوصف:' : 'Add Cooking Style to Description:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COOKING_STYLES.map((style, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const styleText = language === 'ar' ? style.ar : style.en;
                      setQuickDescription((prev) => (prev ? `${prev} - ${styleText}` : styleText));
                    }}
                    className="px-2.5 py-1 rounded-lg bg-orange-950/30 border border-orange-500/30 hover:bg-orange-900/50 text-[11px] font-semibold text-orange-300 transition-all"
                  >
                    {language === 'ar' ? style.ar : style.en}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Detailed Items & Seafood Menu (Secondary Mode) */}
        {orderMode === 'detailed' && (
          <div className="space-y-3">
            {/* Quick Seafood Menu Picker */}
            <div className="p-3.5 bg-[#031120] rounded-2xl border border-cyan-900/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fish className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-cyan-300">
                    {t('quick_menu_title')}
                  </span>
                </div>
              </div>

              {/* Category Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {SEAFOOD_PRESETS.map((cat, idx) => (
                  <button
                    key={cat.category}
                    type="button"
                    onClick={() => setActiveCategoryTab(idx)}
                    className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all ${
                      activeCategoryTab === idx
                        ? 'bg-cyan-500 text-slate-950 shadow-md'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {language === 'ar' ? cat.categoryNameAr : cat.categoryNameEn}
                  </button>
                ))}
              </div>

              {/* Presets Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                {SEAFOOD_PRESETS[activeCategoryTab].items.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddPreset(preset)}
                    className="flex items-center justify-between gap-1 p-2 rounded-xl bg-slate-900/90 border border-cyan-900/40 hover:border-cyan-400 hover:bg-cyan-950/60 text-xs text-slate-200 transition-all text-right rtl:text-right ltr:text-left group"
                  >
                    <span className="font-semibold truncate text-[11px] group-hover:text-cyan-300">
                      {language === 'ar' ? preset.nameAr : preset.nameEn}
                    </span>
                    <span className="text-[10px] font-bold text-amber-400 shrink-0 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                      {preset.price} {t('currency')}
                    </span>
                  </button>
                ))}
              </div>

              {/* Quick Cooking Styles Chips */}
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                  {language === 'ar' ? 'طرق التسوية السريعة (تضاف للملاحظات):' : 'Quick Cooking Styles:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {COOKING_STYLES.map((style, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAppendCookingStyle(style)}
                      className="px-2 py-1 rounded-lg bg-orange-950/30 border border-orange-500/30 hover:bg-orange-900/50 text-[11px] font-semibold text-orange-300 transition-all"
                    >
                      {language === 'ar' ? style.ar : style.en}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Items Builder */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    {t('order_items')}
                  </h4>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={Plus}
                  onClick={addItemRow}
                  className="text-xs py-1 px-3 bg-cyan-950/40 border-cyan-700/60 text-cyan-300 hover:bg-cyan-900/50"
                >
                  {t('add_another_item')}
                </Button>
              </div>

              <div className="space-y-2">
                {items.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded-xl bg-[#041222] border border-cyan-900/40"
                  >
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder={t('item_placeholder')}
                        value={it.name}
                        onChange={(e) => updateItemRow(idx, 'name', e.target.value)}
                        className="w-full text-xs bg-slate-900/90 border border-slate-700 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div className="w-20">
                      <input
                        type="number"
                        min="1"
                        placeholder={t('quantity')}
                        value={it.quantity}
                        onChange={(e) => updateItemRow(idx, 'quantity', e.target.value)}
                        className="w-full text-xs text-center bg-slate-900/90 border border-slate-700 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div className="w-28">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={t('price_egp')}
                        value={it.price}
                        onChange={(e) => updateItemRow(idx, 'price', e.target.value)}
                        className="w-full text-xs bg-slate-900/90 border border-slate-700 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItemRow(idx)}
                      disabled={items.length <= 1}
                      className="p-2 text-slate-400 hover:text-rose-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {errors.items && (
                <p className="text-xs text-rose-400">{errors.items}</p>
              )}

              {/* Subtotal calculation */}
              {calculateTotal() > 0 && (
                <div className="flex justify-end items-center gap-3 pt-2 text-xs">
                  <span className="text-slate-400">{t('calculated_total')}:</span>
                  <span className="font-extrabold text-cyan-400 text-base">
                    {formatCurrency(calculateTotal(), language)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PAYMENT & COLLECTION STATUS SECTION (Core Feature) */}
        <div className="p-4 bg-[#031527] rounded-2xl border border-cyan-800/40 space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-300">
              {t('payment_status')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Unpaid Option */}
            <button
              type="button"
              onClick={() => setPaymentStatus('unpaid')}
              className={`p-3 rounded-xl border text-right rtl:text-right ltr:text-left transition-all ${
                paymentStatus === 'unpaid'
                  ? 'bg-amber-950/40 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                  <Banknote className="w-3.5 h-3.5" />
                  {t('payment_status_unpaid')}
                </span>
                {paymentStatus === 'unpaid' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {t('payment_status_unpaid_desc')}
              </p>
            </button>

            {/* Paid Option */}
            <button
              type="button"
              onClick={() => setPaymentStatus('paid')}
              className={`p-3 rounded-xl border text-right rtl:text-right ltr:text-left transition-all ${
                paymentStatus === 'paid'
                  ? 'bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-emerald-300 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5" />
                  {t('payment_status_paid')}
                </span>
                {paymentStatus === 'paid' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {t('payment_status_paid_desc')}
              </p>
            </button>

            {/* Postpaid / On Credit Option */}
            <button
              type="button"
              onClick={() => setPaymentStatus('postpaid')}
              className={`p-3 rounded-xl border text-right rtl:text-right ltr:text-left transition-all ${
                paymentStatus === 'postpaid'
                  ? 'bg-purple-950/40 border-purple-500 shadow-md ring-1 ring-purple-500/50'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-purple-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {t('payment_status_postpaid')}
                </span>
                {paymentStatus === 'postpaid' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {t('payment_status_postpaid_desc')}
              </p>
            </button>
          </div>

          {/* Payment Notes */}
          <div className="pt-2">
            <input
              type="text"
              placeholder={t('payment_notes_placeholder')}
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              className="block w-full rounded-xl border border-slate-700/80 bg-[#020b14]/80 text-xs text-white placeholder:text-slate-500 px-3 py-2.5 focus:border-cyan-400 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="border-slate-700 text-slate-300">
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            icon={Plus}
            className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold border-0"
          >
            {t('submit_create_order')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
