'use client';

export interface ProductVariant {
  type: 'perfume' | 'essence-oil' | 'body-lotion';
  label: string;
  sizes: { size: string; price: number }[];
}

export const PRODUCT_VARIANTS: ProductVariant[] = [
  {
    type: 'perfume',
    label: 'Perfume',
    sizes: [
      { size: '50ml', price: 29.99 },
      { size: '100ml', price: 49.99 },
    ],
  },
  {
    type: 'essence-oil',
    label: 'Essence Oil',
    sizes: [{ size: '10ml', price: 19.99 }],
  },
  {
    type: 'body-lotion',
    label: 'Body Lotion',
    sizes: [{ size: '150ml', price: 29.99 }],
  },
];

export interface SelectedVariant {
  type: 'perfume' | 'essence-oil' | 'body-lotion';
  label: string;
  size: string;
  price: number;
}

interface ProductVariantSelectorProps {
  selected: SelectedVariant;
  onChange: (variant: SelectedVariant) => void;
}

export function getDefaultVariant(): SelectedVariant {
  return {
    type: 'perfume',
    label: 'Perfume',
    size: '50ml',
    price: 29.99,
  };
}

export default function ProductVariantSelector({
  selected,
  onChange,
}: ProductVariantSelectorProps) {
  const activeVariant = PRODUCT_VARIANTS.find((v) => v.type === selected.type)!;

  const handleTypeChange = (variant: ProductVariant) => {
    onChange({
      type: variant.type,
      label: variant.label,
      size: variant.sizes[0].size,
      price: variant.sizes[0].price,
    });
  };

  const handleSizeChange = (size: string, price: number) => {
    onChange({ ...selected, size, price });
  };

  return (
    <div className="space-y-5">
      {/* Type selector */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 mb-3">
          Product Type
        </p>
        <div className="flex gap-2">
          {PRODUCT_VARIANTS.map((variant) => {
            const isActive = selected.type === variant.type;
            return (
              <button
                key={variant.type}
                onClick={() => handleTypeChange(variant)}
                className={`px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-black text-white shadow-lg shadow-black/10'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gold/40 hover:text-black'
                }`}
              >
                {variant.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Size selector */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 mb-3">
          Size
        </p>
        <div className="flex gap-2">
          {activeVariant.sizes.map(({ size, price }) => {
            const isActive = selected.size === size;
            return (
              <button
                key={size}
                onClick={() => handleSizeChange(size, price)}
                className={`px-5 py-3 rounded-xl text-sm transition-all duration-300 flex items-baseline gap-2 ${
                  isActive
                    ? 'bg-gold/10 text-black border-2 border-gold'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gold/40'
                }`}
              >
                <span className="font-medium">{size}</span>
                <span className={`text-xs ${isActive ? 'text-gold-600' : 'text-gray-400'}`}>
                  €{price.toFixed(2)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
