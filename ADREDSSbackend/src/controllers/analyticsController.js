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

exports.downloadReport = async (req, res) => {
    try {
        const { type } = req.query;
        const userId = req.userId;
        const userRole = req.userRole;

        let data = [];
        let filename = 'report.csv';

        if (type === 'properties') {
            const filter = (userRole === 'broker' || userRole === 'seller') ? { createdBy: userId } : {};
            const properties = await Property.find(filter)
                .populate('createdBy', 'name email')
                .lean();
            
            data = properties.map(p => ({
                Title: p.title,
                Price: p.price,
                Address: p.address,
                Type: p.propertyType,
                Category: p.category,
                Bedrooms: p.bedrooms,
                Bathrooms: p.bathrooms,
                Area: p.area,
                Status: p.status,
                Owner: p.createdBy?.name || 'N/A',
                Created: new Date(p.created_at).toLocaleDateString()
            }));
            filename = 'properties-report.csv';
        } else if (type === 'inquiries') {
            const filter = userRole === 'buyer' ? { user: userId } : { seller: userId };
            const inquiries = await Inquiry.find(filter)
                .populate('property', 'title price')
                .populate('user', 'name email')
                .lean();
            
            data = inquiries.map(i => ({
                Property: i.property?.title || 'N/A',
                Price: i.property?.price || 'N/A',
                Type: i.type,
                Status: i.status,
                Buyer: i.user?.name || 'N/A',
                Message: i.message || 'N/A',
                Date: new Date(i.created_at).toLocaleDateString()
            }));
            filename = 'inquiries-report.csv';
        } else if (type === 'market') {
            const properties = await Property.find().lean();
            const stats = await Property.aggregate([
                {
                    $group: {
                        _id: '$address',
                        avgPrice: { $avg: '$price' },
                        count: { $sum: 1 }
                    }
                }
            ]);
            
            data = stats.map(s => ({
                Area: s._id,
                'Average Price': Math.round(s.avgPrice),
                'Total Listings': s.count
            }));
            filename = 'market-report.csv';
        } else {
            return res.status(400).json({ success: false, message: 'Invalid report type' });
        }

        if (data.length === 0) {
            return res.status(404).json({ success: false, message: 'No data available for report' });
        }

        const csv = data.map(row => Object.values(row).join(',')).join('\n');
        const header = Object.keys(data[0]).join(',');
        const csvContent = header + '\n' + csv;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        return res.status(200).send(csvContent);
    } catch (error) {
        console.error('Download Report Error:', error);
        return res.status(500).json({ success: false, message: 'Error generating report' });
    }
};
