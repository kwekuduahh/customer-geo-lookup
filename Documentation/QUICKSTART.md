# Quick Start Guide

Get your web scraper up and running in minutes!

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages:
- `axios` - HTTP client for making requests
- `cheerio` - HTML parsing and extraction
- `express` - Local development server
- `serverless-http` - Serverless compatibility

## Step 2: Start Development Server

```bash
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3000
📡 API endpoint: http://localhost:3000/api/lookup?ip=154.161.165.171
🌐 Web interface: http://localhost:3000
```

## Step 3: Test the Web Interface

1. Open your browser to `http://localhost:3000`
2. Enter an IP address (e.g., `154.161.165.171`)
3. Click "Lookup" or press Enter
4. View the extracted geolocation data

## Step 4: Test the API

### Using curl:
```bash
curl "http://localhost:3000/api/lookup?ip=154.161.165.171"
```

### Using browser:
Navigate to:
```
http://localhost:3000/api/lookup?ip=154.161.165.171
```

### Expected Response:
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

## Step 5: Run Tests

```bash
npm test
```

This will run unit tests for:
- IP address validation
- User-agent rotation
- Utility functions

## Step 6: Deploy (Optional)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

Quick Vercel deployment:
```bash
npm i -g vercel
vercel login
vercel --prod
```

## Troubleshooting

### Port Already in Use
If port 3000 is taken, set a different port:
```bash
PORT=3001 npm run dev
```

### Module Not Found Errors
Make sure you've run `npm install` and you're using Node.js 18+.

### Scraping Fails
- Check your internet connection
- Verify the IP address is valid
- Scamalytics may have rate limiting - wait a few seconds between requests

## Next Steps

- Customize the scraper for different data fields
- Add caching to reduce API calls
- Implement rate limiting
- Add more test IPs to the quick test buttons

## Support

For issues or questions:
1. Check the [README.md](./README.md)
2. Review [DEPLOYMENT.md](./DEPLOYMENT.md)
3. Check the test files for usage examples

