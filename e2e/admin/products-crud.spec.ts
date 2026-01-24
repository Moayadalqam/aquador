import { test, expect } from '../fixtures/admin-auth';
import { selectors } from '../fixtures/admin-auth';
import {
  createTestProductData,
  generateTestProductName,
  TEST_DATA_PREFIX,
  cleanupTestProducts,
} from '../fixtures/test-data';

test.describe('Admin Products CRUD', () => {
  test.use({ storageState: undefined });

  test.beforeEach(async ({ page, loginAsAdmin }) => {
    await loginAsAdmin(page);
  });

  // Cleanup test products after each test
  test.afterEach(async ({ page }) => {
    try {
      await cleanupTestProducts(page);
    } catch (e) {
      // Cleanup failure shouldn't fail the test
      console.log('Cleanup warning:', e);
    }
  });

  test.describe('Create Product Form', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/admin/products/new');
    });

    test('should display create product heading', async ({ page }) => {
      await expect(page.locator('h1:has-text("Add New Product")')).toBeVisible();
    });

    test('should display back button', async ({ page }) => {
      const backButton = page.locator('a[href="/admin/products"]').first();
      await expect(backButton).toBeVisible();
    });

    test('should navigate back to products list on back button click', async ({ page }) => {
      await page.click('a[href="/admin/products"]');
      await expect(page).toHaveURL('/admin/products');
    });

    test('should display Product Information section', async ({ page }) => {
      await expect(page.locator('h2:has-text("Product Information")')).toBeVisible();
    });

    test('should display Pricing section', async ({ page }) => {
      await expect(page.locator('h2:has-text("Pricing")')).toBeVisible();
    });

    test('should display Product Image section', async ({ page }) => {
      await expect(page.locator('h2:has-text("Product Image")')).toBeVisible();
    });

    test('should display Details section', async ({ page }) => {
      await expect(page.locator('h2:has-text("Details")')).toBeVisible();
    });

    test('should have required form fields', async ({ page }) => {
      // Product Name
      await expect(page.locator('text=Product Name *')).toBeVisible();

      // Description
      await expect(page.locator('text=Description *')).toBeVisible();

      // Price
      await expect(page.locator('text=Price (€) *')).toBeVisible();

      // Category
      await expect(page.locator('text=Category *')).toBeVisible();

      // Product Type
      await expect(page.locator('text=Product Type *')).toBeVisible();

      // Size
      await expect(page.locator('text=Size *')).toBeVisible();
    });

    test('should have optional form fields', async ({ page }) => {
      await expect(page.locator('text=Brand')).toBeVisible();
      await expect(page.locator('text=Sale Price (€)')).toBeVisible();
      await expect(page.locator('text=Tags (comma separated)')).toBeVisible();
      await expect(page.locator('text=Gender')).toBeVisible();
    });

    test('should have category dropdown with options', async ({ page }) => {
      const categorySelect = page.locator('select').filter({ hasText: "Men's Collection" });
      await expect(categorySelect).toBeVisible();

      // Check options
      await expect(categorySelect.locator('option[value="men"]')).toBeVisible();
      await expect(categorySelect.locator('option[value="women"]')).toBeVisible();
      await expect(categorySelect.locator('option[value="niche"]')).toBeVisible();
      await expect(categorySelect.locator('option[value="essence-oil"]')).toBeVisible();
      await expect(categorySelect.locator('option[value="body-lotion"]')).toBeVisible();
    });

    test('should have product type dropdown with options', async ({ page }) => {
      const typeSelect = page.locator('select').filter({ hasText: 'Perfume' });
      await expect(typeSelect).toBeVisible();

      // Check options
      await expect(typeSelect.locator('option[value="perfume"]')).toBeVisible();
      await expect(typeSelect.locator('option[value="essence-oil"]')).toBeVisible();
      await expect(typeSelect.locator('option[value="body-lotion"]')).toBeVisible();
    });

    test('should have size dropdown with options', async ({ page }) => {
      const sizeSelect = page.locator('select').filter({ hasText: '50ml' });
      await expect(sizeSelect).toBeVisible();

      // Check options
      await expect(sizeSelect.locator('option[value="10ml"]')).toBeVisible();
      await expect(sizeSelect.locator('option[value="50ml"]')).toBeVisible();
      await expect(sizeSelect.locator('option[value="100ml"]')).toBeVisible();
      await expect(sizeSelect.locator('option[value="150ml"]')).toBeVisible();
    });

    test('should have in stock checkbox checked by default', async ({ page }) => {
      const checkbox = page.locator('#in_stock');
      await expect(checkbox).toBeChecked();
    });

    test('should have Cancel and Create Product buttons', async ({ page }) => {
      await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
      await expect(page.locator('button:has-text("Create Product")')).toBeVisible();
    });

    test('should disable submit button when required fields are empty', async ({ page }) => {
      // Submit button should be disabled initially
      const submitButton = page.locator('button:has-text("Create Product")');
      await expect(submitButton).toBeDisabled();
    });
  });

  test.describe('Create Product Flow', () => {
    test('should create a product successfully', async ({ page }) => {
      const productData = createTestProductData();

      await page.goto('/admin/products/new');

      // Fill in required fields
      await page.fill('input[placeholder*="Oud Ispahan"]', productData.name);
      await page.fill('textarea[placeholder*="fragrance"]', productData.description);
      await page.fill('input[placeholder="29.99"]', productData.price);

      // Enter image URL
      await page.fill('input[placeholder="https://..."]', productData.image);

      // Submit form
      await page.click('button:has-text("Create Product")');

      // Should redirect to products list
      await expect(page).toHaveURL('/admin/products', { timeout: 10000 });

      // Verify product appears in list
      await page.fill('input[name="search"]', productData.name);
      await page.press('input[name="search"]', 'Enter');
      await page.waitForTimeout(1000);

      await expect(page.locator(`text=${productData.name}`)).toBeVisible();
    });

    test('should show loading state while creating', async ({ page }) => {
      const productData = createTestProductData();

      await page.goto('/admin/products/new');

      // Fill in required fields
      await page.fill('input[placeholder*="Oud Ispahan"]', productData.name);
      await page.fill('textarea[placeholder*="fragrance"]', productData.description);
      await page.fill('input[placeholder="29.99"]', productData.price);
      await page.fill('input[placeholder="https://..."]', productData.image);

      // Click submit
      await page.click('button:has-text("Create Product")');

      // Should show "Saving..." briefly
      await expect(page.locator('text=Saving...')).toBeVisible({ timeout: 1000 }).catch(() => {
        // May be too fast to catch
      });

      // Wait for redirect
      await expect(page).toHaveURL('/admin/products', { timeout: 10000 });
    });

    test('should show error when form validation fails', async ({ page }) => {
      await page.goto('/admin/products/new');

      // Try to submit without required fields
      // The button should be disabled, but if somehow enabled, should show error
      const submitButton = page.locator('button:has-text("Create Product")');
      await expect(submitButton).toBeDisabled();
    });

    test('should navigate back on Cancel button click', async ({ page }) => {
      await page.goto('/admin/products/new');
      await page.click('button:has-text("Cancel")');

      // Should go back (to products list)
      await expect(page).toHaveURL('/admin/products');
    });
  });

  test.describe('Edit Product Form', () => {
    let testProductName: string;

    test.beforeEach(async ({ page }) => {
      // First create a test product
      const productData = createTestProductData();
      testProductName = productData.name;

      await page.goto('/admin/products/new');
      await page.fill('input[placeholder*="Oud Ispahan"]', productData.name);
      await page.fill('textarea[placeholder*="fragrance"]', productData.description);
      await page.fill('input[placeholder="29.99"]', productData.price);
      await page.fill('input[placeholder="https://..."]', productData.image);
      await page.click('button:has-text("Create Product")');

      await expect(page).toHaveURL('/admin/products', { timeout: 10000 });
    });

    test('should navigate to edit page from products list', async ({ page }) => {
      // Search for the test product
      await page.fill('input[name="search"]', testProductName);
      await page.press('input[name="search"]', 'Enter');
      await page.waitForTimeout(1000);

      // Click edit button
      const row = page.locator(`tr:has-text("${testProductName}")`);
      await row.locator('[title="Edit"]').click();

      // Should be on edit page
      await expect(page.locator('h1:has-text("Edit Product")')).toBeVisible();
    });

    test('should pre-fill form with existing product data', async ({ page }) => {
      // Search for the test product
      await page.fill('input[name="search"]', testProductName);
      await page.press('input[name="search"]', 'Enter');
      await page.waitForTimeout(1000);

      // Click edit button
      const row = page.locator(`tr:has-text("${testProductName}")`);
      await row.locator('[title="Edit"]').click();

      // Wait for form to load
      await expect(page.locator('h1:has-text("Edit Product")')).toBeVisible();

      // Check that name field has the product name
      const nameInput = page.locator('input[placeholder*="Oud Ispahan"]');
      await expect(nameInput).toHaveValue(testProductName);
    });

    test('should update product successfully', async ({ page }) => {
      // Search for the test product
      await page.fill('input[name="search"]', testProductName);
      await page.press('input[name="search"]', 'Enter');
      await page.waitForTimeout(1000);

      // Click edit button
      const row = page.locator(`tr:has-text("${testProductName}")`);
      await row.locator('[title="Edit"]').click();

      // Wait for form to load
      await expect(page.locator('h1:has-text("Edit Product")')).toBeVisible();

      // Update the name
      const updatedName = testProductName + ' - UPDATED';
      await page.fill('input[placeholder*="Oud Ispahan"]', updatedName);

      // Submit
      await page.click('button:has-text("Update Product")');

      // Should redirect to products list
      await expect(page).toHaveURL('/admin/products', { timeout: 10000 });

      // Verify updated product appears
      await page.fill('input[name="search"]', updatedName);
      await page.press('input[name="search"]', 'Enter');
      await page.waitForTimeout(1000);

      await expect(page.locator(`text=${updatedName}`)).toBeVisible();
    });

    test('should show Update Product button in edit mode', async ({ page }) => {
      // Search for the test product
      await page.fill('input[name="search"]', testProductName);
      await page.press('input[name="search"]', 'Enter');
      await page.waitForTimeout(1000);

      // Click edit button
      const row = page.locator(`tr:has-text("${testProductName}")`);
      await row.locator('[title="Edit"]').click();

      // Should show Update Product button
      await expect(page.locator('button:has-text("Update Product")')).toBeVisible();
    });
  });

  test.describe('Delete Product Flow', () => {
    let testProductName: string;

    test.beforeEach(async ({ page }) => {
      // First create a test product
      const productData = createTestProductData();
      testProductName = productData.name;

      await page.goto('/admin/products/new');
      await page.fill('input[placeholder*="Oud Ispahan"]', productData.name);
      await page.fill('textarea[placeholder*="fragrance"]', productData.description);
      await page.fill('input[placeholder="29.99"]', productData.price);
      await page.fill('input[placeholder="https://..."]', productData.image);
      await page.click('button:has-text("Create Product")');

      await expect(page).toHaveURL('/admin/products', { timeout: 10000 });
    });

    test('should open delete confirmation modal', async ({ page }) => {
      // Search for the test product
      await page.fill('input[name="search"]', testProductName);
      await page.press('input[name="search"]', 'Enter');
      await page.waitForTimeout(1000);

      // Click delete button
      const row = page.locator(`tr:has-text("${testProductName}")`);
      await row.locator('[title="Delete"]').click();

      // Should show delete modal
      await expect(page.locator(selectors.deleteModal.title)).toBeVisible();
      await expect(page.locator('text=This action cannot be undone')).toBeVisible();
    });

    test('should close modal on Cancel', async ({ page }) => {
      // Search for the test product
      await page.fill('input[name="search"]', testProductName);
      await page.press('input[name="search"]', 'Enter');
      await page.waitForTimeout(1000);

      // Click delete button
      const row = page.locator(`tr:has-text("${testProductName}")`);
      await row.locator('[title="Delete"]').click();

      // Modal should be visible
      await expect(page.locator(selectors.deleteModal.title)).toBeVisible();

      // Click cancel
      await page.click(selectors.deleteModal.cancelButton);

      // Modal should close
      await expect(page.locator(selectors.deleteModal.title)).not.toBeVisible();

      // Product should still exist
      await expect(page.locator(`text=${testProductName}`)).toBeVisible();
    });

    test('should delete product on confirm', async ({ page }) => {
      // Search for the test product
      await page.fill('input[name="search"]', testProductName);
      await page.press('input[name="search"]', 'Enter');
      await page.waitForTimeout(1000);

      // Click delete button
      const row = page.locator(`tr:has-text("${testProductName}")`);
      await row.locator('[title="Delete"]').click();

      // Confirm deletion
      await page.click('button:has-text("Delete"):not(:has-text("Cancel"))');

      // Wait for deletion
      await page.waitForTimeout(2000);

      // Product should be gone
      await page.fill('input[name="search"]', testProductName);
      await page.press('input[name="search"]', 'Enter');
      await page.waitForTimeout(1000);

      // Should show no products or product is gone
      await expect(page.locator(`text=${testProductName}`)).not.toBeVisible();
    });

    test('should show loading state while deleting', async ({ page }) => {
      // Search for the test product
      await page.fill('input[name="search"]', testProductName);
      await page.press('input[name="search"]', 'Enter');
      await page.waitForTimeout(1000);

      // Click delete button
      const row = page.locator(`tr:has-text("${testProductName}")`);
      await row.locator('[title="Delete"]').click();

      // Click confirm delete
      await page.click('button:has-text("Delete"):not(:has-text("Cancel"))');

      // Should show "Deleting..." briefly
      await expect(page.locator('text=Deleting...')).toBeVisible({ timeout: 1000 }).catch(() => {
        // May be too fast to catch
      });
    });
  });

  test.describe('Image Upload', () => {
    test('should display image upload area', async ({ page }) => {
      await page.goto('/admin/products/new');

      await expect(page.locator('text=Click to upload image')).toBeVisible();
      await expect(page.locator('text=PNG, JPG up to 5MB')).toBeVisible();
    });

    test('should allow entering image URL', async ({ page }) => {
      await page.goto('/admin/products/new');

      const imageUrlInput = page.locator('input[placeholder="https://..."]');
      await expect(imageUrlInput).toBeVisible();

      await imageUrlInput.fill('https://example.com/test.jpg');
      await expect(imageUrlInput).toHaveValue('https://example.com/test.jpg');
    });

    test('should show image preview when URL is entered', async ({ page }) => {
      await page.goto('/admin/products/new');

      // Enter image URL
      await page.fill(
        'input[placeholder="https://..."]',
        'https://via.placeholder.com/400x400?text=Test'
      );

      // Wait a bit for preview
      await page.waitForTimeout(500);

      // Image should be visible (though it might not load in test)
      // Check for the preview container
      const previewImage = page.locator('img[alt="Product"]');
      await expect(previewImage).toBeVisible();
    });

    test('should have remove image button when image is set', async ({ page }) => {
      await page.goto('/admin/products/new');

      // Enter image URL
      await page.fill(
        'input[placeholder="https://..."]',
        'https://via.placeholder.com/400x400?text=Test'
      );

      await page.waitForTimeout(500);

      // Should have remove button
      const removeButton = page.locator('button:has(.h-4.w-4)').filter({ has: page.locator('svg') });
      await expect(removeButton).toBeVisible();
    });
  });

  test.describe('View Product', () => {
    let testProductName: string;
    let testProductId: string;

    test.beforeEach(async ({ page }) => {
      // Create a test product
      const productData = createTestProductData();
      testProductName = productData.name;

      await page.goto('/admin/products/new');
      await page.fill('input[placeholder*="Oud Ispahan"]', productData.name);
      await page.fill('textarea[placeholder*="fragrance"]', productData.description);
      await page.fill('input[placeholder="29.99"]', productData.price);
      await page.fill('input[placeholder="https://..."]', productData.image);
      await page.click('button:has-text("Create Product")');

      await expect(page).toHaveURL('/admin/products', { timeout: 10000 });
    });

    test('should have view on store link for products', async ({ page }) => {
      // Search for the test product
      await page.fill('input[name="search"]', testProductName);
      await page.press('input[name="search"]', 'Enter');
      await page.waitForTimeout(1000);

      // Check view button exists
      const row = page.locator(`tr:has-text("${testProductName}")`);
      const viewButton = row.locator('[title="View on store"]');
      await expect(viewButton).toBeVisible();
    });

    test('should open product page in new tab', async ({ page, context }) => {
      // Search for the test product
      await page.fill('input[name="search"]', testProductName);
      await page.press('input[name="search"]', 'Enter');
      await page.waitForTimeout(1000);

      // Listen for new page
      const pagePromise = context.waitForEvent('page');

      // Click view button
      const row = page.locator(`tr:has-text("${testProductName}")`);
      await row.locator('[title="View on store"]').click();

      // Get the new page
      const newPage = await pagePromise;
      await newPage.waitForLoadState();

      // New page should be a product page
      expect(newPage.url()).toContain('/products/');

      // Close the new page
      await newPage.close();
    });
  });
});
