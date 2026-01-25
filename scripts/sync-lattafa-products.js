const fs = require('fs');

// Read CSV
const csv = fs.readFileSync('old-website-pages/products_Jan-20_09-43-10AM.csv', 'utf8');
const lines = csv.split('\n');

// Parse products from CSV
const products = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;

  // Check if this is a main product row (starts with Product ID)
  const productIdMatch = line.match(/^"([a-f0-9]{24})"/);
  if (!productIdMatch) continue;

  // Parse CSV fields - this is complex due to nested quotes and descriptions
  // Format: "Product ID","Variant ID","Product Type","Page","URL","Title","Description",...

  // Extract key fields using regex
  const titleMatch = line.match(/,"([^"]+by [^"]+)"/);
  if (!titleMatch) continue;

  const title = titleMatch[1];

  // Only process Lattafa products
  if (!title.toLowerCase().includes('lattafa')) continue;

  // Extract image URL (last field with https://images.squarespace)
  const imageMatches = line.match(/https:\/\/images\.squarespace-cdn\.com\/[^\s"]+/g);
  const imageUrl = imageMatches ? imageMatches[0] : null;

  // Extract prices - look for price pattern after Tags field
  const priceMatch = line.match(/,"(\d+\.\d{2})","(\d+\.\d{2})","(Yes|No)"/);
  const price = priceMatch ? parseFloat(priceMatch[1]) : 29.99;
  const salePrice = priceMatch ? parseFloat(priceMatch[2]) : null;
  const onSale = priceMatch ? priceMatch[3] === 'Yes' : false;

  // Extract categories
  const categoryMatch = line.match(/,"\/([^"]+)"/g);
  let categories = [];
  if (categoryMatch) {
    categoryMatch.forEach(c => {
      const cats = c.replace(/^,"|"$/g, '').split(', ');
      categories.push(...cats);
    });
  }

  // Determine gender and category
  let gender = 'unisex';
  let category = 'niche';

  const catsLower = categories.join(' ').toLowerCase();
  if (catsLower.includes('/men') && !catsLower.includes('/women')) {
    gender = 'men';
    category = 'men';
  } else if (catsLower.includes('/women') && !catsLower.includes('/men')) {
    gender = 'women';
    category = 'women';
  } else if (catsLower.includes('/men') && catsLower.includes('/women')) {
    gender = 'unisex';
  }

  // Generate slug from title
  const slug = title
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // Extract description (simplified - just get first paragraph)
  const descMatch = line.match(/<p[^>]*>([^<]+)<\/p>/);
  const description = descMatch ? descMatch[1].replace(/&nbsp;/g, ' ').trim() : '';

  products.push({
    id: slug,
    name: title,
    brand: 'Lattafa Perfumes',
    image: imageUrl,
    price: onSale ? salePrice : price,
    sale_price: onSale ? salePrice : null,
    category,
    gender,
    product_type: 'perfume',
    size: '100ml',
    in_stock: true,
    description: description.substring(0, 500)
  });
}

console.log(`Found ${products.length} Lattafa products in CSV\n`);

// Output products for review
products.forEach((p, i) => {
  console.log(`${i + 1}. ${p.name}`);
  console.log(`   ID: ${p.id}`);
  console.log(`   Price: €${p.price}`);
  console.log(`   Category: ${p.category}, Gender: ${p.gender}`);
  console.log(`   Image: ${p.image ? 'Yes' : 'No'}`);
  console.log('');
});

// Generate SQL INSERT statements
const sql = products.map(p => {
  const values = [
    `'${p.id.replace(/'/g, "''")}'`,
    `'${p.name.replace(/'/g, "''")}'`,
    `'${(p.description || '').replace(/'/g, "''")}'`,
    p.price,
    p.sale_price || 'NULL',
    `'${p.category}'`,
    `'perfume'`,
    `'100ml'`,
    p.image ? `'${p.image}'` : 'NULL',
    'true',
    `'Lattafa Perfumes'`,
    `'${p.gender}'`,
    'NULL',
    'NOW()',
    'NOW()'
  ];

  return `INSERT INTO products (id, name, description, price, sale_price, category, product_type, size, image, in_stock, brand, gender, tags, created_at, updated_at) VALUES (${values.join(', ')}) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, sale_price = EXCLUDED.sale_price, image = EXCLUDED.image, updated_at = NOW();`;
}).join('\n\n');

fs.writeFileSync('scripts/lattafa-migration.sql', sql);
console.log('\nSQL migration written to scripts/lattafa-migration.sql');
