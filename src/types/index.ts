export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  category: 'men' | 'women' | 'niche';
  productType: 'perfume' | 'essence-oil' | 'body-lotion';
  size: string;
  image: string;
  inStock: boolean;
  tags?: string[];
  brand?: string;
  notes?: {
    top?: string[];
    heart?: string[];
    base?: string[];
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
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
