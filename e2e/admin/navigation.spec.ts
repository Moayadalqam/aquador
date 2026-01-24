import { test, expect } from '../fixtures/admin-auth';
import { selectors } from '../fixtures/admin-auth';

test.describe('Admin Navigation', () => {
  test.use({ storageState: undefined });

  test.beforeEach(async ({ page, loginAsAdmin }) => {
    await loginAsAdmin(page);
  });

  test.describe('Sidebar Navigation', () => {
    test('should display sidebar on desktop', async ({ page }) => {
      // Ensure we're on a desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });

      await expect(page.locator(selectors.navigation.sidebar)).toBeVisible();
    });

    test('should hide sidebar on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/admin');

      // Sidebar should be hidden (has hidden lg:block class)
      const sidebar = page.locator('aside.hidden');
      await expect(sidebar).toBeHidden();
    });

    test('should display logo in sidebar', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });

      const logo = page.locator('aside img[alt="Aquad\'or"]');
      await expect(logo).toBeVisible();
    });

    test('should have Dashboard link', async ({ page }) => {
      await expect(page.locator(selectors.navigation.dashboardLink)).toBeVisible();
    });

    test('should have Products link', async ({ page }) => {
      await expect(page.locator(selectors.navigation.productsLink)).toBeVisible();
    });

    test('should have Categories link', async ({ page }) => {
      await expect(page.locator(selectors.navigation.categoriesLink)).toBeVisible();
    });

    test('should have Settings link', async ({ page }) => {
      await expect(page.locator(selectors.navigation.settingsLink)).toBeVisible();
    });

    test('should have Add Product button in sidebar', async ({ page }) => {
      await expect(page.locator(selectors.navigation.addProductSidebar)).toBeVisible();
    });

    test('should have View Store link', async ({ page }) => {
      await expect(page.locator(selectors.navigation.viewStoreLink)).toBeVisible();
    });
  });

  test.describe('Navigation Links', () => {
    test('should navigate to dashboard', async ({ page }) => {
      await page.goto('/admin/products');
      await page.click(selectors.navigation.dashboardLink);

      await expect(page).toHaveURL('/admin');
      await expect(page.locator(selectors.dashboard.heading)).toBeVisible();
    });

    test('should navigate to products', async ({ page }) => {
      await page.click(selectors.navigation.productsLink);

      await expect(page).toHaveURL('/admin/products');
      await expect(page.locator(selectors.products.heading)).toBeVisible();
    });

    test('should navigate to categories', async ({ page }) => {
      await page.click(selectors.navigation.categoriesLink);

      await expect(page).toHaveURL('/admin/categories');
      await expect(page.locator(selectors.categories.heading)).toBeVisible();
    });

    test('should navigate to settings', async ({ page }) => {
      await page.click(selectors.navigation.settingsLink);

      await expect(page).toHaveURL('/admin/settings');
      await expect(page.locator(selectors.settings.heading)).toBeVisible();
    });

    test('should navigate to add product from sidebar', async ({ page }) => {
      await page.click(selectors.navigation.addProductSidebar);

      await expect(page).toHaveURL('/admin/products/new');
      await expect(page.locator('h1:has-text("Add New Product")')).toBeVisible();
    });
  });

  test.describe('Active State', () => {
    test('should highlight Dashboard when on dashboard page', async ({ page }) => {
      await page.goto('/admin');

      const dashboardLink = page.locator('a[href="/admin"]:has-text("Dashboard")');
      await expect(dashboardLink).toHaveClass(/bg-gold\/10/);
      await expect(dashboardLink).toHaveClass(/text-gold/);
    });

    test('should highlight Products when on products page', async ({ page }) => {
      await page.goto('/admin/products');

      const productsLink = page.locator('a[href="/admin/products"]:has-text("Products")');
      await expect(productsLink).toHaveClass(/bg-gold\/10/);
      await expect(productsLink).toHaveClass(/text-gold/);
    });

    test('should highlight Categories when on categories page', async ({ page }) => {
      await page.goto('/admin/categories');

      const categoriesLink = page.locator('a[href="/admin/categories"]:has-text("Categories")');
      await expect(categoriesLink).toHaveClass(/bg-gold\/10/);
      await expect(categoriesLink).toHaveClass(/text-gold/);
    });

    test('should highlight Settings when on settings page', async ({ page }) => {
      await page.goto('/admin/settings');

      const settingsLink = page.locator('a[href="/admin/settings"]:has-text("Settings")');
      await expect(settingsLink).toHaveClass(/bg-gold\/10/);
      await expect(settingsLink).toHaveClass(/text-gold/);
    });

    test('should highlight Products when on new product page', async ({ page }) => {
      await page.goto('/admin/products/new');

      // Products link should be active since /admin/products/new starts with /admin/products
      const productsLink = page.locator('a[href="/admin/products"]:has-text("Products")');
      await expect(productsLink).toHaveClass(/bg-gold\/10/);
    });
  });

  test.describe('Header', () => {
    test('should display Admin Panel title', async ({ page }) => {
      await expect(page.locator('h1:has-text("Admin Panel")')).toBeVisible();
    });

    test('should display user dropdown button', async ({ page }) => {
      await expect(page.locator(selectors.navigation.userDropdown)).toBeVisible();
    });

    test('should display user email in dropdown', async ({ page }) => {
      // Click to open dropdown
      await page.click(selectors.navigation.userDropdown);

      // Email should be visible
      await expect(page.locator('.text-white.truncate:has-text("@")')).toBeVisible();
    });

    test('should display user role in dropdown', async ({ page }) => {
      await page.click(selectors.navigation.userDropdown);

      // Role should be visible (admin or super admin)
      const roleText = page.locator('.capitalize:has-text("admin")');
      await expect(roleText.first()).toBeVisible();
    });

    test('should show Sign Out option in dropdown', async ({ page }) => {
      await page.click(selectors.navigation.userDropdown);

      await expect(page.locator(selectors.navigation.signOutButton)).toBeVisible();
    });

    test('should close dropdown when clicking outside', async ({ page }) => {
      // Open dropdown
      await page.click(selectors.navigation.userDropdown);
      await expect(page.locator(selectors.navigation.signOutButton)).toBeVisible();

      // Click outside
      await page.click('h1:has-text("Dashboard")');

      // Dropdown should close
      await expect(page.locator(selectors.navigation.signOutButton)).not.toBeVisible();
    });
  });

  test.describe('View Store Link', () => {
    test('should open store in new tab', async ({ page, context }) => {
      const pagePromise = context.waitForEvent('page');

      await page.click(selectors.navigation.viewStoreLink);

      const newPage = await pagePromise;
      await newPage.waitForLoadState();

      expect(newPage.url()).toMatch(/http:\/\/localhost:3000\/?$/);

      await newPage.close();
    });
  });

  test.describe('Mobile Navigation', () => {
    test.beforeEach(async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
    });

    test('should show mobile menu button', async ({ page }) => {
      await page.goto('/admin');

      const menuButton = page.locator('button:has(.h-6.w-6)');
      await expect(menuButton).toBeVisible();
    });

    test('should display header title on mobile', async ({ page }) => {
      await page.goto('/admin');

      await expect(page.locator('h1:has-text("Admin Panel")')).toBeVisible();
    });

    test('should display user dropdown on mobile', async ({ page }) => {
      await page.goto('/admin');

      await expect(page.locator(selectors.navigation.userDropdown)).toBeVisible();
    });
  });

  test.describe('Navigation Consistency', () => {
    test('should maintain navigation after page refresh', async ({ page }) => {
      await page.goto('/admin/products');
      await page.reload();

      await expect(page).toHaveURL('/admin/products');
      await expect(page.locator(selectors.products.heading)).toBeVisible();
    });

    test('should maintain correct active state after navigation', async ({ page }) => {
      // Start at dashboard
      await page.goto('/admin');

      // Navigate to products
      await page.click(selectors.navigation.productsLink);
      await expect(page).toHaveURL('/admin/products');

      // Products should now be active
      const productsLink = page.locator('a[href="/admin/products"]:has-text("Products")');
      await expect(productsLink).toHaveClass(/bg-gold\/10/);

      // Dashboard should not be active
      const dashboardLink = page.locator('a[href="/admin"]:has-text("Dashboard")');
      await expect(dashboardLink).not.toHaveClass(/bg-gold\/10/);
    });

    test('should navigate correctly with back button', async ({ page }) => {
      // Start at dashboard
      await page.goto('/admin');

      // Navigate to products
      await page.click(selectors.navigation.productsLink);
      await expect(page).toHaveURL('/admin/products');

      // Navigate to categories
      await page.click(selectors.navigation.categoriesLink);
      await expect(page).toHaveURL('/admin/categories');

      // Go back
      await page.goBack();
      await expect(page).toHaveURL('/admin/products');

      // Go back again
      await page.goBack();
      await expect(page).toHaveURL('/admin');
    });
  });
});
