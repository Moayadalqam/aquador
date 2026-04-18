'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import { focusRingInput } from '@/lib/ui/focus';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  productType: string;
}

const EMPTY_ITEM: OrderItem = { name: '', quantity: 1, price: 0, productType: 'perfume' };

export default function NewManualOrderPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<OrderItem[]>([{ ...EMPTY_ITEM }]);

  const [shippingName, setShippingName] = useState('');
  const [shippingLine1, setShippingLine1] = useState('');
  const [shippingLine2, setShippingLine2] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingPostalCode, setShippingPostalCode] = useState('');
  const [shippingCountry, setShippingCountry] = useState('CY');

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addItem = () => setItems(prev => [...prev, { ...EMPTY_ITEM }]);

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const validItems = items.filter(i => i.name.trim() && i.price > 0);
    if (!customerEmail.trim() || validItems.length === 0) {
      setError('Customer email and at least one item with a price are required.');
      setSubmitting(false);
      return;
    }

    const hasShipping = shippingLine1.trim();

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: customerEmail.trim(),
          customerName: customerName.trim() || undefined,
          customerPhone: customerPhone.trim() || undefined,
          items: validItems,
          total,
          notes: notes.trim() || undefined,
          shippingAddress: hasShipping
            ? {
                name: shippingName.trim() || customerName.trim() || undefined,
                address: {
                  line1: shippingLine1.trim(),
                  line2: shippingLine2.trim() || undefined,
                  city: shippingCity.trim() || undefined,
                  postal_code: shippingPostalCode.trim() || undefined,
                  country: shippingCountry.trim() || undefined,
                },
              }
            : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create order');
      }

      router.push('/admin/orders');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    `w-full px-3 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm placeholder:text-gray-500 ${focusRingInput}`;
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5';

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/orders"
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Add Manual Order</h1>
          <p className="text-gray-400 mt-1">Create an order for phone, in-person, or imported sales</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer */}
        <section className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Customer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Email *</label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@example.com"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Full name"
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="+357 99 123456"
              className={inputClass}
            />
          </div>
        </section>

        {/* Items */}
        <section className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gold border border-gold/20 rounded-lg hover:bg-gold/10 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Add Item
            </button>
          </div>

          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-3 items-end">
              <div className="col-span-5">
                {i === 0 && <label className={labelClass}>Product Name *</label>}
                <input
                  type="text"
                  required
                  value={item.name}
                  onChange={(e) => updateItem(i, 'name', e.target.value)}
                  placeholder="e.g. Custom Perfume: Saffron Noir"
                  className={inputClass}
                />
              </div>
              <div className="col-span-2">
                {i === 0 && <label className={labelClass}>Type</label>}
                <select
                  value={item.productType}
                  onChange={(e) => updateItem(i, 'productType', e.target.value)}
                  className={inputClass}
                >
                  <option value="perfume">Perfume</option>
                  <option value="essence-oil">Essence Oil</option>
                  <option value="body-lotion">Body Lotion</option>
                  <option value="custom-perfume">Custom</option>
                  <option value="gift-set">Gift Set</option>
                </select>
              </div>
              <div className="col-span-2">
                {i === 0 && <label className={labelClass}>Price (&euro;) *</label>}
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={item.price || ''}
                  onChange={(e) => updateItem(i, 'price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>
              <div className="col-span-2">
                {i === 0 && <label className={labelClass}>Qty</label>}
                <input
                  type="number"
                  required
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value) || 1)}
                  className={inputClass}
                />
              </div>
              <div className="col-span-1 flex justify-center">
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          <div className="pt-3 border-t border-gray-800 flex justify-between items-center">
            <span className="text-gray-400 text-sm">Total</span>
            <span className="text-xl font-bold text-gold">&euro;{total.toFixed(2)}</span>
          </div>
        </section>

        {/* Shipping */}
        <section className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Shipping Address</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Recipient Name</label>
              <input
                type="text"
                value={shippingName}
                onChange={(e) => setShippingName(e.target.value)}
                placeholder="Recipient name"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Country</label>
              <select
                value={shippingCountry}
                onChange={(e) => setShippingCountry(e.target.value)}
                className={inputClass}
              >
                <option value="CY">Cyprus</option>
                <option value="GR">Greece</option>
                <option value="GB">United Kingdom</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="IT">Italy</option>
                <option value="ES">Spain</option>
                <option value="NL">Netherlands</option>
                <option value="BE">Belgium</option>
                <option value="AT">Austria</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Address Line 1</label>
              <input
                type="text"
                value={shippingLine1}
                onChange={(e) => setShippingLine1(e.target.value)}
                placeholder="Street address"
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Address Line 2</label>
              <input
                type="text"
                value={shippingLine2}
                onChange={(e) => setShippingLine2(e.target.value)}
                placeholder="Apartment, floor, etc."
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>City</label>
              <input
                type="text"
                value={shippingCity}
                onChange={(e) => setShippingCity(e.target.value)}
                placeholder="City"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Postal Code</label>
              <input
                type="text"
                value={shippingPostalCode}
                onChange={(e) => setShippingPostalCode(e.target.value)}
                placeholder="Postal code"
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Notes */}
        <section className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Internal notes about this order..."
            rows={3}
            className={inputClass}
          />
        </section>

        {/* Submit */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 bg-gold text-black font-semibold rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Order
          </button>
          <Link
            href="/admin/orders"
            className="px-6 py-3 text-gray-400 border border-gray-800 rounded-lg hover:text-white hover:border-gray-700 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
