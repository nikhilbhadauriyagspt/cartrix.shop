import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

const categoryMap = {
  'printers': 'c2f4cc28-9241-4a4d-93d1-51ef36b21980',
  'inkjet-printers': '756dd52d-442e-407d-9a5c-7324499bf14b',
  'led-printers': '2fffc179-cf03-4410-bac9-502c6a45a155',
  'supertank-printers': '00dc4e77-b48a-4e96-a08b-092c6eee4edd',
  'laser-printers': '9de4b1e8-2de3-4c50-9f26-f32392a466e7',
  'all-in-one-printers': '936fd929-f8a4-4cd9-b963-db1f026b2417',
  'office-printers': '1f045e0c-ca23-4e35-a485-d79b21e2d7ca',
  'home-printers': '924c3cc2-1b2c-40f3-8ad3-e50e36f17aa9',
  'large-format-printers': '2787eae3-92fc-4224-b191-ecaca96af606',
  'thermal-printers': 'b9b8abb3-b93d-4261-9e0c-3f7bdec6d1cf',
  'dot-matrix-printers': 'dbdad560-9732-43b3-934f-39cdf0609e4e',
  'printer-accessories': 'c6a9b257-b771-41ca-92df-877ed18f3c2c',
  'ink-toner-paper': '405a4d2a-030a-45b1-b843-3484334196d0'
}

const jsonCategoryToSlug = {
  1: 'printers',
  2: 'inkjet-printers',
  3: 'led-printers',
  4: 'supertank-printers',
  5: 'laser-printers',
  6: 'all-in-one-printers',
  7: 'office-printers',
  8: 'home-printers',
  9: 'large-format-printers',
  10: 'thermal-printers',
  11: 'dot-matrix-printers',
  12: 'printer-accessories',
  13: 'ink-toner-paper'
}

function stripHtmlTags(html) {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

async function bulkUploadProducts() {
  try {
    console.log('Reading JSON file...')
    const jsonPath = join(__dirname, '..', 'public', 'convert.json')
    const jsonData = JSON.parse(readFileSync(jsonPath, 'utf-8'))

    if (!jsonData.products || !Array.isArray(jsonData.products)) {
      throw new Error('Invalid JSON structure: products array not found')
    }

    console.log(`Found ${jsonData.products.length} products to upload`)

    const productsToInsert = []

    for (const product of jsonData.products) {
      const categorySlug = jsonCategoryToSlug[product.sub_category_id] || jsonCategoryToSlug[product.category_id]
      const categoryId = categoryMap[categorySlug]

      if (!categoryId) {
        console.warn(`Skipping product ${product.id}: No category mapping found for category_id=${product.category_id}, sub_category_id=${product.sub_category_id}`)
        continue
      }

      const cleanDescription = stripHtmlTags(product.description)

      productsToInsert.push({
        name: product.name,
        description: cleanDescription,
        price: product.price,
        category_id: categoryId,
        image_url: product.image || '',
        images: product.image ? [product.image] : [],
        brand: product.brand || null
      })
    }

    console.log(`Prepared ${productsToInsert.length} products for insertion`)

    const batchSize = 50
    let insertedCount = 0

    for (let i = 0; i < productsToInsert.length; i += batchSize) {
      const batch = productsToInsert.slice(i, i + batchSize)
      console.log(`Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(productsToInsert.length / batchSize)}...`)

      const { data, error } = await supabase.rpc('bulk_insert_products', {
        products_data: batch
      })

      if (error) {
        console.error(`Error inserting batch at index ${i}:`, error)
        continue
      }

      insertedCount += (data ? data.length : 0)
      console.log(`Inserted ${data ? data.length : 0} products (Total: ${insertedCount}/${productsToInsert.length})`)
    }

    console.log(`\n✅ Upload complete! Successfully inserted ${insertedCount} out of ${productsToInsert.length} products`)

  } catch (error) {
    console.error('Error during bulk upload:', error)
    process.exit(1)
  }
}

bulkUploadProducts()
