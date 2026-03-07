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
            'DHA Phase 6, Karachi', 'Clifton Block 5, Karachi', 'Gulshan-e-Iqbal, Karachi',
            'North Nazimabad, Karachi', 'PECHS Block 2, Karachi', 'Malir Cantt, Karachi',
            'Bahria Town Karachi', 'Gulistan-e-Jauhar, Karachi', 'Korangi, Karachi',
            'Defense Phase 8, Karachi', 'Sukkur Township, Sukkur', 'Military Road, Sukkur',
            'Larkana City Center, Larkana', 'VIP Road, Larkana', 'Sachal Colony, Larkana'
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
            'Corporate Guest House', 'Family Oriented Apartment',
            'Ocean Front Penthouse', 'Commercial Plot for Business', 'Luxury Duplex House',
            'Semi-Furnished 2BR Flat', 'Historical Style Bungalow', 'Modernist Concrete Villa',
            'Garden Level Studio', 'Skyscraper View Apartment', 'Traditional Sindhi Style Home',
            'Eco-Friendly Smart Home', 'Minimalist Zen House', 'Victorian Inspired Villa',
            'Industrial Loft Style Flat', 'Suburban Family Home', 'Executive Rental Suite'
        ];

        const types = ['flat', 'house', 'other'];
        const categories = ['sell', 'rent'];

        // Categorized High-quality Unsplash property images
        const exteriors = ['1600607686527-6fb886090705', '1512917774080-9991f1c4c750', '1600585154340-be6161a56a0c', '1600596542815-ffad4c1539a9', '1600607687920-4e2a09cf159d', '1583608205776-bfd35f0d9f83'];
        const livingRooms = ['1484154218962-a197022b5858', '1567016432779-094069958ea5', '1615874959474-d60996e7d728', '1616489953149-75517457e4ac', '1600210492486-7bb5dd093a2b'];
        const kitchens = ['1556911220-e15b29be8c8f', '1556912177-c5993e59f6c8', '1502672260266-1c1ef2d93688'];
        const bedrooms = ['1522708323590-d24dbb6b0267', '1540518614846-7ede433c70c3', '1505693413171-ec561088eb4c', '1536376072261-38c75010e6c9'];

        const properties = [];

        for (let i = 0; i < 40; i++) {
            const isBroker = i % 2 === 0;

            // Build a multi-aspect image gallery for each property
            const extId = exteriors[i % exteriors.length];
            const livId = livingRooms[i % livingRooms.length];
            const kitId = kitchens[i % kitchens.length];
            const bedId = bedrooms[i % bedrooms.length];

            const propertyImages = [
                `https://images.unsplash.com/photo-${extId}?auto=format&fit=crop&w=1200&q=80`,
                `https://images.unsplash.com/photo-${livId}?auto=format&fit=crop&w=1200&q=80`,
                `https://images.unsplash.com/photo-${kitId}?auto=format&fit=crop&w=1200&q=80`,
                `https://images.unsplash.com/photo-${bedId}?auto=format&fit=crop&w=1200&q=80`
            ];

            // Introduce price variations for Advisor testing
            let priceBase = Math.floor(Math.random() * (60000000 - 5000000) + 5000000);
            if (i % 7 === 0) priceBase *= 0.7; // Good Deal
            if (i % 9 === 0) priceBase *= 1.4; // Overpriced

            const property = {
                title: titles[i % titles.length],
                description: `This ${titles[i % titles.length]} is situated at a prime location in ${addresses[i % addresses.length]}. It offers luxury lifestyle with state-of-the-art facilities, modern architecture, and secure environment. Perfect for ${i % 2 === 0 ? 'families' : 'investment'}.`,
                price: Math.floor(priceBase),
                address: addresses[i % addresses.length],
                propertyType: types[i % 3],
                category: i < 30 ? 'sell' : 'rent',
                bedrooms: Math.floor(Math.random() * 6) + 1,
                bathrooms: Math.floor(Math.random() * 4) + 1,
                area: Math.floor(Math.random() * (5000 - 500) + 500),
                images: propertyImages,
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
