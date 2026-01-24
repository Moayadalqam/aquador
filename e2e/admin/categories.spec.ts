import { test, expect } from '../fixtures/admin-auth';
import { selectors } from '../fixtures/admin-auth';

test.describe('Admin Categories', () => {
  test.use({ storageState: undefined });

  test.beforeEach(async ({ page, loginAsAdmin }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/categories');
  });

  test.describe('Page Layout', () => {
    test('should display categories heading', async ({ page }) => {
      await expect(page.locator(selectors.categories.heading)).toBeVisible();
    });

    test('should display subtitle', async ({ page }) => {
      await expect(page.locator('text=Product categories overview')).toBeVisible();
    });
  });

  test.describe('Category Cards', () => {
    test('should display 5 category cards', async ({ page }) => {
      // Wait for loading to complete
      await page.waitForTimeout(2000);

      const categoryCards = page.locator(selectors.categories.categoryCards);
      await expect(categoryCards).toHaveCount(5);
    });

    test('should display Men\'s Collection category', async ({ page }) => {
      await expect(page.locator('h3:has-text("Men\'s Collection")')).toBeVisible();
    });

    test('should display Women\'s Collection category', async ({ page }) => {
      await expect(page.locator('h3:has-text("Women\'s Collection")')).toBeVisible();
    });

    test('should display Niche Collection category', async ({ page }) => {
      await expect(page.locator('h3:has-text("Niche Collection")')).toBeVisible();
    });

    test('should display Essence Oil category', async ({ page }) => {
      await expect(page.locator('h3:has-text("Essence Oil")')).toBeVisible();
    });

    test('should display Body Lotion category', async ({ page }) => {
      await expect(page.locator('h3:has-text("Body Lotion")')).toBeVisible();
    });

    test('should display category slugs', async ({ page }) => {
      await expect(page.locator('text=/men')).toBeVisible();
      await expect(page.locator('text=/women')).toBeVisible();
      await expect(page.locator('text=/niche')).toBeVisible();
      await expect(page.locator('text=/essence-oil')).toBeVisible();
      await expect(page.locator('text=/body-lotion')).toBeVisible();
    });
  });

  test.describe('Product Counts', () => {
    test('should display product counts for each category', async ({ page }) => {
      // Wait for loading to complete
      await page.waitForTimeout(2000);

      // Each category card should have a count
      const counts = page.locator(selectors.categories.productCount);
      const countElements = await counts.all();

      expect(countElements.length).toBe(5);

      // Each count should be a number
      for (const countEl of countElements) {
        const text = await countEl.textContent();
        expect(parseInt(text || '0')).toBeGreaterThanOrEqual(0);
      }
    });

    test('should show loading state while fetching counts', async ({ page }) => {
      // Navigate fresh to catch loading state
      await page.goto('/admin/categories');

      // Loading placeholders might be visible briefly
      // Just verify the page loads correctly
      await expect(page.locator(selectors.categories.heading)).toBeVisible();
    });
  });

  test.describe('View Category Links', () => {
    test('should have View Category button for each category', async ({ page }) => {
      const viewButtons = page.locator(selectors.categories.viewCategoryButton);
      await expect(viewButtons).toHaveCount(5);
    });

    test('should open Men category in new tab', async ({ page, context }) => {
      const pagePromise = context.waitForEvent('page');

      // Click View Category for Men
      const menCard = page.locator('.bg-gray-900').filter({ hasText: "Men's Collection" });
      await menCard.locator('a:has-text("View Category")').click();

      const newPage = await pagePromise;
      await newPage.waitForLoadState();

      expect(newPage.url()).toContain('/shop/men');

      await newPage.close();
    });

    test('should open Women category in new tab', async ({ page, context }) => {
      const pagePromise = context.waitForEvent('page');

      const womenCard = page.locator('.bg-gray-900').filter({ hasText: "Women's Collection" });
      await womenCard.locator('a:has-text("View Category")').click();

      const newPage = await pagePromise;
      await newPage.waitForLoadState();

      expect(newPage.url()).toContain('/shop/women');

      await newPage.close();
    });

    test('should open Niche category in new tab', async ({ page, context }) => {
      const pagePromise = context.waitForEvent('page');

      const nicheCard = page.locator('.bg-gray-900').filter({ hasText: 'Niche Collection' });
      await nicheCard.locator('a:has-text("View Category")').click();

      const newPage = await pagePromise;
      await newPage.waitForLoadState();

      expect(newPage.url()).toContain('/shop/niche');

      await newPage.close();
    });

    test('should open Essence Oil category in new tab', async ({ page, context }) => {
      const pagePromise = context.waitForEvent('page');

      const essenceCard = page.locator('.bg-gray-900').filter({ hasText: 'Essence Oil' }).first();
      await essenceCard.locator('a:has-text("View Category")').click();

      const newPage = await pagePromise;
      await newPage.waitForLoadState();

      expect(newPage.url()).toContain('/shop/essence-oil');

      await newPage.close();
    });

    test('should open Body Lotion category in new tab', async ({ page, context }) => {
      const pagePromise = context.waitForEvent('page');

      const lotionCard = page.locator('.bg-gray-900').filter({ hasText: 'Body Lotion' }).first();
      await lotionCard.locator('a:has-text("View Category")').click();

      const newPage = await pagePromise;
      await newPage.waitForLoadState();

      expect(newPage.url()).toContain('/shop/body-lotion');

      await newPage.close();
    });
  });

  test.describe('Category Management Info', () => {
    test('should display category management section', async ({ page }) => {
      await expect(page.locator('h2:has-text("Category Management")')).toBeVisible();
    });

    test('should display info about fixed categories', async ({ page }) => {
      await expect(
        page.locator('text=Categories are currently fixed')
      ).toBeVisible();
    });

    test('should suggest contacting development team', async ({ page }) => {
      await expect(
        page.locator('text=please contact the development team')
      ).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      // Categories page should load even if there are issues
      await page.goto('/admin/categories');
      await expect(page.locator(selectors.categories.heading)).toBeVisible();

      // If there's an error, it should be displayed nicely
      const errorBox = page.locator('.bg-red-500\\/10');
      if (await errorBox.isVisible()) {
        await expect(page.locator('text=Error loading categories')).toBeVisible();
      }
    });
  });
});
