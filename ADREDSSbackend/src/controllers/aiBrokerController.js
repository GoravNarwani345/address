const { GoogleGenerativeAI } = require('@google/generative-ai');
const Property = require('../models/Property');
const User = require('../models/User');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chatWithAIBroker = async (req, res) => {
  try {
    const { propertyId, message, userRole } = req.body;
    const userId = req.userId;

    const property = await Property.findById(propertyId).populate('createdBy', 'name phone email');
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    const user = await User.findById(userId);
    const brokerName = property.createdBy.name || 'Ahmad';
    
    const context = `You are ${brokerName}, a real estate broker in Pakistan. Talk EXACTLY like a real person texting - casual, natural, NO corporate language. Property: ${property.title}, Price: PKR ${property.price.toLocaleString()}, ${property.bedrooms} beds, ${property.area} sq ft, ${property.address}. Client: ${user.name}. Rules: 1) Never mention ADREDSS or any platform name 2) Never say "How can I help" or "dream spot" 3) Talk like WhatsApp chat - short, friendly, real 4) Use Urdu-English mix if natural 5) Be direct about property 6) Max 2 short sentences. Examples: "Hey! Yeah this property is great value. Want to see it?" or "Salam! Price is negotiable, when can you visit?" Client said: ${message}. Your reply:`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(context);
    const response = result.response.text();

    res.json({ success: true, response });
  } catch (error) {
    console.error('AI Broker Error:', error);
    res.status(500).json({ success: false, message: 'AI assistant unavailable' });
  }
};

exports.getPriceSuggestion = async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    const similarProperties = await Property.find({
      propertyType: property.propertyType,
      category: property.category,
      bedrooms: property.bedrooms,
      _id: { $ne: propertyId }
    }).limit(10);

    const avgPrice = similarProperties.reduce((sum, p) => sum + p.price, 0) / similarProperties.length;
    const pricePerSqFt = property.area ? property.price / property.area : 0;
    const avgPricePerSqFt = similarProperties.reduce((sum, p) => 
      sum + (p.area ? p.price / p.area : 0), 0) / similarProperties.length;

    const context = `You are Ahmad, a senior real estate broker in Pakistan with 8 years experience. Property Analysis: Current Price: PKR ${property.price.toLocaleString()}, Area: ${property.area} sq ft, Price per sq ft: PKR ${pricePerSqFt.toFixed(0)}, Market average: PKR ${avgPrice.toFixed(0)}, Market avg per sq ft: PKR ${avgPricePerSqFt.toFixed(0)}. Talk like a real broker, not AI. Be direct and honest. Provide: 1. Your honest opinion (overpriced/fair/good deal) - be blunt. 2. What you would list it for (give exact number). 3. One sentence market insight. Keep it short and conversational. Example: Honestly, this is a bit high. I would list it around PKR 45 lakh. Market has been slow in this area lately. Your analysis:`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const result = await model.generateContent(context);
    const analysis = result.response.text();

    res.json({ 
      success: true, 
      analysis,
      marketData: {
        currentPrice: property.price,
        avgMarketPrice: Math.round(avgPrice),
        pricePerSqFt: Math.round(pricePerSqFt),
        avgPricePerSqFt: Math.round(avgPricePerSqFt)
      }
    });
  } catch (error) {
    console.error('Price Suggestion Error:', error);
    res.status(500).json({ success: false, message: 'Unable to generate price suggestion' });
  }
};
