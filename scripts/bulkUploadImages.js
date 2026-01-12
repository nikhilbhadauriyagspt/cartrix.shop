import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function bulkUploadImages() {
  try {
    console.log('🚀 Starting bulk image upload...\n');

    console.log('🔍 Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Failed to connect to Supabase');
      console.error(`   Error: ${testError.message}`);
      process.exit(1);
    }
    console.log('✅ Supabase connection successful\n');

    const imagesFolderPath = process.argv[2];

    if (!imagesFolderPath) {
      console.error('❌ Please provide images folder path');
      console.log('Usage: node scripts/bulkUploadImages.js <images-folder-path>');
      console.log('Example: node scripts/bulkUploadImages.js ./my-images');
      process.exit(1);
    }

    if (!fs.existsSync(imagesFolderPath)) {
      console.error(`❌ Folder not found: ${imagesFolderPath}`);
      process.exit(1);
    }

    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name, image_url');

    if (fetchError) {
      console.error('❌ Error fetching products:', fetchError);
      return;
    }

    console.log(`📦 Found ${products.length} products in database\n`);

    const imageFiles = fs.readdirSync(imagesFolderPath);
    console.log(`📁 Found ${imageFiles.length} images in folder\n`);

    let uploadedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const product of products) {
      const productName = product.name.toLowerCase().trim();

      let matchedFile = null;
      for (const file of imageFiles) {
        const fileName = file.toLowerCase();
        const fileNameWithoutExt = path.parse(fileName).name;

        if (fileName.includes(productName) ||
            productName.includes(fileNameWithoutExt) ||
            fileNameWithoutExt.includes(productName.substring(0, 20))) {
          matchedFile = file;
          break;
        }
      }

      if (!matchedFile) {
        console.log(`⚠️  No image found for: ${product.name}`);
        skippedCount++;
        continue;
      }

      if (product.image_url && !product.image_url.startsWith('data:image')) {
        console.log(`⏭️  Skipping (already has URL): ${product.name}`);
        skippedCount++;
        continue;
      }

      try {
        const filePath = path.join(imagesFolderPath, matchedFile);
        const fileBuffer = fs.readFileSync(filePath);
        const fileExt = path.extname(matchedFile);
        const fileName = `${Date.now()}-${product.id}${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(`products/${fileName}`, fileBuffer, {
            contentType: `image/${fileExt.replace('.', '')}`,
            upsert: false
          });

        if (uploadError) {
          console.error(`❌ Upload failed for ${product.name}`);
          console.error(`   Error: ${uploadError.message}`);
          if (uploadError.statusCode) {
            console.error(`   Status Code: ${uploadError.statusCode}`);
          }
          errorCount++;
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(`products/${fileName}`);

        const { error: updateError } = await supabase
          .from('products')
          .update({ image_url: publicUrlData.publicUrl })
          .eq('id', product.id);

        if (updateError) {
          console.error(`❌ Database update failed for ${product.name}:`, updateError.message);
          errorCount++;
          continue;
        }

        console.log(`✅ Uploaded: ${product.name} → ${matchedFile}`);
        uploadedCount++;

        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (err) {
        console.error(`❌ Error processing ${product.name}:`, err.message);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Upload Summary:');
    console.log('='.repeat(50));
    console.log(`✅ Uploaded: ${uploadedCount}`);
    console.log(`⏭️  Skipped: ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📦 Total: ${products.length}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

bulkUploadImages();
