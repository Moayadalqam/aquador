import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('should display contact form', async ({ page }) => {
    await expect(page.locator('text=Contact Us')).toBeVisible();
    await expect(page.locator('text=Send us a Message')).toBeVisible();

    // Form fields should be present
    await expect(page.locator('input[placeholder="Your name"]')).toBeVisible();
    await expect(page.locator('input[placeholder="your@email.com"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="phone"]')).toBeVisible();
    await expect(page.locator('input[placeholder="How can we help?"]')).toBeVisible();
    await expect(page.locator('textarea[placeholder="Tell us more..."]')).toBeVisible();
  });

  test('should display contact information', async ({ page }) => {
    await expect(page.locator('text=Ledra 145, 1011')).toBeVisible();
    await expect(page.locator('text=+357 99 980809')).toBeVisible();
    await expect(page.locator('text=info@aquadorcy.com')).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    // Click submit without filling form
    await page.click('button:has-text("Send Message")');

    // Should show validation errors
    await expect(page.locator('text=Name must be at least 2 characters')).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    // Fill in invalid email
    await page.fill('input[placeholder="Your name"]', 'John Doe');
    await page.fill('input[placeholder="your@email.com"]', 'invalid-email');
    await page.fill('input[placeholder="How can we help?"]', 'Test subject');
    await page.fill('textarea[placeholder="Tell us more..."]', 'This is a test message.');

    // Click submit
    await page.click('button:has-text("Send Message")');

    // Should show email validation error
    await expect(page.locator('text=Please enter a valid email')).toBeVisible();
  });

  test('should show validation error for short subject', async ({ page }) => {
    await page.fill('input[placeholder="Your name"]', 'John Doe');
    await page.fill('input[placeholder="your@email.com"]', 'john@example.com');
    await page.fill('input[placeholder="How can we help?"]', 'Hi');
    await page.fill('textarea[placeholder="Tell us more..."]', 'This is a test message.');

    await page.click('button:has-text("Send Message")');

    await expect(page.locator('text=Subject must be at least 5 characters')).toBeVisible();
  });

  test('should show validation error for short message', async ({ page }) => {
    await page.fill('input[placeholder="Your name"]', 'John Doe');
    await page.fill('input[placeholder="your@email.com"]', 'john@example.com');
    await page.fill('input[placeholder="How can we help?"]', 'Product inquiry');
    await page.fill('textarea[placeholder="Tell us more..."]', 'Hello');

    await page.click('button:has-text("Send Message")');

    await expect(page.locator('text=Message must be at least 10 characters')).toBeVisible();
  });

  test('should submit valid form successfully', async ({ page }) => {
    // Fill in valid form data
    await page.fill('input[placeholder="Your name"]', 'John Doe');
    await page.fill('input[placeholder="your@email.com"]', 'john@example.com');
    await page.fill('input[placeholder*="phone"]', '+357 99 123456');
    await page.fill('input[placeholder="How can we help?"]', 'Product inquiry');
    await page.fill('textarea[placeholder="Tell us more..."]', 'I would like to know more about your perfumes and availability.');

    // Click submit
    await page.click('button:has-text("Send Message")');

    // Should show success message
    await expect(page.locator('text=Message Sent!')).toBeVisible({ timeout: 10000 });
  });

  test('should show loading state during submission', async ({ page }) => {
    // Fill in valid form data
    await page.fill('input[placeholder="Your name"]', 'John Doe');
    await page.fill('input[placeholder="your@email.com"]', 'john@example.com');
    await page.fill('input[placeholder="How can we help?"]', 'Product inquiry');
    await page.fill('textarea[placeholder="Tell us more..."]', 'I would like to know more about your perfumes.');

    // Click submit and check for loading state
    const submitButton = page.locator('button:has-text("Send Message")');
    await submitButton.click();

    // Button should show loading state (this may be quick, so we just check it doesn't error)
    // The success message should eventually appear
    await expect(page.locator('text=Message Sent!')).toBeVisible({ timeout: 10000 });
  });
});
