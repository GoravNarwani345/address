const mongoose = require('mongoose');
const Property = require('../models/Property');
const User = require('../models/User');
const Inquiry = require('../models/Inquiry');

exports.getMarketStats = async (req, res) => {
    try {
        const totalListings = await Property.countDocuments();
        const verifiedBrokers = await User.countDocuments({ role: 'broker', isVerifiedBroker: true });

        // Overall average price
        const priceStats = await Property.aggregate([
            { $group: { _id: null, avgPrice: { $avg: '$price' } } }
        ]);
        const averagePrice = priceStats.length > 0 ? priceStats[0].avgPrice : 0;

        // Price trends by month (last 6 months)
        const lastSixMonths = new Date();
        lastSixMonths.setMonth(lastSixMonths.getMonth() - 6);

        const trends = await Property.aggregate([
            { $match: { created_at: { $gte: lastSixMonths } } },
            {
                $group: {
                    _id: {
                        month: { $month: '$created_at' },
                        year: { $year: '$created_at' }
                    },
                    price: { $avg: '$price' }
                }
            },
            {
                $project: {
                    month: {
                        $let: {
                            vars: {
                                months: [null, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                            },
                            in: { $arrayElemAt: ['$$months', '$_id.month'] }
                        }
                    },
                    year: '$_id.year',
                    price: 1,
                    _id: 0
                }
            },
            { $sort: { year: 1, month: 1 } }
        ]);

        return res.status(200).json({
            success: true,
            data: {
                totalListings,
                verifiedBrokers,
                averagePrice,
                trends
            }
        });
    } catch (error) {
        console.error('Market Analytics Error:', error);
        return res.status(500).json({ success: false, message: 'Error fetching market stats' });
    }
};

exports.getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const pendingVerifications = await User.countDocuments({ verificationStatus: 'pending' });
        const totalListings = await Property.countDocuments();
        const totalInquiries = await Inquiry.countDocuments();

        const userGrowth = await User.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$created_at" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 12 }
        ]);

        return res.status(200).json({
            success: true,
            data: {
                totalUsers,
                pendingVerifications,
                totalListings,
                totalInquiries,
                userGrowth
            }
        });
    } catch (error) {
        console.error('Admin Analytics Error:', error);
        return res.status(500).json({ success: false, message: 'Error fetching admin stats' });
    }
};

exports.getLeadStats = async (req, res) => {
    try {
        const userId = req.userId;

        const totalLeads = await Inquiry.countDocuments({ seller: userId });
        const pendingLeads = await Inquiry.countDocuments({ seller: userId, status: 'pending' });

        const conversionStats = await Inquiry.aggregate([
            { $match: { seller: mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            data: {
                totalLeads,
                pendingLeads,
                conversionStats
            }
        });
    } catch (error) {
        console.error('Lead Analytics Error:', error);
        return res.status(500).json({ success: false, message: 'Error fetching lead stats' });
    }
};
