'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Minus, Plus, X } from 'lucide-react';
import type { CartItem as CartItemType } from '@/types/cart';
import { formatPrice } from '@/lib/currency';
import { useCart } from './CartProvider';

interface CartItemProps {
  item: CartItemType;
}

const productTypeLabels: Record<string, string> = {
  'perfume': 'Perfume',
  'essence-oil': 'Essence Oil',
  'body-lotion': 'Body Lotion',
};

export default function CartItem({ item }: CartItemProps) {
  const { removeItem, updateQuantity } = useCart();

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateQuantity(item.variantId, item.quantity - 1);
    } else {
      removeItem(item.variantId);
    }
  };

  const handleIncrease = () => {
    updateQuantity(item.variantId, item.quantity + 1);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex gap-4 py-4 border-b border-gold/10"
    >
      {/* Product Image */}
      <div className="relative w-20 h-20 bg-dark-lighter rounded-lg overflow-hidden flex-shrink-0">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-white truncate pr-6">
          {item.name}
        </h4>
        <p className="text-xs text-gray-400 mt-0.5">
          {productTypeLabels[item.productType]} - {item.size}
        </p>
        <p className="text-sm text-gold font-semibold mt-1">
          {formatPrice(item.price)}
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={handleDecrease}
            className="w-7 h-7 rounded-full bg-dark-lighter border border-gold/20 flex items-center justify-center text-gray-400 hover:text-gold hover:border-gold transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-sm text-white w-8 text-center">{item.quantity}</span>
          <button
            onClick={handleIncrease}
            className="w-7 h-7 rounded-full bg-dark-lighter border border-gold/20 flex items-center justify-center text-gray-400 hover:text-gold hover:border-gold transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => removeItem(item.variantId)}
        className="absolute top-4 right-4 p-1 text-gray-500 hover:text-red-400 transition-colors"
        aria-label="Remove item"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Line Total */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-semibold text-white">
          {formatPrice(item.price * item.quantity)}
        </p>
      </div>
    </motion.div>
  );
}
