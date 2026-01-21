'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Check, Minus, Plus } from 'lucide-react';
import { track } from '@vercel/analytics';
import { useCart } from '@/components/cart';
import type { LegacyProduct } from '@/types';
import type { CartItem } from '@/types/cart';
import type { ProductType, ProductSize } from '@/types/product';

interface AddToCartButtonProps {
  product: LegacyProduct;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      productId: product.id,
      variantId: `${product.id}-${product.productType}-${product.size}`,
      quantity,
      name: product.name,
      image: product.image,
      price: product.price,
      size: product.size as ProductSize,
      productType: product.productType as ProductType,
    };

    addItem(cartItem);
    setIsAdded(true);
    setQuantity(1);

    // Track add to cart event
    track('add_to_cart', {
      product_id: product.id,
      product_name: product.name,
      category: product.category,
      price: product.price,
      quantity,
    });

    // Reset added state after 2 seconds
    setTimeout(() => setIsAdded(false), 2000);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">Quantity</span>
        <div className="flex items-center gap-2">
          <button
            onClick={decreaseQuantity}
            disabled={quantity <= 1}
            className="w-10 h-10 rounded-full bg-dark-lighter border border-gold/20 flex items-center justify-center text-gray-400 hover:text-gold hover:border-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center text-white font-semibold">{quantity}</span>
          <button
            onClick={increaseQuantity}
            className="w-10 h-10 rounded-full bg-dark-lighter border border-gold/20 flex items-center justify-center text-gray-400 hover:text-gold hover:border-gold transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <motion.button
        onClick={handleAddToCart}
        disabled={!product.inStock || isAdded}
        whileHover={{ scale: product.inStock && !isAdded ? 1.02 : 1 }}
        whileTap={{ scale: product.inStock && !isAdded ? 0.98 : 1 }}
        className={`w-full py-4 rounded-full font-semibold flex items-center justify-center gap-2 transition-all ${
          isAdded
            ? 'bg-green-500 text-white'
            : product.inStock
              ? 'bg-gold text-black hover:bg-gold-light'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        }`}
      >
        {isAdded ? (
          <>
            <Check className="w-5 h-5" />
            Added to Cart
          </>
        ) : product.inStock ? (
          <>
            <ShoppingBag className="w-5 h-5" />
            Add to Cart
          </>
        ) : (
          'Out of Stock'
        )}
      </motion.button>
    </div>
  );
}
