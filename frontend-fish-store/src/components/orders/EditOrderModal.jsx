import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { updateOrder } from '../../api/orders';
import { listDrivers } from '../../api/drivers';
import { getErrorMessage } from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../utils/formatters';
import {
  Plus,
  Trash2,
  Fish,
  Flame,
  ShoppingBag,
  Truck,
  MapPin,
  Phone,
  User,
  Clock,
  CheckCircle2,
} from 'lucide-react';

const SEAFOOD_PRESETS = [
  {
    category: 'cat_fresh_fish',
    categoryNameAr: 'أسماك طازجة بالكيلو',
    categoryNameEn: 'Fresh Fish (by kg)',
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
    categoryNameAr: 'جمبري وفواكه بحر',
    categoryNameEn: 'Shrimp & Seafood',
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
    categoryNameAr: 'طواجن ووجبات جاهزة',
    categoryNameEn: 'Ready Meals & Casseroles',
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

export function EditOrderModal({ isOpen, onClose, order, onOrderUpdated }) {
  const { t, language, isRTL } = useLanguage();
  const { success, error: toastError } = useToast();

  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('preparing');
  const [driverId, setDriverId] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [activeCategoryTab, setActiveCategoryTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && order) {
      const parsedItems = Array.isArray(order.items)
        ? order.items.map((it) => ({
            name: it.name || it.description || '',
            quantity: it.quantity || 1,
            price: it.price !== undefined ? it.price : '',
          }))
        : typeof order.items === 'string'
        ? [{ name: order.items, quantity: 1, price: '' }]
        : [{ name: '', quantity: 1, price: '' }];

      setItems(parsedItems.length > 0 ? parsedItems : [{ name: '', quantity: 1, price: '' }]);
      setStatus(order.status || 'preparing');
      setDriverId(order.assigned_driver_id ? String(order.assigned_driver_id) : '');
      setErrors({});

      listDrivers()
        .then((data) => setDrivers(data || []))
        .catch(() => {});
    }
  }, [isOpen, order]);

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

  const handleAddPreset = (presetItem) => {
    const itemName = language === 'ar' ? presetItem.nameAr : presetItem.nameEn;
    const itemPrice = presetItem.price;

    setItems((prev) => {
      const last = prev[prev.length - 1];
      if (last && !last.name.trim() && (!last.price || last.price === '')) {
        return prev.map((it, idx) =>
          idx === prev.length - 1 ? { ...it, name: itemName, price: itemPrice } : it
        );
      }
      return [...prev, { name: itemName, quantity: 1, price: itemPrice }];
    });
  };

  const handleAppendCookingStyle = (style) => {
    const styleText = language === 'ar' ? style.ar : style.en;
    setItems((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      const updatedName = last.name ? `${last.name} (${styleText})` : styleText;
      return prev.map((it, idx) => (idx === prev.length - 1 ? { ...it, name: updatedName } : it));
    });
  };

  const calculateTotal = () => {
    return items.reduce((sum, it) => {
      const q = parseFloat(it.quantity) || 0;
      const p = parseFloat(it.price) || 0;
      return sum + q * p;
    }, 0);
  };

  const validate = () => {
    const errs = {};
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
        status,
        driver_id: driverId ? Number(driverId) : null,
      };

      const updated = await updateOrder(order.id, payload);
      const title = language === 'ar' ? 'تم حفظ التعديلات' : 'Order Updated';
      const msg = language === 'ar'
        ? `تم تحديث طلب الأسماك #${order.id} بنجاح!`
        : `Order #${order.id} has been updated successfully!`;

      success(msg, title);
      if (onOrderUpdated) onOrderUpdated(updated);
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
      title={`${t('edit_order_title')}${order?.id || ''}`}
      description={t('edit_order_desc')}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-slate-200">
        {/* Customer Readonly Card */}
        {order?.customer && (
          <div className="p-3.5 bg-[#030e1a] rounded-2xl border border-cyan-900/40 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-slate-950 flex items-center justify-center font-black">
                {order.customer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-white text-sm">{order.customer.name}</p>
                <p className="text-[11px] text-cyan-300" dir="ltr">{order.customer.phone}</p>
              </div>
            </div>
            {order.customer.address && (
              <div className="text-right rtl:text-left text-slate-400 max-w-xs truncate">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  {order.customer.address}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Status & Driver Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-[#041222] rounded-2xl border border-cyan-900/40">
          {/* Status Selection */}
          <div>
            <label className="block text-xs font-bold text-cyan-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{t('order_status_label')}</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setStatus('preparing')}
                className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all border ${
                  status === 'preparing'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-slate-900/80 text-amber-300 border-amber-500/20 hover:bg-amber-950/40'
                }`}
              >
                {language === 'ar' ? 'تجهيز وطهي' : 'Preparing'}
              </button>
              <button
                type="button"
                onClick={() => setStatus('out_for_delivery')}
                className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all border ${
                  status === 'out_for_delivery'
                    ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md'
                    : 'bg-slate-900/80 text-sky-300 border-sky-500/20 hover:bg-sky-950/40'
                }`}
              >
                {language === 'ar' ? 'في الطريق' : 'Out for Delivery'}
              </button>
              <button
                type="button"
                onClick={() => setStatus('delivered')}
                className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all border ${
                  status === 'delivered'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                    : 'bg-slate-900/80 text-emerald-300 border-emerald-500/20 hover:bg-emerald-950/40'
                }`}
              >
                {language === 'ar' ? 'تم التسليم' : 'Delivered'}
              </button>
            </div>
          </div>

          {/* Courier Selection */}
          <div>
            <label className="block text-xs font-bold text-cyan-300 mb-1.5 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'الكابتن المسؤول' : 'Assigned Courier'}</span>
            </label>
            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              className="w-full text-xs bg-[#020b14] border border-slate-700/80 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyan-400"
            >
              <option value="">{language === 'ar' ? 'بدون كابتن (غير مسند)' : 'Unassigned'}</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.phone})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Seafood Menu Presets */}
        <div className="p-3.5 bg-[#031120] rounded-2xl border border-cyan-900/50 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Fish className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-cyan-300">
                {t('quick_menu_title')}
              </span>
            </div>
          </div>

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

          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
              {language === 'ar' ? 'طرق التسوية السريعة:' : 'Quick Cooking Styles:'}
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

        {/* Order Items List */}
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
            className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold border-0"
          >
            {t('save_changes')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
