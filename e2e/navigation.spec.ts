import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Aquad'or/);
  });

  test('should navigate to shop page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Explore Collection');
    await expect(page).toHaveURL('/shop');
  });

  test('should navigate to category pages', async ({ page }) => {
    await page.goto('/shop');

    // Check women category
    await page.click('text=Women');
    await expect(page).toHaveURL(/\/shop\/women/);

    // Go back and check men category
    await page.goto('/shop');
    await page.click('text=Men');
    await expect(page).toHaveURL(/\/shop\/men/);
  });

  test('should navigate to contact page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Contact');
    await expect(page).toHaveURL('/contact');
  });

  test('should navigate to about page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=About');
    await expect(page).toHaveURL('/about');
  });

  test('should navigate to create perfume page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Create Your Own');
    await expect(page).toHaveURL(/\/create/);
  });

  test('should show 404 for non-existent pages', async ({ page }) => {
    await page.goto('/non-existent-page');
    await expect(page.locator('text=404')).toBeVisible();
    await expect(page.locator('text=Page Not Found')).toBeVisible();
  });
});
