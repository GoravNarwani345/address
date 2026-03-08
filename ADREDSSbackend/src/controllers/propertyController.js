const Property = require('../models/Property');
const sanitizePrice = require('../utils/sanitizePrice');
const priceAnalysis = require('../utils/priceAnalysis');

exports.addProperty = async (req, res) => {
  try {
    const data = { ...req.body };
    let images = data.images || [];

    if (typeof images === 'string') {
      try { images = JSON.parse(images); } catch (e) { images = [images]; }
    }

    if (req.files && Array.isArray(req.files)) {
      const fileUrls = req.files.map(file => `/uploads/properties/${file.filename}`);
      images = [...images, ...fileUrls];
    }
    data.images = images;
    data.createdBy = req.userId;

    if (!data.title || !data.price || !data.propertyType) {
      return res.status(400).json({ success: false, message: 'Title, price, and property type are required' });
    }

    if (!data.address || !data.description) {
      return res.status(400).json({ success: false, message: 'Address and description are required' });
    }

    if (data.bedrooms && data.bedrooms < 0) {
      return res.status(400).json({ success: false, message: 'Bedrooms must be a positive number' });
    }

    if (data.bathrooms && data.bathrooms < 0) {
      return res.status(400).json({ success: false, message: 'Bathrooms must be a positive number' });
    }

    if (data.area && data.area <= 0) {
      return res.status(400).json({ success: false, message: 'Area must be greater than 0' });
    }

    data.price = sanitizePrice(data.price);

    const property = await Property.create(data);
    return res.status(201).json({ success: true, message: 'Property added successfully', property });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Add Property Error:', error);
    return res.status(500).json({ success: false, message: 'Error adding property' });
  }
};

exports.listProperties = async (req, res) => {
  try {
    const { type, category, search, minPrice, maxPrice, location, limit = 10, page = 1 } = req.query;
    const filter = { status: 'available' };

    // Role-based filtering: brokers and sellers see only their own properties
    if (req.userRole === 'broker' || req.userRole === 'seller') {
      filter.createdBy = req.userId;
    }
    // Buyers and admins see all properties

    if (type) filter.propertyType = type;
    if (category) filter.category = category;
    if (location) filter.address = { $regex: location, $options: 'i' };

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const props = await Property.find(filter)
      .populate('createdBy', 'name email isVerifiedBroker')
      .sort({ created_at: -1 })
      .limit(Number(limit))
      .skip(skip)
      .lean();

    // Inject price ratings
    const propertiesWithRatings = await Promise.all(props.map(async (p) => {
      const areaStats = await priceAnalysis.getAreaStats(p.address, p.propertyType, p.category);
      const rating = priceAnalysis.rateProperty(p.price, p.area, areaStats);
      return { ...p, priceRating: rating.rating };
    }));

    const total = await Property.countDocuments(filter);

    return res.status(200).json({
      success: true,
      properties: propertiesWithRatings,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('List Properties Error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching properties' });
  }
};

exports.getProperty = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === 'undefined' || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid property ID' });
    }

    const prop = await Property.findById(id).populate('createdBy', 'name email isVerifiedBroker').lean();
    if (!prop) return res.status(404).json({ success: false, message: 'Property not found' });
    return res.status(200).json({ success: true, property: prop });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid property ID format' });
    }
    console.error('Get Property Error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching property' });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === 'undefined' || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid property ID' });
    }

    // Ownership check
    const existing = await Property.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Property not found' });
    if (existing.createdBy.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this property' });
    }

    const data = { ...req.body };
    let images = data.images || existing.images;

    if (typeof images === 'string') {
      try { images = JSON.parse(images); } catch (e) { images = [images]; }
    }

    if (req.files && Array.isArray(req.files)) {
      const fileUrls = req.files.map(file => `/uploads/properties/${file.filename}`);
      images = [...images, ...fileUrls];
    }

    data.images = images;

    if (data.price) data.price = sanitizePrice(data.price);

    const property = await Property.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    return res.status(200).json({ success: true, message: 'Property updated successfully', property });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid property ID format' });
    }
    console.error('Update Property Error:', error);
    return res.status(500).json({ success: false, message: 'Error updating property' });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === 'undefined' || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid property ID' });
    }

    // Ownership check
    const existing = await Property.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Property not found' });
    if (existing.createdBy.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this property' });
    }

    await Property.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid property ID format' });
    }
    console.error('Delete Property Error:', error);
    return res.status(500).json({ success: false, message: 'Error deleting property' });
  }
};

