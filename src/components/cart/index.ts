export { CartProvider, useCart } from './CartProvider';
export { default as CartIcon } from './CartIcon';
export { default as CartDrawer } from './CartDrawer';
export { default as CheckoutButton } from './CheckoutButton';

// CartItem is only used internally by CartDrawer — no need to re-export.
// Prefer importing CartIcon directly from './CartIcon' in lightweight consumers
// (e.g. Navbar) to avoid bundling CartDrawer into the navbar chunk.
