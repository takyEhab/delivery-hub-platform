import React from 'react';
import { formatDate } from '../../utils/formatters';
import { Phone, MapPin, Edit, FileText, User, Navigation } from 'lucide-react';
import { Button } from '../ui/Button';
import { useLanguage } from '../../context/LanguageContext';
import { buildGoogleMapsUrl } from '../../utils/location';

export function CustomerTable({ customers, onEdit, isOwner }) {
  const { t, language } = useLanguage();

  if (!customers || customers.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-[#0F1622] rounded-xl border border-slate-800/80 shadow-card">
        <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-400 mb-3">
          <User className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-white">{t('no_customers_found')}</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
          {language === 'ar' ? 'لا يوجد عملاء مسجلين يطابقون عبارة البحث.' : 'No customer records match your query or none have been registered yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#0F1622] rounded-xl border border-slate-800/80 shadow-card overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-right rtl:text-right ltr:text-left border-collapse text-sm">
          <thead>
            <tr className="bg-[#0B1019] border-b border-slate-800 text-slate-400 font-semibold text-xs uppercase tracking-wider">
              <th className="py-3.5 px-5">{t('customer')}</th>
              <th className="py-3.5 px-4">{t('phone')}</th>
              <th className="py-3.5 px-4">{t('address')}</th>
              <th className="py-3.5 px-4">{t('notes')}</th>
              <th className="py-3.5 px-4">{language === 'ar' ? 'تاريخ التسجيل' : 'Registered'}</th>
              {isOwner && <th className="py-3.5 px-5 text-left rtl:text-left ltr:text-right">{t('actions')}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-200">
            {customers.map((c) => (
              <tr
                key={c.id}
                className="hover:bg-slate-800/20 transition-colors group"
              >
                <td className="py-3 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white group-hover:text-blue-400 transition-colors text-xs">
                        {c.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">ID #{c.id}</p>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4">
                  <a
                    href={`tel:${c.phone}`}
                    className="inline-flex items-center gap-1.5 text-slate-300 hover:text-blue-400 transition-colors font-mono text-xs"
                    dir="ltr"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{c.phone}</span>
                  </a>
                </td>

                <td className="py-3 px-4 max-w-xs">
                  {(() => {
                    const mapsUrl = buildGoogleMapsUrl(c.location_url, c.address);
                    return (
                      <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate text-slate-400">{c.address || (mapsUrl ? (language === 'ar' ? 'موقع محدد على الخريطة' : 'Pinned Location') : '—')}</span>
                        {mapsUrl && (
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded text-blue-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                            title={language === 'ar' ? 'عرض على خرائط Google' : 'Open in Google Maps'}
                          >
                            <Navigation className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    );
                  })()}
                </td>

                <td className="py-3 px-4 max-w-xs text-slate-400 text-xs">
                  {c.notes ? (
                    <span className="italic truncate block" title={c.notes}>
                      "{c.notes}"
                    </span>
                  ) : (
                    '—'
                  )}
                </td>

                <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap font-mono">
                  {formatDate(c.created_at, language)}
                </td>

                {isOwner && (
                  <td className="py-3 px-5 text-left rtl:text-left ltr:text-right whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Edit}
                      onClick={() => onEdit(c)}
                      className="text-xs py-1 px-3"
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
      <div className="md:hidden divide-y divide-slate-800/80">
        {customers.map((c) => (
          <div key={c.id} className="p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{c.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">ID #{c.id}</p>
                </div>
              </div>
              {isOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={Edit}
                  onClick={() => onEdit(c)}
                  className="text-xs py-1 px-2.5"
                >
                  {language === 'ar' ? 'تعديل' : 'Edit'}
                </Button>
              )}
            </div>

            <div className="space-y-1 text-xs text-slate-300">
              <a
                href={`tel:${c.phone}`}
                className="flex items-center gap-1.5 text-slate-300 hover:text-blue-400 font-mono"
                dir="ltr"
              >
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{c.phone}</span>
              </a>
              {(() => {
                const mapsUrl = buildGoogleMapsUrl(c.location_url, c.address);
                if (!c.address && !mapsUrl) return null;
                return (
                  <div className="flex items-center justify-between gap-2 text-slate-300">
                    <div className="flex items-start gap-1.5 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span className="truncate text-slate-400">{c.address || (language === 'ar' ? 'موقع محدد على الخريطة' : 'Pinned Location')}</span>
                    </div>
                    {mapsUrl && (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 shrink-0"
                      >
                        <Navigation className="w-3 h-3 text-blue-400" />
                        <span>{language === 'ar' ? 'الخريطة' : 'Maps'}</span>
                      </a>
                    )}
                  </div>
                );
              })()}
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
