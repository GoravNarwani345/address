require('dotenv').config();
const { connectDB } = require('../config/database');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Property = require('../models/Property');

const run = async () => {
  try {
    await connectDB();
    console.log('Connected to DB for seeding');

    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const broker = await User.findOneAndUpdate(
      { email: 'broker@test.com' },
      {
        name: 'Ahmad Khan',
        email: 'broker@test.com',
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
      { upsert: true, new: true }
    );

    const seller = await User.findOneAndUpdate(
      { email: 'seller@test.com' },
      {
        name: 'Fatima Ali',
        email: 'seller@test.com',
        password: hashedPassword,
        role: 'seller',
        phone: '+92 301 7654321',
        verified: true,
        verificationStatus: 'approved',
        verificationLevel: 'identity'
      },
      { upsert: true, new: true }
    );

    const buyer = await User.findOneAndUpdate(
      { email: 'buyer@test.com' },
      {
        name: 'Hassan Ahmed',
        email: 'buyer@test.com',
        password: hashedPassword,
        role: 'buyer',
        phone: '+92 302 9876543',
        verified: true
      },
      { upsert: true, new: true }
    );

    console.log('Users created/updated');

    // Create test properties
    const properties = [
      {
        title: 'Luxury Apartment in DHA Phase 6',
        description: 'Modern 3-bedroom apartment with stunning city views, marble flooring, and premium fixtures.',
        price: 45000000,
        address: 'DHA Phase 6, Karachi',
        propertyType: 'flat',
        category: 'sell',
        bedrooms: 3,
        bathrooms: 3,
        area: 1800,
        images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'],
        coordinates: { lat: 24.8138, lng: 67.0671 },
        createdBy: broker._id,
        isVerifiedListing: true,
        status: 'available'
      },
      {
        title: 'Spacious Villa in Bahria Town',
        description: '5-bedroom villa with private garden, swimming pool, and modern amenities.',
        price: 85000000,
        address: 'Bahria Town Phase 8, Rawalpindi',
        propertyType: 'house',
        category: 'sell',
        bedrooms: 5,
        bathrooms: 5,
        area: 4500,
        images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
        coordinates: { lat: 33.5651, lng: 73.0169 },
        createdBy: seller._id,
        isVerifiedListing: false,
        status: 'available'
      },
      {
        title: 'Affordable Flat in Gulshan-e-Iqbal',
        description: '2-bedroom apartment perfect for small families, close to schools and markets.',
        price: 18000000,
        address: 'Gulshan-e-Iqbal Block 13, Karachi',
        propertyType: 'flat',
        category: 'sell',
        bedrooms: 2,
        bathrooms: 2,
        area: 1000,
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
        coordinates: { lat: 24.9207, lng: 67.0924 },
        createdBy: broker._id,
        isVerifiedListing: true,
        status: 'available'
      },
      {
        title: 'Commercial Plaza in Saddar',
        description: 'Prime location commercial property with high foot traffic.',
        price: 120000000,
        address: 'Saddar, Karachi',
        propertyType: 'other',
        category: 'sell',
        bedrooms: 0,
        bathrooms: 4,
        area: 3000,
        images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'],
        coordinates: { lat: 24.8607, lng: 67.0011 },
        createdBy: broker._id,
        isVerifiedListing: true,
        status: 'available'
      }
    ];

    for (const prop of properties) {
      await Property.findOneAndUpdate(
        { title: prop.title },
        prop,
        { upsert: true, new: true }
      );
    }

    console.log('Properties created/updated');
    console.log('\nTest Accounts:');
    console.log('Broker: broker@test.com / password123');
    console.log('Seller: seller@test.com / password123');
    console.log('Buyer: buyer@test.com / password123');
    
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

run();
