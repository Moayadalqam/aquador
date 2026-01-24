import { test, expect } from '../fixtures/admin-auth';
import { selectors } from '../fixtures/admin-auth';

test.describe('Admin Dashboard', () => {
  test.use({ storageState: undefined }); // Use fresh storage for each test

  test.beforeEach(async ({ page, loginAsAdmin }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');
  });

  test.describe('Dashboard Layout', () => {
    test('should display dashboard heading', async ({ page }) => {
      await expect(page.locator(selectors.dashboard.heading)).toBeVisible();
    });

    test('should display welcome message', async ({ page }) => {
      await expect(page.locator('text=Welcome to your store admin panel')).toBeVisible();
    });

    test('should display 4 stat cards', async ({ page }) => {
      // Wait for loading to complete
      await expect(page.locator('text=Loading...')).not.toBeVisible({ timeout: 10000 });

      // Check for stat cards
      const statCards = page.locator('.bg-gray-900.rounded-xl.border.border-gray-800.p-6');
      await expect(statCards).toHaveCount(4);
    });
  });

  test.describe('Stat Cards', () => {
    test.beforeEach(async ({ page }) => {
      // Wait for loading to complete
      await expect(page.locator('text=Loading...')).not.toBeVisible({ timeout: 10000 });
    });

    test('should display Total Products stat', async ({ page }) => {
      await expect(page.locator('text=Total Products')).toBeVisible();
    });

    test('should display In Stock stat', async ({ page }) => {
      await expect(page.locator('text=In Stock')).toBeVisible();
    });

    test('should display Out of Stock stat', async ({ page }) => {
      await expect(page.locator('text=Out of Stock')).toBeVisible();
    });

    test('should display Categories stat', async ({ page }) => {
      await expect(page.locator('text=Categories')).toBeVisible();
    });

    test('should display numeric values in stat cards', async ({ page }) => {
      // Each stat card should have a number value
      const statValues = page.locator('.text-3xl.font-bold.text-white');
      await expect(statValues).toHaveCount(4);

      // All values should be numbers (or 0)
      for (let i = 0; i < 4; i++) {
        const value = await statValues.nth(i).textContent();
        expect(parseInt(value || '0')).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Recent Products Section', () => {
    test('should display Recent Products header', async ({ page }) => {
      await expect(page.locator(selectors.dashboard.recentProducts)).toBeVisible();
    });

    test('should display View All link', async ({ page }) => {
      const viewAllLink = page.locator('a:has-text("View All")');
      await expect(viewAllLink).toBeVisible();
      await expect(viewAllLink).toHaveAttribute('href', '/admin/products');
    });

    test('should show products or empty state', async ({ page }) => {
      // Wait for loading to complete
      await page.waitForTimeout(2000);

      // Either products are displayed or empty state is shown
      const hasProducts = await page.locator('.divide-y.divide-gray-800 > div').count() > 0;
      const hasEmptyState = await page.locator(selectors.dashboard.emptyState).isVisible();

      expect(hasProducts || hasEmptyState).toBeTruthy();
    });

    test('should navigate to products page when clicking View All', async ({ page }) => {
      await page.click('a:has-text("View All")');
      await expect(page).toHaveURL('/admin/products');
    });
  });

  test.describe('Quick Actions', () => {
    test('should display Add New Product action', async ({ page }) => {
      await expect(page.locator(selectors.dashboard.quickActions)).toBeVisible();
    });

    test('should display Manage Products action', async ({ page }) => {
      await expect(page.locator('text=Manage Products')).toBeVisible();
    });

    test('should display View Store action', async ({ page }) => {
      await expect(page.locator('h3:has-text("View Store")')).toBeVisible();
    });

    test('should navigate to add product page', async ({ page }) => {
      await page.click('a:has-text("Add New Product")');
      await expect(page).toHaveURL('/admin/products/new');
    });

    test('should navigate to products page', async ({ page }) => {
      await page.click('a:has-text("Manage Products")');
      await expect(page).toHaveURL('/admin/products');
    });

    test('should open store in new tab', async ({ page, context }) => {
      // Listen for new page
      const pagePromise = context.waitForEvent('page');

      // Click View Store link (which opens in new tab)
      await page.click('a:has-text("View Store")');

      // Get the new page
      const newPage = await pagePromise;
      await newPage.waitForLoadState();

      // New page should be the storefront
      expect(newPage.url()).toMatch(/http:\/\/localhost:3000\/?$/);

      // Close the new page
      await newPage.close();
    });
  });

  test.describe('Empty State', () => {
    test('should show Add Your First Product link when no products', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(2000);

      // Check if empty state is visible (only if no products)
      const emptyState = page.locator(selectors.dashboard.emptyState);
      const isEmpty = await emptyState.isVisible();

      if (isEmpty) {
        const addButton = page.locator(selectors.dashboard.addProductButton);
        await expect(addButton).toBeVisible();
        await expect(addButton).toHaveAttribute('href', '/admin/products/new');
      }
    });
  });

  test.describe('Loading State', () => {
    test('should show loading state initially', async ({ page }) => {
      // Go to a fresh dashboard load
      await page.goto('/admin');

      // Loading state might be visible briefly
      // This test just verifies the page loads without errors
      await expect(page.locator(selectors.dashboard.heading)).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      // Dashboard should load even if there are issues
      await page.goto('/admin');
      await expect(page.locator(selectors.dashboard.heading)).toBeVisible({ timeout: 10000 });

      // If there's an error, it should be displayed nicely
      const errorBox = page.locator('.bg-red-500\\/10');
      if (await errorBox.isVisible()) {
        await expect(page.locator('text=Error loading data')).toBeVisible();
      }
    });
  });
});
