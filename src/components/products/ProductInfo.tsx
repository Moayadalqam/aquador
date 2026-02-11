import { formatPrice } from '@/lib/currency';
import RichDescription from './RichDescription';
import type { LegacyProduct } from '@/types';

interface ProductInfoProps {
  product: LegacyProduct;
}

const productTypeLabels: Record<string, string> = {
  'perfume': 'Perfume',
  'essence-oil': 'Essence Oil',
  'body-lotion': 'Body Lotion',
};

export default function ProductInfo({ product }: ProductInfoProps) {
  return (
    <div className="space-y-6">
      {/* Brand */}
      {product.brand && (
        <p className="text-xs text-gold uppercase tracking-[0.2em]">
          {product.brand}
        </p>
      )}

      {/* Name */}
      <h1 className="text-3xl md:text-4xl font-playfair text-white">
        {product.name}
      </h1>

      {/* Price */}
      <div className="flex items-baseline gap-4">
        {product.salePrice && product.salePrice < product.price ? (
          <>
            <span className="text-3xl font-playfair text-gold">
              {formatPrice(product.salePrice)}
            </span>
            <span className="text-lg text-gray-500 line-through">
              {formatPrice(product.price)}
            </span>
          </>
        ) : (
          <span className="text-3xl font-playfair text-gold">
            {formatPrice(product.price)}
          </span>
        )}
      </div>

      {/* Product Details */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="px-4 py-2 bg-dark-lighter rounded-full border border-gold/20">
          <span className="text-gray-400">Type: </span>
          <span className="text-white">{productTypeLabels[product.productType]}</span>
        </div>
        <div className="px-4 py-2 bg-dark-lighter rounded-full border border-gold/20">
          <span className="text-gray-400">Size: </span>
          <span className="text-white">{product.size}</span>
        </div>
        <div className="px-4 py-2 bg-dark-lighter rounded-full border border-gold/20">
          <span className="text-gray-400">Status: </span>
          <span className={product.inStock ? 'text-green-400' : 'text-red-400'}>
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="pt-4 border-t border-gold/10">
        <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-3">
          Description
        </h3>
        <RichDescription description={product.description} />
      </div>

      {/* Tags */}
      {product.tags && product.tags.length > 0 && (
        <div className="pt-4 border-t border-gold/10">
          <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-3">
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs text-gold bg-gold/10 rounded-full"
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
