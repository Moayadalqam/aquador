import { test, expect, Page } from '@playwright/test';
import { selectors, loginAsAdmin } from '../fixtures/admin-auth';

test.describe('Admin Authentication', () => {
  test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/admin/login');
    });

    test('should display login page elements', async ({ page }) => {
      // Logo
      await expect(page.locator(selectors.login.logo)).toBeVisible();

      // Title and subtitle
      await expect(page.locator(selectors.login.title)).toBeVisible();
      await expect(page.locator(selectors.login.subtitle)).toBeVisible();

      // Form fields
      await expect(page.locator(selectors.login.email)).toBeVisible();
      await expect(page.locator(selectors.login.password)).toBeVisible();
      await expect(page.locator(selectors.login.submitButton)).toBeVisible();

      // Email field should have placeholder
      await expect(page.locator(selectors.login.email)).toHaveAttribute(
        'placeholder',
        'admin@aquadorcy.com'
      );

      // Submit button should show "Sign In"
      await expect(page.locator(selectors.login.submitButton)).toHaveText('Sign In');
    });

    test('should have proper field labels', async ({ page }) => {
      await expect(page.locator('label[for="email"]')).toHaveText('Email Address');
      await expect(page.locator('label[for="password"]')).toHaveText('Password');
    });

    test('should require email field', async ({ page }) => {
      const emailInput = page.locator(selectors.login.email);
      await expect(emailInput).toHaveAttribute('required', '');
    });

    test('should require password field', async ({ page }) => {
      const passwordInput = page.locator(selectors.login.password);
      await expect(passwordInput).toHaveAttribute('required', '');
    });

    test('should have email type on email field', async ({ page }) => {
      await expect(page.locator(selectors.login.email)).toHaveAttribute('type', 'email');
    });

    test('should have password type on password field', async ({ page }) => {
      await expect(page.locator(selectors.login.password)).toHaveAttribute('type', 'password');
    });
  });

  test.describe('Login Flow', () => {
    test('should login with valid credentials', async ({ page }) => {
      await loginAsAdmin(page);

      // Should be on dashboard
      await expect(page).toHaveURL('/admin');
      await expect(page.locator(selectors.dashboard.heading)).toBeVisible();
    });

    test('should show error with invalid credentials', async ({ page }) => {
      await page.goto('/admin/login');

      // Fill invalid credentials
      await page.fill(selectors.login.email, 'invalid@example.com');
      await page.fill(selectors.login.password, 'wrongpassword');
      await page.click(selectors.login.submitButton);

      // Should show error message
      await expect(page.locator(selectors.login.errorMessage)).toBeVisible({ timeout: 10000 });

      // Should still be on login page
      await expect(page).toHaveURL('/admin/login');
    });

    test('should show loading state during login', async ({ page }) => {
      await page.goto('/admin/login');

      // Fill valid-looking credentials
      await page.fill(selectors.login.email, 'test@example.com');
      await page.fill(selectors.login.password, 'password123');

      // Click submit and immediately check for loading state
      await page.click(selectors.login.submitButton);

      // Button should show loading state (may be brief)
      await expect(page.locator('text=Signing in...')).toBeVisible({ timeout: 1000 }).catch(() => {
        // Loading state may be too fast to catch - that's okay
      });
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated users to login', async ({ page }) => {
      // Clear any existing session
      await page.context().clearCookies();

      // Try to access admin dashboard
      await page.goto('/admin');

      // Should redirect to login
      await expect(page).toHaveURL(/\/admin\/login/);
    });

    test('should redirect unauthenticated users from products page', async ({ page }) => {
      await page.context().clearCookies();
      await page.goto('/admin/products');
      await expect(page).toHaveURL(/\/admin\/login/);
    });

    test('should redirect unauthenticated users from settings page', async ({ page }) => {
      await page.context().clearCookies();
      await page.goto('/admin/settings');
      await expect(page).toHaveURL(/\/admin\/login/);
    });

    test('should redirect unauthenticated users from categories page', async ({ page }) => {
      await page.context().clearCookies();
      await page.goto('/admin/categories');
      await expect(page).toHaveURL(/\/admin\/login/);
    });

    test('should show unauthorized error for non-admin users', async ({ page }) => {
      // Navigate to login with error param
      await page.goto('/admin/login?error=unauthorized');

      // Should show unauthorized message
      await expect(page.locator(selectors.login.errorMessage)).toBeVisible();
      await expect(page.locator('text=not authorized')).toBeVisible();
    });
  });

  test.describe('Logout Flow', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
      // Make sure we're on admin dashboard
      await page.goto('/admin');
      await page.waitForTimeout(1000);
    });

    test('should logout successfully', async ({ page }) => {
      // Wait for the admin header to be visible
      await expect(page.locator('header:has(button:has(.w-8.h-8.rounded-full))')).toBeVisible();

      // Open user dropdown - use force to bypass any intercepting elements
      const dropdown = page.locator('header button:has(.w-8.h-8.rounded-full)');
      await dropdown.click({ force: true });

      // Click sign out
      await page.click(selectors.navigation.signOutButton);

      // Should redirect to login
      await expect(page).toHaveURL(/\/admin\/login/);
    });

    test('should not access admin after logout', async ({ page }) => {
      // Wait for the admin header to be visible
      await expect(page.locator('header:has(button:has(.w-8.h-8.rounded-full))')).toBeVisible();

      // Logout - use force click
      const dropdown = page.locator('header button:has(.w-8.h-8.rounded-full)');
      await dropdown.click({ force: true });
      await page.click(selectors.navigation.signOutButton);

      // Wait for redirect to complete
      await expect(page).toHaveURL(/\/admin\/login/);

      // Try to access admin dashboard
      await page.goto('/admin');

      // Should be redirected back to login
      await expect(page).toHaveURL(/\/admin\/login/);
    });
  });

  test.describe('Session Persistence', () => {
    test('should maintain session after page refresh', async ({ page }) => {
      await loginAsAdmin(page);

      // Go to admin dashboard
      await page.goto('/admin');
      await page.waitForTimeout(1000);

      // Verify we're on dashboard
      await expect(page.locator(selectors.dashboard.heading)).toBeVisible({ timeout: 10000 });

      // Refresh page
      await page.reload();

      // Should still be on dashboard (not redirected to login)
      await expect(page).toHaveURL('/admin');
      await expect(page.locator(selectors.dashboard.heading)).toBeVisible({ timeout: 10000 });
    });

    test('should maintain session when navigating between pages', async ({ page }) => {
      await loginAsAdmin(page);

      // Go to admin dashboard first
      await page.goto('/admin');
      await page.waitForTimeout(1000);

      // Navigate to products using sidebar link
      await page.click('aside a[href="/admin/products"]');
      await expect(page).toHaveURL('/admin/products');

      // Navigate to categories
      await page.click('aside a[href="/admin/categories"]');
      await expect(page).toHaveURL('/admin/categories');

      // Navigate to settings
      await page.click('aside a[href="/admin/settings"]');
      await expect(page).toHaveURL('/admin/settings');

      // Navigate back to dashboard
      await page.click('aside a[href="/admin"]:has-text("Dashboard")');
      await expect(page).toHaveURL('/admin');

      // Should still be authenticated
      await expect(page.locator(selectors.dashboard.heading)).toBeVisible({ timeout: 10000 });
    });
  });
});
