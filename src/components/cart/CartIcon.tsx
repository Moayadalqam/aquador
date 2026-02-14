'use client';

import { motion } from 'framer-motion';
import { useCart } from './CartProvider';

function PerfumeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Bottle cap */}
      <rect x="9" y="2" width="6" height="3" rx="0.5" />
      {/* Neck */}
      <path d="M10 5v2a1 1 0 0 0-1 1v1h6V8a1 1 0 0 0-1-1V5" />
      {/* Spray nozzle */}
      <path d="M12 2v-0.5" />
      {/* Body */}
      <path d="M9 9l-1 2v9a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-9l-1-2" />
      {/* Liquid level */}
      <path d="M8 15h8" strokeOpacity="0.5" />
    </svg>
  );
}

export default function CartIcon() {
  const { itemCount, openCart } = useCart();

  return (
    <motion.button
      onClick={openCart}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative p-3 text-gray-200 hover:text-gold transition-colors duration-300"
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <PerfumeIcon className="w-6 h-6" />
      {itemCount > 0 && (
        <motion.span
          key={itemCount}
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-black text-xs rounded-full flex items-center justify-center font-semibold"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </motion.span>
      )}
    </motion.button>
  );
}
