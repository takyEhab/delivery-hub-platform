import React from 'react';
import { formatDate } from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Phone, Edit, Trash2, Truck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function DriverTable({ drivers, onEdit, onDelete }) {
  const { t, language } = useLanguage();

  if (!drivers || drivers.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-[#0F1622] rounded-xl border border-slate-800/80 shadow-card">
        <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-400 mb-3">
          <Truck className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-white">{language === 'ar' ? 'لا يوجد كباتن مسجلين' : 'No drivers in roster'}</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
          {language === 'ar' ? 'أضف كباتن توصيل للمتجر لتوزيع طلبات الأسماك عليهم.' : 'Add delivery couriers to assign orders and enable status updates.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#0F1622] rounded-xl border border-slate-800/80 shadow-card overflow-hidden">
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-right rtl:text-right ltr:text-left border-collapse text-sm">
          <thead>
            <tr className="bg-[#0B1019] border-b border-slate-800 text-slate-400 font-semibold text-xs uppercase tracking-wider">
              <th className="py-3.5 px-5">{language === 'ar' ? 'الكابتن' : 'Courier Name'}</th>
              <th className="py-3.5 px-4">{t('phone')}</th>
              <th className="py-3.5 px-4">{t('status')}</th>
              <th className="py-3.5 px-4">{language === 'ar' ? 'تاريخ الإضافة' : 'Added On'}</th>
              <th className="py-3.5 px-5 text-left rtl:text-left ltr:text-right">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-200">
            {drivers.map((driver) => (
              <tr
                key={driver.id}
                className="hover:bg-slate-800/20 transition-colors group"
              >
                <td className="py-3 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {driver.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white group-hover:text-blue-400 transition-colors text-xs">
                        {driver.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">ID #{driver.id}</p>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4">
                  <a
                    href={`tel:${driver.phone}`}
                    className="inline-flex items-center gap-1.5 text-slate-300 hover:text-blue-400 transition-colors font-mono text-xs"
                    dir="ltr"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{driver.phone}</span>
                  </a>
                </td>

                <td className="py-3 px-4 whitespace-nowrap">
                  <Badge
                    variant={driver.is_active ? 'success' : 'neutral'}
                    size="sm"
                  >
                    {driver.is_active ? t('driver_status_active') : t('driver_status_inactive')}
                  </Badge>
                </td>

                <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap font-mono">
                  {formatDate(driver.created_at, language)}
                </td>

                <td className="py-3 px-5 text-left rtl:text-left ltr:text-right whitespace-nowrap">
                  <div className="flex items-center justify-end rtl:justify-start gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Edit}
                      onClick={() => onEdit(driver)}
                      className="text-xs py-1 px-3"
                    >
                      {language === 'ar' ? 'تعديل' : 'Edit'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => onDelete(driver)}
                      className="text-xs py-1 px-2.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-slate-800/80">
        {drivers.map((driver) => (
          <div key={driver.id} className="p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                  {driver.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{driver.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">ID #{driver.id}</p>
                </div>
              </div>
              <Badge
                variant={driver.is_active ? 'success' : 'neutral'}
                size="sm"
              >
                {driver.is_active ? t('driver_status_active') : t('driver_status_inactive')}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
              <a
                href={`tel:${driver.phone}`}
                className="flex items-center gap-1.5 text-slate-300 hover:text-blue-400 font-mono"
                dir="ltr"
              >
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{driver.phone}</span>
              </a>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Edit}
                  onClick={() => onEdit(driver)}
                  className="text-xs py-1 px-2.5"
                >
                  {language === 'ar' ? 'تعديل' : 'Edit'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  onClick={() => onDelete(driver)}
                  className="text-xs py-1 px-2 text-rose-400 hover:bg-rose-950/40"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
