import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOrder, updateOrder } from '../api/orders';
import { listDrivers } from '../api/drivers';
import { getErrorMessage } from '../api/client';
import { useToast } from '../hooks/useToast';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency } from '../utils/formatters';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  ArrowLeft,
  ArrowRight,
  Fish,
  Flame,
  Plus,
  Trash2,
  Truck,
  MapPin,
  Clock,
  ShoppingBag,
  Save,
  AlertCircle,
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

export function EditOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language, isRTL } = useLanguage();
  const { success, error: toastError } = useToast();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('preparing');
  const [driverId, setDriverId] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [activeCategoryTab, setActiveCategoryTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setIsLoading(true);
    Promise.all([getOrder(id), listDrivers()])
      .then(([orderData, driversData]) => {
        setOrder(orderData);
        setDrivers(driversData || []);

        const parsedItems = Array.isArray(orderData.items)
          ? orderData.items.map((it) => ({
              name: it.name || it.description || '',
              quantity: it.quantity || 1,
              price: it.price !== undefined ? it.price : '',
            }))
          : typeof orderData.items === 'string'
          ? [{ name: orderData.items, quantity: 1, price: '' }]
          : [{ name: '', quantity: 1, price: '' }];

        setItems(parsedItems.length > 0 ? parsedItems : [{ name: '', quantity: 1, price: '' }]);
        setStatus(orderData.status || 'preparing');
        setDriverId(orderData.assigned_driver_id ? String(orderData.assigned_driver_id) : '');
      })
      .catch((err) => toastError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, [id, toastError]);

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

      const updated = await updateOrder(id, payload);
      const title = language === 'ar' ? 'تم حفظ التعديلات' : 'Order Updated';
      const msg = language === 'ar'
        ? `تم تحديث طلب الأسماك #${id} بنجاح!`
        : `Order #${id} has been updated successfully!`;

      success(msg, title);
      navigate(`/orders/${id}`);
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-cyan-300 mt-3 font-semibold">
          {language === 'ar' ? 'جاري تحميل بيانات الطلب...' : 'Loading order details...'}
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16 bg-[#05172b]/90 rounded-2xl border border-cyan-900/40 shadow-xl max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-cyan-400 mx-auto mb-2" />
        <h3 className="text-base font-bold text-white">{language === 'ar' ? 'الطلب غير موجود' : 'Order Not Found'}</h3>
        <Link to="/orders" className="inline-block mt-4">
          <Button variant="outline" size="sm" icon={isRTL ? ArrowRight : ArrowLeft}>
            {language === 'ar' ? 'العودة للطلبات' : 'Back to Orders'}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/orders/${id}`)}
            className="p-2.5 rounded-xl bg-slate-800/80 text-cyan-400 hover:text-white hover:bg-cyan-950/60 transition-colors border border-cyan-900/40"
            title="Go back"
          >
            {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </button>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Fish className="w-6 h-6 text-cyan-400" />
              <span>{t('edit_order_title')}{order.id}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {t('edit_order_desc')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/orders/${id}`)}
            className="border-slate-700 text-slate-300"
          >
            {t('cancel')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Save}
            isLoading={isSubmitting}
            onClick={handleSubmit}
            className="bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold border-0 shadow-md shadow-cyan-500/20"
          >
            {t('save_changes')}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information Preview */}
        {order.customer && (
          <Card className="p-4 bg-[#030e1a]">
            <div className="flex items-center justify-between flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-slate-950 flex items-center justify-center font-black text-sm">
                  {order.customer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{order.customer.name}</p>
                  <p className="text-cyan-300" dir="ltr">{order.customer.phone}</p>
                </div>
              </div>
              {order.customer.address && (
                <div className="text-right rtl:text-left text-slate-400 max-w-sm truncate">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    {order.customer.address}
                  </span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Status & Driver Card */}
        <Card className="p-5">
          <CardHeader
            title={language === 'ar' ? 'حالة الطلب وتعيين الكابتن' : 'Order Status & Courier Assignment'}
            description={language === 'ar' ? 'تحديث مرحلة الطلب أو تغيير الكابتن المسؤول' : 'Update delivery progression and courier'}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {/* Status Selection */}
            <div>
              <label className="block text-xs font-bold text-cyan-300 mb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>{t('order_status_label')}</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('preparing')}
                  className={`py-2.5 px-1 text-center rounded-xl text-xs font-bold transition-all border ${
                    status === 'preparing'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-slate-900/80 text-amber-300 border-amber-500/20 hover:bg-amber-950/40'
                  }`}
                >
                  {language === 'ar' ? 'قيد التجهيز' : 'Preparing'}
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('out_for_delivery')}
                  className={`py-2.5 px-1 text-center rounded-xl text-xs font-bold transition-all border ${
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
                  className={`py-2.5 px-1 text-center rounded-xl text-xs font-bold transition-all border ${
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
              <label className="block text-xs font-bold text-cyan-300 mb-2 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-cyan-400" />
                <span>{language === 'ar' ? 'الكابتن المسؤول' : 'Assigned Courier'}</span>
              </label>
              <select
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                className="w-full text-xs bg-[#020b14] border border-slate-700/80 text-white rounded-xl px-3.5 py-3 focus:outline-none focus:border-cyan-400"
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
        </Card>

        {/* Quick Seafood Menu Presets */}
        <Card className="p-5">
          <CardHeader
            title={t('quick_menu_title')}
            description={language === 'ar' ? 'انقر على أي صنف لإضافته مباشرة للطلب الحالي' : 'Click any seafood item to add to the order'}
          />
          <div className="space-y-3 mt-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {SEAFOOD_PRESETS.map((cat, idx) => (
                <button
                  key={cat.category}
                  type="button"
                  onClick={() => setActiveCategoryTab(idx)}
                  className={`px-3.5 py-2 rounded-xl font-bold shrink-0 transition-all ${
                    activeCategoryTab === idx
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {language === 'ar' ? cat.categoryNameAr : cat.categoryNameEn}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SEAFOOD_PRESETS[activeCategoryTab].items.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddPreset(preset)}
                  className="flex items-center justify-between gap-1 p-2.5 rounded-xl bg-[#030e1a] border border-cyan-900/40 hover:border-cyan-400 hover:bg-cyan-950/60 text-xs text-slate-200 transition-all text-right rtl:text-right ltr:text-left group"
                >
                  <span className="font-bold truncate text-[11px] group-hover:text-cyan-300">
                    {language === 'ar' ? preset.nameAr : preset.nameEn}
                  </span>
                  <span className="text-[10px] font-bold text-amber-400 shrink-0 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                    {preset.price} {t('currency')}
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-cyan-950/80">
              <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                {language === 'ar' ? 'طرق التسوية السريعة:' : 'Quick Cooking Styles:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COOKING_STYLES.map((style, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAppendCookingStyle(style)}
                    className="px-2.5 py-1 rounded-lg bg-orange-950/30 border border-orange-500/30 hover:bg-orange-900/50 text-[11px] font-semibold text-orange-300 transition-all"
                  >
                    {language === 'ar' ? style.ar : style.en}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Order Items Editor */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                {t('order_items')}
              </h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={addItemRow}
              className="text-xs py-1.5 px-3 bg-cyan-950/40 border-cyan-700/60 text-cyan-300 hover:bg-cyan-900/50"
            >
              {t('add_another_item')}
            </Button>
          </div>

          <div className="space-y-2.5">
            {items.map((it, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#030e1a] border border-cyan-900/40"
              >
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder={t('item_placeholder')}
                    value={it.name}
                    onChange={(e) => updateItemRow(idx, 'name', e.target.value)}
                    className="w-full text-xs bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="w-24">
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
            <p className="text-xs text-rose-400 mt-2">{errors.items}</p>
          )}

          {calculateTotal() > 0 && (
            <div className="flex justify-end items-center gap-3 pt-4 mt-4 border-t border-cyan-950/80 text-xs">
              <span className="text-slate-400 font-semibold">{t('calculated_total')}:</span>
              <span className="font-black text-cyan-400 text-lg">
                {formatCurrency(calculateTotal(), language)}
              </span>
            </div>
          )}
        </Card>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <Button
            variant="outline"
            onClick={() => navigate(`/orders/${id}`)}
            disabled={isSubmitting}
            className="border-slate-700 text-slate-300"
          >
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            icon={Save}
            className="bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold border-0 shadow-lg shadow-cyan-500/25"
          >
            {t('save_changes')}
          </Button>
        </div>
      </form>
    </div>
  );
}
