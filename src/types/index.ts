// Re-export cart and order types
export * from './cart';
export * from './order';

// Re-export product types with renamed exports to avoid conflicts
export {
  type ProductType,
  type ProductSize,
  type ProductCategory,
  type ProductVariant,
  type Product as CatalogProduct,
  type Category as CatalogCategory,
  getDefaultVariant,
  getVariantLabel,
} from './product';

// Gender type for Lattafa products
export type ProductGender = 'men' | 'women' | 'unisex';

// Legacy types - used by shop pages and lib/products.ts
export interface LegacyProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  category: 'men' | 'women' | 'niche' | 'essence-oil' | 'body-lotion' | 'lattafa-original';
  productType: 'perfume' | 'essence-oil' | 'body-lotion';
  size: string;
  image: string;
  images?: string[];
  inStock: boolean;
  tags?: string[];
  brand?: string;
  gender?: ProductGender;
  notes?: {
    top?: string[];
    heart?: string[];
    base?: string[];
  };
}

export interface FragranceNote {
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface CustomPerfume {
  name: string;
  topNote: FragranceNote | null;
  heartNote: FragranceNote | null;
  baseNote: FragranceNote | null;
  size: '50ml' | '100ml';
  specialRequests?: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

// Category interface for shop categories
export interface Category {
  id: 'men' | 'women' | 'niche' | 'essence-oil' | 'body-lotion' | 'lattafa-original';
  name: string;
  slug: string;
  description: string;
  image: string;
}

// Export LegacyProduct as Product for backward compatibility with lib/products.ts
export type Product = LegacyProduct;
