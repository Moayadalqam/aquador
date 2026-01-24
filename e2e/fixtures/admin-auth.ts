import { test as base, expect, Page } from '@playwright/test';

// Test credentials from environment variables
const TEST_ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@aquadorcy.com';
const TEST_ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'Aquadorcy1!';

export interface AdminAuthFixture {
  adminPage: Page;
  loginAsAdmin: (page: Page) => Promise<void>;
}

/**
 * Login helper function that authenticates as admin
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/admin/login');

  // Wait for page to fully load
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});

  // Dismiss cookie consent if visible - this must happen first
  const cookieAcceptButton = page.locator('button:has-text("Accept All")');
  if (await cookieAcceptButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await cookieAcceptButton.click();
    await page.waitForTimeout(1000);
  }

  // Wait for login form to be ready
  await expect(page.locator('input#email')).toBeVisible({ timeout: 10000 });

  // Fill in credentials
  await page.fill('input#email', TEST_ADMIN_EMAIL);
  await page.fill('input#password', TEST_ADMIN_PASSWORD);

  // Submit form
  await page.click('button:has-text("Sign In")');

  // Wait for sign-in button to finish loading (change from "Signing in..." back to something else)
  // or for the page to change
  const signInButton = page.locator('button:has-text("Sign In"), button:has-text("Signing in...")');
  const dashboardHeading = page.locator('h1:has-text("Dashboard")');
  const errorMessage = page.locator('.bg-red-500\\/10');
  const adminSidebar = page.locator('aside:has(a[href="/admin"])');

  // Wait for up to 30 seconds for login to complete
  const startTime = Date.now();
  const timeout = 30000;

  while (Date.now() - startTime < timeout) {
    // Check if we reached the dashboard
    if (await dashboardHeading.isVisible().catch(() => false)) {
      return;
    }

    // Check if we see the admin sidebar
    if (await adminSidebar.isVisible().catch(() => false)) {
      return;
    }

    // Check if there's an error
    if (await errorMessage.isVisible().catch(() => false)) {
      const errorText = await errorMessage.textContent();
      throw new Error(`Login failed: ${errorText}`);
    }

    // Wait a bit before checking again
    await page.waitForTimeout(500);
  }

  // Final check
  if (await dashboardHeading.isVisible().catch(() => false) ||
      await adminSidebar.isVisible().catch(() => false)) {
    return;
  }

  // Check for error one more time
  if (await errorMessage.isVisible().catch(() => false)) {
    const errorText = await errorMessage.textContent();
    throw new Error(`Login failed: ${errorText}`);
  }

  throw new Error('Login failed: Timeout waiting for dashboard');
}

/**
 * Extended test fixture with admin authentication
 */
export const test = base.extend<AdminAuthFixture>({
  adminPage: async ({ page }, use) => {
    await loginAsAdmin(page);
    await use(page);
  },
  loginAsAdmin: async ({}, use) => {
    await use(loginAsAdmin);
  },
});

export { expect };

// Page object selectors for admin pages
export const selectors = {
  login: {
    email: 'input#email',
    password: 'input#password',
    submitButton: 'button:has-text("Sign In")',
    errorMessage: '.bg-red-500\\/10',
    loadingSpinner: '.animate-spin',
    logo: 'img[alt="Aquad\'or Admin"]',
    title: 'h1:has-text("Admin Portal")',
    subtitle: 'text=Sign in to manage your store',
  },
  dashboard: {
    heading: 'h1:has-text("Dashboard")',
    statCards: '.bg-gray-900.rounded-xl.border',
    recentProducts: 'text=Recent Products',
    emptyState: 'text=No products yet',
    addProductButton: 'text=Add Your First Product',
    quickActions: 'text=Add New Product',
  },
  products: {
    heading: 'h1:has-text("Products")',
    searchInput: 'input[name="search"]',
    categoryFilter: 'select[name="category"]',
    addProductButton: 'text=Add Product',
    table: 'table',
    tableRows: 'tbody tr',
    emptyState: 'text=No products found',
    pagination: '.flex.items-center.justify-center.gap-2',
    deleteButton: 'button[title="Delete"]',
    editButton: 'a[title="Edit"]',
    viewButton: 'a[title="View on store"]',
  },
  productForm: {
    nameInput: 'input[name="name"]',
    descriptionTextarea: 'textarea[name="description"]',
    priceInput: 'input[name="price"]',
    categorySelect: 'select[name="category"]',
    typeSelect: 'select[name="product_type"]',
    sizeInput: 'input[name="size"]',
    imageInput: 'input[name="image"]',
    inStockCheckbox: 'input[name="in_stock"]',
    submitButton: 'button[type="submit"]',
    cancelButton: 'text=Cancel',
    deleteButton: 'text=Delete',
  },
  categories: {
    heading: 'h1:has-text("Categories")',
    categoryCards: '.bg-gray-900.rounded-xl.border.border-gray-800.p-6',
    viewCategoryButton: 'text=View Category',
    productCount: '.text-3xl.font-bold.text-gold',
  },
  settings: {
    heading: 'h1:has-text("Settings")',
    addAdminForm: 'form',
    emailInput: 'input[type="email"]',
    passwordInput: 'input[type="password"]',
    roleSelect: 'select',
    createAdminButton: 'text=Create Admin User',
    adminUsersList: 'text=Admin Users',
    storeInfo: 'text=Store Information',
    successMessage: '.bg-green-500\\/10',
    errorMessage: '.bg-red-500\\/10',
  },
  navigation: {
    sidebar: 'aside',
    dashboardLink: 'a[href="/admin"]',
    productsLink: 'a[href="/admin/products"]',
    categoriesLink: 'a[href="/admin/categories"]',
    settingsLink: 'a[href="/admin/settings"]',
    addProductSidebar: 'a[href="/admin/products/new"]',
    viewStoreLink: 'text=View Store',
    mobileMenuButton: 'button:has(.h-6.w-6)',
    userDropdown: '.relative button:has(.w-8.h-8.rounded-full)',
    signOutButton: 'text=Sign Out',
    activeLink: '.bg-gold\\/10.text-gold',
  },
  deleteModal: {
    modal: '.fixed.inset-0.z-50',
    title: 'h3:has-text("Delete Product")',
    confirmButton: 'button:has-text("Delete"):not(:has-text("Deleting"))',
    cancelButton: 'button:has-text("Cancel")',
  },
};
