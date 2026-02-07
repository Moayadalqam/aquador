export type ProductType = 'perfume' | 'essence-oil' | 'body-lotion' | 'gift-set';
export type ProductSize = '10ml' | '50ml' | '100ml' | '150ml';
export type ProductCategory = 'men' | 'women' | 'niche';

export interface ProductVariant {
  id: string;
  sku: string;
  productType: ProductType;
  size: ProductSize;
  price: number;
  salePrice?: number;
  onSale: boolean;
  inStock: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  brand?: string;
  categories: ProductCategory[];
  tags: string[];
  image: string;
  images: string[];
  variants: ProductVariant[];
  visible: boolean;
  basePrice: number;
}

export interface Category {
  id: ProductCategory;
  name: string;
  slug: string;
  description: string;
  image: string;
}

export function getDefaultVariant(product: Product): ProductVariant | undefined {
  return product.variants.find(v => v.productType === 'perfume' && v.size === '50ml')
    || product.variants[0];
}

export function getVariantLabel(variant: ProductVariant): string {
  const typeLabels: Record<ProductType, string> = {
    'perfume': 'Perfume',
    'essence-oil': 'Essence Oil',
    'body-lotion': 'Body Lotion',
    'gift-set': 'Gift Set',
  };
  return `${typeLabels[variant.productType]} - ${variant.size}`;
}
