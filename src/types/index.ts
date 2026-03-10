// Re-export cart and order types
export * from './cart';
export * from './order';

// Re-export product types
export { type ProductType, type ProductSize } from './product';

// Gender type for Lattafa products
export type ProductGender = 'men' | 'women' | 'unisex';

/**
 * @deprecated Use Product type from @/lib/supabase/types instead.
 * This type uses camelCase properties (salePrice, inStock) while the Supabase Product type uses snake_case (sale_price, in_stock).
 * Migrate to Supabase Product type for consistency with the database schema.
 */
export interface LegacyProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  category: 'men' | 'women' | 'niche' | 'essence-oil' | 'body-lotion' | 'lattafa-original' | 'al-haramain-originals' | 'victorias-secret-originals';
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
  id: 'men' | 'women' | 'niche' | 'essence-oil' | 'body-lotion' | 'lattafa-original' | 'al-haramain-originals' | 'victorias-secret-originals';
  name: string;
  slug: string;
  description: string;
  image: string;
  contain?: boolean;
}

/**
 * @deprecated Use Product type from @/lib/supabase/types instead.
 * This alias maintains backward compatibility but should be phased out.
 */
export type Product = LegacyProduct;
