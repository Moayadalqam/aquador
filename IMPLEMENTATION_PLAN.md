# Aquador Website Migration - Implementation Plan

## Executive Summary

**Objective:** Complete e-commerce migration from Squarespace to Next.js with full shopping cart, Stripe checkout, product detail pages, and contact form functionality.

**Data Analysis Results:**
- ~250 unique products from CSV (1000 rows with 4 variants each)
- Variant types: Perfume 50ml (€29.99), Perfume 100ml (€49.99), Essence Oil 10ml (€19.99), Body Lotion 150ml (€29.99)
- Categories: women, men, niche + brand-specific categories
- Currency: EUR (standardize across all components)

---

## Phase 1: Data Layer & Type Definitions

### 1.1 Enhanced Product Types

```typescript
// src/types/product.ts

export type ProductType = 'perfume' | 'essence-oil' | 'body-lotion';
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
  images?: string[];
  variants: ProductVariant[];
  visible: boolean;
  // Computed
  basePrice: number; // Lowest variant price for display
}

export interface Category {
  id: ProductCategory;
  name: string;
  slug: string;
  description: string;
  image: string;
}
```

### 1.2 Cart Types

```typescript
// src/types/cart.ts

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  // Denormalized for performance
  name: string;
  image: string;
  price: number;
  size: ProductSize;
  productType: ProductType;
}

export interface Cart {
  items: CartItem[];
  currency: 'EUR';
}

export interface CartContextType {
  cart: Cart;
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}
```

### 1.3 Order Types

```typescript
// src/types/order.ts

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

export interface OrderMetadata {
  items: Array<{
    productId: string;
    variantId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  customerEmail?: string;
  currency: 'EUR';
}
```

### 1.4 CSV Parser Implementation

**File:** `src/lib/data/csv-parser.ts`

Parse CSV into Product[] structure:
1. Read CSV file
2. Group rows by Product ID (main row + variants)
3. Extract variants from grouped rows
4. Generate slug from product name
5. Parse categories from comma-separated string
6. Strip HTML from descriptions
7. Export as JSON for static import

**Output:** `src/data/products.json`

---

## Phase 2: Shopping Cart Implementation

### 2.1 State Management: React Context + useReducer

**Why Context over Zustand:**
- Project is small-to-medium scale
- No complex state interactions
- Reduces dependencies
- Easier to understand/maintain

### 2.2 Component Structure

```
src/components/cart/
├── CartProvider.tsx      # Context provider with reducer
├── CartIcon.tsx          # Header icon with badge
├── CartDrawer.tsx        # Slide-out cart sidebar
├── CartItem.tsx          # Individual item row
├── CartSummary.tsx       # Subtotal, shipping info
└── CheckoutButton.tsx    # Stripe checkout trigger
```

### 2.3 Cart Reducer Actions

```typescript
type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { variantId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { variantId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'HYDRATE'; payload: Cart };
```

### 2.4 Persistence Strategy

- **Storage:** localStorage
- **Key:** `aquador_cart`
- **Hydration:** useEffect on mount to load saved cart
- **Sync:** Save on every state change
- **TTL:** No expiry (cart persists until cleared or checkout)

### 2.5 Cart Interactions

| Action | Behavior |
|--------|----------|
| Add to cart | If variant exists, increment qty; else add new item |
| Remove | Remove item from cart |
| Update qty | Set quantity; if 0, remove item |
| Clear | Empty cart (after successful checkout) |

---

## Phase 3: Product Detail Pages

### 3.1 Route Structure

**Option A (Selected):** `/products/[slug]`
- Clean URLs: `/products/coconut-musk`
- SEO-friendly slugs
- Simple to implement with generateStaticParams

**Alternative:** `/shop/[category]/[slug]` - rejected (adds complexity, breaks deep links)

### 3.2 Page Structure

