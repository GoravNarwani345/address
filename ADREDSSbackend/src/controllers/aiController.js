const ai = require('../utils/ai');
const priceAnalysis = require('../utils/priceAnalysis');

/**
 * Parses natural language search queries into database filters
 * Example: "3 bed house in Qasimabad Hyderabad under 20M"
 */
exports.parseSearchQuery = async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const systemPrompt = `
            You are a real estate search assistant for ADREDSS (Sindh, Pakistan).
            Transform the user's natural language query into a JSON filter object.
            
            Supported fields:
            - propertyType: "flat", "house", or "other"
            - category: "sell" or "rent"
            - address: (string, e.g., "Qasimabad", "Latifabad")
            - minPrice: (number)
            - maxPrice: (number)
            - bedrooms: (number)
            - bathrooms: (number)

            Context: All properties are in Hyderabad/Sindh area. 
            Price units: "crore" = 10,000,000, "lakh" = 100,000, "million/M" = 1,000,000.
            
            Return ONLY the raw JSON object. Use null if a field is not mentioned.
        `;

        const filter = await ai.generateStructured(query, systemPrompt);

        res.status(200).json({
            success: true,
            query,
            filter
        });
    } catch (error) {
        console.error("AI Search Error:", error);
        res.status(500).json({ message: "Failed to parse search query" });
    }
};

/**
 * Generates an 'AI Insight' for a specific property including price analysis
 */
exports.getPropertyInsight = async (req, res) => {
    try {
        const { propertyData } = req.body;

        if (!propertyData) {
            return res.status(400).json({ message: "Property data is required" });
        }

        // 1. Perform technical price analysis
        const areaStats = await priceAnalysis.getAreaStats(
            propertyData.address,
            propertyData.propertyType,
            propertyData.category
        );

        const ratingData = priceAnalysis.rateProperty(
            propertyData.price,
            propertyData.area,
            areaStats
        );

        // 2. Build the prompt for Gemini
        const prompt = `
            Analyze this property listing for ADREDSS (Sindh, Pakistan).
            
            Property: ${JSON.stringify(propertyData)}
            Market Context: ${areaStats ? `Average price per sq ft in ${areaStats.areaName} is ${areaStats.avgPricePerSqFt.toFixed(2)} based on ${areaStats.count} listings.` : 'Limited area data available.'}
            Price Analysis: This property is ${ratingData.difference}% ${ratingData.difference < 0 ? 'below' : 'above'} area average. 
            Rating: ${ratingData.rating.replace('_', ' ')}

            Provide a concise "Smart Insight" (max 30 words) in 2nd person.
            Focus on the price value relative to the market and suitability (families/investors).
            If it's a "good deal", highlight the savings. If overpriced, mention luxury or specific features that might justify it.
        `;

        const insight = await ai.generateText(prompt);

        res.status(200).json({
            success: true,
            insight: insight.trim(),
            analysis: ratingData
        });
    } catch (error) {
        console.error("Insight Generation Error:", error);
        res.status(500).json({ message: "Failed to generate insight" });
    }
};
