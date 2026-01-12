# Simple Product Upload Guide

Admin panel se products ko easily upload aur update kar sakte ho. Sirf **JPG aur PNG** files allowed hain.

## Product Upload Kaise Karein

### 1. Admin Login
```
URL: https://your-site.com/admin/login
```
Admin credentials se login karo

### 2. Products Page
- Left sidebar mein "Products" par click karo
- Ya direct URL: `https://your-site.com/admin/products`

### 3. Add New Product
Top right corner mein **"Add Product"** button par click karo

### 4. Fill Product Details

#### Tab 1: Basic Info
- **Product Name** - Required
- **Brand** - Required
- **Category** - Dropdown se select karo
- **Description** - Product ki details

#### Tab 2: Pricing
- **Price** - Product ki price (decimal allowed: 299.99)

#### Tab 3: Images
- **Main Product Image** - Required
  - Click karo upload area par
  - **Sirf JPG ya PNG** select kar sakte ho
  - Max size: 5MB
  - Image automatically upload ho jayegi

- **Product Gallery** - Optional
  - Multiple images add kar sakte ho
  - Same process: Click → Select JPG/PNG → Auto upload

### 5. Save Product
- **"Add Product"** button par click karo
- Product saved ho jayega aur list mein dikhega

## Product Update Kaise Karein

1. Products list mein **Edit icon** (pencil) par click karo
2. Fields update karo
3. Image change karni hai?
   - Images tab mein jao
   - Existing image par hover karo
   - X button se remove karo
   - Naya image upload karo
4. **"Update Product"** button par click karo

## Product Delete Kaise Karein

1. Products list mein **Delete icon** (trash) par click karo
2. Confirmation dialog mein "OK" karo
3. Product delete ho jayega

## Important Points

✅ **Allowed Files**: Sirf JPG aur PNG
✅ **Max Size**: 5MB
✅ **Auto Upload**: Image select karte hi upload hoti hai
✅ **Preview**: Upload ke baad image preview dikhta hai
✅ **Gallery**: Multiple images add kar sakte ho
✅ **Edit Anytime**: Kisi bhi waqt product edit kar sakte ho

❌ **Not Allowed**: GIF, WebP, ya other formats

## Error Fix

### "Only JPG and PNG files are allowed"
Aapne wrong format ki file select ki hai. Sirf JPG ya PNG use karo.

### "Image size must be less than 5MB"
Image bahut badi hai. Image ko compress karo ya choti file use karo.

### "Invalid Compact JWS"
Supabase credentials ki problem hai. Admin se poocho ya `.env` file check karo.

## Tips

1. **Image Quality**: Clear, high-quality images use karo
2. **Background**: White ya plain background better hai
3. **Size**: 800x800 pixels optimal hai
4. **Format**: PNG transparency ke liye, JPG faster load ke liye
5. **Gallery**: Different angles ki images add karo

## Bulk Upload

Agar bulk upload karni hai multiple products ki:
- `BULK_IMAGE_UPLOAD.md` file dekho
- Wo script-based bulk upload ke liye hai
- Admin panel single product upload ke liye hai
