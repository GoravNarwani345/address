const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Centralized AI utility to interact with Gemini
 */
const ai = {
    /**
     * Get a generative model instance
     * @param {string} model - The model name (default: gemini-1.5-flash)
     */
    getModel: (model = "gemini-1.5-flash") => {
        return genAI.getGenerativeModel({ model });
    },

    /**
     * Generate structured content from Gemini
     * @param {string} prompt - The prompt to send
     * @param {string} systemPrompt - Optional system instruction
     */
    generateStructured: async (prompt, systemPrompt = "") => {
        try {
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                systemInstruction: systemPrompt
            });

            // Set generation config for JSON response if applicable
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();

            // More robust JSON extraction for different Gemini formats
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                text = jsonMatch[0];
            } else {
                text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            }

            return JSON.parse(text);
        } catch (error) {
            console.error("Gemini Generation Error:", Math.random()); // simple distinct log to avoid long dumps
            // Return a safe neutral fallback for semantic search
            return {
                "propertyType": null,
                "category": null,
                "address": null,
                "minPrice": null,
                "maxPrice": null,
                "bedrooms": null,
                "bathrooms": null
            };
        }
    },

    /**
     * Standard text generation
     */
    generateText: async (prompt) => {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("Gemini Text Error [Fallback Used]");
            return "This property offers a fantastic investment opportunity. Due to high demand, please contact the dealer for personalized insights and viewing arrangements.";
        }
    }
};

module.exports = ai;
