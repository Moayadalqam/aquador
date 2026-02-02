import {
  getAllProducts,
  getProductById,
  getProductBySlug,
  getProductsByCategory,
  getFeaturedProducts,
  getAllProductSlugs,
  getAllCategories,
  getCategoryBySlug,
  searchProducts,
  getRelatedProducts,
} from '../product-service';

describe('Product Service', () => {
  describe('getAllProducts', () => {
    it('should return an array of products', () => {
      const products = getAllProducts();
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);
    });

    it('should return products with required fields', () => {
      const products = getAllProducts();
      const product = products[0];

      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('description');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('category');
      expect(product).toHaveProperty('image');
    });
  });

  describe('getProductById', () => {
    it('should return a product when given a valid ID', () => {
      const products = getAllProducts();
      const firstProduct = products[0];

      const found = getProductById(firstProduct.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(firstProduct.id);
    });

    it('should return undefined for non-existent ID', () => {
      const found = getProductById('non-existent-product-id');
      expect(found).toBeUndefined();
    });
  });

  describe('getProductBySlug', () => {
    it('should return a product when given a valid slug', () => {
      const products = getAllProducts();
      const firstProduct = products[0];

      const found = getProductBySlug(firstProduct.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(firstProduct.id);
    });

    it('should return undefined for non-existent slug', () => {
      const found = getProductBySlug('non-existent-slug');
      expect(found).toBeUndefined();
    });
  });

  describe('getProductsByCategory', () => {
    it('should return products for men category', () => {
      const products = getProductsByCategory('men');
      expect(products.length).toBeGreaterThan(0);
      products.forEach(p => expect(p.category).toBe('men'));
    });

    it('should return products for women category', () => {
      const products = getProductsByCategory('women');
      expect(products.length).toBeGreaterThan(0);
      products.forEach(p => expect(p.category).toBe('women'));
    });

    it('should return products for niche category', () => {
      const products = getProductsByCategory('niche');
      expect(products.length).toBeGreaterThan(0);
      products.forEach(p => expect(p.category).toBe('niche'));
    });

    it('should return empty array for non-existent category', () => {
      const products = getProductsByCategory('invalid-category');
      expect(products).toEqual([]);
    });
  });

  describe('getFeaturedProducts', () => {
    it('should return default 6 products when no count specified', () => {
      const products = getFeaturedProducts();
      expect(products.length).toBeLessThanOrEqual(6);
    });

    it('should return specified number of products', () => {
      const products = getFeaturedProducts(3);
      expect(products.length).toBe(3);
    });

    it('should return all products if count exceeds total', () => {
      const allProducts = getAllProducts();
      const featured = getFeaturedProducts(10000);
      expect(featured.length).toBe(allProducts.length);
    });
  });

  describe('getAllProductSlugs', () => {
    it('should return an array of strings', () => {
      const slugs = getAllProductSlugs();
      expect(Array.isArray(slugs)).toBe(true);
      expect(typeof slugs[0]).toBe('string');
    });

    it('should have same count as all products', () => {
      const slugs = getAllProductSlugs();
      const products = getAllProducts();
      expect(slugs.length).toBe(products.length);
    });
  });

  describe('getAllCategories', () => {
    it('should return all categories', () => {
      const categories = getAllCategories();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBe(5);
    });

    it('should include all product categories', () => {
      const categories = getAllCategories();
      const slugs = categories.map(c => c.slug);
      expect(slugs).toContain('men');
      expect(slugs).toContain('women');
      expect(slugs).toContain('niche');
      expect(slugs).toContain('essence-oil');
      expect(slugs).toContain('body-lotion');
    });
  });

  describe('getCategoryBySlug', () => {
    it('should return category for valid slug', () => {
      const category = getCategoryBySlug('men');
      expect(category).toBeDefined();
      expect(category?.slug).toBe('men');
    });

    it('should return undefined for invalid slug', () => {
      const category = getCategoryBySlug('invalid');
      expect(category).toBeUndefined();
    });
  });

  describe('searchProducts', () => {
    it('should find products by name', () => {
      const products = getAllProducts();
      const firstProduct = products[0];
      const searchTerm = firstProduct.name.split(' ')[0];

      const results = searchProducts(searchTerm);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should be case insensitive', () => {
      const products = getAllProducts();
      const firstProduct = products[0];
      const searchTerm = firstProduct.name.split(' ')[0].toUpperCase();

      const results = searchProducts(searchTerm);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array for no matches', () => {
      const results = searchProducts('xyznonexistentproduct123');
      expect(results).toEqual([]);
    });
  });

  describe('getRelatedProducts', () => {
    it('should return products from same category', () => {
      const products = getAllProducts();
      const product = products[0];

      const related = getRelatedProducts(product.id);
      related.forEach(p => {
        expect(p.category).toBe(product.category);
        expect(p.id).not.toBe(product.id);
      });
    });

    it('should return up to 4 products by default', () => {
      const products = getAllProducts();
      const product = products[0];

      const related = getRelatedProducts(product.id);
      expect(related.length).toBeLessThanOrEqual(4);
    });

    it('should return specified number of products', () => {
      const products = getAllProducts();
      const product = products[0];

      const related = getRelatedProducts(product.id, 2);
      expect(related.length).toBeLessThanOrEqual(2);
    });

    it('should return empty array for non-existent product', () => {
      const related = getRelatedProducts('non-existent-id');
      expect(related).toEqual([]);
    });
  });
});
