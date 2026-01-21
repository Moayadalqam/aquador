import type { Cart, CartItem, CartAction } from '@/types/cart';

// Replicate the cart reducer logic for testing
function cartReducer(state: Cart, action: CartAction): Cart {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        (item) => item.variantId === action.payload.variantId
      );

      if (existingIndex >= 0) {
        const newItems = [...state.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + action.payload.quantity,
        };
        return { ...state, items: newItems };
      }

      return { ...state, items: [...state.items, action.payload] };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.variantId !== action.payload.variantId),
      };

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.variantId !== action.payload.variantId),
        };
      }

      return {
        ...state,
        items: state.items.map((item) =>
          item.variantId === action.payload.variantId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }

    case 'CLEAR_CART':
      return { items: [] };

    case 'HYDRATE':
      return action.payload;

    default:
      return state;
  }
}

const createTestItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  productId: 'test-product',
  variantId: 'test-variant',
  quantity: 1,
  name: 'Test Product',
  image: '/test.jpg',
  price: 29.99,
  size: '50ml',
  productType: 'perfume',
  ...overrides,
});

describe('Cart Reducer', () => {
  const initialState: Cart = { items: [] };

  describe('ADD_ITEM', () => {
    it('should add a new item to empty cart', () => {
      const item = createTestItem();
      const action: CartAction = { type: 'ADD_ITEM', payload: item };

      const newState = cartReducer(initialState, action);

      expect(newState.items.length).toBe(1);
      expect(newState.items[0]).toEqual(item);
    });

    it('should increment quantity for existing item', () => {
      const item = createTestItem();
      const stateWithItem: Cart = { items: [item] };
      const action: CartAction = { type: 'ADD_ITEM', payload: { ...item, quantity: 2 } };

      const newState = cartReducer(stateWithItem, action);

      expect(newState.items.length).toBe(1);
      expect(newState.items[0].quantity).toBe(3);
    });

    it('should add different variants as separate items', () => {
      const item1 = createTestItem({ variantId: 'variant-1' });
      const item2 = createTestItem({ variantId: 'variant-2' });
      const stateWithItem: Cart = { items: [item1] };
      const action: CartAction = { type: 'ADD_ITEM', payload: item2 };

      const newState = cartReducer(stateWithItem, action);

      expect(newState.items.length).toBe(2);
    });
  });

  describe('REMOVE_ITEM', () => {
    it('should remove item from cart', () => {
      const item = createTestItem();
      const stateWithItem: Cart = { items: [item] };
      const action: CartAction = { type: 'REMOVE_ITEM', payload: { variantId: item.variantId } };

      const newState = cartReducer(stateWithItem, action);

      expect(newState.items.length).toBe(0);
    });

    it('should only remove specified item', () => {
      const item1 = createTestItem({ variantId: 'variant-1' });
      const item2 = createTestItem({ variantId: 'variant-2' });
      const stateWithItems: Cart = { items: [item1, item2] };
      const action: CartAction = { type: 'REMOVE_ITEM', payload: { variantId: 'variant-1' } };

      const newState = cartReducer(stateWithItems, action);

      expect(newState.items.length).toBe(1);
      expect(newState.items[0].variantId).toBe('variant-2');
    });

    it('should do nothing for non-existent item', () => {
      const item = createTestItem();
      const stateWithItem: Cart = { items: [item] };
      const action: CartAction = { type: 'REMOVE_ITEM', payload: { variantId: 'non-existent' } };

      const newState = cartReducer(stateWithItem, action);

      expect(newState.items.length).toBe(1);
    });
  });

  describe('UPDATE_QUANTITY', () => {
    it('should update quantity for existing item', () => {
      const item = createTestItem();
      const stateWithItem: Cart = { items: [item] };
      const action: CartAction = { type: 'UPDATE_QUANTITY', payload: { variantId: item.variantId, quantity: 5 } };

      const newState = cartReducer(stateWithItem, action);

      expect(newState.items[0].quantity).toBe(5);
    });

    it('should remove item when quantity is zero', () => {
      const item = createTestItem();
      const stateWithItem: Cart = { items: [item] };
      const action: CartAction = { type: 'UPDATE_QUANTITY', payload: { variantId: item.variantId, quantity: 0 } };

      const newState = cartReducer(stateWithItem, action);

      expect(newState.items.length).toBe(0);
    });

    it('should remove item when quantity is negative', () => {
      const item = createTestItem();
      const stateWithItem: Cart = { items: [item] };
      const action: CartAction = { type: 'UPDATE_QUANTITY', payload: { variantId: item.variantId, quantity: -1 } };

      const newState = cartReducer(stateWithItem, action);

      expect(newState.items.length).toBe(0);
    });
  });

  describe('CLEAR_CART', () => {
    it('should remove all items from cart', () => {
      const item1 = createTestItem({ variantId: 'variant-1' });
      const item2 = createTestItem({ variantId: 'variant-2' });
      const stateWithItems: Cart = { items: [item1, item2] };
      const action: CartAction = { type: 'CLEAR_CART' };

      const newState = cartReducer(stateWithItems, action);

      expect(newState.items.length).toBe(0);
    });
  });

  describe('HYDRATE', () => {
    it('should replace cart state with hydrated data', () => {
      const item = createTestItem();
      const hydratedState: Cart = { items: [item] };
      const action: CartAction = { type: 'HYDRATE', payload: hydratedState };

      const newState = cartReducer(initialState, action);

      expect(newState).toEqual(hydratedState);
    });
  });
});
