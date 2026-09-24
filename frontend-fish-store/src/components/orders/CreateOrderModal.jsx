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
} from 'lucide-react';

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
    notes: '',
  });

  // Order Items state
  const [items, setItems] = useState([
    { name: '', quantity: 1, price: '' },
  ]);

  const [activeCategoryTab, setActiveCategoryTab] = useState(0);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error: toastError } = useToast();

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedCustomer(null);
      setInlineCustomer({ name: '', phone: '', address: '', notes: '' });
      setItems([{ name: '', quantity: 1, price: '' }]);
      setErrors({});

      // Pre-fetch initial recent customers
      listCustomers()
        .then((data) => setSearchResults(data.slice(0, 10)))
        .catch(() => {});
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
        .catch(() => {});
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

    // Items validation
    const validItems = items.filter((it) => it.name.trim().length > 0);
    if (validItems.length === 0) {
      errs.items = language === 'ar' ? 'يرجى تحديد صنف أسماك واحد على الأقل' : 'Please specify at least one seafood item';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const formattedItems = items
        .filter((it) => it.name.trim().length > 0)
        .map((it) => ({
          name: it.name.trim(),
          quantity: parseInt(it.quantity, 10) || 1,
          ...(it.price ? { price: parseFloat(it.price) } : {}),
        }));

      const payload = {
        items: formattedItems,
      };

      if (customerMode === 'existing') {
        payload.customer_id = selectedCustomer.id;
      } else {
        payload.customer = {
          name: inlineCustomer.name.trim(),
          phone: inlineCustomer.phone.trim(),
          address: inlineCustomer.address?.trim() || null,
          notes: inlineCustomer.notes?.trim() || null,
        };
      }

      const order = await createOrder(payload);
      const successTitle = language === 'ar' ? 'تم إنشاء الطلب بنجاح' : 'Order Created';
      const successMsg = language === 'ar'
        ? `تم تسجيل طلب الأسماك رقم #${order.id} بنجاح!`
        : `Order #${order.id} has been created successfully!`;

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
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
                customerMode === 'existing'
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
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
                customerMode === 'new'
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

        {/* Quick Seafood Menu Picker for "أمير البحار" */}
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
                  🔥 {language === 'ar' ? style.ar : style.en}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Order Items Builder */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
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
