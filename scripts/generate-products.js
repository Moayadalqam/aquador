const fs = require('fs');
const path = require('path');

// Read CSV
const csvPath = path.join(__dirname, '../old-website-pages/products_Jan-20_09-43-10AM.csv');
const csv = fs.readFileSync(csvPath, 'utf8');
const lines = csv.split('\n');

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i+1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function cleanDescription(html) {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Parse all products
let products = [];
let currentProduct = null;

for (let i = 1; i < lines.length; i++) {
  if (!lines[i].trim()) continue;
  const row = parseCSVLine(lines[i]);
  const productId = row[0];
  const title = row[5];
  const description = row[6];
  const optionValue1 = row[9];
  const optionValue2 = row[11];
  const price = row[20];
  const stock = row[23];
  const categories = row[24];
  const visible = row[30];
  const image = row[31];

  if (productId) {
    if (currentProduct) products.push(currentProduct);
    currentProduct = {
      title,
      description: cleanDescription(description),
      categories,
      visible,
      image,
      variants: [{type: optionValue1, size: optionValue2, price, stock}]
    };
  } else if (currentProduct) {
    currentProduct.variants.push({type: optionValue1, size: optionValue2, price, stock});
  }
}
if (currentProduct) products.push(currentProduct);

// Generate products
const oilProducts = [];
const lotionProducts = [];

products.forEach(p => {
  let brand = "Aquad'or";
  const cats = p.categories.toLowerCase();

  const brandMatch = cats.match(/\/([a-z-]+)/g);
  if (brandMatch) {
    brandMatch.forEach(b => {
      const brandName = b.slice(1);
      if (!['men', 'women', 'niche', 'aquador'].includes(brandName)) {
        brand = brandName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      }
    });
  }

  const oilVariant = p.variants.find(v => v.type === 'Essence Oil');
  const lotionVariant = p.variants.find(v => v.type === 'Body Lotion');

  if (oilVariant && p.visible === 'Yes') {
    oilProducts.push({
      id: slugify(p.title) + '-essence-oil',
      name: p.title + ' (Essence Oil)',
      description: p.description,
      price: parseFloat(oilVariant.price),
      size: oilVariant.size,
      image: p.image,
      inStock: oilVariant.stock === 'Unlimited',
      brand: brand
    });
  }

  if (lotionVariant && p.visible === 'Yes') {
    lotionProducts.push({
      id: slugify(p.title) + '-body-lotion',
      name: p.title + ' (Body Lotion)',
      description: p.description,
      price: parseFloat(lotionVariant.price),
      size: lotionVariant.size,
      image: p.image,
      inStock: lotionVariant.stock === 'Unlimited',
      brand: brand
    });
  }
});

console.log('Generated', oilProducts.length, 'essence oil products');
console.log('Generated', lotionProducts.length, 'body lotion products');

// Read products.ts first to detect line ending
const productsPath = path.join(__dirname, '../src/lib/products.ts');
let productsFile = fs.readFileSync(productsPath, 'utf8');

// Detect line ending used in the file
const lineEnding = productsFile.includes('\r\n') ? '\r\n' : '\n';
console.log('Using line ending:', lineEnding === '\r\n' ? 'CRLF' : 'LF');

// Generate TypeScript code
function generateProductCode(products, category, productType, eol) {
  return products.map(p => {
    const escapedName = p.name.replace(/"/g, '\\"');
    const escapedDesc = p.description.replace(/"/g, '\\"');
    const escapedBrand = p.brand.replace(/"/g, '\\"');
    // Clean up image URL (remove trailing \r)
    const cleanImage = p.image.replace(/\r/g, '');

    return [
      '  {',
      `    id: "${p.id}",`,
      `    name: "${escapedName}",`,
      `    description: "${escapedDesc}",`,
      `    price: ${p.price},`,
      `    category: "${category}",`,
      `    productType: "${productType}",`,
      `    size: "${p.size}",`,
      `    image: "${cleanImage}",`,
      `    inStock: ${p.inStock},`,
      `    brand: "${escapedBrand}",`,
      '  },'
    ].join(eol);
  }).join(eol);
}

let code = lineEnding + '// ==================== ESSENCE OIL PRODUCTS ====================' + lineEnding;
code += generateProductCode(oilProducts, 'essence-oil', 'essence-oil', lineEnding);
code += lineEnding + lineEnding + '// ==================== BODY LOTION PRODUCTS ====================' + lineEnding;
code += generateProductCode(lotionProducts, 'body-lotion', 'body-lotion', lineEnding);
code += lineEnding;

const fragranceNotesIdx = productsFile.indexOf('export const fragranceNotes');
const closingBracketIdx = productsFile.lastIndexOf('];', fragranceNotesIdx);

if (closingBracketIdx === -1) {
  console.error('Could not find closing bracket');
  process.exit(1);
}

const newContent = productsFile.slice(0, closingBracketIdx) + code + '];' + productsFile.slice(closingBracketIdx + 2);
fs.writeFileSync(productsPath, newContent);

console.log('Successfully inserted products into products.ts');

// Verify
const finalFile = fs.readFileSync(productsPath, 'utf8');
const productCount = (finalFile.match(/id: "/g) || []).length;
console.log('Total product entries in file:', productCount);
