import React from 'react';
import { formatDate } from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Phone, Mail, Edit, Trash2, Truck } from 'lucide-react';

export function DriverTable({ drivers, onEdit, onDelete }) {
  if (!drivers || drivers.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-white rounded-xl border border-slate-200/80">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
          <Truck className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">No drivers in roster</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          Add delivery drivers to assign orders and enable status updates.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-card overflow-hidden">
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-medium text-xs uppercase tracking-wider">
              <th className="py-3.5 px-5">Driver Name</th>
              <th className="py-3.5 px-4">Contact Phone</th>
              <th className="py-3.5 px-4">Email</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Added On</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {drivers.map((driver) => (
              <tr
                key={driver.id}
                className="hover:bg-slate-50/75 transition-colors group"
              >
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-semibold text-xs border border-sky-100 shrink-0">
                      {driver.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 group-hover:text-sky-700 transition-colors">
                        {driver.name}
                      </p>
                      <p className="text-[11px] text-slate-400">Driver ID #{driver.id}</p>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <a
                    href={`tel:${driver.phone}`}
                    className="inline-flex items-center gap-1.5 text-slate-700 hover:text-sky-600 font-medium text-xs transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {driver.phone}
                  </a>
                </td>

                <td className="py-3.5 px-4">
                  {driver.email ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {driver.email}
                    </span>
                  ) : (
                    <span className="text-slate-300 text-xs">—</span>
                  )}
                </td>

                <td className="py-3.5 px-4">
                  <Badge
                    variant={driver.is_active ? 'success' : 'neutral'}
                    size="sm"
                    dot={driver.is_active}
                  >
                    {driver.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>

                <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                  {formatDate(driver.created_at)}
                </td>

                <td className="py-3.5 px-5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Edit}
                      onClick={() => onEdit(driver)}
                      className="text-slate-500 hover:text-sky-700 hover:bg-sky-50"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => onDelete(driver)}
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-slate-100">
        {drivers.map((driver) => (
          <div key={driver.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-semibold text-xs border border-sky-100 shrink-0">
                  {driver.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">
                    {driver.name}
                  </h4>
                  <p className="text-[11px] text-slate-400">ID #{driver.id}</p>
                </div>
              </div>
              <Badge
                variant={driver.is_active ? 'success' : 'neutral'}
                size="sm"
                dot={driver.is_active}
              >
                {driver.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <a
                  href={`tel:${driver.phone}`}
                  className="font-medium text-sky-600 hover:underline"
                >
                  {driver.phone}
                </a>
              </div>
              {driver.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{driver.email}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                icon={Edit}
                onClick={() => onEdit(driver)}
                className="text-xs py-1 px-3"
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={Trash2}
                onClick={() => onDelete(driver)}
                className="text-xs py-1 px-3 text-rose-600 hover:bg-rose-50 border-rose-200"
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
