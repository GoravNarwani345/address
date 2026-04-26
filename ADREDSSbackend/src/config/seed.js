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
                name: 'Ahmad Khan',
                email: 'broker@smartstate.com',
                password: hashedPassword,
                role: 'broker',
                phone: '+92 300 1234567',
                verified: true,
                isVerifiedBroker: true,
                verificationStatus: 'approved',
                verificationLevel: 'professional',
                agencyName: 'ADREDSS Properties',
                licenseNumber: 'BRK-2024-001'
            },
            {
                name: 'Fatima Ali',
                email: 'seller@smartstate.com',
                password: hashedPassword,
                role: 'seller',
                phone: '+92 301 7654321',
                verified: true,
                verificationStatus: 'approved',
                verificationLevel: 'identity'
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

        // CREATE PROPERTIES (40 listings)
        const addresses = [
            'Qasimabad, Hyderabad', 'Latifabad Unit 7, Hyderabad', 'Citizen Colony, Hyderabad',
            'Gulistan-e-Sajjad, Hyderabad', 'Auto Bhan Road, Hyderabad', 'Saddar, Hyderabad',
            'GOR Colony, Hyderabad', 'Hirabad, Hyderabad', 'Kohsar, Hyderabad',
            'Defense Housing Scheme, Hyderabad', 'Latifabad Unit 2, Hyderabad', 'Hali Road, Hyderabad',
            'Phuleli, Hyderabad', 'Preetabad, Hyderabad', 'Bhitai Nagar, Hyderabad',
            'Wahdat Colony, Hyderabad', 'Alamdar Chowk, Hyderabad', 'Wadhu Wah Road, Hyderabad',
            'Main Qasimabad Road, Hyderabad', 'Sindh University Employees Society, Hyderabad',
            'Doctors Colony, Hyderabad', 'Anwar Villas, Hyderabad', 'Paras Villas, Hyderabad',
            'Abdullah Heights, Hyderabad', 'Al-Mustafa Town, Hyderabad',
            'Latifabad Unit 1, Hyderabad', 'Latifabad Unit 3, Hyderabad', 'Latifabad Unit 4, Hyderabad',
            'Latifabad Unit 5, Hyderabad', 'Latifabad Unit 6, Hyderabad', 'Latifabad Unit 8, Hyderabad',
            'Latifabad Unit 9, Hyderabad', 'Latifabad Unit 10, Hyderabad', 'Latifabad Unit 11, Hyderabad',
            'Latifabad Unit 12, Hyderabad', 'Jamshoro Road, Hyderabad', 'Airport Road, Hyderabad',
            'Tando Jam, Hyderabad', 'Hussainabad, Hyderabad', 'Cantonment, Hyderabad'
        ];

        const titles = [
            'Modern 3 Bedroom Apartment', 'Luxury 4 Bedroom Villa with Pool', 'Renovated 2 Bedroom Family House',
            'Executive 2 Bedroom Flat in City Center', 'Spacious 5 Bedroom Garden Villa', 'Corner 3 Bedroom House for Sale',
            'Furnished 1 Bedroom Bachelor Pad', 'Premium 4 Bedroom Penthouse', 'Budget Friendly 2 Bedroom Flat',
            'Classic 4 Bedroom Bungalow', 'Brand New 3 Bedroom House', 'Elegant 1 Bedroom Studio Apartment',
            'Smart 3 Bedroom Home with Automation', 'Rustic 5 Bedroom Farmhouse', 'Contemporary 3 Bedroom Duplex',
            'Iconic 2 Bedroom Tower Apartment', 'Sunset View 4 Bedroom Villa', 'Prime Location 3 Bedroom Plot House',
            'Architect Designed 5 Bedroom Masterpiece', 'Mini 6 Bedroom Mansion',
            'Cozy 2 Bedroom Flat for Rent', 'High-end 4 Bedroom Residence', 'Investors Choice 3 Bedroom Plot',
            'Corporate 2 Bedroom Guest House', 'Family Oriented 3 Bedroom Apartment',
            'Ocean Front 4 Bedroom Penthouse', 'Commercial Plot for Business', 'Luxury 3 Bedroom Duplex House',
            'Semi-Furnished 2 Bedroom Flat', 'Historical Style 4 Bedroom Bungalow', 'Modernist 3 Bedroom Concrete Villa',
            'Garden Level 1 Bedroom Studio', 'Skyscraper View 2 Bedroom Apartment', 'Traditional Sindhi Style 4 Bedroom Home',
            'Eco-Friendly 3 Bedroom Smart Home', 'Minimalist 2 Bedroom Zen House', 'Victorian Inspired 5 Bedroom Villa',
            'Industrial Loft Style 2 Bedroom Flat', 'Suburban 3 Bedroom Family Home', 'Executive 2 Bedroom Rental Suite'
        ];

        const types = ['flat', 'house', 'other'];
        const categories = ['sell', 'rent'];

        // Local Pakistani exteriors from public folder
        const exteriors = [
            '/propertyimages/defenseiamge1.webp',
            '/propertyimages/naseemnager.webp',
            '/propertyimages/download.jfif',
            '/propertyimages/images.jfif',
            '/propertyimages/images (1).jfif',
            '/propertyimages/images (2).jfif',
            '/propertyimages/images (3).jfif',
            '/propertyimages/images (4).jfif',
            '/propertyimages/images (5).jfif',
            '/propertyimages/images (6).jfif'
        ];

        // Local modern inner flat images
        const innerImages = [
            '/propertyimages/hyd_modern_lounge.png',
            '/propertyimages/hyd_modern_bedroom.png',
            '/propertyimages/images (7).jfif',
            '/propertyimages/images (8).jfif',
            '/propertyimages/images (9).jfif',
            '/propertyimages/images (10).jfif'
        ];

        const properties = [];

        for (let i = 0; i < 40; i++) {
            const isBroker = i % 2 === 0;

            const extImg = exteriors[i % exteriors.length];
            const inner1 = innerImages[(i * 3) % innerImages.length];
            const inner2 = innerImages[(i * 3 + 1) % innerImages.length];
            const inner3 = innerImages[(i * 3 + 2) % innerImages.length];

            const propertyImages = [
                extImg,
                inner1,
                inner2,
                inner3
            ];

            // Introduce price variations for market analysis
            let priceBase = Math.floor(Math.random() * (60000000 - 5000000) + 5000000);
            if (i % 7 === 0) priceBase *= 0.7; // Good Deal
            if (i % 9 === 0) priceBase *= 1.4; // Overpriced

            // Create dates spread over last 6 months for trend analysis
            const daysAgo = Math.floor(Math.random() * 180);
            const createdDate = new Date();
            createdDate.setDate(createdDate.getDate() - daysAgo);

            // Vary bedrooms based on property type and title
            let bedrooms;
            if (titles[i % titles.length].includes('1 Bedroom')) bedrooms = 1;
            else if (titles[i % titles.length].includes('2 Bedroom')) bedrooms = 2;
            else if (titles[i % titles.length].includes('3 Bedroom')) bedrooms = 3;
            else if (titles[i % titles.length].includes('4 Bedroom')) bedrooms = 4;
            else if (titles[i % titles.length].includes('5 Bedroom')) bedrooms = 5;
            else if (titles[i % titles.length].includes('6 Bedroom')) bedrooms = 6;
            else bedrooms = Math.floor(Math.random() * 4) + 2; // 2-5 bedrooms

            const property = {
                title: titles[i % titles.length],
                description: `This ${titles[i % titles.length]} is situated at a prime location in ${addresses[i % addresses.length]}. It offers luxury lifestyle with state-of-the-art facilities, modern architecture, and secure environment. Perfect for ${i % 2 === 0 ? 'families' : 'investment'}.`,
                price: Math.floor(priceBase),
                address: addresses[i % addresses.length],
                propertyType: types[i % 3],
                category: i < 30 ? 'sell' : 'rent',
                bedrooms: bedrooms,
                bathrooms: Math.floor(Math.random() * 4) + 1,
                area: Math.floor(Math.random() * (5000 - 500) + 500),
                images: propertyImages,
                coordinates: {
                    lat: 25.3 + (Math.random() * 0.1),
                    lng: 68.3 + (Math.random() * 0.1)
                },
                createdBy: isBroker ? brokerId : sellerId,
                status: 'available',
                created_at: createdDate
            };
            properties.push(property);
        }

        await Property.insertMany(properties);

        console.log('40 properties created successfully.');
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
