# Netlify Deployment Guide for Vlanco Streetwear

## Prerequisites
- GitHub repository: [Mhmdachkar/Vlanco-Streetwear](https://github.com/Mhmdachkar/Vlanco-Streetwear)
- Netlify account
- Supabase project with environment variables

## Deployment Files Added
✅ `public/_redirects` - SPA routing support  
✅ `public/robots.txt` - SEO optimization  
✅ `public/sitemap.xml` - Search engine indexing  
✅ `public/site.webmanifest` - PWA capabilities  
✅ `netlify.toml` - Build configuration  
✅ `.nvmrc` - Node.js version specification  
✅ `env.example` - Environment variables template  

## Step-by-Step Deployment

### 1. Connect to Netlify
- Go to [Netlify](https://netlify.com) → "Add new site" → "Import from Git"
- Choose GitHub and select `Mhmdachkar/Vlanco-Streetwear`
- **Important**: Set Base directory to `vlanco-streetwear-verse-main`

### 2. Build Settings
- Build command: `npm run build` (already configured in netlify.toml)
- Publish directory: `dist` (already configured in netlify.toml)
- Node version: 18 (specified in .nvmrc)

### 3. Environment Variables
Set these in Netlify → Site settings → Environment variables:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Deploy
- Click "Deploy site"
- Netlify will automatically build and deploy your app

## Post-Deployment
- Update `public/sitemap.xml` with your actual domain
- Replace placeholder favicon.ico with actual icon
- Test SPA routing by refreshing deep links
- Verify Supabase connection works

## Troubleshooting
- **Build fails**: Check Base directory is exactly `vlanco-streetwear-verse-main`
- **404 on refresh**: Ensure `_redirects` file is in `public/` folder
- **Supabase errors**: Verify environment variables are set correctly

## Custom Domain (Optional)
- Go to Domain management → Add domain
- Follow DNS configuration instructions
- HTTPS is automatically provisioned