```
src/app/products/
├── [slug]/
│   ├── page.tsx              # Server Component - main page
│   ├── ProductActions.tsx    # Client Component - variant selector + add to cart
│   └── loading.tsx           # Loading skeleton
└── not-found.tsx             # Product not found
```

### 3.3 Server Component Data Flow

```tsx
// src/app/products/[slug]/page.tsx

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const product = getProductBySlug(params.slug);
  return {
    title: `${product.name} | Aquad'or`,
    description: product.description,
    openGraph: { images: [product.image] }
  };
}

export default function ProductPage({ params }) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  return (
    <main>
      <ProductGallery images={[product.image]} />
      <ProductInfo product={product} />
      <ProductActions product={product} /> {/* Client Component */}
    </main>
  );
}
```

### 3.4 Structured Data (JSON-LD)

```tsx
// Include in product page for SEO
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.name,
  "description": product.description,
  "image": product.image,
  "brand": { "@type": "Brand", "name": product.brand },
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "EUR",
    "lowPrice": product.basePrice,
    "highPrice": maxPrice,
    "offerCount": product.variants.length
  }
}
</script>
```

---

## Phase 4: Stripe Integration

### 4.1 Architecture Decision: Stripe Checkout Sessions

**Why Checkout Sessions over Payment Intents:**
- Hosted payment page (PCI compliant out-of-box)
- Built-in success/cancel handling
- Supports multiple payment methods
- No custom payment form needed
- Better conversion rates (Stripe-optimized UX)

### 4.2 Environment Variables

```env
# .env.local
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4.3 API Routes

**Create Checkout Session:** `POST /api/checkout`

