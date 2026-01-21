'use client';

import { Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useCart } from './CartProvider';
import CartItem from './CartItem';
import CheckoutButton from './CheckoutButton';
import { formatPrice } from '@/lib/currency';

export default function CartDrawer() {
  const { cart, isCartOpen, closeCart, subtotal, clearCart } = useCart();
  const isEmpty = cart.items.length === 0;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-dark border-l border-gold/20 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gold/20">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-gold" />
                <h2 className="text-lg font-playfair text-white">Your Cart</h2>
              </div>
              <button
                onClick={closeCart}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isEmpty ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-16 h-16 text-gray-600 mb-4" />
                  <h3 className="text-lg font-playfair text-white mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-gray-400 text-sm mb-6">
                    Discover our luxury fragrances and find your signature scent.
                  </p>
                  <Link
                    href="/shop"
                    onClick={closeCart}
                    className="px-6 py-3 bg-gold text-black font-medium rounded-full hover:bg-gold-light transition-colors"
                  >
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="relative">
                  <AnimatePresence mode="popLayout">
                    {cart.items.map((item) => (
                      <CartItem key={item.variantId} item={item} />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {!isEmpty && (
              <div className="border-t border-gold/20 p-6 space-y-4">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-xl font-playfair text-white">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                {/* Shipping Note */}
                <p className="text-xs text-gray-500 text-center">
                  Shipping calculated at checkout. Free delivery on orders over €100.
                </p>

                {/* Checkout Button */}
                <CheckoutButton />

                {/* Continue Shopping */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={clearCart}
                    className="text-sm text-gray-500 hover:text-red-400 transition-colors"
                  >
                    Clear Cart
                  </button>
                  <span className="text-gray-600">|</span>
                  <button
                    onClick={closeCart}
                    className="text-sm text-gold hover:text-gold-light transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
