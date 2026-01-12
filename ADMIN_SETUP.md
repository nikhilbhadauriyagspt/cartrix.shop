# Admin Setup Instructions

## Making a User an Admin

To grant admin access to a user, you need to add their user ID to the `user_roles` table with the role 'admin'.

### Steps:

1. **Sign up for an account** on the website if you haven't already
2. **Get your user ID** from the authentication system
3. **Run the following SQL query** in your Supabase SQL editor:

```sql
-- Replace 'your-user-id-here' with the actual user ID from auth.users
INSERT INTO user_roles (user_id, role)
VALUES ('your-user-id-here', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

### How to Get Your User ID:

You can find your user ID in one of these ways:

1. **From Supabase Dashboard:**
   - Go to your Supabase project dashboard
   - Navigate to Authentication > Users
   - Find your email and copy the ID

2. **From Browser Console:**
   - Sign in to the website
   - Open browser console (F12)
   - Run: `localStorage.getItem('sb-[your-project-ref]-auth-token')`
   - Find the user ID in the JSON response

## Admin Features

Once you have admin access, you'll see:

- **Admin Panel link** in the navigation (shield icon)
- Access to `/admin` routes
- Dashboard with statistics
- Product management (add, edit, delete products)
- Blog management (create, edit, publish, delete blog posts)

## Admin Panel Pages

- **Dashboard** (`/admin`) - Overview of products, blogs, orders, and revenue
- **Products** (`/admin/products`) - Manage all products in the store
- **Blogs** (`/admin/blogs`) - Create and manage blog posts

## Security Notes

- Only users with 'admin' role in the `user_roles` table can access admin features
- All admin routes are protected by Row Level Security (RLS) policies
- Non-admin users will be redirected if they try to access admin pages
