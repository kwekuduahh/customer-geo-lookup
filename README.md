# Web Scraper - Scamalytics IP Geolocation

A serverless REST API with web interface to scrape geolocation data (Country, State/Province, District/County, City) from Scamalytics IP lookup pages.

## Features

- 🌍 Extract geolocation data from Scamalytics
- 🔄 User-agent rotation for anti-bot protection
- 🚀 Serverless deployment ready (Vercel/Netlify)
- 🎨 Simple web interface
- 📊 JSON API responses
- ✅ IP validation

## Project Structure

```
WebScraper/
├── src/
│   ├── scraper/
│   │   ├── scraper.js
│   │   └── userAgents.js
│   ├── api/
│   │   └── lookup.js
│   ├── utils/
│   │   └── validators.js
│   └── server.js
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── tests/
│   └── scraper.test.js
└── vercel.json
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run local development server:
```bash
npm run dev
```

3. Open browser to `http://localhost:3000`

## API Usage

### Endpoint
```
GET /api/lookup?ip=154.161.165.171
```

### Response
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

## Deployment

### Vercel
```bash
npm run deploy
```

### Netlify
Configure `netlify.toml` and deploy via Netlify dashboard or CLI.

## Testing

```bash
npm test
```

## License

MIT

