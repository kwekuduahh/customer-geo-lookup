import axios from 'axios';
import * as cheerio from 'cheerio';
import { getRandomUserAgent } from './userAgents.js';

/**
 * Scrape geolocation data from Scamalytics IP lookup page
 * @param {string} ip - IP address to lookup
 * @returns {Promise<Object>} Geolocation data object
 */
export async function scrapeIPData(ip) {
  const url = `https://scamalytics.com/ip/${ip}`;
  
  const headers = {
    'User-Agent': getRandomUserAgent(),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Cache-Control': 'max-age=0'
  };

  try {
    const response = await axios.get(url, { 
      headers,
      timeout: 10000, // 10 second timeout
      validateStatus: (status) => status < 500 // Don't throw on 4xx errors
    });

    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}: Failed to fetch page`);
    }

    const $ = cheerio.load(response.data);
    
    // Extract geolocation data
    // Scamalytics typically displays data in table format
    // We'll look for common patterns and table structures
    
    let country = '';
    let state = '';
    let district = '';
    let city = '';

    // Method 1: Look for table rows with specific text patterns
    $('table tr, .table tr, tbody tr').each((i, elem) => {
      const $row = $(elem);
      const text = $row.text().toLowerCase();
      const cells = $row.find('td, th');

      if (cells.length >= 2) {
        const label = $(cells[0]).text().trim().toLowerCase();
        const value = $(cells[1]).text().trim();

        if (label.includes('country') && !country) {
          country = value;
        } else if ((label.includes('state') || label.includes('province')) && !state) {
          state = value;
        } else if ((label.includes('district') || label.includes('county')) && !district) {
          district = value;
        } else if (label.includes('city') && !city) {
          city = value;
        }
      }
    });

    // Method 2: Look for div/span structures with labels
    if (!country || !state || !district || !city) {
      $('div, span, p').each((i, elem) => {
        const $elem = $(elem);
        const text = $elem.text().toLowerCase();
        const nextText = $elem.next().text().trim();

        if (text.includes('country') && !country && nextText) {
          country = nextText;
        } else if ((text.includes('state') || text.includes('province')) && !state && nextText) {
          state = nextText;
        } else if ((text.includes('district') || text.includes('county')) && !district && nextText) {
          district = nextText;
        } else if (text.includes('city') && !city && nextText) {
          city = nextText;
        }
      });
    }

    // Method 3: Look for specific data attributes or IDs
    const countryElem = $('[data-country], #country, .country').first();
    const stateElem = $('[data-state], [data-province], #state, .state, .province').first();
    const districtElem = $('[data-district], [data-county], #district, .district, .county').first();
    const cityElem = $('[data-city], #city, .city').first();

    if (!country && countryElem.length) country = countryElem.text().trim();
    if (!state && stateElem.length) state = stateElem.text().trim();
    if (!district && districtElem.length) district = districtElem.text().trim();
    if (!city && cityElem.length) city = cityElem.text().trim();

    // Clean up extracted values
    country = country.replace(/^country\s*:?\s*/i, '').trim();
    state = state.replace(/^(state|province)\s*:?\s*/i, '').trim();
    district = district.replace(/^(district|county)\s*:?\s*/i, '').trim();
    city = city.replace(/^city\s*:?\s*/i, '').trim();

    return {
      country: country || 'N/A',
      state: state || 'N/A',
      district: district || 'N/A',
      city: city || 'N/A'
    };

  } catch (error) {
    if (error.response) {
      throw new Error(`HTTP ${error.response.status}: ${error.response.statusText}`);
    } else if (error.request) {
      throw new Error('Network error: Unable to reach Scamalytics');
    } else {
      throw new Error(`Scraping error: ${error.message}`);
    }
  }
}

