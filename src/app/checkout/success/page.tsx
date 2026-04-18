'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight, XCircle, Loader2 } from 'lucide-react';
import * as Sentry from '@sentry/nextjs';
import { useCart } from '@/components/cart';
import { formatPrice } from '@/lib/utils';

interface OrderData {
  orderNumber: string;
  items: Array<{ name: string; quantity: number; price: number; size: string }>;
  total: number;
  currency: string;
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [error, setError] = useState(false);
  const hasClearedRef = useRef(false);

  // Fetch order details from session
  useEffect(() => {
    if (hasClearedRef.current) return;

    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setError(true);
      setLoading(false);
      return;
    }

    fetch(`/api/checkout/session-details?session_id=${sessionId}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch session details');
        }
        return response.json();
      })
      .then((data) => {
        setOrderData({
          orderNumber: data.orderNumber,
          items: data.items,
          total: data.total / 100, // Convert cents to euros
          currency: data.currency,
        });
        hasClearedRef.current = true;
        clearCart();
        setLoading(false);
      })
      .catch((err) => {
        Sentry.addBreadcrumb({
          category: 'checkout-success',
          message: 'Error fetching order details',
          level: 'error',
          data: { error: err }
        });
        setError(true);
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gold-ambient pt-32 md:pt-40 lg:pt-44 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <Loader2 className="w-12 h-12 text-gold animate-spin" />
          </motion.div>
          <p className="text-xl text-gray-400">Processing your order...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-gold-ambient pt-32 md:pt-40 lg:pt-44 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <XCircle className="w-12 h-12 text-red-500" />
          </motion.div>
          <h1 className="text-3xl font-playfair text-black mb-4">
            Unable to Load Order Details
          </h1>
          <p className="text-gray-400 mb-8">
            We couldn&apos;t retrieve your order information. Please contact us for assistance.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold text-black font-semibold rounded-full hover:bg-gold-light transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    );
  }

  // Success state with order details
  const subtotal = orderData.total;
  const shipping = 0; // Free shipping

  return (
    <div className="min-h-screen bg-gold-ambient pt-32 md:pt-40 lg:pt-44 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle className="w-12 h-12 text-green-500" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-playfair text-black mb-4">
            Thank You!
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Your order has been confirmed
          </p>
          <p className="text-2xl text-gold font-semibold">
            {orderData.orderNumber}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dark-light rounded-2xl p-8 border border-gold/20 mb-8"
        >
          <h2 className="text-xl font-semibold text-black mb-6">Order Details</h2>

          {/* Items table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gold/20">
                  <th className="pb-3 text-sm font-medium text-gray-400">Product</th>
                  <th className="pb-3 text-sm font-medium text-gray-400 text-center">Size</th>
                  <th className="pb-3 text-sm font-medium text-gray-400 text-center">Qty</th>
                  <th className="pb-3 text-sm font-medium text-gray-400 text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {orderData.items.map((item, index) => (
                  <tr key={index} className="border-b border-gold/10">
                    <td className="py-4 text-black">{item.name}</td>
                    <td className="py-4 text-gray-400 text-center">{item.size}</td>
                    <td className="py-4 text-gray-400 text-center">{item.quantity}</td>
                    <td className="py-4 text-black text-right">{formatPrice(item.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="space-y-2 border-t border-gold/20 pt-4">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Shipping</span>
              <span className="text-green-500 font-semibold">FREE</span>
            </div>
            <div className="flex justify-between text-xl font-semibold text-black pt-2 border-t border-gold/20">
              <span>Total</span>
              <span className="text-gold">{formatPrice(subtotal + shipping)}</span>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-6 pt-6 border-t border-gold/20">
            Expect delivery within <strong className="text-black">1-2 business days</strong>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-dark-light rounded-2xl p-8 border border-gold/20 mb-8"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-gold" />
            </div>
            <div className="text-left">
              <h3 className="text-black font-semibold">What happens next?</h3>
              <p className="text-gray-400 text-sm">We&apos;ll send you a confirmation email shortly</p>
            </div>
          </div>

          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-gold text-xs font-bold">1</span>
              </div>
              <div>
                <p className="text-black text-sm font-medium">Order Confirmation</p>
                <p className="text-gray-500 text-xs">You&apos;ll receive an email with your order details</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-gold text-xs font-bold">2</span>
              </div>
              <div>
                <p className="text-black text-sm font-medium">Preparation</p>
                <p className="text-gray-500 text-xs">Our team will carefully prepare your fragrances</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-gold text-xs font-bold">3</span>
              </div>
              <div>
                <p className="text-black text-sm font-medium">Shipping</p>
                <p className="text-gray-500 text-xs">Expect delivery within 1-2 business days</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold text-black font-semibold rounded-full hover:bg-gold-light transition-colors"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-gold/30 text-gold rounded-full hover:bg-gold/10 transition-colors"
          >
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
