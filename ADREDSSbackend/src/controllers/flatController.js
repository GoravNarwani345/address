const Property = require('../models/Property');
const sanitizePrice = require('../utils/sanitizePrice');


exports.addFlat = async (req, res) => {
  try {
    const data = { ...(req.body || {}), propertyType: 'flat' };
    let images = data.images || [];

    if (typeof images === 'string') {
      try { images = JSON.parse(images); } catch (e) { images = [images]; }
    }

    if (req.files && Array.isArray(req.files)) {
      const fileUrls = req.files.map(file => `/uploads/properties/${file.filename}`);
      images = [...images, ...fileUrls];
    }
    data.images = images;

    if (!data.title || !data.price) return res.status(400).json({ success: false, message: 'title and price are required' });

    data.price = sanitizePrice(data.price);

    const prop = await Property.create(data);
    return res.status(201).json({ success: true, property: prop });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Add Flat Error:', error);
    return res.status(500).json({ success: false, message: 'Error adding flat' });
  }
};

exports.listFlats = async (req, res) => {
  try {
    const flats = await Property.find({ propertyType: 'flat' }).sort({ created_at: -1 }).lean();
    return res.status(200).json({ success: true, properties: flats });
  } catch (error) {
    console.error('List Flats Error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching flats' });
  }
};
