import fs from 'fs';

const categoryMapping = {
  'home-printer': '924c3cc2-1b2c-40f3-8ad3-e50e36f17aa9',
  'office-printer': '1f045e0c-ca23-4e35-a485-d79b21e2d7ca',
  'inkjet-printer': '756dd52d-442e-407d-9a5c-7324499bf14b',
  'laser-printer': '9de4b1e8-2de3-4c50-9f26-f32392a466e7',
  'ink-toner-paper': '405a4d2a-030a-45b1-b843-3484334196d0'
};

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
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

function escapeCSV(value) {
  if (!value) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

try {
  const csvContent = fs.readFileSync('./public/assets/products.csv', 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());

  const headers = parseCSVLine(lines[0]);
  console.log('Input CSV Headers:', headers);

  const outputLines = [
    'name,description,price,category_id,brand,image_url'
  ];

  let converted = 0;
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    try {
      const values = parseCSVLine(lines[i]);

      if (values.length < headers.length) {
        skipped++;
        continue;
      }

      const product = {};
      headers.forEach((header, index) => {
        product[header.trim()] = values[index]?.trim() || '';
      });

      const categoryId = categoryMapping[product.category] || '';

      const outputLine = [
        escapeCSV(product.name),
        escapeCSV(product.description),
        escapeCSV(product.price),
        escapeCSV(categoryId),
        escapeCSV(product.brand),
        escapeCSV(product.imageUrl)
      ].join(',');

      outputLines.push(outputLine);
      converted++;
    } catch (err) {
      skipped++;
      console.error(`Error on line ${i + 1}:`, err.message);
    }
  }

  fs.writeFileSync('./public/assets/products_converted.csv', outputLines.join('\n'));

  console.log('\n=== Conversion Summary ===');
  console.log(`Converted: ${converted} products`);
  console.log(`Skipped: ${skipped} lines`);
  console.log('\nOutput file: ./public/assets/products_converted.csv');
  console.log('\nYou can now upload this file using the Admin Panel -> Products -> Bulk Upload');

} catch (error) {
  console.error('Fatal error:', error);
}
