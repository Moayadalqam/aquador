'use client';

import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useCart } from './CartProvider';

export default function CartIcon() {
  const { itemCount, openCart } = useCart();

  return (
    <motion.button
      onClick={openCart}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="relative p-2 text-gray-200 hover:text-gold transition-colors duration-300"
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <ShoppingBag className="w-6 h-6" />
      <motion.span
        key={itemCount}
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-black text-xs rounded-full flex items-center justify-center font-semibold"
      >
        {itemCount > 99 ? '99+' : itemCount}
      </motion.span>
    </motion.button>
  );
}
