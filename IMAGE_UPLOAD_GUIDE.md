# Image Upload Guide

Your project now has a complete image upload system using Supabase Storage!

## Folder Structure

### Local Assets (Public Folder)
```
public/assets/images/
├── products/    # Product images
├── blogs/       # Blog post images
└── banners/     # Banner and promotional images
```

### Supabase Storage Buckets
- `product-images` - For product photos
- `blog-images` - For blog post images
- `assets` - For general assets (banners, icons, etc.)

## How to Upload Images

### Option 1: Use the ImageUpload Component (Recommended)

```jsx
import ImageUpload from '../components/ImageUpload'

function MyComponent() {
  const handleUpload = (url, path) => {
    console.log('Uploaded image URL:', url)
    console.log('Storage path:', path)
    // Save the URL to your database
  }

  return (
    <ImageUpload
      bucket="product-images"
      folder="featured"
      onUploadComplete={handleUpload}
      currentImage={null}
      label="Upload Product Image"
    />
  )
}
```

### Option 2: Use the Upload Utility Directly

```javascript
import { uploadImage, deleteImage, getImageUrl } from '../utils/imageUpload'

// Upload an image
const handleFileUpload = async (file) => {
  const result = await uploadImage(file, 'product-images', 'featured')

  if (result.error) {
    console.error('Upload failed:', result.error)
  } else {
    console.log('Image URL:', result.url)
    console.log('Storage path:', result.path)
  }
}

// Delete an image
const handleDelete = async (path) => {
  const result = await deleteImage(path, 'product-images')

  if (result.success) {
    console.log('Image deleted successfully')
  }
}

// Get public URL for an image
const imageUrl = getImageUrl('path/to/image.jpg', 'product-images')
```

## Storage Buckets Explained

| Bucket | Purpose | Public Access |
|--------|---------|---------------|
| `product-images` | Product photos and thumbnails | Yes |
| `blog-images` | Blog post images | Yes |
| `assets` | Banners, logos, icons, etc. | Yes |

## Permissions

- **Everyone**: Can view all images
- **Authenticated Users**: Can upload images
- **Admins Only**: Can update and delete images

## File Requirements

- **Accepted formats**: PNG, JPG, GIF, WebP
- **Maximum size**: 5MB per image
- **Recommended dimensions**:
  - Products: 800x800px
  - Blogs: 1200x630px
  - Banners: 1920x600px

## Example: Adding Image Upload to Admin Product Form

```jsx
import { useState } from 'react'
import ImageUpload from '../components/ImageUpload'

function AdminProductForm() {
  const [productData, setProductData] = useState({
    name: '',
    price: '',
    image_url: ''
  })

  const handleImageUpload = (url, path) => {
    setProductData(prev => ({ ...prev, image_url: url }))
  }

  return (
    <form>
      <input
        type="text"
        placeholder="Product Name"
        value={productData.name}
        onChange={(e) => setProductData(prev => ({ ...prev, name: e.target.value }))}
      />

      <ImageUpload
        bucket="product-images"
        folder="products"
        onUploadComplete={handleImageUpload}
        currentImage={productData.image_url}
        label="Product Image"
      />

      <button type="submit">Save Product</button>
    </form>
  )
}
```

## Tips

1. **Always use the correct bucket** for organized storage
2. **Use folders** to categorize images within buckets
3. **Store the image URL** in your database, not the file itself
4. **Optimize images** before upload for better performance
5. **Use descriptive folder names** like `featured`, `thumbnails`, etc.
