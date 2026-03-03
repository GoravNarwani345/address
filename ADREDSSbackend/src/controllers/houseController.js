const Property = require('../models/Property');
const sanitizePrice = require('../utils/sanitizePrice');


exports.addHouse = async (req, res) => {
  try {
    const data = { ...(req.body || {}), propertyType: 'house' };
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
    console.error('Add House Error:', error);
    return res.status(500).json({ success: false, message: 'Error adding house' });
  }
};

exports.listHouses = async (req, res) => {
  try {
    const houses = await Property.find({ propertyType: 'house' }).sort({ created_at: -1 }).lean();
    return res.status(200).json({ success: true, properties: houses });
  } catch (error) {
    console.error('List Houses Error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching houses' });
  }
};
