# How to Get Your User ID and Become Admin

## Step 1: Find Your User ID

### Option A: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Click on "Authentication" in the left sidebar
3. Click on "Users"
4. Find your email address in the list
5. Copy the UUID (it looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### Option B: Using Browser Console
1. Sign in to your website
2. Open browser developer tools (Press F12)
3. Go to the "Console" tab
4. Paste this code and press Enter:
   ```javascript
   JSON.parse(localStorage.getItem('sb-' + Object.keys(localStorage).find(k => k.includes('sb-') && k.includes('-auth-token')).split('-')[1] + '-auth-token')).user.id
   ```
5. Copy the UUID that appears

## Step 2: Run the Correct SQL Query

Once you have your UUID, go to Supabase SQL Editor and run:

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('YOUR-UUID-HERE', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

**Replace `YOUR-UUID-HERE` with your actual UUID!**

Example with a fake UUID:
```sql
INSERT INTO user_roles (user_id, role)
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

## Step 3: Refresh Your Website

After running the query:
1. Refresh your browser
2. You should now see an "Admin" link in the navigation
3. Click it to access the admin panel

## Troubleshooting

If you still don't see the admin link:
- Make sure you're signed in with the same account
- Try signing out and signing back in
- Check that the query ran successfully (no errors)
