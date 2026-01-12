import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Category mapping from slug to ID
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

async function uploadProducts() {
  try {
    const csvContent = fs.readFileSync('./public/assets/products.csv', 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());

    const headers = parseCSVLine(lines[0]);
    console.log('CSV Headers:', headers);

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i]);

        if (values.length < headers.length) {
          continue;
        }

        const product = {};
        headers.forEach((header, index) => {
          product[header.trim()] = values[index]?.trim() || '';
        });

        // Get the category slug and find the ID
        let categoryId = null;
        if (product.category) {
          categoryId = categoryMapping[product.category];
        }

        // Prepare the product object for insertion
        const productData = {
          name: product.name || 'Unnamed Product',
          description: product.description || '',
          price: parseFloat(product.price) || 0,
          category_id: categoryId,
          brand: product.brand || '',
          image_url: product.imageUrl || '',
          images: product.additionalImages ? JSON.parse(product.additionalImages) : []
        };

        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) {
          failCount++;
          errors.push(`Line ${i + 1}: ${error.message}`);
          console.error(`Failed to insert product on line ${i + 1}:`, error.message);
        } else {
          successCount++;
          console.log(`Successfully inserted product ${successCount}: ${productData.name}`);
        }
      } catch (err) {
        failCount++;
        errors.push(`Line ${i + 1}: ${err.message}`);
        console.error(`Error processing line ${i + 1}:`, err.message);
      }
    }

    console.log('\n=== Upload Summary ===');
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    if (errors.length > 0) {
      console.log('\nErrors:');
      errors.forEach(error => console.log(error));
    }
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

uploadProducts();
