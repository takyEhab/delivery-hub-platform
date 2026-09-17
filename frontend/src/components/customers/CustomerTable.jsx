import React from 'react';
import { formatDate } from '../../utils/formatters';
import { Phone, MapPin, Edit, FileText, User } from 'lucide-react';
import { Button } from '../ui/Button';

export function CustomerTable({ customers, onEdit, isOwner }) {
  if (!customers || customers.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-white rounded-xl border border-slate-200/80">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
          <User className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">No customers found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          No customer records match your query or none have been registered yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-card overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-medium text-xs uppercase tracking-wider">
              <th className="py-3.5 px-5">Customer</th>
              <th className="py-3.5 px-4">Contact Phone</th>
              <th className="py-3.5 px-4">Address</th>
              <th className="py-3.5 px-4">Notes</th>
              <th className="py-3.5 px-4">Registered</th>
              {isOwner && <th className="py-3.5 px-5 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {customers.map((c) => (
              <tr
                key={c.id}
                className="hover:bg-slate-50/75 transition-colors group"
              >
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-semibold text-xs border border-emerald-100 shrink-0">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {c.name}
                      </p>
                      <p className="text-[11px] text-slate-400">ID #{c.id}</p>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <a
                    href={`tel:${c.phone}`}
                    className="inline-flex items-center gap-1.5 text-slate-700 hover:text-emerald-600 transition-colors font-medium text-xs"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {c.phone}
                  </a>
                </td>

                <td className="py-3.5 px-4 max-w-xs">
                  {c.address ? (
                    <div className="flex items-start gap-1.5 text-xs text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="truncate">{c.address}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-xs italic">No address specified</span>
                  )}
                </td>

                <td className="py-3.5 px-4 max-w-xs">
                  {c.notes ? (
                    <span
                      title={c.notes}
                      className="inline-flex items-center gap-1 text-xs text-slate-500 italic truncate"
                    >
                      <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{c.notes}</span>
                    </span>
                  ) : (
                    <span className="text-slate-300 text-xs">—</span>
                  )}
                </td>

                <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                  {formatDate(c.created_at)}
                </td>

                {isOwner && (
                  <td className="py-3.5 px-5 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Edit}
                      onClick={() => onEdit(c)}
                      className="text-slate-500 hover:text-emerald-700 hover:bg-emerald-50"
                    >
                      Edit
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden divide-y divide-slate-100">
        {customers.map((c) => (
          <div key={c.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-semibold text-xs border border-emerald-100 shrink-0">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">{c.name}</h4>
                  <p className="text-[11px] text-slate-400">ID #{c.id}</p>
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
                  Edit
                </Button>
              )}
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <a
                  href={`tel:${c.phone}`}
                  className="font-medium text-emerald-600 hover:underline"
                >
                  {c.phone}
                </a>
              </div>
              {c.address ? (
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{c.address}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-400 italic text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  <span>No address specified</span>
                </div>
              )}
              {c.notes && (
                <div className="flex items-start gap-2 text-slate-500 italic pt-1 border-t border-slate-200/50">
                  <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{c.notes}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
