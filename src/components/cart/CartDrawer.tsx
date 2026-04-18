'use client';

import { useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useCart } from './CartProvider';
import CartItem from './CartItem';
import CheckoutButton from './CheckoutButton';
import { formatPrice } from '@/lib/currency';

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function CartDrawer() {
  const { cart, isCartOpen, closeCart, subtotal, clearCart } = useCart();
  const isEmpty = cart.items.length === 0;

  const drawerRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const stableCloseCart = useCallback(closeCart, [closeCart]);

  useEffect(() => {
    if (!isCartOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement;

    // Small delay to let framer-motion render the drawer before querying focusables
    const rafId = requestAnimationFrame(() => {
      const focusables = drawerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      focusables?.[0]?.focus();
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stableCloseCart();
        return;
      }

      if (e.key === 'Tab') {
        const focusables = drawerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (!focusables || focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [isCartOpen, stableCloseCart]);

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
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white border-l border-gray-300 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-300">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-gold" />
                <h2 className="text-lg font-playfair text-black">Your Cart</h2>
              </div>
              <button
                onClick={closeCart}
                className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-black transition-colors"
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
                  <h3 className="text-lg font-playfair text-black mb-2">
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
              <div className="border-t border-gray-300 p-6 space-y-4">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-xl font-playfair text-black">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                {/* Shipping Note */}
                <p className="text-xs text-gray-500 text-center">
                  Free shipping on all orders. Delivery within 1-2 business days.
                </p>

                {/* Checkout Button */}
                <CheckoutButton />

                {/* Continue Shopping */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={clearCart}
                    className="text-sm text-gray-500 hover:text-red-400 transition-colors min-h-[44px] flex items-center"
                  >
                    Clear Cart
                  </button>
                  <span className="text-gray-600">|</span>
                  <button
                    onClick={closeCart}
                    className="text-sm text-gold hover:text-gold-light transition-colors min-h-[44px] flex items-center"
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