/**
 * AI Natural Language Search
 * Parses queries like "3 bed house in Karachi under 20M" into structured filters.
 */
exports.aiSearch = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, message: 'Query is required' });

    const filter = { status: 'available' };
    let prompt = query.toLowerCase();

    // 1. Parse Bedrooms (e.g., "3 bed", "3 bedroom")
    const bedMatch = prompt.match(/(\d+)\s*(?:bed|bedroom)/);
    if (bedMatch) filter.bedrooms = { $gte: parseInt(bedMatch[1]) };

    // 2. Parse Bathrooms (e.g., "2 bath")
    const bathMatch = prompt.match(/(\d+)\s*(?:bath|bathroom)/);
    if (bathMatch) filter.bathrooms = { $gte: parseInt(bathMatch[1]) };

    // 3. Parse Property Type (e.g., "house", "flat")
    const types = ['house', 'flat', 'other'];
    const foundType = types.find(t => prompt.includes(t));
    if (foundType) filter.propertyType = foundType;

    // 4. Parse Category (e.g., "for rent", "buy")
    if (prompt.includes('rent')) filter.category = 'rent';
    if (prompt.includes('buy') || prompt.includes('sale') || prompt.includes('sell')) filter.category = 'sell';

    // 5. Parse Price (e.g., "under 20M", "below 50k")
    const priceMatch = prompt.match(/(?:under|below|max|less than)\s*([\d.]+[km]?)/i);
    if (priceMatch) {
      filter.price = { $lte: sanitizePrice(priceMatch[1]) };
    }

    // 6. Generic search for location/address (everything else)
    const cleanedSearch = prompt
      .replace(/(\d+)\s*(?:bed|bedroom|bath|bathroom)s?/g, '')
      .replace(/(?:under|below|max|less than)\s*([\d.]+[km]?)/gi, '')
      .replace(new RegExp(`\\b(${types.join('|')}|rent|buy|sale|sell)\\b`, 'gi'), '')
      .trim();

    if (cleanedSearch && cleanedSearch.length > 2) {
      filter.$or = [
        { title: { $regex: cleanedSearch, $options: 'i' } },
        { address: { $regex: cleanedSearch, $options: 'i' } }
      ];
    }

    const properties = await Property.find(filter)
      .populate('createdBy', 'name isVerifiedBroker')
      .sort({ created_at: -1 })
      .limit(10)
      .lean();

    return res.status(200).json({
      success: true,
      query,
      parsedFilters: filter,
      count: properties.length,
      properties
    });
  } catch (error) {
    console.error('AI Search Error:', error);
    return res.status(500).json({ success: false, message: 'Error in AI search engine' });
  }
};

/**
 * AI-Powered Recommendation Engine
 * Finds similar properties based on type and a 25% price range variance.
 */
exports.getRecommendations = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === 'undefined' || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid property ID' });
    }

    const targetProperty = await Property.findById(id);
    if (!targetProperty) return res.status(404).json({ success: false, message: 'Target property not found' });

    // Calculate a 25% price margin for intelligence-based matching
    const minPrice = targetProperty.price * 0.75;
    const maxPrice = targetProperty.price * 1.25;

    const recommendations = await Property.find({
      _id: { $ne: id }, // Exclude the target property itself
      propertyType: targetProperty.propertyType,
      category: targetProperty.category,
      price: { $gte: minPrice, $lte: maxPrice },
      status: 'available'
    })
      .limit(5)
      .sort({ created_at: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations
    });
  } catch (error) {
    console.error('Recommendation Error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching recommendations' });
  }
};
