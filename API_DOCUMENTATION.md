ture: 'signature_from_gateway', // for Razorpay
      gateway: 'razorpay', // 'razorpay', 'stripe', or 'paypal'
      gatewayOrderId: 'gateway_order_id' // for Razorpay
    })
  }
)

const result = await response.json()
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "message": "Payment verified successfully"
}
```

---

## Database RPC Functions

### Admin Functions

#### 1. Get All Users
```javascript
const { data, error } = await supabase.rpc('admin_get_all_users', {
  p_website_id: 'website-uuid' // optional, null for all users
})

// Returns array of users with registration info
```

#### 2. Get Users by Website
```javascript
const { data, error } = await supabase.rpc('admin_get_users_by_website', {
  p_website_id: 'website-uuid'
})
```

#### 3. Get User Orders
```javascript
const { data, error } = await supabase.rpc('admin_get_user_orders', {
  p_user_id: 'user-uuid'
})
```

#### 4. Manage Website
```javascript
const { data, error } = await supabase.rpc('admin_manage_website', {
  p_website_id: 'uuid', // null for create
  p_name: 'Store Name',
  p_domain: 'store.com',
  p_is_active: true,
  p_config: {}
})
// Returns website_id (uuid)
```

#### 5. Delete Website
```javascript
const { data, error } = await supabase.rpc('admin_delete_website', {
  p_website_id: 'website-uuid'
})
// Returns boolean
```

#### 6. Get All Websites
```javascript
const { data, error } = await supabase.rpc('admin_get_all_websites')
// Returns all websites with their settings
```

---

### Utility Functions

#### 1. Get User Count
```javascript
const { data, error } = await supabase.rpc('get_user_count')
// Returns: bigint (total user count)
```

#### 2. Check if User is Admin
```javascript
const { data, error } = await supabase.rpc('is_admin', {
  user_id: 'user-uuid'
})
// Returns: boolean
```

#### 3. Convert Guest Order to User
```javascript
// After guest registers/logs in
const { error } = await supabase.rpc('convert_guest_order_to_user', {
  p_order_id: 'order-uuid',
  p_user_id: 'user-uuid'
})
```

#### 4. Update Order Payment Status
```javascript
const { data, error } = await supabase.rpc('update_order_payment_status', {
  p_order_id: 'order-uuid',
  p_payment_id: 'payment_id',
  p_gateway: 'razorpay'
})

// Returns: { success: true } or { success: false, error: 'message' }
```

---

## Storage Buckets

### 1. Product Images
**Bucket:** `product-images`

```javascript
// Upload image
const { data, error } = await supabase.storage
  .from('product-images')
  .upload(`${filename}`, file, {
    cacheControl: '3600',
    upsert: false
  })

// Get public URL
const { data } = supabase.storage
  .from('product-images')
  .getPublicUrl(filename)

// Delete image
const { error } = await supabase.storage
  .from('product-images')
  .remove([filename])

// List images
const { data, error } = await supabase.storage
  .from('product-images')
  .list()
```

### 2. Guide Images
**Bucket:** `guide-images`

Same API as product-images.

### 3. Blog Images
**Bucket:** `blog-images`

Same API as product-images.

---

## Example Implementations

### Complete E-commerce Flow

#### 1. Browse Products
```javascript
// Get all products with category filter
const { data: products, error } = await supabase
  .from('products')
  .select(`
    *,
    categories (name, slug)
  `)
  .eq('website_id', websiteId)
  .eq('category_id', categoryId) // optional
  .gte('stock', 1) // only in-stock items
  .order('created_at', { ascending: false })
```

#### 2. Add to Cart
```javascript
// Check if already in cart
const { data: existing } = await supabase
  .from('cart_items')
  .select('*')
  .eq('user_id', userId)
  .eq('product_id', productId)
  .maybeSingle()

if (existing) {
  // Update quantity
  await supabase
    .from('cart_items')
    .update({ quantity: existing.quantity + 1 })
    .eq('id', existing.id)
} else {
  // Add new item
  await supabase
    .from('cart_items')
    .insert({
      user_id: userId,
      product_id: productId,
      quantity: 1
    })
}
```

#### 3. Checkout
```javascript
// Create order
const { data: order } = await supabase
  .from('orders')
  .insert({
    user_id: userId,
    total_amount: totalAmount,
    payment_method: 'razorpay',
    shipping_address: addressData,
    website_id: websiteId
  })
  .select()
  .single()

// Create order items from cart
const { data: cartItems } = await supabase
  .from('cart_items')
  .select('product_id, quantity, products(price)')
  .eq('user_id', userId)

const orderItems = cartItems.map(item => ({
  order_id: order.id,
  product_id: item.product_id,
  quantity: item.quantity,
  price: item.products.price
}))

