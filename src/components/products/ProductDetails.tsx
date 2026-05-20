'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Clock, Package, ShieldCheck } from 'lucide-react';
import { formatPrice } from '@/lib/currency';
import ProductVariantSelector, {
  getDefaultVariant,
  type SelectedVariant,
} from './ProductVariantSelector';
import AddToCartButton from './AddToCartButton';
import RichDescription from './RichDescription';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { LegacyProduct } from '@/types';

// Aquador's own fragrances support perfume / essence oil / body lotion variants
const AQUADOR_CATEGORIES = ['women', 'men', 'niche'];

const productTypeLabel = (type: string) => {
  if (type === 'essence-oil') return 'Essence Oil';
  if (type === 'body-lotion') return 'Body Lotion';
  return 'Perfume';
};

interface ProductDetailsProps {
  product: LegacyProduct;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const reducedMotion = useReducedMotion();
  const isAquador = AQUADOR_CATEGORIES.includes(product.category);
  const [variant, setVariant] = useState<SelectedVariant>(getDefaultVariant);

  // Aquador products: use selected variant price/type/size
  // Branded products: use exact DB price/type/size
  const displayProduct: LegacyProduct = isAquador
    ? { ...product, price: variant.price, salePrice: undefined, productType: variant.type, size: variant.size }
    : product;

  const displayPrice = isAquador
    ? variant.price
    : (product.salePrice && product.salePrice < product.price ? product.salePrice : product.price);

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 18 }}
      animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-6"
    >
      {/* Brand */}
      {product.brand && (
        <p className="text-[11px] text-gold-500 uppercase tracking-[0.2em]">
          {product.brand}
        </p>
      )}

      {/* Name */}
      <h1 className="text-[clamp(1.75rem,1.25rem+2.5vw,3rem)] font-playfair font-semibold text-black tracking-tight leading-[1.1]">
        {product.name}
      </h1>

      {/* Price */}
      <div className="flex items-baseline gap-3 transition-all duration-300">
        <span className="text-[clamp(1.75rem,1.5rem+1.25vw,2.5rem)] font-playfair font-medium text-gold-600">
          {formatPrice(displayPrice)}
        </span>
        {isAquador ? (
          <span className="text-sm text-gray-400">{variant.label} · {variant.size}</span>
        ) : (
          <span className="inline-flex items-center gap-2 text-sm text-gray-400">
            <span>{productTypeLabel(product.productType)}</span>
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-gold/20 bg-gold/5 text-[11px] uppercase tracking-[0.12em] text-gold-600"
            >
              <span className="text-gray-400 normal-case tracking-normal">Volume:</span>
              <span className="font-medium">{product.size}</span>
            </span>
            {product.salePrice && product.salePrice < product.price && (
              <span className="line-through text-gray-300">{formatPrice(product.price)}</span>
            )}
          </span>
        )}
      </div>

      {/* Variant selector — Aquador products only */}
      {isAquador && <ProductVariantSelector selected={variant} onChange={setVariant} />}

      {/* Stock + Add to Cart */}
      <div className="flex items-center gap-3 text-sm">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs ${
          product.inStock
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-red-50 text-red-500'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${product.inStock ? 'bg-emerald-500' : 'bg-red-400'}`} />
          {product.inStock ? 'In Stock' : 'Coming Soon'}
        </span>
      </div>

      <AddToCartButton product={displayProduct} />

      {/* Compact info row */}
      <div className="grid gap-2 pt-2 sm:grid-cols-3">
        <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-2 text-xs text-gray-600">
          <Package className="h-4 w-4 flex-none text-gold-500" />
          Free shipping over €50
        </div>
        <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-2 text-xs text-gray-600">
          <ShieldCheck className="h-4 w-4 flex-none text-gold-500" />
          Secure checkout
        </div>
        <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-2 text-xs text-gray-600">
          <Clock className="h-4 w-4 flex-none text-gold-500" />
          1-2 day delivery
        </div>
      </div>

      {/* Description — below the fold */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 16 }}
        whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="pt-6"
      >
        <h3 className="mb-4 text-[11px] uppercase tracking-[0.16em] text-gray-500">
          About this fragrance
        </h3>
        <RichDescription description={product.description} />
      </motion.div>

      {/* Tags */}
      {product.tags && product.tags.length > 0 && (
        <div className="pt-4 border-t border-gray-300">
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs text-gold bg-gold/5 border border-gray-300 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
