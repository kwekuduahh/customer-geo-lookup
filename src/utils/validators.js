/**
 * IP address validation utilities
 */

/**
 * Validate IP address format (IPv4)
 * @param {string} ip - IP address to validate
 * @returns {boolean} True if valid IPv4 format
 */
export function isValidIP(ip) {
  if (!ip || typeof ip !== 'string') {
    return false;
  }

  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip.trim());
}

/**
 * Sanitize IP address input
 * @param {string} ip - IP address to sanitize
 * @returns {string|null} Sanitized IP or null if invalid
 */
export function sanitizeIP(ip) {
  if (!ip || typeof ip !== 'string') {
    return null;
  }

  const trimmed = ip.trim();
  return isValidIP(trimmed) ? trimmed : null;
}