```typescript
// src/app/api/checkout/route.ts

export async function POST(request: NextRequest) {
  const { items } = await request.json();

  const lineItems = items.map((item: CartItem) => ({
    price_data: {
      currency: 'eur',
      product_data: {
        name: `${item.name} (${item.size} ${item.productType})`,
        images: [item.image],
      },
      unit_amount: Math.round(item.price * 100), // cents
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    success_url: `${BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${BASE_URL}/checkout/cancel`,
    shipping_address_collection: { allowed_countries: ['CY', 'GR', 'GB', 'DE'] },
    metadata: { /* order details for webhook */ }
  });

  return NextResponse.json({ url: session.url });
}
```

**Webhook Handler:** `POST /api/webhooks/stripe`

```typescript
// src/app/api/webhooks/stripe/route.ts

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      // Send confirmation email
      // Log order (optional: save to database)
      break;
  }

  return NextResponse.json({ received: true });
}
```

### 4.4 Checkout Flow

```
User clicks "Checkout"
       ↓
CartDrawer calls /api/checkout with cart items
       ↓
API creates Stripe Checkout Session
       ↓
User redirected to Stripe-hosted checkout
       ↓
┌─────────────────────────────────────┐
│ Success                             │
│ → Redirect to /checkout/success     │
│ → Webhook fires: send email         │
│ → Clear cart                        │
├─────────────────────────────────────┤
│ Cancel                              │
│ → Redirect to /checkout/cancel      │
│ → Cart preserved                    │
└─────────────────────────────────────┘
```

### 4.5 Success/Cancel Pages

```
src/app/checkout/
├── success/
│   └── page.tsx     # Thank you message, order summary
└── cancel/
    └── page.tsx     # "Your cart is waiting" + back to cart
```

---

## Phase 5: Contact Form Backend

### 5.1 Email Service: Resend

**Why Resend:**
- Modern API, great DX
- Free tier (100 emails/day)
- Built for Next.js
- Simple setup

### 5.2 API Route

**Endpoint:** `POST /api/contact`

```typescript
// src/app/api/contact/route.ts

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(5),
  message: z.string().min(10),
  honeypot: z.string().max(0), // Spam protection
});

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validate
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  // Check honeypot (spam bot detection)
  if (result.data.honeypot) {
    return NextResponse.json({ success: true }); // Fake success for bots
  }

  // Send email via Resend
  await resend.emails.send({
    from: 'Aquad\'or Website <noreply@aquadorcy.com>',
    to: process.env.CONTACT_EMAIL_TO,
    subject: `[Contact] ${result.data.subject}`,
    html: generateEmailTemplate(result.data),
  });

  return NextResponse.json({ success: true });
}
```

### 5.3 Spam Protection

1. **Honeypot field:** Hidden input that bots fill out
2. **Rate limiting:** Use Vercel's edge config or simple in-memory limiter
3. **Validation:** Strict Zod schema

---

## Phase 6: Currency Standardization

### 6.1 Current State

| Location | Currency | Issue |
|----------|----------|-------|
| formatPrice() | EUR | ✓ Correct |
| Stripe PaymentIntent | USD | ✗ Wrong |
| Cart display | EUR | ✓ Correct |
| Product prices | EUR | ✓ Correct |

### 6.2 Solution

**Standardize on EUR everywhere:**

1. Update `src/lib/utils.ts`:
```typescript
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-CY', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}
```

2. Create dedicated currency utility:
```typescript
// src/lib/currency.ts

export const CURRENCY = 'EUR' as const;
export const CURRENCY_SYMBOL = '€';

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-CY', {
    style: 'currency',
    currency: CURRENCY,
  }).format(amount);
}

export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}
```

3. Update Stripe checkout to use `'eur'` currency code

---

## Phase 7: Server Components Migration

### 7.1 Pages to Convert

| Page | Current | Target | Reason |
|------|---------|--------|--------|
| `/products/[slug]` | N/A (new) | Server | SEO critical |
| `/shop` | Client | Server | SEO, static content |
| `/shop/[category]` | Client | Server | SEO, static content |
| `/about` | Client | Server | Static content |
| `/privacy`, `/terms`, `/shipping` | Client | Server | Static content |
| Homepage sections | Client | Keep | Heavy animations |
| `/contact` | Client | Keep | Form interactivity |
| `/create-perfume` | Client | Keep | Complex interactivity |

### 7.2 Migration Pattern

```tsx
// Before (Client Component)
'use client';
import { motion } from 'framer-motion';
export default function Page() { ... }

// After (Server Component with Client islands)
import { Suspense } from 'react';
import AnimatedHero from './AnimatedHero'; // Client Component

export default function Page() {
  // Server-side data fetching
  const data = getStaticData();

  return (
    <>
      <Suspense fallback={<HeroSkeleton />}>
        <AnimatedHero data={data} />
      </Suspense>
      <StaticContent /> {/* Server Component */}
    </>
  );
}
```

---

## Implementation Order

### Sprint 1: Data & Infrastructure (Days 1-2)
1. ✓ Create TypeScript types for products, cart, orders
2. ✓ Parse CSV and generate products.json
3. ✓ Create currency utility module
4. ✓ Set up environment variables

### Sprint 2: Shopping Cart (Days 3-4)
1. Create CartProvider with reducer
2. Build CartIcon component
3. Build CartDrawer sidebar
4. Implement localStorage persistence
5. Integrate with Navbar

### Sprint 3: Product Pages (Days 5-6)
1. Create product data service
2. Build product detail page (Server Component)
3. Create ProductActions client component
4. Add variant selector
5. Implement structured data (JSON-LD)
6. Generate static params for all products

### Sprint 4: Stripe Checkout (Days 7-8)
1. Install Stripe packages
2. Create checkout API route
3. Create webhook handler
4. Build success/cancel pages
5. Integrate CheckoutButton with cart
6. Test end-to-end flow

### Sprint 5: Contact & Polish (Days 9-10)
1. Create contact API route with Resend
2. Add honeypot spam protection
3. Migrate static pages to Server Components
4. Final testing and bug fixes

---

## File Structure (Final)

```
src/
├── app/
│   ├── api/
│   │   ├── checkout/
│   │   │   └── route.ts
│   │   ├── contact/
│   │   │   └── route.ts
│   │   └── webhooks/
│   │       └── stripe/
│   │           └── route.ts
│   ├── products/
│   │   └── [slug]/
│   │       ├── page.tsx
│   │       ├── ProductActions.tsx
│   │       └── loading.tsx
│   ├── checkout/
│   │   ├── success/
│   │   │   └── page.tsx
│   │   └── cancel/
│   │       └── page.tsx
│   └── ... (existing pages)
├── components/
│   ├── cart/
│   │   ├── CartProvider.tsx
│   │   ├── CartIcon.tsx
│   │   ├── CartDrawer.tsx
│   │   ├── CartItem.tsx
│   │   ├── CartSummary.tsx
│   │   └── CheckoutButton.tsx
│   ├── products/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGallery.tsx
│   │   ├── VariantSelector.tsx
│   │   └── AddToCartButton.tsx
│   └── ... (existing components)
├── lib/
│   ├── currency.ts
│   ├── stripe.ts
│   ├── products.ts (refactored)
│   └── ... (existing)
├── data/
│   └── products.json (generated from CSV)
└── types/
    ├── product.ts
    ├── cart.ts
    └── order.ts
```

---

## Environment Variables (Complete)

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Email (Resend)
RESEND_API_KEY=re_xxx
CONTACT_EMAIL_TO=info@aquadorcy.com

# App
NEXT_PUBLIC_BASE_URL=https://aquadorcy.com
```

---

## Success Metrics

| Feature | Acceptance Criteria |
|---------|---------------------|
| Cart | Add/remove/update items; persists on refresh; shows correct count |
| Product Pages | All ~250 products have pages; correct metadata; variants selectable |
| Checkout | Redirects to Stripe; correct EUR amount; webhook confirms order |
| Contact | Email received; validation works; spam protection active |
| Currency | EUR displayed everywhere; Stripe charges EUR |
| SEO | Product pages are Server Components; JSON-LD present; proper meta tags |

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Large product dataset slows build | Use dynamic generation if >1000 products |
| Stripe webhook fails | Log all events; implement retry logic |
| Cart state corruption | Validate on hydration; handle gracefully |
| Email delivery issues | Use Resend's dashboard monitoring |

---

## Review Decisions

1. **Variant approach:** Support multiple variants with dropdown selector
   - Matches CSV structure (4 variants per product)
   - Better inventory representation
   - **Decision: Implement full variant support**

2. **Shipping:** Keep simple for MVP
   - Free shipping on all orders
   - Future: implement location-based calculation
   - **Decision: Free shipping for now**

3. **Order storage:** Email-only confirmation for MVP
   - No database needed initially
   - Future: Supabase for order history
   - **Decision: Email confirmation only**

4. **Product page links:** Update existing category pages
   - Change links from `/shop/[category]/[id]` to `/products/[slug]`
   - **Decision: Update during implementation**

---

## Phase 2 Review Checklist

### Technical Review
- [x] Cart state management appropriate for project scale
- [x] Dynamic routes correctly structured for App Router
- [x] Stripe currency configuration correct and consistent (EUR)
- [x] Server/Client Component boundaries properly defined
- [x] Contact form backend secure against spam and injection
- [x] Stripe using latest best practices (Checkout Sessions)
- [x] Stripe webhooks properly secured with signature verification
- [x] Checkout flow handling all edge cases

### Data Review
- [x] Plan accounts for all fields in products CSV
- [x] Product slugs properly sanitized for URLs
- [x] Product data properly typed with TypeScript interfaces

### UX Review
- [x] Cart interaction intuitive (add, remove, update quantity)
- [x] Product pages have all necessary information
- [x] Checkout flow currency-consistent

### SEO Review
- [x] Server Components improve crawlability
- [x] Meta tags planned for product pages
- [x] Structured data (JSON-LD) considered for products

**Review Status: APPROVED - Ready for Implementation**
