import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { listCustomers, searchCustomers } from '../../api/customers';
import { createOrder } from '../../api/orders';
import { getErrorMessage } from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { useDebounce } from '../../hooks/useDebounce';
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
} from 'lucide-react';

export function CreateOrderModal({ isOpen, onClose, onOrderCreated }) {
  const [customerMode, setCustomerMode] = useState('existing'); // 'existing' | 'new'

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

  const calculateTotal = () => {
    return items.reduce((sum, it) => {
      const q = parseFloat(it.quantity) || 0;
      const p = parseFloat(it.price) || 0;
      return sum + q * p;
    }, 0);
  };

  const handleInlineContactPick = async () => {
    if (!isContactPickerSupported()) {
      toastError('Contact Picker is available on mobile devices (e.g. Chrome on Android).');
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
        success(`Autofilled ${contact.name}!`, 'Contact Selected');
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
        errs.customer = 'Please select a customer for this order';
      }
    } else {
      if (!inlineCustomer.name.trim()) errs.name = 'Customer name is required';
      if (!inlineCustomer.phone.trim()) errs.phone = 'Phone number is required';
      // Address is optional per user request
    }

    // Items validation
    const validItems = items.filter((it) => it.name.trim().length > 0);
    if (validItems.length === 0) {
      errs.items = 'Please specify at least one item description/name';
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
      success(`Order #${order.id} has been created successfully!`, 'Order Created');
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
      title="Create New Delivery Order"
      description="Select an existing customer or enter a new customer and specify order items."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selector Mode Tabs */}
        <div>
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl mb-3">
            <button
              type="button"
              onClick={() => setCustomerMode('existing')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                customerMode === 'existing'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Existing Customer
            </button>
            <button
              type="button"
              onClick={() => setCustomerMode('new')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                customerMode === 'new'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              New / Walk-in Customer
            </button>
          </div>

          {/* Existing Customer Selector */}
          {customerMode === 'existing' ? (
            <div className="space-y-2">
              {selectedCustomer ? (
                <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {selectedCustomer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 text-sm">
                          {selectedCustomer.name}
                        </p>
                        <span className="text-[11px] text-slate-400">
                          #{selectedCustomer.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {selectedCustomer.phone}
                      </p>
                      <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {selectedCustomer.address}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCustomer(null)}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div>
                  <Input
                    placeholder="Search customer by name or phone..."
                    icon={Search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    helperText={
                      isSearching
                        ? 'Searching customers...'
                        : 'Type customer name or phone number to find existing profile'
                    }
                  />

                  {/* Customer search results list */}
                  <div className="mt-2 max-h-40 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
                    {searchResults.length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-400">
                        {isSearching
                          ? 'Searching...'
                          : 'No matching customers found. Switch to "New Customer" to create one.'}
                      </div>
                    ) : (
                      searchResults.map((cust) => (
                        <button
                          key={cust.id}
                          type="button"
                          onClick={() => setSelectedCustomer(cust)}
                          className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between transition-colors"
                        >
                          <div>
                            <p className="text-xs font-semibold text-slate-800">
                              {cust.name}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate max-w-sm">
                              {cust.phone} • {cust.address}
                            </p>
                          </div>
                          <span className="text-[11px] font-medium text-emerald-600">
                            Select
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
              {errors.customer && (
                <p className="text-xs text-rose-600">{errors.customer}</p>
              )}
            </div>
          ) : (
            /* New Customer Inline Form */
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              {/* Autofill from contact button */}
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-950">
                    Autofill from device contacts
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleInlineContactPick}
                  className="bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs py-1 px-2.5"
                >
                  Choose Contact
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Customer Name"
                  placeholder="e.g. David Miller"
                  required
                  value={inlineCustomer.name}
                  onChange={(e) =>
                    setInlineCustomer({ ...inlineCustomer, name: e.target.value })
                  }
                  error={errors.name}
                />
                <Input
                  label="Phone Number"
                  placeholder="e.g. 0501122334"
                  required
                  value={inlineCustomer.phone}
                  onChange={(e) =>
                    setInlineCustomer({ ...inlineCustomer, phone: e.target.value })
                  }
                  error={errors.phone}
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Delivery Address (Optional)"
                    placeholder="Street, building, floor or landmark (optional)..."
                    value={inlineCustomer.address}
                    onChange={(e) =>
                      setInlineCustomer({ ...inlineCustomer, address: e.target.value })
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Delivery Notes (Optional)"
                    placeholder="e.g. Ring intercom #4"
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

        {/* Order Items Builder */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                Order Items
              </h4>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={addItemRow}
              className="text-xs py-1 px-2.5"
            >
              Add Item
            </Button>
          </div>

          <div className="space-y-2">
            {items.map((it, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/70 border border-slate-200"
              >
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Item description (e.g. Cheeseburger Combo)"
                    value={it.name}
                    onChange={(e) => updateItemRow(idx, 'name', e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="w-20">
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={it.quantity}
                    onChange={(e) => updateItemRow(idx, 'quantity', e.target.value)}
                    className="w-full text-xs text-center bg-white border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Price ($)"
                    value={it.price}
                    onChange={(e) => updateItemRow(idx, 'price', e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeItemRow(idx)}
                  disabled={items.length <= 1}
                  className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {errors.items && (
            <p className="text-xs text-rose-600">{errors.items}</p>
          )}

          {/* Subtotal calculation */}
          {calculateTotal() > 0 && (
            <div className="flex justify-end items-center gap-3 pt-2 text-xs">
              <span className="text-slate-500">Estimated Total:</span>
              <span className="font-bold text-slate-900 text-sm">
                {formatCurrency(calculateTotal())}
              </span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            icon={Plus}
          >
            Create Order
          </Button>
        </div>
      </form>
    </Modal>
  );
}
