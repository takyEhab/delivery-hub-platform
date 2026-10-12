import React from 'react';
import { formatDate } from '../../utils/formatters';
import { Phone, MapPin, Edit, FileText, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { useLanguage } from '../../context/LanguageContext';

export function CustomerTable({ customers, onEdit, isOwner }) {
  const { t, language } = useLanguage();

  if (!customers || customers.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-[#05172b]/90 rounded-2xl border border-cyan-900/40 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center mx-auto text-cyan-400 mb-3 shadow-inner">
          <User className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-white">{t('no_customers_found')}</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
          {language === 'ar' ? 'لا يوجد عملاء مسجلين يطابقون عبارة البحث.' : 'No customer records match your query or none have been registered yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#05172b]/90 rounded-2xl border border-cyan-900/40 shadow-xl overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-right rtl:text-right ltr:text-left border-collapse text-sm">
          <thead>
            <tr className="bg-[#030f1c] border-b border-cyan-950/80 text-cyan-400 font-bold text-xs uppercase tracking-wider">
              <th className="py-4 px-5">{t('customer')}</th>
              <th className="py-4 px-4">{t('phone')}</th>
              <th className="py-4 px-4">{t('address')}</th>
              <th className="py-4 px-4">{t('notes')}</th>
              <th className="py-4 px-4">{language === 'ar' ? 'تاريخ التسجيل' : 'Registered'}</th>
              {isOwner && <th className="py-4 px-5 text-left rtl:text-left ltr:text-right">{t('actions')}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-cyan-950/60 text-slate-200">
            {customers.map((c) => (
              <tr
                key={c.id}
                className="hover:bg-cyan-950/30 transition-colors group"
              >
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white group-hover:text-cyan-400 transition-colors text-xs">
                        {c.name}
                      </p>
                      <p className="text-[11px] text-cyan-400/80 font-mono">ID #{c.id}</p>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <a
                    href={`tel:${c.phone}`}
                    className="inline-flex items-center gap-1.5 text-slate-300 hover:text-cyan-300 transition-colors font-medium text-xs"
                    dir="ltr"
                  >
                    <Phone className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{c.phone}</span>
                  </a>
                </td>

                <td className="py-3.5 px-4 max-w-xs">
                  <div className="flex items-start gap-1.5 text-slate-300 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400/80 shrink-0 mt-0.5" />
                    <span className="truncate">{c.address || '—'}</span>
                  </div>
                </td>

                <td className="py-3.5 px-4 max-w-xs text-slate-400 text-xs">
                  {c.notes ? (
                    <span className="italic truncate block" title={c.notes}>
                      "{c.notes}"
                    </span>
                  ) : (
                    '—'
                  )}
                </td>

                <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">
                  {formatDate(c.created_at, language)}
                </td>

                {isOwner && (
                  <td className="py-3.5 px-5 text-left rtl:text-left ltr:text-right whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Edit}
                      onClick={() => onEdit(c)}
                      className="text-xs py-1 px-3 border-cyan-800/60 text-cyan-300 hover:bg-cyan-950/40"
                    >
                      {language === 'ar' ? 'تعديل' : 'Edit'}
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-cyan-950/60">
        {customers.map((c) => (
          <div key={c.id} className="p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-slate-950 flex items-center justify-center font-black text-xs">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{c.name}</p>
                  <p className="text-[11px] text-cyan-400 font-mono">ID #{c.id}</p>
                </div>
              </div>
              {isOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={Edit}
                  onClick={() => onEdit(c)}
                  className="text-xs py-1 px-2.5 border-cyan-800/60 text-cyan-300"
                >
                  {language === 'ar' ? 'تعديل' : 'Edit'}
                </Button>
              )}
            </div>

            <div className="space-y-1 text-xs text-slate-300">
              <a
                href={`tel:${c.phone}`}
                className="flex items-center gap-1.5 text-cyan-300"
                dir="ltr"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{c.phone}</span>
              </a>
              {c.address && (
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{c.address}</span>
                </div>
              )}
              {c.notes && (
                <div className="flex items-start gap-1.5 text-slate-400 italic">
                  <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>"{c.notes}"</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
