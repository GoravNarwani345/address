/**
 * Sanitize price string to a numeric value.
 * Handles shorthand like "40k" -> 40000, "2.5M" -> 2500000.
 *
 * @param {string|number} price - The price value to sanitize
 * @returns {number} The sanitized numeric price
 */
const sanitizePrice = (price) => {
    if (typeof price === 'number') return price;
    if (!price) return 0;
    let sanitized = price.toString().toLowerCase().replace(/,/g, '').trim();
    if (sanitized.endsWith('k')) {
        sanitized = parseFloat(sanitized.slice(0, -1)) * 1000;
    } else if (sanitized.endsWith('m')) {
        sanitized = parseFloat(sanitized.slice(0, -1)) * 1000000;
    } else {
        sanitized = parseFloat(sanitized);
    }
    return isNaN(sanitized) ? 0 : sanitized;
};

module.exports = sanitizePrice;
