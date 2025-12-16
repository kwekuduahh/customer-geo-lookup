import axios from 'axios';
import * as cheerio from 'cheerio';
import { getRandomUserAgent } from './userAgents.js';

/**
 * Get random Accept-Language header
 */
function getRandomAcceptLanguage() {
	const languages = [
		'en-US,en;q=0.9',
		'en-GB,en;q=0.9',
		'en-US,en;q=0.9,fr;q=0.8',
		'en-US,en;q=0.9,es;q=0.8',
		'en-US,en;q=0.9,de;q=0.8',
	];
	return languages[Math.floor(Math.random() * languages.length)];
}

/**
 * Add random delay to avoid rate limiting
 */
function randomDelay(min = 1000, max = 3000) {
	const delay = Math.floor(Math.random() * (max - min + 1)) + min;
	return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Scrape geolocation data from Scamalytics IP lookup page
 * @param {string} ip - IP address to lookup
 * @returns {Promise<Object>} Geolocation data object
 */
export async function scrapeIPData(ip) {
	const url = `https://scamalytics.com/ip/${ip}`;

	// Add random delay before request to avoid rate limiting
	await randomDelay(1000, 2500);

	const userAgent = getRandomUserAgent();
	const headers = {
		'User-Agent': userAgent,
		Accept:
			'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
		'Accept-Language': getRandomAcceptLanguage(),
		'Accept-Encoding': 'gzip, deflate, br',
		Connection: 'keep-alive',
		'Upgrade-Insecure-Requests': '1',
		'Sec-Fetch-Dest': 'document',
		'Sec-Fetch-Mode': 'navigate',
		'Sec-Fetch-Site': 'none',
		'Sec-Fetch-User': '?1',
		'Cache-Control': 'max-age=0',
		Referer: 'https://www.google.com/',
		DNT: '1',
	};

	try {
		console.log(
			`[Scraper] Fetching IP data for ${ip} with User-Agent: ${userAgent.substring(
				0,
				50
			)}...`
		);

		const response = await axios.get(url, {
			headers,
			timeout: 15000, // 15 second timeout (increased)
			validateStatus: (status) => status < 500, // Don't throw on 4xx errors
			maxRedirects: 5,
			decompress: true,
		});

		if (response.status !== 200) {
			console.error(`[Scraper] HTTP ${response.status} error for IP ${ip}`);
			throw new Error(`HTTP ${response.status}: Failed to fetch page`);
		}

		console.log(
			`[Scraper] Successfully fetched page for IP ${ip}, content length: ${
				response.data?.length || 0
			}`
		);

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
				} else if (
					(label.includes('state') || label.includes('province')) &&
					!state
				) {
					state = value;
				} else if (
					(label.includes('district') || label.includes('county')) &&
					!district
				) {
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
				} else if (
					(text.includes('state') || text.includes('province')) &&
					!state &&
					nextText
				) {
					state = nextText;
				} else if (
					(text.includes('district') || text.includes('county')) &&
					!district &&
					nextText
				) {
					district = nextText;
				} else if (text.includes('city') && !city && nextText) {
					city = nextText;
				}
			});
		}

		// Method 3: Look for specific data attributes or IDs
		const countryElem = $('[data-country], #country, .country').first();
		const stateElem = $(
			'[data-state], [data-province], #state, .state, .province'
		).first();
		const districtElem = $(
			'[data-district], [data-county], #district, .district, .county'
		).first();
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
			city: city || 'N/A',
		};
	} catch (error) {
		console.error(`[Scraper] Error scraping IP ${ip}:`, {
			message: error.message,
			status: error.response?.status,
			statusText: error.response?.statusText,
			code: error.code,
			hasResponse: !!error.response,
			hasRequest: !!error.request,
		});

		if (error.response) {
			const status = error.response.status;
			if (status === 403 || status === 429) {
				throw new Error(
					`Access denied (HTTP ${status}): Scamalytics may be blocking requests. Try again later or use a different approach.`
				);
			}
			throw new Error(
				`HTTP ${status}: ${error.response.statusText || 'Failed to fetch page'}`
			);
		} else if (error.request) {
			throw new Error(
				'Network error: Unable to reach Scamalytics. Please check your connection.'
			);
		} else if (error.code === 'ECONNABORTED') {
			throw new Error('Request timeout: The request took too long to complete.');
		} else {
			throw new Error(`Scraping error: ${error.message}`);
		}
	}
}
