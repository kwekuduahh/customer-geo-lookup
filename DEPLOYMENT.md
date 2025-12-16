# Deployment Guide

## Prerequisites

1. Node.js 18+ installed
2. Vercel account (free tier works)
3. Git repository (optional but recommended)

## Local Development

1. **Install dependencies:**
```bash
npm install
```

2. **Run development server:**
```bash
npm run dev
```

3. **Access the application:**
- Web interface: http://localhost:3000
- API endpoint: http://localhost:3000/api/lookup?ip=154.161.165.171

4. **Run tests:**
```bash
npm test
```

## Deployment to Vercel

### Option 1: Vercel CLI (Recommended)

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

4. **Your API will be available at:**
```
https://your-project.vercel.app/api/lookup?ip=154.161.165.171
```

### Option 2: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository or upload the project
4. Vercel will auto-detect the configuration
5. Click "Deploy"

### Option 3: Netlify Functions

If you prefer Netlify:

1. **Create `netlify.toml`:**
```toml
[build]
  functions = "netlify/functions"
  publish = "public"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

2. **Create `netlify/functions/lookup.js`:**
```javascript
import handler from '../../src/api/lookup.js';

export { handler as default };
```

3. **Deploy via Netlify CLI or Dashboard**

## Environment Variables

Currently, no environment variables are required. If you need to add:
- Rate limiting keys
- API keys
- Custom configurations

Add them in Vercel Dashboard → Settings → Environment Variables

## Testing the Deployment

After deployment, test your API:

```bash
curl "https://your-project.vercel.app/api/lookup?ip=154.161.165.171"
```

Expected response:
```json
{
  "success": true,
  "ip": "154.161.165.171",
  "data": {
    "country": "Ghana",
    "state": "Greater Accra",
    "district": "Accra Metropolitan",
    "city": "Accra"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Troubleshooting

### CORS Issues
If you encounter CORS errors, the API already includes CORS headers. Make sure your frontend is calling the correct endpoint.

### Function Timeout
Vercel free tier has a 10-second timeout. If scraping takes longer, consider:
- Adding caching
- Optimizing the scraper
- Using Vercel Pro plan

### Rate Limiting
If Scamalytics blocks requests:
- Increase delays between requests
- Use proxy rotation (not included in current implementation)
- Respect robots.txt and rate limits

## Monitoring

Monitor your deployment:
- Vercel Dashboard → Functions → View logs
- Check function execution times
- Monitor error rates

## Updates

To update your deployment:
```bash
git push  # If using Git integration
# OR
vercel --prod  # If using CLI
```

