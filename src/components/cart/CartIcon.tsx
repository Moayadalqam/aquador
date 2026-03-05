'use client';

import { motion } from 'framer-motion';
import { useCart } from './CartProvider';

export default function CartIcon() {
  const { itemCount, openCart } = useCart();

  return (
    <motion.button
      onClick={openCart}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className="relative min-h-[44px] min-w-[44px] flex items-center justify-center text-white hover:text-gold transition-colors duration-300"
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[18px] h-[18px]"
      >
        <path d="M5.5 8.5h13l-1 11h-11l-1-11z" />
        <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
      </svg>
      {itemCount > 0 && (
        <motion.span
          key={itemCount}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-1.5 right-0.5 w-3.5 h-3.5 bg-gold text-black text-[8px] rounded-full flex items-center justify-center font-medium leading-none"
        >
          {itemCount > 99 ? '99' : itemCount}
        </motion.span>
      )}
    </motion.button>
  );
}
