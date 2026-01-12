# Bulk Image Upload Guide

Yeh script automatically **saare product images** ko ek sath upload kar dega!

## 📋 Requirements

1. Tumhare paas ek folder hona chahiye jisme **saare product images** ho
2. Image filenames **product names se match** hone chahiye (exact match zaroori nahi)

## 🚀 Kaise Use Karein

### Step 1: Images folder tayyar karo

Apne saare product images ek folder mein rakho. Example:
```
my-images/
├── hp-laserjet-m140w.jpg
├── canon-pixma.png
├── epson-ecotank.jpg
└── ...
```

**Note:** Image names product names se similar hone chahiye, exact match nahi bhi ho toh chalta hai!

### Step 2: Script chalao

Terminal mein yeh command run karo:

```bash
node scripts/bulkUploadImages.js <tumhare-images-folder-ka-path>
```

**Example:**
```bash
node scripts/bulkUploadImages.js ./my-images
```

Ya agar images kisi aur location pe hain:
```bash
node scripts/bulkUploadImages.js /Users/yourname/Desktop/product-images
```

### Step 3: Wait karo

Script automatically:
- ✅ Har product ke liye matching image dhundega
- ✅ Supabase Storage mein upload karega
- ✅ Database mein URL update karega
- ✅ Progress show karega

## 📊 Output Example

```
🚀 Starting bulk image upload...

📦 Found 142 products in database

📁 Found 138 images in folder

✅ Uploaded: HP LaserJet M140w → hp-laserjet-m140w.jpg
✅ Uploaded: Canon PIXMA G3010 → canon-pixma-g3010.png
⚠️  No image found for: Samsung Xpress M2020
✅ Uploaded: Epson EcoTank L3210 → epson-l3210.jpg
⏭️  Skipping (already has URL): Brother HL-L2321D

==================================================
📊 Upload Summary:
==================================================
✅ Uploaded: 135
⏭️  Skipped: 4
❌ Errors: 3
📦 Total: 142
==================================================
```

## 🎯 Image Matching Logic

Script automatically match karega agar:
- Filename mein product name ka **koi bhi part** ho
- Product name mein filename ka **koi bhi part** ho
- First 20 characters match ho jaye

**Examples of matches:**
- Product: "HP LaserJet M140w" → `hp-laserjet.jpg` ✅
- Product: "Canon PIXMA G3010" → `canon_pixma_g3010.png` ✅
- Product: "Epson EcoTank L3210" → `EPSON L3210.jpg` ✅

## ⚙️ Supported Image Formats

- JPG/JPEG
- PNG
- GIF
- WebP

## ❗ Important Notes

1. **Duplicate uploads prevented:** Agar product ka already Supabase URL hai, wo skip ho jayega
2. **Base64 images replaced:** Agar database mein base64 image hai, wo replace ho jayegi
3. **No overwrite:** Agar image already upload hai, duplicate nahi banega
4. **Auto-retry:** Agar koi error aaye, baki images fir bhi upload honge

## 🔧 Troubleshooting

### "Invalid Compact JWS" Error

Yeh error JWT token validation issue hai. Fix karne ke liye:

**Solution 1: Check .env file**
```bash
# Verify karo credentials sahi hain
cat .env
```

Make sure these values are correct:
- `VITE_SUPABASE_URL` - Should start with `https://`
- `VITE_SUPABASE_ANON_KEY` - Should be a long JWT token (starts with `eyJ`)

**Solution 2: Reload environment variables**
```bash
# Terminal restart karo ya
source .env
```

**Solution 3: Test connection manually**
```bash
# Pehle test karo connection
node -e "import('dotenv').then(d => { d.config(); console.log('URL:', process.env.VITE_SUPABASE_URL); console.log('Key exists:', !!process.env.VITE_SUPABASE_ANON_KEY); })"
```

**Solution 4: Check Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Settings → API
3. Copy fresh `anon/public` key
4. Replace in `.env` file

### "Folder not found" error
```bash
# Check karo path sahi hai ya nahi
ls -la ./my-images
```

### Images match nahi ho rahe
Image filenames product names ke similar rakho:
- Product: "HP LaserJet M140w"
- Image: `hp-laserjet-m140w.jpg` ✅
- Ya: `HP_LaserJet.jpg` ✅
- Ya: `hp.jpg` ⚠️ (might work but not recommended)

### Upload fail ho raha hai
- Check karo `.env` file mein Supabase credentials sahi hain
- Check karo Supabase storage bucket `product-images` exist karta hai
- Check karo file size 5MB se kam hai
- Try karo script dubara run karna

## 💡 Tips

1. **Backup:** Upload se pehle database ka backup le lo
2. **Test first:** Pehle 2-3 images se test karo
3. **File naming:** Clear aur descriptive filenames rakho
4. **Image optimization:** Upload se pehle images optimize kar lo (recommended size: 800x800px)

## 🎉 Done!

Script complete hone ke baad, apne admin panel mein jao aur products check karo - saare images uploaded hone chahiye!
