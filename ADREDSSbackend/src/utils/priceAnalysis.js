const Property = require('../models/Property');

/**
 * Utility to analyze property pricing against area averages
 */
const priceAnalysis = {
    /**
     * Get average price for a specific area and property type
     * @param {string} address - The area/address to search
     * @param {string} propertyType - The type of property (flat, house, etc.)
     * @param {string} category - rent or sell
     */
    getAreaStats: async (address, propertyType, category) => {
        try {
            // Find properties in the same general area
            // We use a regex for the address to match sub-localities
            const areaMatch = address.split(',')[0].trim();

            const stats = await Property.aggregate([
                {
                    $match: {
                        address: { $regex: areaMatch, $options: 'i' },
                        propertyType: propertyType,
                        category: category,
                        status: 'available',
                        area: { $gt: 0 } // Ensure we have area data
                    }
                },
                {
                    $group: {
                        _id: null,
                        avgPrice: { $avg: "$price" },
                        avgArea: { $avg: "$area" },
                        count: { $sum: 1 }
                    }
                }
            ]);

            if (stats.length === 0) return null;

            const { avgPrice, avgArea, count } = stats[0];
            const avgPricePerSqFt = avgPrice / avgArea;

            return {
                avgPrice,
                avgArea,
                avgPricePerSqFt,
                count,
                areaName: areaMatch
            };
        } catch (error) {
            console.error("Price Analysis Error:", error);
            return null;
        }
    },

    /**
     * Rate a specific property compared to area averages
     */
    rateProperty: (propertyPrice, propertyArea, areaStats) => {
        if (!areaStats || !propertyArea) return { rating: 'fair', difference: 0 };

        const propertyPricePerSqFt = propertyPrice / propertyArea;
        const diffPercent = ((propertyPricePerSqFt - areaStats.avgPricePerSqFt) / areaStats.avgPricePerSqFt) * 100;

        let rating = 'fair';
        if (diffPercent < -10) rating = 'good_deal';
        else if (diffPercent > 15) rating = 'overpriced';

        return {
            rating,
            difference: Math.round(diffPercent),
            avgPricePerSqFt: Math.round(areaStats.avgPricePerSqFt)
        };
    }
};

module.exports = priceAnalysis;
