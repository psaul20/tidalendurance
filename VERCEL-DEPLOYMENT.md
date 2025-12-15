# Vercel Deployment Guide

This guide walks you through deploying your Tidal Endurance site with serverless functions to Vercel.

## Prerequisites

1. A GitHub account (if your repo is on GitHub)
2. A Vercel account (free at vercel.com)

## Method 1: Deploy via Vercel Dashboard (Easiest)

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Sign up with GitHub (recommended for auto-deployments)

### Step 2: Import Your Project

1. After signing in, click "Add New..." → "Project"
2. Import your Git repository (GitHub/GitLab/Bitbucket)
3. Select your `tidalendurance` repository
4. Vercel will auto-detect your configuration from `vercel.json`

### Step 3: Configure Project Settings (Usually Auto-Detected)

- **Framework Preset**: Other (static site)
- **Build Command**: Leave empty (no build needed)
- **Output Directory**: `.` (current directory)
- **Install Command**: Leave empty

### Step 4: Deploy

1. Click "Deploy"
2. Wait 30-60 seconds for deployment
3. You'll get a URL like: `tidalendurance.vercel.app`

### Step 5: Test Your Serverless Function

Once deployed, test your API endpoint:

```
https://tidalendurance.vercel.app/api/substack?url=https://yourpublication.substack.com/feed
```

Replace `yourpublication` with your actual Substack publication name.

## Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login

```bash
vercel login
```

Follow the prompts to authenticate with your Vercel account.

### Step 3: Deploy

From your project directory:

```bash
# First deployment
vercel

# Production deployment
vercel --prod
```

The CLI will:
1. Ask a few setup questions (accept defaults)
2. Upload your project
3. Deploy it
4. Give you a URL

### Step 4: Link to Custom Domain (Optional)

If you want to use your own domain (e.g., tidalendurance.com):

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update your domain's DNS settings as instructed
4. Your CNAME file will be honored

## Testing Locally Before Deployment

### Install Vercel CLI (if not already installed)

```bash
npm install -g vercel
```

### Run Local Development Server

```bash
vercel dev
```

This starts a local server at `http://localhost:3000` that:
- Serves your static files
- Runs your serverless functions locally
- Simulates the Vercel environment

### Test Your API Locally

Visit: `http://localhost:3000/api/substack?url=https://yourpublication.substack.com/feed`

## Environment Variables (If Needed)

If you want to hardcode your Substack URL and keep it private:

### Step 1: Create .env file (local only)

```bash
# .env
SUBSTACK_URL=https://yourpublication.substack.com/feed
```

Add `.env` to `.gitignore` (already done).

### Step 2: Update api/substack.js

```javascript
const substackUrl = process.env.SUBSTACK_URL || req.query.url;
```

### Step 3: Add to Vercel

1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `SUBSTACK_URL` with your Substack feed URL
3. Redeploy

## Automatic Deployments

Once connected to GitHub:
- Every push to `main` branch = automatic production deployment
- Every push to other branches = preview deployment with unique URL
- Pull requests get their own preview URLs

## Monitoring

Vercel Dashboard shows:
- Deployment history
- Function invocation logs
- Performance metrics
- Error tracking

## Costs

**Free Tier Includes:**
- Unlimited static hosting
- 100 GB bandwidth per month
- 100 hours of serverless function execution time
- Automatic HTTPS
- Global CDN

For a personal site fetching RSS feeds, you'll likely never exceed the free tier.

## Troubleshooting

### Function doesn't work after deployment

1. Check Vercel Dashboard → Functions tab
2. View runtime logs
3. Ensure `api/substack.js` is present in deployment

### CORS errors still happening

1. Verify the `Access-Control-Allow-Origin` header is set in `api/substack.js`
2. Check browser console for the actual error
3. Test the API endpoint directly in a new browser tab

### 404 on /api/substack

1. Ensure `vercel.json` is in the root directory
2. Ensure `api/substack.js` is committed to git
3. Check the Functions tab in Vercel dashboard

## Next Steps

After deployment:
1. Update your JavaScript to use the deployed API endpoint
2. Create the #articles modal in index.html
3. Test with your actual Substack URL
4. Optionally set up a custom domain
