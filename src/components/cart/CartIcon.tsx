'use client';

import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useCart } from './CartProvider';

export default function CartIcon({ className }: { className?: string }) {
  const { itemCount, openCart } = useCart();

  return (
    <motion.button
      onClick={openCart}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className={`relative min-h-[44px] min-w-[44px] flex items-center justify-center hover:text-gold transition-colors duration-300 ${className || 'text-black/80'}`}
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <ShoppingBag className="w-[20px] h-[20px]" strokeWidth={1.5} />
      {itemCount > 0 && (
        <motion.span
          key={itemCount}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-1 right-0 w-4 h-4 bg-gold text-black text-[9px] rounded-full flex items-center justify-center font-medium leading-none"
        >
          {itemCount > 99 ? '99' : itemCount}
        </motion.span>
      )}
    </motion.button>
  );
}
