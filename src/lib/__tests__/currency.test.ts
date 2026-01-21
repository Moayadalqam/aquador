import {
  CURRENCY,
  CURRENCY_CODE,
  CURRENCY_SYMBOL,
  formatPrice,
  toCents,
  fromCents,
  calculateSubtotal,
} from '../currency';

describe('Currency Utilities', () => {
  describe('constants', () => {
    it('should have EUR as the currency', () => {
      expect(CURRENCY).toBe('EUR');
    });

    it('should have eur as the currency code', () => {
      expect(CURRENCY_CODE).toBe('eur');
    });

    it('should have Euro symbol', () => {
      expect(CURRENCY_SYMBOL).toBe('\u20AC');
    });
  });

  describe('formatPrice', () => {
    it('should format a whole number price', () => {
      const formatted = formatPrice(100);
      expect(formatted).toMatch(/100[,.]00/);
      expect(formatted).toContain('\u20AC');
    });

    it('should format a decimal price', () => {
      const formatted = formatPrice(29.99);
      expect(formatted).toMatch(/29[,.]99/);
    });

    it('should format zero', () => {
      const formatted = formatPrice(0);
      expect(formatted).toMatch(/0[,.]00/);
    });

    it('should format large numbers', () => {
      const formatted = formatPrice(1234.56);
      expect(formatted).toMatch(/1[,.]?234[,.]56/);
    });

    it('should round to 2 decimal places', () => {
      const formatted = formatPrice(29.999);
      expect(formatted).toMatch(/30[,.]00/);
    });
  });

  describe('toCents', () => {
    it('should convert dollars to cents', () => {
      expect(toCents(1)).toBe(100);
    });

    it('should handle decimal amounts', () => {
      expect(toCents(29.99)).toBe(2999);
    });

    it('should handle zero', () => {
      expect(toCents(0)).toBe(0);
    });

    it('should round to nearest cent', () => {
      expect(toCents(1.999)).toBe(200);
    });

    it('should handle large amounts', () => {
      expect(toCents(1000)).toBe(100000);
    });
  });

  describe('fromCents', () => {
    it('should convert cents to dollars', () => {
      expect(fromCents(100)).toBe(1);
    });

    it('should handle decimal results', () => {
      expect(fromCents(2999)).toBe(29.99);
    });

    it('should handle zero', () => {
      expect(fromCents(0)).toBe(0);
    });

    it('should handle large amounts', () => {
      expect(fromCents(100000)).toBe(1000);
    });
  });

  describe('calculateSubtotal', () => {
    it('should calculate subtotal for single item', () => {
      const items = [{ price: 29.99, quantity: 1 }];
      expect(calculateSubtotal(items)).toBe(29.99);
    });

    it('should calculate subtotal for multiple quantities', () => {
      const items = [{ price: 10, quantity: 3 }];
      expect(calculateSubtotal(items)).toBe(30);
    });

    it('should calculate subtotal for multiple items', () => {
      const items = [
        { price: 29.99, quantity: 1 },
        { price: 19.99, quantity: 2 },
      ];
      expect(calculateSubtotal(items)).toBeCloseTo(69.97, 2);
    });

    it('should return 0 for empty cart', () => {
      expect(calculateSubtotal([])).toBe(0);
    });

    it('should handle items with zero quantity', () => {
      const items = [{ price: 29.99, quantity: 0 }];
      expect(calculateSubtotal(items)).toBe(0);
    });
  });
});
