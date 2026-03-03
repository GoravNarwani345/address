const Inquiry = require('../models/Inquiry');
const User = require('../models/User');
const Property = require('../models/Property');

// Create a new inquiry (Contact or Booking)
exports.createInquiry = async (req, res) => {
    try {
        const { propertyId, type, message, bookingDate } = req.body;
        const userId = req.userId;

        if (!propertyId || !type) {
            return res.status(400).json({ success: false, message: 'Property ID and type are required' });
        }

        // Find property to get the seller ID
        const property = await Property.findById(propertyId);
        if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

        const inquiry = await Inquiry.create({
            property: propertyId,
            user: userId,
            seller: property.createdBy,
            type,
            message,
            bookingDate,
            status: 'pending'
        });

        res.status(201).json({ success: true, data: inquiry });
    } catch (error) {
        console.error('Create Inquiry Error:', error);
        res.status(500).json({ success: false, message: 'Server error creating inquiry' });
    }
};

// Get inquiries (Leads for sellers, Requests for buyers)
exports.getInquiries = async (req, res) => {
    try {
        const userId = req.userId;
        const { role } = req.query; // Optional role filter

        let query = {};
        if (role === 'seller' || role === 'broker') {
            query.seller = userId;
        } else if (role === 'buyer') {
            query.user = userId;
        } else {
            // Default: Find where user is either buyer or seller
            query = { $or: [{ user: userId }, { seller: userId }] };
        }

        const inquiries = await Inquiry.find(query)
            .populate('property', 'title price images address')
            .populate('user', 'name email phone')
            .populate('seller', 'name email phone')
            .sort({ created_at: -1 });

        res.status(200).json({ success: true, data: inquiries });
    } catch (error) {
        console.error('Get Inquiries Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching inquiries' });
    }
};

// Update inquiry status (Seller only)
exports.updateInquiryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.userId;

        const inquiry = await Inquiry.findById(id);
        if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });

        // Only the receiver (seller) can update status
        if (inquiry.seller.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this inquiry' });
        }

        inquiry.status = status;
        await inquiry.save();

        res.status(200).json({ success: true, message: 'Status updated', data: inquiry });
    } catch (error) {
        console.error('Update Inquiry Status Error:', error);
        res.status(500).json({ success: false, message: 'Server error updating inquiry' });
    }
};

// Toggle Favorite Property
exports.toggleFavorite = async (req, res) => {
    try {
        const { propertyId } = req.body;
        const userId = req.userId;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const index = user.favorites.indexOf(propertyId);
        if (index === -1) {
            user.favorites.push(propertyId);
        } else {
            user.favorites.splice(index, 1);
        }

        await user.save();
        res.status(200).json({ success: true, favorites: user.favorites });
    } catch (error) {
        console.error('Toggle Favorite Error:', error);
        res.status(500).json({ success: false, message: 'Server error toggling favorite' });
    }
};

// Get User's Favorites
exports.getFavorites = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).populate('favorites');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        res.status(200).json({ success: true, data: user.favorites });
    } catch (error) {
        console.error('Get Favorites Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching favorites' });
    }
};
