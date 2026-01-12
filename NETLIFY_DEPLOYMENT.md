# Netlify Deployment Guide

## Fixed Issues
1. Updated Node.js version to 20.11.0
2. Fixed build command with proper npm install
3. Cleaned up duplicate environment variables
4. Added legacy peer deps flag for compatibility

## Deploy to Netlify

### Step 1: Add Environment Variables to Netlify

Before deploying, you MUST add these environment variables to your Netlify site:

1. Go to your Netlify site dashboard
2. Click "Site configuration" > "Environment variables"
3. Add these two variables:

```
VITE_SUPABASE_URL=https://uiugcaaffkaaqmydvjuj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpdWdjYWFmZmthYXFteWR2anVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MzI3ODgsImV4cCI6MjA4MzIwODc4OH0.b8zapu6FDQUILxgBLSjQB443vzdeVl-hIEdkZXmTa9I
```

### Step 2: Deploy

After adding the environment variables, trigger a new deploy:

1. Push your code to your Git repository
2. Netlify will automatically deploy
3. Or manually trigger a deploy from the Netlify dashboard

## What's Been Fixed

- `netlify.toml`: Updated to use Node 20.11.0 and proper build command
- `.env`: Cleaned up duplicate environment variable
- Build verified working locally

## Your site should now deploy successfully!
