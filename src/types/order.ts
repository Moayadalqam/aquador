import type { CartItem } from './cart';

export interface CheckoutSessionRequest {
  items: CartItem[];
  customerEmail?: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface OrderLineItem {
  productId: string;
  variantId: string;
  name: string;
  quantity: number;
  price: number;
  size: string;
  productType: string;
}

export interface OrderMetadata {
  items: OrderLineItem[];
  currency: 'EUR';
  subtotal: number;
}
