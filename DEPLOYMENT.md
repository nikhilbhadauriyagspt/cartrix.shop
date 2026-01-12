# Deployment Guide

Your application is ready to deploy! Here are the steps for different platforms:

## Prerequisites

Before deploying, ensure you have:
- ✅ Supabase project set up
- ✅ Environment variables configured
- ✅ Database migrations applied

## Option 1: Deploy to Netlify (Recommended)

### Quick Deploy
1. Visit [https://app.netlify.com](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your Git repository
4. Netlify will auto-detect the configuration from `netlify.toml`
5. Add environment variables:
   - `VITE_SUPABASE_URL` = Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key
6. Click "Deploy site"

### Manual Deploy (without Git)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

## Option 2: Deploy to Vercel

### Quick Deploy
1. Visit [https://vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your Git repository
4. Vercel will auto-detect Vite configuration
5. Add environment variables:
   - `VITE_SUPABASE_URL` = Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key
6. Click "Deploy"

### Manual Deploy (without Git)
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## Option 3: Deploy to GitHub Pages

1. Update `vite.config.js` to add base path:
```js
export default defineConfig({
  base: '/your-repo-name/',
  plugins: [react()],
})
```

2. Add deployment script to `package.json`:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

3. Install and deploy:
```bash
npm install --save-dev gh-pages
npm run deploy
```

## Important: Environment Variables

Your deployment MUST include these environment variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

You can find these in your Supabase project:
- Go to Project Settings → API
- Copy the Project URL and anon public key

## Troubleshooting

### Issue: "Blank page after deployment"
- **Solution**: Check browser console for errors. Usually missing environment variables.

### Issue: "404 on page refresh"
- **Solution**: Ensure redirects are configured (netlify.toml or vercel.json already set up)

### Issue: "Can't connect to database"
- **Solution**: Verify environment variables are set correctly in your deployment platform

### Issue: "Admin panel not working"
- **Solution**: Make sure you've run all database migrations and created an admin user

## Post-Deployment Checklist

- [ ] Test user registration and login
- [ ] Test product browsing and cart
- [ ] Test admin login at `/admin/login`
- [ ] Verify payment gateway configuration (if using)
- [ ] Test contact form submissions
- [ ] Check that all images load correctly
- [ ] Test on mobile devices

## Custom Domain

### Netlify
1. Go to Site settings → Domain management
2. Add custom domain
3. Follow DNS configuration instructions

### Vercel
1. Go to Project Settings → Domains
2. Add domain
3. Configure DNS records

## Need Help?

Common deployment issues:
1. **Build fails**: Run `npm run build` locally first
2. **Environment variables**: Double-check they're set in deployment platform
3. **Database errors**: Ensure all migrations are applied to production database
4. **CORS errors**: Check Supabase project settings

Your app builds successfully! Just choose a platform and deploy. 🚀