await supabase
  .from('order_items')
  .insert(orderItems)

// Clear cart
await supabase
  .from('cart_items')
  .delete()
  .eq('user_id', userId)
```

#### 4. Process Payment
```javascript
// Initialize payment
const response = await fetch(
  `${supabaseUrl}/functions/v1/process-payment`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({
      orderId: order.id,
      amount: totalAmount,
      currency: 'INR',
      paymentMethod: 'razorpay'
    })
  }
)

const paymentData = await response.json()

// For Razorpay - Show payment modal
const options = {
  key: paymentData.key,
  amount: paymentData.amount,
  currency: paymentData.currency,
  order_id: paymentData.orderId,
  handler: async function(response) {
    // Verify payment
    await verifyPayment(
      order.id,
      response.razorpay_payment_id,
      response.razorpay_signature,
      paymentData.orderId
    )
  }
}

const rzp = new Razorpay(options)
rzp.open()
```

#### 5. Verify Payment
```javascript
async function verifyPayment(orderId, paymentId, signature, gatewayOrderId) {
  const response = await fetch(
    `${supabaseUrl}/functions/v1/verify-payment`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        orderId,
        paymentId,
        signature,
        gateway: 'razorpay',
        gatewayOrderId
      })
    }
  )

  const result = await response.json()

  if (result.verified) {
    // Redirect to success page
    window.location.href = `/order-success?orderId=${orderId}`
  } else {
    // Show error
    alert('Payment verification failed')
  }
}
```

### Multi-Website Implementation

```javascript
// Get current website based on domain
const currentDomain = window.location.hostname

const { data: website } = await supabase
  .from('websites')
  .select('*')
  .eq('domain', currentDomain)
  .eq('is_active', true)
  .single()

// Use website.id for all subsequent queries
const websiteId = website.id

// Get website-specific settings
const { data: settings } = await supabase
  .from('site_settings')
  .select('*')
  .eq('website_id', websiteId)
  .single()

// Get website-specific products
const { data: products } = await supabase
  .from('products')
  .select('*')
  .eq('website_id', websiteId)
```

### Guest Checkout Flow

```javascript
// Create order as guest
const { data: order } = await supabase
  .from('orders')
  .insert({
    user_id: null,
    is_guest: true,
    guest_name: 'John Doe',
    guest_email: 'john@example.com',
    guest_phone: '+1234567890',
    total_amount: totalAmount,
    payment_method: 'Cash on Delivery',
    shipping_address: addressData,
    website_id: websiteId
  })
  .select()
  .single()

// If guest later registers
await supabase.rpc('convert_guest_order_to_user', {
  p_order_id: order.id,
  p_user_id: newUserId
})
```

### Admin Dashboard

```javascript
// Get dashboard stats
const { data: userCount } = await supabase.rpc('get_user_count')

const { data: orderStats } = await supabase
  .from('orders')
  .select('status, total_amount')
  .eq('website_id', websiteId)

const totalRevenue = orderStats
  .filter(o => o.status === 'delivered')
  .reduce((sum, o) => sum + parseFloat(o.total_amount), 0)

const { data: products } = await supabase
  .from('products')
  .select('count')
  .eq('website_id', websiteId)

// Get recent orders
const { data: recentOrders } = await supabase
  .from('orders')
  .select(`
    *,
    order_items (
      quantity,
      products (name)
    )
  `)
  .eq('website_id', websiteId)
  .order('created_at', { ascending: false })
  .limit(10)
```

---

## Security Notes

### Row Level Security (RLS)
All tables have RLS enabled. Key policies:

1. **Products, Categories, FAQs, Policies, Guides** - Public read access, admin write access
2. **Orders** - Users can only view their own orders, admins can view all
3. **Cart Items** - Users can only access their own cart
4. **Site Settings** - Public read, admin write
5. **Contact Submissions** - Anyone can create, only admins can read/update
6. **Admin Operations** - Only accessible with admin credentials

### Authentication
- User authentication via Supabase Auth
- Admin authentication via custom password system (separate from users)
- All sensitive operations require authentication

### API Security
- Use anon key for client-side operations
- Service role key only in edge functions (server-side)
- All edge functions have CORS configured
- Payment credentials encrypted in database

---

## Rate Limiting & Best Practices

1. **Pagination:** Always use `.limit()` and `.range()` for large datasets
2. **Filtering:** Apply filters at database level, not client-side
3. **Indexing:** Database has indexes on commonly queried fields
4. **Caching:** Cache static data like categories and settings
5. **Image Optimization:** Use CDN URLs with query parameters for resizing
6. **Error Handling:** Always check for errors in responses

---

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs
- Review RLS policies if access denied
- Verify authentication tokens
- Check console for detailed error messages
