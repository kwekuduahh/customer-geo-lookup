import { scrapeIPData } from '../scraper/scraper.js';
import { isValidIP } from '../utils/validators.js';

/**
 * Serverless function handler for IP lookup
 * Compatible with Vercel serverless functions
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use GET request.'
    });
  }

  try {
    // Extract IP from query parameter
    let ip = req.query?.ip || req.query?.IP;

    if (!ip) {
      return res.status(400).json({
        success: false,
        error: 'IP address is required. Use ?ip=154.161.165.171'
      });
    }

    // Validate IP format
    if (!isValidIP(ip)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid IP address format'
      });
    }

    // Scrape data
    const data = await scrapeIPData(ip);

    // Return success response
    return res.status(200).json({
      success: true,
      ip: ip,
      data: data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in lookup handler:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch IP data',
      timestamp: new Date().toISOString()
    });
  }
}

