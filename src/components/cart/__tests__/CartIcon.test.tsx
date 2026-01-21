import { render, screen, fireEvent } from '@testing-library/react';
import CartIcon from '../CartIcon';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, whileHover: _whileHover, whileTap: _whileTap, ...props }: React.ComponentProps<'button'> & { whileHover?: unknown; whileTap?: unknown }) => (
      <button {...props}>{children}</button>
    ),
    span: ({ children, initial: _initial, animate: _animate, ...props }: React.ComponentProps<'span'> & { initial?: unknown; animate?: unknown }) => (
      <span {...props}>{children}</span>
    ),
  },
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  ShoppingBag: () => <svg data-testid="shopping-bag-icon" />,
}));

// Mock useCart hook
const mockOpenCart = jest.fn();
jest.mock('../CartProvider', () => ({
  useCart: () => ({
    itemCount: mockItemCount,
    openCart: mockOpenCart,
  }),
}));

let mockItemCount = 0;

describe('CartIcon Component', () => {
  beforeEach(() => {
    mockItemCount = 0;
    mockOpenCart.mockClear();
  });

  describe('rendering', () => {
    it('should render shopping bag icon', () => {
      render(<CartIcon />);
      expect(screen.getByTestId('shopping-bag-icon')).toBeInTheDocument();
    });

    it('should render as a button', () => {
      render(<CartIcon />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('item count display', () => {
    it('should display 0 when cart is empty', () => {
      mockItemCount = 0;
      render(<CartIcon />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should display correct count for single item', () => {
      mockItemCount = 1;
      render(<CartIcon />);
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should display correct count for multiple items', () => {
      mockItemCount = 5;
      render(<CartIcon />);
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should display 99+ for counts over 99', () => {
      mockItemCount = 150;
      render(<CartIcon />);
      expect(screen.getByText('99+')).toBeInTheDocument();
    });

    it('should display 99 for exactly 99 items', () => {
      mockItemCount = 99;
      render(<CartIcon />);
      expect(screen.getByText('99')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have accessible label with item count', () => {
      mockItemCount = 3;
      render(<CartIcon />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Shopping cart with 3 items');
    });

    it('should update aria-label when count changes', () => {
      mockItemCount = 0;
      const { rerender } = render(<CartIcon />);
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Shopping cart with 0 items');

      mockItemCount = 5;
      rerender(<CartIcon />);
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Shopping cart with 5 items');
    });
  });

  describe('interactions', () => {
    it('should call openCart when clicked', () => {
      render(<CartIcon />);
      fireEvent.click(screen.getByRole('button'));
      expect(mockOpenCart).toHaveBeenCalledTimes(1);
    });
  });
});
