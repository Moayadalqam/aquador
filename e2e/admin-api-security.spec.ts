import { test, expect } from '@playwright/test';

test.describe('Admin API Security', () => {
  test('blocks unauthenticated POST to /api/admin/orders', async ({ request }) => {
    const response = await request.post('/api/admin/orders', {
      data: {
        customerEmail: 'test@example.com',
        items: [{ name: 'Test Product', quantity: 1, price: 10 }],
        total: 10,
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Unauthorized');
  });

  test('blocks unauthenticated POST to /api/admin/setup when setup complete', async ({
    request,
  }) => {
    // Setup route should reject requests without valid setup key
    const response = await request.post('/api/admin/setup', {
      data: {
        email: 'attacker@example.com',
        password: 'password123',
        setupKey: 'wrong-key',
      },
    });

    // Should be 401 (invalid key) or 403 (setup already complete)
    expect([401, 403]).toContain(response.status());
  });
});
