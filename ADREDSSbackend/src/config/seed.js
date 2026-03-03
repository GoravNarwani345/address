const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const User = require('../models/User');
const Property = require('../models/Property');
const { connectDB } = require('./database');

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany({});
        await Property.deleteMany({});

        console.log('Database cleared. Seeding...');

        // Hash password
        const hashedPassword = await bcrypt.hash('password123', 10);

        // CREATE USERS
        const users = [
            {
                name: 'Main Admin',
                email: 'admin@adredss.com',
                password: hashedPassword,
                role: 'admin',
                verified: true
            },
            {
                name: 'Verified Broker One',
                email: 'broker@smartstate.com',
                password: hashedPassword,
                role: 'broker',
                verified: true,
                isVerifiedBroker: true
            },
            {
                name: 'Top Seller',
                email: 'seller@smartstate.com',
                password: hashedPassword,
                role: 'seller',
                verified: true,
                isVerifiedBroker: false
            },
            {
                name: 'Active Buyer',
                email: 'buyer@smartstate.com',
                password: hashedPassword,
                role: 'buyer',
                verified: true
            }
        ];

        const createdUsers = await User.insertMany(users);

        const brokerId = createdUsers[1]._id;
        const sellerId = createdUsers[2]._id;

        console.log('Users created successfully.');

        // CREATE PROPERTIES (25 listings)
        const addresses = [
            'Qasimabad, Hyderabad', 'Latifabad Unit 7, Hyderabad', 'Citizen Colony, Hyderabad',
            'Gulistan-e-Sajjad, Hyderabad', 'Auto Bhan Road, Hyderabad', 'Saddar, Hyderabad',
            'GOR Colony, Hyderabad', 'Hirabad, Hyderabad', 'Kohsar, Hyderabad',
            'Defense Housing Scheme, Hyderabad', 'Latifabad Unit 2, Hyderabad', 'Hali Road, Hyderabad',
            'Phuleli, Hyderabad', 'Preetabad, Hyderabad', 'Bhitai Nagar, Hyderabad',
            'Wahdat Colony, Hyderabad', 'Alamdar Chowk, Hyderabad', 'Wadhu Wah Road, Hyderabad',
            'Main Qasimabad Road, Hyderabad', 'Sindh University Employees Society, Hyderabad',
            'Doctors Colony, Hyderabad', 'Anwar Villas, Hyderabad', 'Paras Villas, Hyderabad',
            'Abdullah Heights, Hyderabad', 'Al-Mustafa Town, Hyderabad'
        ];

        const titles = [
            'Modern 3 Bed Apartment', 'Luxury Villa with Pool', 'Renovated Family House',
            'Executive Flat in City Center', 'Spacious Garden Villa', 'Corner House for Sale',
            'Furnished Bachelor Pad', 'Premium Penthouse', 'Budget Friendly Flat',
            'Classic Bungalow', 'Brand New House', 'Elegant Studio Apartment',
            'Smart Home with Automation', 'Rustic Farmhouse', 'Contemporary Duplex',
            'Iconic Tower Apartment', 'Sunset View Villa', 'Prime Location Plot House',
            'Architect Designed Masterpiece', 'Mini Mansion in DHA',
            'Cozy Flat for Rent', 'High-end Residence', 'Investors Choice Plot',
            'Corporate Guest House', 'Family Oriented Apartment'
        ];

        const types = ['flat', 'house', 'other'];
        const categories = ['sell', 'rent'];

        const propertyImages = [
            '106399', '1396122', '1396132', '276724', '259588',
            '534154', '1571460', '323780', '164558', '206172',
            '280222', '210617', '584399', '271624', '1571470',
            '276514', '1396120', '259681', '2102587', '186077',
            '2724748', '2251247', '2079246', '2079249', '208736'
        ];

        const properties = [];

        for (let i = 0; i < 25; i++) {
            const isBroker = i % 2 === 0;
            const imgId = propertyImages[i % propertyImages.length];
            const property = {
                title: titles[i],
                description: `This ${titles[i]} is situated at a prime location in ${addresses[i]}. It offers luxury lifestyle with state-of-the-art facilities, modern architecture, and secure environment. Perfect for ${i % 2 === 0 ? 'families' : 'investment'}.`,
                price: Math.floor(Math.random() * (80000000 - 500000) + 500000),
                address: addresses[i],
                propertyType: types[i % 3],
                category: categories[i % 2],
                bedrooms: Math.floor(Math.random() * 6) + 1,
                bathrooms: Math.floor(Math.random() * 4) + 1,
                area: Math.floor(Math.random() * (5000 - 500) + 500),
                images: [`https://images.pexels.com/photos/${imgId}/pexels-photo-${imgId}.jpeg?auto=compress&cs=tinysrgb&w=1200`],
                coordinates: {
                    lat: 25.3 + (Math.random() * 0.1),
                    lng: 68.3 + (Math.random() * 0.1)
                },
                createdBy: isBroker ? brokerId : sellerId,
                status: 'available'
            };
            properties.push(property);
        }

        await Property.insertMany(properties);

        console.log('25 properties created successfully.');
        console.log('Seeding completed!');
        console.log('Broker: broker@smartstate.com / password123');
        console.log('Admin: admin@adredss.com / password123');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedData();
