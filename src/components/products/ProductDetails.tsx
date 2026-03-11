'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/currency';
import ProductVariantSelector, {
  getDefaultVariant,
  type SelectedVariant,
} from './ProductVariantSelector';
import AddToCartButton from './AddToCartButton';
import RichDescription from './RichDescription';
import type { LegacyProduct } from '@/types';

interface ProductDetailsProps {
  product: LegacyProduct;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [variant, setVariant] = useState<SelectedVariant>(getDefaultVariant);

  // Build a product override with variant pricing/type/size
  const variantProduct: LegacyProduct = {
    ...product,
    price: variant.price,
    salePrice: undefined,
    productType: variant.type,
    size: variant.size,
  };

  return (
    <div className="flex flex-col gap-6">
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
          {formatPrice(variant.price)}
        </span>
        <span className="text-sm text-gray-400">
          {variant.label} · {variant.size}
        </span>
      </div>

      {/* Variant Selector */}
      <ProductVariantSelector selected={variant} onChange={setVariant} />

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

      <AddToCartButton product={variantProduct} />

      {/* Compact info row */}
      <div className="flex flex-wrap gap-3 pt-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <svg className="w-4 h-4 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          Free shipping over €100
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <svg className="w-4 h-4 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Secure checkout
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <svg className="w-4 h-4 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          1-2 day delivery
        </div>
      </div>

      {/* Description — below the fold */}
      <div className="pt-6 border-t border-gray-100">
        <h3 className="text-[11px] text-gray-400 uppercase tracking-[0.12em] mb-3">
          About this fragrance
        </h3>
        <RichDescription description={product.description} />
      </div>

      {/* Tags */}
      {product.tags && product.tags.length > 0 && (
        <div className="pt-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs text-gold bg-gold/5 border border-gold/10 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
