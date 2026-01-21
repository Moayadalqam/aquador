import { test, expect } from '@playwright/test';

test.describe('Shopping Cart', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should show empty cart initially', async ({ page }) => {
    await page.goto('/');

    // Click cart icon
    await page.click('[aria-label*="Shopping cart"]');

    // Should show empty cart message
    await expect(page.locator('text=Your cart is empty')).toBeVisible();
  });

  test('should add product to cart from product page', async ({ page }) => {
    // Navigate to a product page
    await page.goto('/shop');

    // Click on first product card
    await page.locator('a[href^="/products/"]').first().click();

    // Wait for product page to load
    await expect(page.locator('text=Add to Cart')).toBeVisible();

    // Click add to cart
    await page.click('text=Add to Cart');

    // Cart drawer should open with item
    await expect(page.locator('text=Your Cart')).toBeVisible();

    // Should show 1 item in cart
    await expect(page.locator('[aria-label*="Shopping cart with 1"]')).toBeVisible();
  });

  test('should update quantity in cart', async ({ page }) => {
    // Add item to cart first
    await page.goto('/shop');
    await page.locator('a[href^="/products/"]').first().click();
    await page.click('text=Add to Cart');

    // Cart should be open
    await expect(page.locator('text=Your Cart')).toBeVisible();

    // Click increase quantity button
    const increaseButton = page.locator('button[aria-label="Increase quantity"]');
    await increaseButton.click();

    // Should show 2 items
    await expect(page.locator('[aria-label*="Shopping cart with 2"]')).toBeVisible();
  });

  test('should remove item from cart', async ({ page }) => {
    // Add item to cart first
    await page.goto('/shop');
    await page.locator('a[href^="/products/"]').first().click();
    await page.click('text=Add to Cart');

    // Cart should be open
    await expect(page.locator('text=Your Cart')).toBeVisible();

    // Click remove button
    await page.click('button[aria-label="Remove item"]');

    // Should show empty cart
    await expect(page.locator('text=Your cart is empty')).toBeVisible();
  });

  test('should clear entire cart', async ({ page }) => {
    // Add item to cart first
    await page.goto('/shop');
    await page.locator('a[href^="/products/"]').first().click();
    await page.click('text=Add to Cart');

    // Cart should be open
    await expect(page.locator('text=Your Cart')).toBeVisible();

    // Click clear cart
    await page.click('text=Clear Cart');

    // Should show empty cart
    await expect(page.locator('text=Your cart is empty')).toBeVisible();
  });

  test('should persist cart on page refresh', async ({ page }) => {
    // Add item to cart
    await page.goto('/shop');
    await page.locator('a[href^="/products/"]').first().click();
    await page.click('text=Add to Cart');

    // Close cart drawer
    await page.click('button[aria-label="Close cart"]');

    // Refresh page
    await page.reload();

    // Cart should still have 1 item
    await expect(page.locator('[aria-label*="Shopping cart with 1"]')).toBeVisible();
  });

  test('should show checkout button in cart', async ({ page }) => {
    // Add item to cart
    await page.goto('/shop');
    await page.locator('a[href^="/products/"]').first().click();
    await page.click('text=Add to Cart');

    // Should show checkout button
    await expect(page.locator('text=Proceed to Checkout')).toBeVisible();
  });
});
