/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

// Mock Stripe before importing the route
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          id: 'cs_test_123',
          url: 'https://checkout.stripe.com/pay/cs_test_123',
        }),
      },
    },
  }));
});

// Mock environment variable
const originalEnv = process.env;

beforeAll(() => {
  process.env = {
    ...originalEnv,
    STRIPE_SECRET_KEY: 'sk_test_123',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  };
});

afterAll(() => {
  process.env = originalEnv;
});

// Import after mocking
import { POST } from '../route';

describe('Checkout API Route', () => {
  const createMockRequest = (body: object) => {
    return new NextRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  };

  const validCartItems = [
    {
      productId: 'test-product',
      variantId: 'test-variant',
      quantity: 1,
      name: 'Test Perfume',
      image: 'https://example.com/image.jpg',
      price: 29.99,
      size: '50ml',
      productType: 'perfume',
    },
  ];

  describe('POST /api/checkout', () => {
    it('should create a checkout session for valid cart', async () => {
      const request = createMockRequest({ items: validCartItems });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('sessionId');
      expect(data).toHaveProperty('url');
    });

    it('should return 400 for empty cart', async () => {
      const request = createMockRequest({ items: [] });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Cart is empty');
    });

    it('should return 400 for missing items', async () => {
      const request = createMockRequest({});

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Cart is empty');
    });

    it('should return 400 for non-array items', async () => {
      const request = createMockRequest({ items: 'not an array' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Cart is empty');
    });

    it('should handle multiple items in cart', async () => {
      const multipleItems = [
        ...validCartItems,
        {
          productId: 'test-product-2',
          variantId: 'test-variant-2',
          quantity: 2,
          name: 'Test Perfume 2',
          image: 'https://example.com/image2.jpg',
          price: 39.99,
          size: '100ml',
          productType: 'perfume',
        },
      ];

      const request = createMockRequest({ items: multipleItems });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('sessionId');
    });
  });
});
