import React from 'react';
import { formatDate } from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Phone, Mail, Edit, Trash2, Truck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function DriverTable({ drivers, onEdit, onDelete }) {
  const { t, language } = useLanguage();

  if (!drivers || drivers.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-[#05172b]/90 rounded-2xl border border-cyan-900/40 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center mx-auto text-cyan-400 mb-3 shadow-inner">
          <Truck className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-white">{language === 'ar' ? 'لا يوجد كباتن مسجلين' : 'No drivers in roster'}</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
          {language === 'ar' ? 'أضف كباتن توصيل للمتجر لتوزيع طلبات الأسماك عليهم.' : 'Add delivery couriers to assign orders and enable status updates.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#05172b]/90 rounded-2xl border border-cyan-900/40 shadow-xl overflow-hidden">
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-right rtl:text-right ltr:text-left border-collapse text-sm">
          <thead>
            <tr className="bg-[#030f1c] border-b border-cyan-950/80 text-cyan-400 font-bold text-xs uppercase tracking-wider">
              <th className="py-4 px-5">{language === 'ar' ? 'الكابتن' : 'Courier Name'}</th>
              <th className="py-4 px-4">{t('phone')}</th>
              <th className="py-4 px-4">{t('status')}</th>
              <th className="py-4 px-4">{language === 'ar' ? 'تاريخ الإضافة' : 'Added On'}</th>
              <th className="py-4 px-5 text-left rtl:text-left ltr:text-right">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyan-950/60 text-slate-200">
            {drivers.map((driver) => (
              <tr
                key={driver.id}
                className="hover:bg-cyan-950/30 transition-colors group"
              >
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                      {driver.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white group-hover:text-cyan-400 transition-colors text-xs">
                        {driver.name}
                      </p>
                      <p className="text-[11px] text-cyan-400/80 font-mono">ID #{driver.id}</p>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <a
                    href={`tel:${driver.phone}`}
                    className="inline-flex items-center gap-1.5 text-slate-300 hover:text-cyan-300 transition-colors font-medium text-xs"
                    dir="ltr"
                  >
                    <Phone className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{driver.phone}</span>
                  </a>
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap">
                  <Badge
                    variant={driver.is_active ? 'success' : 'neutral'}
                    size="sm"
                    dot={driver.is_active}
                  >
                    {driver.is_active ? t('driver_status_active') : t('driver_status_inactive')}
                  </Badge>
                </td>

                <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">
                  {formatDate(driver.created_at, language)}
                </td>

                <td className="py-3.5 px-5 text-left rtl:text-left ltr:text-right whitespace-nowrap">
                  <div className="flex items-center justify-end rtl:justify-start gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Edit}
                      onClick={() => onEdit(driver)}
                      className="text-xs py-1 px-3 border-cyan-800/60 text-cyan-300 hover:bg-cyan-950/40"
                    >
                      {language === 'ar' ? 'تعديل' : 'Edit'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => onDelete(driver)}
                      className="text-xs py-1 px-2.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-500/30"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-cyan-950/60">
        {drivers.map((driver) => (
          <div key={driver.id} className="p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 text-white flex items-center justify-center font-black text-xs">
                  {driver.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{driver.name}</p>
                  <p className="text-[11px] text-cyan-400 font-mono">ID #{driver.id}</p>
                </div>
              </div>
              <Badge
                variant={driver.is_active ? 'success' : 'neutral'}
                size="sm"
                dot={driver.is_active}
              >
                {driver.is_active ? t('driver_status_active') : t('driver_status_inactive')}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
              <a
                href={`tel:${driver.phone}`}
                className="flex items-center gap-1.5 text-cyan-300"
                dir="ltr"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{driver.phone}</span>
              </a>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(driver)}
                  className="text-xs py-1 px-2.5 border-cyan-800/60 text-cyan-300"
                >
                  {language === 'ar' ? 'تعديل' : 'Edit'}
                </Button>
                <button
                  type="button"
                  onClick={() => onDelete(driver)}
                  className="p-1.5 text-rose-400 hover:text-rose-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
