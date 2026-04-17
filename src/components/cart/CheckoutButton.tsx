'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { track } from '@vercel/analytics';
import * as Sentry from '@sentry/nextjs';
import { useCart } from './CartProvider';
import { loadingVariants } from '@/lib/animations/micro-interactions';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export default function CheckoutButton() {
  const { cart } = useCart();
  const reducedMotion = useReducedMotion();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleCheckout = async () => {
    if (isProcessing) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsProcessing(true);
    setIsLoading(true);
    setError(null);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Track checkout started
    const totalValue = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    track('checkout_started', {
      item_count: cart.items.length,
      total_value: totalValue,
    });

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: cart.items }),
        signal: abortController.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      Sentry.addBreadcrumb({
        category: 'checkout-button',
        message: 'Checkout error',
        level: 'error',
        data: { error: err }
      });
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsProcessing(false);
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="space-y-2">
      <motion.button
        onClick={handleCheckout}
        disabled={isLoading || isProcessing || cart.items.length === 0}
        whileHover={!reducedMotion && !isLoading ? { scale: 1.02 } : undefined}
        whileTap={!reducedMotion && !isLoading ? { scale: 0.98 } : undefined}
        className="w-full py-4 bg-gold text-black font-semibold rounded-full flex items-center justify-center gap-2 hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="inline-flex items-center gap-2"
            >
              <motion.div
                className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full"
                animate={!reducedMotion ? loadingVariants.spin : undefined}
              />
              <span>Processing...</span>
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Proceed to Checkout
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}

      <p className="text-xs text-gray-500 text-center">
        Secure checkout powered by Stripe
      </p>
    </div>
  );
}
