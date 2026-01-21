'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { XCircle, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '@/components/cart';

export default function CheckoutCancelPage() {
  const { openCart, itemCount } = useCart();

  return (
    <div className="min-h-screen bg-gold-ambient pt-32 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="w-24 h-24 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <XCircle className="w-12 h-12 text-gray-400" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-playfair text-white mb-4"
        >
          Checkout Cancelled
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-gray-400 mb-8"
        >
          No worries! Your cart is still waiting for you.
        </motion.p>

        {itemCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-dark-light rounded-2xl p-8 border border-gold/20 mb-8"
          >
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-gold" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-semibold">Your cart is saved</h3>
                <p className="text-gray-400 text-sm">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} still in your cart
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          {itemCount > 0 && (
            <button
              onClick={openCart}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold text-black font-semibold rounded-full hover:bg-gold-light transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Return to Cart
            </button>
          )}
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-gold/30 text-gold rounded-full hover:bg-gold/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-gray-500 text-sm"
        >
          Need help? <Link href="/contact" className="text-gold hover:text-gold-light">Contact us</Link>
        </motion.p>
      </div>
    </div>
  );
}
