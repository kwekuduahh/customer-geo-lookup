import express from 'express';
import handler from './api/lookup.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, '../public')));

// API route - adapt serverless handler for Express
app.get('/api/lookup', async (req, res) => {
  // Create a mock response object compatible with serverless handler
  const mockRes = {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader: (key, value) => {
      mockRes.headers[key] = value;
      res.setHeader(key, value);
    },
    status: (code) => {
      mockRes.statusCode = code;
      return {
        json: (data) => {
          mockRes.body = data;
          res.status(code).json(data);
        },
        end: () => {
          res.status(code).end();
        }
      };
    },
    json: (data) => {
      mockRes.body = data;
      res.json(data);
    },
    end: () => {
      res.end();
    }
  };

  await handler(req, mockRes);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/lookup?ip=154.161.165.171`);
  console.log(`🌐 Web interface: http://localhost:${PORT}`);
});

