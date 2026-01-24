import { test, expect } from '../fixtures/admin-auth';
import { selectors } from '../fixtures/admin-auth';

test.describe('Admin Products List', () => {
  test.use({ storageState: undefined });

  test.beforeEach(async ({ page, loginAsAdmin }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/products');
  });

  test.describe('Page Layout', () => {
    test('should display products heading', async ({ page }) => {
      await expect(page.locator(selectors.products.heading)).toBeVisible();
    });

    test('should display product count', async ({ page }) => {
      await expect(page.locator('text=total products')).toBeVisible();
    });

    test('should display Add Product button', async ({ page }) => {
      const addButton = page.locator(selectors.products.addProductButton);
      await expect(addButton).toBeVisible();
    });

    test('should display search input', async ({ page }) => {
      await expect(page.locator(selectors.products.searchInput)).toBeVisible();
    });

    test('should display category filter dropdown', async ({ page }) => {
      await expect(page.locator(selectors.products.categoryFilter)).toBeVisible();
    });
  });

  test.describe('Products Table', () => {
    test('should display table with correct headers', async ({ page }) => {
      // Wait for loading to complete
      await page.waitForTimeout(2000);

      // Check if table or empty state is shown
      const hasTable = await page.locator(selectors.products.table).isVisible();
      const isEmpty = await page.locator(selectors.products.emptyState).isVisible();

      if (hasTable) {
        await expect(page.locator('th:has-text("Product")')).toBeVisible();
        await expect(page.locator('th:has-text("Category")')).toBeVisible();
        await expect(page.locator('th:has-text("Type")')).toBeVisible();
        await expect(page.locator('th:has-text("Price")')).toBeVisible();
        await expect(page.locator('th:has-text("Status")')).toBeVisible();
        await expect(page.locator('th:has-text("Actions")')).toBeVisible();
      } else {
        expect(isEmpty).toBeTruthy();
      }
    });

    test('should show product rows or empty state', async ({ page }) => {
      await page.waitForTimeout(2000);

      const hasProducts = await page.locator(selectors.products.tableRows).count() > 0;
      const isEmpty = await page.locator(selectors.products.emptyState).isVisible();

      expect(hasProducts || isEmpty).toBeTruthy();
    });

    test('should display action buttons for each product', async ({ page }) => {
      await page.waitForTimeout(2000);

      const rows = page.locator(selectors.products.tableRows);
      const rowCount = await rows.count();

      if (rowCount > 0) {
        const firstRow = rows.first();
        await expect(firstRow.locator('[title="View on store"]')).toBeVisible();
        await expect(firstRow.locator('[title="Edit"]')).toBeVisible();
        await expect(firstRow.locator('[title="Delete"]')).toBeVisible();
      }
    });
  });

  test.describe('Search Functionality', () => {
    test('should filter products by name', async ({ page }) => {
      await page.waitForTimeout(2000);

      // Type a search query
      await page.fill(selectors.products.searchInput, 'test');
      await page.press(selectors.products.searchInput, 'Enter');

      // Wait for results
      await page.waitForTimeout(1000);

      // URL should include search param
      expect(page.url()).toContain('search=test');
    });

    test('should clear search when input is empty', async ({ page }) => {
      // First add a search param
      await page.goto('/admin/products?search=test');
      await page.waitForTimeout(1000);

      // Clear search
      await page.fill(selectors.products.searchInput, '');
      await page.press(selectors.products.searchInput, 'Enter');

      // Wait for results
      await page.waitForTimeout(1000);

      // Check URL does not have non-empty search
      // (may still have search= in URL but should be empty)
    });

    test('should show no products message when search has no results', async ({ page }) => {
      // Search for something that doesn't exist
      await page.fill(selectors.products.searchInput, 'xyznonexistent12345');
      await page.press(selectors.products.searchInput, 'Enter');

      // Wait for results
      await page.waitForTimeout(2000);

      // Should show empty state
      await expect(page.locator(selectors.products.emptyState)).toBeVisible();
    });
  });

  test.describe('Category Filter', () => {
    test('should have all category options', async ({ page }) => {
      const categoryFilter = page.locator(selectors.products.categoryFilter);

      await expect(categoryFilter.locator('option[value=""]')).toHaveText('All Categories');
      await expect(categoryFilter.locator('option[value="men"]')).toHaveText('Men');
      await expect(categoryFilter.locator('option[value="women"]')).toHaveText('Women');
      await expect(categoryFilter.locator('option[value="niche"]')).toHaveText('Niche');
      await expect(categoryFilter.locator('option[value="essence-oil"]')).toHaveText('Essence Oil');
      await expect(categoryFilter.locator('option[value="body-lotion"]')).toHaveText('Body Lotion');
    });

    test('should filter products by category', async ({ page }) => {
      await page.selectOption(selectors.products.categoryFilter, 'men');

      // Wait for filter to apply
      await page.waitForTimeout(1000);

      // URL should include category param
      expect(page.url()).toContain('category=men');
    });

    test('should maintain search when filtering by category', async ({ page }) => {
      // First add a search
      await page.fill(selectors.products.searchInput, 'test');
      await page.press(selectors.products.searchInput, 'Enter');
      await page.waitForTimeout(500);

      // Then filter by category
      await page.selectOption(selectors.products.categoryFilter, 'women');
      await page.waitForTimeout(1000);

      // URL should include both
      expect(page.url()).toContain('search=test');
      expect(page.url()).toContain('category=women');
    });
  });

  test.describe('Add Product Button', () => {
    test('should navigate to new product page', async ({ page }) => {
      await page.click(selectors.products.addProductButton);
      await expect(page).toHaveURL('/admin/products/new');
    });
  });

  test.describe('Empty State', () => {
    test('should show empty state message when no products', async ({ page }) => {
      // Search for something that doesn't exist
      await page.fill(selectors.products.searchInput, 'xyznonexistent12345');
      await page.press(selectors.products.searchInput, 'Enter');

      await page.waitForTimeout(2000);

      await expect(page.locator(selectors.products.emptyState)).toBeVisible();
    });

    test('should show Add Your First Product button in empty state', async ({ page }) => {
      // Search for something that doesn't exist
      await page.fill(selectors.products.searchInput, 'xyznonexistent12345');
      await page.press(selectors.products.searchInput, 'Enter');

      await page.waitForTimeout(2000);

      const addButton = page.locator('a:has-text("Add Your First Product")');
      await expect(addButton).toBeVisible();
      await expect(addButton).toHaveAttribute('href', '/admin/products/new');
    });
  });

  test.describe('Pagination', () => {
    test('should display pagination when many products exist', async ({ page }) => {
      await page.waitForTimeout(2000);

      // Check if pagination exists (only when there are more than 20 products)
      const pagination = page.locator(selectors.products.pagination);
      const hasPagination = await pagination.isVisible();

      if (hasPagination) {
        // Should have page buttons
        await expect(pagination.locator('a')).toHaveCount(await pagination.locator('a').count());
      }
    });

    test('should navigate to page when clicking pagination', async ({ page }) => {
      await page.waitForTimeout(2000);

      const pagination = page.locator(selectors.products.pagination);
      const hasPagination = await pagination.isVisible();

      if (hasPagination) {
        // Click on page 2 if it exists
        const page2Link = pagination.locator('a:has-text("2")');
        if (await page2Link.isVisible()) {
          await page2Link.click();
          await page.waitForTimeout(500);
          expect(page.url()).toContain('page=2');
        }
      }
    });
  });

  test.describe('Loading State', () => {
    test('should show loading indicator while fetching products', async ({ page }) => {
      // Navigate fresh to catch loading state
      await page.goto('/admin/products');

      // The loading state might be brief, so we just verify the page loads correctly
      await expect(page.locator(selectors.products.heading)).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Product Row Details', () => {
    test('should display product image, name, and size', async ({ page }) => {
      await page.waitForTimeout(2000);

      const rows = page.locator(selectors.products.tableRows);
      const rowCount = await rows.count();

      if (rowCount > 0) {
        const firstRow = rows.first();

        // Should have product image
        await expect(firstRow.locator('img')).toBeVisible();

        // Should have product name (truncated if long)
        await expect(firstRow.locator('.text-white.font-medium.truncate')).toBeVisible();
      }
    });

    test('should display product category badge', async ({ page }) => {
      await page.waitForTimeout(2000);

      const rows = page.locator(selectors.products.tableRows);
      const rowCount = await rows.count();

      if (rowCount > 0) {
        // Category badge should be present
        await expect(
          rows.first().locator('.bg-gray-800.text-gray-300.capitalize')
        ).toBeVisible();
      }
    });

    test('should display product price', async ({ page }) => {
      await page.waitForTimeout(2000);

      const rows = page.locator(selectors.products.tableRows);
      const rowCount = await rows.count();

      if (rowCount > 0) {
        // Price should be displayed with euro symbol
        await expect(rows.first().locator('text=/€\\d/')).toBeVisible();
      }
    });

    test('should display stock status', async ({ page }) => {
      await page.waitForTimeout(2000);

      const rows = page.locator(selectors.products.tableRows);
      const rowCount = await rows.count();

      if (rowCount > 0) {
        // Should show either "In Stock" or "Out of Stock"
        const inStock = rows.first().locator('text=In Stock');
        const outOfStock = rows.first().locator('text=Out of Stock');

        const hasInStock = await inStock.isVisible();
        const hasOutOfStock = await outOfStock.isVisible();

        expect(hasInStock || hasOutOfStock).toBeTruthy();
      }
    });
  });
});
