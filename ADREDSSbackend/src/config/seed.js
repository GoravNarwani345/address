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
                agencyName: 'Elite Properties',
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

        // Categorized High-quality Unsplash property images
        const exteriors = ['1600607686527-6fb886090705', '1512917774080-9991f1c4c750', '1600585154340-be6161a56a0c', '1600596542815-ffad4c1539a9', '1600607687920-4e2a09cf159d', '1583608205776-bfd35f0d9f83'];
        const livingRooms = ['1484154218962-a197022b5858', '1567016432779-094069958ea5', '1615874959474-d60996e7d728', '1616489953149-75517457e4ac', '1600210492486-7bb5dd093a2b'];
        const kitchens = ['1556911220-e15b29be8c8f', '1556912177-c5993e59f6c8', '1502672260266-1c1ef2d93688'];
        const bedroomImages = ['1522708323590-d24dbb6b0267', '1540518614846-7ede433c70c3', '1505693413171-ec561088eb4c', '1536376072261-38c75010e6c9'];

        const properties = [];

        for (let i = 0; i < 40; i++) {
            const isBroker = i % 2 === 0;

            // Build a multi-aspect image gallery for each property
            const extId = exteriors[i % exteriors.length];
            const livId = livingRooms[i % livingRooms.length];
            const kitId = kitchens[i % kitchens.length];
            const bedId = bedroomImages[i % bedroomImages.length];

            const propertyImages = [
                `https://images.unsplash.com/photo-${extId}?auto=format&fit=crop&w=1200&q=80`,
                `https://images.unsplash.com/photo-${livId}?auto=format&fit=crop&w=1200&q=80`,
                `https://images.unsplash.com/photo-${kitId}?auto=format&fit=crop&w=1200&q=80`,
                `https://images.unsplash.com/photo-${bedId}?auto=format&fit=crop&w=1200&q=80`
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
