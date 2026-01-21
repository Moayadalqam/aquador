'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { useCart } from '@/components/cart';

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart();

  // Clear cart on successful checkout
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-dark pt-32 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle className="w-12 h-12 text-green-500" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-playfair text-white mb-4"
        >
          Thank You!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-gray-400 mb-8"
        >
          Your order has been confirmed and is being prepared.
        </motion.p>

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
              <h3 className="text-white font-semibold">What happens next?</h3>
              <p className="text-gray-400 text-sm">We&apos;ll send you a confirmation email shortly</p>
            </div>
          </div>

          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-gold text-xs font-bold">1</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Order Confirmation</p>
                <p className="text-gray-500 text-xs">You&apos;ll receive an email with your order details</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-gold text-xs font-bold">2</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Preparation</p>
                <p className="text-gray-500 text-xs">Our team will carefully prepare your fragrances</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-gold text-xs font-bold">3</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Shipping</p>
                <p className="text-gray-500 text-xs">Expect delivery within 3-7 business days</p>
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
